#!/usr/bin/env python3
"""Build the Innovative Village static site.

Each page in pages/*.html starts with a JSON comment:
  <!--{"title": "...", "active": "home", "desc": "...", "script": "booking.js"}-->
and contains only the <main> content. This script wraps it with the shared
<head>, header and footer and writes the finished pages to ../dist/.
"""
import json, re, shutil, pathlib

SRC = pathlib.Path(__file__).resolve().parent
DIST = SRC.parent / 'dist'

NAV = [
    ('home', 'หน้าแรก', 'index.html'),
    ('spaces', 'พื้นที่', 'spaces.html'),
    ('twin', 'Digital Twin', 'digital-twin.html'),
    ('partner', 'Partner', 'partner.html'),
    ('interns', 'ฝึกงาน', 'interns.html'),
    ('activities', 'ผลงาน &amp; กิจกรรม', 'activities.html'),
    ('about', 'เกี่ยวกับเรา', 'about.html'),
    ('contact', 'ติดต่อ', 'contact.html'),
]

ROOF = '<svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M1 13 L3 5 L9 1.5 L15 5 L17 13" stroke="#35363a" stroke-width="2.2"></path></svg>'


def header(active):
    links = []
    for key, label, href in NAV:
        cur = ' aria-current="page"' if key == active else ''
        links.append(f'<a href="{href}"{cur}>{label}</a>')
    return f'''<a class="skip" href="#main">ข้ามไปเนื้อหาหลัก</a>
<header class="site-header">
  <div class="topbar">
    <div class="topbar-in">
      <span class="topbar-tag">SOFTWARE PARK · CO-WORKING SPACE · CAFE &amp; MEETING ROOM</span>
      <div class="topbar-links">
        <a href="tel:0947500500">094-750-0500</a>
        <a href="mailto:info@innovativevillage.com">info@innovativevillage.com</a>
        <span class="lang">TH | EN</span>
      </div>
    </div>
  </div>
  <div class="mainbar">
    <a class="brand" href="index.html" aria-label="Innovative Village หน้าแรก"><img src="assets/img/logo.jpg" alt="Innovative Village" width="148" height="52"></a>
    <nav id="main-nav" class="nav" aria-label="เมนูหลัก">
      {''.join(links)}
    </nav>
    <a class="header-cta" href="booking.html">{ROOF}<span class="cta-long">จองห้อง / นัดดูออฟฟิศ</span><span class="cta-short">จอง / นัดดู</span></a>
    <button class="menu-btn" type="button" aria-label="เปิดเมนู" aria-controls="main-nav" aria-expanded="false">
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true"><path d="M1 1h20M1 8h20M1 15h20" stroke="#35363a" stroke-width="2"></path></svg>
    </button>
  </div>
</header>'''


FOOTER = '''<footer class="site-footer">
  <div class="footer-in">
    <div class="footer-grid">
      <div class="footer-col" style="gap:16px">
        <img src="assets/img/logo-footer.jpg" alt="Innovative Village" width="220" height="78" style="width:220px;height:auto;display:block">
        <p style="font-family:var(--font-en);font-weight:600;font-size:13px;letter-spacing:.14em;color:var(--lime)">THE ECOSYSTEM OF INNOVATIVE COMMUNITY</p>
        <p style="font-weight:300;color:var(--gray)">{ ระบบนิเวศของชุมชนคนนักคิด }</p>
      </div>
      <div class="footer-col">
        <h2>CONTACT</h2>
        <p style="font-weight:300">58/4 หมู่ 7 ถ.สมโภชเชียงใหม่ 700 ปี<br>ต.ป่าแดด อ.เมือง จ.เชียงใหม่ 50100</p>
        <a href="tel:0947500500">094-750-0500</a>
        <a href="mailto:info@innovativevillage.com">info@innovativevillage.com</a>
        <a href="https://maps.app.goo.gl/pAtN5U9M9Ka26G7o9" target="_blank" rel="noopener" style="color:var(--lime);text-decoration:underline">เปิดแผนที่ Google Maps</a>
      </div>
      <nav class="footer-col footer-nav" aria-label="แผนผังเว็บไซต์">
        <h2 style="margin-bottom:6px">EXPLORE</h2>
        <a href="spaces.html#office">Office for Rent</a>
        <a href="spaces.html#meeting">Meeting Room</a>
        <a href="spaces.html#cowork">Cowork &amp; Facilities</a>
        <a href="digital-twin.html">Digital Twin</a>
        <a href="partner.html">Partner</a>
        <a href="interns.html">ฝึกงาน</a>
        <a href="activities.html">ผลงาน &amp; กิจกรรม</a>
      </nav>
      <div class="footer-col">
        <h2>FOLLOW</h2>
        <a class="footer-social" href="https://facebook.com/InnovativeVillageCNX" target="_blank" rel="noopener">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bcd732" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M15 8h-2a2 2 0 0 0-2 2v11M9 13h6"></path></svg>
          Facebook: InnovativeVillageCNX
        </a>
        <a class="footer-social" href="https://lin.ee/QlYCKjI" target="_blank" rel="noopener">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bcd732" stroke-width="1.8" aria-hidden="true"><path d="M4 11c0-4 3.6-7 8-7s8 3 8 7-3.6 7-8 7c-.8 0-1.6-.1-2.3-.3L6 19.5l.8-3.2C5.1 15 4 13.1 4 11z"></path></svg>
          LINE Official
        </a>
        <a class="btn btn-lime btn-md" href="booking.html" style="align-self:flex-start;margin-top:8px;color:var(--charcoal);text-decoration:none">จองห้อง / นัดดูออฟฟิศ</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Innovative Village · Chiang Mai</span>
      <span style="font-family:var(--font-en);letter-spacing:.1em">SOFTWARE PARK | CO-WORKING SPACE | CAFE &amp; MEETING ROOM</span>
    </div>
  </div>
</footer>'''


def page(meta, body):
    title = meta['title']
    desc = meta.get('desc', 'Innovative Village — Software Park, Co-working Space, Cafe & Meeting Room ท่ามกลางต้นไม้ในเชียงใหม่')
    scripts = '<script src="assets/js/site.js"></script>'
    if meta.get('script'):
        scripts += f'\n<script src="assets/js/{meta["script"]}"></script>'
    return f'''<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="theme-color" content="#35363a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&amp;family=Raleway:wght@300;400;600;700&amp;display=swap">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
{header(meta['active'])}
<main id="main">
{body.strip()}
</main>
{FOOTER}
{scripts}
</body>
</html>
'''


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / 'assets').mkdir(parents=True)
    shutil.copytree(SRC / 'assets', DIST / 'assets', dirs_exist_ok=True)
    for f in sorted((SRC / 'pages').glob('*.html')):
        raw = f.read_text(encoding='utf-8')
        m = re.match(r'\s*<!--(\{.*?\})-->', raw, re.S)
        meta = json.loads(m.group(1))
        (DIST / f.name).write_text(page(meta, raw[m.end():]), encoding='utf-8')
        print('built', f.name)


if __name__ == '__main__':
    main()
