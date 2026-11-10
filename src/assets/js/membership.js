/* Coworking Member Subscription — plan picker + application form */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* แก้ชื่อ / ราคาแพ็กเกจที่นี่ ให้ตรงกับการ์ดใน membership.html */
  var PLANS = {
    day: { name: 'Day Pass', price: '[—] บาท / วัน' },
    flex: { name: 'Flex 10', price: '[—] บาท / 10 วัน' },
    monthly: { name: 'Monthly', price: '[—] บาท / เดือน' },
    fixed: { name: 'Fixed Desk', price: '[—] บาท / เดือน' }
  };

  var form = $('member-form'), done = $('member-done');
  var plan = $('plan'), start = $('start'), invoice = $('invoice'), invoiceFields = $('invoice-fields');

  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  start.min = iso(new Date());

  function setPlan(key) {
    if (!PLANS[key]) key = '';
    plan.value = key;
    document.querySelectorAll('.plan').forEach(function (c) {
      var on = c.dataset.plan === key;
      c.classList.toggle('selected', on);
      var b = c.querySelector('[data-pick]');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('ps-name').textContent = key ? PLANS[key].name : 'ยังไม่ได้เลือก';
    $('ps-price').textContent = key ? PLANS[key].price : 'เลือกแพ็กเกจจากด้านบน หรือในฟอร์ม';
    var f = plan.closest('.field');
    if (key && f.classList.contains('invalid')) { f.classList.remove('invalid'); f.querySelector('.err').textContent = ''; }
  }

  $('plan-cards').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]');
    if (!b) return;
    setPlan(b.dataset.pick);
    $('apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
    start.focus({ preventScroll: true });
  });
  plan.addEventListener('change', function () { setPlan(plan.value); });

  /* tax invoice fields become required only when ticked */
  function toggleInvoice() {
    invoiceFields.hidden = !invoice.checked;
    invoiceFields.querySelectorAll('input,textarea').forEach(function (el) { el.required = invoice.checked; });
    if (!invoice.checked) invoiceFields.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); f.querySelector('.err').textContent = ''; });
  }
  invoice.addEventListener('change', toggleInvoice);

  $('agree').addEventListener('change', function () {
    var f = this.closest('.field');
    if (this.checked && f.classList.contains('invalid')) { f.classList.remove('invalid'); f.querySelector('.err').textContent = ''; }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!IV.validate(form)) {
      var agree = $('agree');
      if (!agree.checked) agree.closest('.field').querySelector('.err').textContent = 'กรุณายอมรับกติกาการใช้พื้นที่';
      return;
    }
    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    var data = IV.values(form);
    data.planName = PLANS[data.plan].name;
    data.invoice = invoice.checked;
    data.agree = true;
    if (!invoice.checked) { delete data.taxName; delete data.taxId; delete data.taxAddress; }
    IV.submit('cowork-membership', data).then(function (r) {
      btn.disabled = false; btn.textContent = 'ส่งใบสมัคร';
      var d = new Date(data.start + 'T00:00:00');
      $('member-summary').textContent = data.planName + ' · เริ่ม ' + IV.WD[d.getDay()] + ' ' + d.getDate() + ' ' + IV.MO[d.getMonth()] + ' ' + (d.getFullYear() + 543) + (+data.seats > 1 ? ' · ' + data.seats + ' คน' : '');
      $('member-ref').textContent = 'หมายเลขใบสมัคร: ' + r.id;
      form.hidden = true; done.hidden = false; done.focus();
    });
  });

  $('member-again').addEventListener('click', function () {
    form.reset(); toggleInvoice(); setPlan('');
    done.hidden = true; form.hidden = false;
    plan.focus();
  });

  setPlan(IV.params.get('plan') || '');
})();
