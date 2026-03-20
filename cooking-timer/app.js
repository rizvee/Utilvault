document.addEventListener('DOMContentLoaded', () => {
  const timersGrid = document.getElementById('timers-grid');

  // Simple beep sound using Web Audio API
  const playBeep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e){}
  };

  const createTimer = (id, defaultName) => {
    const card = document.createElement('div');
    card.className = 'timer-card';
    
    card.innerHTML = `
      <div class="timer-label"><input type="text" value="${defaultName}"></div>
      <div class="timer-display" id="td-${id}">00:00:00</div>
      <div class="timer-inputs">
        <input type="number" id="th-${id}" min="0" max="99" placeholder="HH" value="0">
        <span class="timer-sep">:</span>
        <input type="number" id="tm-${id}" min="0" max="59" placeholder="MM" value="0">
        <span class="timer-sep">:</span>
        <input type="number" id="ts-${id}" min="0" max="59" placeholder="SS" value="0">
      </div>
      <div class="timer-btns">
        <button class="btn-start" id="tstart-${id}">Start</button>
        <button class="btn-reset" id="treset-${id}">Reset</button>
      </div>
    `;
    
    timersGrid.appendChild(card);

    const display = card.querySelector(`#td-${id}`);
    const inH = card.querySelector(`#th-${id}`);
    const inM = card.querySelector(`#tm-${id}`);
    const inS = card.querySelector(`#ts-${id}`);
    const btnStart = card.querySelector(`#tstart-${id}`);
    const btnReset = card.querySelector(`#treset-${id}`);
    
    let interval = null;
    let totalSeconds = 0;
    let isRunning = false;

    const pad = n => n.toString().padStart(2, '0');
    
    const updateDisplay = () => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      display.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    const readInputs = () => {
      const h = parseInt(inH.value) || 0;
      const m = parseInt(inM.value) || 0;
      const s = parseInt(inS.value) || 0;
      return (h * 3600) + (m * 60) + s;
    };

    const stop = () => {
      clearInterval(interval);
      isRunning = false;
      btnStart.textContent = 'Start';
      btnStart.style.background = '#f59e0b';
      display.classList.remove('running');
    };

    const tick = () => {
      if (totalSeconds <= 0) {
        stop();
        display.classList.remove('running');
        display.classList.add('done');
        const beeper = setInterval(playBeep, 600);
        setTimeout(() => clearInterval(beeper), 3000);
        return;
      }
      totalSeconds--;
      updateDisplay();
    };

    const start = () => {
      if (isRunning) {
        stop();
        return;
      }
      
      if (totalSeconds === 0) {
        totalSeconds = readInputs();
      }
      
      if (totalSeconds > 0) {
        display.classList.remove('done');
        display.classList.add('running');
        updateDisplay();
        isRunning = true;
        btnStart.textContent = 'Pause';
        btnStart.style.background = '#d97706';
        interval = setInterval(tick, 1000);
      }
    };

    const reset = () => {
      stop();
      display.classList.remove('done');
      totalSeconds = readInputs();
      updateDisplay();
    };

    btnStart.addEventListener('click', start);
    btnReset.addEventListener('click', () => {
      inH.value = '0'; inM.value = '0'; inS.value = '0';
      reset();
    });

    [inH, inM, inS].forEach(inEl => {
      inEl.addEventListener('input', () => {
        if (!isRunning) reset();
      });
    });

    updateDisplay();
  };

  createTimer(1, 'Hob 1');
  createTimer(2, 'Hob 2');
  createTimer(3, 'Oven');
  createTimer(4, 'Prep Timer');
});
