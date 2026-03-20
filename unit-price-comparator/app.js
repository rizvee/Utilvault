document.addEventListener('DOMContentLoaded', () => {
  const pA = document.getElementById('up-price-a');
  const qA = document.getElementById('up-qty-a');
  const uA = document.getElementById('up-unit-a');
  const outA = document.getElementById('pp-a');
  const cardA = document.getElementById('card-a');

  const pB = document.getElementById('up-price-b');
  const qB = document.getElementById('up-qty-b');
  const uB = document.getElementById('up-unit-b');
  const outB = document.getElementById('pp-b');
  const cardB = document.getElementById('card-b');

  const savingsBadge = document.getElementById('up-savings');

  const conversionToGrams = { 'g': 1, 'kg': 1000, 'oz': 28.3495, 'lb': 453.592 };
  const conversionToMl = { 'ml': 1, 'L': 1000 };

  const getCommonUnitAndQuantity = (qty, unit) => {
    if (conversionToGrams[unit]) {
      return { val: qty * conversionToGrams[unit], common: 'g' };
    }
    if (conversionToMl[unit]) {
      return { val: qty * conversionToMl[unit], common: 'ml' };
    }
    return { val: qty, common: 'count' };
  };

  const calculate = () => {
    const paVal = parseFloat(pA.value); const qaVal = parseFloat(qA.value);
    const pbVal = parseFloat(pB.value); const qbVal = parseFloat(qB.value);

    // reset
    cardA.classList.remove('winner');
    cardB.classList.remove('winner');
    savingsBadge.style.display = 'none';
    outA.textContent = '$0.00 / unit';
    outB.textContent = '$0.00 / unit';

    if (isNaN(paVal) || isNaN(qaVal) || paVal<=0 || qaVal<=0) return;
    if (isNaN(pbVal) || isNaN(qbVal) || pbVal<=0 || qbVal<=0) return;

    const baseA = getCommonUnitAndQuantity(qaVal, uA.value);
    const baseB = getCommonUnitAndQuantity(qbVal, uB.value);

    // If comparing different types like mass vs volume, we can still show their individual unit price, but warn comparison isn't perfect
    const unitPriceA = paVal / qaVal;
    const unitPriceB = pbVal / qbVal;
    
    outA.innerHTML = `$${unitPriceA.toFixed(4)} <span style="font-size:0.5em;color:var(--text-secondary);">/ ${uA.value}</span>`;
    outB.innerHTML = `$${unitPriceB.toFixed(4)} <span style="font-size:0.5em;color:var(--text-secondary);">/ ${uB.value}</span>`;

    if (baseA.common === baseB.common) {
      const commonPriceA = paVal / baseA.val;
      const commonPriceB = pbVal / baseB.val;

      if (commonPriceA < commonPriceB) {
        cardA.classList.add('winner');
        outA.innerHTML += `<span class="winner-badge-inline">Best Value</span>`;
        
        const diffPercent = ((commonPriceB - commonPriceA) / commonPriceB) * 100;
        savingsBadge.textContent = `A is ${diffPercent.toFixed(1)}% cheaper per ${baseA.common} than B`;
        savingsBadge.style.display = 'block';
      } else if (commonPriceB < commonPriceA) {
        cardB.classList.add('winner');
        outB.innerHTML += `<span class="winner-badge-inline">Best Value</span>`;
        
        const diffPercent = ((commonPriceA - commonPriceB) / commonPriceA) * 100;
        savingsBadge.textContent = `B is ${diffPercent.toFixed(1)}% cheaper per ${baseB.common} than A`;
        savingsBadge.style.display = 'block';
      } else {
        savingsBadge.textContent = `Both items cost exactly the same per ${baseA.common}.`;
        savingsBadge.style.display = 'block';
      }
    } else {
      savingsBadge.textContent = `⚠️ Comparing different types of units (${baseA.common} vs ${baseB.common}). Direct comparison disabled.`;
      savingsBadge.style.display = 'block';
    }
  };

  [pA, qA, uA, pB, qB, uB].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
