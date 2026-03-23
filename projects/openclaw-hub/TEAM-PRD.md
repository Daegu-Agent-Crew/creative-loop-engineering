# Team PRD - OpenClaw Hub v1

Create an agent team with 3 teammates to build OpenClaw Hub.

Read DESIGN.md and PRD.md for full specifications.

## Teammate A: Office View Expert
2.5D 아이소메트릭 오피스 + 에이전트 시뮬레이션

- CSS 3D transform 기반 아이소메트릭 뷰
- 3개 방: Mission Control / Workflow Lab / Communication Hub
- 방 전환 (클릭 또는 탭)
- 에이전트 아바타 3상태 (idle=대기, working=작업중, error=에러)
- 데스크에서 툴콜 시 타자 애니메이션
- 데스크 클릭 → 에이전트 정보 패널 (이름, 상태, 현재작업, 툴콜수)
- 시뮬레이션: 3개 에이전트 (Cheonsa, DevBot, WorkflowBot) 각자 다른 작업
- 오피스 전체 미니맵
- 바닥 그리드 + 벽 + 가구 (데스크, 모니터)
- 출력: office.html

## Teammate B: Workflow Management Expert
워크플로우 갤러리 + 스케줄 타임라인 + CRUD

- 워크플로우 갤러리 카드 뷰 (15개 사전 데이터)
- 카테고리 필터 (생산성/건강/스마트홈/재정/라이프스타일)
- 검색 기능
- 워크플로우 상세 보기 (설명, 스케줄, 실행 히스토리)
- 1클릭 활성화/비활성화 토글
- 24시간 스케줄 타임라인 (수평, 크론 시간 표시)
- 커스텀 워크플로우 생성 폼 (이름, 카테고리, 스케줄, 설명)
- 워크플로우 삭제
- 정렬 (이름/카테고리/시간)
- 15개 워크플로우 데이터 (DESIGN.md 참고)
- 실행 상태 시뮬레이션 (성공/실패/대기)
- 출력: workflows.html

## Teammate C: Communication & Dashboard Expert
채팅 + 툴콜 로그 + 대시보드

- 채팅 스트림 (에이전트와 대화 시뮬레이션)
- 채팅 입력창 + 전송 버튼
- 툴콜 실시간 로그 (타임라인: 시간/툴명/상태/레이턴시)
- 시스템 상태 카드 4개 (메모리/토큰/API/세션)
- 알림 패널 (워크플로우 실행 결과 알림)
- 대시보드 오버뷰: 활성 에이전트 수, 실행중 워크플로우, 오늘 작업 수
- 미니 차트 2개 (에이전트 활동 바 차트, 워크플로우 성공률 도넛)
- JSON Export (워크플로우 목록 + 설정)
- 출력: comms.html

## Common Requirements (모든 팀원 공통)
- 상단 네비게이션 바 (고정): Office / Workflows / Communicate 탭
- Neural Dark 테마 (#0a0e1a 기반 + glassmorphism)
- 다크/라이트 테마 토글
- 반응형 (768px 이하 1컬럼)
- 한국어 UI
- 스크롤 애니메이션 (fade-in)
- 각 팀원은 자신 HTML 파일만 생성

## Integration (Team Lead)
모든 파일을 하나의 index.html로 통합:
- 각 팀원 HTML의 <style> → 하나의 <style> 태그
- 각 팀원 HTML의 <script> → 하나의 <script> 태그
- 각 팀원 HTML의 <body> → 탭 전환으로 표시/숨김
- 네비게이션 탭 클릭 → 영역 전환

## Rules
- 각 팀원은 자기 파일만 수정
- 순수 HTML/CSS/JS (외부 라이브러리 금지)
- 한국어 UI
- 기존 체크리스트 50개 항목 모두 구현
