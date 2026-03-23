# OC-DevMon Design Document (TDD)

> OpenClaw Developer Monitor - 실시간 개발자 모니터링 대시보드
> Single HTML File | Browser-based HUD | OpenClaw 전용

---

## 1. Data Collection API Spec

### 1.1 Agent Loop Events

```typescript
interface AgentLoopEvent {
  loopId: string;               // 고유 루프 ID (uuid)
  sessionId: string;            // 세션 ID
  phase: AgentLoopPhase;
  timestamp: number;            // Unix ms
  duration?: number;            // ms (phase 완료 시)
  metadata?: Record<string, unknown>;
}

type AgentLoopPhase =
  | 'intake'          // 사용자 입력 수신
  | 'context_assembly' // context 조립
  | 'inference'       // 모델 추론
  | 'tool_execution'  // 툴 실행 (반복 가능)
  | 'streaming_reply' // 스트리밍 응답
  | 'persistence';    // 저장

interface AgentLoopState {
  loopId: string;
  sessionId: string;
  iteration: number;            // 툴콜 루프 반복 횟수
  phases: AgentLoopPhaseRecord[];
  status: 'running' | 'completed' | 'error';
  startedAt: number;
  completedAt?: number;
  totalDuration?: number;
  toolCallCount: number;
  outputTokens: number;
}

interface AgentLoopPhaseRecord {
  phase: AgentLoopPhase;
  status: 'pending' | 'running' | 'completed' | 'error';
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  error?: string;
}
```

**수집 메서드:**
```typescript
// WebSocket 이벤트
ws.on('agent:loop:phase', (event: AgentLoopEvent) => void)
ws.on('agent:loop:state', (state: AgentLoopState) => void)

// REST 폴백
GET /api/agent/loop/current     → AgentLoopState
GET /api/agent/loop/:loopId     → AgentLoopState
GET /api/agent/loop/history     → AgentLoopState[]
```

---

### 1.2 Context Window Data

```typescript
interface ContextSnapshot {
  timestamp: number;
  loopId: string;
  maxTokens: number;            // 모델의 context window 크기
  totalUsed: number;            // 전체 사용 토큰
  usagePercent: number;         // 0-100
  breakdown: ContextBreakdown;
}

interface ContextBreakdown {
  systemPrompt: ContextSection;
  bootstrap: BootstrapSection;
  conversationHistory: ContextSection;
  toolResults: ContextSection;
  attachments: ContextSection;
  reserve: ContextSection;      // 응답용 예약 공간
}

interface ContextSection {
  label: string;
  tokens: number;
  percent: number;              // 전체 대비 %
}

interface BootstrapSection extends ContextSection {
  files: BootstrapFile[];
}

interface BootstrapFile {
  name: string;                 // e.g. "SOUL.md"
  originalTokens: number;       // 원본 크기
  injectedTokens: number;       // 실제 주입 크기
  truncated: boolean;           // 잘림 여부
  path: string;
}
```

**수집 메서드:**
```typescript
ws.on('context:snapshot', (snapshot: ContextSnapshot) => void)
ws.on('context:update', (partial: Partial<ContextSnapshot>) => void)

GET /api/context/current        → ContextSnapshot
GET /api/context/history        → ContextSnapshot[]
```

**색상 임계값:**
```typescript
const CONTEXT_THRESHOLDS = {
  normal:  { max: 70,  color: '#22c55e' },  // 초록
  caution: { max: 85,  color: '#eab308' },  // 노랑
  warning: { max: 95,  color: '#f97316' },  // 주황
  danger:  { max: 100, color: '#ef4444' },  // 빨강
} as const;
```

---

### 1.3 Tool Call Events

```typescript
interface ToolCall {
  callId: string;               // 고유 ID
  loopId: string;
  iteration: number;            // 루프 내 순서
  toolName: string;             // e.g. "web_search", "read", "edit"
  input: Record<string, unknown>;
  inputPreview: string;         // 축약된 입력 (표시용, 100자)
  status: 'pending' | 'executing' | 'completed' | 'error' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  duration?: number;            // ms
  result?: ToolCallResult;
}

interface ToolCallResult {
  success: boolean;
  outputTokens: number;         // 결과 토큰 수
  outputPreview: string;        // 축약된 결과 (200자)
  error?: string;
  rawOutput?: unknown;          // drill-down용 전체 결과
}
```

**수집 메서드:**
```typescript
ws.on('tool:call:start', (call: ToolCall) => void)
ws.on('tool:call:end', (call: ToolCall) => void)

GET /api/tools/calls/:loopId   → ToolCall[]
GET /api/tools/stats            → ToolStats
```

**분석용 집계:**
```typescript
interface ToolStats {
  totalCalls: number;
  byTool: Record<string, {
    count: number;
    avgDuration: number;
    totalTokens: number;
    errorRate: number;
  }>;
  avgDuration: number;
  fastestCall: { toolName: string; duration: number };
  slowestCall: { toolName: string; duration: number };
}
```

---

### 1.4 Session Queue Data

```typescript
interface QueueState {
  timestamp: number;
  sessions: SessionLane[];
  globalLane: GlobalLane;
}

interface SessionLane {
  sessionKey: string;           // 세션 식별자
  currentRun?: RunInfo;
  queued: RunInfo[];
  concurrency: number;          // 항상 1 (세션 레인)
}

interface GlobalLane {
  running: RunInfo[];
  maxConcurrent: number;        // main=4, subagent=8
  currentConcurrent: number;
}

interface RunInfo {
  runId: string;
  sessionKey: string;
  mode: 'steer' | 'followup' | 'collect';
  status: 'running' | 'queued' | 'completed';
  queuedAt: number;
  startedAt?: number;
  waitTime?: number;            // ms (큐 대기 시간)
  messagePreview: string;       // 메시지 축약 (50자)
}
```

**수집 메서드:**
```typescript
ws.on('queue:state', (state: QueueState) => void)
ws.on('queue:run:start', (run: RunInfo) => void)
ws.on('queue:run:end', (run: RunInfo) => void)

GET /api/queue/state            → QueueState
```

---

### 1.5 Streaming Metrics

```typescript
interface StreamingMetrics {
  loopId: string;
  ttft: number;                 // Time To First Token (ms)
  tokensPerSecond: number;      // 현재 스트리밍 속도
  totalTokensStreamed: number;
  blockCount: number;           // block streaming 블록 수
  previewUpdates: number;       // 프리뷰 업데이트 횟수
  startedAt: number;
  duration: number;             // 전체 스트리밍 시간 (ms)
}

interface StreamingEvent {
  type: 'first_token' | 'block_end' | 'message_end' | 'preview_update';
  timestamp: number;
  loopId: string;
  tokensDelta?: number;
  cumulativeTokens?: number;
}
```

**수집 메서드:**
```typescript
ws.on('stream:metrics', (metrics: StreamingMetrics) => void)
ws.on('stream:event', (event: StreamingEvent) => void)

GET /api/stream/current         → StreamingMetrics
```

---

### 1.6 Compaction Events

```typescript
interface CompactionEvent {
  compactionId: string;
  sessionId: string;
  triggeredAt: number;
  completedAt?: number;
  duration?: number;            // ms
  trigger: CompactionTrigger;
  before: CompactionSnapshot;
  after?: CompactionSnapshot;
  compressionRatio?: number;    // e.g. 0.35 = 65% 감소
  summaryModel: string;         // 요약에 사용된 모델
  config: CompactionConfig;
}

interface CompactionTrigger {
  reason: 'auto_threshold' | 'manual' | 'memory_flush';
  contextUsagePercent: number;  // 트리거 시점의 사용률
}

interface CompactionSnapshot {
  totalTokens: number;
  conversationTokens: number;
  turnCount: number;
}

interface CompactionConfig {
  mode: 'auto' | 'manual' | 'off';
  targetTokens: number;
  identifierPolicy: 'strict' | 'off' | 'custom';
}
```

**수집 메서드:**
```typescript
ws.on('compaction:start', (event: CompactionEvent) => void)
ws.on('compaction:end', (event: CompactionEvent) => void)

GET /api/compaction/history     → CompactionEvent[]
GET /api/compaction/config      → CompactionConfig
```

---

### 1.7 Usage & Cost Tracking

```typescript
interface UsageTurn {
  turnId: string;
  loopId: string;
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  costUsd: number;              // 이 턴의 비용
}

interface UsageSession {
  sessionId: string;
  turns: UsageTurn[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  provider: ProviderInfo;
}

interface ProviderInfo {
  name: string;                 // "anthropic" | "github_copilot" | "gemini" | etc.
  model: string;                // e.g. "GLM-5-Turbo"
  pricing: {
    inputPer1k: number;         // $/1K input tokens
    outputPer1k: number;        // $/1K output tokens
  };
  quotaUsed?: number;           // 0-100% (OAuth providers)
  quotaLimit?: string;
}
```

**수집 메서드:**
```typescript
ws.on('usage:turn', (turn: UsageTurn) => void)
ws.on('usage:session', (session: UsageSession) => void)

GET /api/usage/current          → UsageSession
GET /api/usage/history          → UsageSession[]
```

---

## 2. Simulation Data

### 2.1 시뮬레이션 시나리오

OC-DevMon은 실제 OpenClaw 연결 없이도 동작해야 한다. 아래 시뮬레이션 데이터로 전체 UI를 검증한다.

```typescript
// ── 시뮬레이션 설정 ──
const SIM_CONFIG = {
  model: 'GLM-5-Turbo',
  maxContextTokens: 32_000,
  pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
  sessionId: 'sim-session-main',
  compaction: {
    mode: 'auto' as const,
    targetTokens: 16_000,
    identifierPolicy: 'strict' as const,
  },
  globalLane: { maxConcurrent: 4 },
};

// ── 시뮬레이션 Bootstrap 파일 ──
const SIM_BOOTSTRAP_FILES: BootstrapFile[] = [
  { name: 'SOUL.md',      originalTokens: 228,    injectedTokens: 228,   truncated: false, path: '/workspace/SOUL.md' },
  { name: 'AGENTS.md',    originalTokens: 436,    injectedTokens: 436,   truncated: false, path: '/workspace/AGENTS.md' },
  { name: 'TOOLS.md',     originalTokens: 13_553, injectedTokens: 5_241, truncated: true,  path: '/workspace/TOOLS.md' },
  { name: 'IDENTITY.md',  originalTokens: 53,     injectedTokens: 53,    truncated: false, path: '/workspace/IDENTITY.md' },
  { name: 'USER.md',      originalTokens: 97,     injectedTokens: 97,    truncated: false, path: '/workspace/USER.md' },
  { name: 'HEARTBEAT.md', originalTokens: 290,    injectedTokens: 290,   truncated: false, path: '/workspace/HEARTBEAT.md' },
];

// ── 시뮬레이션 Agent Loop 시나리오: "날씨 알려줘" ──
const SIM_LOOP_WEATHER: AgentLoopState = {
  loopId: 'loop-001',
  sessionId: 'sim-session-main',
  iteration: 2,
  toolCallCount: 2,
  outputTokens: 500,
  status: 'completed',
  startedAt: 1711000000000,
  completedAt: 1711000003500,
  totalDuration: 3500,
  phases: [
    { phase: 'intake',           status: 'completed', startedAt: 1711000000000, completedAt: 1711000000050,  duration: 50 },
    { phase: 'context_assembly', status: 'completed', startedAt: 1711000000050, completedAt: 1711000000200,  duration: 150 },
    { phase: 'inference',        status: 'completed', startedAt: 1711000000200, completedAt: 1711000001200,  duration: 1000 },
    { phase: 'tool_execution',   status: 'completed', startedAt: 1711000001200, completedAt: 1711000001434,  duration: 234 },
    // 2nd iteration: inference → tool
    { phase: 'inference',        status: 'completed', startedAt: 1711000001434, completedAt: 1711000002200,  duration: 766 },
    { phase: 'tool_execution',   status: 'completed', startedAt: 1711000002200, completedAt: 1711000002245,  duration: 45 },
    // Final: inference → reply
    { phase: 'inference',        status: 'completed', startedAt: 1711000002245, completedAt: 1711000002800,  duration: 555 },
    { phase: 'streaming_reply',  status: 'completed', startedAt: 1711000002800, completedAt: 1711000003400,  duration: 600 },
    { phase: 'persistence',      status: 'completed', startedAt: 1711000003400, completedAt: 1711000003500,  duration: 100 },
  ],
};

// ── 시뮬레이션 Tool Calls ──
const SIM_TOOL_CALLS: ToolCall[] = [
  {
    callId: 'tc-001',
    loopId: 'loop-001',
    iteration: 1,
    toolName: 'web_search',
    input: { query: '서울 날씨 현재' },
    inputPreview: 'web_search("서울 날씨 현재")',
    status: 'completed',
    startedAt: 1711000001200,
    completedAt: 1711000001434,
    duration: 234,
    result: {
      success: true,
      outputTokens: 150,
      outputPreview: '서울 현재 기온 12°C, 맑음, 습도 45%...',
    },
  },
  {
    callId: 'tc-002',
    loopId: 'loop-001',
    iteration: 2,
    toolName: 'read',
    input: { file_path: '/workspace/SOUL.md' },
    inputPreview: 'read("/workspace/SOUL.md")',
    status: 'completed',
    startedAt: 1711000002200,
    completedAt: 1711000002245,
    duration: 45,
    result: {
      success: true,
      outputTokens: 228,
      outputPreview: '---\nname: OpenClaw\ndescription: ...',
    },
  },
];

// ── 시뮬레이션 Context Snapshot ──
const SIM_CONTEXT: ContextSnapshot = {
  timestamp: 1711000000200,
  loopId: 'loop-001',
  maxTokens: 32_000,
  totalUsed: 26_576,
  usagePercent: 83.05,
  breakdown: {
    systemPrompt: { label: 'System Prompt', tokens: 9_600, percent: 30.0 },
    bootstrap: {
      label: 'Bootstrap Files',
      tokens: 6_345,
      percent: 19.8,
      files: SIM_BOOTSTRAP_FILES,
    },
    conversationHistory: { label: 'Conversation History', tokens: 8_000, percent: 25.0 },
    toolResults: { label: 'Tool Results', tokens: 1_631, percent: 5.1 },
    attachments: { label: 'Attachments', tokens: 0, percent: 0 },
    reserve: { label: 'Response Reserve', tokens: 1_000, percent: 3.1 },
  },
};

// ── 시뮬레이션 Streaming Metrics ──
const SIM_STREAMING: StreamingMetrics = {
  loopId: 'loop-001',
  ttft: 320,
  tokensPerSecond: 40,
  totalTokensStreamed: 500,
  blockCount: 3,
  previewUpdates: 12,
  startedAt: 1711000002800,
  duration: 600,
};

// ── 시뮬레이션 Queue State ──
const SIM_QUEUE: QueueState = {
  timestamp: 1711000000000,
  sessions: [
    {
      sessionKey: 'sim-session-main',
      currentRun: {
        runId: 'run-001',
        sessionKey: 'sim-session-main',
        mode: 'followup',
        status: 'running',
        queuedAt: 1711000000000,
        startedAt: 1711000000000,
        messagePreview: '날씨 알려줘',
      },
      queued: [],
      concurrency: 1,
    },
  ],
  globalLane: {
    running: [{
      runId: 'run-001',
      sessionKey: 'sim-session-main',
      mode: 'followup',
      status: 'running',
      queuedAt: 1711000000000,
      startedAt: 1711000000000,
      messagePreview: '날씨 알려줘',
    }],
    maxConcurrent: 4,
    currentConcurrent: 1,
  },
};

// ── 시뮬레이션 Compaction Event ──
const SIM_COMPACTION: CompactionEvent = {
  compactionId: 'compact-001',
  sessionId: 'sim-session-main',
  triggeredAt: 1711000100000,
  completedAt: 1711000102500,
  duration: 2500,
  trigger: {
    reason: 'auto_threshold',
    contextUsagePercent: 92,
  },
  before: {
    totalTokens: 29_440,
    conversationTokens: 18_000,
    turnCount: 24,
  },
  after: {
    totalTokens: 16_200,
    conversationTokens: 4_760,
    turnCount: 6,
  },
  compressionRatio: 0.45,
  summaryModel: 'GLM-5-Turbo',
  config: SIM_CONFIG.compaction,
};

// ── 시뮬레이션 Usage Data ──
const SIM_USAGE: UsageSession = {
  sessionId: 'sim-session-main',
  totalInputTokens: 18_845,
  totalOutputTokens: 500,
  totalCostUsd: 0.0417,
  provider: {
    name: 'custom',
    model: 'GLM-5-Turbo',
    pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
  },
  turns: [
    { turnId: 't-001', loopId: 'loop-001', timestamp: 1711000000000, inputTokens: 18_845, outputTokens: 500, costUsd: 0.0417 },
  ],
};

// ── 시뮬레이션 타임라인 (멀티턴 시나리오) ──
const SIM_USAGE_TIMELINE: UsageTurn[] = [
  { turnId: 't-001', loopId: 'loop-001', timestamp: 1711000000000, inputTokens: 9_800,  outputTokens: 200,  costUsd: 0.0212 },
  { turnId: 't-002', loopId: 'loop-002', timestamp: 1711000010000, inputTokens: 12_400, outputTokens: 350,  costUsd: 0.0276 },
  { turnId: 't-003', loopId: 'loop-003', timestamp: 1711000020000, inputTokens: 15_200, outputTokens: 480,  costUsd: 0.0342 },
  { turnId: 't-004', loopId: 'loop-004', timestamp: 1711000030000, inputTokens: 18_000, outputTokens: 600,  costUsd: 0.0408 },
  { turnId: 't-005', loopId: 'loop-005', timestamp: 1711000040000, inputTokens: 22_500, outputTokens: 750,  costUsd: 0.0510 },
  { turnId: 't-006', loopId: 'loop-006', timestamp: 1711000050000, inputTokens: 26_000, outputTokens: 420,  costUsd: 0.0554 },
  { turnId: 't-007', loopId: 'loop-007', timestamp: 1711000060000, inputTokens: 14_000, outputTokens: 300,  costUsd: 0.0304 },  // post-compaction
];

// ── 멀티세션 시뮬레이션 (TC-I03) ──
const SIM_MULTI_SESSION_QUEUE: QueueState = {
  timestamp: 1711000000000,
  sessions: [
    {
      sessionKey: 'session-A',
      currentRun: { runId: 'run-A1', sessionKey: 'session-A', mode: 'followup', status: 'running', queuedAt: 1711000000000, startedAt: 1711000000000, messagePreview: '코드 리뷰해줘' },
      queued: [
        { runId: 'run-A2', sessionKey: 'session-A', mode: 'followup', status: 'queued', queuedAt: 1711000001000, messagePreview: '테스트도 추가해줘' },
      ],
      concurrency: 1,
    },
    {
      sessionKey: 'session-B',
      currentRun: { runId: 'run-B1', sessionKey: 'session-B', mode: 'followup', status: 'running', queuedAt: 1711000000500, startedAt: 1711000000500, messagePreview: 'API 문서 작성해줘' },
      queued: [],
      concurrency: 1,
    },
    {
      sessionKey: 'session-C',
      currentRun: { runId: 'run-C1', sessionKey: 'session-C', mode: 'steer', status: 'running', queuedAt: 1711000000800, startedAt: 1711000000800, messagePreview: '아니 그거 말고 이거' },
      queued: [],
      concurrency: 1,
    },
  ],
  globalLane: {
    running: [
      { runId: 'run-A1', sessionKey: 'session-A', mode: 'followup', status: 'running', queuedAt: 1711000000000, startedAt: 1711000000000, messagePreview: '코드 리뷰해줘' },
      { runId: 'run-B1', sessionKey: 'session-B', mode: 'followup', status: 'running', queuedAt: 1711000000500, startedAt: 1711000000500, messagePreview: 'API 문서 작성해줘' },
      { runId: 'run-C1', sessionKey: 'session-C', mode: 'steer',    status: 'running', queuedAt: 1711000000800, startedAt: 1711000000800, messagePreview: '아니 그거 말고 이거' },
    ],
    maxConcurrent: 4,
    currentConcurrent: 3,
  },
};
```

---

## 3. Component Specifications

### 3.1 Agent Loop Tracker

**역할:** Agent Loop의 각 단계를 실시간으로 시각화

**렌더링:**
- 세로 파이프라인 뷰 (intake → context → inference → tool → reply → persist)
- 각 단계: 아이콘 + 라벨 + 소요시간 + 상태 배지
- 툴콜 루프 시 반복 표시 (iteration 카운터)
- 진행 중인 단계에 pulse 애니메이션

**상태 아이콘:**
| 상태 | 아이콘 | 색상 |
|------|--------|------|
| pending | `⏳` | gray |
| running | `🔄` | blue (pulse) |
| completed | `✅` | green |
| error | `❌` | red |

**DOM 구조:**
```html
<div class="agent-loop-tracker">
  <div class="loop-header">
    <span class="loop-id">Loop #001</span>
    <span class="iteration">Iteration 2/2</span>
    <span class="total-duration">3.5s</span>
  </div>
  <div class="phase-list">
    <div class="phase completed">
      <span class="phase-icon">✅</span>
      <span class="phase-name">intake</span>
      <span class="phase-duration">50ms</span>
    </div>
    <!-- ... more phases ... -->
  </div>
</div>
```

---

### 3.2 Context Window Monitor

**역할:** Context window 사용률을 실시간으로 표시

**렌더링:**
- 상단 바: 전체 사용률 프로그레스 바 (색상 임계값 적용)
- 하단: 섹션별 비율 바 차트 (스택 바)
- Bootstrap 파일 목록: 잘린 파일에 ⚠️ TRUNCATED 배지
- 숫자 표시: `26,576 / 32,000 (83%)`

**프로그레스 바 색상:** `CONTEXT_THRESHOLDS` 참조

**DOM 구조:**
```html
<div class="context-monitor">
  <div class="usage-bar">
    <div class="usage-fill caution" style="width: 83%"></div>
    <span class="usage-label">26,576 / 32,000 (83%)</span>
  </div>
  <div class="breakdown-bar">
    <div class="segment system" style="width: 30%" title="System Prompt: 9,600">System 30%</div>
    <div class="segment bootstrap" style="width: 19.8%" title="Bootstrap: 6,345">Bootstrap 20%</div>
    <!-- ... -->
  </div>
  <div class="bootstrap-files">
    <div class="file">SOUL.md <span class="tokens">228</span></div>
    <div class="file truncated">TOOLS.md <span class="tokens">5,241/13,553</span> <span class="badge">⚠️ TRUNCATED</span></div>
  </div>
</div>
```

---

### 3.3 Tool Call Tracer

**역할:** 각 Tool Call의 실행 과정과 결과를 기록

**렌더링:**
- 좌측 패널: 카드 형태의 Tool Call 리스트
- 각 카드: 도구명 + 소요시간 + 상태 배지 + 결과 토큰 수
- 실행 중인 카드에 로딩 스피너
- 클릭 시 상세 정보 (Phase 3)

**DOM 구조:**
```html
<div class="tool-tracer">
  <div class="tool-card completed">
    <span class="tool-index">#1</span>
    <span class="tool-name">web_search</span>
    <span class="tool-input">"서울 날씨 현재"</span>
    <span class="tool-duration">234ms</span>
    <span class="tool-status">✅</span>
    <span class="tool-tokens">150 tok</span>
  </div>
  <!-- ... -->
</div>
```

---

### 3.4 Session Queue Visualizer

**역할:** 세션별 실행 큐와 글로벌 동시 실행 상태 표시

**렌더링:**
- 세션별 수평 레인 (Kanban 스타일)
- 각 레인: 실행 중 (파란색) + 대기 중 (회색) 카드
- 글로벌 카운터: `Running: N | Queued: N | Max: N`
- steer 모드 카드에 `⚡ steered` 배지

---

### 3.5 Compaction Event Logger

**역할:** Compaction 이벤트를 기록하고 Before/After 비교 표시

**렌더링:**
- 이벤트 카드: 트리거 시점, 사유, 압축률
- Before/After 비교 바
- 소요 시간
- 사용된 요약 모델

---

### 3.6 Token Timeline Chart (Phase 2)

**역할:** 턴별 토큰 사용량을 시계열 차트로 표시

**렌더링:**
- Canvas 기반 바 차트
- X축: 턴 (T1, T2, ...)
- Y축: 토큰 수
- 색상: Input (파랑) / Output (초록)
- Compaction 지점 표시 (빨간 수직선)
- 호버: 상세 수치 툴팁

---

### 3.7 Tool Call Frequency Chart (Phase 2)

**역할:** 도구별 호출 빈도와 평균 소요시간

**렌더링:**
- 수평 바 차트
- 도구별: 호출 횟수 바 + 평균 소요시간 라벨
- 에러율이 높은 도구 강조

---

### 3.8 Latency Distribution (Phase 2)

**역할:** 응답 레이턴시 (TTFT, 전체) 분포

**렌더링:**
- 히스토그램 (Canvas)
- 구간별: <100ms, 100-500ms, 500ms-1s, 1-3s, 3s+
- 평균/중앙값/P95 마커

---

### 3.9 Cost Tracker Chart (Phase 2)

**역할:** 누적 비용 추이

**렌더링:**
- 라인 차트 (Canvas)
- X축: 턴 또는 시간
- Y축: 누적 $ 비용
- 현재 턴 비용 라벨

---

## 4. TDD Test Cases (상세)

### Unit Tests

| ID | 컴포넌트 | Given | When | Then | 검증 기준 |
|----|----------|-------|------|------|-----------|
| TC-001 | Agent Loop | Loop 시작 | 각 phase 실행 | 타임스탬프+소요시간 기록 | `phases.length >= 5`, 각 `duration > 0` |
| TC-002 | Context Monitor | 32K window | 26,576 토큰 사용 | 83% 표시, 노란색 | `usagePercent === 83.05`, class `caution` |
| TC-003 | Tool Tracer | web_search 호출 | 결과 수신 | 호출시각+응답시간+크기 기록 | `duration === 234`, `outputTokens === 150` |
| TC-004 | Session Queue | 런 실행 중 | 새 메시지 도착 | 큐 대기 표시 | `queued.length === 1`, waitTime 증가 |
| TC-005 | Compaction | 90% 도달 | Compaction 실행 | Before/After/압축률/소요시간 | `compressionRatio === 0.45`, `duration === 2500` |
| TC-006 | Streaming | Inference 시작 | 첫 토큰 도착 | TTFT 기록 | `ttft === 320` |
| TC-007 | Streaming | 스트리밍 중 | 100tok/2.5s | 40 tok/s 표시 | `tokensPerSecond === 40` |
| TC-008 | Context | Bootstrap 로드 | TOOLS.md 잘림 | 5,241tok + TRUNCATED 배지 | `truncated === true`, `injectedTokens === 5241` |
| TC-009 | Cost | GLM-5-Turbo | 18,845in + 500out | $0.0417 표시 | `costUsd === 0.0417` |
| TC-010 | Queue | steer 모드 메시지 | 현재 런에 주입 | "steered" 표시 | `mode === 'steer'`, UI에 배지 표시 |

### Integration Tests

| ID | 시나리오 | 설명 | 검증 기준 |
|----|----------|------|-----------|
| TC-I01 | Full Loop | "날씨 알려줘" 전체 시뮬레이션 | 모든 6개 컴포넌트 동시 업데이트, 데이터 일관성 |
| TC-I02 | Compaction During Run | 긴 대화 중 Compaction | Context Monitor 갑작스런 감소, Compaction 카드 생성, 비용 계속 누적 |
| TC-I03 | Multi-Session | 3세션 동시 실행 | 3개 레인 표시, globalLane.currentConcurrent === 3, 각 세션 독립 |

### 테스트 검증 함수 (in-HTML)

```typescript
function runTests(): TestResult[] {
  const results: TestResult[] = [];

  // TC-001: Agent Loop phases
  results.push(assert(
    'TC-001',
    SIM_LOOP_WEATHER.phases.length >= 5 &&
    SIM_LOOP_WEATHER.phases.every(p => p.duration !== undefined && p.duration > 0),
    'All phases have positive duration'
  ));

  // TC-002: Context usage color
  results.push(assert(
    'TC-002',
    getContextColor(SIM_CONTEXT.usagePercent) === CONTEXT_THRESHOLDS.caution.color,
    'Context at 83% shows caution color'
  ));

  // TC-003: Tool call recording
  const tc1 = SIM_TOOL_CALLS[0];
  results.push(assert(
    'TC-003',
    tc1.duration === 234 && tc1.result!.outputTokens === 150,
    'Tool call duration and output tokens recorded'
  ));

  // TC-005: Compaction
  results.push(assert(
    'TC-005',
    SIM_COMPACTION.compressionRatio === 0.45 && SIM_COMPACTION.duration === 2500,
    'Compaction ratio and duration correct'
  ));

  // TC-006: TTFT
  results.push(assert(
    'TC-006',
    SIM_STREAMING.ttft === 320,
    'TTFT recorded correctly'
  ));

  // TC-007: Streaming speed
  results.push(assert(
    'TC-007',
    SIM_STREAMING.tokensPerSecond === 40,
    'Streaming speed calculated correctly'
  ));

  // TC-008: Truncated file
  const toolsMd = SIM_BOOTSTRAP_FILES.find(f => f.name === 'TOOLS.md')!;
  results.push(assert(
    'TC-008',
    toolsMd.truncated === true && toolsMd.injectedTokens === 5241,
    'TOOLS.md marked as truncated with correct injected tokens'
  ));

  // TC-009: Cost calculation
  const cost = (18845 * 0.002 + 500 * 0.008) / 1000;
  results.push(assert(
    'TC-009',
    Math.abs(cost - 0.0417) < 0.001,
    'Cost calculation matches expected value'
  ));

  // TC-010: Steer mode
  const steerRun = SIM_MULTI_SESSION_QUEUE.sessions[2].currentRun!;
  results.push(assert(
    'TC-010',
    steerRun.mode === 'steer',
    'Steer mode run identified correctly'
  ));

  return results;
}
```

---

## 5. Phase Checklists

### Phase 1: Core Monitor

- [ ] **P1-01** HTML 기본 구조 + CSS 변수 + 다크 테마
- [ ] **P1-02** 시뮬레이션 엔진 (타이머 기반 이벤트 재생)
- [ ] **P1-03** Agent Loop Tracker 컴포넌트 렌더링
- [ ] **P1-04** Context Window Monitor 컴포넌트 렌더링
- [ ] **P1-05** Tool Call Tracer 컴포넌트 렌더링
- [ ] **P1-06** Session Queue Visualizer 컴포넌트 렌더링
- [ ] **P1-07** Compaction Event Logger 컴포넌트 렌더링
- [ ] **P1-08** 상단 바 (모델명, 세션ID, Context 사용률, 비용)
- [ ] **P1-09** 탭 네비게이션 (Live 탭 활성)
- [ ] **P1-10** TC-001~TC-010 단위 테스트 통과
- [ ] **P1-11** TC-I01 통합 테스트 (전체 루프 시뮬레이션) 통과
- [ ] **P1-12** TC-I03 통합 테스트 (멀티세션) 통과

### Phase 2: Analytics

- [ ] **P2-01** Analytics 탭 UI
- [ ] **P2-02** Token Timeline 차트 (Canvas)
- [ ] **P2-03** Tool Call 빈도 바 차트
- [ ] **P2-04** Latency Distribution 히스토그램
- [ ] **P2-05** Cost Tracker 누적 라인 차트
- [ ] **P2-06** Compaction 이벤트 마커 (타임라인 위 수직선)
- [ ] **P2-07** 차트 호버 툴팁
- [ ] **P2-08** 차트 데이터 자동 업데이트 (시뮬레이션 연동)

### Phase 3: Interactive

- [ ] **P3-01** Explorer 탭 UI
- [ ] **P3-02** Agent Loop Step-Through (이전/다음 버튼)
- [ ] **P3-03** Tool Call Drill-down (카드 클릭 → 상세 패널)
- [ ] **P3-04** Context Diff (Compaction Before/After 시각화)
- [ ] **P3-05** 실시간 필터 (도구명, 세션, 상태별)
- [ ] **P3-06** 검색 (Tool Call 입력/출력 텍스트 검색)
- [ ] **P3-07** Config 탭 (시뮬레이션 속도 조절, 임계값 수정)
- [ ] **P3-08** TC-I02 통합 테스트 (Compaction During Run) 통과
- [ ] **P3-09** 키보드 단축키 (J/K 단계 이동, Enter 드릴다운)

---

## 6. Technical Constraints

### Single HTML File

모든 코드는 **하나의 `index.html`** 파일에 포함:
- `<style>` 태그 내 CSS (외부 CDN 없음)
- `<script>` 태그 내 JavaScript (외부 라이브러리 없음)
- Canvas API로 차트 렌더링 (Chart.js 등 미사용)
- 아이콘은 유니코드 이모지 사용

### 브라우저 호환성

- Chrome/Edge 최신 (주요 타겟)
- Firefox 최신
- Safari 최신
- ES2020+ 문법 사용 가능

### 성능 요구사항

- 첫 렌더링: < 100ms
- 시뮬레이션 업데이트: 60fps 목표
- 메모리: < 50MB (1시간 세션 기준)
- Canvas 차트: requestAnimationFrame 사용

### 접근성

- 색상만으로 정보를 전달하지 않음 (아이콘/텍스트 병행)
- 키보드 네비게이션 (탭 전환, 단계 이동)
- 적절한 ARIA 라벨

---

## 7. File Structure

```
oc-devmon/
├── DESIGN.md          ← 이 파일 (TDD 설계 문서)
├── index.html         ← Phase 1~3 단일 파일 (추후 생성)
└── README.md          ← 사용법 (추후 생성)
```

---

## 8. Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   Simulation Engine                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Timer (setInterval / requestAnimationFrame)     │ │
│  │  → emit events in chronological order            │ │
│  │  → configurable speed (1x, 2x, 5x, 10x)         │ │
│  └────────────────────┬────────────────────────────┘ │
│                       │                               │
│  ┌────────────────────▼────────────────────────────┐ │
│  │              Event Bus (EventEmitter)            │ │
│  │  agent:loop:phase  │  context:snapshot           │ │
│  │  tool:call:start   │  tool:call:end              │ │
│  │  queue:state       │  stream:metrics             │ │
│  │  compaction:start  │  compaction:end             │ │
│  │  usage:turn        │                             │ │
│  └────────┬───────────┴────────────┬───────────────┘ │
│           │                        │                  │
│  ┌────────▼────────┐    ┌─────────▼────────────┐    │
│  │   State Store    │    │   Component Registry  │    │
│  │  (in-memory)     │    │  .render() on update   │    │
│  └────────┬────────┘    └─────────┬────────────┘    │
│           │                        │                  │
│  ┌────────▼────────────────────────▼───────────────┐ │
│  │                   DOM / Canvas                    │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Future: Real WebSocket Connection

```
┌───────────────────┐          ┌──────────────────┐
│  OpenClaw Server   │ ──ws──▶ │  OC-DevMon        │
│  (실제 에이전트)    │          │  (동일 이벤트 버스) │
└───────────────────┘          └──────────────────┘
```

시뮬레이션 엔진과 실제 WebSocket 소스는 동일한 Event Bus 인터페이스를 사용하므로 교체 가능.

---

*Generated for OC-DevMon Phase 0 — TDD Design Document*
*Based on OpenClaw internal architecture documentation*
