# Codex Task: Creative Loop Engineering - Phase 1 SPA

## Context
You are building Phase 1 (Prototype) of a Creative Loop Engineering multi-user UI system.
The full PRD is in `docs/PRD-multiuser-ui.md` — READ IT FIRST.

## Architecture
- **Single HTML file**: `index.html` (Vanilla SPA, no frameworks)
- **Hash-based routing**: `#/landing`, `#/new`, `#/dashboard`, `#/project/:id`, `#/gallery`, `#/settings`, `#/resume/:token`
- **State management**: localStorage for projects, sessionStorage for current session
- **Design system**: Dark theme with CSS Variables (defined in PRD Section 8)
- **GitHub Pages deployable**: Everything in one HTML file

## CRITICAL RULES
1. **Save ALL code to index.html** — this is the ONLY output file
2. **Keep the existing index.html content as a comment block at the top** (it's the original design doc)
3. **Mobile-first responsive design** — cards 2-col desktop, 1-col mobile
4. **No external dependencies** — no CDN links, no npm, pure vanilla
5. **Korean UI text** — all labels, buttons, messages in Korean
6. **Test in browser after completion** — must work when opened as a file

## Phase Split 1 Scope (Build NOW)

### 1. App Shell & Router
- Hash-based SPA router with page transitions (smooth fade)
- Global nav header: logo (emoji loop icon), nav links, GitHub login button (Phase 2 placeholder)
- Dark theme using CSS Variables from PRD section 8.1
- Footer with "Creative Loop Engine v1.0"

### 2. Landing Page (#/)
- Hero section with animated SVG loop (5 phases cycling: Define→Generate→Evaluate→Refine→Deliver)
- Headline: "프롬프트를 쓰지 마세요. 고르세요."
- Subtitle: "3단계 카드 선택으로 창의적 산출물 생성"
- "바로 체험하기" CTA button → navigates to #/new
- Recent gallery thumbnails section (placeholder images from picsum or colored divs)
- Category tags: 만화 / 일러스트 / 스토리보드 / 글쓰기
- Tutorial: 3-step onboarding slides (auto-dismiss, localStorage remembers)

### 3. New Project Page (#/new)
- **3-step card selection wizard** with step indicator (Step 1/3, 2/3, 3/3)
- **Step 1: 주제 선택** — Cards: 🚀 SF미래, 🧙 판타지마법, 🏙️ 현대일상, 📜 역사, 🎭 드라마, ✏️ 커스텀
- **Step 2: 화풍 선택** — Cards: 🎨 수채화, ✒️ 잉크, 🖌️ 유화, 💻 디지털아트, 📷 사실주의, 🎭 팝아트
- **Step 3: 분위기 선택** — Cards: 🌅 밝고따뜻함, 🌙 어둡고미스터리, ⚡ 역동적, 🌿 차분하고편안함, 🔥 강렬하고대담함, ✨ 몽환적
- Multi-select possible (highlighted with accent border + glow)
- Custom card: text input for free entry
- "AI가 추천해줘" random button
- Right-side preview panel showing selected combination
- Bottom info bar: "예상 생성 시간: ~2분 | 결과물 수: 4개 후보"
- "🚀 생성 시작" button creates project and navigates to #/project/:id
- Back/Next step navigation

### 4. Project Dashboard (#/project/:id)
- Project title from selected cards (e.g., "SF 수채화 만화")
- **Visual Phase Progress Bar**: 5 phases in a horizontal pipeline
  - ① Define → ② Generate → ③ Evaluate → ④ Refine → ⑤ Deliver
  - Each phase shows status icon: ⏳ idle, 🔄 generating, ✅ complete, ❌ failed
  - Phase colors: Define=blue, Generate=purple, Evaluate=amber, Refine=green, Deliver=teal
  - Active phase highlighted, completed phases green, pending gray
- **Candidate Results Area**: 4 thumbnail slots (2x2 grid)
  - Placeholder: colored placeholder divs with "대기" text
  - Completed: thumbnail with candidate number
  - Failed: error indicator with retry button
- **Status Display Bar**: Shows current phase, progress text, time estimate
  - States: idle, generating, partial_fail, complete, timeout, network_error
  - Each state has icon, color, animation per PRD section 8.4
- **Gate Feedback UI** (when candidates complete):
  - Structured feedback chips (selectable): 색감 더 강하게, 캐릭터 유지, 배경 단순화, 텍스트 더 적게, 구도 유지, 더 밝게
  - Star rating sliders: 방향성 ★★★★★, 품질 ★★★★★
  - Action buttons: ✅ 승인, 🔄 재생성, ✏️ 방향 수정
  - Optional comment text input
  - Chips use .feedback-chip CSS from PRD section 8.3
- **Recovery URL**: "/resume/TOKEN" shown with clipboard copy button
- **Privacy Controls**: Radio buttons — 비공개, 링크 공유, 갤러리 공개

### 5. Dashboard (#/dashboard)
- Project cards grid showing all projects from localStorage
- Each card: thumbnail, title, phase progress, status, last modified
- Filter: 전체 / 진행중 / 완료
- "새 프로젝트" button → #/new
- Empty state message if no projects

### 6. Gallery (#/gallery)
- Masonry grid layout (CSS columns)
- Placeholder gallery items with category tags
- Filter bar: 카테고리, 화풍, 최신, 인기
- Search input
- Like count, clone button per item
- Click → detail view modal

### 7. Settings (#/settings)
- Theme: dark only for Phase 1
- Language: Korean only for Phase 1
- Account section: "GitHub 연동 (Phase 2)" disabled placeholder
- Discord 연동 placeholder (Phase 2.5)
- Clear all data button with confirmation

### 8. Guest Resume (#/resume/:token)
- Read token from URL, lookup project in localStorage
- Restore project to sessionStorage and redirect to #/project/:id
- "프로젝트를 찾을 수 없습니다" error state

### 9. localStorage Schema
```json
{
  "cle_projects": [
    {
      "id": "unique-id",
      "title": "SF 수채화 만화",
      "topic": ["sf"],
      "style": ["watercolor"],
      "mood": ["dark"],
      "phases": {
        "define": { "status": "complete", "timestamp": 1234567890 },
        "generate": { "status": "generating", "candidates": [], "timestamp": 1234567900 },
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

## Visual Quality Requirements
- Smooth CSS transitions (0.3s ease) on all interactive elements
- Card hover effects: scale(1.02), border color change, subtle shadow
- Phase bar: connecting lines between phases, gradient on progress
- Spinning animation on 🔄 status, pulse on ⏳, fade-in on ✅
- Placeholder images: gradient colored divs (not broken image icons)
- Scroll animations: subtle fade-in on scroll
- Active nav link highlighted
- Mobile: bottom tab navigation or hamburger menu

## File Output
- Write everything to `index.html`
- The existing index.html content must be preserved as an HTML comment at the very top
- The new SPA code follows after the comment

## DO NOT
- Use any external CSS/JS libraries
- Create multiple files
- Use JSX or TypeScript
- Add npm/webpack/build steps
- Leave placeholder TODO comments — implement everything

## VALIDATION CHECKLIST
After building, verify:
- [ ] All 7 routes work (landing, new, dashboard, project/:id, gallery, settings, resume/:token)
- [ ] 3-step card wizard: cards selectable, multi-select works, custom input works
- [ ] Phase progress bar renders with 5 phases and status icons
- [ ] Feedback chips are clickable with visual toggle
- [ ] localStorage saves/loads projects correctly
- [ ] Recovery URL generation and restoration works
- [ ] Mobile responsive (test at 375px width)
- [ ] All animations work (spin, pulse, fade)
- [ ] Dark theme consistent throughout
- [ ] Korean text everywhere
