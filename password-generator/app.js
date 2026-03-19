// password-generator/app.js

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

document.addEventListener('DOMContentLoaded', () => {
  const passwordDisplay = document.getElementById('password-display');
  const copyBtn = document.getElementById('copy-btn');
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');
  const generateBtn = document.getElementById('generate-btn');
  const toast = document.getElementById('toast');
  
  const chkUpper = document.getElementById('inc-uppercase');
  const chkLower = document.getElementById('inc-lowercase');
  const chkNumbers = document.getElementById('inc-numbers');
  const chkSymbols = document.getElementById('inc-symbols');
  
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  // Handle Slider changes
  lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = e.target.value;
    updateStrengthEstimate();
  });

  // Handle Checkbox changes
  [chkUpper, chkLower, chkNumbers, chkSymbols].forEach(chk => {
    chk.addEventListener('change', updateStrengthEstimate);
  });

  function updateStrengthEstimate() {
    let poolSize = 0;
    if (chkUpper.checked) poolSize += 26;
    if (chkLower.checked) poolSize += 26;
    if (chkNumbers.checked) poolSize += 10;
    if (chkSymbols.checked) poolSize += 30;

    const length = parseInt(lengthSlider.value);
    
    // Entropy roughly = L * log2(R)
    let entropy = 0;
    if (poolSize > 0) {
      entropy = length * Math.log2(poolSize);
    }

    let color = '';
    let text = '';
    let width = '0%';

    if (poolSize === 0) {
      width = '0%';
      text = 'Invalid';
      color = '#ef4444'; // red
    } else if (entropy < 40) {
      width = '25%';
      text = 'Weak';
      color = '#ef4444'; // red
    } else if (entropy < 60) {
      width = '50%';
      text = 'Fair';
      color = '#f59e0b'; // orange
    } else if (entropy < 80) {
      width = '75%';
      text = 'Good';
      color = '#10b981'; // green
    } else {
      width = '100%';
      text = 'Strong';
      color = '#8b5cf6'; // purple
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
  }

  function generatePassword() {
    let poolArea = '';
    if (chkUpper.checked) poolArea += CHAR_SETS.uppercase;
    if (chkLower.checked) poolArea += CHAR_SETS.lowercase;
    if (chkNumbers.checked) poolArea += CHAR_SETS.numbers;
    if (chkSymbols.checked) poolArea += CHAR_SETS.symbols;

    if (poolArea === '') {
      passwordDisplay.textContent = 'Select at least one option';
      passwordDisplay.style.color = '#ef4444';
      return;
    }

    passwordDisplay.style.color = 'var(--text-primary)';
    
    const length = parseInt(lengthSlider.value);
    let password = '';
    
    // Using Crypto API for secure random values
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      // Map the random value strictly to the pool boundary
      const index = array[i] % poolArea.length;
      password += poolArea[index];
    }

    passwordDisplay.textContent = password;
  }

  // Copy functionality
  copyBtn.addEventListener('click', async () => {
    const pw = passwordDisplay.textContent;
    if (pw === 'Click Generate' || pw === 'Select at least one option') return;

    try {
      await navigator.clipboard.writeText(pw);
      showToast();
    } catch (err) {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = pw;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast();
    }
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // Bind Generate Button
  generateBtn.addEventListener('click', generatePassword);

  // Initial update
  updateStrengthEstimate();
});
