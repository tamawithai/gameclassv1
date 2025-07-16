// auth.js
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Variabel global untuk menyimpan user sekarang
let currentUser = null;

// Bahasa dan terjemahan sederhana (bisa disesuaikan dengan file translation Anda)
const currentLanguage = 'id';
const translations = {
    id: {
        login: "Login",
        logout: "Logout"
    },
    en: {
        login: "Login",
        logout: "Logout"
    }
};

// Fungsi update UI berdasarkan status user
export function updateAuthUI(user) {
    const authMenuText = document.getElementById('menu-auth-text');
    console.log("updateAuthUI dipanggil, user:", user);
    console.log("Elemen menu-auth-text:", authMenuText);

    if (!authMenuText) {
        console.warn("Elemen #menu-auth-text tidak ditemukan.");
        return;
    }

    if (user) {
        currentUser = user;
        authMenuText.textContent = translations[currentLanguage]['logout'] || "Logout";
        console.log("User sudah login, teks jadi Logout");
    } else {
        currentUser = null;
        authMenuText.textContent = translations[currentLanguage]['login'] || "Login";
        console.log("User logout, teks jadi Login");
    }
}

// Fungsi untuk logout
export async function handleLogout() {
    try {
        await signOut(window.auth);
        console.log("Logout berhasil.");
        // Tambahkan redirect langsung setelah logout sukses
        window.location.href = 'landing_page.html';
    } catch (error) {
        console.error("Logout gagal:", error);
        alert("Gagal logout, silakan coba lagi.");
    }
}
