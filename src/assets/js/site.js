/* Innovative Village — shared site script */
(function () {
  'use strict';

  /* ---------- mobile menu ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('main-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  /* photo decks: tap (touch) or Enter/Space (keyboard) fans the cards out */
  document.querySelectorAll('.deck').forEach(function (deck) {
    deck.addEventListener('click', function () { deck.classList.toggle('fan'); });
    deck.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deck.classList.toggle('fan'); }
    });
    deck.addEventListener('mouseleave', function () { deck.classList.remove('fan'); });
    deck.addEventListener('blur', function () { deck.classList.remove('fan'); });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.deck.fan').forEach(function (d) { if (!d.contains(e.target)) d.classList.remove('fan'); });
  });

  /* links waiting for real URLs (e.g. partner websites) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[aria-disabled="true"]');
    if (a) e.preventDefault();
  });

  /* ---------- storage (safe) ---------- */
  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }
  function writeStore(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  /*
   * IV.submit(type, data)
   * จุดเดียวที่ทุกฟอร์มส่งข้อมูลออกไป: booking-meeting, booking-visit, contact, intern
   * ตอนนี้บันทึกไว้ในเบราว์เซอร์ (localStorage) — เมื่อมี backend ให้เปลี่ยน ENDPOINT
   * แล้ว backend เป็นคนแจ้งทีม IV ทาง LINE + Email ตาม flow ในดีไซน์
   */
  var ENDPOINT = ''; // e.g. 'https://api.innovativevillage.com/requests'
  function submit(type, data) {
    var record = { id: 'IV-' + Date.now().toString(36).toUpperCase(), type: type, data: data, createdAt: new Date().toISOString() };
    var all = readStore('iv_requests');
    all.push(record);
    writeStore('iv_requests', all);
    if (!ENDPOINT) return Promise.resolve(record);
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })
      .then(function () { return record; })
      .catch(function () { return record; });
  }

  /* ---------- form validation ---------- */
  function validate(root) {
    var ok = true, first = null;
    root.querySelectorAll('[required]').forEach(function (el) {
      var field = el.closest('.field');
      var valid = el.value.trim() !== '' && el.checkValidity();
      if (field) {
        field.classList.toggle('invalid', !valid);
        var err = field.querySelector('.err');
        if (err) err.textContent = valid ? '' : (el.type === 'email' && el.value ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'กรุณากรอกข้อมูลนี้');
      }
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }
  function values(root) {
    var out = {};
    root.querySelectorAll('input,select,textarea').forEach(function (el) {
      if (el.name) out[el.name] = el.value.trim();
    });
    return out;
  }
  document.addEventListener('input', function (e) {
    var field = e.target.closest && e.target.closest('.field.invalid');
    if (field && e.target.value.trim() !== '' && e.target.checkValidity()) {
      field.classList.remove('invalid');
      var err = field.querySelector('.err'); if (err) err.textContent = '';
    }
  });

  /* ---------- dates (Thai) ---------- */
  var WD = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  var MO = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /*
   * Page parameters (e.g. booking.html?tab=visit&room=S).
   * Some hosts drop the query string when moving between pages, so the query
   * is also handed over through sessionStorage when an internal link is clicked.
   */
  function pageKey(path) { return 'iv_q:' + ((path.split('/').pop() || 'index.html').split('?')[0].split('#')[0] || 'index.html'); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/^(https?:|mailto:|tel:|#)/.test(h) || h.indexOf('?') < 0) return;
    try { sessionStorage.setItem(pageKey(h), h.split('?')[1].split('#')[0]); } catch (err) { /* ignore */ }
  }, true);
  var query = location.search.replace(/^\?/, '');
  try {
    var k = pageKey(location.pathname), stored = sessionStorage.getItem(k);
    if (!query && stored) query = stored;
    sessionStorage.removeItem(k);
  } catch (err) { /* ignore */ }

  window.IV = { submit: submit, validate: validate, values: values, WD: WD, MO: MO, MONTHS: MONTHS, esc: esc, params: new URLSearchParams(query) };
})();
