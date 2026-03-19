// qr-generator/app.js
// Uses qrcode (soldair) for reliable QR generation + Canvas API for logo compositing

let logoDataUrl  = null;
let currentType  = 'url';
let lastCanvas   = null; // hold reference for download

/* ── Content type templates ── */
const TYPE_TEMPLATES = {
  url: {
    fields: [
      { id: 'qr-url', type: 'url', label: 'Website URL', placeholder: 'https://example.com' }
    ],
    build: f => f['qr-url'] || ''
  },
  text: {
    fields: [
      { id: 'qr-text', type: 'textarea', label: 'Text / Message', placeholder: 'Enter any text...' }
    ],
    build: f => f['qr-text'] || ''
  },
  email: {
    fields: [
      { id: 'qr-email', type: 'email', label: 'Email Address', placeholder: 'you@example.com' },
      { id: 'qr-subject', type: 'text',  label: 'Subject (optional)', placeholder: 'Hello!' },
      { id: 'qr-body',    type: 'textarea', label: 'Body (optional)', placeholder: 'Message body...' }
    ],
    build: f => {
      let s = `mailto:${f['qr-email'] || ''}`;
      const sub = encodeURIComponent(f['qr-subject'] || '');
      const body = encodeURIComponent(f['qr-body'] || '');
      if (sub || body) s += `?subject=${sub}&body=${body}`;
      return s;
    }
  },
  phone: {
    fields: [
      { id: 'qr-phone', type: 'tel', label: 'Phone Number', placeholder: '+8801700000000' }
    ],
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

  /* ── DOM refs ── */
  const inputArea       = document.getElementById('input-area');
  const dotStyleSel     = document.getElementById('dot-style');
  const cornerStyleSel  = document.getElementById('corner-style');
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

  /* ── Type pill switching ── */
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
  bgColorInput.addEventListener('input',  () => { bgColorHex.textContent  = bgColorInput.value;  });

  /* ── Sliders ── */
  sizeSlider.addEventListener('input', () => { sizeVal.textContent = sizeSlider.value + ' px'; });
  logoSizeSlider?.addEventListener('input', () => { logoSizeVal.textContent = logoSizeSlider.value + '%'; });

  /* ── Logo upload ── */
  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload a valid image file.'); return; }
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

  /* ── Build content string ── */
  function getContent() {
    const tpl = TYPE_TEMPLATES[currentType];
    const fields = {};
    tpl.fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) fields[f.id] = el.value.trim();
    });
    return tpl.build(fields);
  }

  /* ── Composite logo onto QR canvas ── */
  function compositeLogoOnCanvas(qrCanvas, logoSrc, fraction) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ctx    = qrCanvas.getContext('2d');
        const qrSize = qrCanvas.width;
        const logoSize = qrSize * fraction;
        const logoX  = (qrSize - logoSize) / 2;
        const logoY  = (qrSize - logoSize) / 2;

        // White circular background behind logo
        const pad = logoSize * 0.15;
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, (logoSize + pad) / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Draw logo
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        resolve(qrCanvas);
      };
      img.onerror = () => resolve(qrCanvas); // skip if logo fails to load
      img.src = logoSrc;
    });
  }

  /* ── Generate QR Code ── */
  async function generate() {
    const content = getContent();
    if (!content) { showToast('Please enter some content first!'); return; }

    const size = parseInt(sizeSlider.value);
    const errorLevel = logoDataUrl ? 'H' : 'M'; // High correction when logo present

    // Build QRCode options
    const qrOptions = {
      width: size,
      height: size,
      colorDark: dotColorInput.value,
      colorLight: bgColorInput.value,
      correctLevel: QRCode.CorrectLevel[errorLevel]
    };

    // Clear previous output
    qrCanvasWrap.innerHTML = '';

    // Create a temp div for QRCode (library renders into a div)
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    // Use QRCode library
    new QRCode(tempDiv, {
      text: content,
      width: size,
      height: size,
      colorDark: dotColorInput.value,
      colorLight: bgColorInput.value,
      correctLevel: QRCode.CorrectLevel[errorLevel],
      useSVG: false
    });

    // Wait a tick for rendering
    await new Promise(r => setTimeout(r, 100));

    const generatedCanvas = tempDiv.querySelector('canvas');
    if (!generatedCanvas) {
      document.body.removeChild(tempDiv);
      showToast('QR generation failed — try a shorter content string.');
      return;
    }

    // Clone canvas to our display area
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width  = size;
    displayCanvas.height = size;
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(generatedCanvas, 0, 0);
    document.body.removeChild(tempDiv);

    // Apply rounded corner style to the QR display canvas wrapper
    displayCanvas.style.borderRadius = '16px';
    displayCanvas.style.maxWidth = '100%';
    displayCanvas.style.boxShadow = 'var(--shadow-lg)';

    // Composite logo if provided
    if (logoDataUrl && logoSizeSlider) {
      const fraction = parseInt(logoSizeSlider.value) / 100;
      await compositeLogoOnCanvas(displayCanvas, logoDataUrl, fraction);
    }

    lastCanvas = displayCanvas;
    qrCanvasWrap.appendChild(displayCanvas);

    // Show actions
    qrPlaceholder?.remove();
    downloadActions.style.display = 'flex';
    qrInfo.style.display = 'flex';

    qrInfo.innerHTML = `
      <div class="info-chip"><i class="fa-solid fa-text-width"></i> ${content.length} chars</div>
      <div class="info-chip"><i class="fa-solid fa-expand"></i> ${size}×${size} px</div>
      ${logoDataUrl ? '<div class="info-chip"><i class="fa-solid fa-image"></i> Logo included</div>' : ''}
      <div class="info-chip"><i class="fa-solid fa-shield"></i> ${errorLevel} correction</div>
    `;
  }

  generateBtn.addEventListener('click', generate);

  // Generate on Enter (in single-line fields)
  inputArea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); generate(); }
  });

  /* ── Download ── */
  document.getElementById('download-png').addEventListener('click', () => {
    if (!lastCanvas) return;
    const link = document.createElement('a');
    link.download = 'utilvault-qr.png';
    link.href = lastCanvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('download-svg').addEventListener('click', () => {
    if (!lastCanvas) return;
    showToast('SVG export uses PNG data URL (library limitation)');
    // Fallback: export as high-quality PNG renamed .png
    const link = document.createElement('a');
    link.download = 'utilvault-qr.png';
    link.href = lastCanvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('copy-svg').addEventListener('click', async () => {
    if (!lastCanvas) return;
    try {
      lastCanvas.toBlob(async blob => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('QR image copied to clipboard!');
      });
    } catch {
      showToast('Copy not supported in this browser — use Download instead.');
    }
  });

  /* ── Toast ── */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
});
