/* Innovative Village — shared site script */
(function () {
  'use strict';

  /* ---------- start at the top ----------
   * The browser normally keeps the scroll position on Refresh. Every page here
   * starts at the top instead. Links to a section (e.g. spaces.html#office)
   * still jump to that section, except on Refresh, which always goes to the top.
   */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  var nav0 = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  if (nav0.type === 'reload' || !location.hash) {
    window.scrollTo(0, 0);
    window.addEventListener('load', function () { window.scrollTo(0, 0); });
  }

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

  /* ---------- scroll reveal (every page) ----------
   * Headings, text, photos and cards fade and rise in, one after another, as
   * they scroll into view. What is already on screen when the page opens (the
   * title and buttons at the top) plays straight away. Once shown, a part stays
   * shown, so scrolling back up shows everything normally. The effect plays
   * again on every new visit to a page, including Back from another page.
   * Pages with their own reveal (Herbal Studio: .hs-rv) are left to that script.
   */
  var REVEAL = [
    /* home */
    '.hero-copy > *', '.hero-visual', '.promo-in > *', '.twin-teaser > *', '.twin-list li',
    '.partner-strip', '.cta-band .row > *',
    /* shared blocks on every page */
    'main .head > *', 'main .head-row > *', 'main .page-head > *', 'main .grid > *',
    'main .container > *', 'main .stack > *', 'main .jump', 'main .tabs', 'main .timeline > *',
    'main .book-wrap > *', 'main .contact-wrap > *', 'main .apply-wrap > *', 'main .twin-wrap > *',
    'main .join-steps > *', 'main .faq > *'
  ].join(',');
  function pickReveal() {
    var all = Array.prototype.slice.call(document.querySelectorAll(REVEAL));
    var set = new Set(all);
    return all.filter(function (el) {
      if (el.closest('.hs-rv, header, footer, [hidden]')) return false;
      // reveal the smallest parts: skip a wrapper when its own children are revealed
      for (var i = 0; i < all.length; i++) if (all[i] !== el && el.contains(all[i])) return false;
      var cs = getComputedStyle(el);
      // leave alone anything already moved by its own CSS, pinned, or not drawn
      if (cs.transform !== 'none' || cs.position === 'fixed' || cs.position === 'sticky' || cs.display === 'none') return false;
      return set.has(el);
    });
  }
  function setupReveal() {
    if (!('IntersectionObserver' in window) || document.querySelector('.hs-rv')) return;
    // clear any earlier run first, so a replay measures each element as it really is
    document.querySelectorAll('.rv').forEach(function (el) {
      clearTimeout(el._rvT); el.style.transition = 'none'; el.classList.remove('rv', 'rv-in');
    });
    var items = pickReveal();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('rv-in');
        io.unobserve(el);
        // when the fade is over, hand the element back to its own styles (hover effects etc.)
        var d = parseFloat(el.style.getPropertyValue('--rv-d')) || 0;
        clearTimeout(el._rvT);
        el._rvT = setTimeout(function () { el.classList.remove('rv', 'rv-in'); }, (d + 1.1) * 1000);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    var seen = new Map();
    items.forEach(function (el) {
      // stagger siblings that share a parent: cards in a row come in one after another
      var n = seen.get(el.parentNode) || 0; seen.set(el.parentNode, n + 1);
      el.style.setProperty('--rv-d', Math.min(n, 6) * 0.09 + 's');
      clearTimeout(el._rvT);
      el.style.transition = 'none';            // reset instantly (no fade-out) before replaying
      el.classList.remove('rv-in');
      el.classList.add('rv');
      void el.offsetWidth;
      el.style.transition = '';
      io.observe(el);
    });
    return io;
  }
  var revealIO;
  // run after the page's own script has drawn its content (cards, lists)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { revealIO = setupReveal(); });
  else revealIO = setupReveal();
  // coming Back to a page from another page restores it from cache: replay
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    if (revealIO) revealIO.disconnect();
    revealIO = setupReveal();
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
