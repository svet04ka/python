/* Движок домашних заданий: теория, разбор, квиз, «найди ошибку», задачи с автопроверкой, звёзды, отправка тьютору. */
(function () {
'use strict';
const CFG = window.SITE_CONFIG || {};

/* ---------- утилиты ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function hl(code){
  return esc(code).replace(/(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|\b(def|for|in|if|elif|else|while|return|import|from|as|pass|break|continue|True|False|None|and|or|not|try|except|finally|with|lambda|is|global|class|del)\b|(?<![\wА-яЁё])(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(?=\()/gm,
    (m, c, s, k, n, f) => c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : k ? `<span class="k">${k}</span>` : n ? `<span class="n">${n}</span>` : `<span class="f">${f}</span>`);
}
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
function el(tag, cls, html){ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/\r/g, '');

/* ---------- черепашка: отрисовка ---------- */
function drawTurtleIcon(ctx, o){
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate((o.h || 0) * Math.PI / 180);
  const col = o.pc || 'black';
  ctx.fillStyle = col; ctx.strokeStyle = col;
  if (o.sh === 'turtle'){
    ctx.fillStyle = o.pc === 'white' ? '#5ee0a8' : col;
    for (const [lx, ly] of [[6, 8], [6, -8], [-6, 8], [-6, -8]]){ ctx.beginPath(); ctx.arc(lx, ly, 3.4, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(13, 0, 4.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, 0, 3, 1.6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 8, 0, 0, 7); ctx.fill();
  } else if (o.sh === 'circle'){ ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); }
  else if (o.sh === 'square'){ ctx.fillRect(-9, -9, 18, 18); }
  else if (o.sh === 'triangle'){ ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, 10); ctx.lineTo(-8, -10); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, 9); ctx.lineTo(-3, 0); ctx.lineTo(-8, -9); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function renderOps(canvas, ops, upto, opts){
  opts = opts || {};
  const colab = opts.mode === 'colab';
  const Z = colab ? 1 : 1.2, LW = colab ? 1 : 1.4;
  const ctx = canvas.getContext('2d');
  let bg = colab ? 'black' : 'white', from = 0, last = colab ? null : { x: 400, y: 250, h: 0, vis: true, pc: 'black', sh: 'classic' };
  const n = Math.min(upto == null ? ops.length : upto, ops.length);
  for (let k = 0; k < n; k++){ const o = ops[k]; if (o.t === 'clear'){ bg = o.bg; from = k; } else if (o.t === 'bg') bg = o.c; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(400, 250); ctx.scale(Z, Z); ctx.translate(-400, -250);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = from; k < n; k++){
    const o = ops[k];
    if (o.t === 'm' && o.d){ ctx.strokeStyle = o.c; ctx.lineWidth = Math.max(o.w, 1) * LW; ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2); ctx.stroke(); }
    else if (o.t === 'fill'){ ctx.fillStyle = o.c; ctx.beginPath(); o.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
    else if (o.t === 'dot'){ ctx.fillStyle = o.c; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill(); }
    else if (o.t === 'text'){ ctx.fillStyle = o.c; ctx.font = (o.fs || 12) * 1.3 + 'px Arial'; ctx.textAlign = o.al || 'left'; ctx.fillText(o.s, o.x, o.y); ctx.textAlign = 'left'; }
    if ('x' in o) last = o;
  }
  if (opts.turtle !== false && last && last.vis !== false) drawTurtleIcon(ctx, last);
}
const anims = new WeakMap();
function animateOps(canvas, ops, opts){
  const prev = anims.get(canvas); if (prev) cancelAnimationFrame(prev);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || ops.length < 3){ renderOps(canvas, ops, ops.length, opts); return; }
  const per = Math.max(1, Math.ceil(ops.length / 100));
  let k = 0;
  const step = () => { k = Math.min(ops.length, k + per); renderOps(canvas, ops, k, opts); if (k < ops.length) anims.set(canvas, requestAnimationFrame(step)); };
  step();
}
function blank(canvas, mode){ renderOps(canvas, [], 0, { mode }); }
function lastFrom(ops){ let f = 0; ops.forEach((o, k) => { if (o.t === 'clear') f = k; }); return f; }
function rasterMask(ops, w){
  const c = document.createElement('canvas'); c.width = 400; c.height = 250;
  const x = c.getContext('2d'); x.scale(.5, .5); x.lineCap = 'round'; x.lineWidth = w; x.strokeStyle = '#fff';
  let segs = 0;
  for (let k = lastFrom(ops); k < ops.length; k++){ const o = ops[k]; if (o.t === 'm' && o.d && (Math.abs(o.x1 - o.x2) + Math.abs(o.y1 - o.y2) > .01)){ x.beginPath(); x.moveTo(o.x1, o.y1); x.lineTo(o.x2, o.y2); x.stroke(); segs++; } }
  const d = x.getImageData(0, 0, 400, 250).data, m = new Uint8Array(400 * 250);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 60 ? 1 : 0;
  return { m, segs };
}
/* contains=true: ученику можно дорисовать лишнее, но всё из образца должно быть */
function sameDrawing(a, b, contains){
  const at = rasterMask(a, 3).m, aw = rasterMask(a, 15).m, bt = rasterMask(b, 3).m, bw = rasterMask(b, 15).m;
  let ca = 0, cb = 0, ea = 0, eb = 0;
  for (let i = 0; i < at.length; i++){ if (at[i]){ ca++; if (!bw[i]) ea++; } if (bt[i]){ cb++; if (!aw[i]) eb++; } }
  if (!ca || !cb) return false;
  return eb / cb < 0.04 && (contains || ea / ca < 0.04);
}
function drawnColors(ops){ const s = new Set(); for (let k = lastFrom(ops); k < ops.length; k++){ const o = ops[k]; if (o.t === 'm' && o.d) s.add(String(o.c).toLowerCase()); if (o.t === 'fill' || o.t === 'dot') s.add(String(o.c).toLowerCase()); } return s.size; }
function segCount(ops){ let n = 0; for (let k = lastFrom(ops); k < ops.length; k++){ const o = ops[k]; if (o.t === 'm' && o.d) n++; } return n; }
function bgOf(ops){ let bg = null; ops.forEach(o => { if (o.t === 'bg') bg = o.c; if (o.t === 'clear') bg = o.bg; }); return bg ? String(bg).toLowerCase() : null; }
function colorsUsed(ops){ const s = new Set(); for (let k = lastFrom(ops); k < ops.length; k++){ const o = ops[k]; if ((o.t === 'm' && o.d) || o.t === 'fill' || o.t === 'dot') s.add(String(o.c).toLowerCase()); } return s; }

/* ---------- вывод в консоль ---------- */
function consoleHTML(res, opts){
  opts = opts || {};
  let html = '';
  let out = res.out || '';
  if (out.length > 20000) out = out.slice(0, 20000) + '\n…';
  html += esc(out).replace(/\x01([\s\S]*?)\x02([\s\S]*?)\x03/g, (m, p, v) => `<span class="pr">${p}</span><span class="in">${v}</span>`);
  if (res.error){
    const e = res.error;
    html += `<span class="e">${esc(e.type)}${e.line ? ' в строке ' + e.line : ''}: ${esc(e.msg || '')}</span>`;
    if (e.text) html += `\n<span class="e">    ${esc(e.text)}</span>`;
    if (e.hint) html += `\n<span class="dim">Подсказка: ${esc(e.hint)}</span>`;
    html += '\n';
  }
  if (!html.trim()) html = '<span class="dim">' + (opts.empty || 'Программа отработала, но ничего не напечатала.') + '</span>';
  return html.replace(/\n$/, '');
}

/* ---------- проверка вывода ---------- */
const NUM = /-?\d+(?:[.,]\d+)?/g;
function matchLines(out, expect){
  const lines = String(out).split('\n').map(l => norm(l).trim()).filter(Boolean);
  let pos = 0;
  for (const e of expect){
    const x = norm(e).trim();
    let found = -1;
    for (let i = pos; i < lines.length; i++){ const l = lines[i]; if (l === x || l.endsWith(' ' + x) || l.endsWith(':' + x)){ found = i; break; } }
    if (found < 0) return { ok: false, missing: String(e) };
    pos = found + 1;
  }
  return { ok: true };
}
function matchOutput(out, expect, lines){
  if (lines) return matchLines(out, expect);
  const text = norm(out);
  let pos = 0;
  for (const e of expect){
    const isNum = typeof e === 'number' || /^-?\d+(?:\.\d+)?$/.test(String(e));
    if (isNum){
      const val = Number(e);
      NUM.lastIndex = pos;
      let m, found = false;
      while ((m = NUM.exec(text))){
        if (Math.abs(Number(m[0].replace(',', '.')) - val) < 1e-6 + Math.abs(val) * 1e-9){ pos = NUM.lastIndex; found = true; break; }
      }
      if (!found) return { ok: false, missing: String(e) };
    } else {
      const i = text.indexOf(norm(e), pos);
      if (i < 0) return { ok: false, missing: String(e) };
      pos = i + norm(e).length;
    }
  }
  return { ok: true };
}
function stripComments(code){
  return code.split('\n').map(l => { let q = null; for (let i = 0; i < l.length; i++){ const c = l[i]; if (q){ if (c === '\\'){ i++; continue; } if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '#') return l.slice(0, i); } return l; }).join('\n');
}

/* ---------- проверка одной задачи (используется и на странице домашки, и в панели тьютора) ---------- */
const refCache = {};
async function refOps(T){ if (!refCache[T.id + T.ref]) refCache[T.id + T.ref] = (await window.PyRun.run(T.ref, T.refStdin || T.stdin || [], 'check')).ops; return refCache[T.id + T.ref]; }
async function checkTask(T, code, stdinLines){
  const PyRun = window.PyRun;
  const isT = T.kind === 'turtle';
  const clean = stripComments(code);
  const items = []; let all = true, shownRes = null;
  const add = (ok, label, note) => { all = all && ok; items.push([ok, label, note]); };
  (T.needs || []).forEach(n => { const src = n.raw ? code : clean; const ok = n.re ? n.re.test(src) : n.test(src, code); add(ok, n.label); });
  if (isT){
    const res = await PyRun.run(code, T.stdin || stdinLines || [], 'check'); shownRes = res;
    const okRun = !res.error; add(okRun, 'код работает без ошибок', okRun ? '' : `${res.error.type}: ${res.error.msg}`);
    (T.draw || []).forEach(d => add(okRun && d.test(res.ops, res), d.label));
    if (T.ref){ const ref = await refOps(T); const same = okRun && sameDrawing(res.ops, ref, !!T.contains); add(same, T.contains ? 'на рисунке есть всё, что на картинке-цели' : 'рисунок совпадает с целью', same || !okRun ? '' : 'Сравни с целью: размеры, углы, направление поворотов и начальную точку.'); }
  } else if (T.tests && T.tests.length){
    for (const t of T.tests){
      const res = await PyRun.run(t.append ? code + '\nprint("\\x00MARK")\n' + t.append : code, t.in || [], 'check');
      if (t.append){ const k = res.out.indexOf('\x00MARK\n'); res.full = res.out; res.out = k >= 0 ? res.out.slice(k + 6) : ''; }
      if (!shownRes) shownRes = t.append ? Object.assign({}, res, { out: (res.full || '').replace(/\x00MARK\n[\s\S]*$/, '') }) : res;
      const label = (t.in && t.in.length ? `ввод ${t.in.join(', ')} → ` : '') + (t.show || t.expect.join(', '));
      if (res.error && !T.allowError){ add(false, label, `${res.error.type}: ${res.error.msg}`); shownRes = res; continue; }
      const m = t.fn ? { ok: t.fn(res.out, res) } : matchOutput(res.out, t.expect, t.lines || T.lines);
      const extra = m.ok ? '' : (m.missing ? `Не нашёл в выводе: «${m.missing}». Твоя программа вывела: ${JSON.stringify(res.out.trim().slice(0, 120))}` : `Вывод не совпадает. Твоя программа вывела: ${JSON.stringify(res.out.trim().slice(0, 120))}`);
      add(m.ok, label, extra);
    }
  } else {
    const res = await PyRun.run(code, stdinLines || [], 'check'); shownRes = res;
    if (!T.allowError) add(!res.error, 'код работает без ошибок', res.error ? `${res.error.type}: ${res.error.msg}` : '');
    if (T.outCheck) T.outCheck.forEach(o => add(o.test(res.out, res), o.label));
  }
  return { ok: all, items, res: shownRes };
}

/* ---------- редактор ---------- */
function makeEditor(host, code, onChange, rows){
  host.innerHTML = '<div class="editor"><div class="gut" aria-hidden="true"></div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Редактор кода"></textarea></div>';
  const ta = $('textarea', host), gut = $('.gut', host);
  if (rows) ta.style.minHeight = Math.min(rows, 24) * 22.4 + 24 + 'px';
  ta.value = code;
  const nums = () => { const n = ta.value.split('\n').length; let s = ''; for (let i = 1; i <= n; i++) s += i + '\n'; gut.textContent = s; };
  nums();
  ta.addEventListener('input', () => { nums(); onChange && onChange(ta.value); });
  ta.addEventListener('scroll', () => { gut.scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', e => {
    const v = ta.value, a = ta.selectionStart, b = ta.selectionEnd;
    const ins = s => { ta.setRangeText(s, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); };
    if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); ins('    '); }
    else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey){
      e.preventDefault();
      const ls = v.lastIndexOf('\n', a - 1) + 1, line = v.slice(ls, a);
      let ind = line.match(/^ */)[0];
      if (/:\s*(#.*)?$/.test(line)) ind += '    ';
      ins('\n' + ind);
    } else if (e.key === 'Backspace' && a === b){
      const ls = v.lastIndexOf('\n', a - 1) + 1, before = v.slice(ls, a);
      if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0){ e.preventDefault(); ta.setSelectionRange(a - 4, a); ins(''); }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); host.dispatchEvent(new CustomEvent('run')); }
  });
  return { get: () => ta.value, set: v => { ta.value = v; nums(); onChange && onChange(v); }, ta };
}

/* ---------- хранилище ---------- */
const KEY = 'kiber-python-v1';
function loadAll(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e){ return {}; } }
function saveAll(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e){} }
const STORE = loadAll();
STORE.hw = STORE.hw || {};

/* ---------- отправка тьютору ---------- */
function b64url(bytes){ let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function packCode(obj){
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream !== 'undefined'){
    try { const cs = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'KP1z.' + b64url(new Uint8Array(await new Response(cs).arrayBuffer())); } catch (e){}
  }
  return 'KP1j.' + b64url(raw);
}
async function sendToTutor(payload){
  if (!CFG.endpoint) return { ok: false, reason: 'noendpoint' };
  try {
    await fetch(CFG.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    return { ok: true };
  } catch (e){ return { ok: false, reason: 'network' }; }
}

/* ---------- конфетти ---------- */
function burst(target, n){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  n = n || 18;
  const r = target.getBoundingClientRect(), cols = ['#6a3fd8', '#14946a', '#f2b632', '#ff7a6e', '#da70d6', '#7cc7ff'];
  for (let i = 0; i < n; i++){
    const c = el('div', 'confetti');
    c.style.left = (r.left + r.width / 2) + 'px'; c.style.top = (r.top + r.height / 2) + 'px';
    c.style.background = cols[i % cols.length];
    c.style.setProperty('--dx', ((Math.random() - .5) * 320) + 'px');
    c.style.animationDuration = (1 + Math.random() * .8) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 2000);
  }
}

/* =========================================================
   Сборка страницы домашки
   ========================================================= */
function mount(HW){
  window.__HW = HW;
  const S = STORE.hw[HW.id] = STORE.hw[HW.id] || {};
  S.quiz = S.quiz || {}; S.bugs = S.bugs || {}; S.tasks = S.tasks || {};
  const save = () => saveAll(STORE);
  const root = document.getElementById('app');
  const quiz = HW.quiz || [], bugs = HW.bugs || [], tasks = HW.tasks || [];
  const MAX = { quiz: quiz.length, bugs: bugs.length, tasks: tasks.reduce((s, t) => s + (t.stars || 2), 0) };
  const MAXALL = MAX.quiz + MAX.bugs + MAX.tasks;
  let secN = 0;
  const sec = (id, title, lead) => { secN++; const s = el('section', 'part'); s.id = id; s.innerHTML = `<div class="part-head"><span class="num">${String(secN).padStart(2, '0')}</span><h2>${title}</h2></div>${lead ? `<p class="lead">${lead}</p>` : ''}`; const g = el('div', 'grid'); s.appendChild(g); root.appendChild(s); return g; };

  /* шапка */
  document.title = `Домашка ${HW.lesson}: ${HW.short || HW.title}`;
  const hero = el('header', 'hero');
  hero.innerHTML = `<div class="topbar"><a href="../index.html">← Все уроки</a><span class="pystate"><i></i><span>Python загружается…</span></span></div>
    <div style="height:18px"></div>
    <div class="kicker">Python · Урок ${HW.lesson} · Домашнее задание</div>
    <h1>${HW.titleHTML || esc(HW.title)}</h1>
    <p>${HW.intro || ''}</p>
    <div class="scorebar" aria-live="polite">
      <div class="stars"><span class="sNow">0</span> <small>из ${MAXALL} ★</small></div>
      <div class="meter"><i></i></div>
      <div class="who"><label for="whoName">Ученик:</label><input id="whoName" placeholder="Имя Фамилия" maxlength="60" autocomplete="name"><span class="sync"></span></div>
    </div>`;
  document.querySelector('.wrap.top').appendChild(hero);
  const nameInp = $('#whoName', hero);
  nameInp.value = STORE.name || '';
  nameInp.addEventListener('change', () => { STORE.name = nameInp.value.trim().replace(/\s+/g, ' '); save(); scheduleSend(true); updateSync(); });
  nameInp.addEventListener('input', () => { STORE.name = nameInp.value.trim().replace(/\s+/g, ' '); save(); updateSync(); });

  /* состояние Python */
  const ps = $('.pystate', hero);
  if (window.PyRun){ PyRun.onState((s, msg) => { ps.className = 'pystate ' + s; $('span', ps).textContent = s === 'ready' ? 'Python готов' : s === 'error' ? (msg || 'Python не загрузился') : 'Python загружается…'; }); PyRun.boot(); }

  /* навигация */
  const navItems = [];
  if (HW.theory) navItems.push(['theory', 'Повторяем теорию']);
  if (HW.example) navItems.push(['example', 'Разбор задачи']);
  if (quiz.length) navItems.push(['quiz', 'Квиз']);
  if (bugs.length) navItems.push(['bugs', 'Найди ошибку']);
  if (tasks.length) navItems.push(['tasks', 'Практика']);
  navItems.push(['finish', 'Итог']);
  const nav = $('nav.toc .wrap');
  nav.innerHTML = navItems.map(([id, t], i) => `<a href="#${id}"><b>${i + 1}</b>${t}</a>`).join('');

  /* песочница: общий запуск кусочков кода из теории */
  let sandbox = null;

  /* ---------- 1. теория ---------- */
  if (HW.theory){
    const g = sec('theory', 'Повторяем теорию', HW.theoryLead || '');
    HW.theory.forEach(b => {
      const c = el('div', b.plain ? '' : 'card');
      c.innerHTML = (b.h ? `<h3>${b.h}</h3>` : '') + (b.html || '');
      g.appendChild(c);
      if (b.init) b.init(c, API);
    });
    // песочница
    const sb = el('div', 'card');
    sb.innerHTML = `<h3>Песочница</h3><p>Здесь можно запустить любой код. Нажми «▶ Попробовать» у примера выше, и он появится здесь.</p><div class="two" style="margin-top:8px"><div><div class="ed"></div><div class="stdin"><label for="sbIn">Ввод для input() — каждое значение с новой строки</label><textarea id="sbIn"></textarea></div><div class="btns"><button class="btn go">▶ Запустить</button></div></div><div><canvas class="turtle" width="800" height="500" hidden></canvas><div class="console"><span class="dim">Здесь появится результат.</span></div></div></div>`;
    g.appendChild(sb);
    const ed = makeEditor($('.ed', sb), S.sandbox || HW.sandbox || 'print("Привет, Python!")\n', v => { S.sandbox = v; save(); }, 9);
    const cv = $('canvas', sb), con = $('.console', sb), inp = $('#sbIn', sb);
    const run = async () => {
      const btn = $('.btn.go', sb); btn.disabled = true; con.innerHTML = '<span class="dim">Выполняю…</span>';
      const res = await PyRun.run(ed.get(), inp.value ? inp.value.split('\n') : [], 'run');
      btn.disabled = false;
      con.innerHTML = consoleHTML(res);
      const hasDraw = res.ops && res.ops.length > 1;
      cv.hidden = !hasDraw;
      if (hasDraw) animateOps(cv, res.ops, { mode: res.mode });
    };
    $('.btn.go', sb).addEventListener('click', run);
    $('.ed', sb).addEventListener('run', run);
    sandbox = { load(code, stdin){ ed.set(code); inp.value = stdin || ''; sb.scrollIntoView({ block: 'center', behavior: 'smooth' }); run(); } };
    // кнопки «Попробовать»
    $$('pre.code[data-try]', g).forEach(pre => {
      const b = el('button', 'try', '▶ Попробовать'); pre.appendChild(b);
      b.addEventListener('click', () => sandbox.load(pre.dataset.code || pre.textContent.replace('▶ Попробовать', ''), pre.dataset.stdin || ''));
    });
  }

  /* ---------- 2. разбор ---------- */
  if (HW.example){
    const X = HW.example;
    const g = sec('example', 'Разбор задачи по шагам', 'Сначала разберёмся, как решать похожую задачу. Потом нажми «▶ Попробовать», чтобы запустить полный код.');
    const c = el('div', 'card');
    c.innerHTML = `<h3>${X.title}</h3>${X.task}<div class="steps" style="margin-top:12px">${X.steps.map((s, i) => `<div class="step"><h4>Шаг ${i + 1}. ${s.h}</h4>${s.html || ''}${s.code ? `<pre class="code">${hl(s.code)}</pre>` : ''}</div>`).join('')}</div><p style="margin-top:14px"><b>Полный код решения:</b></p><pre class="code" data-try="1">${hl(X.code)}</pre>`;
    g.appendChild(c);
    const pre = $('pre[data-try]', c);
    const b = el('button', 'try', '▶ Попробовать'); pre.appendChild(b);
    b.addEventListener('click', () => { if (sandbox) sandbox.load(X.code, (X.stdin || []).join('\n')); });
  }

  /* ---------- 3. квиз ---------- */
  if (quiz.length){
    const g = sec('quiz', 'Квиз', 'Звезда засчитывается, если ответ правильный с первой попытки. Ошибся — прочитай пояснение и выбери снова.');
    quiz.forEach((Q, qi) => {
      const card = el('div', 'card q');
      card.innerHTML = `<div class="q-num">Вопрос ${qi + 1} из ${quiz.length}</div><div class="q-text">${Q.q}</div>` + (Q.code ? `<pre class="code">${hl(Q.code)}</pre>` : '') +
        `<div class="opts">${Q.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div><div class="fb"></div>`;
      const fb = $('.fb', card);
      const paint = () => {
        const st = S.quiz[qi]; if (!st) return;
        $$('.opt', card).forEach(b => { const k = +b.dataset.k; b.classList.toggle('wrong', st.tried.includes(k) && k !== Q.a); b.classList.toggle('right', st.solved && k === Q.a); b.disabled = st.solved || st.tried.includes(k); });
        fb.innerHTML = st.solved ? `<b class="ok">${st.first ? 'Верно! +1 ★' : 'Теперь верно.'}</b> ${Q.e || ''}` : '<b class="no">Не совсем.</b> Подумай ещё и попробуй другой вариант.';
      };
      $$('.opt', card).forEach(b => b.addEventListener('click', () => {
        const k = +b.dataset.k;
        const st = S.quiz[qi] || (S.quiz[qi] = { tried: [], solved: false, first: false });
        if (st.solved) return;
        if (!st.tried.includes(k)) st.tried.push(k);
        if (k === Q.a){ st.solved = true; st.first = st.tried.length === 1; if (st.first) burst(b); }
        save(); paint(); update(); scheduleSend();
      }));
      paint(); g.appendChild(card);
    });
  }

  /* ---------- 4. найди ошибку ---------- */
  if (bugs.length){
    const g = sec('bugs', 'Найди ошибку', 'В каждом кусочке кода спрятана одна ошибка. Нажми на строку, где она живёт. Звезда — за попадание с первого раза.');
    bugs.forEach((B, bi) => {
      const card = el('div', 'card bug');
      const lines = B.code.split('\n');
      card.innerHTML = `<div class="q-num">Код ${bi + 1} из ${bugs.length}</div>${B.q ? `<p>${B.q}</p>` : ''}<pre class="code">${lines.map((l, k) => `<span class="ln" data-k="${k}" tabindex="0" role="button" aria-label="Строка ${k + 1}"><i>${k + 1}</i>${hl(l) || ' '}</span>`).join('')}</pre><div class="fb"></div>`;
      const fb = $('.fb', card);
      const paint = () => {
        const st = S.bugs[bi]; if (!st){ fb.innerHTML = 'Нажми на строку с ошибкой.'; return; }
        $$('.ln', card).forEach(x => { const k = +x.dataset.k; x.classList.toggle('miss', st.tried.includes(k) && k !== B.bad); x.classList.toggle('hit', st.solved && k === B.bad); });
        card.classList.toggle('solved', st.solved);
        fb.innerHTML = st.solved ? `<b class="ok">${st.first ? 'Нашёл(ла)! +1 ★' : 'Нашёл(ла)!'}</b> ${B.e}` : '<b class="no">На этой строке всё в порядке.</b> Ищи дальше.';
      };
      $$('.ln', card).forEach(x => {
        const act = () => {
          const st = S.bugs[bi] || (S.bugs[bi] = { tried: [], solved: false, first: false });
          if (st.solved) return;
          const k = +x.dataset.k; if (!st.tried.includes(k)) st.tried.push(k);
          if (k === B.bad){ st.solved = true; st.first = st.tried.length === 1; if (st.first) burst(x); }
          save(); paint(); update(); scheduleSend();
        };
        x.addEventListener('click', act); x.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); act(); } });
      });
      paint(); g.appendChild(card);
    });
  }

  /* ---------- 5. задачи ---------- */
  const LVL = { 1: ['l1', 'Лёгкая'], 2: ['l2', 'Средняя'], 3: ['l3', 'Сложная'], 4: ['l4', 'Олимпиадная'], 5: ['l4', 'Творческая'] };
  if (tasks.length){
    const g = sec('tasks', 'Практика', HW.tasksLead || 'Пиши код прямо здесь. «▶ Запустить» — посмотреть, что получилось. «✓ Проверить» — я запущу программу на своих примерах и засчитаю звёзды. Код сохраняется в этом браузере.');
    tasks.forEach((T, ti) => {
      T.stars = T.stars || 2;
      const st = S.tasks[T.id] || (S.tasks[T.id] = { code: T.starter || '', done: false });
      if (st.stdin == null) st.stdin = (T.sample || []).join('\n');
      const isT = T.kind === 'turtle';
      const card = el('div', 'card task'); card.id = 't-' + T.id;
      const lv = LVL[T.lvl || 1];
      card.innerHTML = `
        <div class="task-head"><div class="row"><span class="lvl ${lv[0]}">${lv[1]} · ${T.stars} ★</span><h3>${ti + 1}. ${T.title}</h3></div><span class="status"></span></div>
        <div class="body">
          <div>
            <div class="text">${T.text}</div>
            ${T.check ? `<p class="fb" style="margin-top:6px"><b>Проверь себя:</b> ${T.check}</p>` : ''}
            <div class="ed" style="margin-top:10px"></div>
            ${T.input ? `<div class="stdin"><label for="in-${T.id}">Ввод для input() — каждое значение с новой строки</label><textarea id="in-${T.id}"></textarea></div>` : ''}
            <div class="btns"><button class="btn go">▶ Запустить</button><button class="btn chk">✓ Проверить</button><button class="btn ghost rst">↺ Сбросить код</button></div>
            <ul class="checks"></ul>
            ${T.hint ? `<details class="hint"><summary>Подсказка</summary><div>${T.hint}</div></details>` : ''}
          </div>
          <div>
            ${isT ? `<div class="canv2">${T.ref ? '<div><p class="cap">Цель</p><canvas class="turtle tgt" width="800" height="500"></canvas></div>' : ''}<div><p class="cap">Твой рисунок</p><canvas class="turtle mine" width="800" height="500"></canvas></div></div>` : ''}
            ${T.tests && T.tests.length && !T.hideTests ? `<p class="cap" style="margin-top:${isT ? 10 : 0}px">Как я буду проверять</p><div class="tblwrap"><table class="cmds">${T.tests.map(t => `<tr><td>${t.in && t.in.length ? 'ввод: <code>' + t.in.map(esc).join(' ⏎ ') + '</code>' : 'без ввода'}</td><td>ждём: <code>${(t.show || t.expect.join(', ')).replace ? esc(t.show || t.expect.join(', ')) : ''}</code></td></tr>`).join('')}</table></div>` : ''}
            <div class="console"><span class="dim">Здесь появится вывод программы и ошибки.</span></div>
          </div>
        </div>`;
      const con = $('.console', card), status = $('.status', card), checks = $('.checks', card);
      const ed = makeEditor($('.ed', card), st.code, v => { st.code = v; save(); }, Math.max(7, (T.starter || '').split('\n').length + 2));
      const inp = T.input ? $('#in-' + T.id, card) : null;
      if (inp){ inp.value = st.stdin; inp.addEventListener('input', () => { st.stdin = inp.value; save(); }); }
      const mine = $('.mine', card), tgt = $('.tgt', card);
      if (mine) blank(mine, T.colab ? 'colab' : 'turtle');
      if (tgt){ const io = new IntersectionObserver(async ents => { if (ents.some(e => e.isIntersecting)){ io.disconnect(); const ops = await refOps(T); renderOps(tgt, ops, ops.length, { mode: T.colab ? 'colab' : 'turtle', turtle: false }); } }, { rootMargin: '400px' }); io.observe(tgt); }
      const paintStatus = () => { status.textContent = st.done ? `Готово · +${T.stars} ★` : 'Не решено'; status.classList.toggle('done', !!st.done); };
      paintStatus();
      const stdinNow = () => inp && inp.value.length ? inp.value.replace(/\r/g, '').split('\n') : [];
      const btnRun = $('.btn.go', card), btnChk = $('.btn.chk', card);
      const busy = b => { btnRun.disabled = b; btnChk.disabled = b; };
      const run = async () => {
        busy(true); con.innerHTML = '<span class="dim">Выполняю…</span>';
        const res = await PyRun.run(ed.get(), stdinNow(), 'run');
        busy(false);
        con.innerHTML = consoleHTML(res, { empty: isT ? 'Код выполнен. Смотри рисунок.' : undefined });
        if (mine) animateOps(mine, res.ops, { mode: res.mode });
        return res;
      };
      btnRun.addEventListener('click', run);
      $('.ed', card).addEventListener('run', run);
      btnChk.addEventListener('click', async () => {
        busy(true); checks.innerHTML = '<li>Проверяю…</li>';
        const code = ed.get();
        const r = await checkTask(T, code, stdinNow());
        const items = r.items, all = r.ok, res = r.res;
        if (res){ con.innerHTML = consoleHTML(res, { empty: isT ? 'Код выполнен. Смотри рисунок.' : undefined }); if (mine) animateOps(mine, res.ops, { mode: res.mode }); }
        busy(false);
        checks.innerHTML = items.map(([ok, l, note]) => `<li class="${ok ? 'ok' : 'no'}"><span class="chk">${esc(l)}${note ? `<small>${esc(note)}</small>` : ''}</span></li>`).join('');
        if (all){
          con.innerHTML += `\n<span class="ok">✓ Задача решена!${st.done ? '' : ' +' + T.stars + ' ★'}</span>`;
          if (!st.done) burst(btnChk, 40);
          st.done = true;
        }
        st.tried = (st.tried || 0) + 1;
        save(); paintStatus(); update(); scheduleSend();
      });
      $('.rst', card).addEventListener('click', () => { ed.set(T.starter || ''); checks.innerHTML = ''; con.innerHTML = '<span class="dim">Код сброшен к началу.</span>'; if (mine) blank(mine, T.colab ? 'colab' : 'turtle'); });
      g.appendChild(card);
    });
  }

  /* ---------- 6. итог ---------- */
  const fin = sec('finish', 'Итог');
  const fc = el('div', 'card');
  fc.innerHTML = `<div class="big"><span class="fNow">0</span><span style="font-size:.45em;color:var(--muted)"> / ${MAXALL} ★</span></div>
    <div class="sumgrid">${quiz.length ? `<div>Квиз<b class="fQ"></b></div>` : ''}${bugs.length ? `<div>Найди ошибку<b class="fB"></b></div>` : ''}<div>Практика<b class="fT"></b></div></div>
    <h3>Сдать домашку</h3>
    <p class="sendInfo"></p>
    <div class="btns"><button class="btn sendNow">Отправить тьютору</button><button class="btn ghost makeCode">Получить код сдачи</button><button class="btn ghost resetAll">Начать заново</button></div>
    <p class="fb sendMsg"></p>
    <textarea class="copyout" readonly aria-label="Сообщение для тьютора"></textarea>`;
  fin.appendChild(fc);
  $('.sendInfo', fc).innerHTML = CFG.endpoint
    ? 'Твой прогресс отправляется тьютору автоматически, когда ты решаешь задачи. Для этого вверху страницы должно быть вписано имя. Кнопка ниже отправит всё ещё раз прямо сейчас.'
    : 'Нажми «Получить код сдачи» и отправь появившееся сообщение тьютору целиком.';
  if (!CFG.endpoint) $('.sendNow', fc).hidden = true;

  function scores(){
    const q = Object.values(S.quiz).filter(s => s.first).length;
    const b = Object.values(S.bugs).filter(s => s.first).length;
    const t = tasks.reduce((s, T) => s + (S.tasks[T.id] && S.tasks[T.id].done ? T.stars : 0), 0);
    return { q, b, t, all: q + b + t };
  }
  function payload(){
    const mark = o => o ? (o.solved ? (o.first ? 2 : 1) : 0) : 0;
    const sc = scores();
    return { v: 2, name: STORE.name || '', hw: HW.id, lesson: HW.lesson, title: HW.short || HW.title, ts: Date.now(), stars: sc.all, max: MAXALL,
      quiz: quiz.map((_, i) => mark(S.quiz[i])), bugs: bugs.map((_, i) => mark(S.bugs[i])),
      tasks: Object.fromEntries(tasks.map(T => { const s = S.tasks[T.id] || {}; return [T.id, { d: s.done ? 1 : 0, c: s.code === T.starter ? '' : (s.code || ''), i: s.stdin || '', n: s.tried || 0 }]; })) };
  }
  function update(){
    const s = scores();
    $('.sNow', hero).textContent = s.all;
    $('.meter i', hero).style.width = (MAXALL ? s.all / MAXALL * 100 : 0) + '%';
    $('.fNow', fc).textContent = s.all;
    if ($('.fQ', fc)) $('.fQ', fc).textContent = `${s.q} / ${MAX.quiz}`;
    if ($('.fB', fc)) $('.fB', fc).textContent = `${s.b} / ${MAX.bugs}`;
    $('.fT', fc).textContent = `${s.t} / ${MAX.tasks}`;
    S.stars = s.all; S.max = MAXALL; save();
  }
  function updateSync(text, cls){
    const sy = $('.sync', hero);
    if (!CFG.endpoint){ sy.textContent = ''; return; }
    if (text){ sy.textContent = text; sy.className = 'sync ' + (cls || ''); return; }
    if (!STORE.name){ sy.textContent = 'Впиши имя, чтобы тьютор видел твой прогресс'; sy.className = 'sync no'; }
    else if (S.sentAt){ sy.textContent = 'Отправлено тьютору в ' + new Date(S.sentAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); sy.className = 'sync ok'; }
    else { sy.textContent = 'Прогресс будет отправляться тьютору'; sy.className = 'sync'; }
  }
  let sendTimer = null;
  function scheduleSend(now){
    if (!CFG.endpoint || !STORE.name) { updateSync(); return; }
    clearTimeout(sendTimer);
    sendTimer = setTimeout(doSend, now ? 300 : 2500);
  }
  async function doSend(){
    if (!STORE.name){ updateSync(); return false; }
    updateSync('Отправляю…');
    const r = await sendToTutor(payload());
    if (r.ok){ S.sentAt = Date.now(); save(); updateSync(); return true; }
    updateSync('Не получилось отправить. Проверь интернет', 'no'); return false;
  }
  $('.sendNow', fc).addEventListener('click', async () => {
    const msg = $('.sendMsg', fc);
    if (!STORE.name){ msg.innerHTML = '<b class="no">Сначала впиши имя и фамилию вверху страницы.</b>'; nameInp.focus(); nameInp.scrollIntoView({ block: 'center' }); return; }
    const ok = await doSend();
    msg.innerHTML = ok ? '<b class="ok">Отправлено!</b> Тьютор увидит твой прогресс.' : '<b class="no">Не получилось отправить.</b> Нажми «Получить код сдачи» и отправь сообщение тьютору.';
  });
  $('.makeCode', fc).addEventListener('click', async () => {
    const msg = $('.sendMsg', fc), out = $('.copyout', fc);
    if (!STORE.name){ msg.innerHTML = '<b class="no">Сначала впиши имя и фамилию вверху страницы.</b>'; nameInp.focus(); nameInp.scrollIntoView({ block: 'center' }); return; }
    const p = payload(), code = await packCode(p);
    const txt = `Домашка «${HW.short || HW.title}», урок ${HW.lesson}\n${p.name}: ${p.stars} из ${p.max} ★\nКод сдачи (не меняй его):\n${code}`;
    out.value = txt; out.style.display = 'block';
    try { await navigator.clipboard.writeText(txt); msg.innerHTML = '<b class="ok">Сообщение скопировано.</b> Вставь его в чат с тьютором и отправь.'; }
    catch (e){ out.focus(); out.select(); msg.innerHTML = 'Выдели текст ниже, скопируй (Ctrl+C или ⌘+C) и отправь тьютору целиком.'; }
  });
  const rb = $('.resetAll', fc);
  rb.addEventListener('click', () => {
    if (rb.dataset.sure !== '1'){ rb.dataset.sure = '1'; rb.textContent = 'Точно? Нажми ещё раз'; setTimeout(() => { rb.dataset.sure = ''; rb.textContent = 'Начать заново'; }, 3000); return; }
    delete STORE.hw[HW.id]; saveAll(STORE); location.reload();
  });
  update(); updateSync();
  // Прогресс, сделанный раньше (например, до подключения таблицы), отправляем при открытии страницы
  const hasProgress = Object.keys(S.quiz).length || Object.keys(S.bugs).length || tasks.some(T => S.tasks[T.id] && (S.tasks[T.id].done || S.tasks[T.id].tried || (S.tasks[T.id].code || '') !== (T.starter || '')));
  if (CFG.endpoint && STORE.name && hasProgress) scheduleSend();
  if (location.hash){ const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
}

const attr = s => esc(s).replace(/"/g, '&quot;');
function code(src, opts){ opts = opts || {}; const t = opts.try !== false; return `<pre class="code"${t ? ` data-try="1" data-code="${attr(src)}"${opts.stdin ? ` data-stdin="${attr(opts.stdin)}"` : ''}` : ''}>${hl(src)}</pre>`; }
const API = { checkTask, refOps, code, esc, hl, el, $, $$, renderOps, animateOps, blank, sameDrawing, drawnColors, colorsUsed, segCount, bgOf, consoleHTML, matchOutput, makeEditor, packCode, burst, run: (c, i, m) => window.PyRun.run(c, i, m) };
window.HW = Object.assign(API, { mount, STORE, KEY, loadAll });
})();
