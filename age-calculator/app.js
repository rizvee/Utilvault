// age-calculator/app.js

document.addEventListener('DOMContentLoaded', () => {
  const dobInput = document.getElementById('dob');
  const calcBtn = document.getElementById('calc-btn');
  
  const resYears = document.getElementById('res-years');
  const resMonths = document.getElementById('res-months');
  const resDays = document.getElementById('res-days');
  const resHours = document.getElementById('res-hours');

  const bdInfo = document.getElementById('bd-info');
  const cdMonths = document.getElementById('cd-months');
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  let countdownInterval;

  // Set Max Date to Today to prevent future birthdays
  const todayNode = new Date();
  const yyyy = todayNode.getFullYear();
  let mm = todayNode.getMonth() + 1;
  let dd = todayNode.getDate();
  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;
  dobInput.setAttribute('max', `${yyyy}-${mm}-${dd}`);

  calcBtn.addEventListener('click', calculateAge);
  dobInput.addEventListener('change', calculateAge); // auto-calc if they pick date from picker

  function calculateAge() {
    if (!dobInput.value) return;

    const dob = new Date(dobInput.value);
    const now = new Date();

    if (dob > now) {
      alert('Date of birth cannot be in the future!');
      return;
    }

    // --- AGES CALCULATION ---
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      // Get previous month's total days
      const tempDate = new Date(now.getFullYear(), now.getMonth(), 0);
      days += tempDate.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const diffInMs = now.getTime() - dob.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    // Update UI Stats
    resYears.textContent = years;
    resMonths.textContent = months;
    resDays.textContent = days;
    resHours.textContent = diffInHours.toLocaleString();

    // --- COUNTDOWN LOGIC ---
    clearInterval(countdownInterval); // clear any existing

    const nextBd = new Date(dob);
    nextBd.setFullYear(now.getFullYear());
    
    // If birthday already passed this year, next one is next year
    if (nextBd.getTime() < now.getTime()) {
      nextBd.setFullYear(now.getFullYear() + 1);
    }

    bdInfo.innerHTML = `Your next birthday is on <strong>${nextBd.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</strong>`;

    updateCountdown(nextBd);
    countdownInterval = setInterval(() => updateCountdown(nextBd), 1000);
  }

  function updateCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      clearInterval(countdownInterval);
      bdInfo.innerHTML = `<span style="color:#ec4899; font-weight:bold;">🎉 Happy Birthday! 🎉</span>`;
      cdMonths.textContent = '0m';
      cdDays.textContent = '0d';
      cdHours.textContent = '0h';
      cdMinutes.textContent = '0m';
      cdSeconds.textContent = '0s';
      return;
    }

    // Calculate months/days/hours/mins/secs accurately...
    // simpler reliable approx for months/days difference
    let m = targetDate.getMonth() - now.getMonth();
    let y = targetDate.getFullYear() - now.getFullYear();
    let d = targetDate.getDate() - now.getDate();
    
    m += y * 12;

    if (d < 0) {
      m--;
      const temp = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      d += temp.getDate();
    }

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((diff % (1000 * 60)) / 1000);

    cdMonths.textContent = m + 'm';
    cdDays.textContent = d + 'd';
    cdHours.textContent = h + 'h';
    cdMinutes.textContent = min + 'm';
    cdSeconds.textContent = sec + 's';
  }
});
