/* Домашка к уроку 8: функции и черепашка */
var C = HW.code;
HW.mount({
  id: 'hw8', lesson: 8, title: 'Функции и черепашка', short: 'Функции',
  titleHTML: 'Функции и <span>turtle</span>',
  intro: 'Вспомним, как устроены функции, пройдём квиз, поохотимся на ошибки и напишем свои функции для черепашки. Всё как в PyCharm: <code>from turtle import *</code> в начале и <code>done()</code> в конце.',
  sandbox: 'from turtle import *\n\ndef drawSquare(size):\n    for i in range(4):\n        forward(size)\n        right(90)\n\nspeed(0)\ncolor("darkViolet")\nfor i in range(0, 20):\n    drawSquare(80)\n    forward(360 / 20)\n    left(360 / 20)\nhideturtle()\ndone()\n',
  theoryLead: 'Функция — это кусок кода с именем. Он выполняется только тогда, когда мы его <b>вызываем</b>. Мы уже знаем готовые функции: <code>print()</code>, <code>len()</code>, <code>int()</code>, <code>input()</code>. Теперь пишем свои.',
  theory: [
    { h: 'Из чего состоит функция', html: `<p>Нажимай на части кода, чтобы узнать, что они значат.</p>
      <div class="anat" style="font:clamp(18px,3.6vw,28px)/1.7 var(--mono);background:var(--code-bg);color:var(--code-ink);border-radius:14px;padding:18px 20px;overflow-x:auto;white-space:pre"><span data-part="def" style="color:#c792ff">def</span> <span data-part="name" style="color:#7cc7ff">sumAB</span><span data-part="par" style="color:#ffb86b">(a, b)</span><span data-part="colon">:</span>
<span data-part="body">    print(a + b)</span>

<span data-part="call"><span style="color:#7cc7ff">sumAB</span>(<span style="color:#ffb86b">10, 40</span>)</span></div>
      <div class="explain" style="margin-top:12px;padding:12px 14px;border-left:4px solid var(--accent);background:var(--accent-soft);border-radius:0 10px 10px 0;min-height:52px">Начни с <b>def</b> и пройди по всем частям.</div>`,
      init(el, A){
        const P = {
          def: '<b>def</b> — ключевое слово. С него начинается любая функция.',
          name: '<b>sumAB</b> — имя функции. По нему её вызывают. Хорошее имя объясняет, что функция делает: drawSquare, drawStar.',
          par: '<b>(a, b)</b> — параметры: «коробочки», в которые попадут значения при вызове. Параметров может и не быть: ().',
          colon: '<b>:</b> — двоеточие, как у цикла for: дальше начинается тело.',
          body: '<b>Тело функции</b> пишется с отступом в 4 пробела. Параметры здесь — обычные переменные.',
          call: '<b>Вызов функции.</b> 10 попадает в a, 40 — в b, и выполняется print(10 + 40). На экране появится 50.',
        };
        A.$$('[data-part]', el).forEach(s => { s.tabIndex = 0; s.setAttribute('role', 'button'); s.style.cursor = 'pointer'; s.style.borderRadius = '6px';
          const act = () => { A.$$('[data-part]', el).forEach(x => x.style.background = ''); s.style.background = 'rgba(168,139,255,.35)'; A.$('.explain', el).innerHTML = P[s.dataset.part]; };
          s.addEventListener('click', act); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); act(); } }); });
      } },
    { h: 'Вызови sumAB сам', html: `<p>Впиши значения <code>a</code> и <code>b</code> — код выполнит настоящий Python. Числа складываются, строки в кавычках склеиваются.</p>
      <div class="row" style="margin:10px 0"><span class="mono">sumAB(</span><input class="inp" id="sa" value="10" aria-label="Значение a"><span class="mono">,</span><input class="inp" id="sb" value="40" aria-label="Значение b"><span class="mono">)</span><button class="btn go" id="sgo">▶ Вызвать</button></div>
      <div class="chips"><button class="chip" data-a="10" data-b="40">10, 40</button><button class="chip" data-a="30" data-b="5400">30, 5400</button><button class="chip" data-a='"30"' data-b='"001"'>"30", "001"</button><button class="chip" data-a='"30"' data-b="1">"30", 1</button></div>
      <div class="result" id="sres">Нажми «Вызвать»</div>`,
      init(el, A){
        const go = async () => {
          const a = A.$('#sa', el).value.trim() || 'None', b = A.$('#sb', el).value.trim() || 'None';
          const box = A.$('#sres', el); box.textContent = '…';
          const r = await A.run(`def sumAB(a, b):\n    print(a + b)\n\nsumAB(${a}, ${b})`, [], 'check');
          box.classList.toggle('err', !!r.error);
          box.textContent = r.error ? `${r.error.type}: ${r.error.msg}` : r.out.trim();
        };
        A.$('#sgo', el).addEventListener('click', go);
        A.$$('[data-a]', el).forEach(c => c.addEventListener('click', () => { A.$('#sa', el).value = c.dataset.a; A.$('#sb', el).value = c.dataset.b; go(); }));
      } },
    { h: 'Правила записи', html: `<ol><li>В начале — <code>def</code>.</li><li>Потом имя. Большие и маленькие буквы различаются: <code>drawSquare</code> и <code>drawsquare</code> — разные имена.</li><li>В скобках — параметры (могут отсутствовать).</li><li>В конце строки — двоеточие.</li><li>Тело — с отступом в 4 пробела.</li><li>Чтобы функция сработала, её надо <b>вызвать</b>.</li></ol>
      <div class="callout warn" style="margin-top:10px"><b>Частая ошибка.</b><span>Написал функцию, запустил — ничего не произошло. Функцию только объявили! Допиши вызов, например <code>drawSquare(100)</code>.</span></div>` },
    { h: 'Параметр делает функцию гибкой', html: `<p>Параметр <code>size</code> стоит везде, где черепашка идёт вперёд. Двигай ползунок — тот же код нарисует квадрат другого размера.</p>
      <div class="two" style="margin-top:10px"><div><pre class="code" id="sqCode"></pre><div class="slider"><span>size</span><input type="range" id="sqSize" min="20" max="200" value="100" aria-label="Размер квадрата"><span id="sqVal">100</span></div></div><canvas class="turtle" id="sqCv" width="800" height="500"></canvas></div>`,
      init(el, A){
        const upd = () => {
          const s = +A.$('#sqSize', el).value; A.$('#sqVal', el).textContent = s;
          A.$('#sqCode', el).innerHTML = A.hl(`from turtle import *\n\ndef drawSquare(size):\n    for i in range(4):\n        forward(size)\n        right(90)\n\ndrawSquare(${s})\ndone()`);
          const ops = []; let x = 400, y = 250, h = 0;
          for (let i = 0; i < 4; i++){ const nx = x + s * Math.cos(h * Math.PI / 180), ny = y + s * Math.sin(h * Math.PI / 180); ops.push({ t: 'm', x1: x, y1: y, x2: nx, y2: ny, d: true, c: 'black', w: 2, x: nx, y: ny, h, vis: true }); x = nx; y = ny; h += 90; ops.push({ t: 'r', x, y, h, vis: true, sh: 'classic', pc: 'black' }); }
          A.renderOps(A.$('#sqCv', el), ops, ops.length);
        };
        A.$('#sqSize', el).addEventListener('input', upd); upd();
      } },
    { h: 'Функции-фигуры из урока', html: `<div class="two">
      <div><p class="cap">Треугольник</p>${C('from turtle import *\n\ndef drawTriangle(size):\n    for i in range(3):\n        forward(size)\n        left(120)\n\ndrawTriangle(150)\ndone()')}</div>
      <div><p class="cap">Многоугольник</p>${C('from turtle import *\n\ndef drawPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        left(360 / edges)\n\ndrawPolygon(80, 6)\ndone()')}</div>
      <div><p class="cap">Круг из отрезков</p>${C('from turtle import *\n\ndef drawCircle(size):\n    for i in range(20):\n        forward(size)\n        left(360 / 20)\n\ndrawCircle(20)\ndone()')}</div>
      <div><p class="cap">Закрашенный круг из лучей</p>${C('from turtle import *\n\ndef drawRound(size):\n    speed(0)\n    for i in range(360):\n        forward(size)\n        backward(size)\n        right(1)\n\ndrawRound(100)\ndone()')}</div></div>` },
    { h: 'Остаток от деления и список цветов', html: `<p><code>colors[i]</code> выдаст ошибку, когда <code>i</code> станет больше количества цветов. А <code>i % len(colors)</code> всегда от 0 до <code>len(colors) - 1</code> — цвета идут по кругу.</p>
      <div class="chips" id="modN"><span class="mono" style="align-self:center;color:var(--muted)">цветов в списке:</span><button class="chip on" data-n="3">3</button><button class="chip" data-n="4">4</button><button class="chip" data-n="5">5</button></div>
      <div id="modRow" style="display:grid;grid-template-columns:repeat(12,minmax(40px,1fr));gap:6px;overflow-x:auto"></div>
      <div class="slider" style="margin-top:12px"><span>i</span><input type="range" id="modI" min="0" max="11" value="4" aria-label="Значение i"><span id="modIv">4</span></div>
      <div id="modS" style="font:600 15px/1.6 var(--mono);margin-top:12px"></div>
      ${C('from turtle import *\n\ncolors = ["lavender", "plum", "orchid", "mediumpurple", "indigo"]\nwidth(4)\nfor i in range(36):\n    color(colors[i % len(colors)])\n    forward(i * 6)\n    right(91)\ndone()')}`,
      init(el, A){
        const PAL = [['lavender', '#e6e6fa'], ['plum', '#dda0dd'], ['orchid', '#da70d6'], ['mediumPurple', '#9370db'], ['indigo', '#4b0082']];
        let n = 3;
        const upd = () => {
          const i = +A.$('#modI', el).value; A.$('#modIv', el).textContent = i;
          const row = A.$('#modRow', el); row.innerHTML = '';
          for (let k = 0; k < 12; k++){ const c = PAL[k % n]; const b = A.el('button', 'chip' + (k === i ? ' on' : ''), `i=${k}<div style="height:16px;border-radius:5px;margin:4px 0;background:${c[1]}"></div>${k}%${n}=${k % n}`); b.style.borderRadius = '10px'; b.style.padding = '6px 2px'; b.addEventListener('click', () => { A.$('#modI', el).value = k; upd(); }); row.appendChild(b); }
          A.$('#modS', el).innerHTML = `i = ${i} → ${i} % ${n} = <b style="color:var(--accent)">${i % n}</b> → colors[${i % n}] = <b style="color:var(--accent)">"${PAL[i % n][0]}"</b>` + (i >= n ? `<br><span style="color:var(--coral)">А colors[${i}] дал бы IndexError: в списке только ${n} цвета(ов).</span>` : '');
        };
        A.$$('#modN .chip', el).forEach(b => b.addEventListener('click', () => { A.$$('#modN .chip', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); n = +b.dataset.n; upd(); }));
        A.$('#modI', el).addEventListener('input', upd); upd();
      } },
    { h: 'Цвет из трёх чисел: RGB', html: `<p><code>color()</code> принимает название цвета или три числа от 0 до 255 — сколько красного, зелёного и синего. В PyCharm сначала напиши <code>colormode(255)</code>, иначе будет ошибка <code>bad color sequence</code>.</p>
      <div class="two" style="margin-top:10px;align-items:center"><div>
        <div class="slider"><span style="color:#e5484d">R</span><input type="range" id="cr" min="0" max="255" value="106" aria-label="Красный"><span id="crv">106</span></div>
        <div class="slider"><span style="color:#30a46c">G</span><input type="range" id="cg" min="0" max="255" value="63" aria-label="Зелёный"><span id="cgv">63</span></div>
        <div class="slider"><span style="color:#3e63dd">B</span><input type="range" id="cb" min="0" max="255" value="216" aria-label="Синий"><span id="cbv">216</span></div>
        <div class="result" id="rgbCode" style="margin-top:10px"></div></div>
        <div id="swatch" style="height:140px;border-radius:16px;border:1px solid var(--line)"></div></div>`,
      init(el, A){
        const upd = () => { const v = ['cr', 'cg', 'cb'].map(id => +A.$('#' + id, el).value); ['cr', 'cg', 'cb'].forEach((id, k) => A.$('#' + id + 'v', el).textContent = v[k]); A.$('#swatch', el).style.background = `rgb(${v})`; A.$('#rgbCode', el).textContent = `colormode(255)\ncolor(${v.join(', ')})`; };
        A.$$('input', el).forEach(i => i.addEventListener('input', upd)); upd();
      } },
  ],
  quiz: [
    { q: 'Каким словом начинается объявление функции?', o: ['function', 'def', 'func', 'new'], a: 1, e: 'def — от слова define, «определить».' },
    { q: 'Функция <code>drawSquare()</code> написана, программа запущена, но ничего не нарисовалось. Почему?', o: ['Черепашка устала', 'Функцию не вызвали', 'Нужен print', 'Квадраты рисовать нельзя'], a: 1, e: 'Объявленная функция ждёт вызова: drawSquare().' },
    { q: 'Что напечатает код?', code: 'def sumAB(a, b):\n    print(a + b)\n\nsumAB("30", "001")', o: ['31', '0031', '30001', 'Ошибку'], a: 2, e: 'Это строки: они склеиваются.' },
    { q: 'Зачем в <code>drawSquare(size)</code> параметр <code>size</code>?', o: ['Количество квадратов', 'Длина стороны', 'Цвет', 'Ни зачем'], a: 1, e: 'size стоит в forward(size).' },
    { q: 'Какое значение получит <code>colors[i % len(colors)]</code>?', code: 'colors = ["red", "green", "blue", "yellow"]\ni = 6', o: ['"red"', '"green"', '"blue"', '"yellow"'], a: 2, e: '6 % 4 = 2, colors[2] = "blue".' },
    { q: 'Каким цветом будет линия после <code>colormode(255)</code> и <code>color(0, 0, 255)</code>?', o: ['Красным', 'Зелёным', 'Синим', 'Чёрным'], a: 2, e: 'На максимуме только синий.' },
    { q: 'Что нарисует <code>drawPolygon(100, 6)</code>?', code: 'def drawPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        left(360 / edges)', o: ['Треугольник', 'Квадрат', 'Шестиугольник', 'Круг'], a: 2, e: 'edges = 6 сторон с поворотом 60°.' },
    { q: 'Окно в PyCharm сразу закрылось после рисования. Чего не хватает в конце?', o: ['print()', 'done()', 'exit()', 'stop()'], a: 1, e: 'done() оставляет окно открытым.' },
    { q: 'Куда смотрит черепашка сразу после <code>from turtle import *</code>?', o: ['Вверх', 'Вниз', 'Вправо', 'Влево'], a: 2, e: 'Она в центре, в (0, 0), и смотрит вправо.' },
    { q: 'Почему пишем <code>colors[i % len(colors)]</code>, а не <code>colors[i]</code>?', o: ['Быстрее', 'Чтобы i не вышел за пределы списка', 'Иначе цвета чёрные', 'Для красоты'], a: 1, e: 'Остаток всегда меньше длины списка — IndexError не будет.' },
  ],
  bugs: [
    { code: 'def drawSquare(size)\n    for i in range(4):\n        forward(size)\n        right(90)', bad: 0, e: 'Нет двоеточия: <code>def drawSquare(size):</code>' },
    { code: 'def drawTriangle(size):\nfor i in range(3):\n    forward(size)\n    left(120)', bad: 1, e: 'Цикл должен быть внутри функции, а он без отступа — IndentationError.' },
    { code: 'def drawSquare(size):\n    for i in range(4):\n        forward(100)\n        right(90)\n\ndrawSquare(200)\ndone()', bad: 2, e: 'Ошибки не будет, но квадрат всегда 100. Нужно <code>forward(size)</code>.' },
    { code: 'def drawStar(size):\n    for i in range(5):\n        forward(size)\n        right(144)\n\ndrawstar(150)\ndone()', bad: 5, e: 'Функция drawStar, а вызывают drawstar — NameError.' },
    { code: 'colors = ["red", "orange", "yellow"]\nfor i in range(30):\n    color(colors[i])\n    forward(10)\n    right(12)', bad: 2, e: 'При i = 3 будет IndexError. Правильно: <code>colors[i % len(colors)]</code>.' },
    { code: 'import turtle\nt = turtle.Turtle()\n\ndef drawTriangle(size):\n    for i in range(3):\n        t.forward(size)\n        t.Left(120)\n\ndrawTriangle(100)\nturtle.done()', bad: 6, e: 'Нет команды <code>Left</code>, есть <code>left</code> — AttributeError.' },
    { code: 'from turtle import *\n\ndef gradientLine(n):\n    for i in range(n):\n        color(i, 0, 255 - i)\n        forward(2)\n\ngradientLine(200)\ndone()', bad: 4, e: 'Без <code>colormode(255)</code> turtle ждёт числа от 0 до 1 — ошибка bad color sequence.' },
  ],
  tasks: [
    { id: 'mult', lvl: 1, stars: 2, title: 'Разминка: умножалка',
      text: '<p>По образцу <code>sumAB</code> напиши функцию <code>multAB(a, b)</code>, которая печатает произведение двух чисел.</p>',
      starter: 'def multAB(a, b):\n    pass  # замени pass на свой код\n\nmultAB(6, 7)\n',
      tests: [{ in: [], append: 'multAB(3, 4)\nmultAB(10, 10)\nmultAB(0, 99)', expect: ['12', '100', '0'], lines: true, show: 'multAB(3, 4) → 12, multAB(10, 10) → 100, multAB(0, 99) → 0' }],
      needs: [{ re: /def\s+multAB\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:/, label: 'есть функция multAB с двумя параметрами' }],
      hint: 'Внутри функции одна строка: <code>print(a * b)</code>.' },
    { id: 'greet', lvl: 1, stars: 2, title: 'Приветствие',
      text: '<p>Напиши функцию <code>greet(name)</code>: вызов <code>greet("Аня")</code> печатает ровно <code>Привет, Аня!</code></p>',
      starter: 'def greet(name):\n    pass  # замени pass на свой код\n\ngreet("Аня")\n',
      tests: [{ in: [], append: 'greet("Черепашка")\ngreet("Python")', expect: ['Привет, Черепашка!', 'Привет, Python!'], lines: true, show: 'greet("Черепашка") → Привет, Черепашка!' }],
      needs: [{ re: /def\s+greet\s*\(\s*\w+\s*\)\s*:/, label: 'есть функция greet с одним параметром' }],
      hint: '<code>print("Привет, " + name + "!")</code>' },
    { id: 'stairs', lvl: 1, stars: 2, kind: 'turtle', title: 'Лесенка',
      text: '<p>Напиши функцию <code>drawStep(size)</code>: <code>left(90)</code>, вперёд на <code>size</code>, <code>right(90)</code>, вперёд на <code>size</code>. В цикле вызови её 4 раза с размером 40.</p>',
      starter: 'from turtle import *\n\ndef drawStep(size):\n    pass  # нарисуй одну ступеньку\n\n# вызови drawStep 4 раза в цикле\n\ndone()\n',
      ref: 'from turtle import *\ndef drawStep(size):\n    left(90)\n    forward(size)\n    right(90)\n    forward(size)\nfor i in range(4):\n    drawStep(40)',
      needs: [{ re: /def\s+drawStep\s*\(\s*\w+\s*\)\s*:/, label: 'есть функция drawStep(size)' }, { test: c => (c.match(/drawStep\s*\(/g) || []).length >= 2, label: 'функция вызывается' }] },
    { id: 'rect', lvl: 2, stars: 2, kind: 'turtle', title: 'Прямоугольник с двумя параметрами',
      text: '<p><code>drawRect(a, b)</code>: вперёд на <code>a</code>, направо 90, вперёд на <code>b</code>, направо 90 — и так 2 раза. Нарисуй <code>drawRect(220, 100)</code>.</p>',
      starter: 'from turtle import *\n\ndef drawRect(a, b):\n    pass\n\ndrawRect(220, 100)\ndone()\n',
      ref: 'from turtle import *\ndef drawRect(a, b):\n    for i in range(2):\n        forward(a)\n        right(90)\n        forward(b)\n        right(90)\ndrawRect(220, 100)',
      needs: [{ re: /def\s+drawRect\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:/, label: 'есть функция drawRect с двумя параметрами' }] },
    { id: 'star', lvl: 2, stars: 2, kind: 'turtle', title: 'Звезда',
      text: '<p>Функция <code>drawStar(size)</code>: 5 раз вперёд на <code>size</code> и направо на 144. Нарисуй <code>drawStar(150)</code> золотым цветом: <code>color("gold")</code>. Бонус: закрась её с <code>begin_fill()</code> и <code>end_fill()</code>.</p>',
      starter: 'from turtle import *\n\ncolor("gold")\n\n# напиши функцию drawStar(size)\n\ndrawStar(150)\ndone()\n',
      ref: 'from turtle import *\ndef drawStar(size):\n    for i in range(5):\n        forward(size)\n        right(144)\ndrawStar(150)',
      needs: [{ re: /def\s+drawStar\s*\(\s*\w+\s*\)\s*:/, label: 'есть функция drawStar(size)' }, { re: /for\s+\w+\s+in\s+range/, label: 'внутри есть цикл for' }] },
    { id: 'flower', lvl: 3, stars: 2, kind: 'turtle', title: 'Цветок из шестиугольников',
      text: '<p>Две функции: <code>drawPolygon(size, edges)</code> (вперёд на size, налево на 360 / edges) и <code>flower(petals)</code>, которая petals раз рисует <code>drawPolygon(50, 6)</code> и поворачивает направо на <code>360 / petals</code>. Нарисуй <code>flower(10)</code>.</p>',
      starter: 'from turtle import *\n\nspeed(0)\ncolor("orchid")\n\ndef drawPolygon(size, edges):\n    pass\n\ndef flower(petals):\n    pass\n\nflower(10)\ndone()\n',
      ref: 'from turtle import *\ndef drawPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        left(360 / edges)\ndef flower(petals):\n    for i in range(petals):\n        drawPolygon(50, 6)\n        right(360 / petals)\nflower(10)',
      needs: [{ re: /def\s+drawPolygon\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:/, label: 'есть функция drawPolygon(size, edges)' }, { re: /def\s+flower\s*\(\s*\w+\s*\)\s*:/, label: 'есть функция flower(petals)' }, { re: /def\s+flower[\s\S]*drawPolygon\s*\(/, label: 'flower вызывает drawPolygon' }] },
    { id: 'rainbow', lvl: 3, stars: 2, kind: 'turtle', title: 'Радужный многоугольник',
      text: '<p>Функция <code>rainbowPolygon(size, edges)</code> перед каждой стороной меняет цвет: <code>color(colors[i % len(colors)])</code>. Список цветов — свой, минимум 3. Нарисуй <code>rainbowPolygon(100, 7)</code>.</p>',
      starter: 'from turtle import *\n\nwidth(5)\ncolors = ["red", "orange", "gold", "lime", "deepskyblue", "blue", "violet"]\n\ndef rainbowPolygon(size, edges):\n    pass\n\nrainbowPolygon(100, 7)\ndone()\n',
      ref: 'from turtle import *\nwidth(5)\ndef rainbowPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        right(360 / edges)\nrainbowPolygon(100, 7)',
      needs: [{ re: /def\s+rainbowPolygon\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:/, label: 'есть функция rainbowPolygon(size, edges)' }, { re: /%\s*len\s*\(/, label: 'используется % len(...)' }],
      draw: [{ label: 'на рисунке минимум 3 цвета', test: ops => HW.drawnColors(ops) >= 3 }] },
    { id: 'sun', lvl: 3, stars: 2, kind: 'turtle', title: 'Градиентное солнце',
      text: '<p>Преврати <code>drawRound(size)</code> в <code>gradientSun(size)</code>: перед каждым лучом задавай цвет тремя числами, зависящими от <code>i</code>, например <code>color(255, int(i * 255 / 360), 0)</code>. Не забудь <code>colormode(255)</code>! Нарисуй <code>gradientSun(150)</code>.</p>',
      starter: 'from turtle import *\n\nspeed(0)\n# не забудь colormode(255)\n\ndef gradientSun(size):\n    for i in range(0, 360):\n        # задай цвет, зависящий от i\n        forward(size)\n        backward(size)\n        right(1)\n\ngradientSun(150)\nhideturtle()\ndone()\n',
      ref: 'from turtle import *\ndef gradientSun(size):\n    for i in range(0, 360):\n        forward(size)\n        backward(size)\n        right(1)\ngradientSun(150)',
      needs: [{ re: /def\s+gradientSun\s*\(\s*\w+\s*\)\s*:/, label: 'есть функция gradientSun(size)' }, { re: /colormode\s*\(\s*255\s*\)/, label: 'включён colormode(255)' }],
      draw: [{ label: 'плавный градиент (больше 30 оттенков)', test: ops => HW.drawnColors(ops) > 30 }] },
    { id: 'boss', lvl: 5, stars: 3, kind: 'turtle', title: 'Финальный босс: свой узор',
      text: '<p>Придумай свой узор: минимум <b>две свои функции</b>, хотя бы один цикл <code>for</code> и не меньше 30 линий. Лучшие узоры покажем на занятии!</p>',
      starter: 'from turtle import *\n\nspeed(0)\nbgcolor("midnightblue")\ncolors = ["gold", "orange", "tomato", "hotpink"]\n\ndef drawTriangle(size):\n    for i in range(3):\n        forward(size)\n        left(120)\n\ndef pattern(count):\n    pass  # твой узор!\n\npattern(24)\nhideturtle()\ndone()\n',
      needs: [{ test: c => (c.match(/^\s*def\s+\w+/gm) || []).length >= 2, label: 'минимум две функции def' }, { re: /for\s+\w+\s+in\s+/, label: 'есть цикл for' }],
      draw: [{ label: 'не меньше 30 линий', test: ops => HW.segCount(ops) >= 30 }],
      hint: 'В <code>pattern(count)</code> сделай цикл на count шагов: меняй цвет через <code>colors[i % len(colors)]</code>, рисуй <code>drawTriangle(120)</code> и поворачивай на <code>360 / count</code>.' },
  ],
});
