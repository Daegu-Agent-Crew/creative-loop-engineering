# Ralphton Manager - PRD

## 프로젝트 개요
랄프톤(자동 코딩 에이전트) 실행을 체계적으로 관리하는 웹 대시보드.

## 목표
- 모든 랄프톤 프로젝트/Run의 이력 추적
- 실행 중인 세션 실시간 모니터링
- 새 랄프톤 시작/중지/검증
- 진행 통계 및 코드량 그래프

## 기술 제약
- 순수 HTML/CSS/JS (단일 index.html)
- 한국어 UI
- 반응형 (모바일/데스크톱)
- 외부 라이브러리 금지
- Neural Dark 테마 (#0a0e1a)
- proxy.py로 API 연동 (기존 Hub와 동일)

## 페이지 구조 (싱글 페이지, 4탭)

### Tab 1: 📊 대시보드
- 전체 통계 카드: 총 프로젝트 수, 총 Run 수, 총 코드량, 총 소요시간
- 최근 7일 코드량 라인 차트 (Canvas)
- 최근 Run 타임라인 (가로)
- 상태별 Run 분류 (진행중/완료/실패) 도넛 차트

### Tab 2: 📋 프로젝트
- 프로젝트 카드 그리드 (3열):
  - 프로젝트명, 설명, 최종 상태
  - 총 Run 수, 총 코드량, 최종 점수
  - 마지막 업데이트 시간
  - 진행 바 (현재/목표 코드량)
- 프로젝트 클릭 → 상세 모달:
  - 모든 Run 이력 테이블
  - 코드량 변화 그래프
  - 점수 변화 추이
  - 백업 파일 목록

### Tab 3: 🔄 실행 관리
- 현재 실행 중인 랄프톤 세션 표시:
  - 프로젝트명, Run 정보, 세션명, PID
  - 경과 시간 (실시간 업데이트)
  - 진행 상태 인디케이터 (pending/running/completed/failed)
  - [로그 보기] [중지] [검증] 버튼
- 완료된 Run 목록 (최근 20개)
- 새 Run 시작 폼:
  - 프로젝트 선택 (드롭다운 또는 신규)
  - 랄프톤 타입 선택: ralphton / iterative-ralphton / team-ralphton / team-ralphton-evolve
  - Claude 명령어 자동 생성
  - PRD.md 내용 편집
  - [시작] 버튼

### Tab 4: ⚙️ 설정
- RALPHTON_ROOT 경로 설정 (기본: ~/workspace/projects)
- Claude 바이너리 경로 (기본: claude)
- 기본 검증 체크리스트 편집
- 알림 설정 (텔레그램 봇 토큰 + 채팅 ID)
- 데이터 백업/복원 (JSON Export/Import)
- 랄프톤 스킬 목록 표시
- API 연결 (Gateway URL + Token)

## API 연동 (proxy.py)
- /api/invoke → sessions_list, sessions_history, cron
- /api/chat → Claude와 채팅 (명령 생성 도움)
- localStorage에 프로젝트 데이터 저장
- RALPHTON.json 파일 기반 (API로 읽기/쓰기 가능)

## 데이터 모델

### Project
```json
{
  "id": "openclaw-hub",
  "name": "OpenClaw Hub",
  "description": "OpenClaw 종합 관리 웹 앱",
  "path": "/home/.openclaw/workspace/projects/openclaw-hub",
  "createdAt": "2026-03-21T17:00:00+09:00",
  "updatedAt": "2026-03-22T12:00:00+09:00",
  "currentVersion": 4,
  "targetLines": 10000,
  "runs": []
}
```

### Run
```json
{
  "id": "run-001",
  "round": 1,
  "type": "team-ralphton",
  "phase": "Phase 1",
  "project": "openclaw-hub",
  "session": "glow-atlas",
  "pid": 7992,
  "status": "completed",
  "startedAt": "2026-03-21T17:33:00+09:00",
  "completedAt": "2026-03-21T17:47:00+09:00",
  "duration": 840,
  "result": {
    "linesBefore": 1254,
    "linesAfter": 2668,
    "sizeKB": 134,
    "score": "45/48",
    "checklist": {"passed": 45, "failed": 3, "items": [...]}
  }
}
```

## 체크리스트 (52개)

### 공통 (10)
1. Neural Dark 테마
2. 한국어 UI
3. 반응형 (768px breakpoint)
4. fade-in 애니메이션
5. glassmorphism 효과
6. ARIA 라벨 + focus-visible
7. prefers-reduced-motion
8. 로딩 스플래시
9. 스크롤투탑 버튼
10. JSON Export/Import

### 대시보드 (12)
11. 총 프로젝트 수 카드
12. 총 Run 수 카드
13. 총 코드량 카드 (count-up)
14. 총 소요시간 카드
15. 코드량 라인 차트 (Canvas, 최근 7일)
16. 상태별 도넛 차트 (진행/완료/실패)
17. 최근 Run 타임라인 (가로)
18. 오늘의 Run 요약
19. 카드 호버 애니메이션
20. 글래스 카드 스타일
21. 실시간 시계
22. 빠른 액션 버튼 (새 Run, 전체 보기)

### 프로젝트 (10)
23. 프로젝트 카드 그리드 (3열)
24. 프로젝트명 + 설명 표시
25. 총 Run 수 표시
26. 총 코드량 + 진행 바
27. 최종 점수 표시
28. 마지막 업데이트 시간
29. 프로젝트 클릭 → 상세 모달
30. Run 이력 테이블 (날짜, 타입, 줄수, 점수)
31. 코드량 변화 그래프 (Canvas)
32. 검색/필터

### 실행 관리 (12)
33. 실행 중 세션 실시스트 표시
34. 세션명 + PID 표시
35. 경과 시간 실시간 업데이트
36. 상태 인디케이터 (4색)
37. [로그 보기] 버튼
38. [중지] 버튼
39. [검증] 버튼
40. 완료된 Run 목록 (최근 20개)
41. 새 Run 시작 폼
42. 랄프톤 타입 선택 (4종)
43. Claude 명령어 미리보기
44. PRD.md 편집 textarea

### 설정 (8)
45. RALPHTON_ROOT 경로 설정
46. Claude 경로 설정
47. 검증 체크리스트 편집
48. 텔레그램 알림 설정
49. 데이터 Export (JSON)
50. 데이터 Import (JSON)
51. 스킬 목록 표시
52. API 연결 설정 (Gateway URL + Token)
