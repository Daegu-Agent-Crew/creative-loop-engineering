# Codex Split 2 — Pages + Test Suite

## Input Files
- `index-part1.html` — Part 1 output (read this file first)
- `docs/PRD-multiuser-ui.md` — full spec reference

## Task
Read `index-part1.html`, then APPEND the following to create `index-part2.html`:
1. **Dashboard (#/dashboard)**: Project card grid with filter buttons (all/active/complete), each card shows title/date/status badge, empty state with CTA
2. **Project Page (#/project/:id)**: Read project from localStorage by ID from hash.
   - Phase pipeline: 5 connected nodes (Define→Generate→Evaluate→Refine→Deliver) with status icons (⏳ idle=pulse, 🔄 generating=spin, ✅ complete=bounce, ❌ failed)
   - 4-candidate grid with gradient placeholders
   - Status bar (color-coded by state)
   - Feedback section: 8 preset chips (색감 더 강하게, 캐릭터 유지, 배경 단순화, 텍스트 더 적게, 구도 유지, 더 밝게, 디테일 강화, 분위기 유지) toggleable, 2 star-rating sliders (방향성/품질 1-5), approve/regenerate/edit buttons, comment textarea
   - Collapsible prompt viewer with copy button
   - Collapsible reference materials viewer
   - Recovery URL with clipboard copy
   - Privacy selector (private/link/gallery) — 3 radio cards
   - Auto-start phase simulation on page load: 3s intervals, idle→generating→complete, candidates fill in one by one
3. **Gallery (#/gallery)**: Masonry grid (CSS columns:3), search input, category filter buttons, 10+ placeholder items with gradient backgrounds + title + tags + like count, click opens detail modal, copy/like buttons
4. **Settings (#/settings)**: Theme/language labels, GitHub/Discord placeholder links, data delete with confirm modal
5. **Test Suite (#/test)**: 20+ auto-tests covering routing, storage CRUD, wizard card toggle, file upload logic, feedback chips/ratings/privacy, phase status, gallery search, dashboard filter. UI: header with pass/fail counters, test list with ✅/❌ icons, rerun button
6. **Resume (#/resume/:token)**: Find project by recoveryToken, redirect to /project/:id, show error toast if not found

## Also Fix/Connect Part 1
Ensure App.route() dispatches to all these new render methods. The router in Part 1 has stubs — replace them with actual implementations. All render methods return HTML strings.

## Rules
- Output: `index-part2.html` containing the FULL merged file (Part 1 + Part 2 code)
- Keep all Part 1 code exactly as-is, append Part 2 JS functions after the existing App object
- Extend App object with new render methods: renderDashboard, renderProject, renderGallery, renderSettings, renderTest, handleResume
- Phase simulation: use setInterval (clear on route change), update localStorage each step
- Target total: ~2000-2500 lines
- Every interaction must work
- Korean UI text
