/* Internship application: form -> logic quiz -> send to management */
(function () {
  'use strict';
  var form = document.getElementById('intern-form');
  var quiz = document.getElementById('quiz');
  var done = document.getElementById('intern-done');
  var start = document.getElementById('d-start');
  var end = document.getElementById('d-end');
  var data = null;

  var t = new Date();
  var todayIso = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  start.min = todayIso; end.min = todayIso;
  start.addEventListener('change', function () { end.min = start.value || todayIso; if (end.value && end.value < start.value) end.value = ''; });

  function step(n) {
    form.hidden = n !== 1;
    quiz.hidden = n !== 2;
    done.hidden = n !== 3;
    document.querySelectorAll('#mini-steps span').forEach(function (s) {
      var k = +s.dataset.s;
      s.className = k === n ? 'on' : (k < n ? 'ok' : '');
    });
    var target = n === 2 ? quiz : n === 3 ? done : null;
    if (target) { target.focus({ preventScroll: true }); document.getElementById('apply').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!IV.validate(form)) return;
    data = IV.values(form);
    step(2);
  });
  document.getElementById('quiz-back').addEventListener('click', function () { step(1); });
  document.getElementById('quiz-submit').addEventListener('click', function () {
    var btn = this; btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    IV.submit('intern', data).then(function (r) {
      document.getElementById('intern-ref').textContent = 'หมายเลขใบสมัคร: ' + r.id;
      btn.disabled = false; btn.textContent = 'ส่งให้ทีมบริหาร';
      step(3);
    });
  });

  step(1);
})();
