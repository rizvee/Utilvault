document.addEventListener('DOMContentLoaded', () => {
  const inTA = document.getElementById('ue-input');
  const outTA = document.getElementById('ue-output');
  const btnEnc = document.getElementById('ue-encode');
  const btnDec = document.getElementById('ue-decode');
  const btnSwap = document.getElementById('ue-swap');
  const btnCopy = document.getElementById('ue-copy');
  const btnClear = document.getElementById('ue-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  btnEnc.addEventListener('click', () => {
    try {
      outTA.value = encodeURIComponent(inTA.value);
    } catch(e) {
      alert('Error encoding: ' + e.message);
    }
  });

  btnDec.addEventListener('click', () => {
    try {
      outTA.value = decodeURIComponent(inTA.value);
    } catch(e) {
      alert('Error decoding (Invalid URL sequence?): ' + e.message);
    }
  });

  btnSwap.addEventListener('click', () => {
    inTA.value = outTA.value;
    outTA.value = '';
  });

  btnCopy.addEventListener('click', () => {
    if (!outTA.value) return;
    navigator.clipboard.writeText(outTA.value).then(() => showToast('Output Copied!'));
  });

  btnClear.addEventListener('click', () => {
    inTA.value = '';
    outTA.value = '';
  });
});
