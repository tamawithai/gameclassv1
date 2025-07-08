// === MANAJEMEN SESI ===

function setupSesiListeners() {
    const sessionFileInput = document.createElement('input');
    sessionFileInput.type = 'file';
    sessionFileInput.accept = '.json';
    sessionFileInput.style.display = 'none';
    document.body.appendChild(sessionFileInput);
    sessionFileInput.addEventListener('change', loadSession);

    document.getElementById('menu-lanjutkan-sesi').addEventListener('click', (e) => {
        e.preventDefault();
        sessionFileInput.click();
    });

    document.getElementById('menu-simpan-sesi').addEventListener('click', (e) => {
        e.preventDefault();
        saveSession();
    });
    
    document.getElementById('excel-file-input').addEventListener('change', handleFileUpload);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    const uploadStatus = document.getElementById('upload-status');
    if (!file) return;

    uploadStatus.textContent = 'Membaca file...';
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            peserta = jsonData.map((row, index) => ({
                id: index + 1,
                nama: row.Nama || 'Tanpa Nama',
                skor: 0,
                avatar: row.Avatar || 'https://placehold.co/128x128/E5E7EB/333333?text=??',
                tanyaCount: 0,
                jawabCount: 0,
                sharingCount: 0,
                praktikCount: 0,
                badges: []
            }));

            uploadStatus.textContent = `${peserta.length} peserta berhasil dimuat!`;
            pesertaTerpilihId = null;
            renderSemuaGameIndividu();
            drawFortuneWheel(); // Update roda keberuntungan juga
            
            setTimeout(() => {
                document.getElementById('upload-modal').classList.add('hidden');
                uploadStatus.textContent = '';
                event.target.value = '';
            }, 1500);
        } catch (err) {
            console.error("Error reading Excel file:", err);
            uploadStatus.textContent = 'Gagal memuat file.';
        }
    };
    reader.readAsArrayBuffer(file);
}

function saveSession() {
    if (peserta.length === 0) {
        alert('Tidak ada data sesi untuk disimpan.');
        return;
    }
    const sessionData = { peserta, soundSettings, TipePoin }; // Simpan juga pengaturan
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
                // Muat juga pengaturan jika ada di file
                if(sessionData.TipePoin) TipePoin = sessionData.TipePoin;
                if(sessionData.soundSettings) soundSettings = sessionData.soundSettings;

                renderSemuaGameIndividu();
                drawFortuneWheel();
                alert('Sesi berhasil dimuat!');
            } else {
                throw new Error('Format file tidak valid.');
            }
        } catch (err) {
            alert('Gagal memuat file sesi. Pastikan file valid.');
            console.error(err);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input file
}

// === PENGATURAN MODAL ===
function loadSettings() {
    const savedPoints = localStorage.getItem('gamifikasi-custom-points');
    const savedSounds = localStorage.getItem('gamifikasi-custom-sounds');
    if (savedPoints) TipePoin = JSON.parse(savedPoints);
    if (savedSounds) soundSettings = JSON.parse(savedSounds);
}

function populateSettingsForm() {
    const settingsFormContent = document.getElementById('settings-form-content');
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
    TipePoin.forEach(tipe => {
        const input = document.getElementById(`setting-${tipe.key}`);
        if (input) tipe.nilai = parseInt(input.value, 10) || 0;
    });
    soundSettings.point = document.getElementById('setting-sound-point').value;
    soundSettings.badge = document.getElementById('setting-sound-badge').value;

    localStorage.setItem('gamifikasi-custom-points', JSON.stringify(TipePoin));
    localStorage.setItem('gamifikasi-custom-sounds', JSON.stringify(soundSettings));
    
    document.getElementById('settings-modal').classList.add('hidden');
    renderControlsGameIndividu();
}