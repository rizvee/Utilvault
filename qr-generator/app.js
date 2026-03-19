// qr-generator/app.js
// Uses qrcode-generator (kazuhikoarase) — synchronous raw matrix API.
// Canvas rendering is done manually, enabling real dot-style customization.

let logoDataUrl = null;
let currentType = 'url';
let lastCanvas  = null;

/* ── Content type templates ── */
const TYPE_TEMPLATES = {
  url: {
    fields: [{ id: 'qr-url', type: 'url', label: 'Website URL', placeholder: 'https://example.com' }],
    build: f => f['qr-url'] || ''
  },
  text: {
    fields: [{ id: 'qr-text', type: 'textarea', label: 'Text / Message', placeholder: 'Enter any text...' }],
    build: f => f['qr-text'] || ''
  },
  email: {
    fields: [
      { id: 'qr-email',   type: 'email',    label: 'Email Address',    placeholder: 'you@example.com' },
      { id: 'qr-subject', type: 'text',     label: 'Subject (optional)',placeholder: 'Hello!' },
      { id: 'qr-body',    type: 'textarea', label: 'Body (optional)',   placeholder: 'Message body...' }
    ],
    build: f => {
      let s = `mailto:${f['qr-email'] || ''}`;
      const sub  = encodeURIComponent(f['qr-subject'] || '');
      const body = encodeURIComponent(f['qr-body'] || '');
      if (sub || body) s += `?subject=${sub}&body=${body}`;
      return s;
    }
  },
  phone: {
    fields: [{ id: 'qr-phone', type: 'tel', label: 'Phone Number', placeholder: '+8801700000000' }],
    build: f => `tel:${f['qr-phone'] || ''}`
  },
  wifi: {
    fields: [
      { id: 'qr-ssid',     type: 'text',     label: 'Network Name (SSID)', placeholder: 'MyWiFi' },
      { id: 'qr-pass',     type: 'password', label: 'Password',            placeholder: '••••••••' },
      { id: 'qr-security', type: 'select',   label: 'Security',            options: ['WPA','WEP','None'] }
    ],
    build: f => `WIFI:T:${f['qr-security'] || 'WPA'};S:${f['qr-ssid'] || ''};P:${f['qr-pass'] || ''};;`
  }
};

document.addEventListener('DOMContentLoaded', () => {

  const inputArea       = document.getElementById('input-area');
  const dotStyleSel     = document.getElementById('dot-style');
  const dotColorInput   = document.getElementById('dot-color');
  const bgColorInput    = document.getElementById('bg-color');
  const dotColorHex     = document.getElementById('dot-color-hex');
  const bgColorHex      = document.getElementById('bg-color-hex');
  const sizeSlider      = document.getElementById('size-slider');
  const sizeVal         = document.getElementById('size-val');
  const logoUpload      = document.getElementById('logo-upload');
  const logoDropZone    = document.getElementById('logo-drop-zone');
  const logoPreviewRow  = document.getElementById('logo-preview-row');
  const logoPreviewImg  = document.getElementById('logo-preview-img');
  const logoFilename    = document.getElementById('logo-filename');
  const logoRemoveBtn   = document.getElementById('remove-logo');
  const logoSizeSlider  = document.getElementById('logo-size');
  const logoSizeVal     = document.getElementById('logo-size-val');
  const generateBtn     = document.getElementById('generate-btn');
  const qrCanvasWrap    = document.getElementById('qr-canvas-wrap');
  const qrPlaceholder   = document.getElementById('qr-placeholder');
  const downloadActions = document.getElementById('download-actions');
  const qrInfo          = document.getElementById('qr-info');
  const pills           = document.querySelectorAll('.pill');
  const toast           = document.getElementById('toast');

  /* ── Render input fields ── */
  function renderInputs(type) {
    const tpl = TYPE_TEMPLATES[type];
    if (!tpl) return;
    inputArea.innerHTML = tpl.fields.map(f => {
      let input;
      if (f.type === 'textarea') {
        input = `<textarea id="${f.id}" placeholder="${f.placeholder || ''}" rows="3"></textarea>`;
      } else if (f.type === 'select') {
        input = `<select id="${f.id}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
      } else {
        input = `<input type="${f.type}" id="${f.id}" placeholder="${f.placeholder || ''}">`;
      }
      return `<div class="form-group"><label for="${f.id}">${f.label}</label>${input}</div>`;
    }).join('');
  }

  renderInputs('url');

  /* ── Type pills ── */
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-checked','false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-checked','true');
      currentType = pill.dataset.type;
      renderInputs(currentType);
    });
  });

  /* ── Color pickers ── */
  dotColorInput.addEventListener('input', () => { dotColorHex.textContent = dotColorInput.value; });
  bgColorInput.addEventListener('input',  () => { bgColorHex.textContent  = bgColorInput.value; });

  /* ── Sliders ── */
  sizeSlider.addEventListener('input',     () => { sizeVal.textContent     = sizeSlider.value + ' px'; });
  logoSizeSlider?.addEventListener('input',() => { logoSizeVal.textContent = logoSizeSlider.value + '%'; });

  /* ── Logo upload ── */
  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload a valid image.'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      logoDataUrl = e.target.result;
      logoPreviewImg.src = logoDataUrl;
      logoFilename.textContent = file.name;
      logoPreviewRow.style.display = 'flex';
      logoDropZone.style.display   = 'none';
    };
    reader.readAsDataURL(file);
  }

  logoUpload.addEventListener('change', e => handleLogoFile(e.target.files[0]));
  logoDropZone.addEventListener('dragover', e => { e.preventDefault(); logoDropZone.classList.add('drag-over'); });
  logoDropZone.addEventListener('dragleave', () => logoDropZone.classList.remove('drag-over'));
  logoDropZone.addEventListener('drop', e => {
    e.preventDefault();
    logoDropZone.classList.remove('drag-over');
    handleLogoFile(e.dataTransfer.files[0]);
  });
  logoRemoveBtn?.addEventListener('click', () => {
    logoDataUrl = null;
    logoUpload.value = '';
    logoPreviewRow.style.display = 'none';
    logoDropZone.style.display   = '';
    logoPreviewImg.src = '';
  });

  /* ── Build QR content string ── */
  function getContent() {
    const tpl = TYPE_TEMPLATES[currentType];
    const fields = {};
    tpl.fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) fields[f.id] = el.value.trim();
    });
    return tpl.build(fields);
  }

  /* ── Draw a rounded rectangle on canvas ── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  /* ── Draw QR matrix onto canvas ── */
  function drawQROnCanvas(canvas, qr, dotColor, bgColor, dotStyle) {
    const ctx         = canvas.getContext('2d');
    const size        = canvas.width;
    const moduleCount = qr.getModuleCount();
    const cellSize    = size / moduleCount;
    const margin      = Math.max(1, cellSize * 0.05); // tiny inter-cell gap for dot styles

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = dotColor;

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!qr.isDark(row, col)) continue;

        const x = col * cellSize;
        const y = row * cellSize;

        switch (dotStyle) {
          case 'dots':
            ctx.beginPath();
            ctx.arc(
              x + cellSize / 2,
              y + cellSize / 2,
              (cellSize / 2) - margin,
              0, Math.PI * 2
            );
            ctx.fill();
            break;

          case 'rounded':
            roundRect(ctx, x + margin, y + margin,
              cellSize - margin * 2, cellSize - margin * 2,
              cellSize * 0.25);
            break;

          case 'extra-rounded':
            roundRect(ctx, x + margin, y + margin,
              cellSize - margin * 2, cellSize - margin * 2,
              cellSize * 0.5);
            break;

          case 'classy':
            // Outward-corner classy: solid square with inner top-right notch
            ctx.fillRect(x, y, cellSize * 0.85, cellSize * 0.85);
            break;

          case 'classy-rounded':
            roundRect(ctx, x + margin, y + margin,
              cellSize - margin * 2, cellSize - margin * 2,
              cellSize * 0.35);
            break;

          default: // 'square'
            ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }

  /* ── Overlay logo in center of canvas ── */
  function compositeLogoOnCanvas(canvas, logoSrc, fraction) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ctx      = canvas.getContext('2d');
        const qrSize   = canvas.width;
        const logoSize = qrSize * fraction;
        const x        = (qrSize - logoSize) / 2;
        const y        = (qrSize - logoSize) / 2;
        const pad      = logoSize * 0.18;

        // White circle behind logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + logoSize / 2, y + logoSize / 2, (logoSize + pad) / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve(); // skip gracefully if logo fails
      img.src = logoSrc;
    });
  }

  /* ── MAIN: Generate QR Code ── */
  async function generate() {
    const content = getContent();
    if (!content) { showToast('Please enter some content first!'); return; }

    const size      = parseInt(sizeSlider.value);
    const dotStyle  = dotStyleSel.value;
    const dotColor  = dotColorInput.value;
    const bgColor   = bgColorInput.value;
    const ecLevel   = logoDataUrl ? 'H' : 'M'; // High error correction when logo present

    try {
      // Build QR matrix using qrcode-generator
      // typeNumber 0 = auto-detect size
      const qr = qrcode(0, ecLevel);
      qr.addData(content);
      qr.make();

      // Create canvas and draw
      const canvas = document.createElement('canvas');
      canvas.width  = size;
      canvas.height = size;
      drawQROnCanvas(canvas, qr, dotColor, bgColor, dotStyle);

      // Overlay logo if provided
      if (logoDataUrl && logoSizeSlider) {
        const fraction = parseInt(logoSizeSlider.value) / 100;
        await compositeLogoOnCanvas(canvas, logoDataUrl, fraction);
      }

      // Style the canvas element
      canvas.style.borderRadius = '16px';
      canvas.style.maxWidth     = '100%';
      canvas.style.boxShadow    = 'var(--shadow-lg)';

      lastCanvas = canvas;
      qrCanvasWrap.innerHTML = '';
      qrCanvasWrap.appendChild(canvas);

      // Show download & info
      qrPlaceholder?.remove();
      downloadActions.style.display = 'flex';
      qrInfo.style.display          = 'flex';
      qrInfo.innerHTML = `
        <div class="info-chip"><i class="fa-solid fa-text-width"></i> ${content.length} chars</div>
        <div class="info-chip"><i class="fa-solid fa-expand"></i> ${size}×${size} px</div>
        <div class="info-chip"><i class="fa-solid fa-circle-nodes"></i> ${qr.getModuleCount()}×${qr.getModuleCount()} modules</div>
        ${logoDataUrl ? '<div class="info-chip"><i class="fa-solid fa-image"></i> Logo included</div>' : ''}
        <div class="info-chip"><i class="fa-solid fa-shield"></i> EC Level ${ecLevel}</div>
      `;
    } catch (err) {
      console.error('QR generation error:', err);
      showToast('Generation failed: ' + (err.message || 'Unknown error'));
    }
  }

  generateBtn.addEventListener('click', generate);
  inputArea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); generate(); }
  });

  /* ── Download ── */
  document.getElementById('download-png').addEventListener('click', () => {
    if (!lastCanvas) return;
    const a = document.createElement('a');
    a.download = 'utilvault-qr.png';
    a.href = lastCanvas.toDataURL('image/png');
    a.click();
  });

  document.getElementById('download-svg').addEventListener('click', () => {
    // The library provides SVG string if we ask for it — rebuild as pure SVG
    const content = getContent();
    if (!content) return;
    try {
      const ecLevel = logoDataUrl ? 'H' : 'M';
      const qr = qrcode(0, ecLevel);
      qr.addData(content);
      qr.make();
      const size = parseInt(sizeSlider.value);
      const moduleCount = qr.getModuleCount();
      const cell = size / moduleCount;
      const dotColor = dotColorInput.value;
      const bgColor  = bgColorInput.value;

      let svgCells = '';
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            const x = (col * cell).toFixed(2);
            const y = (row * cell).toFixed(2);
            const w = cell.toFixed(2);
            svgCells += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${dotColor}"/>`;
          }
        }
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bgColor}"/>${svgCells}</svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.download = 'utilvault-qr.svg';
      a.href = URL.createObjectURL(blob);
      a.click();
    } catch (e) {
      showToast('SVG export failed.');
    }
  });

  document.getElementById('copy-svg').addEventListener('click', async () => {
    if (!lastCanvas) return;
    try {
      lastCanvas.toBlob(async blob => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('QR image copied to clipboard!');
      });
    } catch {
      showToast('Use Download instead — clipboard requires HTTPS.');
    }
  });

  /* ── Toast ── */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
});
