# OpenClaw Developer Monitor - 프로젝트 TDD 설계 문서

Claude에게 이 문서를 읽고 **실시간 개발자 모니터링 대시보드**를 설계+개발하라.

---

## 📋 프로젝트 개요

**이름:** OpenClaw Dev Monitor (OC-DevMon)

**목표:** OpenClaw 에이전트가 동작할 때 개발자가 **터미널에서 실시간으로** 볼 수 있는 HUD/대시보드를 **싱글 HTML 파일**로 만든다.

**차별점:** Claude HUD가 Claude Code 전용이라면, OC-DevMon은 **OpenClaw 전용**이며 브라우저에서 바로 열 수 있다.

---

## 🏗️ 아키텍처 (TDD 기반)

### Phase 0: TDD 설계 문서 작성 (이 단계!)

Claude가 아래 문서를 작성:
1. **API 설계** - OpenClaw WebSocket/API에서 수집해야 할 데이터 정의
2. **컴포넌트 설계** - 각 모니터링 컴포넌트의 스펙
3. **시뮬레이션 데이터** - 실제 OpenClaw 구조 기반 가상 데이터
4. **테스트 케이스** - 각 컴포넌트별 검증 기준

### Phase 1: Core Monitor (구조+데이터)

1. Agent Loop 실시간 추적
2. Context Window 모니터
3. Tool Call 트레이서
4. Session 레인 큐 시각화
5. Compaction 이벤트

### Phase 2: Analytics (분석+차트)

1. 토큰 사용량 타임라인 차트
2. Tool Call 빈도 분석
3. 레이턴시 분포
4. 비용 추적
5. 세션 비교

### Phase 3: Interactive (인터랙티브)

1. Agent Loop Step-Through (단계별 진행)
2. Tool Call Drill-down
3. Context Diff (Before/After)
4. Compaction 시뮬레이터
5. 실시간 필터/검색

---

## 📖 OpenClaw 내부 구조 (실제 문서 기반)

### 1. Agent Loop (수집 대상 #1)

```
intake → context assembly → model inference → tool call?
  → YES: tool execution → result → 다시 추론
  → NO: streaming reply → channel → persistence
```

**수집해야 할 데이터:**
- 각 단계의 시작/종료 타임스탬프
- 단계별 소요 시간 (latency)
- model inference vs tool execution 비율
- 툴콜 횟수 (루프 반복 횟수)
- 최종 응답 토큰 수

### 2. Context Assembly (수집 대상 #2)

```
System Prompt (~9,600토큰)
├── Tooling: 15+ tools (read, edit, write, exec, web_search...)
├── Skills List: metadata only (6 skills)
├── Safety: guardrails
├── OpenClaw Self-Update instructions
├── Workspace path
├── Docs path
├── Sandbox info
├── Current Date/Time
├── Reply Tags
├── Heartbeats
└── Runtime: host/OS/node/model/thinking

Project Context (Bootstrap Files)
├── SOUL.md (228토큰)
├── AGENTS.md (436토큰)
├── TOOLS.md (5,241토큰, TRUNCATED from 13,553)
├── IDENTITY.md (53토큰)
├── USER.md (97토큰)
└── HEARTBEAT.md (290토큰)

Conversation History (가변)
Tool Calls + Results (가변)
Attachments (가변)
```

**수집해야 할 데이터:**
- 각 섹션별 토큰 수 (System Prompt breakdown)
- Bootstrap 파일별 크기 + 잘림 여부
- Conversation History 토큰 수
- Tool Results 토큰 수
- 전체 context window 사용률

### 3. Command Queue (수집 대상 #3)

```
Session Lane (per session, concurrency=1)
Global Lane (maxConcurrent: main=4, subagent=8)

Queue Modes:
- steer: 현재 실행중인 런에 주입 (툴콜 취소 후)
- followup: 현재 런 종료 후 대기열
- collect: 여러 메시지를 모아서 한 번에 처리
```

**수집해야 할 데이터:**
- 큐 대기 중인 런 수
- 각 런의 세션 키
- 대기 시간
- 실행 중인 런 수
- 최대 동시 실행 수 vs 현재

### 4. Streaming (수집 대상 #4)

```
Model Output
  └─ text_delta/events
       ├─ blockStreamingBreak=text_end → channel chunk send
       └─ blockStreamingBreak=message_end → channel flush

Preview Streaming (TG/DC/Slack):
  → temporary preview message 업데이트
  → 완료 시 최종 메시지로 교체
```

**수집해야 할 데이터:**
- 첫 토큰까지의 시간 (TTFT)
- 스트리밍 속도 (tokens/sec)
- 블록 수 (block streaming)
- 프리뷰 업데이트 횟수

### 5. Compaction (수집 대상 #5)

```
Config: agents.defaults.compaction
  - mode: auto
  - targetTokens
  - model (별도 모델 지정 가능)
  - identifierPolicy: strict/off/custom

동작:
1. Context window 한계 도달
2. Memory Flush ("기억해!" 시스템 턴)
3. 에이전트가 MEMORY.md에 기록
4. 오래된 대화 → 요약 1개로 압축
5. 최근 대화 유지
6. Session JSONL에 저장
```

**수집해야 할 데이터:**
- Compaction 트리거 시점 (토큰 %)
- 압축 전/후 토큰 수
- 압축률
- 요약 모델
- 압축 소요 시간

### 6. Usage Tracking (수집 대상 #6)

```
/status → 세션 토큰 + 비용
/usage tokens → per-response 푸터
/usage cost → 로컬 비용 집계

Provider Usage:
- Anthropic: OAuth
- GitHub Copilot: OAuth
- Gemini CLI: OAuth
```

**수집해야 할 데이터:**
- Input/Output 토큰 수 (per turn)
- 누적 토큰 수
- 추정 비용 (API key only)
- Provider quota 사용률

---

## 🧪 TDD 테스트 케이스

### Unit Tests (각 컴포넌트별)

```
TC-001: Agent Loop Tracker
  GIVEN: Agent Loop가 시작됨
  WHEN: 각 단계(intake→context→inference→tool→reply)가 실행됨
  THEN: 각 단계의 타임스탬프와 소요시간이 기록됨

TC-002: Context Monitor
  GIVEN: Context Window 32,000토큰
  WHEN: System Prompt(9,600) + Bootstrap(5,976) + History(8,000) + Tools(3,000) = 26,576
  THEN: 사용률 83%로 표시, 노란색 경고

TC-003: Tool Call Tracer
  GIVEN: 에이전트가 web_search 호출
  WHEN: Tool Call JSON 생성 후 결과 수신
  THEN: 호출 시각, 응답 시간, 결과 크기가 기록됨

TC-004: Session Lane Queue
  GIVEN: 세션 A에서 런이 실행 중
  WHEN: 세션 A에 새 메시지 도착
  THEN: 큐에 대기 표시, 대기 시간 카운트

TC-005: Compaction Event
  GIVEN: Context가 90% 도달
  WHEN: Compaction 실행
  THEN: Before/After 토큰 수, 압축률, 소요시간 표시

TC-006: TTFT Measurement
  GIVEN: Model inference 시작
  WHEN: 첫 토큰이 도착
  THEN: TTFT(ms) 기록, 타임라인에 표시

TC-007: Streaming Speed
  GIVEN: 스트리밍 중
  WHEN: 100토큰이 2.5초에 도착
  THEN: 40 tok/s로 표시

TC-008: Context Breakdown
  GIVEN: Bootstrap 파일 로드 완료
  WHEN: TOOLS.md가 54KB (13,553토큰)이고 잘림
  THEN: injected 5,241토큰으로 표시, ⚠️ TRUNCATED 배지

TC-009: Cost Tracking
  GIVEN: GLM-5-Turbo ($0.002/1K input, $0.008/1K output)
  WHEN: Input 18,845토큰 + Output 500토큰
  THEN: $0.0417/turn 표시

TC-010: Queue Mode
  GIVEN: steer 모드로 메시지 수신
  WHEN: 현재 런에 주입
  THEN: "steered" 표시, 툴콜 경계에서 반영
```

### Integration Tests

```
TC-I01: Full Agent Loop 시뮬레이션
  사용자가 "날씨 알려줘" 입력 → 전체 루프 시뮬레이션
  모든 컴포넌트가 동시에 업데이트되는지 확인

TC-I02: Compaction During Run
  긴 대화 중 Compaction 발생 시나리오
  모든 모니터링이 올바르게 업데이트되는지 확인

TC-I03: Multi-Session Queue
  3개 세션이 동시에 런 실행
  큐 시각화가 올바르게 표시되는지 확인
```

---

## 📐 UI/UX 스펙

### 레이아웃 (개발자 대시보드 스타일)

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 OC-DevMon | Model: GLM-5-Turbo | Session: main        │
│  Context: 26,576/32,000 (83%) ████████░░ │ $0.042 this run │
├─────────────────────────────────────────────────────────────┤
│  [Live] [Analytics] [Explorer] [Config]                     │
├───────────────────────┬─────────────────────────────────────┤
│                       │                                     │
│  🔄 Agent Loop        │  📊 Token Timeline                  │
│  ┌──────────────┐     │  ┌─────────────────────────────┐   │
│  │ ✅ intake    │     │  │     █                       │   │
│  │ ✅ context   │     │  │   █ █ █     █              │   │
│  │ 🔄 inference │     │  │  █ █ █ █ █ █ █ █          │   │
│  │ ⏳ tool      │     │  │ T1 T2 T3 T4 T5 T6 T7      │   │
│  │ ⏳ reply     │     │  │                           │   │
│  └──────────────┘     │  │ Input ████  Output ██      │   │
│                       │  └─────────────────────────────┘   │
│  🛠️ Tool Calls        │                                     │
│  ┌──────────────┐     │  📋 Tool Call Log                  │
│  │ #1 web_search│     │  ┌─────────────────────────────┐   │
│  │   234ms ✅   │     │  │ 12:00:01 web_search "날씨" │   │
│  │ #2 read      │     │  │ 12:00:02 → result 150tok   │   │
│  │   45ms ✅    │     │  │ 12:00:03 read SOUL.md      │   │
│  │ #3 (pending) │     │  │ 12:00:04 → result 228tok   │   │
│  └──────────────┘     │  │ 12:00:05 inference → reply │   │
│                       │  └─────────────────────────────┘   │
│  📋 Queue             │                                     │
│  Running: 1 | Queued: 0 | Max: 4                          │
│                       │                                     │
├───────────────────────┴─────────────────────────────────────┤
│  Context Breakdown:                                         │
│  System ████ 30% | Bootstrap ████ 18% | Tools ██ 11%       │
│  History █████ 30% | Results ██ 8% | Reserve ████ 3%        │
└─────────────────────────────────────────────────────────────┘
```

### 색상 규칙
- 초록: 정상 (0-70%)
- 노랑: 주의 (70-85%)
- 주황: 경고 (85-95%)
- 빨강: 위험 (95%+)
- 회색: 대기 중

### 탭 구성
1. **Live**: 실시간 모니터링 (기본)
2. **Analytics**: 토큰/비용/레이턴시 차트
3. **Explorer**: Context 구조 탐색
4. **Config**: 설정

---

## 🔧 Claude에게 지시

**Phase 0 (현재):** 이 TDD 설계 문서를 바탕으로, `DESIGN.md` 파일을 작성하라.
- 각 컴포넌트의 상세 API 스펙
- 시뮬레이션 데이터 구조 (TypeScript 인터페이스 스타일)
- 각 Phase별 체크리스트

**Phase 1 (Core Monitor):** `index.html` 생성
- Agent Loop Tracker
- Context Window Monitor
- Tool Call Tracer
- Session Queue Visualizer
- Compaction Event Logger
- 시뮬레이션 데이터로 실시간 재생

**Phase 2 (Analytics):** 기반 파일 위에 추가
- 토큰 타임라인 차트 (Canvas)
- Tool Call 빈도 바 차트
- 레이턴시 분포 히스토그램
- 비용 누적 라인 차트

**Phase 3 (Interactive):** 기반 파일 위에 추가
- Agent Loop Step-Through (이전/다음 단계)
- Tool Call Drill-down (상세 정보 패널)
- Context Diff (Compaction Before/After)
- 필터/검색

---

## ✅ Phase 0 체크리스트

- [ ] DESIGN.md에 API 스펙 정의
- [ ] 각 수집 데이터 포인트 6개 상세 정의
- [ ] 시뮬레이션 데이터 구조 정의
- [ ] Phase 1 체크리스트 (5개 컴포넌트)
- [ ] Phase 2 체크리스트 (4개 차트)
- [ ] Phase 3 체크리스트 (4개 인터랙티브)
- [ ] TDD 테스트 케이스 13개 반영

---

## ⏱️ Phase 0 타임아웃: 30분
