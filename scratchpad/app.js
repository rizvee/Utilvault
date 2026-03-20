document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('sp-editor');
  const outWords = document.getElementById('sp-words');
  const outChars = document.getElementById('sp-chars');
  const saveInd = document.getElementById('sp-saved');
  const outFontSize = document.getElementById('sp-font-size');
  
  const btnInc = document.getElementById('sp-font-inc');
  const btnDec = document.getElementById('sp-font-dec');
  const btnCopy = document.getElementById('sp-copy');
  const btnDownload = document.getElementById('sp-download');
  const btnClear = document.getElementById('sp-clear');
  const toast = document.getElementById('toast');

  let fontSize = parseInt(localStorage.getItem('uv_sp_fontsize')) || 16;
  const savedText = localStorage.getItem('uv_sp_text') || '';

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const updateStats = () => {
    const text = editor.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    outChars.textContent = `${chars} chars`;
    outWords.textContent = `${words} words`;
  };

  const applyFontSize = () => {
    editor.style.fontSize = `${fontSize}px`;
    outFontSize.textContent = `${fontSize}px`;
    localStorage.setItem('uv_sp_fontsize', fontSize);
  };

  let saveTimeout;
  const autoSave = () => {
    clearTimeout(saveTimeout);
    saveInd.classList.remove('show');
    saveTimeout = setTimeout(() => {
      localStorage.setItem('uv_sp_text', editor.value);
      saveInd.classList.add('show');
      setTimeout(() => saveInd.classList.remove('show'), 2000);
    }, 1000);
  };

  // Init
  editor.value = savedText;
  applyFontSize();
  updateStats();

  editor.addEventListener('input', () => {
    updateStats();
    autoSave();
  });

  btnInc.addEventListener('click', () => {
    if (fontSize < 48) { fontSize += 2; applyFontSize(); }
  });

  btnDec.addEventListener('click', () => {
    if (fontSize > 10) { fontSize -= 2; applyFontSize(); }
  });

  btnCopy.addEventListener('click', () => {
    if (!editor.value) return;
    navigator.clipboard.writeText(editor.value).then(() => showToast('Copied to clipboard'));
  });

  btnDownload.addEventListener('click', () => {
    if (!editor.value) return;
    const blob = new Blob([editor.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scratchpad_notes.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded File');
  });

  btnClear.addEventListener('click', () => {
    if (editor.value.length === 0) return;
    if (confirm('Clear all text?')) {
      editor.value = '';
      updateStats();
      autoSave();
    }
  });
});
