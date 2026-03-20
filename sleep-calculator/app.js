document.addEventListener('DOMContentLoaded', () => {
  const btnWake = document.getElementById('sc-wake-mode');
  const btnBed = document.getElementById('sc-bed-mode');
  const timeInput = document.getElementById('sc-time');
  const label = document.getElementById('sc-label');
  const resultsBox = document.getElementById('sc-results');

  let mode = 'wake'; // 'wake' = calculating wake times based on bedtime. 'bed' = calculating bedtimes based on wake time.

  window.scMode = (m) => {
    mode = m;
    if (mode === 'wake') {
      btnWake.classList.add('active');
      btnBed.classList.remove('active');
      label.textContent = "I want to fall asleep at:";
    } else {
      btnBed.classList.add('active');
      btnWake.classList.remove('active');
      label.textContent = "I need to wake up at:";
    }
    calculate();
  };

  const calculate = () => {
    if (!timeInput.value) return;
    const [h, m] = timeInput.value.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    let times = [];
    
    if (mode === 'wake') {
      // Adding 14 mins to fall asleep
      date.setMinutes(date.getMinutes() + 14);
      
      // forward cycles
      for (let i = 1; i <= 6; i++) {
        const t = new Date(date.getTime() + i * 90 * 60000);
        times.push({ time: t, cycles: i });
      }
      times.reverse();
    } else {
      // backward cycles
      for (let i = 1; i <= 6; i++) {
        const t = new Date(date.getTime() - i * 90 * 60000);
        t.setMinutes(t.getMinutes() - 14); // minus 14 mins to fall asleep
        times.push({ time: t, cycles: i });
      }
    }

    let html = '';
    times.forEach(item => {
      const isOptimal = mode === 'wake' ? (item.cycles === 5 || item.cycles === 6) : (item.cycles === 5 || item.cycles === 6);
      const timeStr = item.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const hoursOfSleep = (item.cycles * 90) / 60;
      
      html += `
        <div class="wake-card ${isOptimal ? 'best' : ''}">
          <div class="wake-time">${timeStr}</div>
          <div class="wake-cycles">${item.cycles} cycles (${hoursOfSleep}h)</div>
          ${isOptimal ? '<div class="wake-label">Optimal</div>' : ''}
        </div>
      `;
    });

    resultsBox.innerHTML = html;
  };

  timeInput.addEventListener('input', calculate);
  calculate();
});
