self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// fetchハンドラ：安全にネットワークをパススルー
// - fetchできないスキーム（chrome-extension://, blob:, data: 等）は即スルー
// - POST等 bodyが消費済みになりうるリクエストも即スルー
// - cross-originも素通し（SW介入させない）
// - エラー時はHTMLで503を返しブラウザが真っ白にならないようにする
self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);

    // (1) fetchできないスキームはSWが介入しない
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // (2) 自オリジン以外（cross-origin）はSWが介入しない
    if (url.origin !== self.location.origin) return;

    // (3) POST / PUT / PATCH など body を持つメソッドはキャッシュ不要・再フェッチ危険なのでスルー
    if (req.method !== 'GET' && req.method !== 'HEAD') return;

    // (4) 上記を通過したリクエストのみ respondWith に渡す
    e.respondWith(
        fetch(req).catch(err => {
            console.warn('[SW] fetch failed:', req.url, err);
            // ナビゲーション（ページ遷移）の場合は index.html へフォールバック
            if (req.mode === 'navigate') {
                return caches.match('./index.html').then(cached => {
                    if (cached) return cached;
                    return new Response(
                        '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>オフライン</title>'
                        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
                        + '<style>body{margin:0;display:flex;align-items:center;justify-content:center;'
                        + 'min-height:100vh;background:#0f172a;color:#94a3b8;font-family:sans-serif;text-align:center}'
                        + 'h1{font-size:1.5rem;margin-bottom:.5rem}p{font-size:.9rem}</style></head>'
                        + '<body><div><h1>オフライン</h1><p>ネットワーク接続を確認してください。</p></div></body></html>',
                        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                });
            }
            // その他（CSS / JS / 画像 等）はネットワークエラーをそのまま返す
            return new Response('', { status: 503 });
        })
    );
});

// messageハンドラ：外部からのpostMessageに応答
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', e => {
    let d = { title: '精密デバイス診断 Pro Ultra', body: 'お知らせがあります', url: '/' };
    if (e.data) { try { d = { ...d, ...e.data.json() }; } catch(_) { d.body = e.data.text(); } }
    e.waitUntil(self.registration.showNotification(d.title, {
        body: d.body, icon: '/icon-192.png', badge: '/icon-192.png',
        data: { url: d.url }, vibrate: [200, 100, 200]
    }));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = (e.notification.data && e.notification.data.url) || '/';
    e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const c of list) { if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus(); }
        return clients.openWindow(url);
    }));
});