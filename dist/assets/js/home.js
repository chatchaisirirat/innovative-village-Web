/* Home page: hero photo stack + motion layer (entrances, counters, hovers, page wipe) */
(function () {
  'use strict';
  var body = document.body;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var main = document.querySelector('main') || document;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || main).querySelectorAll(s)); };
  body.classList.add('home-page');

  /* ---------- hero photo stack: cards take turns coming to the front ---------- */
  (function () {
    var stack = document.getElementById('hero-stack');
    if (!stack) return;
    var cards = Array.prototype.slice.call(stack.querySelectorAll('.hero-card'));
    if (cards.length < 2) return;
    var order = cards.slice(), DELAY = 4200, paused = reduce, hovering = false, timer = null, busy = false;
    function layout() { order.forEach(function (c, i) { c.dataset.pos = String(i); c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); }); }
    function next() {
      if (busy) return; busy = true;
      var front = order.shift();
      front.dataset.pos = 'out'; front.setAttribute('aria-hidden', 'true');
      order.push(front);
      order.forEach(function (c, i) { if (c !== front) c.dataset.pos = String(i); });
      order[0].setAttribute('aria-hidden', 'false');
      setTimeout(function () { front.dataset.pos = String(order.length - 1); busy = false; }, 950);
    }
    function schedule() { clearTimeout(timer); if (!paused && !hovering && !document.hidden) timer = setTimeout(function () { next(); schedule(); }, DELAY); }
    stack.addEventListener('click', function () { next(); schedule(); });
    stack.addEventListener('mouseenter', function () { hovering = true; schedule(); });
    stack.addEventListener('mouseleave', function () { hovering = false; schedule(); });
    stack.addEventListener('focusin', function () { hovering = true; schedule(); });
    stack.addEventListener('focusout', function () { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    layout(); setTimeout(schedule, reduce ? 0 : 2200);
  })();

  /* ---------- text splitting ---------- */
  function splitWords(el, start) {
    var i = start || 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'hm-w';
            var s = document.createElement('span'); s.textContent = w; o.appendChild(s);
            o.style.setProperty('--i', i++); frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'svg') walk(n);
      });
    })(el);
    return i;
  }
  function splitChars(el) {
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      var wrap = document.createElement('span'); wrap.className = 'hm-chs';
      wrap.setAttribute('aria-label', n.textContent.trim());
      n.textContent.trim().split('').forEach(function (c) {
        var s = document.createElement('span'); s.className = 'hm-ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; s.style.setProperty('--i', i++); wrap.appendChild(s);
      });
      n.parentNode.replaceChild(wrap, n);
    });
  }
  function prepDraw(svg) {
    svg.classList.add('hm-draw');
    Array.prototype.slice.call(svg.querySelectorAll('path,rect,circle')).forEach(function (p) {
      try { var L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 200); p.style.setProperty('--len', L + 1); } catch (e) { p.style.setProperty('--len', 200); }
    });
  }

  /* hero copy */
  var kicker = document.querySelector('.hero-kicker');
  var h1 = document.querySelector('.hero h1');
  var th = document.querySelector('.hero-th');
  if (kicker) { var ks = kicker.querySelector('svg'); if (ks) prepDraw(ks); splitChars(kicker); kicker.style.setProperty('--d', '.15s'); kicker.classList.add('hm-hero-t'); }
  if (h1) { splitWords(h1); h1.style.setProperty('--d', '.35s'); h1.classList.add('hm-hero-t'); }
  if (th) {
    var t = th.textContent.trim(), m = t.match(/^\{\s*(.*?)\s*\}$/);
    if (m) th.innerHTML = '<span class="brace l">{</span> <span class="mid"></span> <span class="brace r">}</span>', th.querySelector('.mid').textContent = m[1];
  }
  $$('.hero .btns > *').forEach(function (b, i) { b.style.setProperty('--i', i); });

  /* section heads */
  $$('.head').forEach(function (head) {
    var eb = head.querySelector('.eyebrow'), h2 = head.querySelector('.h2, h2'), sub = head.querySelector('.sub');
    if (eb) { eb.classList.add('hm-eb'); splitChars(eb); }
    if (h2) { splitWords(h2); h2.style.setProperty('--d', '.18s'); }
    if (sub) sub.classList.add('hm-sub');
    head.classList.add('hm-t');
  });
  var cta = document.querySelector('.cta-band');
  if (cta) {
    var row = cta.querySelector('.row > .stack'); if (row) row.classList.add('hm-t');
    cta.insertAdjacentHTML('afterbegin', '<svg class="hm-roofs" viewBox="0 0 420 120" aria-hidden="true"><path d="M8 116 L20 52 L66 24 L112 52 L124 116"/><path d="M148 116 L160 52 L206 24 L252 52 L264 116"/><path d="M288 116 L300 52 L346 24 L392 52 L404 116"/></svg>');
  }

  /* reveal targets */
  var RV = [];
  function add(sel, cls) { $$(sel).forEach(function (el) { el.classList.add(cls); RV.push(el); }); }
  add('.head-row > .link, .twin-teaser > div > .twin-list li, .twin-teaser > div > .btn, .partner-strip, .cta-band .btns, .news, .review, .space-card .in', 'hm-rv');
  add('.feature, .fac, .logo-tile, .cta-band .btns > *', 'hm-pop');
  $$('.feature svg, .fac svg, .review > svg').forEach(prepDraw);
  $$('.twin-img').forEach(function (el) { el.classList.add('hm-twin'); RV.push(el); });
  $$('.space-card .ph').forEach(function (el) { el.classList.add('hm-rv'); RV.push(el); });
  $$('.deck').forEach(function (d) { $$('.card-photo', d).forEach(function (c, i) { c.style.setProperty('--c', i); }); RV.push(d); });
  $$('.promo-in').forEach(function (el) { RV.push(el); });
  $$('.hm-t').forEach(function (el) { RV.push(el); });
  // stagger siblings
  var seen = new Map();
  RV.forEach(function (el) {
    if (el.classList.contains('hm-t')) return;
    var p = el.parentNode, n = seen.get(p) || 0; seen.set(p, n + 1);
    el.style.setProperty('--d', (Math.min(n, 8) * 0.08) + 's');
  });

  /* price counters: "เริ่ม 3,500 บาท" counts up */
  var counters = [];
  $$('.space-card .price, .hero-tag').forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), node;
    while ((node = walker.nextNode())) {
      var mm = node.textContent.match(/(\d{1,3}(?:,\d{3})+|\d+)/);
      if (!mm) continue;
      var before = node.textContent.slice(0, mm.index), after = node.textContent.slice(mm.index + mm[0].length);
      var b = document.createElement('b'); b.className = 'hm-num'; b.textContent = mm[0]; b.dataset.to = mm[0].replace(/,/g, '');
      var frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(before)); frag.appendChild(b); frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
      counters.push(b); break;
    }
  });
  function countUp(b, delay) {
    var to = +b.dataset.to; if (!to || reduce) return;
    var dur = 1100, t0 = null;
    setTimeout(function () {
      (function f(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3); b.textContent = Math.round(to * e).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(f); })(performance.now());
    }, delay || 0);
  }

  /* ---------- run ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    body.classList.add('hm');
    // hero plays on load
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      body.classList.add('hm-go');
      $$('.hm-hero-t').forEach(function (el) { el.classList.add('hm-in'); });
      $$('.hero-tag .hm-num').forEach(function (b, i) { countUp(b, 1250 + i * 120); });
      setTimeout(function () { body.classList.add('hm-on'); }, 1900);
    }); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('hm-in'); io.unobserve(el);
        if (el.classList.contains('in') && el.parentNode.classList.contains('space-card')) $$('.hm-num', el).forEach(function (b) { countUp(b, 250); });
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    RV.forEach(function (el) { io.observe(el); });
  } else {
    RV.forEach(function (el) { el.classList.add('hm-in'); });
  }

  /* ---------- scroll progress ---------- */
  if (!reduce) {
    var bar = document.createElement('div'); bar.className = 'hm-progress'; bar.setAttribute('aria-hidden', 'true'); body.appendChild(bar);
    var tk = false;
    window.addEventListener('scroll', function () {
      if (tk) return; tk = true;
      requestAnimationFrame(function () { tk = false; var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; });
    }, { passive: true });
  }

  /* ---------- hero tilt (desktop) ---------- */
  var visual = document.querySelector('.hero-visual');
  if (visual && fine && !reduce) {
    var stackEl = visual.querySelector('.hero-stack'), rq = null, rx = 0, ry = 0;
    visual.addEventListener('pointermove', function (e) {
      var r = visual.getBoundingClientRect(); rx = (e.clientY - r.top) / r.height - .5; ry = (e.clientX - r.left) / r.width - .5;
      if (rq) return;
      rq = requestAnimationFrame(function () { rq = null; if (stackEl && body.classList.contains('hm-on')) { stackEl.style.transition = 'transform .25s ease-out'; stackEl.style.transform = 'perspective(900px) rotateX(' + (-rx * 5).toFixed(2) + 'deg) rotateY(' + (ry * 6).toFixed(2) + 'deg)'; } });
    });
    visual.addEventListener('pointerleave', function () { if (stackEl) { stackEl.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)'; stackEl.style.transform = ''; } });
  }

  /* logo tiles: hover fill starts where the pointer enters */
  $$('.logo-tile').forEach(function (t) {
    t.addEventListener('pointerenter', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------- page wipe on internal links ---------- */
  if (!reduce) {
    var wipe = document.createElement('div'); wipe.className = 'hm-wipe'; wipe.setAttribute('aria-hidden', 'true');
    wipe.innerHTML = '<svg viewBox="0 0 120 44"><path d="M4 42 L10 16 L32 4 L54 16 L60 42"/><path d="M34 42 L40 16 L62 4 L84 16 L90 42"/><path d="M64 42 L70 16 L92 4 L114 16 L120 42"/></svg>';
    body.appendChild(wipe);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === '_blank' || a.hasAttribute('download')) return;
      var h = a.getAttribute('href');
      if (!h || /^(#|mailto:|tel:|https?:|javascript:)/.test(h) || a.getAttribute('aria-disabled') === 'true') return;
      e.preventDefault();
      wipe.style.setProperty('--cx', e.clientX + 'px'); wipe.style.setProperty('--cy', e.clientY + 'px');
      wipe.classList.add('on');
      setTimeout(function () { location.href = a.href; }, 560);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) wipe.classList.remove('on'); });
  }
})();

/* ---------- orbit carousel: Villagers & Partners ---------- */
(function () {
  'use strict';
  var orbit = document.getElementById('orbit');
  if (!orbit) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = Array.prototype.slice.call(orbit.querySelectorAll('.orbit-it'));
  var n = items.length, step = 360 / n, active = 0, angles = items.map(function (_, i) { return i * step; });
  var card = document.getElementById('orbit-card'), dotsBox = document.getElementById('orbit-dots');
  var img = document.getElementById('oc-img'), nm = document.getElementById('oc-name'), tg = document.getElementById('oc-tag'), ds = document.getElementById('oc-desc'), go = document.getElementById('oc-go');
  var dots = items.map(function (it, i) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', it.dataset.name);
    b.addEventListener('click', function () { set(i); restart(); }); dotsBox.appendChild(b); return b;
  });
  var prog = document.createElement('span'); prog.className = 'orbit-prog'; prog.innerHTML = '<i></i>'; dotsBox.parentNode.appendChild(prog);
  var bar = prog.firstChild;
  function layout(first) {
    items.forEach(function (it, i) {
      var target = (i - active) * step, prev = angles[i];
      // choose the equivalent angle closest to where the item is, so it travels the short way round
      var k = Math.round((prev - target) / 360); target += k * 360;
      angles[i] = target;
      var dist = Math.min(Math.abs(i - active), n - Math.abs(i - active));
      it.style.setProperty('--dl', first ? (i * 0.07) + 's' : (dist * 0.04) + 's');
      it.style.setProperty('--a', target + 'deg');
      it.classList.toggle('on', i === active);
      it.querySelector('button').setAttribute('aria-current', i === active ? 'true' : 'false');
    });
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === active ? 'true' : 'false'); });
  }
  function fill() {
    var it = items[active];
    img.src = 'assets/img/partner/' + it.dataset.logo + '.png';
    nm.textContent = it.dataset.name; tg.textContent = it.dataset.tag; ds.textContent = it.dataset.desc; go.href = it.dataset.href;
    go.setAttribute('aria-label', 'ดู Portfolio ของ ' + it.dataset.name);
  }
  function set(i) {
    i = (i + n) % n; if (i === active) return;
    active = i; layout(false);
    if (reduce) { fill(); return; }
    card.classList.remove('enter'); card.classList.add('out');
    setTimeout(function () { fill(); card.classList.remove('out'); void card.offsetWidth; card.classList.add('enter'); }, 220);
  }
  items.forEach(function (it, i) { it.querySelector('button').addEventListener('click', function () { set(i); restart(); }); });
  document.getElementById('oc-prev').addEventListener('click', function () { set(active - 1); restart(); });
  document.getElementById('oc-next').addEventListener('click', function () { set(active + 1); restart(); });
  orbit.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); set(active + 1); restart(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); set(active - 1); restart(); }
  });
  // auto-rotate every 5s; pauses on hover/focus and while off-screen
  var timer = null, hover = false, visible = false;
  function restart() {
    clearTimeout(timer); bar.classList.remove('run'); void bar.offsetWidth;
    if (reduce || hover || !visible || document.hidden) return;
    bar.classList.add('run');
    timer = setTimeout(function () { set(active + 1); restart(); }, 5000);
  }
  orbit.addEventListener('mouseenter', function () { hover = true; restart(); });
  orbit.addEventListener('mouseleave', function () { hover = false; restart(); });
  orbit.addEventListener('focusin', function () { hover = true; restart(); });
  orbit.addEventListener('focusout', function () { hover = false; restart(); });
  document.addEventListener('visibilitychange', restart);
  // swipe on touch
  var sx = null;
  orbit.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  orbit.addEventListener('touchend', function (e) { if (sx == null) return; var d = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(d) > 40) { set(active + (d < 0 ? 1 : -1)); restart(); } });
  layout(true);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) orbit.classList.add('hm-in');
      restart();
    }, { threshold: .3 }).observe(orbit);
  } else { orbit.classList.add('hm-in'); visible = true; restart(); }
})();

/* ---------- FACILITIES: expanding gallery ---------- */
(function () {
  var gal = document.getElementById('fx-gal');
  if (!gal) return;
  var items = Array.prototype.slice.call(gal.querySelectorAll('.fx'));
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function open(li) {
    items.forEach(function (x) {
      var on = x === li;
      x.classList.toggle('on', on);
      x.querySelector('.fx-b').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  items.forEach(function (li, i) {
    var b = li.querySelector('.fx-b');
    // mouse: hover opens; touch / keyboard: tap or Enter opens
    if (fine) li.addEventListener('mouseenter', function () { open(li); });
    b.addEventListener('click', function () { open(li); });
    b.addEventListener('focus', function () { open(li); });
    b.addEventListener('keydown', function (e) {
      var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!n) return;
      e.preventDefault();
      items[(i + n + items.length) % items.length].querySelector('.fx-b').focus();
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      gal.classList.add('fx-in'); io.disconnect();
    }, { threshold: .2 });
    io.observe(gal);
  } else gal.classList.add('fx-in');
})();

/* ---------- NEWS & ACTIVITIES: ticket tilt + entrance ---------- */
(function () {
  var grid = document.querySelector('.tk-grid');
  if (!grid) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    Array.prototype.forEach.call(grid.querySelectorAll('.tk'), function (t) {
      var raf = null, ev = null;
      function apply() {
        raf = null;
        var r = t.getBoundingClientRect(), nx = (ev.clientX - r.left) / r.width - .5, ny = (ev.clientY - r.top) / r.height - .5;
        t.style.setProperty('--ry', (nx * 16).toFixed(2) + 'deg');
        t.style.setProperty('--rx', (-ny * 12).toFixed(2) + 'deg');
        t.style.setProperty('--px', (nx * -16).toFixed(1) + 'px');
        t.style.setProperty('--py', (ny * -12).toFixed(1) + 'px');
        t.style.setProperty('--gx', ((nx + .5) * 100).toFixed(1) + '%');
        t.style.setProperty('--gy', ((ny + .5) * 100).toFixed(1) + '%');
      }
      t.addEventListener('pointerenter', function () { t.classList.add('live'); });
      t.addEventListener('pointermove', function (e) { ev = e; if (!raf) raf = requestAnimationFrame(apply); });
      t.addEventListener('pointerleave', function () {
        t.classList.remove('live');
        ['--rx', '--ry', '--px', '--py'].forEach(function (k) { t.style.removeProperty(k); });
      });
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      grid.classList.add('tk-on'); io.disconnect();
    }, { threshold: .2 });
    io.observe(grid);
  } else grid.classList.add('tk-on');
})();
