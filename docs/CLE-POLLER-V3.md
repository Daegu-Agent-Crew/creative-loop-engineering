# CLE Issue Poller v3 — Phase Split 성능 개선

> 5핵심 적용: 컨텍스트 최적화, 단계 분해, 병렬 처리, 상태 관리, 스마트 재시도

---

## Phase 1: 감지 (Detect)

Issue 검색 — CLE-PENDING + CLE-REVISION 라벨.

```bash
source ~/.openclaw/workspace/.env
# 병렬: 두 라벨 동시 조회
curl -s -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/issues?labels=CLE-PENDING&state=open&per_page=5" &
curl -s -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/issues?labels=CLE-REVISION&state=open&per_page=5" &
wait
```

**병렬 포인트**: 두 라벨 조회는 독립적이므로 동시 실행. 응답 시간 절반.

---

## Phase 2: 분석 (Parse)

발견된 Issue 본문 → 구조화된 태스크로 변환. **핵심 성능 포인트**.

### 자동 실행
```bash
# 상태 초기화
bash ~/.openclaw/workspace/cle-state.sh init <issue_number>

# 파서 실행 — Issue body만 넘김
echo "$ISSUE_BODY" > /tmp/cle-issue-$N.txt
bash ~/.openclaw/workspace/cle-parse.sh /tmp/cle-issue-$N.txt
```

### 출력 (모델이 받을 컨텍스트 — raw body 대신 이것만 사용)
```json
{
  "prompt": "실제 이미지 생성 프롬프트",
  "topics": "우주, 외계인",
  "style": "watercolor",
  "mood": "dramatic",
  "ref_images": ["https://..."],
  "cle_type": "pending|revision",
  "feedback": "수정 요청 내용 (revision인 경우)",
  "complexity": "low|medium|high"
}
```

**컨텍스트 최적화**: Issue 본문 3000자 → 구조화 태스크 300자. 모델이 노이즈 없이 핵심만 받음.

### 병렬: 참조 수집
분석과 동시에 이전 에피소드/이미지 참조도 병렬 조회:
```bash
# 이전 CLE 결과물 참조
curl -s "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/contents/assets/cle-requests" | python3 -c "import json,sys; [print(f['name']) for f in json.load(sys.stdin)]" &
```

---

## Phase 3: 생성 (Generate)

파싱된 구조화 태스크로 이미지 생성. **프롬프트는 파서 출력 기반으로 구성**.

```bash
# 프롬프트 구성 규칙:
# 1. 파서의 prompt 필드를 기본으로
# 2. topics + style + mood를 영문으로 자연스럽게 조합
# 3. revision인 경우 feedback을 프롬프트에 반영
# 4. ref_images가 있으면 참조 지시 추가

timeout 600 codex exec --full-auto --enable image_generation \
  "[조합된 프롬프트]. Save to assets/cle-requests/cle{N}-v{V}.png"
```

**복잡도 기반 분해**:
- `complexity: low` → 1회 실행
- `complexity: medium` → 프롬프트+배경 분리 후 합성
- `complexity: high` → Phase Split: 골조 이미지 → 디테일 추가

---

## Phase 4: 검증 (Verify)

생성 결과를 GitHub에 push하기 전 간단 검증.

```bash
# 1. 파일 존재 + 크기 확인
FILE="assets/cle-requests/cle${N}-v${V}.png"
if [ ! -f "$FILE" ] || [ $(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE") -lt 10000 ]; then
  # 스마트 재시도: 파일이 없거나 너무 작으면
  bash ~/.openclaw/workspace/cle-state.sh error $ISSUE "generated_file_too_small"
  if [ $(python3 -c "import json; print(json.load(open('$HOME/.openclaw/workspace/cle-state/cle-$ISSUE.json'))['attempts'])") -lt 3 ]; then
    # 일시적 오류 → 재시도 (Phase 3로 돌아감)
    continue
  else
    # 영구 실패 → CLE-FAILED 라벨
    ...
  fi
fi
```

**스마트 재시도 정책**:
| 에러 유형 | 분류 | 동작 |
|-----------|------|------|
| 파일 없음/작음 | transient | 3초 대기 후 재시도, 최대 2회 |
| codex timeout | transient | 재시도, 최대 2회 |
| PAT 만료 | permanent | 중단 + 관리자 알림 |
| attempts ≥ 3 | budget | 안전 중지 + CLE-FAILED |

---

## Phase 5: 배포 (Deploy)

검증 통과 → GitHub push + 코멘트 + 라벨 + Discord 알림.

```bash
# Git push (PAT 인증 방식 주의!)
cd ~/creative-loop-engineering
git add assets/cle-requests/
git commit -m "CLE #${N} v${V}: ${TITLE}"
git push

# GitHub 코멘트
curl -s -X POST -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/issues/${N}/comments" \
  -d "{\"body\": \"결과 코멘트\"}"

# 라벨 변경
curl -s -X DELETE -H "Authorization: token $GITHUB_PAT" \
  "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/issues/${N}/labels/{OLD_LABEL}"
curl -s -X POST -H "Authorization: token $GITHUB_PAT" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/Daegu-Agent-Crew/creative-loop-engineering/issues/${N}/labels" \
  -d '["CLE-DONE"]'

# 상태 업데이트
bash ~/.openclaw/workspace/cle-state.sh update $ISSUE status "done"

# Discord 알림
sessions_send sessionKey="agent:main:discord:channel:1515137985392279622" \
  message="CLE #${N} 완료! [이미지 링크](https://raw.githubusercontent.com/...)"
```

---

## 비교: v2 → v3

| 항목 | v2 (기존) | v3 (성능 개선) |
|------|-----------|----------------|
| 프롬프트 크기 | Issue 본문 전체 | 구조화 태스크만 |
| Issue 조회 | 순차 | 병렬 |
| 복잡한 Issue | 한 번에 몰아넣기 | 복잡도 기반 분해 |
| 실패 시 | 로그만 남김 | 에러 분류 + 자동 재시도 |
| 세션 끊김 | 처음부터 재시작 | 상태 파일에서 복원 |
| 전체 단계 | 1단계 흐름 | 5-Phase 구조화 |
