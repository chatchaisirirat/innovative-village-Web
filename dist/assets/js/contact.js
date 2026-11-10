/* Contact / visit request form */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  var done = document.getElementById('contact-done');
  var topic = document.getElementById('topic');
  var date = document.getElementById('visit-date');

  var t = new Date();
  date.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');

  var q = IV.params.get('topic');
  if (q && topic.querySelector('option[value="' + q + '"]')) topic.value = q;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!IV.validate(form)) return;
    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    var data = IV.values(form);
    data.topicLabel = topic.options[topic.selectedIndex].text;
    IV.submit('contact', data).then(function (r) {
      btn.disabled = false; btn.textContent = 'ส่งข้อความ';
      document.getElementById('contact-ref').textContent = 'หมายเลขเรื่อง: ' + r.id;
      form.hidden = true; done.hidden = false; done.focus();
    });
  });
  document.getElementById('contact-again').addEventListener('click', function () {
    form.reset(); done.hidden = true; form.hidden = false;
    form.querySelector('input').focus();
  });
})();
