document.addEventListener('DOMContentLoaded', () => {
  const fDist = document.getElementById('f-dist');
  const fDistUnit = document.getElementById('f-dist-unit');
  const fEff = document.getElementById('f-efficiency');
  const fEffUnit = document.getElementById('f-eff-unit');
  const fPrice = document.getElementById('f-price');
  const fCurrency = document.getElementById('f-currency');
  const fResults = document.getElementById('f-results');
  
  const rFuel = document.getElementById('f-fuel');
  const rCost = document.getElementById('f-cost');
  const rPer100 = document.getElementById('f-per100');
  const rDistOut = document.getElementById('f-dist-out');

  const calculate = () => {
    const dist = parseFloat(fDist.value);
    const eff = parseFloat(fEff.value);
    const price = parseFloat(fPrice.value);
    const curr = fCurrency.value || '$';

    if (isNaN(dist) || isNaN(eff) || isNaN(price) || dist <= 0 || eff <= 0 || price <= 0) {
      fResults.style.display = 'none';
      return;
    }

    const distUnit = fDistUnit.value;
    const effUnit = fEffUnit.value;

    let distKm = dist;
    let distMi = dist;
    if (distUnit === 'km') {
      distMi = dist * 0.621371;
    } else {
      distKm = dist * 1.60934;
    }

    let fuelNeeded = 0;
    let volUnit = 'L';
    let baseDist = distKm;
    let baseDistName = 'km';

    if (effUnit === 'mpg') {
      fuelNeeded = distMi / eff;
      volUnit = 'gal';
      baseDist = distMi;
      baseDistName = 'mi';
    } else if (effUnit === 'kml') {
      fuelNeeded = distKm / eff;
    } else if (effUnit === 'l100') {
      fuelNeeded = distKm * (eff / 100);
    }

    const totalCost = fuelNeeded * price;
    const costPer100 = (totalCost / baseDist) * 100;

    rFuel.textContent = `${fuelNeeded.toFixed(2)} ${volUnit}`;
    rCost.textContent = `${curr}${totalCost.toFixed(2)}`;
    rPer100.textContent = `${curr}${costPer100.toFixed(2)} / 100${baseDistName}`;
    rDistOut.textContent = `${dist.toFixed(1)} ${distUnit}`;
    
    fResults.style.display = 'grid';
  };

  [fDist, fDistUnit, fEff, fEffUnit, fPrice, fCurrency].forEach(el => {
    el.addEventListener('input', calculate);
  });
  
  calculate();
});
