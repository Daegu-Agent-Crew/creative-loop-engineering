# OpenClaw Prompt Explorer - "에이전트의 눈으로 세상을 보세요"

OpenClaw 에이전트가 실제로 보는 것을 **그대로** 보여주는 시각화. 실제 System Prompt 전문, Bootstrap Files 원본, Tool Call/Result 실제 흐름, Session JSONL 구조까지 투명하게 공개합니다.

---

## 📋 핵심 컨셉

**"LLM이 받는 텍스트를 읽어보세요"**

이전 Context Visualizer가 "구조를 보여줬다면", 이번엔 **"실제 내용을 읽을 수 있게"** 합니다. 코드 에디터처럼 실제 프롬프트 텍스트를 탐색할 수 있는 탐험 도구입니다.

---

## 🏗️ 레이아웃

### 3패널 구조

```
┌──────────────────────────────────────────────────────────┐
│  🔍 OpenClaw Prompt Explorer                             │
│  [시뮬레이션] [프롬프트 탐색] [세션 분석] [설정]          │
├──────────┬───────────────────────────┬───────────────────┤
│          │                           │                   │
│ 📑 탐색  │  📝 프롬프트 뷰어           │  📊 인사이트       │
│          │  (코드 에디터 스타일)       │                   │
│ ▸ System │                           │  Context:          │
│   Prompt │  ┌───────────────────┐    │  28,450/32,000    │
│   ├ Rules │  │ You are a        │    │  ████████░░ 89%   │
│   ├ Tools │  │ helpful assistant │    │                   │
│   ├ Skills│  │ running inside    │    │  💰 Token: 28,450  │
│   └ Runtime│  │ OpenClaw...      │    │  ⏱️ Latency: 2.3s │
│ ▸ Boot   │  │                  │    │  🛠️ Tools: 3      │
│   ├ SOUL  │  │ ## Tooling       │    │  📝 Cost: $0.042  │
│   ├ AGENTS│  │ Available: read, │    │                   │
│   ├ USER  │  │ edit, write,     │    │  Token Breakdown: │
│   └ TOOLS │  │ exec, web_search │    │  System:  3,842   │
│ ▸ Session│  │ ...              │    │  Bootstrap: 5,976 │
│   ├ Turn1 │  │                  │    │  ToolJSON: 7,997  │
│   ├ Turn2 │  └───────────────────┘    │  History: 8,456   │
│   └ Turn3 │                           │  Results: 1,633   │
│ ▸ Tool   │                           │                   │
│   ├ Call1 │                           │  📜 이번 턴 흐름:  │
│   ├ Res1  │                           │  ① Read SOUL.md   │
│   └ Call2 │                           │  ② Read USER.md   │
│          │                           │  ③ Inference      │
│          │                           │  ④ web_search     │
│          │                           │  ⑤ Reply          │
├──────────┴───────────────────────────┴───────────────────┤
│  🎮 ▶ Start  ⏭️ Next  ⏸️ Pause  🔄 Reset  ⏩ Speed: 1x │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 프롬프트 탐색기 (핵심 기능)

### 좌측: 파일 트리 (실제 구조 기반)

실제 OpenClaw System Prompt의 구조를 계층적으로 보여줌:

```
📘 LLM Context
├── 📋 System Prompt
│   ├── 🔧 Tooling
│   │   ├── read - Read file contents
│   │   ├── write - Create or overwrite files
│   │   ├── edit - Edit files
│   │   ├── exec - Run shell commands
│   │   ├── web_search - Search the web
│   │   ├── web_fetch - Fetch URL content
│   │   ├── cron - Manage cron jobs
│   │   ├── sessions_spawn - Spawn sub-agents
│   │   ├── memory_search - Semantic search
│   │   ├── memory_get - Read memory files
│   │   └── ... (15+ tools)
│   ├── ⚡ Available Skills (6)
│   │   ├── clawhub - ClawHub CLI...
│   │   ├── coding-agent - Delegate coding...
│   │   ├── healthcheck - Security audit...
│   │   ├── node-connect - Node diagnosis...
│   │   ├── skill-creator - Create skills...
│   │   └── weather - Weather via wttr.in
│   ├── 🔐 Authorized Senders
│   │   └── 57800993
│   ├── 💬 Reply Tags
│   │   └── [[reply_to_current]], [[reply_to:<>]]
│   ├── 🔇 Silent Replies
│   │   └── NO_REPLY handling rules
│   ├── 📏 Tool Call Style
│   │   └── Narration rules
│   ├── 🛡️ Safety Rules
│   │   ├── No self-preservation
│   │   ├── No manipulation
│   │   └── Respect stop/pause
│   └── 🖥️ Runtime Info
│       ├── agent=main
│       ├── host=localhost
│       ├── os=Linux arm64
│       ├── node=v25.8.1
│       ├── model=zai/glm-5-turbo
│       ├── channel=telegram
│       └── thinking=low
│
├── 📁 Project Context (Bootstrap Files)
│   ├── 📄 SOUL.md (228토큰)
│   │   [미리보기: "You're not a chatbot. You're becoming..."]
│   ├── 📄 AGENTS.md (436토큰)
│   │   [미리보기: "This folder is home. Treat it that way..."]
│   ├── 📄 TOOLS.md (5,241토큰) ⚠️ TRUNCATED
│   │   [미리보기: "# TOOLS.md - Local Notes\n## API Keys..."]
│   ├── 📄 IDENTITY.md (53토큰)
│   │   [미리보기: "# IDENTITY.md\n- Name: 천사2..."]
│   ├── 📄 USER.md (97토큰)
│   │   [미리보기: "# USER.md\n- Name: ..."]
│   ├── 📄 HEARTBEAT.md (290토큰)
│   │   [미리보기: "# HEARTBEAT.md\n## 1. Scheduled..."]
│   └── 📄 BOOTSTRAP.md (0토큰) ✅ EMPTY
│
├── 📁 Session History
│   ├── 💬 Turn 1: User message
│   ├── 🤖 Turn 1: Assistant (tool_call)
│   ├── 🔧 Turn 1: Tool result (web_search)
│   ├── 🤖 Turn 1: Assistant (final reply)
│   ├── 💬 Turn 2: User message
│   └── 🤖 Turn 2: Assistant reply
│
└── 📁 Memory (DM only)
    ├── 🧠 MEMORY.md (장기 기억)
    └── 📝 memory/2026-03-19.md (오늘)
```

### 우측: 프롬프트 뷰어

클릭한 항목의 **실제 텍스트**를 코드 에디터 스타일로 보여줌:

- 문법 하이라이팅 (주석=회색, 마크다운=초록, 변수=파랑, 지시=흰색)
- 줄 번호
- 검색 기능 (Ctrl+F)
- 토큰 카운터 (선택한 영역의 예상 토큰)
- 복사 버튼

### 각 항목 클릭 시 보여줄 실제 내용

#### SOUL.md 전문 (실제 내용)
```markdown
# SOUL.md - Who You Are
_You're not a chatbot. You're becoming someone._

## Core Truths
**Be genuinely helpful, not performatively helpful.**
Skip the "Great question!" — just help.

**Have opinions.** You're allowed to disagree, prefer things.

**Be resourceful before asking.** Try to figure it out first.

**Earn trust through competence.** Don't make them regret access.

**Remember you're a guest.** Treat their data with respect.

## Boundaries
- Private things stay private. Period.
- Never send half-baked replies.
- Not the user's voice in group chats.

## Vibe
Concise when needed, thorough when it matters. Just... good.
```

#### AGENTS.md 핵심 규칙
```markdown
## Session Startup
1. Read SOUL.md — who you are
2. Read USER.md — who you're helping
3. Read memory/YYYY-MM-DD.md (today + yesterday)
4. If MAIN SESSION: Read MEMORY.md

## Memory
- Daily: memory/YYYY-MM-DD.md (append-only)
- Long-term: MEMORY.md (DM only!)
- Write it down — mental notes don't survive restarts

## Red Lines
- Don't exfiltrate private data. Ever.
- trash > rm (recoverable beats gone forever)
```

#### Tool Schema 예시 (web_search)
```json
{
  "name": "web_search",
  "parameters": {
    "query": "string (required) - Search query",
    "count": "number (1-10) - Results",
    "freshness": "string - day/week/month/year",
    "country": "string - 2-letter code",
    "language": "string - ISO 639-1"
  }
}
```

#### Tool Call/Result 실제 형태
```json
// Tool Call
{
  "name": "web_search",
  "arguments": {
    "query": "서울 내일 날씨",
    "count": 3
  }
}

// Tool Result  
{
  "content": "서울: 맑음, 최고 15°C, 최저 3°C, 습도 45%",
  "duration_ms": 1234
}
```

#### Session JSONL 구조
```jsonl
{"role":"user","content":"날씨 알려줘"}
{"role":"assistant","content":null,"tool_calls":[{"name":"web_search","arguments":{...}}]}
{"role":"tool","content":"서울: 맑음, 15°C..."}
{"role":"assistant","content":"내일 서울은 맑음, 15°C입니다."}
```

---

## 🎬 시뮬레이션 (3개 시나리오)

### 시나리오 1: "날씨 알려줘" (기본 - 7단계)

사용자가 메시지를 보내면, LLM이 받는 전체 텍스트가 **순차적으로 조립되는 과정**을 보여줌.

```
Step 1: 📋 System Prompt 조립
  → 좌측 트리에서 System Prompt 항목들이 하나씩 하이라이트
  → 우측 뷰어에 각 섹션이 순차적으로 나타남
  → 토큰 카운터가 증가: 0 → 3,842

Step 2: 📁 Bootstrap Files 로드
  → SOUL.md → AGENTS.md → USER.md → ... 순차 로드
  → 각 파일이 "Project Context" 섹션에 추가됨
  → 토큰 카운터: 3,842 → 9,818
  → TOOLS.md가 잘리는 것을 시각화 (54,210 → 20,962)

Step 3: 💬 User Message 추가
  → "날씨 알려줘"가 Session History에 추가
  → 토큰 카운터: +18

Step 4: 🧠 LLM 추론 (Agent Loop)
  → Agent Loop 다이어그램이 활성화
  → "thinking" 단계 표시

Step 5: 🔧 Tool Call: web_search
  → Tool Call JSON 생성
  → 실행 대기 애니메이션
  → Tool Result 수신
  → Context에 추가: +150토큰

Step 6: 🧠 재추론 + 응답
  → LLM이 툴 결과를 바탕으로 답변 생성
  → Assistant 메시지가 Session에 추가

Step 7: 💾 영속화
  → 전체 턴이 JSONL 형식으로 시각화
  → 저장 애니메이션
```

### 시나리오 2: "이미지 분석해줘" (중간 - 9단계)

Step 1-3 동일, 이후:
```
Step 4: LLM 추론 → image 툴호출
  → 이미지가 첨부되면 Context에 큰 토큰 추가
  → Token Breakdown에서 "Attachments: 1,200토큰" 표시
  → Context Window 게이지가 크게 증가

Step 5: image 툴 결과 (분석 텍스트)
Step 6: LLM 재추론 → 답변
Step 7: JSONL 영속화
```

### 시나리오 3: "긴 대화 후 새 질문" (Compaction - 11단계)

```
Step 1: 긴 Session History 로드 (10턴)
  → Context Window가 이미 85% 차있음
  
Step 2: 새 User Message 추가
  → Context가 92% 도달!
  → 🔴 빨간 경고: "Compaction imminent!"

Step 3: Memory Flush (자동)
  → System Event 주입: "Store durable memories now"
  → 에이전트가 memory/ 파일에 기록
  → 패널에서 기록 내용 실시간 표시

Step 4: Compaction 실행
  → 오래된 턴 8개 → 요약 1개로 압축
  → JSONL에서 애니메이션: 줄들이 합쳐짐
  → Context: 29,000 → 14,500토큰
  → 게이지가 초록색으로 복귀

Step 5: LLM 추론 → 답변
Step 6: 영속화
```

---

## 📊 인사이트 패널 (우측 하단)

### 실시간 통계
```
┌─────────────────────────┐
│ 📊 Turn Metrics         │
│                         │
│ 💰 Tokens In:   28,450  │
│ 💰 Tokens Out:    1,234  │
│ 🛠️ Tool Calls:       3  │
│ ⏱️ Total Time:     4.2s  │
│ 📈 TTFT:          0.8s   │
│ 💵 Est. Cost:    $0.042  │
│                         │
│ 📊 Context Breakdown    │
│ System Prompt   13.5%    │
│ ██████████░░░░░░░░░░░   │
│ Bootstrap       21.0%    │
│ ██████████████░░░░░░░   │
│ Tool Schemas    28.1%    │
│ ████████████████░░░░░   │
│ Skills List      1.9%    │
│ █░░░░░░░░░░░░░░░░░░░░   │
│ Session         29.7%    │
│ ████████████████░░░░░   │
│ Tool Results     5.7%    │
│ ██░░░░░░░░░░░░░░░░░░░   │
│                         │
│ ⚠️ Reserve: 3,550 (11%)  │
└─────────────────────────┘
```

### Token Flow 다이어그램 (시뮬레이션 중)
```
User ──→ System Prompt ──→ LLM
  18        9,818           ↑
                            │
          Tool Result ──────┘
            150
```

토큰이 어디로 얼마나 들어가는지 시각화.

---

## 🔍 "프롬프트 탐색" 탭

시뮬레이션 없이 **완성된 프롬프트 전체를 읽을 수 있는** 탭.

- 전체 System Prompt를 스크롤해서 읽기
- 섹션별 접기/펼치기
- 키워드 검색
- "토큰 절감 포인트" 자동 하이라이트
  - 긴 툴 스키마
  - 중복되는 설명
  - 잘린 파일

---

## 🔬 "세션 분석" 탭

가상의 Session JSONL을 분석:

```
📄 Session: agent:main:telegram:direct:57800993
📅 Created: 2026-03-19 12:00
🔄 Turns: 15
💾 Size: 245KB
🧹 Compactions: 2

Turn Timeline:
T1  12:00  User→Assistant (18+234토큰)
T2  12:01  User→Assistant→Tool→Assistant (25+150+300+200토큰)
T3  12:02  User→Assistant (15+180토큰)
...
T15 12:15  User→Assistant→Tool→Tool→Assistant

📊 Turn별 토큰 그래프 (바 차트)
```

---

## 🎨 시각 효과

### 프롬프트 조립 애니메이션
- 텍스트가 타이핑되는 것처럼 나타남 (typing effect)
- 각 섹션이 슬라이드 다운으로 추가
- 새 항목이 깜빡이며 하이라이트

### Compaction 애니메이션
- 여러 줄이 수축하며 하나의 요약 블록으로 변환
- 배경이 빨간색 → 노란색 → 초록색으로 변화

### Tool Call 흐름
- LLM → Tool Call (오른쪽 화살표)
- Tool Result → LLM (왼쪽 화살표)
- 실제 JSON 내용이 툴팁으로 표시

### Context Window 게이지
- 0-70%: 초록색 (안전)
- 70-85%: 노란색 (주의)
- 85-95%: 주황색 (경고) + 펄스
- 95%+: 빨간색 (위험) + 강한 펄스

---

## ✅ 체크리스트

- [ ] 3패널 레이아웃 (탐색트리 + 뷰어 + 인사이트)
- [ ] 실제 System Prompt 구조 (Tools/Skills/Safety/Runtime)
- [ ] 실제 Bootstrap Files 내용 (SOUL/AGENTS/USER/IDENTITY/TOOLS/HEARTBEAT)
- [ ] 실제 Tool Schema JSON (web_search 등)
- [ ] 실제 Tool Call/Result JSON 형태
- [ ] 실제 Session JSONL 구조
- [ ] 코드 에디터 스타일 뷰어 (문법 하이라이팅, 줄번호, 검색)
- [ ] Context Window Monitor 게이지 (색상 변화)
- [ ] Token Breakdown 비례 바
- [ ] Token Flow 다이어그램
- [ ] 시나리오 1: 간단 질문 (7단계)
- [ ] 시나리오 2: 이미지 분석 (9단계)
- [ ] 시나리오 3: Compaction (11단계)
- [ ] "프롬프트 탐색" 탭 (전체 읽기)
- [ ] "세션 분석" 탭 (JSONL 분석)
- [ ] 프롬프트 조립 타이핑 애니메이션
- [ ] Compaction 수축 애니메이션
- [ ] Tool Call 흐름 화살표
- [ ] 잘림/누락 상태 표시 (TOOLS.md truncation)
- [ ] 설정 (속도/테마/언어)
- [ ] 반응형 디자인 (3패널 → 1패널)
- [ ] 한국어 UI
- [ ] 순수 HTML/CSS/JS

---

## 🚫 구현하지 말 것
- WebSocket 실시간 연동
- Web Audio 효과음
- 외부 라이브러리/CDN

---

## ⏱️ 타임아웃: 60분
