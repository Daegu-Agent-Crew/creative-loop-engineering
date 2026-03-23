# Team Ralphton - Ralphton Manager v1

프로젝트: Ralphton Manager (랄프톤 관리 대시보드)

## 작업 디렉토리
$(pwd) — 여기에 index.html을 생성

## 참고 파일
- PRD.md (필독)
- proxy.py (API 프록시, 이미 준비됨)
- ~/workspace/projects/openclaw-hub/index.html (참고용, UI 스타일)

## 기존 프로젝트 이력 데이터 (초기 데이터)
다음 데이터를 index.html 내부에 기본 데이터로 포함할 것:

```json
{
  "projects": [
    {
      "id": "oc-neural-map", "name": "Neural Map", "description": "OpenClaw 아키텍처 시각화",
      "path": "~/workspace/projects/oc-neural-map", "currentVersion": 9, "targetLines": 5000,
      "runs": [
        {"round":1,"type":"iterative-ralphton","status":"completed","startedAt":"2026-03-21","duration":10800,"result":{"linesAfter":4549,"sizeKB":174,"score":"43/43"}}
      ]
    },
    {
      "id": "oc-devmon", "name": "OC-DevMon", "description": "OpenClaw 개발 모니터",
      "path": "~/workspace/projects/oc-devmon", "currentVersion": 1, "targetLines": 5000,
      "runs": [
        {"round":1,"type":"iterative-ralphton","status":"completed","startedAt":"2026-03-20","duration":7200,"result":{"linesAfter":4545,"sizeKB":152,"score":"43/43"}}
      ]
    },
    {
      "id": "portfolio-gen", "name": "Portfolio Generator", "description": "포트폴리오 생성기",
      "path": "~/workspace/projects/portfolio-gen", "currentVersion": 1, "targetLines": 5000,
      "runs": [
        {"round":1,"type":"team-ralphton","status":"completed","startedAt":"2026-03-21","duration":10800,"result":{"linesAfter":4931,"sizeKB":135,"score":"38/38"}}
      ]
    },
    {
      "id": "openclaw-hub", "name": "OpenClaw Hub", "description": "OpenClaw 종합 관리 웹 앱",
      "path": "~/workspace/projects/openclaw-hub", "currentVersion": 4, "targetLines": 10000,
      "runs": [
        {"round":1,"type":"team-ralphton","phase":"Phase 1","status":"completed","startedAt":"2026-03-21","duration":900,"result":{"linesAfter":2668,"sizeKB":134,"score":"45/48"}},
        {"round":1,"type":"team-ralphton","phase":"Run 1","status":"completed","startedAt":"2026-03-21","duration":3600,"result":{"linesAfter":6262,"sizeKB":173,"score":"49/52"}},
        {"round":1,"type":"team-ralphton","phase":"Run 2","status":"completed","startedAt":"2026-03-21","duration":2400,"result":{"linesAfter":6548,"sizeKB":182,"score":"49/52"}},
        {"round":2,"type":"team-ralphton-evolve","phase":"Teams","status":"completed","startedAt":"2026-03-21","duration":1800,"result":{"linesAfter":8280,"sizeKB":239,"score":"44/44"}},
        {"round":3,"type":"team-ralphton-evolve","phase":"단일","status":"completed","startedAt":"2026-03-22","duration":1800,"result":{"linesAfter":8414,"sizeKB":243,"score":"69/69"}},
        {"round":4,"type":"team-ralphton-evolve","phase":"LIVE","status":"completed","startedAt":"2026-03-22","duration":1800,"result":{"linesAfter":9863,"sizeKB":287,"score":"31/32"}}
      ]
    },
    {
      "id": "agentcore-viz", "name": "Agent Core 시각화", "description": "에이전트 코어 구조 시각화",
      "path": "~/workspace/projects/agentcore-viz", "currentVersion": 3, "targetLines": 5000,
      "runs": [
        {"round":1,"type":"ralphton","status":"completed","startedAt":"2026-03-21","duration":3600,"result":{"linesAfter":2000,"sizeKB":60,"score":"완료"}}
      ]
    },
    {
      "id": "gostop-v7", "name": "맞고 v7", "description": "한국어 카드 게임",
      "path": "~/workspace/projects/gostop-v7", "currentVersion": 7, "targetLines": 5000,
      "runs": [
        {"round":1,"type":"ralphton","status":"completed","startedAt":"2026-03-19","duration":3600,"result":{"linesAfter":2958,"sizeKB":91,"score":"완료"}}
      ]
    }
  ]
}
```

## 팀 분할

### Teammate A: 대시보드 + 프로젝트 (HTML/CSS/JS)
- 4탭 네비게이션 (📊대시보드 / 📋프로젝트 / 🔄실행관리 / ⚙️설정)
- 대시보드 탭:
  - 4개 통계 카드 (총 프로젝트, 총 Run, 총 코드량, 총 소요시간) — count-up 애니메이션
  - Canvas 코드량 라인 차트 (프로젝트별 최종 코드량)
  - Canvas 도넛 차트 (상태별: completed/running/failed)
  - 최근 Run 타임라인 (가로 스크롤)
  - 실시간 시계
- 프로젝트 탭:
  - 프로젝트 카드 그리드 (3열, 반응형)
  - 각 카드: 이름, 설명, Run 수, 최종 코드량, 진행 바, 최종 점수
  - 클릭 → 상세 모달 (Run 이력 테이블, 코드량 그래프)
  - 검색 필터
- 출력: team-a.html

### Teammate B: 실행 관리 (HTML/CSS/JS)
- 실행 중 세션 표시 (실시간):
  - 세션명, 프로젝트, 타입, PID, 경과 시간 (setInterval 업데이트)
  - 상태 인디케이터: pending(회색) → running(파랑+펄스) → completed(초록) → failed(빨간)
  - 액션 버튼: 로그 보기, 중지, 검증
- 완료된 Run 목록:
  - 테이블: 날짜, 프로젝트, 타입, Phase, 줄수, 크기, 점수, 소요시간
  - 정렬 (날짜/프로젝트/타입)
  - 페이지네이션 (20개씩)
- 새 Run 시작 폼:
  - 프로젝트 선택 (드롭다운 + "새 프로젝트" 옵션)
  - 랄프톤 타입: ralphton / iterative-ralphton / team-ralphton / team-ralphton-evolve (카드 선택)
  - 각 타입 설명 툴팁
  - Claude 명령어 자동 생성 + 미리보기
  - PRD.md textarea (기본 템플릿)
  - [시작] 버튼 (저장 + 알림)
- 출력: team-b.html

### Teammate C: 설정 + 공통 (HTML/CSS/JS)
- 설정 탭:
  - RALPHTON_ROOT 경로 입력
  - Claude 바이너리 경로
  - 기본 검증 체크리스트 (텍스트에어리어, JSON 형식)
  - 텔레그램 알림: 봇 토큰 + 채팅 ID 입력
  - 데이터 Export (JSON 다운로드)
  - 데이터 Import (파일 업로드)
  - 랄프톤 스킬 목록 (4개 카드):
    - ralphton (단일 1회, ~2K줄, ~1시간)
    - iterative-ralphton (단일 N회, ~4.5K줄, ~6시간)
    - team-ralphton (Teams+반복, ~5K줄, ~2.5시간)
    - team-ralphton-evolve (기존 개선, 무한 진화)
  - API 연결: Gateway URL + Token + 연결 테스트
- 공통 컴포넌트:
  - Neural Dark 테마 (#0a0e1a, CSS 변수)
  - 글래스모피즘 카드
  - 탭 네비게이션
  - 모달 컴포넌트
  - 토스트 알림
  - 스크롤투탑
  - fade-in 애니메이션
  - ARIA + focus-visible + prefers-reduced-motion
  - 반응형 (768px breakpoint)
  - 로딩 스플래시 (1.5초)
- 데이터 관리:
  - localStorage에 프로젝트 데이터 저장/로드
  - API 프록시 연동 (/api/invoke 사용)
  - 시뮬/라이브 모드 (대시보드 데이터)
- 출력: team-c.html

## Rules
- 순수 HTML/CSS/JS, 한국어 UI
- Neural Dark 테마
- 외부 라이브러리 금지
- 반응형 (768px)
- ARIA + accessibility
- 기존 프로젝트 이력 데이터 포함
- Team Lead가 모든 파일을 index.html로 병합
- 최소 5,000줄 이상
- 반드시 $(pwd)/index.html에 최종 저장
