/**
 * interactions.js — Portfolio Generator Interaction Layer
 *
 * Provides: syntax highlighting, charts, animations, toasts,
 * tooltips, keyboard shortcuts, clipboard, fullscreen, PNG export,
 * tabs, scroll animations, and hero section effects.
 *
 * Depends on globals from structure.html (state, etc.)
 * All functions are globally accessible.
 * UI text is in Korean.
 */

/* ========================================================
   1. CODE HIGHLIGHTING ENGINE
   ======================================================== */

const HIGHLIGHT_RULES = {
  javascript: [
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
    { type: 'tag',      regex: /(&lt;\/?)([\w-]+)/g },
    { type: 'attr',     regex: /\s([\w-]+)(?==)/g },
    { type: 'string',   regex: /("[^"]*"|'[^']*')/g },
    { type: 'bracket',  regex: /(&lt;\/?|\/?\s*&gt;)/g },
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

function _escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * highlight(code, language)
 * Returns HTML string with syntax-highlighted spans.
 */
function highlight(code, language) {
  var escaped = _escapeHTML(code);
  var rules = HIGHLIGHT_RULES[language];
  if (!rules) return escaped;

  // Collect all token matches with their positions
  var tokens = [];
  rules.forEach(function (rule) {
    var re = new RegExp(rule.regex.source, rule.regex.flags);
    var m;
    while ((m = re.exec(escaped)) !== null) {
      // For the tag rule in HTML, the interesting part is group 2 (tag name)
      var matchText = m[1] !== undefined ? m[1] : m[0];
      var start = m.index;
      if (rule.type === 'tag' && m[2] !== undefined) {
        // Wrap the tag name (group 2), leave the bracket alone
        matchText = m[2];
        start = m.index + m[1].length;
      }
      if (rule.type === 'attr') {
        // Group 1 is the attribute name, skip leading whitespace
        matchText = m[1];
        start = m.index + (m[0].length - m[1].length);
      }
      tokens.push({
        type: rule.type,
        start: start,
        end: start + matchText.length,
        text: matchText
      });
      // Prevent infinite loop on zero-length match
      if (m[0].length === 0) re.lastIndex++;
    }
  });

  // Sort by start position ascending, longer match first for same start
  tokens.sort(function (a, b) {
    return a.start - b.start || (b.end - b.start) - (a.end - a.start);
  });

  // Remove overlapping tokens (first-match wins)
  var filtered = [];
  var lastEnd = 0;
  tokens.forEach(function (t) {
    if (t.start >= lastEnd) {
      filtered.push(t);
      lastEnd = t.end;
    }
  });

  // Build result from end to start so indices stay valid
  var result = escaped;
  for (var i = filtered.length - 1; i >= 0; i--) {
    var t = filtered[i];
    var before = result.slice(0, t.start);
    var inner = result.slice(t.start, t.end);
    var after = result.slice(t.end);
    result = before + '<span class="token-' + t.type + '">' + inner + '</span>' + after;
  }
  return result;
}

/**
 * addLineNumbers(highlightedCode)
 * Prepends line number spans to each line.
 */
function addLineNumbers(highlightedCode) {
  var lines = highlightedCode.split('\n');
  return lines.map(function (line, idx) {
    var num = idx + 1;
    return '<span class="line-number">' + num + '</span>' + line;
  }).join('\n');
}

/* ========================================================
   2. CLIPBOARD COPY
   ======================================================== */

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('클립보드에 복사되었습니다', 'success');
    }).catch(function () {
      _fallbackCopy(text);
    });
  } else {
    _fallbackCopy(text);
  }
}

function _fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try {
    var ok = document.execCommand('copy');
    showToast(ok ? '클립보드에 복사되었습니다' : '복사에 실패했습니다', ok ? 'success' : 'error');
  } catch (e) {
    showToast('복사에 실패했습니다', 'error');
  }
  document.body.removeChild(ta);
}

/* ========================================================
   3. GROWTH CHART (Canvas)
   ======================================================== */

function renderGrowthChart(canvas, projects) {
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  // Sort projects by date
  var sorted = (projects || []).slice().filter(function (p) {
    return p.date;
  }).sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  if (sorted.length === 0) {
    // Draw empty state
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 600;
    canvas.height = 300;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('프로젝트 데이터가 없습니다', canvas.width / 2, canvas.height / 2);
    return;
  }

  // Responsive sizing
  var containerW = canvas.parentElement ? canvas.parentElement.clientWidth : 600;
  var dpr = window.devicePixelRatio || 1;
  var w = containerW;
  var h = 300;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  var pad = { top: 30, right: 30, bottom: 50, left: 70 };
  var plotW = w - pad.left - pad.right;
  var plotH = h - pad.top - pad.bottom;

  // Build cumulative data
  var cumulative = [];
  var total = 0;
  sorted.forEach(function (p) {
    total += (p.codeLines || p.lines || 0);
    cumulative.push({ date: new Date(p.date), lines: total, name: p.name || '' });
  });

  var maxLines = Math.max.apply(null, cumulative.map(function (d) { return d.lines; })) || 1;
  var minDate = cumulative[0].date.getTime();
  var maxDate = cumulative[cumulative.length - 1].date.getTime();
  var dateRange = maxDate - minDate || 1;

  // Helpers
  function xPos(date) { return pad.left + ((date.getTime() - minDate) / dateRange) * plotW; }
  function yPos(lines) { return pad.top + plotH - (lines / maxLines) * plotH; }

  // Colors from CSS vars or defaults
  var cs = getComputedStyle(document.documentElement);
  var accentColor = cs.getPropertyValue('--accent') ? cs.getPropertyValue('--accent').trim() : '#6366f1';
  var textColor = cs.getPropertyValue('--text-secondary') ? cs.getPropertyValue('--text-secondary').trim() : '#999';
  var gridColor = cs.getPropertyValue('--border') ? cs.getPropertyValue('--border').trim() : '#333';
  var bgColor = cs.getPropertyValue('--bg-secondary') ? cs.getPropertyValue('--bg-secondary').trim() : '#1a1a2e';

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  var gridCount = 5;
  for (var i = 0; i <= gridCount; i++) {
    var gy = pad.top + (plotH / gridCount) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(pad.left + plotW, gy);
    ctx.stroke();
    // Y-axis labels
    var val = Math.round(maxLines - (maxLines / gridCount) * i);
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val.toLocaleString(), pad.left - 8, gy + 4);
  }

  // Axes
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // X-axis labels
  ctx.fillStyle = textColor;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  cumulative.forEach(function (d) {
    var x = xPos(d.date);
    var label = (d.date.getMonth() + 1) + '/' + d.date.getDate();
    ctx.fillText(label, x, h - pad.bottom + 20);
  });

  // Axis titles
  ctx.fillStyle = textColor;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('날짜', pad.left + plotW / 2, h - 5);

  ctx.save();
  ctx.translate(15, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('코드 라인 수', 0, 0);
  ctx.restore();

  // Animate line drawing
  var points = cumulative.map(function (d) { return { x: xPos(d.date), y: yPos(d.lines) }; });
  var animDuration = 1200;
  var startTime = null;

  function drawFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / animDuration, 1);
    // Ease out cubic
    var ease = 1 - Math.pow(1 - progress, 3);

    // Clear plot area only
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, plotW, plotH);
    ctx.clip();
    ctx.fillStyle = bgColor;
    ctx.fillRect(pad.left, pad.top, plotW, plotH);

    // Re-draw grid inside clip
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (var gi = 0; gi <= gridCount; gi++) {
      var ggy = pad.top + (plotH / gridCount) * gi;
      ctx.beginPath();
      ctx.moveTo(pad.left, ggy);
      ctx.lineTo(pad.left + plotW, ggy);
      ctx.stroke();
    }

    // Gradient fill under curve
    var totalLen = points.length;
    var drawCount = Math.max(1, Math.ceil(totalLen * ease));

    // Area fill
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    grad.addColorStop(0, accentColor + '40');
    grad.addColorStop(1, accentColor + '05');
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + plotH);
    for (var pi = 0; pi < drawCount; pi++) {
      ctx.lineTo(points[pi].x, points[pi].y);
    }
    ctx.lineTo(points[drawCount - 1].x, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var li = 1; li < drawCount; li++) {
      ctx.lineTo(points[li].x, points[li].y);
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Data point circles
    for (var ci = 0; ci < drawCount; ci++) {
      ctx.beginPath();
      ctx.arc(points[ci].x, points[ci].y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(drawFrame);
    }
  }
  requestAnimationFrame(drawFrame);
}

/* ========================================================
   4. TIMELINE ANIMATION
   ======================================================== */

function animateTimelineEntry(el) {
  if (!el) return;
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(el);
}

/* ========================================================
   5. TOAST NOTIFICATIONS
   ======================================================== */

var _toastContainer = null;

function _getToastContainer() {
  if (_toastContainer && document.body.contains(_toastContainer)) return _toastContainer;
  _toastContainer = document.createElement('div');
  _toastContainer.id = 'toast-container';
  _toastContainer.style.cssText =
    'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}

var _toastIcons = {
  info: '\u2139\uFE0F',
  success: '\u2705',
  error: '\u274C',
  warning: '\u26A0\uFE0F'
};

var _toastColors = {
  info: '#3b82f6',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b'
};

function showToast(message, type) {
  type = type || 'info';
  var container = _getToastContainer();

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.style.cssText =
    'pointer-events:auto;display:flex;align-items:center;gap:8px;padding:12px 20px;' +
    'border-radius:8px;font-size:14px;color:#fff;min-width:240px;max-width:400px;' +
    'box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(10px);' +
    'transform:translateX(120%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1),opacity 0.3s;' +
    'background:' + (_toastColors[type] || _toastColors.info) + 'dd;';

  toast.innerHTML =
    '<span style="font-size:18px">' + (_toastIcons[type] || '') + '</span>' +
    '<span>' + _escapeHTML(message) + '</span>';

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(function () {
    toast.style.transform = 'translateX(0)';
  });

  // Auto-dismiss
  var timer = setTimeout(function () { _dismissToast(toast); }, 3000);

  // Allow click to dismiss
  toast.addEventListener('click', function () {
    clearTimeout(timer);
    _dismissToast(toast);
  });
}

function _dismissToast(toast) {
  toast.style.transform = 'translateX(120%)';
  toast.style.opacity = '0';
  setTimeout(function () {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 350);
}

/* ========================================================
   6. TOOLTIP SYSTEM
   ======================================================== */

var _activeTooltip = null;

function initTooltips() {
  document.addEventListener('mouseover', function (e) {
    var target = e.target.closest('[data-tooltip]');
    if (!target) return;
    _showTooltip(target);
  });

  document.addEventListener('mouseout', function (e) {
    var target = e.target.closest('[data-tooltip]');
    if (!target) return;
    _hideTooltip();
  });
}

function _showTooltip(el) {
  _hideTooltip();
  var text = el.getAttribute('data-tooltip');
  if (!text) return;

  var tip = document.createElement('div');
  tip.className = 'tooltip-popup';
  tip.textContent = text;
  tip.style.cssText =
    'position:absolute;z-index:9999;padding:6px 12px;border-radius:6px;font-size:12px;' +
    'color:#fff;background:#1e1e2e;box-shadow:0 4px 12px rgba(0,0,0,0.3);' +
    'pointer-events:none;white-space:nowrap;transition:opacity 0.15s;opacity:0;';

  document.body.appendChild(tip);
  _activeTooltip = tip;

  var rect = el.getBoundingClientRect();
  var tipRect = tip.getBoundingClientRect();

  // Default: show above
  var top = rect.top - tipRect.height - 8 + window.scrollY;
  var left = rect.left + (rect.width - tipRect.width) / 2 + window.scrollX;

  // If above goes out of viewport, show below
  if (top - window.scrollY < 0) {
    top = rect.bottom + 8 + window.scrollY;
  }
  // Clamp left
  if (left < 4) left = 4;
  if (left + tipRect.width > window.innerWidth - 4) {
    left = window.innerWidth - tipRect.width - 4;
  }

  tip.style.top = top + 'px';
  tip.style.left = left + 'px';

  requestAnimationFrame(function () { tip.style.opacity = '1'; });
}

function _hideTooltip() {
  if (_activeTooltip) {
    if (_activeTooltip.parentNode) _activeTooltip.parentNode.removeChild(_activeTooltip);
    _activeTooltip = null;
  }
}

/* ========================================================
   7. KEYBOARD SHORTCUTS
   ======================================================== */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    var isMac = navigator.platform.indexOf('Mac') > -1;
    var mod = isMac ? e.metaKey : e.ctrlKey;
    var tag = (e.target.tagName || '').toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    // Escape — close modal/overlay
    if (e.key === 'Escape') {
      var modal = document.querySelector('.modal.active, .modal[open], .modal.show, .overlay.active');
      if (modal) {
        modal.classList.remove('active', 'show');
        modal.removeAttribute('open');
        e.preventDefault();
        return;
      }
      // Also close shortcuts help modal
      var helpModal = document.getElementById('shortcuts-modal');
      if (helpModal && helpModal.style.display !== 'none') {
        helpModal.style.display = 'none';
        e.preventDefault();
        return;
      }
    }

    // Ctrl/Cmd+N — new project
    if (mod && e.key === 'n') {
      e.preventDefault();
      var addBtn = document.querySelector('[data-action="add-project"], #add-project-btn, .add-project');
      if (addBtn) addBtn.click();
      else if (typeof openProjectModal === 'function') openProjectModal();
      return;
    }

    // Ctrl/Cmd+F — focus search
    if (mod && e.key === 'f') {
      var searchInput = document.querySelector('#search-input, [data-role="search"], input[type="search"]');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        return;
      }
      // Let browser default handle it if no custom search
    }

    // Ctrl/Cmd+E — export JSON
    if (mod && e.key === 'e') {
      e.preventDefault();
      if (typeof exportJSON === 'function') exportJSON();
      else showToast('내보내기 기능을 사용할 수 없습니다', 'warning');
      return;
    }

    // Skip single-key shortcuts if in input
    if (isInput) return;

    // T — toggle theme
    if (e.key === 't' || e.key === 'T') {
      if (typeof toggleTheme === 'function') toggleTheme();
      return;
    }

    // 1-6 — navigate to sections
    if (e.key >= '1' && e.key <= '6') {
      var sections = document.querySelectorAll('section[id], .section[id]');
      var idx = parseInt(e.key) - 1;
      if (sections[idx]) {
        sections[idx].scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // ? — show shortcuts help
    if (e.key === '?') {
      _showShortcutsHelp();
      return;
    }
  });
}

function _showShortcutsHelp() {
  var existing = document.getElementById('shortcuts-modal');
  if (existing) {
    existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
    return;
  }

  var isMac = navigator.platform.indexOf('Mac') > -1;
  var modKey = isMac ? '\u2318' : 'Ctrl';

  var shortcuts = [
    [modKey + '+N', '새 프로젝트 추가'],
    [modKey + '+F', '검색에 포커스'],
    [modKey + '+E', 'JSON 내보내기'],
    ['T', '테마 전환'],
    ['1-6', '섹션 이동'],
    ['Esc', '모달 닫기'],
    ['?', '단축키 도움말'],
  ];

  var modal = document.createElement('div');
  modal.id = 'shortcuts-modal';
  modal.style.cssText =
    'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';

  var content = document.createElement('div');
  content.style.cssText =
    'background:var(--bg-secondary, #1a1a2e);border:1px solid var(--border, #333);border-radius:12px;' +
    'padding:24px 32px;min-width:300px;max-width:420px;color:var(--text-primary, #eee);';

  var title = document.createElement('h3');
  title.textContent = '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4';
  title.style.cssText = 'margin:0 0 16px;font-size:18px;';
  content.appendChild(title);

  var table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;';
  shortcuts.forEach(function (s) {
    var tr = document.createElement('tr');
    var tdKey = document.createElement('td');
    tdKey.style.cssText = 'padding:6px 12px 6px 0;';
    var kbd = document.createElement('kbd');
    kbd.textContent = s[0];
    kbd.style.cssText =
      'display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-family:monospace;' +
      'background:var(--bg-primary, #0f0f23);border:1px solid var(--border, #444);color:var(--accent, #6366f1);';
    tdKey.appendChild(kbd);
    var tdDesc = document.createElement('td');
    tdDesc.textContent = s[1];
    tdDesc.style.cssText = 'padding:6px 0;font-size:14px;color:var(--text-secondary, #999);';
    tr.appendChild(tdKey);
    tr.appendChild(tdDesc);
    table.appendChild(tr);
  });
  content.appendChild(table);

  var closeBtn = document.createElement('button');
  closeBtn.textContent = '닫기';
  closeBtn.style.cssText =
    'margin-top:16px;padding:8px 20px;border:none;border-radius:6px;cursor:pointer;' +
    'background:var(--accent, #6366f1);color:#fff;font-size:14px;';
  closeBtn.onclick = function () { modal.style.display = 'none'; };
  content.appendChild(closeBtn);

  modal.appendChild(content);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.style.display = 'none';
  });
  document.body.appendChild(modal);
}

/* ========================================================
   8. PROGRESS BAR ANIMATION
   ======================================================== */

function animateProgressBars() {
  var bars = document.querySelectorAll('.progress-fill');
  if (!bars.length) return;

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = el.getAttribute('data-progress') || el.getAttribute('data-value') || '0';
        var targetVal = parseFloat(target);

        // Start from 0
        el.style.width = '0%';
        el.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.width = targetVal + '%';
          });
        });

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  bars.forEach(function (bar) { observer.observe(bar); });
}

/* ========================================================
   9. FULLSCREEN API
   ======================================================== */

function toggleFullscreen(el) {
  el = el || document.documentElement;
  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement) {
    var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
    if (rfs) {
      rfs.call(el).catch(function () {
        showToast('전체 화면 모드를 사용할 수 없습니다', 'warning');
      });
    }
  } else {
    var eFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
    if (eFS) eFS.call(document);
  }
}

/* ========================================================
   10. PNG EXPORT
   ======================================================== */

function exportPNG() {
  showToast('PNG를 생성하는 중...', 'info');

  var target = document.querySelector('#hero, .hero-section, section');
  if (!target) {
    showToast('캡처할 섹션을 찾을 수 없습니다', 'error');
    return;
  }

  var rect = target.getBoundingClientRect();
  var w = rect.width;
  var h = rect.height;
  var dpr = window.devicePixelRatio || 1;

  // Clone the target so we get computed styles
  var clone = target.cloneNode(true);

  // Get all computed styles
  var styles = '';
  var styleSheets = document.styleSheets;
  for (var i = 0; i < styleSheets.length; i++) {
    try {
      var rules = styleSheets[i].cssRules || styleSheets[i].rules;
      if (rules) {
        for (var j = 0; j < rules.length; j++) {
          styles += rules[j].cssText + '\n';
        }
      }
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  }

  // Also capture CSS custom properties from :root
  var rootStyles = getComputedStyle(document.documentElement);
  var cssVars = '';
  for (var k = 0; k < rootStyles.length; k++) {
    var prop = rootStyles[k];
    if (prop.startsWith('--')) {
      cssVars += prop + ':' + rootStyles.getPropertyValue(prop) + ';';
    }
  }

  var svgData =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + (w * dpr) + '" height="' + (h * dpr) + '">' +
    '<foreignObject width="100%" height="100%" style="transform:scale(' + dpr + ');transform-origin:0 0">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" style="' + cssVars + '">' +
    '<style>' + _escapeHTML(styles) + '</style>' +
    clone.outerHTML +
    '</div>' +
    '</foreignObject>' +
    '</svg>';

  var img = new Image();
  var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  var url = URL.createObjectURL(svgBlob);

  img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    try {
      canvas.toBlob(function (blob) {
        if (!blob) {
          showToast('PNG 생성에 실패했습니다', 'error');
          return;
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'portfolio.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showToast('PNG가 다운로드되었습니다', 'success');
      }, 'image/png');
    } catch (e) {
      showToast('PNG 내보내기에 실패했습니다 (보안 제한)', 'error');
    }
  };

  img.onerror = function () {
    URL.revokeObjectURL(url);
    showToast('PNG 생성에 실패했습니다', 'error');
  };

  img.src = url;
}

/* ========================================================
   11. SCROLL ANIMATIONS
   ======================================================== */

function initScrollAnimations() {
  var targets = document.querySelectorAll('.fade-in, .slide-up');
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(function (el) { observer.observe(el); });
}

/* ========================================================
   12. TAB SYSTEM
   ======================================================== */

function initTabs() {
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.snippet-tab, [data-tab]');
    if (!tab) return;

    var container = tab.closest('.tab-container, .snippet-tabs, .tabs');
    if (!container) return;

    // Deactivate siblings
    var siblings = container.querySelectorAll('.snippet-tab, [data-tab]');
    siblings.forEach(function (s) { s.classList.remove('active'); });

    // Activate clicked tab
    tab.classList.add('active');

    // Find the corresponding panel
    var tabId = tab.getAttribute('data-tab') || tab.getAttribute('data-lang') || tab.textContent.trim().toLowerCase();
    var panelContainer = container.closest('.code-viewer, .snippet-viewer, section') || container.parentElement;
    if (!panelContainer) return;

    // Hide all panels, show the target
    var panels = panelContainer.querySelectorAll('.tab-panel, .snippet-panel, [data-panel]');
    panels.forEach(function (p) {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    var target = panelContainer.querySelector('[data-panel="' + tabId + '"], #panel-' + tabId);
    if (target) {
      target.style.display = '';
      target.classList.add('active');
    }

    // If there's a code element to re-highlight
    var codeEl = panelContainer.querySelector('code, .code-content');
    if (codeEl && typeof renderSnippet === 'function') {
      // Let structure.html handle content update via its own logic
    }
  });
}

/* ========================================================
   13. HERO ANIMATIONS
   ======================================================== */

function animateTyping(el) {
  if (!el) return;
  var fullText = el.getAttribute('data-text') || el.textContent;
  el.textContent = '';
  el.style.borderRight = '2px solid var(--accent, #6366f1)';

  var idx = 0;
  var speed = 60; // ms per character

  function type() {
    if (idx < fullText.length) {
      el.textContent += fullText.charAt(idx);
      idx++;
      setTimeout(type, speed);
    } else {
      // Blinking cursor
      _blinkCursor(el);
    }
  }

  // Start after a short delay
  setTimeout(type, 300);
}

function _blinkCursor(el) {
  var visible = true;
  setInterval(function () {
    visible = !visible;
    el.style.borderRight = visible
      ? '2px solid var(--accent, #6366f1)'
      : '2px solid transparent';
  }, 530);
}

function animateCountUp(el, target) {
  if (!el) return;
  target = parseInt(target) || 0;
  if (target === 0) { el.textContent = '0'; return; }

  var duration = 2000;
  var startTime = null;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easeOutCubic(progress);
    var current = Math.round(eased * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function buildTechCloud(projects) {
  if (!projects || !projects.length) return '';

  // Aggregate tech stacks
  var counts = {};
  projects.forEach(function (p) {
    var stack = p.techStack || p.tech || [];
    if (typeof stack === 'string') stack = stack.split(',').map(function (s) { return s.trim(); });
    stack.forEach(function (tech) {
      if (!tech) return;
      var key = tech.trim();
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  var entries = Object.keys(counts).map(function (k) { return { name: k, count: counts[k] }; });
  if (!entries.length) return '';

  // Sort by count descending
  entries.sort(function (a, b) { return b.count - a.count; });

  var maxCount = entries[0].count;
  var minSize = 12;
  var maxSize = 28;

  var html = '<div class="tech-cloud" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:16px 0;">';
  entries.forEach(function (e) {
    var ratio = maxCount > 1 ? (e.count - 1) / (maxCount - 1) : 0.5;
    var size = Math.round(minSize + ratio * (maxSize - minSize));
    var opacity = 0.5 + ratio * 0.5;
    html +=
      '<span class="tech-tag" data-tooltip="' + _escapeHTML(e.name) + ': ' + e.count + '개 프로젝트" ' +
      'style="font-size:' + size + 'px;opacity:' + opacity.toFixed(2) + ';' +
      'padding:4px 12px;border-radius:20px;background:var(--accent, #6366f1)22;' +
      'color:var(--accent, #6366f1);cursor:default;transition:transform 0.2s;' +
      'display:inline-block;">' +
      _escapeHTML(e.name) +
      '</span>';
  });
  html += '</div>';

  return html;
}

/* ========================================================
   14. INIT FUNCTION
   ======================================================== */

function initInteractions() {
  initScrollAnimations();
  initTooltips();
  initKeyboardShortcuts();
  initTabs();
  animateProgressBars();

  // Set up copy button listeners (event delegation)
  document.addEventListener('click', function (e) {
    var copyBtn = e.target.closest('.copy-btn, [data-action="copy"]');
    if (!copyBtn) return;

    var codeBlock = copyBtn.closest('.code-block, .snippet-viewer, .code-viewer');
    if (codeBlock) {
      var codeEl = codeBlock.querySelector('code, .code-content, pre');
      if (codeEl) {
        copyToClipboard(codeEl.textContent);
      }
    }
  });

  // Set up fullscreen listeners (event delegation)
  document.addEventListener('click', function (e) {
    var fsBtn = e.target.closest('.fullscreen-btn, [data-action="fullscreen"]');
    if (!fsBtn) return;

    var target = fsBtn.closest('section, .card, .panel') || document.documentElement;
    toggleFullscreen(target);
  });

  // Set up PNG export listeners
  document.addEventListener('click', function (e) {
    var exportBtn = e.target.closest('[data-action="export-png"]');
    if (exportBtn) exportPNG();
  });

  // Render growth chart if canvas exists
  var chartCanvas = document.querySelector('#growth-chart, .growth-chart canvas, canvas[data-chart="growth"]');
  if (chartCanvas && typeof state !== 'undefined' && state.projects) {
    renderGrowthChart(chartCanvas, state.projects);
  }

  // Tech tag hover effect (event delegation)
  document.addEventListener('mouseover', function (e) {
    var tag = e.target.closest('.tech-tag');
    if (tag) tag.style.transform = 'scale(1.1)';
  });
  document.addEventListener('mouseout', function (e) {
    var tag = e.target.closest('.tech-tag');
    if (tag) tag.style.transform = 'scale(1)';
  });
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractions);
} else {
  initInteractions();
}
