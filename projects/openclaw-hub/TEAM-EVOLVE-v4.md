# Team Evolve - OpenClaw Hub v3 → v4 (실제 API 연동)

기존 index.html을 읽고 시뮬레이션 데이터를 실제 OpenClaw Gateway API로 교체하라.

## 기존 상태
- 파일: index.html (243KB, 8,414줄, 69/69 완벽)
- 현재: 모든 데이터가 시뮬레이션 (가짜)
- 목표: 실제 Gateway API 연동

## API 정보 (API-GUIDE.md 참고)

### Gateway 설정
- URL: http://127.0.0.1:18789
- Auth: Bearer Token (사용자 입력)
- Tools Invoke: POST /tools/invoke

### 사용 가능한 툴
- sessions_list → 세션 목록 (key, model, totalTokens, contextTokens, sessionId)
- session_status → 세션 상태/비용/시간
- sessions_history → 세션 메시지 히스토리 (role, content, toolCalls)
- cron (action:list) → 크론 잡 목록 (name, schedule, enabled, lastRun)
- memory_search → 메모리 검색 (query, results)

## 모듈 분할

### Teammate A: API 레이어 + 설정 화면
- OpenClawAPI 클래스 구현:
  ```javascript
  class OpenClawAPI {
    constructor(baseUrl, token) { ... }
    async invoke(tool, args) {
      // POST /tools/invoke with auth
    }
    async getSessions() { return this.invoke('sessions_list', {}); }
    async getSessionStatus(key) { return this.invoke('session_status', {sessionKey: key}); }
    async getHistory(key, limit) { return this.invoke('sessions_history', {sessionKey: key, limit}); }
    async getCrons() { return this.invoke('cron', {action: 'list'}); }
    async getMemory(query) { return this.invoke('memory_search', {query}); }
  }
  ```
- 연결 설정 화면:
  - Gateway URL 입력 (기본: http://127.0.0.1:18789)
  - Token 입력 (비밀번호 필드)
  - "연결 테스트" 버튼 (sessions_list 호출로 확인)
  - 설정 localStorage에 저장
  - 연결 성공 시: 모델명, 세션 수 표시
  - 연결 실패 시: 에러 메시지
- CORS 대응:
  - API 호출 실패 시 "직접 서버 실행" 안내
  - cloudflared 사용 안내 표시
- 출력: evolve-a.html

### Teammate B: Office + Workflows 영역 API 연동
- Office 영역:
  - 에이전트 상태를 sessions_list 실제 데이터로 교체
  - 에이전트 아바타 옆에 실제 모델명, totalTokens 표시
  - session_status로 실시간 비용/시간 업데이트 (10초 폴링)
  - 에이전트 클릭 → 실제 세션 히스토리 표시
- Workflows 영역:
  - cron list로 실제 크론 잡 목록 교체
  - 15개 가짜 데이터 대신 실제 크론 잡 표시
  - 크론 잡 없을 때: "설정된 크론 잡이 없습니다" 안내
  - 크론 잭 상태: enabled/disabled 실제 반영
  - 스케줄 타임라인에 실제 크론 스케줄 표시
- 시뮬 → 실제 전환 스위치:
  - 헤더에 "시뮬레이션 / 라이브" 토글
  - 시뮬 모드: 기존 가짜 데이터 (오프라인시 사용)
  - 라이브 모드: 실제 API 호출
- 출력: evolve-b.html

### Teammate C: Communication + Dashboard 영역 API 연동
- 채팅:
  - sessions_history로 실제 메시지 로드
  - 메시지에 role(assistant/user/system)에 따른 스타일
  - toolCalls가 있으면 툴콜 카드 인라인 표시
  - 채팅 전송은 /v1/chat/completions로 실제 에이전트 응답
  - 응답 스트리밍 (stream: true, SSE 파싱)
  - 로딩 인디케이터
- 툴콜 로그:
  - sessions_history (includeTools: true)로 실제 툴콜 표시
  - 툴명, 상태, 시간, 레이턴시 실제 데이터
- Dashboard:
  - session_status로 실제 토큰/비용/시간
  - sessions_list로 실제 세션 수
  - cron list로 실제 크론 잡 수
  - 차트에 실제 데이터 반영
- 알림:
  - API 에러 발생 시 토스트 알림
  - 연결 끊김 시 경고
  - 자동 재연결 시도 (5초 간격)
- 출력: evolve-c.html

## Rules
- 기존 69개 기능 모두 유지
- 시뮬레이션 모드도 유지 (오프라인 사용 가능)
- API 호출 실패 시 graceful fallback (시뮬 모드로 전환 안내)
- 각 팀원은 자기 모듈만 수정
- 코드량 8,000줄 이상 유지
- 완료 후 Lead가 index.html로 병합
- 순수 HTML/CSS/JS, 한국어 UI
