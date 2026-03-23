# To-Do 리스트

## 기능
- add_task(task: str) -> int: 태스크 추가, ID 반환
- complete_task(task_id: int) -> bool: 완료 처리
- get_pending() -> list: 미완료 태스크 목록
- get_all() -> list: 전체 태스크 목록

## 태스크 구조
{ id: int, task: str, done: bool, created_at: datetime }

## 제약
- ID는 1부터 자동 증가
- 없는 ID 조회시 ValueError
