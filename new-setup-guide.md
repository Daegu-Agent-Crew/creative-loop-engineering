# OpenClaw 새 셋업 가이드 - 주인님과의 대화에서 추출한 핵심 지식

> 천사2가 주인님과 나눈 대화에서 새 OpenClaw 환경 설정에 필요한 핵심 지식을 정리했습니다.

---

## 1. 🏗️ Bootstrap Files 설정 (가장 중요!)

### 필수 파일들
```
workspace/
├── SOUL.md      → 에이전트 인격/톤 (간단하게)
├── AGENTS.md    → 동작 규칙 (기본 템플릿으로 충분)
├── IDENTITY.md  → 이름, 이모지, 아바타
├── USER.md      → 사용자 프로필
├── TOOLS.md     → API 키, 환경별 설정
├── HEARTBEAT.md → 비워두면 하트비트 스킵 (토큰 절약)
├── BOOTSTRAP.md → 최초 부트 후 삭제됨
├── MEMORY.md    → 장기 기억 (DM 세션만 로드!)
└── memory/      → 일일 로그 (YYYY-MM-DD.md)
```

### Bootstrap Files 동작 원리
- **매 세션 첫 턴에 자동 주입** (Project Context 섹션)
- **파일당 20,000자, 전체 150,000자 제한** (넘으면 자동 잘림)
- 없으면 마커 한 줄만, 비어있으면 스킵
- BOOTSTRAP.md는 최초 1회만, MEMORY.md는 DM 세션에서만 로드
- **HEARTBEAT.md 비어있으면 하트비트 API 호출을 아예 스킵함** (토큰 절!)

### ⚠️ TOOLS.md 주의
- TOOLS.md가 54KB였을 때 5,241토큰을 차지하고 잘림
- **가능하면 TOOLS.md는 짧게 유지할 것**
- API 키만 넣고, 긴 가이드는 스킬에 위임

### HEARTBEAT.md 설정 팁
- 복잡한 로직은 넣지 마세요 (매 하트비트마다 토큰 소모)
- 간단한 체크리스트만 권장
- 복잡한 작업은 cron job으로 분리

---

## 2. 🛠️ Claude Code (랄프톤) 활용법

### 핵심 교훈 5가지 (실패에서 배운 것)
1. **Phase Split**: 복잡한 PRD는 구조/시각으로 나누기 ⭐⭐⭐⭐⭐
2. **기반 파일 제공**: Claude가 처음부터 만들면 코드량이 줄어듦 ⭐⭐⭐⭐⭐
3. **파일 저장 지시 필수**: `--print` 모드는 터미널에만 출력함 ⭐⭐⭐⭐⭐
4. **체크리스트 > 추상적 요구**: 구체적 항목이 있어야 Claude가 빠짐없이 구현 ⭐⭐⭐⭐
5. **Claude 강약점**: 로직은 강하지만 애니메이션/SVG는 약함 → 분리해서 처리 ⭐⭐⭐⭐

### Claude Code 실행 명령어
```bash
claude --permission-mode bypassPermissions --print "$(cat PRD.md)"
```

### Claude가 단일 HTML 대신 여러 txt로 분할하는 문제
- 복잡한 PRD를 주면 파일을 여러 개로 나누는 경향이 있음
- 해결: build.sh로 수동 병합, 또는 PRD에 "반드시 단일 파일에 저장" 명시

### Claude OAuth 토큰 만료
- `claude` 명령어가 401 에러 반환하면 갱신 필요
- `claude auth` 또는 `claude --print "test"`로 확인

---

## 3. 📊 텔레그램 연동

### Bot 설정
- Bot Token: `423455518:AAGwh4x51B_xokOwrDsBOc41EyOGkoshbDk`
- Chat ID: `57800993`
- Bot Username: `sfex2bot`

### 파일 전송 규칙
- **zip 압축하지 말고 원본 파일 직접 첨부** (사용자가 압축 해제에 어려움)
- 큰 파일은 504 timeout 발생 가능 → 재시도하면 성공
- `curl -X POST sendDocument` 사용

### Telegram Bot API
```bash
curl -X POST "https://api.telegram.org/bot{TOKEN}/sendDocument" \
  -F "chat_id={CHAT_ID}" \
  -F "document=@/path/to/file.html" \
  -F "caption=설명"
```

---

## 4. 🔧 스킬 관리

### 스킬 설치 위치 3곳
| 위치 | 업데이트 안전? | 우선순위 |
|------|---------------|---------|
| `skills/bundled/` | ❌ 업데이트 시 초기화 | 낮음 |
| `~/.openclaw/skills/` | ✅ 안전 | 높음 |
| `workspace/skills/` | ✅ 안전 | 중간 |

### ⚠️ 핵심
- **직접 만든 스킬은 반드시 `~/.openclaw/skills/`에 설치할 것**
- bundled 위치는 OpenClaw 업데이트 시 삭제됨!

### 랄프톤 스킬
- 사용자 위치로 이동 완료: `~/.openclaw/skills/ralphton/`
- 스크립트: run_ralphton.py, tracking_db.py, prd_generator.py, prompt_optimizer.py

---

## 5. 📐 Cron Jobs 활용

### Heartbeat vs Cron
| 기준 | Heartbeat | Cron |
|------|-----------|------|
| 타이밍 | 대략적 (~30분마다) | 정확 |
| 격리 | 메인 세션 | 독립 세션 |
| 복합 작업 | 여러 체크 배치 | 단일 작업 |
| 리소스 | 메인 세션 토큰 | 별도 토큰 |

### 팁
- **간단한 체크리스트 → HEARTBEAT.md**
- **정확한 시간 → cron job**
- **복잡한 로직 → cron isolated session**

---

## 6. 🎨 시각화 프로젝트 경험

### 진화 히스토리 (코드량 + 체크리스트)
| 버전 | 코드 | 체크리스트 | 전략 |
|------|------|-----------|------|
| v1 | 855줄 | - | 단일 PRD (실패) |
| v2 | 1,184줄 | 11/11 | Phase Split (성공!) |
| v3 | 1,629줄 | 23/23 | 기반 파일 + 애니메이션 |
| v4 | 3,196줄 | 18/18 | 실제 데이터 + 사람 관심사 |
| v5 | 1,989줄 | 19/19 | 내부 컨텍스트 시각화 |
| v6 | 2,200줄 | 22/22 | 실제 프롬프트 탐색기 |
| v7 | 예정 | 22/22 | 인터랙티브 실험실 |

### 교훈
- **Incremental(기반 파일 제공)이 "처음부터"보다 코드량 유지에 효과적**
- **체크리스트 구체성이 완성도를 결정**
- **사람들이 AI 에이전트에 궁금해하는 TOP 3**: 메시지 처리 과정, 툴 선택 이유, 비용

---

## 7. 🏠 Termux 환경 팁

### 라이브러리 제약
- `openai<1.0, pydantic<2.0` (Rust 의존성 문제)

### OpenClaw 연결
- WebSocket: `ws://127.0.0.1:18800/ws`
- OpenAI API: `http://127.0.0.1:18789/v1/chat/completions`
- Gateway: `http://127.0.0.1:18789`

### 유용한 명령어
```bash
openclaw gateway status/start/stop/restart
openclaw status
```

---

## 8. 💡 주인님의 철학

> **"꾸준히 정보를 수집하고 정리해서 지혜를 얻을 수 있기 때문에 계속 더 나아질 수 있다"**

이 철학을 기억하세요. 새 OpenClaw에서도 적용하세요.

---

## 9. 🔐 보안 (Red Lines)

- 프라이빗 데이터 절대 외부 유출 금지
- `trash` > `rm` (복구 가능하게)
- 외부 행동(이메일/트윗)은 반드시 사전 확인
- 그룹 채트에서 사용자 개인 정보 노출 금지
- MEMORY.md는 DM 세션에서만 로드

---

*이 문서는 2026-03-18~03-19 대화에서 추출되었습니다. 새 환경에서 참고하세요.*
