/* Домашка к уроку 7: рисуем черепашкой (turtle в PyCharm) */
var C = HW.code;
var isColor = (ops, names) => [...HW.colorsUsed(ops)].some(c => names.some(n => c.replace(/\s/g, '') === n || c.startsWith(n)));
HW.mount({
  id: 'hw7', lesson: 7, title: 'Рисуем черепашкой', short: 'Черепашка',
  titleHTML: 'Рисуем <span>черепашкой</span>',
  intro: 'Фигуры, перемещения без рисования, цвет и узоры. Задачи из домашки переписаны для библиотеки turtle, как в PyCharm. Код с ColabTurtle здесь тоже работает.',
  sandbox: 'from turtle import *\n\nspeed(0)\ncolor("darkViolet")\nfor i in range(0, 6):\n    left(60)\n    forward(80)\ndone()\n',
  theory: [
    { h: '1. Подготовка', html: `<p>В PyCharm черепашку подключают одной строкой, а в конце пишут <code>done()</code>, чтобы окно с рисунком не закрылось.</p>
      ${C('from turtle import *\n\nforward(100)\nleft(90)\nforward(50)\ndone()')}
      <div class="callout tip"><b>Если в Colab.</b><span>Там нужны «заклинание» <code>!pip3 install ColabTurtle</code>, <code>from ColabTurtle.Turtle import *</code> и <code>initializeTurtle()</code> в начале. На этом сайте работают оба варианта.</span></div>` },
    { h: '2. Поле для рисования', html: `<p>В turtle точка <code>(0, 0)</code> — центр окна. Ось X направлена вправо, ось Y — <b>вверх</b>: чем больше Y, тем выше. В начале черепашка стоит в центре и смотрит вправо.</p>
      <div class="coords"></div>
      <div class="callout"><b>В ColabTurtle</b><span>всё иначе: (0, 0) — левый верхний угол, Y растёт вниз, центр — (400, 250), черепашка смотрит вверх.</span></div>`,
      init(el, A){
        const box = A.$('.coords', el);
        box.innerHTML = `<div class="two" style="margin-top:10px"><div><div class="slider"><span>x</span><input type="range" id="gx" min="-300" max="300" value="150" aria-label="x"><span id="gxv">150</span></div><div class="slider"><span>y</span><input type="range" id="gy" min="-200" max="200" value="100" aria-label="y"><span id="gyv">100</span></div><div class="result" id="gc" style="margin-top:10px"></div></div><canvas class="turtle" width="800" height="500"></canvas></div>`;
        const cv = A.$('canvas', box);
        const draw = () => {
          const x = +A.$('#gx', box).value, y = +A.$('#gy', box).value;
          A.$('#gxv', box).textContent = x; A.$('#gyv', box).textContent = y;
          A.$('#gc', box).textContent = `penup()\ngoto(${x}, ${y})`;
          const ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 800, 500);
          ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; for (let i = -400; i <= 400; i += 50){ ctx.beginPath(); ctx.moveTo(400 + i, 0); ctx.lineTo(400 + i, 500); ctx.stroke(); } for (let j = -250; j <= 250; j += 50){ ctx.beginPath(); ctx.moveTo(0, 250 + j); ctx.lineTo(800, 250 + j); ctx.stroke(); }
          ctx.strokeStyle = '#999'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(800, 250); ctx.moveTo(400, 0); ctx.lineTo(400, 500); ctx.stroke();
          ctx.fillStyle = '#6a3fd8'; ctx.font = '22px sans-serif'; ctx.fillText('(0, 0)', 408, 242); ctx.fillText('x →', 750, 242); ctx.fillText('y ↑', 408, 24);
          ctx.beginPath(); ctx.arc(400 + x, 250 - y, 10, 0, 7); ctx.fill(); ctx.fillText(`(${x}, ${y})`, 400 + x + 14, 250 - y - 12);
        };
        A.$$('input', box).forEach(i => i.addEventListener('input', draw)); draw();
      } },
    { h: '3. Движение и повороты', html: `<div class="tblwrap"><table class="cmds"><tr><td><code>forward(100)</code> / <code>backward(50)</code></td><td>вперёд / назад</td></tr><tr><td><code>right(90)</code> / <code>left(60)</code></td><td>повернуть направо / налево</td></tr><tr><td><code>goto(x, y)</code></td><td>перейти в точку, направление сохраняется</td></tr><tr><td><code>setx(…)</code>, <code>sety(…)</code></td><td>поменять одну координату</td></tr><tr><td><code>home()</code></td><td>вернуться в центр, смотреть вправо</td></tr><tr><td><code>setheading(90)</code></td><td>посмотреть вверх (0 — вправо, 180 — влево, 270 — вниз)</td></tr></table></div>` },
    { h: '4. Перо, цвет и скорость', html: `<div class="tblwrap"><table class="cmds"><tr><td><code>penup()</code> / <code>pendown()</code></td><td>поднять перо (идти без следа) / опустить</td></tr><tr><td><code>color("gold")</code></td><td>цвет линии</td></tr><tr><td><code>bgcolor("teal")</code></td><td>цвет фона</td></tr><tr><td><code>width(3)</code></td><td>толщина линии</td></tr><tr><td><code>speed(0)</code></td><td>самая быстрая скорость (1 — медленно, 10 — быстро)</td></tr><tr><td><code>circle(50)</code></td><td>круг радиусом 50 (центр — слева от черепашки)</td></tr><tr><td><code>hideturtle()</code></td><td>спрятать черепашку</td></tr></table></div>` },
    { h: '5. Циклы + черепашка = правильные фигуры', html: `<p>Главное правило: за всю фигуру черепашка поворачивается на 360°. Угол поворота = <b>360 / количество углов</b>.</p><div class="poly"></div>`,
      init(el, A){
        const box = A.$('.poly', el);
        box.innerHTML = `<div class="two" style="margin-top:10px"><div><div class="slider"><span>n</span><input type="range" id="pn" min="3" max="12" value="5" aria-label="Количество углов"><span id="pnv">5</span></div><pre class="code" id="pcode"></pre></div><canvas class="turtle" width="800" height="500"></canvas></div>`;
        const cv = A.$('canvas', box);
        const draw = () => {
          const n = +A.$('#pn', box).value; A.$('#pnv', box).textContent = n;
          const side = Math.round(600 / n), ang = +(360 / n).toFixed(2);
          A.$('#pcode', box).innerHTML = A.hl(`for i in range(${n}):\n    forward(${side})\n    left(${ang})   # 360 / ${n}`);
          const ops = []; let x = 400 - side / 2, y = 400, h = 0;
          for (let i = 0; i < n; i++){ const nx = x + side * Math.cos(h * Math.PI / 180), ny = y + side * Math.sin(h * Math.PI / 180); ops.push({ t: 'm', x1: x, y1: y, x2: nx, y2: ny, d: true, c: '#6a3fd8', w: 3, x: nx, y: ny, h, vis: true }); x = nx; y = ny; h -= 360 / n; }
          A.renderOps(cv, ops, ops.length, { turtle: false });
        };
        A.$('input', box).addEventListener('input', draw); draw();
      } },
  ],
  example: {
    title: 'Задача: шестиугольник и глаз смайлика',
    task: '<p>Нарисовать шестиугольник циклом, а потом перейти без следа в другую точку и нарисовать круглый глаз.</p>',
    steps: [
      { h: 'Шестиугольник', html: '<p>6 сторон, поворот на 360 / 6 = 60°.</p>', code: 'for i in range(0, 6):\n    left(60)\n    forward(50)' },
      { h: 'Переход без рисования', html: '<p>Поднимаем перо, идём в точку, опускаем перо.</p>', code: 'penup()\ngoto(150, 80)\npendown()' },
      { h: 'Круг из маленьких шагов', html: '<p>Круг — это многоугольник с очень многими короткими сторонами: 60 раз по 3 пикселя с поворотом на 6°.</p>', code: 'for i in range(0, 60):\n    forward(3)\n    left(6)' },
    ],
    code: 'from turtle import *\n\nfor i in range(0, 6):\n    left(60)\n    forward(50)\n\npenup()\ngoto(150, 80)\npendown()\ncolor("gold")\nfor i in range(0, 60):\n    forward(3)\n    left(6)\ndone()',
  },
  quiz: [
    { q: 'На какой угол поворачивать черепашку, чтобы нарисовать пятиугольник?', o: ['60', '72', '90', '108'], a: 1, e: '360 / 5 = 72.' },
    { q: 'Что делает <code>penup()</code>?', o: ['Прячет черепашку', 'Черепашка идёт, но не рисует', 'Поворачивает вверх', 'Стирает рисунок'], a: 1, e: 'Перо поднято — следа нет. pendown() опускает его.' },
    { q: 'Где точка <code>(0, 0)</code> в turtle (PyCharm)?', o: ['Левый верхний угол', 'Центр окна', 'Левый нижний угол', 'Где черепашка'], a: 1, e: 'В обычном turtle (0, 0) — центр, а Y растёт вверх.' },
    { q: 'Почему у звезды поворот 144°?', o: ['Так красивее', 'Черепашка обходит центр два раза: 720 / 5', '180 − 36', 'Это угол квадрата'], a: 1, e: 'У звезды черепашка поворачивается в сумме на 720°, а 720 / 5 = 144.' },
    { q: 'Что получится?', code: 'for i in range(60):\n    forward(12)\n    left(6)', o: ['Квадрат', 'Звезда', 'Почти круг', 'Прямая'], a: 2, e: '60 маленьких сторон по 6° — получается круг.' },
  ],
  bugs: [
    { code: 'from turtle import *\nfor i in range(4):\n    forward(100)\nright(90)\ndone()', bad: 3, e: 'Поворот без отступа — он не в цикле. Черепашка 4 раза идёт вперёд и рисует одну длинную линию. Нужно сдвинуть <code>right(90)</code> внутрь цикла.' },
    { code: 'from turtle import *\nbgcolor("skyblue")\ncolor("Золотой")\ncircle(50)\ndone()', bad: 2, e: 'Цвета пишутся по-английски: <code>color("gold")</code>.' },
    { code: 'from turtle import *\nfor i in range(6):\n    forward(80)\n    left(72)\ndone()', bad: 3, e: 'Для шестиугольника угол 360 / 6 = 60, а 72 — это пятиугольник. Фигура не замкнётся.' },
  ],
  tasksLead: 'Слева условие и редактор, справа картинка-цель и твой рисунок. «✓ Проверить» сравнит рисунки и засчитает звёзды. Не забывай <code>from turtle import *</code> в начале.',
  tasks: [
    { id: 'star', lvl: 1, stars: 2, kind: 'turtle', title: 'Звезда',
      text: '<p>Нарисуй пятиконечную звезду со стороной 150 пикселей. Используй цикл <code>for</code>: <code>forward(150)</code> и поворот на 144°.</p>',
      starter: 'from turtle import *\n\n# твой цикл здесь\n\ndone()\n',
      ref: 'from turtle import *\nfor i in range(5):\n    forward(150)\n    right(144)',
      needs: [{ re: /\bfor\b/, label: 'используется цикл for' }] },
    { id: 'stairs', lvl: 1, stars: 2, kind: 'turtle', title: 'Лесенка',
      text: '<p>Нарисуй лесенку из 6 ступенек, каждая — 40 пикселей вверх и 40 вправо. Сначала переставь черепашку левее и ниже: <code>penup()</code>, <code>goto(-120, -120)</code>, <code>pendown()</code>.</p><p>Одна ступенька: <code>left(90)</code>, <code>forward(40)</code>, <code>right(90)</code>, <code>forward(40)</code>.</p>',
      check: 'лесенка поднимается слева направо.',
      starter: 'from turtle import *\n\npenup()\ngoto(-120, -120)\npendown()\n\n\ndone()\n',
      ref: 'from turtle import *\npenup()\ngoto(-120, -120)\npendown()\nfor i in range(6):\n    left(90)\n    forward(40)\n    right(90)\n    forward(40)',
      needs: [{ re: /\bfor\b/, label: 'используется цикл for' }] },
    { id: 'traffic', lvl: 2, stars: 3, kind: 'turtle', title: 'Светофор', contains: true,
      text: '<p>На чёрном фоне нарисуй три круга радиусом 40 друг под другом: красный сверху, жёлтый в середине, зелёный внизу. Можно закрасить их заливкой.</p><p>Для каждого круга: <code>penup()</code>, <code>goto(0, y)</code>, <code>pendown()</code>, <code>color(...)</code>, <code>circle(40)</code>. Возьми <code>y = 60</code>, <code>-40</code> и <code>-140</code>: круг рисуется над точкой старта.</p>',
      starter: 'from turtle import *\n\nbgcolor("black")\nwidth(3)\n\n\ndone()\n',
      ref: 'from turtle import *\nbgcolor("black")\nwidth(3)\nfor y, c in [(60, "red"), (-40, "yellow"), (-140, "green")]:\n    penup()\n    goto(0, y)\n    pendown()\n    color(c)\n    circle(40)',
      draw: [{ label: 'фон чёрный', test: ops => HW.bgOf(ops) === 'black' }, { label: 'есть красный, жёлтый и зелёный', test: ops => isColor(ops, ['red']) && isColor(ops, ['yellow', 'gold']) && isColor(ops, ['green', 'lime']) }] },
    { id: 'house', lvl: 2, stars: 3, kind: 'turtle', title: 'Домик', contains: true,
      text: '<p>Нарисуй домик: квадратные стены со стороной 100 и треугольную крышу.</p><ol><li>Повернись вверх: <code>left(90)</code>.</li><li>Стены: 4 раза <code>forward(100)</code> и <code>right(90)</code>.</li><li>Крыша: <code>forward(100)</code>, <code>right(30)</code>, <code>forward(100)</code>, <code>right(120)</code>, <code>forward(100)</code>.</li></ol><p>Можно дорисовать окно и дверь — проверка это разрешает.</p>',
      starter: 'from turtle import *\n\nleft(90)\n\n\ndone()\n',
      ref: 'from turtle import *\nleft(90)\nfor i in range(4):\n    forward(100)\n    right(90)\nforward(100)\nright(30)\nforward(100)\nright(120)\nforward(100)',
      needs: [{ re: /\bfor\b/, label: 'стены нарисованы циклом' }],
      hint: 'Почему 30 и 120? Крыша — равносторонний треугольник: все углы по 60°. Черепашка смотрит вверх, а первая сторона крыши идёт под 30° от вертикали.' },
    { id: 'sun', lvl: 2, stars: 3, kind: 'turtle', title: 'Солнышко', contains: true,
      text: '<p>Сделай голубой фон (<code>"skyblue"</code>) и нарисуй 12 жёлтых лучей от центра. Один луч: <code>penup()</code>, <code>forward(60)</code>, <code>pendown()</code>, <code>forward(50)</code>, <code>penup()</code>, <code>backward(110)</code>, потом поворот. На сколько градусов поворачивать?</p><p>По желанию нарисуй в центре круг-лицо.</p>',
      starter: 'from turtle import *\n\nbgcolor("skyblue")\ncolor("gold")\nwidth(4)\n\n\ndone()\n',
      ref: 'from turtle import *\nbgcolor("skyblue")\ncolor("gold")\nwidth(4)\nfor i in range(12):\n    penup()\n    forward(60)\n    pendown()\n    forward(50)\n    penup()\n    backward(110)\n    right(30)',
      draw: [{ label: 'фон голубой (skyblue)', test: ops => /^skyblue$/.test(HW.bgOf(ops) || '') }, { label: 'лучи жёлтые', test: ops => isColor(ops, ['gold', 'yellow', 'orange']) }] },
    { id: 'spiral', lvl: 3, stars: 3, kind: 'turtle', title: 'Квадратная спираль',
      text: '<p>Нарисуй спираль из 40 линий: каждая следующая на 5 пикселей длиннее. До цикла создай <code>length = 5</code>, в цикле: <code>forward(length)</code>, <code>right(90)</code>, <code>length = length + 5</code>.</p><p>Потом попробуй <code>right(91)</code> вместо 90 — что изменилось?</p>',
      starter: 'from turtle import *\n\nspeed(0)\nlength = 5\n\n\ndone()\n',
      ref: 'from turtle import *\nlength = 5\nfor i in range(40):\n    forward(length)\n    right(90)\n    length = length + 5',
      needs: [{ re: /length\s*=\s*length\s*\+\s*5|length\s*\+=\s*5/, label: 'длина растёт на 5 каждый шаг' }] },
    { id: 'flower', lvl: 4, stars: 3, kind: 'turtle', title: 'Олимпиада: цветок из шестиугольников', input: true, sample: ['12'], stdin: ['12'],
      text: '<p>Нарисуй цветок из 12 шестиугольников, повёрнутых вокруг одной точки, цветной на тёмном фоне.</p><ol><li>Внутренний цикл — шестиугольник: 6 раз <code>forward(50)</code> и <code>left(60)</code>.</li><li>Внешний цикл повторяет его 12 раз, после каждого — <code>right(30)</code>.</li><li>Следи за отступами: шестиугольник — два отступа, <code>right(30)</code> — один.</li></ol><p>Бонус: спроси количество лепестков через <code>input()</code> и посчитай угол сам: <code>360 / лепестки</code>. При проверке я введу 12.</p>',
      starter: 'from turtle import *\n\nspeed(0)\nbgcolor("midnightblue")\ncolor("hotpink")\n\n\ndone()\n',
      ref: 'from turtle import *\nfor i in range(12):\n    for j in range(6):\n        forward(50)\n        left(60)\n    right(30)',
      draw: [{ label: 'фон тёмный, не белый', test: ops => { const b = HW.bgOf(ops); return !!b && b !== 'white' && b !== '#fff' && b !== '#ffffff'; } }, { label: 'линии цветные, не чёрные', test: ops => [...HW.colorsUsed(ops)].some(c => c !== 'black') }] },
  ],
});
