document.addEventListener('DOMContentLoaded', () => {
  const kValue = document.getElementById('k-value');
  const kFrom = document.getElementById('k-from');
  const kTo = document.getElementById('k-to');
  const kResultBox = document.getElementById('k-result');
  const kResultVal = document.getElementById('k-result-val');
  const kResultUnit = document.getElementById('k-result-unit');
  const kNote = document.getElementById('k-note');

  const units = {
    // Volumes (base: ml)
    ml: { type: 'vol', factor: 1, name: 'Milliliters (ml)' },
    l: { type: 'vol', factor: 1000, name: 'Liters (L)' },
    tsp: { type: 'vol', factor: 4.92892, name: 'Teaspoons (tsp)' },
    tbsp: { type: 'vol', factor: 14.7868, name: 'Tablespoons (tbsp)' },
    fl_oz: { type: 'vol', factor: 29.5735, name: 'Fluid Ounces (fl oz)' },
    cup: { type: 'vol', factor: 236.588, name: 'Cups (US)' },
    pt: { type: 'vol', factor: 473.176, name: 'Pints (US)' },
    qt: { type: 'vol', factor: 946.353, name: 'Quarts (US)' },
    gal: { type: 'vol', factor: 3785.41, name: 'Gallons (US)' },
    // Weights (base: g)
    g: { type: 'wt', factor: 1, name: 'Grams (g)' },
    kg: { type: 'wt', factor: 1000, name: 'Kilograms (kg)' },
    oz: { type: 'wt', factor: 28.3495, name: 'Ounces (oz)' },
    lb: { type: 'wt', factor: 453.592, name: 'Pounds (lb)' }
  };

  const populateSelects = () => {
    const fromOptions = Object.keys(units).map(key => `<option value="${key}">${units[key].name}</option>`).join('');
    kFrom.innerHTML = fromOptions;
    kTo.innerHTML = fromOptions;
    kFrom.value = 'cup';
    kTo.value = 'ml';
  };

  const calculate = () => {
    const val = parseFloat(kValue.value);
    if (isNaN(val) || val < 0) {
      kResultBox.style.display = 'none';
      kNote.style.display = 'none';
      return;
    }
    
    const fromUnit = units[kFrom.value];
    const toUnit = units[kTo.value];
    let result = 0;

    if (fromUnit.type === toUnit.type) {
      // Same type
      const baseVal = val * fromUnit.factor;
      result = baseVal / toUnit.factor;
      kNote.style.display = 'none';
    } else {
      // Cross type (assume density of water: 1ml = 1g)
      const baseVolumeMl = fromUnit.type === 'vol' ? (val * fromUnit.factor) : (val * fromUnit.factor); // conceptually identical since factor to ml/g is 1:1
      result = baseVolumeMl / toUnit.factor;
      kNote.style.display = 'block';
    }

    // Format safely
    const formatted = parseFloat(result.toFixed(4));
    kResultVal.textContent = formatted.toString();
    kResultUnit.textContent = toUnit.name;
    kResultBox.style.display = 'flex';
  };

  populateSelects();
  
  [kValue, kFrom, kTo].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
