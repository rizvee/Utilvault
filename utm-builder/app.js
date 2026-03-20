document.addEventListener('DOMContentLoaded', () => {
  const urlIn = document.getElementById('utm-url');
  const sourceIn = document.getElementById('utm-source');
  const mediumIn = document.getElementById('utm-medium');
  const nameIn = document.getElementById('utm-name');
  const termIn = document.getElementById('utm-term');
  const contentIn = document.getElementById('utm-content');
  
  const outArea = document.getElementById('utm-output');
  const btnCopy = document.getElementById('utm-copy');
  const btnClear = document.getElementById('utm-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const generate = () => {
    let u = urlIn.value.trim();
    if (!u) {
      outArea.value = '';
      return;
    }

    try {
      // Validate basic format
      if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
      }
      const parsed = new URL(u);
      
      const p = new URLSearchParams(parsed.search);
      
      if(sourceIn.value.trim()) p.set('utm_source', sourceIn.value.trim());
      else p.delete('utm_source');
      
      if(mediumIn.value.trim()) p.set('utm_medium', mediumIn.value.trim());
      else p.delete('utm_medium');
      
      if(nameIn.value.trim()) p.set('utm_campaign', nameIn.value.trim());
      else p.delete('utm_campaign');
      
      if(termIn.value.trim()) p.set('utm_term', termIn.value.trim());
      else p.delete('utm_term');
      
      if(contentIn.value.trim()) p.set('utm_content', contentIn.value.trim());
      else p.delete('utm_content');

      parsed.search = p.toString();
      outArea.value = parsed.toString();
    } catch(e) {
      outArea.value = 'Please enter a valid URL.';
    }
  };

  [urlIn, sourceIn, mediumIn, nameIn, termIn, contentIn].forEach(el => {
    el.addEventListener('input', generate);
  });

  btnCopy.addEventListener('click', () => {
    if (!outArea.value || outArea.value.startsWith('Please')) return;
    navigator.clipboard.writeText(outArea.value).then(() => showToast('URL Copied!'));
  });

  btnClear.addEventListener('click', () => {
    urlIn.value = '';
    sourceIn.value = '';
    mediumIn.value = '';
    nameIn.value = '';
    termIn.value = '';
    contentIn.value = '';
    outArea.value = '';
  });
});
