/**
 * ============================================================
 *  規約・プライバシーポリシー専用AIチャット — 共通UIコンポーネント
 * ============================================================
 *
 * terms-of-service.html / privacy-policy.html / index.html(同意画面) から
 * 共通で読み込んで使う想定。
 *
 * 【使い方A: フローティングボタン + オーバーレイパネル】(単独ページ向け)
 *   <script src="terms-ai-chat.js"></script>
 *   <script>
 *     TermsAIChat.init({
 *       doc: "terms",  // または "privacy"
 *       quickQuestions: ["推奨環境は？", "禁止行為って何？"]
 *     });
 *   </script>
 *   TermsAIChat.open() で外部から開くこともできる(例: バナーのボタンから)
 *
 * 【使い方B: 指定した要素の中にチャットをそのまま埋め込む】(モーダル内など向け)
 *   <div id="some-host"></div>
 *   <script>
 *     TermsAIChat.mountInline("some-host", {
 *       doc: "terms",
 *       quickQuestions: ["推奨環境は？", "禁止行為って何？"]
 *     });
 *   </script>
 *   ※ 同じ要素に複数回 mountInline すると中身は作り直されます(履歴はリセット)。
 *
 * 接続先Worker: https://kiyakuai.yuyusesabuchanneru.workers.dev/
 */

const TermsAIChat = (() => {
  const WORKER_URL = "https://kiyakuai.yuyusesabuchanneru.workers.dev/";

  let _stylesInjected = false;
  let _instanceSeq = 0;

  // ── スタイル注入(1回だけ) ──────────────────────────────────────
  function injectStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;
    const style = document.createElement("style");
    style.id = "terms-ai-chat-style";
    style.textContent = `
      .tac-fab {
        position: fixed; right: 20px; bottom: 20px; z-index: 9999999999;
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg,#6366f1,#7c3aed);
        border: none; box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; cursor: pointer; transition: transform .2s ease;
      }
      .tac-fab:hover { transform: scale(1.06); }
      .tac-fab:active { transform: scale(0.96); }

      .tac-banner {
        background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(167,139,250,0.08));
        border: 1px solid rgba(99,102,241,0.35);
        border-radius: 16px; padding: 16px 18px; margin-bottom: 28px;
        display: flex; align-items: center; gap: 14px;
      }
      .tac-banner .tac-banner-icon { font-size: 1.6rem; flex-shrink: 0; }
      .tac-banner .tac-banner-text { flex: 1; min-width: 0; }
      .tac-banner .tac-banner-text strong { display: block; color: #fff; font-size: 0.92rem; font-weight: 800; margin-bottom: 2px; }
      .tac-banner .tac-banner-text span { display: block; color: #9a9a9a; font-size: 0.8rem; }
      .tac-banner button {
        flex-shrink: 0; background: linear-gradient(135deg,#6366f1,#7c3aed);
        border: none; color: #fff; font-size: 0.82rem; font-weight: 800;
        padding: 10px 16px; border-radius: 12px; cursor: pointer; white-space: nowrap;
      }
      @media (max-width: 480px) {
        .tac-banner { flex-direction: column; align-items: stretch; text-align: center; }
        .tac-banner button { width: 100%; }
      }

      .tac-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999999999;
        display: none; align-items: flex-end; justify-content: center;
      }
      .tac-overlay.tac-open { display: flex; }
      @media (min-width: 640px) {
        .tac-overlay { align-items: center; }
      }

      .tac-panel {
        width: 100%; max-width: 480px; max-height: 82vh;
        background: #111; border: 1px solid #2a2a2a;
        border-radius: 20px 20px 0 0;
        display: flex; flex-direction: column; overflow: hidden;
        animation: tac-slide-up .25s ease;
      }
      @media (min-width: 640px) {
        .tac-panel { border-radius: 20px; max-height: 640px; margin: 20px; }
      }
      @keyframes tac-slide-up {
        from { transform: translateY(24px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      /* インライン埋め込み版(モーダル常設エリア等) */
      .tac-inline {
        background: #0c0c0c; border: 1px solid #2a2a2a; border-radius: 16px;
        display: flex; flex-direction: column; overflow: hidden; max-height: 380px;
        overscroll-behavior: contain;
      }

      .tac-header {
        padding: 14px 16px; border-bottom: 1px solid #2a2a2a;
        display: flex; align-items: center; justify-content: space-between;
        background: #111;
      }
      .tac-header .tac-title { display: flex; flex-direction: column; gap: 2px; }
      .tac-header .tac-title strong { color: #fff; font-size: 0.9rem; font-weight: 900; }
      .tac-header .tac-title span { color: #6b6b6b; font-size: 0.7rem; }
      .tac-close {
        background: #222; border: none; color: #888; width: 28px; height: 28px;
        border-radius: 50%; font-size: 0.95rem; cursor: pointer; flex-shrink: 0;
      }

      .tac-scope-note {
        padding: 8px 16px; font-size: 0.72rem; color: #7c7c7c;
        background: #0c0c0c; border-bottom: 1px solid #1e1e1e;
      }

      .tac-messages {
        flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain; touch-action: pan-y;
        padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
      }

      .tac-quick-wrap { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 4px; }
      .tac-quick-btn {
        background: #1a1a1a; border: 1px solid #333; color: #c9c2ff;
        font-size: 0.78rem; font-weight: 600; padding: 8px 12px; border-radius: 12px;
        cursor: pointer; text-align: left; line-height: 1.4;
      }
      .tac-quick-btn:hover { border-color: #6366f1; background: #1e1b34; }

      .tac-msg { max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: 0.84rem; line-height: 1.65; word-break: break-word; }
      .tac-msg-user { align-self: flex-end; background: linear-gradient(135deg,#6366f1,#7c3aed); color: #fff; border-bottom-right-radius: 4px; }
      .tac-msg-assistant { align-self: flex-start; background: #1a1a1a; border: 1px solid #2a2a2a; color: #e0e0e0; border-bottom-left-radius: 4px; }
      .tac-msg-assistant.tac-msg-error { border-color: rgba(255,107,107,0.4); color: #ffb3b3; background: #1c0f0f; }
      .tac-msg p { margin: 0 0 8px; }
      .tac-msg p:last-child { margin-bottom: 0; }

      .tac-typing { align-self: flex-start; display: flex; gap: 4px; padding: 11px 13px; }
      .tac-typing span { width: 6px; height: 6px; border-radius: 50%; background: #666; animation: tac-bounce 1.2s infinite ease-in-out; }
      .tac-typing span:nth-child(2) { animation-delay: .15s; }
      .tac-typing span:nth-child(3) { animation-delay: .3s; }
      @keyframes tac-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }

      .tac-input-row {
        border-top: 1px solid #2a2a2a; padding: 10px 12px; display: flex; gap: 8px;
        background: #111;
      }
      .tac-input {
        flex: 1; background: #1a1a1a; border: 1px solid #333; border-radius: 14px;
        color: #fff; font-size: 0.86rem; padding: 10px 13px; resize: none;
        font-family: inherit; max-height: 90px;
      }
      .tac-input:focus { outline: none; border-color: #6366f1; }
      .tac-send {
        flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px;
        background: linear-gradient(135deg,#6366f1,#7c3aed); border: none; color: #fff;
        font-size: 1.05rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      .tac-send:disabled { opacity: .4; cursor: default; }
    `;
    document.head.appendChild(style);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function simpleMarkdownToHTML(text) {
    let html = escapeHTML(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    return `<p>${html}</p>`;
  }

  // ── チャットインスタンス(オーバーレイ版・インライン版共通の中身) ───────────
  // root: メッセージ等を描画するDOM一式が入るコンテナ(中に .tac-messages 等を作る)
  function createChatCore(root, opts) {
    const doc = opts.doc === "privacy" ? "privacy" : "terms";
    const docLabel = doc === "privacy" ? "プライバシーポリシー" : "利用規約";
    const quickQuestions = Array.isArray(opts.quickQuestions) ? opts.quickQuestions : [];
    let history = [];

    const messagesEl = root.querySelector(".tac-messages");
    const inputEl = root.querySelector(".tac-input");
    const sendBtnEl = root.querySelector(".tac-send");

    function renderQuickQuestions() {
      if (!messagesEl || history.length > 0) return;
      const intro = document.createElement("div");
      intro.className = "tac-msg tac-msg-assistant";
      intro.innerHTML = `${docLabel}について、気になることを聞いてください。よくある質問はこちら👇`;
      messagesEl.appendChild(intro);

      if (quickQuestions.length) {
        const qwrap = document.createElement("div");
        qwrap.className = "tac-quick-wrap";
        quickQuestions.forEach((q) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tac-quick-btn";
          btn.textContent = q;
          btn.addEventListener("click", () => sendMessage(q));
          qwrap.appendChild(btn);
        });
        messagesEl.appendChild(qwrap);
      }
    }

    function appendMessage(role, content, isError) {
      const el = document.createElement("div");
      el.className = `tac-msg tac-msg-${role}${isError ? " tac-msg-error" : ""}`;
      el.innerHTML = role === "assistant" ? simpleMarkdownToHTML(content) : escapeHTML(content);
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    function showTyping() {
      const el = document.createElement("div");
      el.className = "tac-typing";
      el.setAttribute("data-tac-typing", "1");
      el.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
      const el = messagesEl.querySelector("[data-tac-typing]");
      if (el) el.remove();
    }

    async function sendMessage(presetText) {
      const text = (presetText !== undefined ? presetText : inputEl.value).trim();
      if (!text) return;

      const quickWrap = messagesEl.querySelector(".tac-quick-wrap");
      if (quickWrap) quickWrap.remove();

      appendMessage("user", text);
      history.push({ role: "user", content: text });

      inputEl.value = "";
      inputEl.style.height = "auto";
      inputEl.disabled = true;
      sendBtnEl.disabled = true;
      showTyping();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        const resp = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doc: doc,
            messages: history.slice(-12),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        hideTyping();

        if (!resp.ok) {
          appendMessage("assistant", "通信エラーが発生しました。しばらくしてからもう一度お試しください。", true);
          return;
        }

        const data = await resp.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
          appendMessage("assistant", "回答を取得できませんでした。もう一度お試しください。", true);
          return;
        }

        appendMessage("assistant", reply);
        history.push({ role: "assistant", content: reply });
      } catch (e) {
        hideTyping();
        const msg = e.name === "AbortError"
          ? "応答がタイムアウトしました。もう一度お試しください。"
          : "接続できませんでした。ネットワーク状況をご確認のうえ、もう一度お試しください。";
        appendMessage("assistant", msg, true);
      } finally {
        inputEl.disabled = false;
        sendBtnEl.disabled = false;
      }
    }

    sendBtnEl.addEventListener("click", () => sendMessage());
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    inputEl.addEventListener("input", () => {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + "px";
    });

    renderQuickQuestions();

    return { sendMessage, docLabel };
  }

  function chatMarkup(docLabel, scoped) {
    return `
      <div class="tac-header">
        <div class="tac-title">
          <strong>🤖 ${docLabel}について質問する</strong>
          <span>気になるところだけ、すぐ聞けます</span>
        </div>
        ${scoped ? '<button type="button" class="tac-close" aria-label="閉じる">✕</button>' : ""}
      </div>
      <div class="tac-scope-note">⚠️ このAIは${docLabel}に関するご質問のみお答えします</div>
      <div class="tac-messages"></div>
      <div class="tac-input-row">
        <textarea class="tac-input" rows="1" placeholder="質問を入力..."></textarea>
        <button type="button" class="tac-send" aria-label="送信">↑</button>
      </div>
    `;
  }

  // ── A: フローティングボタン + オーバーレイ版(シングルトン、ページに1つ想定) ──
  let _overlayEl = null;
  let _overlayCore = null;

  function ensureOverlay(opts) {
    if (_overlayEl) return;
    injectStyles();

    if (opts.showFab !== false) {
      const fab = document.createElement("button");
      fab.type = "button";
      fab.className = "tac-fab";
      fab.setAttribute("aria-label", "AIに質問する");
      fab.innerHTML = "💬";
      fab.addEventListener("click", openOverlay);
      document.body.appendChild(fab);
    }

    const overlay = document.createElement("div");
    overlay.className = "tac-overlay";
    const docLabel = opts.doc === "privacy" ? "プライバシーポリシー" : "利用規約";
    overlay.innerHTML = `<div class="tac-panel" role="dialog" aria-label="${docLabel}AIチャット">${chatMarkup(docLabel, true)}</div>`;
    document.body.appendChild(overlay);
    _overlayEl = overlay;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
    overlay.querySelector(".tac-close").addEventListener("click", closeOverlay);

    _overlayCore = createChatCore(overlay, opts);
  }

  function openOverlay() {
    if (!_overlayEl) return;
    _overlayEl.classList.add("tac-open");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    if (!_overlayEl) return;
    _overlayEl.classList.remove("tac-open");
    document.body.style.overflow = "";
  }

  // ── B: 指定要素にそのまま埋め込む版(複数個所に置ける) ─────────────────
  function mountInline(elementOrId, opts) {
    injectStyles();
    opts = opts || {};
    const host = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!host) {
      console.error("TermsAIChat.mountInline: 指定された要素が見つかりません:", elementOrId);
      return null;
    }
    host.classList.add("tac-inline");
    const docLabel = opts.doc === "privacy" ? "プライバシーポリシー" : "利用規約";
    host.innerHTML = chatMarkup(docLabel, false);
    _instanceSeq += 1;
    return createChatCore(host, opts);
  }

  // ── 公開API ──────────────────────────────────────────────────
  function init(opts) {
    opts = opts || {};
    ensureOverlay(opts);
  }

  function open() {
    openOverlay();
  }

  return { init, open, mountInline };
})();
