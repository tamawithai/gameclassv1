// === LOGIKA RODA KEBERUNTUNGAN ===

function setupFortuneWheelListeners() {
    document.getElementById('spin-btn').addEventListener('click', () => {
        if (peserta.length === 0) return;
        spinAngleStart = Math.random() * 10 + 10;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000;
        document.getElementById('spin-btn').disabled = true;
        rotateWheel();
    });
}

function getInitials(name) {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function drawFortuneWheel() {
    const wheelCanvas = document.getElementById('wheelCanvas');
    if (!wheelCanvas) return;
    const ctx = wheelCanvas.getContext('2d');
    const arc = peserta.length > 0 ? Math.PI / (peserta.length / 2) : 0;
    ctx.clearRect(0, 0, 500, 500);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    if (peserta.length === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";
        ctx.font = '20px Inter, sans-serif';
        ctx.fillText("Unggah data peserta untuk memulai", 250, 250);
        document.getElementById('spin-btn').disabled = true;
        return;
    }

    document.getElementById('spin-btn').disabled = false;
    for(let i = 0; i < peserta.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.beginPath();
        ctx.arc(250, 250, 250, angle, angle + arc, false);
        ctx.arc(250, 250, 0, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(250 + Math.cos(angle + arc / 2) * 160, 250 + Math.sin(angle + arc / 2) * 160);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = getInitials(peserta[i].nama);
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 0, 10);
        ctx.restore();
    }
}

function rotateWheel() {
    spinTime += 30;
    if(spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawFortuneWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = 360 / peserta.length;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const winner = peserta[index];
    showWheelWinner(winner);
    document.getElementById('spin-btn').disabled = false;
}

function easeOut(t, b, c, d) {
    const ts = (t/=d)*t;
    const tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
}

function showWheelWinner(winner){
    playSound(soundSettings.badge);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    document.getElementById('wheel-winner-avatar').src = winner.avatar;
    document.getElementById('wheel-winner-name').textContent = winner.nama;
    document.getElementById('wheel-winner-modal').classList.remove('hidden');
}