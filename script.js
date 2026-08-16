(function(){try{var t=localStorage.getItem('saged-theme');if(!t){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();

(function(){
  var btn = document.getElementById('themeBtn');
  if(btn){
    btn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      try{ localStorage.setItem('saged-theme', cur); }catch(e){}
    });
  }
  document.querySelectorAll('.nav-mobile a').forEach(function(a){
    a.addEventListener('click', function(){ document.getElementById('nav').classList.remove('open'); });
  });
  var track = document.getElementById('marqueeTrack');
  if(track){ track.innerHTML += track.innerHTML; }
  var bioBtn = document.getElementById('bioToggle');
  var bioMore = document.getElementById('bioMore');
  if(bioBtn && bioMore){
    bioBtn.addEventListener('click', function(){
      var open = bioMore.classList.toggle('open');
      bioBtn.classList.toggle('open', open);
      bioBtn.textContent = open ? 'Show less' : 'Learn more about Denise Whitfield';
    });
  }
  document.querySelectorAll('.flip').forEach(function(c){
    c.addEventListener('click', function(){ c.classList.toggle('flipped'); });
    c.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); c.classList.toggle('flipped'); }
    });
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.14});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var el = e.target;
        var target = parseInt(el.getAttribute('data-count'),10);
        var prefix = el.getAttribute('data-prefix') || '';
        var suffixEl = el.querySelector('.suffix');
        var suffixHTML = suffixEl ? suffixEl.outerHTML : '';
        var dur = 1300, start = null;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min((ts-start)/dur,1);
          el.innerHTML = prefix + Math.floor(p*target) + suffixHTML;
          if(p<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      }
    });
  }, {threshold:.4});
  document.querySelectorAll('.stat-num').forEach(function(el){ cio.observe(el); });
  var vid = document.getElementById('denisePreview');
  var fallback = document.getElementById('videoFallback');
  if(vid){
    vid.addEventListener('loadeddata', function(){
      vid.style.display = 'block';
      if(fallback) fallback.style.display = 'none';
      vid.setAttribute('controls','');
      vid.setAttribute('autoplay','');
    });
    vid.addEventListener('error', function(){
      vid.style.display = 'none';
      if(fallback) fallback.style.display = 'block';
    });
    vid.load();
  }
})();

(function(){
  var startCard = document.getElementById('askStart'),
      beginBtn  = document.getElementById('askBegin'),
      panel     = document.getElementById('askPanel'),
      frame     = document.getElementById('askFrame'),
      closeBtn  = document.getElementById('askClose'),
      eyebrowEl = document.getElementById('askEyebrowText'),
      introEl   = document.getElementById('askIntroText'),
      panelLabelEl = document.getElementById('askPanelLabel');
  if(!startCard || !panel || !frame) return;

  var ASK_BASE  = 'https://paymegpt.com/agents/47699893/embed';
  var BOOK_BASE = 'https://paymegpt.com/agents/41566008/embed';
  var IDLE = 30000;
  var timer = null, live = false;

  var COPY = {
    ask:  { eyebrow: 'Answered live', intro: 'Ask us anything about applying AI in your business.', panelLabel: 'Ask us anything — answered live' },
    book: { eyebrow: 'Book live — no forms', intro: 'Tell our AI agent what day and time work, and it\u2019s booked on the spot.', panelLabel: 'Booking your free 30-minute audit' }
  };

  function wipe(){
    try{
      [localStorage, sessionStorage].forEach(function(store){
        if(!store) return;
        var kill = [];
        for(var i=0;i<store.length;i++){
          var k = store.key(i);
          if(!k) continue;
          var lk = k.toLowerCase();
          if(lk.indexOf('paymegpt')>-1 || lk.indexOf('47699893')>-1 || lk.indexOf('41566008')>-1 ||
             lk.indexOf('chat')>-1 || lk.indexOf('conversation')>-1 ||
             lk.indexOf('ktt10')>-1){ kill.push(k); }
        }
        kill.forEach(function(k){ try{ store.removeItem(k); }catch(e){} });
      });
    }catch(e){}
  }

  function token(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,10);
  }

  function applyCopy(mode){
    var c = COPY[mode] || COPY.ask;
    if(eyebrowEl) eyebrowEl.textContent = c.eyebrow;
    if(introEl) introEl.textContent = c.intro;
    if(panelLabelEl) panelLabelEl.textContent = c.panelLabel;
  }

  function open(mode){
    mode = mode === 'book' ? 'book' : 'ask';
    applyCopy(mode);
    wipe();
    var t = token();
    var base = mode === 'book' ? BOOK_BASE : ASK_BASE;
    frame.src = base + '?new=1&reset=1&fresh=1&s=' + t + '&session=' + t +
                '&sessionId=' + t + '&conversationId=' + t;
    startCard.className = 'ask-start off';
    panel.className = 'ask-inline';
    live = true;
    kick();
  }

  function close(){
    clearTimeout(timer); timer = null; live = false;
    frame.src = 'about:blank';
    wipe();
    panel.className = 'ask-inline off';
    startCard.className = 'ask-start';
    applyCopy('ask');
  }

  function kick(){
    if(!live) return;
    clearTimeout(timer);
    timer = setTimeout(close, IDLE);
  }

  if(beginBtn) beginBtn.addEventListener('click', function(){ open('ask'); });
  if(closeBtn) closeBtn.addEventListener('click', close);

  document.querySelectorAll('a[data-book="1"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var faqSection = document.getElementById('faq');
      if(faqSection){ faqSection.scrollIntoView({behavior:'smooth', block:'start'}); }
      setTimeout(function(){ open('book'); }, 450);
      return false;
    });
  });

  if(window.location.hash === '#book'){
    var faqSectionOnLoad = document.getElementById('faq');
    if(faqSectionOnLoad){ faqSectionOnLoad.scrollIntoView({behavior:'smooth', block:'start'}); }
    setTimeout(function(){ open('book'); }, 600);
  }

  window.addEventListener('blur', function(){
    setTimeout(function(){ if(document.activeElement === frame) kick(); }, 0);
  });
  ['mousemove','keydown','click','scroll','touchstart'].forEach(function(ev){
    document.addEventListener(ev, kick, {passive:true});
  });
  setInterval(function(){ if(live && document.activeElement === frame) kick(); }, 4000);

  window.addEventListener('pagehide', close);
  window.addEventListener('pageshow', function(e){ if(e.persisted) close(); });
})();