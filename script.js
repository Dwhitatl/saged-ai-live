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
  var navLinks = document.querySelector('.nav-links');
  if(navLinks){
    var navAnchors = navLinks.querySelectorAll('a:not(.nav-cta)');
    navAnchors.forEach(function(link){
      link.addEventListener('mousemove', function(e){
        var rect = link.getBoundingClientRect();
        var x = ((e.clientX - rect.left) - rect.width / 2) * 0.18;
        var y = ((e.clientY - rect.top) - rect.height / 2) * 0.18;
        x = Math.max(-8, Math.min(8, x));
        y = Math.max(-8, Math.min(8, y));
        if(window.gsap){
          gsap.to(link, {x:x, y:y, duration:.3, ease:'power2.out', overwrite:true});
        }else{
          link.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        }
      });
      link.addEventListener('mouseleave', function(){
        if(window.gsap){
          gsap.to(link, {x:0, y:0, duration:.55, ease:'elastic.out(1,0.5)', overwrite:true});
        }else{
          link.style.transform = 'translate(0,0)';
        }
      });
    });
  }
  var track = document.getElementById('marqueeTrack');
  if(track){ track.innerHTML += track.innerHTML; }
  var faqRevealBtn = document.getElementById('faqRevealBtn');
  var faqListContent = document.getElementById('faqListContent');
  if(faqRevealBtn && faqListContent){
    faqRevealBtn.addEventListener('click', function(){
      faqRevealBtn.style.display = 'none';
      faqListContent.style.display = 'block';
      requestAnimationFrame(function(){ faqListContent.style.opacity = '1'; });
    });
  }
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
  var IDLE = 10000;
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
    if(beginBtn) beginBtn.textContent = mode === 'book' ? 'Click Here for Your Free AI Audit' : 'Start a Conversation with Our AI Agent';
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

  window.addEventListener('message', function(event){
    try{
      if(!live) return;
      var data = event && event.data;
      var text = '';
      if(typeof data === 'string'){
        text = data;
      }else if(data && typeof data === 'object'){
        try{
          text = JSON.stringify(data);
        }catch(e){
          text = String(data);
        }
      }else{
        text = String(data);
      }
      text = (text || '').toLowerCase();
      if(text.indexOf('booked') > -1 || text.indexOf('success') > -1 || text.indexOf('complete') > -1 || text.indexOf('submitted') > -1 || text.indexOf('confirmed') > -1){
        close();
      }
    }catch(e){}
  });

  if(beginBtn) beginBtn.addEventListener('click', function(){
    var mode = window.pendingAgentMode || 'ask';
    window.pendingAgentMode = null;
    open(mode);
  });
  var bookBtn = document.getElementById('askBookBtn');
  if(bookBtn) bookBtn.addEventListener('click', function(){
    window.pendingAgentMode = 'book';
    applyCopy('book');
    open('book');
  });
  if(closeBtn) closeBtn.addEventListener('click', close);

  document.querySelectorAll('a[data-book="1"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var askBookBtn = document.getElementById('askBookBtn');
      if(askBookBtn){ askBookBtn.scrollIntoView({behavior:'smooth', block:'center'}); }
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
  if(panel){
    ['mouseenter','mousemove'].forEach(function(ev){
      panel.addEventListener(ev, kick, {passive:true});
    });
  }
  setInterval(function(){ if(live && document.activeElement === frame) kick(); }, 4000);

  window.addEventListener('pagehide', close);
  window.addEventListener('pageshow', function(e){ if(e.persisted) close(); });
})();

(function(){
  if(!window.gsap) return;

  // A bold curtain-wipe sweeps across and off the hero the instant the page loads
  gsap.set('.hero-wipe', {xPercent: 0});
  gsap.to('.hero-wipe', {xPercent: 140, duration: 1, ease: 'power3.inOut', delay: 0.05});

  // Entrance: headline words rise in calmly, solid color, no shimmer
  gsap.set('.hw, .hl', {opacity:0, y:22, scale:0.97});
  gsap.to('.hw, .hl', {
    opacity:1, y:0, scale:1,
    duration:1.1, ease:'power3.out', stagger:0.11, delay:0.2
  });

  // Bold gold highlighter block sweeps in behind "your business" —
  // a single, confident, unmistakable reveal, then it stays
  gsap.to('.hl', {
    backgroundSize: '100% 100%',
    duration: 0.9,
    ease: 'power3.out',
    delay: 1.5
  });

  // The video card rises in with the headline — one cohesive hero, not two
  gsap.set('.hero-media', {opacity: 0, y: 24, scale: 0.96});
  gsap.to('.hero-media', {opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.3});

  // A bright flash-bloom the instant it lands — announces the payoff, then settles
  gsap.fromTo('.hl',
    {boxShadow: '0 0 60px 18px rgba(240,201,84,.6)'},
    {boxShadow: '0 0 0px 0px rgba(240,201,84,0)', duration: 0.9, ease: 'power2.out', delay: 2.35}
  );

  // The CTAs rise in last — the hero's reveal sequence ends by pointing at the button
  gsap.set('.hero-ctas', {opacity: 0, y: 16});
  gsap.to('.hero-ctas', {opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 2.6});
  gsap.fromTo('#heroBookBtn',
    {boxShadow: '0 4px 16px rgba(194,168,104,.34), 0 0 34px 10px rgba(240,201,84,.55)'},
    {boxShadow: '0 4px 16px rgba(194,168,104,.34), 0 0 0px 0px rgba(240,201,84,0)', duration: 1, ease: 'power2.out', delay: 2.9}
  );

  // A hand-drawn gold signature line draws itself in beneath the headline
  var underlinePath = document.getElementById('underlinePath');
  if(underlinePath){
    var pathLen = underlinePath.getTotalLength();
    underlinePath.style.strokeDasharray = pathLen;
    underlinePath.style.strokeDashoffset = pathLen;
    gsap.to(underlinePath, {strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', delay: 1.7});
  }
})();