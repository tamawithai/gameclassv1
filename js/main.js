// === INISIALISASI APLIKASI ===

window.onload = function() {
    console.log("Aplikasi Gameclass dimuat!");

    // 1. Muat pengaturan dan inisialisasi bahasa
    loadSettings();
    initializeLanguage();
    
    // 2. Siapkan semua event listener untuk UI, Sesi, Game, dll.
    setupUIListeners();
    setupSesiListeners();
    setupGameGrupListeners();
    setupFortuneWheelListeners();
    setupTimerListeners();

    // 3. Render tampilan awal untuk semua komponen
    renderSemuaGameIndividu();
    drawFortuneWheel();
    updateTimerDisplay();
    
    // 4. Tampilkan panel default
    showPanel('individu');
    
    // Di dalam window.onload, di bawah setup lainnya
    setupQnSListeners();
};