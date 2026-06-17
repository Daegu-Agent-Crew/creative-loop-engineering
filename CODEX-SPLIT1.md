# Codex Task: Creative Loop Engine v2 — Split 1 (구조 + 랜딩 + 위저드 + 스토리지)

## Context
Split 1/2. PRD 전체는 `docs/PRD-multiuser-ui.md`. Split 2에서 갤러리/설정/테스트/프로젝트 대시보드를 이어서 구현합니다.
기존 index.html.v1.bak의 주석 블록(1~1330줄)을 그대로 보존하고, 그 아래에 새 SPA 코드를 작성하세요.

## Architecture
- **Single HTML file**: `index.html` (Vanilla SPA)
- **Hash-based routing**: `#/`, `#/new`, `#/dashboard`, `#/project/:id`, `#/resume/:token`
- **State**: localStorage + sessionStorage
- **Dark theme** CSS Variables
- **Korean UI** throughout

## ★ NEW: 프롬프트 + 참고 자료 입력
3단계 카드 선택에 **자유 텍스트 프롬프트와 참고 자료 입력**을 추가합니다.

### Step 1: 주제 선택
- 기존 6개 카드 그리드: 🚀 SF미래, 🧙 판타지마법, 🏙️ 현대일상, 📜 역사, 🎭 드라마, ✏️ 커스텀
- 카드 아래에 **"또는 자유롭게 입력하세요"** 텍스트 영역
  - textarea, placeholder에 랜덤 예시 3가지 (JS로 랜덤 선택)
  - 2000자 제한, 실시간 글자 수 카운터
- **참고 자료 첨부** 영역
  - [이미지 첨부] 버튼 → FileReader로 base64 읽어 120x120 썸네일 미리보기 (최대 5장)
  - [URL 추가] 텍스트 입력 (최대 3개)
  - 각 첨부물: X 버튼 삭제
  - **전체 영역 drag & drop**: 파일 드롭 시 자동 첨부
  - CSS: drag-over 시 border highlight

### Step 2: 화풍 선택
- 카드: 🎨 수채화, ✒️ 잉크, 🖌️ 유화, 💻 디지털아트, 📷 사실주의, 🎭 팝아트
- 아래에 화풍 참고 이미지 첨부 (Step 1과 동일 UI)

### Step 3: 분위기 + 최종 프롬프트
- 카드: 🌅 밝고따뜻함, 🌙 어두운미스터리, ⚡ 역동적, 🌿 차분, 🔥 강렬, ✨ 몽환적
- 아래에 **최종 프롬프트 프리뷰**
  - 자동 생성: 카드 선택 + 텍스트 + 참고자료 조합
  - textarea로 직접 수정 가능
  - "초기화" 버튼

### 미리보기 패널 (오른쪽 사이드바)
- 선택 조합 실시간 프리뷰 (카드 태그 + 프롬프트 요약)
- 참고 자료 썸네일 미리보기
- gradient 샘플 배경

## Split 1 Scope Only (Build NOW)

### 1. App Shell & Router
- Hash-based SPA router (5 routes for now: /, /new, /dashboard, /project/:id, /resume/:token)
- Global nav: logo (🔄), links (홈/대시보드/갤러리/설정)
- Page transition: 0.3s opacity fade + translateY(8px)
- IntersectionObserver scroll-reveal
- Bottom tab nav (mobile 720px 이하)

### 2. Landing Page (#/)
- Hero: SVG 루프 애니메이션 (5 phases cycling, CSS @keyframes 15초)
- Headline: "프롬프트를 쓰지 마세요. 고르세요."
- Subtext: "또는 자유롭게 프롬프트와 참고 자료로 방향을 지정하세요"
- CTA: "바로 체험하기" → #/new
- Gallery preview strip (4 placeholder items)
- Category tags
- Tutorial: 3-slide (localStorage tutorial_seen)

### 3. New Project (#/) — Full 3-step wizard with 프롬프트+참고자료

### 4. Dashboard (#/dashboard)
- Project cards grid from localStorage
- Filter: 전체/진행중/완료
- Empty state

### 5. Project Page (#/project/:id) — Structure only
- Title + 참고자료 미리보기 (접기/펼치기)
- 프롬프트 보기/복사 섹션
- 5-Phase visual pipeline (connecting lines, status icons)
- 4-candidate placeholder grid
- Status display bar
- **Split 2에서 피드백 UI, 복구 URL, 공개설정 추가**

### 6. Resume (#/resume/:token)
- Token → project lookup → redirect

### 7. localStorage Schema
```json
{
  "cle_projects": [
    {
      "id": "unique-id",
      "title": "auto-generated or from prompt",
      "topic_cards": ["sf"],
      "style_cards": ["watercolor"],
      "mood_cards": ["dark"],
      "prompt_text": "user's free prompt...",
      "reference_images": [{ "id": "r1", "name": "ref.jpg", "data": "base64...", "size": 123456 }],
      "reference_urls": [{ "id": "u1", "url": "https://...", "title": "참고" }],
      "final_prompt": "combined prompt...",
      "phases": { "define": {"status": "idle"}, "generate": {"status": "idle", "candidates": []}, "evaluate": {"status": "idle"}, "refine": {"status": "idle"}, "deliver": {"status": "idle"} },
      "feedback": { "chips": [], "rating_direction": 3, "rating_quality": 3, "comment": "" },
      "privacy": "private",
      "created": 0, "modified": 0, "recoveryToken": "abc"
    }
  ],
  "cle_settings": { "theme": "dark", "tutorial_seen": false }
}
```

## CSS Variables
```css
:root {
  --bg: #0a0e17; --surface: #111827; --surface2: #1a2235; --border: #1e293b;
  --text: #e2e8f0; --text2: #94a3b8; --accent: #6366f1; --accent2: #818cf8;
  --green: #22c55e; --amber: #f59e0b; --red: #ef4444; --teal: #14b8a6;
  --purple: #a855f7; --blue: #3b82f6; --radius: 12px; --shadow: 0 4px 24px rgba(0,0,0,0.3);
  --transition: 0.3s ease;
}
```

## Visual Quality
- Card hover: translateY(-4px) + shadow + border color change
- Phase bar connecting lines + gradient sweep
- 🔄 spin, ⏳ pulse, ✅ fade-in bounce (CSS animations)
- Placeholder images: gradient divs
- 3 @media queries (960px, 720px, 480px)

## CRITICAL RULES
1. Save ALL to `index.html` — existing comment block (lines 1-1330 of .v1.bak) preserved as HTML comment at top
2. Korean text everywhere
3. No external dependencies
4. Every interactive element must work
5. Place markers where Split 2 code will be added: `<!-- SPLIT2: gallery -->`, `<!-- SPLIT2: settings -->`, `<!-- SPLIT2: feedback-ui -->`, `<!-- SPLIT2: test -->`, `<!-- SPLIT2: recovery -->`, `<!-- SPLIT2: privacy -->`

## DO NOT
- Use any external CSS/JS
- Create multiple files
- Skip any interactive element
- Leave TODO comments
