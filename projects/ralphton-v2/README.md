# Ralphton v2 - Claude 기반 하네스 시스템

## 개요

Claude Code를 활용한 자율 코드 생성 시스템. 
인간은 PRD만 작성하고, Claude가 충분한 시간을 갖고 구현합니다.

## 워크플로우

```
1. PRD 작성 (인간)
      ↓
2. Claude Code 실행 (AI, 30분+)
      ↓
3. 결과물 검증 (자동)
      ↓
4. 실패시 학습 → 하네스 규칙 업데이트
```

## 디렉토리 구조

```
ralphton-v2/
├── README.md
├── CLAUDE.md                 # 하네스 규칙
├── projects/
│   └── <project_name>/
│       ├── PRD.md            # 요구사항
│       ├── src/              # 생성된 코드
│       └── tests/            # 생성된 테스트
├── harness/
│   ├── rules.md              # 학습된 규칙
│   └── templates/
│       └── prd_template.md
└── scripts/
    └── run_harness.py        # 실행 스크립트
```

## 사용법

```bash
# 1. 프로젝트 생성
cd ralphton-v2
mkdir -p projects/my_project

# 2. PRD 작성
cat > projects/my_project/PRD.md << 'EOF'
# 프로젝트명

## 기능
- 기능1
- 기능2

## 제약
- 제약사항
EOF

# 3. Claude 실행 (30분 타임아웃)
claude --permission-mode bypassPermissions --print "$(cat CLAUDE.md)

프로젝트: projects/my_project
PRD: projects/my_project/PRD.md

위 PRD를 기반으로:
1. src/implementation.py 작성
2. tests/test_implementation.py 작성
3. pytest로 검증
4. 실패시 수정
"
```

## 하네스 규칙 (CLAUDE.md)

```markdown
# Ralphton Harness Rules

## 코딩 표준
- 타입 힌트 필수
- Docstring 필수
- pytest 사용

## TDD 순서
1. 테스트 먼저 작성
2. 구현 코드 작성
3. 테스트 실행
4. 실패시 수정

## 품질 기준
- 모든 테스트 통과
- 린트 에러 0
- 타입 에러 0
```

## 핵심 원칙

1. **충분한 시간**: 최소 30분, 복잡하면 1시간+
2. **명확한 PRD**: 모호성 < 0.05
3. **자율 수정**: 실패시 스스로 수정
4. **학습 축적**: 실패 패턴 → 규칙화

## 실행 예시

```python
# scripts/run_harness.py
import subprocess
import sys

def run_harness(project_path: str, timeout: int = 1800):
    """Run Claude harness with extended timeout"""
    
    with open(f"{project_path}/PRD.md") as f:
        prd = f.read()
    
    prompt = f"""
{open('CLAUDE.md').read()}

---
# PROJECT: {project_path}

## PRD
{prd}

## TASK
1. Create src/implementation.py with type hints and docstrings
2. Create tests/test_implementation.py with pytest tests
3. Run pytest and fix any failures
4. Ensure all tests pass before finishing

Work autonomously. Fix errors yourself. Take your time.
"""
    
    subprocess.run([
        "claude",
        "--permission-mode", "bypassPermissions",
        "--print", prompt
    ], timeout=timeout, cwd=project_path)

if __name__ == "__main__":
    project = sys.argv[1] if len(sys.argv) > 1 else "projects/default"
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
    run_harness(project, timeout)
```
