document.addEventListener('DOMContentLoaded', () => {
  const optionsTextarea = document.getElementById('rc-options');
  const spinBtn = document.getElementById('rc-spin');
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const winnerBadge = document.getElementById('rc-winner');

  let options = [];
  let colors = [];
  let currentAngle = 0;
  let spinAngleStart = 0;
  let spinTime = 0;
  let spinTimeTotal = 0;
  let spinning = false;

  const palette = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444', '#f97316'];

  const parseOptions = () => {
    const lines = optionsTextarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.length > 0 ? lines : ['Option 1', 'Option 2', 'Option 3'];
  };

  const drawWheel = () => {
    options = parseOptions();
    colors = options.map((_, i) => palette[i % palette.length]);
    
    const arc = Math.PI * 2 / options.length;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < options.length; i++) {
      const angle = currentAngle + i * arc;
      
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      ctx.save();
      ctx.fillStyle = 'white';
      ctx.translate(
        centerX + Math.cos(angle + arc / 2) * (radius * 0.6),
        centerY + Math.sin(angle + arc / 2) * (radius * 0.6)
      );
      ctx.rotate(angle + arc / 2);
      const text = options[i];
      
      // truncate text
      const maxTextLen = 12;
      const displayTxt = text.length > maxTextLen ? text.substring(0, maxTextLen) + '...' : text;
      
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayTxt, 0, 0);
      ctx.restore();
    }
    
    // Draw center pointer
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, centerY - 10);
    ctx.lineTo(canvas.width, centerY - 20);
    ctx.lineTo(canvas.width, centerY + 20);
    ctx.lineTo(canvas.width - 20, centerY + 10);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
  };

  const easeOut = (t, b, c, d) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const rotateWheel = () => {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
      stopRotateWheel();
      return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    currentAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    requestAnimationFrame(rotateWheel);
  };

  const stopRotateWheel = () => {
    spinning = false;
    const arc = Math.PI * 2 / options.length;
    let degrees = currentAngle * 180 / Math.PI + 90; // +90 because pointer is at right
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    
    // index bounded
    const winIndex = (index + options.length) % options.length;
    
    winnerBadge.textContent = `🎉 Winner: ${options[winIndex]}!`;
    winnerBadge.style.display = 'block';
  };

  const spin = () => {
    if (spinning) return;
    winnerBadge.style.display = 'none';
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;
    spinning = true;
    rotateWheel();
  };

  optionsTextarea.addEventListener('input', drawWheel);
  spinBtn.addEventListener('click', spin);

  drawWheel();
});
