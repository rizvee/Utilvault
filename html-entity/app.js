document.addEventListener('DOMContentLoaded', () => {
  const inTA = document.getElementById('he-input');
  const outTA = document.getElementById('he-output');
  const btnEnc = document.getElementById('he-encode');
  const btnDec = document.getElementById('he-decode');
  const btnSwap = document.getElementById('he-swap');
  const btnCopy = document.getElementById('he-copy');
  const btnClear = document.getElementById('he-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const encodeEntities = (rawStr) => {
    return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
      return '&#'+i.charCodeAt(0)+';';
    });
  };

  const decodeEntities = (encodedStr) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encodedStr;
    return textArea.value;
  };

  btnEnc.addEventListener('click', () => {
    outTA.value = encodeEntities(inTA.value);
  });

  btnDec.addEventListener('click', () => {
    outTA.value = decodeEntities(inTA.value);
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
