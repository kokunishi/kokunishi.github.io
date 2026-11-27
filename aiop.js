// 国西Monsters 案内AI（AIオペレーター）— 本番チャットUI
// 右下「💬 質問する」ボタン → チャット窓。本体GASの doPost（AiOperator.gs）へ質問を送る。
// キャラクター画像は使わない（2026-11-27 ユーザー決定）。
// GAS のURLは各ページが定義している GAS 変数を優先し、無ければ下の定数を使う。
(function () {
  'use strict';
  var FALLBACK_GAS = 'https://script.google.com/macros/s/AKfycbzWKxTzp-gFCTlm5i-hG02nMi_izvL6k5xKX6Kkl_a-sBGoyK1wJoWLtrCyrT1owAv1WA/exec';
  var ENDPOINT = (typeof GAS !== 'undefined' && GAS) ? GAS : FALLBACK_GAS;

  var css = [
    '#kmAiopFab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;gap:8px;background:linear-gradient(180deg,#fff0a6,#ffce1f 55%,#f2b800);color:#121000;border:0;border-radius:999px;padding:13px 20px;font-size:15px;font-weight:900;letter-spacing:.04em;box-shadow:0 10px 26px rgba(0,0,0,.55),0 0 20px rgba(255,206,31,.35);cursor:pointer;font-family:inherit}',
    '#kmAiopFab:active{transform:scale(.96)}',
    '#kmAiopPanel{position:fixed;right:12px;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:61;max-width:520px;margin-left:auto;height:min(560px,78vh);display:none;flex-direction:column;background:#0f0f0f;border:1px solid rgba(255,206,31,.45);border-radius:18px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.65);font-family:inherit}',
    '#kmAiopPanel.open{display:flex}',
    '.kmaiop-head{background:#161616;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,206,31,.3)}',
    '.kmaiop-head .t{flex:1}.kmaiop-head .t b{display:block;font-size:15px;color:#ffce1f}.kmaiop-head .t span{font-size:11px;color:#a29d8f}',
    '.kmaiop-head button{background:transparent;border:1px solid rgba(255,255,255,.35);color:#fff;border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;font-family:inherit}',
    '#kmAiopLog{flex:1;overflow-y:auto;padding:12px;background:#0a0a0a}',
    '.kmaiop-msg{max-width:88%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.75;margin-bottom:9px;white-space:pre-wrap;word-break:break-word}',
    '.kmaiop-msg.bot{background:#1b1b1b;border:1px solid rgba(255,255,255,.12);color:#f4f1e8;border-bottom-left-radius:4px}',
    '.kmaiop-msg.user{background:#ffce1f;color:#121000;margin-left:auto;border-bottom-right-radius:4px;font-weight:700}',
    '.kmaiop-msg a{color:#ffce1f;font-weight:700}',
    '.kmaiop-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 12px 10px;background:#0a0a0a}',
    '.kmaiop-chips button{border:1px solid rgba(255,206,31,.6);color:#ffce1f;background:transparent;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}',
    '.kmaiop-form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.12);background:#111}',
    '.kmaiop-form input{flex:1;font-size:16px;padding:11px;border:1px solid rgba(255,255,255,.2);border-radius:12px;min-width:0;background:#1b1b1b;color:#fff;font-family:inherit}',
    '.kmaiop-form button{background:linear-gradient(180deg,#fff0a6,#ffce1f 55%,#f2b800);border:0;border-radius:12px;padding:11px 16px;font-weight:900;cursor:pointer;color:#121000;font-family:inherit}',
    '@media (min-width:600px){#kmAiopPanel{left:auto;width:400px}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button');
  fab.id = 'kmAiopFab'; fab.type = 'button'; fab.textContent = '💬 質問する';
  fab.setAttribute('aria-label', '案内AIを開く');

  var panel = document.createElement('section');
  panel.id = 'kmAiopPanel'; panel.setAttribute('aria-label', '国西Monsters 案内AI');
  panel.innerHTML =
    '<div class="kmaiop-head"><div class="t"><b>国西Monsters 案内AI</b><span>使い方の質問にお答えします</span></div>' +
    '<button id="kmAiopClose" type="button">閉じる</button></div>' +
    '<div id="kmAiopLog"></div>' +
    '<div class="kmaiop-chips" id="kmAiopChips"></div>' +
    '<form class="kmaiop-form" id="kmAiopForm">' +
    '<input id="kmAiopInput" type="text" placeholder="例：休むときはどうすればいい？" autocomplete="off" maxlength="200">' +
    '<button type="submit">送信</button></form>';

  function ready() { document.body.appendChild(fab); document.body.appendChild(panel); wire(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  function wire() {
    var log = document.getElementById('kmAiopLog'), input = document.getElementById('kmAiopInput');
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function addMsg(text, who) {
      var d = document.createElement('div');
      d.className = 'kmaiop-msg ' + who;
      d.innerHTML = esc(text).replace(/(https:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    var busy = false;
    function ask(q) {
      if (!q || busy) return;
      busy = true;
      addMsg(q, 'user');
      addMsg('考えています…', 'bot');
      var wait = log.lastChild;
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ question: q }) })
        .then(function (res) { return res.json(); })
        .then(function (d) {
          wait.remove();
          addMsg((d && d.answer) || 'うまく答えられませんでした。係に確認してください。', 'bot');
        })
        .catch(function () {
          wait.remove();
          addMsg('通信できませんでした。電波の良いところで試し直してください。', 'bot');
        })
        .then(function () { busy = false; });
    }
    fab.addEventListener('click', function () {
      panel.classList.add('open');
      if (!log.children.length) addMsg('こんにちは。国西Monsters案内AIです。予定表・出欠連絡・当番希望・写真登録・配車希望の使い方を聞いてください。登録や変更はできません（案内のみです）。', 'bot');
      input.focus();
    });
    document.getElementById('kmAiopClose').addEventListener('click', function () { panel.classList.remove('open'); });
    document.getElementById('kmAiopForm').addEventListener('submit', function (e) {
      e.preventDefault(); var q = input.value.trim(); input.value = ''; ask(q);
    });
    var SUGGEST = ['休むときはどうすればいい？', '当番希望はどこから？', '写真登録は必須？', '配車の人数はどう数える？', 'マニュアルはどこ？'];
    var chips = document.getElementById('kmAiopChips');
    SUGGEST.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = s;
      b.addEventListener('click', function () { ask(s); }); chips.appendChild(b);
    });
  }
})();
