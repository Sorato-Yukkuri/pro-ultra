const CACHE_NAME = 'pu-v4';
const CACHE_FILES = ['/', '/index.html', '/script.js', '/style.css', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => c.addAll(CACHE_FILES)).then(() => self.skipWaiting())
    );
});
self.addEventListener('activate', e => e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
        .then(() => clients.claim())
));

self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    if (url.origin !== self.location.origin) return;
    if (req.method !== 'GET' && req.method !== 'HEAD') return;

    e.respondWith(
        fetch(req).then(res => {
            // キャッシュ対象ファイルはキャッシュに保存
            if (CACHE_FILES.some(f => url.pathname === f || url.pathname === '/')) {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, clone));
            }
            return res;
        }).catch(async err => {
            console.warn('[SW] fetch failed:', req.url, err);
            // キャッシュがあればキャッシュから返す
            const cached = await caches.match(req);
            if (cached) return cached;
            // ナビゲーションの場合はindex.htmlへフォールバック（オフラインでもサイトを表示）
            if (req.mode === 'navigate') {
                const indexCached = await caches.match('/index.html');
                if (indexCached) return indexCached;
                // キャッシュもない場合のみオフライン画面
                return new Response(
                    '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>オフライン</title>'
                    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
                    + '<style>body{margin:0;display:flex;align-items:center;justify-content:center;'
                    + 'min-height:100vh;background:#0f172a;color:#94a3b8;font-family:sans-serif;text-align:center}'
                    + 'h1{font-size:1.5rem;margin-bottom:.5rem}p{font-size:.9rem}</style></head>'
                    + '<body><div><h1>オフライン</h1><p>ネットワーク接続を確認してください。</p></div></body></html>',
                    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                );
            }
            return new Response('', { status: 503 });
        })
    );
});

self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', e => {
    let d = { title: '精密デバイス診断 Pro Ultra', body: 'お知らせがあります', url: '/' };
    if (e.data) { try { d = { ...d, ...e.data.json() }; } catch(_) { d.body = e.data.text(); } }
    const opts = {
        body: d.body, icon: '/icon-192.png', badge: '/icon-192.png',
        data: { url: d.url }, vibrate: [200, 100, 200]
    };
    if (d.image) opts.image = d.image;
    e.waitUntil(self.registration.showNotification(d.title, opts));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = (e.notification.data && e.notification.data.url) || '/';
    e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const c of list) {
            if (c.url.includes(self.location.origin) && 'focus' in c) {
                if ('navigate' in c) c.navigate(url);
                return c.focus();
            }
        }
        return clients.openWindow(url);
    }));
});
