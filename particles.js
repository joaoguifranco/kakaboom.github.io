// Canvas — partículas mágicas: faíscas, mini estrelas, motas brilhantes (não mais bolinhas)
(function(){
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  const COLORS = ['#fff7c2','#ffd66b','#ff7ec8','#9b6bff','#7ec8ff','#9be07f','#ffffff'];
  let particles = [];
  let sparks = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticles() {
    const count = Math.min(140, Math.floor((W * H) / 8000));
    particles = Array.from({length: count}, () => spawn(true));
  }

  function spawn(initial=false) {
    const kind = Math.random();
    let type;
    if (kind < 0.55) type = 'mote';      // brilho macio
    else if (kind < 0.85) type = 'star'; // estrela 4 pontas
    else type = 'glow';                  // ponto luminoso
    const r = type === 'mote' ? 1.2 + Math.random()*2.2
            : type === 'star' ? 3 + Math.random()*5
            : 2 + Math.random()*3;
    return {
      type,
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 20 + Math.random()*200,
      r,
      vy: -0.08 - Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.18,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random()*0.012,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      alpha: 0.5 + Math.random()*0.5,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.04 + Math.random()*0.08,
      depth: 0.4 + Math.random()*0.9,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random()-0.5) * 0.02
    };
  }

  let mx = 0.5, my = 0.5;
  window.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
    // Sparks burst on quick move
    if (Math.random() < 0.18) sparkBurst(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
  }, {passive:true});

  function sparkBurst(x, y){
    for (let i=0; i<2; i++) {
      sparks.push({
        x, y,
        vx: (Math.random()-0.5)*1.4,
        vy: (Math.random()-0.5)*1.4 - 0.4,
        life: 1,
        r: 1 + Math.random()*1.5,
        color: COLORS[Math.floor(Math.random()*COLORS.length)]
      });
    }
  }

  function drawStar(cx, cy, r, color, alpha){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    // 4-point star (sparkle shape)
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r*1.6);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r*0.15, -r*0.15, r, 0);
    ctx.quadraticCurveTo(r*0.15, r*0.15, 0, r);
    ctx.quadraticCurveTo(-r*0.15, r*0.15, -r, 0);
    ctx.quadraticCurveTo(-r*0.15, -r*0.15, 0, -r);
    ctx.fill();
    // Cross beams
    ctx.strokeStyle = `rgba(255,255,255,${alpha*0.8})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -r*1.4); ctx.lineTo(0, r*1.4);
    ctx.moveTo(-r*1.4, 0); ctx.lineTo(r*1.4, 0);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const parallaxX = (mx - 0.5) * 30;
    const parallaxY = (my - 0.5) * 22;

    // Particles
    for (const p of particles) {
      p.sway += p.swaySpeed;
      p.twinkle += p.twinkleSpeed;
      p.rot += p.rotSpeed;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.sway)*0.25;
      if (p.y < -p.r*3 || p.x < -50 || p.x > W+50) Object.assign(p, spawn(false));
      const px = p.x + parallaxX * p.depth;
      const py = p.y + parallaxY * p.depth;
      const flicker = 0.55 + Math.sin(p.twinkle)*0.45;
      const a = p.alpha * flicker;

      if (p.type === 'star') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot);
        drawStar(0, 0, p.r, p.color, a);
        ctx.restore();
      } else if (p.type === 'glow') {
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r*5);
        g.addColorStop(0, hexA(p.color, a));
        g.addColorStop(0.4, hexA(p.color, a*0.4));
        g.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, p.r*5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2); ctx.fill();
      } else { // mote
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r*4);
        g.addColorStop(0, hexA(p.color, a*0.9));
        g.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, p.r*4, 0, Math.PI*2); ctx.fill();
      }
    }

    // Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.02; s.life -= 0.02;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const a = s.life;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*5);
      g.addColorStop(0, hexA(s.color, a));
      g.addColorStop(1, hexA(s.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r*5, 0, Math.PI*2); ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  function hexA(hex, a){
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n>>16)&255}, ${(n>>8)&255}, ${n&255}, ${a})`;
  }

  window.addEventListener('resize', () => { resize(); makeParticles(); });
  resize();
  makeParticles();
  draw();
})();
