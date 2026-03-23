# OpenClaw Hub - 설계 문서 (DESIGN.md)

> **참고 프로젝트**: [ClawFlows](https://github.com/nikilster/clawflows) (워크플로우 자동화) · [Claw3D](https://github.com/iamlukethedev/Claw3D) (3D 오피스 시각화)
> **기술 스택**: 순수 HTML/CSS/JS 싱글 파일 · 외부 라이브러리 없음 · 한국어 UI
> **목표**: 6,000~8,000줄 · 50+ 기능 · 3회 팀 반복

---

## 1. 아키텍처 개요

### 1.1 3존 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  [☰ OpenClaw Hub]   [Office]  [Workflows]  [Communicate]│  ← NavBar (고정)
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│   Zone 1     │      Zone 2          │     Zone 3        │
│   Office     │      Workflows       │     Communicate   │
│   (2.5D뷰)  │      (갤러리+관리)    │     (채팅+로그)    │
│              │                      │                   │
│  ┌────────┐  │  ┌────┐┌────┐┌────┐ │  ┌─────────────┐  │
│  │ISO Room│  │  │Card││Card││Card│ │  │  Chat Stream │  │
│  │        │  │  └────┘└────┘└────┘ │  ├─────────────┤  │
│  │ Desks  │  │  ┌────────────────┐ │  │  Tool Logs  │  │
│  │ Avatar │  │  │  Timeline 24h  │ │  ├─────────────┤  │
│  └────────┘  │  └────────────────┘ │  │  Status Bar │  │
│              │                      │  └─────────────┘  │
├──────────────┴──────────────────────┴───────────────────┤
│  [Dashboard Overview: 활성 에이전트 3 | 워크플로우 12/15 ]│  ← Footer
└─────────────────────────────────────────────────────────┘
```

### 1.2 데스크톱 vs 모바일

| 뷰포트 | 레이아웃 | 전환 방식 |
|---------|----------|-----------|
| ≥1024px | 3컬럼 (30% / 40% / 30%) | 동시 표시 |
| 768–1023px | 2컬럼 (Office축소 + Workflows/Communicate 탭) | 탭 전환 |
| <768px | 1컬럼 전체화면 | 스와이프 + 탭 바 |

### 1.3 전체 모듈 구조

```
App
├── NavBar              # 상단 네비게이션
├── DashboardOverview   # 미니 대시보드 (에이전트/워크플로우 요약)
├── OfficeView          # Zone 1 - 아이소메트릭 오피스
│   ├── IsometricRoom   # CSS 3D 방
│   ├── DeskUnit[]      # 데스크 (3개)
│   ├── AgentAvatar[]   # 에이전트 아바타 (3개)
│   ├── AgentInfoPanel  # 데스크 클릭 시 정보 패널
│   └── SimulationEngine# 에이전트 행동 시뮬레이션
├── WorkflowManager     # Zone 2 - 워크플로우 관리
│   ├── WorkflowGallery # 카드 갤러리
│   ├── CategoryFilter  # 카테고리 필터 + 검색
│   ├── WorkflowCard    # 개별 카드 컴포넌트
│   ├── WorkflowDetail  # 상세 보기 모달
│   ├── ScheduleTimeline# 24시간 타임라인
│   ├── WorkflowForm    # 생성/편집 폼
│   └── ExportManager   # JSON 내보내기/가져오기
└── CommunicationHub    # Zone 3 - 커뮤니케이션
    ├── ChatStream      # 채팅 시뮬레이션
    ├── ToolCallLog     # 툴콜 실시간 로그
    ├── SystemStatus    # 시스템 상태 카드
    └── NotificationPanel # 알림 패널
```

---

## 2. 각 영역의 컴포넌트 명세

### 2.1 Zone 1: OfficeView (2.5D 아이소메트릭 오피스)

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 주요 속성 |
|----------|------|-----------|
| `IsometricRoom` | CSS 3D transform 기반 방 렌더링 | `roomId`, `name`, `position`, `size` |
| `DeskUnit` | 데스크 + 모니터 + 의자 렌더링 | `deskId`, `agentId`, `position`, `occupied` |
| `AgentAvatar` | 에이전트 캐릭터 (CSS 스프라이트) | `agentId`, `state`, `position`, `currentTask` |
| `AgentInfoPanel` | 데스크 클릭 시 슬라이드 패널 | `agent`, `currentWorkflow`, `stats` |
| `SimulationEngine` | 에이전트 행동 루프 관리 | `agents[]`, `tickInterval`, `running` |

#### AgentAvatar 상태머신

```
         ┌─────────┐
    ┌───→│  IDLE   │←──────┐
    │    └────┬────┘       │
    │         │ task        │ complete/error
    │         ▼             │
    │    ┌─────────┐       │
    │    │ WORKING │───────┘
    │    └────┬────┘
    │         │ error
    │         ▼
    │    ┌─────────┐
    └────│  ERROR  │
         └─────────┘

상태별 CSS 클래스:
  .agent--idle    : 미세 호흡 애니메이션 (scale 0.98~1.02, 3s)
  .agent--working : 타자 애니메이션 (translateY -2px~0, 0.15s) + 모니터 글로우
  .agent--error   : 빨간 펄스 (box-shadow red, 1s) + 느낌표 아이콘
```

### 2.2 Zone 2: WorkflowManager (워크플로우 관리)

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 주요 속성 |
|----------|------|-----------|
| `WorkflowGallery` | 카드 그리드 (필터링 포함) | `workflows[]`, `filter`, `searchQuery` |
| `CategoryFilter` | 카테고리 버튼 + 검색바 | `categories[]`, `active`, `onFilter()` |
| `WorkflowCard` | 개별 워크플로우 카드 | `workflow`, `onToggle()`, `onClick()` |
| `WorkflowDetail` | 상세 보기 모달/패널 | `workflow`, `history[]`, `onEdit()` |
| `ScheduleTimeline` | 24시간 가로 타임라인 | `workflows[]`, `currentTime` |
| `WorkflowForm` | CRUD 폼 (생성/편집) | `mode`, `workflow`, `onSave()` |
| `ExportManager` | JSON 내보내기/가져오기 | `workflows[]`, `format` |

#### WorkflowCard 레이아웃

```
┌──────────────────────────┐
│ 🏠 스마트홈              │  ← 카테고리 뱃지
│                          │
│ Morning Briefing         │  ← 워크플로우 이름
│ 매일 오전 7시 날씨,      │  ← 설명 (2줄 truncate)
│ 캘린더, 우선순위 브리핑  │
│                          │
│ ⏰ 매일 07:00   [●━━] ON │  ← 스케줄 + 토글
│ 마지막 실행: 2분 전  ✓   │  ← 마지막 실행 상태
└──────────────────────────┘
```

### 2.3 Zone 3: CommunicationHub (커뮤니케이션)

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 주요 속성 |
|----------|------|-----------|
| `ChatStream` | 에이전트 대화 시뮬레이션 | `messages[]`, `agents[]`, `autoScroll` |
| `ToolCallLog` | 툴콜 실시간 타임라인 | `logs[]`, `filter`, `expandable` |
| `SystemStatus` | 시스템 상태 카드 그리드 | `memory`, `tokens`, `apiStatus` |
| `NotificationPanel` | 워크플로우 실행 결과 알림 | `notifications[]`, `unread` |

#### ChatStream 메시지 타입

```javascript
// 메시지 타입 정의
const MESSAGE_TYPES = {
  AGENT_MSG: 'agent',      // 에이전트 → 사용자
  USER_MSG: 'user',        // 사용자 → 에이전트
  SYSTEM_MSG: 'system',    // 시스템 알림
  TOOL_CALL: 'tool_call',  // 툴콜 실행 로그
  WORKFLOW_EVENT: 'wf_event' // 워크플로우 이벤트
};
```

### 2.4 공통 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `NavBar` | 상단 고정 네비게이션 (3탭 + 테마 토글) |
| `DashboardOverview` | 활성 에이전트, 실행 중 워크플로우, 오늘의 작업 요약 |
| `ThemeToggle` | Neural Dark ↔ Light 전환 |
| `MiniChart` | SVG 기반 미니 차트 (에이전트 활동량, 성공률) |
| `Modal` | 범용 모달 (상세보기, 폼, 확인) |
| `Toast` | 하단 토스트 알림 |

---

## 3. CSS 3D Transform 아이소메트릭 오피스 설계

### 3.1 아이소메트릭 변환 원리

```css
/* 아이소메트릭 컨테이너: 45° 회전 + 30° 기울임 */
.isometric-scene {
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

.isometric-world {
  transform-style: preserve-3d;
  transform: rotateX(60deg) rotateZ(-45deg);
  /*
   * rotateX(60deg): 위에서 내려다보는 시점 (30° 기울임 = 90-60)
   * rotateZ(-45deg): 45° 회전으로 다이아몬드 형태
   */
}
```

### 3.2 방(Room) 구조

```
아이소메트릭 평면도 (rotateZ(-45deg) 적용 전 논리 좌표):

    ┌──────────────────────────────────────────┐
    │            Mission Control                │
    │    ┌──────┐                ┌──────┐      │
    │    │Desk-A│                │ 서버 │      │
    │    │(Ops) │                │ 랙   │      │
    │    └──────┘                └──────┘      │
    ├──────────────────┬───────────────────────┤
    │  Workflow Lab    │  Communication Hub    │
    │  ┌──────┐       │  ┌──────┐             │
    │  │Desk-B│       │  │Desk-C│             │
    │  │(Flow)│       │  │(Comm)│             │
    │  └──────┘       │  └──────┘             │
    │                 │                        │
    └─────────────────┴────────────────────────┘
```

#### 방 CSS 구현

```css
/* 바닥 타일 */
.room {
  position: absolute;
  transform-style: preserve-3d;
}

.room__floor {
  background: linear-gradient(135deg, #0d1117 25%, transparent 25%),
              linear-gradient(225deg, #0d1117 25%, transparent 25%),
              linear-gradient(315deg, #0d1117 25%, transparent 25%),
              linear-gradient(45deg, #0d1117 25%, transparent 25%);
  background-size: 40px 40px;
  background-color: #161b22;
}

/* 벽면 (Z축으로 세움) */
.room__wall--back {
  transform: rotateX(-90deg);
  transform-origin: top center;
  height: 80px; /* 벽 높이 */
  background: linear-gradient(180deg, #1a1f2e, #0d1117);
}

.room__wall--left {
  transform: rotateY(90deg);
  transform-origin: left center;
  width: 80px;
  background: linear-gradient(180deg, #151a28, #0a0e1a);
}
```

### 3.3 데스크 배치

```css
/* 데스크 유닛: 상판 + 다리 + 모니터 */
.desk {
  position: absolute;
  transform-style: preserve-3d;
}

.desk__top {
  width: 60px;
  height: 40px;
  background: #2d333b;
  transform: translateZ(30px); /* 바닥에서 30px 위 */
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.desk__monitor {
  width: 40px;
  height: 30px;
  background: #0a0e1a;
  border: 2px solid #30363d;
  transform: translateZ(50px) rotateX(-15deg);
  border-radius: 2px;
}

.desk__monitor--active {
  background: #0d1117;
  border-color: #58a6ff;
  box-shadow: 0 0 15px rgba(88, 166, 255, 0.3);
}

/* 데스크 위치 (논리 좌표 → 아이소메트릭 배치) */
.desk--mission-control { left: 60px; top: 40px; }
.desk--workflow-lab    { left: 40px; top: 160px; }
.desk--comm-hub        { left: 180px; top: 160px; }
```

### 3.4 아바타 렌더링

```css
/* CSS-only 캐릭터 (머리 + 몸통) */
.avatar {
  position: absolute;
  transform-style: preserve-3d;
  transform: translateZ(30px); /* 의자 높이 */
  transition: all 0.3s ease;
}

.avatar__head {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--agent-color);
}

.avatar__body {
  width: 20px;
  height: 18px;
  border-radius: 4px 4px 0 0;
  background: var(--agent-color);
  opacity: 0.8;
}

/* 에이전트별 색상 */
.avatar--ops  { --agent-color: #58a6ff; } /* 파랑: Mission Control */
.avatar--flow { --agent-color: #3fb950; } /* 초록: Workflow Lab */
.avatar--comm { --agent-color: #d2a8ff; } /* 보라: Communication Hub */

/* 타자 애니메이션 (working 상태) */
@keyframes typing {
  0%, 100% { transform: translateZ(30px) translateY(0); }
  50%      { transform: translateZ(30px) translateY(-2px); }
}
.avatar--working {
  animation: typing 0.15s infinite;
}
.avatar--working .desk__monitor {
  box-shadow: 0 0 20px rgba(88, 166, 255, 0.5);
}

/* 호흡 애니메이션 (idle 상태) */
@keyframes breathing {
  0%, 100% { transform: translateZ(30px) scale(1); }
  50%      { transform: translateZ(30px) scale(1.02); }
}
.avatar--idle {
  animation: breathing 3s ease-in-out infinite;
}

/* 에러 펄스 */
@keyframes errorPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(248, 81, 73, 0.3); }
  50%      { box-shadow: 0 0 20px rgba(248, 81, 73, 0.8); }
}
.avatar--error {
  animation: errorPulse 1s infinite;
}
```

---

## 4. 워크플로우 데이터 구조

### 4.1 JSON 스키마

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OpenClaw Workflow",
  "type": "object",
  "required": ["id", "name", "category", "schedule", "enabled", "steps"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "워크플로우 고유 ID (kebab-case)"
    },
    "name": {
      "type": "string",
      "description": "표시 이름 (한국어)"
    },
    "nameEn": {
      "type": "string",
      "description": "영문 이름"
    },
    "description": {
      "type": "string",
      "description": "설명 (한국어, 2줄 이내)"
    },
    "category": {
      "type": "string",
      "enum": ["smart-home", "productivity", "health", "finance", "lifestyle"]
    },
    "icon": {
      "type": "string",
      "description": "이모지 아이콘"
    },
    "schedule": {
      "type": "object",
      "required": ["cron", "humanReadable"],
      "properties": {
        "cron": {
          "type": "string",
          "description": "크론 표현식 (예: '0 7 * * *')"
        },
        "humanReadable": {
          "type": "string",
          "description": "사람이 읽기 쉬운 스케줄 (한국어)"
        },
        "timezone": {
          "type": "string",
          "default": "Asia/Seoul"
        }
      }
    },
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "action", "label"],
        "properties": {
          "id": { "type": "integer" },
          "action": {
            "type": "string",
            "enum": ["fetch", "analyze", "notify", "toggle", "create", "update", "check", "log"]
          },
          "label": { "type": "string" },
          "params": { "type": "object" },
          "dependsOn": {
            "type": "array",
            "items": { "type": "integer" }
          }
        }
      }
    },
    "assignedAgent": {
      "type": "string",
      "enum": ["ops", "flow", "comm"]
    },
    "lastRun": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "runCount": {
      "type": "integer",
      "default": 0
    },
    "successRate": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "default": 100
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 4.2 카테고리 정의

| 카테고리 | ID | 아이콘 | 색상 |
|----------|----|--------|------|
| 스마트홈 | `smart-home` | 🏠 | `#f0883e` |
| 생산성 | `productivity` | ⚡ | `#58a6ff` |
| 건강 | `health` | 💚 | `#3fb950` |
| 재정 | `finance` | 💰 | `#d29922` |
| 라이프스타일 | `lifestyle` | 🎯 | `#d2a8ff` |

---

## 5. 시뮬레이션 엔진

### 5.1 에이전트 정의

```javascript
const AGENTS = [
  {
    id: 'ops',
    name: 'Ops Agent',
    nameKo: '운영 에이전트',
    room: 'mission-control',
    desk: 'desk-a',
    color: '#58a6ff',
    role: '시스템 모니터링, 오피스 관리, 상태 점검',
    assignedCategories: ['smart-home', 'productivity'],
    taskPool: [
      { type: 'check_system', duration: 3000, label: '시스템 상태 점검' },
      { type: 'monitor_api', duration: 5000, label: 'API 상태 모니터링' },
      { type: 'run_workflow', duration: 8000, label: '워크플로우 실행' },
      { type: 'generate_report', duration: 6000, label: '리포트 생성' }
    ]
  },
  {
    id: 'flow',
    name: 'Flow Agent',
    nameKo: '플로우 에이전트',
    room: 'workflow-lab',
    desk: 'desk-b',
    color: '#3fb950',
    role: '워크플로우 실행, 스케줄 관리, 데이터 파이프라인',
    assignedCategories: ['health', 'finance'],
    taskPool: [
      { type: 'execute_workflow', duration: 7000, label: '워크플로우 실행 중' },
      { type: 'schedule_check', duration: 4000, label: '스케줄 확인' },
      { type: 'data_pipeline', duration: 10000, label: '데이터 파이프라인 처리' },
      { type: 'optimize_flow', duration: 6000, label: '플로우 최적화' }
    ]
  },
  {
    id: 'comm',
    name: 'Comm Agent',
    nameKo: '커뮤니케이션 에이전트',
    room: 'communication-hub',
    desk: 'desk-c',
    color: '#d2a8ff',
    role: '알림 전송, 채팅 관리, 로그 수집',
    assignedCategories: ['lifestyle'],
    taskPool: [
      { type: 'send_notification', duration: 2000, label: '알림 전송' },
      { type: 'process_chat', duration: 4000, label: '채팅 처리' },
      { type: 'collect_logs', duration: 5000, label: '로그 수집' },
      { type: 'summarize_day', duration: 8000, label: '일일 요약 생성' }
    ]
  }
];
```

### 5.2 시뮬레이션 루프

```javascript
class SimulationEngine {
  constructor(agents, workflows) {
    this.agents = agents;
    this.workflows = workflows;
    this.tickInterval = 2000; // 2초마다 틱
    this.running = false;
    this.eventQueue = [];
  }

  /* 메인 루프 (의사코드) */
  tick() {
    for (const agent of this.agents) {
      if (agent.state === 'idle') {
        // 1) 스케줄된 워크플로우 확인
        const scheduled = this.getScheduledWorkflow(agent);
        if (scheduled) {
          this.assignWorkflow(agent, scheduled);
          continue;
        }
        // 2) 랜덤 확률(30%)로 태스크 풀에서 작업 선택
        if (Math.random() < 0.3) {
          const task = this.pickRandomTask(agent);
          this.assignTask(agent, task);
        }
      }

      if (agent.state === 'working') {
        agent.progress += this.tickInterval;
        if (agent.progress >= agent.currentTask.duration) {
          // 95% 성공, 5% 에러
          const success = Math.random() < 0.95;
          this.completeTask(agent, success);
        }
      }

      if (agent.state === 'error') {
        agent.errorCooldown -= this.tickInterval;
        if (agent.errorCooldown <= 0) {
          agent.state = 'idle';
        }
      }
    }
  }

  /* 워크플로우 실행 시뮬레이션 */
  assignWorkflow(agent, workflow) {
    agent.state = 'working';
    agent.currentTask = {
      type: 'workflow',
      workflow: workflow,
      stepIndex: 0,
      duration: workflow.steps.length * 3000
    };
    agent.progress = 0;
    this.emit('workflow_start', { agent, workflow });
    this.emitToolCall(agent, workflow.steps[0]);
  }

  /* 툴콜 이벤트 발생 → CommunicationHub로 전달 */
  emitToolCall(agent, step) {
    this.emit('tool_call', {
      agent: agent.id,
      action: step.action,
      label: step.label,
      timestamp: Date.now()
    });
  }
}
```

### 5.3 이벤트 흐름

```
SimulationEngine.tick()
    │
    ├── agent.state 변경 → OfficeView 업데이트 (아바타 애니메이션)
    │
    ├── workflow_start → WorkflowManager (카드 상태 업데이트)
    │                  → ChatStream (시작 메시지)
    │
    ├── tool_call → ToolCallLog (로그 추가)
    │             → DeskUnit (모니터 글로우)
    │
    ├── workflow_complete → WorkflowCard (lastRun, runCount 업데이트)
    │                    → NotificationPanel (결과 알림)
    │                    → ChatStream (완료 메시지)
    │
    └── workflow_error → AgentAvatar (error 상태)
                       → NotificationPanel (에러 알림)
                       → ChatStream (에러 메시지)
```

---

## 6. 팀 분할 계획

### 6.1 Teammate A: 오피스 뷰

**담당 범위**: 아이소메트릭 오피스 + 아바타 + 시뮬레이션 엔진

#### 파일 내 담당 섹션

| 구현 항목 | 예상 라인 |
|-----------|-----------|
| CSS: 아이소메트릭 변환, 방, 데스크, 벽면 | ~400줄 |
| CSS: 아바타 스프라이트 + 3상태 애니메이션 | ~200줄 |
| HTML: 오피스 뷰 구조 (3방 + 3데스크 + 서버랙) | ~150줄 |
| JS: `SimulationEngine` 클래스 | ~300줄 |
| JS: `AgentAvatar` 상태머신 + DOM 업데이트 | ~200줄 |
| JS: `AgentInfoPanel` (데스크 클릭 이벤트) | ~150줄 |
| **소계** | **~1,400줄** |

#### 핵심 구현 항목

1. CSS 3D 아이소메트릭 씬 (perspective + transform)
2. 3개 방 렌더링 (바닥 타일 패턴 + 벽면)
3. 데스크 유닛 (상판, 다리, 모니터, 의자)
4. 아바타 3상태 (idle 호흡, working 타자, error 펄스)
5. 데스크 클릭 → 에이전트 정보 패널 슬라이드
6. SimulationEngine 틱 루프
7. 에이전트 태스크 할당/완료/에러 로직
8. 워크플로우 실행 시뮬레이션 (step-by-step)
9. 이벤트 발행 (EventEmitter 패턴)
10. 모니터 글로우 효과 (툴콜 시)

### 6.2 Teammate B: 워크플로우 관리

**담당 범위**: 갤러리 + 타임라인 + CRUD + 사전 데이터

#### 파일 내 담당 섹션

| 구현 항목 | 예상 라인 |
|-----------|-----------|
| CSS: 카드 그리드, 카드 스타일, 모달, 타임라인 | ~400줄 |
| HTML: 워크플로우 갤러리, 필터 바, 모달 구조 | ~200줄 |
| JS: `WorkflowGallery` (렌더링 + 필터 + 검색) | ~250줄 |
| JS: `WorkflowCard` + 토글 로직 | ~150줄 |
| JS: `WorkflowDetail` 모달 | ~200줄 |
| JS: `ScheduleTimeline` (24h SVG 타임라인) | ~250줄 |
| JS: `WorkflowForm` (생성/편집 CRUD) | ~200줄 |
| JS: `ExportManager` (JSON 내보내기/가져오기) | ~100줄 |
| JS: 15개 사전 데이터 (PRESET_WORKFLOWS) | ~450줄 |
| **소계** | **~2,200줄** |

#### 핵심 구현 항목

1. 15개 워크플로우 사전 데이터 정의
2. 카드 그리드 렌더링 (반응형)
3. 카테고리 필터 (5개 카테고리 + 전체)
4. 검색 (이름 + 설명 풀텍스트)
5. 활성화/비활성화 토글 (LocalStorage 저장)
6. 워크플로우 상세 모달 (스케줄 + 히스토리 + 설정)
7. 24시간 스케줄 타임라인 (SVG 기반)
8. 커스텀 워크플로우 생성 폼
9. 워크플로우 편집/삭제
10. JSON Export/Import

### 6.3 Teammate C: 커뮤니케이션

**담당 범위**: 채팅 + 로그 + 대시보드 + 공통 UI

#### 파일 내 담당 섹션

| 구현 항목 | 예상 라인 |
|-----------|-----------|
| CSS: 채팅, 로그, 상태카드, NavBar, 대시보드, 테마 | ~500줄 |
| HTML: 커뮤니케이션 허브, NavBar, 대시보드 | ~200줄 |
| JS: `ChatStream` (메시지 렌더링 + 자동스크롤) | ~250줄 |
| JS: `ToolCallLog` (실시간 로그 타임라인) | ~200줄 |
| JS: `SystemStatus` (상태 카드 + 미니 차트) | ~200줄 |
| JS: `NotificationPanel` (알림 큐) | ~150줄 |
| JS: `NavBar` + 탭 전환 + 반응형 | ~150줄 |
| JS: `DashboardOverview` + `MiniChart` (SVG) | ~200줄 |
| JS: `ThemeManager` (다크/라이트) | ~100줄 |
| JS: `App` 초기화 + EventBus + LocalStorage | ~250줄 |
| **소계** | **~2,200줄** |

#### 핵심 구현 항목

1. ChatStream 메시지 타입별 렌더링
2. 에이전트 대화 시뮬레이션 (자동 메시지)
3. ToolCallLog 실시간 타임라인
4. SystemStatus 카드 (메모리, 토큰, API)
5. NotificationPanel (워크플로우 결과)
6. NavBar + 3탭 전환
7. DashboardOverview (활성 에이전트, 워크플로우 통계)
8. MiniChart SVG (활동량, 성공률)
9. ThemeManager (Neural Dark + Light)
10. EventBus (전역 이벤트 시스템)
11. LocalStorage 영속성
12. 반응형 레이아웃 (3컬럼 → 1컬럼)

### 6.4 팀 작업 흐름

```
Phase 1: 생성 (각자 독립 구현)
  Teammate A ──→ 오피스 뷰 + 시뮬레이션 엔진
  Teammate B ──→ 워크플로우 갤러리 + 사전 데이터
  Teammate C ──→ 커뮤니케이션 + 공통 UI + 통합 글루

Phase 2: Evolve 1차 (크로스 리뷰 + 통합)
  A의 시뮬레이션 이벤트 ←→ C의 EventBus 연결
  B의 워크플로우 데이터 ←→ A의 시뮬레이션 연동
  C가 전체 통합 + 반응형 + 테마 마무리

Phase 3: Evolve 2차 (폴리싱)
  전체 UI/UX 정리, 애니메이션 튜닝, 엣지케이스 처리
```

---

## 7. 체크리스트 (Phase 1: 50개 항목)

### 공통/기반 (10개)

- [ ] 01. HTML 기본 구조 (DOCTYPE, meta, viewport)
- [ ] 02. CSS 변수 정의 (Neural Dark 테마 색상 팔레트)
- [ ] 03. CSS 리셋 + 기본 타이포그래피 (한국어 폰트)
- [ ] 04. NavBar 구현 (3탭: Office/Workflows/Communicate)
- [ ] 05. 탭 전환 로직 (현재 탭 하이라이트)
- [ ] 06. DashboardOverview 레이아웃
- [ ] 07. EventBus 구현 (이벤트 발행/구독)
- [ ] 08. LocalStorage 헬퍼 (저장/불러오기/초기화)
- [ ] 09. ThemeManager (다크/라이트 토글 + CSS 변수 전환)
- [ ] 10. 반응형 CSS (3단계 브레이크포인트)

### Zone 1: 오피스 뷰 (15개)

- [ ] 11. 아이소메트릭 씬 컨테이너 (perspective + transform)
- [ ] 12. Mission Control 방 렌더링 (바닥 + 벽면)
- [ ] 13. Workflow Lab 방 렌더링
- [ ] 14. Communication Hub 방 렌더링
- [ ] 15. 방 사이 벽/파티션 구분선
- [ ] 16. Desk-A 유닛 (상판 + 모니터 + 의자)
- [ ] 17. Desk-B 유닛
- [ ] 18. Desk-C 유닛
- [ ] 19. Ops 에이전트 아바타 렌더링
- [ ] 20. Flow 에이전트 아바타 렌더링
- [ ] 21. Comm 에이전트 아바타 렌더링
- [ ] 22. 아바타 idle 호흡 애니메이션
- [ ] 23. 아바타 working 타자 애니메이션 + 모니터 글로우
- [ ] 24. 아바타 error 펄스 애니메이션
- [ ] 25. 데스크 클릭 → AgentInfoPanel 슬라이드 오픈

### Zone 2: 워크플로우 관리 (13개)

- [ ] 26. 15개 사전 워크플로우 데이터 정의 (PRESET_WORKFLOWS)
- [ ] 27. WorkflowGallery 카드 그리드 레이아웃
- [ ] 28. WorkflowCard 컴포넌트 (이름, 설명, 스케줄, 상태)
- [ ] 29. CategoryFilter 버튼 그룹 (5카테고리 + 전체)
- [ ] 30. 검색바 (이름/설명 필터)
- [ ] 31. 활성화/비활성화 토글 스위치
- [ ] 32. WorkflowDetail 모달 (상세 정보)
- [ ] 33. 실행 히스토리 목록 (모의 데이터)
- [ ] 34. ScheduleTimeline 24시간 뷰 (SVG)
- [ ] 35. 타임라인에 크론 마커 표시
- [ ] 36. WorkflowForm (커스텀 워크플로우 생성)
- [ ] 37. 워크플로우 편집/삭제 기능
- [ ] 38. JSON Export/Import

### Zone 3: 커뮤니케이션 (10개)

- [ ] 39. ChatStream 메시지 목록 렌더링
- [ ] 40. 에이전트별 메시지 스타일 (색상 구분)
- [ ] 41. 자동 채팅 시뮬레이션 (에이전트 대화)
- [ ] 42. ToolCallLog 타임라인 렌더링
- [ ] 43. 툴콜 확장/축소 상세 보기
- [ ] 44. SystemStatus 카드 (메모리, 토큰, API 상태)
- [ ] 45. 미니 차트 SVG (에이전트 활동량)
- [ ] 46. 미니 차트 SVG (워크플로우 성공률)
- [ ] 47. NotificationPanel (워크플로우 완료/실패 알림)
- [ ] 48. 알림 읽음/안읽음 표시

### 통합/시뮬레이션 (2개)

- [ ] 49. SimulationEngine 틱 루프 (에이전트 3개 독립 동작)
- [ ] 50. 이벤트 연결 (SimEngine → OfficeView + ChatStream + ToolCallLog)

---

## 8. 15개 워크플로우 상세 데이터

```javascript
const PRESET_WORKFLOWS = [
  // ─── 생산성 (Productivity) ───
  {
    id: 'morning-briefing',
    name: '모닝 브리핑',
    nameEn: 'Morning Briefing',
    description: '매일 오전 7시에 날씨, 캘린더, 우선순위를 종합 브리핑합니다.',
    category: 'productivity',
    icon: '☀️',
    schedule: { cron: '0 7 * * *', humanReadable: '매일 오전 7:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '날씨 API 조회', params: { source: 'weather-api' } },
      { id: 2, action: 'fetch', label: '캘린더 이벤트 조회', params: { source: 'calendar-api' } },
      { id: 3, action: 'analyze', label: '우선순위 분석', dependsOn: [1, 2] },
      { id: 4, action: 'notify', label: '브리핑 알림 전송', dependsOn: [3] }
    ],
    assignedAgent: 'ops',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'morning', 'briefing'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'check-calendar',
    name: '캘린더 체크',
    nameEn: 'Check Calendar',
    description: '오전 8시와 오후 6시에 48시간 내 일정을 레이더 스캔합니다.',
    category: 'productivity',
    icon: '📅',
    schedule: { cron: '0 8,18 * * *', humanReadable: '매일 오전 8:00, 오후 6:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '48시간 일정 조회', params: { range: '48h' } },
      { id: 2, action: 'analyze', label: '충돌 감지 및 우선순위 판단', dependsOn: [1] },
      { id: 3, action: 'notify', label: '일정 요약 알림', dependsOn: [2] }
    ],
    assignedAgent: 'ops',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'calendar', 'schedule'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'email-processing',
    name: '이메일 처리',
    nameEn: 'Email Processing',
    description: '하루 3번 이메일을 분류, 우선순위 지정, 자동 응답 처리합니다.',
    category: 'productivity',
    icon: '📧',
    schedule: { cron: '0 9,13,17 * * *', humanReadable: '매일 오전 9시, 오후 1시, 5시', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '미읽은 이메일 조회', params: { source: 'email-api' } },
      { id: 2, action: 'analyze', label: '이메일 분류 (긴급/일반/스팸)', dependsOn: [1] },
      { id: 3, action: 'update', label: '라벨 및 폴더 정리', dependsOn: [2] },
      { id: 4, action: 'notify', label: '긴급 메일 알림', dependsOn: [2] },
      { id: 5, action: 'log', label: '처리 결과 로깅', dependsOn: [3, 4] }
    ],
    assignedAgent: 'comm',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'email', 'automation'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'prep-meeting',
    name: '회의 준비',
    nameEn: 'Prep Meeting',
    description: '30분마다 다가오는 회의를 감지하고 자료를 준비합니다.',
    category: 'productivity',
    icon: '🎯',
    schedule: { cron: '*/30 * * * *', humanReadable: '30분마다', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'check', label: '30분 내 회의 확인', params: { lookahead: '30m' } },
      { id: 2, action: 'fetch', label: '관련 문서 수집', dependsOn: [1] },
      { id: 3, action: 'analyze', label: '참석자 정보 요약', dependsOn: [1] },
      { id: 4, action: 'create', label: '브리핑 노트 생성', dependsOn: [2, 3] },
      { id: 5, action: 'notify', label: '회의 준비 완료 알림', dependsOn: [4] }
    ],
    assignedAgent: 'ops',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['frequent', 'meeting', 'preparation'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  // ─── 스마트홈 (Smart Home) ───
  {
    id: 'activate-sleep-mode',
    name: '수면 모드 활성화',
    nameEn: 'Activate Sleep Mode',
    description: '밤 10시에 모든 기기를 끄고 수면 환경을 조성합니다.',
    category: 'smart-home',
    icon: '🌙',
    schedule: { cron: '0 22 * * *', humanReadable: '매일 밤 10:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'toggle', label: '거실 조명 끄기', params: { device: 'living-room-lights', state: 'off' } },
      { id: 2, action: 'toggle', label: '스마트 TV 끄기', params: { device: 'smart-tv', state: 'off' } },
      { id: 3, action: 'toggle', label: '에어컨 수면모드', params: { device: 'ac', mode: 'sleep' } },
      { id: 4, action: 'toggle', label: '보안 시스템 활성화', params: { device: 'security', state: 'on' } },
      { id: 5, action: 'notify', label: '수면 모드 완료 알림', dependsOn: [1, 2, 3, 4] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'night', 'smart-home', 'sleep'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'activate-focus-mode',
    name: '집중 모드 활성화',
    nameEn: 'Activate Focus Mode',
    description: '오전 10시에 방해 요소를 차단하고 집중 환경을 만듭니다.',
    category: 'smart-home',
    icon: '🔇',
    schedule: { cron: '0 10 * * 1-5', humanReadable: '평일 오전 10:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'toggle', label: '알림 무음 모드', params: { device: 'phone', mode: 'dnd' } },
      { id: 2, action: 'toggle', label: '스마트 조명 집중 색온도', params: { device: 'desk-light', temp: '5000K' } },
      { id: 3, action: 'toggle', label: '소셜미디어 차단', params: { device: 'router', block: ['sns'] } },
      { id: 4, action: 'notify', label: '집중 모드 시작 알림', dependsOn: [1, 2, 3] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['weekday', 'focus', 'smart-home', 'productivity'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  // ─── 건강 (Health) ───
  {
    id: 'track-habits',
    name: '습관 추적',
    nameEn: 'Track Habits',
    description: '매일 밤 9시에 오늘의 습관 달성률을 체크합니다.',
    category: 'health',
    icon: '✅',
    schedule: { cron: '0 21 * * *', humanReadable: '매일 밤 9:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '오늘의 습관 목록 조회', params: { source: 'habit-tracker' } },
      { id: 2, action: 'check', label: '완료된 습관 확인', dependsOn: [1] },
      { id: 3, action: 'analyze', label: '주간 달성률 분석', dependsOn: [2] },
      { id: 4, action: 'log', label: '습관 기록 저장', dependsOn: [3] },
      { id: 5, action: 'notify', label: '습관 리포트 알림', dependsOn: [3] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'night', 'habits', 'tracking'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'track-sleep',
    name: '수면 추적',
    nameEn: 'Track Sleep',
    description: '밤 9시에 수면 데이터를 수집하고 패턴을 분석합니다.',
    category: 'health',
    icon: '😴',
    schedule: { cron: '0 21 * * *', humanReadable: '매일 밤 9:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '수면 센서 데이터 조회', params: { source: 'sleep-tracker' } },
      { id: 2, action: 'analyze', label: '수면 품질 분석 (깊은잠/렘수면)', dependsOn: [1] },
      { id: 3, action: 'analyze', label: '주간 수면 패턴 비교', dependsOn: [2] },
      { id: 4, action: 'log', label: '수면 기록 저장', dependsOn: [3] },
      { id: 5, action: 'notify', label: '수면 리포트 알림', dependsOn: [3] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'night', 'sleep', 'health'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'stretch-reminder',
    name: '스트레칭 알림',
    nameEn: 'Stretch Reminder',
    description: '오전 10시, 오후 2시, 4시에 스트레칭을 알려줍니다.',
    category: 'health',
    icon: '🧘',
    schedule: { cron: '0 10,14,16 * * 1-5', humanReadable: '평일 오전 10시, 오후 2시, 4시', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'check', label: '현재 작업 상태 확인', params: { source: 'activity-monitor' } },
      { id: 2, action: 'create', label: '스트레칭 루틴 선택', dependsOn: [1] },
      { id: 3, action: 'notify', label: '스트레칭 알림 전송', dependsOn: [2] },
      { id: 4, action: 'log', label: '스트레칭 완료 기록', dependsOn: [3] }
    ],
    assignedAgent: 'comm',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['weekday', 'health', 'reminder', 'stretch'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'plan-workouts',
    name: '운동 계획',
    nameEn: 'Plan Workouts',
    description: '일요일 오후 7시에 다음 주 운동 계획을 세웁니다.',
    category: 'health',
    icon: '💪',
    schedule: { cron: '0 19 * * 0', humanReadable: '매주 일요일 오후 7:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '이번 주 운동 기록 조회', params: { source: 'fitness-api' } },
      { id: 2, action: 'fetch', label: '다음 주 일정 확인', params: { source: 'calendar-api' } },
      { id: 3, action: 'analyze', label: '운동 밸런스 분석 (유산소/근력)', dependsOn: [1] },
      { id: 4, action: 'create', label: '주간 운동 계획 생성', dependsOn: [2, 3] },
      { id: 5, action: 'notify', label: '운동 계획 알림', dependsOn: [4] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['weekly', 'sunday', 'workout', 'planning'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'mental-health-checkin',
    name: '멘탈 건강 체크인',
    nameEn: 'Mental Health Check-in',
    description: '매일 오후 6시에 기분과 스트레스 수준을 체크합니다.',
    category: 'health',
    icon: '🧠',
    schedule: { cron: '0 18 * * *', humanReadable: '매일 오후 6:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'check', label: '오늘의 활동량 확인', params: { source: 'activity-log' } },
      { id: 2, action: 'create', label: '기분 체크 프롬프트 생성', dependsOn: [1] },
      { id: 3, action: 'analyze', label: '주간 기분 트렌드 분석', dependsOn: [2] },
      { id: 4, action: 'log', label: '멘탈 건강 기록 저장', dependsOn: [3] },
      { id: 5, action: 'notify', label: '멘탈 건강 요약 알림', dependsOn: [3] }
    ],
    assignedAgent: 'comm',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'mental-health', 'mood', 'wellness'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  // ─── 재정 (Finance) ───
  {
    id: 'check-bills',
    name: '청구서 확인',
    nameEn: 'Check Bills',
    description: '매주 월요일 오전 8시에 미납 청구서를 확인합니다.',
    category: 'finance',
    icon: '💳',
    schedule: { cron: '0 8 * * 1', humanReadable: '매주 월요일 오전 8:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '미납 청구서 조회', params: { source: 'billing-api' } },
      { id: 2, action: 'fetch', label: '계좌 잔액 확인', params: { source: 'bank-api' } },
      { id: 3, action: 'analyze', label: '결제 우선순위 판단', dependsOn: [1, 2] },
      { id: 4, action: 'notify', label: '청구서 알림', dependsOn: [3] },
      { id: 5, action: 'log', label: '청구서 체크 기록', dependsOn: [3] }
    ],
    assignedAgent: 'flow',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['weekly', 'monday', 'bills', 'finance'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  // ─── 라이프스타일 (Lifestyle) ───
  {
    id: 'plan-meals',
    name: '식단 계획',
    nameEn: 'Plan Meals',
    description: '일요일 오후 6시에 다음 주 식단을 계획합니다.',
    category: 'lifestyle',
    icon: '🍽️',
    schedule: { cron: '0 18 * * 0', humanReadable: '매주 일요일 오후 6:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '냉장고 재고 확인', params: { source: 'inventory' } },
      { id: 2, action: 'fetch', label: '다음 주 일정 확인', params: { source: 'calendar-api' } },
      { id: 3, action: 'analyze', label: '영양 밸런스 분석', dependsOn: [1] },
      { id: 4, action: 'create', label: '주간 식단 생성', dependsOn: [1, 2, 3] },
      { id: 5, action: 'create', label: '장보기 목록 생성', dependsOn: [4] },
      { id: 6, action: 'notify', label: '식단 계획 알림', dependsOn: [4, 5] }
    ],
    assignedAgent: 'comm',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['weekly', 'sunday', 'meals', 'planning'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'build-overnight',
    name: '야간 빌드',
    nameEn: 'Build Overnight',
    description: '자정에 코드 빌드, 테스트, 배포 파이프라인을 실행합니다.',
    category: 'productivity',
    icon: '🔨',
    schedule: { cron: '0 0 * * *', humanReadable: '매일 자정 00:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '최신 코드 Pull', params: { source: 'git-repo' } },
      { id: 2, action: 'check', label: '의존성 검사', dependsOn: [1] },
      { id: 3, action: 'create', label: '빌드 실행', dependsOn: [2] },
      { id: 4, action: 'check', label: '테스트 실행', dependsOn: [3] },
      { id: 5, action: 'analyze', label: '빌드 결과 분석', dependsOn: [3, 4] },
      { id: 6, action: 'notify', label: '빌드 결과 알림', dependsOn: [5] },
      { id: 7, action: 'log', label: '빌드 로그 저장', dependsOn: [5] }
    ],
    assignedAgent: 'ops',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'midnight', 'build', 'ci-cd'],
    createdAt: '2026-01-15T00:00:00+09:00'
  },

  {
    id: 'send-daily-summary',
    name: '일일 요약 전송',
    nameEn: 'Send Daily Summary',
    description: '밤 9시에 오늘 하루를 종합 요약합니다.',
    category: 'lifestyle',
    icon: '📊',
    schedule: { cron: '0 21 * * *', humanReadable: '매일 밤 9:00', timezone: 'Asia/Seoul' },
    enabled: true,
    steps: [
      { id: 1, action: 'fetch', label: '오늘의 워크플로우 실행 결과 수집', params: { source: 'workflow-logs' } },
      { id: 2, action: 'fetch', label: '에이전트 활동 로그 수집', params: { source: 'agent-logs' } },
      { id: 3, action: 'fetch', label: '커뮤니케이션 로그 수집', params: { source: 'comm-logs' } },
      { id: 4, action: 'analyze', label: '종합 분석 (성공률, 주요 이벤트)', dependsOn: [1, 2, 3] },
      { id: 5, action: 'create', label: '일일 요약 리포트 생성', dependsOn: [4] },
      { id: 6, action: 'notify', label: '일일 요약 알림', dependsOn: [5] },
      { id: 7, action: 'log', label: '요약 기록 저장', dependsOn: [5] }
    ],
    assignedAgent: 'comm',
    lastRun: null,
    runCount: 0,
    successRate: 100,
    tags: ['daily', 'night', 'summary', 'report'],
    createdAt: '2026-01-15T00:00:00+09:00'
  }
];
```

### 워크플로우 카테고리별 분포

| 카테고리 | 개수 | 워크플로우 목록 |
|----------|------|----------------|
| 생산성 (productivity) | 5개 | morning-briefing, check-calendar, email-processing, prep-meeting, build-overnight |
| 스마트홈 (smart-home) | 2개 | activate-sleep-mode, activate-focus-mode |
| 건강 (health) | 5개 | track-habits, track-sleep, stretch-reminder, plan-workouts, mental-health-checkin |
| 재정 (finance) | 1개 | check-bills |
| 라이프스타일 (lifestyle) | 2개 | plan-meals, send-daily-summary |

### 에이전트별 워크플로우 할당

| 에이전트 | 워크플로우 | 개수 |
|----------|-----------|------|
| Ops (ops) | morning-briefing, check-calendar, prep-meeting, build-overnight | 4개 |
| Flow (flow) | activate-sleep-mode, activate-focus-mode, track-habits, track-sleep, plan-workouts, check-bills | 6개 |
| Comm (comm) | email-processing, stretch-reminder, mental-health-checkin, plan-meals, send-daily-summary | 5개 |

---

## 부록: 테마 색상 팔레트

### Neural Dark (기본)

```css
:root {
  /* 배경 */
  --bg-primary: #0a0e1a;
  --bg-secondary: #0d1117;
  --bg-tertiary: #161b22;
  --bg-card: #1c2333;

  /* 테두리 */
  --border-default: #30363d;
  --border-muted: #21262d;

  /* 텍스트 */
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #484f58;

  /* 액센트 */
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-purple: #d2a8ff;
  --accent-orange: #f0883e;
  --accent-yellow: #d29922;
  --accent-red: #f85149;

  /* 그림자 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

### Light 테마

```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --bg-tertiary: #eaeef2;
  --bg-card: #ffffff;
  --border-default: #d0d7de;
  --border-muted: #d8dee4;
  --text-primary: #1f2328;
  --text-secondary: #656d76;
  --text-muted: #8c959f;
}
```
