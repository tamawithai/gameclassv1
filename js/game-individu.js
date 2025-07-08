// === LOGIKA GAME INDIVIDU ===

function beriPoin(nilai, key) {
    if (pesertaTerpilihId === null) return;
    playSound(soundSettings.point);
    const p = peserta.find(p => p.id === pesertaTerpilihId);
    if (p) {
        p.skor += nilai;
        if (p.skor < 0) p.skor = 0;
        const counterKey = key + 'Count';
        if(p.hasOwnProperty(counterKey)) {
            p[counterKey]++;
            cekDanBeriBadge(p, key);
        }
        renderSemuaGameIndividu();
        const skorGrid = document.querySelector(`#card-${p.id} .skor`);
        const skorSide = document.getElementById(`side-skor-${p.id}`);
        [skorGrid, skorSide].forEach(el => {
            if(el) {
                el.classList.add('score-update-pop');
                el.addEventListener('animationend', () => el.classList.remove('score-update-pop'), {once: true});
            }
        });
    }
}

function cekDanBeriBadge(p, key) {
    const count = p[key + 'Count'];
    const badgeInfo = SistemBadge[key];
    if (!badgeInfo || count === 0 || count % 5 !== 0) return;

    const badgeKey = badgeInfo.tingkat[count]; // Ini adalah 'key', bukan nama
    if (!badgeKey) return;

    // Cek apakah sudah punya badge dengan key yang sama
    const sudahPunya = p.badges.some(b => b.key === badgeKey);
    if (!sudahPunya) {
        // Simpan 'key' nya, bukan namanya
        p.badges.push({ key: badgeKey, ikon: badgeInfo.ikon });
        tampilkanNotifikasiBadge(p.nama, badgeKey, badgeInfo.ikon);
    }
}

function pilihPeserta(id) {
    pesertaTerpilihId = (pesertaTerpilihId === id) ? null : id;
    renderSemuaGameIndividu();
}

function renderGridPeserta() {
    const gridContainer = document.getElementById('peserta-grid');
    gridContainer.innerHTML = '';
    if (peserta.length === 0) {
        gridContainer.innerHTML = `<p class="text-center col-span-full text-slate-500" data-translate-key="start-with-new-session">${translations[currentLanguage]['start-with-new-session']}</p>`;
        return;
    }
    peserta.forEach(p => {
        const isSelected = p.id === pesertaTerpilihId;
        const card = document.createElement('div');
        card.id = `card-${p.id}`;
        card.className = `p-3 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center border-2 ${isSelected ? 'card-selected' : 'border-transparent'}`;
        card.onclick = () => pilihPeserta(p.id);

        // Diperbaiki: Mengambil nama badge dari kamus untuk tooltip (title)
        const badgesHTML = p.badges.map(b => {
            const badgeName = translations[currentLanguage]['badge-names'][b.key];
            return `<span class="badge-icon text-2xl" title="${badgeName}">${b.ikon}</span>`;
        }).join('');

        card.innerHTML = `<img src="${p.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="Avatar ${p.nama}" class="w-24 h-24 rounded-full object-cover"><h3 class="mt-3 font-semibold text-center text-slate-700">${p.nama}</h3><p class="skor text-2xl font-bold text-slate-800">${p.skor}</p><div class="flex space-x-2 mt-2 h-8 items-center">${badgesHTML}</div>`;
        gridContainer.appendChild(card);
    });
}

function renderLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-sidebar');
    const dinilai = peserta.filter(p => p.skor > 0).sort((a, b) => b.skor - a.skor);
    const top10 = dinilai.slice(0, 10);
    leaderboardContainer.innerHTML = '';
    if (dinilai.length === 0) {
        // Diperbaiki: Menggunakan kamus terjemahan
        leaderboardContainer.innerHTML = `<p class="text-center text-sm text-slate-500" data-translate-key="no-assessment-yet">${translations[currentLanguage]['no-assessment-yet']}</p>`;
        return;
    }
    top10.forEach((p, index) => {
        const rank = index + 1;
        let medal = '';
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        const item = document.createElement('div');
        item.className = 'flex items-center p-3 bg-slate-100 rounded-lg';
        item.innerHTML = `<span class="text-lg font-bold w-8 text-center">${medal || rank}</span><img src="${p.avatar}" onerror="this.src='https://placehold.co/128x128/E5E7EB/333333?text=??'" alt="${p.nama}" class="w-10 h-10 rounded-full mx-3"><span class="flex-1 font-medium text-slate-700 truncate">${p.nama}</span><span id="side-skor-${p.id}" class="skor font-bold text-lg text-slate-800">${p.skor}</span>`;
        leaderboardContainer.appendChild(item);
    });
}

function renderBadgePanel() {
    const badgePanelContainer = document.getElementById('badge-panel-sidebar');
    const allBadges = peserta.flatMap(p => p.badges.map(b => ({ namaPeserta: p.nama, ...b }))).reverse();
    badgePanelContainer.innerHTML = '';
    if(allBadges.length === 0) {
        badgePanelContainer.innerHTML = `<p class="text-center text-sm text-slate-500" data-translate-key="no-badges-yet">${translations[currentLanguage]['no-badges-yet']}</p>`;
        return;
    }
    allBadges.forEach(badge => {
        const item = document.createElement('div');
        item.className = 'flex items-center p-2 bg-slate-100 rounded-lg text-sm';
        // Ambil nama badge dari kamus menggunakan badge.key
        const badgeName = translations[currentLanguage]['badge-names'][badge.key];
        item.innerHTML = `<span class="text-xl w-8 text-center">${badge.ikon}</span><div class="flex-1 truncate"><p class="font-bold text-slate-700">${badge.namaPeserta}</p><p class="text-slate-500">${badgeName}</p></div>`;
        badgePanelContainer.appendChild(item);
    });
}

function renderControlsGameIndividu() {
    const controlsTitle = document.getElementById('controls-title');
    const pointButtonsContainer = document.getElementById('point-buttons-container');
    const pesertaTerpilih = peserta.find(p => p.id === pesertaTerpilihId);
    const langDict = translations[currentLanguage]; // Ambil kamus bahasa saat ini

    if (pesertaTerpilih) {
        controlsTitle.innerHTML = `${langDict['giving-points-for']} <span class="font-bold text-blue-500">${pesertaTerpilih.nama}</span>`;
    } else if (peserta.length > 0) {
        controlsTitle.textContent = langDict['select-participant'];
    } else {
        controlsTitle.textContent = langDict['load-or-select-participant'];
    }

    pointButtonsContainer.innerHTML = '';
    TipePoin.forEach(tipe => {
        const button = document.createElement('button');
        button.className = `point-btn text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${tipe.warna}`;
        button.onclick = () => beriPoin(tipe.nilai, tipe.key);
        button.disabled = pesertaTerpilihId === null;

        // DIperbaiki: Mengambil teks dari kamus menggunakan tipe.labelKey
        const buttonText = langDict[tipe.labelKey]; 
        button.innerHTML = `${buttonText} (+${tipe.nilai})`;

        pointButtonsContainer.appendChild(button);
    });
}

function renderSemuaGameIndividu() {
    renderGridPeserta();
    renderLeaderboard();
    renderBadgePanel();
    renderControlsGameIndividu();
}