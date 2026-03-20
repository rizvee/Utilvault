/* html-composer/app.js — HTML Visual Composer Logic */

'use strict';

// ─── DOM References ───────────────────────────────────────────────────────────
const canvas      = document.getElementById('editor-canvas');
const codeTA      = document.getElementById('code-textarea');
const cleanTA     = document.getElementById('clean-textarea');
const iframe      = document.getElementById('preview-iframe');
const toast       = document.getElementById('toast');
const imgInput    = document.getElementById('img-file-input');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const readTimeEl  = document.getElementById('read-time');

// Tabs
const tabHtml    = document.getElementById('tab-html');
const tabPreview = document.getElementById('tab-preview');
const tabClean   = document.getElementById('tab-clean');
const viewHtml   = document.getElementById('view-html');
const viewPreview= document.getElementById('view-preview');
const viewClean  = document.getElementById('view-clean');

// Action buttons
const btnCopy     = document.getElementById('btn-copy');
const btnDownload = document.getElementById('btn-download');
const btnLink     = document.getElementById('btn-link');
const btnImage    = document.getElementById('btn-image');
const btnClearAll = document.getElementById('btn-clear-all');

// Color pickers
const txtColor       = document.getElementById('txt-color');
const highlightColor = document.getElementById('highlight-color');

// ─── State ───────────────────────────────────────────────────────────────────
let syncFromCode = false; // guard to prevent circular updates
let activeTab    = 'html';

// ─── Toast Helper ─────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Statistics ───────────────────────────────────────────────────────────────
function updateStats() {
  const text   = canvas.innerText || '';
  const words  = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const chars  = text.replace(/\n/g, '').length;
  const rtMins = Math.max(1, Math.ceil(words / 200));

  wordCountEl.textContent = words;
  charCountEl.textContent = chars;
  readTimeEl.textContent  = words < 200 ? '<1' : rtMins;
}

// ─── Clean HTML ───────────────────────────────────────────────────────────────
function cleanHtml(raw) {
  // Parse into a temp document
  const parser = new DOMParser();
  const doc = parser.parseFromString('<body>' + raw + '</body>', 'text/html');

  // Walk all elements
  doc.body.querySelectorAll('*').forEach(el => {
    // Remove empty style attributes
    if (el.getAttribute('style') === '' || el.getAttribute('style') === null) {
      el.removeAttribute('style');
    }
    // Remove id attributes that look auto-generated (browser-generated IDs)
    // Remove empty class attributes
    if (!el.getAttribute('class') || el.getAttribute('class').trim() === '') {
      el.removeAttribute('class');
    }
    // Remove MS Office specific attributes
    ['o:p', 'data-mce-style', 'data-mce-href', 'lang', 'xml:lang'].forEach(a => el.removeAttribute(a));
  });

  // Remove completely empty inline tags
  doc.body.querySelectorAll('span, b, i, u, em, strong').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img, br')) el.remove();
  });

  return doc.body.innerHTML;
}

// ─── Update Code Pane from Canvas ─────────────────────────────────────────────
function canvasToCode() {
  if (syncFromCode) return;
  const html = canvas.innerHTML;
  codeTA.value = formatHtml(html);

  if (activeTab === 'preview') updatePreview();
  if (activeTab === 'clean')   updateClean();
}

// ─── Update Canvas from Code Pane ─────────────────────────────────────────────
function codeToCanvas() {
  syncFromCode = true;
  canvas.innerHTML = codeTA.value;
  syncFromCode = false;
  if (activeTab === 'preview') updatePreview();
  if (activeTab === 'clean')   updateClean();
  updateStats();
}

// ─── Update Preview Iframe ────────────────────────────────────────────────────
function updatePreview() {
  const isDark   = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor  = isDark ? '#0f172a' : '#ffffff';
  const fgColor  = isDark ? '#f8fafc' : '#1e293b';
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: ${bgColor}; color: ${fgColor}; padding: 1.5rem 2rem;
           line-height: 1.7; font-size: 1rem; }
    a { color: #f97316; }
    img { max-width: 100%; border-radius: 8px; }
    blockquote { border-left: 4px solid #f97316; padding: 0.6rem 1rem;
                 background: rgba(249,115,22,0.06); margin: 1rem 0; border-radius: 0 6px 6px 0; }
    pre { background: #1a1f2e; color: #abb2bf; padding: 1rem; border-radius: 8px;
          overflow-x: auto; font-family: monospace; }
    h1,h2,h3 { line-height: 1.3; margin-bottom: 0.5rem; }
  </style></head><body>${canvas.innerHTML}</body></html>`);
  doc.close();
}

// ─── Update Clean Pane ────────────────────────────────────────────────────────
function updateClean() {
  cleanTA.value = formatHtml(cleanHtml(canvas.innerHTML));
}

// ─── Simple HTML Formatter ────────────────────────────────────────────────────
function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const INDENT = '  ';
  const BLOCK = /^(div|p|h[1-6]|ul|ol|li|blockquote|pre|section|article|header|footer|nav|main|figure|figcaption|table|thead|tbody|tr|td|th|br|hr|img|a|span|strong|em|b|i|u)$/i;

  html = html
    .replace(/></g, '>\n<')
    .replace(/^\s*\n/gm, '')
    .trim();

  html.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    if (/^<\//.test(line)) indent = Math.max(0, indent - 1);
    formatted += INDENT.repeat(indent) + line + '\n';
    if (/^<[^/!][^>]*[^/]>$/.test(line) && !/<\//.test(line) && !/<(br|hr|img|input|meta|link)[^>]*>/.test(line)) {
      indent++;
    }
  });

  return formatted.trim();
}

// ─── Toolbar Button Active State ──────────────────────────────────────────────
function updateToolbarState() {
  document.querySelectorAll('.tb-btn[data-cmd]').forEach(btn => {
    const cmd = btn.dataset.cmd;
    const val = btn.dataset.val;
    if (!val) {
      try {
        const active = document.queryCommandState(cmd);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
      } catch (e) { /* not all commands support queryCommandState */ }
    }
  });
}

// ─── Toolbar Buttons ──────────────────────────────────────────────────────────
document.querySelectorAll('.tb-btn[data-cmd]').forEach(btn => {
  btn.addEventListener('mousedown', e => {
    e.preventDefault(); // keep focus in editor
    const cmd = btn.dataset.cmd;
    const val = btn.dataset.val || null;
    try {
      document.execCommand(cmd, false, val);
    } catch (err) { console.warn('execCommand failed:', cmd, err); }
    canvas.focus();
    updateToolbarState();
    canvasToCode();
    updateStats();
  });
});

// ─── Insert Link ──────────────────────────────────────────────────────────────
btnLink.addEventListener('mousedown', e => {
  e.preventDefault();
  canvas.focus();
  const url = prompt('Enter URL:', 'https://');
  if (url && url.trim()) {
    document.execCommand('createLink', false, url.trim());
    canvasToCode();
  }
});

// ─── Insert Image (file → Base64) ────────────────────────────────────────────
btnImage.addEventListener('mousedown', e => {
  e.preventDefault();
  imgInput.click();
});

imgInput.addEventListener('change', () => {
  const file = imgInput.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => {
    canvas.focus();
    document.execCommand('insertImage', false, ev.target.result);
    imgInput.value = '';
    canvasToCode();
    updateStats();
  };
  reader.readAsDataURL(file);
});

// ─── Paste Image Support ──────────────────────────────────────────────────────
canvas.addEventListener('paste', e => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = ev => {
        document.execCommand('insertImage', false, ev.target.result);
        canvasToCode();
        updateStats();
      };
      reader.readAsDataURL(file);
      return;
    }
  }
  // For text pastes, let through but strip external styles
  setTimeout(() => { canvasToCode(); updateStats(); }, 0);
});

// ─── Color Pickers ────────────────────────────────────────────────────────────
txtColor.addEventListener('input', () => {
  canvas.focus();
  document.execCommand('foreColor', false, txtColor.value);
  canvasToCode();
});

highlightColor.addEventListener('input', () => {
  canvas.focus();
  document.execCommand('hiliteColor', false, highlightColor.value);
  canvasToCode();
});

// ─── Clear All ────────────────────────────────────────────────────────────────
btnClearAll.addEventListener('click', () => {
  if (!canvas.innerHTML.trim() || confirm('Clear all content? This cannot be undone.')) {
    canvas.innerHTML = '';
    codeTA.value = '';
    cleanTA.value = '';
    updateStats();
    showToast('Editor cleared.');
  }
});

// ─── Live Canvas → Code sync ──────────────────────────────────────────────────
canvas.addEventListener('input', () => {
  canvasToCode();
  updateStats();
});

canvas.addEventListener('keyup',   updateToolbarState);
canvas.addEventListener('mouseup', updateToolbarState);

// ─── Live Code → Canvas sync ──────────────────────────────────────────────────
codeTA.addEventListener('input', codeToCanvas);

// ─── Tab Switcher ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  [tabHtml, tabPreview, tabClean].forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
  [viewHtml, viewPreview, viewClean].forEach(v => v.classList.remove('active'));

  if (tab === 'html') {
    tabHtml.classList.add('active'); tabHtml.setAttribute('aria-selected', 'true');
    viewHtml.classList.add('active');
  } else if (tab === 'preview') {
    tabPreview.classList.add('active'); tabPreview.setAttribute('aria-selected', 'true');
    viewPreview.classList.add('active');
    updatePreview();
  } else if (tab === 'clean') {
    tabClean.classList.add('active'); tabClean.setAttribute('aria-selected', 'true');
    viewClean.classList.add('active');
    updateClean();
  }
}

tabHtml.addEventListener('click',    () => switchTab('html'));
tabPreview.addEventListener('click', () => switchTab('preview'));
tabClean.addEventListener('click',   () => switchTab('clean'));

// ─── Copy HTML ────────────────────────────────────────────────────────────────
btnCopy.addEventListener('click', async () => {
  const content = activeTab === 'clean' ? cleanTA.value : codeTA.value;
  try {
    await navigator.clipboard.writeText(content);
    showToast(activeTab === 'clean' ? 'Clean HTML copied!' : 'HTML copied to clipboard!');
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = content;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('HTML copied!');
  }
});

// ─── Download .html ───────────────────────────────────────────────────────────
btnDownload.addEventListener('click', () => {
  const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const fgColor = isDark ? '#f8fafc' : '#1e293b';
  const body    = canvas.innerHTML || '<p>Empty document</p>';

  const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Composed Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 800px; margin: 2rem auto; padding: 0 1.5rem;
           background: ${bgColor}; color: ${fgColor}; line-height: 1.7; font-size: 1rem; }
    a { color: #f97316; }
    img { max-width: 100%; border-radius: 8px; }
    blockquote { border-left: 4px solid #f97316; padding: 0.6rem 1rem;
                 background: rgba(249,115,22,0.06); margin: 1rem 0; border-radius: 0 6px 6px 0; }
    pre { background: #1a1f2e; color: #abb2bf; padding: 1rem; border-radius: 8px;
          overflow-x: auto; font-family: 'Courier New', monospace; }
    h1,h2,h3 { line-height: 1.3; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

  const blob = new Blob([fullDoc], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'composed-document.html';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded as .html file!');
});

// ─── Theme change ── refresh preview if open ─────────────────────────────────
const observer = new MutationObserver(() => {
  if (activeTab === 'preview') updatePreview();
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ─── Init ─────────────────────────────────────────────────────────────────────
canvas.focus();
updateStats();
