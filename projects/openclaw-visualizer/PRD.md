# OpenClaw Visualizer - RPG 던전 맵 스타일 에이전트 시각화

OpenClaw의 4페이즈 아키텍처를 RPG 던전 맵처럼 시각화하는 웹 대시보드

---

## 📋 개요

OpenClaw의 내부 구조(Node.js Gateway 단일 프로세스)를 RPG 게임 맵처럼 시각화.
메시지가 들어오면 4개의 페이즈를 거쳐 처리되는 전체 흐름을 애니메이션으로 보여줌.

---

## 🏰 OpenClaw 아키텍처 (4페이즈)

```
┌──────────────────────────────────────────────────────┐
│                  OPENCLAW DUNGEON MAP                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📱 CHANNEL    📱 CHANNEL    📱 CHANNEL              │
│  ┌──────┐     ┌──────┐     ┌──────┐                 │
│  │TG    │     │Discord│     │WA   │  ← ① INGESTION  │
│  └──┬───┘     └──┬───┘     └──┬───┘    Channel      │
│     └────────────┼────────────┘        Adapter       │
│                  ▼                                   │
│  ┌───────────────────────────────┐                   │
│  │     ② CONTROL PLANE          │                   │
│  │  ┌─────────┐ ┌────────────┐  │                   │
│  │  │ Message │ │   Access   │  │    ← ② Gateway   │
│  │  │ Router  │→│  Control   │  │       Core        │
│  │  └─────────┘ └────────────┘  │                   │
│  │  ┌─────────┐ ┌────────────┐  │                   │
│  │  │  Queue/ │ │ Heartbeat/ │  │                   │
│  │  │ Session │ │   Cron     │  │                   │
│  │  └─────────┘ └────────────┘  │                   │
│  └──────────────┬───────────────┘                   │
│                 ▼                                   │
│  ┌───────────────────────────────┐                   │
│  │     ③ AGENT CORE             │                   │
│  │  ┌───────────────────────┐   │                   │
│  │  │   🧠 Pi Runtime       │   │  ← ③ AI Engine   │
│  │  │  AGENTS.md + SOUL.md  │   │                   │
│  │  │  TOOLS.md + MEMORY   │   │                   │
│  │  │  call model → tools  │   │                   │
│  │  │  → feed back → repeat│   │                   │
│  │  └───────────┬───────────┘   │                   │
│  └──────────────┼───────────────┘                   │
│                 ▼                                   │
│  ┌───────────────────────────────┐                   │
│  │     ④ EXECUTE                │                   │
│  │  🔍Search 📁File ⚙️Exec     │  ← ④ Tools &     │
│  │  💾Memory 📨Msg  🌐MCP      │       Memory      │
│  └───────────────────────────────┘                   │
│                                                      │
├──────────────────────────────────────────────────────┤
│  📊 HP:100 MP:85 XP:1,234  🗡️툴호출:47  💰코스트:$0 │
└──────────────────────────────────────────────────────┘
```

---

## 🎮 RPG 게임화 요소

### 1. 던전 맵 뷰 (메인)
- **4개 층(Layer)**으로 구성된 던전
- 각 층은 OpenClaw의 4페이즈를 나타냄
- 메시지가 캐릭터(💡빛의구슬)가 되어 던전을 통과
- 캐릭터가 각 층을 지날 때 해당 노드가 활성화

### 2. 캐릭터 시스템
```
┌─────────────────────────┐
│  💡 메시지 (캐릭터)     │
│  ─────────────────────  │
│  ❤️ HP: 100/100         │
│  💙 MP: 85/100 (토큰)   │
│  ⭐ LV.7 에이전트        │
│  🗡️ 툴호출: 47회         │
│  🛡️ 스킬: 12개           │
│  💰 코스트: $0.00        │
│  ⏱️ 레이턴시: 1.2s       │
└─────────────────────────┘
```

### 3. 페이즈별 시각화

#### ① INGESTION 층 — "입구의 문"
- 채널 어댑터가 문지기 역할
- 텔레그램/디스코드/와트츠앱 문을 통과
- 메시지 정규화 애니메이션 (다양한 포맷 → 표준 포맷으로 변환)
- 플랫폼별 다른 색상의 문

#### ② CONTROL PLANE 층 — "지배자의 방"
- **Message Router**: 미로에서 길을 찾는 애니메이션
- **Access Control**: 보석으로 잠금/해제 (인증)
- **Queue/Session**: 대기줄 애니메이션 (메시지가 줄서서 기다림)
- **Heartbeat/Cron**: 심장 박동 애니메이션 + 타이머

#### ③ AGENT CORE 층 — "마법사의 탑"
- **Pi Runtime**: 마법진(마나서클)이 회전하며 추론
- **SOUL.md → 캐릭터 성격** (성격 카드 표시)
- **AGENTS.md → 행동 규칙** (룰북 아이콘)
- **MEMORY.md → 경험치/인벤토리** (가방 아이콘)
- **루프 애니메이션**: call model → execute tool → feed back → repeat
  - 마법진 중앙에서 빛이 순환

#### ④ EXECUTE 층 — "무기고 & 도서관"
- 툴들이 각각 방/전시물로 시각화
- **Search**: 🔍 돋보기 + 검색 결과 파티클
- **File I/O**: 📁 책장에서 책을 꺼내는 애니메이션
- **Exec**: ⚙️ 톱니바퀴 회전
- **Memory**: 💾 두루마리 펼치기
- **Message**: 📨 편지가 날아가는 애니메이션
- **MCP**: 🌐 포탈 연결

---

## 🎬 시뮬레이션 시나리오

### 시나리오 1: "날씨 알려줘" (초보 던전)
```
Phase ①: 💡 텔레그램 문으로 진입 (1초)
Phase ②: 💡 라우터가 길을 찾아 세션으로 안내 (0.5초)
Phase ③: 💡 마법진에서 추론 → "검색이 필요!" (2초)
Phase ④: 💡 검색 방에서 🔍 web_search 실행 (1초)
Phase ③: 💡 결과를 받아 마법진에서 응답 생성 (1.5초)
Phase ①: 💡 텔레그램 문으로 응답 전달 (0.5초)
→ 🎉 퀘스트 완료! XP +50, 툴호출 +1
```

### 시나리오 2: "랄프톤으로 게임 만들어줘" (보스 던전)
```
Phase ①: 💡 텔레그램 진입
Phase ②: 💡 세션 생성 → 큐잉
Phase ③: 💡 마법진 추론 (긴 thinking) → "여러 툴 필요!"
Phase ④: 💡 📁 read(PRD.md) → 📁 read(v4/index.html)
         💡 ⚙️ exec("claude --print ...") → ⏳ 대기 (보스전!)
         💡 📁 read(결과확인) → 📨 send(telegram, file)
Phase ③: 💡 응답 생성
Phase ①: 💡 결과 전달
→ 🏆 보스 클리어! XP +500, 툴호출 +8, 레벨업!
```

### 시나리오 3: "크론으로 리마인더 설정" (시간 던전)
```
Phase ①: 💡 진입
Phase ②: 💡 라우팅
Phase ③: 💡 추론 → memory_search + cron(add)
Phase ②: 💡 Heartbeat/Cron 노드에서 ⏰ 타이머 설정 애니메이션
... 시간 경과 애니메이션 (빠른 감속) ...
Phase ②: 💡 Cron 트리거! 심장 박동!
Phase ③: 💡 systemEvent 처리
Phase ①: 💡 알림 전송
→ ⏰ 타임어택 클리어!
```

---

## 🎨 UI 디자인

### 테마: "RPG 던전" (사이버펑크 + 판타지 하이브리드)
```css
/* 배경 - 던전 깊은 곳 */
background: linear-gradient(180deg, #0a0a2e 0%, #1a0a2e 25%, #0a1a1e 50%, #0a0a1e 75%, #000010 100%);

/* 층 구분 - 수평 그라데이션 */
.layer-ingestion  { border-top: 3px solid #4CAF50; }  /* 초록: 채널 */
.layer-control     { border-top: 3px solid #FF9800; }  /* 주황: 제어 */
.layer-agent       { border-top: 3px solid #9C27B0; }  /* 보라: AI */
.layer-execute     { border-top: 3px solid #00BCD4; }  /* 시안: 실행 */

/* 노드 */
.node {
  width: 130px; height: 70px;
  border-radius: 12px;
  background: rgba(255,255,255,.05);
  border: 2px solid rgba(0,255,255,.2);
  box-shadow: 0 0 15px rgba(0,255,255,.15);
  transition: all 0.3s;
}

.node.active {
  border-color: #00ffff;
  box-shadow: 0 0 40px rgba(0,255,255,.6);
  transform: scale(1.05);
  animation: glow-pulse 0.8s ease-in-out infinite;
}

/* 캐릭터 (메시지) */
.character {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #00ffff 40%, transparent 70%);
  box-shadow: 0 0 20px #00ffff, 0 0 40px rgba(0,255,255,.3);
}

/* 연결선 (던전 통로) */
.connection { stroke: rgba(0,255,255,.15); stroke-width: 3; }
.connection.active { stroke: rgba(0,255,255,.8); animation: flow 1s linear infinite; }
```

### 애니메이션 종류
- **캐릭터 이동**: 💡빛이 층을 따라 이동 (translateY + glow trail)
- **노드 활성화**: glow-pulse + scale(1.05) + border 밝아짐
- **마법진 (Pi Runtime)**: SVG 회전 + 중앙 빛 순환
- **툴 실행**: 노드에서 파티클 방출
- **큐잉**: 메시지가 줄서서 기다리는 스택 애니메이션
- **Heartbeat**: 심장 박동 (scale 1.0 → 1.1 → 1.0)
- **Cron 트리거**: 타이머가 0이 되면 폭발 + 플래시
- **에러**: 빨간색 플래시 + 화면 흔들림 + ⚠️ 아이콘
- **XP 획득**: +50 숫자가 위로 올라가며 사라짐
- **레벨업**: 🎆 화면 전체 이펙트

---

## 📐 주요 컴포넌트

### 1. DungeonMap - 4층 던전 맵
- SVG 기반 4층 구조
- 각 층의 노드와 연결선
- 캐릭터 이동 경로 애니메이션

### 2. CharacterStatus - 캐릭터 상태창
```
┌─────────────────────┐
│ 💡 메시지 #42       │
│ ❤️ HP: 100  💙 MP: 85│
│ ⭐ LV.7  🗡️ 툴: 47   │
│ 💰 $0.00  ⏱️ 1.2s    │
└─────────────────────┘
```

### 3. QuestLog - 툴 호출 타임라인
```
📜 퀘스트 로그:
  12:00:01 [① INGESTION] 텔레그램 수신
  12:00:02 [② ROUTER] 세션 routing...
  12:00:03 [③ AGENT] 🧠 Pi Runtime 추론 중...
  12:00:04 [④ EXECUTE] 🔍 web_search("날씨")
  12:00:05 [③ AGENT] 결과 처리...
  12:00:06 [① INGESTION] 응답 전송!
  → 🎉 XP +50 획득!
```

### 4. MiniMap - 전체 맵 미니맵
- 우측 상단에 작은 던전 전체도
- 현재 캐릭터 위치 표시
- 활성화된 층 하이라이트

### 5. StatsDashboard - 통계 대시보드
- 층별 처리 시간 바 차트
- 툴 사용 빈도 파이 차트
- 토큰/코스트 추이 라인 차트
- 세션 히트맵

### 6. InventoryBag - 인벤토리 (메모리)
- MEMORY.md → "경험치 기록"
- SOUL.md → "성격 카드"
- AGENTS.md → "행동 규칙서"
- TOOLS.md → "스킬 목록"
- daily logs → "일지"

---

## 🔗 라이브 모드

### WebSocket 연결 (openclaw-websocket)
```javascript
const ws = new WebSocket('ws://127.0.0.1:18800/ws?senderId=viz-app&senderName=Dashboard');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  switch(msg.type) {
    case 'chat.typing': moveCharacterToLayer('agent'); break;
    case 'chat.stream': animateMagicCircle(msg.content); break;
    case 'chat.response': completeQuest(msg.content); break;
    case 'chat.error': triggerErrorEffect(msg.content); break;
  }
};
```

### OpenAI-compatible API (18789)
시각화 앱에서 에이전트에 직접 메시지 전송 가능

### 모드 전환
- **시뮬레이션**: API 없이 3개 데모 시나리오 재생
- **라이브**: WebSocket으로 실시간 연결

---

## 📐 기술 요구사항

- **싱글 HTML 파일** (index.html)
- **외부 라이브러리 없음** (순수 HTML/CSS/JS + Canvas/SVG)
- **Web Audio API** 효과음
- **반응형 디자인**
- **한국어 UI**

---

## ✅ 체크리스트

- [ ] 싱글 index.html 파일
- [ ] DungeonMap - 4층 SVG 던전 맵
- [ ] 캐릭터(💡) 이동 애니메이션
- [ ] 4페이즈별 노드 활성화
- [ ] 마법진 (Pi Runtime) 회전 애니메이션
- [ ] CharacterStatus 상태창 (HP/MP/XP/툴호출)
- [ ] QuestLog 퀘스트 로그
- [ ] MiniMap 미니맵
- [ ] StatsDashboard 통계 차트
- [ ] InventoryBag 인벤토리
- [ ] 데모 시나리오 3개 (초보/보스/시간)
- [ ] 데모 자동 재생 + 수동 진행
- [ ] XP 획득/레벨업 이펙트
- [ ] 에러 플래시 + 흔들림
- [ ] Heartbeat 심장 박동 애니메이션
- [ ] Cron 타이머 트리거 애니메이션
- [ ] 사이버펑크+판타지 RPG 테마
- [ ] 효과음 (Web Audio)
- [ ] 반응형 디자인
- [ ] 한국어 UI
- [ ] 라이브 모드: WebSocket(18800)
- [ ] 라이브 모드: OpenAI API(18789)
- [ ] 모드 전환: 시뮬레이션 ↔ 라이브

---

## ⏱️ 타임아웃: 90분
