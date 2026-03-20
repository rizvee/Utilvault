document.addEventListener('DOMContentLoaded', () => {
  const presets = document.querySelectorAll('.preset-btn');
  const durInput = document.getElementById('bp-duration');
  const startBtn = document.getElementById('bp-start');
  
  const fillInner = document.getElementById('breath-fill');
  const phaseLabel = document.getElementById('breath-phase');
  const countLabel = document.getElementById('breath-count');
  const infoLabel = document.getElementById('bp-session-info');
  const remainLabel = document.getElementById('bp-remaining');

  let isRunning = false;
  let pattern = [4, 4, 4, 4]; // inhale, hold, exhale, hold
  let currentPhaseIdx = 0;
  let timerInterval = null;
  let sessionInterval = null;
  let totalSessionSeconds = 0;
  let currentPhaseSeconds = 0;
  let cyclesComplete = 0;

  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      if(isRunning) return;
      presets.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      pattern = btn.getAttribute('data-pattern').split('-').map(Number);
    });
  });

  const stopSession = () => {
    isRunning = false;
    clearInterval(timerInterval);
    clearInterval(sessionInterval);
    
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Session';
    startBtn.style.background = '#10b981';
    
    fillInner.style.transition = 'none';
    fillInner.style.transform = 'scale(0.5)';
    phaseLabel.textContent = 'Ready';
    countLabel.textContent = '–';
    
    // reset remaining display
    remainLabel.value = `${durInput.value}:00`;
  };

  const updateSessionTimer = () => {
    totalSessionSeconds--;
    if (totalSessionSeconds <= 0) {
      stopSession();
      infoLabel.textContent = `Session Complete! ${cyclesComplete} cycles finished.`;
      const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
      beep.play().catch(e=>{});
      return;
    }
    const m = Math.floor(totalSessionSeconds / 60);
    const s = totalSessionSeconds % 60;
    remainLabel.value = `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextPhase = () => {
    if (!isRunning) return;

    let duration = pattern[currentPhaseIdx];
    
    // Skip 0 duration phases (e.g. 5-0-5-0)
    while(duration === 0) {
      currentPhaseIdx = (currentPhaseIdx + 1) % 4;
      if (currentPhaseIdx === 0) cyclesComplete++;
      duration = pattern[currentPhaseIdx];
    }

    const phaseName = phases[currentPhaseIdx];
    phaseLabel.textContent = phaseName;
    currentPhaseSeconds = duration;
    countLabel.textContent = currentPhaseSeconds;

    infoLabel.textContent = `Session: ${cyclesComplete} cycles complete`;

    // Setup animation
    fillInner.style.transition = `transform ${duration}s linear`;
    if (phaseName === 'Inhale') {
      fillInner.style.transform = 'scale(1.0)';
    } else if (phaseName === 'Exhale') {
      fillInner.style.transform = 'scale(0.5)';
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      currentPhaseSeconds--;
      if (currentPhaseSeconds > 0) {
        countLabel.textContent = currentPhaseSeconds;
      } else {
        clearInterval(timerInterval);
        currentPhaseIdx = (currentPhaseIdx + 1) % 4;
        if (currentPhaseIdx === 0) cyclesComplete++;
        nextPhase();
      }
    }, 1000);
  };

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      stopSession();
      return;
    }

    const mins = parseInt(durInput.value) || 5;
    totalSessionSeconds = mins * 60;
    cyclesComplete = 0;
    currentPhaseIdx = 0;
    
    isRunning = true;
    startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Session';
    startBtn.style.background = '#ef4444';
    
    // Start session timer
    const m = Math.floor(totalSessionSeconds / 60);
    const s = totalSessionSeconds % 60;
    remainLabel.value = `${m}:${s.toString().padStart(2, '0')}`;
    sessionInterval = setInterval(updateSessionTimer, 1000);

    // Initial scale start point
    fillInner.style.transition = 'none';
    fillInner.style.transform = 'scale(0.5)';
    
    // Slight delay to ensure transition reset applies
    setTimeout(nextPhase, 50);
  });
});
