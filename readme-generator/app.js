// readme-generator/app.js

document.addEventListener('DOMContentLoaded', () => {
  const pTitle = document.getElementById('p-title');
  const pDesc = document.getElementById('p-desc');
  const pInstall = document.getElementById('p-install');
  const pUsage = document.getElementById('p-usage');
  const pLicense = document.getElementById('p-license');
  
  const mdPreview = document.getElementById('md-preview');
  const mdRaw = document.getElementById('md-raw');
  
  const viewRawBtn = document.getElementById('view-raw-btn');
  const copyBtn = document.getElementById('copy-btn');
  const toast = document.getElementById('toast');

  let currentRawMd = '';
  let isRawView = false;

  // Initial render
  updatePreview();

  // Listeners
  [pTitle, pDesc, pInstall, pUsage, pLicense].forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  function generateMarkdown() {
    const title = pTitle.value.trim() || 'Project Title';
    const desc = pDesc.value.trim();
    const install = pInstall.value.trim();
    const usage = pUsage.value.trim();
    const license = pLicense.value;

    let md = `# ${title}\n\n`;
    
    // Add License Badge if not None
    if(license !== 'None') {
      const badgeLicense = license.replace('-', '_'); // simple replacement for shields.io url format
      md += `![License: ${license}](https://img.shields.io/badge/License-${badgeLicense}-blue.svg)\n\n`;
    }

    if (desc) {
      md += `${desc}\n\n`;
    }
    
    // Table of Contents
    md += `## Table of Contents\n`;
    if (install) md += `- [Installation](#installation)\n`;
    if (usage) md += `- [Usage](#usage)\n`;
    if (license !== 'None') md += `- [License](#license)\n`;
    md += `\n`;

    if (install) {
      md += `## Installation\n\n`;
      // Check if user already put fences, if not wrap it
      if (!install.startsWith('```')) {
        md += `\`\`\`bash\n${install}\n\`\`\`\n\n`;
      } else {
        md += `${install}\n\n`;
      }
    }

    if (usage) {
      md += `## Usage\n\n`;
      if (!usage.startsWith('```')) {
        md += `\`\`\`javascript\n${usage}\n\`\`\`\n\n`;
      } else {
        md += `${usage}\n\n`;
      }
    }

    if (license !== 'None') {
      md += `## License\n\n`;
      md += `This project is licensed under the ${license} License - see the LICENSE file for details.\n\n`;
    }

    return md;
  }

  function updatePreview() {
    currentRawMd = generateMarkdown();
    
    if (isRawView) {
      mdRaw.textContent = currentRawMd;
    } else {
      // using marked.js from CDN
      mdPreview.innerHTML = marked.parse(currentRawMd);
    }
  }

  // Views Toggling
  viewRawBtn.addEventListener('click', () => {
    isRawView = !isRawView;
    
    if (isRawView) {
      viewRawBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Visual';
      viewRawBtn.classList.add('active');
      mdPreview.style.display = 'none';
      mdRaw.style.display = 'block';
      mdRaw.textContent = currentRawMd;
    } else {
      viewRawBtn.innerHTML = '<i class="fa-solid fa-code"></i> Raw';
      viewRawBtn.classList.remove('active');
      mdPreview.style.display = 'block';
      mdRaw.style.display = 'none';
      mdPreview.innerHTML = marked.parse(currentRawMd);
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentRawMd);
      showToast();
    } catch (err) {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentRawMd;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast();
    }
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

});
