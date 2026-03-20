document.addEventListener('DOMContentLoaded', () => {
  const originalInput = document.getElementById('dc-original');
  const pctInput = document.getElementById('dc-pct');
  const taxInput = document.getElementById('dc-tax');
  
  const outSave = document.getElementById('dc-save');
  const outFinal = document.getElementById('dc-final');
  const outAmount = document.getElementById('dc-amount');
  const outRatio = document.getElementById('dc-ratio');
  const outAfterTax = document.getElementById('dc-aftertax');

  const formatC = (num) => '$' + num.toFixed(2);

  const calculate = () => {
    const orig = parseFloat(originalInput.value) || 0;
    const pct = parseFloat(pctInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;

    if (orig < 0 || pct < 0) return;

    const saved = orig * (pct / 100);
    const finalPrice = orig - saved;
    const afterTax = finalPrice + (finalPrice * (tax / 100));

    outSave.textContent = formatC(saved);
    outFinal.textContent = formatC(finalPrice);
    outAmount.textContent = formatC(saved);
    outRatio.textContent = pct + '%';
    outAfterTax.textContent = formatC(afterTax);
  };

  [originalInput, pctInput, taxInput].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
