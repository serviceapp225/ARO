// Service Worker для обработки offline состояния
const CACHE_NAME = 'narxi-tu-offline-v1';
const OFFLINE_URL = '/offline.html';

// Устанавливаем Service Worker и кэшируем offline страницу
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

// Активируем Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехватываем сетевые запросы
self.addEventListener('fetch', event => {
  // Игнорируем запросы к Chrome extensions и не-HTTP протоколам
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Для навигационных запросов (загрузка страниц)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Если сеть недоступна, показываем offline страницу
          return caches.match(OFFLINE_URL);
        })
    );
  }
});