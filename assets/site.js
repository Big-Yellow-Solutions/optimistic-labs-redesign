/* ============================================================
   OPTIMISTIC LABS · shared site behaviour
   CONFIG · booking/link wiring · mobile nav · scroll reveal · forms
   ============================================================ */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- single source of truth for destinations ---- */
  var CONFIG = {
    faithUrl:     '/faith-lab',
    leaderUrl:    '/become-a-lab-leader',
    aboutUrl:     '/about',
    labsUrl:      '/#labs',
    applicationFormUrl: '/lab-leader-application',
    formEndpoint: 'https://fwzz6n3qfiudxyvdkex5c2ypsa0weaen.lambda-url.us-east-1.on.aws/', // AWS Lambda + SES (stack ol-site-forms, OL account). Emails submissions to hello@optimisticlabs.com.
    contactEmail: 'hello@optimisticlabs.com',
    linkedInUrl:  'https://www.linkedin.com/company/optimistic-labs/'
  };
  window.OL_CONFIG = CONFIG;
  /* "Connect With Us" CTAs go to the contact form: the homepage's, unless we're
     already on a page (home or About) that has its own local contact form. */
  var thisPage = location.pathname.split('/').pop();
  var onHomeOrAbout = thisPage===''||thisPage==='index.html'||thisPage==='about'||thisPage==='about.html';
  var connectHref = onHomeOrAbout ? '#contact' : '/#contact';

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  ready(function(){
    /* ---- lab leader & team roster (data-driven) ---- */
    function escHtml(s){
      return String(s==null?'':s).replace(/[&<>"']/g,function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }

    /* ---- shared footer: single template, every page just has <footer data-site-footer> ---- */
    document.querySelectorAll('[data-site-footer]').forEach(function(root){
      root.innerHTML =
        '<div class="footer-grid">'+
          '<div class="footer-identity">'+
            '<h2 class="footer-headline">Build momentum. <em>Build community.</em></h2>'+
            '<img class="footer-mark" src="assets/ol-mark-white.svg" alt="Optimistic Labs" />'+
          '</div>'+
          '<div class="footer-groups">'+
            '<div class="footer-group">'+
              '<span class="footer-group-label">Explore</span>'+
              '<a class="footer-explore" href="'+escHtml(CONFIG.labsUrl)+'">Explore the Labs '+
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
              '</a>'+
              '<a href="'+escHtml(CONFIG.leaderUrl)+'">Become a Lab Leader</a>'+
            '</div>'+
            '<div class="footer-group">'+
              '<span class="footer-group-label">Company</span>'+
              '<a href="'+escHtml(CONFIG.aboutUrl)+'">About</a>'+
              '<a href="'+escHtml(CONFIG.linkedInUrl)+'" target="_blank" rel="noopener">LinkedIn</a>'+
              '<a class="footer-cta" data-book>Connect With Us '+
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
              '</a>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="footer-bottom">'+
          '<span class="footer-copyright">© 2026 Optimistic Labs</span>'+
          '<div class="footer-legal">'+
            '<a href="/privacy">Privacy Policy</a>'+
            '<a href="/terms">Terms of Use</a>'+
            '<span class="footer-loc">Built with <span class="footer-heart">♥</span> from Atlanta, GA and Syracuse, NY</span>'+
          '</div>'+
        '</div>';
    });
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
      function personCard(p,idx){
        if(!p) return '';
        if(p.wanted){
          return '<a class="mosaic-card mosaic-card--wanted" data-idx="'+idx+'" href="'+escHtml(p.href||CONFIG.applicationFormUrl)+'">'+
            '<div class="mosaic-photo">'+
              '<span class="chip mosaic-chip">'+escHtml(p.chip||'Wanted')+'</span>'+
              '<span class="mosaic-plus"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '+
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span>'+
            '</div>'+
            '<div class="mosaic-card-body">'+
              '<span class="roster-name">'+escHtml(p.title||'')+'</span>'+
              '<p class="roster-bio">'+escHtml(p.blurb||'')+'</p>'+
              '<span class="mosaic-card-link">'+escHtml(p.ctaText||'Apply')+' '+
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '+
                'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
              '</span>'+
            '</div>'+
          '</a>';
        }
        return '<div class="mosaic-card" data-idx="'+idx+'">'+
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
            '<a class="pill pill-outline leader-cta" data-book>'+escHtml(L.ctaText||'Connect With Us')+
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '+
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
            '</a>'+
          '</div>'+
          '<div class="roster-col">'+
            '<p class="roster-lead">'+escHtml(cfg.rosterLead||'')+'</p>'+
            '<div class="mosaic-grid">'+
              '<div class="mosaic-col">'+personCard(team[0],0)+personCard(team[2],2)+'</div>'+
              '<div class="mosaic-col">'+personCard(team[1],1)+networkHtml+'</div>'+
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

    /* ---- lab leaders recruiting grid (data-driven) ---- */
    document.querySelectorAll('[data-lab-leaders]').forEach(function(root){
      var cfgEl = root.querySelector('script[data-lab-leaders-config]');
      var grid = root.querySelector('[data-lab-leaders-grid]');
      if(!cfgEl || !grid) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch(e){ return; }
      var arrow = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '+
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      var labsHtml = (cfg.labs||[]).map(function(lab){
        return '<a class="ll-card" href="'+escHtml(lab.applyUrl||CONFIG.applicationFormUrl)+'">'+
          '<div class="ll-card-img"><img src="'+escHtml(lab.imageUrl)+'" alt="'+escHtml(lab.title)+'" /></div>'+
          '<div class="ll-card-body">'+
            '<div class="ll-card-title">'+escHtml(lab.title)+'</div>'+
            '<span class="ll-card-link">Apply to lead this lab '+arrow+'</span>'+
          '</div>'+
        '</a>';
      }).join('');
      var ctaHtml =
        '<a class="ll-card ll-card--cta" href="'+escHtml(CONFIG.applicationFormUrl)+'">'+
          '<div class="ll-card-badge"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" '+
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></div>'+
          '<div class="ll-card-body">'+
            '<div class="ll-card-title">Design your own lab</div>'+
            '<span class="ll-card-link">Apply to lead this lab '+arrow+'</span>'+
          '</div>'+
        '</a>';
      grid.innerHTML = labsHtml + ctaHtml;
    });

    /* ---- service-area audience switcher (data-driven) ---- */
    document.querySelectorAll('[data-svc-switch]').forEach(function(root){
      var cfgEl = root.querySelector('script[data-svc-switch-config]');
      if(!cfgEl) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch(e){ return; }
      var audiences = cfg.audiences || [];
      if(!audiences.length) return;
      var active = 0;

      root.innerHTML =
        '<div class="svc-switch-panel">'+
          '<div class="svc-tabs" role="tablist">'+
            audiences.map(function(a,i){
              return '<button class="svc-tab" type="button" role="tab" id="svc-tab-'+i+'" aria-controls="svc-panel-cards" '+
                'aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-idx="'+i+'">'+
                '<span>'+escHtml(a.label)+'</span><span class="svc-tab-count">'+(a.offerings||[]).length+'</span>'+
              '</button>';
            }).join('')+
          '</div>'+
        '</div>'+
        '<p class="svc-blurb" id="svc-blurb" aria-live="polite"></p>'+
        '<div class="svc svc--4" id="svc-panel-cards" role="tabpanel"></div>';

      var tabs = Array.prototype.slice.call(root.querySelectorAll('.svc-tab'));
      var blurb = root.querySelector('#svc-blurb');
      var cardsWrap = root.querySelector('#svc-panel-cards');

      function renderCards(i, animate){
        var items = audiences[i].offerings || [];
        cardsWrap.innerHTML = items.map(function(o,idx){
          return '<article class="svc-card svc-card--anim">'+
            '<div class="svc-card-head"><span class="svc-index">'+String(idx+1).padStart(2,'0')+'</span><h3>'+escHtml(o.title)+'</h3></div>'+
            '<div class="svc-card-body"><p>'+escHtml(o.desc)+'</p></div>'+
          '</article>';
        }).join('');
        var cards = cardsWrap.querySelectorAll('.svc-card--anim');
        cards.forEach(function(card,idx){
          var delay = (animate?0.05+idx*0.07:0).toFixed(2);
          card.style.transitionDelay = delay+'s';
        });
        if(reduceMotion){ cards.forEach(function(c){ c.classList.add('is-shown'); }); return; }
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            cards.forEach(function(c){ c.classList.add('is-shown'); });
          });
        });
      }

      function select(i){
        if(i===active) return;
        active = i;
        tabs.forEach(function(t,idx){
          var isActive = idx===i;
          t.setAttribute('aria-selected', isActive?'true':'false');
          t.tabIndex = isActive?0:-1;
        });
        blurb.style.opacity = '0';
        setTimeout(function(){
          blurb.textContent = audiences[i].blurb || '';
          blurb.style.opacity = '1';
        }, reduceMotion?0:180);
        renderCards(i, true);
      }

      tabs.forEach(function(tab,i){
        tab.addEventListener('click', function(){ select(i); });
      });
      root.querySelector('.svc-tabs').addEventListener('keydown', function(e){
        var i;
        if(e.key==='ArrowRight'||e.key==='ArrowDown'){ i=(active+1)%tabs.length; }
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ i=(active-1+tabs.length)%tabs.length; }
        else return;
        e.preventDefault();
        tabs[i].focus();
        select(i);
      });

      blurb.textContent = audiences[0].blurb || '';
      renderCards(0, false);
    });

    /* ---- wire destinations ---- */
    document.querySelectorAll('[data-book]').forEach(function(el){
      el.setAttribute('href', connectHref);
    });
    document.querySelectorAll('[data-href="faith"]').forEach(function(el){ el.setAttribute('href', CONFIG.faithUrl); });
    document.querySelectorAll('[data-href="leader"]').forEach(function(el){ el.setAttribute('href', CONFIG.leaderUrl); });
    document.querySelectorAll('[data-href="application"]').forEach(function(el){ el.setAttribute('href', CONFIG.applicationFormUrl); });
    document.querySelectorAll('[data-href="linkedin"]').forEach(function(el){
      el.setAttribute('href', CONFIG.linkedInUrl); el.setAttribute('target','_blank'); el.setAttribute('rel','noopener');
    });

    /* ---- keep #contact aligned with the viewport when it's the scroll target ----
       The newsletter section above it (id="latest") embeds async Supascribe widgets
       that start empty and grow once their script loads, which can shove #contact
       down the page after the initial anchor jump already landed (worst on mobile,
       where that load lags behind the tap). Re-snap to #contact while its section
       is still settling, but stop the moment the visitor takes the wheel back. */
    var newsBand = document.querySelector('.news-band');
    if(newsBand && 'MutationObserver' in window){
      var watchingContact = false, watchUntil = 0;
      function snapToContact(){
        var target = document.getElementById('contact');
        if(!target) return;
        var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        window.scrollTo({ top: Math.max(target.getBoundingClientRect().top + window.pageYOffset - (navH + 16), 0) });
      }
      function checkContactHash(){
        if(location.hash === '#contact'){ watchingContact = true; watchUntil = Date.now() + 6000; snapToContact(); }
      }
      window.addEventListener('hashchange', checkContactHash);
      checkContactHash();
      ['wheel','touchmove','keydown'].forEach(function(evt){
        window.addEventListener(evt, function(){ watchingContact = false; }, { passive:true });
      });
      new MutationObserver(function(){
        if(watchingContact && Date.now() < watchUntil) snapToContact();
      }).observe(newsBand, { childList:true, subtree:true });
    }

    /* ---- mobile nav ---- */
    var burger=document.getElementById('burger'), sheet=document.getElementById('sheet'), sheetX=document.getElementById('sheetX');
    function closeSheetAccordions(){
      if(!sheet) return;
      sheet.querySelectorAll('[data-sheet-dd]').forEach(function(dd){
        dd.classList.remove('open');
        var t=dd.querySelector('.sheet-dd-trigger'); if(t) t.setAttribute('aria-expanded','false');
      });
    }
    function closeSheet(){
      if(!sheet) return;
      sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true');
      if(burger){burger.setAttribute('aria-expanded','false');burger.focus();}
      closeSheetAccordions();
    }
    if(burger&&sheet){
      burger.addEventListener('click',function(){
        var open=sheet.classList.toggle('open'); sheet.setAttribute('aria-hidden',!open); burger.setAttribute('aria-expanded',open);
        if(open){ var f=sheet.querySelector('.sheet-dd-trigger,a'); if(f) f.focus(); }
      });
      if(sheetX) sheetX.addEventListener('click',closeSheet);
      sheet.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',closeSheet); });
      sheet.querySelectorAll('[data-sheet-dd]').forEach(function(dd){
        var trigger=dd.querySelector('.sheet-dd-trigger');
        if(!trigger) return;
        trigger.addEventListener('click',function(){
          var open=!dd.classList.contains('open');
          dd.classList.toggle('open',open);
          trigger.setAttribute('aria-expanded',open?'true':'false');
        });
      });
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
      var wideFocus=root.getAttribute('data-wide-focus')==='true';

      function cardWidth(){ return cards[0]?cards[0].offsetWidth:0; }
      function gap(){ return parseFloat(getComputedStyle(track).columnGap)||24; }
      function isFocal(dist){ return wideFocus?dist<=1:dist===0; }

      function applyTransforms(){
        var w=cardWidth(),g=gap(),step=w+g;
        var translate=viewport.clientWidth/2-(index*step+w/2);
        track.style.transform='translateX('+translate+'px)';
        cards.forEach(function(card,i){
          var dist=Math.abs(i-index), focal=isFocal(dist), scale, opacity;
          if(focal){ scale=1; opacity=1; }
          else if(dist===(wideFocus?2:1)){ scale=.84; opacity=.6; }
          else { scale=.7; opacity=.22; }
          card.style.transform='translateY('+(dist===0?-10:0)+'px) scale('+scale+')';
          card.style.opacity=opacity;
          card.classList.toggle('is-focal',focal);
          card.setAttribute('aria-hidden',focal?'false':'true');
          card.toggleAttribute('inert',!focal);
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
          if(isFocal(dist)) return;
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
    function mailtoHref(payload,subject){
      var lines=[]; for(var k in payload){ if(payload[k]) lines.push(k+': '+payload[k]); }
      return 'mailto:'+CONFIG.contactEmail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    }
    function deliver(payload,subject,onSuccess,onError){
      if(CONFIG.formEndpoint){
        fetch(CONFIG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(Object.assign({_subject:subject},payload))})
          .then(function(res){ if(res.ok) onSuccess(); else onError(); })
          .catch(function(){ onError(); });
      } else {
        window.location.href=mailtoHref(payload,subject);
        onSuccess();
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
        var newsPayload={Email:v,Source:'Newsletter signup'}, newsSubject='Newsletter signup · Optimistic Labs';
        deliver(newsPayload,newsSubject,function(){
          if(newsNote) newsNote.classList.add('show'); newsEmail.value='';
        },function(){
          window.location.href=mailtoHref(newsPayload,newsSubject);
        });
      });
    }

    var contactForm=document.getElementById('contactForm');
    if(contactForm){
      var formError=document.getElementById('formError'), formErrorCta=document.getElementById('formErrorCta');
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
        if(formError) formError.classList.remove('show');
        var subject='New inquiry · Optimistic Labs';
        var payload={Name:cf.name.value.trim(),Email:cf.email.value.trim(),Message:cf.message.value.trim()};
        deliver(payload,subject,function(){
          window.location.href='/thank-you';
        },function(){
          if(formErrorCta) formErrorCta.setAttribute('href',mailtoHref(payload,subject));
          if(formError) formError.classList.add('show');
        });
      });
    }
  });
})();
