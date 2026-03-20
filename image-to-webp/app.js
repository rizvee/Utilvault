document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('iw-input');
  const dropZone = document.getElementById('iw-drop');
  const qualitySlider = document.getElementById('iw-quality');
  const qualityVal = document.getElementById('iw-quality-val');
  
  const canvas = document.getElementById('iw-canvas');
  const ctx = canvas.getContext('2d');
  
  const previewsBox = document.getElementById('iw-previews');
  const actionsBox = document.getElementById('iw-actions');
  const origImg = document.getElementById('iw-orig-img');
  const origMeta = document.getElementById('iw-orig-meta');
  const webpImg = document.getElementById('iw-webp-img');
  const webpMeta = document.getElementById('iw-webp-meta');
  
  const btnDownload = document.getElementById('iw-download');
  const toast = document.getElementById('toast');

  let currentFile = null;
  let currentWebpBlob = null;
  let currentImgObj = null;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const calculateSavings = (origSize, newSize) => {
    if (newSize >= origSize) return `<span style="color:#ef4444;">Larger (+${formatSize(newSize - origSize)})</span>`;
    const pct = ((origSize - newSize) / origSize * 100).toFixed(1);
    return `<span style="color:#10b981;">Saved ${formatSize(origSize - newSize)} (${pct}%)</span>`;
  };

  const processImage = () => {
    if (!currentImgObj) return;

    const quality = parseInt(qualitySlider.value) / 100;
    
    // Draw to canvas
    canvas.width = currentImgObj.width;
    canvas.height = currentImgObj.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImgObj, 0, 0);

    // Convert to webp
    canvas.toBlob((blob) => {
      currentWebpBlob = blob;
      
      const url = URL.createObjectURL(blob);
      webpImg.onload = () => URL.revokeObjectURL(url);
      webpImg.src = url;

      // Update meta
      webpMeta.innerHTML = `<strong>Size:</strong> ${formatSize(blob.size)}<br>${calculateSavings(currentFile.size, blob.size)}`;

      previewsBox.style.display = 'grid';
      actionsBox.style.display = 'flex';
    }, 'image/webp', quality);
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }
    currentFile = file;
    
    // Show original
    const url = URL.createObjectURL(file);
    origImg.onload = () => {
        URL.revokeObjectURL(url);
        origMeta.innerHTML = `<strong>Format:</strong> ${file.type.split('/')[1].toUpperCase()}<br><strong>Size:</strong> ${formatSize(file.size)}`;
        processImage(); // now process
    };
    origImg.src = url;
    
    // Load image object for canvas
    currentImgObj = new Image();
    currentImgObj.onload = () => {};
    currentImgObj.src = URL.createObjectURL(file);

    dropZone.innerHTML = `<i class="fa-solid fa-file-circle-check"></i><br>Loaded: ${file.name}`;
    fileInput.value = '';
  };

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', e => {
    if(e.target.files.length) handleFile(e.target.files[0]);
  });

  qualitySlider.addEventListener('input', () => {
    qualityVal.textContent = `${qualitySlider.value}%`;
  });

  qualitySlider.addEventListener('change', () => {
    if(currentImgObj) processImage();
  });

  btnDownload.addEventListener('click', () => {
    if (!currentWebpBlob) return;
    const originalName = currentFile.name.split('.').slice(0, -1).join('.') || 'image';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(currentWebpBlob);
    a.download = `${originalName}.webp`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Downloaded WebP!');
  });
});
