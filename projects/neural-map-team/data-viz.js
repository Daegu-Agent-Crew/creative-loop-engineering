/**
 * Neural Map v10 - Team Edition
 * data-viz.js — Canvas-based Charts, Data Visualization & Export
 * Teammate C: Data Expert
 *
 * Provides: DataViz global object with decision tree, memory graph,
 * token waterfall, context heatmap, tool log table, and CSV/JSON export.
 */

(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // Theme constants
    // ──────────────────────────────────────────────
    const THEME = {
        bg: '#0a0e1a',
        bgLight: '#111827',
        bgCard: '#1a1f35',
        primary: '#4a9eff',
        secondary: '#7c3aed',
        accent: '#06d6a0',
        amber: '#ffa94d',
        red: '#ff6b6b',
        text: '#e2e8f0',
        textDim: '#94a3b8',
        border: '#2a3050',
        gridLine: 'rgba(74,158,255,0.08)',
        // Decision types
        reasoning: '#4a9eff',
        tool_call: '#ffa94d',
        output: '#06d6a0',
        // Memory types
        episodic: '#7c3aed',
        semantic: '#4a9eff',
        procedural: '#06d6a0',
    };

    const DPR = window.devicePixelRatio || 1;

    // ──────────────────────────────────────────────
    // Utility helpers
    // ──────────────────────────────────────────────
    function debounce(fn, ms) {
        let t;
        return function () {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, arguments), ms);
        };
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function setupCanvas(canvas, w, h) {
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(DPR, DPR);
        return ctx;
    }

    function getCanvasCoords(canvas, e) {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - r.left, y: clientY - r.top };
    }

    function truncate(s, len) {
        if (!s) return '';
        s = String(s);
        return s.length > len ? s.slice(0, len) + '…' : s;
    }

    function escapeCSV(val) {
        val = String(val == null ? '' : val);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    // ──────────────────────────────────────────────
    // Sample / demo data (Korean)
    // ──────────────────────────────────────────────
    const SAMPLE = {
        decisionTree: {
            id: 'root',
            label: '사용자 질문 분석',
            type: 'reasoning',
            detail: '사용자의 의도를 파악하고 최적의 응답 전략을 결정합니다.',
            expanded: true,
            children: [
                {
                    id: 'n1', label: '도구 사용 필요?', type: 'reasoning',
                    detail: '질문에 외부 도구 호출이 필요한지 판단합니다.',
                    expanded: true,
                    children: [
                        {
                            id: 'n1a', label: '웹 검색 호출', type: 'tool_call',
                            detail: 'WebSearch: "최신 AI 기술 동향 2026"',
                            expanded: false, children: [
                                { id: 'n1a1', label: '검색 결과 분석', type: 'reasoning', detail: '3개의 관련 결과를 찾았습니다.', expanded: false, children: [] },
                            ]
                        },
                        {
                            id: 'n1b', label: '파일 읽기', type: 'tool_call',
                            detail: 'Read: config.json',
                            expanded: false, children: []
                        },
                    ]
                },
                {
                    id: 'n2', label: '메모리 참조', type: 'reasoning',
                    detail: '관련 이전 대화와 컨텍스트를 검색합니다.',
                    expanded: true,
                    children: [
                        { id: 'n2a', label: '유사 대화 3건 발견', type: 'reasoning', detail: '코사인 유사도 0.87 이상의 메모리 항목 참조', expanded: false, children: [] },
                    ]
                },
                {
                    id: 'n3', label: '최종 응답 생성', type: 'output',
                    detail: '수집된 정보를 종합하여 한국어로 자연스러운 응답을 생성합니다.',
                    expanded: false, children: []
                },
            ]
        },

        memoryGraph: [
            { id: 'm1', label: '프로젝트 구조', type: 'procedural', freq: 8 },
            { id: 'm2', label: '사용자 선호도', type: 'episodic', freq: 12 },
            { id: 'm3', label: 'API 패턴', type: 'semantic', freq: 6 },
            { id: 'm4', label: '오류 해결법', type: 'procedural', freq: 10 },
            { id: 'm5', label: '이전 대화 요약', type: 'episodic', freq: 15 },
            { id: 'm6', label: 'JS 문법 규칙', type: 'semantic', freq: 4 },
            { id: 'm7', label: '배포 절차', type: 'procedural', freq: 7 },
            { id: 'm8', label: '팀 컨벤션', type: 'semantic', freq: 9 },
            { id: 'm9', label: '버그 리포트', type: 'episodic', freq: 5 },
            { id: 'm10', label: '코드 리뷰 기록', type: 'episodic', freq: 11 },
        ],
        memoryEdges: [
            { from: 'm1', to: 'm3', strength: 0.85 },
            { from: 'm1', to: 'm7', strength: 0.72 },
            { from: 'm2', to: 'm5', strength: 0.91 },
            { from: 'm2', to: 'm10', strength: 0.65 },
            { from: 'm3', to: 'm6', strength: 0.78 },
            { from: 'm4', to: 'm9', strength: 0.88 },
            { from: 'm4', to: 'm6', strength: 0.60 },
            { from: 'm5', to: 'm10', strength: 0.73 },
            { from: 'm7', to: 'm8', strength: 0.69 },
            { from: 'm8', to: 'm1', strength: 0.55 },
            { from: 'm9', to: 'm10', strength: 0.82 },
            { from: 'm6', to: 'm8', strength: 0.48 },
        ],

        tokenWaterfall: [
            { stage: '입력 토큰화', duration: 12, tokens: 256 },
            { stage: '임베딩', duration: 8, tokens: 256 },
            { stage: '어텐션', duration: 45, tokens: 256 },
            { stage: '추론', duration: 120, tokens: 256 },
            { stage: '출력 생성', duration: 65, tokens: 184 },
            { stage: '디코딩', duration: 18, tokens: 184 },
        ],

        heatmap: {
            rows: ['시스템 프롬프트', '사용자 메시지', '도구 결과', '메모리', '이전 대화'],
            cols: 20,
            data: null, // generated below
        },

        toolLogs: [
            { time: '14:23:01', tool: 'WebSearch', status: 'success', duration: 342, input: '최신 AI 기술 동향 2026년 3월', output: '{"results": [{"title": "GPT-5 출시 임박", "url": "..."}]}' },
            { time: '14:23:02', tool: 'Read', status: 'success', duration: 15, input: '/home/user/project/config.json', output: '{"version": "10.0", "theme": "neural-dark"}' },
            { time: '14:23:03', tool: 'Bash', status: 'error', duration: 1024, input: 'npm run build --production', output: 'Error: Module not found: @neural/core' },
            { time: '14:23:05', tool: 'Edit', status: 'success', duration: 8, input: 'package.json: "@neural/core" 의존성 추가', output: '파일 수정 완료' },
            { time: '14:23:06', tool: 'Bash', status: 'pending', duration: 0, input: 'npm run build --production', output: '빌드 진행 중...' },
            { time: '14:23:08', tool: 'WebFetch', status: 'success', duration: 580, input: 'https://api.neural.dev/v2/status', output: '{"status": "operational", "latency": 42}' },
        ],
    };

    // Generate heatmap data
    (function () {
        const rows = SAMPLE.heatmap.rows.length;
        const cols = SAMPLE.heatmap.cols;
        const data = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                // Create a realistic-looking influence pattern
                let base = 0;
                if (r === 0) base = 0.3; // system prompt: moderate
                if (r === 1) base = 0.6; // user message: high
                if (r === 2) base = c > 8 ? 0.5 : 0.1; // tool results: late influence
                if (r === 3) base = 0.25; // memory
                if (r === 4) base = c < 5 ? 0.4 : 0.15; // previous conversation: early influence
                row.push(clamp(base + (Math.random() * 0.3 - 0.15), 0, 1));
            }
            data.push(row);
        }
        SAMPLE.heatmap.data = data;
    })();

    // ──────────────────────────────────────────────
    // 1. Decision Tree Visualization
    // ──────────────────────────────────────────────
    const DecisionTree = {
        canvas: null, ctx: null, container: null,
        data: null,
        nodes: [], // flat list of positioned nodes
        hoveredNode: null,
        tooltip: null,
        animProgress: 0,
        animating: false,
        offsetX: 0, offsetY: 0,
        dragging: false, dragStartX: 0, dragStartY: 0,
        panX: 0, panY: 0,

        init(containerId) {
            this.container = document.getElementById(containerId.replace('#', ''));
            if (!this.container) return;
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'block';
            this.canvas.style.cursor = 'grab';
            this.container.appendChild(this.canvas);

            // Tooltip element
            this.tooltip = document.createElement('div');
            Object.assign(this.tooltip.style, {
                position: 'absolute', pointerEvents: 'none', opacity: '0',
                background: THEME.bgCard, color: THEME.text, border: '1px solid ' + THEME.border,
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px', maxWidth: '260px',
                lineHeight: '1.5', zIndex: '100', transition: 'opacity 0.15s',
                fontFamily: "'Noto Sans KR', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            });
            this.container.style.position = 'relative';
            this.container.appendChild(this.tooltip);

            this._bindEvents();
            this.resize();
        },

        _bindEvents() {
            const c = this.canvas;
            const handler = (e) => {
                const p = getCanvasCoords(c, e);
                const px = p.x - this.panX, py = p.y - this.panY;
                this.hoveredNode = null;
                for (const n of this.nodes) {
                    const dx = px - n.x, dy = py - n.y;
                    if (dx * dx + dy * dy < n.radius * n.radius) {
                        this.hoveredNode = n;
                        break;
                    }
                }
                if (this.hoveredNode) {
                    c.style.cursor = 'pointer';
                    this.tooltip.style.opacity = '1';
                    this.tooltip.style.left = (p.x + 16) + 'px';
                    this.tooltip.style.top = (p.y - 10) + 'px';
                    this.tooltip.innerHTML = '<strong>' + this.hoveredNode.label + '</strong><br><span style="color:' + THEME.textDim + '">' + (this.hoveredNode.detail || '') + '</span>';
                } else {
                    c.style.cursor = this.dragging ? 'grabbing' : 'grab';
                    this.tooltip.style.opacity = '0';
                }
                this.draw();
            };
            c.addEventListener('mousemove', handler);
            c.addEventListener('touchmove', (e) => { e.preventDefault(); handler(e); }, { passive: false });

            const clickHandler = (e) => {
                const p = getCanvasCoords(c, e);
                const px = p.x - this.panX, py = p.y - this.panY;
                for (const n of this.nodes) {
                    const dx = px - n.x, dy = py - n.y;
                    if (dx * dx + dy * dy < n.radius * n.radius && n.src.children && n.src.children.length) {
                        n.src.expanded = !n.src.expanded;
                        this._layoutAndAnimate();
                        return;
                    }
                }
            };
            c.addEventListener('click', clickHandler);
            c.addEventListener('touchend', clickHandler);

            // Pan
            c.addEventListener('mousedown', (e) => { this.dragging = true; this.dragStartX = e.clientX - this.panX; this.dragStartY = e.clientY - this.panY; c.style.cursor = 'grabbing'; });
            window.addEventListener('mousemove', (e) => { if (this.dragging) { this.panX = e.clientX - this.dragStartX; this.panY = e.clientY - this.dragStartY; this.draw(); } });
            window.addEventListener('mouseup', () => { this.dragging = false; c.style.cursor = 'grab'; });
        },

        update(data) {
            this.data = data;
            this.panX = 0; this.panY = 0;
            this._layoutAndAnimate();
        },

        _layoutAndAnimate() {
            this.nodes = [];
            if (!this.data) return;
            const w = this.canvas.style.width ? parseInt(this.canvas.style.width) : 600;
            this._layoutNode(this.data, w / 2, 50, 0, w);
            this.animProgress = 0;
            this.animating = true;
            this._animate();
        },

        _layoutNode(node, x, y, depth, availW) {
            const radius = 22;
            const vGap = 90;
            const n = { x, y, radius, label: node.label, type: node.type, detail: node.detail, src: node, depth, alpha: 0 };
            this.nodes.push(n);
            if (node.expanded && node.children && node.children.length) {
                const count = node.children.length;
                const childW = availW / count;
                const startX = x - (availW / 2) + childW / 2;
                for (let i = 0; i < count; i++) {
                    const cx = startX + i * childW;
                    const cy = y + vGap;
                    this._layoutNode(node.children[i], cx, cy, depth + 1, childW);
                }
            }
        },

        _animate() {
            if (!this.animating) return;
            this.animProgress += 0.03;
            if (this.animProgress >= 1) { this.animProgress = 1; this.animating = false; }
            for (const n of this.nodes) {
                n.alpha = clamp(this.animProgress * 3 - n.depth * 0.5, 0, 1);
            }
            this.draw();
            if (this.animating) requestAnimationFrame(() => this._animate());
        },

        resize() {
            if (!this.container || !this.canvas) return;
            const w = this.container.clientWidth || 600;
            const h = this.container.clientHeight || 400;
            this.ctx = setupCanvas(this.canvas, w, h);
            if (this.data) this._layoutAndAnimate();
        },

        draw() {
            if (!this.ctx) return;
            const ctx = this.ctx;
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.translate(this.panX, this.panY);

            // Draw edges first
            for (const n of this.nodes) {
                if (n.src.expanded && n.src.children) {
                    for (const child of n.src.children) {
                        const cn = this.nodes.find(nd => nd.src === child);
                        if (cn && cn.alpha > 0) {
                            ctx.globalAlpha = cn.alpha * 0.5;
                            ctx.strokeStyle = THEME.border;
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y + n.radius);
                            const midY = (n.y + n.radius + cn.y - cn.radius) / 2;
                            ctx.bezierCurveTo(n.x, midY, cn.x, midY, cn.x, cn.y - cn.radius);
                            ctx.stroke();
                        }
                    }
                }
            }

            // Draw nodes
            for (const n of this.nodes) {
                if (n.alpha <= 0) continue;
                ctx.globalAlpha = n.alpha;
                const color = THEME[n.type] || THEME.primary;
                const isHovered = n === this.hoveredNode;
                const r = isHovered ? n.radius + 4 : n.radius;

                // Glow
                ctx.shadowColor = color;
                ctx.shadowBlur = isHovered ? 20 : 10;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Inner circle
                ctx.fillStyle = THEME.bgCard;
                ctx.beginPath();
                ctx.arc(n.x, n.y, r - 3, 0, Math.PI * 2);
                ctx.fill();

                // Icon dot
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = THEME.text;
                ctx.font = '12px "Noto Sans KR", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(truncate(n.label, 12), n.x, n.y + r + 6);

                // Expand indicator
                if (n.src.children && n.src.children.length) {
                    ctx.fillStyle = THEME.textDim;
                    ctx.font = '10px sans-serif';
                    ctx.fillText(n.src.expanded ? '−' : '+', n.x, n.y - 4);
                }
            }
            ctx.restore();
        },
    };

    // ──────────────────────────────────────────────
    // 2. Memory Graph (Force-Directed)
    // ──────────────────────────────────────────────
    const MemoryGraph = {
        canvas: null, ctx: null, container: null,
        nodes: [], edges: [],
        hoveredNode: null, selectedNode: null,
        tooltip: null,
        running: false,
        dragNode: null,

        init(containerId) {
            this.container = document.getElementById(containerId.replace('#', ''));
            if (!this.container) return;
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'block';
            this.canvas.style.cursor = 'default';
            this.container.appendChild(this.canvas);

            this.tooltip = document.createElement('div');
            Object.assign(this.tooltip.style, {
                position: 'absolute', pointerEvents: 'none', opacity: '0',
                background: THEME.bgCard, color: THEME.text, border: '1px solid ' + THEME.border,
                borderRadius: '8px', padding: '8px 12px', fontSize: '12px', maxWidth: '200px',
                zIndex: '100', transition: 'opacity 0.15s',
                fontFamily: "'Noto Sans KR', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            });
            this.container.style.position = 'relative';
            this.container.appendChild(this.tooltip);

            this._bindEvents();
            this.resize();
        },

        _bindEvents() {
            const c = this.canvas;
            const getNode = (e) => {
                const p = getCanvasCoords(c, e);
                for (const n of this.nodes) {
                    const dx = p.x - n.x, dy = p.y - n.y;
                    if (dx * dx + dy * dy < n.radius * n.radius) return { node: n, pos: p };
                }
                return { node: null, pos: p };
            };

            c.addEventListener('mousemove', (e) => {
                const { node, pos } = getNode(e);
                this.hoveredNode = node;
                if (this.dragNode) {
                    this.dragNode.x = pos.x;
                    this.dragNode.y = pos.y;
                    this.dragNode.vx = 0; this.dragNode.vy = 0;
                }
                if (node) {
                    c.style.cursor = 'pointer';
                    this.tooltip.style.opacity = '1';
                    this.tooltip.style.left = (pos.x + 14) + 'px';
                    this.tooltip.style.top = (pos.y - 8) + 'px';
                    const typeLabel = { episodic: '일화적', semantic: '의미적', procedural: '절차적' }[node.type] || node.type;
                    this.tooltip.innerHTML = '<strong>' + node.label + '</strong><br>유형: ' + typeLabel + '<br>접근 빈도: ' + node.freq;
                } else {
                    c.style.cursor = 'default';
                    this.tooltip.style.opacity = '0';
                }
            });
            c.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const p = getCanvasCoords(c, e);
                if (this.dragNode) {
                    this.dragNode.x = p.x; this.dragNode.y = p.y;
                    this.dragNode.vx = 0; this.dragNode.vy = 0;
                }
            }, { passive: false });

            c.addEventListener('mousedown', (e) => { const { node } = getNode(e); if (node) { this.dragNode = node; this.selectedNode = node; } });
            c.addEventListener('touchstart', (e) => { const { node } = getNode(e); if (node) { this.dragNode = node; this.selectedNode = node; } });
            const release = () => { this.dragNode = null; };
            window.addEventListener('mouseup', release);
            window.addEventListener('touchend', release);
        },

        update(nodesData, edgesData) {
            const w = parseInt(this.canvas.style.width) || 600;
            const h = parseInt(this.canvas.style.height) || 400;
            const existingMap = {};
            this.nodes.forEach(n => { existingMap[n.id] = n; });

            this.nodes = nodesData.map(nd => {
                const existing = existingMap[nd.id];
                return {
                    id: nd.id, label: nd.label, type: nd.type, freq: nd.freq,
                    radius: 12 + nd.freq * 1.5,
                    x: existing ? existing.x : w / 2 + (Math.random() - 0.5) * w * 0.6,
                    y: existing ? existing.y : h / 2 + (Math.random() - 0.5) * h * 0.6,
                    vx: 0, vy: 0,
                    alpha: existing ? 1 : 0,
                    targetAlpha: 1,
                };
            });

            this.edges = edgesData.map(e => ({
                from: this.nodes.find(n => n.id === e.from),
                to: this.nodes.find(n => n.id === e.to),
                strength: e.strength,
            })).filter(e => e.from && e.to);

            if (!this.running) {
                this.running = true;
                this._tick();
            }
        },

        _tick() {
            if (!this.running) return;
            const w = parseInt(this.canvas.style.width) || 600;
            const h = parseInt(this.canvas.style.height) || 400;
            const nodes = this.nodes;
            const edges = this.edges;

            // Repulsion
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let dx = nodes[j].x - nodes[i].x;
                    let dy = nodes[j].y - nodes[i].y;
                    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    let force = 800 / (dist * dist);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    if (nodes[i] !== this.dragNode) { nodes[i].vx -= fx; nodes[i].vy -= fy; }
                    if (nodes[j] !== this.dragNode) { nodes[j].vx += fx; nodes[j].vy += fy; }
                }
            }

            // Attraction (edges)
            for (const e of edges) {
                let dx = e.to.x - e.from.x;
                let dy = e.to.y - e.from.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const ideal = 120;
                const force = (dist - ideal) * 0.005 * e.strength;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                if (e.from !== this.dragNode) { e.from.vx += fx; e.from.vy += fy; }
                if (e.to !== this.dragNode) { e.to.vx -= fx; e.to.vy -= fy; }
            }

            // Center gravity
            for (const n of nodes) {
                if (n === this.dragNode) continue;
                n.vx += (w / 2 - n.x) * 0.001;
                n.vy += (h / 2 - n.y) * 0.001;
                n.vx *= 0.9; n.vy *= 0.9;
                n.x += n.vx; n.y += n.vy;
                n.x = clamp(n.x, n.radius, w - n.radius);
                n.y = clamp(n.y, n.radius, h - n.radius);
                n.alpha = lerp(n.alpha, n.targetAlpha, 0.05);
            }

            this.draw();
            requestAnimationFrame(() => this._tick());
        },

        resize() {
            if (!this.container || !this.canvas) return;
            const w = this.container.clientWidth || 600;
            const h = this.container.clientHeight || 400;
            this.ctx = setupCanvas(this.canvas, w, h);
        },

        draw() {
            if (!this.ctx) return;
            const ctx = this.ctx;
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            ctx.clearRect(0, 0, w, h);

            const sel = this.selectedNode;

            // Edges
            for (const e of this.edges) {
                const highlight = sel && (e.from === sel || e.to === sel);
                ctx.globalAlpha = Math.min(e.from.alpha, e.to.alpha) * (highlight ? 0.8 : 0.25);
                ctx.strokeStyle = highlight ? THEME.primary : THEME.textDim;
                ctx.lineWidth = 1 + e.strength * 3;
                ctx.beginPath();
                ctx.moveTo(e.from.x, e.from.y);
                ctx.lineTo(e.to.x, e.to.y);
                ctx.stroke();
            }

            // Nodes
            for (const n of this.nodes) {
                ctx.globalAlpha = n.alpha;
                const color = THEME[n.type] || THEME.primary;
                const isHovered = n === this.hoveredNode;
                const isSel = n === sel;
                const isConnected = sel && this.edges.some(e => (e.from === sel && e.to === n) || (e.to === sel && e.from === n));
                const dim = sel && !isSel && !isConnected;

                ctx.globalAlpha = n.alpha * (dim ? 0.3 : 1);

                // Glow
                ctx.shadowColor = color;
                ctx.shadowBlur = isHovered || isSel ? 20 : 8;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius + (isHovered ? 3 : 0), 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Inner
                ctx.fillStyle = THEME.bgCard;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius - 3, 0, Math.PI * 2);
                ctx.fill();

                // Freq indicator
                ctx.fillStyle = color;
                ctx.globalAlpha = n.alpha * (dim ? 0.15 : 0.5);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = n.alpha * (dim ? 0.3 : 1);

                // Label
                ctx.fillStyle = THEME.text;
                ctx.font = '11px "Noto Sans KR", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(n.label, n.x, n.y + n.radius + 5);
            }
            ctx.globalAlpha = 1;
        },
    };

    // ──────────────────────────────────────────────
    // 3. Token Lifecycle Waterfall Chart
    // ──────────────────────────────────────────────
    const TokenWaterfall = {
        canvas: null, ctx: null,
        data: [],
        animProgress: 0,
        animating: false,
        hoveredBar: -1,
        tooltip: null,
        container: null,

        init(canvasId) {
            // canvasId may be a container or canvas id
            let el = document.getElementById(canvasId.replace('#', ''));
            if (!el) return;
            if (el.tagName === 'CANVAS') {
                this.canvas = el;
                this.container = el.parentElement;
            } else {
                this.container = el;
                this.canvas = document.createElement('canvas');
                this.canvas.style.display = 'block';
                el.appendChild(this.canvas);
            }

            this.tooltip = document.createElement('div');
            Object.assign(this.tooltip.style, {
                position: 'absolute', pointerEvents: 'none', opacity: '0',
                background: THEME.bgCard, color: THEME.text, border: '1px solid ' + THEME.border,
                borderRadius: '8px', padding: '8px 12px', fontSize: '12px', maxWidth: '220px',
                zIndex: '100', transition: 'opacity 0.15s',
                fontFamily: "'Noto Sans KR', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            });
            (this.container || this.canvas.parentElement).style.position = 'relative';
            (this.container || this.canvas.parentElement).appendChild(this.tooltip);

            this._bindEvents();
            this.resize();
        },

        _bindEvents() {
            this.canvas.addEventListener('mousemove', (e) => {
                const p = getCanvasCoords(this.canvas, e);
                this._hitTest(p);
            });
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const p = getCanvasCoords(this.canvas, e);
                this._hitTest(p);
            }, { passive: false });
            this.canvas.addEventListener('mouseleave', () => {
                this.hoveredBar = -1; this.tooltip.style.opacity = '0'; this.draw();
            });
        },

        _hitTest(p) {
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            const margin = { top: 30, right: 30, bottom: 40, left: 120 };
            const chartW = w - margin.left - margin.right;
            const chartH = h - margin.top - margin.bottom;
            const barH = chartH / Math.max(this.data.length, 1) * 0.65;
            const gap = chartH / Math.max(this.data.length, 1);
            const maxDur = Math.max(...this.data.map(d => d.duration), 1);

            this.hoveredBar = -1;
            for (let i = 0; i < this.data.length; i++) {
                const y = margin.top + i * gap + (gap - barH) / 2;
                const bw = (this.data[i].duration / maxDur) * chartW;
                if (p.x >= margin.left && p.x <= margin.left + bw && p.y >= y && p.y <= y + barH) {
                    this.hoveredBar = i;
                    break;
                }
            }
            if (this.hoveredBar >= 0) {
                const d = this.data[this.hoveredBar];
                this.tooltip.style.opacity = '1';
                this.tooltip.style.left = (p.x + 14) + 'px';
                this.tooltip.style.top = (p.y - 8) + 'px';
                this.tooltip.innerHTML = '<strong>' + d.stage + '</strong><br>소요시간: ' + d.duration + 'ms<br>토큰 수: ' + d.tokens;
            } else {
                this.tooltip.style.opacity = '0';
            }
            this.draw();
        },

        update(data) {
            this.data = data || [];
            this.animProgress = 0;
            this.animating = true;
            this._animate();
        },

        _animate() {
            if (!this.animating) return;
            this.animProgress += 0.02;
            if (this.animProgress >= 1) { this.animProgress = 1; this.animating = false; }
            this.draw();
            if (this.animating) requestAnimationFrame(() => this._animate());
        },

        resize() {
            if (!this.canvas) return;
            const parent = this.container || this.canvas.parentElement;
            const w = parent.clientWidth || 600;
            const h = parent.clientHeight || 350;
            this.ctx = setupCanvas(this.canvas, w, h);
            if (this.data.length) this.draw();
        },

        draw() {
            if (!this.ctx || !this.data.length) return;
            const ctx = this.ctx;
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            ctx.clearRect(0, 0, w, h);

            const margin = { top: 30, right: 30, bottom: 40, left: 120 };
            const chartW = w - margin.left - margin.right;
            const chartH = h - margin.top - margin.bottom;
            const count = this.data.length;
            const gap = chartH / count;
            const barH = gap * 0.65;
            const maxDur = Math.max(...this.data.map(d => d.duration), 1);

            // Grid lines
            ctx.strokeStyle = THEME.gridLine;
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const x = margin.left + (chartW / 4) * i;
                ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, h - margin.bottom); ctx.stroke();
                ctx.fillStyle = THEME.textDim;
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(maxDur / 4 * i) + 'ms', x, h - margin.bottom + 16);
            }

            // Bars
            let runningTotal = 0;
            const totalPoints = [];
            for (let i = 0; i < count; i++) {
                const d = this.data[i];
                const y = margin.top + i * gap + (gap - barH) / 2;
                const t = clamp(this.animProgress * 2 - i * 0.15, 0, 1);
                const bw = (d.duration / maxDur) * chartW * t;

                // Color gradient: blue→green
                const ratio = i / (count - 1);
                const r = Math.round(lerp(74, 6, ratio));
                const g = Math.round(lerp(158, 214, ratio));
                const b = Math.round(lerp(255, 160, ratio));
                const color = 'rgb(' + r + ',' + g + ',' + b + ')';

                const isHov = i === this.hoveredBar;
                ctx.globalAlpha = isHov ? 1 : 0.85;
                ctx.shadowColor = color;
                ctx.shadowBlur = isHov ? 12 : 0;

                // Bar
                ctx.fillStyle = color;
                const br = 4;
                ctx.beginPath();
                ctx.moveTo(margin.left + br, y);
                ctx.lineTo(margin.left + bw - br, y);
                ctx.quadraticCurveTo(margin.left + bw, y, margin.left + bw, y + br);
                ctx.lineTo(margin.left + bw, y + barH - br);
                ctx.quadraticCurveTo(margin.left + bw, y + barH, margin.left + bw - br, y + barH);
                ctx.lineTo(margin.left + br, y + barH);
                ctx.quadraticCurveTo(margin.left, y + barH, margin.left, y + barH - br);
                ctx.lineTo(margin.left, y + br);
                ctx.quadraticCurveTo(margin.left, y, margin.left + br, y);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;

                // Duration text on bar
                if (bw > 40) {
                    ctx.fillStyle = THEME.bg;
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(d.duration + 'ms', margin.left + bw - 8, y + barH / 2);
                }

                // Stage label
                ctx.fillStyle = THEME.text;
                ctx.font = '12px "Noto Sans KR", sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(d.stage, margin.left - 10, y + barH / 2);

                runningTotal += d.duration;
                totalPoints.push({ x: margin.left + bw, y: y + barH / 2, total: runningTotal });
            }

            // Running total line
            if (totalPoints.length > 1 && this.animProgress > 0.3) {
                const lineAlpha = clamp((this.animProgress - 0.3) * 2, 0, 1);
                ctx.globalAlpha = lineAlpha;
                ctx.strokeStyle = THEME.accent;
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(totalPoints[0].x, totalPoints[0].y);
                for (let i = 1; i < totalPoints.length; i++) {
                    ctx.lineTo(totalPoints[i].x, totalPoints[i].y);
                }
                ctx.stroke();
                ctx.setLineDash([]);

                // Total label
                const last = totalPoints[totalPoints.length - 1];
                ctx.fillStyle = THEME.accent;
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('총 ' + runningTotal + 'ms', last.x + 6, last.y);
                ctx.globalAlpha = 1;
            }
        },
    };

    // ──────────────────────────────────────────────
    // 4. Context Influence Score Heatmap
    // ──────────────────────────────────────────────
    const ContextHeatmap = {
        canvas: null, ctx: null, container: null,
        rows: [], data: [], cols: 0,
        animProgress: 0, animating: false,
        hoveredCell: null,
        tooltip: null,

        init(containerId) {
            this.container = document.getElementById(containerId.replace('#', ''));
            if (!this.container) return;
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'block';
            this.container.appendChild(this.canvas);

            this.tooltip = document.createElement('div');
            Object.assign(this.tooltip.style, {
                position: 'absolute', pointerEvents: 'none', opacity: '0',
                background: THEME.bgCard, color: THEME.text, border: '1px solid ' + THEME.border,
                borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
                zIndex: '100', transition: 'opacity 0.15s',
                fontFamily: "'Noto Sans KR', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            });
            this.container.style.position = 'relative';
            this.container.appendChild(this.tooltip);

            this._bindEvents();
            this.resize();
        },

        _bindEvents() {
            const handler = (e) => {
                const p = getCanvasCoords(this.canvas, e);
                this._hitTest(p);
            };
            this.canvas.addEventListener('mousemove', handler);
            this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handler(e); }, { passive: false });
            this.canvas.addEventListener('mouseleave', () => { this.hoveredCell = null; this.tooltip.style.opacity = '0'; this.draw(); });
        },

        _hitTest(p) {
            if (!this.data.length) return;
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            const margin = { top: 40, right: 20, bottom: 30, left: 120 };
            const chartW = w - margin.left - margin.right;
            const chartH = h - margin.top - margin.bottom;
            const cellW = chartW / this.cols;
            const cellH = chartH / this.rows.length;

            const col = Math.floor((p.x - margin.left) / cellW);
            const row = Math.floor((p.y - margin.top) / cellH);

            if (row >= 0 && row < this.rows.length && col >= 0 && col < this.cols) {
                this.hoveredCell = { row, col };
                const val = this.data[row][col];
                this.tooltip.style.opacity = '1';
                this.tooltip.style.left = (p.x + 14) + 'px';
                this.tooltip.style.top = (p.y - 8) + 'px';
                this.tooltip.innerHTML = '<strong>' + this.rows[row] + '</strong><br>토큰 위치: ' + (col + 1) + '<br>영향도: ' + val.toFixed(3);
            } else {
                this.hoveredCell = null;
                this.tooltip.style.opacity = '0';
            }
            this.draw();
        },

        update(heatmapData) {
            this.rows = heatmapData.rows || [];
            this.cols = heatmapData.cols || 0;
            this.data = heatmapData.data || [];
            this.animProgress = 0;
            this.animating = true;
            this._animate();
        },

        _animate() {
            if (!this.animating) return;
            this.animProgress += 0.025;
            if (this.animProgress >= 1) { this.animProgress = 1; this.animating = false; }
            this.draw();
            if (this.animating) requestAnimationFrame(() => this._animate());
        },

        resize() {
            if (!this.container || !this.canvas) return;
            const w = this.container.clientWidth || 600;
            const h = this.container.clientHeight || 300;
            this.ctx = setupCanvas(this.canvas, w, h);
            if (this.data.length) this.draw();
        },

        _scoreToColor(score) {
            // dark blue → cyan → yellow → red
            let r, g, b;
            if (score < 0.33) {
                const t = score / 0.33;
                r = Math.round(lerp(15, 0, t));
                g = Math.round(lerp(25, 200, t));
                b = Math.round(lerp(80, 220, t));
            } else if (score < 0.66) {
                const t = (score - 0.33) / 0.33;
                r = Math.round(lerp(0, 255, t));
                g = Math.round(lerp(200, 230, t));
                b = Math.round(lerp(220, 50, t));
            } else {
                const t = (score - 0.66) / 0.34;
                r = Math.round(lerp(255, 255, t));
                g = Math.round(lerp(230, 60, t));
                b = Math.round(lerp(50, 30, t));
            }
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        },

        draw() {
            if (!this.ctx || !this.data.length) return;
            const ctx = this.ctx;
            const w = parseInt(this.canvas.style.width);
            const h = parseInt(this.canvas.style.height);
            ctx.clearRect(0, 0, w, h);

            const margin = { top: 40, right: 20, bottom: 30, left: 120 };
            const chartW = w - margin.left - margin.right;
            const chartH = h - margin.top - margin.bottom;
            const cellW = chartW / this.cols;
            const cellH = chartH / this.rows.length;

            // Column headers
            ctx.fillStyle = THEME.textDim;
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            for (let c = 0; c < this.cols; c += 2) {
                ctx.fillText((c + 1), margin.left + c * cellW + cellW / 2, margin.top - 8);
            }
            ctx.fillStyle = THEME.textDim;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('출력 토큰 위치 →', margin.left + chartW / 2, margin.top - 24);

            // Row labels
            ctx.fillStyle = THEME.text;
            ctx.font = '11px "Noto Sans KR", sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            for (let r = 0; r < this.rows.length; r++) {
                ctx.fillText(this.rows[r], margin.left - 10, margin.top + r * cellH + cellH / 2);
            }

            // Cells with animated fill
            const revealCol = Math.floor(this.animProgress * (this.cols + 3));
            for (let r = 0; r < this.rows.length; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const t = clamp((revealCol - c) / 3, 0, 1);
                    if (t <= 0) continue;
                    const val = this.data[r][c] * t;
                    const x = margin.left + c * cellW;
                    const y = margin.top + r * cellH;
                    const isHov = this.hoveredCell && this.hoveredCell.row === r && this.hoveredCell.col === c;

                    ctx.fillStyle = this._scoreToColor(val);
                    ctx.globalAlpha = 0.15 + val * 0.85;
                    ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

                    if (isHov) {
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
                    }
                }
            }
            ctx.globalAlpha = 1;

            // Color scale legend
            const lx = w - 24;
            const ly = margin.top;
            const lh = chartH;
            const lw = 12;
            for (let i = 0; i < lh; i++) {
                const score = 1 - i / lh;
                ctx.fillStyle = this._scoreToColor(score);
                ctx.fillRect(lx, ly + i, lw, 1);
            }
            ctx.fillStyle = THEME.textDim;
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('1.0', lx + lw + 3, ly + 4);
            ctx.fillText('0.0', lx + lw + 3, ly + lh);
        },
    };

    // ──────────────────────────────────────────────
    // 5. Tool Call Log Table
    // ──────────────────────────────────────────────
    const ToolLog = {
        container: null,
        entries: [],
        filter: '전체',
        sortCol: null,
        sortDir: 1,
        tableEl: null,

        init(containerId) {
            this.container = document.getElementById(containerId.replace('#', ''));
            if (!this.container) return;

            // Inject styles
            const style = document.createElement('style');
            style.textContent = `
                .nviz-tool-log { width: 100%; border-collapse: collapse; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; }
                .nviz-tool-log th { background: ${THEME.bgCard}; color: ${THEME.textDim}; padding: 10px 12px; text-align: left; cursor: pointer; user-select: none; border-bottom: 2px solid ${THEME.border}; white-space: nowrap; position: sticky; top: 0; }
                .nviz-tool-log th:hover { color: ${THEME.primary}; }
                .nviz-tool-log th .sort-arrow { margin-left: 4px; font-size: 10px; }
                .nviz-tool-log td { padding: 8px 12px; border-bottom: 1px solid ${THEME.border}; color: ${THEME.text}; vertical-align: top; }
                .nviz-tool-log tr { transition: background 0.15s; }
                .nviz-tool-log tr:hover { background: rgba(74,158,255,0.06); }
                .nviz-tool-log tr.new-row { animation: nviz-fadeIn 0.4s ease; }
                @keyframes nviz-fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .nviz-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
                .nviz-badge-success { background: rgba(6,214,160,0.15); color: ${THEME.accent}; }
                .nviz-badge-error { background: rgba(255,107,107,0.15); color: ${THEME.red}; }
                .nviz-badge-pending { background: rgba(255,169,77,0.15); color: ${THEME.amber}; }
                .nviz-filter-bar { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
                .nviz-filter-btn { background: ${THEME.bgCard}; color: ${THEME.textDim}; border: 1px solid ${THEME.border}; padding: 5px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-family: 'Noto Sans KR', sans-serif; transition: all 0.15s; }
                .nviz-filter-btn:hover { border-color: ${THEME.primary}; color: ${THEME.primary}; }
                .nviz-filter-btn.active { background: ${THEME.primary}; color: #fff; border-color: ${THEME.primary}; }
                .nviz-expandable { cursor: pointer; color: ${THEME.textDim}; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .nviz-expandable.expanded { white-space: normal; word-break: break-all; color: ${THEME.text}; }
                .nviz-log-wrapper { max-height: 400px; overflow-y: auto; border: 1px solid ${THEME.border}; border-radius: 8px; }
                .nviz-log-wrapper::-webkit-scrollbar { width: 6px; }
                .nviz-log-wrapper::-webkit-scrollbar-track { background: ${THEME.bg}; }
                .nviz-log-wrapper::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
            `;
            document.head.appendChild(style);

            this._buildUI();
        },

        _buildUI() {
            this.container.innerHTML = '';

            // Filter bar
            const filterBar = document.createElement('div');
            filterBar.className = 'nviz-filter-bar';
            const filters = ['전체', '성공', '실패', '대기중'];
            const filterMap = { '전체': null, '성공': 'success', '실패': 'error', '대기중': 'pending' };
            filters.forEach(f => {
                const btn = document.createElement('button');
                btn.className = 'nviz-filter-btn' + (f === this.filter ? ' active' : '');
                btn.textContent = f;
                btn.addEventListener('click', () => {
                    this.filter = f;
                    filterBar.querySelectorAll('.nviz-filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this._renderRows();
                });
                filterBar.appendChild(btn);
            });
            this.container.appendChild(filterBar);

            // Table wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'nviz-log-wrapper';

            const table = document.createElement('table');
            table.className = 'nviz-tool-log';

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const cols = [
                { key: 'time', label: '시간' },
                { key: 'tool', label: '도구명' },
                { key: 'status', label: '상태' },
                { key: 'duration', label: '소요시간' },
                { key: 'input', label: '입력' },
                { key: 'output', label: '출력' },
            ];
            cols.forEach(c => {
                const th = document.createElement('th');
                th.innerHTML = c.label + '<span class="sort-arrow"></span>';
                th.addEventListener('click', () => {
                    if (this.sortCol === c.key) {
                        this.sortDir *= -1;
                    } else {
                        this.sortCol = c.key;
                        this.sortDir = 1;
                    }
                    // Update arrows
                    headerRow.querySelectorAll('.sort-arrow').forEach(s => s.textContent = '');
                    th.querySelector('.sort-arrow').textContent = this.sortDir > 0 ? ' ▲' : ' ▼';
                    this._renderRows();
                });
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            this.tbody = document.createElement('tbody');
            table.appendChild(this.tbody);
            wrapper.appendChild(table);
            this.container.appendChild(wrapper);
            this.tableEl = table;

            this._renderRows();
        },

        _getFilteredSorted() {
            const filterMap = { '전체': null, '성공': 'success', '실패': 'error', '대기중': 'pending' };
            let list = this.entries.slice();
            const statusFilter = filterMap[this.filter];
            if (statusFilter) list = list.filter(e => e.status === statusFilter);
            if (this.sortCol) {
                list.sort((a, b) => {
                    let va = a[this.sortCol], vb = b[this.sortCol];
                    if (typeof va === 'number') return (va - vb) * this.sortDir;
                    return String(va).localeCompare(String(vb)) * this.sortDir;
                });
            }
            return list;
        },

        _renderRows() {
            if (!this.tbody) return;
            const list = this._getFilteredSorted();
            this.tbody.innerHTML = '';
            list.forEach(entry => {
                const tr = document.createElement('tr');
                // Time
                tr.appendChild(this._td(entry.time));
                // Tool
                const toolTd = this._td(entry.tool);
                toolTd.style.color = THEME.primary;
                toolTd.style.fontWeight = '600';
                tr.appendChild(toolTd);
                // Status
                const statusTd = document.createElement('td');
                const badge = document.createElement('span');
                badge.className = 'nviz-badge nviz-badge-' + entry.status;
                badge.textContent = { success: '성공', error: '실패', pending: '대기중' }[entry.status] || entry.status;
                statusTd.appendChild(badge);
                tr.appendChild(statusTd);
                // Duration
                const durTd = this._td(entry.duration ? entry.duration + 'ms' : '-');
                durTd.style.fontVariantNumeric = 'tabular-nums';
                tr.appendChild(durTd);
                // Input (expandable)
                tr.appendChild(this._expandableTd(entry.input));
                // Output (expandable)
                tr.appendChild(this._expandableTd(entry.output));

                this.tbody.appendChild(tr);
            });
        },

        _td(text) {
            const td = document.createElement('td');
            td.textContent = text;
            return td;
        },

        _expandableTd(text) {
            const td = document.createElement('td');
            const span = document.createElement('span');
            span.className = 'nviz-expandable';
            span.textContent = truncate(text, 30);
            span.title = '클릭하여 펼치기';
            span.addEventListener('click', () => {
                const isExpanded = span.classList.toggle('expanded');
                span.textContent = isExpanded ? text : truncate(text, 30);
            });
            td.appendChild(span);
            return td;
        },

        addEntry(entry, animate) {
            this.entries.push(entry);
            this._renderRows();
            if (animate !== false && this.tbody && this.tbody.lastChild) {
                this.tbody.lastChild.classList.add('new-row');
            }
        },

        setEntries(entries) {
            this.entries = entries.slice();
            this._renderRows();
        },
    };

    // ──────────────────────────────────────────────
    // 6. Export Controls
    // ──────────────────────────────────────────────
    const ExportControls = {
        container: null,

        init(containerId) {
            this.container = document.getElementById(containerId.replace('#', ''));
            if (!this.container) return;

            const style = document.createElement('style');
            style.textContent = `
                .nviz-export-btn { background: ${THEME.bgCard}; color: ${THEME.text}; border: 1px solid ${THEME.border}; padding: 10px 22px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; margin-right: 10px; }
                .nviz-export-btn:hover { border-color: ${THEME.primary}; color: ${THEME.primary}; box-shadow: 0 0 16px rgba(74,158,255,0.15); transform: translateY(-1px); }
                .nviz-export-btn:active { transform: translateY(0); }
            `;
            document.head.appendChild(style);

            const csvBtn = document.createElement('button');
            csvBtn.className = 'nviz-export-btn';
            csvBtn.textContent = 'CSV 내보내기';
            csvBtn.addEventListener('click', () => DataViz.exportCSV());

            const jsonBtn = document.createElement('button');
            jsonBtn.className = 'nviz-export-btn';
            jsonBtn.textContent = 'JSON 내보내기';
            jsonBtn.addEventListener('click', () => DataViz.exportJSON());

            this.container.appendChild(csvBtn);
            this.container.appendChild(jsonBtn);
        },
    };

    // ──────────────────────────────────────────────
    // 7. Global DataViz Object
    // ──────────────────────────────────────────────
    const DataViz = {
        _initialized: false,
        _currentData: {
            decisionTree: null,
            memoryGraph: { nodes: [], edges: [] },
            tokenWaterfall: [],
            heatmap: null,
            toolLogs: [],
        },

        init() {
            if (this._initialized) return;
            this._initialized = true;

            DecisionTree.init('decision-tree-container');
            MemoryGraph.init('memory-graph-container');
            TokenWaterfall.init('token-waterfall-canvas');
            ContextHeatmap.init('context-heatmap-container');
            ToolLog.init('tool-log-container');
            ExportControls.init('export-controls');

            // Load sample data
            this.updateDecisionTree(SAMPLE.decisionTree);
            this.updateMemoryGraph({ nodes: SAMPLE.memoryGraph, edges: SAMPLE.memoryEdges });
            this.updateTokenWaterfall(SAMPLE.tokenWaterfall);
            this.updateHeatmap(SAMPLE.heatmap);
            SAMPLE.toolLogs.forEach(e => this.addToolLog(e));

            // Resize handler
            window.addEventListener('resize', debounce(() => this.resize(), 200));
        },

        updateDecisionTree(data) {
            this._currentData.decisionTree = data;
            DecisionTree.update(data);
        },

        updateMemoryGraph(data) {
            if (data.nodes) this._currentData.memoryGraph.nodes = data.nodes;
            if (data.edges) this._currentData.memoryGraph.edges = data.edges;
            MemoryGraph.update(
                this._currentData.memoryGraph.nodes,
                this._currentData.memoryGraph.edges
            );
        },

        updateTokenWaterfall(data) {
            this._currentData.tokenWaterfall = data;
            TokenWaterfall.update(data);
        },

        updateHeatmap(data) {
            this._currentData.heatmap = data;
            ContextHeatmap.update(data);
        },

        addToolLog(entry) {
            this._currentData.toolLogs.push(entry);
            ToolLog.addEntry(entry);
        },

        exportCSV() {
            const lines = [];
            // Tool logs as CSV
            const headers = ['시간', '도구명', '상태', '소요시간(ms)', '입력', '출력'];
            lines.push(headers.map(escapeCSV).join(','));
            for (const e of this._currentData.toolLogs) {
                lines.push([e.time, e.tool, e.status, e.duration, e.input, e.output].map(escapeCSV).join(','));
            }

            // Add waterfall section
            lines.push('');
            lines.push('토큰 처리 단계');
            lines.push(['단계', '소요시간(ms)', '토큰수'].map(escapeCSV).join(','));
            for (const s of this._currentData.tokenWaterfall) {
                lines.push([s.stage, s.duration, s.tokens].map(escapeCSV).join(','));
            }

            // Add heatmap section
            if (this._currentData.heatmap && this._currentData.heatmap.data) {
                lines.push('');
                lines.push('컨텍스트 영향도 히트맵');
                const hm = this._currentData.heatmap;
                const colHeaders = ['소스'];
                for (let i = 0; i < hm.cols; i++) colHeaders.push('토큰' + (i + 1));
                lines.push(colHeaders.map(escapeCSV).join(','));
                for (let r = 0; r < hm.rows.length; r++) {
                    const row = [hm.rows[r], ...hm.data[r].map(v => v.toFixed(3))];
                    lines.push(row.map(escapeCSV).join(','));
                }
            }

            // UTF-8 BOM for Korean
            const bom = '\uFEFF';
            const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
            downloadBlob(blob, 'neural-map-data.csv');
        },

        exportJSON() {
            const data = {
                exportDate: new Date().toISOString(),
                version: 'Neural Map v10',
                toolLogs: this._currentData.toolLogs,
                tokenWaterfall: this._currentData.tokenWaterfall,
                heatmap: this._currentData.heatmap,
                memoryGraph: this._currentData.memoryGraph,
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
            downloadBlob(blob, 'neural-map-data.json');
        },

        resize() {
            DecisionTree.resize();
            MemoryGraph.resize();
            TokenWaterfall.resize();
            ContextHeatmap.resize();
        },
    };

    // ──────────────────────────────────────────────
    // 8. Auto-initialization & SimulationEngine integration
    // ──────────────────────────────────────────────
    window.DataViz = DataViz;

    document.addEventListener('DOMContentLoaded', function () {
        DataViz.init();

        // Listen for simulation events if SimulationEngine exists
        if (window.SimulationEngine) {
            SimulationEngine.onEvent(function (event) {
                if (!event || !event.type) return;
                switch (event.type) {
                    case 'decision':
                        DataViz.updateDecisionTree(event.data);
                        break;
                    case 'memory':
                        DataViz.updateMemoryGraph(event.data);
                        break;
                    case 'token':
                        DataViz.updateTokenWaterfall(event.data);
                        break;
                    case 'context':
                        DataViz.updateHeatmap(event.data);
                        break;
                    case 'tool_call':
                        DataViz.addToolLog(event.data);
                        break;
                    default:
                        break;
                }
            });
        }
    });

})();
