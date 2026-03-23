# OpenClaw Agent Core 연구 자료 (PRD 첨부용)

## 아키텍처 개요

OpenClaw는 단일 Node.js 프로세스에서 "One Process, Five Subsystems"로 동작:

1. **Channel Adapters**: TG/DC/WA/Slack/Email/Webhook 메시지 변환
2. **Session Manager**: Context window 관리, 직렬화, JSONL 저장
3. **Queue**: 수신-실행 분리, 순서보장, Exactly-once
4. **Agent Runtime (pi-mono)**: LLM 추론 + 툴호출 루프 (핵심!)
5. **Tool Policy Pipeline**: 허가/거부/샌드박스 검사

## Agent Loop (에이전트 루프)

```
메시지 수신 → Context Assembly → Model Inference → Tool Call? 
  → YES: Tool Execution → 결과 추가 → 다시 추론
  → NO: Final Reply → Streaming → 채널 전송 → Persistence
```

세션 레인 직렬화: 한 세션에 한 번에 하나의 턴만 실행 (레이스 컨디션 방지)

## Context Assembly (컨텍스트 조립)

System Prompt + Bootstrap Files + Skills List + Tool Schemas + Session History

### Bootstrap Files
- SOUL.md (인격, 톤)
- AGENTS.md (동작 규칙)
- IDENTITY.md (이름, 이모지)
- USER.md (사용자 정보)
- TOOLS.md (툴 가이드)
- HEARTBEAT.md (하트비트 체크리스트)
- BOOTSTRAP.md (최초 1회만)

MEMORY.md는 메인 세션(개인 DM)에서만 로드!

큰 파일은 bootstrapMaxChars(20,000자)로 자동 잘림.

## Context Window 구성

System Prompt (~9,600토큰) + Tool Schemas (JSON, ~8,000토큰+) + 대화 기록 + 툴호출 결과 + 첨부파일

## Compaction (압축)

윈도우 꽉 차면: 오래된 대화 → 요약 하나로 압축, 최근 대화 유지
압축 전 자동 메모리 플러시: "기억해!" → 에이전트가 MEMORY.md에 기록

## Memory System

- 일일 로그: memory/YYYY-MM-DD.md (append-only)
- 장기 기억: MEMORY.md (큐레이션)
- memory_search: BM25 + Vector 하이브리드 검색
- memory_get: 파일 직접 읽기
- 임베딩: openai/gemini/voyage/local 자동 선택

## Tool Execution

LLM → tool_call(JSON) → 검증 → 실행 → 결과 → LLM → (반복)
Hook: before_tool_call / after_tool_call / tool_result_persist

## Plugin Hooks (생명주기)

gateway_start → session_start → message_received → before_model_resolve → before_prompt_build → before_agent_start → [Agent Loop] → agent_end → message_sent → session_end → gateway_stop

## Multi-Agent

한 Gateway에서 여러 에이전트 (각자 워크스페이스/세션/인격 독립)
라우팅: peer.id → accountId → channel → 기본 에이전트

## 타임아웃

Agent Runtime: 600초, agent.wait: 30초, 압축: 자동
