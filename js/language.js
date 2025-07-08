// === LOGIKA PENGUBAH BAHASA ===

let currentLanguage = 'id'; // Bahasa default

function setLanguage(lang) {
    if (lang !== 'id' && lang !== 'en') {
        console.error("Bahasa tidak didukung:", lang);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('gameclass-language', lang); // Simpan pilihan bahasa

    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            el.innerHTML = translations[currentLanguage][key];
        }
    });

    // Perbarui placeholder secara manual karena tidak terpengaruh innerHTML
    updatePlaceholders();
}

function updatePlaceholders() {
    const teamNamePlaceholder = document.querySelector('input[placeholder^="Nama Tim"], input[placeholder^="Team Name"]');
    if (teamNamePlaceholder) {
        teamNamePlaceholder.placeholder = translations[currentLanguage]['team-name-placeholder'] || 'Team Name';
    }
}


function initializeLanguage() {
    const savedLang = localStorage.getItem('gameclass-language');
    const lang = (savedLang === 'en' || savedLang === 'id') ? savedLang : 'id';
    setLanguage(lang);
}