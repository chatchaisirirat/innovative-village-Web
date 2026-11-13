/* CNX FinTech page: blur-up reveals and vertical cut-reveal headings
   (adapted from the 21st.dev "About section 1" + "vertical-cut-reveal"
   components). Plays once per visit, replays on Back. */
(function () {
  'use strict';
  var root = document.querySelector('.cf');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }

  // split headings into words (spaces; Thai phrases are kept together)
  $$('.cf-cut').forEach(function (h) {
    var text = h.textContent.trim(), words = text.split(/\s+/), fromLast = h.dataset.cut === 'last';
    h.textContent = '';
    var sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text; h.appendChild(sr);
    words.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span'); s.textContent = w;
      var n = fromLast ? words.length - 1 - i : i;
      s.style.setProperty('--d', (0.2 + n * 0.12).toFixed(2) + 's');
      o.appendChild(s); h.appendChild(o);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });

  var io = null;
  function setup() {
    var els = $$('.cf-rv, .cf-cut');
    if (io) io.disconnect();
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) { e.classList.remove('in'); });
    // hero items use their own step (data-i × 0.3s, as in the component); others stagger by sibling
    var groups = new Map();
    els.forEach(function (e) {
      if (!e.classList.contains('cf-rv')) return;
      if (e.dataset.i !== undefined) { e.style.setProperty('--d', (e.dataset.i * 0.15) + 's'); return; }
      var p = e.parentElement, n = groups.get(p) || 0;
      e.style.setProperty('--d', Math.min(n * 0.1, 0.5) + 's');
      groups.set(p, n + 1);
    });
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(function () { requestAnimationFrame(function () { e.classList.add('in'); }); });
      else io.observe(e);
    });
  }
  setup();
  window.addEventListener('pageshow', function (e) { if (e.persisted) setup(); });
})();
