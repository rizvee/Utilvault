document.addEventListener('DOMContentLoaded', () => {
  const inTA = document.getElementById('jf-input');
  const outTA = document.getElementById('jf-output');
  const statusEl = document.getElementById('jf-status');
  const btnFormat = document.getElementById('jf-format');
  const btnMinify = document.getElementById('jf-minify');
  const btnValidate = document.getElementById('jf-validate');
  const btnCopy = document.getElementById('jf-copy');
  const btnClear = document.getElementById('jf-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const setStatus = (isValid, msg) => {
    statusEl.style.display = 'flex';
    statusEl.className = `jf-status ${isValid ? 'valid' : 'invalid'}`;
    statusEl.innerHTML = isValid 
      ? `<i class="fa-solid fa-circle-check"></i> ${msg}`
      : `<i class="fa-solid fa-circle-xmark"></i> ${msg}`;
  };

  const processJson = (action) => {
    const raw = inTA.value.trim();
    if (!raw) {
      outTA.value = '';
      statusEl.style.display = 'none';
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setStatus(true, 'Valid JSON');
      if (action === 'format') {
        outTA.value = JSON.stringify(parsed, null, 2);
      } else if (action === 'minify') {
        outTA.value = JSON.stringify(parsed);
      }
    } catch (err) {
      setStatus(false, err.message);
      if (action !== 'validate') {
        outTA.value = '';
      }
    }
  };

  btnFormat.addEventListener('click', () => processJson('format'));
  btnMinify.addEventListener('click', () => processJson('minify'));
  btnValidate.addEventListener('click', () => processJson('validate'));

  btnCopy.addEventListener('click', () => {
    if (!outTA.value) return;
    navigator.clipboard.writeText(outTA.value).then(() => showToast('Output Copied!'));
  });

  btnClear.addEventListener('click', () => {
    inTA.value = '';
    outTA.value = '';
    statusEl.style.display = 'none';
  });

  // Auto format smartly on paste or blur? Maybe just manual for now
});
