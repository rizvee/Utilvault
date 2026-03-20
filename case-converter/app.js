document.addEventListener('DOMContentLoaded', () => {
  const inText = document.getElementById('cc-input');
  const outText = document.getElementById('cc-output');
  const btns = document.querySelectorAll('.case-btn');
  const btnCopy = document.getElementById('cc-copy');
  const btnSwap = document.getElementById('cc-swap');
  const btnClear = document.getElementById('cc-clear');
  const toast = document.getElementById('toast');

  let currentMode = 'upper';

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const toSentenceCase = (str) => {
    return str.split(/([.!?]\s+)/).map(s => s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '').join('');
  };

  const toTitleCase = (str) => {
    return str.toLowerCase().split(' ').map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
  };

  const toCamelCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };

  const toSnakeCase = (str) => {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('_') || str.toLowerCase().replace(/\s+/g, '_');
  };

  const convert = () => {
    const val = inText.value;
    if (!val) { outText.value = ''; return; }

    switch (currentMode) {
      case 'upper': outText.value = val.toUpperCase(); break;
      case 'lower': outText.value = val.toLowerCase(); break;
      case 'title': outText.value = toTitleCase(val); break;
      case 'sentence': outText.value = toSentenceCase(val); break;
      case 'camel': outText.value = toCamelCase(val); break;
      case 'snake': outText.value = toSnakeCase(val); break;
    }
  };

  window.convertCase = (mode) => {
    currentMode = mode;
    btns.forEach(b => b.classList.remove('active'));
    // Find the button with this mode in onclick
    const btn = Array.from(btns).find(b => b.getAttribute('onclick').includes(mode));
    if (btn) btn.classList.add('active');
    convert();
  };

  inText.addEventListener('input', convert);

  btnCopy.addEventListener('click', () => {
    if (!outText.value) return;
    navigator.clipboard.writeText(outText.value).then(() => showToast('Output Copied!'));
  });

  btnSwap.addEventListener('click', () => {
    inText.value = outText.value;
    convert();
  });

  btnClear.addEventListener('click', () => {
    inText.value = '';
    outText.value = '';
  });

  // Init
  window.convertCase('upper');
});
