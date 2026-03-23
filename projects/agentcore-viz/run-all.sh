#!/bin/bash
# 5개 Agent Core 시각화 순차 실행 스크립트
cd /data/data/com.termux/files/home/.openclaw/workspace/projects/agentcore-viz

CONTEXT=$(cat CONTEXT.md)

for i in 1 2 3 4 5; do
  echo "=== 🚀 PRD-$i 시작 ($(date)) ==="
  claude --permission-mode bypassPermissions --print "
$(cat PRD-$i.md)

중요 규칙:
1. 기반 정보 CONTEXT.md를 반드시 읽고 참고할 것
2. 반드시 지정된 HTML 파일에 저장할 것
3. 외부 라이브러리/CDN 사용 금지 (순수 HTML/CSS/JS)
4. 한국어 UI
5. 반응형 디자인
" 2>&1 | tail -3
  echo "=== ✅ PRD-$i 완료 ($(date)) ==="
  echo ""
done

echo "=== 🎉 전체 완료 ==="
ls -lh *.html 2>/dev/null
