#!/usr/bin/env bash
# CLE Task Parser v1 — Issue 본문 → 구조화 태스크 추출
# Usage: bash cle-parse.sh <issue_body_file>
# Output: JSON to stdout

set -euo pipefail

INPUT="${1:?Usage: cle-parse.sh <issue_body_file>}"

if [ ! -f "$INPUT" ]; then
  echo '{"error":"file_not_found"}'
  exit 1
fi

BODY=$(cat "$INPUT")

# 필드 추출 함수
extract() {
  echo "$BODY" | grep -A 50 "$1" | grep -v "^--$" | head -50
}

# 1. 프롬프트 추출
PROMPT=$(echo "$BODY" | grep -iE "^prompt:|^prompt\(|prompt[:\s]" | head -1 | sed 's/^.*[pP]rompt[:\(]*\s*//' | sed 's/[)]*$//' || echo "")

# 프롬프트가 비어있으면 본문 전체에서 이미지 생성 관련 텍스트 추출
if [ -z "$PROMPT" ]; then
  PROMPT=$(echo "$BODY" | grep -iE "(generate|create|make|draw|render|paint|illustrate)" | head -3 | tr '\n' ' ' || echo "")
fi

# 2. 토픽 추출
TOPICS=$(echo "$BODY" | grep -iE "^topics?:|^theme:" | head -5 | sed 's/^.*:\s*//' | tr '\n' ',' | sed 's/,$//' || echo "")

# 3. 스타일 추출  
STYLE=$(echo "$BODY" | grep -iE "^style:|^art.?style:" | head -3 | sed 's/^.*:\s*//' | tr '\n' ',' | sed 's/,$//' || echo "")

# 4. 무드 추출
MOOD=$(echo "$BODY" | grep -iE "^mood:|^atmosphere:|^tone:" | head -3 | sed 's/^.*:\s*//' | tr '\n' ',' | sed 's/,$//' || echo "")

# 5. 참조 이미지 URL
REF_IMAGES=$(echo "$BODY" | grep -oE 'https://[^[:space:]>")\]]+\.(png|jpg|jpeg|webp|gif)' | head -5 | tr '\n' ',' | sed 's/,$//' || echo "")

# 6. CLE 타입 판별
if echo "$BODY" | grep -qi "CLE-REVISION\|revision\|수정\|fix\|redo"; then
  CLE_TYPE="revision"
  FEEDBACK=$(echo "$BODY" | grep -iE "feedback|피드백|수정|fix|change|adjust" | grep -v "^#" | grep -v "^>" | head -5 | tr '\n' '; ' || echo "")
else
  CLE_TYPE="pending"
  FEEDBACK=""
fi

# 7. 본문 길이로 복잡도 판별
BODY_LEN=${#BODY}
if [ "$BODY_LEN" -gt 3000 ]; then
  COMPLEXITY="high"
elif [ "$BODY_LEN" -gt 1000 ]; then
  COMPLEXITY="medium"
else
  COMPLEXITY="low"
fi

# JSON 출력
python3 -c "
import json, sys
data = {
  'prompt': '''$PROMPT'''.strip(),
  'topics': '''$TOPICS'''.strip(),
  'style': '''$STYLE'''.strip(),
  'mood': '''$MOOD'''.strip(),
  'ref_images': '''$REF_IMAGES'''.strip().split(',') if '''$REF_IMAGES'''.strip() else [],
  'cle_type': '$CLE_TYPE',
  'feedback': '''$FEEDBACK'''.strip(),
  'complexity': '$COMPLEXITY',
  'body_length': $BODY_LEN,
  'phase': 'analyze' if '$CLE_TYPE' == 'revision' else 'generate'
}
# 빈 값 정리
data = {k: v for k, v in data.items() if v not in [None, '', [], 0]}
print(json.dumps(data, ensure_ascii=False, indent=2))
"
