// currency-converter/app.js
// Uses the free Open Exchange Rate API: https://open.er-api.com (no API key needed)

const API_BASE = 'https://open.er-api.com/v6/latest/USD';

const AUTO_REFRESH_SECONDS = 60; // Auto-refresh rate data every 60 seconds

// Display names and flag emojis for currencies
const CURRENCY_META = {
  AED: { name: 'UAE Dirham', flag: '🇦🇪' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
  BDT: { name: 'Bangladeshi Taka', flag: '🇧🇩' },
  BGN: { name: 'Bulgarian Lev', flag: '🇧🇬' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
  CZK: { name: 'Czech Koruna', flag: '🇨🇿' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  HKD: { name: 'HK Dollar', flag: '🇭🇰' },
  HUF: { name: 'Hungarian Forint', flag: '🇭🇺' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  ILS: { name: 'Israeli Shekel', flag: '🇮🇱' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  ISK: { name: 'Icelandic Króna', flag: '🇮🇸' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  NZD: { name: 'NZ Dollar', flag: '🇳🇿' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  PKR: { name: 'Pakistani Rupee', flag: '🇵🇰' },
  PLN: { name: 'Polish Złoty', flag: '🇵🇱' },
  RON: { name: 'Romanian Leu', flag: '🇷🇴' },
  SAR: { name: 'Saudi Riyal', flag: '🇸🇦' },
  SEK: { name: 'Swedish Krona', flag: '🇸🇪' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷' },
  USD: { name: 'US Dollar', flag: '🇺🇸' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
};

const POPULAR_PAIRS = ['EUR', 'GBP', 'JPY', 'BDT', 'INR', 'AUD', 'CAD', 'CHF'];

let rates = {}; // cached: base USD
let ratesDate = '';
let refreshCountdown = AUTO_REFRESH_SECONDS;
let countdownInterval = null;
let fetchInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const fromAmount = document.getElementById('from-amount');
  const toAmount = document.getElementById('to-amount');
  const swapBtn = document.getElementById('swap-btn');
  const rateLabel = document.getElementById('rate-label');
  const copyRateBtn = document.getElementById('copy-rate-btn');
  const rateUpdateBadge = document.getElementById('rate-update-badge');
  const popularGrid = document.getElementById('popular-grid');
  const toast = document.getElementById('toast');

  // --- Fetch live rates (base: USD) from open.er-api.com ---
  async function fetchRates() {
    try {
      rateUpdateBadge.className = 'rate-update-badge';
      rateUpdateBadge.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Fetching live rates...`;

      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      // data.rates includes all currencies with USD as base
      rates = { ...data.rates, USD: 1 };
      ratesDate = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : data.time_last_update_unix
        ? new Date(data.time_last_update_unix * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : 'Latest';

      rateUpdateBadge.className = 'rate-update-badge success';
      rateUpdateBadge.innerHTML = `<i class="fa-solid fa-check-circle"></i> Updated: ${ratesDate}`;

      // Reset countdown
      refreshCountdown = AUTO_REFRESH_SECONDS;

      return true;
    } catch (e) {
      rateUpdateBadge.className = 'rate-update-badge error';
      rateUpdateBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Could not fetch live rates`;
      return false;
    }
  }

  // --- Start countdown tick ---
  function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      refreshCountdown--;
      if (refreshCountdown > 0) {
        rateUpdateBadge.innerHTML = `<i class="fa-solid fa-check-circle"></i> Updated: ${ratesDate} &nbsp; <span style="opacity:0.7; font-size:0.8em;">↻ in ${refreshCountdown}s</span>`;
      } else {
        // trigger a refresh
        fetchRates().then(ok => {
          if (ok) {
            calculate();
            buildPopularGrid();
            startCountdown();
          }
        });
      }
    }, 1000);
  }

  // --- Populate select dropdowns ---
  function populateSelects() {
    const currencies = Object.keys(CURRENCY_META).sort();

    [fromCurrency, toCurrency].forEach(sel => {
      sel.innerHTML = '';
      currencies.forEach(code => {
        const meta = CURRENCY_META[code];
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = `${meta.flag} ${code}`;
        opt.title = meta.name;
        sel.appendChild(opt);
      });
    });

    // Defaults: USD → BDT
    fromCurrency.value = 'USD';
    toCurrency.value = 'BDT';
  }

  // --- Convert via USD as base ---
  function convertViaUSD(amount, from, to) {
    if (!rates[from] || !rates[to]) return null;
    const inUSD = amount / rates[from];
    return inUSD * rates[to];
  }

  // --- Main calculate function ---
  function calculate() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(fromAmount.value);

    if (isNaN(amount) || amount < 0) {
      toAmount.value = '';
      rateLabel.innerHTML = 'Enter a valid amount.';
      return;
    }

    const result = convertViaUSD(amount, from, to);

    if (result === null) {
      toAmount.value = '—';
      rateLabel.innerHTML = 'Rate not available.';
      return;
    }

    toAmount.value = parseFloat(result.toFixed(6)).toString();

    // Show 1-unit exchange rate info
    const oneUnit = convertViaUSD(1, from, to);
    const fromMeta = CURRENCY_META[from] || {};
    const toMeta = CURRENCY_META[to] || {};
    rateLabel.innerHTML = `<strong>1 ${fromMeta.flag || ''} ${from}</strong> = <strong style="color: #f59e0b;">${oneUnit?.toFixed(4)} ${toMeta.flag || ''} ${to}</strong><br><small style="color: var(--text-secondary);">(${fromMeta.name || from} → ${toMeta.name || to})</small>`;
  }

  // --- Build popular pairs grid ---
  function buildPopularGrid() {
    popularGrid.innerHTML = '';
    POPULAR_PAIRS.forEach(code => {
      const rate = rates[code];
      if (!rate) return;

      const meta = CURRENCY_META[code];
      const card = document.createElement('div');
      card.className = 'popular-card';
      card.innerHTML = `
        <span class="pair-label">${meta?.flag || ''} USD → ${code}</span>
        <span class="pair-rate">${parseFloat(rate.toFixed(4)).toString()}</span>
        <span class="pair-base">${meta?.name || code}</span>
      `;
      card.addEventListener('click', () => {
        fromCurrency.value = 'USD';
        toCurrency.value = code;
        fromAmount.value = '1';
        calculate();
      });
      popularGrid.appendChild(card);
    });
  }

  // --- Toast helper ---
  function showToast(msg = 'Copied!') {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // --- Event Listeners ---
  fromAmount.addEventListener('input', calculate);
  fromCurrency.addEventListener('change', calculate);
  toCurrency.addEventListener('change', calculate);

  swapBtn.addEventListener('click', () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    calculate();
  });

  copyRateBtn.addEventListener('click', async () => {
    const val = toAmount.value;
    if (!val || val === '—') return;
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(`Copied ${val}!`);
  });

  // --- Initialize ---
  populateSelects();

  // Show skeleton in popular grid while loading
  for (let i = 0; i < 8; i++) {
    const div = document.createElement('div');
    div.className = 'popular-card';
    div.innerHTML = `<div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div><div class="skeleton" style="width:80%;height:24px;margin-bottom:6px;"></div><div class="skeleton" style="width:50%;height:12px;"></div>`;
    popularGrid.appendChild(div);
  }

  const ok = await fetchRates();

  if (ok) {
    calculate();
    buildPopularGrid();
    startCountdown(); // begin live countdown auto-refresh
  }
});
