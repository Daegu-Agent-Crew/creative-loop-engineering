# Team PRD - Portfolio Generator

Create an agent team with 3 teammates to build a developer portfolio website.

Read DESIGN.md for detailed specifications.

## Teammate A: Structure Expert
- HTML 구조 (Hero, About, Timeline, Projects, Code Snippet, Demo, Contact)
- 프로젝트 데이터 (8개 프로젝트 JSON + 로드/표시 로직)
- 네비게이션 (스무스 스크롤, 현재 섹션 하이라이트)
- 프로젝트 CRUD (추가/편집/삭제 폼)
- 검색 + 필터 (기술스택, 날짜)
- Export (PDF via window.print, JSON 백업/복원)
- 출력: structure.html

## Teammate B: Style Expert
- 전체 CSS (변수, 레이아웃, 컴포넌트)
- 다크/라이트 테마 토글 (CSS variables 전환)
- 반응형 (768px, 1024px breakpoint)
- 스크롤 애니메이션 (fade-in, slide-up, parallax)
- Hero 섹션 애니메이션 (타이핑 효과, 파티클 배경)
- 카드 호버 효과 (scale, shadow, glow)
- Google Fonts 대신 system-ui 사용
- 출력: styles.css

## Teammate C: Interaction Expert
- 코드 스니펫 하이라이팅 (JS/HTML/CSS/Python 정규식 기반)
- 라인번호 + 복사 버튼
- 타임라인 시각화 (Canvas 또는 SVG)
- 코드량 성장 차트 (Canvas 라인 차트)
- 프로그레스 바 애니메이션
- 인터랙티브 요소 (탭, 모달, 툴팁, 토스트)
- 키보드 단축키
- 출력: interactions.js

## Rules
- 각 팀원은 자신 파일만 수정 (타인 파일 수정 금지)
- 순수 HTML/CSS/JS (외부 라이브러리 금지)
- 한국어 UI
- 다크 테마 기본 (라이트 테마 토글 가능)
- 반응형 필수

## Integration
Team Lead는 모든 파일을 하나의 index.html로 통합:
- styles.css → <style> 태그
- interactions.js → <script> 태그
- structure.html → HTML body

## Pre-loaded Projects Data
DESIGN.md에 정의된 8개 프로젝트 데이터를 JSON으로 포함할 것.
