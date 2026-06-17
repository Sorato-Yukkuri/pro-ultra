let capturedDataUrl = null;
const PERMANENT_BAN_LIST = { ーーーー: "理由：ー" };
async function sendIncorrectReport(e, t, n) {
  if (!n || !n.includes("@"))
    return void alert("登録したメールアドレスを入力してください。");
  if (!t || "" === t.trim()) return void alert("内容を入力してください。");
  const o = document.getElementById("ban-appeal-btn");
  o && ((o.disabled = !0), (o.innerText = "Sending..."));
  const i = new FormData();
  (i.append("Email", n), i.append("Type", e), i.append("Message", t));
  try {
    if (
      !(
        await fetch("https://formspree.io/f/mojkzbvz", {
          method: "POST",
          body: i,
          headers: { Accept: "application/json" },
        })
      ).ok
    )
      throw new Error();
    (alert("送信が完了しました。"), o && (o.innerText = "Sent"));
  } catch (e) {
    (alert(
      "送信に失敗しました。異議などせずにこのサービスから**離れてください**。",
    ),
      o && ((o.disabled = !1), (o.innerText = "Retry")));
  }
}
const TURNSTILE_SITE_KEY = "0x4AAAAAADkLVTsJcuv90Zh0";
function showRecaptchaCheck() {
  if (
    "localhost" === window.location.hostname ||
    "127.0.0.1" === window.location.hostname ||
    "file:" === window.location.protocol
  )
    return;
  // if ("true" === localStorage.getItem("turnstile_verified")) return;
  if (document.getElementById("turnstile-overlay")) return;
  const e = document.createElement("div");
  ((e.id = "turnstile-overlay"),
    (e.style.cssText =
      "\n        position: fixed; top: 0; left: 0; right: 0; bottom: 0;\n        background: rgba(0,0,0,0.92); display: flex; align-items: center;\n        justify-content: center; z-index: 99999;\n    "),
    (e.innerHTML =
      '\n        <div style="background:#1a1a1a;border-radius:20px;padding:40px 24px;text-align:center;color:#fff;width:90%;max-width:340px;box-shadow:0 20px 40px rgba(0,0,0,0.5);">\n            <div style="font-size:1.5rem;margin-bottom:12px;">🔐</div>\n            <h2 style="margin-bottom:20px;font-size:1.1rem;font-weight:700;">セキュリティチェック</h2>\n            <div style="display:flex;justify-content:center;margin-bottom:16px;">\n                <div id="turnstile-widget"></div>\n            </div>\n            <p style="color:#888;font-size:0.8rem;">自動的に検証されます</p>\n        </div>\n    '),
    document.body.appendChild(e));
  const t = document.createElement("script");
  ((t.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"),
    (t.onload = () => {
      turnstile.render("#turnstile-widget", {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: function (t) {
          ((e.style.opacity = "0"),
            (e.style.transition = "opacity 0.4s"),
            setTimeout(() => {
              e.remove();
              localStorage.setItem("turnstile_verified", "true");
              showConsentScreenIfNeeded();
            }, 400));
        },
      });
    }),
    document.head.appendChild(t));
}
async function _handleMfaSignIn(e) {
  const t = document.getElementById("email-login-error");
  (t &&
    (t.textContent =
      "ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。"),
    console.warn(
      "MFA sign-in attempted but not supported in current Firebase plan:",
      e,
    ));
}
function showBanScreen(e) {
  (localStorage.setItem("sys_banned_user", "true"),
    e && "stored" !== e && localStorage.setItem("sys_banned_email", e));
  const t = e && "stored" !== e ? e : localStorage.getItem("sys_banned_email"),
    n = PERMANENT_BAN_LIST[t] || "理由：重大な規約違反が確認されました。",
    o = document.getElementById("ban-reason-text");
  o
    ? (o.textContent = n)
    : document.body &&
      ((document.body.innerHTML = `\n        <div id="ban-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: black; z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: white; font-family: sans-serif; padding: 20px; box-sizing: border-box;">\n            <h1 style="font-size: 3rem; color: red; margin-bottom: 10px; font-weight: bold;">Account Blocked</h1>\n            <p id="ban-reason-text" style="font-size: 1.2rem; margin-bottom: 30px; color: white; opacity: 0.9;">${n}</p>\n\n            <div style="width: 100%; max-width: 450px; text-align: left; margin-top: 10px;">\n                <input type="email" id="ban-appeal-email" placeholder="登録メールアドレス (必須)" \n                       style="width: 100%; padding: 12px; background: transparent; color: white; border: 1px solid #333; margin-bottom: 10px; box-sizing: border-box; font-size: 1rem; outline: none;">\n                <textarea id="ban-appeal-text" placeholder="間違い報告・異議申し立ての内容" \n                          style="width: 100%; height: 100px; background: transparent; color: white; border: 1px solid #333; padding: 12px; margin-bottom: 15px; box-sizing: border-box; resize: none; font-size: 1rem; outline: none;"></textarea>\n                <button id="ban-appeal-btn" \n                        onclick="sendIncorrectReport('BAN_APPEAL', document.getElementById('ban-appeal-text').value, document.getElementById('ban-appeal-email').value)" \n                        style="background: transparent; color: red; border: 1px solid red; padding: 12px; cursor: pointer; font-weight: bold; width: 100%; font-size: 1rem;">\n                    送信\n                </button>\n            </div>\n        </div>\n    `),
      (document.body.style.overflow = "hidden"));
}
if (
  (window.addEventListener("load", function () {
    ("localhost" === window.location.hostname ||
      "127.0.0.1" === window.location.hostname) &&
      localStorage.setItem("turnstile_verified", "true");
  }),
  "true" === localStorage.getItem("sys_banned_user"))
) {
  const e = setInterval(() => {
    if (document.body) {
      const t = localStorage.getItem("sys_banned_email");
      if (t && !PERMANENT_BAN_LIST[t])
        return (
          localStorage.removeItem("sys_banned_user"),
          localStorage.removeItem("sys_banned_email"),
          void clearInterval(e)
        );
      (showBanScreen("stored"), clearInterval(e));
    }
  }, 10);
}
const banObserver = setInterval(() => {
    const e = _fbAuth && void 0 !== _fbAuth ? _fbAuth.currentUser : null;
    e &&
      e.email &&
      PERMANENT_BAN_LIST[e.email] &&
      (showBanScreen(e.email), clearInterval(banObserver));
  }, 100),
  scores = { cpu: 0, gpu: 0, mem: 0, fps: 0 },
  diag = {},
  wait = (e) => new Promise((t) => setTimeout(t, e)),
  setRow = (e, t, n) => {
    const o = document.getElementById("v-" + e);
    o && (o.textContent = t);
    const i = document.getElementById("row-" + e);
    i && (i.className = "spec-row st-" + n);
  },
  st = (e, t) => (e ? "ok" : t ? "warn" : "bad"),
  SETTINGS_KEY = "app_settings_v1",
  DEFAULT_SETTINGS = {
    theme: "dark",
    language: "ja",
    soundOnDone: !0,
    soundPreset: "default",
    soundFileDataUrl: null,
    fontSize: "normal",
    exportFormat: "png",
    speedUnit: "mbps",
    manualDeviceName: "",
    desktopNotify: !0,
    vibration: !0,
    badge: !0,
    quietStart: "22:00",
    quietEnd: "06:40",
    autoCheck: !1,
    clumsiGuard: !0,
    translateGuard: !0,
    customFontSize: 15,
    fontFamily: "system",
    showIpInResult: !1,
  },
  CONSENT_VERSION = "3",
  CONSENT_KEY = "pu_consent_v";
function showConsentScreenIfNeeded() {
  const e = localStorage.getItem(CONSENT_KEY);
  const isVerified = localStorage.getItem("turnstile_verified") === "true";

  if (
    "localhost" === window.location.hostname ||
    "127.0.0.1" === window.location.hostname
  ) {
    return void runBenchmark();
  }

  if ("file:" !== window.location.protocol && !isVerified) {
    localStorage.removeItem("turnstile_verified");
    try {
      showRecaptchaCheck();
    } catch (e) {
      runBenchmark();
    }
    return;
  }
  if (e === CONSENT_VERSION) return void runBenchmark();
  const t = document.createElement("div");
  ((t.id = "consent-overlay"),
    (t.style.cssText =
      "\n        position:fixed;top:0;left:0;right:0;bottom:0;\n        background:rgba(0,0,0,0.97);\n        display:flex;align-items:center;justify-content:center;\n        z-index:999998;padding:20px;box-sizing:border-box;\n    "));
  const n = null !== e && e !== CONSENT_VERSION,
    o = "function" == typeof tui ? tui() : {},
    i = n
      ? o.consentUpdateTitle || "🔔 アップデートのお知らせ"
      : o.consentTitle || "📋 はじめに",
    a = (
      o.consentBody ||
      "このアプリは、デバイスのハードウェア情報をブラウザ内で計測・表示します。取得したデータはお使いのブラウザ内のみで処理され、外部サーバーには送信されません。"
    ).replace(/\n/g, "<br>"),
    r = n
      ? `<div style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:12px 14px;margin-bottom:16px;color:#a78bfa;font-size:0.83rem;line-height:1.7;">${o.consentUpdateBody || "このアップデートにより、利用規約が一部更新されました。診断を開始する前にご確認ください。"}</div>`
      : "",
    s = o.consentBtn || "診断を開始する",
    d = o.consentTermsLink || "利用規約";
  ((t.innerHTML = `\n        <div style="background:#111;border:1px solid #2a2a2a;border-radius:24px;width:100%;max-width:400px;padding:28px 24px;text-align:center;">\n            <div style="font-size:2rem;margin-bottom:12px;">📱</div>\n            <h2 style="color:#fff;font-size:1.15rem;font-weight:900;margin:0 0 10px;">${i}</h2>\n            ${r}\n            <p style="color:#888;font-size:0.85rem;line-height:1.75;margin:0 0 24px;">${a}</p>\n            <button\n                id="consent-btn"\n                onclick="acceptConsent()"\n                style="width:100%;padding:15px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#7c3aed);border:none;color:#fff;font-size:1rem;font-weight:800;cursor:pointer;margin-bottom:14px;letter-spacing:0.02em;">\n                ${s}\n            </button>\n            <button\n                onclick="openTerms()"\n                style="background:none;border:none;color:#555;font-size:0.77rem;cursor:pointer;padding:4px 0;text-decoration:underline;text-underline-offset:3px;">\n                ${d}\n            </button>\n        </div>\n    `),
    document.body.appendChild(t));
}
function acceptConsent() {
  localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
  const e = document.getElementById("consent-overlay");
  if (e) {
    e.style.opacity = "0";
    e.style.transition = "opacity 0.3s";
    setTimeout(() => {
      if (e.parentNode) e.parentNode.removeChild(e);
    }, 300);
  }
  runBenchmark();
  localStorage.removeItem("turnstile_verified");
}
let _settings = { ...DEFAULT_SETTINGS };
function loadSettings() {
  try {
    const e = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    _settings = { ...DEFAULT_SETTINGS, ...e };
  } catch (e) {
    _settings = { ...DEFAULT_SETTINGS };
  }
}
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
  } catch (e) {}
}
const I18N_LABELS = {
    ja: [
      "CPU 論理コア数",
      "システムメモリ容量",
      "GPU レンダラー",
      "GPU 最大テクスチャサイズ",
      "実測 CPU ベンチスコア",
      "実測 GPU 描画スコア",
      "実測メモリ帯域スコア",
      "実測最高フレームレート",
      "実測 1% LOW フレームレート",
      "画面リフレッシュレート(推定)",
      "画面解像度 (物理ピクセル)",
      "デバイスピクセル比 (DPR)",
      "カラー深度 / HDR 対応",
      "JS ヒープ上限",
      "UIスレッド応答レイテンシ",
      "ゲーム向き判定 (Ping)",
      "ビデオ通話向き判定",
      "バッテリー残量 / 充電状態",
      "タッチポイント数",
      "ダークモード / ハイコントラスト",
      "セキュア通信 (HTTPS)",
      "Cookie / IndexedDB",
      "WebGL バージョン",
      "WebGL 最大頂点属性数",
      "WakeLock / 振動 API",
      "PWA / Service Worker",
      "自動操縦検知 (WebDriver)",
      "FPS ジッタースコア",
      "システム言語 / タイムゾーン",
      "診断エンジンバージョン",
      "IP アドレス (WebRTC)",
      "ダークモード / ハイコントラスト",
      "使用ブラウザ",
      "デバイス機種",
    ],
    "ja-hira": [
      "CPUのこあすう",
      "めもりようりょう",
      "GPUのしゅるい",
      "GPUさいだいてくすちゃ",
      "CPUせいのうすこあ",
      "GPUせいのうすこあ",
      "めもりたいいきすこあ",
      "へいきんFPS",
      "1%LOWのFPS",
      "がめんこうしんひんど(すいてい)",
      "がめんかいぞうど",
      "でばいすぴくせるひ",
      "からーふかど/HDR",
      "JSひーぷじょうげん",
      "UIおうとうそくど",
      "げーむむきはんてい",
      "びでおつうわむきはんてい",
      "でんちざんりょう",
      "たっちぽいんとすう",
      "だーくもーど",
      "あんごうつうしん",
      "Cookieとほぞん",
      "WebGLばーじょん",
      "WebGLちょうてんぞくせい",
      "WakeLock/しんどう",
      "PWA/サービスワーカー",
      "じどうそうじゅうけんち",
      "FPSあんていせい",
      "げんごとたいむぞーん",
      "しんだんえんじんばーじょん",
      "IPあどれす",
      "だーくもーど",
      "つかっているぶらうざ",
      "でばいすのきしゅ",
    ],
    en: [
      "CPU Logical Cores",
      "System Memory",
      "GPU Renderer",
      "GPU Max Texture Size",
      "CPU Bench Score",
      "GPU Render Score",
      "Memory Bandwidth Score",
      "Avg Frame Rate",
      "1% LOW Frame Rate",
      "Screen Refresh Rate (est.)",
      "Screen Resolution (Physical)",
      "Device Pixel Ratio (DPR)",
      "Color Depth / HDR",
      "JS Heap Limit",
      "UI Thread Latency",
      "Game Suitability (Ping)",
      "Video Call Suitability",
      "Battery / Charging Status",
      "Touch Points",
      "Dark Mode / High Contrast",
      "Secure Connection (HTTPS)",
      "Cookie / IndexedDB",
      "WebGL Version",
      "WebGL Max Vertex Attribs",
      "WakeLock / Vibration API",
      "PWA / Service Worker",
      "Bot Detection (WebDriver)",
      "FPS Jitter Score",
      "System Language / Timezone",
      "Diagnostic Engine Version",
      "IP Address (WebRTC)",
      "Dark Mode / High Contrast",
      "Browser",
      "Device Model",
    ],
    "zh-hans": [
      "CPU逻辑核心数",
      "系统内存容量",
      "GPU渲染器",
      "GPU最大纹理尺寸",
      "CPU基准分数",
      "GPU渲染分数",
      "内存带宽分数",
      "平均帧率",
      "1%低帧率",
      "屏幕刷新率(估计)",
      "屏幕分辨率(物理像素)",
      "设备像素比(DPR)",
      "色彩深度/HDR支持",
      "JS堆内存上限",
      "UI线程响应延迟",
      "网络速度(实测)",
      "网络类型/API带宽",
      "电池余量/充电状态",
      "触控点数量",
      "深色模式/高对比度",
      "安全连接(HTTPS)",
      "Cookie/IndexedDB",
      "WebGL版本",
      "WebGL最大顶点属性数",
      "WakeLock/振动API",
      "PWA/Service Worker",
      "自动化检测(WebDriver)",
      "FPS抖动分数",
      "系统语言/时区",
      "诊断引擎版本",
      "IP地址(WebRTC)",
      "深色模式/高对比度",
      "使用的浏览器",
      "设备型号",
    ],
    "zh-hant": [
      "CPU邏輯核心數",
      "系統記憶體容量",
      "GPU渲染器",
      "GPU最大紋理尺寸",
      "CPU基準分數",
      "GPU渲染分數",
      "記憶體頻寬分數",
      "平均幀率",
      "1%低幀率",
      "螢幕更新率(估計)",
      "螢幕解析度(實體像素)",
      "裝置像素比(DPR)",
      "色彩深度/HDR支援",
      "JS堆記憶體上限",
      "UI執行緒回應延遲",
      "網路速度(實測)",
      "網路類型/API頻寬",
      "電池餘量/充電狀態",
      "觸控點數量",
      "深色模式/高對比度",
      "安全連線(HTTPS)",
      "Cookie/IndexedDB",
      "WebGL版本",
      "WebGL最大頂點屬性數",
      "WakeLock/震動API",
      "PWA/Service Worker",
      "自動化偵測(WebDriver)",
      "FPS抖動分數",
      "系統語言/時區",
      "診斷引擎版本",
      "IP位址(WebRTC)",
      "深色模式/高對比度",
      "使用的瀏覽器",
      "裝置型號",
    ],
    ko: [
      "CPU 논리 코어 수",
      "시스템 메모리 용량",
      "GPU 렌더러",
      "GPU 최대 텍스처 크기",
      "CPU 벤치 점수",
      "GPU 렌더 점수",
      "메모리 대역폭 점수",
      "평균 프레임률",
      "1% LOW 프레임률",
      "화면 재생률(추정)",
      "화면 해상도(물리 픽셀)",
      "기기 픽셀 비율(DPR)",
      "색심도/HDR 지원",
      "JS 힙 한도",
      "UI 스레드 응답 지연",
      "네트워크 속도(실측)",
      "연결 유형/API 대역폭",
      "배터리/충전 상태",
      "터치 포인트 수",
      "다크 모드/고대비",
      "보안 연결(HTTPS)",
      "Cookie/IndexedDB",
      "WebGL 버전",
      "WebGL 최대 정점 속성 수",
      "WakeLock/진동 API",
      "PWA/Service Worker",
      "봇 감지(WebDriver)",
      "FPS 지터 점수",
      "시스템 언어/시간대",
      "진단 엔진 버전",
      "IP 주소(WebRTC)",
      "다크 모드/고대비",
      "사용 중인 브라우저",
      "기기 모델",
    ],
    vi: [
      "Số nhân CPU",
      "Dung lượng RAM",
      "GPU Renderer",
      "Kích thước texture tối đa",
      "Điểm CPU",
      "Điểm GPU",
      "Điểm băng thông bộ nhớ",
      "FPS trung bình",
      "1% LOW FPS",
      "Tần số quét màn hình(ước tính)",
      "Độ phân giải màn hình(pixel vật lý)",
      "Tỷ lệ pixel thiết bị(DPR)",
      "Độ sâu màu/HDR",
      "Giới hạn JS Heap",
      "Độ trễ UI thread",
      "Tốc độ mạng(đo thực tế)",
      "Loại kết nối/Băng thông API",
      "Pin/Trạng thái sạc",
      "Số điểm chạm",
      "Chế độ tối/Tương phản cao",
      "Kết nối bảo mật(HTTPS)",
      "Cookie/IndexedDB",
      "Phiên bản WebGL",
      "Thuộc tính đỉnh WebGL tối đa",
      "WakeLock/Rung API",
      "PWA/Service Worker",
      "Phát hiện bot(WebDriver)",
      "Điểm ổn định FPS",
      "Ngôn ngữ/Múi giờ",
      "Phiên bản engine chẩn đoán",
      "Địa chỉ IP(WebRTC)",
      "Chế độ tối/Tương phản cao",
      "Trình duyệt",
      "Model thiết bị",
    ],
    es: [
      "Núcleos lógicos CPU",
      "Memoria del sistema",
      "Renderizador GPU",
      "Tamaño máximo de textura GPU",
      "Puntuación CPU",
      "Puntuación GPU",
      "Puntuación de ancho de banda",
      "FPS promedio",
      "1% LOW FPS",
      "Tasa de refresco(estimada)",
      "Resolución de pantalla(píxeles físicos)",
      "Relación de píxeles(DPR)",
      "Profundidad de color/HDR",
      "Límite JS Heap",
      "Latencia UI Thread",
      "Velocidad de red(medida)",
      "Tipo de conexión/Ancho de banda",
      "Batería/Estado de carga",
      "Puntos táctiles",
      "Modo oscuro/Alto contraste",
      "Conexión segura(HTTPS)",
      "Cookie/IndexedDB",
      "Versión WebGL",
      "Atributos de vértice WebGL",
      "WakeLock/API de vibración",
      "PWA/Service Worker",
      "Detección de bots(WebDriver)",
      "Puntuación de jitter FPS",
      "Idioma del sistema/Zona horaria",
      "Versión del motor de diagnóstico",
      "Dirección IP(WebRTC)",
      "Modo oscuro/Alto contraste",
      "Navegador",
      "Modelo de dispositivo",
    ],
    pt: [
      "Núcleos lógicos CPU",
      "Memória do sistema",
      "Renderizador GPU",
      "Tamanho máximo de textura GPU",
      "Pontuação CPU",
      "Pontuação GPU",
      "Pontuação de largura de banda",
      "FPS médio",
      "1% LOW FPS",
      "Taxa de atualização(estimada)",
      "Resolução da tela(pixels físicos)",
      "Taxa de pixels do dispositivo(DPR)",
      "Profundidade de cor/HDR",
      "Limite JS Heap",
      "Latência UI Thread",
      "Velocidade de rede(medida)",
      "Tipo de conexão/Largura de banda",
      "Bateria/Status de carga",
      "Pontos de toque",
      "Modo escuro/Alto contraste",
      "Conexão segura(HTTPS)",
      "Cookie/IndexedDB",
      "Versão WebGL",
      "Atributos de vértice WebGL",
      "WakeLock/API de vibração",
      "PWA/Service Worker",
      "Detecção de bots(WebDriver)",
      "Pontuação de jitter FPS",
      "Idioma do sistema/Fuso horário",
      "Versão do motor de diagnóstico",
      "Endereço IP(WebRTC)",
      "Modo escuro/Alto contraste",
      "Navegador",
      "Modelo do dispositivo",
    ],
    fr: [
      "Cœurs logiques CPU",
      "Mémoire système",
      "Rendu GPU",
      "Taille max texture GPU",
      "Score CPU",
      "Score GPU",
      "Score bande passante",
      "FPS moyen",
      "1% LOW FPS",
      "Taux de rafraîchissement(estimé)",
      "Résolution écran(pixels physiques)",
      "Ratio pixels(DPR)",
      "Profondeur couleur/HDR",
      "Limite JS Heap",
      "Latence UI Thread",
      "Vitesse réseau(mesurée)",
      "Type connexion/Bande passante API",
      "Batterie/Statut charge",
      "Points tactiles",
      "Mode sombre/Contraste élevé",
      "Connexion sécurisée(HTTPS)",
      "Cookie/IndexedDB",
      "Version WebGL",
      "Attributs vertex WebGL",
      "WakeLock/API vibration",
      "PWA/Service Worker",
      "Détection bot(WebDriver)",
      "Score jitter FPS",
      "Langue système/Fuseau horaire",
      "Version moteur diagnostic",
      "Adresse IP(WebRTC)",
      "Mode sombre/Contraste élevé",
      "Navigateur",
      "Modèle appareil",
    ],
    de: [
      "CPU-Logikkerne",
      "Systemspeicher",
      "GPU-Renderer",
      "Maximale GPU-Texturgröße",
      "CPU-Benchmark",
      "GPU-Benchmark",
      "Speicherbandbreite",
      "Durchschnittliche FPS",
      "1% LOW FPS",
      "Bildwiederholrate(geschätzt)",
      "Bildschirmauflösung(physisch)",
      "Gerätepixelverhältnis(DPR)",
      "Farbtiefe/HDR",
      "JS-Heap-Limit",
      "UI-Thread-Latenz",
      "Netzwerkgeschwindigkeit(gemessen)",
      "Verbindungstyp/API-Bandbreite",
      "Akku/Ladestatus",
      "Berührungspunkte",
      "Dunkelmodus/Hoher Kontrast",
      "Sichere Verbindung(HTTPS)",
      "Cookie/IndexedDB",
      "WebGL-Version",
      "Max WebGL-Vertex-Attribute",
      "WakeLock/Vibrations-API",
      "PWA/Service Worker",
      "Bot-Erkennung(WebDriver)",
      "FPS-Jitter-Score",
      "Systemsprache/Zeitzone",
      "Diagnose-Engine-Version",
      "IP-Adresse(WebRTC)",
      "Dunkelmodus/Hoher Kontrast",
      "Browser",
      "Gerätemodell",
    ],
    ru: [
      "Логических ядер CPU",
      "Объём системной памяти",
      "Рендерер GPU",
      "Макс. размер текстуры GPU",
      "Оценка CPU",
      "Оценка GPU",
      "Оценка пропускной способности",
      "Средний FPS",
      "1% LOW FPS",
      "Частота обновления экрана(оценка)",
      "Разрешение экрана(физические пиксели)",
      "Соотношение пикселей(DPR)",
      "Глубина цвета/HDR",
      "Лимит JS Heap",
      "Задержка UI потока",
      "Скорость сети(измеренная)",
      "Тип соединения/Пропускная способность",
      "Батарея/Статус зарядки",
      "Точки касания",
      "Тёмная тема/Высокий контраст",
      "Защищённое соединение(HTTPS)",
      "Cookie/IndexedDB",
      "Версия WebGL",
      "Макс. атрибуты вершин WebGL",
      "WakeLock/API вибрации",
      "PWA/Service Worker",
      "Обнаружение бота(WebDriver)",
      "Оценка дрожания FPS",
      "Язык системы/Часовой пояс",
      "Версия движка диагностики",
      "IP-адрес(WebRTC)",
      "Тёмная тема/Высокий контраст",
      "Браузер",
      "Модель устройства",
    ],
  },
  LABEL_ROW_IDS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
  ],
  I18N = {
    ja: {
      statusTitle: "ハードウェア精密スキャン中...",
      evalMsg: "各コンポーネントの整合性を検証しています",
      saveBtnTxt: "診断レポートを画像で保存する",
      saveBtnCSV: "📊 CSVで保存する",
      saveBtnPDF: "📄 PDFで保存する",
      aiBtnTxt: "🤖 AIアドバイザーに相談する",
      historyBtnTxt: "📊 過去の診断結果を見る",
      speedBtnTxt: "🔋 バッテリードレインテスト",
      retryBtnTxt: "🔄 再診断する",
      rankMsgs: {
        S: "最高峰のフラッグシップ性能です",
        A: "非常に快適で強力な環境です",
        B: "一般的な標準デバイス性能です",
        C: "動作の遅延が目立ち、やや非力です",
        D: "性能が不足している旧型環境です",
      },
      bench: [
        "CPU 演算性能を計測中...",
        "素数計算・行列積・ビット演算を実行しています",
        "GPU 描画性能を計測中...",
        "WebGL シェーダー・Canvas 2D 合成描画を負荷試験中",
        "メモリ帯域を計測中...",
        "シーケンシャル・ストライド・ランダムアクセスを測定中",
        "システムメモリを精密解析中...",
        "5手法を統合中",
        "ゲーム・通話向き判定を計測中...",
        "複数サーバーへのPingとジッターを計測しています",
        "バッテリー・UIレイテンシを計測中...",
        "Battery API・UIスレッド応答遅延を同時取得しています",
        "省電力モードを確認中...",
        "タイマー精度を計測しています",
        "フレームレート安定性を計測中...",
        "rAF遅延ギャップ方式で15秒間精密計測中",
      ],
      val: {
        supported: "対応",
        unsupported: "非対応",
        running: "起動中",
        browser: "ブラウザ",
        secure: "安全 (HTTPS / TLS)",
        insecure: "非暗号 (HTTP)",
        detected: "⚠ 自動操縦を検知",
        normal: "正常 (手動操作)",
        hidden: "非表示",
        measuring: "計測不可",
        failed: "計測失敗 (オフライン?)",
        fast: "高速",
        medium: "普通",
        slow: "低速",
        charging: "⚡充電中",
        discharging: "🔋放電中",
        enabled: "有効",
        disabled: "無効",
        dark: "ダーク:ON",
        light: "ダーク:OFF",
        hiconOn: "ハイコン:ON",
        hiconOff: "ハイコン:OFF",
        estimated: "推定",
        highPrec: "高精度",
        midPrec: "精度中",
        gameExcellent: "◎ 最適",
        gameSuitable: "○ 向き",
        gameHeavy: "△ やや重い",
        gameUnsuitable: "✕ 不向き",
        videoExcellent: "◎ 最適",
        videoSuitable: "○ 向き",
        videoUnstable: "△ 不安定",
        videoUnsuitable: "✕ 不向き",
        ping: "Ping",
        jitter: "ジッター",
        latency: "遅延",
        stability: "安定性",
        stable: "安定",
        unstable: "不安定",
        inUse: "使用中",
        unavailable: "取得不可",
        wasmSupported: "対応",
        wasmUnsupported: "非対応",
        notifGranted: "許可済み",
        notifDenied: "ブロック中",
        notifDefault: "未設定",
        notifUnsupported: "非対応",
        compile: "コンパイル",
      },
      ui: {
        legendBtn: "🎨 色の基準を確認する",
        shareHint:
          "💡 プレビュー画面のダウンロードボタン下からXにシェアできます",
        speedDesc: "主要サイトへの接続時間を計測します。",
        speedNote: "※ブラウザ制限により参考値です。",
        fpsAvgDesc: "（1秒間に何回画面が更新されるか。高いほど滑らか）",
        fpsLowDesc: "(最も重い場面でのFPS。低いとカクつきを感じやすい)",
        uaDesc: "（OS・ブラウザなど環境情報をまとめた文字列）",
        remaining: "推定残り時間: 約 ",
        seconds: " 秒",
        fpsMeasuring: " 秒 (FPS計測中)",
        fpsCalc: "FPS集計中...",
        finalizing: "最終処理中...",
        scoreLabel: "総合スコア",
        memLabel: "MEM帯域",
        fpsLabel: "FPS安定",
        netLabel: "NET",
        settingsTitle: "⚙️ 設定",
        settingsReset: "🔄 設定をリセット",
        settingsResetConfirm: "設定をすべてデフォルトに戻しますか？",
        secAppearance: "🎨 外観",
        secLanguage: "🌐 言語",
        secNotify: "🔔 通知・フィードバック",
        secQuiet: "😴 お休み時間",
        secData: "💾 データ・操作",
        labelTheme: "テーマ",
        optDark: "ダーク",
        optLight: "ライト",
        optSystem: "システム",
        labelFontSize: "フォントサイズ",
        optSmall: "小",
        optNormal: "普通",
        optLarge: "大",
        optCustom: "カスタム",
        labelCustomSize: "カスタムサイズ",
        labelFont: "フォント",
        fontSystem: "システム標準",
        fontGothic: "ゴシック体",
        fontSerif: "明朝体・セリフ",
        fontRounded: "丸ゴシック",
        fontMono: "等幅フォント",
        labelFont: "フォント",
        fontSystem: "システム標準",
        fontGothic: "ゴシック体",
        fontSerif: "明朝体・セリフ",
        fontRounded: "丸ゴシック",
        fontMono: "等幅",
        labelLanguage: "表示言語",
        labelTransGuard: "Google翻訳崩れ防止",
        labelSound: "診断終了音",
        labelSoundPreset: "サウンドプリセット",
        soundDefault: "デフォルト（チャイム）",
        soundBell: "ベル",
        soundBeep: "ビープ",
        soundFanfare: "ファンファーレ",
        soundCustom: "カスタム（ファイル）",
        labelSoundFile: "カスタム音声ファイル",
        soundFileHint: "MP3・WAV・FLACに対応",
        soundUploadBtn: "📁 ファイルを選択",
        soundFileLoaded: "読み込み済み",
        soundFileClear: "削除",
        labelVibration: "バイブレーション",
        labelDesktopNotify: "完了時デスクトップ通知",
        labelBadge: "アイコンバッジ表示",
        labelQuietStart: "開始時刻",
        labelQuietEnd: "終了時刻",
        labelExportFmt: "書き出し形式",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "通信速度の単位",
        labelAutoCheck: "開いたとき自動診断",
        labelGuard: "うっかりガード",
        labelShowIp: "IPアドレスを診断結果に表示",
        consentTitle: "📋 はじめに",
        consentBody:
          "このアプリは、デバイスのハードウェア情報をブラウザ内で計測・表示します。取得したデータはお使いのブラウザ内のみで処理され、外部サーバーには送信されません。",
        consentBtn: "診断を開始する",
        consentTermsLink: "利用規約",
        consentUpdateTitle: "🔔 アップデートのお知らせ",
        consentUpdateBody:
          "このアップデートにより、利用規約が一部更新されました。診断を開始する前にご確認ください。",
        ipWarnTitle: "⚠️ IPアドレスをスクリーンショットに含めますか？",
        ipWarnBody:
          "IPアドレスをSNSなどで公開すると、おおよその居住地域や利用プロバイダが特定される危険があります。公開する予定がある場合は「IPアドレスを非表示にして保存」をおすすめします。",
        ipHide: "🔒 IPアドレスを非表示にして保存（推奨）",
        ipMask: "⚠️ 一部を * で隠して保存",
        ipShow: "そのまま含めて保存",
        ipNote:
          "※ IPアドレスの取得は外部APIへの問い合わせのみで行われます。取得した値はブラウザ内でのみ使用され、当診断ツールのサーバーには一切送信されません。",
        ipBack: "← 戻る（保存をキャンセル）",
        devWarnTitle: "📱 デバイス機種名をそのまま含めますか？",
        devShow: "そのまま含めて保存",
        devHide: "🔒 デバイス名を * に変更して保存",
        devNote:
          "※ デバイス名はUA文字列から取得しており、サーバーには送信されません。",
        devBack: "← 戻る（IPアドレスの選択に戻る）",
        loginRequired: "ProUltraにログイン",
        loginMsg: "はログインが必要です。Googleアカウントで無料登録できます。",
        loginBtn: "ログイン",
        cancelBtn: "キャンセル",
        logoutBtn: "ログアウト",
        syncOk: "✓ 同期済み",
        syncing: "同期中...",
        syncFail: "⚠ 同期失敗",
        synced: "✓ 同期中",
        friendCodeTitle: "親友コードでログイン",
        friendCodePlaceholder: "コードを入力...",
        friendCodeError: "コードが違います",
        friendLoginBtn: "ログイン",
        diagComplete: "✅ 処理が完了しました",
        imgGenComplete: "✅ 画像の生成が完了しました",
        retryConfirm: "再診断しますか？\n現在の診断結果は上書きされます。",
        notifyPromptReason:
          "診断完了時にデスクトップ通知でお知らせします。\n次の画面でブラウザの通知許可を求めます。許可しますか？",
        fpsAvgLabel: "実測平均フレームレート",
        fpsLowLabel: "1% LOW フレームレート",
        uaLabel: "ユーザーエージェント詳細スタック",
      },
    },
    "ja-hira": {
      statusTitle: "せいのうをはかっています...",
      evalMsg: "かくこうもくをかくにんしています",
      saveBtnTxt: "しんだんけっかをがぞうでほぞんする",
      saveBtnCSV: "📊 CSVでほぞんする",
      saveBtnPDF: "📄 PDFでほぞんする",
      aiBtnTxt: "🤖 AIにそうだんする",
      historyBtnTxt: "📊 むかしのしんだんをみる",
      speedBtnTxt: "🔋 バッテリーのもちをしらべる",
      retryBtnTxt: "🔄 もういちどはかる",
      rankMsgs: {
        S: "さいこうのせいのうです",
        A: "とてもよいせいのうです",
        B: "ふつうのせいのうです",
        C: "すこしおそいです",
        D: "ふるいきしゅです",
      },
      bench: [
        "CPUをはかっています...",
        "けいさんをしています",
        "GPUをはかっています...",
        "えをかいてせいのうをみています",
        "めもりをはかっています...",
        "よみかきのはやさをみています",
        "めもりのようりょうをかくにんしています...",
        "いろいろなほうほうでしらべています",
        "つうしんそくどをはかっています...",
        "じっさいにつないではかっています",
        "でんちとおうとうそくどをはかっています...",
        "でんちとおそさをみています",
        "せつでんもーどをかくにんしています...",
        "たいまーのせいかくさをみています",
        "FPSをはかっています...",
        "15びょうかんせいかくにはかっています",
      ],
      val: {
        supported: "たいおう",
        unsupported: "ひたいおう",
        running: "きどうちゅう",
        browser: "ぶらうざ",
        secure: "あんぜん(HTTPS)",
        insecure: "あんごうなし",
        detected: "⚠ じどうそうじゅうけんち",
        normal: "せいじょう",
        hidden: "ひひょうじ",
        measuring: "はかれません",
        failed: "けいそくしっぱい",
        fast: "はやい",
        medium: "ふつう",
        slow: "おそい",
        charging: "⚡じゅうでんちゅう",
        discharging: "🔋ほうでんちゅう",
        enabled: "ゆうこう",
        disabled: "むこう",
        dark: "だーく:ON",
        light: "だーく:OFF",
        hiconOn: "ひこんとらすと:ON",
        hiconOff: "ひこんとらすと:OFF",
        estimated: "すいてい",
        highPrec: "こうせいど",
        midPrec: "せいどちゅう",
        gameExcellent: "◎ さいてき",
        gameSuitable: "○ むき",
        gameHeavy: "△ やややさしくない",
        gameUnsuitable: "✕ むかない",
        videoExcellent: "◎ さいてき",
        videoSuitable: "○ むき",
        videoUnstable: "△ ふあんてい",
        videoUnsuitable: "✕ むかない",
        ping: "Ping",
        jitter: "じったー",
        latency: "ちえん",
        stability: "あんていせい",
        stable: "あんてい",
        unstable: "ふあんてい",
        inUse: "しようちゅう",
        unavailable: "とりょくふか",
        wasmSupported: "たいおう",
        wasmUnsupported: "ひたいおう",
        notifGranted: "きょかずみ",
        notifDenied: "ぶろっく",
        notifDefault: "みせってい",
        notifUnsupported: "ひたいおう",
        compile: "こんぱいる",
      },
      ui: {
        legendBtn: "🎨 いろのきじゅんをかくにんする",
        shareHint: "💡 ぷれびゅーがめんからXにしぇあできます",
        speedDesc: "いろんなさいとへのつながるじかんをはかります。",
        speedNote: "※ぶらうざのせいげんであくまでもさんこうです。",
        fpsAvgDesc: "（1びょうにがめんがなんかいこうしんされるか）",
        fpsLowDesc: "(いちばんおもいばめんでのFPS)",
        uaDesc: "（ぶらうざやOSのじょうほうのもじれつ）",
        remaining: "のこりやく ",
        seconds: " びょう",
        fpsMeasuring: " びょう(FPS)",
        fpsCalc: "FPSしゅうけいちゅう...",
        finalizing: "さいしゅうしょりちゅう...",
        scoreLabel: "そうごうすこあ",
        memLabel: "めもりたいいき",
        fpsLabel: "FPSあんてい",
        netLabel: "NET",
        settingsTitle: "⚙️ せってい",
        settingsReset: "🔄 せっていをりせっと",
        settingsResetConfirm: "せっていをぜんぶもとにもどしますか？",
        secAppearance: "🎨 みため",
        secLanguage: "🌐 げんご",
        secNotify: "🔔 つうちとふぃーどばっく",
        secQuiet: "😴 おやすみじかん",
        secData: "💾 でーたとそうさ",
        labelTheme: "てーま",
        optDark: "だーく",
        optLight: "らいと",
        optSystem: "しすてむ",
        labelFontSize: "もじのおおきさ",
        optSmall: "ちいさい",
        optNormal: "ふつう",
        optLarge: "おおきい",
        optCustom: "かすたむ",
        labelCustomSize: "かすたむさいず",
        labelLanguage: "ひょうじげんご",
        labelTransGuard: "ぐーぐるほんやくほご",
        labelSound: "しんだんおわりおと",
        labelVibration: "ばいぶれーしょん",
        labelDesktopNotify: "つうちきのう",
        labelBadge: "あいこんばっじ",
        labelQuietStart: "かいしじこく",
        labelQuietEnd: "しゅうりょうじこく",
        labelExportFmt: "ほぞんけいしき",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "つうしんそくどのたんい",
        labelAutoCheck: "じどうしんだん",
        labelGuard: "うっかりがーど",
        labelShowIp: "IPあどれすをみせる",
        consentTitle: "📋 はじめに",
        consentBody:
          "このあぷりは、でばいすのじょうほうをはかります。とったじょうほうはぶらうざのなかだけでつかいます。",
        consentBtn: "しんだんをはじめる",
        consentTermsLink: "りようきやく",
        consentUpdateTitle: "🔔 あっぷでーとのおしらせ",
        consentUpdateBody: "りようきやくがかわりました。かくにんしてください。",
        ipWarnTitle: "⚠️ IPあどれすをふくめますか？",
        ipWarnBody:
          "IPあどれすをこうかいすると、すんでいるばしょがわかるかもしれません。",
        ipHide: "🔒 IPあどれすをかくす（すいしょう）",
        ipMask: "⚠️ いちぶを*でかくす",
        ipShow: "そのままふくめる",
        ipNote: "※ IPあどれすはぶらうざないだけでつかいます。",
        ipBack: "← もどる",
        devWarnTitle: "📱 きしゅめいをふくめますか？",
        devShow: "そのままふくめる",
        devHide: "🔒 きしゅめいをかくす",
        devNote: "※ きしゅめいはさーばーにそうしんしません。",
        devBack: "← もどる",
        loginRequired: "ProUltraにろぐいん",
        loginMsg: "はろぐいんがひつようです。",
        loginBtn: "Googleでろぐいん",
        cancelBtn: "きゃんせる",
        logoutBtn: "ろぐあうと",
        syncOk: "✓ どうきずみ",
        syncing: "どうきちゅう...",
        syncFail: "⚠ どうきしっぱい",
        synced: "✓ どうきちゅう",
        friendCodeTitle: "しんゆうこーどでろぐいん",
        friendCodePlaceholder: "こーどをにゅうりょく...",
        friendCodeError: "こーどがちがいます",
        friendLoginBtn: "ろぐいん",
        diagComplete: "✅ しょりがかんりょうしました",
        imgGenComplete: "✅ がぞうがかんりょうしました",
        retryConfirm: "もういちどしんだんしますか？",
        fpsAvgLabel: "さいこうFPS",
        fpsLowLabel: "1%さいていFPS",
        uaLabel: "ぶらうざじょうほう",
      },
    },
    en: {
      statusTitle: "Scanning hardware...",
      evalMsg: "Verifying component integrity",
      saveBtnTxt: "Save Report as Image",
      saveBtnCSV: "📊 Save as CSV",
      saveBtnPDF: "📄 Save as PDF",
      aiBtnTxt: "🤖 Ask AI Advisor",
      historyBtnTxt: "📊 View Past Results",
      speedBtnTxt: "🔋 Battery Drain Test",
      retryBtnTxt: "🔄 Re-diagnose",
      rankMsgs: {
        S: "Flagship-class performance",
        A: "High-performance device",
        B: "Standard performance",
        C: "Below average performance",
        D: "Low-end / Legacy device",
      },
      bench: [
        "Measuring CPU performance...",
        "Running prime/matrix/SHA benchmarks",
        "Measuring GPU rendering...",
        "WebGL shaders & Canvas 2D stress test",
        "Measuring memory bandwidth...",
        "Sequential, stride & random access test",
        "Analyzing system memory...",
        "Integrating 5 estimation methods",
        "Measuring network speed...",
        "Fetching data to calculate bandwidth",
        "Measuring battery & UI latency...",
        "Battery API & UI thread latency",
        "Checking power saving mode...",
        "Measuring timer accuracy",
        "Measuring frame rate stability...",
        "rAF jitter method — 15 second precision test",
      ],
      val: {
        supported: "Supported",
        unsupported: "Not supported",
        running: "Running",
        browser: "Browser",
        secure: "Secure (HTTPS / TLS)",
        insecure: "Insecure (HTTP)",
        detected: "⚠ Automation detected",
        normal: "Normal (manual)",
        hidden: "Hidden",
        measuring: "Cannot measure",
        failed: "Measurement failed (offline?)",
        fast: "Fast",
        medium: "Average",
        slow: "Slow",
        charging: "⚡ Charging",
        discharging: "🔋 Discharging",
        enabled: "Enabled",
        disabled: "Disabled",
        dark: "Dark: ON",
        light: "Dark: OFF",
        hiconOn: "HiContrast: ON",
        hiconOff: "HiContrast: OFF",
        estimated: "Estimated",
        highPrec: "High accuracy",
        midPrec: "Mid accuracy",
        gameExcellent: "◎ Excellent",
        gameSuitable: "○ Good",
        gameHeavy: "△ Moderate",
        gameUnsuitable: "✕ Poor",
        videoExcellent: "◎ Excellent",
        videoSuitable: "○ Good",
        videoUnstable: "△ Unstable",
        videoUnsuitable: "✕ Poor",
        ping: "Ping",
        jitter: "Jitter",
        latency: "Latency",
        stability: "Stability",
        stable: "Stable",
        unstable: "Unstable",
        inUse: "In Use",
        unavailable: "Unavailable",
        wasmSupported: "Supported",
        wasmUnsupported: "Not supported",
        notifGranted: "Granted",
        notifDenied: "Blocked",
        notifDefault: "Not set",
        notifUnsupported: "Not supported",
        compile: "Compile",
      },
      ui: {
        legendBtn: "🎨 View color indicators",
        shareHint:
          "💡 You can share to X from the download button in the preview",
        speedDesc: "Measures connection time to major sites.",
        speedNote: "※ Reference only due to browser limitations.",
        fpsAvgDesc: "(Screen updates per second. Higher = smoother)",
        fpsLowDesc: "(FPS in heaviest scenes. Lower = more stutter)",
        uaDesc: "(Browser/OS environment info string)",
        remaining: "Est. remaining: ~",
        seconds: " sec",
        fpsMeasuring: " sec (FPS measuring)",
        fpsCalc: "Calculating FPS...",
        finalizing: "Finalizing...",
        scoreLabel: "Total Score",
        memLabel: "Mem BW",
        fpsLabel: "FPS Stab",
        netLabel: "NET",
        settingsTitle: "⚙️ Settings",
        settingsReset: "🔄 Reset Settings",
        settingsResetConfirm: "Reset all settings to default?",
        secAppearance: "🎨 Appearance",
        secLanguage: "🌐 Language",
        secNotify: "🔔 Notifications & Feedback",
        secQuiet: "😴 Quiet Hours",
        secData: "💾 Data & Operations",
        labelTheme: "Theme",
        optDark: "Dark",
        optLight: "Light",
        optSystem: "System",
        labelFontSize: "Font Size",
        optSmall: "Small",
        optNormal: "Normal",
        optLarge: "Large",
        optCustom: "Custom",
        labelCustomSize: "Custom Size",
        labelFont: "Font",
        fontSystem: "System Default",
        fontGothic: "Gothic / Sans-serif",
        fontSerif: "Serif / Mincho",
        fontRounded: "Rounded",
        fontMono: "Monospace",
        labelFont: "Font",
        fontSystem: "System Default",
        fontGothic: "Gothic (Sans)",
        fontSerif: "Serif / Mincho",
        fontRounded: "Rounded",
        fontMono: "Monospace",
        labelLanguage: "Display Language",
        labelTransGuard: "Google Translate Guard",
        labelSound: "Completion Sound",
        labelSoundPreset: "Sound Preset",
        soundDefault: "Default (Chime)",
        soundBell: "Bell",
        soundBeep: "Beep",
        soundFanfare: "Fanfare",
        soundCustom: "Custom (File)",
        labelSoundFile: "Custom Sound File",
        soundFileHint: "MP3, WAV, FLAC supported",
        soundUploadBtn: "📁 Choose File",
        soundFileLoaded: "File loaded",
        soundFileClear: "Remove",
        labelVibration: "Vibration",
        labelDesktopNotify: "Desktop Notification",
        labelBadge: "App Icon Badge",
        labelQuietStart: "Start Time",
        labelQuietEnd: "End Time",
        labelExportFmt: "Export Format",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Speed Unit",
        labelAutoCheck: "Auto Diagnose on Open",
        labelGuard: "Accidental Tap Guard",
        labelShowIp: "Show IP Address in Results",
        consentTitle: "📋 Before You Start",
        consentBody:
          "This app measures your device hardware info within the browser. All data is processed locally and never sent to external servers.",
        consentBtn: "Start Diagnosis",
        consentTermsLink: "Terms of Use",
        consentUpdateTitle: "🔔 Update Notice",
        consentUpdateBody:
          "The Terms of Use have been partially updated. Please review before starting the diagnosis.",
        ipWarnTitle: "⚠️ Include IP address in screenshot?",
        ipWarnBody:
          "Sharing your IP address publicly can reveal your approximate location and ISP. We recommend hiding it.",
        ipHide: "🔒 Hide IP address (recommended)",
        ipMask: "⚠️ Partially mask with *",
        ipShow: "Include as-is",
        ipNote:
          "※ IP is obtained via external API only, used within browser, never sent to our servers.",
        ipBack: "← Back (cancel save)",
        devWarnTitle: "📱 Include device model in screenshot?",
        devShow: "Include as-is",
        devHide: "🔒 Replace with *",
        devNote: "※ Device name is from UA string and is not sent to servers.",
        devBack: "← Back (return to IP selection)",
        loginRequired: "Login Required",
        loginMsg: " requires login. Register free with Google.",
        loginBtn: "Sign in with Google",
        cancelBtn: "Cancel",
        logoutBtn: "Logout",
        syncOk: "✓ Synced",
        syncing: "Syncing...",
        syncFail: "⚠ Sync failed",
        synced: "✓ Syncing",
        friendCodeTitle: "Login with Friend Code",
        friendCodePlaceholder: "Enter code...",
        friendCodeError: "Invalid code",
        friendLoginBtn: "Login",
        diagComplete: "✅ Diagnosis complete",
        imgGenComplete: "✅ Image generated",
        retryConfirm: "Re-diagnose?\nCurrent results will be overwritten.",
        notifyPromptReason:
          "Allow desktop notifications when diagnosis completes?\nYou will be asked for browser notification permission.",
        fpsAvgLabel: "Peak Frame Rate",
        fpsLowLabel: "1% LOW Frame Rate",
        uaLabel: "User Agent Stack",
      },
    },
    "zh-hans": {
      statusTitle: "正在扫描硬件...",
      evalMsg: "正在验证各组件的完整性",
      saveBtnTxt: "将报告保存为图片",
      saveBtnCSV: "📊 保存为CSV",
      saveBtnPDF: "📄 保存为PDF",
      aiBtnTxt: "🤖 咨询AI顾问",
      historyBtnTxt: "📊 查看历史结果",
      speedBtnTxt: "🔋 电池续航测试",
      retryBtnTxt: "🔄 重新诊断",
      rankMsgs: {
        S: "旗舰级性能",
        A: "高性能设备",
        B: "标准性能设备",
        C: "性能略显不足",
        D: "低端/老旧设备",
      },
      bench: [
        "正在测量CPU性能...",
        "运行素数/矩阵/SHA基准测试",
        "正在测量GPU渲染...",
        "WebGL着色器和Canvas 2D压力测试",
        "正在测量内存带宽...",
        "顺序、跨步和随机访问测试",
        "正在精密分析系统内存...",
        "整合5种估算方法",
        "正在实测网络速度...",
        "获取数据计算带宽",
        "正在测量电池和UI延迟...",
        "Battery API和UI线程延迟",
        "正在检查节电模式...",
        "测量计时器精度",
        "正在测量帧率稳定性...",
        "rAF抖动方式精密计测15秒",
      ],
      val: {
        supported: "支持",
        unsupported: "不支持",
        running: "运行中",
        browser: "浏览器",
        secure: "安全 (HTTPS/TLS)",
        insecure: "不加密 (HTTP)",
        detected: "⚠ 检测到自动化",
        normal: "正常 (手动)",
        hidden: "已隐藏",
        measuring: "无法测量",
        failed: "测量失败 (离线?)",
        fast: "快速",
        medium: "普通",
        slow: "缓慢",
        charging: "⚡充电中",
        discharging: "🔋放电中",
        enabled: "启用",
        disabled: "禁用",
        dark: "深色:ON",
        light: "深色:OFF",
        hiconOn: "高对比:ON",
        hiconOff: "高对比:OFF",
        estimated: "估算",
        highPrec: "高精度",
        midPrec: "中精度",
        gameExcellent: "◎ 极佳",
        gameSuitable: "○ 适合",
        gameHeavy: "△ 一般",
        gameUnsuitable: "✕ 不适合",
        videoExcellent: "◎ 极佳",
        videoSuitable: "○ 适合",
        videoUnstable: "△ 不稳定",
        videoUnsuitable: "✕ 不适合",
        ping: "Ping",
        jitter: "抖动",
        latency: "延迟",
        stability: "稳定性",
        stable: "稳定",
        unstable: "不稳定",
        inUse: "使用中",
        unavailable: "无法获取",
        wasmSupported: "支持",
        wasmUnsupported: "不支持",
        notifGranted: "已允许",
        notifDenied: "已拦截",
        notifDefault: "未设置",
        notifUnsupported: "不支持",
        compile: "编译",
      },
      ui: {
        legendBtn: "🎨 查看颜色指示说明",
        shareHint: "💡 可在预览界面下载按钮处分享到X",
        speedDesc: "测量到各主要网站的连接时间。",
        speedNote: "※ 受浏览器限制，仅供参考。",
        fpsAvgDesc: "（每秒刷新次数，越高越流畅）",
        fpsLowDesc: "(最卡场景的FPS，越低越明显)",
        uaDesc: "（浏览器/OS环境信息字符串）",
        remaining: "预计剩余: 约",
        seconds: "秒",
        fpsMeasuring: "秒(FPS测量中)",
        fpsCalc: "FPS计算中...",
        finalizing: "最终处理中...",
        scoreLabel: "总分",
        memLabel: "内存带宽",
        fpsLabel: "FPS稳定",
        netLabel: "NET",
        settingsTitle: "⚙️ 设置",
        settingsReset: "🔄 重置设置",
        settingsResetConfirm: "将所有设置重置为默认值？",
        secAppearance: "🎨 外观",
        secLanguage: "🌐 语言",
        secNotify: "🔔 通知和反馈",
        secQuiet: "😴 勿扰时间",
        secData: "💾 数据和操作",
        labelTheme: "主题",
        optDark: "深色",
        optLight: "浅色",
        optSystem: "跟随系统",
        labelFontSize: "字体大小",
        optSmall: "小",
        optNormal: "中",
        optLarge: "大",
        optCustom: "自定义",
        labelCustomSize: "自定义大小",
        labelLanguage: "显示语言",
        labelTransGuard: "防谷歌翻译乱版",
        labelSound: "完成提示音",
        labelVibration: "振动",
        labelDesktopNotify: "桌面通知",
        labelBadge: "应用图标角标",
        labelQuietStart: "开始时间",
        labelQuietEnd: "结束时间",
        labelExportFmt: "导出格式",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "速度单位",
        labelAutoCheck: "打开时自动诊断",
        labelGuard: "误触保护",
        labelShowIp: "在诊断结果中显示IP地址",
        consentTitle: "📋 开始前",
        consentBody:
          "本应用在浏览器内测量设备硬件信息。所有数据仅在浏览器内处理，不会发送到外部服务器。",
        consentBtn: "开始诊断",
        consentTermsLink: "使用条款",
        consentUpdateTitle: "🔔 更新通知",
        consentUpdateBody: "使用条款已部分更新，请在开始诊断前确认。",
        ipWarnTitle: "⚠️ 截图是否包含IP地址？",
        ipWarnBody: "公开IP地址可能暴露您的大致位置和运营商，建议隐藏。",
        ipHide: "🔒 隐藏IP地址（推荐）",
        ipMask: "⚠️ 部分*遮蔽",
        ipShow: "直接包含",
        ipNote: "※ IP地址仅在浏览器内使用，不会发送到本工具服务器。",
        ipBack: "← 返回（取消保存）",
        devWarnTitle: "📱 截图是否包含设备型号？",
        devShow: "直接包含",
        devHide: "🔒 替换为*",
        devNote: "※ 设备名称从UA字符串获取，不会发送到服务器。",
        devBack: "← 返回",
        loginRequired: "需要登录",
        loginMsg: "需要登录。可使用Google账号免费注册。",
        loginBtn: "使用Google登录",
        cancelBtn: "取消",
        logoutBtn: "退出登录",
        syncOk: "✓ 已同步",
        syncing: "同步中...",
        syncFail: "⚠ 同步失败",
        synced: "✓ 同步中",
        friendCodeTitle: "使用亲友码登录",
        friendCodePlaceholder: "请输入代码...",
        friendCodeError: "代码错误",
        friendLoginBtn: "登录",
        diagComplete: "✅ 诊断完成",
        imgGenComplete: "✅ 图片已生成",
        retryConfirm: "重新诊断？\n当前结果将被覆盖。",
        fpsAvgLabel: "最高帧率",
        fpsLowLabel: "1%低帧率",
        uaLabel: "用户代理字符串",
      },
    },
    "zh-hant": {
      statusTitle: "正在掃描硬體...",
      evalMsg: "正在驗證各元件的完整性",
      saveBtnTxt: "將報告儲存為圖片",
      saveBtnCSV: "📊 儲存為CSV",
      saveBtnPDF: "📄 儲存為PDF",
      aiBtnTxt: "🤖 諮詢AI顧問",
      historyBtnTxt: "📊 查看歷史結果",
      speedBtnTxt: "🔋 電池續航測試",
      retryBtnTxt: "🔄 重新診斷",
      rankMsgs: {
        S: "旗艦級效能",
        A: "高效能裝置",
        B: "標準效能裝置",
        C: "效能略顯不足",
        D: "低階/舊型裝置",
      },
      bench: [
        "正在測量CPU效能...",
        "執行質數/矩陣/SHA基準測試",
        "正在測量GPU渲染...",
        "WebGL著色器和Canvas 2D壓力測試",
        "正在測量記憶體頻寬...",
        "順序、跨步和隨機存取測試",
        "正在精密分析系統記憶體...",
        "整合5種估算方法",
        "正在實測網路速度...",
        "取得資料計算頻寬",
        "正在測量電池和UI延遲...",
        "Battery API和UI執行緒延遲",
        "正在檢查省電模式...",
        "測量計時器精度",
        "正在測量幀率穩定性...",
        "rAF抖動方式精密計測15秒",
      ],
      val: {
        supported: "支援",
        unsupported: "不支援",
        running: "執行中",
        browser: "瀏覽器",
        secure: "安全 (HTTPS/TLS)",
        insecure: "不加密 (HTTP)",
        detected: "⚠ 偵測到自動化",
        normal: "正常 (手動)",
        hidden: "已隱藏",
        measuring: "無法測量",
        failed: "測量失敗 (離線?)",
        fast: "快速",
        medium: "普通",
        slow: "緩慢",
        charging: "⚡充電中",
        discharging: "🔋放電中",
        enabled: "啟用",
        disabled: "停用",
        dark: "深色:ON",
        light: "深色:OFF",
        hiconOn: "高對比:ON",
        hiconOff: "高對比:OFF",
        estimated: "估算",
        highPrec: "高精度",
        midPrec: "中精度",
        gameExcellent: "◎ 極佳",
        gameSuitable: "○ 適合",
        gameHeavy: "△ 普通",
        gameUnsuitable: "✕ 不適合",
        videoExcellent: "◎ 極佳",
        videoSuitable: "○ 適合",
        videoUnstable: "△ 不穩定",
        videoUnsuitable: "✕ 不適合",
        ping: "Ping",
        jitter: "抖動",
        latency: "延遲",
        stability: "穩定性",
        stable: "穩定",
        unstable: "不穩定",
        inUse: "使用中",
        unavailable: "無法取得",
        wasmSupported: "支援",
        wasmUnsupported: "不支援",
        notifGranted: "已允許",
        notifDenied: "已封鎖",
        notifDefault: "未設定",
        notifUnsupported: "不支援",
        compile: "編譯",
      },
      ui: {
        legendBtn: "🎨 查看顏色指示說明",
        shareHint: "💡 可在預覽介面下載按鈕處分享到X",
        speedDesc: "測量到各主要網站的連線時間。",
        speedNote: "※ 受瀏覽器限制，僅供參考。",
        fpsAvgDesc: "（每秒重新整理次數，越高越流暢）",
        fpsLowDesc: "(最卡場景的FPS，越低越明顯)",
        uaDesc: "（瀏覽器/OS環境資訊字串）",
        remaining: "預計剩餘: 約",
        seconds: "秒",
        fpsMeasuring: "秒(FPS測量中)",
        fpsCalc: "FPS計算中...",
        finalizing: "最終處理中...",
        scoreLabel: "總分",
        memLabel: "記憶體頻寬",
        fpsLabel: "FPS穩定",
        netLabel: "NET",
        settingsTitle: "⚙️ 設定",
        settingsReset: "🔄 重置設定",
        settingsResetConfirm: "將所有設定重置為預設值？",
        secAppearance: "🎨 外觀",
        secLanguage: "🌐 語言",
        secNotify: "🔔 通知和回饋",
        secQuiet: "😴 勿擾時間",
        secData: "💾 資料和操作",
        labelTheme: "主題",
        optDark: "深色",
        optLight: "淺色",
        optSystem: "跟隨系統",
        labelFontSize: "字體大小",
        optSmall: "小",
        optNormal: "中",
        optLarge: "大",
        optCustom: "自訂",
        labelCustomSize: "自訂大小",
        labelLanguage: "顯示語言",
        labelTransGuard: "防Google翻譯版面錯亂",
        labelSound: "完成提示音",
        labelVibration: "震動",
        labelDesktopNotify: "桌面通知",
        labelBadge: "應用圖示角標",
        labelQuietStart: "開始時間",
        labelQuietEnd: "結束時間",
        labelExportFmt: "匯出格式",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "速度單位",
        labelAutoCheck: "開啟時自動診斷",
        labelGuard: "誤觸保護",
        labelShowIp: "在診斷結果中顯示IP位址",
        consentTitle: "📋 開始前",
        consentBody:
          "本應用在瀏覽器內測量裝置硬體資訊。所有資料僅在瀏覽器內處理，不會傳送至外部伺服器。",
        consentBtn: "開始診斷",
        consentTermsLink: "使用條款",
        consentUpdateTitle: "🔔 更新通知",
        consentUpdateBody: "使用條款已部分更新，請在開始診斷前確認。",
        ipWarnTitle: "⚠️ 截圖是否包含IP位址？",
        ipWarnBody: "公開IP位址可能暴露您的大致位置和ISP，建議隱藏。",
        ipHide: "🔒 隱藏IP位址（推薦）",
        ipMask: "⚠️ 部分*遮蔽",
        ipShow: "直接包含",
        ipNote: "※ IP位址僅在瀏覽器內使用，不會傳送至本工具伺服器。",
        ipBack: "← 返回（取消儲存）",
        devWarnTitle: "📱 截圖是否包含裝置型號？",
        devShow: "直接包含",
        devHide: "🔒 替換為*",
        devNote: "※ 裝置名稱從UA字串取得，不會傳送至伺服器。",
        devBack: "← 返回",
        loginRequired: "需要登入",
        loginMsg: "需要登入。可使用Google帳號免費註冊。",
        loginBtn: "使用Google登入",
        cancelBtn: "取消",
        logoutBtn: "登出",
        syncOk: "✓ 已同步",
        syncing: "同步中...",
        syncFail: "⚠ 同步失敗",
        synced: "✓ 同步中",
        friendCodeTitle: "使用親友碼登入",
        friendCodePlaceholder: "請輸入代碼...",
        friendCodeError: "代碼錯誤",
        friendLoginBtn: "登入",
        diagComplete: "✅ 診斷完成",
        imgGenComplete: "✅ 圖片已生成",
        retryConfirm: "重新診斷？\n目前結果將被覆蓋。",
        fpsAvgLabel: "最高幀率",
        fpsLowLabel: "1%低幀率",
        uaLabel: "使用者代理字串",
      },
    },
    ko: {
      statusTitle: "하드웨어 스캔 중...",
      evalMsg: "각 구성 요소를 확인하고 있습니다",
      saveBtnTxt: "진단 보고서를 이미지로 저장",
      saveBtnCSV: "📊 CSV로 저장",
      saveBtnPDF: "📄 PDF로 저장",
      aiBtnTxt: "🤖 AI 어드바이저에게 상담",
      historyBtnTxt: "📊 과거 진단 결과 보기",
      speedBtnTxt: "🔋 배터리 소모 테스트",
      retryBtnTxt: "🔄 재진단",
      rankMsgs: {
        S: "최고급 플래그십 성능",
        A: "매우 쾌적한 고성능 기기",
        B: "일반적인 표준 기기",
        C: "다소 느린 기기",
        D: "구형 저사양 기기",
      },
      bench: [
        "CPU 성능 측정 중...",
        "소수/행렬/SHA 벤치마크 실행",
        "GPU 렌더링 측정 중...",
        "WebGL 쉐이더 및 Canvas 2D 스트레스 테스트",
        "메모리 대역폭 측정 중...",
        "순차, 스트라이드 및 랜덤 액세스 테스트",
        "시스템 메모리 정밀 분석 중...",
        "5가지 추정 방법 통합",
        "네트워크 속도 실측 중...",
        "데이터 가져와서 대역폭 계산",
        "배터리 및 UI 지연 측정 중...",
        "Battery API 및 UI 스레드 지연",
        "절전 모드 확인 중...",
        "타이머 정확도 측정",
        "프레임률 안정성 측정 중...",
        "rAF 지터 방식 15초 정밀 측정",
      ],
      val: {
        supported: "지원",
        unsupported: "미지원",
        running: "실행 중",
        browser: "브라우저",
        secure: "보안 (HTTPS/TLS)",
        insecure: "비암호화 (HTTP)",
        detected: "⚠ 자동화 감지",
        normal: "정상 (수동)",
        hidden: "숨김",
        measuring: "측정 불가",
        failed: "측정 실패 (오프라인?)",
        fast: "빠름",
        medium: "보통",
        slow: "느림",
        charging: "⚡ 충전 중",
        discharging: "🔋 방전 중",
        enabled: "활성화",
        disabled: "비활성화",
        dark: "다크:ON",
        light: "다크:OFF",
        hiconOn: "고대비:ON",
        hiconOff: "고대비:OFF",
        estimated: "추정",
        highPrec: "고정밀",
        midPrec: "중정밀",
        gameExcellent: "◎ 최적",
        gameSuitable: "○ 적합",
        gameHeavy: "△ 보통",
        gameUnsuitable: "✕ 부적합",
        videoExcellent: "◎ 최적",
        videoSuitable: "○ 적합",
        videoUnstable: "△ 불안정",
        videoUnsuitable: "✕ 부적합",
        ping: "Ping",
        jitter: "지터",
        latency: "지연",
        stability: "안정성",
        stable: "안정",
        unstable: "불안정",
        inUse: "사용 중",
        unavailable: "불가",
        wasmSupported: "지원",
        wasmUnsupported: "미지원",
        notifGranted: "허용됨",
        notifDenied: "차단됨",
        notifDefault: "미설정",
        notifUnsupported: "미지원",
        compile: "컴파일",
      },
      ui: {
        legendBtn: "🎨 색상 기준 확인",
        shareHint: "💡 미리보기 화면에서 X로 공유할 수 있습니다",
        speedDesc: "주요 사이트로의 연결 시간을 측정합니다.",
        speedNote: "※ 브라우저 제한으로 참고값입니다.",
        fpsAvgDesc: "(초당 화면 갱신 횟수. 높을수록 부드러움)",
        fpsLowDesc: "(가장 무거운 장면의 FPS. 낮을수록 끊김)",
        uaDesc: "(브라우저/OS 환경 정보 문자열)",
        remaining: "예상 남은 시간: 약 ",
        seconds: " 초",
        fpsMeasuring: " 초 (FPS 측정 중)",
        fpsCalc: "FPS 집계 중...",
        finalizing: "최종 처리 중...",
        scoreLabel: "총점",
        memLabel: "메모리 대역폭",
        fpsLabel: "FPS 안정",
        netLabel: "NET",
        settingsTitle: "⚙️ 설정",
        settingsReset: "🔄 설정 초기화",
        settingsResetConfirm: "모든 설정을 기본값으로 초기화하시겠습니까?",
        secAppearance: "🎨 외관",
        secLanguage: "🌐 언어",
        secNotify: "🔔 알림 및 피드백",
        secQuiet: "😴 방해 금지 시간",
        secData: "💾 데이터 및 작업",
        labelTheme: "테마",
        optDark: "다크",
        optLight: "라이트",
        optSystem: "시스템",
        labelFontSize: "글자 크기",
        optSmall: "작게",
        optNormal: "보통",
        optLarge: "크게",
        optCustom: "사용자 정의",
        labelCustomSize: "사용자 정의 크기",
        labelLanguage: "표시 언어",
        labelTransGuard: "Google 번역 레이아웃 보호",
        labelSound: "완료 사운드",
        labelVibration: "진동",
        labelDesktopNotify: "데스크톱 알림",
        labelBadge: "앱 아이콘 배지",
        labelQuietStart: "시작 시간",
        labelQuietEnd: "종료 시간",
        labelExportFmt: "내보내기 형식",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "속도 단위",
        labelAutoCheck: "열면 자동 진단",
        labelGuard: "실수 방지",
        labelShowIp: "진단 결과에 IP 주소 표시",
        consentTitle: "📋 시작하기 전에",
        consentBody:
          "이 앱은 브라우저 내에서 기기 하드웨어 정보를 측정합니다. 수집된 데이터는 브라우저 내에서만 처리되며 외부 서버로 전송되지 않습니다.",
        consentBtn: "진단 시작",
        consentTermsLink: "이용약관",
        consentUpdateTitle: "🔔 업데이트 알림",
        consentUpdateBody:
          "이용약관이 일부 변경되었습니다. 진단 시작 전에 확인해 주세요.",
        ipWarnTitle: "⚠️ 스크린샷에 IP 주소를 포함하시겠습니까?",
        ipWarnBody: "IP 주소를 공개하면 위치와 ISP가 노출될 수 있습니다.",
        ipHide: "🔒 IP 주소 숨기기 (권장)",
        ipMask: "⚠️ 일부를 *로 가리기",
        ipShow: "그대로 포함",
        ipNote:
          "※ IP 주소는 브라우저 내에서만 사용되며 서버로 전송되지 않습니다.",
        ipBack: "← 뒤로 (저장 취소)",
        devWarnTitle: "📱 스크린샷에 기기 모델을 포함하시겠습니까?",
        devShow: "그대로 포함",
        devHide: "🔒 *로 대체",
        devNote:
          "※ 기기 이름은 UA 문자열에서 가져오며 서버로 전송되지 않습니다.",
        devBack: "← 뒤로",
        loginRequired: "로그인 필요",
        loginMsg: "에는 로그인이 필요합니다.",
        loginBtn: "Google로 로그인",
        cancelBtn: "취소",
        logoutBtn: "로그아웃",
        syncOk: "✓ 동기화됨",
        syncing: "동기화 중...",
        syncFail: "⚠ 동기화 실패",
        synced: "✓ 동기화 중",
        friendCodeTitle: "친구 코드로 로그인",
        friendCodePlaceholder: "코드 입력...",
        friendCodeError: "코드가 틀립니다",
        friendLoginBtn: "로그인",
        diagComplete: "✅ 진단 완료",
        imgGenComplete: "✅ 이미지 생성 완료",
        retryConfirm: "재진단하시겠습니까?\n현재 결과가 덮어쓰여집니다.",
        fpsAvgLabel: "최고 프레임률",
        fpsLowLabel: "1% LOW 프레임률",
        uaLabel: "유저 에이전트",
      },
    },
    vi: {
      statusTitle: "Đang quét phần cứng...",
      evalMsg: "Đang xác minh tính toàn vẹn của các thành phần",
      saveBtnTxt: "Lưu báo cáo dưới dạng hình ảnh",
      saveBtnCSV: "📊 Lưu dạng CSV",
      saveBtnPDF: "📄 Lưu dạng PDF",
      aiBtnTxt: "🤖 Tư vấn AI",
      historyBtnTxt: "📊 Xem kết quả chẩn đoán cũ",
      speedBtnTxt: "🔋 Kiểm tra tiêu hao pin",
      retryBtnTxt: "🔄 Chẩn đoán lại",
      rankMsgs: {
        S: "Hiệu suất đỉnh cao",
        A: "Thiết bị hiệu suất cao",
        B: "Thiết bị tiêu chuẩn",
        C: "Hiệu suất dưới mức trung bình",
        D: "Thiết bị cũ / thấp cấp",
      },
      bench: [
        "Đang đo CPU...",
        "Chạy benchmark",
        "Đang đo GPU...",
        "Kiểm tra tải WebGL và Canvas",
        "Đang đo băng thông bộ nhớ...",
        "Kiểm tra đọc/ghi tuần tự và ngẫu nhiên",
        "Đang phân tích RAM...",
        "Tổng hợp 5 phương pháp",
        "Đang đo tốc độ mạng...",
        "Tải dữ liệu để tính băng thông",
        "Đang đo pin và độ trễ UI...",
        "Battery API và độ trễ UI thread",
        "Đang kiểm tra chế độ tiết kiệm điện...",
        "Đo độ chính xác bộ đếm thời gian",
        "Đang đo ổn định frame rate...",
        "Phương pháp rAF jitter 15 giây",
      ],
      val: {
        supported: "Hỗ trợ",
        unsupported: "Không hỗ trợ",
        running: "Đang chạy",
        browser: "Trình duyệt",
        secure: "Bảo mật (HTTPS)",
        insecure: "Không mã hóa (HTTP)",
        detected: "⚠ Phát hiện tự động hóa",
        normal: "Bình thường",
        hidden: "Đã ẩn",
        measuring: "Không đo được",
        failed: "Đo thất bại (offline?)",
        fast: "Nhanh",
        medium: "Trung bình",
        slow: "Chậm",
        charging: "⚡ Đang sạc",
        discharging: "🔋 Đang xả",
        enabled: "Bật",
        disabled: "Tắt",
        dark: "Tối:ON",
        light: "Tối:OFF",
        hiconOn: "Tương phản:ON",
        hiconOff: "Tương phản:OFF",
        estimated: "Ước tính",
        highPrec: "Độ chính xác cao",
        midPrec: "Độ chính xác TB",
        gameExcellent: "◎ Xuất sắc",
        gameSuitable: "○ Tốt",
        gameHeavy: "△ Trung bình",
        gameUnsuitable: "✕ Kém",
        videoExcellent: "◎ Xuất sắc",
        videoSuitable: "○ Tốt",
        videoUnstable: "△ Không ổn định",
        videoUnsuitable: "✕ Kém",
        ping: "Ping",
        jitter: "Jitter",
        latency: "Độ trễ",
        stability: "Ổn định",
        stable: "Ổn định",
        unstable: "Không ổn định",
        inUse: "Đang dùng",
        unavailable: "Không lấy được",
        wasmSupported: "Hỗ trợ",
        wasmUnsupported: "Không hỗ trợ",
        notifGranted: "Đã cho phép",
        notifDenied: "Đã chặn",
        notifDefault: "Chưa đặt",
        notifUnsupported: "Không hỗ trợ",
        compile: "Biên dịch",
      },
      ui: {
        legendBtn: "🎨 Xem chú thích màu sắc",
        shareHint: "💡 Bạn có thể chia sẻ lên X từ nút tải trong xem trước",
        speedDesc: "Đo thời gian kết nối đến các trang web lớn.",
        speedNote: "※ Chỉ mang tính tham khảo do giới hạn trình duyệt.",
        fpsAvgDesc: "(Số lần cập nhật màn hình/giây. Cao hơn = mượt hơn)",
        fpsLowDesc: "(FPS ở cảnh nặng nhất. Thấp = giật nhiều)",
        uaDesc: "(Chuỗi thông tin môi trường trình duyệt/OS)",
        remaining: "Ước tính còn: ~",
        seconds: " giây",
        fpsMeasuring: " giây (đang đo FPS)",
        fpsCalc: "Đang tính FPS...",
        finalizing: "Đang xử lý cuối...",
        scoreLabel: "Tổng điểm",
        memLabel: "BW bộ nhớ",
        fpsLabel: "Ổn định FPS",
        netLabel: "NET",
        settingsTitle: "⚙️ Cài đặt",
        settingsReset: "🔄 Đặt lại",
        settingsResetConfirm: "Đặt lại tất cả cài đặt về mặc định?",
        secAppearance: "🎨 Giao diện",
        secLanguage: "🌐 Ngôn ngữ",
        secNotify: "🔔 Thông báo",
        secQuiet: "😴 Giờ yên tĩnh",
        secData: "💾 Dữ liệu",
        labelTheme: "Chủ đề",
        optDark: "Tối",
        optLight: "Sáng",
        optSystem: "Hệ thống",
        labelFontSize: "Cỡ chữ",
        optSmall: "Nhỏ",
        optNormal: "Bình thường",
        optLarge: "Lớn",
        optCustom: "Tùy chỉnh",
        labelCustomSize: "Kích thước tùy chỉnh",
        labelLanguage: "Ngôn ngữ",
        labelTransGuard: "Bảo vệ Google Dịch",
        labelSound: "Âm thanh hoàn thành",
        labelVibration: "Rung",
        labelDesktopNotify: "Thông báo máy tính",
        labelBadge: "Huy hiệu ứng dụng",
        labelQuietStart: "Giờ bắt đầu",
        labelQuietEnd: "Giờ kết thúc",
        labelExportFmt: "Định dạng xuất",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Đơn vị tốc độ",
        labelAutoCheck: "Tự động chẩn đoán khi mở",
        labelGuard: "Bảo vệ thao tác nhầm",
        labelShowIp: "Hiển thị IP trong kết quả",
        consentTitle: "📋 Trước khi bắt đầu",
        consentBody:
          "Ứng dụng này đo thông tin phần cứng trong trình duyệt. Dữ liệu chỉ được xử lý cục bộ, không gửi đến máy chủ.",
        consentBtn: "Bắt đầu chẩn đoán",
        consentTermsLink: "Điều khoản sử dụng",
        consentUpdateTitle: "🔔 Thông báo cập nhật",
        consentUpdateBody:
          "Điều khoản đã được cập nhật một phần. Vui lòng xem trước khi bắt đầu.",
        ipWarnTitle: "⚠️ Bao gồm địa chỉ IP trong ảnh chụp màn hình?",
        ipWarnBody: "Chia sẻ IP có thể lộ vị trí và ISP của bạn.",
        ipHide: "🔒 Ẩn IP (khuyến nghị)",
        ipMask: "⚠️ Che một phần bằng *",
        ipShow: "Giữ nguyên",
        ipNote: "※ IP chỉ được dùng trong trình duyệt, không gửi đến máy chủ.",
        ipBack: "← Quay lại",
        devWarnTitle: "📱 Bao gồm model thiết bị?",
        devShow: "Giữ nguyên",
        devHide: "🔒 Thay bằng *",
        devNote: "※ Tên thiết bị lấy từ UA, không gửi đến máy chủ.",
        devBack: "← Quay lại",
        loginRequired: "Cần đăng nhập",
        loginMsg: "yêu cầu đăng nhập.",
        loginBtn: "Đăng nhập Google",
        cancelBtn: "Hủy",
        logoutBtn: "Đăng xuất",
        syncOk: "✓ Đã đồng bộ",
        syncing: "Đang đồng bộ...",
        syncFail: "⚠ Đồng bộ thất bại",
        synced: "✓ Đang đồng bộ",
        friendCodeTitle: "Đăng nhập bằng mã bạn bè",
        friendCodePlaceholder: "Nhập mã...",
        friendCodeError: "Mã không đúng",
        friendLoginBtn: "Đăng nhập",
        diagComplete: "✅ Chẩn đoán hoàn tất",
        imgGenComplete: "✅ Ảnh đã tạo",
        retryConfirm: "Chẩn đoán lại?\nKết quả hiện tại sẽ bị ghi đè.",
        fpsAvgLabel: "FPS tối đa",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
    es: {
      statusTitle: "Escaneando hardware...",
      evalMsg: "Verificando la integridad de los componentes",
      saveBtnTxt: "Guardar informe como imagen",
      saveBtnCSV: "📊 Guardar como CSV",
      saveBtnPDF: "📄 Guardar como PDF",
      aiBtnTxt: "🤖 Consultar al asesor de IA",
      historyBtnTxt: "📊 Ver resultados anteriores",
      speedBtnTxt: "🔋 Prueba de batería",
      retryBtnTxt: "🔄 Volver a diagnosticar",
      rankMsgs: {
        S: "Rendimiento de gama alta",
        A: "Dispositivo de alto rendimiento",
        B: "Rendimiento estándar",
        C: "Rendimiento por debajo del promedio",
        D: "Dispositivo antiguo / de gama baja",
      },
      bench: [
        "Midiendo rendimiento CPU...",
        "Ejecutando benchmarks",
        "Midiendo renderizado GPU...",
        "Prueba de carga WebGL y Canvas",
        "Midiendo ancho de banda de memoria...",
        "Prueba de acceso secuencial y aleatorio",
        "Analizando memoria del sistema...",
        "Integrando 5 métodos de estimación",
        "Midiendo velocidad de red...",
        "Descargando datos para calcular ancho de banda",
        "Midiendo batería y latencia UI...",
        "Battery API y latencia del hilo UI",
        "Verificando modo de ahorro de energía...",
        "Midiendo precisión del temporizador",
        "Midiendo estabilidad de frame rate...",
        "Método de jitter rAF 15 segundos",
      ],
      val: {
        supported: "Compatible",
        unsupported: "No compatible",
        running: "En ejecución",
        browser: "Navegador",
        secure: "Seguro (HTTPS/TLS)",
        insecure: "No cifrado (HTTP)",
        detected: "⚠ Automatización detectada",
        normal: "Normal (manual)",
        hidden: "Oculto",
        measuring: "No se puede medir",
        failed: "Medición fallida (offline?)",
        fast: "Rápido",
        medium: "Normal",
        slow: "Lento",
        charging: "⚡ Cargando",
        discharging: "🔋 Descargando",
        enabled: "Habilitado",
        disabled: "Deshabilitado",
        dark: "Oscuro:ON",
        light: "Oscuro:OFF",
        hiconOn: "AltoContraste:ON",
        hiconOff: "AltoContraste:OFF",
        estimated: "Estimado",
        highPrec: "Alta precisión",
        midPrec: "Precisión media",
        gameExcellent: "◎ Excelente",
        gameSuitable: "○ Bueno",
        gameHeavy: "△ Regular",
        gameUnsuitable: "✕ Malo",
        videoExcellent: "◎ Excelente",
        videoSuitable: "○ Bueno",
        videoUnstable: "△ Inestable",
        videoUnsuitable: "✕ Malo",
        ping: "Ping",
        jitter: "Jitter",
        latency: "Latencia",
        stability: "Estabilidad",
        stable: "Estable",
        unstable: "Inestable",
        inUse: "En uso",
        unavailable: "No disponible",
        wasmSupported: "Compatible",
        wasmUnsupported: "No compatible",
        notifGranted: "Permitido",
        notifDenied: "Bloqueado",
        notifDefault: "Sin establecer",
        notifUnsupported: "No compatible",
        compile: "Compilar",
      },
      ui: {
        legendBtn: "🎨 Ver indicadores de color",
        shareHint:
          "💡 Puedes compartir a X desde el botón de descarga en la vista previa",
        speedDesc: "Mide el tiempo de conexión a sitios principales.",
        speedNote: "※ Solo referencia debido a limitaciones del navegador.",
        fpsAvgDesc:
          "(Actualizaciones de pantalla por segundo. Mayor = más fluido)",
        fpsLowDesc: "(FPS en escenas más pesadas. Menor = más tirones)",
        uaDesc: "(Cadena de información del entorno navegador/SO)",
        remaining: "Tiempo restante est.: ~",
        seconds: " seg",
        fpsMeasuring: " seg (midiendo FPS)",
        fpsCalc: "Calculando FPS...",
        finalizing: "Finalizando...",
        scoreLabel: "Puntuación",
        memLabel: "BW memoria",
        fpsLabel: "Estab. FPS",
        netLabel: "NET",
        settingsTitle: "⚙️ Ajustes",
        settingsReset: "🔄 Restablecer",
        settingsResetConfirm: "¿Restablecer todos los ajustes?",
        secAppearance: "🎨 Apariencia",
        secLanguage: "🌐 Idioma",
        secNotify: "🔔 Notificaciones",
        secQuiet: "😴 Horas tranquilas",
        secData: "💾 Datos",
        labelTheme: "Tema",
        optDark: "Oscuro",
        optLight: "Claro",
        optSystem: "Sistema",
        labelFontSize: "Tamaño de fuente",
        optSmall: "Pequeño",
        optNormal: "Normal",
        optLarge: "Grande",
        optCustom: "Personalizado",
        labelCustomSize: "Tamaño personalizado",
        labelLanguage: "Idioma",
        labelTransGuard: "Protección Google Translate",
        labelSound: "Sonido de fin",
        labelVibration: "Vibración",
        labelDesktopNotify: "Notificación escritorio",
        labelBadge: "Insignia de app",
        labelQuietStart: "Hora de inicio",
        labelQuietEnd: "Hora de fin",
        labelExportFmt: "Formato de exportación",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Unidad de velocidad",
        labelAutoCheck: "Auto diagnóstico al abrir",
        labelGuard: "Protección de toques accidentales",
        labelShowIp: "Mostrar IP en resultados",
        consentTitle: "📋 Antes de empezar",
        consentBody:
          "Esta app mide el hardware de tu dispositivo en el navegador. Los datos se procesan localmente y nunca se envían a servidores externos.",
        consentBtn: "Iniciar diagnóstico",
        consentTermsLink: "Términos de uso",
        consentUpdateTitle: "🔔 Aviso de actualización",
        consentUpdateBody:
          "Los términos de uso han sido actualizados. Por favor revísalos antes de continuar.",
        ipWarnTitle: "⚠️ ¿Incluir IP en captura?",
        ipWarnBody: "Compartir tu IP puede revelar ubicación e ISP.",
        ipHide: "🔒 Ocultar IP (recomendado)",
        ipMask: "⚠️ Enmascarar parcialmente",
        ipShow: "Incluir tal cual",
        ipNote: "※ IP se usa solo en el navegador.",
        ipBack: "← Volver (cancelar)",
        devWarnTitle: "📱 ¿Incluir modelo de dispositivo?",
        devShow: "Incluir tal cual",
        devHide: "🔒 Reemplazar con *",
        devNote: "※ El nombre del dispositivo proviene del UA.",
        devBack: "← Volver",
        loginRequired: "Se requiere inicio de sesión",
        loginMsg: " requiere login.",
        loginBtn: "Iniciar sesión con Google",
        cancelBtn: "Cancelar",
        logoutBtn: "Cerrar sesión",
        syncOk: "✓ Sincronizado",
        syncing: "Sincronizando...",
        syncFail: "⚠ Error de sync",
        synced: "✓ Sincronizando",
        friendCodeTitle: "Iniciar sesión con código",
        friendCodePlaceholder: "Introduce código...",
        friendCodeError: "Código incorrecto",
        friendLoginBtn: "Iniciar sesión",
        diagComplete: "✅ Diagnóstico completo",
        imgGenComplete: "✅ Imagen generada",
        retryConfirm:
          "¿Volver a diagnosticar?\nLos resultados actuales se sobrescribirán.",
        fpsAvgLabel: "FPS máximo",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
    pt: {
      statusTitle: "Verificando hardware...",
      evalMsg: "Verificando a integridade dos componentes",
      saveBtnTxt: "Salvar relatório como imagem",
      saveBtnCSV: "📊 Salvar como CSV",
      saveBtnPDF: "📄 Salvar como PDF",
      aiBtnTxt: "🤖 Consultar o assistente de IA",
      historyBtnTxt: "📊 Ver resultados anteriores",
      speedBtnTxt: "🔋 Teste de bateria",
      retryBtnTxt: "🔄 Rediagnosticar",
      rankMsgs: {
        S: "Desempenho de ponta",
        A: "Dispositivo de alto desempenho",
        B: "Desempenho padrão",
        C: "Desempenho abaixo da média",
        D: "Dispositivo antigo / de baixo nível",
      },
      bench: [
        "Medindo desempenho do CPU...",
        "Executando benchmarks",
        "Medindo renderização da GPU...",
        "Teste de carga WebGL e Canvas",
        "Medindo largura de banda da memória...",
        "Teste de acesso sequencial e aleatório",
        "Analisando memória do sistema...",
        "Integrando 5 métodos de estimativa",
        "Medindo velocidade de rede...",
        "Baixando dados para calcular largura de banda",
        "Medindo bateria e latência UI...",
        "Battery API e latência do thread UI",
        "Verificando modo de economia de energia...",
        "Medindo precisão do temporizador",
        "Medindo estabilidade da taxa de quadros...",
        "Método de jitter rAF 15 segundos",
      ],
      val: {
        supported: "Compatível",
        unsupported: "Não compatível",
        running: "Em execução",
        browser: "Navegador",
        secure: "Seguro (HTTPS/TLS)",
        insecure: "Não criptografado (HTTP)",
        detected: "⚠ Automação detectada",
        normal: "Normal (manual)",
        hidden: "Oculto",
        measuring: "Não é possível medir",
        failed: "Medição falhou (offline?)",
        fast: "Rápido",
        medium: "Normal",
        slow: "Lento",
        charging: "⚡ Carregando",
        discharging: "🔋 Descarregando",
        enabled: "Habilitado",
        disabled: "Desabilitado",
        dark: "Escuro:ON",
        light: "Escuro:OFF",
        hiconOn: "AltoContraste:ON",
        hiconOff: "AltoContraste:OFF",
        estimated: "Estimado",
        highPrec: "Alta precisão",
        midPrec: "Precisão média",
        gameExcellent: "◎ Excelente",
        gameSuitable: "○ Bom",
        gameHeavy: "△ Regular",
        gameUnsuitable: "✕ Ruim",
        videoExcellent: "◎ Excelente",
        videoSuitable: "○ Bom",
        videoUnstable: "△ Instável",
        videoUnsuitable: "✕ Ruim",
        ping: "Ping",
        jitter: "Jitter",
        latency: "Latência",
        stability: "Estabilidade",
        stable: "Estável",
        unstable: "Instável",
        inUse: "Em uso",
        unavailable: "Indisponível",
        wasmSupported: "Compatível",
        wasmUnsupported: "Não compatível",
        notifGranted: "Permitido",
        notifDenied: "Bloqueado",
        notifDefault: "Não definido",
        notifUnsupported: "Não compatível",
        compile: "Compilar",
      },
      ui: {
        legendBtn: "🎨 Ver indicadores de cor",
        shareHint:
          "💡 Você pode compartilhar no X pelo botão de download na prévia",
        speedDesc: "Mede o tempo de conexão aos principais sites.",
        speedNote: "※ Apenas referência devido às limitações do navegador.",
        fpsAvgDesc: "(Atualizações de tela por segundo. Maior = mais fluido)",
        fpsLowDesc: "(FPS nas cenas mais pesadas. Menor = mais travamentos)",
        uaDesc: "(String de informações do ambiente navegador/SO)",
        remaining: "Tempo restante est.: ~",
        seconds: " seg",
        fpsMeasuring: " seg (medindo FPS)",
        fpsCalc: "Calculando FPS...",
        finalizing: "Finalizando...",
        scoreLabel: "Pontuação",
        memLabel: "BW memória",
        fpsLabel: "Estab. FPS",
        netLabel: "NET",
        settingsTitle: "⚙️ Configurações",
        settingsReset: "🔄 Redefinir",
        settingsResetConfirm: "Redefinir todas as configurações?",
        secAppearance: "🎨 Aparência",
        secLanguage: "🌐 Idioma",
        secNotify: "🔔 Notificações",
        secQuiet: "😴 Horas de silêncio",
        secData: "💾 Dados",
        labelTheme: "Tema",
        optDark: "Escuro",
        optLight: "Claro",
        optSystem: "Sistema",
        labelFontSize: "Tamanho da fonte",
        optSmall: "Pequeno",
        optNormal: "Normal",
        optLarge: "Grande",
        optCustom: "Personalizado",
        labelCustomSize: "Tamanho personalizado",
        labelLanguage: "Idioma",
        labelTransGuard: "Proteção Google Tradutor",
        labelSound: "Som de conclusão",
        labelVibration: "Vibração",
        labelDesktopNotify: "Notificação área de trabalho",
        labelBadge: "Emblema de app",
        labelQuietStart: "Hora de início",
        labelQuietEnd: "Hora de fim",
        labelExportFmt: "Formato de exportação",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Unidade de velocidade",
        labelAutoCheck: "Diagnóstico auto ao abrir",
        labelGuard: "Proteção de toque acidental",
        labelShowIp: "Mostrar IP nos resultados",
        consentTitle: "📋 Antes de começar",
        consentBody:
          "Este app mede o hardware do seu dispositivo no navegador. Os dados são processados localmente e nunca enviados a servidores externos.",
        consentBtn: "Iniciar diagnóstico",
        consentTermsLink: "Termos de uso",
        consentUpdateTitle: "🔔 Aviso de atualização",
        consentUpdateBody:
          "Os termos de uso foram parcialmente atualizados. Por favor revise antes de continuar.",
        ipWarnTitle: "⚠️ Incluir IP na captura?",
        ipWarnBody: "Compartilhar IP pode revelar localização e ISP.",
        ipHide: "🔒 Ocultar IP (recomendado)",
        ipMask: "⚠️ Mascarar parcialmente",
        ipShow: "Incluir como está",
        ipNote: "※ IP é usado apenas no navegador.",
        ipBack: "← Voltar (cancelar)",
        devWarnTitle: "📱 Incluir modelo do dispositivo?",
        devShow: "Incluir como está",
        devHide: "🔒 Substituir por *",
        devNote: "※ Nome do dispositivo vem do UA.",
        devBack: "← Voltar",
        loginRequired: "Login necessário",
        loginMsg: " requer login.",
        loginBtn: "Entrar com Google",
        cancelBtn: "Cancelar",
        logoutBtn: "Sair",
        syncOk: "✓ Sincronizado",
        syncing: "Sincronizando...",
        syncFail: "⚠ Falha de sync",
        synced: "✓ Sincronizando",
        friendCodeTitle: "Entrar com código amigo",
        friendCodePlaceholder: "Digite o código...",
        friendCodeError: "Código incorreto",
        friendLoginBtn: "Entrar",
        diagComplete: "✅ Diagnóstico concluído",
        imgGenComplete: "✅ Imagem gerada",
        retryConfirm:
          "Rediagnosticar?\nOs resultados atuais serão sobrescritos.",
        fpsAvgLabel: "FPS médio",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
    fr: {
      statusTitle: "Analyse du matériel...",
      evalMsg: "Vérification de l'intégrité des composants",
      saveBtnTxt: "Enregistrer le rapport en image",
      saveBtnCSV: "📊 Enregistrer en CSV",
      saveBtnPDF: "📄 Enregistrer en PDF",
      aiBtnTxt: "🤖 Consulter le conseiller IA",
      historyBtnTxt: "📊 Voir les résultats passés",
      speedBtnTxt: "🔋 Test de décharge batterie",
      retryBtnTxt: "🔄 Re-diagnostiquer",
      rankMsgs: {
        S: "Performance haut de gamme",
        A: "Appareil haute performance",
        B: "Performance standard",
        C: "Performance en dessous de la moyenne",
        D: "Appareil ancien / bas de gamme",
      },
      bench: [
        "Mesure des performances CPU...",
        "Exécution des benchmarks",
        "Mesure du rendu GPU...",
        "Test de charge WebGL et Canvas",
        "Mesure de la bande passante mémoire...",
        "Test d'accès séquentiel et aléatoire",
        "Analyse précise de la mémoire système...",
        "Intégration de 5 méthodes d'estimation",
        "Mesure de la vitesse réseau...",
        "Téléchargement de données pour calculer la bande passante",
        "Mesure de la batterie et latence UI...",
        "Battery API et latence du thread UI",
        "Vérification du mode économie d'énergie...",
        "Mesure de la précision du minuteur",
        "Mesure de la stabilité du taux de frames...",
        "Méthode jitter rAF 15 secondes",
      ],
      val: {
        supported: "Supporté",
        unsupported: "Non supporté",
        running: "En cours",
        browser: "Navigateur",
        secure: "Sécurisé (HTTPS/TLS)",
        insecure: "Non chiffré (HTTP)",
        detected: "⚠ Automatisation détectée",
        normal: "Normal (manuel)",
        hidden: "Masqué",
        measuring: "Impossible à mesurer",
        failed: "Mesure échouée (hors ligne?)",
        fast: "Rapide",
        medium: "Moyen",
        slow: "Lent",
        charging: "⚡ En charge",
        discharging: "🔋 Décharge",
        enabled: "Activé",
        disabled: "Désactivé",
        dark: "Sombre:ON",
        light: "Sombre:OFF",
        hiconOn: "HautContraste:ON",
        hiconOff: "HautContraste:OFF",
        estimated: "Estimé",
        highPrec: "Haute précision",
        midPrec: "Précision moyenne",
        gameExcellent: "◎ Excellent",
        gameSuitable: "○ Bon",
        gameHeavy: "△ Moyen",
        gameUnsuitable: "✕ Mauvais",
        videoExcellent: "◎ Excellent",
        videoSuitable: "○ Bon",
        videoUnstable: "△ Instable",
        videoUnsuitable: "✕ Mauvais",
        ping: "Ping",
        jitter: "Gigue",
        latency: "Latence",
        stability: "Stabilité",
        stable: "Stable",
        unstable: "Instable",
        inUse: "En cours",
        unavailable: "Indisponible",
        wasmSupported: "Supporté",
        wasmUnsupported: "Non supporté",
        notifGranted: "Autorisé",
        notifDenied: "Bloqué",
        notifDefault: "Non défini",
        notifUnsupported: "Non supporté",
        compile: "Compiler",
      },
      ui: {
        legendBtn: "🎨 Voir les indicateurs de couleur",
        shareHint:
          "💡 Vous pouvez partager sur X depuis le bouton de téléchargement",
        speedDesc: "Mesure le temps de connexion aux sites principaux.",
        speedNote:
          "※ Valeur de référence en raison des limitations du navigateur.",
        fpsAvgDesc:
          "(Actualisations d'écran par seconde. Plus élevé = plus fluide)",
        fpsLowDesc:
          "(FPS dans les scènes les plus lourdes. Plus bas = plus de saccades)",
        uaDesc: "(Chaîne d'informations sur l'environnement navigateur/OS)",
        remaining: "Temps restant est.: ~",
        seconds: " sec",
        fpsMeasuring: " sec (mesure FPS)",
        fpsCalc: "Calcul FPS...",
        finalizing: "Finalisation...",
        scoreLabel: "Score",
        memLabel: "BW mémoire",
        fpsLabel: "Stab. FPS",
        netLabel: "NET",
        settingsTitle: "⚙️ Paramètres",
        settingsReset: "🔄 Réinitialiser",
        settingsResetConfirm: "Réinitialiser tous les paramètres ?",
        secAppearance: "🎨 Apparence",
        secLanguage: "🌐 Langue",
        secNotify: "🔔 Notifications",
        secQuiet: "😴 Heures calmes",
        secData: "💾 Données",
        labelTheme: "Thème",
        optDark: "Sombre",
        optLight: "Clair",
        optSystem: "Système",
        labelFontSize: "Taille de police",
        optSmall: "Petit",
        optNormal: "Normal",
        optLarge: "Grand",
        optCustom: "Personnalisé",
        labelCustomSize: "Taille personnalisée",
        labelLanguage: "Langue",
        labelTransGuard: "Protection Google Translate",
        labelSound: "Son de fin",
        labelVibration: "Vibration",
        labelDesktopNotify: "Notification bureau",
        labelBadge: "Badge d'app",
        labelQuietStart: "Heure de début",
        labelQuietEnd: "Heure de fin",
        labelExportFmt: "Format d'export",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Unité de vitesse",
        labelAutoCheck: "Diagnostic auto à l'ouverture",
        labelGuard: "Protection erreur tactile",
        labelShowIp: "Afficher l'IP dans les résultats",
        consentTitle: "📋 Avant de commencer",
        consentBody:
          "Cette app mesure le matériel de votre appareil dans le navigateur. Les données sont traitées localement et ne sont jamais envoyées à des serveurs externes.",
        consentBtn: "Démarrer le diagnostic",
        consentTermsLink: "Conditions d'utilisation",
        consentUpdateTitle: "🔔 Avis de mise à jour",
        consentUpdateBody:
          "Les conditions d'utilisation ont été partiellement mises à jour. Veuillez les vérifier avant de continuer.",
        ipWarnTitle: "⚠️ Inclure l'IP dans la capture ?",
        ipWarnBody: "Partager votre IP peut révéler emplacement et FAI.",
        ipHide: "🔒 Masquer l'IP (recommandé)",
        ipMask: "⚠️ Masquer partiellement",
        ipShow: "Inclure tel quel",
        ipNote: "※ L'IP est utilisée uniquement dans le navigateur.",
        ipBack: "← Retour (annuler)",
        devWarnTitle: "📱 Inclure le modèle ?",
        devShow: "Inclure tel quel",
        devHide: "🔒 Remplacer par *",
        devNote: "※ Le nom de l'appareil provient de l'UA.",
        devBack: "← Retour",
        loginRequired: "Connexion requise",
        loginMsg: " nécessite une connexion.",
        loginBtn: "Se connecter avec Google",
        cancelBtn: "Annuler",
        logoutBtn: "Déconnexion",
        syncOk: "✓ Synchronisé",
        syncing: "Synchronisation...",
        syncFail: "⚠ Échec sync",
        synced: "✓ Synchronisation",
        friendCodeTitle: "Connexion avec code ami",
        friendCodePlaceholder: "Entrez le code...",
        friendCodeError: "Code incorrect",
        friendLoginBtn: "Connexion",
        diagComplete: "✅ Diagnostic terminé",
        imgGenComplete: "✅ Image générée",
        retryConfirm:
          "Re-diagnostiquer ?\nLes résultats actuels seront écrasés.",
        fpsAvgLabel: "FPS moyen",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
    de: {
      statusTitle: "Hardware wird gescannt...",
      evalMsg: "Komponentenintegrität wird überprüft",
      saveBtnTxt: "Bericht als Bild speichern",
      saveBtnCSV: "📊 Als CSV speichern",
      saveBtnPDF: "📄 Als PDF speichern",
      aiBtnTxt: "🤖 KI-Berater fragen",
      historyBtnTxt: "📊 Vergangene Ergebnisse ansehen",
      speedBtnTxt: "🔋 Akku-Verbrauchstest",
      retryBtnTxt: "🔄 Neu diagnostizieren",
      rankMsgs: {
        S: "Spitzenklasse-Leistung",
        A: "Hochleistungsgerät",
        B: "Standardleistung",
        C: "Unterdurchschnittliche Leistung",
        D: "Altes / Low-End-Gerät",
      },
      bench: [
        "CPU-Leistung wird gemessen...",
        "Benchmarks werden ausgeführt",
        "GPU-Rendering wird gemessen...",
        "WebGL- und Canvas-Lasttest",
        "Speicherbandbreite wird gemessen...",
        "Sequentieller und zufälliger Zugriffstest",
        "Systemspeicher wird analysiert...",
        "5 Schätzmethoden werden integriert",
        "Netzwerkgeschwindigkeit wird gemessen...",
        "Daten herunterladen zur Bandbreitenberechnung",
        "Akku und UI-Latenz werden gemessen...",
        "Battery API und UI-Thread-Latenz",
        "Energiesparmodus wird überprüft...",
        "Timer-Genauigkeit wird gemessen",
        "Framerate-Stabilität wird gemessen...",
        "rAF-Jitter-Methode 15-Sekunden-Test",
      ],
      val: {
        supported: "Unterstützt",
        unsupported: "Nicht unterstützt",
        running: "Aktiv",
        browser: "Browser",
        secure: "Sicher (HTTPS/TLS)",
        insecure: "Unverschlüsselt (HTTP)",
        detected: "⚠ Automatisierung erkannt",
        normal: "Normal (manuell)",
        hidden: "Ausgeblendet",
        measuring: "Nicht messbar",
        failed: "Messung fehlgeschlagen (offline?)",
        fast: "Schnell",
        medium: "Mittel",
        slow: "Langsam",
        charging: "⚡ Lädt",
        discharging: "🔋 Entlädt",
        enabled: "Aktiviert",
        disabled: "Deaktiviert",
        dark: "Dunkel:EIN",
        light: "Dunkel:AUS",
        hiconOn: "HohKontrast:EIN",
        hiconOff: "HohKontrast:AUS",
        estimated: "Geschätzt",
        highPrec: "Hohe Genauigkeit",
        midPrec: "Mittlere Genauigkeit",
        gameExcellent: "◎ Ausgezeichnet",
        gameSuitable: "○ Gut",
        gameHeavy: "△ Mittel",
        gameUnsuitable: "✕ Schlecht",
        videoExcellent: "◎ Ausgezeichnet",
        videoSuitable: "○ Gut",
        videoUnstable: "△ Instabil",
        videoUnsuitable: "✕ Schlecht",
        ping: "Ping",
        jitter: "Jitter",
        latency: "Latenz",
        stability: "Stabilität",
        stable: "Stabil",
        unstable: "Instabil",
        inUse: "Belegt",
        unavailable: "Nicht verfügbar",
        wasmSupported: "Unterstützt",
        wasmUnsupported: "Nicht unterstützt",
        notifGranted: "Erlaubt",
        notifDenied: "Gesperrt",
        notifDefault: "Nicht gesetzt",
        notifUnsupported: "Nicht unterstützt",
        compile: "Kompilieren",
      },
      ui: {
        legendBtn: "🎨 Farbanzeigen anzeigen",
        shareHint:
          "💡 Sie können über den Download-Button in der Vorschau auf X teilen",
        speedDesc: "Misst die Verbindungszeit zu wichtigen Websites.",
        speedNote: "※ Nur Referenzwert aufgrund von Browser-Einschränkungen.",
        fpsAvgDesc:
          "(Bildschirmaktualisierungen pro Sekunde. Höher = flüssiger)",
        fpsLowDesc: "(FPS in den schwersten Szenen. Niedriger = mehr Stottern)",
        uaDesc: "(Browser-/OS-Umgebungsinformationszeichenkette)",
        remaining: "Geschätzte Restzeit: ~",
        seconds: " Sek",
        fpsMeasuring: " Sek (FPS-Messung)",
        fpsCalc: "FPS wird berechnet...",
        finalizing: "Wird abgeschlossen...",
        scoreLabel: "Gesamt",
        memLabel: "Speicher BW",
        fpsLabel: "FPS Stab.",
        netLabel: "NET",
        settingsTitle: "⚙️ Einstellungen",
        settingsReset: "🔄 Zurücksetzen",
        settingsResetConfirm: "Alle Einstellungen zurücksetzen?",
        secAppearance: "🎨 Erscheinungsbild",
        secLanguage: "🌐 Sprache",
        secNotify: "🔔 Benachrichtigungen",
        secQuiet: "😴 Ruhezeiten",
        secData: "💾 Daten",
        labelTheme: "Design",
        optDark: "Dunkel",
        optLight: "Hell",
        optSystem: "System",
        labelFontSize: "Schriftgröße",
        optSmall: "Klein",
        optNormal: "Normal",
        optLarge: "Groß",
        optCustom: "Benutzerdefiniert",
        labelCustomSize: "Benutzerdefinierte Größe",
        labelLanguage: "Sprache",
        labelTransGuard: "Google Translate Schutz",
        labelSound: "Abschluss-Sound",
        labelVibration: "Vibration",
        labelDesktopNotify: "Desktop-Benachrichtigung",
        labelBadge: "App-Badge",
        labelQuietStart: "Startzeit",
        labelQuietEnd: "Endzeit",
        labelExportFmt: "Exportformat",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Geschwindigkeitseinheit",
        labelAutoCheck: "Beim Öffnen diagnostizieren",
        labelGuard: "Tippschutz",
        labelShowIp: "IP-Adresse in Ergebnissen anzeigen",
        consentTitle: "📋 Vor dem Start",
        consentBody:
          "Diese App misst die Hardware Ihres Geräts im Browser. Alle Daten werden lokal verarbeitet und niemals an externe Server gesendet.",
        consentBtn: "Diagnose starten",
        consentTermsLink: "Nutzungsbedingungen",
        consentUpdateTitle: "🔔 Update-Hinweis",
        consentUpdateBody:
          "Die Nutzungsbedingungen wurden teilweise aktualisiert. Bitte prüfen Sie diese vor dem Start.",
        ipWarnTitle: "⚠️ IP-Adresse im Screenshot?",
        ipWarnBody: "Ihre IP kann Standort und ISP enthüllen.",
        ipHide: "🔒 IP verbergen (empfohlen)",
        ipMask: "⚠️ Teilweise maskieren",
        ipShow: "So einbeziehen",
        ipNote: "※ IP wird nur im Browser verwendet.",
        ipBack: "← Zurück (Abbrechen)",
        devWarnTitle: "📱 Gerätemodell einschließen?",
        devShow: "So einbeziehen",
        devHide: "🔒 Durch * ersetzen",
        devNote: "※ Gerätename stammt aus UA.",
        devBack: "← Zurück",
        loginRequired: "Anmeldung erforderlich",
        loginMsg: " erfordert Anmeldung.",
        loginBtn: "Mit Google anmelden",
        cancelBtn: "Abbrechen",
        logoutBtn: "Abmelden",
        syncOk: "✓ Synchronisiert",
        syncing: "Synchronisierung...",
        syncFail: "⚠ Sync fehlgeschlagen",
        synced: "✓ Synchronisierung",
        friendCodeTitle: "Mit Code anmelden",
        friendCodePlaceholder: "Code eingeben...",
        friendCodeError: "Falscher Code",
        friendLoginBtn: "Anmelden",
        diagComplete: "✅ Diagnose abgeschlossen",
        imgGenComplete: "✅ Bild erstellt",
        retryConfirm:
          "Neu diagnostizieren?\nAktuelle Ergebnisse werden überschrieben.",
        fpsAvgLabel: "Durchschnittliche FPS",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
    ru: {
      statusTitle: "Сканирование оборудования...",
      evalMsg: "Проверка целостности компонентов",
      saveBtnTxt: "Сохранить отчёт как изображение",
      saveBtnCSV: "📊 Сохранить как CSV",
      saveBtnPDF: "📄 Сохранить как PDF",
      aiBtnTxt: "🤖 Спросить ИИ-советника",
      historyBtnTxt: "📊 Просмотр прошлых результатов",
      speedBtnTxt: "🔋 Тест расхода батареи",
      retryBtnTxt: "🔄 Диагностировать снова",
      rankMsgs: {
        S: "Флагманская производительность",
        A: "Высокопроизводительное устройство",
        B: "Стандартная производительность",
        C: "Ниже среднего",
        D: "Устаревшее / бюджетное устройство",
      },
      bench: [
        "Измерение производительности CPU...",
        "Запуск бенчмарков",
        "Измерение рендеринга GPU...",
        "Нагрузочный тест WebGL и Canvas",
        "Измерение пропускной способности памяти...",
        "Последовательный и случайный доступ",
        "Точный анализ системной памяти...",
        "Интеграция 5 методов оценки",
        "Измерение скорости сети...",
        "Загрузка данных для расчёта пропускной способности",
        "Измерение батареи и задержки UI...",
        "Battery API и задержка UI-потока",
        "Проверка режима энергосбережения...",
        "Измерение точности таймера",
        "Измерение стабильности частоты кадров...",
        "Метод дрожания rAF 15 секунд",
      ],
      val: {
        supported: "Поддерживается",
        unsupported: "Не поддерживается",
        running: "Работает",
        browser: "Браузер",
        secure: "Защищено (HTTPS/TLS)",
        insecure: "Не зашифровано (HTTP)",
        detected: "⚠ Обнаружена автоматизация",
        normal: "Нормально (вручную)",
        hidden: "Скрыто",
        measuring: "Не удаётся измерить",
        failed: "Измерение не удалось (офлайн?)",
        fast: "Быстро",
        medium: "Средне",
        slow: "Медленно",
        charging: "⚡ Заряжается",
        discharging: "🔋 Разряжается",
        enabled: "Включено",
        disabled: "Отключено",
        dark: "Тёмная:ВКЛ",
        light: "Тёмная:ВЫКЛ",
        hiconOn: "ВысКонтраст:ВКЛ",
        hiconOff: "ВысКонтраст:ВЫКЛ",
        estimated: "Оценка",
        highPrec: "Высокая точность",
        midPrec: "Средняя точность",
        gameExcellent: "◎ Отлично",
        gameSuitable: "○ Хорошо",
        gameHeavy: "△ Средне",
        gameUnsuitable: "✕ Плохо",
        videoExcellent: "◎ Отлично",
        videoSuitable: "○ Хорошо",
        videoUnstable: "△ Нестабильно",
        videoUnsuitable: "✕ Плохо",
        ping: "Пинг",
        jitter: "Джиттер",
        latency: "Задержка",
        stability: "Стабильность",
        stable: "Стабильно",
        unstable: "Нестабильно",
        inUse: "Используется",
        unavailable: "Недоступно",
        wasmSupported: "Поддерживается",
        wasmUnsupported: "Не поддерживается",
        notifGranted: "Разрешено",
        notifDenied: "Заблокировано",
        notifDefault: "Не задано",
        notifUnsupported: "Не поддерживается",
        compile: "Компиляция",
      },
      ui: {
        legendBtn: "🎨 Просмотр цветовых индикаторов",
        shareHint: "💡 Вы можете поделиться в X через кнопку загрузки в превью",
        speedDesc: "Измеряет время подключения к основным сайтам.",
        speedNote: "※ Только справочное значение из-за ограничений браузера.",
        fpsAvgDesc: "(Обновлений экрана в секунду. Выше = плавнее)",
        fpsLowDesc: "(FPS в самых тяжёлых сценах. Ниже = больше рывков)",
        uaDesc: "(Строка информации об окружении браузера/ОС)",
        remaining: "Осталось примерно: ~",
        seconds: " сек",
        fpsMeasuring: " сек (измерение FPS)",
        fpsCalc: "Расчёт FPS...",
        finalizing: "Завершение...",
        scoreLabel: "Итог",
        memLabel: "Пропускная",
        fpsLabel: "Стаб. FPS",
        netLabel: "NET",
        settingsTitle: "⚙️ Настройки",
        settingsReset: "🔄 Сбросить",
        settingsResetConfirm: "Сбросить все настройки?",
        secAppearance: "🎨 Внешний вид",
        secLanguage: "🌐 Язык",
        secNotify: "🔔 Уведомления",
        secQuiet: "😴 Тихие часы",
        secData: "💾 Данные",
        labelTheme: "Тема",
        optDark: "Тёмная",
        optLight: "Светлая",
        optSystem: "Системная",
        labelFontSize: "Размер шрифта",
        optSmall: "Малый",
        optNormal: "Обычный",
        optLarge: "Крупный",
        optCustom: "Свой размер",
        labelCustomSize: "Свой размер",
        labelLanguage: "Язык",
        labelTransGuard: "Защита от Google Переводчика",
        labelSound: "Звук завершения",
        labelVibration: "Вибрация",
        labelDesktopNotify: "Уведомление рабочего стола",
        labelBadge: "Значок приложения",
        labelQuietStart: "Начало",
        labelQuietEnd: "Конец",
        labelExportFmt: "Формат экспорта",
        optPNG: "PNG",
        optCSV: "CSV",
        optPDF: "PDF",
        labelSpeedUnit: "Единица скорости",
        labelAutoCheck: "Авто-диагностика при открытии",
        labelGuard: "Защита от случайных нажатий",
        labelShowIp: "Показывать IP в результатах",
        consentTitle: "📋 Перед началом",
        consentBody:
          "Это приложение измеряет аппаратные характеристики вашего устройства в браузере. Все данные обрабатываются локально и никогда не отправляются на внешние серверы.",
        consentBtn: "Начать диагностику",
        consentTermsLink: "Условия использования",
        consentUpdateTitle: "🔔 Уведомление об обновлении",
        consentUpdateBody:
          "Условия использования были частично обновлены. Пожалуйста, ознакомьтесь перед началом.",
        ipWarnTitle: "⚠️ Включить IP-адрес в скриншот?",
        ipWarnBody: "Публичный IP может раскрыть местоположение и ISP.",
        ipHide: "🔒 Скрыть IP (рекомендуется)",
        ipMask: "⚠️ Частично маскировать",
        ipShow: "Оставить как есть",
        ipNote: "※ IP используется только в браузере.",
        ipBack: "← Назад (отмена)",
        devWarnTitle: "📱 Включить модель устройства?",
        devShow: "Оставить как есть",
        devHide: "🔒 Заменить на *",
        devNote: "※ Имя устройства из UA.",
        devBack: "← Назад",
        loginRequired: "Требуется вход",
        loginMsg: " требует входа.",
        loginBtn: "Войти через Google",
        cancelBtn: "Отмена",
        logoutBtn: "Выйти",
        syncOk: "✓ Синхронизировано",
        syncing: "Синхронизация...",
        syncFail: "⚠ Ошибка sync",
        synced: "✓ Синхронизация",
        friendCodeTitle: "Войти с кодом друга",
        friendCodePlaceholder: "Введите код...",
        friendCodeError: "Неверный код",
        friendLoginBtn: "Войти",
        diagComplete: "✅ Диагностика завершена",
        imgGenComplete: "✅ Изображение создано",
        retryConfirm:
          "Диагностировать снова?\nТекущие результаты будут перезаписаны.",
        fpsAvgLabel: "Средний FPS",
        fpsLowLabel: "1% LOW FPS",
        uaLabel: "User Agent",
      },
    },
  };
function applyLanguage() {
  try {
    const e = _settings.language,
      t = I18N[e] || I18N.ja,
      n = I18N_LABELS[e] || I18N_LABELS.ja;
    LABEL_ROW_IDS.forEach((e, t) => {
      try {
        const o = document.getElementById("row-" + e);
        if (!o) return;
        const i = o.querySelector(".label");
        if (!i) return;
        const a = i.querySelector(".help");
        ((i.textContent = n[t] || ""), a && i.appendChild(a));
      } catch (e) {}
    });
    const o = tui(),
      i = document.getElementById("legend-btn");
    i && (i.textContent = o.legendBtn);
    const a = document.getElementById("share-hint");
    a && (a.textContent = o.shareHint);
    try {
      const e = document.querySelectorAll(".info-panel");
      [
        [0, o.fpsAvgLabel, o.fpsAvgDesc],
        [1, o.fpsLowLabel, o.fpsLowDesc],
        [2, o.uaLabel, o.uaDesc],
      ].forEach(([t, n, o]) => {
        const i = e[t];
        if (!i) return;
        const a = i.querySelector("label");
        if (!a) return;
        const r = Array.from(a.childNodes).find((e) => 3 === e.nodeType);
        r && (r.textContent = n);
        const s = a.querySelector(".desc");
        s && (s.textContent = o);
      });
    } catch (e) {}
    const r = document.getElementById("save-btn"),
      s = document.getElementById("ai-btn"),
      d = document.getElementById("history-btn"),
      l = document.getElementById("speed-btn"),
      c = document.getElementById("retry-btn");
    if (r) {
      const e = _settings.exportFormat || "png";
      r.textContent =
        "csv" === e
          ? t.saveBtnCSV || "📊 CSVで保存する"
          : "pdf" === e
            ? t.saveBtnPDF || "📄 PDFで保存する"
            : t.saveBtnTxt;
    }
    (s && (s.textContent = t.aiBtnTxt),
      d && (d.textContent = t.historyBtnTxt),
      l && (l.textContent = t.speedBtnTxt),
      c && (c.textContent = t.retryBtnTxt));
    try {
      const e = document.getElementById("rank-letter");
      if (e && "?" !== e.textContent) {
        const n = e.textContent,
          o = document.getElementById("status-title");
        o && t.rankMsgs[n] && (o.textContent = t.rankMsgs[n]);
      }
    } catch (e) {}
    try {
      const e = document.getElementById("auth-login-label"),
        t = document.getElementById("auth-logout-btn"),
        n = document.getElementById("auth-friend-label"),
        i = document.getElementById("auth-modal-title"),
        a = document.getElementById("auth-modal-login-label"),
        r = document.getElementById("auth-modal-cancel");
      (e && (e.textContent = o.loginBtn),
        t && (t.textContent = o.logoutBtn),
        n &&
          (n.textContent =
            o.friendCodeTitle.split("で")[0] || o.friendCodeTitle),
        i && (i.textContent = o.loginRequired),
        a && (a.textContent = o.loginBtn),
        r && (r.textContent = o.cancelBtn));
    } catch (e) {}
    try {
      const e = _settings.language,
        t = TERMS_I18N[e] || TERMS_I18N.ja,
        n = document.getElementById("footer-terms-label");
      n && (n.textContent = t.footer);
      const o = document.getElementById("footer-feedback-label"),
        i = FB_I18N[e] || FB_I18N.ja;
      o && (o.textContent = i.title.replace("💬 ", ""));
      const a = document.getElementById("footer-datamgmt-label");
      a && (a.textContent = "en" === e ? "Data Mgmt" : "データ管理");
      const r = document.getElementById("footer-restoreguide-label");
      r && (r.textContent = "en" === e ? "Restore Guide" : "復元ガイド");
      const s = document.getElementById("footer-howto-label");
      s && (s.textContent = "en" === e ? "How To Use" : "使い方");
    } catch (e) {}
  } catch (e) {
    console.warn("applyLanguage error:", e);
  }
}
function _getLang() {
  return I18N[_settings.language] || I18N.ja;
}
function tv() {
  return _getLang().val || I18N.ja.val;
}
function tui() {
  return _getLang().ui || I18N.ja.ui;
}
function applySettings() {
  const e = document.documentElement,
    t =
      "system" === _settings.theme
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : _settings.theme;
  e.setAttribute("data-theme", t);
  const n = {
    small: "13px",
    normal: "15px",
    large: "20px",
    custom: (_settings.customFontSize || 15) + "px",
  };
  e.style.setProperty("--base-font-size", n[_settings.fontSize] || "15px");
  const o = {
      system:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      serif:
        'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", serif',
      mono: '"SF Mono", "Fira Code", "JetBrains Mono", Consolas, monospace',
      rounded:
        '"Hiragino Maru Gothic ProN", "M PLUS Rounded 1c", "Nunito", sans-serif',
      gothic: '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
    },
    i = _settings.fontFamily || "system";
  o[i]
    ? e.style.setProperty("--app-font", o[i])
    : e.style.setProperty("--app-font", `"${i}", sans-serif`);
  const a = document.querySelector('meta[name="google"]');
  if (_settings.translateGuard) {
    if (!a) {
      const e = document.createElement("meta");
      ((e.name = "google"),
        (e.content = "notranslate"),
        document.head.appendChild(e));
    }
    document.documentElement.setAttribute("translate", "no");
  } else
    (a && a.remove(), document.documentElement.removeAttribute("translate"));
  applyLanguage();
  const r = document.getElementById("row-31"),
    s = document.getElementById("v-31");
  if (r && s)
    if (_settings.showIpInResult && diag.publicIP) {
      const e = "function" == typeof isPrivateIP && isPrivateIP(diag.publicIP);
      ((s.textContent = diag.publicIP + (e ? " (local)" : "")),
        (r.className = "spec-row st-good"),
        (r.style.display = ""));
    } else r.style.display = "none";
}
function _isIPhoneSE() {
  const e = navigator.userAgent;
  if (!/iphone/i.test(e)) return !1;
  const t = screen.width,
    n = screen.height,
    o = window.devicePixelRatio,
    i = Math.min(t, n) + "x" + Math.max(t, n) + "@" + o;
  return "320x568@2" === i || "375x667@2" === i;
}
let _audioCtx = null;
function _initAudioCtx() {
  if (_isIPhoneSE() && !_audioCtx)
    try {
      ((_audioCtx = new (window.AudioContext || window.webkitAudioContext)()),
        "suspended" === _audioCtx.state && _audioCtx.resume().catch(() => {}));
    } catch (e) {}
}
function playDoneSound() {
  if (!_settings.soundOnDone) return;
  const e = _settings.soundPreset || "default";
  if ("custom" === e && _settings.soundFileDataUrl)
    try {
      const e = new Audio(_settings.soundFileDataUrl);
      ((e.volume = 0.7), e.play().catch(() => {}));
    } catch (e) {}
  else
    try {
      const t =
          _isIPhoneSE() && _audioCtx
            ? _audioCtx
            : new (window.AudioContext || window.webkitAudioContext)(),
        n = () => {
          if ("bell" === e)
            [880, 1108, 1318].forEach((e, n) => {
              const o = t.createOscillator(),
                i = t.createGain();
              (o.connect(i),
                i.connect(t.destination),
                (o.type = "sine"),
                (o.frequency.value = e));
              const a = t.currentTime + 0.18 * n;
              (i.gain.setValueAtTime(0.25, a),
                i.gain.exponentialRampToValueAtTime(0.001, a + 0.8),
                o.start(a),
                o.stop(a + 0.8));
            });
          else if ("beep" === e) {
            const e = t.createOscillator(),
              n = t.createGain();
            (e.connect(n),
              n.connect(t.destination),
              (e.type = "square"),
              (e.frequency.value = 880));
            const o = t.currentTime;
            (n.gain.setValueAtTime(0.15, o),
              n.gain.exponentialRampToValueAtTime(0.001, o + 0.12),
              e.start(o),
              e.stop(o + 0.12));
          } else
            "fanfare" === e
              ? [523, 659, 784, 1047, 784, 1047, 1319].forEach((e, n) => {
                  const o = t.createOscillator(),
                    i = t.createGain();
                  (o.connect(i),
                    i.connect(t.destination),
                    (o.type = "triangle"),
                    (o.frequency.value = e));
                  const a = t.currentTime + 0.1 * n;
                  (i.gain.setValueAtTime(0.2, a),
                    i.gain.exponentialRampToValueAtTime(0.001, a + 0.15),
                    o.start(a),
                    o.stop(a + 0.15));
                })
              : [523, 659, 784, 1047].forEach((e, n) => {
                  const o = t.createOscillator(),
                    i = t.createGain();
                  (o.connect(i),
                    i.connect(t.destination),
                    (o.type = "sine"),
                    (o.frequency.value = e));
                  const a = t.currentTime + 0.12 * n;
                  (i.gain.setValueAtTime(0.18, a),
                    i.gain.exponentialRampToValueAtTime(0.001, a + 0.25),
                    o.start(a),
                    o.stop(a + 0.25));
                });
        };
      "suspended" === t.state
        ? t
            .resume()
            .then(n)
            .catch(() => {})
        : n();
    } catch (e) {}
}
function vibrateOnDone() {
  if (_settings.vibration)
    try {
      navigator.vibrate && navigator.vibrate([100, 50, 100]);
    } catch (e) {}
}
async function notifyOnDone(e, t) {
  _settings.desktopNotify &&
    (isQuietTime() ||
      ("granted" === Notification.permission &&
        new Notification("診断完了！" + e, {
          body: `総合スコア ${t}点`,
          icon: "./android-chrome-192x192.png",
          silent: !0,
        })));
}
async function setBadge() {
  if (_settings.badge)
    try {
      navigator.setAppBadge && (await navigator.setAppBadge(1));
    } catch (e) {}
}
async function clearBadge() {
  try {
    navigator.clearAppBadge && (await navigator.clearAppBadge());
  } catch (e) {}
}
function isQuietTime() {
  try {
    const e = new Date(),
      t = 60 * e.getHours() + e.getMinutes(),
      [n, o] = _settings.quietStart.split(":").map(Number),
      [i, a] = _settings.quietEnd.split(":").map(Number),
      r = 60 * n + o,
      s = 60 * i + a;
    return r > s ? t >= r || t < s : t >= r && t < s;
  } catch (e) {
    return !1;
  }
}
function formatSpeed(e) {
  return null == e
    ? null
    : "mbs" === _settings.speedUnit
      ? Math.round((e / 8) * 10) / 10 + " MB/s"
      : e + " Mbps";
}
function guardedRetry() {
  (_settings.clumsiGuard && !confirm(tui().retryConfirm)) || retryDiagnostic();
}
async function openSettings() {
  let e = document.getElementById("settings-modal");
  (e ||
    ((e = document.createElement("div")),
    (e.id = "settings-modal"),
    (e.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999990;display:flex;justify-content:center;align-items:flex-end;padding:0;box-sizing:border-box;overflow-y:auto;"),
    document.body.appendChild(e)),
    (document.body.style.overflow = "hidden"));
  const t = tui(),
    n = await settingFontFamily(t);
  ((e.innerHTML = `\n    <div style="background:var(--card);border-radius:24px 24px 0 0;width:100%;max-width:520px;margin:0 auto;max-height:92vh;overflow-y:auto;padding:0 0 40px;box-sizing:border-box;display:flex;flex-direction:column;">\n        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;position:sticky;top:0;background:var(--card);z-index:1;border-radius:24px 24px 0 0;">\n            <h2 style="margin:0;font-size:1.2rem;font-weight:900;color:var(--text);">${t.settingsTitle}</h2>\n            <button onclick="closeSettings()" style="background:var(--border);border:none;color:var(--sub-text);width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>\n        </div>\n\n        <div style="padding:0 20px;">\n        ${settingSection(
    t.secAppearance,
    [
      settingSelect(
        t.labelTheme,
        "theme",
        [
          ["dark", t.optDark],
          ["light", t.optLight],
          ["system", t.optSystem],
        ],
        "theme",
      ),
      settingSelect(
        t.labelFontSize,
        "fontSize",
        [
          ["small", t.optSmall],
          ["normal", t.optNormal],
          ["large", t.optLarge],
          ["custom", t.optCustom || "カスタム"],
        ],
        "fontSize",
      ),
      "custom" === _settings.fontSize
        ? settingCustomFontSize(t.labelCustomSize || "カスタムサイズ")
        : "",
      n,
    ].filter(Boolean),
  )}\n\n        ${settingSection(t.secLanguage, [
    settingSelect(
      t.labelLanguage,
      "language",
      [
        ["ja", "日本語"],
        ["ja-hira", "にほんご"],
        ["en", "English"],
        ["zh-hans", "中文（简体）"],
        ["zh-hant", "中文（繁體）"],
        ["ko", "한국어"],
        ["vi", "Tiếng Việt"],
        ["es", "Español"],
        ["pt", "Português"],
        ["fr", "Français"],
        ["de", "Deutsch"],
        ["ru", "Русский"],
      ],
      "language",
    ),
    settingToggle(t.labelTransGuard, "translateGuard", "translateGuard"),
  ])}\n\n        ${settingSection(
    t.secNotify,
    [
      settingToggle(t.labelSound, "soundOnDone", "soundOnDone"),
      settingSelect(
        t.labelSoundPreset || "サウンドプリセット",
        "soundPreset",
        [
          ["default", t.soundDefault || "デフォルト（チャイム）"],
          ["bell", t.soundBell || "ベル"],
          ["beep", t.soundBeep || "ビープ"],
          ["fanfare", t.soundFanfare || "ファンファーレ"],
          ["custom", t.soundCustom || "カスタム（ファイル）"],
        ],
        "soundPreset",
      ),
      settingRow(
        t.soundPreviewLabel || "プレビュー再生",
        '<button onclick="playDoneSound()" style="background:var(--accent);color:#fff;border:none;padding:6px 18px;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;">▶ 試聴</button>',
      ),
      "custom" === _settings.soundPreset ? settingSoundUpload(t) : "",
      settingToggle(t.labelVibration, "vibration", "vibration"),
      settingToggle(t.labelDesktopNotify, "desktopNotify", "desktopNotify"),
      settingToggle(t.labelBadge, "badge", "badge"),
      settingRow(
        "🔔 バックグラウンド通知登録",
        "<button onclick=\"(async()=>{if(typeof registerSWAndSubscribe==='function'){await registerSWAndSubscribe();alert('登録しました。しばらくしてから通知が届くか確認してください。');}})()\" style=\"background:var(--accent);color:#fff;border:none;padding:6px 18px;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;\">📲 登録する</button>",
      ),
    ].filter(Boolean),
  )}\n\n        ${settingSection(t.secQuiet, [settingTime(t.labelQuietStart, "quietStart", "quietStart"), settingTime(t.labelQuietEnd, "quietEnd", "quietEnd")])}\n\n        ${settingSection(
    t.secData,
    [
      settingSelect(
        t.labelExportFmt,
        "exportFormat",
        [
          ["png", t.optPNG],
          ["csv", t.optCSV],
          ["pdf", t.optPDF || "PDF"],
        ],
        "exportFormat",
      ),
      settingSelect(
        t.labelSpeedUnit,
        "speedUnit",
        [
          ["mbps", "Mbps"],
          ["mbs", "MB/s"],
        ],
        "speedUnit",
      ),
      settingSelect(
        "📱 デバイス機種（手動設定）",
        "manualDeviceName",
        [
          ["", "🔍 自動検出（デフォルト）"],
          ["iPhone SE (第1世代)", "🍎 iPhone SE (第1世代)"],
          ["iPhone SE (第2世代)", "🍎 iPhone SE (第2世代)"],
          ["iPhone SE (第3世代)", "🍎 iPhone SE (第3世代)"],
          ["iPhone 12 mini", "🍎 iPhone 12 mini"],
          ["iPhone 12", "🍎 iPhone 12"],
          ["iPhone 12 Pro", "🍎 iPhone 12 Pro"],
          ["iPhone 12 Pro Max", "🍎 iPhone 12 Pro Max"],
          ["iPhone 13 mini", "🍎 iPhone 13 mini"],
          ["iPhone 13", "🍎 iPhone 13"],
          ["iPhone 13 Pro", "🍎 iPhone 13 Pro"],
          ["iPhone 13 Pro Max", "🍎 iPhone 13 Pro Max"],
          ["iPhone 14", "🍎 iPhone 14"],
          ["iPhone 14 Plus", "🍎 iPhone 14 Plus"],
          ["iPhone 14 Pro", "🍎 iPhone 14 Pro"],
          ["iPhone 14 Pro Max", "🍎 iPhone 14 Pro Max"],
          ["iPhone 15", "🍎 iPhone 15"],
          ["iPhone 15 Plus", "🍎 iPhone 15 Plus"],
          ["iPhone 15 Pro", "🍎 iPhone 15 Pro"],
          ["iPhone 15 Pro Max", "🍎 iPhone 15 Pro Max"],
          ["iPhone 16", "🍎 iPhone 16"],
          ["iPhone 16 Plus", "🍎 iPhone 16 Plus"],
          ["iPhone 16 Pro", "🍎 iPhone 16 Pro"],
          ["iPhone 16 Pro Max", "🍎 iPhone 16 Pro Max"],
          ["iPad (第10世代)", "🍎 iPad (第10世代)"],
          ["iPad mini (第6世代)", "🍎 iPad mini (第6世代)"],
          ["iPad Air (M2)", "🍎 iPad Air (M2)"],
          ["iPad Pro 11 (M4)", "🍎 iPad Pro 11 (M4)"],
          ["iPad Pro 12.9 (M2)", "🍎 iPad Pro 12.9 (M2)"],
          ["Galaxy S24", "🤖 Galaxy S24"],
          ["Galaxy S24+", "🤖 Galaxy S24+"],
          ["Galaxy S24 Ultra", "🤖 Galaxy S24 Ultra"],
          ["Galaxy S25", "🤖 Galaxy S25"],
          ["Galaxy S25 Ultra", "🤖 Galaxy S25 Ultra"],
          ["Galaxy A55", "🤖 Galaxy A55"],
          ["Galaxy A35", "🤖 Galaxy A35"],
          ["Pixel 8", "🤖 Pixel 8"],
          ["Pixel 8 Pro", "🤖 Pixel 8 Pro"],
          ["Pixel 9", "🤖 Pixel 9"],
          ["Pixel 9 Pro", "🤖 Pixel 9 Pro"],
          ["Xperia 1 VI", "🤖 Xperia 1 VI"],
          ["Xperia 5 VI", "🤖 Xperia 5 VI"],
          ["Xperia 10 VI", "🤖 Xperia 10 VI"],
          ["AQUOS sense8", "🤖 AQUOS sense8"],
          ["AQUOS R9", "🤖 AQUOS R9"],
          ["arrows We2 Plus", "🤖 arrows We2 Plus"],
          ["Redmi Note 13", "🤖 Redmi Note 13"],
          ["OPPO Reno11 A", "🤖 OPPO Reno11 A"],
          ["Chromebook", "💻 Chromebook"],
          ["Windows 10", "💻 Windows 10"],
          ["Windows 11", "💻 Windows 11"],
          ["Mac (Intel)", "💻 Mac (Intel)"],
          ["Mac (Apple Silicon)", "💻 Mac (Apple Silicon)"],
          ["Linux", "💻 Linux"],
        ],
        "manualDeviceName",
      ),
      settingToggle(
        t.labelShowIp || "IPアドレスを診断結果に表示",
        "showIpInResult",
        "showIpInResult",
      ),
      settingToggle(t.labelGuard, "clumsiGuard", "clumsiGuard"),
    ],
  )}\n\n        ${_currentUser && !_currentUser.isAnonymous ? settingSection("🔐 セキュリティ", [_currentUser.email ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border);">\n                <div>\n                    <div style="color:var(--text);font-size:0.9rem;font-weight:700;">メールアドレスの変更</div>\n                    <div style="color:var(--sub-text);font-size:0.78rem;margin-top:2px;">${_fbAuth && _fbAuth.currentUser && _fbAuth.currentUser.email ? _fbAuth.currentUser.email : ""}</div>\n                </div>\n                <button onclick="openChangeEmailModal();closeSettings();" style="padding:8px 16px;border-radius:10px;background:#6366f1;color:#fff;border:none;font-size:0.82rem;font-weight:700;cursor:pointer;">変更</button>\n            </div>` : "", `<div style="padding:14px 0;border-bottom:1px solid var(--border);">\n                <div style="color:var(--sub-text);font-size:0.78rem;font-weight:700;margin-bottom:4px;">UID</div>\n                <div style="display:flex;align-items:center;gap:8px;">\n                    <div style="color:var(--text);font-size:0.78rem;font-family:monospace;word-break:break-all;">${_currentUser.uid}</div>\n                    <button onclick="navigator.clipboard.writeText('${_currentUser.uid}').then(()=>{this.textContent='✅';setTimeout(()=>this.textContent='コピー',1500)})" style="flex-shrink:0;padding:4px 10px;border-radius:8px;background:#333;color:#aaa;border:none;font-size:0.75rem;font-weight:700;cursor:pointer;">コピー</button>\n                </div>\n            </div>`, '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;">\n                <div>\n                    <div style="color:#ff6b6b;font-size:0.9rem;font-weight:700;">アカウントを削除する</div>\n                    <div style="color:var(--sub-text);font-size:0.78rem;margin-top:2px;">データはすべて削除されます</div>\n                </div>\n                <button onclick="openDeleteAccountModal();closeSettings();" style="padding:8px 16px;border-radius:10px;background:rgba(255,59,48,0.12);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.82rem;font-weight:700;cursor:pointer;">削除</button>\n            </div>']) : ""}\n\n        ${_currentUser && !_currentUser.isAnonymous ? settingSection("👑 ProUltra", [_isProUltra ? `<div style="padding:14px 0;">\n                    <div style="background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;margin-bottom:16px;">\n                        <span style="font-size:1.6rem;">👑</span>\n                        <div>\n                            <div style="color:#fff;font-size:0.9rem;font-weight:800;">ProUltraアカウント</div>\n                            <div style="color:rgba(255,255,255,0.85);font-size:0.77rem;margin-top:2px;">🔔 通知機能 ／ 📊 診断履歴10件保存 ／ 🎨 限定スキン</div>\n                        </div>\n                    </div>\n                    <div style="margin-bottom:8px;color:#ccc;font-size:0.82rem;font-weight:700;">🎨 テーマスキン<br>(診断項目カラーがうまく表示されない可能性があります。)</div>\n                    <div id="pu-skin-selector" style="margin-bottom:4px;"></div>\n                    <p style="color:#555;font-size:0.72rem;margin:8px 0 4px;">スキンはこの端末に保存されます</p>\n                    <div id="gacha-btn-wrap" style="margin-top:10px;"></div>\n                    <div style="margin:18px 0 8px;color:#ccc;font-size:0.82rem;font-weight:700;">📅 再診断リマインド</div>\n                    <div id="pu-reminder-selector" style="display:flex;gap:6px;"></div>\n                    <p style="color:#555;font-size:0.72rem;margin:6px 0 0;">診断完了から指定日数後、次回起動時に通知します</p>\n                    <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px;">\n                        <div style="color:#ccc;font-size:0.82rem;font-weight:700;margin-bottom:2px;">🔬 ProUltra限定ツール</div>\n                        <button onclick="closeSettings();openBatteryForecast();" style="width:100%;padding:12px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border:none;color:#fff;font-size:0.92rem;font-weight:800;cursor:pointer;">🔋 バッテリー寿命予測</button>\n                        <button onclick="closeSettings();openUpgradeSimulator();" style="width:100%;padding:12px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;color:#fff;font-size:0.92rem;font-weight:800;cursor:pointer;">📱 買い替えシミュレーター</button>\n                    </div>\n                    <div style="margin-top:10px;">\n                        <button onclick="openPuShop();closeSettings();" style="width:100%;padding:12px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;font-size:0.95rem;font-weight:800;cursor:pointer;">🪙 ポイントショップ（${_puPoints}pt）</button>\n                    </div>\n                    <div style="margin-top:18px;">\n                        <div style="color:#ccc;font-size:0.82rem;font-weight:700;margin-bottom:10px;">🔑 Pro Pass（パスキー）</div>\n                        <div id="propass-section"></div>\n                    </div>\n                </div>` : '<div style="padding:14px 0;">\n                    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:14px;padding:12px 16px;">\n                        <div style="color:#f59e0b;font-size:0.88rem;font-weight:700;margin-bottom:8px;">👑 ProUltraアカウント特典</div>\n                        <div style="color:#888;font-size:0.8rem;line-height:1.9;">🔔 アプリ内通知が解放<br>📊 診断履歴を最大10件保存<br>🎨 限定テーマスキン（ゴールド・オーロラ・ダイヤ）</div>\n                        <div style="color:#555;font-size:0.75rem;margin-top:8px;">※ 管理者によりプランが付与されます</div>\n                    </div>\n                </div>']) : ""}\n\n        </div>\n        <div style="padding:0 20px;">\n        <button onclick="resetSettings()" style="width:100%;margin-top:16px;padding:12px;border-radius:14px;background:rgba(255,59,48,0.12);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.9rem;font-weight:700;cursor:pointer;">${t.settingsReset}</button>\n        </div>\n    </div>`),
    (e.style.display = "flex"),
    (document.body.style.overflow = "hidden"),
    (e.onclick = (t) => {
      t.target === e && closeSettings();
    }),
    _isProUltra &&
      (_renderPuSkinUI(), _renderPuReminderUI(), _renderPasskeyUI()),
    e._helpListenerAdded ||
      ((e._helpListenerAdded = !0),
      e.addEventListener("click", (e) => {
        const t = e.target.closest(".setting-help");
        if (!t) return;
        e.stopPropagation();
        const n = t.getAttribute("data-setting-key") || "";
        if (n) {
          const e = _settings.language,
            t = SETTING_HELP_I18N[e] || SETTING_HELP_I18N.en;
          alert(t[n] || t.default || "");
        } else {
          const e = t.getAttribute("data-setting-desc") || "";
          alert(e.replace(/&#10;/g, "\n"));
        }
      })));
}
function settingSection(e, t) {
  return `<div style="margin-bottom:20px;">\n        <div style="font-size:0.78rem;font-weight:800;color:var(--sub-text);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">${e}</div>\n        <div style="background:var(--bg);border-radius:16px;overflow:hidden;border:1px solid var(--border);">\n            ${t.join("")}\n        </div>\n    </div>`;
}
function settingRow(e, t, n) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);gap:8px;">\n        <div style="flex:1;">\n            <div style="font-size:0.9rem;color:var(--text);display:flex;align-items:center;gap:4px;">\n                ${e}\n                ${!!n ? `<span class="setting-help" data-setting-key="${n}" style="color:var(--sub-text);font-size:0.8rem;cursor:pointer;padding:6px 8px;margin:-6px -4px;user-select:none;">＊</span>` : ""}\n            </div>\n        </div>\n        ${t}\n    </div>`;
}
function settingSoundUpload(e) {
  const t = !!_settings.soundFileDataUrl,
    n = e.labelSoundFile || "カスタム音声ファイル",
    o = e.soundFileHint || "MP3・WAV・FLACに対応";
  return settingRow(
    n,
    '<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;"><label style="background:var(--accent);color:#fff;padding:6px 14px;border-radius:10px;font-size:0.82rem;font-weight:700;cursor:pointer;">' +
      (e.soundUploadBtn || "📁 ファイルを選択") +
      '<input type="file" accept=".mp3,.wav,.flac,audio/*" style="display:none;" onchange="uploadSoundFile(this)"></label>' +
      (t
        ? '<span style="color:#34c759;font-size:0.75rem;">✓ ' +
          (e.soundFileLoaded || "ファイル読み込み済み") +
          '</span><button onclick="clearSoundFile()" style="background:rgba(255,59,48,0.15);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;padding:4px 10px;border-radius:8px;font-size:0.75rem;cursor:pointer;">' +
          (e.soundFileClear || "削除") +
          "</button>"
        : '<span style="color:var(--sub-text);font-size:0.75rem;">' +
          o +
          "</span>") +
      "</div>",
  );
}
function uploadSoundFile(e) {
  const t = e.files[0];
  if (!t) return;
  if (t.size > 5242880)
    return void alert("ファイルサイズは5MB以内にしてください。");
  const n = new FileReader();
  ((n.onload = (e) => {
    ((_settings.soundFileDataUrl = e.target.result),
      saveSettings(),
      openSettings());
  }),
    n.readAsDataURL(t));
}
function clearSoundFile() {
  ((_settings.soundFileDataUrl = null), saveSettings(), openSettings());
}
(document.addEventListener("touchstart", _initAudioCtx, { once: !0 }),
  document.addEventListener("click", _initAudioCtx, { once: !0 }));
let _localFontsCache = null,
  _localFontsFetched = !1;
async function _getLocalFonts() {
  if (_localFontsFetched) return _localFontsCache;
  if (((_localFontsFetched = !0), "queryLocalFonts" in window))
    try {
      const e = await window.queryLocalFonts(),
        t = [...new Set(e.map((e) => e.family))].sort();
      _localFontsCache = t.slice(0, 80);
    } catch (e) {
      _localFontsCache = null;
    }
  return _localFontsCache;
}
async function settingFontFamily(e) {
  const t = e.labelFont || "フォント",
    n = _settings.fontFamily || "system",
    o = [
      ["system", e.fontSystem || "システム標準"],
      ["gothic", e.fontGothic || "ゴシック体"],
      ["serif", e.fontSerif || "明朝体・セリフ"],
      ["rounded", e.fontRounded || "丸ゴシック"],
      ["mono", e.fontMono || "等幅フォント"],
    ],
    i = (await _getLocalFonts()) || [];
  return settingRow(
    t,
    '<select onchange="changeSetting(\'fontFamily\',this.value)" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:10px;font-size:0.85rem;cursor:pointer;max-width:160px;">' +
      o
        .map(
          ([e, t]) =>
            '<option value="' +
            e +
            '" ' +
            (e === n ? "selected" : "") +
            ">" +
            t +
            "</option>",
        )
        .join("") +
      (i.length > 0
        ? '<optgroup label="─ インストール済みフォント ─">' +
          i
            .map(
              (e) =>
                '<option value="' +
                e +
                '" ' +
                (e === n ? "selected" : "") +
                ">" +
                e +
                "</option>",
            )
            .join("") +
          "</optgroup>"
        : "") +
      "</select>",
    "fontFamily",
  );
}
function settingCustomFontSize(e) {
  const t = _settings.customFontSize || 15;
  return settingRow(
    e,
    '<div style="display:flex;align-items:center;gap:10px;min-width:160px;"><input type="range" min="10" max="32" value="' +
      t +
      '" oninput="this.nextElementSibling.textContent=this.value+\'px\';changeSetting(\'customFontSize\',parseInt(this.value))" style="flex:1;accent-color:var(--accent);cursor:pointer;"><span style="color:var(--text);font-size:0.85rem;font-weight:700;min-width:36px;text-align:right;">' +
      t +
      "px</span></div>",
  );
}
function settingToggle(e, t, n) {
  const o = _settings[t];
  return settingRow(
    e,
    `\n        <div onclick="toggleSetting('${t}')" style="width:48px;height:28px;border-radius:14px;background:${o ? "#34c759" : "#555"};position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;">\n            <div style="position:absolute;top:3px;${o ? "right:3px" : "left:3px"};width:22px;height:22px;border-radius:50%;background:#fff;transition:all 0.2s;"></div>\n        </div>`,
    n,
  );
}
function settingSelect(e, t, n, o) {
  const i = _settings[t];
  return settingRow(
    e,
    `\n        <select onchange="changeSetting('${t}',this.value)"\n            style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:10px;font-size:0.85rem;cursor:pointer;max-width:140px;">\n            ${n.map(([e, t]) => `<option value="${e}" ${e === i ? "selected" : ""}>${t}</option>`).join("")}\n        </select>`,
    o,
  );
}
function settingTime(e, t, n) {
  return settingRow(
    e,
    `\n        <input type="time" value="${_settings[t]}" onchange="changeSetting('${t}',this.value)"\n            style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:10px;font-size:0.85rem;cursor:pointer;">`,
    n,
  );
}
function toggleSetting(e) {
  if ("autoCheck" !== e || _isProUltra) {
    if (
      ((_settings[e] = !_settings[e]),
      ("desktopNotify" === e || "badge" === e) && _settings[e])
    ) {
      if (
        "undefined" != typeof Notification &&
        "denied" === Notification.permission
      )
        return (
          alert(
            "通知がブラウザでブロックされています。\nブラウザのサイト設定から通知を「許可」に変更してください。",
          ),
          (_settings[e] = !1),
          saveSettings(),
          void openSettings()
        );
      if (
        "undefined" != typeof Notification &&
        "default" === Notification.permission
      )
        return void Notification.requestPermission().then((t) => {
          ("granted" !== t &&
            ((_settings[e] = !1),
            alert(
              "通知が許可されませんでした。ブラウザの設定から許可してください。",
            )),
            saveSettings(),
            applySettings(),
            openSettings());
        });
    }
    (saveSettings(), applySettings(), openSettings());
  } else alert("⚠️ この機能はProUltraで利用可能です。");
}
function changeSetting(e, t) {
  ((_settings[e] = t),
    saveSettings(),
    applySettings(),
    ("language" !== e && "fontSize" !== e && "soundPreset" !== e) ||
      openSettings());
}
function closeSettings() {
  const e = document.getElementById("settings-modal");
  (e && (e.style.display = "none"), (document.body.style.overflow = ""));
}
function resetSettings() {
  confirm(tui().settingsResetConfirm) &&
    ((_settings = { ...DEFAULT_SETTINGS }),
    saveSettings(),
    applySettings(),
    openSettings());
}
function getGPUInfo() {
  const e = {
    renderer: "不明",
    vendor: "不明",
    version: "なし",
    maxTex: 0,
    maxAttrib: 0,
  };
  try {
    let t = document.createElement("canvas").getContext("webgl2");
    if (t) e.version = "WebGL 2.0";
    else {
      if (
        ((t =
          document.createElement("canvas").getContext("webgl") ||
          document.createElement("canvas").getContext("experimental-webgl")),
        !t)
      )
        return ((e.version = "非対応"), e);
      e.version = "WebGL 1.0";
    }
    const n = t.getExtension("WEBGL_debug_renderer_info");
    (n &&
      ((e.renderer = t.getParameter(n.UNMASKED_RENDERER_WEBGL) || "不明"),
      (e.vendor = t.getParameter(n.UNMASKED_VENDOR_WEBGL) || "不明")),
      (e.maxTex = t.getParameter(t.MAX_TEXTURE_SIZE) || 0),
      (e.maxAttrib = t.getParameter(t.MAX_VERTEX_ATTRIBS) || 0));
  } catch (e) {}
  return e;
}
async function benchCPU_pro() {
  const e = Math.min(4, navigator.hardwareConcurrency || 4),
    t = new Blob(
      [
        "\n        const size = 512 * 1024;\n        const arr = new Float64Array(size);\n\n        for (let i = 0; i < size; i++) {\n            arr[i] = i % 1000;\n        }\n\n        function heavyTask() {\n            let sum = 0;\n            for (let i = 0; i < size; i++) {\n                const v = arr[i];\n                sum += Math.sqrt(v * 1.001) * Math.sin(v);\n            }\n            return sum;\n        }\n\n        onmessage = () => {\n            for (let i = 0; i < 5; i++) heavyTask();\n\n            const start = performance.now();\n            let count = 0;\n\n            while (performance.now() - start < 1000) {\n                heavyTask();\n                count++;\n            }\n\n            postMessage(count);\n        }\n    ",
      ],
      { type: "application/javascript" },
    ),
    n = URL.createObjectURL(t),
    o = await Promise.all(
      Array.from(
        { length: e },
        () =>
          new Promise((e) => {
            const t = new Worker(n);
            ((t.onmessage = (n) => {
              (e(n.data), t.terminate());
            }),
              t.postMessage(0));
          }),
      ),
    );
  URL.revokeObjectURL(n);
  const i = o.reduce((e, t) => e + t, 0) / e;
  let a = 1.5;
  return (
    (a = /iPhone|iPad/.test(navigator.userAgent)
      ? 1.85
      : /Android/.test(navigator.userAgent)
        ? 1.65
        : 1.45),
    Math.min(100, Math.round(i * a))
  );
}
function benchGPU() {
  const e = performance.now();
  try {
    const e = document.createElement("canvas");
    e.width = e.height = 512;
    const t = e.getContext("webgl") || e.getContext("experimental-webgl");
    if (t) {
      const e = t.createShader(t.VERTEX_SHADER);
      (t.shaderSource(
        e,
        "attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}",
      ),
        t.compileShader(e));
      const n = t.createShader(t.FRAGMENT_SHADER);
      (t.shaderSource(
        n,
        "precision mediump float;void main(){gl_FragColor=vec4(0.2,0.6,1.0,1.0);}",
      ),
        t.compileShader(n));
      const o = t.createProgram();
      (t.attachShader(o, e),
        t.attachShader(o, n),
        t.linkProgram(o),
        t.useProgram(o));
      const i = new Float32Array(2e3);
      for (let e = 0; e < i.length; e++) i[e] = 2 * Math.random() - 1;
      const a = t.createBuffer();
      (t.bindBuffer(t.ARRAY_BUFFER, a),
        t.bufferData(t.ARRAY_BUFFER, i, t.STATIC_DRAW));
      const r = t.getAttribLocation(o, "p");
      (t.enableVertexAttribArray(r),
        t.vertexAttribPointer(r, 2, t.FLOAT, !1, 0, 0));
      for (let e = 0; e < 300; e++) t.drawArrays(t.TRIANGLES, 0, 900);
      t.finish();
    }
  } catch (e) {}
  const t = document.createElement("canvas");
  t.width = t.height = 1024;
  const n = t.getContext("2d"),
    o = ["source-over", "multiply", "screen", "overlay"];
  for (let e = 0; e < 600; e++) {
    const t = 1024 * Math.random(),
      i = 1024 * Math.random(),
      a = 15 + 55 * Math.random();
    n.globalCompositeOperation = o[3 & e];
    const r = n.createRadialGradient(t, i, 0, t, i, a);
    (r.addColorStop(0, `hsl(${(0.6 * e) % 360},80%,60%)`),
      r.addColorStop(1, "rgba(0,0,0,0)"),
      (n.fillStyle = r),
      n.beginPath(),
      n.arc(t, i, a, 0, 2 * Math.PI),
      n.fill());
  }
  n.globalCompositeOperation = "source-over";
  for (let e = 0; e < 400; e++)
    (n.beginPath(),
      n.moveTo(1024 * Math.random(), 1024 * Math.random()),
      n.bezierCurveTo(
        1024 * Math.random(),
        1024 * Math.random(),
        1024 * Math.random(),
        1024 * Math.random(),
        1024 * Math.random(),
        1024 * Math.random(),
      ),
      (n.strokeStyle = `hsla(${(1.5 * e) % 360},70%,60%,0.5)`),
      n.stroke());
  const i = performance.now() - e;
  return Math.max(0, Math.min(100, Math.round((600 - i) / 5.8)));
}
function benchMemory() {
  const e = 2097152;
  let t;
  try {
    t = new Float32Array(e);
  } catch (e) {
    return 15;
  }
  for (let e = 0; e < 1e3; e++) t[e] = e;
  const n = performance.now();
  for (let n = 0; n < e; n++) t[n] = 0.001 * n;
  let o = 0;
  for (let n = 0; n < e; n++) o += t[n];
  for (let n = 0; n < e; n += 64) o += t[n];
  0 === o && (t[0] = 1);
  const i = performance.now() - n,
    a = Math.round(100 - (Math.log(i + 1) / Math.log(200)) * 100);
  return Math.max(0, Math.min(100, a));
}
function runFPSBench(e, fpsDurationMs) {
  const BENCH_MS = fpsDurationMs || 15000;
  const t = document.createElement("canvas");
  ((t.width = t.height = 400),
    (t.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;pointer-events:none;"),
    document.body.appendChild(t));
  const n = t.getContext("2d"),
    o = Array.from({ length: 120 }, () => ({
      x: 400 * Math.random(),
      y: 400 * Math.random(),
      vx: 4 * (Math.random() - 0.5),
      vy: 4 * (Math.random() - 0.5),
      r: 2 + 6 * Math.random(),
      hue: 360 * Math.random(),
    }));
  const i = performance.now(),
    a = [];
  let r = performance.now();
  requestAnimationFrame(function s() {
    const d = performance.now(),
      l = d - r;
    if (((r = d), l > 2 && l < 100 && a.push(l), d - i < 2e3))
      return void requestAnimationFrame(s);
    const c = [...a].sort((e, t) => e - t),
      p = c.slice(0, Math.max(5, Math.floor(0.15 * c.length))),
      u = {};
    for (const e of p) {
      const t = Math.round(4 * e) / 4;
      u[t] = (u[t] || 0) + 1;
    }
    const g = parseFloat(Object.entries(u).sort((e, t) => t[1] - e[1])[0][0]);
    let m = Math.round(1e3 / g);
    ((m = [24, 30, 48, 60, 90, 120, 144, 165, 240, 360].reduce((e, t) =>
      Math.abs(t - m) < Math.abs(e - m) ? t : e,
    )),
      (function (a, r) {
        const s = [],
          d = [];
        let l = performance.now(),
          c = performance.now(),
          p = 0;
        const u = performance.now();
        function g() {
          const m = performance.now();
          !(function () {
            ((n.fillStyle = "rgba(0,0,0,0.15)"), n.fillRect(0, 0, 400, 400));
            for (const e of o) {
              ((e.x += e.vx),
                (e.y += e.vy),
                (e.x < 0 || e.x > 400) && (e.vx *= -1),
                (e.y < 0 || e.y > 400) && (e.vy *= -1),
                (e.hue = (e.hue + 1) % 360));
              const t = n.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
              (t.addColorStop(0, `hsla(${e.hue},80%,60%,0.9)`),
                t.addColorStop(1, `hsla(${e.hue},80%,60%,0)`),
                (n.fillStyle = t),
                n.beginPath(),
                n.arc(e.x, e.y, e.r, 0, 2 * Math.PI),
                n.fill());
            }
          })();
          const f = m - l;
          ((l = m), f > 2 && f < 500 && d.push(f));
          const b = Math.max(0, m - c - r);
          if (
            (m - u > 1e3 && s.push(b), (p += f), p >= 500 && d.length >= 20)
          ) {
            p = 0;
            const e = d.slice(-60),
              t = e.reduce((e, t) => e + t, 0) / e.length;
            document.getElementById("b-fps-avg").textContent =
              Math.min(a, Math.round(1e3 / t)) + " FPS";
          }
          if (m - i < BENCH_MS)
            return ((c = performance.now()), void requestAnimationFrame(g));
          if (d.length < 30) return void e(30, 20, 30, a);
          const h = Math.min(...d),
            y = Math.min(a, Math.round(1e3 / h)),
            v = [...d].sort((e, t) => e - t),
            x = v[Math.floor(0.97 * v.length)],
            _ = v[Math.floor(0.5 * v.length)],
            P = Math.round(1e3 / _),
            S = Math.min(a, Math.round(1e3 / x));
          (console.log("【FPS診断データ】"),
            console.log("frameTimes長:", d.length),
            console.log("最短フレーム時間:", h.toFixed(2), "ms →", y, "FPS"),
            console.log("中央フレーム時間:", _.toFixed(2), "ms →", P, "FPS"),
            console.log("p97フレーム時間:", x.toFixed(2), "ms →", S, "FPS"),
            console.log("画面リフレッシュレート(rr):", a, "Hz"));
          const w = d.reduce((e, t) => e + t, 0) / d.length;
          (console.log("--- フレーム時間の分布 ---"),
            console.log("平均フレーム時間:", w.toFixed(2), "ms"),
            console.log("最大フレーム時間:", Math.max(...d).toFixed(2), "ms"),
            console.log("最小フレーム時間:", h.toFixed(2), "ms"),
            console.log(
              "16.7ms以下（60FPS相当）:",
              d.filter((e) => e <= 16.7).length,
              "個",
            ),
            console.log(
              "16.7-33.3ms（30-60FPS）:",
              d.filter((e) => e > 16.7 && e <= 33.3).length,
              "個",
            ),
            console.log(
              "33.3ms以上（30FPS未満）:",
              d.filter((e) => e > 33.3).length,
              "個",
            ));
          const k =
              s.length > 0
                ? [...s].sort((e, t) => e - t)[Math.floor(0.5 * s.length)]
                : 0,
            I = s.reduce((e, t) => e + t, 0) / (s.length || 1),
            C = Math.sqrt(
              s.reduce((e, t) => e + (t - I) ** 2, 0) / (s.length || 1),
            ),
            E = Math.max(0, Math.min(100, Math.round(100 - 6 * (k + C))));
          try {
            document.body.removeChild(t);
          } catch (e) {}
          const A = d.filter((e) => e > 32).length,
            B = d.filter((e) => e > 16.7).length;
          e(P, S, E, a, A, B);
        }
        ((c = performance.now()), requestAnimationFrame(g));
      })(m, g));
  });
}
async function estimateMemoryPrecise() {
  const e = [];
  if (navigator.deviceMemory) {
    const t = navigator.deviceMemory;
    e.push({ v: t, w: 5, src: `API:${t}GB` });
  }
  if (window.performance?.memory?.jsHeapSizeLimit) {
    const t = performance.memory.jsHeapSizeLimit / 1048576,
      n = ([
        [14e3, 32],
        [7e3, 16],
        [3500, 8],
        [1800, 4],
        [900, 2],
        [0, 1],
      ].find(([e]) => t >= e) || [0, 1])[1];
    e.push({ v: n, w: 5, src: `heap:${Math.round(t)}MB→${n}GB` });
  }
  const t = navigator.hardwareConcurrency || 2,
    n = ([
      [24, 64],
      [16, 32],
      [12, 16],
      [8, 8],
      [6, 6],
      [4, 4],
      [2, 2],
      [0, 1],
    ].find(([e]) => t >= e) || [0, 1])[1];
  e.push({ v: n, w: 1, src: `cores:${t}→${n}GB` });
  const o = navigator.userAgent.match(/;\s*(Pixel\s+[\w\s]+?)\s+Build\//i);
  if (o) {
    const e = o[1].toLowerCase().trim();
    if (/pixel\s+[5-9]|pixel\s+[1-9][0-9]/.test(e))
      return {
        gb: 8,
        label: "8 GB",
        confLabel: "高精度",
        detail: "Pixel5以降確定8GB",
      };
    if (/pixel\s+4/.test(e))
      return {
        gb: 6,
        label: "6 GB",
        confLabel: "高精度",
        detail: "Pixel4確定6GB",
      };
    if (/pixel\s+3/.test(e))
      return {
        gb: 4,
        label: "4 GB",
        confLabel: "高精度",
        detail: "Pixel3確定4GB",
      };
    if (/pixel\s+2/.test(e))
      return {
        gb: 4,
        label: "4 GB",
        confLabel: "高精度",
        detail: "Pixel2確定4GB",
      };
    if (/pixel\s+1|pixel\b(?!\s+[2-9])/.test(e))
      return {
        gb: 4,
        label: "4 GB",
        confLabel: "高精度",
        detail: "Pixel1確定4GB",
      };
  }
  const i = navigator.userAgent.match(/iPhone(\d+),(\d+)/);
  if (i) {
    const e = parseInt(i[1]);
    if (e >= 15)
      return {
        gb: 8,
        label: "8 GB",
        confLabel: "高精度",
        detail: "iPhone15以降確定8GB",
      };
    if (14 === e)
      return {
        gb: 6,
        label: "6 GB",
        confLabel: "高精度",
        detail: "iPhone14確定6GB",
      };
    if (13 === e || 12 === e)
      return {
        gb: 4,
        label: "4 GB",
        confLabel: "高精度",
        detail: "iPhone12-13確定4GB",
      };
    if (e <= 11)
      return {
        gb: 3,
        label: "3 GB",
        confLabel: "高精度",
        detail: "iPhone11以前確定3GB",
      };
  }
  if (/iPhone/.test(navigator.userAgent)) {
    const e = navigator.userAgent.match(/iPhone OS (\d+)_/);
    if (e) {
      const t = parseInt(e[1]);
      if (t >= 17)
        return {
          gb: 8,
          label: "8 GB",
          confLabel: "精度中",
          detail: "iOS" + t + "→iPhone15以降推定8GB",
        };
      if (16 === t)
        return {
          gb: 6,
          label: "6 GB",
          confLabel: "精度中",
          detail: "iOS16→iPhone14世代推定6GB",
        };
      if (15 === t)
        return {
          gb: 4,
          label: "4 GB",
          confLabel: "精度中",
          detail: "iOS15→iPhone13世代推定4GB",
        };
      if (t <= 14)
        return {
          gb: 4,
          label: "4 GB",
          confLabel: "精度中",
          detail: "iOS14以下→旧世代推定4GB",
        };
    }
  }
  const a = (getGPUInfo().renderer || "").toLowerCase();
  let r = 0,
    s = 0;
  if (
    (/a18/.test(a) || /a17/.test(a)
      ? ((r = 8), (s = 15))
      : /a16/.test(a)
        ? ((r = 6), (s = 10))
        : /a15/.test(a)
          ? ((r = 4), (s = 10))
          : /apple m[3-9]/.test(a)
            ? ((r = 16), (s = 8))
            : /apple m[12]/.test(a)
              ? ((r = 8), (s = 8))
              : /snapdragon 8 gen [3-9]|dimensity 9[3-9]/.test(a)
                ? ((r = 12), (s = 6))
                : /snapdragon 8 gen [12]|dimensity 9[012]/.test(a)
                  ? ((r = 8), (s = 6))
                  : /rtx [4-9]|rx 7[89]/.test(a) && ((r = 32), (s = 6)),
    r > 0 && e.push({ v: r, w: s, src: `gpu→${r}GB` }),
    0 === e.length)
  )
    return { gb: 4, label: "4 GB", confLabel: "推定", detail: "no data" };
  const d = e.reduce((e, t) => e + t.w, 0),
    l = e.reduce((e, t) => e + t.v * t.w, 0) / d,
    c = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64].reduce((e, t) =>
      Math.abs(t - l) < Math.abs(e - l) ? t : e,
    );
  return {
    gb: c,
    label: `${c} GB`,
    confLabel: d >= 12 ? "高精度" : d >= 7 ? "精度中" : "推定",
    detail: e.map((e) => e.src).join(" | "),
  };
}
function detectBrowser() {
  const e = navigator.userAgent;
  return /Edg\//.test(e)
    ? "Microsoft Edge"
    : /OPR\/|Opera/.test(e)
      ? "Opera"
      : /SamsungBrowser/.test(e)
        ? "Samsung Internet"
        : /CriOS/.test(e)
          ? "Chrome (iOS)"
          : /FxiOS/.test(e)
            ? "Firefox (iOS)"
            : /Firefox\//.test(e)
              ? "Firefox"
              : (/Chrome\//.test(e) && /CrOS/.test(e)) || /Chrome\//.test(e)
                ? "Google Chrome"
                : /Safari\//.test(e) && /Mobile/.test(e)
                  ? "Safari (Mobile)"
                  : /Safari\//.test(e)
                    ? "Safari"
                    : "ブラウザを特定できません。";
}
function detectDeviceName() {
  const e = navigator.userAgent;
  if (/iPhone/.test(e)) {
    const t = `${screen.width}x${screen.height}@${window.devicePixelRatio}`,
      n = e.match(/iPhone OS (\d+)_/),
      o = n ? parseInt(n[1]) : 0,
      i = e.match(/iPhone(\d+),/),
      a = i ? parseInt(i[1]) : 0;
    return "320x568@2" === t
      ? "iPhone SE (第1世代)"
      : "375x667@2" === t
        ? "iPhone SE (第2/3世代)"
        : "360x780@3" === t
          ? "iPhone 12 / 13 mini"
          : "390x844@3" === t
            ? 14 === a || o >= 18 || 17 === o || 16 === o
              ? "iPhone 14"
              : "iPhone 12 / 13 / 14"
            : "393x852@3" === t
              ? a >= 17
                ? "iPhone 16 (Pro)"
                : 16 === a
                  ? "iPhone 15 (Pro)"
                  : 15 === a && a >= 4
                    ? "iPhone 15"
                    : o >= 18
                      ? "iPhone 16 (Pro)"
                      : 17 === o
                        ? "iPhone 15 (Pro)"
                        : 16 === o
                          ? "iPhone 14 Pro"
                          : "iPhone 14 Pro / 15 / 16"
              : "430x932@3" === t
                ? a >= 17
                  ? "iPhone 16 Plus (Pro Max)"
                  : 16 === a
                    ? "iPhone 15 Plus (Pro Max)"
                    : o >= 18
                      ? "iPhone 16 Plus (Pro Max)"
                      : 17 === o
                        ? "iPhone 15 Plus (Pro Max)"
                        : 16 === o
                          ? "iPhone 14 Pro Max"
                          : "iPhone 14 Pro Max / 15 Plus / 16 Plus"
                : "414x896@2" === t
                  ? "iPhone XR / 11"
                  : "414x896@3" === t
                    ? "iPhone XS Max / 11 Pro Max"
                    : "375x812@3" === t
                      ? "iPhone X / XS / 11 Pro"
                      : "375x667@3" === t
                        ? "iPhone 6 / 7 / 8"
                        : "414x736@3" === t
                          ? "iPhone 6 Plus / 7 Plus / 8 Plus"
                          : "iPhone";
  }
  if (
    /iPad/.test(e) ||
    ("MacIntel" === navigator.platform && navigator.maxTouchPoints > 1)
  ) {
    const e = screen.width,
      t = screen.height;
    return 1024 === e && 1366 === t
      ? "iPad Pro 12.9"
      : 834 === e && 1194 === t
        ? "iPad Pro 11"
        : 820 === e && 1180 === t
          ? "iPad Air"
          : 810 === e && 1080 === t
            ? "iPad (第10世代)"
            : 768 === e && 1024 === t
              ? "iPad mini"
              : "iPad";
  }
  let t = e.match(/Android[^;]*;\s*([^)]+)\)/);
  if (t) {
    let e = t[1]
      .trim()
      .replace(/Build\/.*$/, "")
      .trim();
    return ((e = e.replace(/_/g, " ").replace(/\s+/g, " ")), e);
  }
  if (/CrOS/.test(e)) return "Chromebook";
  if (/Windows NT/.test(e)) return "Windows";
  if (/Macintosh/.test(e)) {
    return "MacIntel" === navigator.platform && navigator.maxTouchPoints > 1
      ? "Mac (Apple Silicon)"
      : "Mac (Intel)";
  }
  return /Linux/.test(e) ? "Linux" : "";
}
async function fetchPublicIP() {
  const e = await getIPviaWebRTC();
  if (e) return e;
  const t = [
    { url: "https://api.ipify.org?format=json", parse: (e) => e.ip },
    { url: "https://api64.ipify.org?format=json", parse: (e) => e.ip },
    { url: "https://ipapi.co/json/", parse: (e) => e.ip },
  ];
  for (const e of t)
    try {
      const t = await fetch(e.url, { cache: "no-store", mode: "cors" });
      if (!t.ok) continue;
      const n = await t.json(),
        o = e.parse(n);
      if (o && /^[\d.:a-fA-F]+$/.test(o)) return o;
    } catch (e) {
      continue;
    }
  return null;
}
function getIPviaWebRTC() {
  return new Promise((e) => {
    const t = new Set();
    let n = !1;
    const o = () => {
      if (n) return;
      n = !0;
      const o = [...t],
        i = o.find((e) => !isPrivateIP(e));
      e(i || o[0] || null);
    };
    try {
      const e = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      (e.createDataChannel(""),
        (e.onicecandidate = (e) => {
          if (!e.candidate) return void o();
          const n = e.candidate.candidate.split(" ");
          if (n.length >= 6) {
            const e = n[4];
            if (/^(\d{1,3}\.){3}\d{1,3}$/.test(e)) {
              e
                .split(".")
                .map(Number)
                .every((e) => e >= 0 && e <= 255) &&
                "0.0.0.0" !== e &&
                t.add(e);
            }
          }
        }),
        e.createOffer().then((t) => e.setLocalDescription(t)),
        setTimeout(() => {
          (e.close(), o());
        }, 5e3));
    } catch (t) {
      e(null);
    }
  });
}
function isPrivateIP(e) {
  return /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|fc|fd|fe80)/i.test(e);
}
async function measureGamePing() {
  const e = [
      "https://www.google.com/generate_204",
      "https://1.1.1.1/cdn-cgi/trace",
      "https://www.cloudflare.com/cdn-cgi/trace",
    ],
    t = [];
  for (const n of e)
    try {
      const e = performance.now();
      (await fetch(n + "?_=" + Date.now(), {
        cache: "no-store",
        mode: "no-cors",
      }),
        t.push(Math.round(performance.now() - e)));
    } catch (e) {}
  if (0 === t.length) return null;
  t.sort((e, t) => e - t);
  return {
    avg: Math.round(t.reduce((e, t) => e + t, 0) / t.length),
    jitter: t.length >= 2 ? Math.round(t[t.length - 1] - t[0]) : 0,
    min: t[0],
    samples: t.length,
  };
}
async function measureVideoPing() {
  const e = [];
  for (let t = 0; t < 5; t++) {
    try {
      const n = performance.now();
      (await fetch(
        "https://www.google.com/generate_204?_=" + Date.now() + "_" + t,
        { cache: "no-store", mode: "no-cors" },
      ),
        e.push(Math.round(performance.now() - n)));
    } catch (e) {}
    await new Promise((e) => setTimeout(e, 100));
  }
  if (e.length < 2) return null;
  e.sort((e, t) => e - t);
  return {
    avg: Math.round(e.reduce((e, t) => e + t, 0) / e.length),
    jitter: e[e.length - 1] - e[0],
    samples: e.length,
  };
}
async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null;
    const e = await navigator.getBattery();
    return {
      level: Math.round(100 * e.level),
      charging: e.charging,
      chargingTime: e.chargingTime,
      dischargingTime: e.dischargingTime,
    };
  } catch (e) {
    return null;
  }
}
function measureUILatency() {
  return new Promise((e) => {
    const t = [];
    let n = 0;
    !(function o() {
      const i = performance.now();
      requestAnimationFrame(() => {
        const a = new MessageChannel();
        ((a.port1.onmessage = () => {
          if ((t.push(performance.now() - i), n++, n < 30)) o();
          else {
            const n = [...t].sort((e, t) => e - t),
              o = n[Math.floor(0.5 * n.length)],
              i = n[Math.floor(0.95 * n.length)];
            e({
              medMs: Math.round(10 * o) / 10,
              p95Ms: Math.round(10 * i) / 10,
            });
          }
        }),
          a.port2.postMessage(null));
      });
    })();
  });
}
async function detectSafariThrottle() {
  if (
    !(
      /safari/i.test(navigator.userAgent) &&
      !/chrome|crios|fxios/i.test(navigator.userAgent)
    )
  )
    return !1;
  const e = [];
  for (let t = 0; t < 10; t++)
    await new Promise((t) => {
      const n = performance.now();
      setTimeout(() => {
        (e.push(performance.now() - n), t());
      }, 1);
    });
  return e.reduce((e, t) => e + t, 0) / e.length > 15;
}
let _benchmarkRunning = false;
async function runBenchmark() {
  if (_benchmarkRunning) {
    console.warn("runBenchmark: already running, skipping duplicate call");
    return;
  }
  _benchmarkRunning = true;
  const mode = _isProUltraPlus() ? (_diagMode || "normal") : "normal";
  const isFast = mode === "fast";
  const isMax  = mode === "max";
  const fpsDuration = isFast ? 6000 : isMax ? 30000 : 15000;
  const cpuRuns     = isFast ? 1 : isMax ? 5 : 3;
  const totalSecs   = isFast ? 10 : isMax ? 45 : 25;
  const e = document.getElementById("status-title"),
    t = document.getElementById("eval-msg"),
    n = document.getElementById("time-remaining"),
    o = () => _getLang().bench || I18N.ja.bench,
    i = performance.now();
  let a = setInterval(() => {
    const e = (performance.now() - i) / 1e3,
      t = Math.max(0, Math.ceil(totalSecs - e));
    if (n) {
      const e = tui();
      t > 0
        ? (n.textContent = e.remaining + t + e.seconds)
        : (clearInterval(a), (n.textContent = ""));
    }
  }, 1e3);
  ((diag._stopTimer = () => {
    (clearInterval(a), n && (n.textContent = ""));
  }),
    (e.textContent = o()[0]),
    (t.textContent = o()[1]),
    await wait(80),
    await benchCPU_pro());
  const cpuResults = [];
  for (let ci = 0; ci < cpuRuns; ci++) cpuResults.push(await benchCPU_pro());
  cpuResults.sort((a, b) => a - b);
  const r = cpuResults;
  ((scores.cpu = r[Math.floor(r.length / 2)]),
    (e.textContent = o()[2]),
    (t.textContent = o()[3]),
    await wait(50),
    (scores.gpu = benchGPU()),
    (e.textContent = o()[4]),
    (t.textContent = o()[5]),
    await wait(50),
    (scores.mem = benchMemory()),
    (e.textContent = o()[6]),
    (t.textContent = o()[7]),
    await wait(40),
    (diag.memResult = await estimateMemoryPrecise()),
    (e.textContent = o()[8]),
    (t.textContent = o()[9]),
    ([diag.gamePing, diag.videoPing, diag.publicIP] = await Promise.all([
      measureGamePing(),
      measureVideoPing(),
      fetchPublicIP(),
    ])),
    (e.textContent = o()[10]),
    (t.textContent = o()[11]),
    ([diag.battery, diag.latency] = await Promise.all([
      getBatteryInfo(),
      measureUILatency(),
    ])),
    (diag.gpu = getGPUInfo()),
    (e.textContent = o()[12]),
    (t.textContent = o()[13]));
  // Max モード追加計測
  if (isMax) {
    e.textContent = "🔬 超精密解析中...";
    t.textContent = "追加5項目を計測しています";
    await wait(80);
    // 追加①: WebGL詳細ベンチマーク
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        diag.maxGpuDetail = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "N/A";
        const maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
        const maxUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        diag.glMaxVaryings = maxVaryings;
        diag.glMaxUniforms = maxUniforms;
      }
    } catch(ex) {}
    await wait(50);
    // 追加②: メモリ帯域詳細（より多くの試行）
    try {
      const buf = new Float64Array(4 * 1024 * 1024);
      const t0 = performance.now();
      for (let k = 0; k < buf.length; k++) buf[k] = k * 0.5;
      const t1 = performance.now();
      diag.memBandwidthDetailed = Math.round(buf.byteLength / (t1 - t0) / 1024) + " MB/s";
    } catch(ex) {}
    await wait(50);
    // 追加③: ストレージ速度
    try {
      const storageStart = performance.now();
      const testKey = "__pu_max_bench__";
      const testVal = "x".repeat(50000);
      localStorage.setItem(testKey, testVal);
      localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      diag.storageBench = Math.round(performance.now() - storageStart) + "ms";
    } catch(ex) { diag.storageBench = "N/A"; }
    await wait(30);
    // 追加④: JS エンジン最適化スコア
    try {
      const jit0 = performance.now();
      let acc = 0;
      for (let k = 0; k < 1e7; k++) acc += Math.sqrt(k);
      diag.jsEngineScore = Math.round(1e7 / (performance.now() - jit0)) + " ops/ms";
    } catch(ex) {}
    await wait(30);
    // 追加⑤: ネットワーク往復精度（追加計測）
    try {
      const pings = [];
      for (let k = 0; k < 3; k++) {
        const p0 = performance.now();
        await fetch("https://www.google.com/favicon.ico?_=" + Date.now(), { mode: "no-cors" }).catch(()=>{});
        pings.push(Math.round(performance.now() - p0));
        await wait(100);
      }
      diag.netPingDetailed = pings.join("/") + "ms";
    } catch(ex) {}
  }
  ((diag.safariThrottled = await detectSafariThrottle()),
    (e.textContent = o()[14]),
    (t.textContent = o()[15]),
    diag._stopTimer && diag._stopTimer());
  const s = performance.now(),
    d = document.getElementById("time-remaining"),
    l = setInterval(() => {
      const e = Math.max(0, Math.ceil((fpsDuration / 1000) - (performance.now() - s) / 1e3)),
        t = tui();
      d &&
        (e > 0
          ? (d.textContent = t.remaining + e + t.fpsMeasuring)
          : (clearInterval(l), (d.textContent = "")));
    }, 1e3);
  runFPSBench((e, t, n, o, i, a) => {
    (clearInterval(l),
      d && (d.textContent = ""),
      (scores.fps = n),
      (diag.avgFps = e),
      (diag.lowFps = t),
      (diag.refreshRate = o),
      (diag.jank32 = i),
      (diag.jank17 = a),
      (_benchmarkRunning = false),
      processFinalReport());
  }, fpsDuration);
}
function processFinalReport() {
  const {
    avgFps: e,
    lowFps: t,
    refreshRate: n,
    memResult: o,
    gpu: i,
    battery: a,
    storage: r,
    gamePing: s,
    videoPing: d,
  } = diag;
  ((document.getElementById("b-fps-avg").textContent = e + " FPS"),
    (document.getElementById("b-fps-low").textContent = t + " FPS"));
  const l = tv(),
    c = navigator.hardwareConcurrency || 2;
  setRow(1, c + " Cores", st(c >= 12, c >= 6));
  const p = o.gb;
  setRow(2, o.label, st(p >= 8, p >= 4));
  const u = i.renderer;
  (setRow(3, u, "ok"),
    setRow(
      4,
      i.maxTex ? i.maxTex + " px" : "--",
      st(i.maxTex >= 16384, i.maxTex >= 8192),
    ),
    setRow(
      5,
      scores.cpu + " / 100 pts",
      st(scores.cpu >= 75, scores.cpu >= 45),
    ),
    setRow(
      6,
      scores.gpu + " / 100 pts",
      st(scores.gpu >= 75, scores.gpu >= 45),
    ),
    setRow(
      7,
      scores.mem + " / 100 pts",
      st(scores.mem >= 75, scores.mem >= 45),
    ),
    setRow(8, e + " FPS", st(e >= 60, e >= 30)),
    setRow(9, t + " FPS", st(t >= 55, t >= 30)),
    setRow(10, n + " Hz", st(n >= 120, n >= 60)));
  const g = Math.round(screen.width * devicePixelRatio),
    m = Math.round(screen.height * devicePixelRatio);
  setRow(11, g + " × " + m + " px", "ok");
  const f = window.devicePixelRatio;
  setRow(12, f + "x", "ok");
  const b = screen.colorDepth,
    h = window.matchMedia("(dynamic-range: high)").matches;
  setRow(
    13,
    b + "bit / HDR:" + (h ? l.supported : l.unsupported),
    st(h && b >= 30, b >= 24),
  );
  const y = window.performance?.memory
    ? Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    : null;
  setRow(
    14,
    y ? y + " MB" : l.unsupported + " (Firefox)",
    y ? st(y >= 4096, y >= 2048) : "warn",
  );
  const v = diag.latency;
  if (v) {
    const e = v.medMs;
    setRow(15, `Median ${e} ms / P95: ${v.p95Ms} ms`, st(e <= 17, e <= 35));
  } else setRow(15, l.measuring, "warn");
  const x = diag.gamePing;
  if (x) {
    const e = x.avg <= 50,
      t = x.avg <= 100,
      n = x.jitter <= 30;
    let o = "";
    ((o =
      x.avg <= 30 && n
        ? l.gameExcellent
        : e && n
          ? l.gameSuitable
          : t
            ? l.gameHeavy
            : l.gameUnsuitable),
      setRow(
        16,
        `${l.ping}: ${x.avg}ms  ${l.jitter}: ${x.jitter}ms  ${o}`,
        st(x.avg <= 30 && n, e),
      ));
  } else setRow(16, l.failed, "warn");
  const _ = diag.videoPing;
  if (_) {
    const e = _.avg <= 60,
      t = _.avg <= 120,
      n = _.jitter <= 40;
    let o = "";
    ((o =
      e && n
        ? l.videoExcellent
        : t && n
          ? l.videoSuitable
          : t
            ? l.videoUnstable
            : l.videoUnsuitable),
      setRow(
        17,
        `${l.latency}: ${_.avg}ms  ${l.stability}: ${_.jitter <= 40 ? l.stable : l.unstable}(${_.jitter}ms)  ${o}`,
        st(e && n, t),
      ));
  } else setRow(17, l.failed, "warn");
  if (a) {
    const e = (e) => {
        const t = Math.round(e / 60);
        if (t >= 60) {
          return Math.floor(t / 60) + "h" + (t % 60 ? (t % 60) + "m" : "");
        }
        return t + "m";
      },
      t = a.charging
        ? a.chargingTime === 1 / 0 || 0 === a.chargingTime
          ? (a.level, "")
          : "→" + e(a.chargingTime)
        : a.dischargingTime === 1 / 0
          ? ""
          : "~" + e(a.dischargingTime),
      n = t ? "  " + t : "";
    setRow(
      18,
      a.level + "%  " + (a.charging ? l.charging : l.discharging) + n,
      st(a.level >= 80, a.level >= 30),
    );
  } else setRow(18, "API: " + l.unsupported, "warn");
  const P = navigator.maxTouchPoints;
  setRow(19, P + " pt", st(P >= 10, P >= 5));
  const S = window.matchMedia("(prefers-color-scheme: dark)").matches,
    w = window.matchMedia("(prefers-contrast: high)").matches;
  document.getElementById("row-20").style.display = "none";
  const k = "https:" === location.protocol;
  setRow(21, k ? l.secure : l.insecure, k ? "ok" : "bad");
  let I = !1;
  try {
    I = !!window.indexedDB;
  } catch (e) {}
  (setRow(
    22,
    "Cookie:" +
      (navigator.cookieEnabled ? l.enabled : l.disabled) +
      " / IDB:" +
      (I ? l.supported : l.unsupported),
    st(navigator.cookieEnabled && I, navigator.cookieEnabled),
  ),
    setRow(
      23,
      i.version,
      st("WebGL 2.0" === i.version, "WebGL 1.0" === i.version),
    ),
    setRow(
      24,
      i.maxAttrib ? i.maxAttrib + " attrs" : "--",
      st(i.maxAttrib >= 16, i.maxAttrib >= 8),
    ));
  const C = "wakeLock" in navigator,
    E = "vibrate" in navigator;
  setRow(
    25,
    "WakeLock:" +
      (C ? l.supported : l.unsupported) +
      " / Vib:" +
      (E ? l.supported : l.unsupported),
    st(C && E, C || E),
  );
  const A = "serviceWorker" in navigator,
    B = window.matchMedia("(display-mode: standalone)").matches;
  (setRow(
    26,
    "SW:" +
      (A ? l.supported : l.unsupported) +
      " / PWA:" +
      (B ? l.running : l.browser),
    A ? "ok" : "warn",
  ),
    setRow(
      27,
      navigator.webdriver ? l.detected : l.normal,
      navigator.webdriver ? "bad" : "ok",
    ),
    setRow(
      28,
      scores.fps + " / 100 pts",
      st(scores.fps >= 75, scores.fps >= 50),
    ));
  const T = Intl.DateTimeFormat().resolvedOptions().timeZone;
  (setRow(29, navigator.language.toUpperCase() + " / " + T, "good"),
    setRow(
      32,
      (S ? l.dark : l.light) + " / " + (w ? l.hiconOn : l.hiconOff),
      "good",
    ),
    setRow(33, detectBrowser(), "good"),
    (diag.deviceName =
      _settings.manualDeviceName && "" !== _settings.manualDeviceName
        ? _settings.manualDeviceName
        : detectDeviceName()),
    setRow(34, diag.deviceName, "good"),
    setRow(30, "Release 1.2.3.7", "good"));
  const D = document.getElementById("v-31"),
    U = document.getElementById("row-31");
  if (diag.publicIP && _settings.showIpInResult) {
    const e = isPrivateIP(diag.publicIP);
    ((D.textContent = diag.publicIP + (e ? " (local)" : "")),
      (U.className = "spec-row st-good"),
      (U.style.display = ""));
  } else U.style.display = "none";
  (_runDetailMode(), initHelpIcons());
  const M = Math.min(100, Math.round((p / 64) * 100)),
    L = diag.gamePing,
    z = L ? Math.max(0, Math.min(100, Math.round(100 - L.avg))) : 50,
    G = Math.round(
      0.32 * scores.cpu +
        0.23 * scores.gpu +
        0.1 * scores.mem +
        0.15 * scores.fps +
        0.12 * M +
        0.08 * z,
    );
  let N = "D";
  (G >= 80 && t >= 55 && scores.cpu >= 78 && p >= 12
    ? (N = "S")
    : G >= 65 && t >= 45 && p >= 8
      ? (N = "A")
      : G >= 48 && t >= 25
        ? (N = "B")
        : G >= 30 && (N = "C"),
    (diag.totalScore = G),
    (diag.rank = N),
    renderUsageScores(scores, M, z));
  const F = navigator.userAgent,
    R = (diag.gpu?.renderer || "").toLowerCase(),
    $ = (diag.deviceName || "").toLowerCase(),
    O =
      !(
        /windows|cros|chromebook|macintosh|linux(?!.*android)/i.test(F) ||
        /windows|chromebook|mac|linux/i.test($)
      ) &&
      /iphone/i.test(F) &&
      !/ipad/i.test(F);
  if (O) {
    const e = /apple a([1-9]|1[01])(\s|$)/.test(R),
      t =
        Math.round(
          Math.max(screen.width, screen.height) *
            (window.devicePixelRatio || 1),
        ) <= 2436,
      n = F.match(/iPhone(\d+),/);
    [e, t, !!n && parseInt(n[1]) <= 10].filter(Boolean).length >= 2 &&
      ("S" === N && (N = "B"),
      "A" === N && (N = "B"),
      p <= 8 && "B" === N && (N = "C"));
  }
  if (/android/i.test(F) && "S" === N) {
    /adreno 7[3-9]\d|adreno [89]\d\d|dimensity 9[0-9]\d\d/i.test(R) ||
      /snapdragon 8 gen [1-9]/i.test(F + $) ||
      (N = "A");
  }
  (!0 === navigator.connection?.saveData &&
    ("S" === N
      ? (N = "A")
      : "A" === N
        ? (N = "B")
        : "B" === N
          ? (N = "C")
          : "C" === N && (N = "D")),
    e < 100 && "S" === N && (N = "A"));
  let H = 23;
  try {
    const e = document.createElement("canvas"),
      t = e.getContext("webgl") || e.getContext("experimental-webgl");
    if (t) {
      const e = t.getShaderPrecisionFormat(t.FRAGMENT_SHADER, t.HIGH_FLOAT);
      e && (H = e.precision);
    }
  } catch (e) {}
  (H < 23 && ("S" === N && (N = "B"), "A" === N && (N = "B")),
    "undefined" == typeof OffscreenCanvas && "S" === N && (N = "A"),
    navigator.maxTouchPoints < 5 &&
      ("S" === N && (N = "B"), "A" === N && (N = "B")),
    navigator.userAgentData?.getHighEntropyValues &&
      navigator.userAgentData
        .getHighEntropyValues([
          "architecture",
          "bitness",
          "model",
          "platformVersion",
        ])
        .then((e) => {
          const t = (e.architecture || "").toLowerCase(),
            n = e.bitness || "";
          if ("arm" === t && "32" === n) {
            let e = document.getElementById("rank-letter").textContent;
            if ("S" === e || "A" === e || "B" === e) {
              const e = diag.lowFps < 20 ? "D" : "C";
              ((document.getElementById("rank-letter").textContent = e),
                (document.getElementById("rank-letter").className =
                  "rank-" + e));
            }
          }
          const o = (e.model || "").toLowerCase();
          if (
            "x86" === t &&
            /celeron|pentium|atom|n[2-6]\d\d\d|j[1-4]\d\d\d/.test(o)
          ) {
            let e = document.getElementById("rank-letter").textContent;
            ("S" !== e && "A" !== e) ||
              ((document.getElementById("rank-letter").textContent = "B"),
              (document.getElementById("rank-letter").className = "rank-B"));
          }
        })
        .catch(() => {}));
  try {
    const e = document.createElement("canvas").getContext("webgl2");
    (e && e.getExtension("EXT_color_buffer_float")) ||
      ("S" === N && (N = "B"), "A" === N && (N = "C"));
  } catch (e) {}
  if (O) {
    const e = F.match(/iPhone OS (\d+)_/);
    e &&
      parseInt(e[1]) <= 16 &&
      ("S" === N && (N = "B"), "A" === N && (N = "B"));
  }
  if (/macintosh/i.test(F)) {
    /apple m\d/i.test(R) || "S" !== N || (N = "A");
  }
  if (
    (diag.battery &&
      diag.battery.level < 20 &&
      !diag.battery.charging &&
      ("S" === N
        ? (N = "A")
        : "A" === N
          ? (N = "B")
          : "B" === N
            ? (N = "C")
            : "C" === N && (N = "D")),
    diag.safariThrottled)
  ) {
    N = { S: "C", A: "C", B: "C", C: "D", D: "D" }[N] || N;
  }
  const j = diag.jank32 || 0,
    W = diag.jank17 || 0;
  (j >= 1 && "S" === N && (N = "A"), W >= 5 && "A" === N && (N = "B"));
  if (/safari/i.test(F) && !/chrome|crios|fxios/i.test(F)) {
    scores.fps <= 40 &&
      ("S" === N || "A" === N ? (N = "C") : "C" === N && (N = "D"));
  }
  e >= 200 && (N = "S");
  const V = document.getElementById("rank-letter");
  ((V.textContent = N), (V.className = "rank-" + N));
  const q = _getLang(),
    K = tui();
  ((document.getElementById("status-title").textContent = q.rankMsgs[N] || N),
    (document.getElementById("eval-msg").textContent =
      `${K.scoreLabel} ${G}/100\nCPU:${scores.cpu}  GPU:${scores.gpu}  RAM:${p}GB  ${K.memLabel}:${scores.mem}  ${K.fpsLabel}:${scores.fps}  ${K.netLabel}:${diag.gamePing ? diag.gamePing.avg + "ms" : "?"}`),
    (document.getElementById("ai-btn").style.display = "block"),
    (document.getElementById("save-btn").style.display = "block"),
    (document.getElementById("share-hint").style.display = "block"),
    (document.getElementById("history-btn").style.display = "block"),
    (document.getElementById("speed-btn").style.display = "block"),
    _rankingEnabled
      ? (document.getElementById("ranking-btn").style.display = "flex")
      : setTimeout(() => {
          _rankingEnabled &&
            document.getElementById("ranking-btn") &&
            (document.getElementById("ranking-btn").style.display = "flex");
        }, 500),
    (document.getElementById("retry-btn").style.display = "block"));
  const Y = document.createElement("div");
  ((Y.textContent = tui().diagComplete),
    (Y.style.cssText =
      "position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#1c1c1e;color:#fff;padding:14px 28px;border-radius:40px;font-size:0.95rem;font-weight:700;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #3a3a3c;z-index:999999;opacity:0;transition:opacity 0.3s;white-space:nowrap;"),
    document.body.appendChild(Y),
    requestAnimationFrame(() => {
      Y.style.opacity = "1";
    }),
    setTimeout(() => {
      ((Y.style.opacity = "0"),
        setTimeout(() => document.body.removeChild(Y), 300));
    }, 2500),
    saveResultToHistory(
      G,
      N,
      scores,
      p,
      diag.avgFps,
      diag.lowFps,
      diag.gamePing ? diag.gamePing.avg : null,
    ),
    checkScoreDrop(G, scores, p, diag.gamePing ? diag.gamePing.avg : null),
    updatePuLastDiag(),
    addDiagPoints(),
    _progressMission("diag"),
    _progressMission("diag_3"),
    _progressMission("diag_5"),
    "S" === N && _progressMission("rank_s"),
    G >= 700 && _progressMission("score_700"),
    setTimeout(() => {
      _checkBestScoreMission(G);
    }, 500),
    playDoneSound(),
    vibrateOnDone(),
    setTimeout(() => {
      notifyOnDone(N, G);
    }, 800),
    setBadge(),
    diag._stopTimer && diag._stopTimer());
  const J = document.getElementById("time-remaining");
  J && (J.textContent = "");
}
let _ipMode = "show",
  _devMode = "show",
  _action = "save";
function triggerReportCapture() {
  const e = _settings.exportFormat || "png";
  "csv" !== e
    ? "pdf" !== e
      ? ((_action = "save"),
        (_ipMode = "show"),
        (_devMode = "show"),
        diag.publicIP
          ? (document.getElementById("ip-warn-overlay").style.display = "flex")
          : showDeviceWarn())
      : downloadPDF()
    : downloadCSV();
}
function downloadCSV() {
  const e = [],
    t = I18N_LABELS[_settings.language] || I18N_LABELS.ja;
  e.push(['"項目"', '"値"']);
  for (let n = 1; n <= 34; n++) {
    const o = document.getElementById("v-" + n);
    if (!o) continue;
    const i = o.textContent.trim();
    if (!i || "--" === i) continue;
    const a = t[n - 1] || "Row " + n;
    e.push([
      '"' + a.replace(/"/g, '""') + '"',
      '"' + i.replace(/"/g, '""') + '"',
    ]);
  }
  const n = "\ufeff" + e.map((e) => e.join(",")).join("\r\n"),
    o = new Blob([n], { type: "text/csv;charset=utf-8;" }),
    i = URL.createObjectURL(o),
    a = document.createElement("a");
  ((a.href = i),
    (a.download =
      "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".csv"),
    document.body.appendChild(a),
    a.click(),
    document.body.removeChild(a),
    URL.revokeObjectURL(i));
}
async function downloadPDF() {
  const e = document.getElementById("save-btn"),
    t = e.textContent;
  ((e.disabled = !0),
    (e.textContent = "⏳ PDF生成中..."),
    window.jspdf ||
      (await new Promise((e, t) => {
        const n = document.createElement("script");
        ((n.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
          (n.onload = e),
          (n.onerror = t),
          document.head.appendChild(n));
      }).catch(() => null)));
  const n = document.getElementById("capture-area");
  (n.classList.add("capture-mode"),
    window.scrollTo({ top: 0, behavior: "instant" }),
    await wait(150));
  try {
    const e = await html2canvas(n, {
      backgroundColor: "#050505",
      scale: 2,
      useCORS: !0,
      logging: !1,
      scrollX: 0,
      scrollY: 0,
    });
    n.classList.remove("capture-mode");
    const t = e.toDataURL("image/png", 1),
      o = e.width,
      i = e.height,
      { jsPDF: a } = window.jspdf,
      r = 210,
      s = Math.round((i / o) * r),
      d = new a({ orientation: s > r ? "p" : "l", unit: "mm", format: [r, s] });
    (d.addImage(t, "PNG", 0, 0, r, s),
      d.save(
        "device-report-" + new Date().toISOString().slice(0, 10) + ".pdf",
      ));
  } catch (e) {
    (n.classList.remove("capture-mode"),
      alert("PDF生成に失敗しました。\n" + e.message));
  } finally {
    ((e.disabled = !1), (e.textContent = t));
  }
}
async function shareToX() {
  (_progressMission("share_x"),
    (_action = "share"),
    (_ipMode = "show"),
    (_devMode = "show"),
    diag.publicIP
      ? (document.getElementById("ip-warn-overlay").style.display = "flex")
      : showDeviceWarn());
}
function ipChosen(e) {
  ((_ipMode = e),
    (document.getElementById("ip-warn-overlay").style.display = "none"),
    showDeviceWarn());
}
function showDeviceWarn() {
  const e = diag.deviceName || "不明";
  ((document.getElementById("device-warn-msg").textContent =
    "「" +
    e +
    "」というデバイス機種が含まれています。SNSに公開しても問題ないですが、見られたら不快なのであれば隠すことをおすすめします。"),
    (document.getElementById("device-warn-overlay").style.display = "flex"));
}
function deviceChosen(e) {
  if (
    ((_devMode = e),
    (document.getElementById("device-warn-overlay").style.display = "none"),
    "share" === _action)
  ) {
    if ("function" != typeof navigator.share)
      return void alert(
        "このブラウザまたは機種では対応していないため、画像を先に保存してからXに投稿してください。",
      );
    doShare(_ipMode, _devMode);
  } else proceedCapture(_ipMode, _devMode);
}
function goBackToIP() {
  ((document.getElementById("device-warn-overlay").style.display = "none"),
    diag.publicIP &&
      (document.getElementById("ip-warn-overlay").style.display = "flex"));
}
async function doShare(e, t) {
  const n = "#デバイス診断 #PreciseDiag #ProUltra #診断結果",
    o = document.getElementById("v-31"),
    i = document.getElementById("v-34"),
    a = o ? o.textContent : "",
    r = i ? i.textContent : "";
  if (
    ("hide" === e && o
      ? (o.textContent = "非表示")
      : "mask" === e && o && (o.textContent = maskIPAddress(a)),
    "hide" === t && i)
  ) {
    const e = i.textContent.length;
    i.textContent = "*".repeat(e >= 10 ? Math.floor(e / 2) : e);
  }
  const s = document.getElementById("share-x-btn");
  ((s.disabled = !0),
    (s.innerHTML = "画像を生成中..."),
    window.scrollTo({ top: 0, behavior: "instant" }),
    await wait(150));
  const d = document.getElementById("capture-area");
  (d.classList.add("capture-mode"), _applyPuShareStyle(d), await wait(80));
  let l = null;
  try {
    const e = await html2canvas(d, {
      backgroundColor: "#050505",
      scale: 2,
      useCORS: !0,
      logging: !1,
      scrollX: 0,
      scrollY: 0,
    });
    (d.classList.remove("capture-mode"),
      _removePuShareStyle(d),
      (l = e.toDataURL("image/png", 1)),
      (capturedDataUrl = l));
  } catch (e) {
    return (
      d.classList.remove("capture-mode"),
      o && (o.textContent = a),
      i && (i.textContent = r),
      (s.disabled = !1),
      (s.innerHTML = SHARE_SVG),
      void alert("画像の生成に失敗しました: " + e.message)
    );
  }
  (o && (o.textContent = a),
    i && (i.textContent = r),
    (s.disabled = !1),
    (s.innerHTML = SHARE_SVG));
  const c = /iP(hone|ad|od)/.test(navigator.userAgent);
  try {
    if (c) {
      let e = !1;
      try {
        const t = await fetch(l),
          n = await t.blob();
        (await navigator.clipboard.write([
          new ClipboardItem({ "image/png": n }),
        ]),
          (e = !0));
      } catch (e) {}
      const t =
        "https://x.com/intent/post?text=" +
        encodeURIComponent(
          "#デバイス診断 #PreciseDiag #ProUltra #診断結果\nhttps://pro-ultra.pages.dev/",
        );
      if ("function" == typeof navigator.share)
        try {
          await navigator.share({
            text: "#デバイス診断 #PreciseDiag #ProUltra #診断結果\nhttps://pro-ultra.pages.dev/",
          });
        } catch (e) {
          "AbortError" !== e.name && window.open(t, "_blank", "noopener");
        }
      else window.open(t, "_blank", "noopener");
      e &&
        _showToast("📋 画像をコピーしました！Xの投稿画面で貼り付けてください");
    } else {
      const e = await fetch(l),
        t = await e.blob(),
        o = new File([t], "device-diagnostic.png", { type: "image/png" });
      navigator.canShare && navigator.canShare({ files: [o] })
        ? await navigator.share({ files: [o], text: n })
        : await navigator.share({ text: n });
    }
  } catch (e) {
    if ("AbortError" === e.name) return;
    alert(
      "このブラウザまたは機種では対応していないため、画像を先に保存してからXに投稿してください。",
    );
  }
}
function maskIPAddress(e) {
  const t = e.replace(/[^0-9.]/g, "").split(".");
  if (t.length < 4) return e;
  const n = e.replace(/^[\d.]+/, "").trim(),
    o = n ? " " + n : "",
    i = [t[0], t[1], t[2], t[3]];
  i[3] = "*".repeat(i[3].length || 2);
  const a = Math.floor(3 * Math.random());
  return (i[a] && (i[a] = "*".repeat(i[a].length || 2)), i.join(".") + o);
}
function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}
const _aiHistory = [],
  AI_STORAGE_KEY = "ai_conversations";
function loadAIConvs() {
  try {
    return JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function saveAIConvs(e) {
  try {
    (localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(e)),
      syncAIConvsToCloud(e));
  } catch (e) {}
}
function saveCurrentConv(e) {
  if (0 === _aiHistory.filter((e) => e.role).length) return;
  const t = loadAIConvs(),
    n = {
      id: Date.now(),
      name: e || "会話 " + new Date().toLocaleString("ja-JP"),
      date: new Date().toLocaleString("ja-JP"),
      messages: _aiHistory.filter((e) => e.role).slice(),
      sys: _aiHistory._sys || "",
    };
  (t.unshift(n), t.length > 5 && t.splice(5), saveAIConvs(t));
}
function showAIConvManager() {
  const e = loadAIConvs(),
    t = document.getElementById("ai-conv-modal"),
    n = document.getElementById("ai-conv-list");
  (0 === e.length
    ? (n.innerHTML =
        '<p style="color:var(--sub-text);text-align:center;padding:20px;">保存された会話がありません。</p>')
    : (n.innerHTML = e
        .map(
          (e, t) =>
            `\n            <div data-conv-idx="${t}" style="background:#1a1a1a;border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;">\n                <div class="ai-conv-name-area">\n                    <div style="font-weight:800;color:#a78bfa;">💬 ${e.name}</div>\n                </div>\n                <div style="color:var(--sub-text);font-size:0.8rem;margin:4px 0 10px;">${e.date} · ${e.messages.length}メッセージ</div>\n                <div style="display:flex;gap:8px;">\n                    <button data-conv-action="load"   data-conv-i="${t}" style="flex:1;padding:8px;border-radius:10px;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);color:#a78bfa;font-size:0.82rem;font-weight:700;cursor:pointer;">📂 読み込む</button>\n                    <button data-conv-action="rename" data-conv-i="${t}" style="flex:1;padding:8px;border-radius:10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);color:#6bb5ff;font-size:0.82rem;font-weight:700;cursor:pointer;">✏️ 名前変更</button>\n                    <button data-conv-action="delete" data-conv-i="${t}" style="flex:1;padding:8px;border-radius:10px;background:rgba(255,59,48,0.15);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.82rem;font-weight:700;cursor:pointer;">🗑 削除</button>\n                </div>\n            </div>`,
        )
        .join("")),
    (n.onclick = (e) => {
      const t = e.target.closest("button[data-conv-action]");
      if (!t) return;
      const n = parseInt(t.dataset.convI),
        o = t.dataset.convAction,
        i = loadAIConvs();
      if ("load" === o) {
        ((_aiHistory.length = 0),
          (_aiHistory._sys = i[n].sys),
          i[n].messages.forEach((e) => _aiHistory.push(e)));
        ((document.getElementById("ai-messages").innerHTML = ""),
          _aiHistory
            .filter((e) => e.role)
            .forEach((e) => appendAIMsg(e.role, e.content)),
          (document.getElementById("ai-conv-modal").style.display = "none"),
          (document.getElementById("ai-modal").style.display = "flex"));
      } else if ("delete" === o)
        (i.splice(n, 1), saveAIConvs(i), showAIConvManager());
      else if ("rename" === o) {
        const t = e.target.closest("[data-conv-idx]"),
          o = t?.querySelector(".ai-conv-name-area");
        if (!o) return;
        const a = i[n].name;
        ((o.innerHTML = `\n                <div style="display:flex;gap:6px;margin-bottom:4px;">\n                    <input id="ai-conv-rename-${n}" type="text" value="${a.replace(/"/g, "&quot;")}"\n                        style="flex:1;background:#2a2a2a;border:1px solid var(--accent);border-radius:8px;padding:6px 10px;color:#fff;font-size:0.88rem;outline:none;">\n                    <button data-conv-action="rename-save" data-conv-i="${n}"\n                        style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-weight:800;cursor:pointer;font-size:0.82rem;">保存</button>\n                </div>`),
          document.getElementById(`ai-conv-rename-${n}`)?.focus());
      } else if ("rename-save" === o) {
        const e =
          document.getElementById(`ai-conv-rename-${n}`)?.value.trim() || "";
        (e && ((i[n].name = e), saveAIConvs(i)), showAIConvManager());
      }
    }),
    (t.style.display = "flex"));
}
function openAIChat() {
  (_progressMission("ai_advisor"),
    (_aiHistory.length = 0),
    (document.getElementById("ai-messages").innerHTML = ""));
  const e = document.getElementById("rank-letter").textContent,
    t = document.getElementById("eval-msg").textContent,
    n = document.getElementById("v-34")?.textContent || "不明",
    o = document.getElementById("v-2")?.textContent || "不明",
    i = document.getElementById("v-8")?.textContent || "不明",
    a = document.getElementById("v-9")?.textContent || "不明",
    r = document.getElementById("v-5")?.textContent || "不明",
    s = document.getElementById("v-6")?.textContent || "不明";
  ((_aiHistory._sys = `あなたは「精密デバイス診断 Pro Ultra」のAIアドバイザーです。以下の診断データとアプリ仕様を基に、ユーザーの質問に対して正確で実用的なアドバイスを提供してください。\n\n■ ユーザーの診断結果\nランク: ${e}（S=最高峰 / A=高性能 / B=標準 / C=やや非力 / D=旧式）\nスコア: ${t}（CPU32% GPU23% FPS15% RAM12% メモリ帯域10% NET8% の加重合計）\nデバイス: ${n} / RAM: ${o} / avgFPS: ${i} / 1%LOW: ${a}（カクつきの激しさ）/ CPU: ${r}/100 / GPU: ${s}/100\n\n■ アプリの全機能仕様\n\n【診断機能】\n・ページを開くと自動診断開始。CPU/GPU/メモリ帯域/FPS/RAM/ネットワーク/バッテリー等30以上の項目を計測\n・FPS計測は通常15秒間。オフスクリーンCanvasに120個のパーティクルで実負荷をかけて精度向上\n・診断中は残り時間を1秒ごとに表示。完了時に「✅ 処理が完了しました」トーストが出る\n・色の意味：青=正常 / 黄=注意 / 赤=警告 / 緑=情報\n・【ProUltra限定】詳細モード診断。通常項目に加えて「3つの秘匿深部解析項目」を計測。合計33項目以上の超精密診断。\n・【ProUltra+ / 4ヶ月記念限定】診断モード選択機能：再診断ボタンから3つのモードを選択できる\n  - ⚡ 高速診断モード：最速約8秒で完了。CPU計測1回・FPS6秒。急いでいる人向け。精度はやや低め。\n  - 🔬 通常診断：約25秒。CPU計測3回・FPS15秒。バランスのとれた標準診断。\n  - 👑 ProUltra Max：約45秒。CPU計測5回・FPS30秒。さらに追加5項目（GPU詳細・メモリ帯域精密・ストレージ速度・JSエンジンスコア・通信精密計測）の超精密診断。\n\n【画像保存機能（青いボタン「診断レポートを画像で保存する」）】\n・2段階のプライバシー警告がある\n・第1段階：IPアドレスの扱いを3択で選ぶ\n  ①「🔒 IPアドレスを非表示にして保存（推奨）」→ 完全に「非表示」という文字に置き換わる\n  ②「⚠️ 一部を*で隠して保存」→ 末尾オクテット等を*でマスク\n  ③「そのまま含めて保存」→ IPがそのまま画像に入る\n  ・「← 戻る（保存をキャンセル）」で保存自体をキャンセル可能\n・第2段階：デバイス名の扱いを2択で選ぶ\n  ①「そのまま含めて保存」（緑ボタン・上）\n  ②「🔒 デバイス名を*に変更して保存」（青ボタン・下）\n  ・「← 戻る（IPアドレスの選択に戻る）」で第1段階に戻れる\n・2段階完了後に画像が生成されプレビューモーダルが開く\n・CSVおよびPDF形式での詳細レポート出力にも対応\n\n【プレビューモーダルのボタン（3つ）】\n①「⬇ 画像をダウンロード」→ PNG画像をデバイスに保存\n②「診断に戻る」→ モーダルを閉じる\n③「X (Twitter) にシェアする」（白枠・Xロゴ付きボタン）\n  → 押すと「①画像が自動ダウンロードされる」「②0.3秒後にXの投稿画面が新しいタブで開く」の2つが自動実行される\n  → テキスト「#デバイス診断 #PreciseDiag #ProUltra #診断結果」が自動入力済み\n  → ※画像はXに自動添付されない。ダウンロードされた画像を手動で添付する必要がある\n\n【履歴機能（ピンクのボタン「📊 過去の診断結果を見る」）】\n・診断完了のたびに自動でlocalStorageに最大3回分保存\n・【ログイン特典】保存件数を「5件」に拡張\n・各カードに：ランク・スコア・日時・CPU/GPU/RAM/avgFPS/1%LOW/NETを表示\n・「✏️ 名前をつける」→ カード内にインライン入力欄が展開されて名前入力（例：「YouTube重い時」）\n・「🗑 削除」→ 1件だけ削除してリストを即再描画\n・履歴の「固定（ピン留め）」機能\n・2件以上の履歴で「スコア推移グラフ」を表示\n\n【ProUltraアカウント】\n・【ProUltra限定特典】詳細モード（＋3項目）、リマインド機能、限定スキン（Aurora/Diamond/Gold）、専用バッジ、プレミアムシェアカード\n・【親友コード】ユーザー自らグループを作成し、IDとパスワードを入力すると5人までグループに入れるシステム。グループ登録時にはグループ名、グループアイコン(絵文字20個のプリセットから選ぶ)とパスワードを設定できる。参加時にはグループIDとパスワードを入力すると入会できる\n・ログイン連携：Google, GitHub, Twitter, Discord, 匿名\n\n【AIアドバイザー（紫のボタン「🤖 AIアドバイザーに相談する」）】\n・起動時に診断データを自動読み取り\n・上部入力欄に名前を入れて「💾 保存」で会話を最大5件保存可能\n・「📂 保存した会話」で一覧表示。「読み込む」「名前変更」「削除」が可能\n・「✕」でチャットを閉じる\n・Enterで送信 / Shift+Enterで改行\n\n【バッテリードレインテスト（紫のボタン「🔋 バッテリードレインテスト」）】\n・CPU持続負荷テスト（約10秒）でサーマル特性を計測\n・デバイス種別（Chromebook / iPhone・iPad / Android高・低 / ノートPC / デスクトップPC）を自動判定（UserAgent・deviceMemory・コア数から判定）\n・ChromeOS・モバイルはJSスロットリング特性を考慮したTier閾値を使用。Chromebook RAM 4GB以下はTierを1段補正\n・同クラスの実機統計データ（GSMArena・Notebookcheck）と組み合わせて通常使用時・高負荷時のバッテリー持ちを推定\n・パフォーマンス安定率（%）：負荷中の動作一貫性を変動係数（CV）で算出。85%以上=安定 / 60〜84%=やや不安定 / 60%未満=不安定\n・ノートPC・デスクトップではサーマル耐性スコアとスロットリング開始タイミングも表示\n・Battery APIを一切使用しないため、iOS・Firefox・Safari・充電中を含むすべてのブラウザ・環境で動作します（ブラウザ制限なし）\n・デスクトップPCはバッテリー非搭載として「非搭載」と表示\n\n【ガチャ・バッジシステム】\n・ガチャ券を使ってバッジをランダム入手。レアリティはrare/epic/legendary\n・ガチャ券は購入・スタンプラリー報酬・イベントログインボーナス等で入手可能\n・残り1種のバッジがある状態でガチャ券を使って3回引くと必ず入手できる救済措置あり\n・バッジはプロフィールや診断結果画面に表示可能\n\n【4ヶ月記念イベント（2026年6月27日〜7月17日）】\n・イベント期間中は全ユーザーが以下の特典を無料で受け取れる：\n  - 🎊 4ヶ月記念バッジ（自動付与）\n  - 🌌 Cosmosスキン（期間中は誰でも使用可能）\n・7日間ログインボーナス：毎日アクセスするとポイントと報酬が増えていく（Day3・Day7にガチャ券追加）\n  - Day1: +30pt / Day2: +30pt / Day3: +50pt＋ガチャ券×1 / Day4: +30pt / Day5: +50pt / Day6: +30pt / Day7: +100pt＋ガチャ券×2\n・スタンプラリー（21日間）：毎日スタンプを押せる\n  - 3日達成：🏷️ 参加バッジ ＋ 🎟️ ガチャ券×1\n  - 7日達成：🌌 Cosmosスキン\n  - 14日達成：🎟️ ガチャ券×1\n  - 21日達成：👑 皆勤賞バッジ ＋ 200pt\n・週替わりチャレンジ（ProUltra+限定）：\n  - Week1（6/27-7/3）：🌅 朝イチチャレンジ → 「早起き診断士」バッジ\n  - Week2（7/4-7/10）：🔥 高負荷チャレンジ → 「フルロード診断士」バッジ\n  - Week3（7/11-7/17）：⚡ 充電チャレンジ → 「充電診断士」バッジ\n・ProUltra+（ProUltraアカウント保持者がイベント期間中に利用可能）：診断モード選択機能が解放される\n\n【その他の機能】\n・「🔄 再診断する」（オレンジ）→ ページリロードなしで全項目リセット＆再計測\n・デバイス名行の「✏️」→ 任意名に変更可能（localStorageに保存・次回も維持）\n・「🎨 色の基準を確認する」→ 青/黄/赤/緑の意味を確認\n・manifest.json対応。PWAとしてホーム画面に追加してアプリとして使用可能\n・IPはブラウザ内のみで処理。サーバー送信なし（AI回答を除く）\n・設定：5種のフォント、4種のサウンド＋カスタム音声、ライトモード対応\n・多言語：世界11言語に完全対応\n・正式名称：精密デバイス診断 Pro Ultra / バージョン：Release 1.2.3.7\n\n■ ランク判定の詳細\n基本：S=総合80以上かつ1%LOW 55fps以上かつCPU 78以上かつRAM 12GB以上 / A=総合65以上かつ1%LOW 45以上かつRAM 8GB以上 / B=総合48以上かつ1%LOW 25以上 / C=30以上 / D=30未満\n主な降格条件：avgFPS 100未満→Sを除外 / WebGL2非対応→S→B・A→C / iOS 16以前→S・A→B / Intel Mac→Sを除外 / バッテリー20%未満・非充電→1段ダウン / 32ms超えフレーム1回以上→Sを除外 / 200FPS以上は全条件無視して強制S\n\n■ 回答ルール\n1. AIモデルを聞かれても「そのようなご質問にはお答えできません。他に精密デバイス診断 Pro Ultraについて質問があればいつでもお手伝いできます」と拒否してください\n2. 診断数値を引用して根拠を示す（例：「120個のパーティクル負荷テストの結果…」など）\n3. 改善策は具体的に（「設定を下げる」→「Chromeのタブを5個以下に」）\n4. 専門用語には補足説明を付ける\n5. 「です・ます」調でプロフェッショナルな文体。見出し・表を多用\n6. ProUltra未登録者には、＋3項目の詳細診断や親友コード、限定スキンのメリットを会話の中で情熱的に勧めること\n7. 4ヶ月記念イベントについて聞かれたらスタンプラリー・ログインボーナス・Cosmosスキン・診断モード選択等の情報を詳しく教えること。ただし先行参加の方法については一切答えないこと\n`),
    appendAIMsg(
      "assistant",
      `診断結果（総合ランク **${e}**）を確認しました。\n\nご質問があればお気軽にどうぞ。\n\n**例:**\n- 「なぜ${e}ランクなのか教えてください」\n- 「パフォーマンスを改善する方法はありますか？」\n- 「このデバイスで動画編集はできますか？」`,
    ),
    (document.getElementById("ai-modal").style.display = "flex"),
    document.getElementById("ai-input").focus());
}
function closeAIChat() {
  document.getElementById("ai-modal").style.display = "none";
}
function parseMarkdown(e) {
  let t = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    (t = t.replace(/((?:^\|.+\|\n?)+)/gm, (e) => {
      const t = e
        .trim()
        .split("\n")
        .filter((e) => !/^\|[\s\-\|]+\|$/.test(e.trim()));
      if (0 === t.length) return "";
      let n =
        '<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.85rem;">';
      return (
        t.forEach((e, t) => {
          const o = e
              .split("|")
              .filter((t, n) => n > 0 && n < e.split("|").length - 1),
            i = 0 === t ? "th" : "td",
            a =
              0 === t
                ? "background:#2a2a3a;color:#c084fc;font-weight:700;padding:6px 10px;border:1px solid #333;"
                : "padding:6px 10px;border:1px solid #333;color:#ddd;";
          n +=
            "<tr>" +
            o.map((e) => `<${i} style="${a}">${e.trim()}</${i}>`).join("") +
            "</tr>";
        }),
        (n += "</table>"),
        n
      );
    })),
    (t = t.replace(/^[\s\-\|]+$/gm, "")),
    (t = t.replace(/[*][*][*](.+?)[*][*][*]/g, "<strong><em>$1</em></strong>")),
    (t = t.replace(/[*][*](.+?)[*][*]/g, "<strong>$1</strong>")),
    (t = t.replace(/[*](.+?)[*]/g, "<em>$1</em>")),
    (t = t.replace(
      /`([^`]+)`/g,
      '<code style="background:#2a2a3a;padding:1px 5px;border-radius:4px;font-size:0.88em;">$1</code>',
    )),
    (t = t.replace(
      /^### (.+)$/gm,
      '<div style="font-weight:800;font-size:1rem;margin:8px 0 4px;">$1</div>',
    )),
    (t = t.replace(
      /^## (.+)$/gm,
      '<div style="font-weight:800;font-size:1.05rem;margin:8px 0 4px;">$1</div>',
    )),
    (t = t.replace(
      /^# (.+)$/gm,
      '<div style="font-weight:800;font-size:1.1rem;margin:8px 0 4px;">$1</div>',
    )),
    (t = t.replace(
      /^[-*] (.+)$/gm,
      '<div style="padding-left:12px;">• $1</div>',
    )),
    (t = t.replace(/\n/g, "<br>")),
    t
  );
}
function appendAIMsg(e, t) {
  const n = document.getElementById("ai-messages"),
    o = document.createElement("div");
  return (
    (o.className = "ai-msg " + e),
    "assistant" === e ? (o.innerHTML = parseMarkdown(t)) : (o.textContent = t),
    n.appendChild(o),
    (n.scrollTop = n.scrollHeight),
    o
  );
}
async function sendAIMessage() {
  const e = document.getElementById("ai-input"),
    t = document.getElementById("ai-send"),
    n = e.value.trim();
  if (!n) return;
  if (!_aiUnlimited && _isProUltra) {
    if (_getAIDailyCount() >= AI_DAILY_LIMIT)
      return void appendAIMsg(
        "assistant",
        `⚠️ 本日のAIチャット上限（${AI_DAILY_LIMIT}回）に達しました。「AIチャット無制限」をポイントショップで購入すると解除できます。`,
      );
    _incAIDailyCount();
  }
  ((e.value = ""),
    (t.disabled = !0),
    _progressMission("ai_3q"),
    appendAIMsg("user", n),
    _aiHistory.push({ role: "user", content: n }));
  const o = appendAIMsg("assistant", "");
  let i = 18;
  const a = document.createElement("div");
  a.style.cssText = "color:#a78bfa;font-size:0.8rem;margin-top:4px;";
  const r = document.createElement("div");
  function s() {
    a.textContent = "推定残り時間: 約 " + i + " 秒";
  }
  ((r.textContent = "回答を生成しています..."),
    o.appendChild(r),
    o.appendChild(a),
    s());
  const d = setInterval(() => {
      const e = Math.random() < 0.3 ? 2 : 1;
      ((i = Math.max(1, i - e)),
        i <= 2 && (i += Math.floor(5 * Math.random()) + 3),
        s());
    }, 1e3),
    l = _aiHistory.filter((e) => e.role).slice(-6),
    c = [{ role: "system", content: _aiHistory._sys }, ...l];
  let p = null,
    u = "";
  window._aiFailedProviders || (window._aiFailedProviders = new Set());
  const g = (e, t) => {
    (window._aiFailedProviders.add(e), (u = t));
  };
  if (!p && ((f = "worker"), !window._aiFailedProviders.has(f))) {
    ((i = 25), (m = "AIが回答を生成しています...") && (r.textContent = m), s());
    try {
      const e = new AbortController(),
        t = setTimeout(() => e.abort(), 25e3),
        n = await fetch("https://proultra.yuyusesabuchanneru.workers.dev/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: c }),
          signal: e.signal,
        });
      if ((clearTimeout(t), n.ok)) {
        const e = await n.json(),
          t = e.choices?.[0]?.message?.content || "";
        t ? (p = t.trim()) : g("worker", "中継サーバー: 空のレスポンスです。");
      } else {
        const e = await n.json().catch(() => ({}));
        g("worker", "中継サーバー: HTTP " + n.status + " " + (e?.error || ""));
      }
    } catch (e) {
      g(
        "worker",
        "AbortError" === e.name
          ? "中継サーバー: タイムアウト。"
          : "中継サーバー: " + (e.message || "エラー。"),
      );
    }
  }
  var m, f;
  (clearInterval(d),
    p
      ? ((o.innerHTML = parseMarkdown(p)),
        _aiHistory.push({ role: "assistant", content: p }))
      : (o.innerHTML = `\n            <div style="background:#1c0a0a;border:1px solid #ff453a;border-radius:16px;padding:18px;">\n                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">\n                    <span style="font-size:1.3rem;">❌</span>\n                    <span style="font-weight:800;font-size:1rem;color:#fff;">AIに接続できませんでした</span>\n                </div>\n                <div style="color:#aaa;font-size:0.85rem;line-height:1.7;margin-bottom:12px;">${u || "不明なエラー。"}</div>\n                <div style="background:#111;border-radius:10px;padding:12px;font-size:0.82rem;color:#888;line-height:1.7;">\n                    💡 <strong style="color:#ccc;">対処法</strong><br>\n                    ① しばらく待ってから再送信<br>\n                    ② ページをリロードすると再試行できます<br>\n                    ③ ネットワーク環境を確認する\n                </div>\n            </div>`),
    (t.disabled = !1),
    (document.getElementById("ai-messages").scrollTop = 99999),
    e.focus());
}
async function modalShareToX() {
  if ((_progressMission("share_x"), !capturedDataUrl)) return;
  const e = /iP(hone|ad|od)/.test(navigator.userAgent),
    t =
      "https://x.com/intent/post?text=" +
      encodeURIComponent(
        "#デバイス診断 #PreciseDiag #ProUltra #診断結果\nhttps://pro-ultra.pages.dev/",
      );
  if (e) {
    let e = !1;
    try {
      const t = await fetch(capturedDataUrl),
        n = await t.blob();
      (await navigator.clipboard.write([new ClipboardItem({ "image/png": n })]),
        (e = !0));
    } catch (e) {}
    return (
      window.open(t, "_blank", "noopener"),
      void (e
        ? _showToast("📋 画像をコピーしました！Xの投稿画面で貼り付けてください")
        : _showToast("📸 Xの投稿画面で画像を手動で添付してください"))
    );
  }
  const n = document.createElement("a");
  ((n.href = capturedDataUrl),
    (n.download =
      "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png"),
    document.body.appendChild(n),
    n.click(),
    document.body.removeChild(n),
    await wait(300),
    window.open(t, "_blank", "noopener"));
}
async function modalShareToLine() {
  if ((_progressMission("share_line"), !capturedDataUrl))
    return void alert("先に画像を生成してください（保存ボタンを押してから）");
  const e = document.createElement("a");
  ((e.href = capturedDataUrl),
    (e.download =
      "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png"),
    document.body.appendChild(e),
    e.click(),
    document.body.removeChild(e),
    await wait(300));
  const t = encodeURIComponent(
    "#デバイス診断 #ProUltra\nhttps://pro-ultra.pages.dev/",
  );
  window.open(
    "https://social-plugins.line.me/lineit/share?url=" +
      encodeURIComponent("https://pro-ultra.pages.dev/") +
      "&text=" +
      t,
    "_blank",
    "noopener",
  );
}
async function modalShareToBluesky() {
  if ((_progressMission("share_bluesky"), !capturedDataUrl))
    return void alert("先に画像を生成してください（保存ボタンを押してから）");
  const e = document.createElement("a");
  ((e.href = capturedDataUrl),
    (e.download =
      "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png"),
    document.body.appendChild(e),
    e.click(),
    document.body.removeChild(e),
    await wait(300));
  const t = encodeURIComponent(
    "#デバイス診断 #ProUltra\nhttps://pro-ultra.pages.dev/",
  );
  window.open(
    "https://bsky.app/intent/compose?text=" + t,
    "_blank",
    "noopener",
  );
}
async function modalShareToThreads() {
  if (!capturedDataUrl)
    return void alert("先に画像を生成してください（保存ボタンを押してから）");
  const e = document.createElement("a");
  ((e.href = capturedDataUrl),
    (e.download =
      "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png"),
    document.body.appendChild(e),
    e.click(),
    document.body.removeChild(e),
    await wait(300));
  const t = encodeURIComponent(
    "#デバイス診断 #ProUltra\nhttps://pro-ultra.pages.dev/",
  );
  window.open(
    "https://www.threads.net/intent/post?text=" + t,
    "_blank",
    "noopener",
  );
}
async function modalShareToFacebook() {
  if (capturedDataUrl) {
    const e = document.createElement("a");
    ((e.href = capturedDataUrl),
      (e.download =
        "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png"),
      document.body.appendChild(e),
      e.click(),
      document.body.removeChild(e),
      await wait(300));
  }
  window.open(
    "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent("https://pro-ultra.pages.dev/"),
    "_blank",
    "noopener",
  );
}
async function proceedCapture(e, t) {
  const n = document.getElementById("v-31"),
    o = document.getElementById("v-34"),
    i = n ? n.textContent : "",
    a = o ? o.textContent : "";
  if (
    ("hide" === e && n
      ? (n.textContent = "非表示")
      : "mask" === e && n && (n.textContent = maskIPAddress(i)),
    "hide" === t && o)
  ) {
    const e = o.textContent.length;
    o.textContent = "*".repeat(e >= 10 ? Math.floor(e / 2) : e);
  }
  const r = document.getElementById("save-btn");
  ((r.disabled = !0),
    (r.textContent = "⏳ " + (_getLang().generatingLabel || "生成中...")),
    window.scrollTo({ top: 0, behavior: "instant" }),
    await wait(150));
  const s = document.getElementById("capture-area");
  (s.classList.add("capture-mode"), _applyPuShareStyle(s), await wait(80));
  try {
    const r = await html2canvas(s, {
      backgroundColor: "#050505",
      scale: 2,
      useCORS: !0,
      logging: !1,
      scrollX: 0,
      scrollY: 0,
    });
    (s.classList.remove("capture-mode"),
      _removePuShareStyle(s),
      "show" !== e && n && (n.textContent = i),
      "show" !== t && o && (o.textContent = a),
      (capturedDataUrl = r.toDataURL("image/png", 1)));
    const d = document.getElementById("result-img-wrap");
    d.innerHTML = "";
    const l = new Image();
    ((l.src = capturedDataUrl),
      d.appendChild(l),
      (document.getElementById("modal-overlay").style.display = "flex"));
    const c = document.createElement("div");
    ((c.textContent = tui().imgGenComplete),
      (c.style.cssText =
        "position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#1c1c1e;color:#fff;padding:14px 28px;border-radius:40px;font-size:0.95rem;font-weight:700;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #3a3a3c;z-index:999999;opacity:0;transition:opacity 0.3s;white-space:nowrap;"),
      document.body.appendChild(c),
      requestAnimationFrame(() => {
        c.style.opacity = "1";
      }),
      setTimeout(() => {
        ((c.style.opacity = "0"),
          setTimeout(() => document.body.removeChild(c), 300));
      }, 2500));
  } catch (r) {
    (s.classList.remove("capture-mode"),
      "show" !== e && n && (n.textContent = i),
      "show" !== t && o && (o.textContent = a),
      console.error(r),
      alert("画像生成中にエラーが発生しました。\n" + r.message));
  } finally {
    ((r.disabled = !1),
      (r.textContent =
        _getLang().saveBtnTxt || "診断レポートを画像で保存する"));
  }
}
function downloadCapturedImage() {
  if (!capturedDataUrl) return void alert("先にキャプチャを生成してください。");
  _progressMission("dl_image");
  const e =
    "device-diagnostic-" + new Date().toISOString().slice(0, 10) + ".png";
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    const t = window.open();
    return void (t
      ? (t.document.write(
          '<img src="' + capturedDataUrl + '" style="max-width:100%">',
        ),
        t.document.write(
          '<p style="font-family:sans-serif;color:#333;font-size:14px;">画像を長押し → 「写真に保存」でダウンロードできます</p>',
        ),
        (t.document.title = e))
      : (window.location.href = capturedDataUrl));
  }
  const t = document.createElement("a");
  ((t.href = capturedDataUrl),
    (t.download = e),
    document.body.appendChild(t),
    t.click(),
    document.body.removeChild(t));
}
function deleteHistory(e) {
  try {
    const t = JSON.parse(localStorage.getItem("diag_history") || "[]");
    (t.splice(e, 1),
      localStorage.setItem("diag_history", JSON.stringify(t)),
      syncHistoryToCloud(t),
      showHistoryModal());
  } catch (e) {}
}
function renameHistory(e) {
  try {
    const t = JSON.parse(localStorage.getItem("diag_history") || "[]"),
      n = t[e]?.name || "",
      o = document.querySelector(`[data-card-index="${e}"]`);
    if (!o) return;
    const i = o.querySelector(".history-name-area");
    if (!i) return;
    ((i.innerHTML = `\n            <div style="display:flex;gap:6px;margin-bottom:6px;">\n                <input id="rename-input-${e}" type="text" value="${n.replace(/"/g, "&quot;")}"\n                    style="flex:1;background:#2a2a2a;border:1px solid var(--accent);border-radius:8px;padding:6px 10px;color:#fff;font-size:0.9rem;outline:none;"\n                    placeholder="例: YouTube重い時">\n                <button data-action="rename-save" data-index="${e}"\n                    style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-weight:800;cursor:pointer;font-size:0.85rem;">保存</button>\n                <button data-action="rename-cancel" data-index="${e}"\n                    style="background:#333;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-weight:800;cursor:pointer;font-size:0.85rem;">✕</button>\n            </div>`),
      document.getElementById(`rename-input-${e}`)?.focus());
  } catch (e) {
    console.error(e);
  }
}
function saveRename(e) {
  try {
    const t = document.getElementById(`rename-input-${e}`)?.value || "",
      n = JSON.parse(localStorage.getItem("diag_history") || "[]");
    ((n[e].name = t.trim()),
      localStorage.setItem("diag_history", JSON.stringify(n)),
      showHistoryModal());
  } catch (e) {}
}
function renderUsageScores(e, t, n) {
  const o = document.getElementById("usage-score-section"),
    i = document.getElementById("usage-score-grid");
  if (!o || !i) return;
  const a = (e) => Math.max(0, Math.min(100, Math.round(e))),
    r = [
      {
        icon: "🎮",
        label: "ゲーム",
        score: a(0.3 * e.cpu + 0.35 * e.gpu + 0.25 * e.fps + 0.1 * n),
        desc: "GPU / FPS 重視",
        thresholds: [80, 60, 40],
      },
      {
        icon: "🎬",
        label: "動画編集",
        score: a(0.4 * e.cpu + 0.3 * e.gpu + 0.2 * t + 0.1 * e.mem),
        desc: "CPU / GPU / RAM 重視",
        thresholds: [80, 60, 40],
      },
      {
        icon: "📹",
        label: "Web会議",
        score: a(0.35 * n + 0.25 * e.cpu + 0.25 * e.fps + 0.15 * t),
        desc: "NET / FPS 重視",
        thresholds: [75, 55, 35],
      },
      {
        icon: "💻",
        label: "普段使い",
        score: a(0.25 * e.cpu + 0.25 * t + 0.2 * e.mem + 0.2 * e.fps + 0.1 * n),
        desc: "バランス重視",
        thresholds: [70, 50, 30],
      },
    ];
  ((i.innerHTML = r
    .map((e) => {
      const t = ((e, [t, n, o]) =>
          e >= t
            ? "#34c759"
            : e >= n
              ? "#ff9500"
              : e >= o
                ? "#ff6b6b"
                : "#888")(e.score, e.thresholds),
        n = ((e, [t, n, o]) =>
          e >= t ? "適正" : e >= n ? "概ね可" : e >= o ? "不足気味" : "非推奨")(
          e.score,
          e.thresholds,
        ),
        o = e.score;
      return `\n        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;">\n            <div style="display:flex;align-items:center;justify-content:space-between;">\n                <div style="display:flex;align-items:center;gap:6px;">\n                    <span style="font-size:1.2rem;">${e.icon}</span>\n                    <span style="font-size:0.85rem;font-weight:800;color:#fff;">${e.label}</span>\n                </div>\n                <span style="font-size:0.7rem;font-weight:700;color:${t};background:${t}22;border-radius:6px;padding:2px 7px;">${n}</span>\n            </div>\n            <div style="display:flex;align-items:baseline;gap:3px;">\n                <span style="font-size:1.7rem;font-weight:900;color:${t};line-height:1;">${e.score}</span>\n                <span style="font-size:0.75rem;color:#666;">/100</span>\n            </div>\n            <div style="background:#2a2a2a;border-radius:4px;height:5px;overflow:hidden;">\n                <div style="width:${o}%;height:100%;background:${t};border-radius:4px;transition:width 0.8s cubic-bezier(.4,0,.2,1);"></div>\n            </div>\n            <div style="font-size:0.7rem;color:#666;">${e.desc}</div>\n        </div>`;
    })
    .join("")),
    (o.style.display = "block"));
}
function checkScoreDrop(e, t, n, o) {
  try {
    const n = JSON.parse(localStorage.getItem("diag_history") || "[]"),
      o = n.length >= 2 ? n[1] : null;
    if (!o) return;
    const i = 15,
      a = [],
      r = o.totalScore - e;
    if (r >= i) {
      const n = (o.cpu || 0) - t.cpu,
        i = (o.gpu || 0) - t.gpu,
        s = (o.mem || 0) - t.mem,
        d = (o.fps || 0) - t.fps;
      (n >= 10 &&
        a.push({
          label: "CPU",
          drop: n,
          hints: [
            "サーマルスロットリング",
            "バックグラウンドアプリの過負荷",
            "充電しながらの使用",
          ],
        }),
        i >= 10 &&
          a.push({
            label: "GPU",
            drop: i,
            hints: [
              "GPU温度上昇",
              "ブラウザのGPUキャッシュ肥大",
              "低電力モードON",
            ],
          }),
        s >= 10 &&
          a.push({
            label: "メモリ帯域",
            drop: s,
            hints: ["メモリ不足（タブを閉じてみて）", "OSのメモリ圧縮が発動中"],
          }),
        d >= 10 &&
          a.push({
            label: "FPS安定性",
            drop: d,
            hints: ["画面リフレッシュレートの自動抑制", "バッテリー節約モード"],
          }),
        0 === a.length &&
          a.push({
            label: "総合",
            drop: r,
            hints: ["ネットワーク状況の変化", "診断中の他アプリ干渉"],
          }),
        _showScoreDropAlert(r, a, o.totalScore, e));
    }
  } catch (e) {}
}
function _showScoreDropAlert(e, t, n, o) {
  const i = document.getElementById("score-drop-alert");
  i && i.remove();
  const a = t[0],
    r = a.hints.map((e) => `<li>${e}</li>`).join(""),
    s = t
      .slice(1)
      .map(
        (e) =>
          `<span style="background:#2a2a2a;border-radius:6px;padding:2px 8px;font-size:0.75rem;color:#ff9500;">⚠ ${e.label} -${e.drop}pt</span>`,
      )
      .join(" "),
    d = document.createElement("div");
  ((d.id = "score-drop-alert"),
    (d.style.cssText =
      "\n        position:fixed;bottom:80px;left:50%;transform:translateX(-50%);\n        width:calc(100% - 32px);max-width:420px;\n        background:#1a1a1a;border:1px solid rgba(255,107,107,0.5);\n        border-radius:20px;padding:18px 20px;\n        box-shadow:0 8px 40px rgba(255,59,48,0.2);\n        z-index:99999;opacity:0;transition:opacity 0.35s;\n        font-family:inherit;\n    "),
    (d.innerHTML = `\n        <div style="display:flex;align-items:flex-start;gap:12px;">\n            <div style="font-size:1.6rem;flex-shrink:0;">⚠️</div>\n            <div style="flex:1;min-width:0;">\n                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">\n                    <span style="font-size:0.95rem;font-weight:800;color:#ff6b6b;">スコアが急落しています</span>\n                    <button onclick="document.getElementById('score-drop-alert').remove()"\n                        style="background:none;border:none;color:#555;font-size:1.1rem;cursor:pointer;padding:0;line-height:1;">✕</button>\n                </div>\n                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">\n                    <span style="font-size:0.82rem;color:#888;">${n}pt</span>\n                    <span style="font-size:0.78rem;color:#555;">→</span>\n                    <span style="font-size:0.95rem;font-weight:900;color:#ff6b6b;">${o}pt</span>\n                    <span style="font-size:0.78rem;font-weight:700;color:#ff6b6b;background:rgba(255,59,48,0.12);border-radius:6px;padding:1px 7px;">-${e}pt</span>\n                    ${s}\n                </div>\n                <div style="font-size:0.8rem;color:#aaa;margin-bottom:6px;font-weight:700;">${a.label}スコアが ${a.drop}点低下 — 主な原因候補：</div>\n                <ul style="margin:0;padding-left:16px;color:#888;font-size:0.78rem;line-height:1.8;">${r}</ul>\n            </div>\n        </div>\n    `),
    document.body.appendChild(d),
    requestAnimationFrame(() => {
      d.style.opacity = "1";
    }),
    setTimeout(() => {
      d.parentNode &&
        ((d.style.opacity = "0"),
        setTimeout(() => d.parentNode && d.remove(), 350));
    }, 12e3));
}
function saveResultToHistory(e, t, n, o, i, a, r) {
  try {
    const s = new Date(),
      d = {
        date: s.toLocaleString("ja-JP"),
        timestamp: s.getTime(),
        iso: s.toISOString(),
        name: "",
        totalScore: e,
        rank: t,
        cpu: n.cpu,
        gpu: n.gpu,
        mem: n.mem,
        fps: n.fps,
        ramGB: o,
        avgFps: i,
        lowFps: a,
        networkMbps: r ?? null,
      },
      l = JSON.parse(localStorage.getItem("diag_history") || "[]");
    l.unshift(d);
    const c = _isProUltra ? _maxHistory : _currentUser ? 5 : 3;
    (l.length > c && l.splice(c),
      localStorage.setItem("diag_history", JSON.stringify(l)),
      syncHistoryToCloud(l),
      _checkBestBadge(e, l));
  } catch (e) {}
}
function showHistoryModal() {
  _progressMission("open_history");
  const e = document.getElementById("history-modal"),
    t = document.getElementById("history-content");
  let n = [];
  try {
    n = JSON.parse(localStorage.getItem("diag_history") || "[]");
  } catch (e) {}
  const o = _isProUltra
    ? '<div style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;">👑 ProUltra特典：最大10件保存 / 固定機能解放</div>'
    : _currentUser
      ? '<div style="background:linear-gradient(135deg,#6366f1,#a78bfa);color:#fff;font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;">⭐ ログイン特典：最大5件保存 / 固定機能解放</div>'
      : '<div style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a78bfa;font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;cursor:pointer;" onclick="openLoginModal()">🔒 ログインで最大5件保存・固定機能が解放</div>';
  if (0 === n.length)
    t.innerHTML =
      o +
      '<p style="color:var(--sub-text);text-align:center;padding:20px;">まだ診断結果がありません。</p>';
  else {
    const e = [...n.filter((e) => e.pinned), ...n.filter((e) => !e.pinned)],
      i = {
        S: "#ff3b30",
        A: "#ff9500",
        B: "#34c759",
        C: "#007aff",
        D: "#8e8e93",
      },
      a = e
        .map((e, t) => {
          const o = n.indexOf(e);
          return `\n            <div data-card-index="${o}" style="background:#1a1a1a;border:1px solid ${e.pinned ? "#6366f1" : "var(--border)"};border-radius:16px;padding:18px;margin-bottom:12px;${e.pinned ? "box-shadow:0 0 12px rgba(99,102,241,0.2);" : ""}">\n                <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">\n                    <div style="width:52px;height:52px;border-radius:12px;background:#000;border:3px solid ${i[e.rank] || "#888"};display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;color:${i[e.rank] || "#888"};">${e.rank}</div>\n                    <div style="flex:1;min-width:0;">\n                        <div class="history-name-area">${e.name ? `<div style="font-weight:800;font-size:0.9rem;color:#6bb5ff;margin-bottom:2px;">📌 ${e.name}</div>` : ""}</div>\n                        ${e.pinned ? '<div style="font-size:0.72rem;color:#a78bfa;font-weight:700;margin-bottom:2px;">📍 固定中</div>' : ""}\n                        <div style="font-weight:800;font-size:1.1rem;">総合スコア ${e.totalScore}/100</div>\n                        <div style="font-size:0.85rem;color:#f59e0b;font-weight:700;margin-top:2px;">${getDeviceTitle(e.totalScore)}</div>\n                        <div style="color:var(--sub-text);font-size:0.82rem;">${e.date}</div>\n                        ${e.timestamp ? `<div style="color:var(--sub-text);font-size:0.72rem;margin-top:2px;">⏰ ${new Date(e.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>` : ""}\n                    </div>\n                </div>\n                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.82rem;">\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">CPU</div><div style="font-weight:800;">${e.cpu}pt</div></div>\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">GPU</div><div style="font-weight:800;">${e.gpu}pt</div></div>\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">RAM</div><div style="font-weight:800;">${e.ramGB}GB</div></div>\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">avgFPS</div><div style="font-weight:800;">${e.avgFps}</div></div>\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">1%LOW</div><div style="font-weight:800;">${e.lowFps}</div></div>\n                    <div style="background:#222;border-radius:8px;padding:8px;text-align:center;"><div style="color:var(--sub-text);">NET</div><div style="font-weight:800;">${null != e.networkMbps ? e.networkMbps + "M" : "--"}</div></div>\n                </div>\n                <div style="display:flex;gap:8px;margin-top:10px;">\n                    ${_currentUser ? `<button data-action="pin" data-index="${o}" style="flex:1;padding:9px;border-radius:10px;background:${e.pinned ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)"};border:1px solid rgba(99,102,241,0.4);color:#a78bfa;font-size:0.82rem;font-weight:700;cursor:pointer;">${e.pinned ? "📍 固定解除" : "📌 固定"}</button>` : ""}\n                    <button data-action="rename" data-index="${o}" style="flex:1;padding:9px;border-radius:10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);color:#6bb5ff;font-size:0.82rem;font-weight:700;cursor:pointer;">✏️ 名前をつける</button>\n                    <button data-action="delete" data-index="${o}" style="flex:1;padding:9px;border-radius:10px;background:rgba(255,59,48,0.15);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.82rem;font-weight:700;cursor:pointer;">🗑 削除</button>\n                </div>\n            </div>`;
        })
        .join("");
    let r = "";
    if (
      (n.length >= 2 &&
        (r =
          '\n            <div style="background:#1a1a1a;border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;">\n                <div style="font-size:0.85rem;font-weight:800;color:var(--sub-text);margin-bottom:10px;">📈 スコア推移</div>\n                <canvas id="score-chart" height="120" style="width:100%;"></canvas>\n            </div>'),
      (t.innerHTML = o + r + a),
      n.length >= 2)
    ) {
      const e = document.getElementById("score-chart");
      e && drawScoreChart(e, [...n].reverse());
    }
    if (_avgReportEnabled && n.length >= 2) {
      const e = n
          .slice(0, 5)
          .map((e) => e.totalScore)
          .filter((e) => null != e),
        o = Math.round(e.reduce((e, t) => e + t, 0) / e.length),
        i = Math.max(...e),
        a = Math.min(...e),
        r = e.length >= 2 ? e[0] - e[e.length - 1] : 0,
        s = r > 0 ? `▲${r}pt` : r < 0 ? `▼${Math.abs(r)}pt` : "─ 変化なし",
        d = r > 0 ? "#34c759" : r < 0 ? "#ff3b30" : "#888",
        l = document.createElement("div");
      ((l.style.cssText =
        "background:linear-gradient(135deg,#0d1a2e,#0a1020);border:1px solid #3b6ea566;border-radius:14px;padding:14px;margin-top:10px;"),
        (l.innerHTML = `\n                <div style="color:#60a5fa;font-size:0.78rem;font-weight:800;margin-bottom:10px;">📊 スコア平均レポート（直近${e.length}回）</div>\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                    <div style="background:#111;border-radius:10px;padding:10px;text-align:center;">\n                        <div style="color:#888;font-size:0.7rem;">平均スコア</div>\n                        <div style="color:#fff;font-size:1.4rem;font-weight:900;">${o}<span style="font-size:0.7rem;color:#888;">pt</span></div>\n                    </div>\n                    <div style="background:#111;border-radius:10px;padding:10px;text-align:center;">\n                        <div style="color:#888;font-size:0.7rem;">最近のトレンド</div>\n                        <div style="color:${d};font-size:1.2rem;font-weight:900;">${s}</div>\n                    </div>\n                    <div style="background:#111;border-radius:10px;padding:10px;text-align:center;">\n                        <div style="color:#888;font-size:0.7rem;">最高スコア</div>\n                        <div style="color:#f59e0b;font-size:1.2rem;font-weight:900;">${i}<span style="font-size:0.7rem;color:#888;">pt</span></div>\n                    </div>\n                    <div style="background:#111;border-radius:10px;padding:10px;text-align:center;">\n                        <div style="color:#888;font-size:0.7rem;">最低スコア</div>\n                        <div style="color:#94a3b8;font-size:1.2rem;font-weight:900;">${a}<span style="font-size:0.7rem;color:#888;">pt</span></div>\n                    </div>\n                </div>\n            `),
        t.appendChild(l));
    }
  }
  ((e.style.display = "flex"),
    (t.onclick = (e) => {
      const t = e.target.closest("button[data-action]");
      if (!t) return;
      const n = parseInt(t.dataset.index);
      ("pin" === t.dataset.action && togglePin(n),
        "rename" === t.dataset.action && renameHistory(n),
        "rename-save" === t.dataset.action && saveRename(n),
        "rename-cancel" === t.dataset.action && showHistoryModal(),
        "delete" === t.dataset.action && deleteHistory(n));
    }));
}
function togglePin(e) {
  try {
    const t = JSON.parse(localStorage.getItem("diag_history") || "[]");
    if (!t[e]) return;
    if (!t[e].pinned) {
      const e = t.filter((e) => e.pinned).length,
        n = 2 + 2 * _puPurchases.filter((e) => "pin_plus" === e).length;
      if (e >= n)
        return void _showToast(
          `📌 固定上限は${n}件です。「固定枠+2」をショップで購入すると増やせます`,
        );
    }
    ((t[e].pinned = !t[e].pinned),
      localStorage.setItem("diag_history", JSON.stringify(t)),
      showHistoryModal());
  } catch (e) {}
}
function _checkBestBadge(e, t) {
  if (!_bestBadgeEnabled) return;
  const n = t.slice(1).reduce((e, t) => Math.max(e, t.totalScore ?? 0), 0);
  e > n && setTimeout(() => _showBestBadgeEffect(e, n), 1200);
}
function _showBestBadgeEffect(e, t) {
  const n = document.getElementById("best-badge-overlay");
  n && n.remove();
  const o = document.createElement("div");
  ((o.id = "best-badge-overlay"),
    (o.style.cssText =
      "position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s;"));
  const i = t > 0 ? `+${e - t}pt 更新！` : "初回ベスト！";
  ((o.innerHTML = `\n        <div style="background:linear-gradient(135deg,#1a1000,#2a1800);border:2px solid #f59e0b;border-radius:24px;padding:32px 28px;text-align:center;max-width:300px;box-shadow:0 0 60px rgba(245,158,11,0.4);">\n            <div style="font-size:3rem;margin-bottom:8px;">🏅</div>\n            <div style="color:#ffd700;font-size:1.3rem;font-weight:900;letter-spacing:0.04em;">自己ベスト更新！</div>\n            <div style="color:#f59e0b;font-size:2.2rem;font-weight:900;margin:10px 0;">${e}<span style="font-size:1rem;">pt</span></div>\n            <div style="color:#aaa;font-size:0.82rem;margin-bottom:20px;">${i}</div>\n            <button onclick="document.getElementById('best-badge-overlay').remove()" style="padding:10px 28px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;font-weight:900;font-size:0.95rem;cursor:pointer;">やった！🎉</button>\n        </div>\n    `),
    document.body.appendChild(o),
    requestAnimationFrame(() => {
      o.style.opacity = "1";
    }));
  for (let e = 0; e < 12; e++)
    setTimeout(() => {
      const e = document.createElement("div");
      ((e.style.cssText = `position:fixed;pointer-events:none;font-size:${1 + Math.random()}rem;z-index:999999;left:${20 + 60 * Math.random()}%;top:${10 + 80 * Math.random()}%;opacity:1;transition:all 1.5s ease-out;`),
        (e.textContent = ["⭐", "✨", "🌟", "💫"][
          Math.floor(4 * Math.random())
        ]),
        document.body.appendChild(e),
        requestAnimationFrame(() => {
          ((e.style.transform = `translateY(-${40 + 60 * Math.random()}px)`),
            (e.style.opacity = "0"));
        }),
        setTimeout(() => e.remove(), 1600));
    }, 80 * e);
}
function getDeviceTitle(e) {
  return e >= 95
    ? "🏆 伝説級デバイス"
    : e >= 90
      ? "👑 最高級デバイス"
      : e >= 80
        ? "⭐ 優秀級デバイス"
        : e >= 70
          ? "💎 高性能デバイス"
          : e >= 60
            ? "🚀 良好デバイス"
            : e >= 50
              ? "🎯 標準デバイス"
              : e >= 40
                ? "⚙️ 基本デバイス"
                : e >= 30
                  ? "⚠️ 要チューン"
                  : e >= 20
                    ? "🔧 要メンテ"
                    : "⚡ 初期化推奨";
}
function drawScoreChart(e, t) {
  const n = e.offsetWidth || 300;
  ((e.width = 2 * n),
    (e.height = 240),
    (e.style.width = "100%"),
    (e.style.height = "120px"));
  const o = e.getContext("2d");
  if (!o) return;
  o.scale(2, 2);
  const i = 22,
    a = 32,
    r = n - a - 16,
    s = 120 - i - 28,
    d = t.map((e) => e.totalScore),
    l = t.map((e) => e.date.slice(5, 10)),
    c = Math.max(...d, 60),
    p = Math.max(0, Math.min(...d) - 10),
    u = d.length,
    g = (e) => a + (e / (u - 1)) * r,
    m = (e) => i + s - ((e - p) / (c - p)) * s;
  ((o.strokeStyle = "rgba(255,255,255,0.06)"),
    (o.lineWidth = 1),
    [0, 0.5, 1].forEach((e) => {
      const t = i + s * e;
      (o.beginPath(), o.moveTo(a, t), o.lineTo(a + r, t), o.stroke());
    }));
  const f = o.createLinearGradient(0, i, 0, i + s);
  (f.addColorStop(0, "rgba(0,122,255,0.35)"),
    f.addColorStop(1, "rgba(0,122,255,0)"),
    o.beginPath(),
    o.moveTo(g(0), m(d[0])),
    d.forEach((e, t) => {
      t > 0 && o.lineTo(g(t), m(e));
    }),
    o.lineTo(g(u - 1), i + s),
    o.lineTo(g(0), i + s),
    o.closePath(),
    (o.fillStyle = f),
    o.fill(),
    o.beginPath(),
    (o.strokeStyle = "#007aff"),
    (o.lineWidth = 2.5),
    (o.lineJoin = "round"),
    d.forEach((e, t) => {
      0 === t ? o.moveTo(g(t), m(e)) : o.lineTo(g(t), m(e));
    }),
    o.stroke(),
    d.forEach((e, t) => {
      (o.beginPath(),
        o.arc(g(t), m(e), 4, 0, 2 * Math.PI),
        (o.fillStyle = "#fff"),
        (o.strokeStyle = "#007aff"),
        (o.lineWidth = 2),
        o.fill(),
        o.stroke(),
        (o.fillStyle = "#fff"),
        (o.font = "bold 9px sans-serif"),
        (o.textAlign = "center"),
        o.fillText(e, g(t), m(e) - 8));
    }),
    (o.fillStyle = "rgba(255,255,255,0.4)"),
    (o.font = "8px sans-serif"),
    (o.textAlign = "center"),
    l.forEach((e, t) => o.fillText(e, g(t), 116)));
}
async function showSpeedModal() {
  ((document.getElementById("speed-modal").style.display = "flex"),
    (document.getElementById("speed-results").innerHTML = ""));
}
let _drainAbort = !1;
async function runSpeedTest() {
  const e = document.getElementById("speed-results"),
    t = document.getElementById("speed-run-btn");
  if ("1" === t.dataset.running) return void (_drainAbort = !0);
  ((_drainAbort = !1),
    (t.dataset.running = "1"),
    (t.textContent = "⏹ 中止する"),
    (t.style.background = "#dc2626"),
    (e.innerHTML = ""));
  const n = 2e3,
    o = 8e3,
    i = 131072,
    a = new Float64Array(i);
  for (let e = 0; e < i; e++) a[e] = e % 1e3;
  function r() {
    let e = 0;
    for (let t = 0; t < i; t++) {
      const n = a[t];
      e += Math.sqrt(1.001 * n) * Math.sin(n);
    }
    return (0 === e && (a[0] = 1), e);
  }
  function s(e) {
    const t = document.getElementById("drain-bar");
    t && (t.style.width = e + "%");
  }
  function d(e) {
    const t = document.getElementById("drain-phase-label");
    t && (t.textContent = e);
  }
  ((e.innerHTML =
    '\n        <div id="drain-phase-label" style="font-weight:800;font-size:0.92rem;margin-bottom:10px;color:var(--sub-text);">⚡ ウォームアップ中...</div>\n        <div style="background:#2a2a2a;border-radius:99px;height:8px;overflow:hidden;margin-bottom:16px;">\n            <div id="drain-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:99px;transition:width 0.3s linear;"></div>\n        </div>\n        <div id="drain-metrics" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px;"></div>\n    '),
    d("⚡ ウォームアップ中..."));
  let l = 0;
  const c = performance.now();
  for (; performance.now() - c < n && !_drainAbort; )
    (r(),
      l++,
      s(((performance.now() - c) / 1e4) * 100),
      await new Promise((e) => setTimeout(e, 0)));
  const p = l / 2;
  if (_drainAbort) return void _finishDrainAbort(t);
  d("🔥 持続負荷テスト中...");
  let u = 0;
  const g = [],
    m = performance.now();
  let f = m;
  for (; performance.now() - m < o && !_drainAbort; ) {
    (r(), u++);
    const e = performance.now(),
      t = e - m;
    if ((s(Math.min(100, ((n + t) / 1e4) * 100)), e - f >= 2e3)) {
      const n = u / (t / 1e3);
      (g.push(n), (f = e));
    }
    await new Promise((e) => setTimeout(e, 0));
  }
  if (_drainAbort) return void _finishDrainAbort(t);
  const b = u / 8,
    h = Math.max(0, Math.min(0.6, 1 - b / p));
  let y = null;
  if (g.length >= 2)
    for (let e = 1; e < g.length; e++)
      if (g[e] < 0.92 * g[0]) {
        y = 2 * e;
        break;
      }
  const v = navigator.hardwareConcurrency || 2,
    x = navigator.deviceMemory || 4,
    _ = navigator.userAgent,
    P = /iPhone|iPad/.test(_),
    S = /Android/.test(_),
    w = /CrOS/.test(_),
    k = P || S;
  let I;
  if (w) I = "chromebook";
  else if (P) I = "ios";
  else if (S) I = x >= 6 || v >= 8 ? "android_hi" : "android_lo";
  else {
    I = !!navigator.getBattery ? "laptop" : "desktop_pc";
  }
  let C;
  ((C =
    w || k
      ? p >= 180
        ? 5
        : p >= 110
          ? 4
          : p >= 55
            ? 3
            : p >= 25
              ? 2
              : 1
      : p >= 140
        ? 5
        : p >= 80
          ? 4
          : p >= 40
            ? 3
            : p >= 18
              ? 2
              : 1),
    w && x <= 4 && C > 1 && (C -= 1));
  const E =
      {
        chromebook: { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14 },
        ios: { 1: 10, 2: 13, 3: 16, 4: 20, 5: 24 },
        android_hi: { 1: 8, 2: 10, 3: 13, 4: 16, 5: 19 },
        android_lo: { 1: 5, 2: 7, 3: 9, 4: 11, 5: 13 },
        laptop: { 1: 4, 2: 6, 3: 8, 4: 11, 5: 14 },
        desktop_pc: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }[I][C] *
      (1 - 0.3 * h),
    A = E * (P ? 0.6 : w ? 0.5 : 0.45),
    B = "desktop_pc" === I;
  (s(100), d("✅ 解析完了"));
  const T = w || k;
  let D;
  if (g.length >= 2) {
    const e = [p, ...g],
      t = e.reduce((e, t) => e + t, 0) / e.length,
      n = e.reduce((e, n) => e + (n - t) ** 2, 0) / e.length,
      o = Math.sqrt(n) / (t || 1);
    D = Math.round(Math.max(0, Math.min(100, 100 * (1 - o / 0.3))));
  } else D = Math.round(100 * (1 - h));
  const U = D,
    M = D >= 85 ? "var(--st-ok)" : D >= 60 ? "var(--st-warn)" : "var(--st-bad)",
    L = D >= 85 ? "安定" : D >= 60 ? "やや不安定" : "不安定",
    z = Math.floor(E),
    G = Math.round(60 * (E - z)),
    N = Math.floor(A),
    F = Math.round(60 * (A - N)),
    R = (e, t) => (e > 0 ? `約 ${e}時間${t > 0 ? t + "分" : ""}` : `約 ${t}分`),
    $ = E >= 12 ? "var(--st-ok)" : E >= 6 ? "var(--st-warn)" : "var(--st-bad)";
  (!(function (e) {
    const t = document.getElementById("drain-metrics");
    t && (t.innerHTML = e);
  })(""),
    (e.querySelector("#drain-phase-label").style.color = "var(--text)"));
  const O = document.createElement("div");
  ((O.innerHTML = `\n        <div style="background:#1a1a1a;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:10px;">\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">デバイス種別</span>\n                <span style="font-weight:800;font-size:0.9rem;">${{ chromebook: "Chromebook", ios: "iPhone / iPad", android_hi: "Android（ハイ）", android_lo: "Android（ロー）", laptop: "ノートPC", desktop_pc: "デスクトップPC" }[I]}</span>\n            </div>\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">性能クラス</span>\n                <span style="font-weight:800;font-size:0.95rem;">${["", "エントリー", "ミドルロー", "ミドル", "ハイ", "フラッグシップ"][C]} <span style="color:var(--sub-text);font-weight:500;font-size:0.8rem;">(Tier ${C}/5)</span></span>\n            </div>\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">パフォーマンス安定率</span>\n                <span style="font-weight:800;color:${M};font-size:0.95rem;">${U}% <span style="font-size:0.78rem;opacity:0.8;">${L}</span></span>\n            </div>\n            ${T ? "" : null !== y ? `\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">スロットリング開始</span>\n                <span style="font-weight:800;font-size:0.95rem;color:var(--st-warn);">${y}秒後〜</span>\n            </div>` : '\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">スロットリング</span>\n                <span style="font-weight:800;font-size:0.95rem;color:var(--st-ok);">検出なし</span>\n            </div>'}\n            ${B ? '\n            <div style="padding:13px 18px;display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">推定バッテリー持ち</span>\n                <span style="font-weight:700;color:var(--sub-text);font-size:0.9rem;">非搭載</span>\n            </div>' : `\n            <div style="padding:13px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">推定バッテリー持ち<br><span style="font-size:0.78rem;">（通常使用時）</span></span>\n                <span style="font-weight:900;color:${$};font-size:1.1rem;">${R(z, G)}</span>\n            </div>\n            <div style="padding:13px 18px;display:flex;justify-content:space-between;align-items:center;">\n                <span style="font-size:0.88rem;color:var(--sub-text);">推定バッテリー持ち<br><span style="font-size:0.78rem;">（ゲーム・動画負荷時）</span></span>\n                <span style="font-weight:800;color:var(--st-warn);font-size:0.98rem;">${R(N, F)}</span>\n            </div>`}\n        </div>\n        <p style="font-size:0.78rem;color:var(--sub-text);text-align:center;margin:4px 0 0;">※デバイス種別・サーマル特性・統計データから算出した推定値です</p>\n    `),
    e.appendChild(O),
    (t.dataset.running = "0"),
    (t.textContent = "🔋 再テスト"),
    (t.style.background = "#7c3aed"));
}
function _finishDrainAbort(e) {
  ((e.dataset.running = "0"),
    (e.textContent = "🔋 再テスト"),
    (e.style.background = "#7c3aed"));
}
function retryDiagnostic() {
  (_progressMission("retry"),
    window.scrollTo({ top: 0, behavior: "instant" }),
    (document.documentElement.scrollTop = 0),
    (document.body.scrollTop = 0),
    setTimeout(() => {
      (window.scrollTo({ top: 0, behavior: "instant" }),
        (document.documentElement.scrollTop = 0),
        (document.body.scrollTop = 0));
    }, 50));
  const startFn = () => {
    const e = _getLang();
    ((document.getElementById("rank-letter").textContent = "?"),
      (document.getElementById("rank-letter").className = "rank-D"),
      (document.getElementById("status-title").textContent = e.statusTitle),
      (document.getElementById("eval-msg").textContent = e.evalMsg),
      (document.getElementById("b-fps-avg").textContent = "-- FPS"),
      (document.getElementById("b-fps-low").textContent = "-- FPS"),
      (document.getElementById("ai-btn").style.display = "none"),
      (document.getElementById("save-btn").style.display = "none"),
      (document.getElementById("share-hint").style.display = "none"),
      (document.getElementById("history-btn").style.display = "none"),
      (document.getElementById("speed-btn").style.display = "none"),
      (document.getElementById("ranking-btn").style.display = "none"),
      (document.getElementById("retry-btn").style.display = "none"));
    const t = document.getElementById("time-remaining");
    t && (t.textContent = "");
    for (let e = 1; e <= 34; e++) {
      const t = document.getElementById("v-" + e),
        n = document.getElementById("row-" + e);
      (t && (t.textContent = "--"),
        n && ((n.className = "spec-row"), (n.style.display = "")));
    }
    ((scores.cpu = 0),
      (scores.gpu = 0),
      (scores.mem = 0),
      (scores.fps = 0),
      Object.keys(diag).forEach((e) => delete diag[e]),
      (capturedDataUrl = null));
    const n = document.getElementById("usage-score-section");
    (_benchmarkRunning = false);
    (n && (n.style.display = "none"), runBenchmark());
  };
  if (_isProUltraPlus()) {
    openDiagModeSelector((mode) => { _diagMode = mode; startFn(); });
  } else {
    _diagMode = "normal";
    startFn();
  }
}
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCjf0ASjsOctpSoNbBy9517Gb1cokT4jdg",
  authDomain: "prp-ultra.firebaseapp.com",
  projectId: "prp-ultra",
  storageBucket: "prp-ultra.firebasestorage.app",
  messagingSenderId: "892784070484",
  appId: "1:892784070484:web:a3aa47aaece7df862a02c1",
  measurementId: "G-X38W2QE5V4",
};
let _fbApp = null,
  _fbAuth = null,
  _fbDb = null,
  _currentUser = null,
  _isProUltra = !1;
const PU_SKINS = [
    {
      id: "default",
      label: "デフォルト",
      emoji: "⬛",
      preview: "linear-gradient(135deg,#121212,#282828)",
      free: !0,
    },
    {
      id: "gold",
      label: "ゴールド",
      emoji: "🥇",
      preview: "linear-gradient(135deg,#f59e0b,#f97316,#fbbf24)",
      free: !0,
    },
    {
      id: "aurora",
      label: "オーロラ",
      emoji: "🌈",
      preview: "linear-gradient(135deg,#7c3aed,#db2777,#0ea5e9)",
      free: !0,
    },
    {
      id: "diamond",
      label: "ダイヤ",
      emoji: "💎",
      preview: "linear-gradient(135deg,#0ea5e9,#67e8f9,#a5f3fc)",
      free: !0,
    },
    {
      id: "celebration",
      label: "記念",
      emoji: "🎂",
      preview: "linear-gradient(135deg,#ff6eb4,#ffd700,#ff6eb4)",
      free: !0,
      anniv: !0,
    },
    {
      id: "neon",
      label: "ネオン",
      emoji: "🌈",
      preview: "linear-gradient(135deg,#00ff88,#00ccff,#ff00cc)",
      free: !1,
    },
    {
      id: "sakura",
      label: "サクラ",
      emoji: "🌸",
      preview: "linear-gradient(135deg,#ff9bc1,#ffb7d5,#ffe4ef)",
      free: !1,
    },
    {
      id: "midnight",
      label: "ミッドナイト",
      emoji: "🌙",
      preview: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      free: !1,
    },
    {
      id: "legend",
      label: "伝説",
      emoji: "👑",
      preview: "linear-gradient(135deg,#ffd700,#ff6b6b,#c77dff,#00d4ff)",
      free: !1,
      hidden: !0,
    },
    {
      id: "fire",
      label: "ファイア",
      emoji: "🔥",
      preview: "linear-gradient(135deg,#ff4500,#ff8c00)",
      free: !1,
      gacha: !0,
    },
    {
      id: "ocean",
      label: "オーシャン",
      emoji: "🌊",
      preview: "linear-gradient(135deg,#006994,#00bcd4)",
      free: !1,
      gacha: !0,
    },
    {
      id: "forest",
      label: "フォレスト",
      emoji: "🌿",
      preview: "linear-gradient(135deg,#15803d,#22c55e)",
      free: !1,
      gacha: !0,
    },
    {
      id: "lava",
      label: "ラヴァ",
      emoji: "🌋",
      preview: "linear-gradient(135deg,#b91c1c,#ef4444)",
      free: !1,
      gacha: !0,
    },
    {
      id: "ice",
      label: "アイス",
      emoji: "🧊",
      preview: "linear-gradient(135deg,#0284c7,#bae6fd)",
      free: !1,
      gacha: !0,
    },
    {
      id: "sunset",
      label: "サンセット",
      emoji: "🌅",
      preview: "linear-gradient(135deg,#ea580c,#fbbf24)",
      free: !1,
      gacha: !0,
    },
    {
      id: "cyber",
      label: "サイバー",
      emoji: "💻",
      preview: "linear-gradient(135deg,#00b300,#00ff41)",
      free: !1,
      gacha: !0,
    },
    {
      id: "galaxy",
      label: "ギャラクシー",
      emoji: "🌌",
      preview: "linear-gradient(135deg,#4f46e5,#818cf8)",
      free: !1,
      gacha: !0,
    },
    {
      id: "cherry",
      label: "チェリー",
      emoji: "🍒",
      preview: "linear-gradient(135deg,#be123c,#e11d48)",
      free: !1,
      gacha: !0,
    },
    {
      id: "sand",
      label: "サンド",
      emoji: "🏜️",
      preview: "linear-gradient(135deg,#92400e,#d4a96a)",
      free: !1,
      gacha: !0,
    },
    {
      id: "void",
      label: "ヴォイド",
      emoji: "🕳️",
      preview: "linear-gradient(135deg,#6b21a8,#9333ea)",
      free: !1,
      gacha: !0,
    },
    {
      id: "rose",
      label: "ローズ",
      emoji: "🌹",
      preview: "linear-gradient(135deg,#e11d48,#fb7185)",
      free: !1,
      gacha: !0,
    },
    {
      id: "teal",
      label: "ティール",
      emoji: "🫧",
      preview: "linear-gradient(135deg,#0f766e,#14b8a6)",
      free: !1,
      gacha: !0,
    },
    {
      id: "amber",
      label: "アンバー",
      emoji: "🟡",
      preview: "linear-gradient(135deg,#d97706,#fbbf24)",
      free: !1,
      gacha: !0,
    },
    {
      id: "retro",
      label: "レトロ",
      emoji: "🕹️",
      preview: "linear-gradient(135deg,#65a30d,#a3e635)",
      free: !1,
      gacha: !0,
    },
    {
      id: "toxic",
      label: "トキシック",
      emoji: "☣️",
      preview: "linear-gradient(135deg,#4d7c0f,#bef264)",
      free: !1,
      gacha: !0,
    },
    {
      id: "silver",
      label: "シルバー",
      emoji: "🪙",
      preview: "linear-gradient(135deg,#475569,#94a3b8)",
      free: !1,
      gacha: !0,
    },
    {
      id: "horizon",
      label: "ホライゾン",
      emoji: "🌄",
      preview: "linear-gradient(135deg,#ea580c,#fde68a)",
      free: !1,
      gacha: !0,
    },
    {
      id: "storm",
      label: "ストーム",
      emoji: "⛈️",
      preview: "linear-gradient(135deg,#334155,#64748b)",
      free: !1,
      gacha: !0,
    },
    {
      id: "candy",
      label: "キャンディ",
      emoji: "🍭",
      preview: "linear-gradient(135deg,#db2777,#fbcfe8)",
      free: !1,
      gacha: !0,
    },
    {
      id: "phantom",
      label: "ファントム",
      emoji: "👻",
      preview: "linear-gradient(135deg,#7c3aed,#a78bfa)",
      free: !1,
      gacha: !0,
    },
    {
      id: "sakura2",
      label: "サクラ夜",
      emoji: "🌸",
      preview: "linear-gradient(135deg,#831843,#db2777)",
      free: !1,
      gacha: !0,
    },
    {
      id: "copper",
      label: "カッパー",
      emoji: "🟤",
      preview: "linear-gradient(135deg,#92400e,#c2410c)",
      free: !1,
      gacha: !0,
    },
    {
      id: "arctic",
      label: "アークティック",
      emoji: "🧊",
      preview: "linear-gradient(135deg,#e0f2fe,#7dd3fc)",
      free: !1,
      gacha: !0,
    },
    {
      id: "magma",
      label: "マグマ",
      emoji: "🌋",
      preview: "linear-gradient(135deg,#7f1d1d,#dc2626)",
      free: !1,
      gacha: !0,
    },
    {
      id: "aurora2",
      label: "オーロラ夜",
      emoji: "🌌",
      preview: "linear-gradient(135deg,#064e3b,#6ee7b7)",
      free: !1,
      gacha: !0,
    },
    {
      id: "dusk",
      label: "ダスク",
      emoji: "🌆",
      preview: "linear-gradient(135deg,#7c2d12,#c2410c)",
      free: !1,
      gacha: !0,
    },
    {
      id: "mint",
      label: "ミント",
      emoji: "🫐",
      preview: "linear-gradient(135deg,#065f46,#34d399)",
      free: !1,
      gacha: !0,
    },
    {
      id: "coral",
      label: "コーラル",
      emoji: "🪸",
      preview: "linear-gradient(135deg,#be185d,#fb7185)",
      free: !1,
      gacha: !0,
    },
    {
      id: "obsidian",
      label: "オブシディアン",
      emoji: "🖤",
      preview: "linear-gradient(135deg,#1c1917,#44403c)",
      free: !1,
      gacha: !0,
    },
    {
      id: "peach",
      label: "ピーチ",
      emoji: "🍑",
      preview: "linear-gradient(135deg,#ea580c,#fca5a5)",
      free: !1,
      gacha: !0,
    },
    {
      id: "cobalt",
      label: "コバルト",
      emoji: "🔷",
      preview: "linear-gradient(135deg,#1e3a5f,#3b82f6)",
      free: !1,
      gacha: !0,
    },
    {
      id: "lime",
      label: "ライム",
      emoji: "🍋",
      preview: "linear-gradient(135deg,#365314,#84cc16)",
      free: !1,
      gacha: !0,
    },
    {
      id: "wine",
      label: "ワイン",
      emoji: "🍷",
      preview: "linear-gradient(135deg,#4c0519,#9f1239)",
      free: !1,
      gacha: !0,
    },
    {
      id: "slate",
      label: "スレート",
      emoji: "🪨",
      preview: "linear-gradient(135deg,#1e293b,#475569)",
      free: !1,
      gacha: !0,
    },
    {
      id: "blaze",
      label: "ブレイズ",
      emoji: "🔥",
      preview: "linear-gradient(135deg,#78350f,#f97316)",
      free: !1,
      gacha: !0,
    },
    {
      id: "seafoam",
      label: "シーフォーム",
      emoji: "🌊",
      preview: "linear-gradient(135deg,#134e4a,#2dd4bf)",
      free: !1,
      gacha: !0,
    },
    {
      id: "lilac",
      label: "ライラック",
      emoji: "💜",
      preview: "linear-gradient(135deg,#3b0764,#a855f7)",
      free: !1,
      gacha: !0,
    },
    {
      id: "crimson",
      label: "クリムゾン",
      emoji: "❤️",
      preview: "linear-gradient(135deg,#450a0a,#ef4444)",
      free: !1,
      gacha: !0,
    },
    {
      id: "nori",
      label: "海苔",
      emoji: "🟢",
      preview: "linear-gradient(135deg,#052e16,#16a34a)",
      free: !1,
      gacha: !0,
    },
    {
      id: "cosmos",
      label: "コスモス",
      emoji: "🌌",
      preview: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      free: !1,
      anniv4m: !0,
    },
    {
      id: "grant_velvet",
      label: "ベルベット",
      emoji: "🟣",
      preview: "linear-gradient(135deg,#2e1065,#7e22ce)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_glacier",
      label: "グレイシャー",
      emoji: "🏔️",
      preview: "linear-gradient(135deg,#082f49,#7dd3fc)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_ember",
      label: "エンバー",
      emoji: "🪵",
      preview: "linear-gradient(135deg,#451a03,#f97316)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_orchid",
      label: "オーキッド",
      emoji: "🪷",
      preview: "linear-gradient(135deg,#500724,#f0abfc)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_jade",
      label: "ジェイド",
      emoji: "🟩",
      preview: "linear-gradient(135deg,#022c22,#34d399)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_cosmos",
      label: "コスモス",
      emoji: "🌠",
      preview: "linear-gradient(135deg,#1e1b4b,#c4b5fd)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_honey",
      label: "ハニー",
      emoji: "🍯",
      preview: "linear-gradient(135deg,#78350f,#fcd34d)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_steel",
      label: "スティール",
      emoji: "⚙️",
      preview: "linear-gradient(135deg,#1e293b,#94a3b8)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_bloom",
      label: "ブルーム",
      emoji: "🌺",
      preview: "linear-gradient(135deg,#831843,#fb7185)",
      free: !1,
      grantOnly: !0,
    },
    {
      id: "grant_nova",
      label: "ノヴァ",
      emoji: "✨",
      preview: "linear-gradient(135deg,#312e81,#fbbf24)",
      free: !1,
      grantOnly: !0,
    },
  ],
  PU_SKIN_KEY = "pu_skin_v1";
function loadPuSkin() {
  if (!_isProUltra) return;
  applyPuSkin(localStorage.getItem(PU_SKIN_KEY) || "default", !1);
}
function applyPuSkin(e, t) {
  (void 0 === t && (t = !0),
    t && _isProUltra && _progressMission("skin_change"));
  const n = document.body,
    o = "celebration" === e,
    isAnniv4mSkin = PU_SKINS.find((s) => s.id === e)?.anniv4m;
  if (_isProUltra || o || (isAnniv4mSkin && _isAnniv4mPeriod()))
    if (!o || _isAnnivPeriod()) {
      if (isAnniv4mSkin && !_isAnniv4mPeriod()) return;
      if (!o && !isAnniv4mSkin) {
        const t = PU_SKINS.find((t) => t.id === e);
        if (t && t.hidden && !_legendSkinUnlocked) return void openPuShop();
        if (t && t.gacha && _gachaUnlockedSkins().includes(e));
        else if (t && t.grantOnly && _gachaUnlockedSkins().includes(e));
        else {
          if (t && t.grantOnly && !_gachaUnlockedSkins().includes(e))
            return void openPuShop();
          if (t && t.mission && _puPurchases.includes(e));
          else {
            if (t && t.mission && !_puPurchases.includes(e))
              return void openPuShop();
            if (
              !(
                !t ||
                t.free ||
                t.hidden ||
                t.gacha ||
                t.mission ||
                _puPurchases.includes("skin_" + e)
              )
            )
              return void openPuShop();
            if (
              t &&
              !t.free &&
              !t.hidden &&
              t.gacha &&
              !_gachaUnlockedSkins().includes(e)
            )
              return void openGachaModal();
          }
        }
      }
      (e && "default" !== e
        ? n.setAttribute("data-pu-skin", e)
        : n.removeAttribute("data-pu-skin"),
        t && localStorage.setItem(PU_SKIN_KEY, e),
        _renderPuSkinUI());
    } else n.removeAttribute("data-pu-skin");
  else n.removeAttribute("data-pu-skin");
}
function _gachaUnlockedSkins() {
  try {
    return JSON.parse(localStorage.getItem("pu_gacha_skins_v1") || "[]");
  } catch (e) {
    return [];
  }
}
function _renderPuSkinUI() {
  const e = document.getElementById("pu-skin-selector");
  if (!e) return;
  const t = localStorage.getItem(PU_SKIN_KEY) || "default",
    n = _gachaUnlockedSkins(),
    o = MISSION_SKINS.filter(
      (e) =>
        !_puPurchases.includes(e.id) && !PU_SKINS.find((t) => t.id === e.id),
    ).map((e) => ({
      ...e,
      free: !1,
      gacha: !1,
      mission: !0,
      missionLocked: !0,
    })),
    i = [...PU_SKINS, ...o];
  e.innerHTML = i
    .filter(function (e) {
      return (
        !(e.hidden && !_legendSkinUnlocked) &&
        !(e.anniv && !_isAnnivPeriod()) &&
        !(e.anniv4m && !_isAnniv4mPeriod()) &&
        !(e.grantOnly && !n.includes(e.id))
      );
    })
    .map(function (e) {
      const o =
          e.free ||
          e.anniv ||
          e.anniv4m ||
          (e.hidden && _legendSkinUnlocked) ||
          _puPurchases.includes("skin_" + e.id) ||
          _puPurchases.includes(e.id) ||
          n.includes(e.id),
        i = o
          ? "applyPuSkin('" + e.id + "')"
          : e.missionLocked
            ? "openPuShop()"
            : e.gacha
              ? "openGachaModal()"
              : "openPuShop()",
        a = e.anniv
          ? '<div style="position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:0.48rem;background:rgba(255,110,180,0.9);color:#fff;border-radius:4px;padding:1px 4px;font-weight:800;line-height:1.4;white-space:nowrap;">期間限定</div>'
          : e.anniv4m
          ? '<div style="position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:0.48rem;background:rgba(99,102,241,0.9);color:#fff;border-radius:4px;padding:1px 4px;font-weight:800;line-height:1.4;white-space:nowrap;">4ヶ月記念</div>'
          : "",
        r =
          e.gacha && !o
            ? '<div style="position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:0.48rem;background:rgba(99,102,241,0.85);color:#fff;border-radius:4px;padding:1px 4px;font-weight:800;line-height:1.4;white-space:nowrap;">ガチャ</div>'
            : "",
        s =
          e.mission && !e.missionLocked
            ? '<div style="position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:0.48rem;background:rgba(124,58,237,0.9);color:#fff;border-radius:4px;padding:1px 4px;font-weight:800;line-height:1.4;white-space:nowrap;">ミッション</div>'
            : "",
        d = e.missionLocked
          ? '<div style="position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:0.48rem;background:rgba(60,60,60,0.95);color:#aaa;border-radius:4px;padding:1px 4px;font-weight:800;line-height:1.4;white-space:nowrap;">ミッション</div>'
          : "",
        l = e.missionLocked ? "🔒" : e.emoji,
        c = e.missionLocked ? "???" : e.label,
        p = e.missionLocked
          ? "background:#2a2a2a;"
          : "background:" + e.preview + ";";
      return (
        '<div class="pu-skin-card ' +
        (e.id === t ? "active" : "") +
        '" onclick="' +
        i +
        '" style="position:relative;opacity:' +
        (o ? "1" : "0.45") +
        ';"><div class="pu-skin-preview" style="' +
        p +
        '"></div><div class="pu-skin-name">' +
        l +
        " " +
        c +
        "</div>" +
        (e.id === t
          ? '<div style="position:absolute;top:3px;right:5px;color:#f59e0b;font-size:0.7rem;font-weight:900;">✓</div>'
          : "") +
        a +
        r +
        s +
        d +
        (o || e.gacha || e.missionLocked
          ? ""
          : '<div style="position:absolute;top:3px;left:5px;font-size:0.6rem;">🔒</div>') +
        "</div>"
      );
    })
    .join("");
  const a = document.getElementById("gacha-btn-wrap");
  if (a) {
    const hasTickets = _ticketCount?.() > 0;
    if ((_isAnnivGachaFreeEnabled && _isAnnivGachaFreeEnabled()) || hasTickets) {
      const e = !!_gachaUsedToday && _gachaUsedToday(),
        t = _gachaUnlockedSkins ? _gachaUnlockedSkins() : [],
        n = _gachaSkinPool ? _gachaSkinPool() : [],
        o = _currentUser && "stu2105707@fuku-c.ed.jp" === _currentUser.email,
        i = _gachaCompletionBadges().length,
        r = GACHA_BADGES.filter((e) => !e.isDefault && !e.grantOnly).length,
        s = !o && (_badgeGachaTodayCount?.() || 0) >= BADGE_GACHA_MAX;
      
      const isAnniv = _isAnnivGachaFreeEnabled && _isAnnivGachaFreeEnabled();
      const skinBtnColor = (e && !hasTickets) ? "#2a2a2a" : "linear-gradient(135deg,#ff6eb4,#ffd700)";
      const skinBtnText = (e && !hasTickets) ? "#666" : "#fff";
      const badgeBtnColor = (s && !hasTickets) ? "#2a2a2a" : "linear-gradient(135deg,#6366f1,#c084fc)";
      const badgeBtnText = (s && !hasTickets) ? "#666" : "#fff";

      a.innerHTML =
        '<div style="display:flex;gap:8px;"><button onclick="openSkinGachaModal()" style="flex:1;padding:11px 6px;border-radius:14px;background:' +
        skinBtnColor +
        ";border:none;color:" +
        skinBtnText +
        ';font-size:0.8rem;font-weight:900;cursor:pointer;line-height:1.5;">🎨 スキンガチャ<br><span style="font-size:0.68rem;font-weight:400;opacity:0.85;">' +
        t.length +
        "/" +
        n.length +
        '種</span></button><button onclick="openBadgeGachaModal()" style="flex:1;padding:11px 6px;border-radius:14px;background:' +
        badgeBtnColor +
        ";border:none;color:" +
        badgeBtnText +
        ';font-size:0.8rem;font-weight:900;cursor:pointer;line-height:1.5;">🏷️ バッジガチャ<br><span style="font-size:0.68rem;font-weight:400;opacity:0.85;">' +
        i +
        "/" +
        r +
        "種</span></button></div>";
    } else a.innerHTML = "";
  }
}
const GACHA_BADGES = [
    {
      id: "gbadge_default",
      label: "🚀 ロケット",
      emoji: "🚀",
      rarity: "default",
      color: "#6366f1",
      glow: "#6366f188",
      isDefault: !0,
    },
    {
      id: "gbadge_crown",
      label: "👑 王冠",
      emoji: "👑",
      rarity: "legendary",
      color: "#ffd700",
      glow: "#ffd70088",
    },
    {
      id: "gbadge_verify",
      label: "✅ 認証",
      emoji: "✅",
      rarity: "rare",
      color: "#34c759",
      glow: "#34c75966",
    },
    {
      id: "gbadge_fire",
      label: "🔥 炎",
      emoji: "🔥",
      rarity: "rare",
      color: "#ff4500",
      glow: "#ff450066",
    },
    {
      id: "gbadge_crystal",
      label: "💠 クリスタル",
      emoji: "💠",
      rarity: "epic",
      color: "#00d4ff",
      glow: "#00d4ff66",
    },
    {
      id: "gbadge_rainbow",
      label: "🌈 レインボー",
      emoji: "🌈",
      rarity: "legendary",
      color: "#c084fc",
      glow: "#c084fc88",
    },
    {
      id: "gbadge_star",
      label: "⭐ スター",
      emoji: "⭐",
      rarity: "epic",
      color: "#fbbf24",
      glow: "#fbbf2488",
    },
    {
      id: "gbadge_diamond",
      label: "💎 ダイヤ",
      emoji: "💎",
      rarity: "epic",
      color: "#67e8f9",
      glow: "#67e8f966",
    },
    {
      id: "gbadge_ghost",
      label: "👻 ゴースト",
      emoji: "👻",
      rarity: "rare",
      color: "#a78bfa",
      glow: "#a78bfa66",
    },
    {
      id: "gbadge_bolt",
      label: "⚡ ボルト",
      emoji: "⚡",
      rarity: "epic",
      color: "#facc15",
      glow: "#facc1588",
    },
    {
      id: "gbadge_moon",
      label: "🌙 ムーン",
      emoji: "🌙",
      rarity: "legendary",
      color: "#c7d2fe",
      glow: "#c7d2fe66",
    },
    {
      id: "gbadge_grant_phoenix",
      label: "🔥 フェニックス",
      emoji: "🔥",
      rarity: "legendary",
      color: "#fb923c",
      glow: "#fb923c88",
      grantOnly: !0,
    },
    {
      id: "gbadge_grant_owl",
      label: "🦉 アウル",
      emoji: "🦉",
      rarity: "epic",
      color: "#a3e635",
      glow: "#a3e63588",
      grantOnly: !0,
    },
    // ---------- 4ヶ月記念イベントバッジ ----------
    {
      id: "anniv4m_badge_4m",
      label: "🎊 4ヶ月記念",
      emoji: "🎊",
      rarity: "epic",
      color: "#38bdf8",
      glow: "#38bdf888",
      grantOnly: !0,
    },
    {
      id: "anniv4m_badge_stamp3",
      label: "🎫 参加者",
      emoji: "🎫",
      rarity: "rare",
      color: "#a78bfa",
      glow: "#a78bfa66",
      grantOnly: !0,
    },
    {
      id: "anniv4m_badge_kankin",
      label: "👑 皆勤賞",
      emoji: "👑",
      rarity: "legendary",
      color: "#ffd700",
      glow: "#ffd70088",
      grantOnly: !0,
    },
    {
      id: "anniv4m_badge_week1",
      label: "🌅 早起き診断士",
      emoji: "🌅",
      rarity: "rare",
      color: "#fb923c",
      glow: "#fb923c66",
      grantOnly: !0,
    },
    {
      id: "anniv4m_badge_week2",
      label: "🔥 フルロード診断士",
      emoji: "🔥",
      rarity: "rare",
      color: "#ef4444",
      glow: "#ef444466",
      grantOnly: !0,
    },
    {
      id: "anniv4m_badge_week3",
      label: "⚡ 充電診断士",
      emoji: "⚡",
      rarity: "rare",
      color: "#facc15",
      glow: "#facc1566",
      grantOnly: !0,
    },
  ],
  GACHA_BADGE_KEY = "pu_gacha_badges_v1";
function _gachaUnlockedBadges() {
  try {
    return JSON.parse(localStorage.getItem(GACHA_BADGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function _gachaSaveBadge(e) {
  const t = _gachaUnlockedBadges();
  t.includes(e) ||
    (t.push(e), localStorage.setItem(GACHA_BADGE_KEY, JSON.stringify(t)));
}
// ガチャ完成度表示用：ショップ購入の「王冠バッジ」もガチャの「👑 王冠(gbadge_crown)」として完成度に加算する
function _gachaCompletionBadges() {
  const unlocked = _gachaUnlockedBadges();
  if (
    _puPurchases.includes("badge_crown") &&
    !unlocked.includes("gbadge_crown")
  ) {
    return [...unlocked, "gbadge_crown"];
  }
  return unlocked;
}
const GACHA_BADGE_EQUIPPED_KEY = "pu_badge_equipped_v1";
function getEquippedBadge() {
  const e = localStorage.getItem("pu_badge_equipped_v1"),
    t = [
      "badge_gold",
      "badge_diamond",
      "badge_retro",
      "badge_star",
      "badge_crown",
    ],
    n = [
      ..._gachaUnlockedBadges(),
      ..._puPurchases.filter((e) => t.includes(e)),
    ];
  if (!e || "gbadge_default" === e || !n.includes(e))
    return _isProUltra
      ? {
          id: "gbadge_default",
          label: "🚀 ロケット",
          emoji: "🚀",
          color: "#6366f1",
          glow: "#6366f188",
          isDefault: !0,
        }
      : null;
  const o = {
    badge_gold: {
      label: "🥇 ゴールド",
      emoji: "🥇",
      color: "#f59e0b",
      glow: "#f59e0b88",
    },
    badge_diamond: {
      label: "💎 ダイヤ",
      emoji: "💎",
      color: "#67e8f9",
      glow: "#67e8f966",
    },
    badge_retro: {
      label: "👾 レトロ",
      emoji: "👾",
      color: "#a3e635",
      glow: "#a3e63566",
    },
    badge_star: {
      label: "🌟 スター",
      emoji: "🌟",
      color: "#fbbf24",
      glow: "#fbbf2488",
    },
    badge_crown: {
      label: "👑 王冠Pro",
      emoji: "👑",
      color: "#ffd700",
      glow: "#ffd70088",
    },
  };
  return o[e]
    ? { id: e, ...o[e] }
    : GACHA_BADGES.find((t) => t.id === e) || null;
}
function equipBadge(e) {
  (localStorage.setItem("pu_badge_equipped_v1", e),
    _renderHeaderBadge(),
    _showToast("バッジを装備しました！"));
}
function unequipBadge() {
  (localStorage.setItem("pu_badge_equipped_v1", "gbadge_default"),
    _renderHeaderBadge(),
    _showToast("🚀 デフォルトバッジに戻しました"));
}
function _renderHeaderBadge() {
  const e = document.getElementById("pu-equipped-badge");
  if (!e) return;
  const t = getEquippedBadge();
  t
    ? ((e.textContent = t.emoji),
      (e.style.display = "inline-flex"),
      (e.style.boxShadow = "0 0 8px " + t.glow),
      (e.title = t.label))
    : (e.style.display = "none");
}
const GACHA_KEY = "pu_gacha_skins_v1",
  GACHA_LAST_KEY = "pu_gacha_last_v1",
  GACHA_COUNT_KEY = "pu_gacha_count_v1",
  GACHA_MAX_DAILY = 3,
  GACHA_DUP_PT = 15,
  LOGIN_BONUS_X2_ID = "login_bonus_x2",
  DAILY_GRANT_PACK_ID = "daily_grant_pack",
  LOGIN_BONUS_X2_EXPIRY_KEY = "pu_login_bonus_x2_expiry",
  DAILY_GRANT_PACK_EXPIRY_KEY = "pu_daily_grant_pack_expiry",
  DAILY_GRANT_PACK_UNLOCK_BASE_KEY = "pu_daily_grant_pack_unlock_base",
  DAILY_GRANT_PACK_LAST_KEY = "pu_daily_grant_pack_last",
  DAILY_GRANT_PACK_UNLOCK_DELTA = 75,
  ONE_YEAR_MS = 31536e6;
let _loginBonusX2Expiry = null,
  _grantPackExpiry = null,
  _grantPackUnlockBase = null,
  _grantPackLastDate = null,
  _grantPackComplete = !1;
function _isLoginBonusX2Active() {
  return (
    !!_loginBonusX2Expiry &&
    new Date(_loginBonusX2Expiry).getTime() > Date.now()
  );
}
function _isDailyGrantPackActive() {
  return (
    !!_grantPackExpiry && new Date(_grantPackExpiry).getTime() > Date.now()
  );
}
function _currentBonusMultiplier() {
  let e = 1;
  return (
    _isAnnivPeriod() && (e *= 3),
    _isAnniv4mPeriod && _isAnniv4mPeriod() && (e *= 4),
    _isLoginBonusX2Active() && (e *= 2),
    _isDailyGrantPackCompleted() && (e *= 1.5),
    e
  );
}
const DAILY_GRANT_PACK_COMPLETE_KEY = "pu_daily_grant_pack_complete";
function _isDailyGrantPackCompleted() {
  return !0 === _grantPackComplete;
}
function _dailyGrantPackPool() {
  return {
    skins: PU_SKINS.filter((e) => e.grantOnly),
    badges: GACHA_BADGES.filter((e) => e.grantOnly),
    missionSkins: MISSION_SKINS,
    coinBadges: PU_SHOP_ITEMS.filter((e) => "badge" === e.type),
  };
}
function _checkDailyGrantPackComplete() {
  if (_isDailyGrantPackCompleted()) return;
  const e = _dailyGrantPackPool(),
    t = _gachaUnlockedSkins(),
    n = _gachaUnlockedBadges(),
    o = e.skins.every((e) => t.includes(e.id)),
    i = e.badges.every((e) => n.includes(e.id)),
    a = e.missionSkins.every((e) => _puPurchases.includes(e.id)),
    r = e.coinBadges.every((e) => _puPurchases.includes(e.id));
  o &&
    i &&
    a &&
    r &&
    ((_grantPackComplete = !0),
    _fbDb &&
      _currentUser &&
      _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .set({ grantPackComplete: !0 }, { merge: !0 }),
    setTimeout(() => {
      _showToast(
        "🎉 全種コンプリート！ログボ・連続ログボ・診断ボーナスが1.5倍になりました！",
      );
    }, 800));
}
function _runDailyGrantPack() {
  if (!_isDailyGrantPackActive()) return;
  const e = _gachaTodayStr();
  if (_grantPackLastDate === e) return;
  ((_grantPackLastDate = e),
    _fbDb &&
      _currentUser &&
      _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .set({ grantPackLastDate: e }, { merge: !0 }));
  const t = _dailyGrantPackPool(),
    n = [],
    o = t.missionSkins.filter((e) => !_puPurchases.includes(e.id));
  if (o.length > 0) {
    const e = o[Math.floor(Math.random() * o.length)];
    (_puPurchases.push(e.id),
      PU_SKINS.find((t) => t.id === e.id) ||
        PU_SKINS.push({
          id: e.id,
          label: e.label,
          emoji: e.emoji,
          preview: e.preview,
          free: !1,
          gacha: !1,
          mission: !0,
        }),
      n.push(`🎨 ${e.emoji} ミッションスキン「${e.label}」`));
  }
  const i = t.coinBadges.filter((e) => !_puPurchases.includes(e.id));
  if (i.length > 0) {
    const e = i[Math.floor(Math.random() * i.length)];
    (_puPurchases.push(e.id),
      _applyPuPurchase(e.id, !0),
      n.push(`🏅 ${e.name}`));
  }
  const a = t.badges.filter((e) => !_gachaUnlockedBadges().includes(e.id));
  if (a.length > 0) {
    const e = a[Math.floor(Math.random() * a.length)];
    (_gachaSaveBadge(e.id), n.push(`🏷️ ${e.label}バッジ`));
  }
  const r = t.skins.filter((e) => !_gachaUnlockedSkins().includes(e.id));
  if (r.length > 0) {
    const e = r[Math.floor(Math.random() * r.length)];
    (_gachaSaveSkin(e.id), n.push(`🎨 ${e.emoji} 限定スキン「${e.label}」`));
  }
  (_savePuPoints(),
    _checkDailyGrantPackComplete(),
    setTimeout(() => _showDailyGrantPackOverlay(n), 1e3));
}
function _showDailyGrantPackOverlay(e) {
  document.getElementById("daily-grant-overlay")?.remove();
  const t = document.createElement("div");
  ((t.id = "daily-grant-overlay"),
    (t.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;"));
  const n =
    e.length > 0
      ? `<div style="color:#aaa;font-size:0.82rem;margin-bottom:14px;">本日のランダム付与アイテムです！</div>\n           <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">\n               ${e.map((e) => `<div style="background:#1a1a1a;border:1px solid #f59e0b44;border-radius:12px;padding:12px 14px;color:#fff;font-size:0.92rem;font-weight:800;text-align:left;">${e}</div>`).join("")}\n           </div>`
      : '<div style="color:#888;font-size:0.85rem;margin-bottom:18px;">本日分はすべて入手済みです（全アイテムコンプリート済み）</div>';
  ((t.innerHTML = `<div style="background:#111;border:1px solid #f59e0b66;border-radius:24px;width:100%;max-width:380px;padding:28px 24px;text-align:center;">\n        <div style="font-size:2.2rem;margin-bottom:6px;">🎁</div>\n        <div style="color:#f59e0b;font-size:1.2rem;font-weight:900;margin-bottom:10px;">毎日スキン&amp;バッジ付与</div>\n        ${n}\n        <button onclick="document.getElementById('daily-grant-overlay').remove()" style="width:100%;padding:12px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;font-weight:900;font-size:0.95rem;cursor:pointer;">受け取る</button>\n    </div>`),
    document.body.appendChild(t));
}
function _gachaSkinPool() {
  return PU_SKINS.filter((e) => e.gacha);
}
function _gachaTodayStr() {
  return new Date()
    .toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
    .replace(/\//g, "-");
}
function _gachaTodayCount() {
  const e = _gachaTodayStr();
  try {
    const t = JSON.parse(localStorage.getItem(GACHA_COUNT_KEY) || "{}");
    return (t.date === e && t.count) || 0;
  } catch (e) {
    return 0;
  }
}
function _gachaUsedToday() {
  return (
    (!_currentUser || "stu2105707@fuku-c.ed.jp" !== _currentUser.email) &&
    _gachaTodayCount() >= GACHA_MAX_DAILY
  );
}
function _gachaMarkToday() {
  const e = _gachaTodayStr(),
    t = _gachaTodayCount() + 1;
  (localStorage.setItem(GACHA_COUNT_KEY, JSON.stringify({ date: e, count: t })),
    localStorage.setItem(GACHA_LAST_KEY, e));
}
function _gachaSaveSkin(e) {
  const t = _gachaUnlockedSkins();
  t.includes(e) ||
    (t.push(e),
    localStorage.setItem(GACHA_KEY, JSON.stringify(t)),
    _checkGachaComplete(t),
    _checkDailyGrantPackComplete());
}
const BADGE_GACHA_KEY = "pu_badge_gacha_count_v1",
  BADGE_GACHA_MAX = 2;
function _badgeGachaTodayCount() {
  try {
    const e = JSON.parse(localStorage.getItem(BADGE_GACHA_KEY) || "{}");
    return (e.date === _gachaTodayStr() && e.count) || 0;
  } catch (e) {
    return 0;
  }
}
function _badgeGachaMarkToday() {
  const e = _badgeGachaTodayCount() + 1;
  localStorage.setItem(
    BADGE_GACHA_KEY,
    JSON.stringify({ date: _gachaTodayStr(), count: e }),
  );
}
function openBadgeGachaModal() {
  if (!_isProUltra) return;
  (_progressMission("gacha"),
    document.getElementById("badge-gacha-overlay")?.remove());
  const e = GACHA_BADGES.filter((e) => !e.isDefault && !e.grantOnly),
    t = _gachaCompletionBadges(),
    n = _badgeGachaTodayCount(),
    o = _currentUser && "stu2105707@fuku-c.ed.jp" === _currentUser.email,
    i = _ticketCount(),
    a = o ? 1 / 0 : Math.max(0, BADGE_GACHA_MAX - n),
    r = o ? 1 / 0 : a + i,
    s = !o && r <= 0,
    d = (e.every((e) => t.includes(e.id)), document.createElement("div"));
  ((d.id = "badge-gacha-overlay"),
    (d.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;"),
    (d.innerHTML = `<div style="background:#111;border:1px solid #3730a3;border-radius:24px;width:100%;max-width:400px;padding:28px 24px;position:relative;max-height:90vh;overflow-y:auto;">\n        <button onclick="document.getElementById('badge-gacha-overlay').remove()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#666;font-size:1.3rem;cursor:pointer;">✕</button>\n        <div style="font-size:1.5rem;font-weight:900;color:#c084fc;margin-bottom:4px;">🏷️ バッジガチャ</div>\n        <div style="color:#888;font-size:0.8rem;margin-bottom:4px;">全${e.length}種 ／ ${o ? "∞回・無制限" : "1日2回 + ガチャ券"}</div>\n        <div style="color:#888;font-size:0.78rem;margin-bottom:16px;">所持: ${t.length}/${e.length}種　｜　今日の残り: <span style="color:${o || r > 0 ? "#22c55e" : "#ef4444"};font-weight:800;">${o ? "∞" : r}</span>回${i > 0 ? ` <span style="color:#f59e0b;font-size:0.75rem;">（内券:${i}枚）</span>` : ""}</div>\n        <div class="badge-icon-grid" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">\n            ${e
      .map((e) => {
        return `<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.04);border:1px solid ${t.includes(e.id) ? e.color + "88" : "#2a2a2a"};display:flex;align-items:center;justify-content:center;font-size:1.3rem;opacity:${t.includes(e.id) ? "1" : "0.3"};filter:${t.includes(e.id) ? "drop-shadow(0 0 6px " + e.glow + ")" : "none"};" title="${e.label} (${((n = e.rarity), "legendary" === n ? "LEGENDARY" : "epic" === n ? "EPIC" : "RARE")})">${e.emoji}</div>`;
        var n;
      })
      .join(
        "",
      )}\n        </div>\n        <div id="badge-owned-count" style="color:#666;font-size:0.75rem;text-align:center;margin-bottom:8px;">${t.length}/${e.length}種</div>\n        <div class="gacha-spin-wrap" id="badge-gacha-icon" style="font-size:2.5rem;text-align:center;margin:10px 0;">🏷️</div>\n        <div id="badge-gacha-status" style="color:#aaa;font-size:0.85rem;min-height:20px;text-align:center;"></div>\n        <div id="badge-gacha-result"></div>\n        ${s ? '<div style="color:#888;font-size:0.82rem;margin-top:12px;text-align:center;">今日の無料2回は引きました。ガチャ券を使うか、明日また来てね！🎟️</div>' : '<button onclick="_execBadgeGacha()" id="badge-gacha-btn"\n                style="margin-top:14px;width:100%;padding:14px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#c084fc);border:none;color:#fff;font-size:1rem;font-weight:900;cursor:pointer;">\n                🏷️ バッジガチャを引く\n            </button>'}\n    </div>`),
    document.body.appendChild(d));
}
function _execBadgeGacha() {
  const e = document.getElementById("badge-gacha-btn");
  e && (e.disabled = !0);
  const t = _currentUser && "stu2105707@fuku-c.ed.jp" === _currentUser.email,
    n = t ? 1 / 0 : Math.max(0, BADGE_GACHA_MAX - _badgeGachaTodayCount()),
    o = _ticketCount();
  if (!t && n <= 0 && o <= 0)
    return (
      _showToast("ガチャ券がありません。ショップで購入してください🎟️"),
      void (e && (e.disabled = !1))
    );
  const i = !t && n <= 0 && o > 0;
  i && (_useTicket(), _savePuPoints());
  const a = document.getElementById("badge-gacha-icon");
  a && (a.textContent = "🎰");
  const r = GACHA_BADGES.filter((e) => !e.isDefault && !e.grantOnly),
    s = r.map((e) =>
      "legendary" === e.rarity ? 3 : "epic" === e.rarity ? 8 : 15,
    ),
    d = s.reduce((e, t) => e + t, 0);
  let l = Math.random() * d,
    c = r[0];
  for (let e = 0; e < r.length; e++)
    if (((l -= s[e]), l <= 0)) {
      c = r[e];
      break;
    }
  // 🌙 ムーンバッジ救済措置：未入手の場合、3回連続ガチャで3回目に必ず入手できる
  const MOON_PITY_KEY = "pu_badge_moon_pity_v1";
  if (!_gachaUnlockedBadges().includes("gbadge_moon")) {
    let pity = parseInt(localStorage.getItem(MOON_PITY_KEY) || "0", 10) + 1;
    if (pity >= 3 || c.id === "gbadge_moon") {
      c = r.find((e) => e.id === "gbadge_moon") || c;
      pity = 0;
    }
    localStorage.setItem(MOON_PITY_KEY, String(pity));
  } else {
    localStorage.removeItem(MOON_PITY_KEY);
  }
  // 🎯 残り1種救済措置：ガチャ券使用時、未入手バッジが残り1種の場合、3回目で必ず確定
  const LAST_ONE_PITY_KEY = "pu_badge_lastone_pity_v1";
  const unlockedBadges = _gachaUnlockedBadges();
  const remainingBadges = r.filter((e) => !unlockedBadges.includes(e.id));
  if (i && remainingBadges.length === 1) {
    let lastOnePity = parseInt(localStorage.getItem(LAST_ONE_PITY_KEY) || "0", 10) + 1;
    if (lastOnePity >= 3 || c.id === remainingBadges[0].id) {
      c = remainingBadges[0];
      lastOnePity = 0;
    }
    localStorage.setItem(LAST_ONE_PITY_KEY, String(lastOnePity));
  } else if (remainingBadges.length !== 1) {
    localStorage.removeItem(LAST_ONE_PITY_KEY);
  }
  (i || _badgeGachaMarkToday(),
    setTimeout(() => {
      a && (a.textContent = c.emoji);
      const e = _gachaUnlockedBadges().includes(c.id);
      e || _gachaSaveBadge(c.id);
      const t = ((e) =>
          "legendary" === e ? "#ffd700" : "epic" === e ? "#c084fc" : "#34c759")(
          c.rarity,
        ),
        n = ((e) =>
          "legendary" === e
            ? "🌟 LEGENDARY"
            : "epic" === e
              ? "💫 EPIC"
              : "✨ RARE")(c.rarity),
        o = document.getElementById("badge-gacha-result"),
        i = _isProUltra && "stu2105707@fuku-c.ed.jp" === _currentUser?.email,
        r = i ? 1 / 0 : Math.max(0, BADGE_GACHA_MAX - _badgeGachaTodayCount()),
        s = _ticketCount(),
        d = i ? 1 / 0 : r + s,
        l = d > 0;
      o &&
        (o.innerHTML = `<div class="gacha-result-card" style="border:1px solid ${c.color}44;margin-top:12px;">\n            <div style="font-size:2.5rem;filter:drop-shadow(0 0 12px ${c.glow});">${c.emoji}</div>\n            <div style="color:${t};font-size:0.75rem;font-weight:900;letter-spacing:2px;margin:4px 0;">${n}</div>\n            <div style="color:#fff;font-weight:900;font-size:1.05rem;">${c.label}バッジ</div>\n            <div style="color:${e ? "#f59e0b" : "#22c55e"};font-size:0.82rem;font-weight:800;margin-top:2px;">${e ? "重複 → +15pt 補償" : "🏷️ NEW バッジゲット！"}</div>\n            ${e ? "" : `<button onclick="equipBadge('${c.id}');document.getElementById('badge-gacha-overlay').remove();" style="margin-top:12px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,${c.color},${c.glow});border:none;color:#000;font-size:0.9rem;font-weight:800;cursor:pointer;">今すぐ装備する</button>`}\n            ${l ? `<button onclick="document.getElementById('badge-gacha-result').innerHTML='';document.getElementById('badge-gacha-btn')&&(document.getElementById('badge-gacha-btn').disabled=false);_execBadgeGacha();" style="margin-top:8px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#c084fc);border:none;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;">🔄 もう一度引く（残り${d === 1 / 0 ? "∞" : d}回）</button>` : '<div style="color:#555;font-size:0.78rem;text-align:center;margin-top:8px;">今日の上限に達しました</div>'}\n            <button onclick="document.getElementById('badge-gacha-overlay').remove();" style="margin-top:8px;width:100%;padding:8px;border-radius:12px;background:#2a2a2a;border:none;color:#aaa;font-size:0.85rem;cursor:pointer;">閉じる</button>\n        </div>`);
      const p = document.querySelector("#badge-gacha-overlay .badge-icon-grid"),
        u = GACHA_BADGES.filter((e) => !e.isDefault && !e.grantOnly),
        g = _gachaUnlockedBadges();
      p &&
        (p.innerHTML = u
          .map(
            (e) =>
              `<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.04);border:1px solid ${g.includes(e.id) ? e.color + "88" : "#2a2a2a"};display:flex;align-items:center;justify-content:center;font-size:1.3rem;opacity:${g.includes(e.id) ? "1" : "0.3"};filter:${g.includes(e.id) ? "drop-shadow(0 0 6px " + e.glow + ")" : "none"};" title="${e.label}">${e.emoji}</div>`,
          )
          .join(""));
      const m = document.getElementById("badge-owned-count");
      m && (m.textContent = g.length + "/" + u.length + "種");
      const f = document.getElementById("badge-gacha-status");
      (f && (f.textContent = ""),
        e
          ? ((_puPoints += 15),
            _savePuPoints(),
            _showPointToast("+15pt（重複補償）", _puPoints))
          : (_showToast("🏷️ " + c.label + "バッジをゲット！"),
            _checkDailyGrantPackComplete()),
        _renderHeaderBadge());
    }, 700));
}
function _checkGachaComplete(e) {
  const t = _gachaSkinPool();
  if (0 === t.length) return;
  if (!t.every((t) => e.includes(t.id))) return;
  if (_puPurchases.includes("hidden_particle_diag")) return;
  ((_puPoints += 130),
    _puPurchases.push("hidden_particle_diag"),
    (_particleDiagEnabled = !0),
    _savePuPoints());
  const n = document.getElementById("particle-diag-btn");
  (n && (n.style.display = "block"),
    setTimeout(() => {
      const e = document.createElement("div");
      ((e.id = "gacha-complete-overlay"),
        (e.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:999999;display:flex;align-items:center;justify-content:center;"),
        (e.innerHTML =
          '\n            <div style="text-align:center;padding:32px;max-width:380px;">\n                <div style="font-size:3.5rem;margin-bottom:8px;">🏆</div>\n                <div style="color:#ffd700;font-size:1.5rem;font-weight:900;margin-bottom:6px;">全スキンコンプリート！</div>\n                <div style="color:#aaa;font-size:0.85rem;margin-bottom:16px;">限定スキン21種をすべて集めた！</div>\n                <div style="background:#1a1a1a;border:1px solid #ffd70055;border-radius:14px;padding:16px;margin-bottom:20px;line-height:2;">\n                    <div style="color:#ffd700;font-weight:900;font-size:1rem;margin-bottom:6px;">🎁 コンプリート報酬</div>\n                    <div style="color:#22c55e;font-size:0.95rem;font-weight:800;">🪙 +130pt ボーナス</div>\n                    <div style="color:#a78bfa;font-size:0.95rem;font-weight:800;margin-top:4px;">✨ 隠し機能「サクサク度診断」解放！</div>\n                </div>\n                <button onclick="document.getElementById(\'gacha-complete-overlay\').remove();openParticleDiag();"\n                    style="width:100%;padding:14px;border-radius:16px;background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;color:#fff;font-size:1rem;font-weight:900;cursor:pointer;margin-bottom:10px;">\n                    ✨ 今すぐサクサク度診断を試す\n                </button>\n                <button onclick="document.getElementById(\'gacha-complete-overlay\').remove();"\n                    style="width:100%;padding:10px;border-radius:14px;background:#222;border:none;color:#888;font-size:0.9rem;cursor:pointer;">\n                    あとで試す\n                </button>\n            </div>'),
        document.body.appendChild(e));
    }, 600));
}
function openParticleDiag() {
  if ((_progressMission("particle"), !_particleDiagEnabled))
    return void _showToast(
      "この機能は限定スキン全種コンプリートで解放されます",
    );
  document.getElementById("particle-diag-overlay")?.remove();
  const e = document.createElement("div");
  ((e.id = "particle-diag-overlay"),
    (e.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:999999;display:flex;align-items:center;justify-content:center;overflow:hidden;"),
    (e.innerHTML =
      '\n        <canvas id="particle-canvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;"></canvas>\n        <div id="particle-diag-content" style="position:relative;z-index:1;text-align:center;padding:32px;max-width:360px;width:100%;">\n            <button onclick="document.getElementById(\'particle-diag-overlay\').remove();_stopParticleLoop();"\n                style="position:absolute;top:-16px;right:0;background:none;border:none;color:#888;font-size:1.3rem;cursor:pointer;">✕</button>\n            <div style="font-size:2.5rem;margin-bottom:6px;">✨</div>\n            <div style="color:#a78bfa;font-size:1.3rem;font-weight:900;margin-bottom:4px;">サクサク度パーティクル診断</div>\n            <div style="color:#888;font-size:0.8rem;margin-bottom:20px;">端末のパフォーマンスを可視化します</div>\n            <div id="particle-status" style="color:#aaa;font-size:0.9rem;min-height:28px;margin-bottom:12px;">診断を開始してください</div>\n            <div id="particle-score-wrap" style="display:none;margin-bottom:18px;">\n                <div id="particle-score-num" style="font-size:3.5rem;font-weight:900;color:#a78bfa;line-height:1;"></div>\n                <div id="particle-score-label" style="color:#ccc;font-size:1rem;margin-top:4px;font-weight:700;"></div>\n                <div id="particle-score-detail" style="color:#888;font-size:0.78rem;margin-top:8px;line-height:1.7;"></div>\n            </div>\n            <button id="particle-start-btn" onclick="_startParticleDiag()"\n                style="width:100%;padding:14px;border-radius:16px;background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;color:#fff;font-size:1rem;font-weight:900;cursor:pointer;">\n                ▶ 診断スタート\n            </button>\n        </div>'),
    document.body.appendChild(e),
    _initParticleCanvas());
}
let _particleAnimId = null,
  _particleCtx = null,
  _particles = [];
function _stopParticleLoop() {
  _particleAnimId &&
    (cancelAnimationFrame(_particleAnimId), (_particleAnimId = null));
}
function _initParticleCanvas() {
  const e = document.getElementById("particle-canvas");
  if (e) {
    ((e.width = window.innerWidth),
      (e.height = window.innerHeight),
      (_particleCtx = e.getContext("2d")),
      (_particles = []));
    for (let t = 0; t < 30; t++)
      _particles.push({
        x: Math.random() * e.width,
        y: Math.random() * e.height,
        r: 3 * Math.random() + 1,
        vx: 0.5 * (Math.random() - 0.5),
        vy: 0.5 * (Math.random() - 0.5),
        alpha: 0.4 * Math.random() + 0.1,
      });
    !(function t() {
      if (document.getElementById("particle-canvas")) {
        _particleCtx.clearRect(0, 0, e.width, e.height);
        for (const t of _particles)
          ((t.x += t.vx),
            (t.y += t.vy),
            t.x < 0 && (t.x = e.width),
            t.x > e.width && (t.x = 0),
            t.y < 0 && (t.y = e.height),
            t.y > e.height && (t.y = 0),
            _particleCtx.beginPath(),
            _particleCtx.arc(t.x, t.y, t.r, 0, 2 * Math.PI),
            (_particleCtx.fillStyle = `rgba(167,139,250,${t.alpha})`),
            _particleCtx.fill());
        _particleAnimId = requestAnimationFrame(t);
      } else _particleAnimId = null;
    })();
  }
}
function _startParticleDiag() {
  const e = document.getElementById("particle-start-btn"),
    t = document.getElementById("particle-status"),
    n = document.getElementById("particle-score-wrap");
  (e && (e.disabled = !0),
    n && (n.style.display = "none"),
    t && (t.textContent = "🔍 システムを確認中..."));
  const o = performance.now();
  let i = 0;
  for (; performance.now() - o < 50; ) (i++, Math.sqrt(i));
  const a = i / 50,
    r = a > 5e3 ? 300 : a > 1e3 ? 500 : 800;
  setTimeout(() => {
    t && (t.textContent = "⚡ パフォーマンスを計測中...");
    let o = performance.now();
    const i = [],
      a = performance.now() + r;
    requestAnimationFrame(function r(s) {
      if (!document.getElementById("particle-diag-overlay")) return;
      const d = s - o;
      (d > 0 && i.push(d),
        (o = s),
        s < a ? requestAnimationFrame(r) : _finishParticleDiag(i, e, t, n));
    });
  }, 300);
}
function _finishParticleDiag(e, t, n, o) {
  if (e.length < 3)
    return (
      n &&
        (n.textContent = "計測データが不足しました。もう一度お試しください。"),
      void (t && ((t.disabled = !1), (t.textContent = "🔄 再診断")))
    );
  const i = e.reduce((e, t) => e + t, 0) / e.length,
    a = 1e3 / i,
    r = Math.sqrt(
      e.map((e) => (e - i) ** 2).reduce((e, t) => e + t, 0) / e.length,
    ),
    s = Math.min(100, (a / 60) * 80),
    d = Math.min(20, 0.8 * r),
    l = Math.round(Math.max(0, s - d));
  let c, p, u;
  if (
    (l >= 85
      ? ((c = "超サクサク 🚀"),
        (u = "#22c55e"),
        (p = "フレームレート安定・動作が非常に滑らか"))
      : l >= 65
        ? ((c = "サクサク ✨"),
          (u = "#a78bfa"),
          (p = "全体的に快適。たまに小さな揺れあり"))
        : l >= 45
          ? ((c = "まあまあ 🙂"),
            (u = "#f59e0b"),
            (p = "普段使いは問題なし。高負荷時に差が出るかも"))
          : l >= 25
            ? ((c = "ちょっと重め 😅"),
              (u = "#f97316"),
              (p = "バックグラウンドアプリを閉じると改善するかも"))
            : ((c = "重い 🐌"),
              (u = "#ef4444"),
              (p = "端末の再起動や不要アプリ終了を試してみて")),
    n && (n.textContent = "診断完了！"),
    o)
  ) {
    o.style.display = "block";
    const e = document.getElementById("particle-score-num"),
      t = document.getElementById("particle-score-label"),
      n = document.getElementById("particle-score-detail");
    (e && ((e.textContent = l), (e.style.color = u)),
      t && ((t.textContent = c), (t.style.color = u)),
      n &&
        (n.innerHTML = `${p}<br><span style="color:#555;font-size:0.72rem;">avg ${a.toFixed(1)}fps ／ jitter ${r.toFixed(1)}ms</span>`));
  }
  (_burstParticles(l), t && ((t.disabled = !1), (t.textContent = "🔄 再診断")));
}
function _burstParticles(e) {
  const t = document.getElementById("particle-canvas");
  if (!t || !_particleCtx) return;
  const n = t.width / 2,
    o = t.height / 2,
    i = Math.round(0.8 * e);
  for (let e = 0; e < i; e++) {
    const e = Math.random() * Math.PI * 2,
      t = 4 * Math.random() + 1;
    _particles.push({
      x: n,
      y: o,
      r: 4 * Math.random() + 1,
      vx: Math.cos(e) * t,
      vy: Math.sin(e) * t,
      alpha: 0.8,
      decay: !0,
    });
  }
  const a = setInterval(() => {
    document.getElementById("particle-canvas")
      ? ((_particles = _particles.filter(
          (e) => (
            e.decay && ((e.alpha -= 0.015), (e.vx *= 0.97), (e.vy *= 0.97)),
            e.alpha > 0.01
          ),
        )),
        _particles.some((e) => e.decay) || clearInterval(a))
      : clearInterval(a);
  }, 30);
}
function _gachaDraw() {
  if (Math.random() < 0.15) {
    const e = GACHA_BADGES.map((e) =>
        "legendary" === e.rarity ? 2 : "epic" === e.rarity ? 4 : 6,
      ),
      t = e.reduce((e, t) => e + t, 0);
    let n = Math.random() * t;
    for (let t = 0; t < GACHA_BADGES.length; t++)
      if (((n -= e[t]), n <= 0)) return { ...GACHA_BADGES[t], isBadge: !0 };
    return { ...GACHA_BADGES[0], isBadge: !0 };
  }
  const e = _gachaSkinPool();
  return e[Math.floor(Math.random() * e.length)];
}
function openGachaModal(e) {
  if (!_isProUltra)
    return (
      _showToast("ガチャはProUltraアカウント限定です"),
      void openPuModal()
    );
  if ("skin" === e) return void openSkinGachaModal();
  if ("badge" === e) return void openBadgeGachaModal();
  document.getElementById("gacha-select-overlay")?.remove();
  const t = document.createElement("div");
  ((t.id = "gacha-select-overlay"),
    (t.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:999998;display:flex;align-items:flex-end;justify-content:center;"),
    (t.onclick = (e) => {
      e.target === t && t.remove();
    }),
    (t.innerHTML =
      '<div style="background:#111;border:1px solid #2a2a2a;border-radius:24px 24px 0 0;width:100%;max-width:500px;padding:24px 20px 36px;">\n        <div style="text-align:center;font-size:1.1rem;font-weight:900;color:#fff;margin-bottom:20px;">🎰 ガチャを選択</div>\n        <div style="display:flex;gap:12px;">\n            <button onclick="document.getElementById(\'gacha-select-overlay\').remove();openSkinGachaModal();"\n                style="flex:1;padding:18px 10px;border-radius:18px;background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;color:#fff;font-size:0.95rem;font-weight:900;cursor:pointer;line-height:1.5;">\n                🎨 スキンガチャ<br><span style="font-size:0.72rem;opacity:0.9;">全40種・1日3回</span>\n            </button>\n            <button onclick="document.getElementById(\'gacha-select-overlay\').remove();openBadgeGachaModal();"\n                style="flex:1;padding:18px 10px;border-radius:18px;background:linear-gradient(135deg,#6366f1,#c084fc);border:none;color:#fff;font-size:0.95rem;font-weight:900;cursor:pointer;line-height:1.5;">\n                🏷️ バッジガチャ<br><span style="font-size:0.72rem;opacity:0.9;">全10種・1日2回</span>\n            </button>\n        </div>\n    </div>'),
    document.body.appendChild(t));
}
function _ticketCount() {
  return (
    _puPurchases.filter((e) => "gacha_ticket_1" === e).length +
    3 * _puPurchases.filter((e) => "gacha_ticket_3" === e).length
  );
}
const _PROMO_CODES_B64 = ["b3dhYmktZ2FjaGE=", "cHJvLXVsdHJhLWdhY2hh"],
  PROMO_TICKETS = 15,
  PROMO_REDEEMED_KEY = "promo_owabi_gacha";
function _showPromoCodeBanner() {
  if (!_isProUltra) return;
  if (_puPurchases.includes(PROMO_REDEEMED_KEY)) return;
  if (document.getElementById("promo-banner")) return;
  const e = document.createElement("div");
  ((e.id = "promo-banner"),
    (e.style.cssText =
      "\n        position:fixed;top:0;left:0;right:0;z-index:999991;\n        background:linear-gradient(135deg,#1a0a00 0%,#1a0010 100%);\n        border-bottom:1px solid rgba(245,158,11,0.4);\n        padding:12px 16px;display:flex;align-items:center;gap:10px;\n        box-shadow:0 4px 24px rgba(245,158,11,0.2);\n        opacity:0;transition:opacity 0.4s;\n    "),
    (e.innerHTML =
      '\n        <div style="font-size:1.4rem;flex-shrink:0;">🎟️</div>\n        <div style="flex:1;min-width:0;">\n            <div style="font-size:0.88rem;font-weight:900;color:#f59e0b;letter-spacing:0.02em;">\n                障害お詫びコードをお持ちですか？\n            </div>\n            <div style="font-size:0.75rem;color:#ccc;margin-top:1px;line-height:1.5;">\n                メールに記載のコードを入力すると、ガチャ券15枚をプレゼント！\n            </div>\n        </div>\n        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">\n            <button onclick="openPromoCodeModal()"\n                style="background:linear-gradient(135deg,#f59e0b,#f97316);border:none;border-radius:10px;\n                       padding:7px 12px;font-size:0.75rem;font-weight:800;color:#000;cursor:pointer;white-space:nowrap;">\n                コード入力\n            </button>\n            <button onclick="document.getElementById(\'promo-banner\').remove()"\n                style="background:none;border:none;color:#666;font-size:1.1rem;cursor:pointer;padding:4px;line-height:1;">✕</button>\n        </div>\n    '),
    document.body.appendChild(e),
    requestAnimationFrame(() => {
      e.style.opacity = "1";
    }));
}
function openPromoCodeModal() {
  if (!_isProUltra)
    return void _showToast("この機能はProUltraアカウント限定です");
  if (_puPurchases.includes(PROMO_REDEEMED_KEY))
    return void _showToast("このコードは既に使用済みです");
  document.getElementById("promo-modal-overlay")?.remove();
  const e = document.createElement("div");
  ((e.id = "promo-modal-overlay"),
    (e.style =
      "position:fixed;inset:0;background:#000c;display:flex;align-items:center;justify-content:center;z-index:99999;"),
    (e.innerHTML =
      '\n    <div style="background:#111;border:1px solid #f59e0b55;border-radius:18px;padding:24px;max-width:340px;width:90%;text-align:center;">\n        <div style="font-size:1.8rem;margin-bottom:8px;">🎟️</div>\n        <div style="color:#fff;font-size:1.05rem;font-weight:900;margin-bottom:6px;">お詫びコード入力</div>\n        <div style="color:#888;font-size:0.78rem;margin-bottom:16px;line-height:1.6;">メールに記載のコードを入力すると、ガチャ券15枚が付与されます。<br>1アカウント1回限り有効です。</div>\n        <input id="promo-code-input" maxlength="20" style="width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:2px dashed #f59e0b88;background:#0a0a0a;color:#f59e0b;font-size:1.2rem;font-weight:900;text-align:center;letter-spacing:2px;font-family:monospace;margin-bottom:14px;" placeholder="CODE">\n        <div style="display:flex;gap:8px;">\n            <button onclick="document.getElementById(\'promo-modal-overlay\').remove();" style="flex:1;padding:12px;border-radius:12px;background:#222;border:none;color:#ccc;font-weight:800;cursor:pointer;">キャンセル</button>\n            <button id="promo-submit-btn" onclick="_redeemPromoCode();" style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;font-weight:900;cursor:pointer;">入力する</button>\n        </div>\n    </div>'),
    document.body.appendChild(e),
    setTimeout(() => document.getElementById("promo-code-input")?.focus(), 50));
}
async function _redeemPromoCode() {
  const e = document.getElementById("promo-code-input"),
    t = (e?.value || "").trim().toLowerCase();
  if (t)
    if (_fbDb && _currentUser)
      if (_PROMO_CODES_B64.map(atob).includes(t))
        if (_puPurchases.includes(PROMO_REDEEMED_KEY))
          _showToast("このコードは既に使用済みです");
        else {
          for (let e = 0; e < 15; e++) _puPurchases.push("gacha_ticket_1");
          (_puPurchases.push(PROMO_REDEEMED_KEY),
            await _savePuPoints(),
            document.getElementById("promo-modal-overlay")?.remove(),
            document.getElementById("promo-banner")?.remove(),
            _showToast("🎉 ガチャ券×15枚を獲得しました！"));
        }
      else _showToast("コードが無効です");
    else _showToast("ログインしてください");
  else _showToast("コードを入力してください");
}
function _useTicket() {
  const e = _puPurchases.indexOf("gacha_ticket_1");
  if (-1 !== e) return void _puPurchases.splice(e, 1);
  const t = _puPurchases.indexOf("gacha_ticket_3");
  -1 !== t &&
    (_puPurchases.splice(t, 1),
    _puPurchases.push("gacha_ticket_1"),
    _puPurchases.push("gacha_ticket_1"));
}
function openSkinGachaModal() {
  if (!_isProUltra)
    return void _showToast("ガチャはProUltraアカウント限定です");
  const e = _isAnnivGachaFreeEnabled(),
    t = _ticketCount();
  if (!e && t <= 0)
    return void _showToast("ガチャ券がありません。ショップで購入できます🎟️");
  (_progressMission("gacha"),
    document.getElementById("gacha-modal-overlay")?.remove());
  const n = _gachaTodayCount(),
    o = _currentUser && "stu2105707@fuku-c.ed.jp" === _currentUser.email,
    i = _isAnnivGachaFreeEnabled() ? (o ? 1 / 0 : Math.max(0, GACHA_MAX_DAILY - n)) : 0,
    a = o ? 1 / 0 : i + t,
    r = !o && a <= 0,
    s = _gachaUnlockedSkins(),
    d = _gachaSkinPool(),
    l = d.every((e) => s.includes(e.id)),
    c = document.createElement("div");
  ((c.id = "gacha-modal-overlay"),
    (c.innerHTML = `\n        <div id="gacha-modal">\n            <button onclick="document.getElementById('gacha-modal-overlay').remove()"\n                style="position:absolute;top:12px;right:14px;background:none;border:none;color:#888;font-size:1.3rem;cursor:pointer;">✕</button>\n            <div style="font-size:1.5rem;font-weight:900;color:#ff6eb4;margin-bottom:4px;">🎰 記念ガチャ</div>\n            <div style="color:#888;font-size:0.8rem;margin-bottom:4px;">全${d.length}種・確率均等 ／ ${o ? "∞回・無制限" : "1日3回無料"}</div>\n            <div style="color:#888;font-size:0.78rem;">所持: ${s.length}/${d.length}種　｜　残り: <span style="color:${o || a > 0 ? "#22c55e" : "#ef4444"};font-weight:800;">${o ? "∞" : a}</span>回${t > 0 ? ` <span style="color:#f59e0b;font-size:0.75rem;">（内券:${t}枚）</span>` : ""}</div>\n\n            <div class="gacha-spin-wrap" id="gacha-icon">🎰</div>\n\n            <div id="gacha-status" style="color:#aaa;font-size:0.85rem;min-height:20px;"></div>\n            <div id="gacha-result-wrap"></div>\n\n            ${r ? '<div style="color:#888;font-size:0.82rem;margin-top:12px;">今日の無料分は3回引きました。ガチャ券を使うか、明日また来てね！🎟️</div>' : l ? '<div style="color:#f59e0b;font-size:0.82rem;margin-top:12px;">全スキン所持済み！重複は15pt補償</div>\n                       <button onclick="_execSkinGacha()" id="gacha-btn"\n                           style="margin-top:10px;width:100%;padding:14px;border-radius:16px;background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;color:#fff;font-size:1rem;font-weight:900;cursor:pointer;">\n                           🎰 ガチャを引く\n                       </button>' : '<button onclick="_execSkinGacha()" id="gacha-btn"\n                           style="margin-top:14px;width:100%;padding:14px;border-radius:16px;background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;color:#fff;font-size:1rem;font-weight:900;cursor:pointer;">\n                           🎰 ガチャを引く\n                       </button>'}\n        </div>`),
    document.body.appendChild(c));
}
function _execSkinGacha() {
  const e = document.getElementById("gacha-btn");
  e && (e.disabled = !0);
  const t = _isAnnivGachaFreeEnabled()
      ? Math.max(0, GACHA_MAX_DAILY - _gachaTodayCount())
      : 0,
    n = _ticketCount(),
    o = _currentUser && "stu2105707@fuku-c.ed.jp" === _currentUser.email;
  if (!o && t <= 0 && n <= 0)
    return (
      _showToast("ガチャ券がありません。ショップで購入してください🎟️"),
      void (e && (e.disabled = !1))
    );
  const i = !o && t <= 0 && n > 0;
  i && (_useTicket(), _savePuPoints());
  const a = document.getElementById("gacha-icon");
  (a && (a.classList.add("spinning"), (a.textContent = "🎰")),
    setTimeout(() => {
      const e = _gachaDraw(),
        t = _gachaUnlockedSkins().includes(e.id);
      (a && (a.classList.remove("spinning"), (a.textContent = e.emoji)),
        t || (_gachaSaveSkin(e.id), i || _gachaMarkToday()));
      const n = document.getElementById("gacha-status"),
        o = document.getElementById("gacha-result-wrap");
      if ((n && (n.textContent = ""), e.isBadge)) {
        const t = _gachaUnlockedBadges().includes(e.id);
        (a && (a.classList.remove("spinning"), (a.textContent = e.emoji)),
          t || _gachaSaveBadge(e.id),
          _gachaMarkToday());
        const n =
            "legendary" === e.rarity
              ? "🌟 LEGENDARY"
              : "epic" === e.rarity
                ? "💫 EPIC"
                : "✨ RARE",
          i =
            "legendary" === e.rarity
              ? "#ffd700"
              : "epic" === e.rarity
                ? "#c084fc"
                : "#34c759";
        return (
          o &&
            (o.innerHTML = `\n                <div class="gacha-result-card" style="border:1px solid ${e.color}44;">\n                    <div style="font-size:2.5rem;filter:drop-shadow(0 0 12px ${e.glow});">${e.emoji}</div>\n                    <div style="color:${i};font-size:0.75rem;font-weight:900;letter-spacing:2px;margin:4px 0;">${n}</div>\n                    <div style="color:#fff;font-weight:900;font-size:1.05rem;margin:4px 0;">${e.label}バッジ</div>\n                    <div style="color:${t ? "#f59e0b" : "#22c55e"};font-size:0.82rem;font-weight:800;">${t ? "重複 → +15pt 補償" : "🏷️ NEW バッジゲット！"}</div>\n                    ${t ? "" : `<button onclick="equipBadge('${e.id}');document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:12px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,${e.color},${e.glow});border:none;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;">\n                        今すぐ装備する\n                    </button>`}\n                    <button onclick="document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:8px;width:100%;padding:8px;border-radius:12px;background:#2a2a2a;border:none;color:#aaa;font-size:0.85rem;cursor:pointer;">\n                        閉じる\n                    </button>\n                </div>`),
          void (t
            ? ((_puPoints += 15),
              _savePuPoints(),
              _showPointToast("+15pt（重複補償）", _puPoints))
            : _showToast("🏷️ " + e.label + "バッジをゲット！"))
        );
      }
      t
        ? o &&
          (o.innerHTML = `\n                <div class="gacha-result-card">\n                    <div style="font-size:2rem;">${e.emoji}</div>\n                    <div style="color:#fff;font-weight:900;font-size:1.05rem;margin:6px 0 2px;">${e.label}</div>\n                    <div style="color:#f59e0b;font-size:0.82rem;font-weight:800;">⚠️ 重複！どうする？</div>\n                    <div class="gacha-dup-actions">\n                        <button onclick="_gachaDupReroll()"\n                            style="background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;">\n                            🔄 再ガチャ\n                        </button>\n                        <button onclick="_gachaDupPoints('${e.id}')"\n                            style="background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#000;">\n                            💰 +15pt もらう\n                        </button>\n                    </div>\n                </div>`)
        : (o &&
            (o.innerHTML = `\n                <div class="gacha-result-card">\n                    <div style="font-size:2rem;">${e.emoji}</div>\n                    <div style="color:#fff;font-weight:900;font-size:1.05rem;margin:6px 0 2px;">${e.label}</div>\n                    <div style="color:#22c55e;font-size:0.82rem;font-weight:800;">✨ NEW スキンゲット！</div>\n                    <button onclick="applyPuSkin('${e.id}');document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:12px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#4ade80);border:none;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;">\n                        今すぐ使う\n                    </button>\n                    ${(() => {
              const e = GACHA_MAX_DAILY - _gachaTodayCount();
              return e > 0
                ? `<button onclick="document.getElementById('gacha-result-wrap').innerHTML='';const b2=document.getElementById('gacha-btn');if(b2){b2.disabled=false;b2.style.display='block';}document.getElementById('gacha-icon').textContent='🎰';" style="margin-top:8px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;">🔄 もう一度引く（残り${e}回）</button>`
                : "";
            })()}\n                    <button onclick="document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:8px;width:100%;padding:8px;border-radius:12px;background:#2a2a2a;border:none;color:#aaa;font-size:0.85rem;cursor:pointer;">\n                        閉じる\n                    </button>\n                </div>`),
          _showToast("🎉 " + e.label + "スキンをゲット！"),
          _renderPuSkinUI());
    }, 850));
}
function _gachaDupReroll() {
  const e = document.getElementById("gacha-result-wrap"),
    t = document.getElementById("gacha-icon");
  (e && (e.innerHTML = ""),
    t && (t.classList.add("spinning"), (t.textContent = "🎰")),
    setTimeout(() => {
      const n = _gachaSkinPool(),
        o = _gachaUnlockedSkins(),
        i = n.filter((e) => !o.includes(e.id));
      let a;
      a =
        i.length > 0
          ? i[Math.floor(Math.random() * i.length)]
          : n[Math.floor(Math.random() * n.length)];
      const r = o.includes(a.id);
      (t && (t.classList.remove("spinning"), (t.textContent = a.emoji)),
        r
          ? (_gachaMarkToday(),
            e &&
              (e.innerHTML =
                '\n                <div class="gacha-result-card">\n                    <div style="color:#888;font-size:0.85rem;">全スキン所持済みです！</div>\n                    <button onclick="document.getElementById(\'gacha-modal-overlay\').remove();"\n                        style="margin-top:10px;width:100%;padding:10px;border-radius:12px;background:#2a2a2a;border:none;color:#aaa;font-size:0.85rem;cursor:pointer;">\n                        閉じる\n                    </button>\n                </div>'))
          : (_gachaSaveSkin(a.id),
            _gachaMarkToday(),
            e &&
              (e.innerHTML = `\n                <div class="gacha-result-card">\n                    <div style="font-size:2rem;">${a.emoji}</div>\n                    <div style="color:#fff;font-weight:900;font-size:1.05rem;margin:6px 0 2px;">${a.label}</div>\n                    <div style="color:#22c55e;font-size:0.82rem;font-weight:800;">✨ NEW スキンゲット！</div>\n                    <button onclick="applyPuSkin('${a.id}');document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:12px;width:100%;padding:10px;border-radius:12px;background:linear-gradient(135deg,#22c55e,#4ade80);border:none;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;">\n                        今すぐ使う\n                    </button>\n                    <button onclick="document.getElementById('gacha-modal-overlay').remove();"\n                        style="margin-top:8px;width:100%;padding:8px;border-radius:12px;background:#2a2a2a;border:none;color:#aaa;font-size:0.85rem;cursor:pointer;">\n                        あとで使う\n                    </button>\n                </div>`),
            _showToast("🎉 " + a.label + "スキンをゲット！"),
            _renderPuSkinUI()));
    }, 850));
}
function _gachaDupPoints(e) {
  (_gachaMarkToday(),
    (_puPoints += 15),
    _savePuPoints(),
    document.getElementById("gacha-modal-overlay")?.remove(),
    _showToast("💰 +15pt 獲得！"));
}
async function fetchUserPlan() {
  if (((_isProUltra = !1), !_currentUser || !_fbDb || _currentUser.isAnonymous))
    return void _onPlanReady();
  try {
    (await _fbAuth.currentUser.reload(), (_currentUser = _fbAuth.currentUser));
  } catch (e) {
    console.warn("⚠️ user.reload() 失敗:", e);
  }
  const e =
      _currentUser.providerData &&
      _currentUser.providerData.some((e) => "password" === e.providerId),
    t =
      !e &&
      (!_currentUser.providerData ||
        0 === _currentUser.providerData.length ||
        (1 === _currentUser.providerData.length &&
          "firebase" === _currentUser.providerData[0].providerId)),
    n = ["stu2105707@fuku-c.ed.jp"].includes(_currentUser.email || "");
  if (e && !_currentUser.emailVerified && !n)
    return (
      _showVerifyBanner(!0),
      _onPlanReady(),
      void updateAuthUI(_currentUser)
    );
  (_showVerifyBanner(!1), e && (_isProUltra = !0));
  try {
    const n = await _fbDb.collection("users").doc(_currentUser.uid).get(),
      o = n.exists ? n.data().plan : null;
    e
      ? "pro_ultra" !== o &&
        (await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ plan: "pro_ultra" }, { merge: !0 })
          .catch((e) => console.warn("Firestore write failed:", e)))
      : "pro_ultra" === o
        ? (_isProUltra = !0)
        : t &&
          ((_isProUltra = !0),
          "pro_ultra" !== o &&
            (await _fbDb
              .collection("users")
              .doc(_currentUser.uid)
              .set({ plan: "pro_ultra" }, { merge: !0 })
              .catch((e) =>
                console.warn("Firestore passkey plan write failed:", e),
              )));
  } catch (e) {
    console.error("❌ ProUltraプラン取得エラー:", e);
  }
  (_onPlanReady(), updateAuthUI(_currentUser));
}
function _showVerifyBanner(e) {
  const t = document.getElementById("email-verify-banner"),
    n = document.getElementById("auth-update-banner");
  if (t)
    if (
      ((t.style.display = e ? "flex" : "none"),
      e && n && !localStorage.getItem("pu_upd_banner_v1")
        ? (n.style.display = "flex")
        : !e && n && (n.style.display = "none"),
      e)
    ) {
      const e = document.getElementById("auth-bar"),
        o = e ? e.offsetHeight : 49;
      ((t.style.top = o + "px"),
        requestAnimationFrame(() => {
          const e = t.offsetHeight,
            i = n && "flex" === n.style.display;
          i && (n.style.top = o + e + "px");
          const a = i ? n.offsetHeight || 40 : 0;
          document.body.style.paddingTop = o + e + a + "px";
        }));
    } else document.body.style.paddingTop = _currentUser ? "49px" : "0px";
}
async function resendVerificationEmail() {
  if (_fbAuth && _fbAuth.currentUser)
    try {
      (await _fbAuth.currentUser.sendEmailVerification(),
        alert(
          "確認メールを再送しました！\n受信ボックス・迷惑メールフォルダをご確認ください。",
        ));
    } catch (e) {
      alert(
        {
          "auth/too-many-requests":
            "しばらく時間をおいてから再試行してください",
        }[e.code] || "送信に失敗しました: " + e.message,
      );
    }
}
async function recheckEmailVerified() {
  if (_fbAuth && _fbAuth.currentUser)
    try {
      (await _fbAuth.currentUser.reload(),
        (_currentUser = _fbAuth.currentUser),
        _currentUser.emailVerified
          ? (_showVerifyBanner(!1), await fetchUserPlan())
          : alert(
              "まだ確認が完了していません。\nメール内のリンクをクリックしてから再度お試しください。\n\n※ 迷惑メールフォルダもご確認ください。",
            ));
    } catch (e) {}
}
const PU_REMINDER_KEY = "pu_reminder_v1",
  PU_LAST_DIAG_KEY = "pu_last_diag_v1",
  PU_REMINDER_OPTS = [1, 3, 7, 30],
  PU_REMINDER_DEFAULT = 3;
function getPuReminderDays() {
  const e = parseInt(localStorage.getItem(PU_REMINDER_KEY));
  return PU_REMINDER_OPTS.includes(e) ? e : 3;
}
function setPuReminderDays(e) {
  (localStorage.setItem(PU_REMINDER_KEY, String(e)),
    _renderPuReminderUI(),
    _currentUser &&
      window._fbDb &&
      window._fbDb
        .collection("diag_reminders")
        .doc(_currentUser.uid)
        .set({ reminderDays: e }, { merge: !0 })
        .catch((e) => console.warn("[Reminder] Firestore更新失敗:", e)));
}
function updatePuLastDiag() {
  if (
    (localStorage.setItem(PU_LAST_DIAG_KEY, String(Date.now())),
    _currentUser && window._fbDb)
  ) {
    const e = _currentUser.uid,
      t = getPuReminderDays();
    window._fbDb
      .collection("diag_reminders")
      .doc(e)
      .set({ lastDiagAt: Date.now(), reminderDays: t, uid: e }, { merge: !0 })
      .catch((e) => console.warn("[Reminder] Firestore保存失敗:", e));
  }
}
async function checkPuReminder() {
  if (!_isProUltra) return;
  if (
    "undefined" == typeof Notification ||
    "granted" !== Notification.permission
  )
    return;
  if (isQuietTime()) return;
  const e = parseInt(localStorage.getItem(PU_LAST_DIAG_KEY));
  if (!e || isNaN(e)) return;
  const t = (Date.now() - e) / 864e5;
  t >= getPuReminderDays() &&
    new Notification("👑 デバイス再診断のお知らせ", {
      body:
        "前回の診断から" +
        Math.floor(t) +
        "日が経過しています。デバイスの状態を確認しましょう！",
      icon: "./android-chrome-192x192.png",
      silent: !1,
    });
}
function _renderPuReminderUI() {
  const e = document.getElementById("pu-reminder-selector");
  if (!e) return;
  const t = getPuReminderDays(),
    n = { 1: "毎日", 3: "3日ごと", 7: "週1", 30: "月1" };
  e.innerHTML = PU_REMINDER_OPTS.map(function (e) {
    const o = e === t;
    return (
      '<button onclick="setPuReminderDays(' +
      e +
      ')" style="flex:1;padding:7px 4px;border-radius:10px;font-size:0.78rem;font-weight:700;cursor:pointer;border:2px solid ' +
      (o ? "#f59e0b" : "#333") +
      ";background:" +
      (o ? "rgba(245,158,11,0.15)" : "#1a1a1a") +
      ";color:" +
      (o ? "#f59e0b" : "#888") +
      ';transition:all 0.2s;">' +
      n[e] +
      "</button>"
    );
  }).join("");
}
function _applyPuShareStyle(e) {
  if (!_isProUltra) return;
  const t = {
    gold: "pu-share-gold",
    aurora: "pu-share-aurora",
    diamond: "pu-share-diamond",
  }[localStorage.getItem("pu_skin_v1") || "default"];
  t && e.classList.add(t);
}
function _removePuShareStyle(e) {
  ["pu-share-gold", "pu-share-aurora", "pu-share-diamond"].forEach((t) =>
    e.classList.remove(t),
  );
}
async function _runDetailMode() {
  if (
    (console.log("【詳細モード実行】_isProUltra:", _isProUltra),
    [35, 36, 37].forEach(function (e) {
      const t = document.getElementById("row-" + e);
      t && (t.style.display = _isProUltra ? "" : "none");
    }),
    _isProUltra)
  ) {
    try {
      const e = document.getElementById("v-35"),
        t = document.getElementById("row-35");
      if (navigator.storage && navigator.storage.estimate) {
        const n = await navigator.storage.estimate();
        let o = n.usage || 0;
        if (n.usageDetails) {
          const e = n.usageDetails;
          ((o =
            (e.indexedDB || 0) +
            (e.caches || 0) +
            (e.serviceWorkerRegistrations || 0) +
            (e.sessionStorage || 0)),
            0 === o && (o = n.usage || 0));
        }
        const i = Math.round((o / 1024 / 1024) * 10) / 10,
          a = Math.round((n.quota || 0) / 1024 / 1024),
          r = a >= 1024 ? (a / 1024).toFixed(1) + " GB" : a + " MB",
          s = a > 0 ? Math.round((i / a) * 100) : 0,
          d = i < 1 ? "< 1 MB" : i + " MB";
        (e &&
          (e.textContent = d + " " + tv().inUse + " / " + r + " (" + s + "%)"),
          t &&
            (t.className =
              "spec-row st-" + (s < 50 ? "ok" : s < 80 ? "warn" : "bad")));
      } else
        (e && (e.textContent = tv().unavailable),
          t && (t.className = "spec-row st-warn"));
    } catch (e) {
      const t = document.getElementById("v-35");
      t && (t.textContent = tv().unavailable);
    }
    try {
      const e = document.getElementById("v-36"),
        t = document.getElementById("row-36");
      if ("undefined" != typeof WebAssembly) {
        const n = performance.now(),
          o = new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 127, 3, 2, 1, 0, 7,
            7, 1, 3, 97, 100, 100, 0, 0, 10, 6, 1, 4, 0, 65, 42, 11,
          ]);
        await WebAssembly.compile(o);
        const i = Math.round(10 * (performance.now() - n)) / 10;
        (e &&
          (e.textContent =
            tv().wasmSupported + "  " + tv().compile + ": " + i + "ms"),
          t &&
            (t.className =
              "spec-row st-" + (i < 5 ? "ok" : i < 20 ? "warn" : "bad")));
      } else
        (e && (e.textContent = tv().wasmUnsupported),
          t && (t.className = "spec-row st-bad"));
    } catch (e) {
      const t = document.getElementById("v-36");
      t && (t.textContent = tv().unavailable);
    }
    try {
      const e = document.getElementById("v-37"),
        t = document.getElementById("row-37");
      if ("Notification" in window) {
        const n = Notification.permission,
          o =
            "granted" === n
              ? tv().notifGranted
              : "denied" === n
                ? tv().notifDenied
                : tv().notifDefault;
        (e && (e.textContent = o),
          t &&
            (t.className =
              "spec-row st-" +
              ("granted" === n ? "ok" : "denied" === n ? "bad" : "warn")));
      } else
        (e && (e.textContent = tv().notifUnsupported),
          t && (t.className = "spec-row st-warn"));
    } catch (e) {
      const t = document.getElementById("v-37");
      t && (t.textContent = tv().unavailable);
    }
  } else console.log("【詳細モード】ProUltraではないためスキップ");

  // 👑 ProUltra Max 追加5項目を動的に表示
  if (_isProUltraPlus && _isProUltraPlus() && _diagMode === "max") {
    const maxItems = [
      { id: "max-gpu-detail",   label: "🖥️ GPU詳細",       value: diag.maxGpuDetail || "N/A",
        sub: `可変ベクター: ${diag.glMaxVaryings ?? "?"} / フラグメントUniform: ${diag.glMaxUniforms ?? "?"}` },
      { id: "max-mem-bw",      label: "📊 メモリ帯域(精)",  value: diag.memBandwidthDetailed || "N/A" },
      { id: "max-storage",     label: "💾 ストレージ速度",   value: diag.storageBench || "N/A" },
      { id: "max-js-engine",   label: "⚙️ JSエンジン",      value: diag.jsEngineScore || "N/A" },
      { id: "max-net-detail",  label: "🌐 通信精密計測",    value: diag.netPingDetailed || "N/A" },
    ];
    // 既存のmax行があれば削除してから再描画
    document.querySelectorAll(".spec-row-max").forEach(el => el.remove());
    const specTable = document.querySelector(".spec-table, #spec-table, .specs-body, #specs-body")
      || document.getElementById("row-37")?.parentElement;
    if (specTable) {
      maxItems.forEach(item => {
        const row = document.createElement("div");
        row.className = "spec-row spec-row-max st-ok";
        row.id = "row-" + item.id;
        row.innerHTML = `
          <span class="spec-label" style="color:#f97316;font-weight:700;">👑 ${item.label}</span>
          <span class="spec-value" id="v-${item.id}" style="color:#fbbf24;">${item.value}${item.sub ? `<br><span style="font-size:0.75em;opacity:0.7;">${item.sub}</span>` : ""}</span>`;
        specTable.appendChild(row);
      });
    }
  }
}
let _puPoints = 0,
  _puPurchases = [],
  _puRankingAnon = !0;
const DAILY_MISSION_DEFS = [
    { id: "diag", label: "診断する", emoji: "🔬", pt: 15, max: 1 },
    {
      id: "best_score",
      label: "自己ベストを更新する",
      emoji: "🏆",
      pt: 25,
      max: 1,
    },
    { id: "diag_3", label: "3回連続診断する", emoji: "🔁", pt: 20, max: 3 },
    { id: "gacha", label: "ガチャを1回引く", emoji: "🎰", pt: 10, max: 1 },
    { id: "skin_change", label: "スキンを変える", emoji: "🎨", pt: 10, max: 1 },
    {
      id: "ai_advisor",
      label: "AIアドバイザーに相談する",
      emoji: "🤖",
      pt: 10,
      max: 1,
    },
    {
      id: "open_shop",
      label: "ポイントショップを開く",
      emoji: "🪙",
      pt: 5,
      max: 1,
    },
    {
      id: "share_x",
      label: "診断結果をXにシェアする",
      emoji: "🐦",
      pt: 20,
      max: 1,
    },
    {
      id: "dl_image",
      label: "結果画像をダウンロードする",
      emoji: "💾",
      pt: 15,
      max: 1,
    },
    {
      id: "open_history",
      label: "診断履歴を開く",
      emoji: "📜",
      pt: 10,
      max: 1,
    },
    {
      id: "open_ranking",
      label: "週間ランキングを見る",
      emoji: "🏆",
      pt: 15,
      max: 1,
    },
    {
      id: "battery",
      label: "バッテリー寿命予測を開く",
      emoji: "🔋",
      pt: 15,
      max: 1,
    },
    {
      id: "upgrade_sim",
      label: "買い替えシミュレーターを開く",
      emoji: "📱",
      pt: 15,
      max: 1,
    },
    {
      id: "particle",
      label: "サクサク度診断を開く",
      emoji: "✨",
      pt: 20,
      max: 1,
    },
    {
      id: "feedback",
      label: "フィードバックを送る",
      emoji: "💬",
      pt: 25,
      max: 1,
    },
    {
      id: "open_group",
      label: "友達グループを開く",
      emoji: "👥",
      pt: 10,
      max: 1,
    },
    {
      id: "friend_code",
      label: "友達コードを確認する",
      emoji: "🔗",
      pt: 10,
      max: 1,
    },
    { id: "retry", label: "診断をリトライする", emoji: "🔄", pt: 10, max: 1 },
    { id: "how_to_use", label: "使い方を見る", emoji: "📖", pt: 5, max: 1 },
    {
      id: "share_line",
      label: "LINEにシェアする",
      emoji: "💚",
      pt: 15,
      max: 1,
    },
    {
      id: "share_bluesky",
      label: "Blueskyにシェアする",
      emoji: "🦋",
      pt: 15,
      max: 1,
    },
    { id: "rank_s", label: "Sランクを取る", emoji: "🔴", pt: 30, max: 1 },
    {
      id: "score_700",
      label: "スコア700以上を取る",
      emoji: "💯",
      pt: 20,
      max: 1,
    },
    { id: "diag_5", label: "累計5回診断する", emoji: "🎖️", pt: 30, max: 5 },
    { id: "ai_3q", label: "AIに3回質問する", emoji: "🧠", pt: 20, max: 3 },
    {
      id: "backup",
      label: "データをバックアップする",
      emoji: "📦",
      pt: 10,
      max: 1,
    },
  ],
  DAILY_MISSION_COUNT = 4,
  DAILY_COMPLETE_BONUS = 50,
  DAILY_STREAK_BONUS_PT = 400,
  DAILY_STREAK_GACHA = 3,
  MISSION_SKINS = [
    {
      id: "mission_moon",
      label: "ムーン",
      emoji: "🌙",
      preview: "linear-gradient(135deg,#1e1b4b,#6d28d9)",
    },
    {
      id: "mission_thunder",
      label: "サンダー",
      emoji: "⚡",
      preview: "linear-gradient(135deg,#713f12,#fbbf24)",
    },
    {
      id: "mission_clover",
      label: "クローバー",
      emoji: "🍀",
      preview: "linear-gradient(135deg,#14532d,#4ade80)",
    },
    {
      id: "mission_target",
      label: "ターゲット",
      emoji: "🎯",
      preview: "linear-gradient(135deg,#7f1d1d,#ef4444)",
    },
    {
      id: "mission_blossom",
      label: "ブロッサム",
      emoji: "🌸",
      preview: "linear-gradient(135deg,#831843,#f9a8d4)",
    },
  ];
let _dailyMissions = [],
  _dailyLoadedDate = "",
  _dailyStreak = 0,
  _dailyStreakLastDate = "";
function _todayStr() {
  return new Date().toLocaleDateString("sv-SE");
}
function _checkDateChange() {
  const e = new Date().toLocaleDateString("sv-SE");
  _dailyLoadedDate &&
    _dailyLoadedDate !== e &&
    ((_dailyLoadedDate = null),
    (_dailyMissions = []),
    _isProUltra && _currentUser && _fbDb && _loadDailyMissions());
}
function _seedRand(e) {
  let t = e;
  return () => (
    (t = (1664525 * t + 1013904223) & 4294967295),
    (t >>> 0) / 4294967295
  );
}
function _getTodayMissions() {
  const e = _todayStr(),
    t = _seedRand(
      parseInt(e.replace(/-/g, ""), 10) +
        (_currentUser ? parseInt(_currentUser.uid.slice(-4), 16) : 0),
    ),
    n = [...DAILY_MISSION_DEFS];
  for (let e = n.length - 1; e > 0; e--) {
    const o = Math.floor(t() * (e + 1));
    [n[e], n[o]] = [n[o], n[e]];
  }
  return n.slice(0, 4).map((e) => ({ ...e, progress: 0, done: !1 }));
}
async function _loadDailyMissions() {
  if (!_isProUltra || !_currentUser || !_fbDb) return;
  const e = _todayStr();
  if (_dailyLoadedDate !== e) {
    _dailyLoadedDate = e;
    try {
      const t = await _fbDb.collection("users").doc(_currentUser.uid).get(),
        n = t.exists ? t.data() : {},
        o = n.dailyMissions || {};
      ((_dailyStreak = n.dailyStreak || 0),
        (_dailyStreakLastDate = n.dailyStreakLastDate || ""));
      const i = _getTodayMissions();
      o.date === e && Array.isArray(o.missions)
        ? (_dailyMissions = i.map((e) => {
            const t = o.missions.find((t) => t.id === e.id);
            return t
              ? { ...e, progress: t.progress || 0, done: t.done || !1 }
              : e;
          }))
        : ((_dailyMissions = i), await _saveDailyMissions());
    } catch (e) {
      _dailyMissions = _getTodayMissions();
    }
  }
}
async function _saveDailyMissions() {
  if (_isProUltra && _currentUser && _fbDb)
    try {
      await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .set(
          {
            dailyMissions: {
              date: _todayStr(),
              missions: _dailyMissions.map((e) => ({
                id: e.id,
                progress: e.progress,
                done: e.done,
              })),
            },
            dailyStreak: _dailyStreak,
            dailyStreakLastDate: _dailyStreakLastDate,
          },
          { merge: !0 },
        );
    } catch (e) {}
}
async function _progressMission(e) {
  if (!_isProUltra || !_currentUser) return;
  await _loadDailyMissions();
  const t = _dailyMissions.find((t) => t.id === e);
  t &&
    !t.done &&
    ((t.progress = (t.progress || 0) + 1),
    t.progress >= t.max &&
      ((t.done = !0),
      (_puPoints = (_puPoints || 0) + t.pt),
      _fbDb &&
        (await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ points: _puPoints }, { merge: !0 })),
      _showPointToast(
        `🎯 ミッション達成！「${t.label}」 +${t.pt}pt`,
        _puPoints,
      ),
      await _checkDailyAllComplete()),
    await _saveDailyMissions(),
    _refreshDailyMissionUI());
}
async function _checkDailyAllComplete() {
  if (_dailyMissions.every((e) => e.done)) {
    const e = _todayStr(),
      t = new Date(Date.now() - 864e5).toLocaleDateString("sv-SE");
    (_dailyStreakLastDate === t
      ? _dailyStreak++
      : _dailyStreakLastDate !== e && (_dailyStreak = 1),
      (_dailyStreakLastDate = e));
    const n = MISSION_SKINS.filter((e) => _puPurchases.includes(e.id)).length;
    let o = "";
    if (n < MISSION_SKINS.length) {
      const e = MISSION_SKINS[n];
      (_puPurchases.push(e.id),
        PU_SKINS.find((t) => t.id === e.id) ||
          PU_SKINS.push({
            id: e.id,
            label: e.label,
            emoji: e.emoji,
            preview: e.preview,
            free: !1,
            gacha: !1,
            mission: !0,
          }),
        _fbDb &&
          (await _fbDb
            .collection("users")
            .doc(_currentUser.uid)
            .set({ purchases: _puPurchases }, { merge: !0 })),
        (o = `🎉 全ミッションクリア！\n${e.emoji} ミッションスキン「${e.label}」を解放！`),
        _checkDailyGrantPackComplete());
    } else
      ((_puPoints = (_puPoints || 0) + 50),
        _fbDb &&
          (await _fbDb
            .collection("users")
            .doc(_currentUser.uid)
            .set({ points: _puPoints }, { merge: !0 })),
        (o = "🎉 全ミッションクリア！ +50pt"));
    if (
      (_showPointToast(o, _puPoints), _dailyStreak > 0 && _dailyStreak % 7 == 0)
    ) {
      const e = _currentBonusMultiplier() * (_pointDoubleEnabled ? 2 : 1),
        t = 400 * e;
      ((_puPoints = (_puPoints || 0) + t),
        _fbDb &&
          (await _fbDb
            .collection("users")
            .doc(_currentUser.uid)
            .set({ points: _puPoints }, { merge: !0 })),
        setTimeout(() => {
          (_showPointToast(
            `🔥 7日連続コンプリート！\n+${t}pt & ガチャ +3回！`,
            _puPoints,
          ),
            _addPointHistory(
              `🔥 7日連続ミッションコンプリートボーナス（×${e}倍）`,
              t,
              _puPoints,
            ),
            _addBonusGacha(3));
        }, 2e3));
    }
    await _saveDailyMissions();
  }
}
function _addBonusGacha(e) {
  const t = _todayStr(),
    n = "gacha_bonus_" + (_currentUser ? _currentUser.uid : "anon");
  try {
    const o = JSON.parse(localStorage.getItem(n) || "{}");
    ((o[t] = (o[t] || 0) + e), localStorage.setItem(n, JSON.stringify(o)));
  } catch (e) {}
}
function _getBonusGacha() {
  const e = _todayStr(),
    t = "gacha_bonus_" + (_currentUser ? _currentUser.uid : "anon");
  try {
    return JSON.parse(localStorage.getItem(t) || "{}")[e] || 0;
  } catch (e) {
    return 0;
  }
}
function _useBonusGacha() {
  const e = _todayStr(),
    t = "gacha_bonus_" + (_currentUser ? _currentUser.uid : "anon");
  try {
    const n = JSON.parse(localStorage.getItem(t) || "{}");
    if ((n[e] || 0) > 0)
      return (n[e]--, localStorage.setItem(t, JSON.stringify(n)), !0);
  } catch (e) {}
  return !1;
}
function _refreshDailyMissionUI() {
  const e = document.getElementById("daily-mission-panel");
  e && (e.outerHTML = _buildDailyMissionHTML());
}
function _buildDailyMissionHTML() {
  if (!_isProUltra) return "";
  _todayStr();
  const e = _dailyMissions.length > 0 && _dailyMissions.every((e) => e.done),
    t = _dailyMissions.filter((e) => e.done).length,
    n = MISSION_SKINS.filter((e) => _puPurchases.includes(e.id)),
    o = MISSION_SKINS[n.length] || null;
  return `<div id="daily-mission-panel" style="background:#1c1c1e;border:1px solid #333;border-radius:20px;padding:18px;margin-top:14px;">\n        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n            <div style="color:#fff;font-size:1rem;font-weight:900;">🎯 デイリーミッション</div>\n            <div style="display:flex;align-items:center;gap:8px;">\n                ${_dailyStreak > 0 ? `<div style="background:#7c3aed;color:#fff;font-size:0.75rem;font-weight:800;padding:3px 10px;border-radius:20px;">🔥 ${_dailyStreak}日連続</div>` : ""}\n                <div style="color:#f59e0b;font-size:0.8rem;font-weight:800;">${t}/${_dailyMissions.length}</div>\n            </div>\n        </div>\n        ${_dailyMissions.map((e) => `\n        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${e.done ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)"};border-radius:12px;margin-bottom:6px;border:1px solid ${e.done ? "#4ade80" : "transparent"};">\n            <div style="font-size:1.3rem;">${e.emoji}</div>\n            <div style="flex:1;">\n                <div style="color:${e.done ? "#4ade80" : "#fff"};font-size:0.88rem;font-weight:700;">${e.label}</div>\n                ${e.max > 1 ? `<div style="color:#999;font-size:0.75rem;">${e.progress}/${e.max}回</div>` : ""}\n            </div>\n            <div style="color:${e.done ? "#4ade80" : "#f59e0b"};font-size:0.85rem;font-weight:800;">${e.done ? "✅" : "+" + e.pt + "pt"}</div>\n        </div>`).join("")}\n        ${e ? '<div style="text-align:center;color:#4ade80;font-size:0.85rem;font-weight:800;margin-top:8px;">🎉 今日のミッション全クリア！</div>' : o ? `<div style="text-align:center;color:#a78bfa;font-size:0.78rem;font-weight:700;margin-top:8px;">全クリ報酬：${o.emoji} ミッションスキン「${o.label}」を解放</div>` : '<div style="text-align:center;color:#f59e0b;font-size:0.78rem;font-weight:700;margin-top:8px;">全クリ報酬：+50pt</div>'}\n        ${_dailyStreak > 0 ? `<div style="text-align:center;color:#c084fc;font-size:0.75rem;font-weight:700;margin-top:4px;">7日連続クリアで +400pt & ガチャ3回！（現在${_dailyStreak}日目）</div>` : ""}\n    </div>`;
}
setInterval(_checkDateChange, 6e4);
const PU_SHOP_ITEMS = [
  {
    id: "skin_neon",
    name: "🌈 ネオンスキン",
    pt: 300,
    type: "skin",
    desc: "鮮やかなネオンカラーの限定スキン",
  },
  {
    id: "skin_sakura",
    name: "🌸 サクラスキン",
    pt: 400,
    type: "skin",
    desc: "和風桜カラーの限定スキン",
  },
  {
    id: "skin_midnight",
    name: "🌙 ミッドナイトスキン",
    pt: 500,
    type: "skin",
    desc: "深夜の星空をイメージした限定スキン",
  },
  {
    id: "history_plus",
    name: "📊 履歴30件保存",
    pt: 500,
    type: "feature",
    desc: "診断履歴の保存上限が10件→30件にアップ",
  },
  {
    id: "ai_pro",
    name: "🤖 AIコメント強化版",
    pt: 600,
    type: "feature",
    desc: "診断結果に詳細なAIアドバイスが表示される",
  },
  {
    id: "ranking_weekly",
    name: "🏆 週間ランキング参加権",
    pt: 1e3,
    type: "feature",
    desc: "週ごとのスコアランキングに参加できる",
  },
  {
    id: "best_badge",
    name: "🏅 自己ベスト記録バッジ",
    pt: 650,
    type: "feature",
    desc: "歴代最高スコア更新時に特別演出＋バッジを表示",
  },
  {
    id: "avg_report",
    name: "📊 スコア平均レポート",
    pt: 400,
    type: "feature",
    desc: "直近5回の平均・最高・最低スコアをまとめて表示",
  },
  {
    id: "gacha_ticket_1",
    name: "🎟️ ガチャ券×1",
    pt: 200,
    type: "gacha",
    desc: "期間外でも使えるガチャ券1枚。いつでも使用可能",
    multi: !0,
  },
  {
    id: "gacha_ticket_3",
    name: "🎟️🎟️ ガチャ券×3",
    pt: 550,
    type: "gacha",
    desc: "ガチャ券3枚セット。バラで買うより50pt お得",
    multi: !0,
  },
  {
    id: "gacha_rare_up",
    name: "⭐ レアリティアップ券",
    pt: 300,
    type: "gacha",
    desc: "次の1回のガチャでレアスキンの確率が2倍になる",
    multi: !0,
  },
  {
    id: "ai_unlimited",
    name: "💬 AIチャット無制限",
    pt: 600,
    type: "feature",
    desc: "1日のAIチャット上限（20回）を完全撤廃",
  },
  {
    id: "pin_plus",
    name: "📌 固定枠+2",
    pt: 350,
    type: "feature",
    desc: "診断履歴の固定枠を2件追加（デフォルト2件→4件）",
    multi: !0,
  },
  {
    id: "badge_gold",
    name: "🥇 ゴールドバッジ",
    pt: 200,
    type: "badge",
    desc: "診断結果カードにゴールドバッジを表示",
  },
  {
    id: "badge_diamond",
    name: "💎 ダイヤバッジ",
    pt: 500,
    type: "badge",
    desc: "診断結果カードにダイヤモンドバッジを表示",
  },
  {
    id: "badge_retro",
    name: "👾 レトロバッジ",
    pt: 150,
    type: "badge",
    desc: "診断結果カードにレトロゲーム風バッジを表示",
  },
  {
    id: "badge_star",
    name: "🌟 スターバッジ",
    pt: 300,
    type: "badge",
    desc: "診断結果カードにスターバッジを表示",
  },
  {
    id: "badge_crown",
    name: "👑 王冠バッジ",
    pt: 800,
    type: "badge",
    desc: "ProUltraの証！ヘッダーに輝く王冠バッジを装備",
  },
  {
    id: "login_bonus_x2",
    name: "🎁 ログインボーナス追加権",
    pt: 777,
    type: "bonus",
    desc: "ログイン・連続ログインボーナスのpt獲得量が2倍に（1年間有効。記念期間中は3倍と乗算で6倍）",
  },
  {
    id: "daily_grant_pack",
    name: "🎁 毎日スキン&バッジ付与権",
    pt: 780,
    type: "bonus",
    desc: "毎日ログイン時、ミッションスキン・コインバッジ・限定バッジ・限定スキンからランダムで1つずつ付与（1年間有効）。全種コンプリートでログボ・連続ログボ・診断ボーナスが1.5倍に！",
  },
];
async function _loadPuPoints() {
  if (_currentUser && _fbDb && _isProUltra)
    try {
      const e = await _fbDb.collection("users").doc(_currentUser.uid).get(),
        t = e.exists ? e.data() : {};
      ((_puPoints = t.points || 0),
        (_puPurchases = t.purchases || []),
        (_puRankingAnon = !1 !== t.rankingAnon),
        (_loginBonusX2Expiry = t.loginBonusX2Expiry || null),
        (_grantPackExpiry = t.grantPackExpiry || null),
        (_grantPackUnlockBase = t.grantPackUnlockBase ?? null),
        (_grantPackLastDate = t.grantPackLastDate || null),
        (_grantPackComplete = t.grantPackComplete || !1),
        _puPurchases.includes(LOGIN_BONUS_X2_ID) &&
          null === _grantPackUnlockBase &&
          ((_grantPackUnlockBase = _puPoints),
          _loginBonusX2Expiry ||
            (_loginBonusX2Expiry = new Date(
              Date.now() + 31536e6,
            ).toISOString()),
          await _fbDb
            .collection("users")
            .doc(_currentUser.uid)
            .set(
              {
                grantPackUnlockBase: _grantPackUnlockBase,
                loginBonusX2Expiry: _loginBonusX2Expiry,
              },
              { merge: !0 },
            )),
        MISSION_SKINS.forEach((e) => {
          _puPurchases.includes(e.id) &&
            !PU_SKINS.find((t) => t.id === e.id) &&
            PU_SKINS.push({
              id: e.id,
              label: e.label,
              emoji: e.emoji,
              preview: e.preview,
              free: !1,
              gacha: !1,
              mission: !0,
            });
        }),
        _loadDailyMissions());
    } catch (e) {}
}
async function _addPointHistory(e, t, n) {
  if (_currentUser && _fbDb)
    try {
      const o = await _fbDb.collection("users").doc(_currentUser.uid).get(),
        i = (o.exists ? o.data() : {}).pointHistory || [];
      (i.unshift({
        label: e,
        delta: t,
        total: n,
        ts: new Date().toISOString(),
      }),
        i.length > 100 && i.splice(100),
        await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ pointHistory: i }, { merge: !0 }));
    } catch (e) {}
}
async function _savePuPoints() {
  if (_currentUser && _fbDb)
    try {
      await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .set(
          {
            points: _puPoints,
            purchases: _puPurchases,
            rankingAnon: _puRankingAnon,
          },
          { merge: !0 },
        );
    } catch (e) {}
}
async function _checkLoginBonus() {
  if (_currentUser && _fbDb && _isProUltra)
    if ("stu2105707@fuku-c.ed.jp" !== _currentUser.email)
      try {
        const e = await _fbDb.collection("users").doc(_currentUser.uid).get(),
          t = e.exists ? e.data() : {},
          n = new Date().toDateString(),
          o = t.lastLoginDate || "",
          i = t.loginStreak || 0;
        if (o === n) return;
        const a = o === new Date(Date.now() - 864e5).toDateString() ? i + 1 : 1,
          r = _currentBonusMultiplier() * (_pointDoubleEnabled ? 2 : 1);
        let s = 30 * r,
          d = 0;
        (a % 30 == 0 ? (d = 200 * r) : a % 7 == 0 && (d = 50 * r),
          (_puPoints = (t.points || 0) + s + d),
          await _fbDb
            .collection("users")
            .doc(_currentUser.uid)
            .set(
              { points: _puPoints, lastLoginDate: n, loginStreak: a },
              { merge: !0 },
            ));
        let l = `🎁 ログインボーナス +${s}pt`;
        (d > 0 && (l += `\n🔥 ${a}日連続ログイン！ +${d}pt ボーナス`),
          _showPointToast(l, _puPoints));
        const c = r > 1 ? `（×${r}倍）` : "";
        (_addPointHistory(`🎁 ログインボーナス（${a}日目）${c}`, s, _puPoints),
          d > 0 &&
            _addPointHistory(`🔥 ${a}日連続ログインボーナス${c}`, d, _puPoints),
          _runDailyGrantPack());
      } catch (e) {}
    else
      try {
        const e = await _fbDb.collection("users").doc(_currentUser.uid).get(),
          t = e.exists ? e.data() : {};
        ((t.points || 0) < 1e4
          ? ((_puPoints = 1e4),
            await _fbDb
              .collection("users")
              .doc(_currentUser.uid)
              .set({ points: 1e4 }, { merge: !0 }),
            _showPointToast("🛠️ DEV: 10000pt付与しました", 1e4))
          : (_puPoints = t.points),
          (_puPurchases = t.purchases || []));
      } catch (e) {}
}
const _ANNIV_START = new Date("2026-05-30T00:00:00+09:00"),
  _ANNIV_END = new Date("2026-06-14T23:59:59+09:00");
function _isAnnivPeriod() {
  const e = new Date();
  return e >= _ANNIV_START && e <= _ANNIV_END;
}
// 無料ガチャ（1日3回）・pt3倍ボーナス等の記念特典は全て6/14で終了
function _isAnnivGachaFreeEnabled() {
  return _isAnnivPeriod();
}
// 6/22以降はガチャで入手できないスキン（薄く表示）を非表示にする
function _isGachaOnlySkinVisible() {
  const now = new Date();
  const hideFrom = new Date("2026-06-22T00:00:00+09:00");
  return now < hideFrom;
}
// 6/15〜6/26はガチャ券購入不可期間
function _isTicketPurchaseDisabled() {
  const now = new Date();
  const from = new Date("2026-06-15T00:00:00+09:00");
  const to   = new Date("2026-06-26T23:59:59+09:00");
  return now >= from && now <= to;
}
function initAnniversaryEvent() {
  if (!_isAnnivPeriod()) return;
  // 4ヶ月記念が有効な場合（開発者先行参加含む）は3ヶ月記念を一切出さない
  if (_isAnniv4mPeriod()) return;
  const e = "anniv3m_skin_applied";
  localStorage.getItem(e) || localStorage.setItem(e, "1");
  const t = "anniv3m_banner_v1";
  sessionStorage.getItem(t) ||
    (sessionStorage.setItem(t, "1"),
    setTimeout(() => _showAnnivBanner(), 1200));
}

// ============================================================
// 4ヶ月記念イベント (2026-06-27 〜 2026-07-17)
// ============================================================
const _ANNIV4M_START = new Date("2026-06-27T00:00:00+09:00"),
  _ANNIV4M_END   = new Date("2026-07-17T23:59:59+09:00");

// 先行参加グループ ID
const _ANNIV4M_EARLY_GROUP_ID = "hpEUTp8EgYlkpXUzzNDQ";
const _ANNIV4M_EARLY_DURATION_MS = 10 * 60 * 1000; // 10分

// 先行参加を付与する（グループ参加時に呼ぶ）
function _grantAnniv4mEarlyAccess() {
  const expires = Date.now() + _ANNIV4M_EARLY_DURATION_MS;
  sessionStorage.setItem("anniv4m_early_expires", String(expires));
  _showToast("🎊 4ヶ月記念イベントに先行参加！（10分間有効）");
  // 先行参加中はイベントUIを即時表示
  setTimeout(() => {
    initAnniv4mEvent();
  }, 500);
}

// 先行参加中かどうか
function _isAnniv4mEarlyAccess() {
  const exp = parseInt(sessionStorage.getItem("anniv4m_early_expires") || "0");
  return exp > Date.now();
}

function _isAnniv4mPeriod() {
  const now = new Date();
  return (now >= _ANNIV4M_START && now <= _ANNIV4M_END) || _isAnniv4mEarlyAccess();
}

// ============================================================
// ログインボーナス（4ヶ月記念期間中、初回アクセス時にポイント付与）
// ============================================================
// 7日間ログインボーナス定義（累計ポイント増加）
const _ANNIV4M_LOGINBONUS_REWARDS = [
  { day: 1, pt: 30,  label: "Day1 ログイン",       extra: null },
  { day: 2, pt: 30,  label: "Day2 ログイン",       extra: null },
  { day: 3, pt: 50,  label: "Day3 ログイン",       extra: { type: "ticket", count: 1 } },
  { day: 4, pt: 30,  label: "Day4 ログイン",       extra: null },
  { day: 5, pt: 50,  label: "Day5 ログイン",       extra: null },
  { day: 6, pt: 30,  label: "Day6 ログイン",       extra: null },
  { day: 7, pt: 100, label: "Day7 最終ログイン",   extra: { type: "ticket", count: 2 } },
];
const _ANNIV4M_LOGINBONUS_KEY = "anniv4m_loginbonus_v2";

function _anniv4mCheckLoginBonus() {
  if (!_isAnniv4mPeriod()) return;
  const today = new Date().toISOString().slice(0, 10);
  let state;
  try { state = JSON.parse(localStorage.getItem(_ANNIV4M_LOGINBONUS_KEY) || "null"); } catch { state = null; }
  if (!state) state = { lastDate: null, day: 0, claimed: [] };
  if (state.lastDate === today) return; // 本日受取済み
  if (state.day >= 7) return; // 7日完了

  const nextDay = state.day + 1;
  const reward = _ANNIV4M_LOGINBONUS_REWARDS[nextDay - 1];
  state.lastDate = today;
  state.day = nextDay;
  state.claimed.push(nextDay);
  localStorage.setItem(_ANNIV4M_LOGINBONUS_KEY, JSON.stringify(state));

  // ポイント付与
  _puPoints = (_puPoints || 0) + reward.pt;
  _savePuPoints && _savePuPoints();

  // 追加報酬
  if (reward.extra?.type === "ticket") {
    try {
      const t = parseInt(localStorage.getItem("pu_gacha_tickets_v1") || "0") + reward.extra.count;
      localStorage.setItem("pu_gacha_tickets_v1", String(t));
    } catch {}
  }

  // トースト表示
  setTimeout(() => {
    const extraMsg = reward.extra?.type === "ticket"
      ? `\n🎟️ ガチャ券×${reward.extra.count}枚ゲット！` : "";
    _showPointToast
      ? _showPointToast(`🎁 ログボ Day${nextDay} +${reward.pt}pt${extraMsg}`, _puPoints)
      : _showToast && _showToast(`🎁 ログボ Day${nextDay} +${reward.pt}pt${extraMsg}`);
  }, 2500);

  // 7日完了時の特別メッセージ
  if (nextDay === 7) {
    setTimeout(() => _showToast && _showToast("🎊 7日間ログインボーナスコンプリート！おめでとう！"), 4000);
  }
}

// ============================================================
// 診断モード (ProUltra+ / 4ヶ月記念限定)
// "normal" | "fast" | "max"
// ============================================================
let _diagMode = "normal";

function _isProUltraPlus() {
  return _isProUltra && _isAnniv4mPeriod();
}

// 診断モード選択モーダルを開く（再診断ボタン押下時にフック）
function openDiagModeSelector(callback) {
  if (!_isProUltraPlus()) { callback("normal"); return; }
  const existing = document.getElementById("diag-mode-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "diag-mode-overlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;padding:16px;";
  overlay.innerHTML = `
    <div style="background:#0d0d1a;border:1px solid rgba(56,189,248,0.4);border-radius:24px;padding:28px 24px;max-width:360px;width:100%;position:relative;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:1.4rem;font-weight:900;color:#38bdf8;">⚡ 診断モード選択</div>
        <div style="color:#555;font-size:0.75rem;margin-top:4px;">4ヶ月記念 ProUltra+ 限定</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button onclick="_selectDiagMode('fast')" style="padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border:none;color:#fff;text-align:left;cursor:pointer;">
          <div style="font-size:1rem;font-weight:900;">⚡ 高速診断モード</div>
          <div style="font-size:0.76rem;opacity:0.85;margin-top:3px;">最速約8秒で完了。急いでいるときに。精度はやや低め。</div>
        </button>
        <button onclick="_selectDiagMode('normal')" style="padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff;text-align:left;cursor:pointer;">
          <div style="font-size:1rem;font-weight:900;">🔬 通常診断</div>
          <div style="font-size:0.76rem;opacity:0.85;margin-top:3px;">約25秒。バランスのとれた標準診断。</div>
        </button>
        <button onclick="_selectDiagMode('max')" style="padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;text-align:left;cursor:pointer;">
          <div style="font-size:1rem;font-weight:900;">👑 ProUltra Max</div>
          <div style="font-size:0.76rem;opacity:0.75;margin-top:3px;">約45秒。CPU5回計測・FPS30秒・追加5項目で超精密診断。</div>
        </button>
      </div>
      <button onclick="document.getElementById('diag-mode-overlay').remove();_diagModeCallback&&_diagModeCallback('normal');"
        style="position:absolute;top:12px;right:14px;background:none;border:none;color:#555;font-size:1.2rem;cursor:pointer;">✕</button>
    </div>`;
  document.body.appendChild(overlay);
  window._diagModeCallback = callback;
}

function _selectDiagMode(mode) {
  _diagMode = mode;
  const overlay = document.getElementById("diag-mode-overlay");
  if (overlay) overlay.remove();
  if (window._diagModeCallback) {
    window._diagModeCallback(mode);
    window._diagModeCallback = null;
  }
}

// ---------- 週替わりチャレンジ ----------
const _ANNIV4M_CHALLENGES = [
  { week: 1, start: new Date("2026-06-27T00:00:00+09:00"), end: new Date("2026-07-03T23:59:59+09:00"),
    emoji: "🌅", title: "朝イチチャレンジ", desc: "朝イチ起動直後に診断してみよう", badge: "anniv4m_badge_week1", badgeLabel: "早起き診断士" },
  { week: 2, start: new Date("2026-07-04T00:00:00+09:00"), end: new Date("2026-07-10T23:59:59+09:00"),
    emoji: "🔥", title: "高負荷チャレンジ", desc: "重いアプリを起動しながら診断してみよう", badge: "anniv4m_badge_week2", badgeLabel: "フルロード診断士" },
  { week: 3, start: new Date("2026-07-11T00:00:00+09:00"), end: new Date("2026-07-17T23:59:59+09:00"),
    emoji: "⚡", title: "充電チャレンジ", desc: "充電しながら診断してみよう", badge: "anniv4m_badge_week3", badgeLabel: "充電診断士" },
];

function _anniv4mCurrentChallenge() {
  const now = new Date();
  return _ANNIV4M_CHALLENGES.find(c => now >= c.start && now <= c.end) || null;
}

function _anniv4mChallengeCompleted(badge) {
  return localStorage.getItem(badge) === "1";
}

function _anniv4mCompleteChallenge(badge, badgeLabel) {
  if (_anniv4mChallengeCompleted(badge)) return;
  localStorage.setItem(badge, "1");
  _gachaSaveBadge && _gachaSaveBadge(badge);
  _showToast(`🏷️ バッジ「${badgeLabel}」を獲得しました！`);
  _renderAnniv4mChallenge();
}

function _renderAnniv4mChallenge() {
  const el = document.getElementById("anniv4m-challenge-card");
  if (!el) return;
  const c = _anniv4mCurrentChallenge();
  if (!c) { el.style.display = "none"; return; }
  const done = _anniv4mChallengeCompleted(c.badge);
  const daysLeft = Math.ceil((c.end - new Date()) / 864e5);
  const allBadges = _ANNIV4M_CHALLENGES.map(ch => ({
    ...ch,
    done: _anniv4mChallengeCompleted(ch.badge),
    current: ch.week === c.week
  }));
  el.innerHTML = `
    <div style="background:linear-gradient(135deg,#0a1628 0%,#0d2040 60%,#0a1020 100%);
                border:1px solid rgba(56,189,248,0.35);border-radius:16px;
                padding:14px 16px;margin:12px 0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="font-size:1.1rem;">🗓️</span>
        <span style="color:#38bdf8;font-size:0.85rem;font-weight:900;letter-spacing:0.03em;">4ヶ月記念 週替わりチャレンジ</span>
        <span style="margin-left:auto;color:#555;font-size:0.72rem;">残り${daysLeft}日</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        ${allBadges.map(b => `
          <div style="flex:1;text-align:center;padding:6px 4px;border-radius:10px;
               border:1px solid ${b.current ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.08)"};
               background:${b.done ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)"};
               opacity:${b.current || b.done ? "1" : "0.45"};">
            <div style="font-size:1.2rem;">${b.done ? "✅" : b.emoji}</div>
            <div style="color:${b.current ? "#38bdf8" : "#555"};font-size:0.6rem;margin-top:2px;font-weight:700;">Week${b.week}</div>
          </div>
        `).join("")}
      </div>
      <div style="background:rgba(56,189,248,0.07);border-radius:10px;padding:10px 12px;margin-bottom:10px;">
        <div style="color:#7dd3fc;font-size:0.8rem;font-weight:800;margin-bottom:2px;">${c.emoji} 今週のお題</div>
        <div style="color:#e2e8f0;font-size:0.82rem;line-height:1.5;">${c.desc}</div>
      </div>
      ${done
        ? `<div style="text-align:center;color:#22c55e;font-size:0.82rem;font-weight:800;padding:6px;">✅ 今週のバッジ獲得済み！</div>`
        : `<div style="display:flex;gap:8px;">
             <button onclick="_anniv4mShareAndComplete('${c.badge}','${c.badgeLabel}')"
               style="flex:1;padding:9px;border-radius:10px;
                      background:linear-gradient(135deg,#0ea5e9,#6366f1);
                      border:none;color:#fff;font-size:0.8rem;font-weight:800;cursor:pointer;">
               📤 診断してシェアする → バッジ獲得
             </button>
           </div>`
      }
    </div>`;
  el.style.display = "block";
}

function _anniv4mShareAndComplete(badge, badgeLabel) {
  const shareText = encodeURIComponent("#デバイス診断 #4ヶ月記念チャレンジ #PreciseDiag");
  window.open(`https://twitter.com/intent/tweet?text=${shareText}`, "_blank");
  setTimeout(() => _anniv4mCompleteChallenge(badge, badgeLabel), 800);
}

// ---------- スタンプラリー ----------
const _ANNIV4M_STAMP_KEY   = "anniv4m_stamps_v1";
const _ANNIV4M_REWARDS = [
  { count: 3,  key: "anniv4m_reward_3",  label: "🏷️ 参加バッジ ＋ 🎟️ ガチャ券×1", type: "badge", badgeId: "anniv4m_badge_stamp3", ticket: 1 },
  { count: 7,  key: "anniv4m_reward_7",  label: "🌌 Cosmos スキン", type: "skin",  skinId: "cosmos" },
  { count: 14, key: "anniv4m_reward_14", label: "🎟️ ガチャ券×1",     type: "ticket" },
  { count: 21, key: "anniv4m_reward_21", label: "👑 皆勤賞バッジ +200pt", type: "grand", badgeId: "anniv4m_badge_kankin" },
];

function _anniv4mGetStamps() {
  try { return JSON.parse(localStorage.getItem(_ANNIV4M_STAMP_KEY) || "[]"); }
  catch { return []; }
}

function _anniv4mTodayStr() {
  const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function _anniv4mAddStamp() {
  if (!_isAnniv4mPeriod()) return;
  const stamps = _anniv4mGetStamps();
  const today = _anniv4mTodayStr();
  if (stamps.includes(today)) return;
  stamps.push(today);
  localStorage.setItem(_ANNIV4M_STAMP_KEY, JSON.stringify(stamps));
  _anniv4mCheckRewards(stamps.length);
  _renderAnniv4mStampCard();
  _showToast(`🎫 スタンプ獲得！ (${stamps.length}/21)`);
}

function _anniv4mCheckRewards(count) {
  _ANNIV4M_REWARDS.forEach(r => {
    if (count < r.count) return;
    if (localStorage.getItem(r.key)) return;
    localStorage.setItem(r.key, "1");
    if (r.type === "badge") {
      _gachaSaveBadge && _gachaSaveBadge(r.badgeId);
      if (r.ticket) {
        try {
          const t = parseInt(localStorage.getItem("pu_gacha_tickets_v1") || "0") + r.ticket;
          localStorage.setItem("pu_gacha_tickets_v1", String(t));
        } catch {}
      }
    }
    if (r.type === "skin") {
      _gachaSaveSkin && _gachaSaveSkin(r.skinId);
      PU_SKINS.find(s => s.id === r.skinId) || PU_SKINS.push({
        id: "cosmos", label: "コスモス", emoji: "🌌",
        preview: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        free: !1, anniv4m: !0
      });
    }
    if (r.type === "ticket") {
      try {
        const t = parseInt(localStorage.getItem("pu_gacha_tickets_v1") || "0") + 1;
        localStorage.setItem("pu_gacha_tickets_v1", String(t));
      } catch {}
    }
    if (r.type === "grand") {
      _gachaSaveBadge && _gachaSaveBadge(r.badgeId);
      if (_currentUser && _fbDb && _isProUltra) {
        _fbDb.collection("users").doc(_currentUser.uid).get().then(doc => {
          const pts = ((doc.exists ? doc.data() : {}).points || 0) + 200;
          _fbDb.collection("users").doc(_currentUser.uid).set({ points: pts }, { merge: true });
          _puPoints = pts;
          _showPointToast("👑 皆勤賞ボーナス +200pt", pts);
          _addPointHistory && _addPointHistory("👑 皆勤賞（4ヶ月記念）", 200, pts);
        }).catch(() => {});
      }
    }
    setTimeout(() => _showToast(`🎉 報酬解放：${r.label}`), 400);
  });
}

function _renderAnniv4mStampCard() {
  const el = document.getElementById("anniv4m-stamp-card");
  if (!el) return;
  if (!_isAnniv4mPeriod()) { el.style.display = "none"; return; }
  const stamps = _anniv4mGetStamps();
  const count = stamps.length;
  const today = _anniv4mTodayStr();
  const gotToday = stamps.includes(today);
  const TOTAL = 21;
  const dots = Array.from({length: TOTAL}, (_, i) => {
    const filled = i < count;
    const r = _ANNIV4M_REWARDS.find(r => r.count === i+1);
    return `<div style="width:28px;height:28px;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:${r ? "0.75rem" : "0.5rem"};
              background:${filled ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)"};
              border:1px solid ${r ? "rgba(139,92,246,0.7)" : "rgba(255,255,255,0.1)"};
              color:${filled ? "#fff" : "#333"};
              position:relative;flex-shrink:0;">
              ${r ? (filled ? "✅" : r.label.split(" ")[0]) : (filled ? "★" : "·")}
           </div>`;
  }).join("");
  el.innerHTML = `
    <div style="background:linear-gradient(135deg,#0c0a1e 0%,#150f2e 60%,#0c0a1e 100%);
                border:1px solid rgba(139,92,246,0.35);border-radius:16px;
                padding:14px 16px;margin:12px 0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="font-size:1.1rem;">🎫</span>
        <span style="color:#a78bfa;font-size:0.85rem;font-weight:900;">4ヶ月記念 スタンプラリー</span>
        <span style="margin-left:auto;color:#a78bfa;font-size:0.8rem;font-weight:900;">${count} / ${TOTAL}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${dots}</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;overflow-x:auto;padding-bottom:2px;">
        ${_ANNIV4M_REWARDS.map(r => {
          const done = !!localStorage.getItem(r.key);
          return `<div style="flex-shrink:0;padding:5px 8px;border-radius:8px;text-align:center;
                       border:1px solid ${done ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"};
                       background:${done ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)"};
                       opacity:${done ? "1" : count >= r.count ? "1" : "0.45"};">
                    <div style="font-size:0.65rem;color:${done ? "#a78bfa" : "#555"};font-weight:700;">${r.count}日</div>
                    <div style="font-size:0.7rem;color:#ccc;margin-top:1px;">${r.label}</div>
                    ${done ? '<div style="font-size:0.6rem;color:#22c55e;font-weight:700;">獲得済み</div>' : ""}
                  </div>`;
        }).join("")}
      </div>
      ${gotToday
        ? `<div style="text-align:center;color:#555;font-size:0.78rem;padding:6px;">✅ 今日のスタンプは押しました</div>`
        : `<button onclick="_anniv4mAddStamp()"
             style="width:100%;padding:9px;border-radius:10px;
                    background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    border:none;color:#fff;font-size:0.82rem;font-weight:800;cursor:pointer;">
             🎫 今日のスタンプを押す
           </button>`
      }
    </div>`;
  el.style.display = "block";
}

function initAnniv4mEvent() {
  if (!_isAnniv4mPeriod()) return;

  // 🎊 4ヶ月記念バッジを自動付与（1回限り）
  const BADGE_GRANT_KEY = "anniv4m_badge_4m_granted";
  if (!localStorage.getItem(BADGE_GRANT_KEY)) {
    localStorage.setItem(BADGE_GRANT_KEY, "1");
    _gachaSaveBadge && _gachaSaveBadge("anniv4m_badge_4m");
    setTimeout(() => _showToast("🎊 4ヶ月記念バッジを獲得しました！"), 2000);
  }

  // Cosmosスキンを自動付与（イベント中は誰でも使用可能、旧スタンプ報酬は不要に）
  // PU_SKINSにanniv4m: trueで既に追加済みのため付与処理は不要

  // 🎁 ログインボーナス付与チェック
  _anniv4mCheckLoginBonus();

  // 4ヶ月記念バナーを表示（3ヶ月記念の代わりに）
  const _bannerKey = "anniv4m_banner_v1";
  sessionStorage.getItem(_bannerKey) ||
    (sessionStorage.setItem(_bannerKey, "1"),
    setTimeout(() => _showAnniv4mBanner(), 1200));

  // メインページにカードを挿入（診断結果エリアの後）
  setTimeout(() => {
    _injectAnniv4mCards();
    _renderAnniv4mStampCard();
    _renderAnniv4mChallenge();
  }, 1500);
}

function _showAnniv4mBanner() {
  if (document.getElementById("anniv4m-banner")) return;
  const daysLeft = Math.ceil((_ANNIV4M_END - new Date()) / 864e5);
  const t = document.createElement("div");
  t.id = "anniv4m-banner";
  t.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:999990;" +
    "background:linear-gradient(135deg,#0a1628 0%,#0d2040 50%,#0a1020 100%);" +
    "border-bottom:1px solid rgba(56,189,248,0.4);padding:12px 16px;" +
    "display:flex;align-items:center;gap:10px;" +
    "box-shadow:0 4px 24px rgba(56,189,248,0.2);opacity:0;transition:opacity 0.4s;";
  t.innerHTML =
    '<div style="font-size:1.4rem;flex-shrink:0;">🎊</div>' +
    '<div style="flex:1;min-width:0;">' +
      '<div style="font-size:0.88rem;font-weight:900;color:#38bdf8;letter-spacing:0.02em;">リリース4ヶ月記念！</div>' +
      '<div style="font-size:0.75rem;color:#ccc;margin-top:1px;line-height:1.5;">' +
        'スタンプラリー ＆ 週替わりチャレンジ 開催中！' +
        '<span style="color:#38bdf8;font-weight:700;"> 残り' + daysLeft + '日</span>' +
      '</div>' +
    '</div>' +
    '<button onclick="document.getElementById(&quot;anniv4m-banner&quot;).remove()"' +
      ' style="background:none;border:none;color:#666;font-size:1.1rem;cursor:pointer;padding:4px;line-height:1;">✕</button>';
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = "1"; });
}

function _injectAnniv4mCards() {
  if (document.getElementById("anniv4m-stamp-card")) return;

  // 挿入先を探す（再診断ボタンの親要素付近）
  const anchor =
    document.querySelector("#re-diag-btn")?.parentElement ||
    document.querySelector(".result-section") ||
    document.querySelector("#result-area") ||
    document.body;

  const wrapper = document.createElement("div");
  wrapper.id = "anniv4m-event-wrap";

  const stampDiv = document.createElement("div");
  stampDiv.id = "anniv4m-stamp-card";

  const challengeDiv = document.createElement("div");
  challengeDiv.id = "anniv4m-challenge-card";

  wrapper.appendChild(stampDiv);
  wrapper.appendChild(challengeDiv);

  // bodyの末尾に追加（固定UIの手前）
  document.body.appendChild(wrapper);
}
function _showAnnivBanner() {
  if (document.getElementById("anniv-banner")) return;
  const e = Math.ceil((_ANNIV_END - new Date()) / 864e5),
    t = document.createElement("div");
  ((t.id = "anniv-banner"),
    (t.style.cssText =
      "\n        position:fixed;top:0;left:0;right:0;z-index:999990;\n        background:linear-gradient(135deg,#1a0015 0%,#200020 50%,#1a1000 100%);\n        border-bottom:1px solid rgba(255,110,180,0.4);\n        padding:12px 16px;display:flex;align-items:center;gap:10px;\n        box-shadow:0 4px 24px rgba(255,110,180,0.2);\n        opacity:0;transition:opacity 0.4s;\n    "),
    (t.innerHTML = `\n        <div style="font-size:1.4rem;flex-shrink:0;">🎂</div>\n        <div style="flex:1;min-width:0;">\n            <div style="font-size:0.88rem;font-weight:900;color:#ff6eb4;letter-spacing:0.02em;">\n                リリース3ヶ月記念！\n            </div>\n            <div style="font-size:0.75rem;color:#ccc;margin-top:1px;line-height:1.5;">\n                期間限定スキン「🎉 Celebration」を全員解放 ＆ ProUltra診断ポイント3倍！\n                <span style="color:#ff6eb4;font-weight:700;">残り${e}日</span>\n            </div>\n        </div>\n        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">\n            <button onclick="_applyAnnivSkin()"\n                style="background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;border-radius:10px;\n                       padding:7px 12px;font-size:0.75rem;font-weight:800;color:#1a0015;cursor:pointer;white-space:nowrap;">\n                スキン適用\n            </button>\n            <button onclick="document.getElementById('anniv-banner').remove()"\n                style="background:none;border:none;color:#666;font-size:1.1rem;cursor:pointer;padding:4px;line-height:1;">✕</button>\n        </div>\n    `),
    document.body.appendChild(t),
    requestAnimationFrame(() => {
      t.style.opacity = "1";
    }));
}
function _applyAnnivSkin() {
  (document.body.setAttribute("data-pu-skin", "celebration"),
    localStorage.setItem("anniv3m_skin_active", "1"),
    _showToast("🎉 Celebrationスキンを適用しました！"),
    document.getElementById("anniv-banner")?.remove());
}
function _restoreAnnivSkin() {
  _isAnnivPeriod() &&
    localStorage.getItem("anniv3m_skin_active") &&
    document.body.setAttribute("data-pu-skin", "celebration");
}
function _checkBestScoreMission(e) {
  try {
    const t = JSON.parse(localStorage.getItem("diag_history") || "[]").slice(1);
    e > (t.length > 0 ? Math.max(...t.map((e) => e.totalScore || 0)) : 0) &&
      _progressMission("best_score");
  } catch (e) {}
}
async function addDiagPoints() {
  if (_currentUser && _fbDb && _isProUltra)
    try {
      const e = await _fbDb.collection("users").doc(_currentUser.uid).get(),
        t = e.exists ? e.data() : {},
        n = "stu2105707@fuku-c.ed.jp" === _currentUser.email,
        o = (_pointDoubleEnabled ? 2 : 1) * _currentBonusMultiplier(),
        i = n ? 1e4 : 5,
        a = Math.round(i * o);
      ((_puPoints = (t.points || 0) + a),
        await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ points: _puPoints }, { merge: !0 }));
      const r = n
        ? ` (テスト用${o > 1 ? " × " + o + "倍" : ""})`
        : o > 1
          ? ` (× ${o}倍中!)`
          : "";
      (_showPointToast("⚡ 診断ボーナス +" + a + "pt" + r, _puPoints),
        _addPointHistory("⚡ 診断ボーナス" + r, a, _puPoints));
    } catch (e) {}
}
function _showPointToast(e, t) {
  const n = document.createElement("div");
  ((n.style.cssText =
    "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1c1c1e;color:#fff;padding:14px 24px;border-radius:20px;font-size:0.9rem;font-weight:700;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #f59e0b;z-index:999999;opacity:0;transition:opacity 0.3s;white-space:pre-line;text-align:center;"),
    (n.innerHTML =
      e +
      '<br><span style="color:#f59e0b;font-size:0.8rem;">合計: ' +
      t +
      "pt</span>"),
    document.body.appendChild(n),
    requestAnimationFrame(() => {
      n.style.opacity = "1";
    }),
    setTimeout(() => {
      ((n.style.opacity = "0"),
        setTimeout(() => {
          document.body.contains(n) && document.body.removeChild(n);
        }, 300));
    }, 3500));
}
async function openPointHistory() {
  const e = document.getElementById("point-history-overlay");
  if (e) return void e.remove();
  const t = document.createElement("div");
  ((t.id = "point-history-overlay"),
    (t.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;"),
    (t.innerHTML =
      '<div style="background:#111;border:1px solid #f59e0b44;border-radius:20px;width:100%;max-width:420px;max-height:85vh;overflow-y:auto;padding:24px;">\n        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">\n            <div style="color:#f59e0b;font-size:1.1rem;font-weight:900;">📋 ポイント履歴</div>\n            <button onclick="document.getElementById(\'point-history-overlay\').remove()" style="background:#333;border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:1rem;cursor:pointer;">✕</button>\n        </div>\n        <div id="point-history-list" style="color:#888;font-size:0.85rem;">読み込み中...</div>\n    </div>'),
    document.body.appendChild(t));
  try {
    const e = await _fbDb.collection("users").doc(_currentUser.uid).get(),
      t = (e.exists ? e.data() : {}).pointHistory || [],
      n = document.getElementById("point-history-list");
    if (!n) return;
    if (0 === t.length)
      return void (n.innerHTML =
        '<div style="text-align:center;padding:20px;color:#555;">履歴がまだありません</div>');
    n.innerHTML = t
      .map((e) => {
        const t = e.delta >= 0,
          n = new Date(e.ts),
          o = `${n.getMonth() + 1}/${n.getDate()} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1e1e1e;">\n                <div>\n                    <div style="color:#fff;font-size:0.87rem;font-weight:700;">${e.label}</div>\n                    <div style="color:#555;font-size:0.72rem;margin-top:2px;">${o}　合計: ${e.total}pt</div>\n                </div>\n                <div style="color:${t ? "#22c55e" : "#ef4444"};font-weight:900;font-size:0.95rem;min-width:70px;text-align:right;">${t ? "+" : ""}${e.delta}pt</div>\n            </div>`;
      })
      .join("");
  } catch (e) {
    const t = document.getElementById("point-history-list");
    t &&
      (t.innerHTML =
        '<div style="color:#ef4444;">読み込みに失敗しました</div>');
  }
}
function openPuShop() {
  _progressMission("open_shop");
  let e = document.getElementById("pu-shop-modal");
  e ||
    ((e = document.createElement("div")),
    (e.id = "pu-shop-modal"),
    (e.style.cssText =
      "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;align-items:center;justify-content:center;"),
    document.body.appendChild(e),
    (e.onclick = (t) => {
      t.target === e && closePuShop();
    }));
  const t = _puRankingAnon
      ? "匿名（ユーザー#****）"
      : _currentUser?.displayName || "あなたの名前",
    n = PU_SHOP_ITEMS.map((e) => {
      if (e.id === DAILY_GRANT_PACK_ID) {
        if (!_puPurchases.includes(LOGIN_BONUS_X2_ID)) return "";
        const t = _grantPackUnlockBase;
        if (null === t) return "";
        if (
          !_puPurchases.includes(DAILY_GRANT_PACK_ID) &&
          _puPoints < t + DAILY_GRANT_PACK_UNLOCK_DELTA
        ) {
          const n = t + DAILY_GRANT_PACK_UNLOCK_DELTA - _puPoints;
          return `<div style="background:#1a1a1a;border:1px solid #33333388;border-radius:14px;padding:14px;margin-bottom:10px;opacity:0.6;">\n                    <div style="display:flex;justify-content:space-between;align-items:center;">\n                        <div>\n                            <div style="font-weight:800;font-size:0.95rem;color:#888;">${e.name}</div>\n                            <div style="color:#666;font-size:0.78rem;margin-top:3px;">${e.desc}</div>\n                        </div>\n                        <div style="text-align:right;min-width:90px;">\n                            <div style="color:#666;font-size:0.75rem;">🔒 あと${n}pt</div>\n                        </div>\n                    </div>\n                </div>`;
        }
      }
      const t = _puPurchases.includes(e.id),
        n = e.multi ? _puPurchases.filter((t) => t === e.id).length : t ? 1 : 0,
        o = !e.multi && t,
        _ticketBlocked = e.type === "gacha" && _isTicketPurchaseDisabled(),
        i = !o && _puPoints >= e.pt && !_ticketBlocked,
        a =
          e.multi && n > 0
            ? `<span style="color:#f59e0b;font-size:0.72rem;font-weight:800;">所持: ${n}枚</span><br>`
            : "";
      return `<div style="background:#1a1a1a;border:1px solid ${o ? "#f59e0b44" : "#333"};border-radius:14px;padding:14px;margin-bottom:10px;">\n            <div style="display:flex;justify-content:space-between;align-items:center;">\n                <div>\n                    <div style="font-weight:800;font-size:0.95rem;color:#fff;">${e.name}</div>\n                    <div style="color:#888;font-size:0.78rem;margin-top:3px;">${e.desc}</div>\n                </div>\n                <div style="text-align:right;min-width:80px;">\n                    ${o ? '<span style="color:#f59e0b;font-weight:800;font-size:0.82rem;">✓ 取得済み</span>' : `${a}<div style="color:#f59e0b;font-weight:800;font-size:0.9rem;">${e.pt}pt</div>\n                           ${_ticketBlocked ? '<div style="color:#ef4444;font-size:0.72rem;font-weight:800;margin-top:4px;">🚫 現在購入停止中</div>' : `<button onclick="buyPuItem('${e.id}')" ${i ? "" : "disabled"} style="margin-top:4px;padding:5px 12px;border-radius:10px;background:${i ? "#f59e0b" : "#333"};color:${i ? "#000" : "#666"};border:none;font-size:0.78rem;font-weight:800;cursor:${i ? "pointer" : "default"};">購入</button>`}`}\n                </div>\n            </div>\n        </div>`;
    }).join("");
  var o;
  ((e.innerHTML = `<div style="background:#111;border-radius:20px;padding:24px;width:90%;max-width:420px;max-height:85vh;overflow-y:auto;">\n        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">\n            <div style="font-size:1.1rem;font-weight:800;color:#fff;">🪙 ポイントショップ</div>\n            <button onclick="closePuShop()" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:1rem;cursor:pointer;">✕</button>\n        </div>\n        <div style="background:linear-gradient(135deg,#f59e0b22,#f9731622);border:1px solid #f59e0b44;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;">\n            <div>\n                <div style="color:#f59e0b;font-size:0.8rem;font-weight:700;">現在の所持ポイント</div>\n                <div style="color:#fff;font-size:1.6rem;font-weight:900;" id="shop-pt-display">${_puPoints} pt</div>\n                <button onclick="openPointHistory()" style="margin-top:6px;padding:4px 10px;border-radius:8px;background:#1e1e1e;border:1px solid #f59e0b44;color:#f59e0b;font-size:0.72rem;font-weight:700;cursor:pointer;">📋 ポイント履歴</button>\n            </div>\n            <div style="text-align:right;">\n                <div style="color:#888;font-size:0.72rem;">ランキング表示名</div>\n                <div style="color:#ccc;font-size:0.78rem;margin-top:2px;">${t}</div>\n                <button onclick="toggleRankingAnon()" style="margin-top:4px;padding:4px 10px;border-radius:8px;background:#333;border:none;color:#aaa;font-size:0.72rem;cursor:pointer;">${_puRankingAnon ? "名前を表示する" : "匿名にする"}</button>\n            </div>\n        </div>\n        ${(function () {
    const e = _pointDoubleEnabled,
      t = _isAnnivPeriod();
    return e && t
      ? '<div style="background:linear-gradient(135deg,#1a1200,#150010);border:1px solid #ff6eb488;border-radius:12px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;"><span style="color:#ff6eb4;font-weight:800;font-size:0.82rem;">🎂⚡ pt6倍モード 発動中！</span><span style="color:#888;font-size:0.76rem;">2倍モード × 3倍記念 = 6倍！</span></div>'
      : t
        ? '<div style="background:#150010;border:1px solid #ff6eb444;border-radius:12px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;"><span style="color:#ff6eb4;font-weight:800;font-size:0.82rem;">🎂 pt3倍 記念モード発動中！</span><span style="color:#888;font-size:0.76rem;">リリース3ヶ月記念でボーナス3倍</span></div>'
        : e
          ? '<div style="background:#1a1200;border:1px solid #f59e0b44;border-radius:12px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;gap:8px;"><span style="color:#f59e0b;font-weight:800;font-size:0.82rem;">⚡ pt2倍モード 発動中！</span><span style="color:#888;font-size:0.76rem;">ログイン・診断ボーナスが2倍</span></div>'
          : "";
  })()}\n        ${_colorCustomEnabled ? `<div style="background:#0d0d2e;border:1px solid #6366f144;border-radius:12px;padding:12px 14px;margin-bottom:10px;">\n            <div style="color:#818cf8;font-size:0.78rem;font-weight:800;margin-bottom:8px;">🌈 診断カラーカスタム（隠し特典）</div>\n            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">\n                <label style="color:#ccc;font-size:0.75rem;">OK:</label>\n                <input type="color" value="${localStorage.getItem("custom_ok_color") || "#007aff"}" onchange="_setCustomColor('ok',this.value)" style="width:30px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;">\n                <label style="color:#ccc;font-size:0.75rem;">警告:</label>\n                <input type="color" value="${localStorage.getItem("custom_warn_color") || "#ffcc00"}" onchange="_setCustomColor('warn',this.value)" style="width:30px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;">\n                <label style="color:#ccc;font-size:0.75rem;">エラー:</label>\n                <input type="color" value="${localStorage.getItem("custom_bad_color") || "#ff3b30"}" onchange="_setCustomColor('bad',this.value)" style="width:30px;height:24px;border:none;border-radius:6px;cursor:pointer;padding:0;">\n                <button onclick="_resetCustomColors()" style="padding:4px 10px;border-radius:8px;background:#333;border:none;color:#aaa;font-size:0.72rem;cursor:pointer;">リセット</button>\n            </div>\n        </div>` : ""}\n        <div style="background:#1a1a1a;border-radius:12px;padding:12px 14px;margin-bottom:14px;border:1px solid #2a2a2a;">\n            <div style="color:#f59e0b;font-size:0.78rem;font-weight:800;margin-bottom:8px;">🪙 ポイント獲得方法</div>\n            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">\n                <div style="color:#ccc;font-size:0.76rem;">🎁 毎日ログイン</div><div style="color:#fff;font-size:0.76rem;font-weight:700;">+30pt</div>\n                <div style="color:#ccc;font-size:0.76rem;">⚡ 診断完了ごと</div><div style="color:#fff;font-size:0.76rem;font-weight:700;">+5pt</div>\n                <div style="color:#ccc;font-size:0.76rem;">🔥 7日連続ログイン</div><div style="color:#fff;font-size:0.76rem;font-weight:700;">+50pt ボーナス</div>\n                <div style="color:#ccc;font-size:0.76rem;">📅 30日連続ログイン</div><div style="color:#fff;font-size:0.76rem;font-weight:700;">+200pt ボーナス</div>\n            </div>\n            <div style="color:#555;font-size:0.72rem;margin-top:8px;">※ ログインボーナスは1日1回のみ付与されます</div>\n        </div>\n        ${n}\n        ${_buildDailyMissionHTML()}\n        ${((o = []), _puPurchases.includes("hidden_legend") && o.push('<div style="background:#1a1200;border:1px solid #f59e0b55;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;justify-content:space-between;"><b style="color:#ffd700;">👑 伝説スキン</b><span style="color:#f59e0b;font-weight:800;">✓ 解放済み</span></div>'), _puPurchases.includes("hidden_custom") && o.push('<div style="background:#0d0020;border:1px solid #6366f155;border-radius:10px;padding:10px 14px;margin-bottom:6px;display:flex;justify-content:space-between;"><b style="color:#00ff88;">🌈 カラーカスタム</b><span style="color:#34c759;font-weight:800;">✓ 解放済み</span></div>'), _puPurchases.includes("hidden_2x") && o.push('<div style="background:#1a1200;border:1px solid #f59e0b55;border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;"><b style="color:#f59e0b;">⚡ pt2倍モード</b><span style="color:#f59e0b;font-weight:800;">✓ 解放済み</span></div>'), _puPurchases.includes("hidden_particle_diag") && o.push('<div style="background:#1a0030;border:1px solid #a78bfa55;border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;"><b style="color:#a78bfa;">✨ サクサク度診断</b><button onclick="openParticleDiag()" style="background:linear-gradient(135deg,#a78bfa,#7c3aed);border:none;color:#fff;font-size:0.75rem;font-weight:800;padding:4px 10px;border-radius:8px;cursor:pointer;">開く</button></div>'), o.length ? '<div style="margin-top:10px;background:#111;border:1px solid #f59e0b66;border-radius:14px;padding:14px;"><div style="color:#ffd700;font-weight:900;margin-bottom:8px;">🎉 隠し特典（解放済み）</div>' + o.join("") + "</div>" : "")}\n    </div>`),
    (e.style.display = "flex"));
}
function closePuShop() {
  const e = document.getElementById("pu-shop-modal");
  e && (e.style.display = "none");
}
async function buyPuItem(e) {
  const t = PU_SHOP_ITEMS.find((t) => t.id === e);
  if (t && (t.multi || !_puPurchases.includes(e)) && !(_puPoints < t.pt)) {
    if (e === DAILY_GRANT_PACK_ID) {
      if (null === _grantPackUnlockBase)
        return void _showToast(
          "🔒 「ログインボーナス追加権」を先に購入してください",
        );
      if (_puPoints < _grantPackUnlockBase + DAILY_GRANT_PACK_UNLOCK_DELTA) {
        return void _showToast(
          `🔒 あと${_grantPackUnlockBase + DAILY_GRANT_PACK_UNLOCK_DELTA - _puPoints}pt貯めると購入できます`,
        );
      }
    }
    confirm(`「${t.name}」を ${t.pt}pt で交換しますか？`) &&
      ((_puPoints -= t.pt),
      _puPurchases.push(e),
      await _savePuPoints(),
      _addPointHistory(`🛒 ${t.name}を購入`, -t.pt, _puPoints),
      _applyPuPurchase(e),
      openPuShop(),
      _showPointToast(`✅ 「${t.name}」を取得しました！`, _puPoints));
  }
}
async function toggleRankingAnon() {
  ((_puRankingAnon = !_puRankingAnon), await _savePuPoints(), openPuShop());
}
function _applyPuPurchase(e, t) {
  if (
    ("skin_neon" === e && (t || applyPuSkin("neon", !0)),
    "skin_sakura" === e && (t || applyPuSkin("sakura", !0)),
    "skin_midnight" === e && (t || applyPuSkin("midnight", !0)),
    "history_plus" === e &&
      ((_maxHistory = 30),
      t || alert("✅ 診断履歴の保存上限が30件になりました！")),
    "ai_pro" === e &&
      ((_aiProEnabled = !0),
      t || alert("✅ AIコメント強化版が有効になりました！")),
    "ranking_weekly" === e &&
      ((_rankingEnabled = !0),
      t ||
        alert(
          "✅ 週間ランキング参加権が有効になりました！ランキングボタンから参加できます。",
        )),
    "best_badge" === e &&
      ((_bestBadgeEnabled = !0),
      t ||
        alert(
          "✅ 自己ベスト記録バッジが有効になりました！次回スコア更新時に演出が表示されます。",
        )),
    "avg_report" === e &&
      ((_avgReportEnabled = !0),
      t ||
        alert(
          "✅ スコア平均レポートが有効になりました！履歴画面で直近5回の統計が表示されます。",
        )),
    e.startsWith("badge_") &&
      (t ||
        alert(
          "✅ バッジを入手しました！ショップのバッジ管理から装備できます。",
        )),
    e === LOGIN_BONUS_X2_ID)
  ) {
    const e = new Date(Date.now() + 31536e6).toISOString();
    ((_loginBonusX2Expiry = e),
      (_grantPackUnlockBase = _puPoints),
      _fbDb &&
        _currentUser &&
        _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set(
            { loginBonusX2Expiry: e, grantPackUnlockBase: _puPoints },
            { merge: !0 },
          ),
      alert(
        "🎁 ログインボーナス追加権を獲得！ログイン・連続ログインボーナスが2倍になります（1年間有効）。",
      ));
  }
  if (e === DAILY_GRANT_PACK_ID) {
    const e = new Date(Date.now() + 31536e6).toISOString();
    ((_grantPackExpiry = e),
      _fbDb &&
        _currentUser &&
        _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ grantPackExpiry: e }, { merge: !0 }),
      alert(
        "🎁 毎日スキン&バッジ付与権を獲得！次回ログインから毎日ランダム付与が始まります（1年間有効）。",
      ));
  }
  (_checkDailyGrantPackComplete(), _checkAllPurchased());
}
async function _openWeeklyRanking() {
  if ((_progressMission("open_ranking"), !_rankingEnabled))
    return void alert(
      "週間ランキングはポイントショップで参加権を購入してください（1000pt）",
    );
  let e = document.getElementById("ranking-modal");
  (e ||
    ((e = document.createElement("div")),
    (e.id = "ranking-modal"),
    (e.style.cssText =
      "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10000;align-items:center;justify-content:center;"),
    document.body.appendChild(e),
    (e.onclick = (t) => {
      t.target === e && (e.style.display = "none");
    })),
    (e.innerHTML =
      '<div style="background:#111;border-radius:20px;padding:24px;width:90%;max-width:420px;max-height:80vh;overflow-y:auto;">\n        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">\n            <div style="font-size:1.1rem;font-weight:800;color:#fff;">🏆 週間ランキング</div>\n            <button onclick="document.getElementById(\'ranking-modal\').style.display=\'none\'" style="background:#333;border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;">✕</button>\n        </div>\n        <div id="ranking-list" style="color:#888;text-align:center;padding:20px;">読み込み中...</div>\n    </div>'),
    (e.style.display = "flex"));
  try {
    if (!_fbDb) throw new Error("DB未接続");
    const e = new Date(),
      t = new Date(e);
    (t.setDate(e.getDate() - ((e.getDay() + 6) % 7)), t.setHours(0, 0, 0, 0));
    const n = t.toISOString().slice(0, 10);
    if (_currentUser && diag && diag.totalScore) {
      const e =
        void 0 !== _puRankingAnon && _puRankingAnon
          ? "ユーザー#" + _currentUser.uid.slice(-4).toUpperCase()
          : _currentUser.displayName || "ユーザー";
      await _fbDb
        .collection("weekly_ranking")
        .doc(_currentUser.uid)
        .set(
          {
            name: e,
            score: diag.totalScore || 0,
            rank: document.getElementById("rank-letter")?.textContent || "-",
            weekStart: n,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: !0 },
        );
    }
    let o;
    try {
      ((o = await _fbDb
        .collection("weekly_ranking")
        .where("weekStart", "==", n)
        .limit(50)
        .get()),
        console.log("✅ weekStart クエリ成功:", n, "件数:", o.docs.length));
    } catch (e) {
      (console.warn(
        "⚠️ weekStart クエリ失敗（インデックス未作成）:",
        e.message,
      ),
        (o = await _fbDb.collection("weekly_ranking").limit(100).get()),
        console.log("📊 全データ取得:", o.docs.length, "件"));
    }
    const i = document.getElementById("ranking-list");
    if (!i) return;
    const a = o.docs
      .map((e) => ({ id: e.id, ...e.data() }))
      .filter((e) => e.weekStart === n)
      .sort((e, t) => (t.score || 0) - (e.score || 0));
    if (
      (console.log(
        "🏆 今週のランキング:",
        a.length,
        "件",
        "(weekStart:",
        n,
        ")",
      ),
      0 === a.length)
    )
      return (
        console.warn("❌ ランキングデータなし"),
        void (i.innerHTML =
          '<div style="color:#888;padding:20px;">まだ誰もいません。診断してランキングに参加しよう！</div>')
      );
    const r = ["🥇", "🥈", "🥉"];
    i.innerHTML = a
      .map((e, t) => {
        const n = e.id === _currentUser?.uid;
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px ${n ? "8" : "0"}px;border-bottom:1px solid #222;${n ? "background:rgba(245,158,11,0.08);border-radius:8px;" : ""}">\n                <div style="font-size:1.1rem;min-width:28px;text-align:center;">${r[t] || t + 1 + "位"}</div>\n                <div style="flex:1;"><div style="color:${n ? "#f59e0b" : "#fff"};font-weight:700;font-size:0.9rem;">${e.name}${n ? " （あなた）" : ""}</div><div style="color:#888;font-size:0.78rem;">ランク: ${e.rank}</div></div>\n                <div style="color:#fff;font-weight:800;">${e.score}点</div>\n            </div>`;
      })
      .join("");
  } catch (e) {
    const t = document.getElementById("ranking-list");
    t &&
      (t.innerHTML =
        '<div style="color:#f87171;">読み込みに失敗しました<br><small>' +
        e.message +
        "</small></div>");
  }
}
function openWeeklyRankingModal() {
  _openWeeklyRanking();
}
function _applyAllPuPurchases() {
  // ガチャスキン全取得済みで hidden_particle_diag 未取得なら即付与（既存購入者救済）
  const _pool = PU_SKINS.filter((e) => e.gacha);
  const _unlocked = _gachaUnlockedSkins ? _gachaUnlockedSkins() : [];
  if (_pool.length > 0 && _pool.every((s) => _unlocked.includes(s.id)) && !_puPurchases.includes("hidden_particle_diag")) {
    _puPurchases.push("hidden_particle_diag");
    _particleDiagEnabled = true;
    _savePuPoints && _savePuPoints();
  }
  (_puPurchases.includes("history_plus") && (_maxHistory = 30),
    _puPurchases.includes("ai_pro") && (_aiProEnabled = !0),
    _puPurchases.includes("ranking_weekly") && (_rankingEnabled = !0),
    _puPurchases.includes("hidden_legend") && (_legendSkinUnlocked = !0),
    _puPurchases.includes("hidden_custom") && (_colorCustomEnabled = !0),
    _puPurchases.includes("hidden_2x") && (_pointDoubleEnabled = !0),
    _puPurchases.includes("best_badge") && (_bestBadgeEnabled = !0),
    _puPurchases.includes("avg_report") && (_avgReportEnabled = !0),
    _puPurchases.includes("hidden_particle_diag") &&
      (_particleDiagEnabled = !0),
    _colorCustomEnabled && _applyCustomColors(),
    setTimeout(_renderHeaderBadge, 100));
  const e = document.getElementById("particle-diag-btn");
  e && (e.style.display = _particleDiagEnabled ? "block" : "none");
}
let _maxHistory = 10,
  _aiProEnabled = !1,
  _legendSkinUnlocked = !1,
  _colorCustomEnabled = !1,
  _pointDoubleEnabled = !1,
  _rankingEnabled = !1,
  _bestBadgeEnabled = !1,
  _avgReportEnabled = !1,
  _particleDiagEnabled = !1,
  _aiUnlimited = !1;
const AI_DAILY_LIMIT = 20;
function _getAIDailyCount() {
  const e = _todayStr();
  try {
    return JSON.parse(localStorage.getItem("ai_daily_count") || "{}")[e] || 0;
  } catch (e) {
    return 0;
  }
}
function _incAIDailyCount() {
  const e = _todayStr();
  try {
    const t = JSON.parse(localStorage.getItem("ai_daily_count") || "{}");
    ((t[e] = (t[e] || 0) + 1),
      localStorage.setItem("ai_daily_count", JSON.stringify(t)));
  } catch (e) {}
}
function _checkAllPurchased() {
  if (!PU_SHOP_ITEMS.map((e) => e.id).every((e) => _puPurchases.includes(e)))
    return;
  if (
    _puPurchases.includes("hidden_legend") &&
    _puPurchases.includes("hidden_custom") &&
    _puPurchases.includes("hidden_2x")
  )
    return;
  const e = ["hidden_legend", "hidden_custom", "hidden_2x"].filter(
    (e) => !_puPurchases.includes(e),
  );
  0 !== e.length &&
    (e.forEach((e) => _puPurchases.push(e)),
    _savePuPoints(),
    _applyAllPuPurchases(),
    setTimeout(() => {
      const e = document.createElement("div");
      ((e.style.cssText =
        "position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:999999;display:flex;align-items:center;justify-content:center;"),
        (e.innerHTML =
          '<div style="text-align:center;padding:32px;max-width:380px;">\n            <div style="font-size:3rem;margin-bottom:12px;">🎉</div>\n            <div style="color:#ffd700;font-size:1.4rem;font-weight:900;margin-bottom:8px;">隠し特典解放！</div>\n            <div style="color:#fff;font-size:0.9rem;margin-bottom:20px;line-height:1.8;">\n                全アイテム購入達成！<br>\n                <span style="color:#ffd700;">👑 伝説スキン</span>・\n                <span style="color:#00ff88;">🌈 カラーカスタム</span>・\n                <span style="color:#f59e0b;">⚡ pt2倍モード</span><br>\n                が解放されました！\n            </div>\n            <button onclick="this.closest(\'div[style*=fixed]\').remove();openPuShop();" style="padding:12px 32px;border-radius:14px;background:linear-gradient(135deg,#ffd700,#f97316);border:none;color:#000;font-weight:900;font-size:1rem;cursor:pointer;">✨ 受け取る</button>\n        </div>'),
        document.body.appendChild(e));
    }, 500));
}
function _setCustomColor(e, t) {
  _colorCustomEnabled &&
    (localStorage.setItem("custom_" + e + "_color", t), _applyCustomColors());
}
function _resetCustomColors() {
  (["ok", "warn", "bad"].forEach((e) =>
    localStorage.removeItem("custom_" + e + "_color"),
  ),
    _applyCustomColors(),
    openPuShop());
}
function _applyCustomColors() {
  const e = localStorage.getItem("custom_ok_color") || null,
    t = localStorage.getItem("custom_warn_color") || null,
    n = localStorage.getItem("custom_bad_color") || null,
    o = document.documentElement;
  (e
    ? (o.style.setProperty("--st-ok", e),
      o.style.setProperty("--st-ok-bg", e + "20"))
    : (o.style.removeProperty("--st-ok"), o.style.removeProperty("--st-ok-bg")),
    t
      ? (o.style.setProperty("--st-warn", t),
        o.style.setProperty("--st-warn-bg", t + "20"))
      : (o.style.removeProperty("--st-warn"),
        o.style.removeProperty("--st-warn-bg")),
    n
      ? (o.style.setProperty("--st-bad", n),
        o.style.setProperty("--st-bad-bg", n + "20"))
      : (o.style.removeProperty("--st-bad"),
        o.style.removeProperty("--st-bad-bg")));
}
function _onPlanReady() {
  const e = document.getElementById("notif-btn");
  (e && (e.style.display = _isProUltra ? "flex" : "none"),
    _isProUltra
      ? (loadNotifications(),
        loadPuSkin(),
        _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .collection("passkeys")
          .get()
          .then((e) => {
            const t = document.getElementById("propass-register-btn");
            t &&
              (t.style.display =
                e.empty && window.PublicKeyCredential ? "block" : "none");
          })
          .catch(() => {}),
        _loadPuPoints().then(() => {
          (_applyAllPuPurchases(),
            _checkAllPurchased(),
            _checkLoginBonus(),
            _showPromoCodeBanner());
          const e = document.getElementById("ranking-btn");
          e && _rankingEnabled && (e.style.display = "flex");
        }))
      : document.body.removeAttribute("data-pu-skin"));
  const t = document.getElementById("pu-header-badge");
  (t && (t.style.display = _isProUltra ? "inline-block" : "none"),
    [35, 36, 37].forEach(function (e) {
      const t = document.getElementById("row-" + e);
      t && (t.style.display = _isProUltra ? "" : "none");
    }));
  const n = document.getElementById("settings-modal");
  n && "none" !== n.style.display && openSettings();
}
let _notifications = [];
const NOTIF_KEY = "pu_notifs_read_v1";
async function loadNotifications() {
  if (_isProUltra && _fbDb) {
    try {
      const e = await _fbDb
          .collection("notifications")
          .orderBy("createdAt", "desc")
          .limit(30)
          .get(),
        t = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
      _notifications = e.docs.map((e) => {
        const n = e.data();
        return {
          id: e.id,
          type: n.type || "info",
          title: n.title || "",
          body: n.body || "",
          date: n.createdAt
            ? new Date(n.createdAt.toDate()).toLocaleDateString("ja-JP")
            : "",
          read: t.includes(e.id),
        };
      });
    } catch (e) {
      const t = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
      _notifications = [
        {
          id: "demo_update",
          type: "update",
          title: "🚀 Release 1.0.5.2 リリース！",
          body: "バックグラウンドプッシュ通知対応・デバイス機種手動設定機能を追加",
          date: "2026/3/26",
          read: t.includes("demo_update"),
        },
        {
          id: "demo_security",
          type: "security",
          title: "ProUltraアカウントにログインできるようになりました",
          body: "今まで通りサインインできます。",
          date: "2026/3/26",
          read: t.includes("demo_security"),
        },
      ];
    }
    _updateNotifBadge();
  }
}
function _updateNotifBadge() {
  const e = document.getElementById("notif-badge");
  if (!e) return;
  const t = _notifications.filter((e) => !e.read).length;
  t > 0
    ? ((e.textContent = t > 9 ? "9+" : String(t)), (e.style.display = "block"))
    : (e.style.display = "none");
}
function toggleNotifCenter() {
  const e = document.getElementById("notif-modal");
  if (!e) return;
  "none" !== e.style.display && "" !== e.style.display
    ? closeNotifCenter()
    : openNotifCenter();
}
function openNotifCenter() {
  if (!_isProUltra) return;
  const e = document.getElementById("notif-modal"),
    t = document.getElementById("notif-list");
  if (!e || !t) return;
  const n =
    '<div onclick="openUpdateFromNotif(\'_fixed_v2\')" style="padding:14px 18px;border-bottom:1px solid #2a2a2a;cursor:pointer;background:rgba(99,102,241,0.06);display:flex;align-items:center;gap:10px;">\n        <span style="font-size:1.1rem;flex-shrink:0;">🚀</span>\n        <div style="flex:1;min-width:0;">\n            <div style="color:#fff;font-size:0.88rem;font-weight:700;margin-bottom:2px;">Release 1.2.3.7 アップデート情報</div>\n            <div style="color:#6366f1;font-size:0.77rem;font-weight:700;">▶ タップして確認する</div>\n        </div>\n    </div>';
  0 === _notifications.length
    ? (t.innerHTML =
        n +
        '<p style="color:#555;text-align:center;padding:24px;font-size:0.85rem;">その他の通知はありません</p>')
    : (t.innerHTML =
        n +
        _notifications
          .map((e) => {
            const t =
                { update: "🚀", security: "🔐", info: "ℹ️" }[e.type] || "ℹ️",
              n = "update" === e.type;
            return `<div data-notif-id="${e.id}" style="padding:14px 18px;border-bottom:1px solid #1e1e1e;cursor:${n ? "pointer" : "default"};background:${e.read ? "transparent" : "rgba(99,102,241,0.08)"};"\n                ${n ? `onclick="openUpdateFromNotif('${e.id}')"` : ""}>\n                <div style="display:flex;align-items:flex-start;gap:10px;">\n                    <span style="font-size:1.1rem;flex-shrink:0;">${t}</span>\n                    <div style="flex:1;min-width:0;">\n                        <div style="color:#fff;font-size:0.88rem;font-weight:${e.read ? "600" : "800"};margin-bottom:3px;display:flex;align-items:center;gap:6px;">\n                            ${e.title}\n                            ${e.read ? "" : '<span style="width:7px;height:7px;border-radius:50%;background:#6366f1;display:inline-block;flex-shrink:0;"></span>'}\n                        </div>\n                        <div style="color:#666;font-size:0.79rem;line-height:1.5;">${e.body}</div>\n                        <div style="color:#444;font-size:0.75rem;margin-top:5px;">${e.date}</div>\n                        ${n ? '<div style="color:#6366f1;font-size:0.77rem;margin-top:4px;font-weight:700;">▶ アップデート情報を見る</div>' : ""}\n                    </div>\n                </div>\n            </div>`;
          })
          .join(""));
  const o = _notifications.map((e) => e.id);
  (localStorage.setItem(NOTIF_KEY, JSON.stringify(o)),
    _notifications.forEach((e) => (e.read = !0)),
    _updateNotifBadge(),
    (e.style.display = "block"),
    setTimeout(
      () =>
        document.addEventListener("click", _notifOutsideClick, { once: !0 }),
      50,
    ));
}
function _notifOutsideClick(e) {
  const t = document.getElementById("notif-modal"),
    n = document.getElementById("notif-btn");
  t &&
    !t.contains(e.target) &&
    n &&
    !n.contains(e.target) &&
    closeNotifCenter();
}
function closeNotifCenter() {
  const e = document.getElementById("notif-modal");
  e && (e.style.display = "none");
}
function openUpdateFromNotif(e) {
  closeNotifCenter();
  let t = document.getElementById("update-overlay");
  if (!t) {
    const e = document.createElement("div");
    ((e.innerHTML =
      '<div id="update-overlay" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;align-items:center;justify-content:center;padding:20px;"><div style="background:var(--card);border:1px solid var(--border);border-radius:24px;width:100%;max-width:500px;padding:30px;box-shadow:0 25px 70px rgba(0,0,0,0.9);position:relative;max-height:85vh;display:flex;flex-direction:column;"><button onclick="document.getElementById(\'update-overlay\').remove()" style="position:absolute;top:16px;right:16px;width:32px;height:32px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#999;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button><h2 style="margin:0 0 20px;font-size:1.4rem;font-weight:900;color:var(--text);border-bottom:2px solid var(--border);padding-bottom:15px;flex-shrink:0;">🚀 Release 1.2.3.7</h2><div id="update-reopen-body" style="overflow-y:auto;flex:1;font-size:1rem;color:var(--text);line-height:1.8;padding-right:6px;"></div></div></div>'),
      document.body.appendChild(e.firstElementChild),
      (t = document.getElementById("update-overlay")));
    const n = document.getElementById("update-text-area"),
      o = document.getElementById("update-reopen-body");
    n && o && (o.innerHTML = n.innerHTML);
  }
  t.style.display = "flex";
}
let _fc = { name: "", group: "" };
function _b64ToStr(e) {
  try {
    const t = Uint8Array.from(atob(e), (e) => e.charCodeAt(0));
    return new TextDecoder().decode(t);
  } catch (e) {
    return "";
  }
}
async function _hashCode(e) {
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
  return Array.from(new Uint8Array(t))
    .map((e) => e.toString(16).padStart(2, "0"))
    .join("");
}
let _groupIsPublic = !1,
  _groupIcon = "🏆",
  _myGroups = [];
async function _hashPass(e) {
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
  return Array.from(new Uint8Array(t))
    .map((e) => e.toString(16).padStart(2, "0"))
    .join("");
}
function openFriendModal() {
  _progressMission("open_group");
  const e = document.getElementById("friend-modal");
  ((e.style.display = "flex"),
    (document.body.style.overflow = "hidden"),
    renderFriendModalTop(),
    (e.onclick = (t) => {
      t.target === e &&
        ((e.style.display = "none"), (document.body.style.overflow = ""));
    }));
}
function renderFriendModalTop() {
  const e = document.getElementById("friend-modal-content"),
    t = !!_currentUser;
  e.innerHTML = `\n        <div style="display:flex;flex-direction:column;gap:10px;">\n            ${t ? '\n                <button onclick="openGroupCreate()" style="padding:14px;border-radius:14px;background:linear-gradient(135deg,#ff9500,#ff6b00);color:#fff;border:none;font-size:0.95rem;font-weight:800;cursor:pointer;text-align:left;">\n                    ✨ 新しいグループを作成する\n                </button>\n                <button onclick="renderJoinGroup()" style="padding:14px;border-radius:14px;background:rgba(255,149,0,0.15);border:1px solid rgba(255,149,0,0.4);color:#ff9500;font-size:0.95rem;font-weight:800;cursor:pointer;text-align:left;">\n                    🔑 グループに参加する（コード入力）\n                </button>\n                <button onclick="renderMyGroups()" style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.06);border:1px solid #333;color:#ccc;font-size:0.95rem;font-weight:800;cursor:pointer;text-align:left;">\n                    📋 参加中のグループ\n                </button>\n            ' : '\n                <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:14px;padding:14px;margin-bottom:4px;">\n                    <p style="color:#a78bfa;font-size:0.85rem;margin:0 0 10px;">グループを作成・管理するにはログインが必要です。</p>\n                    <button onclick="openLoginModal()" style="width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;font-weight:700;cursor:pointer;font-size:0.88rem;">🔐 ログインする（Google / GitHub）</button>\n                </div>\n                <button onclick="renderJoinGroup()" style="padding:14px;border-radius:14px;background:rgba(255,149,0,0.15);border:1px solid rgba(255,149,0,0.4);color:#ff9500;font-size:0.95rem;font-weight:800;cursor:pointer;text-align:left;">\n                    🔑 グループに参加する（コード入力）\n                </button>\n            '}\n            <button onclick="renderPublicGroups()" style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid #2a2a2a;color:#888;font-size:0.9rem;font-weight:700;cursor:pointer;text-align:left;">\n                🌐 公開グループ一覧を見る\n            </button>\n            \x3c!-- 旧コード入力（別府小学校グループ等）--\x3e\n            <div style="border-top:1px solid #2a2a2a;padding-top:14px;margin-top:4px;">\n                <p style="color:#555;font-size:0.78rem;margin:0 0 8px;">管理者から配布された旧コードをお持ちの方：</p>\n                <div style="display:flex;gap:8px;">\n                    <input id="friend-code-input" type="password" placeholder="旧コードを入力..." maxlength="20"\n                        style="flex:1;background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:8px 12px;color:#fff;font-size:0.9rem;outline:none;text-align:center;letter-spacing:0.15em;">\n                    <button onclick="checkFriendCode()" style="padding:8px 14px;border-radius:10px;background:#333;color:#888;border:none;font-weight:700;cursor:pointer;font-size:0.85rem;">入力</button>\n                </div>\n                <div id="friend-code-error" style="color:#ff3b30;font-size:0.78rem;margin-top:6px;display:none;">コードが違います</div>\n            </div>\n        </div>`;
}
function renderJoinGroup() {
  document.getElementById("friend-modal-content").innerHTML =
    '\n        <button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n        <p style="color:#ccc;font-size:0.85rem;margin:0 0 16px;">グループのオーナーから教えてもらったグループIDとパスワードを入力してください。</p>\n        <div style="margin-bottom:12px;">\n            <label style="display:block;color:#ccc;font-size:0.82rem;font-weight:700;margin-bottom:6px;">グループID</label>\n            <input id="join-group-id" type="text" placeholder="グループID"\n                style="width:100%;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:10px 14px;color:#fff;font-size:0.95rem;outline:none;box-sizing:border-box;">\n        </div>\n        <div style="margin-bottom:16px;">\n            <label style="display:block;color:#ccc;font-size:0.82rem;font-weight:700;margin-bottom:6px;">パスワード</label>\n            <input id="join-group-pass" type="password" placeholder="パスワード"\n                style="width:100%;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:10px 14px;color:#fff;font-size:0.95rem;outline:none;box-sizing:border-box;">\n        </div>\n        <div id="join-group-error" style="color:#ff6b6b;font-size:0.82rem;margin-bottom:10px;display:none;"></div>\n        <button onclick="submitJoinGroup()" style="width:100%;padding:13px;border-radius:14px;background:linear-gradient(135deg,#ff9500,#ff6b00);color:#fff;border:none;font-weight:800;cursor:pointer;font-size:0.95rem;">参加する</button>';
}
async function submitJoinGroup() {
  if (!_fbDb) return void alert("Firestoreが利用できません");
  const e = document.getElementById("join-group-id")?.value.trim(),
    t = document.getElementById("join-group-pass")?.value.trim(),
    n = document.getElementById("join-group-error");
  if (!e || !t)
    return (
      (n.style.display = "block"),
      void (n.textContent = "グループIDとパスワードを入力してください")
    );
  try {
    const o = await _fbDb.collection("groups").doc(e).get();
    if (!o.exists)
      return (
        (n.style.display = "block"),
        void (n.textContent = "グループが見つかりません")
      );
    const i = o.data();
    if ((await _hashPass(t)) !== i.passwordHash)
      return (
        (n.style.display = "block"),
        void (n.textContent = "パスワードが違います")
      );
    if (i.members && i.members.length >= 5)
      return (
        (n.style.display = "block"),
        void (n.textContent = "このグループは満員です（5人上限）")
      );
    if (i.members && i.members.some((e) => e.uid === _currentUser?.uid))
      return (
        (n.style.display = "block"),
        void (n.textContent = "すでに参加しています")
      );
    const a = {
      uid: _currentUser?.uid || "guest",
      name:
        _currentUser?.displayName ||
        _currentUser?.email?.split("@")[0] ||
        "ゲスト",
      role: "member",
      joinedAt: Date.now(),
    };
    await _fbDb
      .collection("groups")
      .doc(e)
      .update({
        members: firebase.firestore.FieldValue.arrayUnion(a),
        memberUids: firebase.firestore.FieldValue.arrayUnion(
          _currentUser?.uid || "guest",
        ),
      });
    // 🎟️ 特定グループ参加特典：ガチャ券×3セットを1回限り無料付与
    const SPECIAL_GROUP_ID = "rf1AxyHKSHFVOPbJsiIw";
    const SPECIAL_GROUP_REWARD_KEY = "pu_special_group_reward_v1";
    // 🎊 先行参加グループ：4ヶ月記念イベントに10分間先行アクセス
    const EARLY_GROUP_ID = "hpEUTp8EgYlkpXUzzNDQ";
    if (e === SPECIAL_GROUP_ID && !localStorage.getItem(SPECIAL_GROUP_REWARD_KEY)) {
      _puPurchases.push("gacha_ticket_3");
      _savePuPoints();
      localStorage.setItem(SPECIAL_GROUP_REWARD_KEY, "1");
      alert(`✅ 「${i.icon} ${i.name}」に参加しました！\n\n🎟️🎟️ 参加特典：ガチャ券×3セットをプレゼント！`);
    } else if (e === EARLY_GROUP_ID) {
      alert(`✅ 「${i.icon} ${i.name}」に参加しました！\n\n🎊 4ヶ月記念イベントに先行参加します！（10分間有効）`);
      setTimeout(() => _grantAnniv4mEarlyAccess(), 300);
    } else {
      alert(`✅ 「${i.icon} ${i.name}」に参加しました！`);
    }
    renderFriendModalTop();
  } catch (e) {
    ((n.style.display = "block"), (n.textContent = "エラー: " + e.message));
  }
}
async function renderMyGroups() {
  const e = document.getElementById("friend-modal-content");
  if (
    ((e.innerHTML =
      '<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n        <p style="color:#888;text-align:center;">読み込み中...</p>'),
    _fbDb && _currentUser)
  )
    try {
      const t = await _fbDb
        .collection("groups")
        .where("memberUids", "array-contains", _currentUser.uid)
        .get();
      if (t.empty)
        return void (e.innerHTML =
          '<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n                <p style="color:#888;text-align:center;padding:20px;">まだグループに参加していません。</p>');
      const n = t.docs
        .map((e) => {
          const t = e.data(),
            n = t.ownerId === _currentUser.uid;
          return `<div style="background:#1a1a1a;border:1px solid ${n ? "#ff9500" : "#2a2a2a"};border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="openGroupDetail('${e.id}')">\n                <div style="font-size:2rem;">${t.icon}</div>\n                <div style="flex:1;">\n                    <div style="font-weight:800;color:#fff;font-size:0.95rem;">${t.name}</div>\n                    <div style="color:#666;font-size:0.75rem;">${n ? "👑 オーナー" : "👤 メンバー"} ・ ${t.members?.length || 0}/5人 ${t.isPublic ? "🌐 公開" : "🔒 非公開"}</div>\n                </div>\n                <div style="color:#555;font-size:0.85rem;">›</div>\n            </div>`;
        })
        .join("");
      e.innerHTML = `<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>${n}`;
    } catch (t) {
      e.innerHTML = `<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n            <p style="color:#ff6b6b;text-align:center;">エラー: ${t.message}</p>`;
    }
}
async function renderPublicGroups() {
  const e = document.getElementById("friend-modal-content");
  if (
    ((e.innerHTML =
      '<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n        <p style="color:#888;text-align:center;">読み込み中...</p>'),
    _fbDb)
  )
    try {
      const t = await _fbDb
        .collection("groups")
        .where("isPublic", "==", !0)
        .limit(20)
        .get();
      if (t.empty)
        return void (e.innerHTML =
          '<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n                <p style="color:#888;text-align:center;padding:20px;">公開グループがまだありません。</p>');
      const n = t.docs
        .map((e) => {
          const t = e.data(),
            n = (t.members?.length || 0) >= 5;
          return `<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">\n                <div style="font-size:2rem;">${t.icon}</div>\n                <div style="flex:1;">\n                    <div style="font-weight:800;color:#fff;font-size:0.95rem;">${t.name}</div>\n                    <div style="color:#666;font-size:0.75rem;">${t.members?.length || 0}/5人 ・ ID: ${e.id}</div>\n                </div>\n                ${n ? '<div style="color:#ff6b6b;font-size:0.75rem;font-weight:700;">満員</div>' : `<button onclick="prefillJoin('${e.id}')" style="padding:6px 14px;border-radius:10px;background:rgba(255,149,0,0.2);border:1px solid rgba(255,149,0,0.4);color:#ff9500;font-size:0.8rem;font-weight:700;cursor:pointer;">参加</button>`}\n            </div>`;
        })
        .join("");
      e.innerHTML = `<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n            <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">グループIDとパスワードはオーナーに確認してください。</p>${n}`;
    } catch (t) {
      e.innerHTML = `<button onclick="renderFriendModalTop()" style="background:none;border:none;color:#888;font-size:0.85rem;cursor:pointer;margin-bottom:16px;padding:0;">← 戻る</button>\n            <p style="color:#ff6b6b;">エラー: ${t.message}</p>`;
    }
}
function prefillJoin(e) {
  (renderJoinGroup(),
    setTimeout(() => {
      const t = document.getElementById("join-group-id");
      t && (t.value = e);
    }, 50));
}
function openGroupCreate() {
  _currentUser
    ? ((_groupIcon = "🏆"),
      (_groupIsPublic = !1),
      (document.getElementById("group-create-modal").style.display = "flex"),
      (document.getElementById("group-icon-selected").textContent = "🏆"))
    : openLoginModal();
}
function closeGroupCreate() {
  document.getElementById("group-create-modal").style.display = "none";
}
function toggleIconPicker() {
  const e = document.getElementById("group-icon-picker");
  e.style.display = "none" === e.style.display ? "block" : "none";
}
function selectGroupIcon(e) {
  ((_groupIcon = e),
    (document.getElementById("group-icon-selected").textContent = e),
    (document.getElementById("group-icon-picker").style.display = "none"));
}
function toggleGroupPublic() {
  _groupIsPublic = !_groupIsPublic;
  const e = document.getElementById("group-public-toggle"),
    t = document.getElementById("group-public-thumb");
  ((e.style.background = _groupIsPublic ? "#34c759" : "#555"),
    (t.style.left = _groupIsPublic ? "auto" : "2px"),
    (t.style.right = _groupIsPublic ? "2px" : "auto"));
}
async function submitCreateGroup() {
  if (!_fbDb || !_currentUser) return;
  const e = document.getElementById("group-name-input")?.value.trim(),
    t = document.getElementById("group-pass-input")?.value,
    n = document.getElementById("group-pass-confirm")?.value,
    o = document.getElementById("group-create-error");
  if (!e)
    return (
      (o.style.display = "block"),
      void (o.textContent = "グループ名を入力してください")
    );
  if (!t)
    return (
      (o.style.display = "block"),
      void (o.textContent = "パスワードを入力してください")
    );
  if (t !== n)
    return (
      (o.style.display = "block"),
      void (o.textContent = "パスワードが一致しません")
    );
  try {
    const n = await _hashPass(t),
      o = {
        uid: _currentUser.uid,
        name: _currentUser.displayName || "オーナー",
        role: "owner",
        joinedAt: Date.now(),
      },
      i = await _fbDb
        .collection("groups")
        .add({
          name: e,
          icon: _groupIcon,
          passwordHash: n,
          isPublic: _groupIsPublic,
          ownerId: _currentUser.uid,
          ownerName: _currentUser.displayName || "オーナー",
          members: [o],
          memberUids: [_currentUser.uid],
          createdAt: Date.now(),
        });
    (closeGroupCreate(),
      alert(
        `✅ グループ「${_groupIcon} ${e}」を作成しました！\n\nグループID: ${i.id}\nこのIDを友達に教えてください。`,
      ),
      renderFriendModalTop());
  } catch (e) {
    ((o.style.display = "block"), (o.textContent = "エラー: " + e.message));
  }
}
async function openGroupDetail(e) {
  if (!_fbDb) return;
  const t = document.getElementById("group-detail-modal"),
    n = document.getElementById("group-detail-content");
  ((t.style.display = "flex"),
    (n.innerHTML =
      '<p style="color:#888;text-align:center;">読み込み中...</p>'));
  try {
    const t = await _fbDb.collection("groups").doc(e).get();
    if (!t.exists)
      return void (n.innerHTML =
        '<p style="color:#ff6b6b;">グループが見つかりません</p>');
    const o = t.data(),
      i = o.ownerId === _currentUser?.uid,
      a = "sub" === o.members?.find((e) => e.uid === _currentUser?.uid)?.role,
      r = i || a;
    document.getElementById("group-detail-title").textContent =
      o.icon + " " + o.name;
    const s = (o.members || [])
        .map((t) => {
          const n = "owner" === t.role ? "👑" : "sub" === t.role ? "⭐" : "👤",
            o = t.uid === _currentUser?.uid,
            a = r && !o && "owner" !== t.role;
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #2a2a2a;">\n                <div style="font-size:1.2rem;">${n}</div>\n                <div style="flex:1;">\n                    <div style="color:#fff;font-size:0.9rem;font-weight:700;">${t.name}${o ? " (自分)" : ""}</div>\n                    <div style="color:#666;font-size:0.75rem;">${new Date(t.joinedAt).toLocaleDateString("ja-JP")} 参加</div>\n                </div>\n                ${a ? `<button onclick="requestDeleteMember('${e}','${t.uid}','${t.name}')" style="padding:4px 12px;border-radius:8px;background:rgba(255,59,48,0.15);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.75rem;font-weight:700;cursor:pointer;">削除申請</button>` : ""}\n                ${i && "member" === t.role ? `<button onclick="promoteToSub('${e}','${t.uid}')" style="padding:4px 12px;border-radius:8px;background:rgba(255,149,0,0.15);border:1px solid rgba(255,149,0,0.3);color:#ff9500;font-size:0.75rem;font-weight:700;cursor:pointer;">副オーナーに</button>` : ""}\n            </div>`;
        })
        .join(""),
      d = (
        await _fbDb
          .collection("group_delete_requests")
          .where("groupId", "==", e)
          .where("status", "==", "pending")
          .get()
      ).docs
        .filter((e) => e.data().targetUid === _currentUser?.uid)
        .map(
          (t) =>
            `<div style="background:rgba(255,59,48,0.1);border:1px solid rgba(255,59,48,0.3);border-radius:12px;padding:12px;margin-bottom:10px;">\n                <p style="color:#ff6b6b;font-size:0.85rem;margin:0 0 8px;">⚠️ 「${t.data().requestedByName}」さんからあなたの削除申請が来ています</p>\n                <div style="display:flex;gap:8px;">\n                    <button onclick="approveDeletion('${t.id}','${e}')" style="flex:1;padding:8px;border-radius:10px;background:rgba(255,59,48,0.2);border:1px solid rgba(255,59,48,0.4);color:#ff6b6b;font-size:0.82rem;font-weight:700;cursor:pointer;">承認して退出</button>\n                    <button onclick="rejectDeletion('${t.id}')" style="flex:1;padding:8px;border-radius:10px;background:#222;border:1px solid #333;color:#888;font-size:0.82rem;font-weight:700;cursor:pointer;">拒否</button>\n                </div>\n            </div>`,
        )
        .join("");
    n.innerHTML = `\n            ${d}\n            <div style="background:#1a1a1a;border-radius:12px;padding:12px;margin-bottom:16px;">\n                <div style="color:#888;font-size:0.75rem;margin-bottom:4px;">グループID（参加者に共有）</div>\n                <div style="display:flex;align-items:center;gap:8px;">\n                    <code style="color:#ff9500;font-size:0.9rem;flex:1;">${e}</code>\n                    <button onclick="navigator.clipboard.writeText('${e}').then(()=>alert('コピーしました！'))" style="padding:4px 10px;border-radius:8px;background:#333;border:none;color:#888;font-size:0.75rem;cursor:pointer;">コピー</button>\n                </div>\n                <div style="color:#555;font-size:0.72rem;margin-top:4px;">${o.isPublic ? "🌐 公開" : "🔒 非公開"} ・ ${o.members?.length || 0}/5人</div>\n            </div>\n            <div style="margin-bottom:16px;">${s}</div>\n            ${i ? `\n                <div style="display:grid;gap:8px;margin-top:16px;border-top:1px solid #2a2a2a;padding-top:16px;">\n                    <button onclick="editGroupName('${e}')" style="padding:10px;border-radius:12px;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);color:#6bb5ff;font-size:0.85rem;font-weight:700;cursor:pointer;">✏️ グループ名を変更</button>\n                    <button onclick="editGroupPass('${e}')" style="padding:10px;border-radius:12px;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);color:#6bb5ff;font-size:0.85rem;font-weight:700;cursor:pointer;">🔑 パスワードを変更</button>\n                    <button onclick="dissolveGroup('${e}')" style="padding:10px;border-radius:12px;background:rgba(255,59,48,0.1);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.85rem;font-weight:700;cursor:pointer;">🗑 グループを解散</button>\n                </div>\n            ` : `\n                <button onclick="leaveGroup('${e}')" style="width:100%;margin-top:16px;padding:10px;border-radius:12px;background:rgba(255,59,48,0.1);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;font-size:0.85rem;font-weight:700;cursor:pointer;">退出する</button>\n            `}`;
  } catch (e) {
    n.innerHTML = `<p style="color:#ff6b6b;">エラー: ${e.message}</p>`;
  }
}
function closeGroupDetail() {
  document.getElementById("group-detail-modal").style.display = "none";
}
async function requestDeleteMember(e, t, n) {
  if (
    _fbDb &&
    _currentUser &&
    confirm(
      `「${n}」さんの削除を申請しますか？\n相手が承認するとグループから退出されます。`,
    )
  )
    try {
      (await _fbDb
        .collection("group_delete_requests")
        .add({
          groupId: e,
          targetUid: t,
          targetName: n,
          requestedBy: _currentUser.uid,
          requestedByName: _currentUser.displayName || "オーナー",
          status: "pending",
          createdAt: Date.now(),
        }),
        alert("✅ 削除申請を送りました。相手の承認をお待ちください。"));
    } catch (e) {
      alert("エラー: " + e.message);
    }
}
async function approveDeletion(e, t) {
  if (
    _fbDb &&
    _currentUser &&
    confirm("削除申請を承認してグループを退出しますか？")
  )
    try {
      const n = (await _fbDb.collection("groups").doc(t).get()).data(),
        o = n.members.filter((e) => e.uid !== _currentUser.uid),
        i = n.memberUids.filter((e) => e !== _currentUser.uid);
      (await _fbDb
        .collection("groups")
        .doc(t)
        .update({ members: o, memberUids: i }),
        await _fbDb
          .collection("group_delete_requests")
          .doc(e)
          .update({ status: "approved" }),
        alert("✅ グループから退出しました"),
        closeGroupDetail(),
        renderFriendModalTop());
    } catch (e) {
      alert("エラー: " + e.message);
    }
}
async function rejectDeletion(e) {
  _fbDb &&
    (await _fbDb
      .collection("group_delete_requests")
      .doc(e)
      .update({ status: "rejected" }),
    alert("❌ 削除申請を拒否しました"),
    closeGroupDetail());
}
async function promoteToSub(e, t) {
  if (
    _fbDb &&
    _currentUser &&
    confirm("このメンバーを副オーナーに昇格しますか？")
  )
    try {
      const n = await _fbDb.collection("groups").doc(e).get(),
        o = n
          .data()
          .members.map((e) => (e.uid === t ? { ...e, role: "sub" } : e));
      (await _fbDb.collection("groups").doc(e).update({ members: o }),
        alert("✅ 副オーナーに昇格しました"),
        openGroupDetail(e));
    } catch (e) {
      alert("エラー: " + e.message);
    }
}
async function editGroupName(e) {
  const t = prompt("新しいグループ名を入力してください（20文字以内）");
  if (t && t.trim())
    if (t.trim().length > 20) alert("20文字以内で入力してください");
    else
      try {
        (await _fbDb.collection("groups").doc(e).update({ name: t.trim() }),
          alert("✅ グループ名を変更しました"),
          openGroupDetail(e));
      } catch (e) {
        alert("エラー: " + e.message);
      }
}
async function editGroupPass(e) {
  const t = prompt("新しいパスワードを入力してください");
  if (!t) return;
  if (t === prompt("もう一度入力してください"))
    try {
      const n = await _hashPass(t);
      (await _fbDb.collection("groups").doc(e).update({ passwordHash: n }),
        alert("✅ パスワードを変更しました"));
    } catch (e) {
      alert("エラー: " + e.message);
    }
  else alert("パスワードが一致しません");
}
async function dissolveGroup(e) {
  if (confirm("本当にグループを解散しますか？\nこの操作は取り消せません。"))
    try {
      (await _fbDb.collection("groups").doc(e).delete(),
        alert("✅ グループを解散しました"),
        closeGroupDetail(),
        renderFriendModalTop());
    } catch (e) {
      alert("エラー: " + e.message);
    }
}
async function leaveGroup(e) {
  if (_currentUser && _fbDb && confirm("グループを退出しますか？"))
    try {
      const t = (await _fbDb.collection("groups").doc(e).get()).data(),
        n = t.members.filter((e) => e.uid !== _currentUser.uid),
        o = t.memberUids.filter((e) => e !== _currentUser.uid);
      (await _fbDb
        .collection("groups")
        .doc(e)
        .update({ members: n, memberUids: o }),
        alert("✅ グループから退出しました"),
        closeGroupDetail(),
        renderFriendModalTop());
    } catch (e) {
      alert("エラー: " + e.message);
    }
}
const _CODE_MAP = {
  ef56e0095f7d7fa387680bd5c14f6462a0948ccc16079503c6d5a721b05519d9:
    "56aP5bKh5biC56uL5Yil5bqc5bCP5a2m5qCh",
};
function _getGroupFromHash(e) {
  const t = _CODE_MAP[e];
  return t ? _b64ToStr(t) : null;
}
async function checkFriendCode() {
  const e = document.getElementById("friend-code-input").value.trim(),
    t = document.getElementById("friend-code-error"),
    n = await _hashCode(e),
    o = _getGroupFromHash(n);
  if (o) {
    ((t.style.display = "none"),
      _progressMission("friend_code"),
      (_fc.group = o));
    const e = new Date(Date.now() + 2592e6).toUTCString();
    ((document.cookie =
      "fc_auth=1; expires=" + e + "; path=/; SameSite=Strict"),
      (document.cookie =
        "fc_gb64=" +
        encodeURIComponent(_CODE_MAP[n]) +
        "; expires=" +
        e +
        "; path=/; SameSite=Strict"),
      (document.getElementById("friend-modal").style.display = "none"),
      showFriendNameModal(o));
  } else
    ((t.style.display = "block"),
      (document.getElementById("friend-code-input").value = ""));
}
function checkFriendCookie() {
  return document.cookie
    .split(";")
    .some((e) => e.trim().startsWith("fc_auth=1"));
}
function loadFriendFromCookie() {
  const e = document.cookie
    .split(";")
    .find((e) => e.trim().startsWith("fc_gb64="));
  if (e) {
    const t = decodeURIComponent(e.trim().split("=").slice(1).join("="));
    _fc.group = _b64ToStr(t) || "";
  }
  const t = document.cookie
    .split(";")
    .find((e) => e.trim().startsWith("fc_nm="));
  t &&
    (_fc.name =
      decodeURIComponent(t.trim().split("=").slice(1).join("=")) || "");
}
function showFriendNameModal(e) {
  const t = document.getElementById("friend-name-modal");
  t && t.remove();
  const n = document.createElement("div");
  ((n.id = "friend-name-modal"),
    (n.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999999;display:flex;justify-content:center;align-items:center;padding:20px;box-sizing:border-box;"));
  const o = document.createElement("h2");
  ((o.style.cssText =
    "margin:0 0 6px;font-size:1rem;font-weight:800;color:#34c759;"),
    (o.textContent = e));
  const i = document.createElement("div");
  ((i.style.cssText =
    "background:#1a1a2e;border:1px solid #34c759;border-radius:24px;padding:28px;width:100%;max-width:360px;text-align:center;"),
    (i.innerHTML = '<div style="font-size:1.8rem;margin-bottom:8px;">👋</div>'),
    i.appendChild(o),
    (i.innerHTML +=
      '<p style="color:#888;font-size:0.85rem;margin:0 0 18px;line-height:1.6;">ニックネームを入力してください<br>（スキップも可）</p><input id="friend-name-input" type="text" placeholder="名前を入力..." maxlength="20" style="width:100%;background:#111;border:1px solid #34c759;border-radius:12px;padding:12px 16px;color:#fff;font-size:1rem;outline:none;box-sizing:border-box;text-align:center;margin-bottom:12px;"><button onclick="saveFriendName()" style="width:100%;padding:13px;border-radius:12px;background:linear-gradient(135deg,#34c759,#30a84e);color:#fff;border:none;font-weight:800;cursor:pointer;font-size:0.95rem;margin-bottom:8px;">決定</button><button onclick="saveFriendName(true)" style="width:100%;padding:10px;border-radius:12px;background:#222;color:#888;border:1px solid #333;font-size:0.85rem;cursor:pointer;">スキップ</button>'),
    n.appendChild(i),
    document.body.appendChild(n));
  const a = document.getElementById("friend-name-input");
  a &&
    (a.focus(),
    a.addEventListener("keydown", (e) => {
      "Enter" === e.key && saveFriendName();
    }));
}
function saveFriendName(e) {
  const t = document.getElementById("friend-name-modal");
  if (!e) {
    const e = document.getElementById("friend-name-input")?.value.trim() || "";
    if (((_fc.name = e), e)) {
      const t = new Date(Date.now() + 2592e6).toUTCString();
      document.cookie =
        "fc_nm=" +
        encodeURIComponent(e) +
        "; expires=" +
        t +
        "; path=/; SameSite=Strict";
    }
  }
  (t && t.remove(), updateFriendAuthUI(!0));
}
function updateFriendAuthUI(e) {
  const t = document.getElementById("auth-friend-btn"),
    n = document.getElementById("auth-status-badge");
  if (e) {
    const e = _fc.name || "",
      o = _fc.group || "";
    if (
      (t &&
        ((t.textContent = "🤝 " + (e || o || "ログイン中")),
        (t.style.background = "#34c759"),
        (t.onclick = () => {
          confirm("ログアウトしますか？") &&
            (["fc_auth", "fc_gb64", "fc_nm"].forEach((e) => {
              document.cookie =
                e + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }),
            (_fc = { name: "", group: "" }),
            updateFriendAuthUI(!1));
        })),
      n && !_currentUser)
    ) {
      n.style.display = "block";
      let t = "🤝";
      (e && (t += " <strong>" + e + "</strong>"),
        (t += o
          ? " で <strong>" + o + "</strong>グループにログイン中"
          : " でログイン中"),
        (n.innerHTML = t));
    }
  } else
    (t &&
      ((t.textContent = "🤝 友達コード"),
      (t.style.background = "linear-gradient(135deg,#ff9500,#ff6b00)"),
      (t.onclick = () => {
        document.getElementById("friend-modal").style.display = "flex";
      })),
      n && !_currentUser && (n.style.display = "none"));
}
let _firebaseInitialized = !1;
function initFirebase() {
  if ("undefined" == typeof firebase)
    return (
      console.error("❌ ERROR: Firebase SDK が読み込まれていません"),
      void (document.getElementById("auth-username").textContent =
        "Firebase SDK未読み込み")
    );
  if (!FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey)
    return (
      console.error("❌ ERROR: FIREBASE_CONFIG が設定されていません"),
      void (document.getElementById("auth-username").textContent =
        "Firebase設定エラー")
    );
  let e;
  console.log("✅ Firebase SDK 確認OK");
  try {
    ((e = firebase.app()), console.log("✅ Firebase は既に初期化済み"));
  } catch (t) {
    (console.log("🔄 Firebase を初期化中..."),
      (e = firebase.initializeApp(FIREBASE_CONFIG)),
      console.log("✅ Firebase 初期化完了"));
  }
  if (((_fbAuth = firebase.auth()), (_fbDb = firebase.firestore()), !_fbAuth))
    return (
      console.error("❌ ERROR: firebase.auth() が失敗しました"),
      void (document.getElementById("auth-username").textContent =
        "Auth初期化エラー")
    );
  (console.log("✅✅✅ Firebase 完全初期化成功 ✅✅✅"),
    (document.getElementById("auth-bar").style.display = "flex"),
    (window._fbAuth = _fbAuth),
    (window._fbDb = _fbDb),
    "function" == typeof registerSWAndSubscribe && registerSWAndSubscribe(),
    _fbAuth.onAuthStateChanged(async (e) => {
      if (
        ((_currentUser = e),
        updateAuthUI(e),
        "function" == typeof _checkAdminUI && _checkAdminUI(e),
        e)
      ) {
        try {
          (await e.reload(), (_currentUser = _fbAuth.currentUser));
        } catch (e) {}
        (syncHistoryFromCloud(),
          fetchUserPlan().catch((e) => {
            (console.error("❌ fetchUserPlan エラー:", e), _onPlanReady());
          }));
        try {
          applyLanguage();
        } catch (e) {}
      } else {
        ((_isProUltra = !1),
          (_puPoints = 0),
          (_puPurchases = []),
          (_rankingEnabled = !1),
          (_aiProEnabled = !1),
          (_legendSkinUnlocked = !1),
          (_colorCustomEnabled = !1),
          (_pointDoubleEnabled = !1),
          (_maxHistory = 10),
          document.body.removeAttribute("data-pu-skin"));
        const e = document.getElementById("pu-header-badge");
        e && (e.style.display = "none");
        const t = document.getElementById("notif-btn");
        t && (t.style.display = "none");
        const n = document.getElementById("ranking-btn");
        (n && (n.style.display = "none"), _showVerifyBanner(!1));
      }
    }),
    _fbAuth
      .getRedirectResult()
      .then((e) => {
        e && e.user && console.log("✅ Redirect ログイン成功");
      })
      .catch((e) => {
        "auth/operation-not-supported-in-this-environment" !== e.code &&
          console.error("Redirect エラー:", e);
      }),
    setTimeout(function () {
      checkPuReminder();
    }, 4e3));
}
function updateAuthUI(e) {
  const t = document.getElementById("auth-login-btn"),
    n = document.getElementById("auth-logout-btn"),
    o = document.getElementById("auth-avatar"),
    i = document.getElementById("auth-username"),
    a = document.getElementById("auth-status-badge");
  if (e) {
    if (
      (t && (t.style.display = "none"),
      n && (n.style.display = "block"),
      e.isAnonymous)
    )
      ((o.style.display = "none"),
        (i.textContent = "👤 匿名"),
        (document.getElementById("auth-sync-status").textContent = ""),
        a &&
          ((a.style.display = "block"),
          (a.innerHTML =
            "👤 匿名ログイン中 — データは端末のみ保存（クラウド同期なし）")));
    else {
      const t = (e.providerData && e.providerData[0]) || {},
        n =
          e.displayName ||
          t.displayName ||
          (e.email && e.email.split("@")[0]) ||
          (t.email && t.email.split("@")[0]) ||
          e.uid.slice(0, 8),
        r = e.photoURL || t.photoURL || null;
      (r
        ? ((o.src = r), (o.style.display = "block"))
        : (o.style.display = "none"),
        (i.textContent = n),
        (document.getElementById("auth-sync-status").textContent =
          tui().synced),
        a &&
          ((a.style.display = "block"),
          (a.innerHTML =
            "🔓 <strong>" +
            n +
            "</strong> でログイン中 — 履歴がクラウドに同期されます")));
    }
    document.body.style.paddingTop = "49px";
    const r = document.getElementById("pu-header-badge");
    r && (r.style.display = _isProUltra ? "inline-block" : "none");
    const s = document.getElementById("propass-register-btn");
    s &&
      (s.style.display =
        _isProUltra && window.PublicKeyCredential && !e.isAnonymous
          ? "block"
          : "none");
  } else {
    (t && (t.style.display = "flex"),
      n && (n.style.display = "none"),
      (o.style.display = "none"),
      (i.textContent = ""),
      (document.getElementById("auth-sync-status").textContent = ""),
      a && (a.style.display = "none"),
      (document.body.style.paddingTop = "0"));
    const e = document.getElementById("pu-header-badge");
    e && (e.style.display = "none");
    const r = document.getElementById("propass-register-btn");
    r && (r.style.display = "none");
  }
}
function _closeAuthModal() {
  const e = document.getElementById("auth-modal");
  e && ((e.style.display = "none"), (document.body.style.overflow = ""));
}
function openLoginModal() {
  const e = document.getElementById("auth-modal");
  e && ((e.style.display = "flex"), (document.body.style.overflow = "hidden"));
}
function openSignUpModal() {
  (_closeAuthModal(), closeEmailLoginModal());
  const e = document.getElementById("signup-modal");
  e && ((e.style.display = "flex"), (document.body.style.overflow = "hidden"));
  const t = document.getElementById("signup-error");
  t && (t.textContent = "");
  const n = document.getElementById("signup-pw-strength");
  n && (n.innerHTML = "");
}
function closeSignUpModal() {
  const e = document.getElementById("signup-modal");
  e && ((e.style.display = "none"), (document.body.style.overflow = ""));
}
function openEmailLoginModal() {
  _closeAuthModal();
  const e = document.getElementById("email-login-modal");
  e && ((e.style.display = "flex"), (document.body.style.overflow = "hidden"));
  const t = document.getElementById("email-login-error");
  t && (t.textContent = "");
}
function closeEmailLoginModal() {
  const e = document.getElementById("email-login-modal");
  e && ((e.style.display = "none"), (document.body.style.overflow = ""));
}
function _togglePw(e, t) {
  const n = document.getElementById(e);
  n &&
    ("password" === n.type
      ? ((n.type = "text"), (t.textContent = "🙈"))
      : ((n.type = "password"), (t.textContent = "👁")));
}
function _checkPwStrength(e) {
  const t = document.getElementById("signup-pw-strength");
  if (!t) return;
  if (!e) return void (t.innerHTML = "");
  let n = 0;
  (e.length >= 8 && n++,
    e.length >= 12 && n++,
    /[A-Z]/.test(e) && n++,
    /[0-9]/.test(e) && n++,
    /[^A-Za-z0-9]/.test(e) && n++);
  const o = [
    { label: "弱い", color: "#ff3b30", w: "30%" },
    { label: "やや弱い", color: "#ff9500", w: "50%" },
    { label: "普通", color: "#ffcc00", w: "65%" },
    { label: "強い", color: "#34c759", w: "85%" },
    { label: "とても強い", color: "#30d158", w: "100%" },
  ][Math.min(n, 4)];
  t.innerHTML = `<div style="display:flex;align-items:center;gap:8px;">\n        <div style="flex:1;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;">\n            <div style="height:100%;width:${o.w};background:${o.color};border-radius:2px;transition:width 0.3s,background 0.3s;"></div>\n        </div>\n        <span style="color:${o.color};font-size:0.75rem;font-weight:700;white-space:nowrap;">${o.label}</span>\n    </div>`;
}
async function submitSignUp() {
  const e = (document.getElementById("signup-name")?.value || "").trim(),
    t = (document.getElementById("signup-email")?.value || "").trim(),
    n = document.getElementById("signup-password")?.value || "",
    o = document.getElementById("signup-password2")?.value || "",
    i = document.getElementById("signup-error"),
    a = document.getElementById("signup-submit");
  if ((i && (i.textContent = ""), t))
    if (n)
      if (n.length < 6)
        i && (i.textContent = "パスワードは6文字以上にしてください");
      else if (n === o)
        if (_fbAuth) {
          a && ((a.disabled = !0), (a.textContent = "作成中..."));
          try {
            const o = await _fbAuth.createUserWithEmailAndPassword(t, n);
            if (e)
              try {
                await o.user.updateProfile({ displayName: e });
              } catch (e) {}
            try {
              await o.user.sendEmailVerification();
            } catch (e) {}
            (await _fbAuth.signOut(),
              closeSignUpModal(),
              alert(
                "📧 確認メールを送信しました！\n\nメール内のリンクをクリックして認証を完了してください。\n認証後にログインするとProUltra特典が有効になります。\n\n※ 迷惑メールフォルダもご確認ください。",
              ));
          } catch (e) {
            const t = {
              "auth/email-already-in-use":
                "このメールアドレスは既に使われています",
              "auth/invalid-email": "メールアドレスの形式が正しくありません",
              "auth/weak-password": "パスワードが短すぎます（6文字以上）",
              "auth/operation-not-allowed":
                "メール登録が無効です（Firebase設定を確認）",
            };
            i && (i.textContent = t[e.code] || e.message);
          } finally {
            a &&
              ((a.disabled = !1), (a.textContent = "🚀 アカウントを作成する"));
          }
        } else i && (i.textContent = "Firebase未設定です");
      else i && (i.textContent = "パスワードが一致しません");
    else i && (i.textContent = "パスワードを入力してください");
  else i && (i.textContent = "メールアドレスを入力してください");
}
async function sendPasswordReset() {
  const e = document.getElementById("email-login-email").value.trim(),
    t = document.getElementById("email-login-error");
  if (e)
    if (_fbAuth)
      try {
        (await _fbAuth.sendPasswordResetEmail(e),
          alert(
            "パスワードリセットメールを送信しました！\nメールをご確認ください。",
          ),
          t && (t.textContent = ""));
      } catch (e) {
        const n = {
          "auth/user-not-found": "このメールアドレスは登録されていません",
          "auth/invalid-email": "メールアドレスの形式が正しくありません",
        };
        t && (t.textContent = n[e.code] || "エラー: " + e.message);
      }
    else t && (t.textContent = "Firebase未設定です");
  else t && (t.textContent = "メールアドレスを入力してください");
}
function openChangeEmailModal() {
  const e = document.getElementById("change-email-modal");
  if (!e) return;
  const t = _fbAuth && _fbAuth.currentUser,
    n = document.getElementById("change-email-current");
  n && (n.textContent = t && t.email ? t.email : "不明");
  const o = document.getElementById("change-email-new"),
    i = document.getElementById("change-email-pw"),
    a = document.getElementById("change-email-error");
  (o && (o.value = ""),
    i && (i.value = ""),
    a && (a.textContent = ""),
    (document.getElementById("change-email-step1").style.display = "block"),
    (document.getElementById("change-email-step2").style.display = "none"),
    (e.style.display = "flex"));
}
function closeChangeEmailModal() {
  const e = document.getElementById("change-email-modal");
  e && (e.style.display = "none");
}
async function changeEmailSend() {
  const e = (document.getElementById("change-email-new")?.value || "").trim(),
    t = document.getElementById("change-email-pw")?.value || "",
    n = document.getElementById("change-email-error");
  if (!e)
    return void (
      n && (n.textContent = "新しいメールアドレスを入力してください")
    );
  if (!t) return void (n && (n.textContent = "パスワードを入力してください"));
  n && (n.textContent = "");
  const o = _fbAuth && _fbAuth.currentUser;
  if (o)
    try {
      const n = firebase.auth.EmailAuthProvider.credential(o.email, t);
      (await o.reauthenticateWithCredential(n),
        await o.verifyBeforeUpdateEmail(e));
      const i = document.getElementById("change-email-sent-addr");
      (i && (i.textContent = e),
        (document.getElementById("change-email-step1").style.display = "none"),
        (document.getElementById("change-email-step2").style.display =
          "block"));
    } catch (e) {
      const t = {
        "auth/invalid-email": "メールアドレスの形式が正しくありません",
        "auth/email-already-in-use": "そのメールアドレスはすでに使われています",
        "auth/wrong-password": "パスワードが正しくありません",
        "auth/too-many-requests":
          "リクエストが多すぎます。しばらく待ってから試してください",
        "auth/requires-recent-login": "セキュリティのため再ログインが必要です",
        "auth/invalid-credential": "パスワードが正しくありません",
      };
      n && (n.textContent = t[e.code] || e.message);
    }
  else n && (n.textContent = "ログインが必要です");
}
function openDeleteAccountModal() {
  const e = document.getElementById("delete-account-modal");
  if (!e) return;
  const t = document.getElementById("delete-account-pw"),
    n = document.getElementById("delete-account-error");
  (t && (t.value = ""),
    n && (n.textContent = ""),
    (document.getElementById("delete-account-step1").style.display = "block"),
    (document.getElementById("delete-account-done").style.display = "none"),
    (e.style.display = "flex"),
    (document.body.style.overflow = "hidden"));
}
function closeDeleteAccountModal() {
  const e = document.getElementById("delete-account-modal");
  e && ((e.style.display = "none"), (document.body.style.overflow = ""));
}
async function confirmDeleteAccount() {
  const e = document.getElementById("delete-account-pw")?.value || "",
    t = document.getElementById("delete-account-error"),
    n = document.querySelector(
      '#delete-account-step1 button[onclick*="confirmDelete"]',
    );
  if (e) {
    if (_fbAuth && _fbAuth.currentUser) {
      (t && (t.textContent = ""),
        n && ((n.disabled = !0), (n.textContent = "削除中...")));
      try {
        const t = _fbAuth.currentUser,
          n = firebase.auth.EmailAuthProvider.credential(t.email, e);
        if ((await t.reauthenticateWithCredential(n), _fbDb))
          try {
            await _fbDb.collection("users").doc(t.uid).delete();
          } catch (e) {}
        (await t.delete(),
          (document.getElementById("delete-account-step1").style.display =
            "none"),
          (document.getElementById("delete-account-done").style.display =
            "block"));
      } catch (e) {
        const o = {
          "auth/wrong-password": "パスワードが正しくありません",
          "auth/invalid-credential": "パスワードが正しくありません",
          "auth/too-many-requests": "しばらく待ってから再試行してください",
          "auth/requires-recent-login": "再ログインが必要です",
        };
        (t && (t.textContent = o[e.code] || "エラー: " + e.message),
          n && ((n.disabled = !1), (n.textContent = "アカウントを削除する")));
      }
    }
  } else t && (t.textContent = "パスワードを入力してください");
}
async function signInWithEmail() {
  const e = (document.getElementById("email-login-email")?.value || "").trim(),
    t = document.getElementById("email-login-password")?.value || "",
    n = document.getElementById("email-login-error"),
    o = document.getElementById("email-login-submit");
  if (e && t)
    if (_fbAuth) {
      if (!_isAuthProcessing) {
        ((_isAuthProcessing = !0),
          o && ((o.disabled = !0), (o.textContent = "ログイン中...")),
          n && (n.textContent = ""));
        try {
          (await _fbAuth.signInWithEmailAndPassword(e, t),
            closeEmailLoginModal());
        } catch (e) {
          if ("auth/multi-factor-auth-required" === e.code)
            return (closeEmailLoginModal(), void (await _handleMfaSignIn(e)));
          const t = {
            "auth/user-not-found": "このメールアドレスは登録されていません",
            "auth/wrong-password": "パスワードが違います",
            "auth/invalid-email": "メールアドレスの形式が正しくありません",
            "auth/too-many-requests": "しばらく待ってから再試行してください",
            "auth/invalid-credential":
              "メールアドレスまたはパスワードが違います",
            "auth/user-disabled": "このアカウントは無効化されています",
          };
          n && (n.textContent = t[e.code] || e.message);
        } finally {
          ((_isAuthProcessing = !1),
            o && ((o.disabled = !1), (o.textContent = "ログイン")));
        }
      }
    } else n && (n.textContent = "Firebase未設定です");
  else n && (n.textContent = "メールとパスワードを入力してください");
}
let _isAuthProcessing = !1;
async function signInWithGoogle() {
  if (_fbAuth && !_isAuthProcessing) {
    ((_isAuthProcessing = !0), _closeAuthModal());
    try {
      const e = new firebase.auth.GoogleAuthProvider();
      await _fbAuth.signInWithPopup(e);
    } catch (e) {
      "auth/popup-closed-by-user" !== e.code &&
        "auth/cancelled-popup-request" !== e.code &&
        alert("Googleログイン失敗: " + e.message);
    } finally {
      _isAuthProcessing = !1;
    }
  }
}
async function signInWithGitHub() {
  if (_fbAuth && !_isAuthProcessing) {
    ((_isAuthProcessing = !0), _closeAuthModal());
    try {
      const e = new firebase.auth.GithubAuthProvider();
      e.addScope("read:user");
      const t = await _fbAuth.signInWithPopup(e),
        n = t.user,
        o = t.additionalUserInfo && t.additionalUserInfo.profile,
        i = o && (o.name || o.login),
        a = o && o.avatar_url;
      if ((i && !n.displayName) || (a && !n.photoURL)) {
        try {
          await n.updateProfile({
            displayName: n.displayName || i || null,
            photoURL: n.photoURL || a || null,
          });
        } catch (e) {}
        updateAuthUI(_fbAuth.currentUser);
      }
    } catch (e) {
      "auth/popup-closed-by-user" !== e.code &&
        "auth/cancelled-popup-request" !== e.code &&
        alert("GitHubログイン失敗: " + e.message);
    } finally {
      _isAuthProcessing = !1;
    }
  }
}
async function signInWithTwitter() {
  if (_fbAuth && !_isAuthProcessing) {
    ((_isAuthProcessing = !0), _closeAuthModal());
    try {
      const e = new firebase.auth.TwitterAuthProvider();
      await _fbAuth.signInWithPopup(e);
    } catch (e) {
      "auth/popup-closed-by-user" !== e.code &&
        "auth/cancelled-popup-request" !== e.code &&
        alert("Twitterログイン失敗: " + e.message);
    } finally {
      _isAuthProcessing = !1;
    }
  }
}
async function signInWithDiscord() {
  if (_fbAuth && !_isAuthProcessing) {
    ((_isAuthProcessing = !0), _closeAuthModal());
    try {
      const e = new firebase.auth.OAuthProvider("oidc.podcast.discord");
      await _fbAuth.signInWithPopup(e);
    } catch (e) {
      "auth/popup-closed-by-user" !== e.code &&
        "auth/cancelled-popup-request" !== e.code &&
        alert("Discordログイン失敗: " + e.message);
    } finally {
      _isAuthProcessing = !1;
    }
  }
}
function openSSOLoginModal() {
  _closeAuthModal();
  const e = document.getElementById("sso-login-modal");
  e &&
    ((document.getElementById("sso-email-input").value = ""),
    (document.getElementById("sso-error-msg").textContent = ""),
    (e.style.display = "flex"),
    (document.body.style.overflow = "hidden"),
    setTimeout(() => {
      const e = document.getElementById("sso-email-input");
      e && e.focus();
    }, 100));
}
async function signInWithSSO() {
  const e = document.getElementById("sso-email-input"),
    t = document.getElementById("sso-error-msg"),
    n = document.querySelector(
      '#sso-login-modal button[onclick="signInWithSSO()"]',
    ),
    o = (e ? e.value : "").trim();
  if (o && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o)) {
    (t && (t.textContent = ""),
      n && ((n.textContent = "確認中..."), (n.disabled = !0)));
    try {
      const e = await fetch("/auth/sso-start?email=" + encodeURIComponent(o)),
        t = await e.json();
      if (!e.ok || !t.url)
        throw new Error(t.error || "SSO URL の取得に失敗しました");
      window.location.href = t.url;
    } catch (e) {
      (t && (t.textContent = e.message),
        n && ((n.textContent = "SSOでログイン →"), (n.disabled = !1)));
    }
  } else t && (t.textContent = "有効なメールアドレスを入力してください。");
}
async function signInAnonymously_app() {
  if (_fbAuth && !_isAuthProcessing) {
    ((_isAuthProcessing = !0), _closeAuthModal());
    try {
      await _fbAuth.signInAnonymously();
    } catch (e) {
      alert("匿名ログイン失敗: " + e.message);
    } finally {
      _isAuthProcessing = !1;
    }
  }
}
function signOut() {
  _fbAuth && _fbAuth.signOut();
}
async function syncHistoryToCloud(e) {
  if (_currentUser && _fbDb && !_currentUser.isAnonymous)
    try {
      (await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("diagnosis_history")
        .doc("data")
        .set({
          history: e,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }),
        (document.getElementById("auth-sync-status").textContent =
          tui().syncOk));
    } catch (e) {
      document.getElementById("auth-sync-status").textContent = tui().syncFail;
    }
}
async function syncHistoryFromCloud() {
  if (_currentUser && _fbDb && !_currentUser.isAnonymous)
    try {
      document.getElementById("auth-sync-status").textContent = tui().syncing;
      const e = await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("diagnosis_history")
        .doc("data")
        .get();
      if (e.exists) {
        const t = e.data();
        t.history &&
          Array.isArray(t.history) &&
          (localStorage.setItem("diag_history", JSON.stringify(t.history)),
          (document.getElementById("auth-sync-status").textContent =
            tui().syncOk));
      } else {
        const e = JSON.parse(localStorage.getItem("diag_history") || "[]");
        (e.length > 0 && (await syncHistoryToCloud(e)),
          (document.getElementById("auth-sync-status").textContent =
            tui().syncOk));
      }
    } catch (e) {
      document.getElementById("auth-sync-status").textContent = tui().syncFail;
    }
}
function requireLogin(e, t) {
  if (_currentUser) return void t();
  ((document.getElementById("auth-modal-msg").textContent = e + tui().loginMsg),
    (document.getElementById("auth-modal").style.display = "flex"));
}
async function syncAIConvsToCloud(e) {
  if (_currentUser && _fbDb && !_currentUser.isAnonymous)
    try {
      await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("ai_conversations")
        .doc("data")
        .set({
          convs: e,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (e) {}
}
async function syncAIConvsFromCloud() {
  if (_currentUser && _fbDb && !_currentUser.isAnonymous)
    try {
      const e = await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("ai_conversations")
        .doc("data")
        .get();
      e.exists &&
        e.data().convs &&
        localStorage.setItem(
          "ai_conversations",
          JSON.stringify(e.data().convs),
        );
    } catch (e) {}
}
function initHelpIcons() {
  document.querySelectorAll(".label").forEach((e) => {
    if (e.querySelector(".help")) return;
    const t = document.createElement("span");
    ((t.className = "help"), (t.textContent = "＊"));
    const n = e.textContent;
    (n.includes("CPU")
      ? (t.dataset.key = "cpu")
      : n.includes("メモリ")
        ? (t.dataset.key = "ram")
        : n.includes("GPU")
          ? (t.dataset.key = "gpu")
          : n.includes("フレーム") || n.includes("FPS")
            ? (t.dataset.key = "fps")
            : n.includes("画面") || n.includes("解像度")
              ? (t.dataset.key = "display")
              : n.includes("ネットワーク") || n.includes("回線")
                ? (t.dataset.key = "network")
                : n.includes("バッテリー")
                  ? (t.dataset.key = "battery")
                  : (t.dataset.key = "other"),
      e.appendChild(t));
  });
}
(!(function () {
  // 先行参加URLパラメータチェック (?early=hpEUTp8EgYlkpXUzzNDQ)
  const _earlyParam = new URLSearchParams(window.location.search).get("early");
  if (_earlyParam === "hpEUTp8EgYlkpXUzzNDQ") {
    window.history.replaceState(null, "", window.location.pathname);
    setTimeout(() => _grantAnniv4mEarlyAccess(), 1000);
  }
})(),
!(function () {
  const e = window.location.hash.slice(1);
  if (!e) return;
  const t = new URLSearchParams(e),
    n = t.get("sso_error");
  if (n)
    return (
      window.history.replaceState(null, "", window.location.pathname),
      void setTimeout(() => {
        openSSOLoginModal();
        const e = document.getElementById("sso-error-msg");
        e && (e.textContent = "SSOログイン失敗: " + decodeURIComponent(n));
      }, 300)
    );
  const o = t.get("sso_token");
  o &&
    _fbAuth &&
    (window.history.replaceState(null, "", window.location.pathname),
    _fbAuth.signInWithCustomToken(decodeURIComponent(o)).catch((e) => {
      (console.error("SSO Firebase ログイン失敗:", e),
        setTimeout(() => {
          openSSOLoginModal();
          const t = document.getElementById("sso-error-msg");
          t && (t.textContent = "ログイン処理に失敗しました: " + e.message);
        }, 300));
    }));
})(),
  document.addEventListener("keydown", (e) => {
    document.activeElement !== document.getElementById("ai-input") ||
      "Enter" !== e.key ||
      e.shiftKey ||
      (e.preventDefault(), sendAIMessage());
  }),
  window.addEventListener("load", () => {
    ((history.scrollRestoration = "manual"),
      window.scrollTo({ top: 0, behavior: "instant" }));
    try {
      showRecaptchaCheck();
    } catch (e) {
      console.warn("showRecaptchaCheck error:", e);
    }
    try {
      loadSettings();
    } catch (e) {
      console.warn("loadSettings error:", e);
    }
    try {
      applySettings();
    } catch (e) {
      console.warn("applySettings error:", e);
    }
    ((document.getElementById("b-ua").textContent = navigator.userAgent),
      document
        .getElementById("dl-btn")
        .addEventListener("click", downloadCapturedImage),
      initFirebase(),
      checkFriendCookie() && (loadFriendFromCookie(), updateFriendAuthUI(!0)),
      _restoreAnnivSkin(),
      initAnniversaryEvent(),
      initAnniv4mEvent(),
      document
        .getElementById("friend-code-input")
        ?.addEventListener("keydown", (e) => {
          "Enter" === e.key && checkFriendCode();
        }));
    const e = document.createElement("button");
    ((e.id = "settings-fab"),
      (e.textContent = "⚙️"),
      (e.onclick = openSettings),
      (e.style.cssText =
        "position:fixed;bottom:80px;right:16px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#3a3a3c,#2a2a2a);border:1px solid #444;color:#fff;font-size:1.3rem;cursor:pointer;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;touch-action:manipulation;"),
      document.body.appendChild(e),
      showConsentScreenIfNeeded(),
      _settings.desktopNotify &&
        "undefined" != typeof Notification &&
        "default" === Notification.permission &&
        setTimeout(() => {
          const e =
            tui().notifyPromptReason ||
            "診断完了時にデスクトップ通知でお知らせします。通知を許可しますか？";
          confirm(e)
            ? Notification.requestPermission().then((e) => {
                "granted" !== e
                  ? ((_settings.desktopNotify = !1), saveSettings())
                  : "function" == typeof registerSWAndSubscribe &&
                    registerSWAndSubscribe();
              })
            : ((_settings.desktopNotify = !1), saveSettings());
        }, 3e3),
      _settings.autoCheck && _isProUltra
        ? console.log("✨ AutoCheck enabled for ProUltra user")
        : _settings.autoCheck && !_isProUltra && (_settings.autoCheck = !1));
    try {
      clearBadge();
    } catch (e) {}
    (document.addEventListener("visibilitychange", () => {
      if ("visible" === document.visibilityState)
        try {
          clearBadge();
        } catch (e) {}
    }),
      window.addEventListener("focus", () => {
        try {
          clearBadge();
        } catch (e) {}
      }),
      window.addEventListener("pageshow", () => {
        try {
          clearBadge();
        } catch (e) {}
      }));
  }));
const SETTING_HELP_I18N = {
    ja: {
      theme:
        "アプリの配色を変更します。\n・ダーク：黒背景（デフォルト）\n・ライト：白背景\n・システム：OSの設定に自動追従\n📱 夜間はダーク推奨。",
      fontSize:
        "テキストの大きさを変更します。\n・小：13px / 普通：15px / 大：20px / カスタム：自由設定\n📱 見づらい場合は「大」かカスタムがおすすめです。",
      language:
        "表示言語を切り替えます。選択すると即座に反映されます。\n⚠️ ボタン・診断項目・設定などが翻訳されます。",
      translateGuard:
        "Google翻訳拡張でレイアウトが崩れるのを防ぎます。\nONにするとGoogle翻訳が無効になります。\n💻 PCのChrome拡張がある場合はON推奨。",
      soundOnDone:
        "診断完了時にチャイム音を鳴らします。\n⚠️ サイレントモード中は鳴りません。\n📱 スマートフォン・💻 PC どちらでも動作。",
      vibration:
        "診断完了時に端末を振動させます。\n📱 スマートフォンのみ対応。PCでは動作しません。\n⚠️ iOS Safariでは動作しない場合があります。",
      desktopNotify:
        "診断完了時にブラウザ通知を表示します。\n初回ONで許可ダイアログが表示されます。\n😴 お休み時間中は通知されません。\n💻 PC推奨。スマートフォンはPWA状態で安定。",
      badge:
        "PWAのアイコンにバッジを表示します。\n📱 Android PWAのみ対応。\n❌ iOSは非対応。",
      quietStart:
        "この時刻からお休み時間開始。\nデスクトップ通知を送りません。\nデフォルト：22:00",
      quietEnd:
        "お休み時間の終了時刻。\n開始より早い時刻で日をまたいで適用。\nデフォルト：6:40",
      exportFormat:
        "診断レポートの保存形式。\n・PNG：画像（デフォルト・SNS向け）\n・CSV：表計算ソフト（Excel等）用\n・PDF：印刷用HTMLをPDFとして保存",
      speedUnit:
        "通信速度の表示単位。\n・Mbps：一般的な単位（デフォルト）\n・MB/s：Mbpsの約1/8\n例：100Mbps ≒ 12.5MB/s",
      autoCheck: "ページを開いたとき自動的に診断を開始します。",
      clumsiGuard:
        "再診断ボタンを押したとき確認ダイアログを表示。\n誤タップによるリセットを防げます。\n⚠️ OFFにすると確認なしで即座に再診断。",
      showIpInResult:
        "ONにすると診断結果の画面にIPアドレス(WebRTC)の行を表示します。\nデフォルトはOFF（非表示）です。\n🔒 プライバシー保護のためOFF推奨。",
      fontFamily:
        "フォントの種類を変更します。\nChromeなら端末にインストールされているフォントも選択できます（許可が必要）。",
      fontFamily:
        "アプリ全体のフォントを変更します。\nプリセット5種類から選択できます。\n📱 端末にインストール済みのフォントも選択できます（Chrome対応・要許可）。",
    },
    en: {
      theme:
        "Change the app color scheme.\n・Dark: Black background (default)\n・Light: White background\n・System: Follows OS setting",
      fontSize:
        "Change text size.\n・Small: 13px / Normal: 15px / Large: 20px / Custom: free input\n📱 Use Large or Custom if text is hard to read.",
      language:
        "Switch display language. Changes apply instantly.\n⚠️ Buttons, labels, and settings will be translated.",
      translateGuard:
        "Prevents Google Translate extension from breaking the layout.\nON disables Google Translate.\n💻 Recommended ON if you have Chrome extension.",
      soundOnDone:
        "Play a chime when diagnosis completes.\n⚠️ Silent mode will mute it.\n📱 Works on both mobile and PC.",
      vibration:
        "Vibrate device when diagnosis completes.\n📱 Mobile only. Does not work on PC.\n⚠️ May not work on iOS Safari.",
      desktopNotify:
        "Show browser notification when diagnosis completes.\nPermission dialog appears on first enable.\n😴 No notification during quiet hours.",
      badge:
        "Show badge on app icon.\n📱 Android PWA only.\n❌ iOS not supported.",
      quietStart:
        "Quiet hours start time. No desktop notifications during this period. Default: 22:00",
      quietEnd:
        "Quiet hours end time. Set earlier than start to span midnight. Default: 6:40",
      exportFormat:
        "Report export format.\n・PNG: Image (default, best for sharing)\n・CSV: Spreadsheet (Excel etc.)\n・PDF: Save as PDF via print dialog",
      speedUnit:
        "Network speed display unit.\n・Mbps: Common unit (default)\n・MB/s: ~1/8 of Mbps\nExample: 100Mbps ≈ 12.5MB/s",
      autoCheck: "Automatically start diagnosis when page opens.",
      clumsiGuard:
        "Show confirmation dialog before re-diagnosing.\nPrevents accidental resets.\n⚠️ OFF means immediate re-diagnosis without confirmation.",
      showIpInResult:
        "When ON, shows the IP address (WebRTC) row in diagnosis results.\nDefault is OFF (hidden).\n🔒 Recommended OFF for privacy.",
      fontFamily:
        "Change the font style.\nOn Chrome, you can also pick fonts installed on your device (permission required).",
      fontFamily:
        "Change the font for the entire app.\nChoose from 5 presets.\n📱 Local device fonts also available (Chrome, requires permission).",
    },
  },
  TERMS_I18N = {
    ja: {
      title: "📋 利用規約",
      footer: "利用規約",
      close: "閉じる",
      body: '<h3 style="color:#fff;margin:0 0 12px;">精密デバイス診断 Pro Ultra 利用規約</h3>\n<p>本ウェブアプリ（以下「本サービス」）をご利用いただく前に、以下の利用規約をよくお読みください。「診断を開始する」ボタンを押した時点で、本規約に同意したものとみなします。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. 推奨環境</h4>\n<p>推奨ブラウザは <strong style="color:#34c759;">Google Chrome</strong> です。<br>Safari（特にiOS Safari）では、一部機能（音声・通知・WebGL等）が正常に動作しない場合があります。Safari以外のブラウザの使用を推奨します。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. 取得情報について</h4>\n<p>本サービスは、診断のためにデバイスのハードウェア情報・ブラウザ情報・IPアドレス等を取得します。これらの情報はすべてブラウザ内のみで処理され、当サービスのサーバーには送信されません。ただし、IP取得のため外部API（ipify.org）への通信が発生します。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IPアドレスの取り扱い</h4>\n<p>本サービスでは、WebRTCおよび外部APIを通じてIPアドレスを取得・表示します。<strong style="color:#ff9500;">スクリーンショットにIPアドレスを含めてSNS等に公開した場合、おおよその居住地域や利用プロバイダが特定される危険があります。</strong><br>これにより損害が生じた場合でも、<strong style="color:#ff6b6b;">本ウェブアプリおよびその開発者は一切の責任を負いません。</strong>IPアドレスの公開には十分ご注意ください。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. 診断結果の正確性</h4>\n<p>本サービスの診断結果はブラウザAPIから取得した推定値であり、実際のハードウェアスペックと異なる場合があります。診断結果の正確性を保証するものではありません。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. 免責事項</h4>\n<p>本サービスの利用により生じた損害（データ損失・プライバシー侵害・機器の不具合等）について、開発者は一切の責任を負いません。自己責任のもとでご利用ください。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. 規約の変更について</h4>\n<p>気が向いたり、何か理由があれば規約が変わることがあります。でも大きな変更のときはアップデート情報でちゃんとお知らせするので安心してください。変更後も使い続けてくれたら「了解～」ってことにさせてください🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">最終更新：_TERMS_DATE_ | 精密デバイス診断 Release 1.0.5.2</p>',
    },
    "ja-hira": {
      title: "📋 りようきやく",
      footer: "りようきやく",
      close: "とじる",
      body: '<h3 style="color:#fff;margin:0 0 12px;">せいみつでばいすしんだん Pro Ultra りようきやく</h3>\n<p>このあぷりをつかうまえに、よくよんでください。つかったじてんで、どういしたとみなします。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. すいしょうかんきょう</h4>\n<p>すいしょうぶらうざは <strong style="color:#34c759;">Google Chrome</strong> です。<br>Safari（とくにiOS Safari）では、いちぶのきのうがただしくうごかないことがあります。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. とりあつかうじょうほう</h4>\n<p>このあぷりは、でばいすのじょうほうやIPあどれすをしゅとくします。これらはぶらうざないだけでしょりされ、さーばーにはそうしんされません。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IPあどれすについて</h4>\n<p>すくりーんしょっとにIPあどれすをふくめてこうかいすると、すんでいるばしょがわかるかもしれません。<strong style="color:#ff6b6b;">このあぷりはそのせきにんをおいません。</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. しんだんけっかについて</h4>\n<p>しんだんけっかはすいていちです。じっさいのすぺっくとちがうことがあります。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. めんせきじこう</h4>\n<p>このあぷりをつかってしょうじたそんがいについて、かいはつしゃはせきにんをおいません。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. きやくのへんこう</h4>\n<p>このきやくは、よこくなくかわることがあります。かわったあとにこのあぷりをつかうと、あたらしいきやくにどういしたとみなします。おおきなへんこうのときはあぷでとじょうほうでおしらせします。</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Release 1.0.5.2</p>',
    },
    en: {
      title: "📋 Terms of Use",
      footer: "Terms of Use",
      close: "Close",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Precise Device Diagnostics Pro Ultra — Terms of Use</h3>\n<p>Please read these Terms of Use carefully before using this web application (the "Service"). By pressing the "Start Diagnosis" button, you agree to be bound by these terms.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Recommended Environment</h4>\n<p>The recommended browser is <strong style="color:#34c759;">Google Chrome</strong>.<br>Some features (audio, notifications, WebGL, etc.) may not function correctly in Safari, especially iOS Safari. We recommend using a non-Safari browser.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Information Collected</h4>\n<p>The Service collects device hardware information, browser information, and IP addresses for diagnostic purposes. All data is processed locally in your browser and is never sent to our servers. However, an external API (ipify.org) is used to obtain your public IP address.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IP Address Handling</h4>\n<p>This Service retrieves and displays your IP address via WebRTC and external APIs. <strong style="color:#ff9500;">If you share a screenshot containing your IP address on social media or other public platforms, your approximate location and ISP may be identifiable.</strong><br><strong style="color:#ff6b6b;">The developer of this application accepts no responsibility for any damages arising from such disclosure.</strong> Please exercise caution when sharing your IP address.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Accuracy of Results</h4>\n<p>Diagnostic results are estimates derived from browser APIs and may differ from actual hardware specifications. We do not guarantee the accuracy of any diagnostic results.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Disclaimer</h4>\n<p>The developer accepts no liability for any damages (including data loss, privacy breaches, or device issues) arising from the use of this Service. Use at your own risk.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Changes to Terms</h4>\n<p>We might update these terms occasionally if needed. If anything major changes, we\'ll let you know through the in-app update info. Pressing "Start Diagnosis" after an update means you agree to the revised terms 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Last updated: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    "zh-hans": {
      title: "📋 使用条款",
      footer: "使用条款",
      close: "关闭",
      body: '<h3 style="color:#fff;margin:0 0 12px;">精密设备诊断 Pro Ultra 使用条款</h3>\n<p>在使用本网络应用（以下简称"本服务"）之前，请仔细阅读以下使用条款。点击"开始诊断"按钮，即表示您同意本条款。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. 推荐环境</h4>\n<p>推荐使用 <strong style="color:#34c759;">Google Chrome</strong> 浏览器。<br>Safari（尤其是 iOS Safari）可能无法正常使用部分功能（音频、通知、WebGL等）。建议使用非Safari浏览器。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. 收集的信息</h4>\n<p>本服务为诊断目的收集设备硬件信息、浏览器信息及IP地址。所有数据均在您的浏览器本地处理，不会发送至我们的服务器。但会使用外部API（ipify.org）获取您的公网IP地址。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IP地址处理</h4>\n<p>本服务通过WebRTC和外部API获取并显示您的IP地址。<strong style="color:#ff9500;">如果您将含有IP地址的截图发布到社交媒体等公开平台，可能导致您的大致位置和ISP被识别。</strong><br><strong style="color:#ff6b6b;">因此造成的任何损害，本应用及其开发者概不负责。</strong>请谨慎处理您的IP地址信息。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. 诊断结果的准确性</h4>\n<p>诊断结果是从浏览器API获取的估算值，可能与实际硬件规格有所不同。我们不保证诊断结果的准确性。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. 免责声明</h4>\n<p>因使用本服务而产生的任何损害（包括数据丢失、隐私泄露或设备问题），开发者不承担任何责任。请自行承担使用风险。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. 条款变更</h4>\n<p>如果需要，我们可能会偶尔更新这些条款。有重大变更时，我们会在应用内的更新信息中告知您。继续使用即表示您接受变更 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">最后更新：2026年3月 | Release 1.0.5.2</p>',
    },
    "zh-hant": {
      title: "📋 使用條款",
      footer: "使用條款",
      close: "關閉",
      body: '<h3 style="color:#fff;margin:0 0 12px;">精密裝置診斷 Pro Ultra 使用條款</h3>\n<p>在使用本網路應用程式（以下簡稱「本服務」）之前，請仔細閱讀以下使用條款。按下「開始診斷」按鈕，即表示您同意本條款。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. 推薦環境</h4>\n<p>推薦使用 <strong style="color:#34c759;">Google Chrome</strong> 瀏覽器。<br>Safari（尤其是 iOS Safari）可能無法正常使用部分功能（音訊、通知、WebGL等）。建議使用非Safari瀏覽器。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. 收集的資訊</h4>\n<p>本服務為診斷目的收集裝置硬體資訊、瀏覽器資訊及IP位址。所有資料均在您的瀏覽器本機處理，不會傳送至我們的伺服器。但會使用外部API（ipify.org）取得您的公網IP位址。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IP位址處理</h4>\n<p>本服務透過WebRTC和外部API取得並顯示您的IP位址。<strong style="color:#ff9500;">若您將含有IP位址的截圖發布至社群媒體等公開平台，可能導致您的大致位置和ISP被識別。</strong><br><strong style="color:#ff6b6b;">因此造成的任何損害，本應用程式及其開發者概不負責。</strong>請謹慎處理您的IP位址資訊。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. 診斷結果的準確性</h4>\n<p>診斷結果是從瀏覽器API取得的估算值，可能與實際硬體規格有所不同。我們不保證診斷結果的準確性。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. 免責聲明</h4>\n<p>因使用本服務而產生的任何損害（包括資料遺失、隱私洩露或裝置問題），開發者不承擔任何責任。請自行承擔使用風險。</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. 條款變更</h4>\n<p>如有需要，我們可能會偶爾更新這些條款。有重大變更時，我們會在應用程式內的更新資訊中告知您。繼續使用即表示您接受變更 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">最後更新：_TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    ko: {
      title: "📋 이용약관",
      footer: "이용약관",
      close: "닫기",
      body: '<h3 style="color:#fff;margin:0 0 12px;">정밀 기기 진단 Pro Ultra 이용약관</h3>\n<p>이 웹 애플리케이션(이하 "본 서비스")을 이용하시기 전에 아래 이용약관을 주의 깊게 읽어주세요. 「진단 시작」 버튼을 누르면 본 약관에 동의한 것으로 간주합니다.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. 권장 환경</h4>\n<p>권장 브라우저는 <strong style="color:#34c759;">Google Chrome</strong>입니다.<br>Safari(특히 iOS Safari)에서는 일부 기능(오디오, 알림, WebGL 등)이 정상적으로 작동하지 않을 수 있습니다. Safari 이외의 브라우저 사용을 권장합니다.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. 수집 정보</h4>\n<p>본 서비스는 진단 목적으로 기기 하드웨어 정보, 브라우저 정보 및 IP 주소를 수집합니다. 모든 데이터는 브라우저 내에서만 처리되며 서버로 전송되지 않습니다. 단, 외부 API(ipify.org)를 통해 공인 IP 주소를 가져옵니다.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. IP 주소 처리</h4>\n<p>본 서비스는 WebRTC 및 외부 API를 통해 IP 주소를 가져와 표시합니다. <strong style="color:#ff9500;">IP 주소가 포함된 스크린샷을 SNS 등 공개 플랫폼에 공유하면 대략적인 위치와 ISP가 식별될 수 있습니다.</strong><br><strong style="color:#ff6b6b;">이로 인해 발생한 모든 손해에 대해 본 애플리케이션 및 개발자는 일절 책임지지 않습니다.</strong> IP 주소 공개에 충분히 주의하세요.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. 진단 결과의 정확성</h4>\n<p>진단 결과는 브라우저 API에서 얻은 추정값이며 실제 하드웨어 사양과 다를 수 있습니다. 진단 결과의 정확성을 보장하지 않습니다.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. 면책 사항</h4>\n<p>본 서비스 이용으로 발생한 모든 손해(데이터 손실, 개인정보 침해, 기기 문제 등)에 대해 개발자는 일절 책임지지 않습니다. 자신의 책임 하에 이용하세요.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. 약관 변경</h4>\n<p>필요에 따라 약관이 변경될 수 있어요. 중요한 변경이 있을 때는 앱 내 업데이트 정보로 알려드릴게요. 계속 사용하시면 변경에 동의하신 것으로 볼게요 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">최종 업데이트: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    vi: {
      title: "📋 Điều khoản sử dụng",
      footer: "Điều khoản",
      close: "Đóng",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Chẩn đoán thiết bị chính xác Pro Ultra — Điều khoản sử dụng</h3>\n<p>Vui lòng đọc kỹ Điều khoản sử dụng này trước khi sử dụng ứng dụng web (sau đây gọi là "Dịch vụ"). Bằng cách nhấn nút "Bắt đầu chẩn đoán", bạn đồng ý với các điều khoản này.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Môi trường khuyến nghị</h4>\n<p>Trình duyệt được khuyến nghị là <strong style="color:#34c759;">Google Chrome</strong>.<br>Một số tính năng (âm thanh, thông báo, WebGL, v.v.) có thể không hoạt động đúng trên Safari, đặc biệt là iOS Safari.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Thông tin thu thập</h4>\n<p>Dịch vụ thu thập thông tin phần cứng thiết bị, thông tin trình duyệt và địa chỉ IP cho mục đích chẩn đoán. Tất cả dữ liệu được xử lý cục bộ trong trình duyệt của bạn và không bao giờ được gửi đến máy chủ của chúng tôi. Tuy nhiên, API bên ngoài (ipify.org) được sử dụng để lấy địa chỉ IP công cộng của bạn.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Xử lý địa chỉ IP</h4>\n<p>Dịch vụ này lấy và hiển thị địa chỉ IP của bạn qua WebRTC và API bên ngoài. <strong style="color:#ff9500;">Nếu bạn chia sẻ ảnh chụp màn hình chứa địa chỉ IP lên mạng xã hội hoặc các nền tảng công khai khác, vị trí gần đúng và ISP của bạn có thể bị xác định.</strong><br><strong style="color:#ff6b6b;">Nhà phát triển ứng dụng này không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc tiết lộ đó.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Độ chính xác của kết quả</h4>\n<p>Kết quả chẩn đoán là ước tính từ API trình duyệt và có thể khác với thông số phần cứng thực tế. Chúng tôi không đảm bảo độ chính xác của bất kỳ kết quả chẩn đoán nào.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Miễn trách nhiệm</h4>\n<p>Nhà phát triển không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng Dịch vụ này. Sử dụng theo rủi ro của bạn.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Thay đổi điều khoản</h4>\n<p>Chúng tôi có thể cập nhật điều khoản khi cần. Nếu có thay đổi lớn, chúng tôi sẽ thông báo qua mục cập nhật trong ứng dụng. Nhấn "Bắt đầu chẩn đoán" sau khi cập nhật có nghĩa là bạn đồng ý với các thay đổi 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Cập nhật lần cuối: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    es: {
      title: "📋 Términos de uso",
      footer: "Términos",
      close: "Cerrar",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Diagnóstico de dispositivos Pro Ultra — Términos de uso</h3>\n<p>Lea detenidamente estos Términos de uso antes de utilizar esta aplicación web (el "Servicio"). Al presionar el botón "Iniciar diagnóstico", acepta estar sujeto a estos términos.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Entorno recomendado</h4>\n<p>El navegador recomendado es <strong style="color:#34c759;">Google Chrome</strong>.<br>Algunas funciones (audio, notificaciones, WebGL, etc.) pueden no funcionar correctamente en Safari, especialmente en iOS Safari. Se recomienda usar un navegador distinto a Safari.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Información recopilada</h4>\n<p>El Servicio recopila información de hardware del dispositivo, información del navegador y direcciones IP con fines de diagnóstico. Todos los datos se procesan localmente en su navegador y nunca se envían a nuestros servidores. Sin embargo, se utiliza una API externa (ipify.org) para obtener su dirección IP pública.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Manejo de la dirección IP</h4>\n<p>Este Servicio obtiene y muestra su dirección IP mediante WebRTC y APIs externas. <strong style="color:#ff9500;">Si comparte una captura de pantalla que contiene su dirección IP en redes sociales u otras plataformas públicas, su ubicación aproximada y proveedor de internet podrían ser identificados.</strong><br><strong style="color:#ff6b6b;">El desarrollador de esta aplicación no acepta ninguna responsabilidad por los daños derivados de dicha divulgación.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Precisión de los resultados</h4>\n<p>Los resultados del diagnóstico son estimaciones derivadas de las APIs del navegador y pueden diferir de las especificaciones reales del hardware. No garantizamos la precisión de ningún resultado de diagnóstico.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Exención de responsabilidad</h4>\n<p>El desarrollador no acepta ninguna responsabilidad por los daños (incluyendo pérdida de datos, violaciones de privacidad o problemas con dispositivos) derivados del uso de este Servicio. Úselo bajo su propio riesgo.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Cambios en los términos</h4>\n<p>Podemos actualizar estos términos de vez en cuando si es necesario. Si hay cambios importantes, te avisaremos en la info de actualización de la app. Seguir usando la app significa que estás de acuerdo 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Última actualización: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    pt: {
      title: "📋 Termos de uso",
      footer: "Termos",
      close: "Fechar",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Diagnóstico de dispositivos Pro Ultra — Termos de uso</h3>\n<p>Leia atentamente estes Termos de uso antes de utilizar este aplicativo web (o "Serviço"). Ao pressionar o botão "Iniciar diagnóstico", você concorda em estar vinculado a estes termos.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Ambiente recomendado</h4>\n<p>O navegador recomendado é o <strong style="color:#34c759;">Google Chrome</strong>.<br>Alguns recursos (áudio, notificações, WebGL, etc.) podem não funcionar corretamente no Safari, especialmente no iOS Safari. Recomendamos usar um navegador diferente do Safari.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Informações coletadas</h4>\n<p>O Serviço coleta informações de hardware do dispositivo, informações do navegador e endereços IP para fins de diagnóstico. Todos os dados são processados localmente no seu navegador e nunca são enviados aos nossos servidores. No entanto, uma API externa (ipify.org) é usada para obter seu endereço IP público.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Tratamento do endereço IP</h4>\n<p>Este Serviço obtém e exibe seu endereço IP via WebRTC e APIs externas. <strong style="color:#ff9500;">Se você compartilhar uma captura de tela contendo seu endereço IP em redes sociais ou outras plataformas públicas, sua localização aproximada e ISP podem ser identificados.</strong><br><strong style="color:#ff6b6b;">O desenvolvedor deste aplicativo não aceita nenhuma responsabilidade por danos decorrentes dessa divulgação.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Precisão dos resultados</h4>\n<p>Os resultados do diagnóstico são estimativas derivadas das APIs do navegador e podem diferir das especificações reais do hardware. Não garantimos a precisão de nenhum resultado de diagnóstico.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Isenção de responsabilidade</h4>\n<p>O desenvolvedor não aceita nenhuma responsabilidade por danos (incluindo perda de dados, violações de privacidade ou problemas com dispositivos) decorrentes do uso deste Serviço. Use por sua conta e risco.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Alterações nos termos</h4>\n<p>Podemos atualizar estes termos de vez em quando, se necessário. Se houver mudanças importantes, avisaremos nas informações de atualização do app. Continuar usando significa que você concorda 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Última atualização: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    fr: {
      title: "📋 Conditions d'utilisation",
      footer: "Conditions",
      close: "Fermer",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Diagnostic précis d\'appareil Pro Ultra — Conditions d\'utilisation</h3>\n<p>Veuillez lire attentivement ces Conditions d\'utilisation avant d\'utiliser cette application web (le « Service »). En appuyant sur le bouton « Démarrer le diagnostic », vous acceptez d\'être lié par ces conditions.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Environnement recommandé</h4>\n<p>Le navigateur recommandé est <strong style="color:#34c759;">Google Chrome</strong>.<br>Certaines fonctionnalités (audio, notifications, WebGL, etc.) peuvent ne pas fonctionner correctement sur Safari, en particulier iOS Safari. Nous recommandons d\'utiliser un navigateur autre que Safari.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Informations collectées</h4>\n<p>Le Service collecte des informations sur le matériel de l\'appareil, des informations sur le navigateur et des adresses IP à des fins de diagnostic. Toutes les données sont traitées localement dans votre navigateur et ne sont jamais envoyées à nos serveurs. Cependant, une API externe (ipify.org) est utilisée pour obtenir votre adresse IP publique.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Traitement de l\'adresse IP</h4>\n<p>Ce Service obtient et affiche votre adresse IP via WebRTC et des APIs externes. <strong style="color:#ff9500;">Si vous partagez une capture d\'écran contenant votre adresse IP sur les réseaux sociaux ou d\'autres plateformes publiques, votre emplacement approximatif et votre FAI pourraient être identifiés.</strong><br><strong style="color:#ff6b6b;">Le développeur de cette application n\'accepte aucune responsabilité pour les dommages résultant d\'une telle divulgation.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Précision des résultats</h4>\n<p>Les résultats du diagnostic sont des estimations dérivées des APIs du navigateur et peuvent différer des spécifications matérielles réelles. Nous ne garantissons pas la précision des résultats de diagnostic.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Clause de non-responsabilité</h4>\n<p>Le développeur n\'accepte aucune responsabilité pour les dommages (y compris la perte de données, les violations de la vie privée ou les problèmes d\'appareil) résultant de l\'utilisation de ce Service. Utilisez à vos propres risques.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Modifications des conditions</h4>\n<p>Nous pouvons mettre à jour ces conditions de temps en temps si nécessaire. En cas de changement important, nous vous en informerons via les infos de mise à jour de l\'appli. Continuer à utiliser l\'appli signifie que vous êtes d\'accord 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Dernière mise à jour : _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    de: {
      title: "📋 Nutzungsbedingungen",
      footer: "Nutzungsbedingungen",
      close: "Schließen",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Präzise Gerätediagnose Pro Ultra — Nutzungsbedingungen</h3>\n<p>Bitte lesen Sie diese Nutzungsbedingungen sorgfältig durch, bevor Sie diese Webanwendung (den „Dienst") nutzen. Durch Drücken des Buttons „Diagnose starten" stimmen Sie diesen Bedingungen zu.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Empfohlene Umgebung</h4>\n<p>Der empfohlene Browser ist <strong style="color:#34c759;">Google Chrome</strong>.<br>Einige Funktionen (Audio, Benachrichtigungen, WebGL usw.) funktionieren in Safari, insbesondere iOS Safari, möglicherweise nicht korrekt. Wir empfehlen die Verwendung eines Nicht-Safari-Browsers.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Gesammelte Informationen</h4>\n<p>Der Dienst sammelt Gerätehardwareinformationen, Browserinformationen und IP-Adressen für Diagnosezwecke. Alle Daten werden lokal in Ihrem Browser verarbeitet und niemals an unsere Server gesendet. Es wird jedoch eine externe API (ipify.org) verwendet, um Ihre öffentliche IP-Adresse abzurufen.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Umgang mit IP-Adressen</h4>\n<p>Dieser Dienst ruft Ihre IP-Adresse über WebRTC und externe APIs ab und zeigt sie an. <strong style="color:#ff9500;">Wenn Sie einen Screenshot mit Ihrer IP-Adresse in sozialen Medien oder anderen öffentlichen Plattformen teilen, könnten Ihr ungefährer Standort und Ihr ISP identifiziert werden.</strong><br><strong style="color:#ff6b6b;">Der Entwickler dieser Anwendung übernimmt keine Haftung für Schäden, die durch eine solche Offenlegung entstehen.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Genauigkeit der Ergebnisse</h4>\n<p>Diagnoseergebnisse sind Schätzungen aus Browser-APIs und können von den tatsächlichen Hardwarespezifikationen abweichen. Wir garantieren nicht die Genauigkeit der Diagnoseergebnisse.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Haftungsausschluss</h4>\n<p>Der Entwickler übernimmt keine Haftung für Schäden (einschließlich Datenverlust, Datenschutzverletzungen oder Geräteprobleme), die durch die Nutzung dieses Dienstes entstehen. Nutzung auf eigene Gefahr.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Änderungen der Bedingungen</h4>\n<p>Wir können diese Bedingungen gelegentlich aktualisieren, wenn nötig. Bei wichtigen Änderungen informieren wir dich über die Update-Infos in der App. Die weitere Nutzung bedeutet, dass du einverstanden bist 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Zuletzt aktualisiert: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
    ru: {
      title: "📋 Условия использования",
      footer: "Условия",
      close: "Закрыть",
      body: '<h3 style="color:#fff;margin:0 0 12px;">Точная диагностика устройств Pro Ultra — Условия использования</h3>\n<p>Пожалуйста, внимательно прочитайте настоящие Условия использования перед использованием данного веб-приложения («Сервис»). Нажав кнопку «Начать диагностику», вы соглашаетесь с этими условиями.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">1. Рекомендуемая среда</h4>\n<p>Рекомендуемый браузер — <strong style="color:#34c759;">Google Chrome</strong>.<br>Некоторые функции (звук, уведомления, WebGL и др.) могут работать некорректно в Safari, особенно в iOS Safari. Рекомендуем использовать браузер, отличный от Safari.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">2. Собираемая информация</h4>\n<p>Сервис собирает информацию об аппаратном обеспечении устройства, браузере и IP-адресах в диагностических целях. Все данные обрабатываются локально в вашем браузере и никогда не отправляются на наши серверы. Однако для получения вашего публичного IP-адреса используется внешний API (ipify.org).</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">3. Обработка IP-адреса</h4>\n<p>Данный Сервис получает и отображает ваш IP-адрес через WebRTC и внешние API. <strong style="color:#ff9500;">Если вы поделитесь скриншотом, содержащим ваш IP-адрес, в социальных сетях или других публичных платформах, ваше приблизительное местоположение и провайдер могут быть определены.</strong><br><strong style="color:#ff6b6b;">Разработчик данного приложения не несёт никакой ответственности за ущерб, возникший в результате такого раскрытия информации.</strong></p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">4. Точность результатов</h4>\n<p>Результаты диагностики являются оценками, полученными из API браузера, и могут отличаться от фактических характеристик оборудования. Мы не гарантируем точность результатов диагностики.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">5. Отказ от ответственности</h4>\n<p>Разработчик не несёт ответственности за любой ущерб (включая потерю данных, нарушение конфиденциальности или проблемы с устройствами), возникший в результате использования данного Сервиса. Используйте на свой страх и риск.</p>\n\n<h4 style="color:#eee;margin:16px 0 6px;">6. Изменения условий</h4>\n<p>Мы можем иногда обновлять эти условия при необходимости. О важных изменениях сообщим через обновления в приложении. Продолжение использования означает ваше согласие 🙏</p>\n\n<p style="color:#555;font-size:0.8rem;margin-top:20px;">Последнее обновление: _TERMS_DATE_ | Release 1.0.5.2</p>',
    },
  },
  FORMSPREE_ID = "mojkzbvz";
let _fbDeviceAttach = !0;
const FB_I18N = {
  ja: {
    title: "💬 フィードバック",
    desc: "バグ報告・機能要望など、お気軽にどうぞ。匿名で送信されます。",
    catLabel: "カテゴリ",
    bodyLabel: "内容",
    bodyPlaceholder: "詳しく教えてください...",
    deviceLabel: "デバイス情報を添付する（ランク・スコア等）",
    submit: "📨 送信する",
    sending: "送信中...",
    success: "✅ 送信しました！ありがとうございます。",
    error: "❌ 送信に失敗しました。もう一度お試しください。",
    catBug: "🐛 バグ報告",
    catFeature: "✨ 機能要望",
    catOther: "💭 その他",
    close: "閉じる",
  },
  en: {
    title: "💬 Feedback",
    desc: "Bug reports, feature requests — all welcome. Sent anonymously.",
    catLabel: "Category",
    bodyLabel: "Details",
    bodyPlaceholder: "Please describe in detail...",
    deviceLabel: "Attach device info (rank, score, etc.)",
    submit: "📨 Send",
    sending: "Sending...",
    success: "✅ Sent! Thank you.",
    error: "❌ Failed to send. Please try again.",
    catBug: "🐛 Bug Report",
    catFeature: "✨ Feature Request",
    catOther: "💭 Other",
    close: "Close",
  },
  "zh-hans": {
    title: "💬 反馈",
    desc: "欢迎提交错误报告和功能建议，匿名发送。",
    catLabel: "类别",
    bodyLabel: "内容",
    bodyPlaceholder: "请详细描述...",
    deviceLabel: "附加设备信息（等级、分数等）",
    submit: "📨 发送",
    sending: "发送中...",
    success: "✅ 已发送！感谢您的反馈。",
    error: "❌ 发送失败，请重试。",
    catBug: "🐛 错误报告",
    catFeature: "✨ 功能建议",
    catOther: "💭 其他",
    close: "关闭",
  },
  "zh-hant": {
    title: "💬 回饋",
    desc: "歡迎提交錯誤報告和功能建議，匿名發送。",
    catLabel: "類別",
    bodyLabel: "內容",
    bodyPlaceholder: "請詳細描述...",
    deviceLabel: "附加裝置資訊（等級、分數等）",
    submit: "📨 發送",
    sending: "發送中...",
    success: "✅ 已發送！感謝您的回饋。",
    error: "❌ 發送失敗，請重試。",
    catBug: "🐛 錯誤報告",
    catFeature: "✨ 功能建議",
    catOther: "💭 其他",
    close: "關閉",
  },
  ko: {
    title: "💬 피드백",
    desc: "버그 보고, 기능 요청 등 편하게 보내주세요. 익명으로 전송됩니다.",
    catLabel: "카테고리",
    bodyLabel: "내용",
    bodyPlaceholder: "자세히 설명해 주세요...",
    deviceLabel: "기기 정보 첨부 (등급, 점수 등)",
    submit: "📨 전송",
    sending: "전송 중...",
    success: "✅ 전송되었습니다! 감사합니다.",
    error: "❌ 전송 실패. 다시 시도해 주세요.",
    catBug: "🐛 버그 보고",
    catFeature: "✨ 기능 요청",
    catOther: "💭 기타",
    close: "닫기",
  },
  vi: {
    title: "💬 Phản hồi",
    desc: "Báo lỗi, yêu cầu tính năng — đều được chào đón. Gửi ẩn danh.",
    catLabel: "Danh mục",
    bodyLabel: "Nội dung",
    bodyPlaceholder: "Vui lòng mô tả chi tiết...",
    deviceLabel: "Đính kèm thông tin thiết bị (hạng, điểm, v.v.)",
    submit: "📨 Gửi",
    sending: "Đang gửi...",
    success: "✅ Đã gửi! Cảm ơn bạn.",
    error: "❌ Gửi thất bại. Vui lòng thử lại.",
    catBug: "🐛 Báo lỗi",
    catFeature: "✨ Yêu cầu tính năng",
    catOther: "💭 Khác",
    close: "Đóng",
  },
  es: {
    title: "💬 Comentarios",
    desc: "Informes de errores, solicitudes de funciones — todo bienvenido. Enviado de forma anónima.",
    catLabel: "Categoría",
    bodyLabel: "Detalles",
    bodyPlaceholder: "Por favor describe con detalle...",
    deviceLabel: "Adjuntar info del dispositivo (rango, puntuación, etc.)",
    submit: "📨 Enviar",
    sending: "Enviando...",
    success: "✅ ¡Enviado! Gracias.",
    error: "❌ Error al enviar. Inténtalo de nuevo.",
    catBug: "🐛 Reporte de error",
    catFeature: "✨ Solicitud de función",
    catOther: "💭 Otro",
    close: "Cerrar",
  },
  pt: {
    title: "💬 Feedback",
    desc: "Relatórios de bugs, solicitações de recursos — tudo bem-vindo. Enviado anonimamente.",
    catLabel: "Categoria",
    bodyLabel: "Detalhes",
    bodyPlaceholder: "Por favor descreva em detalhes...",
    deviceLabel: "Anexar info do dispositivo (rank, pontuação, etc.)",
    submit: "📨 Enviar",
    sending: "Enviando...",
    success: "✅ Enviado! Obrigado.",
    error: "❌ Falha ao enviar. Tente novamente.",
    catBug: "🐛 Relatório de bug",
    catFeature: "✨ Solicitação de recurso",
    catOther: "💭 Outro",
    close: "Fechar",
  },
  fr: {
    title: "💬 Commentaires",
    desc: "Rapports de bugs, demandes de fonctionnalités — tout est bienvenu. Envoyé anonymement.",
    catLabel: "Catégorie",
    bodyLabel: "Détails",
    bodyPlaceholder: "Veuillez décrire en détail...",
    deviceLabel: "Joindre les infos de l'appareil (rang, score, etc.)",
    submit: "📨 Envoyer",
    sending: "Envoi en cours...",
    success: "✅ Envoyé ! Merci.",
    error: "❌ Échec de l'envoi. Veuillez réessayer.",
    catBug: "🐛 Rapport de bug",
    catFeature: "✨ Demande de fonctionnalité",
    catOther: "💭 Autre",
    close: "Fermer",
  },
  de: {
    title: "💬 Feedback",
    desc: "Fehlerberichte, Funktionswünsche — alles willkommen. Anonym gesendet.",
    catLabel: "Kategorie",
    bodyLabel: "Details",
    bodyPlaceholder: "Bitte beschreiben Sie im Detail...",
    deviceLabel: "Geräteinformationen anhängen (Rang, Score, etc.)",
    submit: "📨 Senden",
    sending: "Wird gesendet...",
    success: "✅ Gesendet! Danke.",
    error: "❌ Senden fehlgeschlagen. Bitte erneut versuchen.",
    catBug: "🐛 Fehlerbericht",
    catFeature: "✨ Funktionswunsch",
    catOther: "💭 Sonstiges",
    close: "Schließen",
  },
  ru: {
    title: "💬 Обратная связь",
    desc: "Отчёты об ошибках, пожелания — всё приветствуется. Отправляется анонимно.",
    catLabel: "Категория",
    bodyLabel: "Описание",
    bodyPlaceholder: "Пожалуйста, опишите подробно...",
    deviceLabel: "Прикрепить информацию об устройстве (ранг, счёт и т.д.)",
    submit: "📨 Отправить",
    sending: "Отправка...",
    success: "✅ Отправлено! Спасибо.",
    error: "❌ Ошибка отправки. Попробуйте ещё раз.",
    catBug: "🐛 Сообщение об ошибке",
    catFeature: "✨ Пожелание",
    catOther: "💭 Другое",
    close: "Закрыть",
  },
  "ja-hira": {
    title: "💬 ふぃーどばっく",
    desc: "ばぐほうこくやきのうようぼうなど、きがるにどうぞ。とくめいでそうしんされます。",
    catLabel: "かてごり",
    bodyLabel: "ないよう",
    bodyPlaceholder: "くわしくおしえてください...",
    deviceLabel: "でばいすじょうほうをてんぷする",
    submit: "📨 そうしんする",
    sending: "そうしんちゅう...",
    success: "✅ そうしんしました！",
    error: "❌ そうしんしっぱい。もういちどおためしください。",
    catBug: "🐛 ばぐほうこく",
    catFeature: "✨ きのうようぼう",
    catOther: "💭 そのほか",
    close: "とじる",
  },
};
function _fbT() {
  return FB_I18N[_settings.language] || FB_I18N.ja;
}
function openFeedback() {
  const e = _fbT(),
    t = document.getElementById("feedback-modal");
  ((document.getElementById("feedback-title").textContent = e.title),
    (document.getElementById("feedback-desc").textContent = e.desc),
    (document.getElementById("feedback-cat-label").textContent = e.catLabel),
    (document.getElementById("feedback-body-label").textContent = e.bodyLabel),
    (document.getElementById("feedback-body").placeholder = e.bodyPlaceholder),
    (document.getElementById("feedback-device-label").textContent =
      e.deviceLabel),
    (document.getElementById("feedback-submit-label").textContent = e.submit),
    (document.getElementById("feedback-status").textContent = ""));
  const n = document.getElementById("feedback-cats");
  ((n.children[0].textContent = e.catBug),
    (n.children[1].textContent = e.catFeature),
    (n.children[2].textContent = e.catOther),
    (_fbDeviceAttach = !0),
    _updateFbDeviceToggle(),
    (document.getElementById("feedback-body").value = ""),
    document
      .querySelectorAll(".fb-cat")
      .forEach((e, t) => e.classList.toggle("active", 0 === t)),
    (t.style.display = "flex"),
    (document.body.style.overflow = "hidden"),
    (t.onclick = (e) => {
      e.target === t && closeFeedback();
    }));
}
function closeFeedback() {
  const e = document.getElementById("feedback-modal");
  (e && (e.style.display = "none"), (document.body.style.overflow = ""));
}
function selectFbCat(e) {
  (document
    .querySelectorAll(".fb-cat")
    .forEach((e) => e.classList.remove("active")),
    e.classList.add("active"));
}
function toggleFbDevice() {
  ((_fbDeviceAttach = !_fbDeviceAttach), _updateFbDeviceToggle());
}
function _updateFbDeviceToggle() {
  const e = document.getElementById("fb-device-toggle"),
    t = document.getElementById("fb-device-thumb");
  e &&
    t &&
    ((e.style.background = _fbDeviceAttach ? "#34c759" : "#555"),
    (t.style.right = _fbDeviceAttach ? "2px" : "auto"),
    (t.style.left = _fbDeviceAttach ? "auto" : "2px"));
}
async function submitFeedback() {
  const e = _fbT(),
    t = document.getElementById("feedback-body").value.trim(),
    n = document.querySelector(".fb-cat.active"),
    o = (n && n.getAttribute("data-val"), n ? n.textContent.trim() : "other"),
    i = document.getElementById("feedback-status"),
    a = document.getElementById("feedback-submit");
  if (!t)
    return (
      (i.style.color = "#ff6b6b"),
      void (i.textContent = "内容を入力してください。")
    );
  let r = "";
  if (_fbDeviceAttach) {
    const e = document.getElementById("rank-letter")?.textContent || "?",
      t = document.getElementById("eval-msg")?.textContent || "",
      n = _settings.language,
      o = navigator.userAgent.slice(0, 120);
    r = `\n\n--- Device Info ---\nRank: ${{ S: "🔴 S", A: "🟠 A", B: "🟢 B", C: "🔵 C", D: "⚫ D" }[e] || e}\n${t}\nLang: ${n}\nUA: ${o}`;
  }
  ((a.disabled = !0),
    (document.getElementById("feedback-submit-label").textContent = e.sending),
    (i.textContent = ""));
  try {
    const n = await fetch("https://formspree.io/f/mojkzbvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          category: o,
          message: t + r,
          _subject: `[ProUltra Feedback] ${o}`,
        }),
      }),
      a = await n.json().catch(() => ({}));
    if (!n.ok) {
      const e =
        a.errors?.map((e) => e.message).join(", ") || `HTTP ${n.status}`;
      throw new Error(e);
    }
    ((i.style.color = "#34c759"),
      (i.textContent = e.success),
      _progressMission("feedback"),
      (document.getElementById("feedback-body").value = ""),
      setTimeout(() => closeFeedback(), 2e3));
  } catch (t) {
    ((i.style.color = "#ff6b6b"),
      (i.textContent = e.error + " (" + (t.message || "unknown") + ")"));
  } finally {
    ((a.disabled = !1),
      (document.getElementById("feedback-submit-label").textContent =
        e.submit));
  }
}
function openTerms() {
  const e = _settings.language,
    t = TERMS_I18N[e] || TERMS_I18N.ja,
    n = document.getElementById("terms-modal");
  document.getElementById("terms-title").textContent = t.title;
  const o = new Date(),
    i =
      o.getFullYear() +
      "/" +
      String(o.getMonth() + 1).padStart(2, "0") +
      "/" +
      String(o.getDate()).padStart(2, "0");
  ((document.getElementById("terms-body").innerHTML = t.body.replace(
    /_TERMS_DATE_/g,
    i,
  )),
    (n.style.display = "flex"),
    (document.body.style.overflow = "hidden"),
    (n.onclick = (e) => {
      e.target === n && closeTerms();
    }));
}
function closeTerms() {
  const e = document.getElementById("terms-modal");
  (e && (e.style.display = "none"), (document.body.style.overflow = ""));
}
const HELP_TEXT_I18N = {
    ja: [
      "CPUの論理コア数です。多いほど同時に多くの処理を並列実行できます。一般的な作業では4〜8コアで十分です。",
      "端末の物理メモリ（RAM）容量です。多いほど複数のアプリやタブを同時に快適に動かせます。",
      "GPUの種類・製品名です。グラフィック性能の目安になります。Apple GPU・NVIDIA・AMD・Intel等。",
      "GPUが一度に扱える画像（テクスチャ）の最大サイズです。大きいほど高精細な3D描画が可能です。",
      "このアプリによるCPU演算性能の実測値です。0〜100点で評価。75点以上が高性能の目安です。",
      "WebGLシェーダーとCanvas描画によるGPU性能の実測値です。0〜100点で評価します。",
      "メモリへの読み書き速度の実測値です。0〜100点で評価。低いと処理全体が遅くなります。",
      "実際に計測した1秒間の平均フレーム数です。60FPS以上で滑らかな動作と感じられます。",
      "最も重い場面での1%低フレーム数です。低いほどカクつきが目立ちます。55FPS以上が快適の目安。",
      "ディスプレイの1秒間の画面更新回数の推定値です。60Hz・120Hz・144Hzなど。",
      "物理的なピクセル数による実解像度です。DPRを掛けた値で、実際の表示精細さを示します。",
      "論理ピクセルと物理ピクセルの比率です。2x以上がRetinaディスプレイ相当で高精細です。",
      "色の表現力（ビット深度）とHDR対応の有無です。24bit以上・HDR対応が高品質の目安。",
      "JavaScriptが使用できる最大メモリ量です。大きいほど重い処理をこなせます。Firefoxは非対応。",
      "UIスレッドの応答遅延時間です。中央値が低いほどタップ・クリックへの反応が速いです。",
      "複数サーバーへのPingと計測ブレ（ジッター）をもとにゲームに向いているか判定します。Ping30ms以下・ジッター30ms以下が最適です。",
      "遅延とジッターをもとにビデオ通話（Zoom・Teamsなど）に向いているか判定します。遅延60ms以下・安定していると最適です。",
      "現在のバッテリー残量と充電状態です。残量20%未満・非充電の場合はランクが下がります。",
      "同時に認識できるタッチ点数です。10点以上がマルチタッチ対応の目安です。",
      "ダークモードとハイコントラストモードの設定状態です。OSの設定を反映しています。",
      "通信がHTTPS（暗号化）で行われているかどうかです。現代のWebでは必須の安全対策です。",
      "Cookieの有効状態とIndexedDB（ブラウザ内データベース）の対応状況です。",
      "WebGLのバージョンです。2.0が最新・高機能。非対応の場合は3D描画ができません。",
      "GPUが一度に処理できる頂点属性の最大数です。16以上が高性能GPUの目安です。",
      "WakeLock（画面維持）とVibration（振動）APIの対応状況です。主にモバイル向け機能。",
      "PWA（ホーム画面追加）とService Worker（オフライン機能）の対応状況です。",
      "WebDriverによる自動操縦（ボット）が検知されているかどうかです。通常は「正常」です。",
      "フレームレートの安定性スコアです。0〜100点で評価。高いほどカクつきが少ない安定した動作です。",
      "端末に設定されている言語とタイムゾーンです。情報として表示しています。",
      "このアプリの診断エンジンのバージョンです。",
      "WebRTCで取得したIPアドレスです。おおよその地域や利用プロバイダの特定に使われる場合があります。",
      "OSのダークモード設定とハイコントラスト設定の状態です。",
      "現在使用しているブラウザの種類です。",
      "UAから推定した端末の機種名です。Safariでは詳細なモデルが取得できない場合があります。",
      "ブラウザが使用しているストレージ容量と残り容量です。使用率が高い場合は不要なデータを削除するとパフォーマンスが改善します。",
      "WebAssemblyの対応状況とコンパイル速度です。対応していると重いゲームや処理が高速に動作します。",
      "ブラウザの通知許可状態です。許可済みならアプリからの通知が届きます。ブロック中は設定から変更できます。",
    ],
    en: [
      "Number of CPU logical cores. More cores allow more parallel processing. 4-8 cores is sufficient for general tasks.",
      "Physical RAM capacity. More RAM lets you run more apps and tabs simultaneously.",
      "GPU model name. Indicates graphics performance. Apple GPU, NVIDIA, AMD, Intel, etc.",
      "Maximum texture size the GPU can handle. Larger = higher-quality 3D rendering.",
      "CPU benchmark score measured by this app. 0-100. 75+ is high performance.",
      "GPU rendering score via WebGL shaders and Canvas. 0-100 scale.",
      "Memory read/write speed score. 0-100. Low scores slow down overall performance.",
      "Measured average frames per second. 60+ FPS feels smooth.",
      "1% low frame rate. Lower = more noticeable stuttering. 55+ FPS is comfortable.",
      "Estimated display refresh rate. 60Hz, 120Hz, 144Hz, etc.",
      "Physical pixel resolution. Higher = sharper display.",
      "Ratio of logical to physical pixels. 2x+ is Retina-equivalent.",
      "Color bit depth and HDR support. 24bit+ with HDR is high quality.",
      "Maximum JS heap memory. Larger = can handle heavier processing. Firefox unsupported.",
      "UI thread response latency. Lower median = faster tap/click response.",
      "Measures Ping and jitter to multiple servers to judge if your connection is suitable for gaming. Ping ≤30ms and jitter ≤30ms is ideal.",
      "Judges suitability for video calls (Zoom, Teams, etc.) based on latency and stability. Latency ≤60ms and stable is ideal.",
      "Battery level and charging status. Below 20% uncharged lowers your rank.",
      "Number of simultaneous touch points. 10+ supports full multi-touch.",
      "Dark mode and high contrast mode state from OS settings.",
      "Whether connection uses HTTPS encryption. Essential for modern web security.",
      "Cookie enabled state and IndexedDB support.",
      "WebGL version. 2.0 is latest. No support means no 3D rendering.",
      "Max GPU vertex attributes. 16+ indicates a capable GPU.",
      "WakeLock (keep screen on) and Vibration API support. Mainly mobile features.",
      "PWA (add to home screen) and Service Worker (offline) support.",
      'Whether WebDriver automation (bot) is detected. Normally "Normal".',
      "Frame rate stability score. 0-100. Higher = less stuttering.",
      "System language and timezone settings.",
      "Diagnostic engine version of this app.",
      "IP address obtained via WebRTC. May reveal approximate location/ISP.",
      "OS dark mode and high contrast settings.",
      "Current browser being used.",
      "Device model estimated from UA. Detailed model may not be available in Safari.",
      "Storage space used by this browser. High usage may slow performance — clearing unused data can help.",
      "WebAssembly support and compile speed. Supported = heavy games and apps run faster.",
      "Browser notification permission status. Granted = notifications work. Denied = change in browser settings.",
    ],
    "zh-hans": [
      "CPU逻辑核心数。越多则可同时处理更多任务。日常使用4-8核已足够。",
      "物理内存(RAM)容量。越大则可同时运行更多应用和标签页。",
      "GPU型号名称。表示图形性能。Apple GPU、NVIDIA、AMD、Intel等。",
      "GPU可处理的最大纹理尺寸。越大则可进行更高精度的3D渲染。",
      "本应用测量的CPU基准分数。0-100分，75分以上为高性能。",
      "通过WebGL着色器和Canvas测量的GPU渲染分数。0-100分。",
      "内存读写速度分数。0-100分。分数低会导致整体处理速度变慢。",
      "实测平均每秒帧数。60FPS以上感觉流畅。",
      "1%低帧率。越低则卡顿越明显。55FPS以上为舒适标准。",
      "显示器刷新率估计值。60Hz、120Hz、144Hz等。",
      "物理像素分辨率。越高则显示越清晰。",
      "逻辑像素与物理像素的比值。2倍以上相当于Retina屏。",
      "色彩位深和HDR支持情况。24bit以上且支持HDR为高品质。",
      "JavaScript可用的最大堆内存。越大则可处理更重的任务。Firefox不支持。",
      "UI线程响应延迟。中位值越低则点击响应越快。",
      "通过实际下载测量的网络速度。100Mbps以上为高速。",
      "浏览器识别的连接类型和API报告带宽。4G、WiFi等。仅供参考。",
      "当前电池电量和充电状态。低于20%且未充电时会降低评级。",
      "可同时识别的触控点数量。10点以上支持完整多点触控。",
      "操作系统深色模式和高对比度模式的设置状态。",
      "连接是否使用HTTPS加密。现代网络安全的必要措施。",
      "Cookie启用状态和IndexedDB支持情况。",
      "WebGL版本。2.0为最新版本。不支持则无法进行3D渲染。",
      "GPU最大顶点属性数。16以上表示GPU性能较强。",
      "WakeLock(保持屏幕常亮)和振动API支持情况。主要为移动端功能。",
      "PWA(添加到主屏幕)和Service Worker(离线功能)支持情况。",
      '是否检测到WebDriver自动化(机器人)操作。正常情况下为"正常"。',
      "帧率稳定性分数。0-100分。越高则卡顿越少。",
      "系统语言和时区设置。",
      "本应用的诊断引擎版本。",
      "通过WebRTC获取的IP地址。可能用于推断大致位置或ISP。",
      "操作系统深色模式和高对比度设置状态。",
      "当前使用的浏览器。",
      "从UA推断的设备型号。Safari可能无法获取详细型号。",
    ],
    "zh-hant": [
      "CPU邏輯核心數。越多則可同時處理更多任務。日常使用4-8核已足夠。",
      "物理記憶體(RAM)容量。越大則可同時執行更多應用程式和分頁。",
      "GPU型號名稱。表示圖形效能。Apple GPU、NVIDIA、AMD、Intel等。",
      "GPU可處理的最大紋理尺寸。越大則可進行更高精度的3D渲染。",
      "本應用程式測量的CPU基準分數。0-100分，75分以上為高效能。",
      "透過WebGL著色器和Canvas測量的GPU渲染分數。0-100分。",
      "記憶體讀寫速度分數。0-100分。分數低會導致整體處理速度變慢。",
      "實測平均每秒影格數。60FPS以上感覺流暢。",
      "1%低影格率。越低則卡頓越明顯。55FPS以上為舒適標準。",
      "顯示器更新率估計值。60Hz、120Hz、144Hz等。",
      "物理像素解析度。越高則顯示越清晰。",
      "邏輯像素與物理像素的比值。2倍以上相當於Retina螢幕。",
      "色彩位深和HDR支援情況。24bit以上且支援HDR為高品質。",
      "JavaScript可用的最大堆積記憶體。越大則可處理更重的任務。Firefox不支援。",
      "UI執行緒回應延遲。中位值越低則點擊回應越快。",
      "透過實際下載測量的網路速度。100Mbps以上為高速。",
      "瀏覽器識別的連線類型和API報告頻寬。4G、WiFi等。僅供參考。",
      "目前電池電量和充電狀態。低於20%且未充電時會降低評級。",
      "可同時識別的觸控點數量。10點以上支援完整多點觸控。",
      "作業系統深色模式和高對比度模式的設定狀態。",
      "連線是否使用HTTPS加密。現代網路安全的必要措施。",
      "Cookie啟用狀態和IndexedDB支援情況。",
      "WebGL版本。2.0為最新版本。不支援則無法進行3D渲染。",
      "GPU最大頂點屬性數。16以上表示GPU效能較強。",
      "WakeLock(保持螢幕常亮)和振動API支援情況。主要為行動端功能。",
      "PWA(新增到主畫面)和Service Worker(離線功能)支援情況。",
      "是否偵測到WebDriver自動化(機器人)操作。正常情況下為「正常」。",
      "影格率穩定性分數。0-100分。越高則卡頓越少。",
      "系統語言和時區設定。",
      "本應用程式的診斷引擎版本。",
      "透過WebRTC取得的IP位址。可能用於推斷大致位置或ISP。",
      "作業系統深色模式和高對比度設定狀態。",
      "目前使用的瀏覽器。",
      "從UA推斷的裝置型號。Safari可能無法取得詳細型號。",
    ],
    ko: [
      "CPU 논리 코어 수입니다. 많을수록 더 많은 작업을 병렬 처리할 수 있습니다.",
      "물리적 RAM 용량입니다. 클수록 더 많은 앱과 탭을 동시에 실행할 수 있습니다.",
      "GPU 모델명입니다. 그래픽 성능의 기준이 됩니다.",
      "GPU가 처리할 수 있는 최대 텍스처 크기입니다. 클수록 고화질 3D 렌더링이 가능합니다.",
      "이 앱이 측정한 CPU 벤치마크 점수입니다. 0-100점, 75점 이상이 고성능 기준입니다.",
      "WebGL 셰이더와 Canvas로 측정한 GPU 렌더링 점수입니다. 0-100점.",
      "메모리 읽기/쓰기 속도 점수입니다. 낮으면 전체 처리 속도가 느려집니다.",
      "실측 평균 초당 프레임 수입니다. 60FPS 이상이면 부드럽게 느껴집니다.",
      "1% 저프레임율입니다. 낮을수록 끊김이 두드러집니다. 55FPS 이상이 쾌적 기준.",
      "디스플레이 주사율 추정값입니다. 60Hz, 120Hz, 144Hz 등.",
      "물리적 픽셀 해상도입니다. 높을수록 화면이 선명합니다.",
      "논리 픽셀 대 물리 픽셀 비율입니다. 2배 이상이 레티나 디스플레이 수준입니다.",
      "색상 비트 심도와 HDR 지원 여부입니다. 24비트 이상 + HDR이 고품질 기준.",
      "JavaScript가 사용할 수 있는 최대 힙 메모리입니다. Firefox는 미지원.",
      "UI 스레드 응답 지연 시간입니다. 중앙값이 낮을수록 탭/클릭 반응이 빠릅니다.",
      "실제 다운로드로 측정한 네트워크 속도입니다. 100Mbps 이상이 고속 기준.",
      "브라우저가 인식하는 연결 유형과 API 보고 대역폭입니다. 4G, WiFi 등. 참고값.",
      "현재 배터리 잔량과 충전 상태입니다. 20% 미만 비충전 시 등급이 하락합니다.",
      "동시에 인식 가능한 터치 포인트 수입니다. 10개 이상이 멀티터치 지원 기준.",
      "운영체제의 다크 모드 및 고대비 모드 설정 상태입니다.",
      "연결이 HTTPS 암호화를 사용하는지 여부입니다. 현대 웹 보안의 필수 요소.",
      "Cookie 활성화 상태와 IndexedDB 지원 여부입니다.",
      "WebGL 버전입니다. 2.0이 최신. 미지원 시 3D 렌더링 불가.",
      "GPU 최대 정점 속성 수입니다. 16 이상이 고성능 GPU 기준.",
      "WakeLock(화면 유지)과 진동 API 지원 여부입니다. 주로 모바일 기능.",
      "PWA(홈 화면 추가)와 Service Worker(오프라인 기능) 지원 여부입니다.",
      'WebDriver 자동화(봇) 감지 여부입니다. 정상적으로는 "정상"으로 표시됩니다.',
      "프레임율 안정성 점수입니다. 0-100점, 높을수록 끊김이 적습니다.",
      "시스템 언어 및 시간대 설정입니다.",
      "이 앱의 진단 엔진 버전입니다.",
      "WebRTC로 얻은 IP 주소입니다. 대략적인 위치나 ISP 파악에 사용될 수 있습니다.",
      "운영체제 다크 모드 및 고대비 설정 상태입니다.",
      "현재 사용 중인 브라우저입니다.",
      "UA에서 추정한 기기 모델입니다. Safari에서는 상세 모델을 확인하지 못할 수 있습니다.",
    ],
    vi: [
      "Số nhân logic CPU. Càng nhiều càng xử lý được nhiều tác vụ song song.",
      "Dung lượng RAM vật lý. Càng lớn càng chạy được nhiều ứng dụng và tab cùng lúc.",
      "Tên model GPU. Thể hiện hiệu suất đồ họa.",
      "Kích thước texture tối đa GPU có thể xử lý. Càng lớn càng render 3D chất lượng cao.",
      "Điểm benchmark CPU do ứng dụng đo. 0-100, từ 75 trở lên là hiệu suất cao.",
      "Điểm GPU qua WebGL shader và Canvas. Thang 0-100.",
      "Điểm tốc độ đọc/ghi bộ nhớ. Thấp sẽ làm chậm toàn bộ xử lý.",
      "FPS trung bình thực đo. Từ 60FPS trở lên cảm thấy mượt.",
      "FPS 1% thấp nhất. Càng thấp càng giật lag. Từ 55FPS trở lên là thoải mái.",
      "Tần số quét màn hình ước tính. 60Hz, 120Hz, 144Hz...",
      "Độ phân giải pixel vật lý. Càng cao màn hình càng sắc nét.",
      "Tỷ lệ pixel logic/vật lý. Từ 2x trở lên tương đương Retina.",
      "Độ sâu màu và hỗ trợ HDR. 24bit trở lên + HDR là chất lượng cao.",
      "Bộ nhớ JS heap tối đa. Càng lớn xử lý tác vụ nặng càng tốt. Firefox không hỗ trợ.",
      "Độ trễ UI thread. Trung vị càng thấp phản hồi chạm/click càng nhanh.",
      "Tốc độ mạng đo thực tế bằng download. Từ 100Mbps trở lên là nhanh.",
      "Loại kết nối và băng thông API báo cáo. 4G, WiFi... Giá trị tham khảo.",
      "Mức pin và trạng thái sạc. Dưới 20% không sạc sẽ giảm xếp hạng.",
      "Số điểm chạm đồng thời. Từ 10 trở lên hỗ trợ đa điểm chạm.",
      "Trạng thái chế độ tối và độ tương phản cao từ cài đặt hệ điều hành.",
      "Kết nối có dùng mã hóa HTTPS không. Bảo mật thiết yếu cho web hiện đại.",
      "Trạng thái Cookie và hỗ trợ IndexedDB.",
      "Phiên bản WebGL. 2.0 là mới nhất. Không hỗ trợ thì không render 3D được.",
      "Số thuộc tính đỉnh tối đa GPU. Từ 16 trở lên là GPU mạnh.",
      "Hỗ trợ WakeLock (giữ màn hình sáng) và Vibration API. Chủ yếu dành cho mobile.",
      "Hỗ trợ PWA (thêm vào màn hình chính) và Service Worker (ngoại tuyến).",
      'Có phát hiện tự động hóa WebDriver (bot) không. Thường sẽ hiển thị "Bình thường".',
      "Điểm ổn định frame rate. 0-100. Càng cao càng ít giật.",
      "Ngôn ngữ và múi giờ hệ thống.",
      "Phiên bản engine chẩn đoán của ứng dụng.",
      "Địa chỉ IP qua WebRTC. Có thể dùng để xác định vị trí gần đúng hoặc ISP.",
      "Trạng thái chế độ tối và độ tương phản cao của hệ điều hành.",
      "Trình duyệt đang sử dụng.",
      "Model thiết bị ước tính từ UA. Safari có thể không lấy được model chi tiết.",
    ],
    es: [
      "Número de núcleos lógicos del CPU. Más núcleos permiten más procesamiento en paralelo.",
      "Capacidad de RAM física. Más RAM permite ejecutar más apps y pestañas simultáneamente.",
      "Nombre del modelo de GPU. Indica el rendimiento gráfico.",
      "Tamaño máximo de textura que puede manejar la GPU. Mayor = mejor renderizado 3D.",
      "Puntuación benchmark de CPU medida por esta app. 0-100, 75+ es alto rendimiento.",
      "Puntuación de renderizado GPU via WebGL shaders y Canvas. Escala 0-100.",
      "Puntuación de velocidad de lectura/escritura de memoria. Baja puntación ralentiza todo.",
      "FPS promedio medido. 60+ FPS se siente fluido.",
      "FPS 1% bajo. Más bajo = más tirones visibles. 55+ FPS es cómodo.",
      "Tasa de refresco estimada. 60Hz, 120Hz, 144Hz, etc.",
      "Resolución en píxeles físicos. Mayor = pantalla más nítida.",
      "Relación de píxeles lógicos vs físicos. 2x+ equivale a pantalla Retina.",
      "Profundidad de color y soporte HDR. 24bit+ con HDR es alta calidad.",
      "Memoria heap JS máxima. Mayor = puede manejar tareas más pesadas. Firefox no compatible.",
      "Latencia del hilo UI. Mediana más baja = respuesta más rápida al toque/clic.",
      "Velocidad de red medida por descarga real. 100Mbps+ es rápido.",
      "Tipo de conexión y ancho de banda reportado por API. 4G, WiFi, etc. Valor de referencia.",
      "Nivel de batería y estado de carga. Menos del 20% sin cargar baja el rango.",
      "Número de puntos táctiles simultáneos. 10+ soporta multitáctil completo.",
      "Estado del modo oscuro y alto contraste de la configuración del SO.",
      "Si la conexión usa cifrado HTTPS. Seguridad esencial para la web moderna.",
      "Estado habilitado de cookies y soporte IndexedDB.",
      "Versión de WebGL. 2.0 es la más reciente. Sin soporte = sin renderizado 3D.",
      "Atributos de vértice máximos de GPU. 16+ indica GPU capaz.",
      "Soporte WakeLock (mantener pantalla encendida) y API de vibración. Principalmente móvil.",
      "Soporte PWA (añadir a pantalla de inicio) y Service Worker (offline).",
      'Si se detecta automatización WebDriver (bot). Normalmente "Normal".',
      "Puntuación de estabilidad de frame rate. 0-100. Mayor = menos tirones.",
      "Configuración de idioma del sistema y zona horaria.",
      "Versión del motor de diagnóstico de esta app.",
      "Dirección IP obtenida via WebRTC. Puede revelar ubicación aproximada/ISP.",
      "Estado del modo oscuro y alto contraste del SO.",
      "Navegador actual en uso.",
      "Modelo del dispositivo estimado desde UA. Safari puede no mostrar modelo detallado.",
    ],
    pt: [
      "Número de núcleos lógicos do CPU. Mais núcleos permitem mais processamento paralelo.",
      "Capacidade de RAM física. Mais RAM permite executar mais apps e abas simultaneamente.",
      "Nome do modelo de GPU. Indica o desempenho gráfico.",
      "Tamanho máximo de textura que a GPU pode processar. Maior = melhor renderização 3D.",
      "Pontuação benchmark de CPU medida por este app. 0-100, 75+ é alto desempenho.",
      "Pontuação de renderização GPU via WebGL shaders e Canvas. Escala 0-100.",
      "Pontuação de velocidade de leitura/escrita de memória. Baixa pontuação desacelera tudo.",
      "FPS médio medido. 60+ FPS parece fluido.",
      "FPS 1% baixo. Mais baixo = mais travamentos visíveis. 55+ FPS é confortável.",
      "Taxa de atualização estimada. 60Hz, 120Hz, 144Hz, etc.",
      "Resolução em pixels físicos. Maior = tela mais nítida.",
      "Relação de pixels lógicos vs físicos. 2x+ equivale a tela Retina.",
      "Profundidade de cor e suporte HDR. 24bit+ com HDR é alta qualidade.",
      "Memória heap JS máxima. Maior = pode lidar com tarefas mais pesadas. Firefox não suportado.",
      "Latência do thread de UI. Mediana mais baixa = resposta mais rápida ao toque/clique.",
      "Velocidade de rede medida por download real. 100Mbps+ é rápido.",
      "Tipo de conexão e largura de banda reportada por API. 4G, WiFi, etc. Valor de referência.",
      "Nível de bateria e status de carga. Abaixo de 20% sem carregar baixa a classificação.",
      "Número de pontos de toque simultâneos. 10+ suporta multitoque completo.",
      "Estado do modo escuro e alto contraste das configurações do SO.",
      "Se a conexão usa criptografia HTTPS. Segurança essencial para a web moderna.",
      "Estado habilitado de cookies e suporte IndexedDB.",
      "Versão do WebGL. 2.0 é a mais recente. Sem suporte = sem renderização 3D.",
      "Atributos de vértice máximos da GPU. 16+ indica GPU capaz.",
      "Suporte WakeLock (manter tela acesa) e API de vibração. Principalmente para mobile.",
      "Suporte PWA (adicionar à tela inicial) e Service Worker (offline).",
      'Se a automação WebDriver (bot) é detectada. Normalmente "Normal".',
      "Pontuação de estabilidade de taxa de quadros. 0-100. Maior = menos travamentos.",
      "Configuração de idioma do sistema e fuso horário.",
      "Versão do motor de diagnóstico deste app.",
      "Endereço IP obtido via WebRTC. Pode revelar localização aproximada/ISP.",
      "Estado do modo escuro e alto contraste do SO.",
      "Navegador atual em uso.",
      "Modelo do dispositivo estimado a partir do UA. Safari pode não mostrar modelo detalhado.",
    ],
    fr: [
      "Nombre de cœurs logiques CPU. Plus de cœurs = plus de traitement parallèle.",
      "Capacité RAM physique. Plus de RAM = plus d'apps et d'onglets simultanés.",
      "Nom du modèle GPU. Indique les performances graphiques.",
      "Taille maximale de texture que le GPU peut gérer. Plus grand = meilleur rendu 3D.",
      "Score benchmark CPU mesuré par cette app. 0-100, 75+ est haute performance.",
      "Score de rendu GPU via WebGL et Canvas. Échelle 0-100.",
      "Score de vitesse lecture/écriture mémoire. Bas = ralentit tout le traitement.",
      "FPS moyen mesuré. 60+ FPS semble fluide.",
      "FPS 1% bas. Plus bas = saccades plus visibles. 55+ FPS est confortable.",
      "Taux de rafraîchissement estimé. 60Hz, 120Hz, 144Hz, etc.",
      "Résolution en pixels physiques. Plus élevée = écran plus net.",
      "Ratio pixels logiques/physiques. 2x+ équivaut à un écran Retina.",
      "Profondeur de couleur et support HDR. 24bit+ avec HDR est haute qualité.",
      "Mémoire heap JS maximale. Plus grande = peut gérer des tâches plus lourdes. Firefox non supporté.",
      "Latence du thread UI. Médiane plus basse = réponse plus rapide au toucher/clic.",
      "Vitesse réseau mesurée par téléchargement réel. 100Mbps+ est rapide.",
      "Type de connexion et bande passante rapportée par API. 4G, WiFi, etc. Valeur de référence.",
      "Niveau de batterie et état de charge. En dessous de 20% non chargé abaisse le rang.",
      "Nombre de points tactiles simultanés. 10+ supporte le multi-touch complet.",
      "État du mode sombre et du contraste élevé depuis les paramètres OS.",
      "Si la connexion utilise le chiffrement HTTPS. Sécurité essentielle pour le web moderne.",
      "État activé des cookies et support IndexedDB.",
      "Version WebGL. 2.0 est la plus récente. Sans support = pas de rendu 3D.",
      "Attributs de sommet maximum du GPU. 16+ indique un GPU capable.",
      "Support WakeLock (garder l'écran allumé) et API de vibration. Principalement mobile.",
      "Support PWA (ajouter à l'écran d'accueil) et Service Worker (hors ligne).",
      'Si l\'automatisation WebDriver (bot) est détectée. Normalement "Normal".',
      "Score de stabilité du taux de frames. 0-100. Plus élevé = moins de saccades.",
      "Paramètres de langue et de fuseau horaire du système.",
      "Version du moteur de diagnostic de cette app.",
      "Adresse IP obtenue via WebRTC. Peut révéler la localisation approximative/FAI.",
      "État du mode sombre et du contraste élevé du SO.",
      "Navigateur actuellement utilisé.",
      "Modèle d'appareil estimé depuis l'UA. Safari peut ne pas afficher le modèle détaillé.",
    ],
    de: [
      "Anzahl der CPU-Logikkerne. Mehr Kerne = mehr parallele Verarbeitung.",
      "Physischer RAM-Speicher. Mehr RAM = mehr Apps und Tabs gleichzeitig.",
      "GPU-Modellname. Zeigt die Grafikleistung an.",
      "Maximale Texturgröße der GPU. Größer = besseres 3D-Rendering.",
      "CPU-Benchmark-Score dieser App. 0-100, 75+ ist hohe Leistung.",
      "GPU-Rendering-Score via WebGL und Canvas. Skala 0-100.",
      "Speicher-Lese/Schreib-Geschwindigkeits-Score. Niedrig = verlangsamt alles.",
      "Gemessene durchschnittliche FPS. 60+ FPS fühlt sich flüssig an.",
      "1% Low FPS. Niedriger = mehr sichtbare Stottern. 55+ FPS ist komfortabel.",
      "Geschätzte Bildwiederholrate. 60Hz, 120Hz, 144Hz usw.",
      "Physische Pixel-Auflösung. Höher = schärferes Display.",
      "Verhältnis von logischen zu physischen Pixeln. 2x+ entspricht Retina-Display.",
      "Farbtiefe und HDR-Unterstützung. 24bit+ mit HDR ist hohe Qualität.",
      "Maximaler JS-Heap-Speicher. Größer = kann schwerere Aufgaben bewältigen. Firefox nicht unterstützt.",
      "UI-Thread-Latenz. Niedrigerer Median = schnellere Reaktion auf Tippen/Klicken.",
      "Netzwerkgeschwindigkeit gemessen durch echten Download. 100Mbps+ ist schnell.",
      "Verbindungstyp und API-gemeldete Bandbreite. 4G, WiFi usw. Referenzwert.",
      "Akkustand und Ladestatus. Unter 20% ohne Laden senkt den Rang.",
      "Anzahl gleichzeitiger Berührungspunkte. 10+ unterstützt vollständiges Multi-Touch.",
      "Dunkelmodus und Hochkontrastmodus-Status aus den OS-Einstellungen.",
      "Ob die Verbindung HTTPS-Verschlüsselung verwendet. Grundlegende Web-Sicherheit.",
      "Cookie-Status und IndexedDB-Unterstützung.",
      "WebGL-Version. 2.0 ist die neueste. Keine Unterstützung = kein 3D-Rendering.",
      "Max. GPU-Vertex-Attribute. 16+ zeigt eine leistungsfähige GPU an.",
      "WakeLock (Bildschirm aktiv halten) und Vibrations-API-Unterstützung. Hauptsächlich mobil.",
      "PWA (zum Startbildschirm hinzufügen) und Service Worker (offline) Unterstützung.",
      'Ob WebDriver-Automatisierung (Bot) erkannt wird. Normalerweise "Normal".',
      "Framerate-Stabilitäts-Score. 0-100. Höher = weniger Stottern.",
      "Systemsprache und Zeitzoneneinstellungen.",
      "Diagnose-Engine-Version dieser App.",
      "IP-Adresse über WebRTC. Kann ungefähren Standort/ISP enthüllen.",
      "Dunkelmodus und Hochkontrast-Status des OS.",
      "Aktuell verwendeter Browser.",
      "Gerätemodell aus UA geschätzt. Safari zeigt möglicherweise kein detailliertes Modell.",
    ],
    ru: [
      "Количество логических ядер CPU. Больше ядер = больше параллельных задач.",
      "Объём физической оперативной памяти. Больше RAM = больше приложений и вкладок одновременно.",
      "Название модели GPU. Показывает производительность графики.",
      "Максимальный размер текстуры GPU. Больше = лучший 3D-рендеринг.",
      "Оценка CPU от этого приложения. 0-100, 75+ — высокая производительность.",
      "Оценка GPU через WebGL и Canvas. Шкала 0-100.",
      "Оценка скорости чтения/записи памяти. Низкая = замедляет всё.",
      "Измеренный средний FPS. 60+ FPS ощущается плавно.",
      "1% низкий FPS. Ниже = больше заметных рывков. 55+ FPS — комфортно.",
      "Оценочная частота обновления экрана. 60Гц, 120Гц, 144Гц и т.д.",
      "Разрешение в физических пикселях. Выше = чётче экран.",
      "Соотношение логических и физических пикселей. 2x+ соответствует Retina-дисплею.",
      "Глубина цвета и поддержка HDR. 24бит+ с HDR — высокое качество.",
      "Максимальная куча JS. Больше = справляется с более тяжёлыми задачами. Firefox не поддерживает.",
      "Задержка UI-потока. Меньше медианы = быстрее реакция на касание/клик.",
      "Скорость сети, измеренная реальной загрузкой. 100 Мбит/с+ — быстро.",
      "Тип соединения и пропускная способность от API. 4G, WiFi и т.д. Справочное значение.",
      "Уровень заряда и статус зарядки. Ниже 20% без зарядки снижает ранг.",
      "Количество одновременных точек касания. 10+ поддерживает полный мультитач.",
      "Состояние тёмного режима и режима высокой контрастности в настройках ОС.",
      "Использует ли соединение шифрование HTTPS. Основа безопасности современного веба.",
      "Состояние cookies и поддержка IndexedDB.",
      "Версия WebGL. 2.0 — последняя. Нет поддержки = нет 3D-рендеринга.",
      "Максимальные атрибуты вершин GPU. 16+ указывает на мощный GPU.",
      "Поддержка WakeLock (удержание экрана) и Vibration API. В основном мобильные функции.",
      "Поддержка PWA (добавить на экран) и Service Worker (офлайн).",
      'Обнаружена ли автоматизация WebDriver (бот). Обычно "Нормально".',
      "Оценка стабильности частоты кадров. 0-100. Выше = меньше рывков.",
      "Язык системы и настройки часового пояса.",
      "Версия диагностического движка этого приложения.",
      "IP-адрес через WebRTC. Может раскрыть приблизительное местоположение/ISP.",
      "Состояние тёмного режима и высокой контрастности ОС.",
      "Текущий используемый браузер.",
      "Модель устройства, оценённая по UA. Safari может не отображать подробную модель.",
    ],
    "ja-hira": [
      "CPUのこあのかずです。おおいほどたくさんのしごとができます。",
      "めもりのようりょうです。おおいほどたくさんのあぷりをつかえます。",
      "GPUのしゅるいです。えのひょうじのはやさのめやすになります。",
      "GPUがあつかえるさいだいのがぞうのおおきさです。",
      "このあぷりがはかったCPUのせいのうのてんすうです。",
      "このあぷりがはかったGPUのせいのうのてんすうです。",
      "めもりのよみかきのはやさのてんすうです。",
      "じっさいにはかったへいきんFPSです。60いじょうがなめらかです。",
      "いちばんおもいばめんでのFPSです。ひくいとかくかくします。",
      "がめんのこうしんひんどのすいていちです。",
      "がめんのかいぞうどです。たかいほどきれいです。",
      "ろじかるぴくせるとふぃじかるぴくせるのひりつです。",
      "いろのふかさとHDRのたいおうです。",
      "JavaScriptがつかえるさいだいのめもりりょうです。",
      "UIのおうとうそくどです。すくないほどはやいです。",
      "じっさいにはかったつうしんそくどです。",
      "つうしんのしゅるいです。",
      "でんちののこりとじゅうでんのじょうたいです。",
      "どうじにさわれるゆびのかずです。",
      "だーくもーどのせっていです。",
      "あんごうつうしんをつかっているかどうかです。",
      "Cookieとほぞんきのうのたいおうです。",
      "WebGLのばーじょんです。",
      "GPUのさいだいちょうてんぞくせいすうです。",
      "WakeLockとしんどうのたいおうです。",
      "PWAとService Workerのたいおうです。",
      "ぼっとそうさかどうかのはんていです。",
      "FPSのあんていせいのてんすうです。",
      "げんごとたいむぞーんです。",
      "このしんだんあぷりのばーじょんです。",
      "WebRTCでとったIPあどれすです。",
      "だーくもーどのせっていです。",
      "いまつかっているぶらうざです。",
      "きしゅめいのすいていです。さふぁりではくわしいきしゅがわからないことがあります。",
    ],
  },
  helpText = HELP_TEXT_I18N.ja;
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("help")) return;
  const t = e.target.closest('[id^="row-"]');
  if (!t) return;
  const n = parseInt(t.id.replace("row-", "")) - 1,
    o = void 0 !== _settings && _settings.language ? _settings.language : "ja";
  alert((HELP_TEXT_I18N[o] || HELP_TEXT_I18N.ja)[n] || "説明は準備中です。");
});
const MANAGED_STORAGE_KEYS = [
    "diag_history",
    "ai_conversations",
    "custom_bad_color",
    "custom_ok_color",
    "custom_warn_color",
    "pu_skin_v1",
    "pu_gacha_skins_v1",
    "pu_gacha_last_v1",
  ],
  RESET_STORAGE_KEYS = [
    "pu_upd_banner_v1",
    "turnstile_verified",
    "sys_banned_user",
    "sys_banned_email",
  ];
function downloadStorageData() {
  _progressMission("backup");
  try {
    let e = !1;
    for (const t of MANAGED_STORAGE_KEYS) {
      const n = localStorage.getItem(t);
      if (null !== n) {
        try {
          backup[t] = JSON.parse(n);
        } catch (e) {
          backup[t] = n;
        }
        e = !0;
      }
    }
    if (!e) return void alert("保存されたデータがありません。");
    const t = JSON.stringify(backup, null, 2),
      n = new Blob([t], { type: "application/json" }),
      o = URL.createObjectURL(n),
      i = document.createElement("a");
    ((i.href = o),
      (i.download = `pro-ultra-backup-${new Date().toISOString().split("T")[0]}.json`),
      document.body.appendChild(i),
      i.click(),
      document.body.removeChild(i),
      URL.revokeObjectURL(o),
      alert("✅ データをダウンロードしました。"));
  } catch (e) {
    (console.error("ダウンロードエラー:", e),
      alert("❌ ダウンロードに失敗しました。"));
  }
}
function uploadStorageData() {
  try {
    const e = document.createElement("input");
    ((e.type = "file"),
      (e.accept = "application/json"),
      (e.onchange = async (e) => {
        const t = e.target.files?.[0];
        if (t)
          try {
            const e = await t.text(),
              n = JSON.parse(e);
            if ("object" != typeof n || null === n)
              return void alert("❌ 無効なJSONファイルです。");
            const o = Object.keys(n);
            if (0 === o.length) return void alert("❌ JSONファイルが空です。");
            const i = o.filter(
              (e) => null !== n[e] && void 0 !== n[e] && "" !== n[e],
            );
            if (0 === i.length)
              return (
                alert(
                  "❌ 復元可能なデータがありません。\nJSONファイルが正しいか確認してください。",
                ),
                void console.log("JSONの内容:", n)
              );
            const a = `以下のデータを復元します:\n${i.join("\n")}\n\n既存のデータは上書きされます。よろしいですか？`;
            if (!confirm(a)) return;
            let r = 0;
            for (const e of i)
              try {
                const t = n[e],
                  o = "string" == typeof t ? t : JSON.stringify(t);
                (localStorage.setItem(e, o), r++);
              } catch (t) {
                console.error(`Key '${e}' の復元に失敗:`, t);
              }
            r > 0
              ? (resetSystemKeys(),
                alert(`✅ ${r}個のデータを復元しました。`),
                setTimeout(() => {
                  location.reload();
                }, 500))
              : alert("❌ データの復元に失敗しました。");
          } catch (e) {
            (console.error("ファイル読み込みエラー:", e),
              alert(
                "❌ ファイルの読み込みに失敗しました。\nJSON形式のファイルを選択してください。",
              ));
          }
      }),
      e.click());
  } catch (e) {
    (console.error("ファイル選択エラー:", e),
      alert("❌ ファイル選択に失敗しました。"));
  }
}
function clearStorageData() {
  if (
    confirm(
      "⚠️ すべての保存データをクリアします。\nこの操作は取り消せません。本当によろしいですか?",
    )
  )
    try {
      for (const e of MANAGED_STORAGE_KEYS) localStorage.removeItem(e);
      alert("✅ データをクリアしました。");
    } catch (e) {
      (console.error("クリアエラー:", e),
        alert("❌ データのクリアに失敗しました。"));
    }
}
function resetSystemKeys() {
  try {
    for (const e of RESET_STORAGE_KEYS) localStorage.removeItem(e);
    console.log("✅ システムキーをリセットしました");
  } catch (e) {
    console.error("システムキーリセットエラー:", e);
  }
}
function openDataRestoreGuide() {
  const e = document.getElementById("restore-guide-modal");
  e && (e.style.display = "flex");
}
function openHowToUse() {
  _progressMission("how_to_use");
  const e = document.getElementById("howto-modal");
  e && (e.style.display = "flex");
}
const SESSION_KEY = "pu_last_access_v2",
  SESSION_MAX_MS = 172800000; // 2日 = 48時間
function _recordSessionStart() {
  localStorage.setItem(SESSION_KEY, String(Date.now()));
}
async function _checkSessionExpiry() {
  const e = Number(localStorage.getItem(SESSION_KEY) || 0);
  if (!e) {
    _recordSessionStart();
    return true;
  }
  if (Date.now() - e > SESSION_MAX_MS) {
    localStorage.removeItem(SESSION_KEY);
    await _fbAuth.signOut();
    _showToast(
      "🔒 2日間操作がなかったため自動ログアウトしました。再ログインしてください。",
      5e3,
    );
    return false;
  }
  // アクセスのたびに最終アクセス時刻を更新
  _recordSessionStart();
  return true;
}
const PASSKEY_WORKER_URL =
    "https://misty-sun-15e5.yuyusesabuchanneru.workers.dev",
  PASSKEY_RP_ID = "pro-ultra.pages.dev",
  PASSKEY_RP_NAME = "精密デバイス診断 Pro Ultra";
async function registerPasskey() {
  if (_isProUltra && _currentUser)
    try {
      const e = await fetch(`${PASSKEY_WORKER_URL}/passkey/challenge`, {
          method: "POST",
        }),
        { challenge: t } = await e.json(),
        n = await navigator.credentials.create({
          publicKey: {
            challenge: b64urlToUint8Array(t),
            rp: { id: PASSKEY_RP_ID, name: PASSKEY_RP_NAME },
            user: {
              id: new TextEncoder().encode(_currentUser.uid),
              name: _currentUser.email || _currentUser.uid,
              displayName: _currentUser.displayName || "ProUltraユーザー",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: {
              userVerification: "required",
              residentKey: "preferred",
            },
            timeout: 6e4,
          },
        }),
        o = uint8ArrayToB64url(new Uint8Array(n.rawId)),
        i = uint8ArrayToB64url(
          new Uint8Array(n.response.getPublicKey?.() || new ArrayBuffer(0)),
        );
      (await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("passkeys")
        .doc(o)
        .set({
          credentialId: o,
          publicKey: i,
          rpId: PASSKEY_RP_ID,
          createdAt: Date.now(),
          deviceName: navigator.userAgent.slice(0, 100),
        }),
        await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ passkeyCredentialId: o }, { merge: !0 }),
        await _fbDb
          .collection("passkey_index")
          .doc(o)
          .set({ uid: _currentUser.uid, createdAt: Date.now() }),
        _showToast(
          "✅ Pro Pass を登録しました！次回から生体認証でログインできます",
          4e3,
        ),
        _renderPasskeyUI());
    } catch (e) {
      "NotAllowedError" === e.name
        ? _showToast("❌ 登録がキャンセルされました", 3e3)
        : (console.error("Pro Pass 登録エラー:", e),
          _showToast("❌ 登録に失敗しました: " + e.message, 4e3));
    }
  else _showToast("⚠️ Pro Pass はProUltraアカウント限定です", 3e3);
}
async function signInWithPasskey() {
  if (_fbAuth)
    try {
      const e = await fetch(`${PASSKEY_WORKER_URL}/passkey/challenge`, {
          method: "POST",
        }),
        { challenge: t } = await e.json(),
        n = await navigator.credentials.get({
          publicKey: {
            challenge: b64urlToUint8Array(t),
            rpId: PASSKEY_RP_ID,
            userVerification: "required",
            timeout: 6e4,
          },
        }),
        o = uint8ArrayToB64url(new Uint8Array(n.rawId)),
        i = await fetch(`${PASSKEY_WORKER_URL}/passkey/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId: o,
            clientDataJSON: uint8ArrayToB64url(
              new Uint8Array(n.response.clientDataJSON),
            ),
            authenticatorData: uint8ArrayToB64url(
              new Uint8Array(n.response.authenticatorData),
            ),
            signature: uint8ArrayToB64url(new Uint8Array(n.response.signature)),
          }),
        });
      if (!i.ok) {
        const e = await i.json();
        throw new Error(e.error || "検証失敗");
      }
      const { customToken: a } = await i.json();
      (await _fbAuth.signInWithCustomToken(a),
        _recordSessionStart(),
        _showToast("🔑 Pro Passでログインしました", 3e3));
    } catch (e) {
      "NotAllowedError" === e.name
        ? _showToast("❌ 認証がキャンセルされました", 3e3)
        : (console.error("Pro Pass ログインエラー:", e),
          _showToast("❌ ログイン失敗: " + e.message, 4e3));
    }
}
async function _renderPasskeyUI() {
  const e = document.getElementById("propass-section");
  if (!e) return;
  const t = !!window.PublicKeyCredential;
  if (!_isProUltra)
    return void (e.innerHTML =
      '\n            <div style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:8px 0;">\n                🔒 Pro PassはProUltraアカウント限定です\n            </div>');
  if (!t)
    return void (e.innerHTML =
      '\n            <div style="color:var(--text-muted);font-size:0.85rem;">\n                ⚠️ このブラウザはPasskeyに対応していません\n            </div>');
  e.innerHTML =
    '<div style="font-size:0.8rem;color:var(--text-muted);">読み込み中...</div>';
  let n = [];
  try {
    n = (
      await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("passkeys")
        .get()
    ).docs.map((e) => e.data());
  } catch (e) {
    console.warn("passkey fetch error", e);
  }
  const o = n.length > 0,
    i = document.getElementById("propass-register-btn");
  if ((i && (i.style.display = o ? "none" : "block"), o)) {
    const t = n
      .map(
        (e) =>
          `\n            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);border:1px solid #2a2a2a;border-radius:10px;padding:8px 12px;margin-bottom:6px;">\n                <div>\n                    <div style="font-size:0.82rem;font-weight:700;color:var(--text);">🔑 登録済みデバイス</div>\n                    <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${new Date(e.createdAt).toLocaleDateString("ja-JP")}</div>\n                </div>\n                <button onclick="deletePasskey('${e.credentialId}')" style="background:rgba(255,59,48,0.15);border:1px solid rgba(255,59,48,0.3);color:#ff6b6b;padding:5px 10px;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;">削除</button>\n            </div>`,
      )
      .join("");
    e.innerHTML = `\n            <div style="margin-top:8px;">\n                <div style="font-size:0.9rem;font-weight:700;margin-bottom:8px;">🔑 Pro Pass</div>\n                ${t}\n                <button onclick="registerPasskey()"\n                    style="width:100%;padding:9px;border-radius:10px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);\n                           color:#a78bfa;font-weight:700;cursor:pointer;font-size:0.85rem;margin-top:4px;">\n                    + 別のデバイスを追加\n                </button>\n            </div>`;
  } else
    e.innerHTML =
      '\n            <div style="margin-top:8px;">\n                <div style="font-size:0.9rem;font-weight:700;margin-bottom:6px;">🔑 Pro Pass</div>\n                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">\n                    指紋・顔認証・PINでログインできます。パスワード不要。\n                </div>\n                <button onclick="registerPasskey()"\n                    style="width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);\n                           color:#fff;font-weight:700;border:none;cursor:pointer;font-size:0.88rem;">\n                    + Pro Pass を登録する\n                </button>\n            </div>';
}
async function deletePasskey(e) {
  if (confirm("このPro Passを削除しますか？"))
    try {
      (await _fbDb
        .collection("users")
        .doc(_currentUser.uid)
        .collection("passkeys")
        .doc(e)
        .delete(),
        await _fbDb.collection("passkey_index").doc(e).delete());
      ((
        await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .collection("passkeys")
          .get()
      ).empty &&
        (await _fbDb
          .collection("users")
          .doc(_currentUser.uid)
          .set({ passkeyCredentialId: null }, { merge: !0 })),
        _showToast("🗑 Pro Passを削除しました", 3e3),
        _renderPasskeyUI());
    } catch (e) {
      _showToast("❌ 削除に失敗しました: " + e.message, 3e3);
    }
}
function _injectPasskeyLoginButton() {
  if (!!!window.PublicKeyCredential) return;
  const e = document.getElementById("email-login-submit")?.parentElement;
  if (!e || document.getElementById("passkey-login-btn")) return;
  const t = document.createElement("button");
  ((t.id = "passkey-login-btn"),
    (t.type = "button"),
    (t.textContent = "🔑 Pro Pass でログイン"),
    (t.onclick = signInWithPasskey),
    (t.style.cssText =
      "\n        width:100%;padding:10px;border-radius:10px;\n        background:linear-gradient(135deg,#4f46e5,#7c3aed);\n        color:#fff;font-weight:700;border:none;cursor:pointer;\n        font-size:0.88rem;margin-top:8px;"),
    e.appendChild(t));
}
function b64urlToUint8Array(e) {
  const t =
    e.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((e.length + 3) % 4 || 4);
  return Uint8Array.from(atob(t), (e) => e.charCodeAt(0));
}
function uint8ArrayToB64url(e) {
  return btoa(String.fromCharCode(...e))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
"undefined" == typeof _showToast &&
  (window._showToast = function (e, t = 3e3) {
    let n = document.getElementById("_propass_toast");
    (n ||
      ((n = document.createElement("div")),
      (n.id = "_propass_toast"),
      (n.style.cssText =
        "\n                position:fixed;bottom:80px;left:50%;transform:translateX(-50%);\n                background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;\n                border-radius:20px;font-size:0.85rem;z-index:9999999;\n                transition:opacity 0.3s;pointer-events:none;"),
      document.body.appendChild(n)),
      (n.textContent = e),
      (n.style.opacity = "1"),
      clearTimeout(n._timer),
      (n._timer = setTimeout(() => {
        n.style.opacity = "0";
      }, t)));
  });
const DEVICE_DB = [
  {
    name: "iPhone 17 Pro Max",
    year: 2025,
    chip: "A19 Pro",
    ram: 12,
    battery: 4685,
    score: 100,
  },
  {
    name: "iPhone 17 Pro",
    year: 2025,
    chip: "A19 Pro",
    ram: 12,
    battery: 3582,
    score: 99,
  },
  {
    name: "iPhone 17 Air",
    year: 2025,
    chip: "A19",
    ram: 8,
    battery: 2800,
    score: 91,
  },
  {
    name: "iPhone 17",
    year: 2025,
    chip: "A19",
    ram: 8,
    battery: 3561,
    score: 93,
  },
  {
    name: "iPhone 16 Pro Max",
    year: 2024,
    chip: "A18 Pro",
    ram: 8,
    battery: 4685,
    score: 98,
  },
  {
    name: "iPhone 16 Pro",
    year: 2024,
    chip: "A18 Pro",
    ram: 8,
    battery: 3582,
    score: 96,
  },
  {
    name: "iPhone 16 Plus",
    year: 2024,
    chip: "A18",
    ram: 8,
    battery: 4674,
    score: 90,
  },
  {
    name: "iPhone 16",
    year: 2024,
    chip: "A18",
    ram: 8,
    battery: 3561,
    score: 88,
  },
  {
    name: "iPhone 15 Pro Max",
    year: 2023,
    chip: "A17 Pro",
    ram: 8,
    battery: 4422,
    score: 93,
  },
  {
    name: "iPhone 15 Pro",
    year: 2023,
    chip: "A17 Pro",
    ram: 8,
    battery: 3274,
    score: 91,
  },
  {
    name: "iPhone 15 Plus",
    year: 2023,
    chip: "A16",
    ram: 6,
    battery: 4383,
    score: 84,
  },
  {
    name: "iPhone 15",
    year: 2023,
    chip: "A16",
    ram: 6,
    battery: 3349,
    score: 82,
  },
  {
    name: "iPhone 14 Pro Max",
    year: 2022,
    chip: "A16",
    ram: 6,
    battery: 4323,
    score: 86,
  },
  {
    name: "iPhone 14 Pro",
    year: 2022,
    chip: "A16",
    ram: 6,
    battery: 3200,
    score: 84,
  },
  {
    name: "iPhone 14 Plus",
    year: 2022,
    chip: "A15",
    ram: 6,
    battery: 4325,
    score: 78,
  },
  {
    name: "iPhone 14",
    year: 2022,
    chip: "A15",
    ram: 6,
    battery: 3279,
    score: 76,
  },
  {
    name: "iPhone 13 Pro Max",
    year: 2021,
    chip: "A15",
    ram: 6,
    battery: 4352,
    score: 80,
  },
  {
    name: "iPhone 13 Pro",
    year: 2021,
    chip: "A15",
    ram: 6,
    battery: 3095,
    score: 78,
  },
  {
    name: "iPhone 13",
    year: 2021,
    chip: "A15",
    ram: 4,
    battery: 3227,
    score: 74,
  },
  {
    name: "iPhone SE (3rd)",
    year: 2022,
    chip: "A15",
    ram: 4,
    battery: 2018,
    score: 65,
  },
  {
    name: "Galaxy S25 Ultra",
    year: 2025,
    chip: "Snapdragon 8 Elite",
    ram: 12,
    battery: 5e3,
    score: 99,
  },
  {
    name: "Galaxy S25+",
    year: 2025,
    chip: "Snapdragon 8 Elite",
    ram: 12,
    battery: 4900,
    score: 95,
  },
  {
    name: "Galaxy S25",
    year: 2025,
    chip: "Snapdragon 8 Elite",
    ram: 12,
    battery: 4e3,
    score: 92,
  },
  {
    name: "Galaxy S24 Ultra",
    year: 2024,
    chip: "Snapdragon 8 Gen 3",
    ram: 12,
    battery: 5e3,
    score: 96,
  },
  {
    name: "Galaxy S24+",
    year: 2024,
    chip: "Snapdragon 8 Gen 3",
    ram: 12,
    battery: 4900,
    score: 91,
  },
  {
    name: "Galaxy S24",
    year: 2024,
    chip: "Snapdragon 8 Gen 3",
    ram: 8,
    battery: 4e3,
    score: 88,
  },
  {
    name: "Galaxy S23 Ultra",
    year: 2023,
    chip: "Snapdragon 8 Gen 2",
    ram: 8,
    battery: 5e3,
    score: 90,
  },
  {
    name: "Galaxy S23",
    year: 2023,
    chip: "Snapdragon 8 Gen 2",
    ram: 8,
    battery: 3900,
    score: 82,
  },
  {
    name: "Pixel 9 Pro XL",
    year: 2024,
    chip: "Tensor G4",
    ram: 16,
    battery: 5060,
    score: 94,
  },
  {
    name: "Pixel 9 Pro",
    year: 2024,
    chip: "Tensor G4",
    ram: 16,
    battery: 4700,
    score: 92,
  },
  {
    name: "Pixel 9",
    year: 2024,
    chip: "Tensor G4",
    ram: 12,
    battery: 4700,
    score: 87,
  },
  {
    name: "Pixel 8 Pro",
    year: 2023,
    chip: "Tensor G3",
    ram: 12,
    battery: 5050,
    score: 86,
  },
  {
    name: "Pixel 8",
    year: 2023,
    chip: "Tensor G3",
    ram: 8,
    battery: 4575,
    score: 81,
  },
  {
    name: "Xperia 1 VI",
    year: 2024,
    chip: "Snapdragon 8 Gen 3",
    ram: 12,
    battery: 5e3,
    score: 88,
  },
  {
    name: "Xperia 5 V",
    year: 2023,
    chip: "Snapdragon 8 Gen 2",
    ram: 8,
    battery: 5e3,
    score: 80,
  },
  {
    name: "AQUOS R9 Pro",
    year: 2024,
    chip: "Snapdragon 8 Gen 3",
    ram: 16,
    battery: 5e3,
    score: 85,
  },
  {
    name: "AQUOS R9",
    year: 2024,
    chip: "Snapdragon 8s Gen 3",
    ram: 8,
    battery: 5e3,
    score: 78,
  },
];
function openBatteryForecast() {
  if ((_progressMission("battery"), !_isProUltra)) return;
  let e = document.getElementById("battery-forecast-modal");
  (e ||
    ((e = document.createElement("div")),
    (e.id = "battery-forecast-modal"),
    (e.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999995;display:flex;justify-content:center;align-items:flex-end;box-sizing:border-box;"),
    document.body.appendChild(e)),
    (e.innerHTML =
      '\n        <div style="width:100%;max-width:540px;background:var(--card);border-radius:24px 24px 0 0;padding:28px 20px 40px;max-height:90vh;overflow-y:auto;">\n            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">\n                <div>\n                    <div style="font-size:1.15rem;font-weight:900;color:var(--text);">🔋 バッテリー寿命予測</div>\n                    <div style="font-size:0.78rem;color:#f59e0b;font-weight:700;margin-top:2px;">👑 ProUltra限定</div>\n                </div>\n                <button onclick="document.getElementById(\'battery-forecast-modal\').style.display=\'none\'"\n                    style="background:rgba(255,255,255,0.08);border:none;color:var(--sub-text);font-size:1.3rem;width:36px;height:36px;border-radius:50%;cursor:pointer;">×</button>\n            </div>\n\n            <div style="background:rgba(255,149,0,0.08);border:1px solid rgba(255,149,0,0.25);border-radius:14px;padding:14px 16px;margin-bottom:20px;font-size:0.82rem;color:#aaa;line-height:1.7;">\n                Battery API（充電中フラグ・現在の充電量）＋手入力情報を組み合わせてAIが劣化モデルを推定します。\n            </div>\n\n            <div style="display:flex;flex-direction:column;gap:14px;" id="bfInputs">\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">📱 機種名</div>\n                    <input id="bf-device-name" type="text" placeholder="例: iPhone 15 Pro" \n                        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.9rem;box-sizing:border-box;">\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">📅 購入・使用開始から何ヶ月？</div>\n                    <input id="bf-months" type="number" min="1" max="60" placeholder="例: 18" \n                        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.9rem;box-sizing:border-box;">\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">⚡ 現在の最大バッテリー容量（%）　<span style="color:#666;font-size:0.78rem;">設定 → バッテリー → バッテリーの状況 → 最大容量</span></div>\n                    <input id="bf-max-capacity" type="number" min="50" max="100" placeholder="例: 87" \n                        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.9rem;box-sizing:border-box;">\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">🔌 1日の充電回数（平均）</div>\n                    <select id="bf-charge-freq" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.9rem;box-sizing:border-box;">\n                        <option value="0.5">0.5回以下（2日に1回）</option>\n                        <option value="1" selected>1回</option>\n                        <option value="1.5">1〜2回</option>\n                        <option value="2">2回</option>\n                        <option value="3">3回以上</option>\n                    </select>\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">🌡️ 使用環境</div>\n                    <select id="bf-env" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.9rem;box-sizing:border-box;">\n                        <option value="cool">冷涼（北日本・空調完備）</option>\n                        <option value="normal" selected>普通（室内中心）</option>\n                        <option value="hot">高温（屋外・夏場多い）</option>\n                    </select>\n                </div>\n            </div>\n\n            <button onclick="runBatteryForecast()" id="bf-run-btn"\n                style="width:100%;margin-top:20px;background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;border:none;border-radius:14px;padding:15px;font-size:1rem;font-weight:900;cursor:pointer;letter-spacing:0.5px;">\n                🔮 寿命を予測する\n            </button>\n\n            <div id="bf-result" style="margin-top:20px;"></div>\n        </div>'),
    (e.style.display = "flex"));
}
async function runBatteryForecast() {
  if (!_isProUltra) return;
  const e =
      document.getElementById("bf-device-name").value.trim() || "不明な機種",
    t = parseInt(document.getElementById("bf-months").value) || 12,
    n = parseInt(document.getElementById("bf-max-capacity").value) || null,
    o = parseFloat(document.getElementById("bf-charge-freq").value),
    i = document.getElementById("bf-env").value,
    a = document.getElementById("bf-result"),
    r = document.getElementById("bf-run-btn");
  let s = null,
    d = !1;
  try {
    if (navigator.getBattery) {
      const e = await navigator.getBattery();
      ((s = Math.round(100 * e.level)), (d = e.charging));
    }
  } catch (e) {}
  ((r.disabled = !0),
    (r.textContent = "🤖 AI解析中..."),
    (a.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--sub-text);font-size:0.88rem;">AIがバッテリー劣化モデルを計算しています…</div>'));
  const l = `あなたはスマートフォンのバッテリー劣化専門家です。以下のデータを元に、バッテリー寿命予測レポートを日本語で作成してください。\n\n【入力データ】\n- 機種名: ${e}\n- 使用開始からの期間: ${t}ヶ月\n- 現在の最大バッテリー容量: ${n ? n + "%" : "不明（入力なし）"}\n- Battery API現在の充電量: ${null !== s ? s + "%" : "取得不可（iOSなど）"}\n- Battery API充電中フラグ: ${d ? "はい" : "いいえ/不明"}\n- 1日の充電回数: ${o}回\n- 使用環境: ${"cool" === i ? "冷涼" : "hot" === i ? "高温" : "普通"}\n\n【出力形式】JSONのみ。以下のキーを必ず含めること。他のテキストは一切不要。\n{\n  "currentHealth": "現在のバッテリー健康度（%、推定）",\n  "monthsTo80": "最大容量80%になるまでの残り月数（推定）",\n  "monthsTo70": "最大容量70%（要交換ライン）になるまでの残り月数（推定）",\n  "replaceYear": "バッテリー交換推奨時期（例: 2026年春）",\n  "degradeSpeed": "劣化速度評価（高速/やや速い/普通/良好）",\n  "tips": ["改善アドバイス1（20字以内）", "改善アドバイス2（20字以内）", "改善アドバイス3（20字以内）"],\n  "summary": "総合コメント（50字程度）"\n}`;
  try {
    const e = await fetch("https://proultra.yuyusesabuchanneru.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: l }] }),
      }),
      t = await e.json(),
      n = (t.choices?.[0]?.message?.content || "")
        .replace(/```json|```/g, "")
        .trim(),
      o = JSON.parse(n),
      i =
        {
          高速: "#ff453a",
          やや速い: "#ff9f0a",
          普通: "#ffd60a",
          良好: "#34c759",
        }[o.degradeSpeed] || "#888";
    a.innerHTML = `\n            <div style="background:var(--bg);border:1px solid var(--border);border-radius:18px;padding:20px;">\n                <div style="font-size:0.8rem;font-weight:800;color:var(--sub-text);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">🔋 予測結果</div>\n\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">\n                    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;text-align:center;">\n                        <div style="font-size:0.72rem;color:var(--sub-text);margin-bottom:4px;">現在の健康度</div>\n                        <div style="font-size:1.6rem;font-weight:900;color:var(--text);">${o.currentHealth}<span style="font-size:0.9rem;">%</span></div>\n                    </div>\n                    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;text-align:center;">\n                        <div style="font-size:0.72rem;color:var(--sub-text);margin-bottom:4px;">劣化速度</div>\n                        <div style="font-size:1.1rem;font-weight:900;color:${i};">${o.degradeSpeed}</div>\n                    </div>\n                    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;text-align:center;">\n                        <div style="font-size:0.72rem;color:var(--sub-text);margin-bottom:4px;">80%まで約</div>\n                        <div style="font-size:1.3rem;font-weight:900;color:var(--text);">${o.monthsTo80}<span style="font-size:0.8rem;">ヶ月</span></div>\n                    </div>\n                    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;text-align:center;">\n                        <div style="font-size:0.72rem;color:var(--sub-text);margin-bottom:4px;">交換推奨</div>\n                        <div style="font-size:0.95rem;font-weight:900;color:#ff9f0a;">${o.replaceYear}</div>\n                    </div>\n                </div>\n\n                <div style="background:rgba(52,199,89,0.08);border:1px solid rgba(52,199,89,0.2);border-radius:12px;padding:12px;margin-bottom:12px;">\n                    <div style="font-size:0.78rem;font-weight:800;color:#34c759;margin-bottom:8px;">💡 改善アドバイス</div>\n                    ${o.tips.map((e) => `<div style="font-size:0.83rem;color:var(--text);padding:3px 0;">• ${e}</div>`).join("")}\n                </div>\n\n                <div style="font-size:0.85rem;color:var(--sub-text);line-height:1.6;">${o.summary}</div>\n                <div style="font-size:0.72rem;color:#555;margin-top:10px;">※ AI推定値です。実際の劣化状況と異なる場合があります。</div>\n            </div>`;
  } catch (e) {
    a.innerHTML =
      '<div style="color:#ff453a;font-size:0.85rem;padding:12px;">予測に失敗しました。もう一度お試しください。</div>';
  }
  ((r.disabled = !1), (r.textContent = "🔮 再予測する"));
}
function openUpgradeSimulator() {
  if ((_progressMission("upgrade_sim"), !_isProUltra)) return;
  let e = document.getElementById("upgrade-sim-modal");
  e ||
    ((e = document.createElement("div")),
    (e.id = "upgrade-sim-modal"),
    (e.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:999995;display:flex;justify-content:center;align-items:flex-end;box-sizing:border-box;"),
    document.body.appendChild(e));
  const t = DEVICE_DB.map(
    (e) => `<option value="${e.name}">${e.name}（${e.year}）</option>`,
  ).join("");
  ((e.innerHTML = `\n        <div style="width:100%;max-width:540px;background:var(--card);border-radius:24px 24px 0 0;padding:28px 20px 40px;max-height:90vh;overflow-y:auto;">\n            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">\n                <div>\n                    <div style="font-size:1.15rem;font-weight:900;color:var(--text);">📱 買い替えシミュレーター</div>\n                    <div style="font-size:0.78rem;color:#f59e0b;font-weight:700;margin-top:2px;">👑 ProUltra限定</div>\n                </div>\n                <button onclick="document.getElementById('upgrade-sim-modal').style.display='none'"\n                    style="background:rgba(255,255,255,0.08);border:none;color:var(--sub-text);font-size:1.3rem;width:36px;height:36px;border-radius:50%;cursor:pointer;">×</button>\n            </div>\n\n            <div style="display:flex;flex-direction:column;gap:14px;">\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">📱 今の機種</div>\n                    <select id="us-current" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">\n                        <option value="">選択してください</option>\n                        ${t}\n                        <option value="__custom__">リストにない機種（AI検索）</option>\n                    </select>\n                    <input id="us-current-custom" type="text" placeholder="機種名を入力（例: Galaxy A55）"\n                        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.88rem;box-sizing:border-box;margin-top:8px;display:none;">\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">✨ 乗り換え候補（複数選択可）</div>\n                    <div id="us-target-checks" style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:8px;max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;">\n                        ${DEVICE_DB.map((e) => `\n                            <label style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;cursor:pointer;transition:background 0.15s;" onclick="this.style.background=this.querySelector('input').checked?'rgba(124,58,237,0.18)':'transparent'">\n                                <input type="checkbox" value="${e.name}" style="width:17px;height:17px;accent-color:var(--accent);cursor:pointer;flex-shrink:0;">\n                                <span style="font-size:0.86rem;color:var(--text);">${e.name} <span style="color:var(--sub-text);font-size:0.78rem;">(${e.year})</span></span>\n                            </label>`).join("")}\n                    </div>\n                    <input id="us-target-custom" type="text" placeholder="リストにない候補（カンマ区切り）"\n                        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.88rem;box-sizing:border-box;margin-top:8px;">\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">💰 予算（円）</div>\n                    <select id="us-budget" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:11px 14px;color:var(--text);font-size:0.88rem;box-sizing:border-box;">\n                        <option value="50000">〜5万円</option>\n                        <option value="80000">〜8万円</option>\n                        <option value="120000" selected>〜12万円</option>\n                        <option value="160000">〜16万円</option>\n                        <option value="999999">上限なし</option>\n                    </select>\n                </div>\n                <div>\n                    <div style="font-size:0.82rem;color:var(--sub-text);margin-bottom:6px;">🎯 重視するポイント</div>\n                    <div style="display:flex;flex-wrap:wrap;gap:8px;" id="us-priorities">\n                        ${["カメラ", "バッテリー", "処理速度", "画面", "コスパ", "軽さ・サイズ", "5G対応", "AI機能"].map((e) => `\n                            <button onclick="this.classList.toggle('selected');this.style.background=this.classList.contains('selected')?'var(--accent)':'rgba(255,255,255,0.06)';this.style.color=this.classList.contains('selected')?'#fff':'var(--sub-text)';"\n                                style="background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--sub-text);padding:7px 13px;border-radius:20px;font-size:0.82rem;cursor:pointer;"\n                                data-priority="${e}">${e}</button>`).join("")}\n                    </div>\n                </div>\n            </div>\n\n            <button onclick="runUpgradeSimulator()" id="us-run-btn"\n                style="width:100%;margin-top:20px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;border-radius:14px;padding:15px;font-size:1rem;font-weight:900;cursor:pointer;letter-spacing:0.5px;">\n                🚀 シミュレーション開始\n            </button>\n            <div id="us-result" style="margin-top:20px;"></div>\n        </div>`),
    (e.style.display = "flex"),
    document
      .getElementById("us-current")
      .addEventListener("change", function () {
        document.getElementById("us-current-custom").style.display =
          "__custom__" === this.value ? "block" : "none";
      }));
}
async function runUpgradeSimulator() {
  if (!_isProUltra) return;
  const e = document.getElementById("us-current"),
    t =
      "__custom__" === e.value
        ? document.getElementById("us-current-custom").value.trim()
        : e.value,
    n = (e) => {
      let t = document.getElementById("us-error-msg");
      (t ||
        ((t = document.createElement("div")),
        (t.id = "us-error-msg"),
        (t.style.cssText =
          "color:#ff453a;font-size:0.85rem;font-weight:700;padding:10px 14px;background:rgba(255,59,48,0.1);border:1px solid rgba(255,59,48,0.3);border-radius:10px;margin-bottom:12px;"),
        document.getElementById("us-run-btn").before(t)),
        (t.textContent = "⚠️ " + e),
        (t.style.display = "block"),
        setTimeout(() => {
          t && (t.style.display = "none");
        }, 3e3));
    };
  if (!t) return void n("今の機種を選択してください");
  const o = [
      ...document.querySelectorAll(
        "#us-target-checks input[type=checkbox]:checked",
      ),
    ].map((e) => e.value),
    i = document.getElementById("us-target-custom").value.trim(),
    a = [
      ...o,
      ...(i
        ? i
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        : []),
    ];
  if (0 === a.length)
    return void n("乗り換え候補を1つ以上チェックしてください");
  const r = parseInt(document.getElementById("us-budget").value),
    s = [...document.querySelectorAll("#us-priorities .selected")].map(
      (e) => e.dataset.priority,
    ),
    d = document.getElementById("us-run-btn"),
    l = document.getElementById("us-result");
  ((d.disabled = !0),
    (d.textContent = "🤖 AI分析中..."),
    (l.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--sub-text);font-size:0.88rem;">AIが比較分析しています…</div>'));
  const c = DEVICE_DB.find((e) => e.name === t),
    p = a.map((e) => DEVICE_DB.find((t) => t.name === e) || { name: e }),
    u = `あなたはスマートフォン買い替えアドバイザーです。以下の条件で買い替えシミュレーションを行い、日本語でJSONのみ返してください。\n\n【現在の機種】\n${JSON.stringify(c || { name: t })}\n\n【乗り換え候補】\n${JSON.stringify(p)}\n\n【予算】${r.toLocaleString()}円以下\n【重視ポイント】${s.length > 0 ? s.join("、") : "特になし"}\n\n【出力形式】JSONのみ。マークダウン不要。\n{\n  "ranking": [\n    {\n      "rank": 1,\n      "name": "機種名",\n      "overallScore": 85,\n      "upgradeRate": "+23%",\n      "price": "推定価格（円）",\n      "pros": ["メリット1（20字以内）", "メリット2（20字以内）"],\n      "cons": ["デメリット1（20字以内）"],\n      "verdict": "一言評価（20字以内）",\n      "recommended": true\n    }\n  ],\n  "summary": "総評（60字程度）",\n  "bestChoice": "最もおすすめの機種名"\n}\nrankingは最大3件。overallScoreは0-100で現在機種との相対評価。`;
  try {
    const e = await fetch("https://proultra.yuyusesabuchanneru.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: u }] }),
      }),
      t = await e.json(),
      n = (t.choices?.[0]?.message?.content || "")
        .replace(/```json|```/g, "")
        .trim(),
      o = JSON.parse(n),
      i = ["🥇", "🥈", "🥉"];
    l.innerHTML = `\n            <div style="display:flex;flex-direction:column;gap:12px;">\n                <div style="font-size:0.8rem;font-weight:800;color:var(--sub-text);text-transform:uppercase;letter-spacing:1px;">📊 比較結果</div>\n                ${o.ranking.map((e, t) => `\n                    <div style="background:var(--bg);border:1px solid ${e.recommended ? "rgba(124,58,237,0.5)" : "var(--border)"};border-radius:16px;padding:16px;${e.recommended ? "box-shadow:0 0 16px rgba(124,58,237,0.15)" : ""}">\n                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">\n                            <div style="display:flex;align-items:center;gap:8px;">\n                                <span style="font-size:1.3rem;">${i[t] || ""}${e.recommended ? '<span style="font-size:0.7rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:2px 8px;border-radius:20px;margin-left:4px;">おすすめ</span>' : ""}</span>\n                                <span style="font-weight:900;font-size:0.95rem;color:var(--text);">${e.name}</span>\n                            </div>\n                            <span style="font-size:1rem;font-weight:900;color:#34c759;">${e.upgradeRate}</span>\n                        </div>\n                        <div style="display:flex;gap:8px;margin-bottom:10px;">\n                            <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center;">\n                                <div style="font-size:0.7rem;color:var(--sub-text);">スコア</div>\n                                <div style="font-size:1.1rem;font-weight:900;color:var(--text);">${e.overallScore}</div>\n                            </div>\n                            <div style="flex:2;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px;text-align:center;">\n                                <div style="font-size:0.7rem;color:var(--sub-text);">推定価格</div>\n                                <div style="font-size:0.9rem;font-weight:900;color:var(--text);">${e.price}</div>\n                            </div>\n                        </div>\n                        <div style="font-size:0.82rem;color:#34c759;margin-bottom:4px;">${e.pros.map((e) => `✓ ${e}`).join("　")}</div>\n                        <div style="font-size:0.82rem;color:#ff453a;margin-bottom:8px;">${e.cons.map((e) => `✗ ${e}`).join("　")}</div>\n                        <div style="font-size:0.82rem;color:#f59e0b;font-weight:700;">💬 ${e.verdict}</div>\n                    </div>`).join("")}\n                <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:14px;padding:14px;">\n                    <div style="font-size:0.78rem;font-weight:800;color:#a78bfa;margin-bottom:6px;">🏆 最終おすすめ: ${o.bestChoice}</div>\n                    <div style="font-size:0.85rem;color:var(--sub-text);line-height:1.6;">${o.summary}</div>\n                </div>\n                <div style="font-size:0.72rem;color:#555;">※ AI推定値です。最新価格は各キャリア・販売店でご確認ください。</div>\n            </div>`;
  } catch (e) {
    l.innerHTML =
      '<div style="color:#ff453a;font-size:0.85rem;padding:12px;">分析に失敗しました。もう一度お試しください。</div>';
  }
  ((d.disabled = !1), (d.textContent = "🔄 再シミュレーション"));
}
function openBadgeManager() {
  document.getElementById("badge-manager-overlay")?.remove();
  const e = _gachaUnlockedBadges(),
    t = [
      "badge_gold",
      "badge_diamond",
      "badge_retro",
      "badge_star",
      "badge_crown",
    ],
    n = _puPurchases.filter((e) => t.includes(e)),
    o = localStorage.getItem("pu_badge_equipped_v1"),
    i = {
      badge_gold: {
        label: "ゴールド",
        emoji: "🥇",
        color: "#f59e0b",
        glow: "#f59e0b88",
        rarity: "rare",
      },
      badge_diamond: {
        label: "ダイヤ",
        emoji: "💎",
        color: "#67e8f9",
        glow: "#67e8f966",
        rarity: "epic",
      },
      badge_retro: {
        label: "レトロ",
        emoji: "👾",
        color: "#a3e635",
        glow: "#a3e63566",
        rarity: "rare",
      },
      badge_star: {
        label: "スター",
        emoji: "🌟",
        color: "#fbbf24",
        glow: "#fbbf2488",
        rarity: "rare",
      },
      badge_crown: {
        label: "王冠Pro",
        emoji: "👑",
        color: "#ffd700",
        glow: "#ffd70088",
        rarity: "legendary",
      },
    },
    a = [
      ...e
        .map((e) => {
          const t = GACHA_BADGES.find((t) => t.id === e);
          return t ? { ...t, source: "gacha" } : null;
        })
        .filter(Boolean),
      ...n
        .map((e) => {
          const t = i[e];
          return t ? { id: e, ...t, source: "shop" } : null;
        })
        .filter(Boolean),
    ],
    r =
      (getEquippedBadge(),
      `<div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #1e1e1e;background:${o && "gbadge_default" !== o ? "transparent" : "rgba(99,102,241,0.07)"};">\n        <div style="width:44px;height:44px;border-radius:50%;background:rgba(99,102,241,0.1);border:1px solid #6366f144;display:flex;align-items:center;justify-content:center;font-size:1.4rem;filter:drop-shadow(0 0 6px #6366f188);flex-shrink:0;">🚀</div>\n        <div style="flex:1;min-width:0;">\n            <div style="color:#fff;font-weight:800;font-size:0.9rem;">ロケットバッジ ${o && "gbadge_default" !== o ? "" : '<span style="color:#6366f1;font-size:0.72rem;">✓ 装備中</span>'}</div>\n            <div style="color:#6366f1;font-size:0.7rem;font-weight:700;letter-spacing:1px;">DEFAULT · ProUltra特典</div>\n        </div>\n        <button onclick="${o && "gbadge_default" !== o ? "equipBadge('gbadge_default')" : "unequipBadge()"};document.getElementById('badge-manager-overlay').remove();"\n            style="padding:7px 14px;border-radius:10px;background:${o && "gbadge_default" !== o ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#2a2a2a"};border:none;color:${o && "gbadge_default" !== o ? "#fff" : "#888"};font-size:0.8rem;font-weight:800;cursor:pointer;flex-shrink:0;">\n            ${o && "gbadge_default" !== o ? "装備" : "外す"}\n        </button>\n    </div>` +
        (0 === a.length
          ? '<p style="color:#444;text-align:center;padding:16px;font-size:0.82rem;">ガチャやショップで追加バッジを入手しよう！</p>'
          : a
              .map((e) => {
                const t = o === e.id;
                return `<div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #1e1e1e;background:${t ? "rgba(255,215,0,0.06)" : "transparent"};">\n                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.05);border:1px solid ${e.color}44;display:flex;align-items:center;justify-content:center;font-size:1.4rem;filter:drop-shadow(0 0 6px ${e.glow});flex-shrink:0;">${e.emoji}</div>\n                <div style="flex:1;min-width:0;">\n                    <div style="color:#fff;font-weight:800;font-size:0.9rem;">${e.label}バッジ ${t ? '<span style="color:#ffd700;font-size:0.72rem;">✓ 装備中</span>' : ""}</div>\n                    <div style="color:${((n = e.rarity), "legendary" === n ? "#ffd700" : "epic" === n ? "#c084fc" : "#34c759")};font-size:0.7rem;font-weight:700;letter-spacing:1px;">${((e) => ("legendary" === e ? "LEGENDARY" : "epic" === e ? "EPIC" : "RARE"))(e.rarity)} · ${"gacha" === e.source ? "ガチャ" : "ショップ"}</div>\n                </div>\n                <button onclick="${t ? "unequipBadge()" : "equipBadge('" + e.id + "')"};document.getElementById('badge-manager-overlay').remove();"\n                    style="padding:7px 14px;border-radius:10px;background:${t ? "#2a2a2a" : "linear-gradient(135deg," + e.color + "," + e.glow + ")"};border:none;color:${t ? "#888" : "#000"};font-size:0.8rem;font-weight:800;cursor:pointer;flex-shrink:0;">\n                    ${t ? "外す" : "装備"}\n                </button>\n            </div>`;
                var n;
              })
              .join(""))),
    s = document.createElement("div");
  ((s.id = "badge-manager-overlay"),
    (s.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999998;display:flex;align-items:flex-end;justify-content:center;"),
    (s.onclick = (e) => {
      e.target === s && s.remove();
    }),
    (s.innerHTML = `\n        <div style="background:#111;border:1px solid #2a2a2a;border-radius:24px 24px 0 0;width:100%;max-width:500px;max-height:75vh;display:flex;flex-direction:column;">\n            <div style="padding:16px 20px 12px;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">\n                <span style="color:#fff;font-size:1rem;font-weight:900;">🏷️ バッジ管理</span>\n                <button onclick="document.getElementById('badge-manager-overlay').remove()" style="background:none;border:none;color:#555;font-size:0.85rem;cursor:pointer;">閉じる</button>\n            </div>\n            <div style="overflow-y:auto;flex:1;">${r}</div>\n            <div style="padding:12px 16px;border-top:1px solid #1e1e1e;flex-shrink:0;">\n                <button onclick="document.getElementById('badge-manager-overlay').remove();openBadgeGachaModal();"\n                    style="width:100%;padding:11px;border-radius:14px;background:linear-gradient(135deg,#ff6eb4,#ffd700);border:none;color:#fff;font-size:0.88rem;font-weight:800;cursor:pointer;">\n                    🎰 ガチャでバッジを狙う\n                </button>\n            </div>\n        </div>`),
    document.body.appendChild(s));
}