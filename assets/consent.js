/* Cookie consent + Google Analytics loader.
   GA (G-333H2SM0NG) is only loaded after a visitor accepts. The choice is
   remembered in localStorage ("ol-consent"). Any element with
   [data-consent-reset] (see privacy.html) reopens the banner. */
(function(){
  var GA_ID='G-333H2SM0NG', KEY='ol-consent';

  function get(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function set(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }

  function loadGA(){
    if(window.__olGA) return; window.__olGA=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);};
    gtag('js',new Date());
    gtag('config',GA_ID);
    var s=document.createElement('script');
    s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
    document.head.appendChild(s);
  }

  function clearGA(){
    // Remove GA cookies set earlier (_ga, _ga_<id>) on this host and parent domains.
    var host=location.hostname.split('.'), domains=[''];
    for(var i=0;i<host.length-1;i++) domains.push('; domain=.'+host.slice(i).join('.'));
    document.cookie.split(';').forEach(function(c){
      var n=c.split('=')[0].trim();
      if(n==='_ga'||n.indexOf('_ga_')===0||n==='_gid'||n==='_gat'){
        domains.forEach(function(d){ document.cookie=n+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'+d; });
      }
    });
    window['ga-disable-'+GA_ID]=true;
  }

  var css='.ol-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;'+
    'background:#111;color:#fff;border-radius:14px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.28);'+
    'font:400 14px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'+
    '.ol-consent p{margin:0 0 14px;color:rgba(255,255,255,.88)}'+
    '.ol-consent a{color:#B0A6FA;text-decoration:underline}'+
    '.ol-consent-row{display:flex;gap:10px;flex-wrap:wrap}'+
    '.ol-consent button{font:600 14px Inter,system-ui,sans-serif;border-radius:999px;padding:10px 20px;cursor:pointer;border:1.5px solid #7C6DF5}'+
    '.ol-consent button:focus-visible{outline:2px solid #B0A6FA;outline-offset:2px}'+
    '.ol-consent .ol-yes{background:#7C6DF5;color:#fff}'+
    '.ol-consent .ol-no{background:transparent;color:#fff}';

  function show(){
    if(document.querySelector('.ol-consent')) return;
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var b=document.createElement('div');
    b.className='ol-consent'; b.setAttribute('role','dialog'); b.setAttribute('aria-label','Cookie consent');
    b.innerHTML='<p>We use Google Analytics cookies to understand how people use this site. They only load if you accept. '+
      '<a href="privacy.html">Privacy policy</a></p>'+
      '<div class="ol-consent-row"><button type="button" class="ol-yes">Accept</button>'+
      '<button type="button" class="ol-no">Decline</button></div>';
    b.querySelector('.ol-yes').onclick=function(){ set('granted'); window['ga-disable-'+GA_ID]=false; loadGA(); b.remove(); };
    b.querySelector('.ol-no').onclick=function(){ set('denied'); clearGA(); b.remove(); };
    document.body.appendChild(b);
  }

  var c=get();
  if(c==='granted') loadGA();

  document.addEventListener('DOMContentLoaded',function(){
    if(!c) show();
    document.addEventListener('click',function(e){
      if(e.target.closest&&e.target.closest('[data-consent-reset]')){ e.preventDefault(); show(); }
    });
  });
})();
