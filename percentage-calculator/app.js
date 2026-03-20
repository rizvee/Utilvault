document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.mode-tab');
  const panes = document.querySelectorAll('.pane');

  let activeMode = 0;

  window.pcMode = (m) => {
    activeMode = m;
    tabs.forEach(t => t.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    
    document.getElementById(`pct${m}`).classList.add('active');
    document.getElementById(`pane-${m}`).classList.add('active');
    calculate();
  };

  // Mode 0: X% of Y
  const x0 = document.getElementById('pc0-x');
  const y0 = document.getElementById('pc0-y');
  const res0 = document.getElementById('pc0-result');
  const form0 = document.getElementById('pc0-formula');

  // Mode 1: % Change
  const from1 = document.getElementById('pc1-from');
  const to1 = document.getElementById('pc1-to');
  const res1 = document.getElementById('pc1-result');
  const form1 = document.getElementById('pc1-formula');

  // Mode 2: X is what % of Y
  const x2 = document.getElementById('pc2-x');
  const y2 = document.getElementById('pc2-y');
  const res2 = document.getElementById('pc2-result');
  const form2 = document.getElementById('pc2-formula');

  const fNum = n => parseFloat(n.toFixed(4));

  const calculate = () => {
    if (activeMode === 0) {
      const x = parseFloat(x0.value) || 0;
      const y = parseFloat(y0.value) || 0;
      const r = (x / 100) * y;
      res0.textContent = fNum(r);
      form0.textContent = `${x}% of ${y} = ${fNum(r)}`;
    } 
    else if (activeMode === 1) {
      const f = parseFloat(from1.value) || 0;
      const t = parseFloat(to1.value) || 0;
      if (f === 0) {
        res1.textContent = '∞';
        form1.textContent = `Cannot divide by zero.`;
        return;
      }
      const chg = ((t - f) / Math.abs(f)) * 100;
      const sign = chg >= 0 ? '+' : '';
      const word = chg >= 0 ? 'increase' : 'decrease';
      res1.textContent = `${sign}${fNum(chg)}%`;
      form1.textContent = `${f} → ${t} = ${sign}${fNum(chg)}% ${word}`;
      res1.style.color = chg >= 0 ? '#10b981' : '#ef4444';
    }
    else if (activeMode === 2) {
      const x = parseFloat(x2.value) || 0;
      const y = parseFloat(y2.value) || 0;
      if (y === 0) {
        res2.textContent = '∞';
        form2.textContent = `Cannot divide by zero.`;
        return;
      }
      const r = (x / y) * 100;
      res2.textContent = `${fNum(r)}%`;
      form2.textContent = `${x} is ${fNum(r)}% of ${y}`;
    }
  };

  [x0, y0, from1, to1, x2, y2].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
