// === LOGIKA UNTUK FITUR QUESTION & SPIN ===

// Variabel untuk menyimpan data khusus mode ini
let qnsData = {
    mode: null, // 'individual' atau 'group'
    teams: [],  // Menyimpan data tim untuk mode grup
    scores: {}, // Menyimpan skor, cth: { 'p1': 50, 't0': 120 }
    selectedId: null,
};

// Variabel untuk Roda Poin
const QNS_WHEEL_SEGMENTS = Array.from({length: 20}, (_, i) => (i + 1) * 5); // [5, 10, ..., 100]
let qnsSpinTimeout = null;
let qnsStartAngle = 0;
let qnsSpinTime = 0;
let qnsSpinTimeTotal = 0;

function setupQnSListeners() {
    // Tombol di layar pemilihan mode awal
    document.getElementById('qns-start-individual-btn').addEventListener('click', () => startQnSGame('individual'));
    document.getElementById('qns-start-group-btn').addEventListener('click', () => startQnSGame('group'));

    // Tombol kembali
    document.getElementById('qns-back-to-selection-btn-1').addEventListener('click', resetQnSGame);
    document.getElementById('qns-back-to-selection-btn-2').addEventListener('click', resetQnSGame);

    // Form Pengaturan Grup
    document.getElementById('qns-team-count').addEventListener('change', renderQnSTeamSetupFields);
    document.getElementById('qns-group-setup-form').addEventListener('submit', handleQnSGroupSetup);

    // Tombol di dalam modal roda
    document.getElementById('qns-spin-btn').addEventListener('click', spinQnsWheel);
    document.getElementById('qns-close-wheel-modal-btn').addEventListener('click', () => {
        document.getElementById('qns-wheel-modal').classList.add('hidden');
    });
    document.getElementById('qns-cancel-spin-btn').addEventListener('click', () => {
        document.getElementById('qns-wheel-modal').classList.add('hidden');
    });
}

function resetQnSGame() {
    // Sembunyikan semua layar permainan
    document.getElementById('qns-individual-game-screen').classList.add('hidden');
    document.getElementById('qns-group-game-screen').classList.add('hidden');
    document.getElementById('qns-group-setup-screen').style.display = 'block'; // Pastikan layar setup terlihat lagi
    document.getElementById('qns-group-play-screen').classList.add('hidden');

    // Tampilkan layar pemilihan mode
    document.getElementById('qns-selection-screen').classList.remove('hidden');

    // Reset data permainan
    qnsData = { mode: null, teams: [], scores: {}, selectedId: null };
}

function startQnSGame(mode) {
    if (peserta.length === 0 && mode === 'individual') {
        alert("Silakan muat data peserta terlebih dahulu melalui menu 'Mulai Sesi Baru'.");
        return;
    }
    qnsData.mode = mode;

    // Sembunyikan layar pemilihan
    document.getElementById('qns-selection-screen').classList.add('hidden');

    if (mode === 'individual') {
        // Inisialisasi skor individu
        peserta.forEach(p => { qnsData.scores[`p${p.id}`] = 0; });
        renderQnSIndividualScreen();
        document.getElementById('qns-individual-game-screen').classList.remove('hidden');
    } else if (mode === 'group') {
        document.getElementById('qns-group-game-screen').classList.remove('hidden');
        renderQnSTeamSetupFields(); // Tampilkan field awal untuk setup grup
    }
}

// === FUNGSI MODE INDIVIDU ===
function renderQnSIndividualScreen() {
    const gridContainer = document.getElementById('qns-peserta-grid');
    gridContainer.innerHTML = '';
    peserta.forEach(p => {
        const score = qnsData.scores[`p${p.id}`] || 0;
        const card = document.createElement('div');
        card.className = `p-3 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center border-2 border-transparent hover:border-blue-500`;
        card.onclick = () => selectQnSParticipant(p);
        card.innerHTML = `<img src="${p.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="Avatar ${p.nama}" class="w-24 h-24 rounded-full object-cover"><h3 class="mt-3 font-semibold text-center text-slate-700">${p.nama}</h3><p class="skor text-2xl font-bold text-slate-800">${score}</p>`;
        gridContainer.appendChild(card);
    });
    renderQnSLeaderboard();
}

function selectQnSParticipant(participant) {
    qnsData.selectedId = `p${participant.id}`;
    document.getElementById('qns-modal-participant-name').textContent = participant.nama;
    drawQnsWheel();
    const spinButton = document.getElementById('qns-spin-btn');
    spinButton.disabled = false;
    spinButton.classList.remove('hidden');
    document.getElementById('qns-close-wheel-modal-btn').classList.add('hidden');
    document.getElementById('qns-wheel-modal').classList.remove('hidden');
}

// === FUNGSI MODE GRUP ===
function renderQnSTeamSetupFields() {
    const teamCountInput = document.getElementById('qns-team-count');
    const teamDetailsContainer = document.getElementById('qns-team-details-container');
    const count = parseInt(teamCountInput.value, 10);
    teamDetailsContainer.innerHTML = '';
    const iconKeys = Object.keys(ICONS);
    for (let i = 0; i < count; i++) {
        let optionsHTML = iconKeys.map(key => `<option value="${key}" ${i === iconKeys.indexOf(key) % iconKeys.length ? 'selected' : ''}>${ICONS[key].svg} ${ICONS[key].name}</option>`).join('');
        const fieldHTML = `<div class="grid grid-cols-12 gap-2 items-center"><label class="col-span-1 text-slate-500 font-bold text-center">${i + 1}</label><input type="text" placeholder="${translations[currentLanguage]['team-name-placeholder']} ${i + 1}" value="Tim ${i + 1}" required class="col-span-6 bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5"><select class="col-span-5 bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5">${optionsHTML}</select></div>`;
        teamDetailsContainer.insertAdjacentHTML('beforeend', fieldHTML);
    }
}

function handleQnSGroupSetup(event) {
    event.preventDefault();
    qnsData.teams = [];
    const detailRows = document.getElementById('qns-team-details-container').children;
    for (let i = 0; i < detailRows.length; i++) {
        const nameInput = detailRows[i].querySelector('input[type="text"]');
        const iconSelect = detailRows[i].querySelector('select');
        const teamId = `t${i}`;
        qnsData.teams.push({
            id: teamId,
            name: nameInput.value,
            icon: ICONS[iconSelect.value].svg
        });
        qnsData.scores[teamId] = 0; // Inisialisasi skor grup
    }
    document.getElementById('qns-group-setup-screen').style.display = 'none';
    document.getElementById('qns-group-play-screen').classList.remove('hidden');
    renderQnSGroupScreen();
}

function renderQnSGroupScreen() {
    const gridContainer = document.getElementById('qns-grup-grid');
    gridContainer.innerHTML = '';
    qnsData.teams.forEach(team => {
        const score = qnsData.scores[team.id] || 0;
        const card = document.createElement('div');
        
        // Diperbaiki: 'justify-center' ditambahkan untuk menengahkan konten secara vertikal
        card.className = `p-3 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-500`;
        
        card.onclick = () => selectQnSTeam(team);
        card.innerHTML = `<span class="text-6xl mb-2">${team.icon}</span><h3 class="mt-3 font-semibold text-center text-slate-700">${team.name}</h3><p class="skor text-2xl font-bold text-slate-800">${score}</p>`;
        gridContainer.appendChild(card);
    });
    renderQnSLeaderboard();
}

function selectQnSTeam(team) {
    qnsData.selectedId = team.id;
    document.getElementById('qns-modal-participant-name').textContent = team.name;
    drawQnsWheel();
    const spinButton = document.getElementById('qns-spin-btn');
    spinButton.disabled = false;
    spinButton.classList.remove('hidden');
    document.getElementById('qns-close-wheel-modal-btn').classList.add('hidden');
    document.getElementById('qns-wheel-modal').classList.remove('hidden');
}


// === FUNGSI BERSAMA (LEADERBOARD & RODA) ===
function renderQnSLeaderboard() {
    const isIndividualMode = qnsData.mode === 'individual';
    const leaderboardContainer = document.getElementById(isIndividualMode ? 'qns-leaderboard-sidebar' : 'qns-grup-leaderboard-sidebar');
    leaderboardContainer.innerHTML = '';

    const participantMap = new Map(peserta.map(p => [`p${p.id}`, p]));
    const teamMap = new Map(qnsData.teams.map(t => [t.id, t]));

    const sortedScores = Object.entries(qnsData.scores)
        .map(([id, score]) => {
            const entity = id.startsWith('p') ? participantMap.get(id) : teamMap.get(id);
            if (!entity) return null;
            return { ...entity, score };
        })
        .filter(item => item && item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    if (sortedScores.length === 0) {
        leaderboardContainer.innerHTML = `<p class="text-center text-sm text-slate-500" data-translate-key="no-assessment-yet">${translations[currentLanguage]['no-assessment-yet']}</p>`;
        return;
    }

    sortedScores.forEach((item, index) => {
        const rank = index + 1;
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        const div = document.createElement('div');
        div.className = 'flex items-center p-3 bg-slate-100 rounded-lg';
        
        // ==========================================================
        // === INI ADALAH BARIS KUNCI PERBAIKANNYA ===
        // ==========================================================
        const itemName = item.nama || item.name; // Cek 'nama' (untuk peserta) atau 'name' (untuk tim)

        const avatarHTML = item.avatar 
            ? `<img src="${item.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="${itemName}" class="w-10 h-10 rounded-full mx-3">` 
            : `<span class="text-2xl w-10 h-10 mx-3 flex items-center justify-center">${item.icon}</span>`;
            
        div.innerHTML = `<span class="text-lg font-bold w-8 text-center">${medal || rank}</span>${avatarHTML}<span class="flex-1 font-medium text-slate-700 truncate">${itemName}</span><span class="font-bold text-lg text-slate-800">${item.score}</span>`;
        leaderboardContainer.appendChild(div);
    });
}

function drawQnsWheel() {
    // ... (Fungsi ini tidak perlu diubah) ...
    const canvas = document.getElementById('qns-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const segments = QNS_WHEEL_SEGMENTS;
    const arc = Math.PI / (segments.length / 2);
    ctx.clearRect(0, 0, 350, 350);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    for(let i = 0; i < segments.length; i++) {
        const angle = qnsStartAngle + i * arc;
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.beginPath();
        ctx.arc(175, 175, 175, angle, angle + arc, false);
        ctx.arc(175, 175, 0, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(175 + Math.cos(angle + arc / 2) * 120, 175 + Math.sin(angle + arc / 2) * 120);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = segments[i].toString();
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
}

function spinQnsWheel() {
    // ... (Fungsi ini tidak perlu diubah) ...
    if (wheelSound) wheelSound.pause();
    wheelSound = new Audio('https://raw.githubusercontent.com/tamawithai/gameclassv1/refs/heads/dev/assets/sounds/wheel.mp3');
    wheelSound.loop = true;
    wheelSound.play();

    qnsSpinTime = 0;
    qnsSpinTimeTotal = Math.random() * 3 + 4 * 1000;
    document.getElementById('qns-spin-btn').disabled = true;
    rotateQnsWheel();
}

function rotateQnsWheel() {
    // ... (Fungsi ini tidak perlu diubah) ...
    qnsSpinTime += 30;
    if (qnsSpinTime >= qnsSpinTimeTotal) {
        stopQnsWheel();
        return;
    }
    const spinAngle = 15 - easeOut(qnsSpinTime, 0, 15, qnsSpinTimeTotal);
    qnsStartAngle += (spinAngle * Math.PI / 180);
    drawQnsWheel();
    qnsSpinTimeout = setTimeout(rotateQnsWheel, 30);
}

function stopQnsWheel() {
    if (wheelSound) {
        wheelSound.pause();
        wheelSound.currentTime = 0;
    }
    clearTimeout(qnsSpinTimeout);
    
    const degrees = qnsStartAngle * 180 / Math.PI + 90;
    const segments = QNS_WHEEL_SEGMENTS;
    const arcd = 360 / segments.length;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const score = segments[index];
    
    // Beri Poin
    qnsData.scores[qnsData.selectedId] += score;
    
    // Tampilkan notifikasi
    playSound(soundSettings.badge);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    
    const selectedName = qnsData.mode === 'individual'
        ? peserta.find(p => `p${p.id}` === qnsData.selectedId).nama
        : qnsData.teams.find(t => t.id === qnsData.selectedId).name;

    // Diperbaiki: Menggunakan kamus terjemahan untuk pesan pop-up
    const message = translations[currentLanguage]['qns-gets-points'].replace('{score}', score);
    document.getElementById('qns-modal-participant-name').textContent = `${selectedName} ${message}`;
    
    document.getElementById('qns-spin-btn').classList.add('hidden');
    document.getElementById('qns-close-wheel-modal-btn').classList.remove('hidden');
    
    // Update UI
    if (qnsData.mode === 'individual') {
        renderQnSIndividualScreen();
    } else {
        renderQnSGroupScreen();
    }
}