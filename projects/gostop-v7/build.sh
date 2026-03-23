#!/bin/bash
# Claude가 나눠서 출력한 파일들을 하나의 index.html로 합치기
cat > index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>맞고 고스톱 v7</title>
<style>
HTMLEOF

# CSS 추가
cat v7-css.txt >> index.html

cat >> index.html << 'HTMLEOF'
</style>
</head>
<body>
HTMLEOF

# HTML 추가
cat v7-html.txt >> index.html

cat >> index.html << 'HTMLEOF'
<script>
HTMLEOF

# JS 추가
cat v7-js-part1.txt >> index.html
cat v7-js-part2.txt >> index.html

cat >> index.html << 'HTMLEOF'
</script>
</body>
</html>
HTMLEOF

wc -l index.html
ls -lh index.html
