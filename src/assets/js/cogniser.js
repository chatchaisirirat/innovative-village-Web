/* CAS Cogniser page: 3D coverflow product carousel
   (adapted from the 21st.dev "3D Coverflow Carousel" React component). */
(function () {
  'use strict';
  var root = document.getElementById('cf');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.cf-card'));
  var dotsBox = root.querySelector('.cf-dots');
  var live = root.querySelector('.cf-live');
  var total = cards.length, cur = 0, timer = null, hovering = false, focused = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DELAY = 5000;
  var POS = ['l2', 'l1', 'is-center', 'r1', 'r2'];

  var dots = cards.map(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'ไปที่ ' + c.dataset.title);
    b.addEventListener('click', function () { go(i, true); });
    dotsBox.appendChild(b);
    return b;
  });

  function render(announce) {
    cards.forEach(function (c, i) {
      var off = (i - cur + total) % total;
      c.classList.remove.apply(c.classList, POS);
      var cls = off === 0 ? 'is-center' : off === 1 ? 'r1' : off === 2 ? 'r2' : off === total - 1 ? 'l1' : off === total - 2 ? 'l2' : '';
      if (cls) c.classList.add(cls);
      c.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
      c.setAttribute('aria-label', (i + 1) + ' จาก ' + total + ': ' + c.dataset.title);
    });
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    if (announce) live.textContent = cards[cur].dataset.title;
  }
  function go(i, user) { cur = (i + total) % total; render(user); schedule(); }
  function schedule() {
    clearTimeout(timer);
    if (reduce || hovering || focused || document.hidden || total < 2) return;
    timer = setTimeout(function () { go(cur + 1, false); }, DELAY);
  }

  root.querySelector('.cf-nav.prev').addEventListener('click', function () { go(cur - 1, true); });
  root.querySelector('.cf-nav.next').addEventListener('click', function () { go(cur + 1, true); });
  cards.forEach(function (c, i) { c.addEventListener('click', function () { if (i !== cur) go(i, true); }); });

  // arrow keys work while the carousel has focus (not page-wide, so they don't fight scrolling)
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); }
  });

  // swipe
  var x0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1), true);
  });

  // pause while the visitor is reading or using it
  root.addEventListener('mouseenter', function () { hovering = true; schedule(); });
  root.addEventListener('mouseleave', function () { hovering = false; schedule(); });
  root.addEventListener('focusin', function () { focused = true; schedule(); });
  root.addEventListener('focusout', function () { setTimeout(function () { focused = root.contains(document.activeElement); schedule(); }, 0); });
  document.addEventListener('visibilitychange', schedule);

  render(false);
  schedule();
})();
