// === LOGIKA GAME GRUP (AMAZING RACE) ===

function setupGameGrupListeners() {
    document.getElementById('team-count').addEventListener('change', renderTeamSetupFields);
    document.getElementById('setup-form').addEventListener('submit', startRace);
    document.getElementById('control-buttons').addEventListener('click', advanceTeam);
    document.getElementById('reset-race-btn').addEventListener('click', resetGame);
    document.getElementById('restart-from-winner-btn').addEventListener('click', resetGame);
    renderTeamSetupFields();
}

function renderTeamSetupFields() {
    const teamCountInput = document.getElementById('team-count');
    const teamDetailsContainer = document.getElementById('team-details-container');
    const count = parseInt(teamCountInput.value, 10);
    teamDetailsContainer.innerHTML = '';
    const iconKeys = Object.keys(ICONS);
    for (let i = 0; i < count; i++) {
        let optionsHTML = iconKeys.map(key => `<option value="${key}" ${i === iconKeys.indexOf(key) ? 'selected' : ''}>${ICONS[key].svg} ${ICONS[key].name}</option>`).join('');
        const fieldHTML = `<div class="grid grid-cols-12 gap-2 items-center"><label class="col-span-1 text-slate-400 font-bold text-center">${i + 1}</label><input type="text" placeholder="Nama Tim ${i + 1}" value="Tim ${i + 1}" required class="col-span-6 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2.5"><select class="col-span-5 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg p-2.5">${optionsHTML}</select></div>`;
        teamDetailsContainer.insertAdjacentHTML('beforeend', fieldHTML);
    }
}

function startRace(event) {
    event.preventDefault();
    teams = [];
    const detailRows = document.getElementById('team-details-container').children;
    for (let i = 0; i < detailRows.length; i++) {
        const nameInput = detailRows[i].querySelector('input[type="text"]');
        const iconSelect = detailRows[i].querySelector('select');
        teams.push({
            id: i,
            name: nameInput.value,
            icon: ICONS[iconSelect.value].svg,
            color: TEAM_COLORS[i % TEAM_COLORS.length],
            progress: 0,
        });
    }
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('race-screen').classList.remove('hidden');
    renderRace();
}

function renderRace() {
    renderRaceTracks();
    renderRaceControls();
}

function renderRaceTracks() {
    const raceTracksContainer = document.getElementById('race-tracks');
    raceTracksContainer.innerHTML = '';
    teams.forEach(team => {
        const trackHTML = `
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <h3 class="font-bold text-lg">${team.icon} ${team.name}</h3>
                    <span class="text-sm font-mono text-slate-400">${team.progress}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-8 relative">
                    <div class="progress-bar h-8 rounded-full" style="width: ${team.progress}%; background-color: ${team.color};"></div>
                    <div class="race-icon text-4xl absolute top-1/2 -translate-y-1/2" style="left: calc(${team.progress}% - 24px);">${team.icon}</div>
                </div>
            </div>`;
        raceTracksContainer.insertAdjacentHTML('beforeend', trackHTML);
    });
}

function renderRaceControls() {
    const controlButtonsContainer = document.getElementById('control-buttons');
    controlButtonsContainer.innerHTML = '';
    teams.forEach(team => {
        // Diperbaiki: Teks tombol "Maju!" diambil dari kamus
        const buttonText = translations[currentLanguage]['advance-button'];
        const buttonHTML = `<button data-id="${team.id}" class="advance-btn text-white font-bold py-3 px-2 rounded-lg transition-transform hover:scale-105" style="background-color: ${team.color};">${team.icon} ${buttonText}</button>`;
        controlButtonsContainer.insertAdjacentHTML('beforeend', buttonHTML);
    });
}

function advanceTeam(event) {
    if (!event.target.classList.contains('advance-btn')) return;
    playSound(soundSettings.point);
    const teamId = parseInt(event.target.dataset.id, 10);
    const team = teams.find(t => t.id === teamId);
    if (team && team.progress < 100) {
        team.progress += ADVANCE_STEP;
        if (team.progress > 100) team.progress = 100;
        renderRaceTracks();
        if (team.progress >= 100) {
            showWinner(team);
        }
    }
}

function showWinner(team) {
    playSound(soundSettings.badge);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    document.getElementById('winner-icon').textContent = team.icon;
    document.getElementById('winner-name').textContent = team.name;
    document.getElementById('winner-modal').classList.remove('hidden');
    
    const controlButtonsContainer = document.getElementById('control-buttons');
    controlButtonsContainer.removeEventListener('click', advanceTeam);
    controlButtonsContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
}

function resetGame() {
    teams = [];
    document.getElementById('winner-modal').classList.add('hidden');
    document.getElementById('race-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    renderTeamSetupFields();
    document.getElementById('control-buttons').addEventListener('click', advanceTeam);
}