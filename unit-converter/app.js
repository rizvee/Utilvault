// unit-converter/app.js

const units = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    micrometer: 1e-6,
    nanometer: 1e-9,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
    nautical_mile: 1852
  },
  weight: {
    kilogram: 1,
    gram: 0.001,
    milligram: 1e-6,
    metric_ton: 1000,
    long_ton: 1016.0469088,
    short_ton: 907.18474,
    pound: 0.45359237,
    ounce: 0.02834952,
    carrat: 0.0002,
    atomic_mass_unit: 1.660539e-27
  },
  area: {
    square_meter: 1,
    square_kilometer: 1e6,
    square_centimeter: 0.0001,
    square_millimeter: 1e-6,
    hectare: 10000,
    acre: 4046.8564224,
    square_mile: 2589988.110336,
    square_yard: 0.83612736,
    square_foot: 0.09290304,
    square_inch: 0.00064516
  },
  volume: {
    cubic_meter: 1,
    cubic_centimeter: 1e-6,
    liter: 0.001,
    milliliter: 1e-6,
    gallon_us: 0.003785411784,
    quart_us: 0.000946352946,
    pint_us: 0.000473176473,
    cup_us: 0.0002365882365,
    fluid_ounce_us: 0.0000295735295625,
    tablespoon_us: 0.00001478676478125,
    teaspoon_us: 0.00000492892159375,
    gallon_imperial: 0.00454609,
    cubic_foot: 0.028316846592,
    cubic_inch: 0.000016387064
  },
  time: {
    second: 1,
    millisecond: 0.001,
    microsecond: 1e-6,
    nanosecond: 1e-9,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2628000, // rough approx
    year: 31536000, // rough approx
    decade: 315360000,
    century: 3153600000
  },
  data: {
    byte: 1,
    bit: 0.125,
    kilobit: 125,
    kilobyte: 1000, // using decimal definition
    megabit: 125000,
    megabyte: 1e6,
    gigabit: 1.25e8,
    gigabyte: 1e9,
    terabit: 1.25e11,
    terabyte: 1e12,
    petabyte: 1e15,
    kibibyte: 1024,
    mebibyte: 1048576,
    gibibyte: 1073741824,
    tebibyte: 1099511627776
  },
  speed: {
    meters_per_second: 1,
    kilometers_per_hour: 0.2777777778,
    miles_per_hour: 0.44704,
    feet_per_second: 0.3048,
    knot: 0.5144444444,
    mach: 343
  }
};

// Temperature requires custom logic due to non-zero baseline
function convertTemperature(value, from, to) {
  let inCelsius;
  // Convert to Celsius first
  switch(from) {
    case 'celsius': inCelsius = value; break;
    case 'fahrenheit': inCelsius = (value - 32) * 5/9; break;
    case 'kelvin': inCelsius = value - 273.15; break;
    case 'rankine': inCelsius = (value - 491.67) * 5/9; break;
  }
  
  // Convert from Celsius to Target
  switch(to) {
    case 'celsius': return inCelsius;
    case 'fahrenheit': return (inCelsius * 9/5) + 32;
    case 'kelvin': return inCelsius + 273.15;
    case 'rankine': return (inCelsius + 273.15) * 9/5;
  }
}

// Map display names
function formatUnitName(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

document.addEventListener('DOMContentLoaded', () => {
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const fromValue = document.getElementById('from-value');
  const toValue = document.getElementById('to-value');
  const fromUnit = document.getElementById('from-unit');
  const toUnit = document.getElementById('to-unit');
  const swapBtn = document.getElementById('swap-btn');
  const formulaDisplay = document.getElementById('formula-display');
  
  let currentCategory = 'length';

  // Initialize
  populateSelectors('length');
  
  // Tab Switching
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      populateSelectors(currentCategory);
    });
  });

  // Populate Selectors
  function populateSelectors(category) {
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    const unitList = category === 'temperature' 
      ? ['celsius', 'fahrenheit', 'kelvin', 'rankine'] 
      : Object.keys(units[category]);

    unitList.forEach((unit, index) => {
      const name = formatUnitName(unit);
      
      const optionFrom = document.createElement('option');
      optionFrom.value = unit;
      optionFrom.textContent = name;
      fromUnit.appendChild(optionFrom);

      const optionTo = document.createElement('option');
      optionTo.value = unit;
      optionTo.textContent = name;
      toUnit.appendChild(optionTo);
    });

    // Set defaults (first and second item)
    if(unitList.length > 1) {
      toUnit.selectedIndex = 1;
    }

    calculate();
  }

  // Calculate Logic
  function calculate() {
    const val = parseFloat(fromValue.value);
    if (isNaN(val)) {
      toValue.value = '';
      formulaDisplay.textContent = 'Enter a valid number.';
      return;
    }

    const from = fromUnit.value;
    const to = toUnit.value;
    let result;

    if (currentCategory === 'temperature') {
      result = convertTemperature(val, from, to);
    } else {
      const baseValue = val * units[currentCategory][from];
      result = baseValue / units[currentCategory][to];
    }

    // Format output (handle floating point errors)
    // Up to 6 decimal places, removing trailing zeros
    toValue.value = parseFloat(result.toPrecision(12)).toString();

    // Display Formula Info
    formulaDisplay.textContent = `${val} ${formatUnitName(from)} = ${toValue.value} ${formatUnitName(to)}`;
  }

  // Listeners
  fromValue.addEventListener('input', calculate);
  fromUnit.addEventListener('change', calculate);
  toUnit.addEventListener('change', calculate);

  swapBtn.addEventListener('click', () => {
    // Swap units
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;
    
    // Swap values conceptually but let calculate overwrite 'to' based on current 'from'
    // Actually standard swap logic usually just swaps the units and recomputes the new 'to'
    calculate();
  });
});
