document.addEventListener('DOMContentLoaded', () => {
  const fg = document.getElementById('cc-fg');
  const fgHex = document.getElementById('cc-fg-hex');
  const bg = document.getElementById('cc-bg');
  const bgHex = document.getElementById('cc-bg-hex');
  const preview = document.getElementById('cc-preview');
  const ratioOut = document.getElementById('cc-ratio');

  const tests = [
    { id: 'wc-aa-normal', pass: 4.5 },
    { id: 'wc-aa-large', pass: 3.0 },
    { id: 'wc-aaa-normal', pass: 7.0 },
    { id: 'wc-aaa-large', pass: 4.5 }
  ];

  // Helper: Hex to sRGB array [r,g,b] 0-1
  const hexToSrgb = (hex) => {
    let r = parseInt(hex.slice(1,3), 16) / 255;
    let g = parseInt(hex.slice(3,5), 16) / 255;
    let b = parseInt(hex.slice(5,7), 16) / 255;
    return [r,g,b];
  };

  // Helper: sRGB to perceived luminance
  const luminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getRatio = (hex1, hex2) => {
    const l1 = luminance(...hexToSrgb(hex1));
    const l2 = luminance(...hexToSrgb(hex2));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const update = () => {
    const fVal = fg.value;
    const bVal = bg.value;

    fgHex.value = fVal;
    bgHex.value = bVal;
    
    preview.style.color = fVal;
    preview.style.backgroundColor = bVal;

    const cr = getRatio(fVal, bVal);
    ratioOut.textContent = cr.toFixed(2) + ':1';

    // Update tests
    tests.forEach(t => {
      const el = document.getElementById(t.id);
      const res = document.getElementById(t.id.replace('normal','n').replace('large','l') + '-r');
      const isPass = cr >= t.pass;
      
      el.className = `wcag-item ${isPass ? 'pass-bg' : 'fail-bg'}`;
      res.className = `wi-result ${isPass ? 'pass' : 'fail'}`;
      res.textContent = isPass ? 'PASS' : 'FAIL';
    });
  };

  const handleHexInput = (e, targetColorEl) => {
    let val = e.target.value.trim();
    if (val.length === 7 && val.startsWith('#')) {
      targetColorEl.value = val;
      update();
    }
  };

  fg.addEventListener('input', update);
  bg.addEventListener('input', update);
  fgHex.addEventListener('input', (e) => handleHexInput(e, fg));
  bgHex.addEventListener('input', (e) => handleHexInput(e, bg));

  update();
});
