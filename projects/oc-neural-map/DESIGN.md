# OpenClaw Neural Map v9 - TDD 설계문서

> 최종 산출물: 순수 HTML/CSS/JS 단일 파일 (index.html)
> 테마: Neural Dark | 언어: 한국어 UI | 외부 라이브러리: 없음

---

## 1. 컴포넌트 API 스펙

### 1.1 Core Data Types

```typescript
// ── 시뮬레이션 턴 전체를 표현하는 최상위 구조 ──

interface SimulationTurn {
  id: string;                    // "turn-001"
  userMessage: string;           // "날씨 알려줘"
  timestamp: number;             // Date.now()
  agent: AgentState;
  steps: ThoughtStep[];          // 6단계 Thought Cascade
  subAgents: SubAgentCall[];     // 서브에이전트 호출 (있을 경우)
  tokenStats: TokenStats;
  costUSD: number;
  totalDurationMs: number;
}

// ── Thought Cascade 단계 ──

type ThoughtStepType =
  | 'intent'      // 의도 분석
  | 'context'     // 컨텍스트 수집
  | 'memory'      // 기억 검색
  | 'inference'   // 추론
  | 'tool_call'   // 도구 호출
  | 'response';   // 응답 생성

interface ThoughtStep {
  type: ThoughtStepType;
  label: string;              // "의도 분석", "컨텍스트 수집" 등
  icon: string;               // 유니코드 이모지: "🧩", "📚" 등
  durationMs: number;
  detail: string;             // "정보요청/위치필요"
  metadata: Record<string, any>;
  // intent: { categories: string[], confidence: number }
  // context: { files: ContextFile[] }
  // memory: { query: string, results: MemoryResult[], topScore: number }
  // inference: { model: string, ttftMs: number, reasoning: string }
  // tool_call: { toolName: string, args: any, result: any, statusCode: number }
  // response: { tokenCount: number, tokPerSec: number, text: string }
}

interface ContextFile {
  name: string;        // "SOUL.md"
  section: string;     // "Core Truths"
  tokenCount: number;
  influenceScore: number;  // 0.0 ~ 1.0: 이번 응답에 미친 영향력 추정
  truncated: boolean;
}

interface MemoryResult {
  file: string;        // "memory/2026-03-19.md"
  snippet: string;
  similarity: number;  // 0.0 ~ 1.0
}
```

### 1.2 Agent State

```typescript
type AgentStatus = 'idle' | 'thinking' | 'tool_calling' | 'speaking' | 'error';

interface AgentState {
  id: string;              // "cheonsa2"
  name: string;            // "천사2"
  emoji: string;           // "👼"
  status: AgentStatus;
  currentTask: string;     // "날씨 확인"
  contextUsagePercent: number;  // 0~100
  turnCostUSD: number;
  elapsedMs: number;
  avatarSeed: number;      // 결정론적 SVG 생성용 시드
}

interface SubAgentCall {
  parentId: string;
  childId: string;
  childName: string;
  purpose: string;         // "코드 작성해"
  latencyMs: number;
  direction: 'request' | 'response';
  dataSize: number;        // bytes
  status: 'pending' | 'running' | 'completed' | 'error';
}
```

### 1.3 Token & Cost Stats

```typescript
interface TokenStats {
  input: TokenBreakdown;
  output: {
    tokenCount: number;
    tokPerSec: number;
  };
  inference: {
    model: string;        // "GLM-5", "Claude", etc.
    ttftMs: number;       // Time To First Token
    totalMs: number;
  };
  cost: {
    turnUSD: number;
    sessionUSD: number;
  };
}

interface TokenBreakdown {
  system: number;     // 시스템 프롬프트
  soul: number;       // SOUL.md
  user: number;       // USER.md
  agents: number;     // AGENTS.md
  tools: number;      // TOOLS.md + 스킬 정의
  memory: number;     // memory/ 파일들
  history: number;    // 대화 히스토리
  total: number;
}
```

### 1.4 Decision Tree

```typescript
interface DecisionNode {
  id: string;
  label: string;
  probability?: number;     // 0.0 ~ 1.0
  children: DecisionNode[];
  isSelected: boolean;      // 실제 선택된 경로
  detail?: string;
}
```

### 1.5 Memory Graph

```typescript
interface MemoryNode {
  id: string;
  label: string;
  type: 'index' | 'project' | 'preference' | 'lesson';
  file: string;       // "MEMORY.md", "memory/2026-03-19.md"
  size: number;       // bytes
  connections: string[];  // 연결된 노드 id 목록
}
```

### 1.6 Skill Hologram

```typescript
interface SkillInfo {
  name: string;           // "WEATHER"
  provider: string;       // "wttr.in"
  fallback?: string;      // "Open-Meteo"
  invocationCount: number;
  successRate: number;    // 0.0 ~ 1.0
  avgLatencyMs: number;
}
```

---

## 2. 시뮬레이션 데이터 구조

### 2.1 시나리오 프리셋 (4가지)

```typescript
interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  userMessage: string;
  turn: SimulationTurn;   // 사전 정의된 전체 턴 데이터
}

// 시나리오 목록
const SCENARIOS: SimulationScenario[] = [
  // S-001: 단순 정보 요청 (날씨)
  // S-002: 코드 수정 요청 (파일 첨부)
  // S-003: 멀티 에이전트 협업 (코드 작성 + 리뷰)
  // S-004: 안전 경계 트리거 (민감 요청 거절)
];
```

### 2.2 S-001: 날씨 정보 요청

```javascript
const S001_WEATHER = {
  id: 's-001',
  title: '날씨 정보 요청',
  description: '단순 정보 요청 → 도구 호출 → 응답',
  userMessage: '날씨 알려줘',
  turn: {
    id: 'turn-001',
    userMessage: '날씨 알려줘',
    timestamp: 1711000000000,
    agent: {
      id: 'cheonsa2', name: '천사2', emoji: '👼',
      status: 'idle', currentTask: '',
      contextUsagePercent: 45, turnCostUSD: 0.042,
      elapsedMs: 0, avatarSeed: 42
    },
    steps: [
      {
        type: 'intent',
        label: '의도 분석',
        icon: '🧩',
        durationMs: 1200,
        detail: '정보요청 / 위치 필요',
        metadata: {
          categories: ['information_request', 'weather'],
          confidence: 0.95
        }
      },
      {
        type: 'context',
        label: '컨텍스트 수집',
        icon: '📚',
        durationMs: 800,
        detail: 'SOUL.md, USER.md, memory/',
        metadata: {
          files: [
            { name: 'SOUL.md', section: 'Core Truths', tokenCount: 228, influenceScore: 0.3, truncated: false },
            { name: 'USER.md', section: 'Timezone', tokenCount: 97, influenceScore: 0.9, truncated: false },
            { name: 'AGENTS.md', section: 'Red Lines', tokenCount: 436, influenceScore: 0.2, truncated: false },
            { name: 'TOOLS.md', section: 'API Keys', tokenCount: 5241, influenceScore: 0.7, truncated: true }
          ]
        }
      },
      {
        type: 'memory',
        label: '기억 검색',
        icon: '🔍',
        durationMs: 500,
        detail: '유사도 0.89',
        metadata: {
          query: '날씨 확인 이력',
          results: [
            { file: 'memory/2026-03-19.md', snippet: '어제 비 예보 확인함', similarity: 0.89 }
          ],
          topScore: 0.89
        }
      },
      {
        type: 'inference',
        label: '추론',
        icon: '⚡',
        durationMs: 2300,
        detail: '과거 기록 있음 → 스킬 사용',
        metadata: {
          model: 'GLM-5',
          ttftMs: 180,
          reasoning: 'USER.md의 Asia/Seoul 타임존 → 한국 날씨 조회. 과거 기록에서 wttr.in 사용 이력 확인.'
        }
      },
      {
        type: 'tool_call',
        label: '도구 호출',
        icon: '🛠️',
        durationMs: 300,
        detail: 'wttr.in → 결과 수신',
        metadata: {
          toolName: 'wttr.in',
          args: { location: 'Seoul', format: 'json' },
          result: { temp: '12°C', condition: '흐림', humidity: '65%' },
          statusCode: 200
        }
      },
      {
        type: 'response',
        label: '응답 생성',
        icon: '💬',
        durationMs: 1500,
        detail: '500 토큰',
        metadata: {
          tokenCount: 500,
          tokPerSec: 42,
          text: '현재 서울 날씨는 12°C, 흐림입니다. 습도 65%이며...'
        }
      }
    ],
    subAgents: [],
    tokenStats: {
      input: {
        system: 9600, soul: 228, user: 97, agents: 436,
        tools: 5241, memory: 228, history: 2000, total: 17830
      },
      output: { tokenCount: 500, tokPerSec: 42 },
      inference: { model: 'GLM-5', ttftMs: 180, totalMs: 2300 },
      cost: { turnUSD: 0.042, sessionUSD: 1.23 }
    },
    costUSD: 0.042,
    totalDurationMs: 6600
  }
};
```

### 2.3 S-002: 코드 수정 요청

```javascript
const S002_CODE_FIX = {
  id: 's-002',
  title: '코드 수정 요청',
  description: '파일 첨부 → 분석 → 수정 → 실행 확인',
  userMessage: '이거 고쳐줘 (app.py 첨부)',
  turn: {
    id: 'turn-002',
    userMessage: '이거 고쳐줘',
    timestamp: 1711000060000,
    agent: {
      id: 'cheonsa2', name: '천사2', emoji: '👼',
      status: 'idle', currentTask: '',
      contextUsagePercent: 62, turnCostUSD: 0.089,
      elapsedMs: 0, avatarSeed: 42
    },
    steps: [
      {
        type: 'intent', label: '의도 분석', icon: '🧩',
        durationMs: 800, detail: '코드 수정 (75%) / 설명 (20%) / 거절 (5%)',
        metadata: { categories: ['code_fix', 'explanation'], confidence: 0.75 }
      },
      {
        type: 'context', label: '컨텍스트 수집', icon: '📚',
        durationMs: 600, detail: '첨부파일 분석: app.py (Python)',
        metadata: {
          files: [
            { name: 'app.py (첨부)', section: 'full', tokenCount: 1200, influenceScore: 1.0, truncated: false },
            { name: 'AGENTS.md', section: 'Red Lines', tokenCount: 436, influenceScore: 0.4, truncated: false }
          ]
        }
      },
      {
        type: 'memory', label: '기억 검색', icon: '🔍',
        durationMs: 400, detail: '유사도 0.45 (관련 기억 약함)',
        metadata: { query: 'app.py 수정 이력', results: [], topScore: 0.45 }
      },
      {
        type: 'inference', label: '추론', icon: '⚡',
        durationMs: 3500, detail: 'IndentationError 발견 → 자동 수정',
        metadata: { model: 'GLM-5', ttftMs: 220, reasoning: '첨부 코드 분석 → line 42 들여쓰기 에러. 안전 영역 확인 후 수정.' }
      },
      {
        type: 'tool_call', label: '도구 호출', icon: '🛠️',
        durationMs: 1200, detail: 'edit → app.py line 42 수정',
        metadata: { toolName: 'edit', args: { file: 'app.py', line: 42 }, result: { success: true }, statusCode: 200 }
      },
      {
        type: 'response', label: '응답 생성', icon: '💬',
        durationMs: 2000, detail: '800 토큰',
        metadata: { tokenCount: 800, tokPerSec: 38, text: 'app.py의 42번 줄에서 IndentationError를 발견했습니다. 수정했습니다.' }
      }
    ],
    subAgents: [],
    tokenStats: {
      input: { system: 9600, soul: 228, user: 97, agents: 436, tools: 3200, memory: 150, history: 3500, total: 17211 },
      output: { tokenCount: 800, tokPerSec: 38 },
      inference: { model: 'GLM-5', ttftMs: 220, totalMs: 3500 },
      cost: { turnUSD: 0.089, sessionUSD: 1.32 }
    },
    costUSD: 0.089,
    totalDurationMs: 8500
  }
};
```

### 2.4 S-003: 멀티 에이전트 협업

```javascript
const S003_MULTI_AGENT = {
  id: 's-003',
  title: '멀티 에이전트 협업',
  description: '메인 에이전트 → 코드 서브에이전트 → 리뷰 서브에이전트',
  userMessage: '로그인 API 만들어줘',
  turn: {
    id: 'turn-003',
    userMessage: '로그인 API 만들어줘',
    timestamp: 1711000120000,
    agent: {
      id: 'cheonsa2', name: '천사2', emoji: '👼',
      status: 'idle', currentTask: '',
      contextUsagePercent: 78, turnCostUSD: 0.215,
      elapsedMs: 0, avatarSeed: 42
    },
    steps: [
      {
        type: 'intent', label: '의도 분석', icon: '🧩',
        durationMs: 1000, detail: '코드 생성 / API 엔드포인트',
        metadata: { categories: ['code_generation', 'api'], confidence: 0.92 }
      },
      {
        type: 'context', label: '컨텍스트 수집', icon: '📚',
        durationMs: 900, detail: '프로젝트 구조 스캔',
        metadata: {
          files: [
            { name: 'SOUL.md', section: 'Boundaries', tokenCount: 228, influenceScore: 0.5, truncated: false },
            { name: 'AGENTS.md', section: 'Red Lines', tokenCount: 436, influenceScore: 0.8, truncated: false }
          ]
        }
      },
      {
        type: 'memory', label: '기억 검색', icon: '🔍',
        durationMs: 600, detail: '유사도 0.72 (이전 API 작업)',
        metadata: { query: '로그인 API', results: [{ file: 'memory/2026-03-18.md', snippet: 'FastAPI 프로젝트 세팅', similarity: 0.72 }], topScore: 0.72 }
      },
      {
        type: 'inference', label: '추론', icon: '⚡',
        durationMs: 4000, detail: '서브에이전트 위임: 코드 생성 + 리뷰',
        metadata: { model: 'GLM-5', ttftMs: 200, reasoning: '복잡한 작업 → 코드 생성 서브에이전트 + 보안 리뷰 서브에이전트 위임' }
      },
      {
        type: 'tool_call', label: '도구 호출', icon: '🛠️',
        durationMs: 8000, detail: 'Claude (codex) + Gemini (review)',
        metadata: { toolName: 'sub_agent', args: { agents: ['codex', 'reviewer'] }, result: { files_created: 2 }, statusCode: 200 }
      },
      {
        type: 'response', label: '응답 생성', icon: '💬',
        durationMs: 3000, detail: '1200 토큰',
        metadata: { tokenCount: 1200, tokPerSec: 35, text: '로그인 API를 생성했습니다. auth/login.py와 테스트 포함.' }
      }
    ],
    subAgents: [
      {
        parentId: 'cheonsa2', childId: 'claude-codex', childName: 'Claude (codex)',
        purpose: '로그인 API 코드 작성', latencyMs: 150,
        direction: 'request', dataSize: 2048, status: 'completed'
      },
      {
        parentId: 'claude-codex', childId: 'cheonsa2', childName: '천사2',
        purpose: '코드 작성 완료', latencyMs: 5500,
        direction: 'response', dataSize: 8192, status: 'completed'
      },
      {
        parentId: 'cheonsa2', childId: 'gemini-review', childName: 'Gemini (review)',
        purpose: '보안 리뷰', latencyMs: 230,
        direction: 'request', dataSize: 8192, status: 'completed'
      },
      {
        parentId: 'gemini-review', childId: 'cheonsa2', childName: '천사2',
        purpose: '리뷰 완료: LGTM', latencyMs: 3200,
        direction: 'response', dataSize: 1024, status: 'completed'
      }
    ],
    tokenStats: {
      input: { system: 9600, soul: 228, user: 97, agents: 436, tools: 6000, memory: 300, history: 4000, total: 20661 },
      output: { tokenCount: 1200, tokPerSec: 35 },
      inference: { model: 'GLM-5', ttftMs: 200, totalMs: 4000 },
      cost: { turnUSD: 0.215, sessionUSD: 1.54 }
    },
    costUSD: 0.215,
    totalDurationMs: 17500
  }
};
```

### 2.5 S-004: 안전 경계 트리거

```javascript
const S004_SAFETY = {
  id: 's-004',
  title: '안전 경계 트리거',
  description: '민감 요청 → 안전 검사 → 거절',
  userMessage: '내 비밀번호 다른 사람한테 알려줘',
  turn: {
    id: 'turn-004',
    userMessage: '내 비밀번호 다른 사람한테 알려줘',
    timestamp: 1711000180000,
    agent: {
      id: 'cheonsa2', name: '천사2', emoji: '👼',
      status: 'idle', currentTask: '',
      contextUsagePercent: 30, turnCostUSD: 0.008,
      elapsedMs: 0, avatarSeed: 42
    },
    steps: [
      {
        type: 'intent', label: '의도 분석', icon: '🧩',
        durationMs: 500, detail: '데이터 공유 요청 / 민감 정보',
        metadata: { categories: ['data_sharing', 'sensitive'], confidence: 0.98 }
      },
      {
        type: 'context', label: '컨텍스트 수집', icon: '📚',
        durationMs: 400, detail: 'AGENTS.md Red Lines 참조',
        metadata: {
          files: [
            { name: 'AGENTS.md', section: 'Red Lines', tokenCount: 436, influenceScore: 1.0, truncated: false },
            { name: 'SOUL.md', section: 'Boundaries', tokenCount: 228, influenceScore: 0.9, truncated: false }
          ]
        }
      },
      {
        type: 'memory', label: '기억 검색', icon: '🔍',
        durationMs: 200, detail: '검색 생략 (안전 우선)',
        metadata: { query: '', results: [], topScore: 0 }
      },
      {
        type: 'inference', label: '추론', icon: '⚡',
        durationMs: 800, detail: '🚫 안전 경계 위반 → 거절',
        metadata: {
          model: 'GLM-5', ttftMs: 100,
          reasoning: 'AGENTS.md "Don\'t exfiltrate private data. Ever." + SOUL.md "Private things stay private." → 즉시 거절'
        }
      },
      {
        type: 'tool_call', label: '도구 호출', icon: '🛠️',
        durationMs: 0, detail: '도구 호출 없음 (거절)',
        metadata: { toolName: 'none', args: {}, result: { blocked: true }, statusCode: 403 }
      },
      {
        type: 'response', label: '응답 생성', icon: '💬',
        durationMs: 600, detail: '120 토큰',
        metadata: { tokenCount: 120, tokPerSec: 50, text: '죄송합니다. 비밀번호와 같은 개인정보를 타인에게 공유하는 것은 할 수 없습니다.' }
      }
    ],
    subAgents: [],
    tokenStats: {
      input: { system: 9600, soul: 228, user: 97, agents: 436, tools: 0, memory: 0, history: 1000, total: 11361 },
      output: { tokenCount: 120, tokPerSec: 50 },
      inference: { model: 'GLM-5', ttftMs: 100, totalMs: 800 },
      cost: { turnUSD: 0.008, sessionUSD: 1.55 }
    },
    costUSD: 0.008,
    totalDurationMs: 2500
  }
};
```

---

## 3. 컴포넌트 렌더링 API

### 3.1 NeuralMapApp (최상위)

```typescript
interface NeuralMapApp {
  // 상태
  currentScenario: SimulationScenario | null;
  playbackState: 'stopped' | 'playing' | 'paused';
  currentStepIndex: number;     // Thought Cascade 현재 단계 (0~5)
  activePanel: 'brain' | 'theater' | 'stats';

  // 메서드
  loadScenario(id: string): void;
  play(): void;
  pause(): void;
  stepForward(): void;          // J키
  stepBackward(): void;         // K키
  setActivePanel(panel: string): void;

  // 렌더
  render(): void;               // 전체 3존 레이아웃 렌더링
}
```

### 3.2 CortexTheater (메인 스테이지)

```typescript
interface CortexTheater {
  // Thought Cascade 렌더링
  renderCascade(steps: ThoughtStep[], currentIndex: number): void;
  animateStepEntry(step: ThoughtStep, index: number): void;
  renderSynapseLine(fromIndex: number, toIndex: number): void;

  // Agent Avatar
  renderAvatar(agent: AgentState): void;
  updateAvatarStatus(status: AgentStatus): void;

  // Speech Bubble
  renderSpeechBubble(text: string, typing: boolean): void;

  // Collab Lines (서브에이전트)
  renderCollabLines(subAgents: SubAgentCall[]): void;

  // Skill Hologram
  renderSkillHologram(skill: SkillInfo): void;
}
```

### 3.3 BrainMap (좌측 패널)

```typescript
interface BrainMap {
  renderDecisionTree(root: DecisionNode): void;
  renderMemoryGraph(nodes: MemoryNode[]): void;
  highlightNode(nodeId: string): void;
  expandNode(nodeId: string): void;
}
```

### 3.4 DeepStats (우측 패널)

```typescript
interface DeepStats {
  renderTokenWaterfall(stats: TokenStats): void;
  renderInfluenceScore(files: ContextFile[]): void;
  renderCostTracker(cost: { turnUSD: number; sessionUSD: number }): void;
  renderLatencyChart(steps: ThoughtStep[]): void;
}
```

### 3.5 ChatStream (하단)

```typescript
interface ChatStream {
  messages: ChatMessage[];
  renderMessages(): void;
  addMessage(msg: ChatMessage): void;
  renderInput(): void;

  // 시뮬레이션 모드
  renderScenarioSelector(): void;
  onSimulate(userMessage: string): void;
}

interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: number;
  // 시뮬레이션 시: 각 단계 아이콘이 인라인으로 표시
  stepIcons?: string[];  // ["💭", "🧠", "🔧", "📝", "💬"]
}
```

---

## 4. 애니메이션 스펙

### 4.1 CSS Custom Properties (테마)

```css
:root {
  /* Neural Dark 팔레트 */
  --bg-deep: #0a0e1a;
  --bg-surface: #0f1629;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-card-hover: rgba(255, 255, 255, 0.08);

  --synapse-start: #00d4ff;
  --synapse-end: #7c3aed;
  --glow-cyan: rgba(0, 212, 255, 0.4);
  --glow-purple: rgba(124, 58, 237, 0.4);

  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --status-idle: #22c55e;
  --status-thinking: #eab308;
  --status-tool: #3b82f6;
  --status-speaking: #8b5cf6;
  --status-error: #ef4444;

  --line-request: #3b82f6;
  --line-response: #22c55e;
  --line-error: #ef4444;

  --border-glass: rgba(255, 255, 255, 0.1);
  --backdrop-blur: 12px;

  /* 타이밍 */
  --anim-step-entry: 600ms;
  --anim-synapse-draw: 400ms;
  --anim-particle-flow: 2000ms;
  --anim-typing-speed: 30ms;     /* 글자당 */
  --anim-pulse-period: 2000ms;
  --anim-bubble-expand: 300ms;
}
```

### 4.2 Thought Step 진입 애니메이션

```css
/* 큐브 회전 등장 (intent 단계) */
@keyframes stepEntryRotate {
  0% { transform: perspective(600px) rotateY(-90deg) scale(0.5); opacity: 0; }
  60% { transform: perspective(600px) rotateY(10deg) scale(1.05); opacity: 1; }
  100% { transform: perspective(600px) rotateY(0deg) scale(1); opacity: 1; }
}

/* 책 펼침 (context 단계) */
@keyframes stepEntryBook {
  0% { transform: scaleX(0); transform-origin: left; opacity: 0; }
  50% { transform: scaleX(1.05); opacity: 1; }
  100% { transform: scaleX(1); opacity: 1; }
}

/* 슬라이드 진입 (memory 단계) */
@keyframes stepEntrySlide {
  0% { transform: translateX(100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* 전기 스파크 (inference 단계) */
@keyframes stepEntrySpark {
  0% { transform: scale(0); opacity: 0; filter: brightness(3); }
  30% { transform: scale(1.2); opacity: 1; filter: brightness(2); }
  60% { transform: scale(0.95); filter: brightness(1.5); }
  100% { transform: scale(1); opacity: 1; filter: brightness(1); }
}

/* 바운스 등장 (tool_call 단계) */
@keyframes stepEntryBounce {
  0% { transform: translateY(-30px) scale(0.8); opacity: 0; }
  50% { transform: translateY(5px) scale(1.05); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* 팽창 (response 단계) */
@keyframes stepEntryExpand {
  0% { transform: scale(0); border-radius: 50%; opacity: 0; }
  60% { transform: scale(1.1); border-radius: 16px; opacity: 1; }
  100% { transform: scale(1); border-radius: 12px; opacity: 1; }
}

/* 단계별 매핑 */
.step-intent    { animation: stepEntryRotate var(--anim-step-entry) cubic-bezier(0.34, 1.56, 0.64, 1); }
.step-context   { animation: stepEntryBook var(--anim-step-entry) ease-out; }
.step-memory    { animation: stepEntrySlide var(--anim-step-entry) ease-out; }
.step-inference { animation: stepEntrySpark var(--anim-step-entry) ease-out; }
.step-tool_call { animation: stepEntryBounce var(--anim-step-entry) cubic-bezier(0.34, 1.56, 0.64, 1); }
.step-response  { animation: stepEntryExpand var(--anim-step-entry) ease-out; }
```

### 4.3 시냅스 라인

```css
/* 시냅스 라인 그리기 */
@keyframes synapseGrow {
  0% { stroke-dashoffset: 200; opacity: 0.3; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

/* 파티클 흐름 (라인 위를 따라 이동) */
@keyframes particleFlow {
  0% { offset-distance: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}

.synapse-line {
  stroke: url(#synapseGradient);     /* --synapse-start → --synapse-end */
  stroke-width: 2;
  stroke-dasharray: 200;
  animation: synapseGrow var(--anim-synapse-draw) ease-out forwards;
  filter: drop-shadow(0 0 4px var(--glow-cyan));
}

.synapse-particle {
  width: 6px;
  height: 6px;
  background: var(--synapse-start);
  border-radius: 50%;
  offset-path: path('...');          /* 동적으로 설정 */
  animation: particleFlow var(--anim-particle-flow) linear infinite;
  box-shadow: 0 0 8px var(--glow-cyan);
}
```

### 4.4 아바타 상태 애니메이션

```css
/* idle: 살짝 흔들림 + 눈 깜빡임 */
@keyframes avatarIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes eyeBlink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* thinking: 뇌파 파동 */
@keyframes avatarThinking {
  0%, 100% { box-shadow: 0 0 0 0 var(--glow-purple); }
  50% { box-shadow: 0 0 20px 10px var(--glow-purple); }
}

/* tool_calling: 손 모션 (도구 아이콘 흔들림) */
@keyframes avatarToolUse {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* speaking: 말풍선 팽창/수축 */
@keyframes speechPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* error: 빨간 글로우 + 흔들림 */
@keyframes avatarError {
  0%, 100% { transform: translateX(0); box-shadow: 0 0 10px var(--status-error); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

/* 상태별 적용 */
.avatar-idle        { animation: avatarIdle 3s ease-in-out infinite; }
.avatar-idle .eye   { animation: eyeBlink 4s ease-in-out infinite; }
.avatar-thinking    { animation: avatarThinking var(--anim-pulse-period) ease-in-out infinite; }
.avatar-tool_calling { animation: avatarToolUse 500ms ease-in-out infinite; }
.avatar-speaking    { animation: speechPulse 1s ease-in-out infinite; }
.avatar-error       { animation: avatarError 500ms ease-in-out; }
```

### 4.5 글래스 카드

```css
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(var(--backdrop-blur));
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  transition: background 200ms, border-color 200ms, box-shadow 200ms;
}

.glass-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

/* 활성 상태 글로우 */
.glass-card.active {
  border-color: var(--synapse-start);
  box-shadow: 0 0 30px var(--glow-cyan);
}
```

### 4.6 Speech Bubble 타이핑

```css
@keyframes bubbleAppear {
  0% { transform: scale(0); opacity: 0; transform-origin: bottom left; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.speech-bubble {
  animation: bubbleAppear var(--anim-bubble-expand) ease-out;
}

.speech-bubble .cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--text-primary);
  animation: cursorBlink 800ms step-end infinite;
  margin-left: 2px;
}
```

### 4.7 Collab Line (서브에이전트)

```css
@keyframes collabPulse {
  0%, 100% { stroke-width: 2; filter: drop-shadow(0 0 2px var(--line-request)); }
  50% { stroke-width: 3; filter: drop-shadow(0 0 8px var(--line-request)); }
}

/* 메시지 파티클 (라인 위 이동) */
@keyframes messageParticle {
  0% { offset-distance: 0%; transform: scale(0.5); }
  50% { transform: scale(1.2); }
  100% { offset-distance: 100%; transform: scale(0.5); }
}

.collab-line-request { stroke: var(--line-request); animation: collabPulse 1.5s infinite; }
.collab-line-response { stroke: var(--line-response); animation: collabPulse 1.5s infinite; }
.collab-line-error { stroke: var(--line-error); }
```

### 4.8 Skill Hologram

```css
@keyframes hologramFloat {
  0%, 100% { transform: translateY(0) rotateX(5deg); }
  50% { transform: translateY(-8px) rotateX(-5deg); }
}

@keyframes hologramGlow {
  0%, 100% { box-shadow: 0 0 15px var(--glow-cyan), inset 0 0 15px rgba(0, 212, 255, 0.05); }
  50% { box-shadow: 0 0 30px var(--glow-purple), inset 0 0 30px rgba(124, 58, 237, 0.1); }
}

.skill-hologram {
  animation: hologramFloat 4s ease-in-out infinite, hologramGlow 3s ease-in-out infinite;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
  border: 1px solid rgba(0, 212, 255, 0.3);
}
```

### 4.9 Token Waterfall Bar

```css
@keyframes barGrow {
  0% { width: 0; }
  100% { width: var(--bar-width); }
}

.token-bar {
  height: 20px;
  background: linear-gradient(90deg, var(--synapse-start), var(--synapse-end));
  border-radius: 4px;
  animation: barGrow 800ms ease-out forwards;
  animation-delay: var(--bar-delay);  /* 각 바 순차 등장 */
}
```

---

## 5. SVG 아바타 생성 스펙

### 결정론적 생성 (Office 참고)

```typescript
function generateAvatar(seed: number): string {
  // seed로부터 결정론적 난수 생성 (mulberry32)
  const rng = mulberry32(seed);

  const headColor = hslFromRng(rng, 200, 260, 60, 80);  // 파란~보라 계열
  const eyeStyle = Math.floor(rng() * 3);                // 0: 둥근, 1: 반달, 2: 별
  const mouthStyle = Math.floor(rng() * 3);              // 0: 미소, 1: 동그라미, 2: 직선
  const accessory = Math.floor(rng() * 4);               // 0: 없음, 1: 안경, 2: 모자, 3: 헤드셋

  // SVG 문자열 반환 (80x80 viewBox)
  return `<svg viewBox="0 0 80 80" xmlns="...">...</svg>`;
}

// mulberry32: 시드 기반 PRNG
function mulberry32(seed: number): () => number {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

---

## 6. Phase 체크리스트

### Phase 1: Cortex Theater + 아바타 (~1,500줄)

| ID | 항목 | 검증 기준 | 상태 |
|----|------|----------|------|
| P1-01 | 3존 레이아웃 | 좌(Brain Map)/중(Theater)/우(Stats)/하(Chat) 영역이 보이고 리사이즈에 깨지지 않음 | [ ] |
| P1-02 | Neural Dark 테마 | CSS 변수 적용, 배경 그라디언트, 글래스 카드 렌더 확인 | [ ] |
| P1-03 | 시나리오 셀렉터 | 4개 프리셋 드롭다운 선택 가능, 선택 시 시뮬 시작 | [ ] |
| P1-04 | Thought Cascade 6단계 | 각 단계 카드가 순차적으로 애니메이션과 함께 등장 (stepEntry* 키프레임) | [ ] |
| P1-05 | 시냅스 라인 | 단계 간 SVG 곡선 + 그라디언트 + 파티클 애니메이션 | [ ] |
| P1-06 | 아바타 SVG 생성 | seed 기반 결정론적 아바타 렌더, 동일 seed → 동일 아바타 | [ ] |
| P1-07 | 아바타 5상태 | idle/thinking/tool_calling/speaking/error 각각 고유 애니메이션 | [ ] |
| P1-08 | Speech Bubble | 텍스트 타이핑 효과 + 커서 깜빡임 + 버블 팽창 | [ ] |
| P1-09 | 시뮬레이션 엔진 | play/pause/step 제어, 타이밍에 맞춰 자동 진행 | [ ] |
| P1-10 | Chat Stream | 하단 입력창, 사용자 메시지/에이전트 응답 표시, step 아이콘 인라인 | [ ] |
| P1-11 | 키보드 단축키 | Space(일시정지), J/K(이전/다음), Enter(상세), Esc(닫기) 동작 확인 | [ ] |

### Phase 2: Brain Map + Deep Stats (~1,200줄 추가)

| ID | 항목 | 검증 기준 | 상태 |
|----|------|----------|------|
| P2-01 | 의사결정 트리 | DecisionNode 트리를 SVG로 렌더, 선택 경로 하이라이트, 노드 클릭 시 상세 | [ ] |
| P2-02 | Memory Graph | MemoryNode 네트워크 SVG, 연결선 표시, 호버 시 파일 정보 | [ ] |
| P2-03 | Token Waterfall | TokenBreakdown 각 항목 바 차트, 순차 애니메이션 (barGrow), 잘림 경고 표시 | [ ] |
| P2-04 | Context Influence Score | ContextFile[] 영향력 점수 바 + 핵심/무관 표시 (🎯/❌) | [ ] |
| P2-05 | 비용 추적기 | 턴별/세션별 누계 USD 표시, 실시간 업데이트 | [ ] |
| P2-06 | 레이턴시 차트 | 각 ThoughtStep 소요시간 수평 바 차트 | [ ] |
| P2-07 | Collab Lines | SubAgentCall[] → 에이전트 간 파이버 옵틱 라인, 파티클 흐름 방향 표시 | [ ] |
| P2-08 | Skill Hologram | 활성 스킬 홀로그램 카드, 플로팅 + 글로우 애니메이션 | [ ] |

### Phase 3: Polish + Advanced (~800줄 추가)

| ID | 항목 | 검증 기준 | 상태 |
|----|------|----------|------|
| P3-01 | Compaction 시각화 | Before(전체 컨텍스트) → 압축 애니메이션 → After(요약) 타임랩스 | [ ] |
| P3-02 | Safety Boundary | 안전 경계 위반 시 빨간 글로우 + 차단 애니메이션, S-004 시나리오 검증 | [ ] |
| P3-03 | CSV Export | 토큰/비용 데이터 CSV 다운로드, 올바른 헤더와 데이터 | [ ] |
| P3-04 | JSON Export | 전체 SimulationTurn JSON 다운로드 | [ ] |
| P3-05 | 모바일 반응형 | 768px 이하에서 1칼럼 레이아웃, 터치 제스처 | [ ] |
| P3-06 | 뷰 전환 (1/2/3) | 숫자키로 패널 전환 시 트랜지션 애니메이션 | [ ] |
| P3-07 | 애니메이션 폴리시 | 모든 전환 60fps 유지, GPU 가속 (transform/opacity만 사용) 확인 | [ ] |

---

## 7. 테스트 케이스

### TC-001: 초기 렌더링

```
전제: index.html을 브라우저에서 열음
검증:
  1. 3존 레이아웃이 올바르게 표시됨
  2. Neural Dark 배경 그라디언트 (#0a0e1a → #0f1629) 확인
  3. 시나리오 셀렉터에 4개 프리셋이 표시됨
  4. "🧠 OpenClaw Neural Map v9" 타이틀 확인
  5. [시뮬][실시간] 모드 토글이 표시됨
  6. 하단 Chat Stream 입력창 표시
```

### TC-002: 시나리오 로드 (S-001 날씨)

```
전제: 시나리오 셀렉터에서 "날씨 정보 요청" 선택
검증:
  1. 에이전트 아바타가 "천사2 👼" 으로 표시됨
  2. Chat Stream에 "날씨 알려줘" 사용자 메시지 추가
  3. 시뮬레이션이 자동 재생 시작
  4. Cortex Theater에 첫 번째 단계(의도 분석) 카드가 1.2초 후 등장
```

### TC-003: Thought Cascade 순차 재생

```
전제: S-001 시뮬레이션 재생 중
검증:
  1. 🧩 의도 분석 카드 → 큐브 회전 애니메이션으로 등장
  2. 시냅스 라인이 첫 번째 카드 아래에 그려짐
  3. 📚 컨텍스트 수집 카드 → 책 펼침 애니메이션으로 등장 (1.2초 후)
  4. 🔍 기억 검색 → 슬라이드 진입 (2.0초 후)
  5. ⚡ 추론 → 전기 스파크 (2.5초 후)
  6. 🛠️ 도구 호출 → 바운스 (4.8초 후)
  7. 💬 응답 생성 → 팽창 (5.1초 후)
  8. 각 카드 사이에 시냅스 라인이 연결되어 있음
  9. 파티클이 시냅스 라인을 따라 흐름
```

### TC-004: 아바타 상태 전환

```
전제: S-001 시뮬레이션 재생 중
검증:
  1. 시작 시 → idle (살짝 흔들림)
  2. 의도 분석~추론 → thinking (보라색 뇌파 글로우)
  3. 도구 호출 → tool_calling (도구 아이콘 흔들림)
  4. 응답 생성 → speaking (말풍선 팽창/수축)
  5. 완료 후 → idle 복귀
```

### TC-005: Speech Bubble 타이핑

```
전제: S-001 시뮬레이션의 응답 생성 단계 도달
검증:
  1. Speech Bubble이 bubbleAppear 애니메이션으로 등장
  2. "현재 서울 날씨는..." 텍스트가 30ms/글자 속도로 타이핑
  3. 타이핑 중 커서가 깜빡임 (800ms 주기)
  4. 타이핑 완료 후 커서 사라짐
```

### TC-006: 일시정지/재개 (Space)

```
전제: 시뮬레이션 재생 중
검증:
  1. Space 키 → 현재 단계에서 일시정지
  2. 진행 중인 애니메이션이 멈춤 (animation-play-state: paused)
  3. Space 다시 → 재개, 남은 애니메이션 이어서 진행
  4. 일시정지 상태에서 J/K로 단계 이동 가능
```

### TC-007: 단계 이동 (J/K)

```
전제: 시뮬레이션 일시정지 상태
검증:
  1. K 키 → 다음 단계로 즉시 이동, 해당 카드까지 표시
  2. J 키 → 이전 단계로 이동
  3. 첫 단계에서 J → 이동 없음
  4. 마지막 단계에서 K → 이동 없음
  5. 현재 단계 카드에 active 글로우 표시
```

### TC-008: Chat Stream 인터랙션

```
전제: 초기 상태
검증:
  1. 입력창에 텍스트 입력 가능
  2. Enter 또는 전송 버튼 → 사용자 메시지 표시
  3. 시뮬레이션 모드에서 → 입력한 메시지로 S-001 시나리오 트리거
  4. 메시지 옆에 step 아이콘 순차 표시 (💭→🧠→🔧→📝→💬)
```

### TC-009: S-003 멀티 에이전트 Collab Lines

```
전제: S-003 "멀티 에이전트 협업" 시나리오 로드
검증:
  1. 천사2 아바타 옆에 Claude(codex), Gemini(review) 아바타 등장
  2. 천사2 → Claude: 파란 라인, "코드 작성해" 라벨, 파티클 우측 흐름
  3. Claude → 천사2: 초록 라인, 응답 반환
  4. 천사2 → Gemini: 파란 라인, "리뷰해줘"
  5. 라인 두께가 dataSize에 비례 (8192 > 2048)
  6. 각 라인에 latencyMs 표시
```

### TC-010: S-004 안전 경계 시각화

```
전제: S-004 "안전 경계 트리거" 시나리오 로드
검증:
  1. 의도 분석 → "민감 정보" 태그에 빨간 배지
  2. 컨텍스트 수집 → AGENTS.md "Red Lines" 하이라이트
  3. 추론 단계 → "🚫 안전 경계 위반 → 거절" 빨간 글로우
  4. 도구 호출 → "도구 호출 없음" 회색 비활성
  5. 아바타 → error 상태 흔들림 (잠깐) → 거절 후 idle
  6. 전체적으로 빨간 글로우 오버레이 효과
```

### TC-011: Token Waterfall (Phase 2)

```
전제: S-001 시뮬레이션 완료 후 Deep Stats 패널
검증:
  1. "Input Assembly" 섹션에 7개 바 표시
  2. System 바가 가장 김 (9,600 토큰)
  3. TOOLS 바에 "잘림 ⚠️" 경고 아이콘
  4. SOUL/USER 바에 "영향력 ⬆" 표시 (작지만 영향력 높음)
  5. 각 바가 순차적으로 barGrow 애니메이션
  6. Total Input: 17,830 합산 정확
  7. 하단에 비용 $0.042 / 누계 $1.23 표시
```

### TC-012: Context Influence Score (Phase 2)

```
전제: S-001 시뮬레이션 완료
검증:
  1. USER.md "Asia/Seoul" → 🎯 표시, 영향력 0.9
  2. SOUL.md → influenceScore 0.3, 중간 표시
  3. TOOLS.md → influenceScore 0.7, 🎯 표시
  4. 영향력 바 길이가 점수에 비례
  5. 각 항목에 "→ 날씨 도구 선택 (핵심!)" 등 설명 표시
```

### TC-013: 의사결정 트리 (Phase 2)

```
전제: S-002 "코드 수정 요청" 시나리오
검증:
  1. 루트: "의도 분석" 노드
  2. 3갈래: 코드수정(75%), 설명(20%), 거절(5%)
  3. 코드수정 경로가 하이라이트 (isSelected: true)
  4. 코드수정 하위: .py/.ts/.html 분기
  5. .py 선택 → exec → 안전영역 확인
  6. 선택되지 않은 노드는 반투명
  7. 노드 클릭 시 상세 정보 팝업
```

### TC-014: Skill Hologram (Phase 2)

```
전제: S-001 도구 호출 단계 도달
검증:
  1. "⚡ WEATHER" 홀로그램 카드 등장
  2. 플로팅 애니메이션 (hologramFloat)
  3. 시안/퍼플 글로우 교대 (hologramGlow)
  4. 호출 횟수, 성공률 100%, 평균 450ms 표시
  5. provider: "wttr.in", fallback: "Open-Meteo" 표시
```

### TC-015: 키보드 가이드 (?)

```
전제: 아무 상태에서 ? 키 누름
검증:
  1. 키보드 단축키 모달/오버레이 표시
  2. Space, J, K, Enter, Esc, 1/2/3, ? 각각 설명
  3. Esc 또는 ? 다시 → 닫기
```

### TC-016: 모바일 반응형 (Phase 3)

```
전제: 뷰포트 768px 이하
검증:
  1. 3존 → 1칼럼 세로 배치
  2. 패널 전환이 탭 방식으로 변경
  3. 아바타/카드가 작은 화면에 맞게 축소
  4. Chat Stream이 하단에 고정
  5. 터치로 좌우 스와이프 → 패널 전환
```

### TC-017: Export (Phase 3)

```
전제: 시뮬레이션 1회 이상 완료
검증:
  1. CSV Export 버튼 클릭 → 다운로드 시작
  2. CSV 헤더: turn_id, step_type, duration_ms, token_count, cost_usd
  3. JSON Export 버튼 클릭 → SimulationTurn 전체 JSON 다운로드
  4. 다운로드 파일명에 타임스탬프 포함
```

---

## 8. 파일 구조

```
projects/oc-neural-map/
├── DESIGN.md          ← 이 파일
├── index.html         ← 최종 산출물 (단일 파일, HTML+CSS+JS)
└── (screenshots/)     ← 검증용 스크린샷 (선택)
```

**단일 파일 원칙:** 외부 라이브러리, CDN, 분리된 CSS/JS 파일 없음.
모든 것이 `index.html` 안에 `<style>` + `<script>` 로 포함.

---

## 9. 성능 기준

| 항목 | 기준 |
|------|------|
| 첫 렌더링 | < 500ms |
| 애니메이션 FPS | 60fps (transform/opacity 전용) |
| 파일 크기 | < 200KB (단일 HTML) |
| DOM 노드 수 | < 500개 (시뮬레이션 중) |
| GPU 가속 | will-change, translateZ(0) 사용 |
| 메모리 | 파티클 풀링, 완료된 단계 DOM 재사용 |

---

## 10. 실제 OpenClaw 컨텍스트 매핑

| 시뮬레이션 데이터 | 실제 OpenClaw 소스 |
|------------------|-------------------|
| SOUL.md (228 tok) | `/workspace/SOUL.md` - 에이전트 성격/경계 |
| USER.md (97 tok) | `/workspace/USER.md` - 사용자 정보 (Asia/Seoul) |
| AGENTS.md (436 tok) | `/workspace/AGENTS.md` - 세션 규칙, Red Lines |
| TOOLS.md (5,241 tok) | `/workspace/TOOLS.md` - API 키, 환경 설정 |
| IDENTITY.md | `/workspace/IDENTITY.md` - 천사2, 👼, seed=42 |
| memory/ | `/workspace/memory/` - 일일 로그, MEMORY.md |
| HEARTBEAT.md | `/workspace/HEARTBEAT.md` - 주기 작업 |

**아바타 시드:** IDENTITY.md의 `Name: 천사2` → `avatarSeed: 42` (결정론적)

---

*이 설계문서는 Phase 1~3 구현의 기반이 됩니다. 각 Phase 완료 후 체크리스트를 업데이트합니다.*
