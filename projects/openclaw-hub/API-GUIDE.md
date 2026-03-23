# OpenClaw Hub 실제 연동 가이드

## Gateway API 엔드포인트

### 1. Tools Invoke API (HTTP)
```
POST http://127.0.0.1:18789/tools/invoke
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "tool": "<tool_name>",
  "action": "json",
  "args": {},
  "sessionKey": "main"
}
```

### 2. OpenAI Chat Completions API
```
POST http://127.0.0.1:18789/v1/chat/completions
Authorization: Bearer <token>

Request:
{
  "model": "openclaw:main",
  "messages": [{"role": "user", "content": "hello"}],
  "stream": true  // optional SSE
}
```

### 3. WebSocket Protocol
```
ws://127.0.0.1:18789/ws
프로토콜 v3, JSON text frames

Handshake:
1. Server → Client: connect.challenge (nonce, ts)
2. Client → Server: connect (auth token, role, scopes)
3. Server → Client: hello-ok (protocol, policy)
```

## 사용 가능한 툴 (tools/invoke)

| 툴명 | 용도 | args |
|------|------|------|
| sessions_list | 세션 목록 | {limit, activeMinutes, kinds} |
| sessions_history | 세션 히스토리 | {sessionKey, limit, includeTools} |
| session_status | 세션 상태/비용 | {sessionKey} |
| cron | 크론 잡 관리 | {action: "list"/"add"/"remove"/"run"} |
| memory_search | 메모리 검색 | {query, maxResults} |
| memory_get | 메모리 읽기 | {path, from, lines} |
| subagents | 서브에이전트 관리 | {action: "list"} |

## 인증

```bash
# 토큰 확인
cat ~/.openclaw/openclaw.json | python3 -c "import json,sys; print(json.load(sys.stdin)['gateway']['auth']['token'])"

# HTTP 테스트
TOKEN=<token>
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tool":"sessions_list","args":{}}' \
  http://127.0.0.1:18789/tools/invoke
```

## CORS 문제

file:// 프로토콜에서는 API 호출 불가.
해결: cloudflared로 같은 origin 서빙.

```bash
# 1. Hub가 있는 디렉토리에서 HTTP 서버 실행
python3 -m http.server 8080

# 2. Cloudflare Tunnel로 공개 (CORS 해결됨)
cloudflared tunnel --url http://localhost:8080
```

## 실제 응답 예시

### sessions_list 응답
```json
{
  "key": "agent:main:main",
  "model": "glm-5-turbo",
  "contextTokens": 131072,
  "totalTokens": 10995,
  "sessionId": "bf783367-...",
  "transcriptPath": "/home/.openclaw/agents/main/sessions/....jsonl"
}
```

## 보안 주의사항
- tools/invoke HTTP 엔드포인트는 full operator access
- 토큰을 브라우저에 저장시 private network에서만 사용
- 공개 인터넷에 직접 노출 금지
