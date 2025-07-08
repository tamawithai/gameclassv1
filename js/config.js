// === KONFIGURASI & VARIABEL GLOBAL ===

// Diperbaiki: URL Suara sekarang di-hardcode
let soundSettings = { 
    point: 'https://raw.githubusercontent.com/tamawithai/gameclassv1/refs/heads/dev/assets/sounds/ding.mp3', 
    badge: 'https://raw.githubusercontent.com/tamawithai/gameclassv1/refs/heads/dev/assets/sounds/confetti.mp3' 
};

// Variabel baru untuk menampung objek audio roda
let wheelSound = null;

// Tipe Poin (bisa diubah di modal pengaturan)
let TipePoin = [
    { key: 'tanya',   labelKey: 'ask-question', nilai: 5,  warna: 'bg-sky-500 hover:bg-sky-600' },
    { key: 'jawab',   labelKey: 'answer-question', nilai: 10, warna: 'bg-emerald-500 hover:bg-emerald-600' },
    { key: 'sharing', labelKey: 'sharing-exp', nilai: 15, warna: 'bg-amber-500 hover:bg-amber-600' },
    { key: 'praktik', labelKey: 'volunteer', nilai: 20, warna: 'bg-indigo-500 hover:bg-indigo-600' }
];

// Sistem Badge (statis)
const SistemBadge = {
    tanya: { ikon: '🧠', tingkat: { 5: 'Pemikir Kritis', 10: 'Pakar Penanya', 15: 'Inkuisitor Ulung' } },
    jawab: { ikon: '💡', tingkat: { 5: 'Sang Pencerah', 10: 'Sumber Pengetahuan', 15: 'Pustakawan Berjalan' } },
    sharing: { ikon: '❤️', tingkat: { 5: 'Pembagi Cerita', 10: 'Inspirator Sesi', 15: 'Mentor Sejawat' } },
    praktik: { ikon: '🚀', tingkat: { 5: 'Sang Pemberani', 10: 'Pelopor Aksi', 15: 'Ahli Panggung' } }
};

// Data utama aplikasi
let peserta = [];
let pesertaTerpilihId = null;

// Konfigurasi Game Grup
const ICONS = { lion: { svg: '🦁', name: 'Singa' }, tiger: { svg: '🐯', name: 'Harimau' }, bear: { svg: '🐻', name: 'Beruang' }, panda: { svg: '🐼', name: 'Panda' }, fox: { svg: '🦊', name: 'Rubah' }, koala: { svg: '🐨', name: 'Koala' }, dog: { svg: '🐶', name: 'Anjing' }, cat: { svg: '🐱', name: 'Kucing' } };
const TEAM_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
const ADVANCE_STEP = 10;
let teams = [];

// Konfigurasi Roda Keberuntungan
const wheelColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#22C55E', '#D946EF', '#0EA5E9'];
let startAngle = 0;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;

// Konfigurasi Timer
let timerInterval = null;
let timeRemaining = 0;
let totalTime = 0;

function playSound(url) {
    if (url) {
        try {
            const audio = new Audio(url);
            audio.play();
        } catch(e) {
            console.error("Gagal memutar audio:", e);
        }
    }
}