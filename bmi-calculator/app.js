document.addEventListener('DOMContentLoaded', () => {
  const btnMetric = document.getElementById('bmi-metric');
  const btnImperial = document.getElementById('bmi-imperial');
  const divMetric = document.getElementById('bmi-metric-fields');
  const divImperial = document.getElementById('bmi-imperial-fields');
  
  const cmIn = document.getElementById('bmi-height-cm');
  const kgIn = document.getElementById('bmi-weight-kg');
  
  const ftIn = document.getElementById('bmi-ft');
  const inchIn = document.getElementById('bmi-in');
  const lbIn = document.getElementById('bmi-lb');
  
  const resultBox = document.getElementById('bmi-result');
  const valOut = document.getElementById('bmi-val');
  const catOut = document.getElementById('bmi-cat');
  const ptrOut = document.getElementById('bmi-ptr');

  let currentMode = 'metric';

  window.setBmiUnit = (mode) => {
    currentMode = mode;
    if (mode === 'metric') {
      btnMetric.classList.add('active');
      btnImperial.classList.remove('active');
      divMetric.style.display = 'block';
      divImperial.style.display = 'none';
    } else {
      btnImperial.classList.add('active');
      btnMetric.classList.remove('active');
      divImperial.style.display = 'block';
      divMetric.style.display = 'none';
    }
    calculate();
  };

  const getCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { label: 'Normal weight', color: '#10b981' };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
    return { label: 'Obese', color: '#ef4444' };
  };

  const calculate = () => {
    let bmi = 0;
    
    if (currentMode === 'metric') {
      const cm = parseFloat(cmIn.value);
      const kg = parseFloat(kgIn.value);
      if (!cm || !kg || cm <= 0 || kg <= 0) return resultBox.style.display = 'none';
      const m = cm / 100;
      bmi = kg / (m * m);
    } else {
      const ft = parseFloat(ftIn.value) || 0;
      const inch = parseFloat(inchIn.value) || 0;
      const lb = parseFloat(lbIn.value) || 0;
      const totalInches = (ft * 12) + inch;
      if (totalInches <= 0 || lb <= 0) return resultBox.style.display = 'none';
      bmi = 703 * lb / (totalInches * totalInches);
    }

    if (isNaN(bmi) || !isFinite(bmi)) return resultBox.style.display = 'none';

    bmi = parseFloat(bmi.toFixed(1));
    const cat = getCategory(bmi);
    
    valOut.textContent = bmi;
    catOut.textContent = cat.label;
    catOut.style.color = cat.color;

    // Pointer positioning (approximate based on gradient)
    // Range maps: <18.5 (0-25%), 18.5-24.9 (25-50%), 25-29.9 (50-75%), >30 (75-100%)
    let pct = 0;
    if (bmi < 18.5) {
      pct = (bmi / 18.5) * 25;
    } else if (bmi < 25) {
      pct = 25 + ((bmi - 18.5) / 6.5) * 25;
    } else if (bmi < 30) {
      pct = 50 + ((bmi - 25) / 5) * 25;
    } else {
      pct = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
    }
    
    ptrOut.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    resultBox.style.display = 'block';
  };

  [cmIn, kgIn, ftIn, inchIn, lbIn].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
