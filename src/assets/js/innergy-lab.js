/* Innergy Lab portfolio page: kinetic section menu
   (adapted from the 21st.dev "kinetic navigation" React + GSAP component;
   the same open/close choreography is done here with CSS transitions). */
(function () {
  'use strict';
  var btn = document.querySelector('.il-kbtn');
  var menu = document.getElementById('il-kmenu');
  if (!btn || !menu) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var links = Array.prototype.slice.call(menu.querySelectorAll('.il-klink'));
  var shapes = Array.prototype.slice.call(menu.querySelectorAll('.il-kshape'));
  var open = false, timer = null;
  var CLOSE_MS = reduce ? 10 : 700;

  function setOpen(next, opts) {
    if (next === open) return;
    open = next;
    clearTimeout(timer);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนูส่วนต่างๆ ของหน้านี้');
    if (open) {
      menu.classList.remove('is-closing');
      menu.hidden = false;
      document.documentElement.classList.add('il-lock');
      void menu.offsetWidth;                     // let the closed state paint first
      menu.classList.add('is-open');
      setTimeout(function () { if (open && links[0]) links[0].focus({ preventScroll: true }); }, reduce ? 0 : 450);
    } else {
      menu.classList.add('is-closing');
      menu.classList.remove('is-open');
      shapes.forEach(function (s) { s.classList.remove('active'); });
      timer = setTimeout(function () {
        menu.hidden = true;
        menu.classList.remove('is-closing');
        document.documentElement.classList.remove('il-lock');
        if (opts && opts.then) opts.then();
      }, CLOSE_MS);
      if (!(opts && opts.keepFocus)) btn.focus({ preventScroll: true });
    }
  }

  btn.addEventListener('click', function () { setOpen(!open); });
  menu.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) setOpen(false); });

  // a link closes the menu, then scrolls to its section
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setOpen(false, {
        keepFocus: true,
        then: function () {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  });

  // ambient shapes behind the links, one set per link
  menu.querySelectorAll('.il-klist li[data-shape]').forEach(function (li) {
    var shape = menu.querySelector('.il-kshape[data-shape="' + li.dataset.shape + '"]');
    if (!shape) return;
    function on() { shapes.forEach(function (s) { s.classList.toggle('active', s === shape); }); }
    function off() { shape.classList.remove('active'); }
    li.addEventListener('mouseenter', on);
    li.addEventListener('mouseleave', off);
    li.addEventListener('focusin', on);
    li.addEventListener('focusout', off);
  });

  // keyboard: Escape closes, Tab stays inside the menu and its button
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (e.key !== 'Tab') return;
    var stops = [btn].concat(links);
    var i = stops.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); stops[stops.length - 1].focus(); }
    else if (!e.shiftKey && i === stops.length - 1) { e.preventDefault(); stops[0].focus(); }
  });

  // coming Back to this page: start with the menu closed
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !open) return;
    open = false; menu.hidden = true; menu.classList.remove('is-open', 'is-closing');
    document.documentElement.classList.remove('il-lock');
    btn.setAttribute('aria-expanded', 'false');
  });
})();
