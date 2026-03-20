document.addEventListener('DOMContentLoaded', () => {
  const billInput = document.getElementById('ts-bill');
  const peopleInput = document.getElementById('ts-people');
  const tipInput = document.getElementById('ts-tip');
  const presets = document.querySelectorAll('.tip-preset');
  
  const outTipTotal = document.getElementById('ts-tip-total');
  const outTotal = document.getElementById('ts-total');
  const outTipPP = document.getElementById('ts-tip-pp');
  const outTotalPP = document.getElementById('ts-pp');

  const formatC = (num) => '$' + num.toFixed(2);

  const calculate = () => {
    const bill = parseFloat(billInput.value) || 0;
    const people = parseInt(peopleInput.value) || 1;
    let tipPct = parseFloat(tipInput.value) || 0;

    if (bill < 0) return;

    const tipTotal = bill * (tipPct / 100);
    const total = bill + tipTotal;
    
    const tipPP = tipTotal / people;
    const totalPP = total / people;

    outTipTotal.textContent = formatC(tipTotal);
    outTotal.textContent = formatC(total);
    outTipPP.textContent = formatC(tipPP);
    outTotalPP.textContent = formatC(totalPP);
  };

  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      presets.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      tipInput.value = btn.getAttribute('data-tip');
      calculate();
    });
  });

  tipInput.addEventListener('input', () => {
    presets.forEach(p => p.classList.remove('active'));
    calculate();
  });

  [billInput, peopleInput].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
