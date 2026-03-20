document.addEventListener('DOMContentLoaded', () => {
  const mdInput = document.getElementById('md-input');
  const mdPreview = document.getElementById('md-preview');
  const btnHtml = document.getElementById('md-copy-html');
  const btnMd = document.getElementById('md-copy-md');
  const btnClear = document.getElementById('md-clear');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const parseMarkdown = (md) => {
    let html = md;
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Lists
    html = html.replace(/^[\s]*[-+*][\s]+(.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/gm, '<ul>$&</ul>');
    
    html = html.replace(/^[\s]*\d+\.[\s]+(.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/gm, '<ol>$&</ol>');
    // nested fix
    html = html.replace(/<\/ul>\n<ul>/g, '');
    html = html.replace(/<\/ol>\n<ol>/g, '');

    // Basic Tables
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      if (content.includes('---')) return ''; // ignore separator
      const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)/gm, '<table><tbody>$1</tbody></table>');
    html = html.replace(/<\/table>\s*<table>/g, '');
    html = html.replace(/<tbody>\s*<tr>(.*?)<\/tr>/g, (m, row) => `<thead><tr>${row.replace(/<td/g, '<th').replace(/<\/td>/g, '</th>')}</tr></thead><tbody>`);

    // Paragraphs
    html = html.split('\n').map(line => {
      let l = line.trim();
      if (!l || l.startsWith('<h') || l.startsWith('<u') || l.startsWith('<o') || l.startsWith('<l') || l.startsWith('<b') || l.startsWith('<p') || l.startsWith('<t')) {
        return line;
      }
      return `<p>${l}</p>`;
    }).join('\n');
    
    // cleanup empty paras
    html = html.replace(/<p><\/p>/g, '');

    return html;
  };

  const updatePreview = () => {
    mdPreview.innerHTML = parseMarkdown(mdInput.value);
  };

  mdInput.addEventListener('input', updatePreview);
  updatePreview();

  btnHtml.addEventListener('click', () => {
    navigator.clipboard.writeText(mdPreview.innerHTML).then(() => showToast('HTML Copied!'));
  });

  btnMd.addEventListener('click', () => {
    navigator.clipboard.writeText(mdInput.value).then(() => showToast('Markdown Copied!'));
  });

  btnClear.addEventListener('click', () => {
    mdInput.value = '';
    updatePreview();
  });
});
