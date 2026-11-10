/* Jobs newsletter pages. Two forms, both posted to the ol-site-forms endpoint (CONFIG.formEndpoint):
   - #jnSignupForm (jobs-newsletter.html): emailed to hello@ AND added to Kit, tagged "jobs-newsletter"
     (add that key to KitTagIds in infra/ol-site-forms.yaml; unknown tags fall back to "general").
   - #jnSubmitForm (submit-a-job.html): emailed to hello@ only. No _subscribe flag, so the person
     submitting a job is NOT added to Kit. */
(function(){
  "use strict";
  var CONFIG = window.OL_CONFIG || {};
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function isUrl(s){
    try { var u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); return /\./.test(u.hostname); } catch (e) { return false; }
  }

  /* Wires one form. cfg: {form, fields:[{id, label, required, type}], build(values)->{subject,payload,mailBody}, onSuccess()} */
  function wire(cfg){
    var form = document.getElementById(cfg.form);
    if (!form) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    var errBox = form.querySelector('.form-error');
    var errCta = errBox && errBox.querySelector('a');

    cfg.fields.forEach(function(f){
      var el = document.getElementById(f.id);
      if (el) el.addEventListener('input', function(){ if (el.getAttribute('aria-invalid')) clearErr(el); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var firstBad = null, values = {};
      cfg.fields.forEach(function(f){
        var el = document.getElementById(f.id), v = el.value.trim();
        values[f.id] = v;
        var msg = '';
        if (f.required && !v) msg = f.type === 'email' ? 'Email is required.' : (f.type === 'url' ? 'Please add a link to the posting.' : 'Please fill this in.');
        else if (v && f.type === 'email' && !EMAIL_RE.test(v)) msg = 'Enter a valid email address.';
        else if (v && f.type === 'url' && !isUrl(v)) msg = 'Enter a valid link, like https://example.org/jobs/123.';
        if (msg) { setErr(el, msg); if (!firstBad) firstBad = el; } else clearErr(el);
      });
      if (firstBad) { firstBad.focus(); return; }

      var built = cfg.build(values);
      built.payload._gotcha = document.getElementById(cfg.honeypot).value;

      function fail(){
        submitBtn.disabled = false;
        if (errCta) errCta.setAttribute('href', 'mailto:' + (CONFIG.contactEmail || 'hello@optimisticlabs.com') +
          '?subject=' + encodeURIComponent(built.subject) + '&body=' + encodeURIComponent(built.mailBody));
        if (errBox) errBox.classList.add('show');
      }
      if (errBox) errBox.classList.remove('show');
      submitBtn.disabled = true;
      if (!CONFIG.formEndpoint) { fail(); return; }
      fetch(CONFIG.formEndpoint, {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(built.payload)})
        .then(function(res){
          if (!res.ok) { fail(); return; }
          form.style.display = 'none';
          var head = document.getElementById(cfg.head); if (head) head.style.display = 'none';
          if (cfg.echoEmail) { var t = document.getElementById(cfg.echoEmail); if (t) t.textContent = values[cfg.emailField]; }
          var done = document.getElementById(cfg.done);
          done.classList.add('show'); done.focus();
        })
        .catch(fail);
    });
  }

  /* ---- newsletter signup ---- */
  wire({
    form: 'jnSignupForm', honeypot: 'jn-hp', head: 'jnCardHead', done: 'jnDone',
    echoEmail: 'jnDoneEmail', emailField: 'jn-email',
    fields: [
      {id: 'jn-name', required: true},
      {id: 'jn-email', required: true, type: 'email'}
    ],
    build: function(v){
      var subject = 'Jobs newsletter signup';
      return {
        subject: subject,
        mailBody: 'Name: ' + v['jn-name'] + '\nEmail: ' + v['jn-email'] + '\n\nPlease add me to the jobs newsletter.',
        payload: {
          _subject: subject,
          Name: v['jn-name'], Email: v['jn-email'], Source: 'Jobs newsletter (leaving politics)',
          _interest: 'jobs-newsletter', _subscribe: 'yes'
        }
      };
    }
  });

  /* ---- submit a job ---- */
  wire({
    form: 'jnSubmitForm', honeypot: 'sj-hp', head: 'sjCardHead', done: 'sjDone',
    fields: [
      {id: 'sj-title', required: true},
      {id: 'sj-org', required: true},
      {id: 'sj-link', required: true, type: 'url'},
      {id: 'sj-location'},
      {id: 'sj-note'},
      {id: 'sj-name', required: true},
      {id: 'sj-email', required: true, type: 'email'}
    ],
    build: function(v){
      var subject = 'Job submission · ' + v['sj-title'] + ' at ' + v['sj-org'];
      return {
        subject: subject,
        mailBody: 'Job title: ' + v['sj-title'] + '\nOrganization: ' + v['sj-org'] + '\nLink: ' + v['sj-link'] +
          '\nLocation: ' + (v['sj-location'] || '(blank)') + '\nNotes: ' + (v['sj-note'] || '(blank)') +
          '\n\nSubmitted by: ' + v['sj-name'] + ' <' + v['sj-email'] + '>',
        payload: {
          _subject: subject,
          'Job title': v['sj-title'], Organization: v['sj-org'], 'Link to posting': v['sj-link'],
          'Location / remote': v['sj-location'] || '(blank)', 'Notes for the newsletter': v['sj-note'] || '(blank)',
          Name: v['sj-name'], Email: v['sj-email'], Source: 'Jobs newsletter: job submission'
          /* deliberately no _subscribe: submitters are not added to Kit */
        }
      };
    }
  });
})();
