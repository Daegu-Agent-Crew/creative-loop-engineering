# Codex Task: Creative Loop Engine v2 — Phase 1 SPA

## Context
You are building Phase 1 (Prototype) of a Creative Loop Engineering multi-user UI system.
The full PRD is in `docs/PRD-multiuser-ui.md` — READ IT FIRST.

This is v2 with 3 critical new requirements:
1. **프롬프트 + 참고 자료 입력** — 카드 선택뿐 아니라 자유 텍스트 프롬프트와 참고 이미지/URL도 받을 수 있어야 함
2. **충분한 생성 시간** — 코드는 완성도 높게, 모든 상호작용이 실제 동작해야 함
3. **테스트와 검증** — 내장 테스트 스위트 (self-test) 포함

## Architecture
- **Single HTML file**: `index.html` (Vanilla SPA, no frameworks)
- **Hash-based routing**: `#/`, `#/new`, `#/dashboard`, `#/project/:id`, `#/gallery`, `#/settings`, `#/resume/:token`
- **State management**: localStorage for projects, sessionStorage for current session
- **Design system**: Dark theme with CSS Variables (defined below)
- **GitHub Pages deployable**: Everything in one HTML file
- **Self-test**: Built-in test runner accessible via `#/test` route

## CRITICAL RULES
1. **Save ALL code to index.html** — this is the ONLY output file
2. **The existing index.html content must be preserved as an HTML comment at the very top**
3. **Mobile-first responsive design** — cards 2-col desktop, 1-col mobile
4. **No external dependencies** — no CDN links, no npm, pure vanilla
5. **Korean UI text** — all labels, buttons, messages in Korean
6. **Every interactive element must actually work** — no stub buttons, no placeholder-only sections

## ★ NEW REQUIREMENT 1: 프롬프트 + 참고 자료 입력

### Design Philosophy
기존 카드 선택(선택 우선)을 유지하면서, **고급 사용자를 위한 자유도 높은 입력 방식**을 추가합니다.
카드 선택은 "시작점(Starting Point)"이고, 프롬프트+참고자료는 "방향(Direction)"입니다.

### New Project Page (#/new) — Enhanced 3-Step Wizard

**Step 1: 주제 선택**
- 기존 카드 그리드 유지 (SF, 판타지, 현대, 역사, 드라마, 커스텀)
- 카드 아래에 **"또는 자유롭게 입력하세요"** 텍스트 영역 추가
  - textarea: "만들고 싶은 것을 자세히 설명해주세요 (예: 사이버펑크 도시에서 로봇 고양이가 우유를 마시는 장면)"
  - placeholder에 구체적 예시 3가지 순환 표시 (자바스크립트로 랜덤)
  - 2000자 제한, 실시간 글자 수 카운터
- **참고 자료 첨부 영역** (카드 선택 아래)
  - [이미지 첨부] 버튼 — FileReader로 base64 읽어 미리보기 (최대 5장, 각 2MB)
  - [URL 추가] 버튼 — 텍스트 입력으로 참고 링크 (최대 3개)
  - 첨부된 자료: 드래그 앤 드롭으로 순서 변경 가능 (간단한 drag 구현)
  - 각 첨부물: X 버튼으로 삭제, 클릭하면 확대 프리뷰 (모달)
  - 이미지 미리보기: 120x120 썸네일 그리드
  - URL 미리보기: 파비콘 + 도메인명 + 삭제 버튼
  - **전체 영역 드래그 앤 드롭**: 파일을 창에 드롭하면 자동 첨부

**Step 2: 화풍 선택**
- 기존 카드 그리드 유지
- 아래에 **화풍 참고 자료 추가** 가능 (Step 1과 동일 첨부 UI)
  - "이 화풍의 느낌을 보여주는 참고 이미지나 링크를 추가하세요"

**Step 3: 분위기 + 최종 프롬프트**
- 기존 카드 그리드 유지
- 아래에 **최종 프롬프트 편집 영역** 추가
  - 카드 선택 + 프롬프트 텍스트 + 참고 자료를 조합한 "생성 프롬프트 프리뷰" 자동 생성
  - textarea로 직접 수정 가능 (사용자가 AI에 전달할 최종 메시지)
  - 읽기 전용 프리뷰 영역 (카드 선택에 따라 자동 업데이트) + 편집 가능 영역 분리
  - 프리뷰 형식 예시:
    ```
    [주제] SF 미래, 사이버펑크 도시
    [화풍] 수채화, 수채화 참고 이미지 2장 첨부
    [분위기] 어둡고 미스터리
    [사용자 프롬프트] "사이버펑크 도시에서 로봇 고양이가 우유를 마시는 장면"
    [참고 자료] URL 1개, 이미지 1장
    ```
  - "초기화" 버튼으로 카드 선택 기본으로 되돌리기

### localStorage Schema (Updated)
```json
{
  "cle_projects": [
    {
      "id": "unique-id",
      "title": "사용자 프롬프트 또는 카드 조합으로 자동 생성",
      "topic_cards": ["sf"],
      "style_cards": ["watercolor"],
      "mood_cards": ["dark"],
      "prompt_text": "사이버펑크 도시에서 로봇 고양이...",
      "reference_images": [
        { "id": "ref-1", "name": "style-ref.jpg", "type": "image", "data": "base64...", "size": 123456 },
        { "id": "ref-2", "name": "concept.png", "type": "image", "data": "base64...", "size": 234567 }
      ],
      "reference_urls": [
        { "id": "url-1", "url": "https://example.com/ref", "title": "참고 링크" }
      ],
      "final_prompt": "자동 생성 + 사용자 수정된 최종 프롬프트",
      "phases": {
        "define": { "status": "complete", "timestamp": 1234567890 },
        "generate": { "status": "complete", "candidates": [
          { "id": "c1", "status": "complete", "gradient": "linear-gradient(...)" },
          { "id": "c2", "status": "complete", "gradient": "linear-gradient(...)" },
          { "id": "c3", "status": "failed", "error": "timeout" },
          { "id": "c4", "status": "idle" }
        ], "timestamp": 1234567900 },
        "evaluate": { "status": "idle" },
        "refine": { "status": "idle" },
        "deliver": { "status": "idle" }
      },
      "feedback": { "chips": [], "rating_direction": 3, "rating_quality": 4, "comment": "" },
      "privacy": "private",
      "created": 1234567890,
      "modified": 1234567890,
      "recoveryToken": "a3x..."
    }
  ],
  "cle_settings": { "theme": "dark", "tutorial_seen": true }
}
```

### Project Dashboard (#/project/:id) — Updated
- 프로젝트 정보 섹션에 **참고 자료 미리보기** 추가
  - 첨부 이미지 작은 썸네일 행 (클릭하면 모달 확대)
  - 참고 URL 링크 목록
- Phase 진행 바에 **사용자 프롬프트 표시** (접기/펼치기 가능)
  - "📋 생성 프롬프트" 섹션 — 클릭하면 전체 프롬프트 표시
  - 복사 버튼으로 클립보드 복사

## ★ NEW REQUIREMENT 2: 충분한 생성 시간 (Quality over Speed)
- 모든 애니메이션은 CSS transition/animation으로 구현 (JS setTimeout 최소화)
- IntersectionObserver로 scroll-reveal 애니메이션 (요소가 뷰포트에 들어올 때 fade-in)
- 애니메이션 세부:
  - 랜딩 SVG 루프: CSS @keyframes로 15초 주기 회전
  - 카드 hover: transform: translateY(-4px) + box-shadow 변화
  - Phase bar: completed 구간에 gradient sweep 애니메이션
  - generating 상태: 🔄 아이콘 CSS spin animation
  - idle 상태: ⏳ 아이콘 CSS pulse animation
  - complete 상태: ✅ 아이콘 CSS fade-in + scale bounce
  - 페이지 전환: 0.3s opacity fade + translateY(8px)
- 튜토리얼: 3장 슬라이드, localStorage에 tutorial_seen 기억
- 반응형:
  - @media (max-width: 960px): 2단계 사이드바 축소
  - @media (max-width: 720px): 단일 컬럼, 하단 고정 탭 네비게이션
  - @media (max-width: 480px): 카드 1열, 작은 버튼

## ★ NEW REQUIREMENT 3: 테스트와 검증

### 내장 테스트 스위트 (#/test route)
`#/test`에 접속하면 자동 실행되는 테스트 스위트를 index.html 내부에 포함하세요.
테스트 페이지 UI:
- 상단에 "🧪 자동 테스트" 헤더
- 각 테스트 결과가 실시간으로 표시됨 (✅ 통과 / ❌ 실패)
- 통과/실패 카운터
- 하단에 "전체 재실행" 버튼
- 콘솔에도 결과 출력

### 필수 테스트 항목 (15개 이상)
```
1. 라우팅 — 해시 변경 시 올바른 페이지 렌더링
2. 라우팅 — 잘못된 경로 처리 (/invalid → 랜딩 리다이렉트)
3. 라우팅 — /resume/:token 경로 파싱
4. 스토리지 — 프로젝트 생성/저장/불러오기
5. 스토리지 — 설정 저장/불러오기
6. 스토리지 — 복구 토큰으로 프로젝트 찾기
7. 위저드 — 카드 선택/해제 토글
8. 위저드 — 다중 카드 선택
9. 위저드 — 커스텀 텍스트 입력
10. 위저드 — 프롬프트 텍스트 입력 (2000자 제한)
11. 위저드 — 참고 이미지 추가/삭제 시뮬레이션
12. 위저드 — 참고 URL 추가/삭제
13. 위저드 — Step 전진/후진
14. 피드백 — 칩 선택/해제 토글
15. 피드백 — 별점 변경
16. 피드백 — 코멘트 입력
17. 프라이버시 — 공개 설정 변경
18. Phase — 상태 전이 (idle → generating → complete)
19. Phase — 전체 진행률 계산
20. 복구 — /resume 토큰으로 세션 복원
21. 갤러리 — 필터링 동작
22. 갤러리 — 검색 동작
23. 대시보드 — 프로젝트 필터 (전체/진행중/완료)
```

### 테스트 코드 구조
```javascript
// index.html 내부에 포함
const TESTS = [
  {
    name: '라우팅 — 해시 변경 시 올바른 페이지 렌더링',
    fn: function() {
      window.location.hash = '#/new';
      // render() 후 DOM 확인
      const stepPill = document.querySelector('.step-pill');
      if (!stepPill) throw new Error('step-pill 요소 없음');
      if (!stepPill.textContent.includes('Step')) throw new Error('Step 표시 오류');
      return true;
    }
  },
  // ... 20개 이상 테스트
];

async function runTests() {
  const results = [];
  for (const test of TESTS) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: !!result, error: null });
    } catch (e) {
      results.push({ name: test.name, passed: false, error: e.message });
    }
  }
  renderTestResults(results);
  console.table(results);
  return results;
}
```

## CSS Variables (Design System)
```css
:root {
  --bg: #0a0e17;
  --surface: #111827;
  --surface2: #1a2235;
  --border: #1e293b;
  --text: #e2e8f0;
  --text2: #94a3b8;
  --accent: #6366f1;
  --accent2: #818cf8;
  --green: #22c55e;
  --amber: #f59e0b;
  --red: #ef4444;
  --teal: #14b8a6;
  --purple: #a855f7;
  --blue: #3b82f6;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
  --transition: 0.3s ease;
}
```

## Full Page Structure

### 1. App Shell & Router
- Hash-based SPA router with fade transitions
- Global nav header: logo (🔄 loop icon), nav links (랜딩, 대시보드, 갤러리, 설정)
- 하단 모바일 탭 네비게이션 (720px 이하)
- Dark theme, smooth page transitions

### 2. Landing Page (#/)
- Hero with animated SVG loop (5 phases: Define→Generate→Evaluate→Refine→Deliver)
- Headline: "프롬프트를 쓰지 마세요. 고르세요." + subtext about 자유도
- **New:** "또는 자유롭게 프롬프트를 입력하세요" 강조
- "바로 체험하기" CTA → #/new
- Recent gallery strip (4 items)
- Category tags: 만화 / 일러스트 / 스토리보드 / 글쓰기 / 프리팹 / 커스텀
- 3-step tutorial slides (localStorage remembers)

### 3. New Project Page (#/) — See ★ NEW REQUIREMENT 1 above

### 4. Project Dashboard (#/project/:id)
- Project title + 참고 자료 미리보기 섹션
- **프롬프트 보기/복사** 접기/펼치기 섹션
- 5-Phase visual pipeline with status icons
  - ① Define → ② Generate → ③ Evaluate → ④ Refine → ⑤ Deliver
  - Colors: Define=blue, Generate=purple, Evaluate=amber, Refine=green, Deliver=teal
  - Connecting lines between phases, gradient on completed progress
- 4-candidate grid (2x2) with placeholder gradients
- Status display bar with state-specific icons/animations
- Gate Feedback UI:
  - Structured feedback chips (toggle selectable)
  - Star rating sliders: 방향성, 품질 (range input 1-5)
  - Action buttons: ✅ 승인, 🔄 재생성, ✏️ 방향 수정
  - Comment textarea
- Recovery URL + clipboard copy
- Privacy controls (비공개/링크 공유/갤러리 공개)

### 5. Dashboard (#/dashboard)
- Project cards grid from localStorage
- Filter: 전체 / 진행중 / 완료
- "새 프로젝트" CTA
- Empty state message

### 6. Gallery (#/gallery)
- CSS columns masonry layout
- Search input + filter chips
- Like count, clone button
- Click → detail modal

### 7. Settings (#/settings)
- Theme (dark only Phase 1)
- Language (Korean only Phase 1)
- Account: GitHub 연동 placeholder (Phase 2)
- Discord 연동 placeholder (Phase 2.5)
- Clear all data (with confirmation)

### 8. Guest Resume (#/resume/:token)
- Parse token, lookup project, redirect to #/project/:id
- Error state if not found

### 9. Test Runner (#/test) — See ★ NEW REQUIREMENT 3 above

## Visual Quality Requirements
- CSS transitions (0.3s) on ALL interactive elements
- Card hover: translateY(-4px) + shadow change + border color
- Phase bar: connecting lines, gradient sweep on completed
- Spinning animation on 🔄, pulse on ⏳, fade-in bounce on ✅
- Placeholder images: gradient colored divs
- IntersectionObserver scroll-reveal (fade-in from below)
- Active nav link highlighted
- Mobile: bottom tab navigation at 720px

## VALIDATION CHECKLIST (Self-Test Must Verify)
After building, verify ALL of these:
- [ ] All 8 routes work (/, /new, /dashboard, /project/:id, /gallery, /settings, /resume/:token, /test)
- [ ] 3-step card wizard: cards selectable, multi-select, custom input
- [ ] 프롬프트 textarea with character counter (2000 limit)
- [ ] 이미지 첨부: file input → FileReader → base64 → 미리보기 → 삭제
- [ ] URL 참고: 추가/삭제/표시
- [ ] 드래그 앤 드롭: 전체 영역에 파일 드롭 시 자동 첨부
- [ ] 최종 프롬프트 프리뷰: 카드+텍스트 조합 자동 생성 + 직접 수정
- [ ] Phase progress bar: 5 phases, connecting lines, status icons with animations
- [ ] Feedback chips: clickable toggle with visual selected state
- [ ] Star rating sliders: range input with visual ★ display
- [ ] localStorage: create → save → reload → project appears
- [ ] Recovery URL: generate token → copy → /resume/:token → redirect to project
- [ ] Gallery: filter, search, masonry layout
- [ ] Mobile responsive: bottom tab nav, single column
- [ ] All animations: spin, pulse, fade-in, translateY hover
- [ ] Dark theme consistent
- [ ] Korean text everywhere
- [ ] #/test: 15+ tests, results displayed, pass/fail counts

## DO NOT
- Use any external CSS/JS libraries
- Create multiple files
- Use JSX or TypeScript
- Add npm/webpack/build steps
- Leave placeholder TODO comments — implement everything
- Skip any validation checklist item
