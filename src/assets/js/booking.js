/* Booking — meeting room booking + office visit request */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var WD = IV.WD, MO = IV.MO;
  var ROOMS = ['S', 'M', 'L', 'XL', 'Workshop'];
  var SIZES = ['S', 'M', 'L', 'XL', 'ยังไม่แน่ใจ'];
  var TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  var p = IV.params;
  function fresh() { return { step: 1, room: '', day: -1, time: '', size: '', done: false, ref: '' }; }
  var s = fresh();
  s.tab = p.get('tab') === 'visit' || p.get('unit') || p.get('size') ? 'visit' : 'meeting';
  if (ROOMS.indexOf(p.get('room')) > -1) s.room = p.get('room');
  if (SIZES.indexOf(p.get('size')) > -1) s.size = p.get('size');
  var space = p.get('space') || '';
  var unit = p.get('unit') || '';

  /* 14 days from today */
  var today = new Date();
  var days = [];
  for (var i = 0; i < 14; i++) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    days.push({
      date: d,
      wd: i === 0 ? 'วันนี้' : WD[d.getDay()],
      num: d.getDate(), mon: MO[d.getMonth()],
      aria: WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()],
      full: WD[d.getDay()] + ' ' + d.getDate() + ' ' + MO[d.getMonth()] + ' ' + (d.getFullYear() + 543),
      iso: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    });
  }

  function pastSlot(dayIdx, t) {
    if (dayIdx !== 0) return false;
    var hm = t.split(':');
    var slot = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +hm[0], +hm[1]);
    return slot <= new Date();
  }

  /* build pickers */
  $('rooms').innerHTML = ROOMS.map(function (n) {
    return '<button type="button" class="pick-room" data-room="' + n + '"><b>' + n + '</b><span>[—] ที่นั่ง · [—] บาท/ชม.</span></button>';
  }).join('');
  $('sizes').innerHTML = SIZES.map(function (n) {
    return '<button type="button" class="pick-size" data-size="' + IV.esc(n) + '">' + IV.esc(n) + '</button>';
  }).join('');
  $('days').innerHTML = days.map(function (d, i) {
    return '<button type="button" class="pick-day" data-day="' + i + '" aria-label="' + d.aria + '"><span class="wd">' + d.wd + '</span><span class="d">' + d.num + '</span><span class="m">' + d.mon + '</span></button>';
  }).join('');

  function renderTimes() {
    $('times').innerHTML = TIMES.map(function (t) {
      var past = s.day > -1 && pastSlot(s.day, t);
      return '<button type="button" class="pick-time" data-time="' + t + '"' + (past ? ' disabled style="opacity:.35;cursor:not-allowed;text-decoration:line-through"' : '') + ' aria-pressed="' + (s.time === t) + '">' + t + '</button>';
    }).join('');
  }

  if (space) {
    $('space-note').hidden = false;
    $('space-note').textContent = 'พื้นที่ที่สนใจ: ' + space + ' — เลือกขนาดห้องที่ต้องการด้านบน แล้วระบุรายละเอียดเพิ่มเติมในหมายเหตุได้';
    $('m3-note').value = 'สนใจพื้นที่: ' + space;
  }
  if (unit) {
    $('unit-note').hidden = false;
    $('unit-note').textContent = 'ยูนิตที่สนใจ: ' + unit + ' (จาก Digital Twin)';
  }

  /* events */
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.tab;
      if (t === s.tab && !s.done) return;
      var keep = s.tab === t ? {} : {};
      s = Object.assign(fresh(), { tab: t }, keep);
      render();
    });
  });
  $('rooms').addEventListener('click', function (e) { var b = e.target.closest('[data-room]'); if (b) { s.room = b.dataset.room; render(); } });
  $('sizes').addEventListener('click', function (e) { var b = e.target.closest('[data-size]'); if (b) { s.size = b.dataset.size; render(); } });
  $('days').addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]'); if (!b) return;
    s.day = +b.dataset.day;
    if (s.time && pastSlot(s.day, s.time)) s.time = '';
    render();
  });
  $('times').addEventListener('click', function (e) { var b = e.target.closest('[data-time]'); if (b && !b.disabled) { s.time = b.dataset.time; render(); } });

  $('m1-next').addEventListener('click', function () { if (s.room) go(2); });
  $('v1-next').addEventListener('click', function () { if (IV.validate($('v1-form'))) go(2); });
  $('when-next').addEventListener('click', function () {
    if (s.day < 0 || !s.time) return;
    if (s.tab === 'meeting') go(3); else submitVisit();
  });
  document.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { go(Math.max(1, s.step - 1)); });
  });
  $('m3-submit').addEventListener('click', function () {
    if (!IV.validate($('m3-form'))) return;
    var data = IV.values($('m3-form'));
    data.room = s.room; data.date = days[s.day].iso; data.time = s.time; if (space) data.space = space;
    busy($('m3-submit'), true);
    IV.submit('booking-meeting', data).then(function (r) { busy($('m3-submit'), false); s.ref = r.id; s.done = true; render(true); });
  });
  $('reset').addEventListener('click', function () { var t = s.tab; s = fresh(); s.tab = t; render(); });

  function submitVisit() {
    var data = IV.values($('v1-form'));
    data.size = s.size; data.date = days[s.day].iso; data.time = s.time; if (unit) data.unit = unit;
    busy($('when-next'), true);
    IV.submit('booking-visit', data).then(function (r) { busy($('when-next'), false); s.ref = r.id; s.step = 3; s.done = true; render(true); });
  }
  function busy(btn, on) { btn.disabled = on; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = on ? 'กำลังส่ง…' : btn.dataset.label; if (!on) delete btn.dataset.label; }

  function go(step) {
    s.step = step;
    render(true);
  }

  function render(focus) {
    var M = s.tab === 'meeting';
    document.querySelectorAll('.tab').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === s.tab ? 'true' : 'false'); });

    /* steps */
    var labels = M ? ['เลือกห้อง', 'วัน / เวลา', 'ยืนยัน'] : ['ชื่อ / เบอร์', 'วัน / เวลา', 'ทีมติดต่อกลับ'];
    $('steps').hidden = s.done;
    $('steps').innerHTML = labels.map(function (l, i) {
      var n = i + 1, cls = n === s.step ? 'active' : (n < s.step ? 'done' : '');
      return '<li class="' + cls + '"' + (n === s.step ? ' aria-current="step"' : '') + '><span class="num">' + (n < s.step ? '✓' : n) + '</span><b>' + l + '</b></li>';
    }).join('');

    $('m1').hidden = !(M && !s.done && s.step === 1);
    $('v1').hidden = !(!M && !s.done && s.step === 1);
    $('when').hidden = !(!s.done && s.step === 2);
    $('m3').hidden = !(M && !s.done && s.step === 3);
    $('done').hidden = !s.done;

    setPressed('#rooms [data-room]', function (b) { return b.dataset.room === s.room; });
    setPressed('#sizes [data-size]', function (b) { return b.dataset.size === s.size; });
    setPressed('#days [data-day]', function (b) { return +b.dataset.day === s.day; });
    renderTimes();

    $('m1-next').disabled = !s.room;
    var hasWhen = s.day >= 0 && s.time !== '';
    $('when-next').disabled = !hasWhen;
    $('when-next').textContent = M ? 'ถัดไป: ยืนยัน' : 'ส่งคำขอนัดดู';

    var dayLabel = s.day >= 0 ? days[s.day].full : '';
    $('s-room').textContent = 'Meeting Room ' + s.room;
    $('s-day').textContent = dayLabel;
    $('s-time').textContent = s.time;

    if (s.done) {
      $('done-title').textContent = M ? 'ส่งคำขอจองห้องแล้ว' : 'ส่งคำขอนัดดูออฟฟิศแล้ว';
      $('done-text').textContent = M ? 'ทีม IV ได้รับแจ้งทาง LINE และ Email แล้ว และจะยืนยันการจองกลับโดยเร็ว' : 'ทีม IV ได้รับแจ้งทาง LINE และ Email แล้ว และจะติดต่อกลับเพื่อยืนยันเวลานัด';
      $('done-when').textContent = (M ? 'Meeting Room ' + s.room + ' · ' : (unit ? 'ยูนิต ' + unit + ' · ' : '')) + dayLabel + (s.time ? ' · ' + s.time : '');
      $('done-ref').textContent = s.ref ? 'หมายเลขคำขอ: ' + s.ref : '';
    }

    if (focus) {
      var target = s.done ? $('done') : $('steps');
      var top = target.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (s.done) $('done').focus({ preventScroll: true });
    }
  }
  function setPressed(sel, fn) {
    document.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-pressed', fn(b) ? 'true' : 'false'); });
  }

  render();
})();
