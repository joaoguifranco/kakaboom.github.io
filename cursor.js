// Custom cursor: star + fairy dust trail
(function(){
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch
  const star = document.createElement('div');
  star.className = 'k-cursor';
  // SVG is wrapped in an inner span so the .grow scale lives on the CHILD —
  // if the scale were on the outer (which carries `transform: translate(x,y)`),
  // it would multiply that translate and visibly shove the star away from the
  // real mouse position on any element that triggers .grow.
  star.innerHTML = '<span class="k-cursor-inner"><svg viewBox="0 0 24 24" width="28" height="28"><defs><filter id="starglow"><feGaussianBlur stdDeviation="0.8"/></filter></defs><path d="M12 1.5l2.7 6.3 6.8.6-5.2 4.5 1.6 6.7L12 16l-5.9 3.6 1.6-6.7L2.5 8.4l6.8-.6L12 1.5z" fill="url(#stargrad)" stroke="#fff" stroke-width="0.8"/><defs><linearGradient id="stargrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffb84d"/></linearGradient></defs></svg></span>';
  document.body.appendChild(star);

  const trailLayer = document.createElement('div');
  trailLayer.className = 'k-trail-layer';
  document.body.appendChild(trailLayer);

  let x = window.innerWidth/2, y = window.innerHeight/2;
  let tx = x, ty = y;
  let lastSpawn = 0;
  const colors = ['#fff7c2','#ffb84d','#ff7ec8','#9b6bff','#7ec8ff','#9be07f'];

  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    const now = performance.now();
    if (now - lastSpawn > 28) {
      lastSpawn = now;
      spawnDust(tx, ty);
    }
  });

  function spawnDust(px, py){
    const d = document.createElement('span');
    d.className = 'k-dust';
    const c = colors[Math.floor(Math.random()*colors.length)];
    const s = 4 + Math.random()*5;
    d.style.left = (px + (Math.random()-0.5)*10) + 'px';
    d.style.top  = (py + (Math.random()-0.5)*10) + 'px';
    d.style.width = s + 'px';
    d.style.height = s + 'px';
    d.style.background = c;
    d.style.boxShadow = `0 0 ${s*2}px ${c}`;
    d.style.setProperty('--dx', (Math.random()-0.5)*30 + 'px');
    d.style.setProperty('--dy', (10 + Math.random()*20) + 'px');
    trailLayer.appendChild(d);
    setTimeout(()=> d.remove(), 900);
  }

  function tick(){
    // Snap the star directly to the cursor — no smoothing — so it can never
    // drift away from where the fairy dust is being spawned.
    x = tx;
    y = ty;
    star.style.transform = `translate(${x-14}px, ${y-14}px)`;
    requestAnimationFrame(tick);
  }
  tick();

  // Grow on interactive hover
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .k-tilt, [data-cursor="grow"]')) {
      star.classList.add('grow');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .k-tilt, [data-cursor="grow"]')) {
      star.classList.remove('grow');
    }
  });
})();
