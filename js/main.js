// === INISIALISASI APLIKASI ===

window.onload = function() {
    console.log("Aplikasi Gameclass dimuat!");

    // 1. Muat semua pengaturan dari Local Storage
    loadSettings();
    
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
};