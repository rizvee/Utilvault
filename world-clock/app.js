document.addEventListener('DOMContentLoaded', () => {
  const clocksGrid = document.getElementById('clocks-grid');
  const citySelect = document.getElementById('wc-city-select');
  const addBtn = document.getElementById('wc-add-btn');
  const toast = document.getElementById('toast');

  const availableCities = [
    { tz: 'UTC', label: 'UTC / GMT' },
    { tz: 'America/New_York', label: 'New York (EST/EDT)' },
    { tz: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { tz: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { tz: 'America/Toronto', label: 'Toronto' },
    { tz: 'America/Sao_Paulo', label: 'São Paulo' },
    { tz: 'Europe/London', label: 'London (GMT/BST)' },
    { tz: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { tz: 'Europe/Berlin', label: 'Berlin' },
    { tz: 'Europe/Moscow', label: 'Moscow' },
    { tz: 'Asia/Dubai', label: 'Dubai' },
    { tz: 'Asia/Kolkata', label: 'New Delhi (IST)' },
    { tz: 'Asia/Bangkok', label: 'Bangkok' },
    { tz: 'Asia/Singapore', label: 'Singapore' },
    { tz: 'Asia/Hong_Kong', label: 'Hong Kong' },
    { tz: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { tz: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { tz: 'Pacific/Auckland', label: 'Auckland' }
  ];

  let pinnedClocks = JSON.parse(localStorage.getItem('uv_world_clocks')) || ['America/New_York', 'Europe/London', 'Asia/Tokyo'];

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const populateSelect = () => {
    citySelect.innerHTML = availableCities.map(c => `<option value="${c.tz}">${c.label}</option>`).join('');
  };

  const saveClocks = () => {
    localStorage.setItem('uv_world_clocks', JSON.stringify(pinnedClocks));
  };

  const renderClocks = () => {
    clocksGrid.innerHTML = '';
    pinnedClocks.forEach(tz => {
      const cityDef = availableCities.find(c => c.tz === tz) || { tz, label: tz.split('/').pop().replace('_', ' ') };
      
      const card = document.createElement('div');
      card.className = 'clock-card';
      card.innerHTML = `
        <button class="clock-remove" data-tz="${tz}" aria-label="Remove clock"><i class="fa-solid fa-xmark"></i></button>
        <div class="clock-city">${cityDef.label}</div>
        <div class="clock-time" id="time-${tz.replace(/\//g,'-')}">--:--:--</div>
        <div class="clock-date" id="date-${tz.replace(/\//g,'-')}">---</div>
        <div class="clock-tz">${tz}</div>
      `;
      clocksGrid.appendChild(card);
    });

    document.querySelectorAll('.clock-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tzToRemove = e.currentTarget.getAttribute('data-tz');
        pinnedClocks = pinnedClocks.filter(t => t !== tzToRemove);
        saveClocks();
        renderClocks();
      });
    });
  };

  const updateTimes = () => {
    const now = new Date();
    pinnedClocks.forEach(tz => {
      try {
        const timeEl = document.getElementById(`time-${tz.replace(/\//g,'-')}`);
        const dateEl = document.getElementById(`date-${tz.replace(/\//g,'-')}`);
        if(timeEl && dateEl) {
          timeEl.textContent = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
          dateEl.textContent = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(now);
        }
      } catch(e){}
    });
  };

  addBtn.addEventListener('click', () => {
    const tz = citySelect.value;
    if (pinnedClocks.includes(tz)) {
      showToast('City is already pinned.');
      return;
    }
    if (pinnedClocks.length >= 6) {
      showToast('Maximum 6 clocks allowed.');
      return;
    }
    pinnedClocks.push(tz);
    saveClocks();
    renderClocks();
    updateTimes();
  });

  populateSelect();
  renderClocks();
  updateTimes();
  setInterval(updateTimes, 1000);
});
