const CACHE_NAME = 'shift-app-v2';
const urlsToCache = [
  '.',
  '.index.html',
  '.icon.png',
  '.manifest.json'
];

 安裝時，把檔案存入快取
self.addEventListener('install', event = {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache = {
        return cache.addAll(urlsToCache);
      })
  );
});

 讀取檔案時，先找快取，沒有再透過網路抓
self.addEventListener('fetch', event = {
  event.respondWith(
    caches.match(event.request)
      .then(response = {
        if (response) {
          return response;  從快取回傳
        }
        return fetch(event.request);  從網路回傳
      })
  );

});
