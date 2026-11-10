/* Home hero — photo stack that takes turns coming to the front */
(function () {
  'use strict';
  var stack = document.getElementById('hero-stack');
  var btn = document.getElementById('hero-pause');
  if (!stack) return;
  var cards = Array.prototype.slice.call(stack.querySelectorAll('.hero-card'));
  if (cards.length < 2) return;

  var order = cards.slice();              // order[0] is the front card
  var DELAY = 4200;                       // time each photo stays in front (ms)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduce, hovering = false, timer = null, busy = false;

  function layout() {
    order.forEach(function (c, i) {
      c.dataset.pos = String(i);
      c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    });
  }

  function next() {
    if (busy) return;
    busy = true;
    var front = order.shift();
    front.dataset.pos = 'out';            // front card swings out and fades
    front.setAttribute('aria-hidden', 'true');
    order.push(front);
    order.forEach(function (c, i) { if (c !== front) { c.dataset.pos = String(i); } });
    order[0].setAttribute('aria-hidden', 'false');
    setTimeout(function () {              // then tucks in quietly at the back
      front.dataset.pos = String(order.length - 1);
      busy = false;
    }, 950);
  }

  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovering && !document.hidden) timer = setTimeout(function () { next(); schedule(); }, DELAY);
  }

  stack.addEventListener('click', function () { next(); schedule(); });
  stack.addEventListener('mouseenter', function () { hovering = true; schedule(); });
  stack.addEventListener('mouseleave', function () { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);

  function syncBtn() {
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    btn.setAttribute('aria-label', paused ? 'เล่นภาพต่อ' : 'หยุดเลื่อนภาพ');
  }
  if (btn) btn.addEventListener('click', function () { paused = !paused; syncBtn(); if (!paused) next(); schedule(); });

  layout();
  if (btn) syncBtn();
  schedule();
})();
