document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('li-type');
  const countInput = document.getElementById('li-count');
  const classicCheck = document.getElementById('li-classic');
  const generateBtn = document.getElementById('li-generate');
  
  const outputBox = document.getElementById('li-output');
  const copyTextBtn = document.getElementById('li-copy');
  const copyHtmlBtn = document.getElementById('li-copy-html');
  const toast = document.getElementById('toast');

  const words = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','ut','aliquip','ex','ea','commodo','consequat','duis','aute','irure','dolor','in','reprehenderit','in','voluptate','velit','esse','cillum','dolore','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','in','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];

  const randWord = () => words[Math.floor(Math.random() * words.length)];

  const generateSentence = () => {
    const len = Math.floor(Math.random() * 10) + 6; // 6 to 15 words
    let sentence = [];
    for(let i=0; i<len; i++) sentence.push(randWord());
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    return sentence.join(' ') + '.';
  };

  const generateParagraph = (startWithClassic) => {
    const len = Math.floor(Math.random() * 4) + 4; // 4 to 7 sentences
    let paragraph = [];
    if (startWithClassic) {
      paragraph.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
    } else {
      paragraph.push(generateSentence());
    }
    for(let i=1; i<len; i++) {
        // Just gen normally for subsequent sentences
        let s = generateSentence();
        if (s.toLowerCase().startsWith('lorem ipsum')) s = generateSentence();
        paragraph.push(s);
    }
    return paragraph.join(' ');
  };

  const generate = () => {
    const type = typeSelect.value;
    let count = parseInt(countInput.value) || 3;
    if (count > 50) { count = 50; countInput.value = 50; }
    
    let resultRows = [];
    const isClassic = classicCheck.checked;

    if (type === 'paragraphs') {
      for(let i=0; i<count; i++) {
        resultRows.push(generateParagraph(i === 0 && isClassic));
      }
      outputBox.innerHTML = resultRows.map(p => `<p>${p}</p>`).join('');
    } 
    else if (type === 'sentences') {
      for(let i=0; i<count; i++) {
        if(i === 0 && isClassic) resultRows.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
        else resultRows.push(generateSentence());
      }
      outputBox.innerHTML = resultRows.join(' ');
    }
    else if (type === 'words') {
      for(let i=0; i<count; i++) {
        if(isClassic && i < 5) {
            resultRows.push(['Lorem','ipsum','dolor','sit','amet'][i].toLowerCase());
        } else {
            resultRows.push(randWord());
        }
      }
      resultRows[0] = resultRows[0].charAt(0).toUpperCase() + resultRows[0].slice(1);
      outputBox.innerHTML = resultRows.join(' ') + '.';
    }
  };

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  generateBtn.addEventListener('click', generate);

  copyTextBtn.addEventListener('click', () => {
    const text = outputBox.innerText;
    navigator.clipboard.writeText(text).then(() => showToast('Text Copied!'));
  });

  copyHtmlBtn.addEventListener('click', () => {
    const html = outputBox.innerHTML;
    navigator.clipboard.writeText(html).then(() => showToast('HTML Copied!'));
  });

  generate();
});
