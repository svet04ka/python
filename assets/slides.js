/* Навигация по слайдам: стрелки, пробел, клик, свайп, F — полный экран. Номер слайда в адресе: #5 */
(function(){
  const slides = Array.from(document.querySelectorAll('.slide'));
  const deck = document.querySelector('.deck');
  let i = 0;
  const hud = document.createElement('div'); hud.className = 'hud';
  hud.innerHTML = '<a href="../index.html">← Все уроки</a><button class="prev" aria-label="Назад">←</button><button class="next" aria-label="Вперёд">→</button><span class="cnt"></span><span class="bar"><i></i></span><button class="fs">Полный экран</button>';
  document.body.appendChild(hud);
  function fit(){ const s = Math.min(innerWidth / 1320, (innerHeight - 50) / 760); slides.forEach(x => x.style.transform = `scale(${s})`); }
  function show(n, push){
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((x, k) => x.classList.toggle('on', k === i));
    hud.querySelector('.cnt').textContent = `${i + 1} / ${slides.length}`;
    hud.querySelector('.bar i').style.width = ((i + 1) / slides.length * 100) + '%';
    if (push !== false) history.replaceState(null, '', '#' + (i + 1));
    const c = slides[i].querySelectorAll('canvas[data-ops]'); c.forEach(draw);
  }
  function draw(cv){
    if (cv.dataset.done) return; cv.dataset.done = 1;
    const ops = JSON.parse(cv.dataset.ops), colab = cv.dataset.mode === 'colab';
    cv.width = 800; cv.height = 500;
    const ctx = cv.getContext('2d'); let bg = colab ? 'black' : 'white', from = 0;
    ops.forEach((o, k) => { if (o.t === 'clear'){ bg = o.bg; from = k; } else if (o.t === 'bg') bg = o.c; });
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 800, 500);
    const Z = +(cv.dataset.zoom || 1.2); ctx.translate(400, 250); ctx.scale(Z, Z); ctx.translate(-400, -250);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = from; k < ops.length; k++){ const o = ops[k];
      if (o.t === 'm' && o.d){ ctx.strokeStyle = o.c; ctx.lineWidth = Math.max(o.w, 1) * 1.6; ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.stroke(); }
      else if (o.t === 'fill'){ ctx.fillStyle = o.c; ctx.beginPath(); o.pts.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
      else if (o.t === 'dot'){ ctx.fillStyle = o.c; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill(); } }
  }
  hud.querySelector('.prev').onclick = () => show(i - 1);
  hud.querySelector('.next').onclick = () => show(i + 1);
  hud.querySelector('.fs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} };
  addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)){ e.preventDefault(); show(i + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)){ e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') show(0); else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') hud.querySelector('.fs').click();
  });
  deck.addEventListener('click', e => { if (e.target.closest('a,button,input')) return; e.clientX > innerWidth / 3 ? show(i + 1) : show(i - 1); });
  let tx = null; deck.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  deck.addEventListener('touchend', e => { if (tx == null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 40) show(d < 0 ? i + 1 : i - 1); tx = null; });
  addEventListener('resize', fit); addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1, false));
  fit(); show((parseInt(location.hash.slice(1), 10) || 1) - 1, false);
  addEventListener('beforeprint', () => slides.forEach(x => x.querySelectorAll('canvas[data-ops]').forEach(draw)));
})();
