# SwarmMind - 다중 에이전트 군집지성 예측 엔진

## 🎯 프로젝트 개요

**SwarmMind**는 MiroFish에서 영감을 받은 오픈소스 다중 에이전트 시뮬레이션 플랫폼입니다. 현실 세계의 시드 정보를 입력받아 수천 개의 AI 에이전트가 상호작용하며 창발적 현상을 시뮬레이션하고, 미래를 예측합니다.

### 핵심 가치

- **오픈소스**: 완전한 로컬 실행 가능, 벤더 락인 없음
- **모듈러**: 각 컴포넌트가 독립적으로 교체 가능
- **경량화**: 최소한의 의존성으로 동작
- **확장성**: 에이전트 수, 시뮬레이션 라운드 자유 조절

---

## 📦 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      SwarmMind Engine                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Seed Parser │→ │   Knowledge │→ │  Agent Orchestrator │  │
│  │             │  │    Graph    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   OASIS Simulation                       │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │ │
│  │  │Agent 1│ │Agent 2│ │Agent 3│ │  ...  │ │Agent N│     │ │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Report Generator                       │ │
│  │         (Sentiment, Narratives, Predictions)            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 핵심 컴포넌트

### 1. Seed Parser (`seed_parser.py`)
- 입력: 텍스트, 뉴스, 정책 문서, 시나리오
- 출력: 구조화된 시드 데이터 (entities, events, context)

### 2. Knowledge Graph (`knowledge_graph.py`)
- GraphRAG 기반 지식 그래프 구축
- 엔티티 간 관계 추출
- 시계열 메모리 관리

### 3. Agent Orchestrator (`orchestrator.py`)
- 에이전트 스폰 (다양한 archetypes)
- 시뮬레이션 라운드 관리
- 에이전트 간 메시지 라우팅

### 4. Agent Archetypes (`agents/`)
- **Analyst**: 데이터 기반, 객관적 분석
- **Skeptic**: 비판적 사고, 반론 제기
- **Expert**: 도메인 전문 지식
- **Journalist**: 이야기 중심, 영향력 분석
- **Activist**: 감정적 강도, 옹호
- **Policymaker**: 규제 관점, 리스크 회피
- **Optimist**: 긍정적 시나리오
- **Pessimist**: 부정적 시나리오

### 5. Simulation Engine (`simulation.py`)
- 멀티 라운드 시뮬레이션
- 창발적 행동 모니터링
- 상태 스냅샷

### 6. Report Generator (`reporter.py`)
- 감정 분포 분석
- 주요 내러티브 추출
- 신흥 트렌드 식별
- 예측 신뢰도 점수

---

## 📁 프로젝트 구조

```
swarm-mind/
├── README.md
├── requirements.txt
├── pyproject.toml
├── .env.example
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── main.py
│   ├── cli.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── seed_parser.py
│   │   ├── knowledge_graph.py
│   │   ├── orchestrator.py
│   │   └── simulation.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── analyst.py
│   │   ├── skeptic.py
│   │   ├── expert.py
│   │   ├── journalist.py
│   │   ├── activist.py
│   │   ├── policymaker.py
│   │   └── profiles.py
│   ├── memory/
│   │   ├── __init__.py
│   │   ├── graph_memory.py
│   │   └── temporal_memory.py
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── provider.py
│   │   └── prompts.py
│   └── report/
│       ├── __init__.py
│       ├── analyzer.py
│       └── generator.py
├── tests/
│   ├── __init__.py
│   ├── test_seed_parser.py
│   ├── test_agents.py
│   └── test_simulation.py
├── examples/
│   ├── basic_prediction.py
│   ├── market_simulation.py
│   └── policy_analysis.py
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── EXAMPLES.md
```

---

## 🚀 MVP 기능 (Phase 1)

### 필수 기능
1. ✅ CLI 인터페이스
2. ✅ 시드 텍스트 파싱
3. ✅ 기본 에이전트 스폰 (4종류)
4. ✅ 싱글 라운드 시뮬레이션
5. ✅ 간단한 보고서 생성

### 기술 스택 (MVP)
- Python 3.11+
- OpenAI SDK 호환 LLM (로컬/클라우드)
- NetworkX (지식 그래프)
- Rich (CLI 출력)

---

## 📈 향후 확장 (Phase 2+)

- [ ] 웹 UI (FastAPI + React)
- [ ] 멀티노드 분산 시뮬레이션
- [ ] 실시간 스트리밍 결과
- [ ] 커스텀 에이전트 archetype
- [ ] RAG 통합 (ChromaDB/Qdrant)
- [ ] 시각화 대시보드

---

## 🎮 사용 예시

### CLI
```bash
# 기본 예측
swarm-mind predict "AI 규제가 2025년에 통과될까?"

# 시뮬레이션 실행
swarm-mind simulate \
  --seed "한국 부동산 시장 전망" \
  --agents 50 \
  --rounds 10 \
  --output report.md

# 대화형 모드
swarm-mind chat --world ./simulations/real-estate
```

### Python API
```python
from swarm_mind import SwarmMind

# 엔진 초기화
engine = SwarmMind(
    llm_provider="openai",
    model="gpt-4o-mini"
)

# 시뮬레이션 실행
result = engine.predict(
    seed_text="비트코인이 2025년에 10만 달러를 돌파할까?",
    num_agents=30,
    rounds=5
)

# 결과 출력
print(result.sentiment_distribution)
print(result.top_narratives)
print(result.prediction_report)
```

---

## 🔒 환경 변수

```env
# LLM 설정
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4o-mini

# 선택적 설정
LOG_LEVEL=INFO
MAX_AGENTS=500
DEFAULT_ROUNDS=10
```

---

## 📊 예상 결과물

### 감정 분포
```json
{
  "positive": 45,
  "negative": 30,
  "neutral": 25
}
```

### 주요 내러티브
1. "기술 발전이 규제를 앞서갈 것"
2. "글로벌 표준화 압력 증가"
3. "산업계 로비가 지연 요인"

### 예측 보고서
```markdown
## Executive Summary

본 시뮬레이션은 50개의 다양한 관점을 가진 에이전트가
10라운드 동안 상호작용한 결과를 분석합니다...

## Key Predictions
- 2025년 AI 규제 통과 확률: 67%
- 주요 변수: 미국-중국 기술 경쟁
...
```
