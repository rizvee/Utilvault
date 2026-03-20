document.addEventListener('DOMContentLoaded', () => {
  const goalInput = document.getElementById('wt-goal');
  const sizeInput = document.getElementById('wt-size');
  
  const countDisp = document.getElementById('wt-count');
  const goalDisp = document.getElementById('wt-goal-disp');
  const mlDisp = document.getElementById('wt-ml');
  const pctDisp = document.getElementById('wt-pct');
  const bar = document.getElementById('wt-bar');
  const glassesGrid = document.getElementById('wt-glasses');
  
  const btnAdd = document.getElementById('wt-add');
  const btnReset = document.getElementById('wt-reset');
  const dateDisp = document.getElementById('wt-date');
  const toast = document.getElementById('toast');

  const getTodayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

  let data = JSON.parse(localStorage.getItem('uv_water_tracker')) || { date: '', count: 0, goal: 8, size: 250 };
  
  if (data.date !== getTodayStr()) {
    data.count = 0;
    data.date = getTodayStr();
    localStorage.setItem('uv_water_tracker', JSON.stringify(data));
  }

  goalInput.value = data.goal;
  sizeInput.value = data.size;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const saveData = () => {
    data.goal = parseInt(goalInput.value) || 8;
    data.size = parseInt(sizeInput.value) || 250;
    localStorage.setItem('uv_water_tracker', JSON.stringify(data));
    render();
  };

  const render = () => {
    dateDisp.textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    
    countDisp.textContent = data.count;
    goalDisp.textContent = data.goal;
    mlDisp.textContent = data.count * data.size;
    
    const pct = data.goal > 0 ? Math.min(100, (data.count / data.goal) * 100) : 0;
    pctDisp.textContent = pct.toFixed(0);
    bar.style.width = `${pct}%`;

    // Render glasses
    glassesGrid.innerHTML = '';
    const totalGlasses = Math.max(data.goal, data.count);
    
    for (let i = 0; i < totalGlasses; i++) {
      const btn = document.createElement('button');
      btn.className = `glass-btn ${i < data.count ? 'filled' : ''}`;
      btn.innerHTML = `<i class="fa-solid fa-glass-water"></i>`;
      btn.setAttribute('aria-label', `Glass ${i+1}`);
      btn.addEventListener('click', () => {
        if (i < data.count) {
          // Removes this glass and above
          data.count = i;
        } else {
          // Adds up to this glass
          data.count = i + 1;
        }
        saveData();
      });
      glassesGrid.appendChild(btn);
    }
  };

  btnAdd.addEventListener('click', () => {
    data.count++;
    saveData();
    if(data.count === data.goal) showToast('🎉 Daily goal reached!');
  });

  btnReset.addEventListener('click', () => {
    if(confirm('Reset all water intake for today?')) {
      data.count = 0;
      saveData();
    }
  });

  goalInput.addEventListener('change', saveData);
  sizeInput.addEventListener('change', saveData);

  render();
});
