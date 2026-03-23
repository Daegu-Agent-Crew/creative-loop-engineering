# HEARTBEAT.md

## 1. Scheduled Jobs Check

매 하트비트마다 오늘 날짜의 예정 작업을 확인:

1. `scheduled_jobs.json`에서 오늘 날짜(`YYYY-MM-DD`)의 `pending` 작업 조회
2. 파일이 없으면 무시 (아직 예정된 작업 없음)
3. `pending` 작업이 있으면 아래 Job Execution Protocol 실행

## 2. Job Execution Protocol

```bash
# 1. 작업 상태를 running으로 변경
# (scheduled_jobs.json에서 해당 작업의 status를 "running"으로 업데이트)

# 2. 작업 실행 (각 job의 run 명령어 사용)
# - 랄프톤 계열: claude --permission-mode bypassPermissions --print "$(cat PRD.md)"
# - 스크립트 계열: python3 scripts/run.py

# 3. 결과에 따라 상태 업데이트
# - 성공: status → "completed", completedAt 기록, 사용자 알림
# - 실패: Failure Analysis & Recovery 단계 진입
```

## 3. Failure Analysis & Recovery

작업 실패 시 다음 5단계를 순서대로 수행:

1. **로그 분석**: 실패한 세션의 로그/출력 확인하여 원인 파악
2. **조건 확인**: 외부 의존성 (네트워크, API 키, 디스크 공간 등) 정상 확인
3. **PRD/명령 개선**: 실패 원인을 바탕으로 PRD나 실행 명령어 수정
4. **재시도**: 최대 3회, exponential backoff (1분 → 2분 → 4분)
5. **사용자 보고**: 3회 재시도 후에도 실패 시 사용자에게 원인과 수정 내용 보고

## 4. Upcoming Jobs

현재 예정된 작업 (scheduled_jobs.json 참조):
- (작업이 등록되면 여기에 자동 업데이트)

## 5. Key Principle

- ❌ **claude 실행이 실패하면 내가 직접 해당 작업을 수행하지 마세요**
- ✅ **분석 → 개선(PRD/명령 수정) → 재시도 순서로 처리하세요**
- 내가 Claude보다 코딩에 능숙하지 않습니다. 실패 원인을 수정하고 Claude에게 다시 맡기세요.
