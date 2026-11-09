// 国西Monsters 軽いページ共通
// ▼ スプレッドシートのWebアプリURL（URLが変わったときだけ書きかえる）
var GAS = 'https://script.google.com/macros/s/AKfycbzWKxTzp-gFCTlm5i-hG02nMi_izvL6k5xKX6Kkl_a-sBGoyK1wJoWLtrCyrT1owAv1WA/exec';
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function toast(t) { var e = $('toast'); if (!e) return; e.textContent = t; e.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(function () { e.style.display = 'none'; }, 1800); }
function api(params) {
  var q = 'mode=api&t=' + Date.now();
  Object.keys(params).forEach(function (k) { q += '&' + k + '=' + encodeURIComponent(params[k]); });
  return fetch(GAS + '?' + q).then(function (r) { return r.json(); }).then(function (d) { if (d && d.error) throw new Error(d.error); return d; });
}
function cacheGet(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function cacheSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
var STAFF = new URLSearchParams(location.search).get('v') === 's' || /(^|\/)(staff|attendview|staffview)\.html$/.test(location.pathname);
function nav(active) {
  var fast = { schedule: './', attend: 'attend.html', duty: 'duty.html', check: 'check.html', staff: 'staff.html', attendview: 'attendview.html', staffview: 'staffview.html' };
  var items = STAFF
    ? [['staff', 'スタッフ可否'], ['attendview', '出欠一覧'], ['staffview', 'スタッフ予定'], ['schedule', '予定表']]
    : [['schedule', '予定表'], ['attend', '出欠連絡'], ['duty', '当番希望'], ['check', '当日出席簿'], ['photo', '写真登録']];
  $('nav').innerHTML = items.map(function (it) {
    var href = fast[it[0]] ? fast[it[0]] + (STAFF ? '?v=s' : '') : GAS + '?mode=' + it[0] + (STAFF ? '&v=s' : '');
    return '<a' + (it[0] === active ? ' class="on"' : '') + ' href="' + href + '">' + it[1] + '</a>';
  }).join('');
}
