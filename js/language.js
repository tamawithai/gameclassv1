function setLanguage(lang) {
    if (lang !== 'id' && lang !== 'en') {
        console.error("Bahasa tidak didukung:", lang);
        return;
    }

    currentLanguage = lang;
    localStorage.setItem('gameclass-language', lang); // Simpan pilihan bahasa

    // Perbarui tampilan tombol aktif
    const btnId = document.getElementById('lang-btn-id');
    const btnEn = document.getElementById('lang-btn-en');

    // Hapus kelas aktif dari kedua tombol terlebih dahulu
    btnId.classList.remove('lang-btn-active');
    btnEn.classList.remove('lang-btn-active');

    // Tambahkan kelas aktif ke tombol yang benar
    if (lang === 'id') {
        btnId.classList.add('lang-btn-active');
    } else {
        btnEn.classList.add('lang-btn-active');
    }

    // Jalankan logika terjemahan seperti sebelumnya
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            el.innerHTML = translations[currentLanguage][key];
        }
    });

    // Perbarui placeholder
    updatePlaceholders();
}