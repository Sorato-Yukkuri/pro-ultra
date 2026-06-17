/**
 * 精密デバイス診断 Pro Ultra — Cloudflare Workers
 *
 * 【環境変数】
 *   MAINTENANCE_MODE = "true" / "false"
 *   ALLOW_IPS        = "1.2.3.4,5.6.7.8" (カンマ区切り)
 */

export default {
  async fetch(request, env) {
    // ── メンテナンスモード ────────────────────────────────────
    const isMaintenance = (env.MAINTENANCE_MODE ?? "false").trim().toLowerCase() === "true";
    if (isMaintenance) {
      const allowIps = (env.ALLOW_IPS ?? "").split(",").map(s => s.trim()).filter(Boolean);
      const clientIp = request.headers.get("CF-Connecting-IP") ?? "";
      if (allowIps.length === 0 || !allowIps.includes(clientIp)) {
        return new Response(MAINTENANCE_HTML, {
          status: 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Retry-After": "3600",
            "Cache-Control": "no-store",
          },
        });
      }
    }
    // ─────────────────────────────────────────────────────────

    return env.ASSETS.fetch(request);
  },
};

// ── メンテナンス HTML ─────────────────────────────────────────
const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メンテナンス中 — 精密デバイス診断 Pro Ultra</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100svh; display: flex; align-items: center; justify-content: center;
      background: #0f172a; color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px;
    }
    .card { text-align: center; max-width: 420px; width: 100%; }
    .icon { font-size: 3rem; margin-bottom: 20px; }
    h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; color: #fff; }
    p { font-size: 0.95rem; line-height: 1.75; color: #94a3b8; }
    .badge {
      display: inline-block; margin-top: 28px; padding: 6px 16px; border-radius: 20px;
      background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35);
      color: #a5b4fc; font-size: 0.8rem; font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔧</div>
    <h1>メンテナンス中</h1>
    <p>現在、システムのメンテナンスを行っています。<br>ご不便をおかけして申し訳ありません。<br>しばらく経ってから再度アクセスしてください。</p>
    <span class="badge">503 Service Unavailable</span>
  </div>
</body>
</html>`;
