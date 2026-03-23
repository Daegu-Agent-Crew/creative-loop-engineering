# JSON 파서 라이브러리

## 개요
간단한 JSON 파서 구현 (json 모듈 사용 금지)

## 기능 요구사항

### parse(json_string: str) -> Any
- JSON 문자열을 Python 객체로 변환
- 지원 타입: object, array, string, number, boolean, null

### stringify(obj: Any) -> str
- Python 객체를 JSON 문자열로 변환
- 들여쓰기 없이 compact 형식

### validate(json_string: str) -> bool
- JSON 문자열이 유효한지 검사
- 유효하면 True, 아니면 False 반환

## 제약사항
- json 모듈 사용 금지 (직접 파싱)
- 재귀적 파싱 사용
- 타입 힌트 필수
- Docstring 필수

## 인수 조건
- [ ] parse: 정상 케이스 변환
- [ ] parse: 중첩 구조 처리
- [ ] parse: 잘못된 JSON시 에러
- [ ] stringify: 객체 → 문자열
- [ ] validate: 유효성 검사

## 예시

```python
# parse
parse('{"name": "test", "value": 123}')
# → {"name": "test", "value": 123}

parse('[1, 2, [3, 4]]')
# → [1, 2, [3, 4]]

# stringify
stringify({"a": 1, "b": 2})
# → '{"a":1,"b":2}'

# validate
validate('{"valid": true}')
# → True
validate('{invalid}')
# → False
```
