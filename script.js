window.onload = function() {
    // === BAGIAN KONTROL UTAMA & NAVIGASI ===
    const panelIndividu = document.getElementById('panel-individu');
    const panelGrup = document.getElementById('panel-grup');
    const panelFortuneWheel = document.getElementById('panel-fortune-wheel');
    const panelTimer = document.getElementById('panel-timer');
    const menuIndividu = document.getElementById('menu-individu');
    const menuGrup = document.getElementById('menu-grup');
    const menuFortuneWheel = document.getElementById('menu-fortune-wheel');
    const menuTimer = document.getElementById('menu-timer');
    const allPanels = [panelIndividu, panelGrup, panelFortuneWheel, panelTimer];
    const setActiveMenu = (activeMenu) => { document.querySelectorAll('.main-menu-item').forEach(el => el.classList.remove('active')); if (activeMenu) activeMenu.classList.add('active'); };
    const showPanel = (panelId) => { allPanels.forEach(p => p.classList.add('hidden')); let activeMenu; if (panelId === 'individu') { panelIndividu.classList.remove('hidden'); activeMenu = menuIndividu; } else if (panelId === 'grup') { panelGrup.classList.remove('hidden'); activeMenu = menuGrup; } else if (panelId === 'fortune-wheel') { panelFortuneWheel.classList.remove('hidden'); activeMenu = menuFortuneWheel; drawFortuneWheel(); } else if (panelId === 'timer') { panelTimer.classList.remove('hidden'); activeMenu = menuTimer; } setActiveMenu(activeMenu); };
    menuIndividu.addEventListener('click', (e) => { e.preventDefault(); showPanel('individu'); });
    menuGrup.addEventListener('click', (e) => { e.preventDefault(); showPanel('grup'); });
    menuFortuneWheel.addEventListener('click', (e) => { e.preventDefault(); showPanel('fortune-wheel'); });
    menuTimer.addEventListener('click', (e) => { e.preventDefault(); showPanel('timer'); });
    const sidebar = document.getElementById('main-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const openIcon = document.getElementById('sidebar-toggle-open-icon');
    const closeIcon = document.getElementById('sidebar-toggle-close-icon');
    const setSidebarState = (isCollapsed) => { sidebar.classList.toggle('collapsed', isCollapsed); sidebar.style.width = isCollapsed ? '80px' : '256px'; if(openIcon) openIcon.classList.toggle('hidden', !isCollapsed); if(closeIcon) closeIcon.classList.toggle('hidden', isCollapsed); localStorage.setItem('sidebar-collapsed', isCollapsed); };
    const initializeSidebar = () => { setSidebarState(localStorage.getItem('sidebar-collapsed') === 'true'); };
    initializeSidebar();
    if(sidebarToggle){ sidebarToggle.addEventListener('click', () => { setSidebarState(!sidebar.classList.contains('collapsed')); }); }

    // === BAGIAN MANAJEMEN SESI ===
    const menuSesiBaru = document.getElementById('menu-sesi-baru');
    const menuLanjutkanSesi = document.getElementById('menu-lanjutkan-sesi');
    const menuSimpanSesi = document.getElementById('menu-simpan-sesi');
    
    menuSesiBaru.addEventListener('click', (e) => { e.preventDefault(); uploadModal.classList.remove('hidden'); });
    menuLanjutkanSesi.addEventListener('click', (e) => { e.preventDefault(); sessionFileInput.click(); });
    menuSimpanSesi.addEventListener('click', (e) => { e.preventDefault(); saveSession(); });

    const sessionFileInput = document.createElement('input');
    sessionFileInput.type = 'file';
    sessionFileInput.accept = '.json';
    sessionFileInput.style.display = 'none';
    document.body.appendChild(sessionFileInput);
    sessionFileInput.addEventListener('change', loadSession);
    
    function saveSession() {
        if (peserta.length === 0) { alert('Tidak ada data sesi untuk disimpan.'); return; }
        const sessionData = { peserta };
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `sesi-gamifikasi-${new Date().toISOString().slice(0,10)}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    function loadSession(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const sessionData = JSON.parse(e.target.result);
                if (sessionData && sessionData.peserta) {
                    peserta = sessionData.peserta;
                    renderSemua();
                    alert('Sesi berhasil dimuat!');
                } else { throw new Error('Format file tidak valid.'); }
            } catch (err) { alert('Gagal memuat file sesi. Pastikan file valid.'); console.error(err); }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // === BAGIAN GAME INDIVIDU & PENGATURAN ===
    let peserta = []; let pesertaTerpilihId = null;
    let soundSettings = { point: '', badge: '' };
    const gridContainer = document.getElementById('peserta-grid');
    const leaderboardContainer = document.getElementById('leaderboard-sidebar');
    const badgePanelContainer = document.getElementById('badge-panel-sidebar');
    const controlsTitle = document.getElementById('controls-title');
    const pointButtonsContainer = document.getElementById('point-buttons-container');
    const uploadModal = document.getElementById('upload-modal');
    const closeUploadModalBtn = document.getElementById('close-upload-modal-btn');
    const fileInput = document.getElementById('excel-file-input');
    const uploadStatus = document.getElementById('upload-status');
    const badgeModal = document.getElementById('badge-modal');
    const closeBadgeModalBtn = document.getElementById('close-badge-modal-btn');
    const menuPengaturan = document.getElementById('menu-pengaturan');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const settingsFormContent = document.getElementById('settings-form-content');
    let TipePoin = [ { key: 'tanya', label: 'Bertanya', nilai: 5, warna: 'bg-sky-500 hover:bg-sky-600' }, { key: 'jawab', label: 'Menjawab', nilai: 10, warna: 'bg-emerald-500 hover:bg-emerald-600' }, { key: 'sharing', label: 'Sharing', nilai: 15, warna: 'bg-amber-500 hover:bg-amber-600' }, { key: 'praktik', label: 'Sukarelawan Praktik', nilai: 20, warna: 'bg-indigo-500 hover:bg-indigo-600' } ];
    const SistemBadge = { tanya: { ikon: '🧠', tingkat: { 5: 'Pemikir Kritis', 10: 'Pakar Penanya', 15: 'Inkuisitor Ulung' } }, jawab: { ikon: '💡', tingkat: { 5: 'Sang Pencerah', 10: 'Sumber Pengetahuan', 15: 'Pustakawan Berjalan' } }, sharing: { ikon: '❤️', tingkat: { 5: 'Pembagi Cerita', 10: 'Inspirator Sesi', 15: 'Mentor Sejawat' } }, praktik: { ikon: '🚀', tingkat: { 5: 'Sang Pemberani', 10: 'Pelopor Aksi', 15: 'Ahli Panggung' } } };
    
    function playSound(url) {
        if (url) {
            try {
                const audio = new Audio(url);
                audio.play();
            } catch(e) {
                console.error("Gagal memutar audio:", e);
            }
        }
    }
    
    function loadSettings() { 
        const savedPoints = localStorage.getItem('gamifikasi-custom-points');
        const savedSounds = localStorage.getItem('gamifikasi-custom-sounds');
        if (savedPoints) TipePoin = JSON.parse(savedPoints);
        if (savedSounds) soundSettings = JSON.parse(savedSounds);
    }
    function populateSettingsForm() {
        settingsFormContent.innerHTML = '';
        let formHTML = `<h3 class="text-xl font-bold mb-4">Pengaturan Nilai Poin</h3><form id="settings-form-points" class="space-y-4">`;
        TipePoin.forEach(tipe => {
            formHTML += `<div class="flex items-center justify-between"><label for="setting-${tipe.key}" class="font-medium text-slate-700">${tipe.label}</label><input type="number" id="setting-${tipe.key}" name="${tipe.key}" value="${tipe.nilai}" class="w-24 p-2 border border-slate-300 rounded-md"></div>`;
        });
        formHTML += `</form><hr class="my-6"><h3 class="text-xl font-bold mb-4">Pengaturan Suara</h3><form id="settings-form-sounds" class="space-y-4">`;
        formHTML += `<div class="flex items-center justify-between"><label for="setting-sound-point" class="font-medium text-slate-700">Suara Poin (URL .mp3)</label><input type="url" id="setting-sound-point" value="${soundSettings.point}" class="w-2/3 p-2 border border-slate-300 rounded-md"></div>`;
        formHTML += `<div class="flex items-center justify-between"><label for="setting-sound-badge" class="font-medium text-slate-700">Suara Badge (URL .mp3)</label><input type="url" id="setting-sound-badge" value="${soundSettings.badge}" class="w-2/3 p-2 border border-slate-300 rounded-md"></div>`;
        formHTML += `</form><button id="save-settings-btn" class="w-full mt-6 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Simpan Semua Pengaturan</button>`;
        settingsFormContent.innerHTML = formHTML;
        document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    }
    function saveSettings(event) { 
        event.preventDefault(); 
        TipePoin.forEach(tipe => { const input = document.getElementById(`setting-${tipe.key}`); if (input) tipe.nilai = parseInt(input.value, 10) || 0; }); 
        soundSettings.point = document.getElementById('setting-sound-point').value;
        soundSettings.badge = document.getElementById('setting-sound-badge').value;
        localStorage.setItem('gamifikasi-custom-points', JSON.stringify(TipePoin));
        localStorage.setItem('gamifikasi-custom-sounds', JSON.stringify(soundSettings));
        settingsModal.classList.add('hidden'); 
        renderControls(); 
    }
    function handleFileUpload(event) { const file = event.target.files[0]; if (!file) return; uploadStatus.textContent = 'Membaca file...'; const reader = new FileReader(); reader.onload = function(e) { try { const data = new Uint8Array(e.target.result); const workbook = XLSX.read(data, {type: 'array'}); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; const jsonData = XLSX.utils.sheet_to_json(worksheet); peserta = jsonData.map((row, index) => ({ id: index + 1, nama: row.Nama || 'Tanpa Nama', skor: 0, avatar: row.Avatar || 'https://placehold.co/128x128/E5E7EB/333333?text=??', tanyaCount: 0, jawabCount: 0, sharingCount: 0, praktikCount: 0, badges: [] })); uploadStatus.textContent = `${peserta.length} peserta berhasil dimuat!`; pesertaTerpilihId = null; renderSemua(); setTimeout(() => { uploadModal.classList.add('hidden'); uploadStatus.textContent = ''; fileInput.value = ''; }, 1500); } catch (err) { console.error("Error reading Excel file:", err); uploadStatus.textContent = 'Gagal memuat file.'; } }; reader.readAsArrayBuffer(file); }
    function beriPoin(nilai, key) { if (pesertaTerpilihId === null) return; playSound(soundSettings.point); const p = peserta.find(p => p.id === pesertaTerpilihId); if (p) { p.skor += nilai; if (p.skor < 0) p.skor = 0; const counterKey = key + 'Count'; if(p.hasOwnProperty(counterKey)) { p[counterKey]++; cekDanBeriBadge(p, key); } renderSemua(); const skorGrid = document.querySelector(`#card-${p.id} .skor`); const skorSide = document.getElementById(`side-skor-${p.id}`); [skorGrid, skorSide].forEach(el => { if(el) { el.classList.add('score-update-pop'); el.addEventListener('animationend', () => el.classList.remove('score-update-pop'), {once: true}); } }); } }
    function cekDanBeriBadge(p, key) { const count = p[key + 'Count']; const badgeInfo = SistemBadge[key]; if (!badgeInfo || count === 0 || count % 5 !== 0) return; const namaBadge = badgeInfo.tingkat[count]; if (!namaBadge) return; const sudahPunya = p.badges.some(b => b.nama === namaBadge); if (!sudahPunya) { p.badges.push({ nama: namaBadge, ikon: badgeInfo.ikon }); tampilkanNotifikasiBadge(p.nama, namaBadge, badgeInfo.ikon); } }
    function tampilkanNotifikasiBadge(namaPeserta, namaBadge, ikonBadge) { playSound(soundSettings.badge); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); document.getElementById('badge-participant-name').textContent = namaPeserta; document.getElementById('badge-name').textContent = namaBadge; document.getElementById('badge-icon-container').innerHTML = ikonBadge; badgeModal.classList.remove('hidden'); }
    function pilihPeserta(id) { pesertaTerpilihId = (pesertaTerpilihId === id) ? null : id; renderSemua(); }
    function renderGridPeserta() { gridContainer.innerHTML = ''; if (peserta.length === 0) { gridContainer.innerHTML = `<p class="text-center col-span-full text-slate-500">Mulai dengan "Sesi Baru" atau "Lanjutkan Sesi".</p>`; return; } peserta.forEach(p => { const isSelected = p.id === pesertaTerpilihId; const card = document.createElement('div'); card.id = `card-${p.id}`; card.className = `p-3 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center border-2 ${isSelected ? 'card-selected' : 'border-transparent'}`; card.onclick = () => pilihPeserta(p.id); const badgesHTML = p.badges.map(b => `<span class="badge-icon text-2xl" title="${b.nama}">${b.ikon}</span>`).join(''); card.innerHTML = `<img src="${p.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="Avatar ${p.nama}" class="w-24 h-24 rounded-full object-cover"><h3 class="mt-3 font-semibold text-center text-slate-700">${p.nama}</h3><p class="skor text-2xl font-bold text-slate-800">${p.skor}</p><div class="flex space-x-2 mt-2 h-8 items-center">${badgesHTML}</div>`; gridContainer.appendChild(card); }); }
    function renderLeaderboard() { const dinilai = peserta.filter(p => p.skor > 0).sort((a, b) => b.skor - a.skor); const top10 = dinilai.slice(0, 10); leaderboardContainer.innerHTML = ''; if (dinilai.length === 0) { leaderboardContainer.innerHTML = `<p class="text-center text-sm text-slate-500">Belum ada penilaian.</p>`; return; } top10.forEach((p, index) => { const rank = index + 1; let medal = ''; if (rank === 1) medal = '🥇'; else if (rank === 2) medal = '🥈'; else if (rank === 3) medal = '🥉'; const item = document.createElement('div'); item.className = 'flex items-center p-3 bg-slate-100 rounded-lg'; item.innerHTML = `<span class="text-lg font-bold w-8 text-center">${medal || rank}</span><img src="${p.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="${p.nama}" class="w-10 h-10 rounded-full mx-3"><span class="flex-1 font-medium text-slate-700 truncate">${p.nama}</span><span id="side-skor-${p.id}" class="skor font-bold text-lg text-slate-800">${p.skor}</span>`; leaderboardContainer.appendChild(item); }); }
    function renderBadgePanel() { const allBadges = peserta.flatMap(p => p.badges.map(b => ({ namaPeserta: p.nama, ...b }))).reverse(); badgePanelContainer.innerHTML = ''; if(allBadges.length === 0) { badgePanelContainer.innerHTML = `<p class="text-center text-sm text-slate-500">Belum ada badge.</p>`; return; } allBadges.forEach(badge => { const item = document.createElement('div'); item.className = 'flex items-center p-2 bg-slate-100 rounded-lg text-sm'; item.innerHTML = `<span class="text-xl w-8 text-center">${badge.ikon}</span><div class="flex-1 truncate"><p class="font-bold text-slate-700">${badge.namaPeserta}</p><p class="text-slate-500">${badge.nama}</p></div>`; badgePanelContainer.appendChild(item); }); }
    function renderControls() { const pesertaTerpilih = peserta.find(p => p.id === pesertaTerpilihId); if(pesertaTerpilih) { controlsTitle.innerHTML = `Memberi Poin untuk: <span class="font-bold text-blue-500">${pesertaTerpilih.nama}</span>`; } else if (peserta.length > 0) { controlsTitle.textContent = 'Pilih Peserta'; } else { controlsTitle.textContent = 'Muat data peserta'; } pointButtonsContainer.innerHTML = ''; TipePoin.forEach(tipe => { const button = document.createElement('button'); button.className = `point-btn text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${tipe.warna}`; button.onclick = () => beriPoin(tipe.nilai, tipe.key); button.disabled = pesertaTerpilihId === null; button.innerHTML = `${tipe.ikon || ''} ${tipe.label} (+${tipe.nilai})`; pointButtonsContainer.appendChild(button); }); }
    function renderSemua() { renderGridPeserta(); renderLeaderboard(); renderBadgePanel(); renderControls(); }
    closeUploadModalBtn.addEventListener('click', () => { uploadModal.classList.add('hidden'); uploadStatus.textContent = ''; });
    closeBadgeModalBtn.addEventListener('click', () => { badgeModal.classList.add('hidden'); });
    fileInput.addEventListener('change', handleFileUpload);
    menuPengaturan.addEventListener('click', (e) => { e.preventDefault(); populateSettingsForm(); settingsModal.classList.remove('hidden'); });
    closeSettingsModalBtn.addEventListener('click', () => { settingsModal.classList.add('hidden'); });
    loadSettings(); renderSemua();

    // === BAGIAN GAME GRUP ===
    let teams = [];
    const ICONS = { lion: { svg: '🦁', name: 'Singa' }, tiger: { svg: '🐯', name: 'Harimau' }, bear: { svg: '🐻', name: 'Beruang' }, panda: { svg: '🐼', name: 'Panda' }, fox: { svg: '🦊', name: 'Rubah' }, koala: { svg: '🐨', name: 'Koala' }, dog: { svg: '🐶', name: 'Anjing' }, cat: { svg: '🐱', name: 'Kucing' } };
    const TEAM_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const ADVANCE_STEP = 10;
    const setupScreen = document.getElementById('setup-screen');
    const raceScreen = document.getElementById('race-screen');
    const setupForm = document.getElementById('setup-form');
    const teamCountInput = document.getElementById('team-count');
    const teamDetailsContainer = document.getElementById('team-details-container');
    const raceTracksContainer = document.getElementById('race-tracks');
    const controlButtonsContainer = document.getElementById('control-buttons');
    const resetRaceBtn = document.getElementById('reset-race-btn');
    const winnerModal = document.getElementById('winner-modal');
    const winnerIcon = document.getElementById('winner-icon');
    const winnerName = document.getElementById('winner-name');
    const restartFromWinnerBtn = document.getElementById('restart-from-winner-btn');
    function renderTeamSetupFields() { const count = parseInt(teamCountInput.value, 10); teamDetailsContainer.innerHTML = ''; const iconKeys = Object.keys(ICONS); for (let i = 0; i < count; i++) { let optionsHTML = iconKeys.map(key => `<option value="${key}" ${i === iconKeys.indexOf(key) ? 'selected' : ''}>${ICONS[key].svg} ${ICONS[key].name}</option>`).join(''); const fieldHTML = `<div class="grid grid-cols-12 gap-2 items-center"><label class="col-span-1 text-slate-400 font-bold text-center">${i + 1}</label><input type="text" placeholder="Nama Tim ${i + 1}" value="Tim ${i + 1}" required class="col-span-6 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2.5"><select class="col-span-5 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2.5">${optionsHTML}</select></div>`; teamDetailsContainer.insertAdjacentHTML('beforeend', fieldHTML); } }
    function startRace(event) { event.preventDefault(); teams = []; const detailRows = teamDetailsContainer.children; for (let i = 0; i < detailRows.length; i++) { const nameInput = detailRows[i].querySelector('input[type="text"]'); const iconSelect = detailRows[i].querySelector('select'); teams.push({ id: i, name: nameInput.value, icon: ICONS[iconSelect.value].svg, color: TEAM_COLORS[i % TEAM_COLORS.length], progress: 0, }); } setupScreen.classList.add('hidden'); raceScreen.classList.remove('hidden'); renderRace(); }
    function renderRace() { renderRaceTracks(); renderRaceControls(); }
    function renderRaceTracks() { raceTracksContainer.innerHTML = ''; teams.forEach(team => { const trackHTML = `<div class="space-y-2"><div class="flex justify-between items-center"><h3 class="font-bold text-lg">${team.icon} ${team.name}</h3><span class="text-sm font-mono text-slate-400">${team.progress}%</span></div><div class="w-full bg-slate-700 rounded-full h-8 relative"><div class="progress-bar h-8 rounded-full" style="width: ${team.progress}%; background-color: ${team.color};"></div><div class="race-icon text-4xl absolute top-1/2 -translate-y-1/2" style="left: calc(${team.progress}% - 24px);">${team.icon}</div></div></div>`; raceTracksContainer.insertAdjacentHTML('beforeend', trackHTML); }); }
    function renderRaceControls() { controlButtonsContainer.innerHTML = ''; teams.forEach(team => { const buttonHTML = `<button data-id="${team.id}" class="advance-btn text-white font-bold py-3 px-2 rounded-lg transition-transform hover:scale-105" style="background-color: ${team.color};">${team.icon} Maju!</button>`; controlButtonsContainer.insertAdjacentHTML('beforeend', buttonHTML); }); }
    function advanceTeam(event) { if (!event.target.classList.contains('advance-btn')) return; playSound(soundSettings.point); const teamId = parseInt(event.target.dataset.id, 10); const team = teams.find(t => t.id === teamId); if (team && team.progress < 100) { team.progress += ADVANCE_STEP; if (team.progress > 100) team.progress = 100; renderRaceTracks(); if (team.progress >= 100) { showWinner(team); } } }
    function showWinner(team) { playSound(soundSettings.badge); confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); winnerIcon.textContent = team.icon; winnerName.textContent = team.name; winnerModal.classList.remove('hidden'); controlButtonsContainer.removeEventListener('click', advanceTeam); controlButtonsContainer.querySelectorAll('button').forEach(btn => btn.disabled = true); }
    function resetGame() { teams = []; winnerModal.classList.add('hidden'); raceScreen.classList.add('hidden'); setupScreen.classList.remove('hidden'); renderTeamSetupFields(); controlButtonsContainer.addEventListener('click', advanceTeam); }
    teamCountInput.addEventListener('change', renderTeamSetupFields);
    setupForm.addEventListener('submit', startRace);
    controlButtonsContainer.addEventListener('click', advanceTeam);
    resetRaceBtn.addEventListener('click', resetGame);
    restartFromWinnerBtn.addEventListener('click', resetGame);
    renderTeamSetupFields();

    // === BAGIAN FORTUNE WHEEL ===
    const wheelCanvas = document.getElementById('wheelCanvas');
    const spinBtn = document.getElementById('spin-btn');
    const wheelWinnerModal = document.getElementById('wheel-winner-modal');
    const closeWheelWinnerBtn = document.getElementById('close-wheel-winner-btn');
    const wheelColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#22C55E', '#D946EF', '#0EA5E9'];
    let startAngle = 0; let spinTimeout = null; let spinAngleStart = 10; let spinTime = 0; let spinTimeTotal = 0;
    
    function getInitials(name) { if (!name) return ''; const words = name.split(' '); if (words.length > 1) { return (words[0][0] + words[words.length - 1][0]).toUpperCase(); } return name.substring(0, 2).toUpperCase(); }
    function drawFortuneWheel() { if (!wheelCanvas) return; const ctx = wheelCanvas.getContext('2d'); const arc = peserta.length > 0 ? Math.PI / (peserta.length / 2) : 0; ctx.clearRect(0, 0, 500, 500); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; if (peserta.length === 0) { ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.font = '20px Inter, sans-serif'; ctx.fillText("Unggah data peserta untuk memulai", 250, 250); spinBtn.disabled = true; return; } spinBtn.disabled = false; for(let i = 0; i < peserta.length; i++) { const angle = startAngle + i * arc; ctx.fillStyle = wheelColors[i % wheelColors.length]; ctx.beginPath(); ctx.arc(250, 250, 250, angle, angle + arc, false); ctx.arc(250, 250, 0, angle + arc, angle, true); ctx.stroke(); ctx.fill(); ctx.save(); ctx.fillStyle = "white"; ctx.translate(250 + Math.cos(angle + arc / 2) * 160, 250 + Math.sin(angle + arc / 2) * 160); ctx.rotate(angle + arc / 2 + Math.PI / 2); const text = getInitials(peserta[i].nama); ctx.font = 'bold 32px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, 0, 10); ctx.restore(); } }
    function rotateWheel() { spinTime += 30; if(spinTime >= spinTimeTotal) { stopRotateWheel(); return; } const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal); startAngle += (spinAngle * Math.PI / 180); drawFortuneWheel(); spinTimeout = setTimeout(rotateWheel, 30); }
    function stopRotateWheel() { clearTimeout(spinTimeout); const degrees = startAngle * 180 / Math.PI + 90; const arcd = 360 / peserta.length; const index = Math.floor((360 - degrees % 360) / arcd); const winner = peserta[index]; showWheelWinner(winner); spinBtn.disabled = false; }
    function easeOut(t, b, c, d) { const ts = (t/=d)*t; const tc = ts*t; return b+c*(tc + -3*ts + 3*t); }
    function showWheelWinner(winner){ playSound(soundSettings.badge); confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); document.getElementById('wheel-winner-avatar').src = winner.avatar; document.getElementById('wheel-winner-name').textContent = winner.nama; wheelWinnerModal.classList.remove('hidden'); }
    spinBtn.addEventListener('click', () => { if (peserta.length === 0) return; spinAngleStart = Math.random() * 10 + 10; spinTime = 0; spinTimeTotal = Math.random() * 3 + 4 * 1000; spinBtn.disabled = true; rotateWheel(); });
    closeWheelWinnerBtn.addEventListener('click', () => wheelWinnerModal.classList.add('hidden'));
    
    // === BAGIAN TIMER ===
    const timerDisplay = document.getElementById('timer-display');
    const timerToggleBtn = document.getElementById('timer-toggle-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const customTimeInput = document.getElementById('custom-time-input');
    const customTimeBtn = document.getElementById('custom-time-btn');
    const timerFullscreenBtn = document.getElementById('timer-fullscreen-btn');
    const timerControlsWrapper = document.getElementById('timer-controls-wrapper');
    let timerInterval = null;
    let timeRemaining = 0;
    let totalTime = 0;

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if(timeRemaining <= 10 && timeRemaining > 0) timerDisplay.classList.add('ending');
        else timerDisplay.classList.remove('ending');
    }

    function setAndResetTimer(duration) {
         clearInterval(timerInterval);
         timerInterval = null;
         timeRemaining = duration;
         totalTime = duration;
         updateTimerDisplay();
         timerToggleBtn.textContent = 'Mulai';
    }

    function startTimer() {
        if(timeRemaining <= 0) return;
        timerToggleBtn.textContent = 'Jeda';
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerToggleBtn.textContent = 'Selesai';
                confetti({ particleCount: 200, spread: 120, origin: { y: 0.8 }});
            }
        }, 1000);
    }

    document.querySelectorAll('.timer-set-btn').forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.dataset.time, 10);
            setAndResetTimer(seconds);
        });
    });

    customTimeBtn.addEventListener('click', () => {
        const minutes = parseInt(customTimeInput.value, 10);
        if(minutes > 0){
            setAndResetTimer(minutes * 60);
        }
    });
    
    timerToggleBtn.addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerToggleBtn.textContent = 'Lanjut';
        } else {
            startTimer();
        }
    });

    timerResetBtn.addEventListener('click', () => {
        setAndResetTimer(totalTime);
    });

    timerFullscreenBtn.addEventListener('click', () => {
        const timerPanel = document.getElementById('panel-timer');
        if (!document.fullscreenElement) {
            timerPanel.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });

};