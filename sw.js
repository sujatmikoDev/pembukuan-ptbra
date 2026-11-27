/**
 * Service worker minimal — hanya supaya browser menganggap aplikasi ini "bisa diinstal".
 * SENGAJA tidak menyimpan cache data/API apa pun, supaya angka keuangan selalu yang terbaru
 * dari server, bukan dari penyimpanan lama di perangkat.
 */
const CACHE_NAME = 'pbk-shell-v1';
const SHELL_FILE = './index.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(SHELL_FILE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Hanya ikut campur untuk file aplikasi sendiri (GET, satu origin). Panggilan ke
  // Google Apps Script (data, login, transaksi, dst) dibiarkan lewat apa adanya,
  // langsung ke jaringan, tidak pernah disimpan sebagai cache.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r || caches.match(SHELL_FILE)))
  );
});
