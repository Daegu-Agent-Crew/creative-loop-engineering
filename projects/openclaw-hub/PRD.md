# OpenClaw Hub - PRD

## 프로젝트 개요
ClawFlows(워크플로우 관리) + Claw3D(3D 오피스 시각화)를 하나로 합친 OpenClaw 종합 관리 웹 앱.

## 핵심 영역 (3존)

### 영역 1: 2.5D 오피스 뷰 (왼쪽)
에이전트가 아바타로 2.5D 아이소메트릭 오피스에서 "일하는" 시각화

- CSS 3D transform 기반 아이소메트릭 뷰
- 3개 방: Mission Control / Workflow Lab / Communication Hub
- 에이전트 아바타 (3상태: idle, working, error)
- 데스크에서 툴콜 시 타자 애니메이션
- 데스크 클릭 → 해당 에이전트 정보 패널
- 시뮬레이션: 3개 에이전트가 각자 다른 작업 수행

### 영역 2: 워크플로우 관리 (중앙)
ClawFlows의 101개 워크플로우를 시각적으로 관리

- 워크플로우 갤러리 (카테고리별: 스마트홈/생산성/건강/재정/라이프스타일)
- 카드 뷰: 이름, 설명, 스케줄, 상태
- 워크플로우 상세 보기: 스케줄, 실행 히스토리, 설정
- 1클릭 활성화/비활성화 토글
- 스케줄 타임라인 (24시간 뷰에 크론 표시)
- 커스텀 워크플로우 생성 (폼 기반)
- 카테고리 필터 + 검색
- 15개 대표 워크플로우 사전 데이터 포함:
  1. morning-briefing (7am, 날씨/캘린더/우선순위)
  2. check-calendar (8am/6pm, 48시간 레이더)
  3. email-processing (9am/1pm/5pm, 메일 정리)
  4. prep-meeting (30분마다, 회의 준비)
  5. activate-sleep-mode (10pm, 기기 전부 끄기)
  6. activate-focus-mode (10am, 집중 모드)
  7. track-habits (9pm, 습관 추적)
  8. plan-meals (일요일 6pm, 식단 계획)
  9. check-bills (월요일 8am, 청구서)
  10. track-sleep (9pm, 수면 추적)
  11. stretch-reminder (10am/2pm/4pm, 스트레칭)
  12. plan-workouts (일요일 7pm, 운동 계획)
  13. mental-health-checkin (6pm, 기분 체크)
  14. build-overnight (자정, 자면서 코딩)
  15. send-daily-summary (9pm, 하루 요약)

### 영역 3: 커뮤니케이션 (하단)
채팅 + 툴콜 로그 + 시스템 상태

- 채팅 스트림 (에이전트와 대화 시뮬레이션)
- 툴콜 실시간 로그 (타임라인 스타일)
- 시스템 상태 카드 (메모리, 토큰, API 상태)
- 알림 패널 (워크플로우 실행 결과)

## 공통 기능

### 내비게이션
- 상단 네비게이션 바 (고정)
- 3개 메인 탭: Office / Workflows / Communicate
- 현재 탭 하이라이트

### 대시보드 오버뷰
- 활성 에이전트 수, 실행 중 워크플로우, 오늘의 작업
- 미니 차트 (에이전트 활동량, 워크플로우 성공률)

### 테마
- Neural Dark 테마 (#0a0e1a 기반)
- 다크/라이트 토글

### 반응형
- 모바일: 1컬럼, 탭 스와이프
- 데스크톱: 3존 분할

### Export
- 워크플로우 목록 JSON Export
- 설정 백업/복원

## 기술 스택
- 순수 HTML/CSS/JS (싱글 파일)
- 한국어 UI
- 외부 라이브러리 금지
- CSS 3D transform (아이소메트릭)

## 목표
- 6,000~8,000줄
- 50+ 기능
- 3회 팀반복랄프톤 (1회 생성 + 2회 evolve)
