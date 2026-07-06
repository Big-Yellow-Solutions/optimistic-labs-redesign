/* ============================================================
   OPTIMISTIC LABS · shared site behaviour
   CONFIG · booking/link wiring · mobile nav · scroll reveal · forms
   ============================================================ */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- single source of truth for destinations ---- */
  var CONFIG = {
    bookingUrl:   '',                                   // TODO Liz: Calendly/SavvyCal link. Empty = mailto fallback.
    faithUrl:     'faith-lab.html',
    leaderUrl:    'become-a-lab-leader.html',
    formEndpoint: '',                                   // Formspree etc. for newsletter + contact. Empty = mailto.
    contactEmail: 'hello@optimisticlabs.com',
    linkedInUrl:  'https://www.linkedin.com/company/optimistic-labs/'
  };
  window.OL_CONFIG = CONFIG;
  var bookHref = CONFIG.bookingUrl || ('mailto:' + CONFIG.contactEmail + '?subject=' + encodeURIComponent('Book a call · Optimistic Labs'));

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  ready(function(){
    /* ---- wire destinations ---- */
    document.querySelectorAll('[data-book]').forEach(function(el){
      el.setAttribute('href', bookHref);
      if(CONFIG.bookingUrl){ el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
    });
    document.querySelectorAll('[data-href="faith"]').forEach(function(el){ el.setAttribute('href', CONFIG.faithUrl); });
    document.querySelectorAll('[data-href="leader"]').forEach(function(el){ el.setAttribute('href', CONFIG.leaderUrl); });
    document.querySelectorAll('#linkedInLink,[data-href="linkedin"]').forEach(function(el){
      el.setAttribute('href', CONFIG.linkedInUrl); el.setAttribute('target','_blank'); el.setAttribute('rel','noopener');
    });

    /* ---- mobile nav ---- */
    var burger=document.getElementById('burger'), sheet=document.getElementById('sheet'), sheetX=document.getElementById('sheetX');
    function closeSheet(){ if(!sheet) return; sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); if(burger){burger.setAttribute('aria-expanded','false');burger.focus();} }
    if(burger&&sheet){
      burger.addEventListener('click',function(){
        var open=sheet.classList.toggle('open'); sheet.setAttribute('aria-hidden',!open); burger.setAttribute('aria-expanded',open);
        if(open){ var f=sheet.querySelector('a'); if(f) f.focus(); }
      });
      if(sheetX) sheetX.addEventListener('click',closeSheet);
      sheet.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',closeSheet); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&sheet.classList.contains('open')) closeSheet(); });
    }

    /* ---- scroll reveal ---- */
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
      },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    }

    /* ---- forms (newsletter + contact): validate + mailto/endpoint submit ---- */
    var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function setErr(input,msg){
      input.setAttribute('aria-invalid','true');
      var err=input.parentNode.querySelector('.field-err');
      if(!err){ err=document.createElement('span'); err.className='field-err'; err.setAttribute('role','alert'); input.parentNode.appendChild(err); }
      err.textContent=msg;
    }
    function clearErr(input){ input.removeAttribute('aria-invalid'); var e=input.parentNode.querySelector('.field-err'); if(e) e.textContent=''; }
    function flashBtn(btn){ if(!btn) return; btn.disabled=true; setTimeout(function(){btn.disabled=false;},900); }
    function deliver(payload,subject,done){
      if(CONFIG.formEndpoint){
        fetch(CONFIG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)})
          .then(function(){done();}).catch(function(){done();});
      } else {
        var lines=[]; for(var k in payload){ if(payload[k]) lines.push(k+': '+payload[k]); }
        window.location.href='mailto:'+CONFIG.contactEmail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
        done();
      }
    }

    var newsForm=document.getElementById('newsForm');
    if(newsForm){
      var newsEmail=newsForm.querySelector('input[type=email]'), newsNote=document.getElementById('newsNote');
      newsEmail.addEventListener('input',function(){ if(newsEmail.getAttribute('aria-invalid')) clearErr(newsEmail); });
      newsForm.addEventListener('submit',function(e){
        e.preventDefault();
        var v=(newsEmail.value||'').trim();
        if(!EMAIL_RE.test(v)){ setErr(newsEmail,v?'Enter a valid email address.':'Email is required.'); newsEmail.focus(); return; }
        clearErr(newsEmail); flashBtn(newsForm.querySelector('button'));
        deliver({Email:v,Source:'Newsletter signup'},'Newsletter signup · Optimistic Labs',function(){
          if(newsNote) newsNote.classList.add('show'); newsEmail.value='';
        });
      });
    }

    var contactForm=document.getElementById('contactForm');
    if(contactForm){
      var formNote=document.getElementById('formNote');
      var cf={name:document.getElementById('cf-name'),email:document.getElementById('cf-email'),message:document.getElementById('cf-message')};
      Object.keys(cf).forEach(function(k){ if(cf[k]) cf[k].addEventListener('input',function(){ if(cf[k].getAttribute('aria-invalid')) clearErr(cf[k]); }); });
      contactForm.addEventListener('submit',function(e){
        e.preventDefault();
        var firstBad=null;
        function check(input,ok,msg){ if(!input) return; if(!ok){ setErr(input,msg); if(!firstBad)firstBad=input; } else clearErr(input); }
        check(cf.name, cf.name.value.trim().length>0, 'Please add your name.');
        check(cf.email, EMAIL_RE.test((cf.email.value||'').trim()), cf.email.value.trim()?'Enter a valid email address.':'Email is required.');
        check(cf.message, cf.message.value.trim().length>0, 'Tell us a little about what you’re building.');
        if(firstBad){ firstBad.focus(); return; }
        flashBtn(contactForm.querySelector('button[type=submit]'));
        var payload={Name:cf.name.value.trim(),Email:cf.email.value.trim(),Message:cf.message.value.trim()};
        deliver(payload,'New inquiry · Optimistic Labs',function(){
          if(formNote) formNote.classList.add('show');
          cf.name.value=cf.email.value=cf.message.value='';
        });
      });
    }
  });
})();
