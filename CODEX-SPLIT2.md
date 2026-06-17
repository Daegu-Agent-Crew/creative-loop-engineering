# Codex Task: Creative Loop Engine v2 — Split 2 (피드백 + 갤러리 + 설정 + 테스트 + 마무리)

## Context
Split 2/2. index.html에 Split 1에서 만든 SPA에 이어서 추가 구현하세요.
PRD 전체는 `docs/PRD-multiuser-ui.md`. Split 1 결과물을 먼저 읽고 이어서 작성하세요.

## Split 2 Scope (Build NOW)

### 1. Gate Feedback UI (프로젝트 페이지 내)
`<!-- SPLIT2: feedback-ui -->` 마커 위치에 추가:
- Structured feedback chips (toggle buttons):
  - 색감 더 강하게, 캐릭터 유지, 배경 단순화, 텍스트 더 적게, 구도 유지, 더 밝게
  - CSS: .feedback-chip class, selected state = accent border + glow
- Star rating sliders: 방향성 (1-5), 품질 (1-5)
  - Range input + visual ★ display that updates in real-time
- Action buttons: ✅ 승인, 🔄 재생성, ✏️ 방향 수정
- Comment textarea (optional)
- 모든 버튼/칩/슬라이더가 실제 동작해야 함 (localStorage에 저장)

### 2. Recovery URL + Clipboard Copy
`<!-- SPLIT2: recovery -->` 마커 위치에 추가:
- /resume/:token URL 생성 및 표시
- "클립보드 복사" 버튼 (navigator.clipboard.writeText)
- 복사 성공 시 toast 알림 (CSS animation, 2초 자동 사라짐)

### 3. Privacy Controls
`<!-- SPLIT2: privacy -->` 마커 위치에 추가:
- Radio group: 비공개 / 링크 공유 / 갤러리 공개
- 각 옵션에 설명 텍스트
- 선택 변경 시 localStorage 저장

### 4. Gallery Page (#/gallery)
`<!-- SPLIT2: gallery -->` 마커 위치에 추가:
- Masonry grid (CSS columns)
- Filter chips: 전체/카테고리/화풍/최신/인기
- Search input
- Gallery placeholder items (10+ items with varied gradients)
- Like count, clone button per item
- Click → detail modal (fullscreen overlay)
- Empty state

### 5. Settings Page (#/settings)
`<!-- SPLIT2: settings -->` 마커 위치에 추가:
- Theme: dark only (Phase 1)
- Language: Korean only (Phase 1)
- GitHub 연동 (Phase 2 placeholder, disabled)
- Discord 연동 (Phase 2.5 placeholder, disabled)
- "모든 데이터 삭제" 버튼 with confirm dialog

### 6. Test Runner (#/test)
`<!-- SPLIT2: test -->` 마커 위치에 추가:
- `#/test` 라우트 추가
- 테스트 페이지 UI: "🧪 자동 테스트" 헤더, 결과 리스트, 통과/실패 카운터, "전체 재실행" 버튼
- 20개 이상 테스트:

```
1. 라우팅: #/ → 랜딩 렌더
2. 라우팅: #/new → 위저드 렌더 (step-pill 확인)
3. 라우팅: #/dashboard → 프로젝트 목록 렌더
4. 라우팅: #/project/test-id → 프로젝트 렌더 (or 404)
5. 라우팅: #/gallery → 갤러리 렌더
6. 라우팅: #/settings → 설정 렌더
7. 라우팅: #/resume/token → 복구 동작
8. 라우팅: 잘못된 경로 → 랜딩 리다이렉트
9. 스토리지: 프로젝트 생성 + 저장 + 불러오기
10. 스토리지: 설정 저장 + 불러오기
11. 스토리지: 복구 토큰으로 프로젝트 찾기
12. 위저드: 카드 선택 토글
13. 위저드: 다중 카드 선택
14. 위저드: 커스텀 텍스트 입력
15. 위저드: 프롬프트 텍스트 (2000자 제한)
16. 위저드: 참고 URL 추가/삭제
17. 위저드: Step 전진/후진
18. 피드백: 칩 선택/해제
19. 피드백: 별점 변경
20. 피드백: 코멘트 입력
21. 프라이버시: 공개 설정 변경
22. Phase: 상태 전이 (idle→generating→complete)
23. Phase: 진행률 계산
24. 대시보드: 프로젝트 필터
25. 갤러리: 검색 동작
```

- 각 테스트: try/catch, 결과 테이블 렌더, 콘솔에도 출력
- 테스트 실행은 실제 DOM 조작으로 검증 (innerHTML 확인 등)

### 7. Phase Status Simulation
기존 프로젝트 페이지의 Phase 시뮬레이션 로직 개선:
- 프로젝트 생성 시 자동으로 Define → Generate 진행 시뮬레이션
- 4초 간격 setInterval로 Phase 상태 변경 (idle → generating → complete)
- generating → complete 전환 시 candidates에 placeholder gradient 추가
- 모든 상태 전이 애니메이션 동작 확인

### 8. Toast Notification System
- 전역 toast 함수: showToast(message, type)
- type: success (green), error (red), info (accent)
- CSS: 하단 고정, fade-in/slide-up, 2초 자동 사라짐
- 복구 URL 복사, 데이터 삭제 등에서 사용

## CRITICAL RULES
1. Split 1의 기존 코드를 읽고 이어서 작성 (덮어쓰지 않음)
2. 모든 마커(`<!-- SPLIT2: ... -->`)를 찾아 해당 위치에 코드 삽입
3. Korean text everywhere
4. No external dependencies
5. Every interactive element must work

## DO NOT
- Rewrite Split 1 code
- Use external libraries
- Skip any interactive element
- Leave TODO comments
