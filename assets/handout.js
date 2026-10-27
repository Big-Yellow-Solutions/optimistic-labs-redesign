/* Course handout form: validates name + email and posts to the ol-site-forms endpoint.
   The page's <form id="hoForm"> carries data-course (slug) and data-course-label.
   The submission is tagged in Kit as "handout-<slug>" (see KitTagIds in infra/ol-site-forms.yaml). */
(function(){
  "use strict";
  var CONFIG = window.OL_CONFIG || {};
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var form = document.getElementById('hoForm');
  if (!form) return;
  var course = form.getAttribute('data-course'), label = form.getAttribute('data-course-label');
  var nameEl = document.getElementById('ho-name'), emailEl = document.getElementById('ho-email');
  var errBox = document.getElementById('hoError'), errCta = document.getElementById('hoErrorCta');
  var submitBtn = document.getElementById('hoSubmit');

  function setErr(input, msg){
    input.setAttribute('aria-invalid', 'true');
    var err = input.parentNode.querySelector('.field-err');
    if (!err) { err = document.createElement('span'); err.className = 'field-err'; err.setAttribute('role', 'alert'); input.parentNode.appendChild(err); }
    err.textContent = msg;
  }
  function clearErr(input){
    input.removeAttribute('aria-invalid');
    var e = input.parentNode.querySelector('.field-err'); if (e) e.textContent = '';
  }
  [nameEl, emailEl].forEach(function(el){
    el.addEventListener('input', function(){ if (el.getAttribute('aria-invalid')) clearErr(el); });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var firstBad = null;
    function check(input, ok, msg){ if (!ok) { setErr(input, msg); if (!firstBad) firstBad = input; } else clearErr(input); }
    var name = nameEl.value.trim(), email = emailEl.value.trim();
    check(nameEl, name.length > 0, 'Please add your name.');
    check(emailEl, EMAIL_RE.test(email), email ? 'Enter a valid email address.' : 'Email is required.');
    if (firstBad) { firstBad.focus(); return; }

    var subject = 'Handout request · ' + label;
    var payload = {
      _subject: subject,
      Name: name, Email: email, Course: label, Source: 'Course handout page',
      _interest: 'handout-' + course, _subscribe: 'yes',
      _gotcha: document.getElementById('ho-hp').value
    };
    function fail(){
      submitBtn.disabled = false;
      errCta.setAttribute('href', 'mailto:' + (CONFIG.contactEmail || 'hello@optimisticlabs.com') +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nCourse: ' + label));
      errBox.classList.add('show');
    }
    errBox.classList.remove('show');
    submitBtn.disabled = true;
    if (!CONFIG.formEndpoint) { fail(); return; }
    fetch(CONFIG.formEndpoint, {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(payload)})
      .then(function(res){
        if (!res.ok) { fail(); return; }
        form.style.display = 'none';
        var head = document.getElementById('hoCardHead'); if (head) head.style.display = 'none';
        document.getElementById('hoDoneEmail').textContent = email;
        var done = document.getElementById('hoDone');
        done.classList.add('show'); done.focus();
      })
      .catch(fail);
  });
})();
