(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
  toggle.addEventListener('click', () => {const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open',open);});
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',close));
  document.addEventListener('keydown', e => {if(e.key === 'Escape' && nav.classList.contains('open')) {close();toggle.focus();}});
  document.addEventListener('click', e => {if(!header.contains(e.target)) close();});
  if('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting) {e.target.classList.add('visible'); observer.unobserve(e.target);}}), {threshold:.06});
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    document.documentElement.classList.add('motion');
  }
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY/max : 0})`;
    if(!reduced && innerWidth > 760) document.querySelectorAll('[data-parallax]').forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      if(rect.bottom > 0 && rect.top < innerHeight) el.style.transform = `translateY(${Math.max(-25,Math.min(25,(innerHeight/2-rect.top-rect.height/2)*.045))}px) scale(1.07)`;
    });
    header.classList.toggle('scrolled', scrollY > 40); scheduled = false;
  };
  addEventListener('scroll', () => {if(!scheduled) {scheduled=true;requestAnimationFrame(update);}}, {passive:true}); update();
  const day = new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'America/Los_Angeles'}).format(new Date());
  document.querySelectorAll('[data-day]').forEach(row => {if(row.dataset.day === day) {row.classList.add('today');row.setAttribute('aria-label','Today: '+row.textContent);}});
  document.querySelectorAll('.menu-filters button').forEach(button => button.addEventListener('click',() => {
    const group = button.closest('.menu-browser');
    group.querySelectorAll('.menu-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    group.querySelectorAll('.menu-category').forEach(el=>{el.hidden=button.dataset.filter!=='all'&&el.dataset.category!==button.dataset.filter;});
  }));
  document.querySelectorAll('.review-carousel').forEach(carousel => {
    const track = carousel.querySelector('.review-track'), cards = [...track.children];
    const prev = carousel.querySelector('.review-prev'), next = carousel.querySelector('.review-next'), status = carousel.querySelector('.review-status');
    const step = () => cards.length>1 ? cards[1].offsetLeft-cards[0].offsetLeft : track.clientWidth;
    const visibleCount = () => Math.max(1,Math.round(track.clientWidth/cards[0].getBoundingClientRect().width));
    const index = () => Math.max(0, Math.min(cards.length-visibleCount(),Math.round(track.scrollLeft/step())));
    const paint = () => {const i=index(),n=visibleCount();prev.disabled=i===0;next.disabled=i>=cards.length-n;status.textContent=n>1?`${i+1}–${Math.min(cards.length,i+n)} / ${cards.length}`:`${i+1} / ${cards.length}`;};
    const go = i => track.scrollTo({left:Math.max(0,Math.min(cards.length-visibleCount(),i))*step(),behavior:reduced?'instant':'smooth'});
    prev.addEventListener('click',()=>go(index()-visibleCount()));next.addEventListener('click',()=>go(index()+visibleCount()));
    track.addEventListener('scroll',paint,{passive:true});
    track.addEventListener('keydown',e=>{if(e.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();go(e.key==='Home'?0:e.key==='End'?cards.length:e.key==='ArrowLeft'?index()-1:index()+1);});
    if('ResizeObserver' in window)new ResizeObserver(paint).observe(track);paint();
  });
})();
