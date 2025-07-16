import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { updateAuthUI, handleLogout } from './auth.js';


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

    // Pasang listener status auth
    if (window.auth) {
        onAuthStateChanged(window.auth, (user) => {
            updateAuthUI(user);
        });
    } else {
        console.error("Firebase Auth belum diinisialisasi");
    }

    // Event listener logout sudah ada, pastikan handleLogout juga dipasang di window
    window.handleLogout = handleLogout; // Supaya dapat dipanggil dari event listener di atas
    
    // PERBAIKI EVENT LISTENER UNTUK LOGOUT BUTTON
    const authMenuItem = document.getElementById('menu-auth');
    if (authMenuItem) {
        authMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.auth.currentUser) {
                if (typeof window.handleLogout === 'function') {
                    window.handleLogout();
                } else {
                    console.error("Fungsi handleLogout tidak ditemukan di window.");
                }
            } else {
                window.location.href = 'landing_page.html';
            }
        });
    }
    // AKHIR PERBAIKAN EVENT LISTENER UNTUK LOGOUT BUTTON
};