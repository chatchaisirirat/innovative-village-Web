/* AI Activity Calendar */
(function () {
  'use strict';
  var esc = IV.esc;

  /*
   * ใส่กิจกรรมจริงที่นี่ (หรือโหลดจาก API/Google Calendar ภายหลัง)
   * รูปแบบ: { date: 'YYYY-MM-DD', title: 'ชื่อกิจกรรม', time: '13:00–16:00', room: 'Workshop' }
   */
  var EVENTS = [];

  var now = new Date();
  var offset = 0;
  var cal = document.getElementById('cal');
  var label = document.getElementById('cal-label');

  function iso(y, m, d) { return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }

  function render() {
    var first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    var y = first.getFullYear(), m = first.getMonth();
    var daysIn = new Date(y, m + 1, 0).getDate();
    var lead = first.getDay();
    label.textContent = IV.MONTHS[m] + ' ' + (y + 543);

    var html = IV.WD.map(function (w) { return '<div class="wd">' + w + '</div>'; }).join('');
    var count = 0;
    for (var i = 0; i < lead; i++) { html += '<div class="c empty"></div>'; count++; }
    for (var d = 1; d <= daysIn; d++) {
      var isToday = offset === 0 && d === now.getDate();
      var evs = EVENTS.filter(function (e) { return e.date === iso(y, m, d); });
      html += '<div class="c' + (isToday ? ' today' : '') + '"' + (isToday ? ' aria-current="date"' : '') + '><b>' + d + '</b>' +
        evs.map(function (e) { return '<span style="font-size:12px;line-height:1.3;padding:2px 4px;background:var(--lime);color:var(--charcoal)">' + esc(e.title) + '</span>'; }).join('') +
        '</div>';
      count++;
    }
    while (count % 7 !== 0) { html += '<div class="c empty"></div>'; count++; }
    cal.innerHTML = html;
  }

  function renderUpcoming() {
    if (!EVENTS.length) return; // keep placeholders from the design
    var todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
    var next = EVENTS.filter(function (e) { return e.date >= todayIso; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, 3);
    var box = document.getElementById('upcoming');
    box.innerHTML = '<h3>UPCOMING</h3>' + next.map(function (e) {
      var p = e.date.split('-');
      return '<div class="ev"><span class="date">' + (+p[2]) + '<br>' + IV.MO[+p[1] - 1] + '</span><div class="b"><b>' + esc(e.title) + '</b><span>' + esc([e.time, e.room].filter(Boolean).join(' · ')) + '</span></div></div>';
    }).join('') || '<p style="margin:0">ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>';
  }

  document.getElementById('cal-prev').addEventListener('click', function () { offset--; render(); });
  document.getElementById('cal-next').addEventListener('click', function () { offset++; render(); });
  render();
  renderUpcoming();
})();
