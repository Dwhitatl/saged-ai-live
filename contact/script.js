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
})();

(function(){
  var BOOK = 'https://calendly.com/denisedwhitfield/30min';
  function go(e){
    e.preventDefault();
    if(window.Calendly && window.Calendly.initPopupWidget){
      window.Calendly.initPopupWidget({url: BOOK});
    }else{
      window.open(BOOK, '_blank', 'noopener');
    }
    return false;
  }
  document.querySelectorAll('a[data-book="1"]').forEach(function(a){
    a.addEventListener('click', go);
  });
})();