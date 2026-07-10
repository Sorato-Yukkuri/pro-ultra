/**
 * 精密デバイス診断 Pro Ultra — Cloudflare Workers
 *
 * 【環境変数】
 *   MAINTENANCE_MODE = "true" / "false"
 *   ALLOW_IPS        = "1.2.3.4,5.6.7.8" (カンマ区切り)
 */

// ── 許可オリジン（このサイト自身からのfetchのみ許可） ────────────
const ALLOWED_ORIGINS = [
  "https://pro-ultra.pages.dev",
];

function corsFor(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

// ── 簡易レート制限（Cache APIを間借りしたIP単位のスロットリング） ──
// 認証前に叩けるエンドポイント（OTP送信・ログイン通知メール等）の
// メール爆撃/コスト濫用を防ぐための最低限のガード。
async function rateLimit(request, key, { limit = 5, windowSec = 300 } = {}) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const cacheKey = new Request(`https://ratelimit.internal/${key}/${ip}/${bucket}`);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  const count = cached ? Number(await cached.text()) : 0;
  if (count >= limit) return false;
  await cache.put(
    cacheKey,
    new Response(String(count + 1), {
      headers: { "Cache-Control": `max-age=${windowSec}` },
    })
  );
  return true;
}

// レスポンスに基本的なセキュリティヘッダーを付与する
function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── メール一斉送信 API (/api/send-email) ──────────────────
    if (url.pathname === "/api/send-email" && request.method === "POST") {
      return handleSendEmail(request, env);
    }
    // ── 2段階認証コード送信 API (/api/send-otp) ────────────────
    if (url.pathname === "/api/send-otp" && request.method === "POST") {
      return handleSendOtp(request, env);
    }
    // ── 新しいデバイス/場所からのログイン通知 API (/api/send-login-alert) ──
    if (url.pathname === "/api/send-login-alert" && request.method === "POST") {
      return handleSendLoginAlert(request, env);
    }
    // ── ログイン元の国情報取得 API (/api/geo) ────────────────────
    if (url.pathname === "/api/geo" && request.method === "GET") {
      return handleGeo(request);
    }
    // ── SMS認証(Twilio Verify)コード送信 API (/api/sms/send) ──────
    if (url.pathname === "/api/sms/send" && request.method === "POST") {
      return handleSmsSend(request, env);
    }
    // ── SMS認証(Twilio Verify)コード確認 API (/api/sms/verify) ────
    if (url.pathname === "/api/sms/verify" && request.method === "POST") {
      return handleSmsVerify(request, env);
    }
    // ── LINE公式アカウント 一斉配信 API (/api/send-line) ────────────
    if (url.pathname === "/api/send-line" && request.method === "POST") {
      return handleSendLine(request, env);
    }
    // ── LINE公式アカウント 統計情報取得 API (/api/line-stats) ────────
    if (url.pathname === "/api/line-stats" && request.method === "POST") {
      return handleLineStats(request, env);
    }
    // ─────────────────────────────────────────────────────────
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

    const assetResponse = await env.ASSETS.fetch(request);
    return withSecurityHeaders(assetResponse);
  },
};

// Firebase IDトークンを検証し、管理者(ADMIN_UID)本人であることを確認する。
// クライアントが送ってくる自己申告のUID文字列を信用してはいけない
// （index.html/script.jsにADMIN_UIDがハードコードされており誰でも読めるため、
//   これを信用するとなりすましで管理者APIが叩けてしまう）。
async function requireAdmin(idToken, env) {
  const uid = await verifyFirebaseIdToken(idToken, env);
  if (uid !== env.ADMIN_UID) {
    throw new Error("Unauthorized");
  }
  return uid;
}

// ── メール一斉送信ハンドラ ─────────────────────────────────────
async function handleSendEmail(request, env) {
  const corsHeaders = corsFor(request);

  try {
    const { idToken, subject, html, emails } = await request.json();

    // 管理者チェック（IDトークンを検証し、実際にADMIN_UID本人か確認する）
    try {
      await requireAdmin(idToken, env);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    if (!subject || !html || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: "subject / html / emails が必要です" }), { status: 400, headers: corsHeaders });
    }

    const BREVO_API_KEY = env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY が未設定です" }), { status: 500, headers: corsHeaders });
    }

    let sent = 0, failed = 0;

    for (const email of emails) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: env.EMAIL_SENDER_NAME ?? "ProUltra",
            email: env.EMAIL_FROM ?? "noreply@smtp-brevo.com",
          },
          to: [{ email }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("[Brevo] error:", err);
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: emails.length }), { status: 200, headers: corsHeaders });

  } catch (e) {
    console.error("[send-email] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
}

// ── LINE公式アカウント 一斉配信ハンドラ ─────────────────────────
async function handleSendLine(request, env) {
  const corsHeaders = corsFor(request);

  try {
    const { idToken, text, imageUrl, videoUrl, videoPreviewUrl } = await request.json();

    // 管理者チェック（IDトークンを検証し、実際にADMIN_UID本人か確認する）
    try {
      await requireAdmin(idToken, env);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    const hasText = text && typeof text === "string" && text.trim();
    const hasImage = imageUrl && typeof imageUrl === "string" && imageUrl.trim();
    const hasVideo = videoUrl && typeof videoUrl === "string" && videoUrl.trim();

    if (!hasText && !hasImage && !hasVideo) {
      return new Response(JSON.stringify({ error: "text か imageUrl か videoUrl のいずれかが必要です" }), { status: 400, headers: corsHeaders });
    }

    if (hasVideo && (!videoPreviewUrl || typeof videoPreviewUrl !== "string" || !videoPreviewUrl.trim())) {
      return new Response(JSON.stringify({ error: "動画を送る場合は videoPreviewUrl（サムネイル画像URL）も必要です" }), { status: 400, headers: corsHeaders });
    }

    const urlPattern = /^https:\/\/.+/i;
    if (hasImage && !urlPattern.test(imageUrl.trim())) {
      return new Response(JSON.stringify({ error: "imageUrl は https で始まるURLである必要があります" }), { status: 400, headers: corsHeaders });
    }
    if (hasVideo && (!urlPattern.test(videoUrl.trim()) || !urlPattern.test(videoPreviewUrl.trim()))) {
      return new Response(JSON.stringify({ error: "videoUrl / videoPreviewUrl は https で始まるURLである必要があります" }), { status: 400, headers: corsHeaders });
    }

    const LINE_TOKEN = env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!LINE_TOKEN) {
      return new Response(JSON.stringify({ error: "LINE_CHANNEL_ACCESS_TOKEN が未設定です" }), { status: 500, headers: corsHeaders });
    }

    // LINE Messaging APIの1メッセージは最大5件まで送信可能。テキスト→画像→動画の順で組み立てる
    const messages = [];

    if (hasText) {
      // LINE Messaging APIの1メッセージは5000文字まで。念のため分割はせず、超過分は切り詰める
      const safeText = text.length > 5000 ? text.slice(0, 5000) : text;
      messages.push({ type: "text", text: safeText });
    }

    if (hasImage) {
      const cleanUrl = imageUrl.trim();
      messages.push({
        type: "image",
        originalContentUrl: cleanUrl,
        previewImageUrl: cleanUrl,
      });
    }

    if (hasVideo) {
      messages.push({
        type: "video",
        originalContentUrl: videoUrl.trim(),
        previewImageUrl: videoPreviewUrl.trim(),
      });
    }

    if (messages.length > 5) {
      return new Response(JSON.stringify({ error: "1回の配信で送れるメッセージは最大5件です" }), { status: 400, headers: corsHeaders });
    }

    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("[LINE broadcast] error:", err);
      return new Response(JSON.stringify({ error: err.message || `LINE API error (${res.status})`, details: err }), { status: 502, headers: corsHeaders });
    }

  } catch (e) {
    console.error("[send-line] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
}

// ── LINE公式アカウント 統計情報取得ハンドラ ─────────────────────
async function handleLineStats(request, env) {
  const corsHeaders = corsFor(request);

  try {
    const { idToken } = await request.json();

    try {
      await requireAdmin(idToken, env);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    const LINE_TOKEN = env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!LINE_TOKEN) {
      return new Response(JSON.stringify({ error: "LINE_CHANNEL_ACCESS_TOKEN が未設定です" }), { status: 500, headers: corsHeaders });
    }

    // LINEの友だち数統計は前日分までしか確定していないため、直近数日分を新しい順に試す
    const authHeaders = { "Authorization": `Bearer ${LINE_TOKEN}` };
    let followerData = null;
    for (let i = 1; i <= 5 && !followerData; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
      const res = await fetch(`https://api.line.me/v2/bot/insight/followers?date=${dateStr}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ready") {
          followerData = { ...data, date: dateStr };
        }
      }
    }

    // クォータ(当月メッセージ送信可能数)も合わせて取得
    let quota = null;
    try {
      const [quotaRes, consumptionRes] = await Promise.all([
        fetch("https://api.line.me/v2/bot/message/quota", { headers: authHeaders }),
        fetch("https://api.line.me/v2/bot/message/quota/consumption", { headers: authHeaders }),
      ]);
      const quotaJson = quotaRes.ok ? await quotaRes.json() : null;
      const consumptionJson = consumptionRes.ok ? await consumptionRes.json() : null;
      if (quotaJson) {
        quota = {
          type: quotaJson.type,
          value: quotaJson.value ?? null,
          totalUsage: consumptionJson ? consumptionJson.totalUsage : null,
        };
      }
    } catch (e) {
      console.warn("[LINE quota] error:", e);
    }

    if (!followerData) {
      return new Response(JSON.stringify({ ok: true, followers: null, quota, note: "友だち数データはまだ準備中です（反映まで1〜2日かかることがあります）" }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      ok: true,
      followers: {
        date: followerData.date,
        followers: followerData.followers,
        targetedReachers: followerData.targetedReachers,
        blocks: followerData.blocks,
      },
      quota,
    }), { status: 200, headers: corsHeaders });

  } catch (e) {
    console.error("[line-stats] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
}


async function handleSendOtp(request, env) {
  const corsHeaders = corsFor(request);

  try {
    // ログイン前(未認証)でも呼べるエンドポイントなので、メール爆撃対策として
    // IPベースの簡易レート制限をかける（5分間に5回まで）。
    const ok = await rateLimit(request, "send-otp", { limit: 5, windowSec: 300 });
    if (!ok) {
      return new Response(JSON.stringify({ error: "リクエストが多すぎます。しばらくしてから再試行してください" }), { status: 429, headers: corsHeaders });
    }

    const { email, code, subject } = await request.json();

    if (!email || !code || !/^[0-9]{4,8}$/.test(String(code))) {
      return new Response(JSON.stringify({ error: "email / code が不正です" }), { status: 400, headers: corsHeaders });
    }

    const BREVO_API_KEY = env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY が未設定です" }), { status: 500, headers: corsHeaders });
    }

    const html = `
      <div style="font-family:sans-serif;padding:24px;">
        <h2 style="margin:0 0 16px;">ログイン確認コード</h2>
        <p style="color:#444;font-size:14px;">以下のコードを入力してログインを完了してください。（10分間有効）</p>
        <div style="font-size:32px;font-weight:800;letter-spacing:6px;margin:20px 0;color:#111;">${code}</div>
        <p style="color:#888;font-size:12px;">心当たりがない場合はこのメールを無視してください。</p>
      </div>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: env.EMAIL_SENDER_NAME ?? "ProUltra",
          email: env.EMAIL_FROM ?? "noreply@smtp-brevo.com",
        },
        to: [{ email }],
        subject: subject || "【ProUltra】ログイン確認コード",
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Brevo OTP] error:", err);
      return new Response(JSON.stringify({ error: "送信に失敗しました" }), { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ sent: true }), { status: 200, headers: corsHeaders });

  } catch (e) {
    console.error("[send-otp] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
}

// ── 新しいデバイス/場所からのログイン通知ハンドラ ─────────────────
async function handleSendLoginAlert(request, env) {
  const corsHeaders = corsFor(request);

  try {
    const ok = await rateLimit(request, "send-login-alert", { limit: 5, windowSec: 300 });
    if (!ok) {
      return new Response(JSON.stringify({ error: "リクエストが多すぎます。しばらくしてから再試行してください" }), { status: 429, headers: corsHeaders });
    }

    const { email, device, country, region, city, time, reason } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "email が不正です" }), { status: 400, headers: corsHeaders });
    }

    const BREVO_API_KEY = env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY が未設定です" }), { status: 500, headers: corsHeaders });
    }

    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const safe = (s) => (s == null ? "不明" : escapeHtml(String(s).slice(0, 200)));
    const reasonLabel =
      reason === "new_device" ? "新しいデバイス" :
      reason === "new_location" ? "いつもと異なる場所" :
      "新しいデバイス／場所";
    // 国コード(ISO 3166-1 alpha-2) → 日本語の国名（例: "PS" → "パレスチナ自治区"）
    const countryNameJa = (code) => {
      if (!code) return null;
      try {
        return new Intl.DisplayNames(["ja"], { type: "region" }).of(String(code).toUpperCase()) || code;
      } catch (e) {
        return code;
      }
    };
    const locationStr = [city, region, countryNameJa(country)].filter(Boolean).join(", ") || "不明";

    const html = `
      <div style="font-family:sans-serif;padding:24px;">
        <h2 style="margin:0 0 16px;">⚠️ ${reasonLabel}からのログインを検知しました</h2>
        <p style="color:#444;font-size:14px;">あなたのアカウントに、以下の情報でログインがありました。</p>
        <table style="margin:18px 0;font-size:14px;color:#222;border-collapse:collapse;">
          <tr><td style="padding:4px 12px 4px 0;color:#888;">日時</td><td>${safe(time)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">デバイス</td><td>${safe(device)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">場所（推定）</td><td>${safe(locationStr)}</td></tr>
        </table>
        <p style="color:#444;font-size:14px;">心当たりがある場合はこのメールを無視してください。</p>
        <p style="color:#ff3b30;font-size:14px;font-weight:700;">心当たりがない場合は、すみやかにパスワードを変更し、アプリ内の「ログイン中の端末」からこのセッションを強制ログアウトしてください。</p>
      </div>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: env.EMAIL_SENDER_NAME ?? "ProUltra",
          email: env.EMAIL_FROM ?? "noreply@smtp-brevo.com",
        },
        to: [{ email }],
        subject: `【ProUltra】${reasonLabel}からのログインを検知しました`,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Brevo login-alert] error:", err);
      return new Response(JSON.stringify({ error: "送信に失敗しました" }), { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ sent: true }), { status: 200, headers: corsHeaders });

  } catch (e) {
    console.error("[send-login-alert] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
}

// ── SMS認証: 共通ユーティリティ ──────────────────────────────────
function b64urlToUint8Array(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function uint8ArrayToB64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Firebase IDトークン(JWT)を検証してuidを返す。
// Googleの公開鍵(JWK)で署名検証し、iss/aud/exp をチェックする。
let _googleJwkCache = null;
let _googleJwkCacheAt = 0;
async function _getGoogleSecureTokenJwks() {
  const now = Date.now();
  if (_googleJwkCache && now - _googleJwkCacheAt < 60 * 60 * 1000) return _googleJwkCache;
  const res = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  if (!res.ok) throw new Error("Googleの公開鍵取得に失敗しました");
  const jwks = await res.json();
  _googleJwkCache = jwks;
  _googleJwkCacheAt = now;
  return jwks;
}

async function verifyFirebaseIdToken(idToken, env) {
  if (!idToken || typeof idToken !== "string" || idToken.split(".").length !== 3) {
    throw new Error("IDトークンが不正です");
  }
  const [headerB64, payloadB64, sigB64] = idToken.split(".");
  const header = JSON.parse(new TextDecoder().decode(b64urlToUint8Array(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToUint8Array(payloadB64)));

  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID が未設定です");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("issが不正です");
  if (payload.aud !== projectId) throw new Error("audが不正です");
  if (!payload.sub) throw new Error("subがありません");
  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSec) throw new Error("トークンの有効期限が切れています");

  const jwks = await _getGoogleSecureTokenJwks();
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("対応する公開鍵が見つかりません");

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = b64urlToUint8Array(sigB64);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, sig, data);
  if (!ok) throw new Error("署名検証に失敗しました");

  return payload.sub; // uid
}

// サービスアカウントJSONからGoogleのアクセストークンを取得(Admin API呼び出し用)
let _googleAccessTokenCache = null;
let _googleAccessTokenExpiresAt = 0;
async function getGoogleAccessToken(env) {
  const now = Date.now();
  if (_googleAccessTokenCache && now < _googleAccessTokenExpiresAt - 60_000) {
    return _googleAccessTokenCache;
  }
  const saJsonStr = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJsonStr) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON が未設定です");
  const sa = JSON.parse(saJsonStr);

  const header = { alg: "RS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/identitytoolkit",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };
  const enc = (obj) => uint8ArrayToB64url(new TextEncoder().encode(JSON.stringify(obj)));
  const unsigned = `${enc(header)}.${enc(claim)}`;

  // PEM形式の秘密鍵をPKCS8バイナリに変換してインポート
  const pem = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const pkcs8 = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${uint8ArrayToB64url(new Uint8Array(sigBuf))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error("Googleアクセストークン取得に失敗しました: " + err);
  }
  const tokenJson = await tokenRes.json();
  _googleAccessTokenCache = tokenJson.access_token;
  _googleAccessTokenExpiresAt = now + tokenJson.expires_in * 1000;
  return _googleAccessTokenCache;
}

// 指定uidのFirebaseユーザーに電話番号を紐付ける
async function setFirebasePhoneNumber(uid, phoneNumber, env) {
  const accessToken = await getGoogleAccessToken(env);
  const res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ localId: uid, phoneNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error("電話番号の紐付けに失敗しました: " + JSON.stringify(err));
  }
  return res.json();
}

// 電話番号をE.164形式に正規化(日本の携帯番号想定: 0901234567 → +819012345678)
function normalizePhoneJp(input) {
  const digits = String(input || "").replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return "+81" + digits.slice(1);
  return "+" + digits;
}

// ── SMS認証コード送信ハンドラ (Twilio Verify) ─────────────────────
async function handleSmsSend(request, env) {
  const CORS_JSON = corsFor(request);
  try {
    const ok = await rateLimit(request, "sms-send", { limit: 5, windowSec: 300 });
    if (!ok) {
      return new Response(JSON.stringify({ error: "リクエストが多すぎます。しばらくしてから再試行してください" }), { status: 429, headers: CORS_JSON });
    }

    const { idToken, phone, channel } = await request.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "phone が必要です" }), { status: 400, headers: CORS_JSON });
    }
    const verifyChannel = channel === "call" ? "call" : "sms";
    await verifyFirebaseIdToken(idToken, env); // ログイン中のユーザーのみ許可

    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = env.TWILIO_VERIFY_SERVICE_SID;
    if (!accountSid || !authToken || !verifyServiceSid) {
      return new Response(JSON.stringify({ error: "Twilioの設定が未完了です" }), { status: 500, headers: CORS_JSON });
    }

    const e164 = normalizePhoneJp(phone);
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164, Channel: verifyChannel }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("[sms/send] Twilio error:", data);
      return new Response(JSON.stringify({ error: data.message || "送信に失敗しました" }), { status: 502, headers: CORS_JSON });
    }
    return new Response(JSON.stringify({ sent: true, status: data.status, channel: verifyChannel }), { status: 200, headers: CORS_JSON });
  } catch (e) {
    console.error("[sms/send] error:", e);
    return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 400, headers: CORS_JSON });
  }
}

// ── SMS認証コード確認ハンドラ (Twilio Verify) ─────────────────────
async function handleSmsVerify(request, env) {
  const CORS_JSON = corsFor(request);
  try {
    const { idToken, phone, code } = await request.json();
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "phone / code が必要です" }), { status: 400, headers: CORS_JSON });
    }
    const uid = await verifyFirebaseIdToken(idToken, env);

    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = env.TWILIO_VERIFY_SERVICE_SID;
    if (!accountSid || !authToken || !verifyServiceSid) {
      return new Response(JSON.stringify({ error: "Twilioの設定が未完了です" }), { status: 500, headers: CORS_JSON });
    }

    const e164 = normalizePhoneJp(phone);
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164, Code: String(code) }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("[sms/verify] Twilio error:", data);
      return new Response(JSON.stringify({ error: data.message || "確認に失敗しました" }), { status: 502, headers: CORS_JSON });
    }
    if (data.status !== "approved") {
      return new Response(JSON.stringify({ verified: false, status: data.status }), { status: 200, headers: CORS_JSON });
    }

    // 検証OK → Firebaseユーザーに電話番号を紐付け
    await setFirebasePhoneNumber(uid, e164, env);

    return new Response(JSON.stringify({ verified: true, phone: e164 }), { status: 200, headers: CORS_JSON });
  } catch (e) {
    console.error("[sms/verify] error:", e);
    return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 400, headers: CORS_JSON });
  }
}

// ── 国情報取得ハンドラ（request.cf を利用） ──────────────────────
function handleGeo(request) {
  // request.cf は Cloudflare のエッジが自動付与するメタデータ。
  // ローカル開発(wrangler dev --local)等では undefined になりうるためフォールバックする。
  const corsOrigin = corsFor(request)["Access-Control-Allow-Origin"];
  const cf = request.cf || {};
  const body = {
    country: cf.country || null,         // ISO 3166-1 alpha-2 (例: "JP")
    region: cf.region || null,           // 都道府県/州名
    city: cf.city || null,
    timezone: cf.timezone || null,
    colo: cf.colo || null,               // 接続先Cloudflareデータセンターコード
    asOrganization: cf.asOrganization || null,
    ip: request.headers.get("CF-Connecting-IP") || null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": corsOrigin,
      "Vary": "Origin",
    },
  });
}


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
