document.addEventListener('DOMContentLoaded', () => {
  const inList = document.getElementById('lr-input');
  const outList = document.getElementById('lr-output');
  const btnShuffle = document.getElementById('lr-shuffle');
  const btnPick = document.getElementById('lr-pick');
  const btnCopy = document.getElementById('lr-copy');
  const btnClear = document.getElementById('lr-clear');
  
  const winnerCard = document.getElementById('lr-winner-card');
  const winnerName = document.getElementById('lr-winner-name');
  const toast = document.getElementById('toast');

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const getItems = () => {
    return inList.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  btnShuffle.addEventListener('click', () => {
    const items = getItems();
    if (items.length === 0) return;
    
    winnerCard.style.display = 'none';
    outList.style.display = 'block';

    const shuffled = shuffleArray(items);
    outList.value = shuffled.join('\n');
    showToast('List Shuffled!');
  });

  btnPick.addEventListener('click', () => {
    const items = getItems();
    if (items.length === 0) return;

    outList.style.display = 'none';
    const winner = items[Math.floor(Math.random() * items.length)];
    
    winnerName.textContent = winner;
    winnerCard.style.display = 'block';
  });

  btnCopy.addEventListener('click', () => {
    if (!outList.value || outList.style.display === 'none') {
      showToast('Nothing to copy (or winner is shown)');
      return;
    }
    navigator.clipboard.writeText(outList.value).then(() => showToast('Result Copied!'));
  });

  btnClear.addEventListener('click', () => {
    inList.value = '';
    outList.value = '';
    winnerCard.style.display = 'none';
    outList.style.display = 'block';
  });
});
