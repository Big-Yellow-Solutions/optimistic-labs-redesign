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
    /* ---- lab leader & team roster (data-driven) ---- */
    function escHtml(s){
      return String(s==null?'':s).replace(/[&<>"']/g,function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }
    document.querySelectorAll('[data-lab-team]').forEach(function(root){
      var cfgEl = root.querySelector('script[data-lab-team-config]');
      if(!cfgEl) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch(e){ return; }
      var L = cfg.leader || {};
      var statsHtml = (L.stats||[]).map(function(s){
        return '<div class="leader-stat"><div class="leader-stat-value">'+escHtml(s.value)+'</div>'+
          '<div class="leader-stat-label">'+escHtml(s.label)+'</div></div>';
      }).join('');
      function personCard(p){
        if(!p) return '';
        return '<div class="mosaic-card">'+
          '<div class="mosaic-photo"><img src="'+escHtml(p.photo)+'" alt="'+escHtml(p.name)+'" /></div>'+
          '<div class="mosaic-card-body">'+
            '<span class="roster-name">'+escHtml(p.name)+'</span>'+
            '<span class="roster-role">'+escHtml(p.role)+'</span>'+
            '<p class="roster-bio">'+escHtml(p.bio)+'</p>'+
          '</div>'+
        '</div>';
      }
      var team = cfg.team || [];
      var pillsHtml = (cfg.pills||[]).map(function(t){ return '<span class="roster-pill">'+escHtml(t)+'</span>'; }).join('');
      var networkHtml =
        '<div class="mosaic-network"><div class="roster-footer-label">'+
        escHtml(cfg.networkLabel||'+ a network of fractional executives and SMEs')+'</div>'+
        '<div class="roster-pills">'+pillsHtml+'</div></div>';
      root.innerHTML =
        '<div class="leader-grid">'+
          '<div class="leader-col">'+
            '<span class="eyebrow"><img class="star" src="assets/star.svg" alt="" />'+escHtml(cfg.leaderKicker||'The Lab Leader')+'</span>'+
            '<div class="leader-photo-lg"><img src="'+escHtml(L.photo)+'" alt="'+escHtml(L.name)+'" /></div>'+
            '<h3 class="leader-name">'+escHtml(L.name)+'</h3>'+
            '<div class="leader-role">'+escHtml(L.role)+'</div>'+
            '<p class="leader-bio">'+escHtml(L.bio)+'</p>'+
            '<div class="leader-stats">'+statsHtml+'</div>'+
            '<a class="pill pill-outline leader-cta" data-book>'+escHtml(L.ctaText||'Book a conversation')+
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '+
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
            '</a>'+
          '</div>'+
          '<div class="roster-col">'+
            '<p class="roster-lead">'+escHtml(cfg.rosterLead||'')+'</p>'+
            '<div class="mosaic-grid">'+
              '<div class="mosaic-col">'+personCard(team[0])+personCard(team[2])+'</div>'+
              '<div class="mosaic-col">'+personCard(team[1])+networkHtml+'</div>'+
            '</div>'+
          '</div>'+
        '</div>';
    });

    /* ---- what-you-get card grid (data-driven) ---- */
    document.querySelectorAll('[data-wyg]').forEach(function(root){
      var cfgEl = root.querySelector('script[data-wyg-config]');
      if(!cfgEl) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch(e){ return; }
      var cardsHtml = (cfg.items||[]).map(function(it){
        return '<div class="wyg-card">'+
          '<img class="wyg-icon" src="'+escHtml(it.icon)+'" alt="" />'+
          '<h3>'+escHtml(it.title)+'</h3>'+
          '<p>'+escHtml(it.body)+'</p>'+
        '</div>';
      }).join('');
      root.innerHTML =
        '<div class="wyg-header">'+
          '<div><span class="eyebrow"><img class="star" src="assets/star.svg" alt="" />'+escHtml(cfg.kicker||'What you get')+'</span>'+
          '<h2 class="h-sec" style="letter-spacing:-0.035em;line-height:1.02;margin:0">'+escHtml(cfg.heading||'')+'</h2></div>'+
          '<p style="margin:0;font-size:17px;line-height:1.6;color:var(--ink-soft)">'+escHtml(cfg.intro||'')+'</p>'+
        '</div>'+
        '<div class="wyg-grid">'+cardsHtml+'</div>';
    });

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

    /* ---- labs nav dropdown ---- */
    document.querySelectorAll('[data-dd]').forEach(function(dd){
      var trigger=dd.querySelector('.nav-dd-trigger'), panel=dd.querySelector('.nav-dd-panel');
      if(!trigger||!panel) return;
      var closeTimer=null, hoverOpened=false;
      function setOpen(open){ dd.classList.toggle('open',open); trigger.setAttribute('aria-expanded',open?'true':'false'); }
      function cancelClose(){ if(closeTimer){ clearTimeout(closeTimer); closeTimer=null; } }
      dd.addEventListener('mouseenter',function(){ cancelClose(); hoverOpened=true; setOpen(true); });
      dd.addEventListener('mouseleave',function(){ cancelClose(); hoverOpened=false; closeTimer=setTimeout(function(){ setOpen(false); },160); });
      trigger.addEventListener('click',function(){
        if(dd.classList.contains('open')&&hoverOpened){ hoverOpened=false; return; } /* hover already opened it; don't toggle shut */
        setOpen(!dd.classList.contains('open'));
      });
      dd.addEventListener('focusout',function(e){ if(!dd.contains(e.relatedTarget)) setOpen(false); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&dd.classList.contains('open')){ setOpen(false); trigger.focus(); } });
      document.addEventListener('click',function(e){ if(!dd.contains(e.target)&&dd.classList.contains('open')) setOpen(false); });
      panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setOpen(false); }); });
    });

    /* ---- scroll reveal ---- */
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
      },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    }

    /* ---- carousels ---- */
    document.querySelectorAll('[data-carousel]').forEach(function(car){
      var track=car.querySelector('.carousel-track'),
          prev=car.querySelector('.car-btn.prev'), next=car.querySelector('.car-btn.next');
      if(!track||!prev||!next) return;
      function step(){
        var item=track.firstElementChild;
        var gap=parseFloat(getComputedStyle(track).columnGap)||24;
        return item?item.getBoundingClientRect().width+gap:track.clientWidth*.8;
      }
      function update(){
        var overflow=track.scrollWidth>track.clientWidth+4;
        prev.style.display=next.style.display=overflow?'':'none';
        prev.disabled=track.scrollLeft<=8;
        next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-8;
      }
      prev.addEventListener('click',function(){ track.scrollBy({left:-step(),behavior:reduceMotion?'auto':'smooth'}); });
      next.addEventListener('click',function(){ track.scrollBy({left:step(),behavior:reduceMotion?'auto':'smooth'}); });
      track.addEventListener('scroll',update,{passive:true});
      window.addEventListener('resize',update);
      update();
    });

    /* ---- coverflow carousel (lab cards) ---- */
    document.querySelectorAll('[data-coverflow]').forEach(function(root){
      var stage=root.querySelector('.coverflow-stage'),
          viewport=root.querySelector('.coverflow-viewport'),
          track=root.querySelector('.carousel-track'),
          prevBtn=root.querySelector('.car-btn.prev'),
          nextBtn=root.querySelector('.car-btn.next'),
          dotsWrap=root.querySelector('.coverflow-dots');
      if(!stage||!viewport||!track) return;

      var originals=Array.prototype.slice.call(track.children);
      var n=originals.length;
      if(!n) return;

      track.innerHTML='';
      var cards=[];
      for(var copy=0;copy<3;copy++){
        originals.forEach(function(orig,i){
          var clone=orig.cloneNode(true);
          clone.setAttribute('data-real-index',i);
          track.appendChild(clone);
          cards.push(clone);
        });
      }

      var index=n; /* start in the middle copy */
      var animating=false;
      var settleTimer=null;
      var autoplayTimer=null;
      var TRANSITION_MS=640;

      var autoplayEnabled=root.getAttribute('data-autoplay')!=='false';
      var intervalMs=parseInt(root.getAttribute('data-interval'),10)||4000;
      var pauseOnHover=root.getAttribute('data-pause-hover')!=='false';

      function cardWidth(){ return cards[0]?cards[0].offsetWidth:0; }
      function gap(){ return parseFloat(getComputedStyle(track).columnGap)||24; }

      function applyTransforms(){
        var w=cardWidth(),g=gap(),step=w+g;
        var translate=viewport.clientWidth/2-(index*step+w/2);
        track.style.transform='translateX('+translate+'px)';
        cards.forEach(function(card,i){
          var dist=Math.abs(i-index), scale, opacity;
          if(dist===0){ scale=1; opacity=1; }
          else if(dist===1){ scale=.84; opacity=.6; }
          else { scale=.7; opacity=.22; }
          card.style.transform='translateY('+(dist===0?-10:0)+'px) scale('+scale+')';
          card.style.opacity=opacity;
          card.classList.toggle('is-focal',dist===0);
          card.setAttribute('aria-hidden',dist===0?'false':'true');
          card.toggleAttribute('inert',dist!==0);
        });
        updateDots();
      }

      function snapInstant(){
        track.style.transition='none';
        cards.forEach(function(c){ c.style.transition='none'; });
        applyTransforms();
        track.offsetHeight; /* force reflow before restoring transitions */
        track.style.transition='';
        cards.forEach(function(c){ c.style.transition=''; });
      }

      function settle(){
        var mod=((index%n)+n)%n, middle=n+mod;
        if(index!==middle){ index=middle; snapInstant(); }
        animating=false;
      }

      function scheduleSettle(){
        clearTimeout(settleTimer);
        settleTimer=setTimeout(settle,TRANSITION_MS);
      }

      function move(delta){
        if(animating) return;
        animating=true;
        index+=delta;
        applyTransforms();
        scheduleSettle();
      }

      function jumpTo(realIndex){
        if(animating) return;
        var candidates=[realIndex,realIndex+n,realIndex+2*n], best=candidates[0], bestDist=Math.abs(best-index);
        candidates.forEach(function(c){ var d=Math.abs(c-index); if(d<bestDist){ best=c; bestDist=d; } });
        animating=true;
        index=best;
        applyTransforms();
        scheduleSettle();
      }

      function updateDots(){
        if(!dotsWrap) return;
        var mod=((index%n)+n)%n;
        Array.prototype.forEach.call(dotsWrap.children,function(b,i){ b.classList.toggle('active',i===mod); });
      }

      function buildDots(){
        if(!dotsWrap) return;
        for(var i=0;i<n;i++){
          var b=document.createElement('button');
          b.type='button';
          b.setAttribute('aria-label','Go to lab '+(i+1));
          b.addEventListener('click',(function(realIdx){ return function(){ jumpTo(realIdx); restartAutoplay(); }; })(i));
          dotsWrap.appendChild(b);
        }
      }

      function startAutoplay(){
        if(!autoplayEnabled||n<2) return;
        clearInterval(autoplayTimer);
        autoplayTimer=setInterval(function(){ move(1); },intervalMs);
      }
      function stopAutoplay(){ clearInterval(autoplayTimer); }
      function restartAutoplay(){ stopAutoplay(); startAutoplay(); }

      cards.forEach(function(card){
        card.addEventListener('click',function(e){
          var dist=Math.abs(cards.indexOf(card)-index);
          if(dist===0) return;
          e.preventDefault();
          jumpTo(parseInt(card.getAttribute('data-real-index'),10));
          restartAutoplay();
        });
      });

      if(prevBtn) prevBtn.addEventListener('click',function(){ move(-1); restartAutoplay(); });
      if(nextBtn) nextBtn.addEventListener('click',function(){ move(1); restartAutoplay(); });

      if(pauseOnHover){
        root.addEventListener('mouseenter',stopAutoplay);
        root.addEventListener('mouseleave',startAutoplay);
      }

      var resizeTimer;
      window.addEventListener('resize',function(){
        clearTimeout(resizeTimer);
        resizeTimer=setTimeout(snapInstant,100);
      });

      buildDots();
      snapInstant();
      startAutoplay();
    });

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
