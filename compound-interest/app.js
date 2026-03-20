document.addEventListener('DOMContentLoaded', () => {
  const pIn = document.getElementById('ci-principal');
  const rIn = document.getElementById('ci-rate');
  const tIn = document.getElementById('ci-years');
  const nIn = document.getElementById('ci-freq');
  const pmtIn = document.getElementById('ci-monthly');

  const pOut = document.getElementById('ci-principal-out');
  const iOut = document.getElementById('ci-interest-out');
  const fOut = document.getElementById('ci-final-out');
  const bar = document.getElementById('ci-bar');

  const formatC = (num) => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculate = () => {
    const p = parseFloat(pIn.value) || 0;
    const rate = parseFloat(rIn.value) || 0;
    const t = parseFloat(tIn.value) || 0;
    const n = parseFloat(nIn.value) || 12;
    const pmt = parseFloat(pmtIn.value) || 0;

    if (p < 0 || t < 0 || rate < 0) return;

    const rNum = rate / 100;
    
    // Future Value of Principal: P(1 + r/n)^(nt)
    const fvPrincipal = p * Math.pow(1 + rNum / n, n * t);
    
    // Future Value of Series (Contributions): PMT * (((1 + r/n)^(nt) - 1) / (r/n))
    // Note: PMT is monthly. If freq 'n' is not monthly, approx by converting PMT to frequency equivalent, or simple assumption:
    // Let's assume contributions match compounding frequency for simple math, or we must adapt it.
    // The prompt says "Monthly Contribution". We'll compute the FV of an annuity.
    let fvContributions = 0;
    let totalContributed = pmt * 12 * t;

    if (pmt > 0 && rNum > 0) {
      // Standard approach: assume contributions are made at the end of each compounding period.
      // Easiest is to convert monthly to the compounding period `n`.
      const pmtFreq = (pmt * 12) / n; 
      fvContributions = pmtFreq * ((Math.pow(1 + rNum / n, n * t) - 1) / (rNum / n));
    } else if (pmt > 0 && rNum === 0) {
      fvContributions = totalContributed;
    }

    const finalValue = fvPrincipal + fvContributions;
    const totalPrincipalAndContributions = p + totalContributed;
    const interestEarned = finalValue - totalPrincipalAndContributions;

    pOut.textContent = formatC(totalPrincipalAndContributions);
    iOut.textContent = formatC(Math.max(0, interestEarned));
    fOut.textContent = formatC(finalValue);

    const pctPrincipal = finalValue > 0 ? (totalPrincipalAndContributions / finalValue) * 100 : 100;
    bar.style.width = `${Math.min(100, Math.max(0, pctPrincipal))}%`;
  };

  [pIn, rIn, tIn, nIn, pmtIn].forEach(el => el.addEventListener('input', calculate));
  calculate();
});
