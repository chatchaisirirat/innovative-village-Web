# Innovative Village — Website

เว็บไซต์ static (HTML/CSS/JS ล้วน) สร้างจาก Design "Innovative Village Website" ครบ 9 หน้า

## โครงสร้าง
- `dist/` — เว็บที่พร้อมขึ้นโฮสต์ (อัปโหลดทั้งโฟลเดอร์ไปที่ Netlify / Vercel / GitHub Pages / hosting ทั่วไปได้เลย)
- `src/pages/*.html` — เนื้อหาแต่ละหน้า (แก้ที่นี่)
- `src/assets/` — CSS, JS, รูป
- `src/build.py` — รวม Header/Footer เข้ากับทุกหน้า แล้วสร้าง `dist/` ใหม่: `python3 src/build.py`

## หน้า
index (หน้าแรก) · spaces · digital-twin · booking · partner · interns · activities · about · contact

## ระบบที่ใช้งานได้แล้ว
- จองห้องประชุม 3 ขั้น (เลือกห้อง → วัน/เวลา → ยืนยัน) และนัดดูออฟฟิศ (ข้อมูล → วัน/เวลา → ทีมติดต่อกลับ)
- Digital Twin: กดวงกลมบนผัง / ปุ่มยูนิต / ฟิลเตอร์ตามประเภท → ปุ่มต่อไปหน้าจอง/นัดดู/Partner
- สมัครฝึกงาน: ฟอร์ม → แบบสอบถามวัดลอจิก (รอเนื้อหา) → ส่งให้ทีมบริหาร
- ปฏิทินกิจกรรม AI (เลื่อนเดือน, ใส่กิจกรรมใน `assets/js/activities.js` → EVENTS)
- ฟอร์มติดต่อ / นัดชมพื้นที่
- ลิงก์ส่งต่อค่า: เช่น `booking.html?tab=meeting&room=M`, `booking.html?tab=visit&size=L`, `digital-twin.html?unit=C5&filter=tenant`, `contact.html?topic=partner`

## ยังต้องต่อ backend
ทุกฟอร์มส่งผ่าน `IV.submit()` ใน `assets/js/site.js` ตอนนี้บันทึกไว้ในเบราว์เซอร์เท่านั้น
ใส่ URL ของ API ที่ตัวแปร `ENDPOINT` แล้วให้ backend แจ้งทีม IV ทาง LINE + Email ตาม flow ในดีไซน์
