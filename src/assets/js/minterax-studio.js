/* Minterax Studio — Pixel to Package */
(function () {
  'use strict';
  var root = document.querySelector('.mx');
  if (!root) return;
  var $ = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var small = function () { return window.innerWidth < 760; };

  /* ---------- prep ---------- */
  $$('.mx-svg .p, .mx-svg .ln').forEach(function (el, i) { el.setAttribute('pathLength', '1'); el.style.setProperty('--k', i % 18); });
  $$('.mx-inf-svg defs path').forEach(function (p) { p.setAttribute('pathLength', '1'); });
  $$('.mx-svg .conf > *').forEach(function (el, i) { el.style.setProperty('--k', i); el.style.setProperty('--t', (3 + (i % 3)) + 's'); el.style.setProperty('--o', (-i * .37) + 's'); });
  $$('.mx-labels li').forEach(function (el, i) { el.style.setProperty('--k', i); });
  $$('.mx-stats li, .mx-fcard .big a').forEach(function (el, i) { el.style.setProperty('--k', i % 4); });
  // eyebrow letters
  var eb = $('.mx-hero .mx-eyebrow');
  if (eb) { var t = eb.textContent; eb.textContent = ''; t.split('').forEach(function (c, i) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; s.setAttribute('aria-hidden', 'true'); eb.appendChild(s); }); }
  // split headings into words
  $$('.mx-split').forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'wd';
            var s = document.createElement('span'); s.textContent = w; o.appendChild(s);
            o.style.setProperty('--i', i++); frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(h);
  });

  /* ---------- intro ---------- */
  if (!reduce) {
    root.classList.add('js');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('go');
        setTimeout(function () { root.classList.add('paint'); }, 750);
        setTimeout(function () { root.classList.add('swing'); }, 900);
        setTimeout(function () { root.classList.add('burst'); }, 1300);
        setTimeout(function () { root.classList.remove('swing'); root.classList.add('idle'); }, 2500);
      });
    });
  } else root.classList.add('idle');

  /* ---------- reveals (once, threshold .25) ---------- */
  var groups = new Map();
  $$('.mx-rv').forEach(function (el) { var p = el.parentNode, n = groups.get(p) || 0; el.style.setProperty('--d', Math.min(n, 6) * .07 + 's'); groups.set(p, n + 1); });
  var targets = $$('.mx-rv, .mx-split, .mx-horizon:not(.h1), .mx-stats, .mx-inf, .mx-phones, .mx-fcard, .mx-bubbles, .mx-pm');
  var onIn = {};
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        if (e.target.id && onIn[e.target.id]) onIn[e.target.id]();
      });
    }, { threshold: .25 });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(function (el) { el.classList.add('in'); });

  /* ---------- hero: parallax + spit confetti ---------- */
  var art = $('#mx-art'), svg = $('.mx-svg', art), spit = $('#mx-spit');
  if (fine && !reduce && art) {
    var armG = $('#mx-arm'), conf = $('#mx-conf'), raf = null, px = 0, py = 0;
    root.querySelector('.mx-hero').addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect();
      px = (e.clientX - (r.left + r.width / 2)) / r.width; py = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!raf) raf = requestAnimationFrame(function () { raf = null;
        art.style.transform = 'translate(' + (px * 10).toFixed(1) + 'px,' + (py * 10).toFixed(1) + 'px)';
        conf.style.transform = 'translate(' + (px * 15).toFixed(1) + 'px,' + (py * 15).toFixed(1) + 'px)';
      });
    });
    var lastSpit = 0, NS = 'http://www.w3.org/2000/svg', COLS = ['#FFC40F', '#FFFFFF', '#F07A1C', '#4CC0F2'];
    art.addEventListener('pointerenter', function () {
      var now = Date.now(); if (now - lastSpit < 1200) return; lastSpit = now;
      var bag = $('#mx-bag'); bag.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], { duration: 450 });
      var n = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        var c = document.createElementNS(NS, 'rect');
        c.setAttribute('x', 320); c.setAttribute('y', 420); c.setAttribute('width', 12 + Math.random() * 6); c.setAttribute('height', 22); c.setAttribute('rx', 6);
        c.setAttribute('class', 'p'); c.style.fill = COLS[i % 4]; spit.appendChild(c);
        var dx = (Math.random() - .5) * 360, up = -120 - Math.random() * 120, rot = (Math.random() - .5) * 540;
        var a = c.animate([
          { transform: 'translate(0,0) rotate(0)', opacity: 1 },
          { transform: 'translate(' + dx * .6 + 'px,' + up + 'px) rotate(' + rot / 2 + 'deg)', opacity: 1, offset: .35 },
          { transform: 'translate(' + dx + 'px,' + 260 + 'px) rotate(' + rot + 'deg)', opacity: 0 }
        ], { duration: 1300 + Math.random() * 400, easing: 'cubic-bezier(.3,.1,.6,1)' });
        a.onfinish = (function (el) { return function () { el.remove(); }; })(c);
      }
    });
  }

  /* ---------- infinity: travelling dot + label highlight ---------- */
  var inf = $('#mx-inf'), runner = $('#mx-runner');
  var pL = $('#mx-loopL'), pR = $('#mx-loopR');
  var labels = $$('.mx-labels li');
  function hi(side, on) {
    $$('.mx-inf-svg .glow use').forEach(function (u) { u.classList.toggle('on', on && u.classList.contains('g' + side)); });
    $$('.mx-inf-svg .yel use').forEach(function (u) { u.classList.toggle('on', on && u.classList.contains('seg' + side)); });
  }
  labels.forEach(function (li) {
    li.addEventListener('mouseenter', function () { hi(li.dataset.side, true); });
    li.addEventListener('mouseleave', function () { hi(li.dataset.side, false); });
  });
  // label anchor points in SVG units, matched to their % positions
  var anchors = labels.map(function (li) {
    var x = parseFloat(li.style.getPropertyValue('--x')) / 100, y = parseFloat(li.style.getPropertyValue('--y')) / 100;
    return { li: li, x: x, y: y };
  });
  if (!reduce && pL && pL.getTotalLength) {
    var lenL = pL.getTotalLength(), lenR = pR.getTotalLength(), total = lenL + lenR, t0 = null, running = false;
    function frame(ts) {
      if (!running) return;
      if (t0 == null) t0 = ts;
      var d = ((ts - t0) / 6000 % 1) * total, pt = d < lenL ? pL.getPointAtLength(d) : pR.getPointAtLength(d - lenL);
      runner.setAttribute('cx', pt.x); runner.setAttribute('cy', pt.y);
      if (!small()) {
        var box = inf.getBoundingClientRect(), sv = inf.querySelector('svg').getBoundingClientRect();
        var sx = (sv.left - box.left + pt.x / 1000 * sv.width) / box.width, sy = (sv.top - box.top + pt.y / 440 * sv.height) / box.height;
        anchors.forEach(function (a) {
          var near = Math.abs(a.x - sx) < .1 && Math.abs(a.y - sy) < .17;
          if (near && !a.li.classList.contains('lit')) { a.li.classList.add('lit'); setTimeout(function () { a.li.classList.remove('lit'); }, 400); }
        });
      }
      requestAnimationFrame(frame);
    }
    onIn['mx-inf'] = function () { setTimeout(function () { running = true; requestAnimationFrame(frame); }, 1600); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting;
        if (v && !running && inf.classList.contains('in')) { running = true; t0 = null; requestAnimationFrame(frame); }
        if (!v) running = false;
      }).observe(inf);
    }
  }

  /* ---------- expertise tabs + bubbles ---------- */
  var DATA = {
    cg: ['ธุรกิจหลักตามที่จดทะเบียน: สร้างภาพคอมพิวเตอร์กราฟิก งานแอนิเมชัน และเทคนิคพิเศษทางภาพ สำหรับสื่อดิจิทัลและงานนำเสนอสินค้า', 'svc-1.jpg', 'ภาพประกอบโต๊ะทำงานออกแบบกราฟิก 3 มิติ',
      [['Animation', 'y', 'แอนิเมชัน'], ['Visual Effects', 'o', 'เทคนิคพิเศษ'], ['Computer Graphics'], ['Product Visual'], ['Digital Media'], ['Presentation']]],
    pack: ['ออกแบบบรรจุภัณฑ์เชิงกลยุทธ์และอัตลักษณ์แบรนด์ ตามแนวคิด Packaging Design 4.0 และ Sustainable Packaging เพิ่มมูลค่าสินค้าเกษตรและผลิตภัณฑ์ชุมชน', 'svc-2.jpg', 'ภาพประกอบกล่องและบรรจุภัณฑ์รักษ์โลก',
      [['Smart Packaging 4.0', 'y', 'แพคเกจจิ้งอัจฉริยะ'], ['Sustainable', 'o', 'บรรจุภัณฑ์ยั่งยืน'], ['Brand Identity'], ['Agri Product'], ['Community Product'], ['Workshop']]],
    ux: ['ออกแบบประสบการณ์ผู้ใช้สำหรับสื่อดิจิทัล สตูดิโอมีทีม UX Designer ตั้งแต่ปีแรกที่ก่อตั้ง งานจึงไม่ได้จบแค่ภาพสวย แต่ต้องใช้งานง่ายด้วย', 'svc-1.jpg', 'ภาพประกอบจอออกแบบหน้าจอแอป',
      [['UX Design', 'y', 'ประสบการณ์ผู้ใช้'], ['UI Design', 'o', 'หน้าจอ'], ['User Flow'], ['Prototype'], ['Digital Media'], ['Usability']]],
    vtf: ['ให้คำปรึกษาและอบรมผู้ประกอบการ SMEs และ OTOP เตรียมสินค้าขึ้นแพลตฟอร์มแสดงสินค้าเสมือนจริง และจับคู่ธุรกิจออนไลน์', 'svc-3.jpg', 'ภาพประกอบบูธแสดงสินค้าเสมือนจริงบนแล็ปท็อปและมือถือ',
      [['Virtual Trade Fair', 'y', 'งานแสดงสินค้าเสมือน'], ['Business Matching', 'o', 'จับคู่ธุรกิจ'], ['SMEs'], ['OTOP'], ['Training'], ['Consulting']]],
    line: ['ประยุกต์ LINE Official Account เชื่อมกับเว็บไซต์ร้านค้า เพื่อแนะนำสินค้าเฉพาะบุคคล ต่อยอดจากงานวิจัยของทีมผู้บริหาร', 'svc-3.jpg', 'ภาพประกอบหน้าร้านออนไลน์และแชตบนมือถือ',
      [['LINE OA', 'y', 'แชตกับลูกค้า'], ['Personalized', 'o', 'เฉพาะบุคคล'], ['E-Commerce'], ['Web Shop'], ['Research'], ['Recommendation']]]
  };
  var SLOTS = [ // x%, y px, size px (big centre first)
    [50, 230, 210], [16, 170, 150], [84, 150, 140], [33, 70, 104], [66, 360, 112], [24, 370, 96], [74, 50, 90],
    [8, 330, 20], [92, 330, 26], [44, 420, 16], [58, 60, 18]
  ];
  var bubBox = $('#mx-bubbles'), panelD = $('#mx-panel-d'), tabs = $$('.mx-tabs [role="tab"]'), ul = $('.mx-tabs .ul');
  function moveUl(btn) { if (!ul || !btn) return; ul.style.width = btn.offsetWidth + 'px'; ul.style.transform = 'translateX(' + btn.offsetLeft + 'px)'; }
  function build(k, animate) {
    var d = DATA[k], html = '';
    html += '<div class="mx-bub w" style="--x:' + SLOTS[0][0] + '%;--y:' + SLOTS[0][1] + 'px;--s:' + SLOTS[0][2] + 'px"><div class="in"><img src="assets/img/minterax/' + d[1] + '" alt="' + d[2] + '"></div></div>';
    d[3].forEach(function (b, i) {
      var s = SLOTS[i + 1];
      html += '<div class="mx-bub' + (b[1] ? ' ' + b[1] : '') + '" style="--x:' + s[0] + '%;--y:' + s[1] + 'px;--s:' + s[2] + 'px;--t:' + (4 + i % 4) + 's;--o:' + (-i * .6) + 's"><div class="in">' + b[0] + '</div>' + (b[2] ? '<span class="lab">' + b[2] + '</span>' : '') + '</div>';
    });
    SLOTS.slice(7).forEach(function (s) { html += '<div class="mx-bub ring" aria-hidden="true" style="--x:' + s[0] + '%;--y:' + s[1] + 'px;--s:' + s[2] + 'px"><div class="in"></div></div>'; });
    bubBox.innerHTML = html;
    panelD.textContent = d[0];
    var bs = $$('.mx-bub', bubBox);
    bs.forEach(function (b, i) { b.style.setProperty('--d', (animate ? i * .06 : (.04 + Math.random() * .08) * i) + 's'); if (animate) b.classList.add('pop-in'); });
    wire(bs);
  }
  function setTab(btn, focus) {
    if (btn.getAttribute('aria-selected') === 'true' && bubBox.children.length) return;
    tabs.forEach(function (t) { var on = t === btn; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('#mx-panel').setAttribute('aria-labelledby', btn.id);
    if (focus) btn.focus();
    moveUl(btn);
    var old = $$('.mx-bub', bubBox);
    if (old.length && !reduce) {
      old.forEach(function (b, i) { b.style.setProperty('--d', i * .03 + 's'); b.classList.remove('pop-in'); b.classList.add('pop-out'); });
      setTimeout(function () { build(btn.dataset.k, true); }, 300);
    } else build(btn.dataset.k, false);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); setTab(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  // bubble physics: cursor repel + drag with elastic return (desktop only)
  var mouse = { x: -1e4, y: -1e4 };
  function wire(bs) {
    if (!fine || reduce) return;
    bs.forEach(function (b) {
      var drag = null;
      b.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; b.classList.add('drag'); b.setPointerCapture(e.pointerId); b.style.transition = 'none'; });
      b.addEventListener('pointermove', function (e) { if (!drag) return; b.style.translate = (e.clientX - drag.x) + 'px ' + (e.clientY - drag.y) + 'px'; });
      var end = function () { if (!drag) return; drag = null; b.classList.remove('drag'); b.style.transition = 'translate .6s cubic-bezier(.34,1.56,.64,1)'; b.style.translate = '0px 0px'; };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
    });
  }
  if (fine && !reduce && bubBox) {
    var rq = null;
    bubBox.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (rq) return;
      rq = requestAnimationFrame(function () {
        rq = null;
        $$('.mx-bub:not(.drag)', bubBox).forEach(function (b) {
          var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = cx - mouse.x, dy = cy - mouse.y, dist = Math.hypot(dx, dy), lim = r.width / 2 + 90;
          if (dist < lim && dist > 0) { var f = (1 - dist / lim) * 20; b.style.transition = 'translate .3s ease-out'; b.style.translate = (dx / dist * f).toFixed(1) + 'px ' + (dy / dist * f).toFixed(1) + 'px'; }
          else if (b.style.translate && b.style.translate !== '0px 0px') { b.style.translate = '0px 0px'; }
        });
      });
    });
    bubBox.addEventListener('pointerleave', function () { $$('.mx-bub', bubBox).forEach(function (b) { b.style.translate = '0px 0px'; }); });
  }
  if (tabs.length) {
    build('cg', false);
    requestAnimationFrame(function () { moveUl(tabs[0]); });
    window.addEventListener('resize', function () { moveUl(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); });
    if (!reduce) { bubBox.classList.add('pre'); onIn['mx-bubbles'] = function () { bubBox.classList.add('fizz'); setTimeout(function () { bubBox.classList.remove('fizz'); }, 1400); }; }
    bubBox.id = 'mx-bubbles';
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveUl(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); });
  }

  /* ---------- gallery lightbox ---------- */
  var lb = $('#mx-lb'), lbImg = $('#mx-lb-img'), lbCap = $('#mx-lb-cap'), lastBtn = null;
  $$('.mx-gal .g').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!lb || !lb.showModal) return;
      lastBtn = b; lbImg.src = b.dataset.src; lbImg.alt = b.querySelector('img').alt; lbCap.textContent = b.dataset.cap; lb.showModal();
    });
  });
  if (lb) {
    $('.x', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (lastBtn) lastBtn.focus(); });
  }

  /* ---------- page transition: yellow circle from the clicked button ---------- */
  $$('[data-wipe]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      var r = a.getBoundingClientRect(), w = $('.mx-wipe');
      w.style.setProperty('--cx', (r.left + r.width / 2) + 'px'); w.style.setProperty('--cy', (r.top + r.height / 2) + 'px');
      root.classList.add('leave');
      setTimeout(function () { location.href = a.href; }, 620);
    });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leave'); });

  /* ---------- cursor tag ---------- */
  var cur = $('.mx-cur');
  if (fine && cur) {
    root.classList.add('cur-on');
    var lab = cur.firstElementChild;
    root.addEventListener('pointermove', function (e) {
      cur.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      var t = e.target.closest('[data-cur]');
      cur.classList.toggle('big', !!t);
      if (t) lab.textContent = t.getAttribute('data-cur');
    });
    root.addEventListener('pointerleave', function () { cur.classList.remove('big'); });
  }
})();
