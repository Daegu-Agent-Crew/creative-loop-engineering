/* ============================================
   Creative Loop Engine — Phase 1 SPA
   Vanilla JS | Hash Router | localStorage
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // CONSTANTS & DATA
  // ============================================

  const STORAGE_KEY = 'cle_projects';
  const PHASES = ['Define', 'Generate', 'Evaluate', 'Refine', 'Deliver'];
  const PHASE_ICONS = ['📋', '🎨', '🔬', '🔧', '📦'];
  const PHASE_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#a855f7', '#ec4899'];

  const THEMES = [
    { id: 'sf', icon: '🚀', title: 'SF', desc: '미래, 우주, 과학기술' },
    { id: 'fantasy', icon: '🧙', title: '판타지', desc: '마법, 신화, 이세계' },
    { id: 'modern', icon: '🏙️', title: '현대', desc: '일상, 도시, 현실' },
    { id: 'history', icon: '📜', title: '역사', desc: '과거, 시대극, 전통' },
    { id: 'drama', icon: '🎭', title: '드라마', desc: '감정, 관계, 갈등' },
    { id: 'custom', icon: '✏️', title: '커스텀', desc: '직접 입력하기' },
  ];

  const STYLES = [
    { id: 'watercolor', icon: '🎨', title: '수채화', desc: '부드럽고 흐르는 듯한' },
    { id: 'oil', icon: '🖌️', title: '유화', desc: '풍부한 질감과 두께' },
    { id: 'anime', icon: '🌸', title: '애니메이션', desc: '일본 애니 스타일' },
    { id: '3d', icon: '💎', title: '3D 렌더', desc: '입체적이고 사실적인' },
    { id: 'ink', icon: '🖋️', title: '만화 잉크', desc: '선명한 펜선, 흑백' },
    { id: 'pixel', icon: '👾', title: '픽셀아트', desc: '레트로 8비트 감성' },
  ];

  const MOODS = [
    { id: 'bright', icon: '☀️', title: '밝은', desc: '희망찬, 따뜻한, 긍정적' },
    { id: 'dark', icon: '🌙', title: '어두운', desc: '무거운, 긴장감, 미스터리' },
    { id: 'dreamy', icon: '💭', title: '몽환적', desc: '꿈같은, 흐릿한, 시적인' },
    { id: 'intense', icon: '⚡', title: '강렬한', desc: '역동적, 에너지, 폭발' },
    { id: 'calm', icon: '🍃', title: '차분한', desc: '평온한, 자연적, 잔잔한' },
    { id: 'retro', icon: '📺', title: '레트로', desc: '향수, 빈티지, 클래식' },
  ];

  const FEEDBACK_CHIPS = [
    { id: 'color-strong', label: '🎨 색감 더 강하게' },
    { id: 'char-keep', label: '👤 캐릭터 유지' },
    { id: 'bg-simple', label: '🏔️ 배경 단순화' },
    { id: 'text-less', label: '✍️ 텍스트 더 적게' },
    { id: 'comp-keep', label: '📐 구도 유지' },
    { id: 'brighter', label: '💡 더 밝게' },
    { id: 'detail-up', label: '🔍 디테일 추가' },
    { id: 'mood-shift', label: '🎬 분위기 전환' },
  ];

  // Dummy gallery data
  const DUMMY_GALLERY = [
    { id: 'g1', title: '우주 정거장의 새벽', author: '@nova', theme: 'SF', style: '수채화', mood: '어두운', likes: 42, color: '#1a1a3e', emoji: '🚀' },
    { id: 'g2', title: '마법사의 도서관', author: '@mage', theme: '판타지', style: '유화', mood: '몽환적', likes: 35, color: '#2d1b4e', emoji: '🧙' },
    { id: 'g3', title: '여름밤의 편의점', author: '@daily', theme: '현대', style: '애니메이션', mood: '차분한', likes: 28, color: '#1a3a2e', emoji: '🏙️' },
    { id: 'g4', title: '조선왕조 실록', author: '@history', theme: '역사', style: '만화 잉크', mood: '강렬한', likes: 51, color: '#3e2a1a', emoji: '📜' },
    { id: 'g5', title: '디지털 노을', author: '@pixel', theme: 'SF', style: '픽셀아트', mood: '레트로', likes: 38, color: '#3e1a3a', emoji: '👾' },
    { id: 'g6', title: '비 오는 카페', author: '@mood', theme: '현대', style: '수채화', mood: '차분한', likes: 44, color: '#1a2a3e', emoji: '☕' },
  ];

  // ============================================
  // STATE
  // ============================================

  let currentRoute = '';
  let selection = { theme: null, style: null, mood: null };
  let selectedChips = new Set();
  let currentProject = null;

  // ============================================
  // STORAGE
  // ============================================

  function getProjects() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function saveProject(project) {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.unshift(project);
    saveProjects(projects);
  }

  function getProjectById(id) {
    return getProjects().find(p => p.id === id);
  }

  function genId() {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function genToken() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ============================================
  // ROUTER
  // ============================================

  function parseHash() {
    const hash = location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    // ['', 'new'] → ['new']
    if (parts.length === 0) return { name: 'landing', params: {} };
    if (parts[0] === 'new') return { name: 'new', params: {} };
    if (parts[0] === 'dashboard') return { name: 'dashboard', params: {} };
    if (parts[0] === 'gallery') return { name: 'gallery', params: {} };
    if (parts[0] === 'project' && parts[1]) return { name: 'project', params: { id: parts[1] } };
    if (parts[0] === 'resume' && parts[1]) return { name: 'resume', params: { token: parts[1] } };
    return { name: 'landing', params: {} };
  }

  function navigate(path) {
    location.hash = path;
  }

  function onHashChange() {
    const route = parseHash();
    currentRoute = route.name;
    render(route);
    window.scrollTo(0, 0);
  }

  // ============================================
  // UTILITIES
  // ============================================

  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (typeof v === 'boolean') { if (v) e.setAttribute(k, ''); }
        else e.setAttribute(k, v);
      }
    }
    for (const child of children) {
      if (child == null) continue;
      if (typeof child === 'string' || typeof child === 'number') e.appendChild(document.createTextNode(child));
      else if (Array.isArray(child)) child.forEach(c => c && e.appendChild(c));
      else e.appendChild(child);
    }
    return e;
  }

  let svgIdCounter = 0;
  function svgThumb(color, emoji, w, h) {
    w = w || 200; h = h || 200;
    const gid = 'grad_' + (++svgIdCounter);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color}"/>
        <stop offset="100%" style="stop-color:#0a0e17"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#${gid})"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${w * 0.25}">${emoji}</text>
    </svg>`;
  }

  function svgThumbData(color, emoji, w, h) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgThumb(color, emoji, w, h));
  }

  function showToast(message, type) {
    type = type || 'info';
    const container = document.querySelector('.toast-container') || (() => {
      const c = el('div', { class: 'toast-container' });
      document.body.appendChild(c);
      return c;
    })();
    const t = el('div', { class: 'toast ' + type },
      el('span', {}, type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'),
      el('span', {}, message)
    );
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return min + '분 전';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + '시간 전';
    return Math.floor(hr / 24) + '일 전';
  }

  // ============================================
  // NAVBAR
  // ============================================

  function renderNavbar(routeName) {
    const links = [
      { name: 'landing', href: '#/', label: '🏠 홈' },
      { name: 'new', href: '#/new', label: '✨ 새 프로젝트' },
      { name: 'dashboard', href: '#/dashboard', label: '📊 대시보드' },
      { name: 'gallery', href: '#/gallery', label: '🖼️ 갤러리' },
    ];

    const navLinks = el('div', { class: 'navbar-links' });
    links.forEach(link => {
      const a = el('a', {
        class: 'navbar-link' + (routeName === link.name ? ' active' : ''),
        href: link.href,
      }, link.label);
      navLinks.appendChild(a);
    });

    return el('nav', { class: 'navbar' },
      el('div', { class: 'navbar-brand', onclick: () => navigate('/') }, '🎨 Creative Loop'),
      navLinks
    );
  }

  // ============================================
  // PAGES
  // ============================================

  // --- LANDING ---
  function pageLanding() {
    const recentProjects = getProjects().slice(0, 3);

    const hero = el('div', { class: 'hero' },
      el('div', { class: 'hero-badge' }, '🚀 Phase 1 프로토타입'),
      el('h1', {}, '프롬프트를 쓰지 마세요.\n고르세요.'),
      el('p', { class: 'hero-subtitle' },
        '주제 · 화풍 · 분위기를 카드로 선택하면, 5단계 파이프라인이 자동으로 창의적 결과물을 만들어냅니다.'
      ),
      el('p', { class: 'hero-tagline' },
        '"루프 엔지니어링이란, 에이전트에게 프롬프트를 쓰는 사람 자리에서 당신을 빼내는 것이다." — Addy Osmani'
      ),
      el('div', { class: 'hero-cta' },
        el('button', { class: 'btn btn-primary btn-lg', onclick: () => navigate('/new') },
          '🚀 바로 체험하기'
        ),
        el('button', { class: 'btn btn-secondary btn-lg', onclick: () => navigate('/gallery') },
          '🖼️ 갤러리 보기'
        )
      )
    );

    // Features section
    const features = el('div', { class: 'mt-3', style: { maxWidth: '900px', margin: '0 auto' } },
      el('div', { class: 'card-grid' },
        ...[
          { icon: '🎯', title: '3단계 카드 선택', desc: '텍스트 입력 없이 카드 클릭만으로 설정 완료' },
          { icon: '🔄', title: '5-Phase 파이프라인', desc: 'Define → Generate → Evaluate → Refine → Deliver' },
          { icon: ' chips', title: '구조화된 피드백', desc: '칩 클릭으로 디테일 조정, 별점으로 방향성 표현' },
          { icon: '💾', title: '자동 저장 & 복구', desc: 'localStorage 기반, 복구 URL로 언제든 이어서' },
        ].map(f => el('div', { class: 'card', onclick: () => navigate('/new') },
          el('div', { class: 'card-icon' }, f.icon),
          el('div', { class: 'card-title' }, f.title),
          el('div', { class: 'card-desc' }, f.desc)
        ))
      )
    );

    // Recent works
    let recentSection = null;
    if (recentProjects.length > 0) {
      const thumbs = recentProjects.map(p => {
        const theme = THEMES.find(t => t.id === p.theme) || THEMES[0];
        return el('div', { class: 'card', onclick: () => navigate('/project/' + p.id) },
          el('div', { class: 'card-icon' }, theme.icon),
          el('div', { class: 'card-title' }, p.name),
          el('div', { class: 'card-desc' }, timeAgo(p.createdAt) + ' · ' + p.status)
        );
      });
      recentSection = el('div', { class: 'mt-3' },
        el('h2', { class: 'section-title' }, '최근 작업'),
        el('div', { class: 'card-grid' }, ...thumbs)
      );
    }

    return el('div', {},
      hero,
      el('div', { class: 'page' },
        el('h2', { class: 'section-title text-center' }, '왜 Creative Loop인가?'),
        el('p', { class: 'section-desc text-center' }, '"한 장 생성보다, 시리즈 품질 일관성에 강한 창작 루프"'),
        features,
        recentSection
      )
    );
  }

  // --- NEW PROJECT (3-step selection) ---
  function pageNew() {
    selection = { theme: null, style: null, mood: null };

    const container = el('div', { class: 'page' });

    function buildSteps() {
      container.innerHTML = '';

      // Step indicator
      const stepNum = selection.theme ? (selection.style ? 3 : 2) : 1;
      const steps = el('div', { class: 'steps' });
      const stepDefs = [
        { num: 1, label: '주제' },
        { num: 2, label: '화풍' },
        { num: 3, label: '분위기' },
      ];
      stepDefs.forEach((sd, i) => {
        const done = sd.num < stepNum;
        const active = sd.num === stepNum;
        steps.appendChild(el('div', { class: 'step' + (active ? ' active' : '') + (done ? ' done' : '') },
          el('div', { class: 'step-circle' }, done ? '✓' : sd.num),
          el('span', { class: 'step-label' }, sd.label)
        ));
        if (i < 2) steps.appendChild(el('div', { class: 'step-line' + (done ? ' done' : '') }));
      });
      container.appendChild(steps);

      // Title
      const titles = ['주제를 선택하세요', '화풍을 선택하세요', '분위기를 선택하세요'];
      container.appendChild(el('h2', { class: 'section-title' }, `Step ${stepNum}/3: ${titles[stepNum - 1]}`));
      container.appendChild(el('p', { class: 'section-desc' }, stepNum === 1
        ? '만들고 싶은 주제를 골라보세요. 여러 개 선택할 수도 있습니다.'
        : stepNum === 2
          ? '어떤 그림체로 표현할까요?'
          : '작품의 전체적인 분위기를 정해주세요.'
      ));

      // AI recommend button
      if (stepNum === 1) {
        container.appendChild(el('div', { class: 'mb-2 flex justify-between items-center' },
          el('span', { class: 'text-muted text-sm' }, '💡 잘 모르겠다면?'),
          el('button', {
            class: 'btn btn-ghost',
            onclick: () => {
              selection.theme = THEMES[Math.floor(Math.random() * 5)].id;
              selection.style = STYLES[Math.floor(Math.random() * 5)].id;
              selection.mood = MOODS[Math.floor(Math.random() * 5)].id;
              buildSteps();
              renderSummary();
            }
          }, '🤖 AI가 추천해줘')
        ));
      }

      // Cards grid
      const data = stepNum === 1 ? THEMES : stepNum === 2 ? STYLES : MOODS;
      const selectedKey = stepNum === 1 ? 'theme' : stepNum === 2 ? 'style' : 'mood';
      const grid = el('div', { class: 'card-grid' });
      data.forEach(item => {
        const isSelected = selection[selectedKey] === item.id ||
          (Array.isArray(selection[selectedKey]) && selection[selectedKey].includes(item.id));
        const card = el('div', {
          class: 'card' + (isSelected ? ' selected' : ''),
          onclick: () => {
            if (selectedKey === 'theme') {
              selection.theme = isSelected ? null : item.id;
            } else {
              selection[selectedKey] = isSelected ? null : item.id;
            }
            buildSteps();
            if (selection.theme && selection.style && selection.mood) renderSummary();
          }
        },
          el('div', { class: 'card-icon' }, item.icon),
          el('div', { class: 'card-title' }, item.title),
          el('div', { class: 'card-desc' }, item.desc)
        );
        grid.appendChild(card);
      });
      container.appendChild(grid);

      // Summary + CTA
      if (selection.theme) renderSummary();

      // Navigation buttons
      const navRow = el('div', { class: 'flex justify-between items-center mt-3' },
        stepNum > 1 ? el('button', {
          class: 'btn btn-ghost',
          onclick: () => {
            if (stepNum === 3) selection.mood = null;
            else if (stepNum === 2) selection.style = null;
            buildSteps();
            renderSummary();
          }
        }, '← 이전') : el('span', {})
      );
      container.appendChild(navRow);
    }

    function renderSummary() {
      // Remove old summary
      const old = container.querySelector('.summary-box');
      if (old) old.remove();

      if (!selection.theme || !selection.style || !selection.mood) return;

      const themeObj = THEMES.find(t => t.id === selection.theme);
      const styleObj = STYLES.find(s => s.id === selection.style);
      const moodObj = MOODS.find(m => m.id === selection.mood);
      if (!themeObj || !styleObj || !moodObj) return;

      const summary = el('div', { class: 'info-box accent summary-box mt-2' },
        el('div', {},
          el('div', { class: 'flex gap-1 flex-wrap items-center mb-1' },
            el('span', { class: 'feedback-chip selected' }, themeObj.icon + ' ' + themeObj.title),
            el('span', { class: 'feedback-chip selected' }, styleObj.icon + ' ' + styleObj.title),
            el('span', { class: 'feedback-chip selected' }, moodObj.icon + ' ' + moodObj.title),
          ),
          el('div', { class: 'flex gap-2 mt-1' },
            el('span', {}, '⏱️ 예상 생성 시간: ~2분'),
            el('span', {}, '📦 결과물: 4개 후보'),
          )
        )
      );
      container.appendChild(summary);

      // CTA button
      const cta = el('div', { class: 'text-center mt-2' },
        el('button', {
          class: 'btn btn-primary btn-lg',
          onclick: () => createProject()
        }, '🚀 생성 시작')
      );
      container.appendChild(cta);
    }

    function createProject() {
      const themeObj = THEMES.find(t => t.id === selection.theme);
      const styleObj = STYLES.find(s => s.id === selection.style);
      const moodObj = MOODS.find(m => m.id === selection.mood);
      const project = {
        id: genId(),
        name: `${themeObj.title} ${styleObj.title} 작품`,
        theme: selection.theme,
        style: selection.style,
        mood: selection.mood,
        themeLabel: themeObj.title,
        styleLabel: styleObj.title,
        moodLabel: moodObj.title,
        currentPhase: 1, // 0-indexed in PHASES
        status: 'generating',
        visibility: 'private',
        resumeToken: genToken(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        candidates: [
          { id: 1, status: 'complete', label: '#1' },
          { id: 2, status: 'complete', label: '#2' },
          { id: 3, status: 'generating', label: '#3' },
          { id: 4, status: 'idle', label: '#4' },
        ],
        feedback: { chips: [], direction: 4, quality: 5, comment: '' },
        phaseStatuses: ['complete', 'generating', 'idle', 'idle', 'idle'],
      };
      saveProject(project);
      showToast('프로젝트가 생성되었습니다!', 'success');
      navigate('/project/' + project.id);
    }

    buildSteps();
    return container;
  }

  // --- PROJECT DASHBOARD ---
  function pageProject(id) {
    const project = getProjectById(id);
    if (!project) {
      return el('div', { class: 'page' },
        el('div', { class: 'empty-state' },
          el('div', { class: 'empty-icon' }, '🔍'),
          el('div', { class: 'empty-title' }, '프로젝트를 찾을 수 없습니다'),
          el('div', { class: 'empty-desc' }, '대시보드에서 진행 중인 프로젝트를 확인하세요.'),
          el('button', { class: 'btn btn-primary mt-2', onclick: () => navigate('/dashboard') }, '📊 대시보드로')
        )
      );
    }

    currentProject = project;
    const container = el('div', { class: 'page' });

    // Header
    container.appendChild(el('div', { class: 'flex justify-between items-center flex-wrap gap-1 mb-2' },
      el('div', {},
        el('h2', { class: 'section-title' }, project.name),
        el('div', { class: 'flex gap-1 flex-wrap' },
          el('span', { class: 'feedback-chip' }, THEMES.find(t => t.id === project.theme)?.icon + ' ' + project.themeLabel),
          el('span', { class: 'feedback-chip' }, STYLES.find(s => s.id === project.style)?.icon + ' ' + project.styleLabel),
          el('span', { class: 'feedback-chip' }, MOODS.find(m => m.id === project.mood)?.icon + ' ' + project.moodLabel),
        )
      ),
      el('div', { class: 'flex gap-1' },
        el('button', {
          class: 'btn btn-ghost',
          onclick: () => {
            const url = location.origin + location.pathname + '#/resume/' + project.resumeToken;
            navigator.clipboard?.writeText(url);
            showToast('복구 URL이 클립보드에 복사되었습니다: ' + url, 'success');
          }
        }, '🔗 복구 URL 복사')
      )
    ));

    // Resume URL info
    container.appendChild(el('div', { class: 'info-box' },
      el('span', {}, '🔗'),
      el('span', { class: 'text-sm' },
        '복구 URL: ',
        el('code', { style: { color: 'var(--accent2)', fontSize: '0.8rem' } },
          '/resume/' + project.resumeToken.slice(0, 12) + '...'
        ),
        ' — 브라우저를 닫아도 이 URL로 다시 접속하면 프로젝트가 복구됩니다.'
      )
    ));

    // Phase pipeline
    const pipeline = el('div', { class: 'pipeline' });
    PHASES.forEach((phase, i) => {
      const status = project.phaseStatuses?.[i] || 'idle';
      const statusIcon = status === 'complete' ? '✅' : status === 'generating' ? '🔄' : status === 'fail' ? '❌' : status === 'partial_fail' ? '⚠️' : '⏳';
      const statusClass = status === 'complete' ? 'status-complete' : status === 'generating' ? 'status-generating' : status === 'fail' ? 'status-fail' : 'status-idle';

      pipeline.appendChild(el('div', { class: 'pipeline-phase ' + statusClass },
        el('div', { class: 'phase-icon' }, PHASE_ICONS[i]),
        el('div', { class: 'phase-name' }, phase),
        el('div', { class: 'phase-status' },
          status === 'generating' ? el('span', { class: 'spin' }, '🔄') : statusIcon
        )
      ));
    });
    container.appendChild(pipeline);

    // Current phase info
    const phaseIdx = project.currentPhase || 1;
    const currentPhaseName = PHASES[phaseIdx] || 'Generate';
    container.appendChild(el('div', { class: 'info-box accent' },
      el('span', {}, '📋'),
      el('span', {},
        '현재 단계: ',
        el('strong', { style: { color: 'var(--accent2)' } }, `${phaseIdx + 1}. ${currentPhaseName}`),
        ` (${phaseIdx + 1}/${PHASES.length})`,
        ' · ⏱️ 남은 예상 시간: ~1분 30초'
      )
    ));

    // Candidates grid
    container.appendChild(el('h3', { class: 'section-title mt-2', style: { fontSize: '1.1rem' } }, '생성 중인 결과물'));
    const thumbGrid = el('div', { class: 'thumb-grid' });
    const candidateColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f97316'];
    (project.candidates || []).forEach((c, i) => {
      const color = candidateColors[i % candidateColors.length];
      const themeEmoji = THEMES.find(t => t.id === project.theme)?.icon || '🎨';
      const statusClass = c.status || 'idle';
      const statusText = c.status === 'complete' ? '✅ 완료' : c.status === 'generating' ? '🔄 생성 중' : c.status === 'fail' ? '❌ 실패' : '⏳ 대기';

      const thumb = el('div', { class: 'thumb' },
        el('div', { html: svgThumb(color, themeEmoji, 160, 160) }),
        el('div', { class: 'thumb-status ' + statusClass }, statusText),
        el('div', { class: 'thumb-overlay' }, c.label || ('#' + (i + 1)))
      );

      if (c.status === 'fail') {
        thumb.classList.add('shake');
      }
      thumbGrid.appendChild(thumb);
    });

    // Add "재시도" for failed ones
    const hasFailed = (project.candidates || []).some(c => c.status === 'fail');
    if (hasFailed) {
      container.appendChild(el('div', { class: 'info-box warning' },
        el('span', {}, '⚠️'),
        el('span', {}, '일부 후보 생성에 실패했습니다.'),
        el('button', {
          class: 'btn btn-secondary',
          style: { marginLeft: 'auto', padding: '0.3rem 0.8rem', fontSize: '0.78rem' },
          onclick: () => {
            project.candidates.forEach(c => { if (c.status === 'fail') c.status = 'generating'; });
            saveProject(project);
            showToast('재시도 중...', 'info');
            setTimeout(() => {
              project.candidates.forEach(c => { if (c.status === 'generating') c.status = 'complete'; });
              project.phaseStatuses[1] = 'complete';
              project.currentPhase = 2;
              saveProject(project);
              navigate('/project/' + project.id);
            }, 2000);
          }
        }, '🔄 재시도')
      ));
    }
    container.appendChild(thumbGrid);

    // Feedback section (gate)
    container.appendChild(el('div', { class: 'mt-3', style: { borderTop: '1px solid var(--border)', paddingTop: '1.5rem' } },
      el('h3', { class: 'section-title', style: { fontSize: '1.1rem' } }, '피드백 (게이트 #' + (phaseIdx + 1) + ')'),
      el('p', { class: 'section-desc' }, '후보를 검토하고 피드백을 선택하세요. 선택한 칩은 다음 생성에 자동 반영됩니다.'),

      // Feedback chips
      el('div', { class: 'chips' },
        ...FEEDBACK_CHIPS.map(chip => {
          const isSelected = (project.feedback?.chips || []).includes(chip.id);
          selectedChips = new Set(project.feedback?.chips || []);
          return el('button', {
            class: 'feedback-chip' + (isSelected ? ' selected' : ''),
            onclick: (e) => {
              e.preventDefault();
              if (selectedChips.has(chip.id)) {
                selectedChips.delete(chip.id);
                e.target.classList.remove('selected');
              } else {
                selectedChips.add(chip.id);
                e.target.classList.add('selected');
              }
            }
          }, chip.label);
        })
      ),

      // Stars & sliders
      el('div', { class: 'mt-2' },
        el('div', { class: 'slider-row' },
          el('span', { class: 'slider-label' }, '방향성'),
          el('div', { class: 'slider-stars', id: 'stars-direction' },
            ...[1, 2, 3, 4, 5].map(n => el('span', {
              class: 'star' + (n <= (project.feedback?.direction || 4) ? ' active' : ''),
              onclick: (e) => {
                const stars = e.target.parentElement.querySelectorAll('.star');
                stars.forEach((s, i) => s.classList.toggle('active', i < n));
              }
            }, '★'))
          )
        ),
        el('div', { class: 'slider-row' },
          el('span', { class: 'slider-label' }, '품질'),
          el('div', { class: 'slider-stars' },
            ...[1, 2, 3, 4, 5].map(n => el('span', {
              class: 'star' + (n <= (project.feedback?.quality || 5) ? ' active' : ''),
              onclick: (e) => {
                const stars = e.target.parentElement.querySelectorAll('.star');
                stars.forEach((s, i) => s.classList.toggle('active', i < n));
              }
            }, '★'))
          )
        )
      ),

      // Comment
      el('input', {
        type: 'text',
        class: 'input',
        placeholder: '💬 코멘트 (선택사항)',
        style: {
          width: '100%',
          padding: '0.6rem 0.9rem',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text)',
          fontSize: '0.85rem',
          fontFamily: 'inherit',
          marginTop: '0.8rem',
        }
      }),

      // Action buttons
      el('div', { class: 'flex gap-1 flex-wrap mt-2' },
        el('button', {
          class: 'btn btn-success',
          onclick: () => {
            project.feedback = {
              chips: Array.from(selectedChips),
              direction: document.querySelectorAll('#stars-direction .star.active').length,
              quality: 5,
            };
            // Advance to next phase
            if (project.currentPhase < PHASES.length - 1) {
              project.currentPhase++;
              project.phaseStatuses[project.currentPhase - 1] = 'generating';
            }
            if (project.currentPhase >= PHASES.length - 1) {
              project.status = 'complete';
              project.phaseStatuses = ['complete', 'complete', 'complete', 'complete', 'complete'];
            }
            project.updatedAt = Date.now();
            saveProject(project);
            showToast('피드백이 저장되었습니다!', 'success');
            if (project.status === 'complete') {
              showCompleteModal(project);
            } else {
              navigate('/project/' + project.id);
            }
          }
        }, '✅ 승인'),
        el('button', {
          class: 'btn btn-secondary',
          onclick: () => {
            project.feedback = { chips: Array.from(selectedChips), direction: 3, quality: 3 };
            project.updatedAt = Date.now();
            // Re-generate candidates
            project.candidates.forEach(c => { c.status = 'generating'; });
            saveProject(project);
            showToast('재생성을 시작합니다...', 'info');
            setTimeout(() => {
              project.candidates.forEach(c => { c.status = 'complete'; });
              saveProject(project);
              navigate('/project/' + project.id);
            }, 2000);
          }
        }, '🔄 재생성'),
        el('button', {
          class: 'btn btn-ghost',
          onclick: () => {
            showToast('방향 수정 모드 — 피드백 칩을 수정하고 재생성하세요.', 'info');
          }
        }, '✏️ 방향 수정')
      )
    ));

    return container;
  }

  // --- COMPLETE MODAL ---
  function showCompleteModal(project) {
    const overlay = el('div', { class: 'modal-overlay' });
    const themeObj = THEMES.find(t => t.id === project.theme);

    const modal = el('div', { class: 'modal' },
      el('div', { style: { textAlign: 'center', marginBottom: '1rem' } },
        el('div', { style: { fontSize: '3rem', marginBottom: '0.5rem' } }, '🎉'),
        el('h3', {}, '프로젝트 완성!'),
        el('p', {}, `${project.name}의 모든 Phase가 완료되었습니다.`),
      ),
      // Preview
      el('div', { class: 'thumb-grid', style: { maxWidth: '300px', margin: '0 auto 1rem' } },
        ...project.candidates.slice(0, 2).map((c, i) => {
          const color = ['#22c55e', '#06b6d4'][i];
          return el('div', { class: 'thumb' },
            el('div', { html: svgThumb(color, themeObj?.icon || '🎨', 120, 120) }),
            el('div', { class: 'thumb-status complete' }, '✅ 완료')
          );
        })
      ),
      el('p', { style: { fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.5rem' } }, '공개 설정:'),
      el('div', { class: 'radio-group' },
        el('div', { class: 'radio-item' },
          el('input', { type: 'radio', name: 'vis', id: 'vis-private', checked: project.visibility === 'private' }),
          el('label', { for: 'vis-private', html: '🔒 비공개 <span class="radio-desc">나만 볼 수 있어요</span>' }),
        ),
        el('div', { class: 'radio-item' },
          el('input', { type: 'radio', name: 'vis', id: 'vis-link', checked: project.visibility === 'link' }),
          el('label', { for: 'vis-link', html: '🔗 링크 공유 <span class="radio-desc">링크를 아는 사람만</span>' }),
        ),
        el('div', { class: 'radio-item' },
          el('input', { type: 'radio', name: 'vis', id: 'vis-public', checked: project.visibility === 'public' }),
          el('label', { for: 'vis-public', html: '🌍 갤러리 공개 <span class="radio-desc">모두가 볼 수 있어요</span>' }),
        ),
      ),
      el('div', { class: 'flex gap-1 mt-2' },
        el('button', {
          class: 'btn btn-secondary',
          onclick: () => { overlay.remove(); }
        }, '💾 저장'),
        el('button', {
          class: 'btn btn-primary',
          onclick: () => {
            const publicRadio = document.getElementById('vis-public');
            const linkRadio = document.getElementById('vis-link');
            project.visibility = publicRadio.checked ? 'public' : linkRadio.checked ? 'link' : 'private';
            project.updatedAt = Date.now();
            saveProject(project);
            overlay.remove();
            showToast(project.visibility === 'public' ? '갤러리에 공개되었습니다! 🎉' : '저장되었습니다.', 'success');
            if (project.visibility === 'public') navigate('/gallery');
            else navigate('/dashboard');
          }
        }, '🚀 갤러리에 공개'),
        el('button', {
          class: 'btn btn-ghost',
          onclick: () => {
            showToast('템플릿으로 저장되었습니다! (Phase 2 기능)', 'info');
          }
        }, '📋 템플릿으로도 저장')
      )
    );
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  // --- DASHBOARD ---
  function pageDashboard() {
    const projects = getProjects();
    const container = el('div', { class: 'page' });

    container.appendChild(el('div', { class: 'flex justify-between items-center mb-2' },
      el('div', {},
        el('h2', { class: 'section-title' }, '📊 내 프로젝트'),
        el('p', { class: 'section-desc' }, '진행 중이거나 완료된 프로젝트 목록'),
      ),
      el('button', { class: 'btn btn-primary', onclick: () => navigate('/new') }, '✨ 새 프로젝트')
    ));

    if (projects.length === 0) {
      container.appendChild(el('div', { class: 'empty-state' },
        el('div', { class: 'empty-icon' }, '📭'),
        el('div', { class: 'empty-title' }, '아직 프로젝트가 없습니다'),
        el('div', { class: 'empty-desc' }, '첫 번째 창작 루프를 시작해보세요!'),
        el('button', { class: 'btn btn-primary mt-2', onclick: () => navigate('/new') }, '🚀 시작하기')
      ));
      return container;
    }

    const list = el('div', { class: 'flex flex-col gap-1' });
    projects.forEach(p => {
      const themeObj = THEMES.find(t => t.id === p.theme) || { icon: '🎨' };
      const statusText = p.status === 'complete' ? '✅ 완료' :
        p.status === 'generating' ? '🔄 진행 중' :
          p.status === 'fail' ? '❌ 실패' : '⏳ 대기';
      const statusClass = p.status === 'complete' ? 'complete' :
        p.status === 'generating' ? 'generating' :
          p.status === 'fail' ? 'fail' : 'idle';

      list.appendChild(el('div', {
        class: 'project-card',
        onclick: () => navigate('/project/' + p.id)
      },
        el('div', { class: 'project-thumb' }, themeObj.icon),
        el('div', { class: 'project-info' },
          el('div', { class: 'project-name' }, p.name),
          el('div', { class: 'project-meta' },
            `${p.themeLabel} · ${p.styleLabel} · ${p.moodLabel} · ${timeAgo(p.createdAt)}`
          )
        ),
        el('div', { class: 'project-status' },
          el('span', { class: 'status-badge ' + statusClass }, statusText)
        )
      ));
    });
    container.appendChild(list);

    return container;
  }

  // --- GALLERY ---
  function pageGallery() {
    const container = el('div', { class: 'page' });

    container.appendChild(el('div', { class: 'flex justify-between items-center mb-2 flex-wrap gap-1' },
      el('div', {},
        el('h2', { class: 'section-title' }, '🖼️ 갤러리'),
        el('p', { class: 'section-desc' }, '커뮤니티에서 공개된 작품들'),
      ),
      el('div', { class: 'flex gap-1' },
        el('button', { class: 'feedback-chip selected' }, '전체'),
        el('button', { class: 'feedback-chip' }, 'SF'),
        el('button', { class: 'feedback-chip' }, '판타지'),
        el('button', { class: 'feedback-chip' }, '현대'),
        el('button', { class: 'feedback-chip' }, '역사'),
      )
    ));

    // Merge dummy gallery with public projects
    const publicProjects = getProjects().filter(p => p.visibility === 'public').map(p => ({
      id: p.id,
      title: p.name,
      author: '@you',
      theme: p.themeLabel,
      style: p.styleLabel,
      mood: p.moodLabel,
      likes: 0,
      color: '#1a2235',
      emoji: THEMES.find(t => t.id === p.theme)?.icon || '🎨',
    }));
    const allItems = [...publicProjects, ...DUMMY_GALLERY];

    const masonry = el('div', { class: 'masonry' });
    allItems.forEach(item => {
      const heights = [180, 220, 200, 260, 190, 240];
      const h = heights[Math.floor(Math.random() * heights.length)];
      const masonryItem = el('div', { class: 'masonry-item' });
      masonryItem.innerHTML = svgThumb(item.color, item.emoji, 300, h);
      masonryItem.appendChild(el('div', { class: 'gallery-info' },
        el('div', { class: 'gallery-title' }, item.title),
        el('div', { class: 'gallery-meta' },
          `${item.author} · ${item.theme} · ❤️ ${item.likes}`
        )
      ));
      masonryItem.addEventListener('click', () => {
        if (item.id.startsWith('p_')) navigate('/project/' + item.id);
        else showToast('상세 보기는 Phase 2에서 지원됩니다.', 'info');
      });
      masonry.appendChild(masonryItem);
    });
    container.appendChild(masonry);

    return container;
  }

  // --- RESUME ---
  function pageResume(token) {
    const container = el('div', { class: 'page' });

    // Find project by resume token
    const project = getProjects().find(p => p.resumeToken === token || p.resumeToken?.startsWith(token));

    if (project) {
      container.appendChild(el('div', { class: 'info-box success' },
        el('span', { style: { fontSize: '1.5rem' } }, '✅'),
        el('div', {},
          el('div', { style: { fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' } },
            '프로젝트를 복구했습니다: ' + project.name
          ),
          el('div', { class: 'text-sm text-muted' },
            `${project.themeLabel} · ${project.styleLabel} · ${project.moodLabel} · ${timeAgo(project.createdAt)}`
          ),
        )
      ));
      container.appendChild(el('div', { class: 'text-center mt-2' },
        el('button', {
          class: 'btn btn-primary btn-lg',
          onclick: () => navigate('/project/' + project.id)
        }, '📊 대시보드로 이동')
      ));
    } else {
      container.appendChild(el('div', { class: 'empty-state' },
        el('div', { class: 'empty-icon' }, '🔗'),
        el('div', { class: 'empty-title' }, '복구할 프로젝트를 찾을 수 없습니다'),
        el('div', { class: 'empty-desc' },
          '이 브라우저에 저장된 프로젝트가 없거나 토큰이 만료되었습니다. ' +
          '다른 브라우저에서 접속하셨다면, 원래 브라우저에서 다시 시도해주세요.'
        ),
        el('div', { class: 'flex gap-1 justify-center mt-2' },
          el('button', { class: 'btn btn-primary', onclick: () => navigate('/new') }, '✨ 새 프로젝트 시작'),
          el('button', { class: 'btn btn-secondary', onclick: () => navigate('/dashboard') }, '📊 대시보드')
        )
      ));
    }

    return container;
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  function render(route) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Navbar
    app.appendChild(renderNavbar(route.name));

    // Page content
    let pageContent;
    switch (route.name) {
      case 'landing':
        pageContent = pageLanding();
        break;
      case 'new':
        pageContent = pageNew();
        break;
      case 'project':
        pageContent = pageProject(route.params.id);
        break;
      case 'dashboard':
        pageContent = pageDashboard();
        break;
      case 'gallery':
        pageContent = pageGallery();
        break;
      case 'resume':
        pageContent = pageResume(route.params.token);
        break;
      default:
        pageContent = pageLanding();
    }
    app.appendChild(pageContent);

    // Toast container
    if (!document.querySelector('.toast-container')) {
      app.appendChild(el('div', { class: 'toast-container' }));
    }

    // Update navbar active state
    document.querySelectorAll('.navbar-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if ((route.name === 'landing' && href === '#/') ||
        (route.name === 'new' && href === '#/new') ||
        (route.name === 'dashboard' && href === '#/dashboard') ||
        (route.name === 'gallery' && href === '#/gallery')) {
        link.classList.add('active');
      }
    });
  }

  // ============================================
  // INIT
  // ============================================

  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('DOMContentLoaded', onHashChange);

  // If no hash, trigger initial render
  if (document.readyState !== 'loading') {
    onHashChange();
  }
})();
