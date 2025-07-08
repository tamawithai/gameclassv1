// === KONTROL ANTARMUKA PENGGUNA (UI) ===

function setupUIListeners() {
    // Navigasi Panel Utama
    document.getElementById('menu-individu').addEventListener('click', (e) => { e.preventDefault(); showPanel('individu'); });
    document.getElementById('menu-grup').addEventListener('click', (e) => { e.preventDefault(); showPanel('grup'); });
    document.getElementById('menu-fortune-wheel').addEventListener('click', (e) => { e.preventDefault(); showPanel('fortune-wheel'); });
    document.getElementById('menu-timer').addEventListener('click', (e) => { e.preventDefault(); showPanel('timer'); });

    // Toggle Sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if(sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('main-sidebar');
            setSidebarState(!sidebar.classList.contains('collapsed'));
        });
    }
    initializeSidebar();

    // Kontrol Modal
    document.getElementById('close-upload-modal-btn').addEventListener('click', () => document.getElementById('upload-modal').classList.add('hidden'));
    document.getElementById('close-badge-modal-btn').addEventListener('click', () => document.getElementById('badge-modal').classList.add('hidden'));
    document.getElementById('close-settings-modal-btn').addEventListener('click', () => document.getElementById('settings-modal').classList.add('hidden'));
    document.getElementById('close-wheel-winner-btn').addEventListener('click', () => document.getElementById('wheel-winner-modal').classList.add('hidden'));
    
    // Menu Manajemen
    document.getElementById('menu-sesi-baru').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('upload-modal').classList.remove('hidden'); });
    document.getElementById('menu-pengaturan').addEventListener('click', (e) => { e.preventDefault(); populateSettingsForm(); document.getElementById('settings-modal').classList.remove('hidden'); });
}

function showPanel(panelId) {
    const allPanels = [
        document.getElementById('panel-individu'),
        document.getElementById('panel-grup'),
        document.getElementById('panel-fortune-wheel'),
        document.getElementById('panel-timer')
    ];
    allPanels.forEach(p => p.classList.add('hidden'));

    let activeMenu;
    if (panelId === 'individu') {
        document.getElementById('panel-individu').classList.remove('hidden');
        activeMenu = document.getElementById('menu-individu');
    } else if (panelId === 'grup') {
        document.getElementById('panel-grup').classList.remove('hidden');
        activeMenu = document.getElementById('menu-grup');
    } else if (panelId === 'fortune-wheel') {
        document.getElementById('panel-fortune-wheel').classList.remove('hidden');
        activeMenu = document.getElementById('menu-fortune-wheel');
        drawFortuneWheel();
    } else if (panelId === 'timer') {
        document.getElementById('panel-timer').classList.remove('hidden');
        activeMenu = document.getElementById('menu-timer');
    }

    document.querySelectorAll('.main-menu-item').forEach(el => el.classList.remove('active'));
    if (activeMenu) activeMenu.classList.add('active');
}

function setSidebarState(isCollapsed) {
    const sidebar = document.getElementById('main-sidebar');
    const openIcon = document.getElementById('sidebar-toggle-open-icon');
    const closeIcon = document.getElementById('sidebar-toggle-close-icon');
    
    sidebar.classList.toggle('collapsed', isCollapsed);
    sidebar.style.width = isCollapsed ? '80px' : '256px';
    if(openIcon) openIcon.classList.toggle('hidden', !isCollapsed);
    if(closeIcon) closeIcon.classList.toggle('hidden', isCollapsed);
    localStorage.setItem('sidebar-collapsed', isCollapsed);
}

function initializeSidebar() {
    setSidebarState(localStorage.getItem('sidebar-collapsed') === 'true');
}

// ==========================================================
// === FUNGSI YANG DIPERBAIKI ADA DI BAWAH INI ===
// ==========================================================
function tampilkanNotifikasiBadge(namaPeserta, badgeKey, ikonBadge) {
    playSound(soundSettings.badge);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    // Sekarang 'badgeKey' diterima dengan benar dan bisa digunakan
    const badgeName = translations[currentLanguage]['badge-names'][badgeKey];

    document.getElementById('badge-participant-name').textContent = namaPeserta;
    document.getElementById('badge-name').textContent = badgeName;
    document.getElementById('badge-icon-container').innerHTML = ikonBadge;
    document.getElementById('badge-modal').classList.remove('hidden');
}