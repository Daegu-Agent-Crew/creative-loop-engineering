# OpenClaw Context Visualizer - "AI의 프롬프트를 들여다보세요"

OpenClaw Agent가 실제로 보는 것을 시각화합니다. System Prompt, Bootstrap Files, Tool Schemas, Session History, Compaction, Memory - 이 모든 것이 어떻게 조립되어 LLM에게 전달되는지 투명하게 보여줍니다.

---

## 📋 핵심 컨셉

**"사용자 메시지가 LLM에 도달하기까지의 모든 과정을 시각화"**

이 앱은 실제 OpenClaw가 동작할 때 LLM에게 전달하는 전체 context를 시각적으로 분해하여 보여줍니다. 블랙박스를 열어보는 것처럼.

---

## 🏗️ 메인 레이아웃

### 좌측: Context Stack (컨텍스트 스택)

세로로 쌓인 레이어. 각 레이어가 LLM에게 전달되는 컨텍스트의 한 부분.

```
┌──────────────────────────────────────────┐
│  🔍 OpenClaw Context Visualizer           │
├──────────────┬───────────────────────────┤
│              │                           │
│  [Stack]     │  [Detail Panel]           │
│              │                           │
│  ┌────────┐  │  선택한 레이어의           │
│  │System  │  │  실제 내용을              │
│  │Prompt  │  │  코드 블록처럼             │
│  │3,842토큰│  │  보여줌                   │
│  └────────┘  │                           │
│  ┌────────┐  │  Syntax Highlighting:     │
│  │Bootstrap│  │  주석=회색, 변수=파랑     │
│  │Files   │  │  문자열=초록, 지시=흰색    │
│  │5,976토큰│  │                           │
│  │SOUL.md │  │                           │
│  │AGENTS  │  │                           │
│  │IDENTITY│  │                           │
│  │USER    │  │                           │
│  │TOOLS   │  │                           │
│  │HEARTBEAT│  │                           │
│  └────────┘  │                           │
│  ┌────────┐  │                           │
│  │Tool    │  │                           │
│  │Schemas │  │                           │
│  │7,997토큰│  │                           │
│  │(JSON)  │  │                           │
│  └────────┘  │                           │
│  ┌────────┐  │                           │
│  │Skills  │  │                           │
│  │List    │  │                           │
│  │546토큰  │  │                           │
│  └────────┘  │                           │
│  ┌────────┐  │                           │
│  │Session │  │                           │
│  │History │  │                           │
│  │varies  │  │                           │
│  └────────┘  │                           │
│  ┌────────┐  │                           │
│  │Tool    │  │                           │
│  │Results │  │                           │
│  │varies  │  │                           │
│  └────────┘  │                           │
│              │                           │
├──────────────┴───────────────────────────┤
│  📊 Context Window: 28,450/32,000 (89%)  │
│  ████████████████████░░░░ 89% 사용 중     │
├──────────────────────────────────────────┤
│  [▶ 시뮬레이션] [📥 CSV Export] [⚙️ 설정]│
└──────────────────────────────────────────┘
```

### 우측: Detail Panel (상세 패널)

클릭한 레이어의 실제 내용을 보여줌. 코드 에디터처럼 syntax highlighting.

---

## 📋 시뮬레이션 (3개 시나리오)

### 시나리오 1: "날씨 알려줘" (간단)
Context Stack 변화를 단계별로 보여줌:

```
Step 1: 첫 턴 - Bootstrap Files 주입
  → System Prompt + SOUL.md + AGENTS.md 등 로드
  → Context: 9,600토큰

Step 2: 사용자 메시지 추가
  → "날씨 알려줘"를 Session History에 추가
  → Context: +20토큰

Step 3: LLM 추론
  → Agent Loop: 추론 → web_search 툴호출
  → Tool Result: 서울 맑음 15°C

Step 4: 툴 결과 추가
  → Tool Result를 컨텍스트에 추가
  → Context: +150토큰

Step 5: 최종 응답
  → LLM이 답변 생성
  → Session History에 Assistant 메시지 추가

Step 6: 영속화
  → 전체 턴을 JSONL에 저장
```

각 단계에서 Context Stack이 애니메이션으로 변화 (크기 변화, 새 항목 추가).

### 시나리오 2: "이미지 분석해줘" (중간)
Step 1-3은 동일, Step 3에서:
- Agent Loop: 추론 → image 툴호출 (이미지 첨부)
- Tool Result: 이미지 분석 결과
- 추가 추론 → 답변

컨텍스트에 이미지 토큰이 크게 추가되는 것을 시각화.

### 시나리오 3: "게임 만들어줘" (복잡 - Compaction 발생)
Step 1-5 동일, 이후:
```
Step 6: LLM이 여러 툴호출 (read, exec, write)
  → 각 툴호출 결과가 컨텍스트에 누적
  → Context: 28,000/32,000 (87.5%)

Step 7: 🔴 Context Window 한계 도달!
  → 빨간 경고 바 플래시
  → Auto-Compaction 트리거

Step 8: Memory Flush (자동)
  → "기억해!" 시스템 턴 주입
  → 에이전트가 MEMORY.md에 기록

Step 9: Compaction 실행
  → 오래된 대화 10개 → 요약 1개로 압축
  → Context: 28,000 → 15,000토큰
  → 애니메이션: 줄들이 합쳐지는 시각 효과

Step 10: 계속 실행
  → 압축된 컨텍스트로 재개
```

---

## 🔍 각 레이어의 상세 내용 (시뮬레이션 데이터)

### System Prompt (실제 구조 기반)
```markdown
## Tooling
Available tools: read, edit, write, exec, process, web_search, 
web_fetch, cron, sessions_list, sessions_history, sessions_send, 
subagents, session_status, image, memory_search, memory_get, 
sessions_spawn, sessions_yield

## Available Skills (6)
- clawhub: ClawHub CLI...
- coding-agent: Delegate coding tasks...
- healthcheck: Host security...
- node-connect: Diagnose OpenClaw...
- skill-creator: Create/edit skills...
- weather: Get weather via wttr.in...

## Runtime
agent=main | host=localhost | os=Linux | node=v25.8.1
model=zai/glm-5-turbo | channel=telegram | thinking=low
```

### Bootstrap Files (실제 내용 기반)
SOUL.md의 실제 내용을 보여줌:
```markdown
# SOUL.md - Who You Are
_You're not a chatbot. You're becoming someone._

## Core Truths
**Be genuinely helpful, not performatively helpful.**
**Have opinions.**
**Be resourceful before asking.**
...
```

AGENTS.md의 핵심 규칙을 보여줌:
```markdown
## Session Startup
1. Read SOUL.md
2. Read USER.md
3. Read memory/YYYY-MM-DD.md
4. If MAIN SESSION: Read MEMORY.md

## Memory
- Daily: memory/YYYY-MM-DD.md
- Long-term: MEMORY.md (DM only!)
```

### Tool Schema (실제 JSON 구조)
```json
{
  "name": "web_search",
  "description": "Search the web...",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string"},
      "count": {"type": "number", "maximum": 10},
      "freshness": {"type": "string"}
    }
  }
}
```

### Session History (시뮬레이션 대화)
```
User: 날씨 알려줘
Assistant: [thinking] 날씨 질문 → 검색 필요
Assistant: [tool_call] web_search("서울 날씨")
Tool Result: {"temp": 15, "condition": "맑음"}
Assistant: 내일 서울은 맑음, 15°C입니다.
```

---

## 📊 하단: Context Window Monitor

### 실시간 게이지
```
Context Window: 28,450 / 32,000 토큰 (89%)
[████████████████████░░░] 89%

구성:
  System Prompt:  3,842토큰 (13.5%)  ████░░░░░░
  Bootstrap:      5,976토큰 (21.0%)  ██████░░░░
  Tool Schemas:   7,997토큰 (28.1%)  ████████░░
  Skills List:      546토큰 ( 1.9%)  █░░░░░░░░░
  Session:        8,456토큰 (29.7%)  ████████░░
  Tool Results:   1,633토큰 ( 5.7%)  ██░░░░░░░░

⚠️ Reserve: 3,550토큰 (11%)
```

- 각 항목을 클릭하면 해당 레이어로 스크롤
- 80% 초과: 노란색 경고
- 90% 초과: 빨간색 + "Compaction imminent" 경고

### Context 타임라인 (시뮬레이션 진행 중)
```
T+0s   ████░░░░░░ 9,600  (System Prompt + Bootstrap)
T+1s   █████░░░░░ 9,620  (+User Message)
T+2s   █████░░░░░ 9,620  (LLM thinking...)
T+3s   ██████░░░░ 9,770  (+Tool Result)
T+4s   ███████░░░ 9,900  (+Assistant Reply)
T+5s   ███████░░░ 9,900  (Persisted to JSONL)
```

---

## 🎬 시각 효과

### Context 변화 애니메이션
- 새 항목 추가: 위에서 슬라이드 다운 + fadeIn
- 툴 결과 추가: 오른쪽에서 슬라이드 인
- Compaction: 줄들이 위로 합쳐지며 사라짐 (10줄 → 1줄)
- Memory Flush: 노란색 펄스 + "💾 기록 중..." 표시

### Agent Loop 시각화
컨텍스트 스택 아래에 작은 다이어그램:
```
     ┌─────┐
     │ LLM │ ← 현재 활성 (밝은 글로우)
     └──┬──┘
   ┌────┴────┐
   ▼         ▼
[Tool]    [Reply]
```

LLM → Tool → LLM 루프가 실시간으로 반복됨을 보여줌.

### Bootstrap Files 트리 구조
```
📁 Project Context
├── 📄 SOUL.md        912 chars  ✅ injected
├── 📄 AGENTS.md    1,742 chars  ✅ injected
├── 📄 TOOLS.md    54,210 chars  ⚠️ TRUNCATED → 20,962
├── 📄 IDENTITY.md    211 chars  ✅ injected
├── 📄 USER.md        388 chars  ✅ injected
├── 📄 HEARTBEAT.md 1,158 chars  ✅ injected
└── 📄 BOOTSTRAP.md      N/A    🚫 missing
```

잘린 파일은 주황색, 누락은 빨간색, 정상은 초록색.

---

## 🔄 Compaction 시각화 (시나리오 3 전용)

```
[Compaction Before]
├── User: 안녕 (턴 1)
├── Assistant: 안녕하세요 (턴 1)
├── User: 날씨? (턴 2)
├── Assistant: 맑습니다 (턴 2)
├── User: 뭐해? (턴 3)
├── Assistant: 코딩 중 (턴 3)
├── User: 게임 만들어줘 (턴 4)
├── Assistant: 어떤 게임? (턴 4)
├── User: 고스톱 (턴 5)
└── Assistant: PRD 작성 중... (턴 5)
         ⬇️ 압축! ⬇️
[Compaction After]
├── 📋 Summary: 사용자가 인사를 나누고 날씨를 물었으며,
│   코딩 중이고 고스톱 게임 제작을 요청함.
│   Agent는 고스톱 PRD 작성을 시작함.
├── User: 고스톱 (턴 5) ← 최근 대화 유지
└── Assistant: PRD 작성 중... (턴 5) ← 최근 대화 유지
```

---

## 🧪 Memory System 시각화

### Memory Flush 패널
```
💾 Memory Flush (Compaction 전)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Session nearing compaction. Store durable memories now."

📝 에이전트가 기록:
memory/2026-03-18.md:
  - 고스톱 v7 완료 (2,958줄)
  - Visualizer v4 완료 (3,196줄)
  - 랄프톤 Phase Split 전략 성공

MEMORY.md (DM only):
  - 랄프톤 핵심 교훈 5가지 업데이트
```

### Vector Search 시각화
memory_search("고스톱") 결과:
```
🔍 검색: "고스톱"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Results (BM25 + Vector Hybrid):

1. memory/2026-03-17.md#45 (score: 0.89)
   "맞고 고스톱 v7 최종 완성판: v4 기반..."

2. memory/2026-03-18.md#12 (score: 0.72)
   "고스톱 v7: 91KB, 2,958줄, Claude 실행..."

3. MEMORY.md#34 (score: 0.65)
   "랄프톤 성공: v4(2,637줄) 기반으로 v7(2,958줄)"
```

---

## ⚙️ 설정

- 시뮬레이션 속도 (0.5x/1x/2x)
- 모델 선택 (GLM-5 / Claude / GPT-4o) → Context Window 크기 변경
- 한국어/English 전환
- 다크/라이트 테마

---

## ✅ 체크리스트

- [ ] Context Stack 레이아웃 (좌측)
- [ ] Detail Panel (우측) - 코드 에디터 스타일
- [ ] Bootstrap Files 트리 구조
- [ ] Tool Schema JSON 뷰어
- [ ] Context Window Monitor 게이지 (하단)
- [ ] 구성 비례 바 (System/Bootstrap/Tools/Session)
- [ ] 시나리오 1: 간단 질문 (6단계)
- [ ] 시나리오 2: 이미지 분석 (첨부파일 토큰)
- [ ] 시나리오 3: Compaction 발생 (10단계)
- [ ] Agent Loop 다이어그램
- [ ] Context 변화 애니메이션 (추가/삭제/압축)
- [ ] Compaction 시각화 (합치기 효과)
- [ ] Memory Flush 패널
- [ ] Vector Search 결과 시각화
- [ ] Context 타임라인
- [ ] 잘림/누락 상태 표시
- [ ] 설정 (속도/모델/언어/테마)
- [ ] 반응형 디자인
- [ ] 한국어 UI
- [ ] 순수 HTML/CSS/JS (외부 라이브러리 금지)

---

## 🚫 구현하지 말 것
- WebSocket 실시간 연동 (이 버전은 시뮬레이션만)
- 복잡한 3D 그래픽
- Web Audio 효과음 (필요시 Phase 2)

---

## ⏱️ 타임아웃: 60분
