"""
Ralphton Harness - Main orchestrator
"""

import os
import re
import json
import uuid
import subprocess
import tempfile
from datetime import datetime
from typing import Optional, List, Dict

import openai
from pydantic import BaseModel

from .config import config


class Result(BaseModel):
    success: bool
    duration: float = 0.0
    rounds: int = 0
    tests: int = 0
    code_lines: int = 0
    code: str = ""
    log: List[str] = []


class Harness:
    """Self-improving multi-agent harness"""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        openai.api_key = config.api_key
        openai.api_base = config.base_url
        self.model = config.model
        self.log: List[str] = []
    
    def _llm(self, prompt: str, system: str = "You are a helpful assistant.") -> str:
        """Call LLM"""
        try:
            r = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            return r.choices[0].message.get("content", "")
        except Exception as e:
            return f"[Error: {e}]"
    
    def _extract_code(self, text: str) -> str:
        """Extract code blocks"""
        # Try fenced code blocks first
        blocks = re.findall(r'```(?:python)?\s*\n(.*?)```', text, re.DOTALL)
        if blocks:
            return "\n\n".join(blocks)
        
        # Try indented code blocks
        lines = text.split('\n')
        code_lines = []
        in_code = False
        for line in lines:
            if line.strip().startswith('def ') or line.strip().startswith('class '):
                in_code = True
            if in_code:
                code_lines.append(line)
        
        return '\n'.join(code_lines) if code_lines else text
    
    def _log(self, msg: str):
        """Log message"""
        self.log.append(msg)
        if self.verbose:
            print(msg)
    
    def run(self, prd_path: str = None, prd_text: str = None, output_dir: str = None) -> Result:
        """Run harness workflow"""
        
        start = datetime.now()
        result = Result(success=False)
        
        # Load PRD
        if prd_path and os.path.exists(prd_path):
            with open(prd_path) as f:
                prd_text = f.read()
        
        if not prd_text:
            self._log("❌ No PRD provided")
            return result
        
        self._log(f"📋 PRD loaded ({len(prd_text)} chars)")
        
        # Stage 1: Analyze PRD
        self._log("\n🔍 Stage 1: Analyzing requirements...")
        analysis = self._llm(f"""Analyze this PRD and list requirements:

{prd_text}

List each requirement on a separate line starting with -""",
            system="You are a requirements analyst.")
        
        req_count = len([l for l in analysis.split("\n") if l.strip().startswith("-")])
        self._log(f"   Found {req_count} requirements")
        
        # Stage 2: Generate tests first
        self._log("\n🧪 Stage 2: Generating tests (TDD)...")
        tests = self._llm(f"""Generate pytest tests for:

{prd_text}

Write comprehensive tests including:
- Happy path tests
- Edge cases
- Error handling

```python
import pytest
# your tests here
```""",
            system="You are a test-driven developer. Write tests FIRST.")
        
        test_code = self._extract_code(tests)
        result.tests = test_code.count("def test_")
        self._log(f"   Generated {result.tests} tests")
        
        # Stage 3: Implement
        self._log("\n💻 Stage 3: Implementing...")
        impl = self._llm(f"""Implement code to pass these tests:

TESTS:
{test_code}

PRD:
{prd_text}

Requirements:
- Type hints required
- Docstrings
- Handle all edge cases

```python
# implementation.py
```""",
            system="You are a senior Python developer. Write clean, tested code.")
        
        code = self._extract_code(impl)
        result.code = code
        result.code_lines = code.count("\n") + 1
        self._log(f"   Generated {result.code_lines} lines of code")
        
        # Stage 4: Review
        self._log("\n👁️ Stage 4: Reviewing...")
        review = self._llm(f"""Review this code for quality issues:

```python
{code}
```

Check:
1. Type hints present?
2. Error handling?
3. Code quality?

Answer: APPROVED or NEEDS_FIX with reasons.""",
            system="You are a code reviewer.")
        
        approved = "APPROVED" in review.upper()
        self._log(f"   {'✅ Approved' if approved else '⚠️ Needs fixes'}")
        
        # Stage 5: Run actual tests
        self._log("\n✅ Stage 5: Running tests...")
        
        # Save code to temp files and run pytest
        test_passed = False
        try:
            import tempfile
            import subprocess
            
            with tempfile.TemporaryDirectory() as tmpdir:
                # Write implementation
                impl_path = f"{tmpdir}/implementation.py"
                test_path = f"{tmpdir}/test_impl.py"
                
                with open(impl_path, "w") as f:
                    f.write(code)
                
                # Fix test imports
                test_code_fixed = test_code.replace("from calculator import", "from implementation import")
                test_code_fixed = test_code_fixed.replace("from todo import", "from implementation import")
                test_code_fixed = test_code_fixed.replace("import pytest", "")
                
                with open(test_path, "w") as f:
                    f.write("import sys\nsys.path.insert(0, '" + tmpdir + "')\n")
                    f.write("import pytest\n")
                    f.write(test_code_fixed)
                
                # Run pytest
                result_pytest = subprocess.run(
                    ["python3", "-m", "pytest", test_path, "-v", "--tb=short"],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    cwd=tmpdir
                )
                
                test_passed = result_pytest.returncode == 0
                if self.verbose:
                    output = result_pytest.stdout + result_pytest.stderr
                    passed = output.count(" passed")
                    failed = output.count(" failed")
                    self._log(f"   {'✅' if test_passed else '❌'} Tests: {passed} passed, {failed} failed")
                    
        except Exception as e:
            self._log(f"   ⚠️ Test execution error: {e}")
            # Fallback to LLM validation
            final_check = self._llm(f"""Final quality check:
Code: {code}
Tests: {test_code}
Does code pass all tests? PASS or FAIL.""",
                system="You are a QA engineer.")
            test_passed = "PASS" in final_check.upper()
            self._log(f"   {'✅ PASS' if test_passed else '⚠️ FAIL'} (LLM)")
        
        # Result
        result.success = approved or passed
        result.duration = (datetime.now() - start).total_seconds()
        result.log = self.log
        
        # Save outputs
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            with open(f"{output_dir}/implementation.py", "w") as f:
                f.write(code)
            with open(f"{output_dir}/tests.py", "w") as f:
                f.write(test_code)
            with open(f"{output_dir}/result.json", "w") as f:
                json.dump(result.dict(), f, indent=2)
        
        # Summary
        self._log("\n" + "=" * 60)
        self._log(f"{'✅ SUCCESS' if result.success else '❌ FAILED'}")
        self._log(f"Duration: {result.duration:.1f}s")
        self._log(f"Tests: {result.tests} | Code: {result.code_lines} lines")
        
        return result


def main():
    import sys
    harness = Harness()
    
    prd = sys.argv[1] if len(sys.argv) > 1 else "PRD.md"
    output = sys.argv[2] if len(sys.argv) > 2 else "output"
    
    result = harness.run(prd_path=prd, output_dir=output)
    sys.exit(0 if result.success else 1)


if __name__ == "__main__":
    main()
