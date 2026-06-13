// Language toggle + mobile menu. Default = English.
(function(){
  const saved = localStorage.getItem('hd_lang') || 'en';
  if(saved==='hi') document.body.classList.add('hi');
  window.setLang=function(l){
    document.body.classList.toggle('hi', l==='hi');
    localStorage.setItem('hd_lang', l);
    document.querySelectorAll('.lang-toggle button').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang===l);
    });
  };
  document.addEventListener('DOMContentLoaded',function(){
    const l = document.body.classList.contains('hi')?'hi':'en';
    document.querySelectorAll('.lang-toggle button').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang===l);
    });
    const mb=document.querySelector('.menu-btn');
    if(mb) mb.addEventListener('click',()=>document.querySelector('.nav-links').classList.toggle('open'));
  });
})();
