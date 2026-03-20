document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.b64-tab');
  const panes = document.querySelectorAll('.b64-pane');
  const toast = document.getElementById('toast');

  // Encode
  const inEnc = document.getElementById('b64-input-text');
  const outEnc = document.getElementById('b64-output-enc');
  const btnEncode = document.getElementById('b64-encode-btn');
  const btnCopyEnc = document.getElementById('b64-copy-enc');

  // Decode
  const inDec = document.getElementById('b64-input-dec');
  const outDec = document.getElementById('b64-output-dec');
  const imgPreview = document.getElementById('b64-preview-img');
  const btnDecode = document.getElementById('b64-decode-btn');
  const btnCopyDec = document.getElementById('b64-copy-dec');

  // File
  const fileDrop = document.getElementById('b64-file-drop');
  const fileInput = document.getElementById('b64-file-input');
  const fileOutput = document.getElementById('b64-file-output');
  const fileResult = document.getElementById('b64-file-result');
  const fileActions = document.getElementById('b64-file-actions');
  const btnCopyFile = document.getElementById('b64-copy-file');
  const btnCopyCss = document.getElementById('b64-copy-css');
  let currentFileMime = '';

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  window.b64Tab = (t) => {
    tabs.forEach(x => x.classList.remove('active'));
    panes.forEach(x => x.classList.remove('active'));
    document.getElementById(`tab-${t === 'encode' ? 'enc' : t === 'decode' ? 'dec' : 'file'}`).classList.add('active');
    document.getElementById(`pane-${t}`).classList.add('active');
  };

  // Text Encode
  btnEncode.addEventListener('click', () => {
    try {
      outEnc.value = btoa(unescape(encodeURIComponent(inEnc.value)));
    } catch(e) {
      alert("Error encoding: " + e.message);
    }
  });

  btnCopyEnc.addEventListener('click', () => {
    if(outEnc.value) navigator.clipboard.writeText(outEnc.value).then(() => showToast('Copied!'));
  });

  // Text Decode
  btnDecode.addEventListener('click', () => {
    imgPreview.style.display = 'none';
    outDec.style.display = 'block';
    const val = inDec.value.trim();
    if(!val) return;

    // Check if it's a data URI image
    if(val.startsWith('data:image/')) {
      imgPreview.src = val;
      imgPreview.style.display = 'block';
      outDec.style.display = 'none';
      return;
    }

    try {
      const b64 = val.replace(/^data:[^;]+;base64,/, ''); // strip prefix if present but not image
      outDec.value = decodeURIComponent(escape(atob(b64)));
    } catch(e) {
      alert("Invalid Base64 string!");
    }
  });

  btnCopyDec.addEventListener('click', () => {
    if(outDec.value && outDec.style.display !== 'none') navigator.clipboard.writeText(outDec.value).then(() => showToast('Copied!'));
  });

  // File
  const handleFile = (file) => {
    if(!file) return;
    fileDrop.innerHTML = `<i class="fa-solid fa-file-circle-check"></i> <strong>${file.name}</strong> (${Math.round(file.size/1024)} KB)`;
    const reader = new FileReader();
    reader.onload = (e) => {
      fileOutput.value = e.target.result;
      currentFileMime = extToMime(file.name) || file.type || 'application/octet-stream';
      fileResult.style.display = 'block';
      fileActions.style.display = 'flex';
      showToast('File Encoded');
    };
    reader.readAsDataURL(file);
  };

  const extToMime = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const map = { 'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','gif':'image/gif','svg':'image/svg+xml','woff2':'font/woff2' };
    return map[ext] || '';
  };

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  
  fileDrop.addEventListener('dragover', (e) => { e.preventDefault(); fileDrop.classList.add('over'); });
  fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('over'));
  fileDrop.addEventListener('drop', (e) => {
    e.preventDefault(); fileDrop.classList.remove('over');
    handleFile(e.dataTransfer.files[0]);
  });

  btnCopyFile.addEventListener('click', () => {
    if(fileOutput.value) navigator.clipboard.writeText(fileOutput.value.replace(/^data:[^;]+;base64,/, '')).then(() => showToast('Copied Raw Base64!'));
  });

  btnCopyCss.addEventListener('click', () => {
    if(fileOutput.value) navigator.clipboard.writeText(`url("${fileOutput.value}")`).then(() => showToast('Copied as CSS url()!'));
  });
});
