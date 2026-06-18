# Codex Split 1 — Core Shell + Wizard

## Output File
Write to: `index-part1.html` (NEW file, do NOT touch existing index.html)

## Read First
- `docs/PRD-multiuser-ui.md` — full spec
- `index.html` lines 1-1330 — existing design doc (reference only, do NOT include)

## What to Build (Part 1 of 2)
A complete HTML file with:
1. **CSS**: Dark theme (see variables below), responsive grid, card hover effects, page transitions
2. **App Shell**: Hash SPA router (8 routes), fixed top nav, bottom tab bar (< 720px)
3. **Landing (#/)**: SVG 5-phase loop animation (15s @keyframes), hero with "프롬프트를 쓰지 마세요. 고르세요." + subtitle "또는 자유롭게 프롬프트와 참고 자료로 방향을 지정하세요", CTA button, 4 gallery preview thumbnails, category tags, 3-slide tutorial overlay
4. **New Project Wizard (#/new)**: 3-step card selection (topics/styles/moods) + prompt textarea (2000char limit with counter) + reference image upload (FileReader base64, max 5, 120x120 thumbs) + reference URL input (max 3) + drag-and-drop global overlay + "AI 추천" random button + live preview panel. Step 2 also has style reference attachments. Step 3 has final prompt editor (auto-combined + manual edit + reset). All selections stored in App.wizData.
5. **Storage Layer**: localStorage read/write, cle_projects array schema, cle_settings schema
6. **Toast System**: showToast(msg, type) — bottom center, slide-up animation, 2s auto-dismiss
7. **Mobile**: @media 720px (single column + bottom nav), @media 480px (1-col cards)

## CSS Variables
```css
--bg:#0a0e17;--surface:#111827;--surface2:#1a2235;--border:#1e293b;
--text:#e2e8f0;--text2:#94a3b8;--accent:#6366f1;--accent2:#818cf8;
--green:#22c55e;--amber:#f59e0b;--red:#ef4444;--teal:#14b8a6;--purple:#a855f7;--blue:#3b82f6;
--radius:12px;--shadow:0 4px 24px rgba(0,0,0,.3);--tr:.3s ease
```

## Card Data
Topics: SF🚀, 판타지🧙, 현대🏙️, 역사📜, 드라마🎭, 커스텀✏️
Styles: 수채화🎨, 잉크✒️, 유화🖌️, 디지털💻, 사실주의📷, 팝아트🎭
Moods: 밝고 따뜻🌅, 어두운 미스터리🌙, 역동적⚡, 차분🌿, 강렬🔥, 몽환적✨

## Rules
- Single file, ALL CSS in <style>, ALL JS in <script>
- Korean UI text everywhere
- Every button/input must work (no stubs)
- At end of file: `// === PART 2 WILL BE APPENDED HERE ===`
- Target: ~1000-1200 lines
- localStorage schema: {cle_projects:[{id,title,topic_cards,style_cards,mood_cards,prompt_text,final_prompt,reference_images:[{id,name,data,size}],reference_urls:[{id,url,title}],phases:{define:{status},generate:{status,candidates:[]},evaluate:{status},refine:{status},deliver:{status}},feedback:{chips:[],rating_direction:3,rating_quality:3,comment:''},privacy:'private',created:0,modified:0,recoveryToken:''}], cle_settings:{theme:'dark',tutorial_seen:false}}
