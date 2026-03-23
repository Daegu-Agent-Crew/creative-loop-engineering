# Ralphton Harness Rules

이 파일은 AI 에이전트가 자율적으로 코드를 작성할 때 따라야 하는 규칙입니다.

---

## 🎯 핵심 원칙

1. **테스트 우선 (TDD)**: 테스트 없이 구현 코드를 작성하지 마라
2. **타입 안전**: 모든 함수에 타입 힌트를 추가하라
3. **문서화**: 모든 public 함수에 docstring을 작성하라
4. **자율 수정**: 에러가 나면 스스로 수정하라
5. **검증 완료**: 모든 테스트가 통과할 때까지 작업을 멈추지 마라

---

## 📋 작업 순서

### 1. PRD 분석
- 요구사항 목록 작성
- 모호한 부분 식별
- 인수 조건 정의

### 2. 테스트 작성
```python
# tests/test_<module>.py
import pytest
from <module> import <function>

def test_<function>_<scenario>():
    """Test description"""
    # Given
    input_data = ...
    
    # When
    result = <function>(input_data)
    
    # Then
    assert result == expected
```

### 3. 구현 작성
```python
# src/<module>.py
from typing import <types>

def <function>(param: type) -> return_type:
    """Brief description.
    
    Args:
        param: Description
        
    Returns:
        Description
        
    Raises:
        Exception: When
    """
    # Implementation
    ...
```

### 4. 검증
```bash
pytest tests/ -v --tb=short
```

### 5. 실패시 수정
- 에러 메시지 분석
- 원인 파악
- 수정
- 재검증

---

## 🚫 금지 사항

- 타입 힌트 없는 함수
- 테스트 없는 코드
- 하드코딩된 값 (상수 사용)
- 미완성된 코드 (TODO, FIXME 금지)
- 린트 에러

---

## ✅ 완료 기준

- [ ] 모든 요구사항 구현
- [ ] 모든 테스트 통과
- [ ] 타입 힌트 100%
- [ ] Docstring 100%
- [ ] 린트 에러 0
- [ ] 에지 케이스 처리

---

## 📚 학습된 규칙

### 2026-03-16 초기 규칙
- PRD는 명확하고 구체적으로 작성
- 각 요구사항은 테스트 가능해야 함
- 에러 처리는 명시적으로
