document.addEventListener('DOMContentLoaded', () => {
  const blurIn = document.getElementById('gl-blur');
  const blurVal = document.getElementById('gl-blur-val');
  const opIn = document.getElementById('gl-opacity');
  const opVal = document.getElementById('gl-opacity-val');
  const borderIn = document.getElementById('gl-border');
  const borderVal = document.getElementById('gl-border-val');
  const radiusIn = document.getElementById('gl-radius');
  const radiusVal = document.getElementById('gl-radius-val');
  const shadowIn = document.getElementById('gl-shadow');
  const shadowVal = document.getElementById('gl-shadow-val');
  const colorIn = document.getElementById('gl-color');
  
  const preview = document.getElementById('glass-preview');
  const codeOut = document.getElementById('glass-code');
  const btnCopy = document.getElementById('gl-copy');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const updateGlass = () => {
    blurVal.textContent = `${blurIn.value}px`;
    opVal.textContent = `${opIn.value}%`;
    borderVal.textContent = `${borderIn.value}%`;
    radiusVal.textContent = `${radiusIn.value}px`;
    shadowVal.textContent = `${shadowIn.value}%`;

    const blur = blurIn.value;
    const op = opIn.value / 100;
    const bo = borderIn.value / 100;
    const rad = radiusIn.value;
    const sha = shadowIn.value / 100;
    const rgb = hexToRgb(colorIn.value);

    // Apply styles to preview
    preview.style.background = `rgba(${rgb}, ${op})`;
    preview.style.backdropFilter = `blur(${blur}px)`;
    preview.style.webkitBackdropFilter = `blur(${blur}px)`;
    preview.style.borderRadius = `${rad}px`;
    preview.style.border = `1px solid rgba(255, 255, 255, ${bo})`;
    preview.style.boxShadow = `0 8px 32px 0 rgba(0, 0, 0, ${sha})`;

    // Generate Code
    codeOut.textContent = `background: rgba(${rgb}, ${op});
border-radius: ${rad}px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${sha});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid rgba(255, 255, 255, ${bo});`;
  };

  [blurIn, opIn, borderIn, radiusIn, shadowIn, colorIn].forEach(el => el.addEventListener('input', updateGlass));
  
  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(codeOut.textContent).then(() => showToast('CSS Copied!'));
  });

  updateGlass();
});
