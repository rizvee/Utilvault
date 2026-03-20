document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('wc-textarea');
  const outWords = document.getElementById('wc-words');
  const outChars = document.getElementById('wc-chars');
  const outCharsNo = document.getElementById('wc-chars-no');
  const outSentences = document.getElementById('wc-sentences');
  const outRead = document.getElementById('wc-read');
  
  const btnCopy = document.getElementById('wc-copy');
  const btnClear = document.getElementById('wc-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const calculate = () => {
    const text = textarea.value;
    
    // Characters
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    // Words
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    // Sentences (split by . ! ?)
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Reading time (average 225 words per minute -> 3.75 words per second)
    const readSeconds = Math.ceil(words / 3.75);
    let readStr = `${readSeconds}s`;
    if (readSeconds > 60) {
      const m = Math.floor(readSeconds / 60);
      const s = readSeconds % 60;
      readStr = `${m}m ${s}s`;
    }

    outWords.textContent = words;
    outChars.textContent = chars;
    outCharsNo.textContent = charsNoSpace;
    outSentences.textContent = sentences;
    outRead.textContent = readStr;
  };

  textarea.addEventListener('input', calculate);

  btnCopy.addEventListener('click', () => {
    if (!textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => showToast('Text Copied!'));
  });

  btnClear.addEventListener('click', () => {
    textarea.value = '';
    calculate();
  });

  calculate();
});
