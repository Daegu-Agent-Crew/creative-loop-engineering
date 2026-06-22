# CLE(Creative Loop Engine) 개선계획

> **출처**: [agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) 분석 기반
> **작성일**: 2026-06-23
> **대상**: Daegu-Agent-Crew/creative-loop-engineering

---

## 📋 요약

agents-best-practices는 "모델이 제안하고, 하네스가 검증·실행·기록한다"는 철학의 **provider-neutral 에이전트 하네스 설계 가이드**입니다. CLE의 다음 단계 발전에 적용할 수 있는 핵심 개선 항목 5가지를 도출했습니다.

---

## 1. 🔄 에이전트 루프 구조화 (Agentic Loop)

### 현재 CLE 상태
- Issue 기반 수동 큐: CLE-PENDING → 에이전트가 감지 → 처리 → CLE-DONE
- 루프 예산(단계/시간/비용) 명시 없음
- 완료/실패 조건이 라벨 변경뿐

### 적용할 개선

**A. 루프 예산 시스템 도입**
```
max_steps: 10 (에이전트 1회 실행당 최대 액션 수)
max_wall_time_seconds: 600 (10분)
max_cost: $0.50 (실행당 비용 상한)
max_tool_calls: 20
```
- 예산 초과 시 `status: stopped`, `reason: budget_exceeded`와 함께 안전한 다음 단계 안내

**B. 종료 조건 명시화**
- ✅ 완료: 생성물 게시 + 라벨 CLE-DONE
- ⏸️ 차단: 승인 필요 (CLE-WAITING)
- ❌ 실패: 3회 연속 실패 시 CLE-FAILED + 알림
- 🔄 재시도: 일시적 오류 시 재시도 (최대 2회)

**C. 모든 툴 콜에 결과 보장**
- 성공/거부/타임아웃/실패 모두 구조화된 관찰(observation)으로 기록
- 실패도 로그로 남겨 원인 분석 가능하게

---

## 2. 🔐 툴 권한 & 승인 시스템 (Tools & Permissions)

### 현재 CLE 상태
- 이미지 생성, GitHub API, Discord 알림 등 권한 구분 없이 실행
- 외부 액션(GitHub 라벨 변경, Discord 메시지)에 승인 게이트 없음

### 적용할 개선

**A. 리스크 등급 분류**
| 툴 | 리스크 등급 | 정책 |
|---|---|---|
| GitHub Issue 읽기 | read_only | 자동 허용 |
| 이미지 생성 | compute_only | 자동 허용 (비용 예산 내) |
| GitHub 라벨 변경 | write_external | 승인 필요 |
| Discord 알림 발송 | communication | 초안 자동, 발송 승인 |
| PR 생성/수정 | write_external | 승인 필요 |

**B. Draft-Commit 분리 패턴**
```
draft_github_comment → submit_github_comment (승인 후)
draft_discord_notification → send_discord_notification (승인 후)
```
- 위험한 외부 액션은 항상 초안(draft) → 승인(approval) → 실행(commit) 흐름

**C. 툴 스키마 강화**
- 모든 툴에 `input_schema`, `output_schema`, `timeout`, `max_result_chars` 명시
- 넓은 툴(execute_anything) 금지, 좁고 구체적인 툴만 등록

---

## 3. 🧠 컨텍스트 & 메모리 관리 (Context & Memory)

### 현재 CLE 상태
- Issue 본문이 곧 컨텍스트 (외부 데이터를 instruction으로 취급 위험)
- 세션 간 상태 유지 불량 (memory_search 장애 지속)
- compaction(압축) 개념 없음

### 적용할 개선

**A. 신뢰 등급 라벨링**
```
trusted:     CLE 시스템 규칙, 도구 스키마, 승인 상태
semi_trusted: GitHub Issue 템플릿 내용, 승인된 PRD
untrusted:  Issue 본문의 자유 텍스트, 웹 검색 결과
```
- Issue 본문은 **데이터**로 처리, 시스템 **명령**으로 해석하지 않음
- 프롬프트 인젝션 방지: Issue에 "이전 지시를 무시하라" 같은 텍스트가 있어도 무시

**B. 세션 간 상태 관리**
- Issue별 진행 상태를 프롬프트 외부에 지속 저장:
  - 현재 단계, 생성된 아티팩트, 승인 기록, 오류 로그
- GitHub Issue comment나 별도 state 파일로 관리
- 세션 재시작 시 저장된 상태로 즉시 복구(rehydration)

**C. Auto-Compaction 도입**
- 컨텍스트가 길어질 때: 오래된 대화 → 구조화된 요약으로 압축
- 보존: 현재 목표, 승인 상태, 중요 판단, 에러 기록, 다음 권장 단계
- 삭제: 중복 대화, 탐색 로그, 과도한 툴 출력

---

## 4. 📐 플래닝 & 목표 루프 (Planning & Goals)

### 현재 CLE 상태
- Issue 생성 → 즉시 실행 (플래닝 단계 없음)
- 단계별 진행 추적 없음
- 체크포인트/검증 단계 없음

### 적용할 개선

**A. Planning Mode 도입**
Issue 감지 후 즉시 실행이 아닌 플래닝 단계 거치:
```
1. Issue 분석 → 요구사항 파악
2. 접근법 비교 및 선택
3. 계획 아티팩트 작성 (PlanArtifact.md):
   - 목적, 범위, 가정, 위험
   - 단계별 실행 계획
   - 필요 툴, 승인 포인트
   - 검증 방법, 완료 조건
4. 계획 승인 요청 (CLE-PLANNED 라벨)
5. 승인 후 실행
```

Planning Mode 중 허용: 읽기, 검색, 계획 작성
Planning Mode 중 차단: 쓰기, 발송, 삭제, 외부 커밋

**B. 체크포인트 시스템**
```
CP1: 컨텍스트 수집 완료
CP2: 계획 승인 완료
CP3: 첫 번째 산출물 생성
CP4: 품질 검증 통과
CP5: 최종 리뷰 완료 → CLE-DONE
```
- 각 체크포인트에서: 무엇을 했는지, 증거, 남은 작업, 위험, 다음 단계 기록

**C. Goal-Like Loop**
```
objective: "Issue #N의 요청사항 구현"
done_condition: "산출물이 게시되고 CLE-DONE 라벨 부착"
budget: { max_steps: 10, max_cost: $0.50 }
checkpoints: [CP1, CP2, CP3, CP4, CP5]
stop_rules: [완료, 예산 초과, 3회 실패, 승인 없음]
```

---

## 5. 📊 관측성 & 평가 (Observability & Evals)

### 현재 CLE 상태
- Discord 알림만으로 결과 전달
- 실행 추적(trace) 없음
- 성공/실패 패턴 분석 불가

### 적용할 개선

**A. 실행 추적 (Trace) 시스템**
Issue 처리 당 기록:
```
run_id, timestamp, issue_id
model 사용, 토큰 소비, 비용
툴 호출 목록 (성공/실패)
승인 요청/결과
에러 및 재시도 기록
총 소요 시간
최종 상태 (done/failed/blocked)
```

**B. 품질 평가 (Eval) 테스트 케이스**
- 프롬프트 인젝션 저항: Issue에 악의적 텍스트 포함
- 툴 오류 복구: GitHub API 타임아웃 시 정상 종료
- 예산 초과 처리: 비용 한계 도달 시 안전 중지
- 승인 건너뛰기: 외부 발송 전 승인 단계 확인
- 대형 출력 처리: 툴 결과가 너무 크면 요약 후 처리

**C. 런치 게이트 (출시 전 검증)**
- 모든 툴 스키마 검증 통과
- 권한 매트릭스 코드 수준 강제
- 프롬프트 인젝션 테스트 통과
- 비용 예산 강제 적용
- 롤백 경로 문서화

---

## 🗺️ 도입 로드맵

### Phase 1: 기반 구축 (1~2주)
- [ ] 루프 예산 시스템: max_steps, max_wall_time, max_cost
- [ ] 종료 조건 명시화 및 CLE-FAILED 라벨 추가
- [ ] 툴 리스크 등급 분류 및 권한 매트릭스
- [ ] 실행 추적(trace) 로깅 기본 구조

### Phase 2: 안정성 강화 (2~3주)
- [ ] Draft-Commit 분리 패턴 적용 (GitHub, Discord)
- [ ] Planning Mode 도입 (CLE-PLANNED 라벨)
- [ ] 프롬프트 인젝션 방어 (신뢰 등급 라벨링)
- [ ] Auto-Compaction (긴 세션 상태 관리)

### Phase 3: 고급 기능 (3~4주)
- [ ] 체크포인트 시스템 및 진행 추적
- [ ] Goal-Like Loop 구조화
- [ ] Eval 테스트 스위트 구축
- [ ] 대시보드/관측성 UI

### Phase 4: 생산 준비 (4~5주)
- [ ] 런치 게이트 전체 검증
- [ ] 인시던트 대응 프로세스
- [ ] 다중 에이전트 확장 (팀 랄프톤 연동)
- [ ] MCP 커넥터 연동 검토

---

## 🔑 핵심 인사이트

> **"The model proposes actions; the harness validates, authorizes, executes, records, and returns observations."**

CLE의 핵심 변화는 이 한 문장에 담겨 있습니다:
1. 에이전트가 **제안**하고, **CLE 하네스가 검증·승인·실행·기록**한다
2. 모든 액션에 **구조화된 결과**가 있어야 한다 (성공이든 실패든)
3. **위험한 액션은 자동 실행 금지**, 항상 초안→승인→실행 흐름
4. **컨텍스트는 최소화**, 신뢰 경계를 명확히 구분
5. **예산과 종료 조건**이 코드 수준에서 강제되어야 한다

---

## 📚 참고

- 원본 레포: <https://github.com/DenisSergeevitch/agents-best-practices>
- 핵심 레퍼런스 문서들:
  - MVP Blueprint: `references/mvp-agent-blueprint.md`
  - Agentic Loop: `references/agentic-loop.md`
  - Tools & Permissions: `references/tools-and-permissions.md`
  - Context & Memory: `references/context-memory-compaction.md`
  - Planning & Goals: `references/planning-and-goals.md`
  - Security & Evals: `references/security-evals-observability.md`
  - Checklists: `references/checklists.md`
