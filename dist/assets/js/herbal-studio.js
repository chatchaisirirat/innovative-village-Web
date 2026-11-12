/* Herbal Studio portfolio page: product list, filter, reveal, count-up, parallax */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* products (from the brand's price list) */
  var CAT = { oil: 'Serum & Carrier Oil', hydro: 'Hydrosol', eo: 'Essential Oil' };
  /* featured products: up to 4 per group */
  var P = [
    ['oil', 'Organic Facial Serum Oil', '30 ml', '650', 'Argan, Rosehip, Apricot, Jojoba และน้ำมันกุหลาบ ลดจุดด่างดำ'],
    ['oil', 'Organic Rosehip Oil', '30 ml', '590', 'ช่วยลดรอยแผลเป็นและจุดด่างดำ ผิวเรียบเนียน'],
    ['oil', 'Organic Argan Oil', '30 ml', '550', 'กรดไขมันจำเป็นและวิตามิน บำรุงผิวและเส้นผม'],
    ['oil', 'Argan & Almond Anti-Aging Body Oil', '120 ml', '850', 'น้ำมันอัลมอนด์และอาร์แกนสกัดเย็น วิตามินอี และโรสแมรี่ ลดเลือนริ้วรอย'],
    ['hydro', 'Organic Rose Water', '100 ml', '450', 'น้ำดอกกุหลาบ Damascena ปรับสมดุลและปลอบประโลมผิว', 'assets/img/herbal/rose-water.jpg'],
    ['hydro', 'Organic Aloe Vera Water', '100 ml', '350', 'ลดการอักเสบแสบร้อน กระชับรูขุมขน'],
    ['hydro', 'Witch Hazel Water', '100 ml', '250', 'ลดการอักเสบของสิวและความมันส่วนเกิน'],
    ['eo', 'Lavender Essential Oil', '10 ml', '395', 'ช่วยผ่อนคลายและปลอบประโลมผิว'],
    ['eo', 'Ylang Ylang Essential Oil', '10 ml', '480', 'กระดังงาบริสุทธิ์ สำหรับอโรมาเธอราพี'],
    ['eo', 'Rosemary Essential Oil', '10 ml', '380', 'สดชื่น กระตุ้นการไหลเวียน'],
    ['eo', 'Bergamot Essential Oil', '10 ml', '280', 'ปรับสมดุลอารมณ์']
  ];
  var grid = document.getElementById('hs-pgrid');
  var esc = (window.IV && IV.esc) || function (s) { return String(s); };
  var GROUPS = { oil: 'Serum & Carrier Oil', hydro: 'Hydrosol', eo: 'Essential Oils' };
  function card(p, i) {
    return '<article class="hs-prod" style="animation-delay:' + Math.min(i, 8) * 0.04 + 's">' +
      (p[5] ? '<div class="hs-ph has-img"><img src="' + p[5] + '" alt="' + esc(p[1]) + '" width="800" height="1000" loading="lazy"></div>' : '<div class="hs-ph" role="img" aria-label="ภาพ ' + esc(p[1]) + ' (รอภาพจริง)"><span>[ภาพสินค้า]</span></div>') +
      '<span class="cat">' + CAT[p[0]] + '</span><h3>' + esc(p[1]) + '</h3><p>' + esc(p[4]) + '</p>' +
      '<div class="meta"><span>' + p[2] + '</span><b>฿' + p[3] + '</b></div></article>';
  }
  /* "all" shows one row per group; a single group shows just its cards */
  function draw(f) {
    if (!grid) return;
    var keys = f === 'all' ? Object.keys(GROUPS) : [f];
    grid.innerHTML = keys.map(function (k) {
      var items = P.filter(function (p) { return p[0] === k; });
      return (f === 'all' ? '<h3 class="hs-pgroup">' + GROUPS[k] + '<span>' + items.length + ' รายการ</span></h3>' : '') + items.map(card).join('');
    }).join('');
  }
  draw('all');
  document.querySelectorAll('.hs-filter [data-f]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.hs-filter [data-f]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      draw(b.dataset.f);
    });
  });

  /* count-up for stats */
  function countUp(el) {
    var to = +el.dataset.count, from = to > 1000 ? to - 40 : 0, t0 = null, dur = 1400;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* staggered reveal */
  var items = Array.prototype.slice.call(document.querySelectorAll('.hs-rv, .hs-head'));
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('rv-in'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var seen = new Map();
    items.forEach(function (el) {
      var n = seen.get(el.parentNode) || 0; seen.set(el.parentNode, n + 1);
      el.style.setProperty('--d', Math.min(n, 6) * 0.12 + 's');
    });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('rv-in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* gentle parallax on blobs and floating circles */
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  if (par.length && !reduce) {
    var ticking = false;
    function move() {
      ticking = false;
      var vh = innerHeight;
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        var p = (vh - r.top) / (vh + r.height); // 0 → 1 while the section crosses the screen
        if (p < -0.2 || p > 1.2) return;
        el.style.transform = 'translate3d(0,' + ((p - 0.5) * +el.dataset.par).toFixed(1) + 'px,0)';
      });
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }
})();
