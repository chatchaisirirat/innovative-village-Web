/* Recharge Health — FB.2 Light Lab page */
(function () {
  'use strict';
  var root = document.querySelector('.rx');
  if (!root) return;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- boot ---------- */
  if (!reduce) {
    root.classList.add('js');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('go'); }); });
  }
  // stagger indexes for the schematic layers
  $$('.rx-mech .ln, .rx-mech .fl, .rx-ghost .ln').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (el, i) { el.style.setProperty('--i', i); });
  });
  $$('.rx-tiles .lg').forEach(function (el, i) { el.style.setProperty('--k', i); });

  // images: show blueprint placeholder until loaded
  function markLoaded(img) { img.classList.add('ld'); }
  $$('.rx-ph img').forEach(function (img) {
    if (img.complete && img.naturalWidth) markLoaded(img);
    else { img.addEventListener('load', function () { markLoaded(img); }); img.addEventListener('error', function () { markLoaded(img); }); }
  });

  /* ---------- page wipe on leaving ---------- */
  $$('[data-wipe]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      root.classList.add('leave');
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('out'); }); });
      setTimeout(function () { location.href = a.href; }, 780);
    });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leave', 'out'); });

  /* ---------- hero parallax (0.6x) ---------- */
  var mech = $('.rx-mech'), hero = $('.rx-hero');
  if (mech && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var r = hero.getBoundingClientRect();
        if (r.bottom < -600) return;
        var k = window.innerWidth < 900 ? .2 : .4;
        mech.style.transform = 'translate3d(0,' + (-r.top * k).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* ---------- scroll reveals (once, start at 80%) ---------- */
  var groups = new Map();
  $$('.rx-rv').forEach(function (el) {
    var p = el.parentNode, n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 6) * 0.08 + 's');
    groups.set(p, n + 1);
  });
  var revealTargets = $$('.rx-rv, .rx-feat, .rx-dots, .rx-tiles-wrap, .rx-slab, .rx-ghost');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -20% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else revealTargets.forEach(function (el) { el.classList.add('in'); });

  /* ---------- left rail ---------- */
  var rail = $('.rx-rail'), secs = $$('[data-sec]'), cur = 0;
  var rI = $('#rx-rail-i'), rT = $('#rx-rail-t'), rLab = $('.rx-rail-lab');
  function setRail(i) {
    if (i === cur && rI.textContent) return;
    cur = i;
    var p = secs[i].getAttribute('data-sec').split('|');
    rI.textContent = p[0]; rT.textContent = p[1];
    rLab.classList.remove('swap'); void rLab.offsetWidth; rLab.classList.add('swap');
    rail.classList.toggle('on-red', secs[i].classList.contains('rx-hero'));
    $('#rx-up').disabled = i === 0; $('#rx-down').disabled = i === secs.length - 1;
  }
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setRail(secs.indexOf(e.target)); });
    }, { rootMargin: '-45% 0px -54% 0px' });
    secs.forEach(function (s) { rio.observe(s); });
    var vis = new IntersectionObserver(function (es) {
      es.forEach(function (e) { rail.classList.toggle('show', e.isIntersecting); });
    }, { rootMargin: '-30% 0px -30% 0px' });
    vis.observe(root);
  }
  rI.textContent = ''; setRail(0); rail.classList.add('on-red');
  function goSec(i) { if (secs[i]) secs[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  $('#rx-up').addEventListener('click', function () { goSec(cur - 1); });
  $('#rx-down').addEventListener('click', function () { goSec(cur + 1); });

  /* ---------- system carousel ---------- */
  var ITEMS = [
    ['D1', 'FlexBeam Device', 'Hardware', 'sys-device.jpg', 'ผู้ชายสวม FlexBeam ที่หลังส่วนล่างขณะดื่มน้ำในครัว', 'สายรัด 3 โมดูลแบบ hands-free ส่งแสงแดงและอินฟราเรดใกล้ไปยังจุดที่ต้องการ'],
    ['P2', 'Placement & Protocols', 'Protocol', 'sys-placement.jpg', 'ผู้หญิงรัด FlexBeam ที่เข่า', 'คู่มือวางตำแหน่งตามอาการ เข่า ไหล่ หลัง สะโพก ออกแบบโดยทีมคลินิก'],
    ['A3', 'FlexBeam App', 'Software', 'sys-app.jpg', 'ผู้หญิงใช้แอป FlexBeam บนมือถือขณะสวมเครื่องที่หลัง', 'สั่งงานผ่านมือถือ ติดตามประวัติ คำแนะนำอัจฉริยะ เชื่อมข้อมูลจาก wearable อื่น'],
    ['C4', 'Clinics & Learning', 'Network', 'sys-clinic.jpg', 'นักกายภาพวาง FlexBeam ให้ผู้ป่วยในคลินิก', 'คลินิกกายภาพและศูนย์เวชศาสตร์การกีฬาเป็นพันธมิตร พร้อมสัมมนาสดและคลังความรู้']
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return ('0' + n).slice(-2); };
  var car = $('#rx-car'), art = $('#rx-car-art'), ci = 0, timer = null, bar = $('#rx-car-bar');
  function code(it, k) { return '<b>' + it[0] + '</b><span class="n">' + esc(it[1]) + '</span><span class="d"></span><span class="c">' + it[2] + ' · [ ' + pad(k + 1) + ' / ' + pad(ITEMS.length) + ' ]</span>'; }
  function setCode(el, k) { el.innerHTML = code(ITEMS[k], k); el.classList.remove('chg'); void el.offsetWidth; el.classList.add('chg'); }
  function show(k, dir) {
    var n = ITEMS.length; k = (k + n) % n;
    var it = ITEMS[k];
    var img = new Image();
    img.src = 'assets/img/recharge/' + it[3]; img.alt = it[4]; img.decoding = 'async';
    var olds = $$('img', art);
    if (olds.length && !reduce) {
      img.className = 'new' + (dir < 0 ? ' back' : '');
      olds.forEach(function (o) { o.classList.remove('new'); o.classList.add('old'); o.style.transform = 'translateX(' + (dir < 0 ? 15 : -15) + '%)'; });
      art.appendChild(img);
      setTimeout(function () { olds.forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); }); }, 820);
    } else { art.innerHTML = ''; art.appendChild(img); }
    setCode($('#rx-c-prev'), (k - 1 + n) % n);
    setCode($('#rx-c-cur'), k);
    setCode($('#rx-c-next'), (k + 1) % n);
    $('#rx-car-desc').innerHTML = '<b>' + it[0] + ' · ' + esc(it[1]) + '</b> — ' + esc(it[5]);
    ci = k;
    restart();
  }
  var inView = false, paused = false;
  function restart() {
    clearTimeout(timer);
    bar.classList.remove('run'); void bar.offsetWidth;
    if (reduce || paused || !inView) return;
    bar.classList.add('run');
    timer = setTimeout(function () { show(ci + 1, 1); }, 5000);
  }
  $('#rx-car-prev').addEventListener('click', function () { show(ci - 1, -1); });
  $('#rx-car-next').addEventListener('click', function () { show(ci + 1, 1); });
  car.addEventListener('mouseenter', function () { paused = true; restart(); });
  car.addEventListener('mouseleave', function () { paused = false; restart(); });
  car.addEventListener('focusin', function () { paused = true; restart(); });
  car.addEventListener('focusout', function () { paused = false; restart(); });
  car.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(ci + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(ci - 1, -1); }
  });
  var sx = null;
  car.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  window.addEventListener('pointerup', function (e) {
    if (sx == null) return; var d = e.clientX - sx; sx = null;
    if (Math.abs(d) > 40) show(ci + (d < 0 ? 1 : -1), d < 0 ? 1 : -1);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; restart(); }, { threshold: .3 }).observe(car);
  }
  show(0, 1);

  /* ---------- science articles ---------- */
  var arts = $$('.rx-art'), ai = 0;
  function setArt(k) {
    k = (k + arts.length) % arts.length;
    if (k === ai) return;
    arts[ai].hidden = true; arts[ai].classList.remove('on', 'enter');
    var a = arts[k]; a.hidden = false; a.classList.add('on');
    if (!reduce) { a.classList.remove('enter'); void a.offsetWidth; a.classList.add('enter'); }
    $$('.rx-ph img', a).forEach(function (img) { if (img.complete && img.naturalWidth) markLoaded(img); });
    ai = k; $('#rx-art-i').textContent = pad(k + 1);
  }
  $('#rx-art-prev').addEventListener('click', function () { setArt(ai - 1); });
  $('#rx-art-next').addEventListener('click', function () { setArt(ai + 1); });

  /* ---------- spectrum ---------- */
  var BANDS = {
    uv: ['280–315 nm', 'UVB · วิตามินดี', 'ร่างกายใช้สร้างวิตามินดี แต่ทำร้ายผิวได้ FlexBeam ไม่มีรังสี UV'],
    red: ['610–650 nm · พีค 622 nm', 'ผิวและเนื้อเยื่อชั้นตื้น', 'ใช้ใน FlexBeam: LED แสงสีแดง 3 ดวง สำหรับการฟื้นฟูผิวและเนื้อเยื่อใกล้ผิว'],
    nir: ['800–850 nm · พีค 814 nm', 'กล้ามเนื้อ ข้อต่อ และพลังงานเซลล์', 'ใช้ใน FlexBeam: LED อินฟราเรดใกล้ 6 ดวง ลงลึกถึงกล้ามเนื้อ ข้อต่อ และกระดูก']
  };
  var tabs = $$('.rx-spec-tabs [role="tab"]'), info = $('#rx-spec-info');
  function setBand(b, focus) {
    tabs.forEach(function (t) { var on = t.dataset.b === b; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on) { info.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); } });
    $$('.rx-spec-bar .band').forEach(function (s) { s.classList.toggle('on', s.dataset.b === b); });
    var d = BANDS[b];
    $('#rx-spec-nm').innerHTML = 'Range: <em>[ ' + d[0] + ' ]</em>';
    $('#rx-spec-t').textContent = d[1]; $('#rx-spec-d').textContent = d[2];
    info.classList.remove('chg'); void info.offsetWidth; info.classList.add('chg');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setBand(t.dataset.b); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); setBand(tabs[(i + d + tabs.length) % tabs.length].dataset.b, true);
    });
  });
  setBand('red');

  /* ---------- product strip: drag with inertia ---------- */
  var strip = $('#rx-strip');
  if (strip) {
    var dx = null, sl = 0, vel = 0, lx = 0, lt = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dx = lx = e.clientX; sl = strip.scrollLeft; lt = performance.now(); moved = false; strip.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) {
      if (dx == null) return; var m = e.clientX - dx; if (Math.abs(m) > 4) moved = true;
      strip.scrollLeft = sl - m; var now = performance.now(); vel = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now;
    });
    window.addEventListener('pointerup', function () {
      if (dx == null) return; dx = null; strip.classList.remove('drag');
      if (!reduce && Math.abs(vel) > .2) { var v = vel * 16; (function f() { strip.scrollLeft -= v; v *= .92; if (Math.abs(v) > .5) requestAnimationFrame(f); })(); }
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* ---------- custom cursor (desktop) ---------- */
  var cursor = $('.rx-cursor');
  if (fine && cursor) {
    root.classList.add('cur-on');
    var lab = cursor.firstElementChild, tx = -100, ty = -100, mx = -100, my = -100, raf = null;
    function loop() {
      tx += (mx - tx) * (reduce ? 1 : .35); ty += (my - ty) * (reduce ? 1 : .35);
      cursor.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      raf = (Math.abs(mx - tx) + Math.abs(my - ty) > .3) ? requestAnimationFrame(loop) : null;
    }
    root.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(loop);
      var t = e.target.closest('[data-cur]');
      cursor.classList.toggle('big', !!t);
      lab.textContent = t ? t.getAttribute('data-cur') : '';
    });
    root.addEventListener('pointerleave', function () { mx = my = -100; if (!raf) raf = requestAnimationFrame(loop); });
  }
})();
