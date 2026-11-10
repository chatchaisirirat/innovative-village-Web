/* Digital Twin — interactive floor plan */
(function () {
  'use strict';
  var esc = IV.esc;

  var CAT = {
    tenant:   { label: 'Tenant · ออฟฟิศให้เช่า', short: 'ออฟฟิศให้เช่า', dot: '#a09fa0', price: '[ราคา] บาท / เดือน', note: 'ออฟฟิศให้เช่าเริ่มต้น 3,500 บาท / เดือน', cta: 'นัดดูยูนิตนี้' },
    cowork:   { label: 'Cowork', short: 'Cowork', dot: '#ee7c39', price: '[อัตราค่าใช้]', note: '[เงื่อนไขการจอง]', cta: 'จองห้องนี้' },
    facility: { label: 'Facility', short: 'Facility', dot: '#689ad4', price: '[ค่าบริการ]', note: '[เวลาเปิด / เงื่อนไข]', cta: '' },
    villager: { label: 'Villager', short: 'Villager', dot: '#7dae56', price: '—', note: 'สมาชิกของชุมชน Innovative Village', cta: 'ดู Villagers ทั้งหมด' },
    common:   { label: 'Common · ส่วนกลาง', short: 'ส่วนกลาง', dot: '#f3c445', price: 'ใช้ร่วมกัน', note: '[การใช้งาน]', cta: '' }
  };

  // [id, code, category, x%, y%, size, function, equipment, w%, h%]
  var U = [
    ['C2', 'C2', 'tenant', 44.3, 32.4], ['C5', 'C5', 'tenant', 36.2, 28.9], ['C10', 'C10', 'tenant', 24.6, 24.7],
    ['C11', 'C11', 'tenant', 22.1, 34.3], ['B2', 'B2', 'tenant', 39.1, 67.1], ['A2', 'A2', 'tenant', 54.3, 66.6],
    ['C1', 'C1', 'cowork', 42.5, 42.7, 'XL', 'Karaoke'], ['C4', 'C4', 'cowork', 37.4, 22.5, 'M'],
    ['C6', 'C6', 'cowork', 33.4, 37.8, 'L', 'Sound Lab', 'Monitor + Sound'], ['C8', 'C8', 'cowork', 32.9, 19.3, 'S', '(Bitcoin)'],
    ['C9', 'C9', 'cowork', 26.8, 16.4, 'XL'], ['D1', 'D1', 'cowork', 63.7, 45.1],
    ['A3A4', 'A3–A4', 'cowork', 68.9, 65.2, '', 'Outdoor', '', 7.6, 8.6],
    ['C3', 'C3', 'facility', 45.6, 23.9, '', 'Minimart'], ['C7', 'C7', 'facility', 32.3, 26.8, '', 'Massage'],
    ['C12', 'C12', 'facility', 15.6, 33.3, '', 'Pilates'],
    ['C13', 'C13', 'villager', 17.5, 13.4], ['B7', 'B7', 'villager', 22.5, 47.8], ['B6', 'B6', 'villager', 34.7, 54.1],
    ['B5', 'B5', 'villager', 10.0, 63.7], ['B4', 'B4', 'villager', 22.3, 64.7], ['B3', 'B3', 'villager', 32.9, 65.8],
    ['B1', 'B1', 'villager', 43.5, 67.2], ['A1', 'A1', 'villager', 50.0, 66.6],
    ['WC', 'ห้องน้ำ', 'common', 51.2, 36.7, '', 'ห้องน้ำ'], ['D2', 'D2', 'common', 76.6, 49.6], ['D3', 'D3', 'common', 84.3, 56.1],
    ['D4', 'D4', 'common', 93.3, 62.7], ['P', 'Parking', 'common', 41.3, 90.6, '', 'ที่จอดรถ', '', 4.2, 7.4]
  ];
  var FL = [['all', 'ทั้งหมด'], ['tenant', 'ออฟฟิศให้เช่า'], ['cowork', 'Cowork'], ['facility', 'Facility'], ['villager', 'Villager'], ['common', 'ส่วนกลาง']];

  var byId = {}; U.forEach(function (u) { byId[u[0]] = u; });
  var p = IV.params;
  var state = {
    selected: byId[p.get('unit')] ? p.get('unit') : 'C5',
    filter: CAT[p.get('filter')] ? p.get('filter') : 'all'
  };

  var map = document.getElementById('map');
  var filtersEl = document.getElementById('filters');
  var groupsEl = document.getElementById('groups');

  /* build hotspots */
  U.forEach(function (u) {
    var c = CAT[u[2]];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hot';
    b.dataset.id = u[0];
    b.dataset.cat = u[2];
    b.style.left = u[3] + '%';
    b.style.top = u[4] + '%';
    b.style.width = (u[8] || 4.8) + '%';
    b.style.height = (u[9] || 8.2) + '%';
    b.setAttribute('aria-label', u[1] + ' — ' + c.short + (u[6] ? ' · ' + u[6] : ''));
    b.addEventListener('click', function () { select(u[0], false); });
    map.appendChild(b);
  });

  /* filters */
  FL.forEach(function (f) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.filter = f[0];
    b.textContent = f[1];
    b.addEventListener('click', function () { state.filter = f[0]; render(); syncUrl(); });
    filtersEl.appendChild(b);
  });

  /* groups list */
  ['tenant', 'cowork', 'facility', 'villager', 'common'].forEach(function (k) {
    var row = document.createElement('div');
    row.className = 'unit-row';
    var items = U.filter(function (u) { return u[2] === k; }).map(function (u) {
      var sub = [u[5], u[6]].filter(Boolean).join(' · ');
      return '<button type="button" class="unit-btn" data-id="' + u[0] + '"><strong>' + esc(u[1]) + '</strong>' + (sub ? ' ' + esc(sub) : '') + '</button>';
    }).join('');
    row.innerHTML = '<span class="lbl"><span class="dot" aria-hidden="true" style="background:' + CAT[k].dot + '"></span>' + esc(CAT[k].label) + '</span><div class="items">' + items + '</div>';
    groupsEl.appendChild(row);
  });
  groupsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.unit-btn');
    if (b) select(b.dataset.id, true);
  });

  function ctaHref(u) {
    switch (u[2]) {
      case 'tenant': return 'booking.html?tab=visit&unit=' + encodeURIComponent(u[1]);
      case 'cowork': return 'booking.html?tab=meeting&space=' + encodeURIComponent(u[1] + (u[6] ? ' ' + u[6] : ''));
      case 'villager': return 'partner.html';
      default: return 'spaces.html';
    }
  }

  function select(id, scrollToPanel) {
    state.selected = id;
    render();
    syncUrl();
    if (scrollToPanel && window.innerWidth < 1000) {
      document.getElementById('panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function syncUrl() {
    var q = new URLSearchParams();
    q.set('unit', state.selected);
    if (state.filter !== 'all') q.set('filter', state.filter);
    try { history.replaceState(null, '', '?' + q.toString()); } catch (e) { /* ignore */ }
  }

  function render() {
    map.querySelectorAll('.hot').forEach(function (b) {
      var on = b.dataset.id === state.selected;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('lit', !on && state.filter !== 'all' && b.dataset.cat === state.filter);
    });
    filtersEl.querySelectorAll('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.filter === state.filter ? 'true' : 'false');
    });
    groupsEl.querySelectorAll('.unit-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.id === state.selected ? 'true' : 'false');
    });

    var u = byId[state.selected] || U[0];
    var c = CAT[u[2]];
    var title = u[6] || (u[2] === 'tenant' ? 'ออฟฟิศให้เช่า' : u[2] === 'villager' ? '[ชื่อบริษัท]' : '[ฟังก์ชันของห้อง]');
    var photo = document.getElementById('p-photo');
    photo.textContent = '[ภาพ: ' + u[1] + ']';
    photo.setAttribute('aria-label', 'ภาพ ' + u[1] + ' (รอภาพจริง)');
    document.getElementById('p-dot').style.background = c.dot;
    document.getElementById('p-cat').textContent = c.label;
    document.getElementById('p-code').textContent = u[1];
    document.getElementById('p-title').textContent = title;
    document.getElementById('p-note').textContent = c.note;

    var rows = [];
    if (u[2] === 'tenant') rows.push(['สถานะ', '[ว่าง / มีผู้เช่า]']);
    rows.push(['ขนาด', u[5] || '[ตร.ม.]']);
    rows.push(['ราคา', c.price, true]);
    rows.push(['ที่นั่ง', '[—]']);
    rows.push(['อุปกรณ์', u[7] || '[รายการอุปกรณ์]']);
    rows.push(['วิธี Check-in', '[ขั้นตอน]']);
    rows.push(['กติกา', '[กติกาการใช้]']);
    document.getElementById('p-dl').innerHTML = rows.map(function (r) {
      return '<dt>' + esc(r[0]) + '</dt><dd' + (r[2] ? ' class="b"' : '') + '>' + esc(r[1]) + '</dd>';
    }).join('');

    var cta = document.getElementById('p-cta');
    if (c.cta) {
      cta.hidden = false;
      cta.textContent = c.cta;
      cta.href = ctaHref(u);
    } else {
      cta.hidden = true;
    }
  }

  render();
})();
