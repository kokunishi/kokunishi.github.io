/* 国西Monsters 遊び心：金のネオンのバスケットボールが、ポンッと出てきて弾んで消える。
   ・動きを減らす設定の端末では出ません ・ロゴを押すと、ボールがまとめて出ます ・タップの邪魔はしません */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<g fill="none" stroke-linecap="round">' +
    '<g stroke="#ffce1f" stroke-width="5.2"><circle cx="50" cy="50" r="45"/><path d="M50 5V95M5 50H95M19 15C37 33 37 67 19 85M81 15C63 33 63 67 81 85"/></g>' +
    '<g stroke="#fff7cf" stroke-width="1.7"><circle cx="50" cy="50" r="45"/><path d="M50 5V95M5 50H95M19 15C37 33 37 67 19 85M81 15C63 33 63 67 81 85"/></g>' +
    '</g></svg>';
  var live = 0, timer = 0;

  function spawn() {
    if (document.hidden || live >= 3) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var size = 46 + Math.random() * 36;
    var dir = Math.random() < 0.5 ? -1 : 1;
    var leftPx = 12 + Math.random() * Math.max(10, vw - size - 24);
    var el = document.createElement('div');
    el.className = 'bk';
    el.style.cssText = 'left:' + leftPx + 'px;bottom:' + (4 + Math.random() * 22) + 'vh;--s:' + size + 'px;' +
      '--h:' + Math.round(vh * (0.2 + Math.random() * 0.18)) + 'px;' +
      '--dx:' + Math.round(dir * (50 + Math.random() * 110)) + 'px;' +
      '--spin:' + Math.round(dir * (300 + Math.random() * 420)) + 'deg;';
    el.innerHTML = '<i class="bsh"></i><div class="bw"><div class="bs">' + SVG + '</div></div>';
    document.body.appendChild(el);
    live++;
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); live--; }, 4400);
  }
  function loop() {
    spawn();
    timer = setTimeout(loop, 5500 + Math.random() * 5000);
  }
  function burst() { for (var i = 0; i < 3; i++) setTimeout(spawn, i * 260); }

  function start() {
    var mark = document.querySelector('.mark');
    if (mark) { mark.style.cursor = 'pointer'; mark.addEventListener('click', burst); }
    setTimeout(loop, 1400);
  }
  window.kmBall = spawn;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
