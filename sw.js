// 緩存名稱 (使用 Network First 策略，名稱無需頻繁更改)
const CACHE_NAME = 'oil-shift-app-cache-v1';

// 1. 安裝階段：強制立即接管，不需等待舊版 SW 關閉
self.addEventListener('install', event => {
    self.skipWaiting();
});

// 2. 啟動階段：立即取得所有頁面的控制權，並清除其他無用的舊快取
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即接管所有開啟的網頁
    );
});

// 3. 攔截請求階段 (★ 核心邏輯：Network First 網路優先策略)
self.addEventListener('fetch', event => {
    // 略過非 GET 請求 (如 API POST 傳輸等)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        // 先嘗試向網路發送請求
        fetch(event.request)
            .then(response => {
                // 【有網路】成功取得 GitHub 最新檔案時，偷偷更新快取，然後把最新畫面交給使用者
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // 【沒網路 (離線狀態)】抓取失敗時，自動退回到快取中讀取上一次存下來的備份畫面
                return caches.match(event.request);
            })
    );
});
