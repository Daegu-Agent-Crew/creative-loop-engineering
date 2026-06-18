# Codex Task — Creative Loop Engine v3 (Multi-Step Write)

## Context
Read `docs/PRD-multiuser-ui.md` for full spec. You are building a single-file Vanilla SPA called `index-part1.html`.

## CRITICAL: How to Write Files
`apply_patch` is BLOCKED in this sandbox. You MUST use shell `exec` commands to write files:
```
exec: /bin/sh -lc "cat > filename << 'ENDOFFILE'
(file content here)
ENDOFFILE"
```
Write the file in 3-4 chunks using exec commands. Do NOT use apply_patch.

## File to Create: `index-part1.html`

### Chunk 1 — HTML Head + CSS (write first)
Write via exec heredoc. Include:
- DOCTYPE, meta charset, viewport
- CSS Variables: --bg:#0a0e17;--surface:#111827;--surface2:#1a2235;--border:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--accent:#6366f1;--accent2:#818cf8;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--teal:#14b8a6;--purple:#a855f7;--blue:#3b82f6;--radius:12px;--shadow:0 4px 24px rgba(0,0,0,.3);--tr:.3s ease
- Reset styles, body dark theme, font-family Inter/Noto Sans KR
- Nav: fixed top, blur backdrop, logo with gradient text, nav links, bottom nav for mobile
- Buttons: .btn-primary, .btn-secondary, .btn-danger, .btn-sm, .btn-icon with hover effects
- Cards: .wiz-card with hover translateY(-4px) and glow on selected state
- Wizard: step pills (active/done), card-grid responsive
- Prompt: textarea styled, char-counter, ref-area with grid
- Toast: #toast-container fixed bottom center, .toast with slide-up animation
- Drop overlay, tutorial overlay, modal overlay
- @keyframes: toastIn/Out, loopRotate(15s), spin, pulse, bounceIn
- @media 720px: single column + bottom nav, @media 480px: 1-col cards
- Phase pipeline: .phase-node, .phase-icon, .phase-connector with gradient done state
- Candidate grid 2x2, status bar color-coded, feedback chips with selected state
- Star rating, privacy options, collapsible sections, project cards, masonry gallery
- Empty state, footer, page transition .route-view opacity+translateY

### Chunk 2 — HTML Body Structure + Nav + Toast Container
Write via exec heredoc. Include:
- <nav> with logo "🔄 CLE", nav links div, toast container div, drop overlay div, tutorial overlay with card/dots/buttons, modal overlay with content div
- <div id="app"></div>, bottom nav, footer

### Chunk 3 — JavaScript Part A (Constants + Storage + Utils + App Shell)
Write via exec heredoc. Include:
- Utils: $ selector, uid generator, clamp, toast(msg,type) function
- STORAGE object: get/set/remove, projects/settings properties
- Constants: TOPICS(6), STYLES(6), MOODS(6) arrays with id/icon/title/desc
- PHASES(5) array with key/label/icon/color
- FEEDBACK_CHIPS(8), PROMPT_EXAMPLES(5), GALLERY_ITEMS(10) with gradients
- TUTORIAL(3) slides
- App object with: init, buildNav, route (hash router for 8 routes), updateNav, clearPhaseIntervals

### Chunk 4 — JavaScript Part B (Render Methods + Event Handlers)
Write via exec heredoc. Include:
- renderLanding: hero, SVG loop animation, category tags, gallery strip, tutorial
- renderNewProject: wizard with 3 steps, card grids, prompt textarea(2000char), ref images/URLs, style refs, final prompt editor, preview panel, step navigation
- toggleCard, nextStep, prevStep, randomSelect, createProject
- File handlers: initDragDrop, processFiles(FileReader base64), addImage, removeImage, toggleUrlInput, addUrl, removeUrl, addStyleImage, removeStyleImage, addStyleUrl
- updatePrompt, updateFinalPrompt, resetFinalPrompt
- buildAutoPrompt method
- renderDashboard, renderProject, renderGallery, renderSettings, renderTest, handleResume — all as STUBS returning "Part 2 will add: [route name]" (but renderDashboard, renderGallery, renderSettings, renderTest should return real HTML even if basic)
- closeModal, closeTutorial, showTutorial
- Run tests: runTests with 15+ tests for routing, storage, wizard, chips, ratings
- Auto phase simulation: simulatePhases with setInterval
- App.init() on DOMContentLoaded

## Rules
- Korean UI text everywhere
- All CSS in <style>, all JS in <script>
- Every interactive element must work
- Comment at end: // === PART 2 WILL APPEND DASHBOARD/PROJECT/GALLERY DETAILS ===
- Target: ~1500 lines total
- localStorage schema: cle_projects array, cle_settings object
