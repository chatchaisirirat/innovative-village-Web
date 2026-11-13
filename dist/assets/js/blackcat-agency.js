/* BlackCat Agency page: sticky split bar (scroll state, dropdown, slide-in drawer),
   typewriter logo, mouse parallax in the "B", slow sky parallax, scroll reveals with
   stagger, service "see more", portfolio filter (FLIP) and a clients carousel.
   Respects reduced motion. */
(function () {
  'use strict';
  var root = document.querySelector('.bc');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }

  /* ---- bar ---- */
  var bar = root.querySelector('.bc-bar'), par = root.querySelector('.bc-sky .par'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    bar.classList.toggle('sc', y > 80);
    if (par && !reduce && y < 1200) par.style.transform = 'translateY(' + (y * 0.35).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var dd = root.querySelector('.dd'), ddBtn = root.querySelector('.dd-btn');
  function setDD(on) { dd.classList.toggle('open', on); ddBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  ddBtn.addEventListener('click', function (e) { e.stopPropagation(); setDD(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDD(false); });

  var burger = root.querySelector('.bc-burger');
  function setNav(on) { bar.classList.toggle('open', on); burger.setAttribute('aria-expanded', on ? 'true' : 'false'); burger.setAttribute('aria-label', on ? 'ปิดเมนู' : 'เปิดเมนู'); }
  burger.addEventListener('click', function () {
    var on = !bar.classList.contains('open'), top = bar.getBoundingClientRect().top;
    if (on && top > 0) window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
    setNav(on);
  });
  $$('.bc-drawer a, .dd-list a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); setDD(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setNav(false); setDD(false); } });

  /* active menu item follows the section in view */
  var links = $$('.bc-menu a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id === 'services' ? null : '#' + en.target.id;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === id); });
        ddBtn.style.color = en.target.id === 'services' ? 'var(--accent)' : '';
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'why', 'services', 'work', 'history', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) nio.observe(s); });
  }

  /* ---- typewriter logo ---- */
  var tw = root.querySelector('.bc-logo .tw');
  if (tw) {
    var parts = tw.dataset.type.split('|'); tw.textContent = '';
    var chars = [];
    parts.forEach(function (p, k) {
      var host = k ? document.createElement('b') : tw; if (k) tw.appendChild(host);
      Array.prototype.forEach.call(p, function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; host.appendChild(s); chars.push(s); });
    });
    if (reduce) chars.forEach(function (c) { c.classList.add('on'); });
    else chars.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, 350 + i * 110); });
  }

  /* ---- mouse parallax in the B ---- */
  var hero = root.querySelector('.bc-hero'), bw = root.querySelector('.bc-b .bwrap');
  if (hero && bw && fine && !reduce) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      bw.style.transform = 'translate(' + (x * 20).toFixed(1) + 'px,' + (y * 20).toFixed(1) + 'px)';
    });
    hero.addEventListener('mouseleave', function () { bw.style.transform = ''; });
  }

  /* ---- scroll reveals ---- */
  $$('.bc-list, .bc-svcs, .bc-time, .bc-info-in').forEach(function (g) {
    $$(':scope > .bc-rv', g).forEach(function (e, i) { e.style.setProperty('--d', (i * 0.2).toFixed(1) + 's'); });
  });
  var io = null;
  function reveal() {
    var els = $$('.bc-rv, .bc-rule, .bc-card:not([hidden])');
    if (io) io.disconnect();
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) { e.classList.remove('in'); });
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  reveal();
  window.addEventListener('pageshow', function (e) { if (e.persisted) reveal(); });

  /* ---- services: see more ---- */
  $$('.see').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = document.getElementById(b.getAttribute('aria-controls')), on = b.getAttribute('aria-expanded') !== 'true';
      p.hidden = !on; b.setAttribute('aria-expanded', on ? 'true' : 'false');
      b.firstChild.nodeValue = on ? 'see less ' : 'see more ';
    });
  });

  /* ---- portfolio filter (FLIP) ---- */
  var cards = $$('.bc-card'), fbtns = $$('.bc-filter [role="tab"]'), fbar = root.querySelector('.bc-filter .bar');
  function stagger() {
    var vis = cards.filter(function (c) { return !c.hidden; });
    cards.forEach(function (c) { c.classList.remove('r'); });
    vis.forEach(function (c, i) { c.classList.toggle('r', i % 2 === 1); c.style.transitionDelay = ''; });
  }
  function moveBar(b) { if (fbar && b) { fbar.style.width = b.offsetWidth + 'px'; fbar.style.transform = 'translateX(' + b.offsetLeft + 'px)'; } }
  function filter(f) {
    var match = function (c) { return f === 'all' || c.dataset.c.split(' ').indexOf(f) > -1; };
    var first = new Map(); cards.forEach(function (c) { if (!c.hidden) first.set(c, c.getBoundingClientRect()); });
    var leaving = cards.filter(function (c) { return !c.hidden && !match(c); });
    leaving.forEach(function (c) { c.classList.add('out'); });
    setTimeout(function () {
      cards.forEach(function (c) { c.hidden = !match(c); c.classList.remove('out'); c.style.transition = 'none'; c.style.transform = ''; });
      stagger();
      cards.forEach(function (c) {
        if (c.hidden) return;
        c.classList.add('in');
        var a = first.get(c), b = c.getBoundingClientRect();
        if (a) c.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
        else c.style.transform = 'scale(.8)', c.style.opacity = '0';
      });
      void root.offsetWidth;
      cards.forEach(function (c) {
        if (c.hidden) return;
        c.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), opacity .6s';
        c.style.transform = ''; c.style.opacity = '';
      });
      setTimeout(function () { cards.forEach(function (c) { c.style.transition = ''; }); }, 650);
    }, reduce || !leaving.length ? 0 : 300);
  }
  fbtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      fbtns.forEach(function (x) { var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
      moveBar(b); filter(b.dataset.f);
    });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = fbtns[(i + d + fbtns.length) % fbtns.length]; n.focus(); n.click();
    });
    b.tabIndex = i ? -1 : 0;
  });
  function curTab() { return root.querySelector('.bc-filter [aria-selected="true"]'); }
  stagger();
  moveBar(curTab());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveBar(curTab()); });

  /* ---- clients carousel ---- */
  var car = root.querySelector('.bc-car'), track = car.querySelector('.track'), dotsEl = car.querySelector('.dots');
  var items = $$('li', track), page = 0, pages = 1, timer = null;
  function perView() { var w = car.querySelector('.vp').offsetWidth, li = items[0].offsetWidth || 1; return Math.max(1, Math.round(w / li)); }
  function build() {
    pages = Math.ceil(items.length / perView()); page = Math.min(page, pages - 1); dotsEl.innerHTML = '';
    for (var i = 0; i < pages; i++) {
      var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'หน้า ' + (i + 1) + ' จาก ' + pages);
      d.addEventListener('click', (function (k) { return function () { go(k); restart(); }; })(i)); dotsEl.appendChild(d);
    }
    go(page);
  }
  function go(k) {
    page = (k + pages) % pages;
    track.style.transform = 'translateX(' + (-page * 100) + '%)';
    $$('button', dotsEl).forEach(function (d, i) { d.setAttribute('aria-current', i === page ? 'true' : 'false'); });
    items.forEach(function (li, i) { var pv = perView(), on = Math.floor(i / pv) === page; li.setAttribute('aria-hidden', on ? 'false' : 'true'); });
  }
  function restart() { clearInterval(timer); if (!reduce && pages > 1) timer = setInterval(function () { go(page + 1); }, 3000); }
  car.addEventListener('mouseenter', function () { clearInterval(timer); });
  car.addEventListener('mouseleave', restart);
  car.addEventListener('focusin', function () { clearInterval(timer); });
  build(); restart();
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { build(); restart(); moveBar(curTab()); }, 150); });
})();
