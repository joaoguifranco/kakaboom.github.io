// Main interactions: hero parallax, character carousel, tilt, scroll reveals, BPM pulse, tweaks
(function(){
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  // ===== HERO 3D PARALLAX (scene tilt + decorations) =====
  const heroScene = $('#hero-scene');
  if (heroScene) {
    const inner = heroScene.querySelector('.hero-scene-inner');
    const sparkles = $$('.hero-sparkle', heroScene);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, {passive:true});
    function loop(){
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const rotY = cx * 8;
      const rotX = -cy * 5;
      const tX = cx * 16;
      const tY = cy * 10;
      if (inner) inner.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translate3d(${tX}px, ${tY}px, 0)`;
      sparkles.forEach((s, i) => {
        const depth = 30 + (i*10);
        s.style.transform = `translate(${cx * depth * 0.8}px, ${cy * depth * 0.6}px) translateZ(${60+i*20}px)`;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ===== BPM PULSE on CTA (audio-reactive vibe via tempo sync) =====
  // 92 BPM — chill kids dance tempo
  const cta = $('#hero-cta');
  if (cta) {
    const bpm = 92;
    const beat = 60000 / bpm; // ms
    setInterval(()=> {
      cta.classList.add('beat');
      setTimeout(()=> cta.classList.remove('beat'), beat * 0.45);
    }, beat);

    // CTA scroll target
    cta.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('listen').scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  // ===== Smooth scroll for nav =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // ===== GSAP SCROLL REVEALS =====
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Generic reveal
    $$('[data-reveal]').forEach(el => {
      const dir = el.dataset.reveal || 'up';
      const from = {opacity: 0, y: dir==='up'? 60 : dir==='down'? -60 : 0, x: dir==='left'? -60 : dir==='right'? 60 : 0, scale: dir==='zoom'? 0.85 : 1};
      gsap.from(el, {
        ...from,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      });
    });

    // Stagger groups
    $$('[data-reveal-stagger]').forEach(group => {
      const kids = [...group.children];
      gsap.from(kids, {
        opacity: 0, y: 50, duration: 0.9, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

  // ===== HERO text reveal =====
  if (window.gsap) {
    gsap.from('.hero-title .line', {
      opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', stagger: 0.15, delay: 0.4
    });
    gsap.from('.hero-cta-wrap', {
      opacity: 0, y: 30, duration: 1, ease: 'expo.out', delay: 0.9
    });
    gsap.from('.hero-scene', {
      opacity: 0, scale: 0.94, duration: 1.4, ease: 'expo.out', delay: 0.1
    });
  }

    // Band section image parallax
    const bedroom = $('.band-image');
    if (bedroom) {
      gsap.to(bedroom.querySelector('img'), {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: bedroom, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    // Castle image parallax + glow
    const castle = $('.albums-feature');
    if (castle) {
      gsap.to(castle.querySelector('.albums-feature-img'), {
        yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: castle, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    // Peek image — zoom into the gap
    const peek = $('.peek-portal');
    if (peek) {
      gsap.to(peek.querySelector('.peek-img'), {
        scale: 1.25, ease: 'none',
        scrollTrigger: { trigger: peek, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    }
  }

  // ===== CARD TILT (vanilla, smooth) =====
  function applyTilt(el){
    let raf=0, tx=0, ty=0, cx=0, cy=0, active=false;
    const max = 12;
    function update(){
      cx += (tx-cx)*0.15; cy += (ty-cy)*0.15;
      el.style.transform = `perspective(1000px) rotateX(${-cy}deg) rotateY(${cx}deg) translateZ(0)`;
      const inner = el.querySelector('.tilt-inner');
      if (inner) inner.style.transform = `translate3d(${cx*1.2}px, ${cy*1.2}px, 30px)`;
      const shine = el.querySelector('.tilt-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${50+cx*5}% ${50-cy*5}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;
      }
      if (active || Math.abs(tx-cx) > 0.1 || Math.abs(ty-cy) > 0.1) raf = requestAnimationFrame(update);
    }
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * max * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * max * 2;
      if (!raf) { active = true; raf = requestAnimationFrame(update); }
    });
    el.addEventListener('mouseenter', () => { active = true; });
    el.addEventListener('mouseleave', () => {
      active = false; tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(update);
      setTimeout(()=>{ raf=0; }, 600);
    });
  }
  $$('.k-tilt').forEach(applyTilt);

  // ===== CHARACTER CAROUSEL =====
  const carousel = $('#characters');
  if (carousel) {
    const slides = $$('.char-slide', carousel);
    const dots = $$('.char-dot', carousel);
    const prev = $('.char-nav.prev', carousel);
    const next = $('.char-nav.next', carousel);
    let idx = 0;
    let auto;
    function go(i){
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        s.classList.toggle('active', n === idx);
        s.classList.toggle('prev', n === (idx - 1 + slides.length) % slides.length);
        s.classList.toggle('next', n === (idx + 1) % slides.length);
      });
      dots.forEach((d,n) => d.classList.toggle('active', n === idx));
    }
    prev && prev.addEventListener('click', ()=> { go(idx-1); resetAuto(); });
    next && next.addEventListener('click', ()=> { go(idx+1); resetAuto(); });
    dots.forEach((d,n) => d.addEventListener('click', ()=> { go(n); resetAuto(); }));
    document.addEventListener('keydown', e => {
      if (!isCarouselVisible()) return;
      if (e.key === 'ArrowLeft')  { go(idx-1); resetAuto(); }
      if (e.key === 'ArrowRight') { go(idx+1); resetAuto(); }
    });
    function isCarouselVisible(){
      const r = carousel.getBoundingClientRect();
      return r.top < window.innerHeight*0.6 && r.bottom > window.innerHeight*0.4;
    }
    function resetAuto(){ clearInterval(auto); auto = setInterval(()=> go(idx+1), 6500); }
    go(0); resetAuto();
  }

  // ===== SPOTLIGHT cursor on dark sections =====
  $$('.spotlight').forEach(sec => {
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      sec.style.setProperty('--sx', x + '%');
      sec.style.setProperty('--sy', y + '%');
    });
  });

  // ===== Tilt layout switching for characters =====
  function setCharsLayout(mode){
    const sec = document.getElementById('characters');
    if (!sec) return;
    sec.dataset.layout = mode;
  }
  window.__setCharsLayout = setCharsLayout;

  // ===== Music note animation on listen buttons =====
  $$('.listen-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      for (let i=0; i<6; i++) {
        setTimeout(()=> spawnNote(btn), i*90);
      }
    });
  });
  function spawnNote(btn){
    const n = document.createElement('span');
    n.className = 'music-note';
    n.textContent = ['♪','♫','♬','♩'][Math.floor(Math.random()*4)];
    n.style.left = (10 + Math.random()*80) + '%';
    n.style.color = ['#ff7ec8','#9b6bff','#7ec8ff','#9be07f','#ffb84d'][Math.floor(Math.random()*5)];
    btn.appendChild(n);
    setTimeout(()=> n.remove(), 1600);
  }

  // ===== Album expand =====
  $$('.album-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      card.classList.toggle('open');
    });
    const toggle = card.querySelector('.album-toggle');
    if (toggle) toggle.addEventListener('click', e => {
      e.stopPropagation();
      card.classList.toggle('open');
    });
  });

  // ===== Language toggle =====
  const langBtns = $$('[data-lang]');
  function setLang(l){
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === l));
    window.__i18n.apply(l);
    localStorage.setItem('kkb_lang', l);
  }
  langBtns.forEach(b => b.addEventListener('click', ()=> setLang(b.dataset.lang)));
  setLang(localStorage.getItem('kkb_lang') || 'pt');

  // ===== Tweaks panel =====
  // Defaults block — host can rewrite this JSON in place
  const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
    "charsLayout": "grid",
    "displayFont": "Fredoka",
    "bodyFont": "Nunito"
  }/*EDITMODE-END*/;

  const TWEAKS = { ...TWEAKS_DEFAULTS };
  function applyTweaks(){
    setCharsLayout(TWEAKS.charsLayout);
    document.documentElement.style.setProperty('--font-display', `"${TWEAKS.displayFont}", "Fredoka", system-ui`);
    document.documentElement.style.setProperty('--font-body', `"${TWEAKS.bodyFont}", "Nunito", system-ui`);
    // Update active buttons
    $$('.tweak-opt').forEach(b => {
      const k = b.dataset.tweak, v = b.dataset.value;
      if (TWEAKS[k] === v) b.classList.add('active'); else b.classList.remove('active');
    });
  }
  function setTweak(k, v){
    TWEAKS[k] = v;
    applyTweaks();
    window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[k]:v}}, '*');
  }
  applyTweaks();

  // Tweaks panel UI
  const panel = $('#tweaks-panel');
  $$('.tweak-opt').forEach(b => {
    b.addEventListener('click', ()=> setTweak(b.dataset.tweak, b.dataset.value));
  });

  // Edit-mode protocol
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel && panel.classList.add('open');
    if (d.type === '__deactivate_edit_mode') panel && panel.classList.remove('open');
  });
  window.parent.postMessage({type:'__edit_mode_available'}, '*');

  $('.tweaks-close')?.addEventListener('click', ()=> {
    panel && panel.classList.remove('open');
    window.parent.postMessage({type:'__edit_mode_dismissed'}, '*');
  });

  // ===== Header on scroll =====
  const header = $('#site-header');
  window.addEventListener('scroll', () => {
    header && header.classList.toggle('scrolled', window.scrollY > 30);
  }, {passive:true});

})();
