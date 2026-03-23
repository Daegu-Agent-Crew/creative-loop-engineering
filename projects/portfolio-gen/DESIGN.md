# Portfolio Generator - 설계 문서

## 1. 아키텍처 개요

### 싱글 HTML SPA 구조

```
index.html (단일 파일)
├── <style>        — 전체 CSS (다크/라이트 테마, 반응형, 애니메이션)
├── <body>         — 시맨틱 HTML 구조 (섹션 기반 SPA)
│   ├── #hero          — 히어로 섹션
│   ├── #timeline      — 타임라인 뷰
│   ├── #projects      — 프로젝트 그리드
│   ├── #code-snippet  — 코드 하이라이팅
│   ├── #demo          — 라이브 데모
│   └── #about         — About / Export
└── <script>       — 전체 JS (데이터, 렌더링, 인터랙션)
```

**원칙:**
- 외부 라이브러리 없음 (순수 HTML/CSS/JS)
- 한국어 UI 기본
- 다크 테마 기본, 라이트 테마 토글
- 모든 데이터는 JS 객체로 내장, JSON import/export 지원

### 데이터 흐름

```
[projectData JSON] → render() → DOM 업데이트
       ↑                              ↓
  CRUD 이벤트 ←── 사용자 인터랙션 ←── UI
```

상태 관리는 단일 `state` 객체로 통합:

```javascript
const state = {
  projects: [],        // 프로젝트 배열
  theme: 'dark',       // 'dark' | 'light'
  activeSection: 'hero', // 현재 활성 섹션
  editingId: null,     // 편집 중인 프로젝트 ID
  sortBy: 'date',      // 정렬 기준
};
```

---

## 2. 컴포넌트 분할

### 2.1 Hero 섹션
- **역할:** 포트폴리오 소유자 소개, 전체 통계 요약
- **내용:** 이름, 타이틀, 총 프로젝트 수, 총 코드 라인 수, 기술스택 태그 클라우드
- **시각 효과:** 타이핑 애니메이션, 파티클/그리드 배경

### 2.2 Timeline 섹션
- **역할:** 프로젝트 진화 히스토리를 시간 순으로 시각화
- **내용:** 세로 타임라인, 각 노드에 프로젝트 카드, 버전 비교
- **차트:** 코드량 성장 라인 차트 (Canvas 기반)

### 2.3 Projects 섹션
- **역할:** 프로젝트 CRUD + 그리드/리스트 뷰
- **내용:** 카드 그리드, 필터(기술스택), 정렬(날짜/코드량/이름)
- **인터랙션:** 추가/편집/삭제 모달, 드래그 정렬

### 2.4 Code Snippet 섹션
- **역할:** 대표 코드 조각 하이라이팅 표시
- **내용:** 언어 선택 탭, 줄번호, 복사 버튼
- **지원 언어:** JavaScript, HTML, CSS, Python

### 2.5 Demo 섹션
- **역할:** 프로젝트 라이브 데모 또는 스크린샷 갤러리
- **내용:** iframe 임베드, 스크린샷 슬라이더, 전체화면 버튼

### 2.6 About / Export 섹션
- **역할:** 포트폴리오 소유자 상세 정보 + Export 기능
- **내용:** 자기소개, 연락처, PDF/PNG/JSON Export 버튼

---

## 3. 컴포넌트별 HTML/CSS/JS 인터페이스

### 3.1 Hero

**HTML:**
```html
<section id="hero" class="section">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <h1 class="typing-text" data-text="포트폴리오"></h1>
    <p class="hero-subtitle"></p>
    <div class="hero-stats">
      <div class="stat-item" data-stat="projects"></div>
      <div class="stat-item" data-stat="lines"></div>
      <div class="stat-item" data-stat="techs"></div>
    </div>
    <div class="tech-cloud"></div>
  </div>
</section>
```

**CSS 클래스:**
| 클래스 | 역할 |
|--------|------|
| `.hero-bg` | 배경 애니메이션 컨테이너 (CSS grid/gradient) |
| `.typing-text` | 타이핑 커서 애니메이션 |
| `.hero-stats` | flexbox 통계 카드 행 |
| `.stat-item` | 개별 통계 (숫자 카운트업 애니메이션) |
| `.tech-cloud` | 기술스택 태그 클라우드 |

**JS 함수:**
```javascript
function renderHero(state) { }      // Hero 섹션 렌더링
function animateTyping(el) { }      // 타이핑 효과
function animateCountUp(el, target) { } // 숫자 카운트업
function buildTechCloud(projects) { }   // 기술스택 집계 + 렌더
```

### 3.2 Timeline

**HTML:**
```html
<section id="timeline" class="section">
  <h2 class="section-title">프로젝트 타임라인</h2>
  <div class="timeline-container">
    <div class="timeline-line"></div>
    <div class="timeline-items"></div>
  </div>
  <canvas id="growth-chart" width="800" height="300"></canvas>
</section>
```

**CSS 클래스:**
| 클래스 | 역할 |
|--------|------|
| `.timeline-container` | 상대 위치 컨테이너 |
| `.timeline-line` | 세로 중앙선 |
| `.timeline-item` | 개별 타임라인 노드 (좌우 교차) |
| `.timeline-dot` | 타임라인 위 원형 점 |
| `.timeline-card` | 노드에 붙는 프로젝트 카드 |

**JS 함수:**
```javascript
function renderTimeline(projects) { }   // 타임라인 DOM 생성
function renderGrowthChart(canvas, projects) { } // Canvas 차트
function animateTimelineEntry(el) { }   // 스크롤 진입 애니메이션
```

### 3.3 Projects

**HTML:**
```html
<section id="projects" class="section">
  <h2 class="section-title">프로젝트</h2>
  <div class="projects-toolbar">
    <div class="filter-tags"></div>
    <div class="sort-controls"></div>
    <button class="btn-add-project">+ 새 프로젝트</button>
  </div>
  <div class="projects-grid"></div>
</section>

<!-- 모달 (body 하단) -->
<div id="project-modal" class="modal">
  <div class="modal-content">
    <form id="project-form">
      <input name="name" placeholder="프로젝트명" required />
      <textarea name="description" placeholder="설명"></textarea>
      <input name="techStack" placeholder="기술스택 (콤마 구분)" />
      <input name="link" placeholder="링크 URL" />
      <input name="image" placeholder="이미지 URL" />
      <input name="lines" type="number" placeholder="코드 라인 수" />
      <input name="date" type="date" />
      <input name="version" placeholder="버전 (예: v7)" />
      <textarea name="codeSnippet" placeholder="대표 코드 스니펫"></textarea>
      <select name="language">
        <option value="javascript">JavaScript</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="python">Python</option>
      </select>
      <button type="submit">저장</button>
      <button type="button" class="btn-cancel">취소</button>
    </form>
  </div>
</div>
```

**CSS 클래스:**
| 클래스 | 역할 |
|--------|------|
| `.projects-grid` | CSS Grid (auto-fill, minmax(320px, 1fr)) |
| `.project-card` | 개별 카드 (호버 리프트 효과) |
| `.project-card__image` | 카드 상단 이미지 영역 |
| `.project-card__body` | 카드 본문 (이름, 설명, 메타) |
| `.project-card__tags` | 기술스택 태그 리스트 |
| `.project-card__actions` | 편집/삭제 버튼 행 |
| `.modal` | 오버레이 모달 |
| `.modal-content` | 모달 박스 (max-width: 600px) |

**JS 함수:**
```javascript
function renderProjects(projects, filter, sort) { } // 그리드 렌더링
function openModal(projectId?) { }   // 추가/편집 모달 열기
function closeModal() { }           // 모달 닫기
function saveProject(formData) { }  // 저장 (추가 또는 업데이트)
function deleteProject(id) { }      // 삭제 (확인 후)
function filterByTech(tech) { }     // 기술스택 필터
function sortProjects(by) { }       // 정렬
```

### 3.4 Code Snippet

**HTML:**
```html
<section id="code-snippet" class="section">
  <h2 class="section-title">코드 하이라이팅</h2>
  <div class="snippet-tabs"></div>
  <div class="snippet-viewer">
    <div class="snippet-header">
      <span class="snippet-lang"></span>
      <button class="btn-copy">복사</button>
    </div>
    <pre class="snippet-pre"><code class="snippet-code"></code></pre>
  </div>
</section>
```

**CSS 클래스:**
| 클래스 | 역할 |
|--------|------|
| `.snippet-viewer` | 코드 뷰어 컨테이너 (border-radius, 그림자) |
| `.snippet-header` | 상단 바 (언어명 + 복사 버튼) |
| `.snippet-pre` | 줄번호 + 코드 영역 (overflow-x: auto) |
| `.snippet-code` | 하이라이트된 코드 |
| `.line-number` | 줄번호 (사용자 선택 불가) |
| `.token-keyword` | 키워드 색상 |
| `.token-string` | 문자열 색상 |
| `.token-comment` | 주석 색상 |
| `.token-function` | 함수명 색상 |
| `.token-number` | 숫자 색상 |
| `.token-tag` | HTML 태그 색상 |
| `.token-attr` | HTML 속성 색상 |
| `.token-property` | CSS 속성 색상 |

**JS 함수:**
```javascript
function renderSnippet(code, language) { } // 코드 하이라이팅 + 줄번호
function highlight(code, language) { }     // 정규식 기반 하이라이팅
function copyToClipboard(text) { }         // 클립보드 복사
```

### 3.5 Demo

**HTML:**
```html
<section id="demo" class="section">
  <h2 class="section-title">라이브 데모</h2>
  <div class="demo-selector"></div>
  <div class="demo-container">
    <iframe class="demo-iframe" sandbox="allow-scripts"></iframe>
    <div class="demo-gallery"></div>
    <button class="btn-fullscreen">전체화면</button>
  </div>
</section>
```

**CSS 클래스:**
| 클래스 | 역할 |
|--------|------|
| `.demo-container` | 데모 프레임 래퍼 (aspect-ratio: 16/9) |
| `.demo-iframe` | iframe (100% 크기) |
| `.demo-gallery` | 스크린샷 슬라이더 |
| `.btn-fullscreen` | 전체화면 토글 |

**JS 함수:**
```javascript
function renderDemo(project) { }         // 데모 또는 갤러리 렌더
function toggleFullscreen(el) { }        // Fullscreen API 호출
function renderGallery(screenshots) { }  // 이미지 슬라이더
```

### 3.6 About / Export

**HTML:**
```html
<section id="about" class="section">
  <h2 class="section-title">About</h2>
  <div class="about-content">
    <div class="about-bio"></div>
    <div class="about-contact"></div>
  </div>
  <div class="export-panel">
    <button class="btn-export" data-type="pdf">PDF 다운로드</button>
    <button class="btn-export" data-type="png">PNG 스크린샷</button>
    <button class="btn-export" data-type="json-export">JSON 내보내기</button>
    <button class="btn-export" data-type="json-import">JSON 가져오기</button>
    <input type="file" id="json-import-input" accept=".json" hidden />
  </div>
</section>
```

**JS 함수:**
```javascript
function exportPDF() { }             // window.print() 기반
function exportPNG() { }             // canvas 캡처 (html2canvas 없이 수동)
function exportJSON() { }            // state → JSON 다운로드
function importJSON(file) { }        // JSON → state 복원
```

---

## 4. 팀 분할 계획

### Team A: 구조 + 데이터
**담당 영역:**
- HTML 시맨틱 구조 전체
- `state` 객체 및 데이터 모델 설계
- 프로젝트 CRUD 로직 (추가/편집/삭제)
- 모달 폼 처리
- JSON import/export
- 라우팅 (해시 기반 섹션 네비게이션)
- 8개 사전 프로젝트 데이터 입력

**산출물:** 동작하는 HTML 골격 + 데이터 레이어 + CRUD

### Team B: 스타일 + 애니메이션
**담당 영역:**
- 전체 CSS 설계 (CSS 변수 기반 테마)
- 다크/라이트 테마 토글
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 스크롤 애니메이션 (IntersectionObserver)
- 타이핑 애니메이션, 카운트업
- 카드 호버/전환 효과
- 부드러운 스크롤 네비게이션

**산출물:** 완성된 CSS + 애니메이션 JS 모듈

### Team C: 차트 + 인터랙션
**담당 영역:**
- Canvas 기반 코드량 성장 차트
- 타임라인 시각화 렌더링
- 코드 하이라이팅 엔진 (정규식)
- 데모 iframe 관리 + 갤러리 슬라이더
- 클립보드 복사 기능
- PDF/PNG Export 구현
- Fullscreen API 연동

**산출물:** 차트 렌더러 + 하이라이터 + Export 엔진

### 팀 간 인터페이스 규약

```
Team A ←→ Team B : CSS 클래스명 규약 (BEM 변형), CSS 변수 목록
Team A ←→ Team C : state 객체 구조, render 함수 시그니처
Team B ←→ Team C : 캔버스 컨테이너 크기, 애니메이션 트리거 이벤트
```

**CSS 변수 (Team B 정의, 전원 사용):**
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0b0;
  --accent: #00d4ff;
  --accent-secondary: #7c4dff;
  --border: #2a2a3e;
  --radius: 12px;
  --shadow: 0 4px 20px rgba(0,0,0,0.3);
  --transition: 0.3s ease;
}

[data-theme="light"] {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #555;
  --border: #ddd;
  --shadow: 0 4px 20px rgba(0,0,0,0.1);
}
```

---

## 5. 체크리스트

### Phase 1: 골격 (Team A 리드)
- [ ] HTML 시맨틱 구조 작성 (6개 섹션)
- [ ] `state` 객체 정의 및 초기화
- [ ] 8개 사전 프로젝트 데이터 입력
- [ ] 프로젝트 CRUD 함수 구현
- [ ] 모달 폼 UI + 이벤트 바인딩
- [ ] 해시 기반 네비게이션 (`#hero`, `#timeline` 등)
- [ ] JSON export/import 기본 구현
- [ ] CSS 변수 시스템 + 다크 테마 기본 스타일

### Phase 2: 스타일 + 시각화 (Team B + C 병렬)
- [ ] 반응형 CSS Grid/Flexbox 레이아웃
- [ ] 다크/라이트 테마 토글 완성
- [ ] 카드 호버 효과 + 전환 애니메이션
- [ ] IntersectionObserver 스크롤 애니메이션
- [ ] Hero 타이핑 + 카운트업 애니메이션
- [ ] Canvas 코드량 성장 차트
- [ ] 타임라인 시각화 렌더링
- [ ] 코드 하이라이팅 엔진 구현
- [ ] 줄번호 + 복사 버튼
- [ ] 데모 iframe + 스크린샷 갤러리

### Phase 3: 마무리 + Export (전원)
- [ ] PDF Export (window.print 최적화, @media print)
- [ ] PNG Export (Canvas 캡처)
- [ ] JSON 백업/복원 테스트
- [ ] 모바일 반응형 QA
- [ ] 다크/라이트 전환 QA
- [ ] 접근성 검토 (키보드 탐색, aria-label)
- [ ] 성능 최적화 (대량 DOM 시 지연 렌더링)
- [ ] 최종 통합 테스트

---

## 6. 사전 입력 프로젝트 데이터 구조

### JSON 스키마

```javascript
const projectData = [
  {
    id: "matgo-v7",
    name: "맞고 v7",
    description: "한국 전통 카드 게임 고스톱을 웹으로 구현. AI 상대, 점수 계산, 애니메이션 포함.",
    version: "v7",
    date: "2025-12-01",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas"],
    lines: 2958,
    link: "",
    image: "",
    codeSnippet: `// 패 조합 판정\nfunction checkGo(hand) {\n  const groups = groupByMonth(hand);\n  return Object.values(groups)\n    .filter(g => g.length >= 3);\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "openclaw-viz-v4",
    name: "OpenClaw Visualizer v4",
    description: "OpenClaw 에이전트 시스템의 실시간 상태를 시각화하는 대시보드.",
    version: "v4",
    date: "2026-01-15",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas", "SVG"],
    lines: 3196,
    link: "",
    image: "",
    codeSnippet: `// 노드 연결 시각화\nfunction drawConnections(ctx, nodes) {\n  nodes.forEach(node => {\n    node.connections.forEach(target => {\n      ctx.beginPath();\n      ctx.moveTo(node.x, node.y);\n      ctx.lineTo(target.x, target.y);\n      ctx.stroke();\n    });\n  });\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "agent-core-viz",
    name: "Agent Core 시각화",
    description: "에이전트 코어의 3가지 측면을 시각화: 브레인 맵, 팩토리 프로세스, 미션 트래커.",
    version: "v1",
    date: "2026-01-20",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas"],
    lines: 3500,
    link: "",
    image: "",
    codeSnippet: `// 브레인 뉴런 네트워크\nclass Neuron {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n    this.connections = [];\n    this.activation = 0;\n  }\n  fire() {\n    this.activation = 1;\n    this.connections.forEach(n => n.receive(0.5));\n  }\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: "",
    subFiles: ["brain.html", "factory.html", "mission.html"]
  },
  {
    id: "context-viz-v5",
    name: "Context Visualizer v5",
    description: "AI 컨텍스트 윈도우의 토큰 사용량, 메시지 구조를 실시간 시각화.",
    version: "v5",
    date: "2026-02-01",
    techStack: ["HTML", "CSS", "JavaScript", "SVG"],
    lines: 1989,
    link: "",
    image: "",
    codeSnippet: `// 토큰 사용량 게이지\nfunction renderGauge(ctx, used, total) {\n  const ratio = used / total;\n  const angle = ratio * Math.PI * 2;\n  ctx.beginPath();\n  ctx.arc(cx, cy, r, 0, angle);\n  ctx.strokeStyle = ratio > 0.9 ? '#ff4444' : '#00d4ff';\n  ctx.stroke();\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "prompt-explorer-v6",
    name: "Prompt Explorer v6",
    description: "프롬프트 패턴 탐색기. 카테고리별 분류, 검색, 즐겨찾기 기능.",
    version: "v6",
    date: "2026-02-10",
    techStack: ["HTML", "CSS", "JavaScript"],
    lines: 2200,
    link: "",
    image: "",
    codeSnippet: `// 프롬프트 검색 엔진\nfunction searchPrompts(query, prompts) {\n  const terms = query.toLowerCase().split(/\\s+/);\n  return prompts.filter(p =>\n    terms.every(t =>\n      p.title.toLowerCase().includes(t) ||\n      p.body.toLowerCase().includes(t)\n    )\n  );\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "context-lab-v7",
    name: "Context Lab v7",
    description: "컨텍스트 실험실. 다양한 프롬프트 전략의 효과를 A/B 테스트.",
    version: "v7",
    date: "2026-02-20",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas"],
    lines: 2088,
    link: "",
    image: "",
    codeSnippet: `// A/B 테스트 결과 비교\nfunction compareResults(a, b) {\n  return {\n    winner: a.score > b.score ? 'A' : 'B',\n    diff: Math.abs(a.score - b.score),\n    confidence: calculateConfidence(a, b)\n  };\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "oc-devmon-v8",
    name: "OC-DevMon v8",
    description: "OpenClaw 개발 모니터링 대시보드. 빌드 상태, 에러 추적, 성능 메트릭.",
    version: "v8",
    date: "2026-03-01",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas", "SVG"],
    lines: 4545,
    link: "",
    image: "",
    codeSnippet: `// 실시간 메트릭 스트림\nclass MetricStream {\n  constructor(capacity = 100) {\n    this.buffer = [];\n    this.capacity = capacity;\n  }\n  push(value) {\n    this.buffer.push({ value, ts: Date.now() });\n    if (this.buffer.length > this.capacity)\n      this.buffer.shift();\n  }\n  average() {\n    return this.buffer.reduce((s, m) => s + m.value, 0)\n      / this.buffer.length;\n  }\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  },
  {
    id: "neural-map-v9",
    name: "Neural Map v9",
    description: "뉴럴 네트워크 구조를 인터랙티브 맵으로 시각화. 레이어별 탐색, 가중치 히트맵.",
    version: "v9",
    date: "2026-03-15",
    techStack: ["HTML", "CSS", "JavaScript", "Canvas", "WebGL"],
    lines: 4549,
    link: "",
    image: "",
    codeSnippet: `// 레이어 가중치 히트맵\nfunction renderHeatmap(ctx, weights, w, h) {\n  const cellW = w / weights[0].length;\n  const cellH = h / weights.length;\n  weights.forEach((row, i) => {\n    row.forEach((val, j) => {\n      ctx.fillStyle = weightToColor(val);\n      ctx.fillRect(j * cellW, i * cellH, cellW, cellH);\n    });\n  });\n}`,
    language: "javascript",
    screenshots: [],
    demoUrl: ""
  }
];
```

### 개별 프로젝트 스키마

```typescript
interface Project {
  id: string;            // 고유 식별자 (kebab-case)
  name: string;          // 프로젝트명
  description: string;   // 설명 (1-2문장)
  version: string;       // 버전 (예: "v7")
  date: string;          // ISO 날짜 (정렬 기준)
  techStack: string[];   // 기술스택 배열
  lines: number;         // 코드 라인 수
  link: string;          // 외부 링크 URL
  image: string;         // 대표 이미지 URL
  codeSnippet: string;   // 대표 코드 스니펫 (원본 텍스트)
  language: string;      // 스니펫 언어 ("javascript"|"html"|"css"|"python")
  screenshots: string[]; // 스크린샷 URL 배열
  demoUrl: string;       // 라이브 데모 URL (iframe용)
  subFiles?: string[];   // 서브 파일 목록 (선택)
}
```

---

## 7. 코드 하이라이팅 알고리즘

### 설계 원칙
- 순수 정규식 기반 (외부 라이브러리 없음)
- 언어별 규칙 세트 분리
- HTML escape 우선 → 토큰화 → span 래핑

### 처리 파이프라인

```
원본 코드
  → (1) HTML escape (& < > " ')
  → (2) 정규식 토큰 매칭 (우선순위 순)
  → (3) span.token-{type} 래핑
  → (4) 줄번호 삽입
  → 최종 HTML
```

### 언어별 정규식 규칙

```javascript
const HIGHLIGHT_RULES = {
  javascript: [
    // 우선순위 순서대로 매칭 (먼저 매칭된 것이 이김)
    { type: 'comment',  regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
    { type: 'string',   regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g },
    { type: 'keyword',  regex: /\b(const|let|var|function|class|return|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|import|export|from|default|try|catch|finally|throw|async|await|yield|of|in)\b/g },
    { type: 'boolean',  regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g },
    { type: 'function', regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g },
    { type: 'number',   regex: /\b(\d+\.?\d*(?:e[+-]?\d+)?|0x[\da-f]+|0b[01]+|0o[0-7]+)\b/gi },
    { type: 'operator', regex: /(=>|\.{3}|[+\-*/%=!<>&|^~?]+)/g },
  ],
  html: [
    { type: 'comment',  regex: /(<!--[\s\S]*?-->)/g },
    { type: 'tag',      regex: /(&lt;\/?)([\w-]+)/g },          // 태그명
    { type: 'attr',     regex: /\s([\w-]+)(?==)/g },            // 속성명
    { type: 'string',   regex: /("[^"]*"|'[^']*')/g },          // 속성값
    { type: 'bracket',  regex: /(&lt;\/?|\/?\s*&gt;)/g },       // < > / 괄호
  ],
  css: [
    { type: 'comment',  regex: /(\/\*[\s\S]*?\*\/)/g },
    { type: 'selector', regex: /([.#]?[\w-]+)(?=\s*\{)/g },
    { type: 'property', regex: /([\w-]+)\s*(?=:)/g },
    { type: 'string',   regex: /("[^"]*"|'[^']*')/g },
    { type: 'number',   regex: /(\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg)?)\b/g },
    { type: 'keyword',  regex: /(@media|@keyframes|@import|@font-face)\b/g },
    { type: 'color',    regex: /(#[\da-f]{3,8})\b/gi },
  ],
  python: [
    { type: 'comment',  regex: /(#.*$)/gm },
    { type: 'string',   regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g },
    { type: 'keyword',  regex: /\b(def|class|return|if|elif|else|for|while|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|is|in|True|False|None|self|async|await)\b/g },
    { type: 'function', regex: /\b([a-zA-Z_]\w*)\s*(?=\()/g },
    { type: 'number',   regex: /\b(\d+\.?\d*(?:e[+-]?\d+)?|0x[\da-f]+|0b[01]+|0o[0-7]+)\b/gi },
    { type: 'decorator', regex: /(@\w+)/g },
  ]
};
```

### 하이라이트 엔진 핵심 로직

```javascript
function highlight(code, language) {
  // 1. HTML escape
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const rules = HIGHLIGHT_RULES[language] || [];

  // 2. 모든 토큰 위치 수집
  const tokens = [];
  rules.forEach(rule => {
    let match;
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    while ((match = re.exec(escaped)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: rule.type,
        text: match[0]
      });
    }
  });

  // 3. 정렬: 시작 위치 순, 같으면 긴 것 우선
  tokens.sort((a, b) => a.start - b.start || b.end - a.end);

  // 4. 겹치는 토큰 제거 (먼저 등장한 규칙 우선)
  const filtered = [];
  let lastEnd = 0;
  tokens.forEach(t => {
    if (t.start >= lastEnd) {
      filtered.push(t);
      lastEnd = t.end;
    }
  });

  // 5. span 래핑 (뒤에서부터 삽입하여 인덱스 보존)
  let result = escaped;
  for (let i = filtered.length - 1; i >= 0; i--) {
    const t = filtered[i];
    result =
      result.slice(0, t.start) +
      `<span class="token-${t.type}">${t.text}</span>` +
      result.slice(t.end);
  }

  return result;
}

// 줄번호 삽입
function addLineNumbers(highlightedCode) {
  const lines = highlightedCode.split('\n');
  return lines.map((line, i) =>
    `<span class="line-number">${i + 1}</span>${line}`
  ).join('\n');
}
```

### 토큰 색상 (다크 테마)

| 토큰 | 색상 | Hex |
|------|------|-----|
| keyword | 보라 | `#c678dd` |
| string | 초록 | `#98c379` |
| comment | 회색 | `#5c6370` |
| function | 파랑 | `#61afef` |
| number | 주황 | `#d19a66` |
| operator | 하늘 | `#56b6c2` |
| tag | 빨강 | `#e06c75` |
| attr | 주황 | `#d19a66` |
| property | 하늘 | `#56b6c2` |
| boolean | 주황 | `#d19a66` |
| decorator | 노랑 | `#e5c07b` |
| selector | 빨강 | `#e06c75` |
| color | Hex 값 자체 | — |

---

## 8. Export 기능 스펙

### 8.1 PDF Export

**방식:** `window.print()` 기반

```javascript
function exportPDF() {
  // 1. print 전용 스타일 활성화
  document.body.classList.add('print-mode');

  // 2. 불필요한 인터랙티브 요소 숨김
  //    - 네비게이션 바, 테마 토글, 편집/삭제 버튼, 모달
  //    - iframe 데모 → 스크린샷으로 대체

  // 3. window.print() 호출
  window.print();

  // 4. 원상 복구
  document.body.classList.remove('print-mode');
}
```

**@media print CSS:**
```css
@media print {
  body { background: white; color: black; }
  .no-print { display: none !important; }
  .section { break-inside: avoid; page-break-inside: avoid; }
  .project-card { box-shadow: none; border: 1px solid #ddd; }
  .demo-iframe { display: none; }
  .snippet-code { font-size: 10pt; }
}
```

### 8.2 PNG Export

**방식:** DOM → Canvas 수동 변환 (외부 라이브러리 없이)

```javascript
function exportPNG() {
  // 전략: 주요 섹션만 캡처 (완전한 DOM→Canvas 변환은 복잡)
  // 대안: SVG foreignObject를 이용한 캡처

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${document.getElementById('hero').outerHTML}
        </div>
      </foreignObject>
    </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0);

    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'portfolio.png';
      a.click();
    });
  };
  img.src = url;
}
```

**제약:** foreignObject 방식은 외부 리소스(이미지) 제한 있음. 대안으로 프린트 기반 스크린샷 안내 메시지 표시.

### 8.3 JSON Export/Import

**Export:**
```javascript
function exportJSON() {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    projects: state.projects,
    meta: {
      name: "포트폴리오",
      theme: state.theme
    }
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
```

**Import:**
```javascript
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // 유효성 검증
      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('잘못된 포트폴리오 파일입니다.');
      }

      // 필수 필드 확인
      data.projects.forEach(p => {
        if (!p.id || !p.name) throw new Error(`프로젝트 데이터 누락: ${p.name || 'unknown'}`);
      });

      // 확인 다이얼로그
      if (confirm(`${data.projects.length}개 프로젝트를 가져올까요? 기존 데이터가 교체됩니다.`)) {
        state.projects = data.projects;
        if (data.meta?.theme) state.theme = data.meta.theme;
        renderAll();
      }
    } catch (err) {
      alert('파일 읽기 실패: ' + err.message);
    }
  };
  reader.readAsText(file);
}
```

### Export 파일 형식 요약

| 형식 | 트리거 | 파일명 | 의존성 |
|------|--------|--------|--------|
| PDF | `window.print()` | 사용자 지정 | 없음 (브라우저 내장) |
| PNG | Canvas + Blob | `portfolio.png` | 없음 |
| JSON | Blob + download | `portfolio-backup.json` | 없음 |
| JSON Import | FileReader | — | 없음 |
