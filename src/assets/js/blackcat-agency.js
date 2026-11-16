/* BlackCat Agency page: blueprint → colour → assemble load sequence, idle loops, mouse parallax,
   full-screen menu, service tiles (filter flip + active pop), stats count-up, story carousel
   (drag, counter, progress), recent-work filter, client marquee, custom cursor.
   Everything respects prefers-reduced-motion. */
(function () {
  'use strict';
  var root = document.querySelector('.bk'); if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, el) { return (el || root).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var T = function (fn, ms) { return setTimeout(fn, reduce ? 0 : ms); };

  /* ---------- hero load sequence ---------- */
  var scene = $('#bk-scene'), hero = $('.bk-hero'), wheel = $('.bk-wheel');
  function heroIn() {
    if (reduce) { scene.classList.add('s1', 's2'); hero.classList.add('go', 'go2'); $$('.bk-proc .pc, .bk-proc .ln').forEach(function (e) { e.classList.add('on'); }); return; }
    scene.classList.remove('s1', 's2', 's3', 'idle'); hero.classList.remove('go', 'go2');
    $$('.bk-proc .on').forEach(function (e) { e.classList.remove('on'); });
    void scene.getBoundingClientRect();
    T(function () { scene.classList.add('s1'); }, 60);           // blueprint draws itself
    T(function () { scene.classList.add('s3'); }, 500);          // parts drop and snap
    T(function () { scene.classList.add('s2'); }, 700);          // colour pours in
    T(function () { hero.classList.add('go'); }, 900);           // headline rises
    T(typeEyebrow, 1250);
    var steps = $$('.bk-proc .pc, .bk-proc .ln');
    steps.forEach(function (e, i) { T(function () { e.classList.add('on'); }, 1500 + i * 150); });
    T(function () { hero.classList.add('go2'); }, 1500 + steps.length * 150);
    T(function () { scene.classList.add('idle'); if (wheel) wheel.classList.add('spin'); }, 2600);
  }
  function typeEyebrow() {
    var el = $('#bk-type'); if (!el) return; var full = el.getAttribute('aria-label').toUpperCase(); el.textContent = '';
    var span = document.createElement('span'); span.setAttribute('aria-hidden', 'true'); el.appendChild(span);
    var i = 0; (function step() { span.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(step, 30); })();
  }
  heroIn();
  window.addEventListener('pageshow', function (e) { if (e.persisted) heroIn(); });

  /* mouse parallax by depth (spring-smoothed via CSS transition) */
  if (fine && !reduce && scene) {
    var parts = $$('.p', scene);
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      parts.forEach(function (p) { var d = +p.dataset.depth || 10; p.style.transform = 'translate(' + (x * d).toFixed(1) + 'px,' + (y * d * .6).toFixed(1) + 'px)'; });
    });
    hero.addEventListener('mouseleave', function () { parts.forEach(function (p) { p.style.transform = ''; }); });
  }

  /* ---------- full-screen menu ---------- */
  var burger = $('#bk-burger'), menu = $('#bk-menu');
  function setMenu(on) {
    if (on) { var r = burger.getBoundingClientRect(); menu.style.setProperty('--cx', (r.left + r.width / 2) + 'px'); menu.style.setProperty('--cy', (r.top + r.height / 2) + 'px'); menu.hidden = false; void menu.offsetWidth; }
    menu.classList.toggle('open', on); root.classList.toggle('menu-open', on);
    burger.setAttribute('aria-expanded', on); burger.setAttribute('aria-label', on ? 'ปิดเมนู' : 'เปิดเมนูหน้า BlackCat');
    if (on) { var a = $('a', menu); setTimeout(function () { a && a.focus(); }, 300); }
    else setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, reduce ? 0 : 600);
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* ---------- services ---------- */
  var IC = {
    web: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M3 8h18M8 21h8M12 17v4M9 12l-2 1.5L9 15M15 12l2 1.5-2 1.5"/>',
    seo: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M7.5 12l2-2.5 2 1.5 2-3"/>',
    mkt: '<path d="M4 10v4h3l7 5V5L7 10z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>',
    gfx: '<path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/><circle cx="18.5" cy="18.5" r="2"/>',
    prod: '<rect x="3" y="7" width="13" height="11" rx="2"/><path d="m16 11 5-3v9l-5-3"/><circle cx="9.5" cy="12.5" r="2.5"/>',
    biz: '<path d="M3 20h18M6 16v-4M10 16V8M14 16v-6M18 16V5"/>',
    step: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    chat: '<path d="M4 12a8 7 0 1 1 3.4 5.8L4 19l1.1-3.3A6.6 6.6 0 0 1 4 12z"/>',
    plan: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    quote: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    rep: '<path d="M4 19h16M7 15v-3M11 15V9M15 15v-5M19 15V7"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    team: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.2c2.5-.3 4.2 1.3 4.7 4.3"/>'
  };
  var SETS = {
    svc: [
      ['web', 'Website & App', 'เว็บไซต์องค์กร อีคอมเมิร์ซ ระบบหน้าร้าน (POS) แอป Android/iOS พร้อม UX/UI, CMS และการเชื่อมต่อ API'],
      ['seo', 'SEO', 'SEO Audit & Consulting, On-page, กลยุทธ์ลิงก์ภายใน-ภายนอก และ Backlinks ให้เว็บติดหน้าแรกของ Google'],
      ['mkt', 'Marketing Strategy', 'วิเคราะห์กลุ่มเป้าหมาย วางกลยุทธ์โซเชียลและคอนเทนต์ สร้างแคมเปญ และวางแผนซื้อโฆษณาออนไลน์'],
      ['gfx', 'Graphic & Branding', 'Art & Creative Direction, Brand Guideline, โลโก้/สติกเกอร์, Packaging & Packshot, แบนเนอร์ และ VDO Motion'],
      ['prod', 'In-house Production', 'ถ่ายภาพสินค้าและองค์กร วิดีโอโฆษณา ไวรัล Presentation รีวิว Testimonial อินโฟกราฟิก แอนิเมชัน 2D/3D และ MV'],
      ['biz', 'Business Consulting', 'วิเคราะห์แบรนด์และพฤติกรรมลูกค้า จัดทำแผนกลยุทธ์ธุรกิจและการตลาด ทั้ง SMEs และองค์กรใหญ่']
    ],
    flow: [
      ['chat', 'แจ้งขอบเขตงาน', 'คุยโจทย์ เป้าหมาย และสิ่งที่ต้องการจากเว็บหรือระบบ'],
      ['plan', 'วิเคราะห์โซลูชัน', 'ศึกษาข้อมูลธุรกิจ แล้วออกแบบแนวทางที่เหมาะกับงาน'],
      ['quote', 'ส่งใบเสนอราคา', 'สรุปขอบเขตงานและระยะเวลาให้ตรวจก่อนเริ่ม'],
      ['code', 'เริ่มพัฒนา', 'ทีมพัฒนาในบ้านลงมือสร้างเว็บและระบบตามแผน'],
      ['rep', 'รายงานทุก 2 สัปดาห์', 'อัปเดตความคืบหน้าเป็นระยะ ให้เห็นงานจริงตลอดทาง'],
      ['box', 'ส่งมอบ + ดูแล 3 เดือน', 'ส่งมอบงาน พร้อมดูแลรักษาระบบต่อหลังส่งมอบ 3 เดือน']
    ],
    val: [
      ['chat', 'Consultation', 'ให้คำปรึกษาที่ทันเทรนด์การตลาดสมัยใหม่'],
      ['plan', 'Good Planning', 'ศึกษาและวิเคราะห์ข้อมูลธุรกิจก่อนวางแผนและออกแบบระบบ'],
      ['star', 'Best Quality', 'คัดสรรคอนเทนต์และออกแบบระบบตามมาตรฐาน'],
      ['target', 'Long-term Goals', 'สร้างความแข็งแกร่งให้แบรนด์ตามแผนระยะยาว'],
      ['team', 'ทีมครบในบ้าน', 'Dev, SEO และโปรดักชันอยู่ในองค์กรเดียว ไม่ต้องจ้างหลายเจ้า'],
      ['step', 'Your success is our work', 'เป็นพาร์ตเนอร์ที่ช่วยแก้ปัญหาธุรกิจและเติบโตอย่างยั่งยืน']
    ]
  };
  var grid = $('#sv-grid'), setKey = 'svc', active = 0;
  function tiles(flip) {
    grid.innerHTML = SETS[setKey].map(function (t, i) {
      var th = /[฀-๿]/.test(t[1]);
      return '<div class="sv-t' + (i === active ? ' on' : '') + (flip ? ' flip' : '') + '" tabindex="0" role="button" aria-pressed="' + (i === active) + '" style="--k:' + i + ';--d:' + (Math.floor(i / 3) + i % 3) + '" data-i="' + i + '">' +
        '<span class="ix">0' + (i + 1) + '</span><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[t[0]] + '</svg></span>' +
        '<div><h3' + (th ? ' lang="th"' : '') + '>' + esc(t[1]) + '</h3><p>' + esc(t[2]) + '</p></div></div>';
    }).join('');
    $$('.sv-t', grid).forEach(function (el) {
      var go = function () { setActive(+el.dataset.i); };
      el.addEventListener('mouseenter', function () { if (fine) go(); });
      el.addEventListener('click', go);
      el.addEventListener('focus', go);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }
  function setActive(i) { if (i === active) return; active = i; $$('.sv-t', grid).forEach(function (el, j) { el.classList.toggle('on', j === i); el.setAttribute('aria-pressed', j === i); el.classList.remove('flip'); }); }
  tiles(false);
  var fbtn = $$('.sv-filter [role="tab"]');
  fbtn.forEach(function (b, i) {
    b.addEventListener('click', function () { if (b.dataset.set === setKey) return; fbtn.forEach(function (x) { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; }); setKey = b.dataset.set; active = 0; tiles(!reduce); });
    b.addEventListener('keydown', function (e) { var d = /Arrow(Down|Right)/.test(e.key) ? 1 : /Arrow(Up|Left)/.test(e.key) ? -1 : 0; if (!d) return; e.preventDefault(); var n = fbtn[(i + d + fbtn.length) % fbtn.length]; n.focus(); n.click(); });
    b.tabIndex = i ? -1 : 0;
  });

  /* ---------- story carousel ---------- */
  var STORY = [
    ['2563', 'ก่อนปี 2563', 'ทีมที่สะสมประสบการณ์มากว่า 10 ปี', 'ทีมหลักทำงานด้านการตลาดดิจิทัล กราฟิก และโฆษณามากว่า 10 ปี และพัฒนาเว็บไซต์และระบบมากกว่า 6 ปี ก่อนรวมตัวเป็นบริษัท', 'FOUNDATION', 'a', 'story-team.webp', 'ทีม BlackCat ภาพประกอบจากเว็บไซต์บริษัท', 1],
    ['2563', '22 พ.ค. 2563', 'จดทะเบียนบริษัทที่เชียงใหม่', 'ก่อตั้ง บริษัท แบล็คแคท เอเจนซี่ จำกัด เริ่มจากงานที่ปรึกษาประชาสัมพันธ์และกิจกรรมทางการตลาด', 'FOUNDATION', 'b', 'story-found.webp', 'โลโก้ BlackCat Agency', 1],
    ['2564', '2564 – 2567', 'ขยายเป็น Full-Service Digital Agency', 'รวมทีมพัฒนาเว็บและแอป ผู้เชี่ยวชาญ SEO และทีมโปรดักชันไว้ในบ้าน และย้ายสำนักงานมาโครงการฟิฟธ์อเวนิว อ.สันทราย', 'GROWTH', 'c', 'story-full.jpg', 'ตัวอย่างคอนเทนต์ Marketing Funnel ของ BlackCat', 0],
    ['2566', 'ม.ค. – มี.ค. 2566', 'Smart Content for Sustainable', 'วิทยากรโครงการ Smart Greenhouse ของศูนย์วิทยาศาสตร์ฮาลาล จุฬาฯ อบรมเกษตรกร 4 จังหวัดภาคเหนือ 10 รุ่น รวมกว่า 600 คน', 'KNOWLEDGE', 'd', 'story-halal.jpg', 'ภาพหมู่ผู้เข้าอบรมโครงการ Halal Smart Farm', 0],
    ['2568', '27 ส.ค. 2568', 'จับมือถือ = จับโอกาส', 'ทีมวิทยากรบรรยายเทคนิคสร้างรายได้ผ่านโซเชียลมีเดียและคอนเทนต์ขายของออนไลน์ ที่มหาวิทยาลัยราชภัฏเชียงใหม่ ศูนย์แม่ริม', 'KNOWLEDGE', 'e', 'story-cmru.jpg', 'ทีมวิทยากรบรรยายบนเวที มหาวิทยาลัยราชภัฏเชียงใหม่', 0],
    ['2568', '4 ต.ค. 2568', 'ถ่ายทอดงานออกแบบกราฟิก', 'นักออกแบบกราฟิกของทีมเป็นวิทยากรให้ความรู้ด้านการออกแบบ ที่วิทยาลัยอาชีวศึกษาแพร่', 'KNOWLEDGE', 'f', 'story-pvc.jpg', 'วิทยากรบรรยาย Illustration for Beginner ที่วิทยาลัยอาชีวศึกษาแพร่', 0],
    ['2568', 'พ.ย. 2568', 'Chiang Mai Youth Hackathon', 'ได้รับคัดเลือกให้จัดการแข่งขันเยาวชนร่วมออกแบบเมืองของเทศบาลนครเชียงใหม่', 'CITY PROJECT', 'g', 'story-idea.webp', 'ภาพประกอบหลอดไฟ แทนไอเดียของเยาวชน', 1],
    ['2568', '2568', 'Digital Content ให้ สรพ.', 'ผู้รับจ้างจัดทำการสื่อสารออนไลน์ให้สถาบันรับรองคุณภาพสถานพยาบาล (องค์การมหาชน)', 'PUBLIC SECTOR', 'h', 'story-content.jpg', 'ตัวอย่างคอนเทนต์วิดีโอของ BlackCat', 0],
    ['2568', '2 ธ.ค. 2568', 'City Branding ในยุค AI', 'บรรยายหัวข้อ Communication Strategy และการสร้างแบรนด์ของเมือง ในหลักสูตรผู้นำเมืองอัจฉริยะยุค AI', 'KNOWLEDGE', 'i', 'story-brand.jpg', 'ตัวอย่างคอนเทนต์สร้างเอกลักษณ์ให้แบรนด์ของ BlackCat', 0]
  ];
  function art(k, plain) {
    var bg = { a: '#E8862A', b: '#FCEBDC', c: '#F4F4F4', d: '#FCEBDC', e: '#111', f: '#E8862A', g: '#111', h: '#111', i: '#FCEBDC' }[k];
    var fg = (bg === '#111') ? '#E8862A' : '#111', ln = (bg === '#111') ? '#fff' : '#111';
    var s = '<svg viewBox="0 0 400 240" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><rect width="400" height="240" fill="' + bg + '"/>';
    s += '<g fill="none" stroke="' + ln + '" stroke-opacity=".18">'; for (var x = 20; x < 400; x += 40) s += '<path d="M' + x + ' 0V240"/>'; for (var y = 20; y < 240; y += 40) s += '<path d="M0 ' + y + 'H400"/>'; s += '</g>';
    var shapes = {
      a: '<circle cx="290" cy="120" r="80" fill="#111"/><rect x="60" y="60" width="110" height="110" fill="#fff" stroke="#111" stroke-width="3"/><path d="M60 170l55-55 55 55" fill="#E8862A" stroke="#111" stroke-width="3"/>',
      b: '<rect x="140" y="50" width="120" height="140" rx="10" fill="#fff" stroke="#E8862A" stroke-width="4"/><path d="M165 90h70M165 115h70M165 140h45" stroke="#111" stroke-width="5"/><circle cx="245" cy="170" r="22" fill="#E8862A"/>',
      c: '<rect x="70" y="80" width="90" height="90" fill="#E8862A" stroke="#111" stroke-width="3"/><rect x="170" y="50" width="90" height="120" fill="#111"/><rect x="270" y="100" width="70" height="70" fill="#fff" stroke="#111" stroke-width="3"/><path d="M40 170h330" stroke="#111" stroke-width="4"/>',
      d: '<path d="M120 190c0-60 40-100 80-110 40 10 80 50 80 110z" fill="#E8862A" stroke="#111" stroke-width="3"/><path d="M200 80v110M200 130c-20-10-35-25-40-45M200 150c20-10 35-25 40-45" stroke="#111" stroke-width="4" fill="none"/>',
      e: '<rect x="160" y="40" width="80" height="160" rx="14" fill="#fff" stroke="#E8862A" stroke-width="4"/><circle cx="200" cy="120" r="24" fill="#E8862A"/><path d="M192 108l18 12-18 12z" fill="#111"/>',
      f: '<path d="M90 190l20-60 120-120 40 40-120 120z" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="300" cy="170" r="40" fill="#111"/><circle cx="300" cy="170" r="14" fill="#E8862A"/>',
      g: '<path d="M60 190V110l50-30 50 30v80M180 190V70l60-30 60 30v120" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="330" cy="80" r="26" fill="#E8862A" stroke="#111" stroke-width="3"/><path d="M40 190h330" stroke="#111" stroke-width="4"/>',
      h: '<rect x="110" y="60" width="180" height="120" rx="10" fill="#fff" stroke="#E8862A" stroke-width="4"/><path d="M200 90v60M170 120h60" stroke="#E8862A" stroke-width="12"/>',
      i: '<circle cx="200" cy="120" r="80" fill="none" stroke="#111" stroke-width="3"/><circle cx="200" cy="120" r="48" fill="#E8862A" stroke="#111" stroke-width="3"/><path d="M200 40v160M120 120h160" stroke="#111" stroke-width="3" stroke-dasharray="6 6"/>'
    }[k];
    return s + (plain ? '' : shapes) + '</svg>';
  }
  var track = $('#st-track'), cur = $('#st-cur'), prog = $('#st-prog'), tot = $('#st-tot');
  track.innerHTML = STORY.map(function (s, i) {
    return '<article class="st-card' + (i ? '' : ' on') + '" data-i="' + i + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' จาก ' + STORY.length + ': ' + esc(s[2]) + '">' +
      '<div class="st-art' + (s[6] ? (s[8] ? ' cut' : ' pic') : '') + '">' + (s[6] ? art(s[5], s[8]) + '<img src="assets/img/blackcat/' + s[6] + '" alt="' + esc(s[7]) + '" loading="lazy" decoding="async">' : art(s[5])) + '</div><div class="st-body"><span class="st-date"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>' + esc(s[1]) + '</span>' +
      '<h3>' + esc(s[2]) + '</h3><p>' + esc(s[3]) + '</p><span class="st-tag">' + esc(s[4]) + '</span></div></article>';
  }).join('');
  tot.textContent = ('0' + STORY.length).slice(-2);
  var cards = $$('.st-card', track), si = 0;
  function pad(n) { return ('0' + n).slice(-2); }
  function setStory(i, scroll) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    if (i !== si) { cur.textContent = pad(i + 1); cur.classList.remove('flip'); void cur.offsetWidth; cur.classList.add('flip'); }
    si = i; cards.forEach(function (c, j) { c.classList.toggle('on', j === i); });
    prog.style.width = ((i + 1) / cards.length * 100) + '%';
    $('#st-prev').disabled = i === 0; $('#st-next').disabled = i === cards.length - 1;
    if (scroll) { var target = cards[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft); track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' }); }
  }
  setStory(0, false);
  $('#st-prev').addEventListener('click', function () { setStory(si - 1, true); });
  $('#st-next').addEventListener('click', function () { setStory(si + 1, true); });
  cards.forEach(function (c, i) { c.addEventListener('click', function () { if (!moved) setStory(i, true); }); });
  var stT; track.addEventListener('scroll', function () {
    clearTimeout(stT); stT = setTimeout(function () {
      var pl = parseFloat(getComputedStyle(track).paddingLeft), x = track.scrollLeft + pl, best = 0, bd = 1e9;
      cards.forEach(function (c, j) { var d = Math.abs(c.offsetLeft - x); if (d < bd) { bd = d; best = j; } });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = cards.length - 1;
      if (best !== si) setStory(best, false);
    }, 90);
  }, { passive: true });
  track.addEventListener('keydown', function (e) { if (e.target !== track) return; if (e.key === 'ArrowRight') { e.preventDefault(); setStory(si + 1, true); } if (e.key === 'ArrowLeft') { e.preventDefault(); setStory(si - 1, true); } });
  var dx = null, sl = 0, moved = false, vel = 0, lastX = 0, lastT = 0;
  track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dx = lastX = e.clientX; sl = track.scrollLeft; moved = false; lastT = performance.now(); track.classList.add('drag'); });
  window.addEventListener('pointermove', function (e) { if (dx == null) return; var m = e.clientX - dx; if (Math.abs(m) > 5) moved = true; track.scrollLeft = sl - m; var now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now; });
  window.addEventListener('pointerup', function () {
    if (dx == null) return; dx = null; track.classList.remove('drag');
    if (!reduce && Math.abs(vel) > .2) { var v = vel * 16; (function inertia() { track.scrollLeft -= v; v *= .92; if (Math.abs(v) > .5) requestAnimationFrame(inertia); })(); }
    setTimeout(function () { moved = false; }, 50);
  });

  /* ---------- recent work ---------- */
  var WORK = [
    ['ais', 'mkt', 'AIS 5G', 'Influencer review'], ['rim', 'web', 'Rimping', 'Rimping Application'], ['banpu', 'content', 'Banpu', 'Poster & Social Media Design'],
    ['kb', 'mkt', 'K+', 'Event Production'], ['airp', 'web', 'Airport Film', 'Web Design'], ['egat', 'content', 'กฟผ.', 'Social Media Advertising Design'],
    ['tc', 'mkt', 'Tencent Cloud', 'Event Production'], ['tons', 'web', 'Tonsilp', 'Web Design'], ['camt', 'content', 'CAMT มช.', 'Social Media Knowledge Banner'],
    ['nde', 'mkt', 'Northern Digital Economy', 'Event Production'], ['fm', 'mkt', 'Fresh & Mild', 'Influencer review'], ['arv', 'mkt', 'AI and Robotics Ventures', 'Event Production']
  ];
  var CAT = { mkt: 'MARKETING', web: 'WEB DESIGN', content: 'CONTENT' };
  var wg = $('#wk-grid');
  function works(f) {
    wg.innerHTML = WORK.filter(function (w) { return f === 'all' || w[1] === f; }).map(function (w, k) {
      return '<li style="--k:' + k + '"><a href="https://blackcatagency.co/recent_work/" target="_blank" rel="noopener"><div class="im"><img src="assets/img/blackcat/work-' + w[0] + '.jpg" alt="ผลงาน ' + esc(w[2]) + ': ' + esc(w[3]) + '" width="800" height="450" loading="lazy"></div><div class="cap"><b>' + esc(w[2]) + '</b><span>' + esc(w[3]) + '</span><em>' + CAT[w[1]] + '</em></div></a></li>';
    }).join('');
  }
  works('all');
  var wt = $$('.wk-tabs [role="tab"]');
  wt.forEach(function (b, i) {
    b.addEventListener('click', function () { wt.forEach(function (x) { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; }); works(b.dataset.f); });
    b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); var n = wt[(i + d + wt.length) % wt.length]; n.focus(); n.click(); });
    b.tabIndex = i ? -1 : 0;
  });
  var CL = [['ais', 'AIS 5G'], ['kplus', 'K+'], ['ptt', 'PTT'], ['uni', 'Unilever'], ['rim', 'Rimping'], ['tiktok', 'TikTok'], ['cmu', 'มหาวิทยาลัยเชียงใหม่'], ['mju', 'มหาวิทยาลัยแม่โจ้'], ['tc', 'Tencent Cloud'], ['banpu', 'Banpu'], ['arv', 'AI and Robotics Ventures'], ['egat', 'กฟผ.'], ['nde', 'Northern Digital Economy'], ['camt', 'CAMT มช.'], ['payap', 'มหาวิทยาลัยพายัพ'], ['halal', 'ศูนย์วิทยาศาสตร์ฮาลาล จุฬาฯ'], ['fm', 'Fresh & Mild'], ['cc', 'หอการค้าจังหวัดเชียงใหม่']];
  var row = CL.map(function (c, i) { return '<img src="assets/img/blackcat/client-' + c[0] + '.webp" alt="' + esc(c[1]) + '">'; }).join('');
  var dup = row.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"');
  /* each half = 2 sets so the -50% loop never shows an empty tail on wide screens */
  $('#cl-row').innerHTML = row + dup + dup + dup;

  /* ---------- scroll reveals (once) ---------- */
  var watch = $$('.bk-h2, .bk-mlab, .bk-rv, .bk-feat, .bk-svc, .bk-about, .ab-stats');
  function countUp(el) { var to = +el.dataset.to, suf = el.dataset.suf || ''; if (reduce) { el.textContent = to + suf; return; } var t0 = performance.now(); (function f(n) { var k = Math.min(1, (n - t0) / 1200), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + (k === 1 ? suf : ''); if (k < 1) requestAnimationFrame(f); })(t0); }
  function show(el) { el.classList.add('in'); if (el.classList.contains('ab-stats')) $$('[data-to]', el).forEach(countUp); }
  if (reduce || !('IntersectionObserver' in window)) watch.forEach(show);
  else {
    var io = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }); }, { threshold: .25 });
    watch.forEach(function (el) { io.observe(el); });
  }

  /* ---------- cursor ---------- */
  var cu = $('.bk-cursor');
  if (cu && fine && !reduce) {
    var dot = cu.firstElementChild;
    document.addEventListener('mousemove', function (e) {
      if (!root.contains(e.target) || root.classList.contains('menu-open')) { cu.classList.remove('on'); return; }
      cu.classList.add('on'); cu.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      var z = e.target.closest('[data-cursor]'); cu.classList.toggle('big', !!z); dot.textContent = z ? z.dataset.cursor : '';
    });
    document.addEventListener('mouseleave', function () { cu.classList.remove('on'); });
  }
})();
