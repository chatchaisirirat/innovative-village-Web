/* Crenovative Content page: blueprint → colour load sequence, mouse parallax,
   pop-in titles, tabs with sliding pill, name dashes, history carousel,
   scroll reveals and a small "VIEW" cursor. Respects reduced motion. */
(function () {
  'use strict';
  var root = document.querySelector('.cr');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }

  /* eyebrow: letters fade in one by one */
  $$('[data-letters]').forEach(function (e) {
    var t = e.textContent; e.setAttribute('aria-label', t); e.textContent = '';
    Array.prototype.forEach.call(t, function (ch, i) {
      var s = document.createElement('span'); s.className = 'l'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i); s.textContent = ch; e.appendChild(s);
    });
  });

  /* section titles: words pop up */
  $$('.cr-pop').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/); h.setAttribute('aria-label', h.textContent.trim()); h.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i); s.textContent = w; h.appendChild(s);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });
  $$('.cr-cards .cr-card').forEach(function (c, i) { c.style.setProperty('--i', i); });

  /* illustration: blueprint lines draw, colour floods in bottom → top, shadow slides out */
  var iso = root.querySelector('.cr-iso');
  function playIso() {
    if (!iso) return;
    if (reduce) { iso.classList.remove('bp', 'draw'); return; }
    iso.classList.add('bp'); iso.classList.remove('draw', 'live');
    void iso.getBoundingClientRect();
    iso.classList.add('draw');
    setTimeout(function () { iso.classList.remove('bp'); }, 850);
    setTimeout(function () { iso.classList.add('live'); iso.classList.remove('draw'); }, 1900);
  }
  playIso();

  /* mouse parallax by depth (desktop only) */
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (iso && fine && !reduce) {
    var layers = $$('.lyr', iso), art = root.querySelector('.cr-art');
    art.addEventListener('mousemove', function (e) {
      var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(function (l) { var d = +l.dataset.depth; l.style.transform = 'translate(' + (x * d).toFixed(1) + 'px,' + (y * d).toFixed(1) + 'px)'; });
    });
    art.addEventListener('mouseleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
  }

  /* scroll reveals (once) */
  var io = null;
  function setup() {
    var els = $$('.cr-pop, .cr-cards, .cr-slab, .cr-awards');
    if (io) io.disconnect();
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) { e.classList.remove('in'); });
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.25 });
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < innerHeight * 0.9 && r.bottom > 0) setTimeout(function () { e.classList.add('in'); }, 600);
      else io.observe(e);
    });
  }
  setup();
  window.addEventListener('pageshow', function (e) { if (e.persisted) { setup(); playIso(); } });

  /* tabs with a sliding cream pill */
  var tabs = $$('.cr-tabs [role="tab"]'), pill = root.querySelector('.cr-tabs .pill');
  function movePill(b) { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = 'translateX(' + (b.offsetLeft - 4) + 'px)'; pill.style.left = '4px'; }
  function selectTab(b) {
    tabs.forEach(function (t) {
      var on = t === b; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls')); p.hidden = !on;
      if (on) $$('li', p).forEach(function (li, i) { li.style.setProperty('--i', i); li.style.animation = 'none'; void li.offsetWidth; li.style.animation = ''; });
    });
    movePill(b);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); selectTab(n);
    });
  });
  if (tabs.length) { selectTab(tabs[0]); window.addEventListener('resize', function () { movePill(root.querySelector('.cr-tabs [aria-selected="true"]')); }); }

  /* name meaning: dashes */
  var WORDS = [
    ['Creative', 'ความคิดสร้างสรรค์ — จุดเริ่มของทุกชิ้นงาน ตั้งแต่ไอเดียภาพ มุมกล้อง ไปจนถึงการเล่าเรื่อง'],
    ['Innovative', 'นวัตกรรม — ใช้เครื่องมือและช่องทางดิจิทัลใหม่ๆ ให้สื่อไปถึงคนดูได้ตรงจุด'],
    ['Content', 'เนื้อหา — ภาพนิ่ง วิดีทัศน์ และสื่อที่มีสาระ ใช้งานได้จริงสำหรับองค์กร']
  ];
  var dashes = $$('.cr-dash button'), word = root.querySelector('.cr-word');
  dashes.forEach(function (d) {
    d.addEventListener('click', function () {
      var k = +d.dataset.k;
      dashes.forEach(function (x) { x.setAttribute('aria-selected', x === d ? 'true' : 'false'); });
      word.querySelector('b').textContent = WORDS[k][0]; word.querySelector('p').textContent = WORDS[k][1];
      word.classList.remove('swap'); void word.offsetWidth; word.classList.add('swap');
    });
  });

  /* history carousel: the cream frame moves to the active card */
  var cards = $$('.cr-awards li'), cur = 0, num = root.querySelector('.cr-count .n');
  function go(i) {
    cur = (i + cards.length) % cards.length;
    cards.forEach(function (c, j) { c.classList.toggle('is-on', j === cur); c.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
    num.textContent = cur + 1; num.classList.remove('flip'); void num.offsetWidth; num.classList.add('flip');
  }
  var prev = root.querySelector('.cr-arrows .prev'), next = root.querySelector('.cr-arrows .next');
  if (prev) prev.addEventListener('click', function () { go(cur - 1); });
  if (next) next.addEventListener('click', function () { go(cur + 1); });
  cards.forEach(function (c, i) { c.addEventListener('click', function () { go(i); }); });

  /* contact tiles: the raised tile follows hover */
  var tiles = $$('.cr-tiles li');
  tiles.forEach(function (t) { t.addEventListener('mouseenter', function () { tiles.forEach(function (x) { x.classList.toggle('is-on', x === t); }); }); });

  /* nav: mark the section in view */
  var navs = $$('.cr-nav a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) navs.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['works', 'about', 'history'].forEach(function (id) { var s = document.getElementById(id); if (s) nio.observe(s); });
  }

  /* cursor: yellow dot that grows to "VIEW" over images */
  var cur2 = root.querySelector('.cr-cursor');
  if (cur2 && fine && !reduce) {
    document.addEventListener('mousemove', function (e) {
      if (!root.contains(e.target)) { cur2.classList.remove('on'); return; }
      cur2.classList.add('on');
      cur2.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      cur2.classList.toggle('big', !!e.target.closest('.fr, .cr-art'));
    });
    document.addEventListener('mouseleave', function () { cur2.classList.remove('on'); });
  }
})();
