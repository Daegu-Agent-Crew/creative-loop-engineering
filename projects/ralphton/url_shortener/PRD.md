# URL 단축 서비스

## 개요
간단한 URL 단축 서비스 구현

## 요구사항
- shorten(url: str) -> str: URL을 6자리 코드로 단축
- expand(code: str) -> str: 코드를 원본 URL로 복원
- 캐시 지원 (메모리 기반)
- 중복 URL은 같은 코드 반환
- 유효하지 않은 코드 조회시 KeyError 발생

## 제약사항
- 타입 힌트 필수
- Docstring 필수
- 스레드 안전 고려
- 최대 URL 길이: 2048자

## 인수조건
- [ ] shorten/expand 정상 동작
- [ ] 중복 URL 같은 코드
- [ ] 에러 처리
