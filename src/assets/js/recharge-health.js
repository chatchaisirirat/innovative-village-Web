/* Recharge Health page: reveal, drawer menu, hotspots, scroll-scrubbed statement,
   expanding accordion, spectrum selector, stacking cards, carousel, FAQ. */
(function () {
  'use strict';
  var root = document.querySelector('.rh');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }

  /* ---------- reveal (once per visit, replays on Back) ---------- */
  var io = null;
  function setupReveal() {
    var els = $$('.rh-rv');
    if (io) io.disconnect();
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) { e.classList.remove('in'); });
    // stagger siblings that share a parent (80ms)
    var groups = new Map();
    els.forEach(function (e) {
      var p = e.parentElement, n = groups.get(p) || 0;
      e.style.setProperty('--d', Math.min(n * 0.08, 0.48) + 's');
      groups.set(p, n + 1);
    });
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (e) {
      // anything already in the first screen plays right away
      var r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(function () { e.classList.add('in'); });
      else io.observe(e);
    });
  }
  setupReveal();
  window.addEventListener('pageshow', function (e) { if (e.persisted) setupReveal(); });

  /* ---------- drawer menu ---------- */
  var burger = root.querySelector('.rh-burger'), drawer = root.querySelector('.rh-drawer'), back = root.querySelector('.rh-backdrop');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      drawer.hidden = false; back.hidden = false;
      requestAnimationFrame(function () { drawer.classList.add('on'); back.classList.add('on'); });
      document.documentElement.style.overflow = 'hidden';
      setTimeout(function () { var a = drawer.querySelector('a'); if (a) a.focus(); }, 60);
    } else {
      drawer.classList.remove('on'); back.classList.remove('on');
      document.documentElement.style.overflow = '';
      setTimeout(function () { if (burger.getAttribute('aria-expanded') === 'false') { drawer.hidden = true; back.hidden = true; } }, reduce ? 0 : 340);
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  back.addEventListener('click', function () { setMenu(false); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    closeTips();
  });

  /* ---------- hotspots ---------- */
  var spots = $$('.rh-hs');
  spots.forEach(function (s) {
    var x = parseFloat(s.style.getPropertyValue('--x'));
    if (x < 38) s.classList.add('right'); else if (x > 62) s.classList.add('left');
    var b = s.querySelector('button'), t = s.querySelector('.rh-tip');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeTips();
      if (!open) { b.setAttribute('aria-expanded', 'true'); t.hidden = false; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); }
    });
  });
  function closeTips() { spots.forEach(function (s) { s.querySelector('button').setAttribute('aria-expanded', 'false'); s.querySelector('.rh-tip').hidden = true; }); }
  document.addEventListener('click', function (e) { if (!e.target.closest('.rh-hs')) closeTips(); });

  /* ---------- statement: words light up with scroll ---------- */
  var scrub = root.querySelector('[data-scrub]'), words = [];
  if (scrub) {
    var text = scrub.textContent.trim(), parts = [];
    if (window.Intl && Intl.Segmenter) {
      var seg = new Intl.Segmenter('th', { granularity: 'word' });
      for (var it = seg.segment(text)[Symbol.iterator](), s; !(s = it.next()).done;) parts.push(s.value.segment);
    } else parts = text.split(/(\s+)/);
    scrub.textContent = '';
    var HL = ['ถูกต้อง', 'วัด', 'ได้'];
    parts.forEach(function (p) {
      if (/^\s+$/.test(p)) { scrub.appendChild(document.createTextNode(p)); return; }
      var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = p;
      if (HL.indexOf(p) > -1) sp.classList.add('hl');
      scrub.appendChild(sp); words.push(sp);
    });
    scrub.setAttribute('aria-label', text);
  }
  function onScrub() {
    if (!words.length) return;
    var r = scrub.getBoundingClientRect(), vh = innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.45);
    p = Math.max(0, Math.min(1, p));
    var lit = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
  }

  /* ---------- sticky stacking cards ---------- */
  var cards = $$('.rh-card');
  function onStack() {
    if (reduce) return;
    cards.forEach(function (c, i) {
      var nx = cards[i + 1];
      if (!nx) { c.style.transform = ''; c.style.filter = ''; return; }
      var a = c.getBoundingClientRect(), b = nx.getBoundingClientRect();
      var p = 1 - Math.max(0, Math.min(1, (b.top - a.top) / a.height));
      c.style.transform = p > 0 ? 'scale(' + (1 - 0.05 * p).toFixed(4) + ')' : '';
      c.style.filter = p > 0 ? 'brightness(' + (1 - 0.08 * p).toFixed(3) + ')' : '';
    });
  }

  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; onScrub(); onStack(); }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (reduce) words.forEach(function (w) { w.classList.add('on'); }); else onScroll();

  /* ---------- expanding accordion ---------- */
  var acc = $$('.rh-acc-i'), fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function setAcc(i) {
    acc.forEach(function (a, j) { a.classList.toggle('is-on', i === j); a.querySelector('button').setAttribute('aria-expanded', i === j ? 'true' : 'false'); });
  }
  acc.forEach(function (a, i) {
    a.querySelector('button').addEventListener('click', function () { setAcc(i); });
    if (fine) a.addEventListener('mouseenter', function () { setAcc(i); });
  });

  /* ---------- spectrum ---------- */
  var BANDS = {
    uv: { m: '16.81%', nm: '280–315 nm', h: 'UVB · วิตามินดี', d: 'ร่างกายใช้สร้างวิตามินดี แต่ทำร้ายผิวได้ FlexBeam ไม่มีรังสี UV' },
    red: { m: '59.47%', nm: '610–650 nm · พีค 622 nm', h: 'ผิวและเนื้อเยื่อชั้นตื้น', d: 'ใช้ใน FlexBeam: LED แสงสีแดง 3 ดวง สำหรับการฟื้นฟูผิวและเนื้อเยื่อใกล้ผิว' },
    nir: { m: '84.69%', nm: '800–850 nm · พีค 814 nm', h: 'กล้ามเนื้อ ข้อต่อ และพลังงานเซลล์', d: 'ใช้ใน FlexBeam: LED อินฟราเรดใกล้ 6 ดวง ลงลึกถึงกล้ามเนื้อ ข้อต่อ และกระดูก' }
  };
  var wave = root.querySelector('.rh-wave');
  if (wave) {
    var tabs = $$('.rh-wave-tabs button', wave), bands = $$('.band', wave), info = wave.querySelector('.rh-wave-info'), bar = wave.querySelector('.rh-wave-bar');
    var setBand = function (k) {
      var b = BANDS[k];
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.b === k ? 'true' : 'false'); });
      bands.forEach(function (x) { x.classList.toggle('on', x.dataset.b === k); });
      bar.style.setProperty('--m', b.m);
      info.querySelector('.nm').textContent = b.nm;
      info.querySelector('h3').textContent = b.h;
      info.querySelector('.d').textContent = b.d;
      info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setBand(t.dataset.b); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); setBand(n.dataset.b);
      });
    });
    bands.forEach(function (x) { x.addEventListener('click', function () { setBand(x.dataset.b); }); });
    setBand('red');
  }

  /* ---------- carousel ---------- */
  var car = root.querySelector('.rh-car');
  if (car) {
    var track = car.querySelector('.rh-car-track'), slides = $$('.rh-slide', car), dotsBox = car.querySelector('.rh-car-dots'), cur = 0;
    var dots = slides.map(function (s, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', 'ภาพที่ ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(b); return b;
    });
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * cur) + '%)';
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === cur ? 'false' : 'true'); });
      dots.forEach(function (d, j) { d.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
    };
    car.querySelector('.prev').addEventListener('click', function () { go(cur - 1); });
    car.querySelector('.next').addEventListener('click', function () { go(cur + 1); });
    var x0 = null;
    car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1));
    });
    go(0);
  }

  /* ---------- FAQ ---------- */
  $$('.rh-q').forEach(function (q) {
    var b = q.querySelector('button');
    b.addEventListener('click', function () {
      var open = !q.classList.contains('open');
      q.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
