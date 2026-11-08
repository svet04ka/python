/* Домашка к уроку 2: строки */
var C = HW.code;
HW.mount({
  id: 'hw2', lesson: 2, title: 'Строки в Python', short: 'Строки',
  titleHTML: 'Строки: <span>бусинки-символы</span>',
  intro: 'Вспомним, как устроены строки, научимся брать символы по индексу, резать строки срезами и склеивать их. Код запускается прямо на странице.',
  sandbox: 'secret_code = "PythonMagic"\nprint(secret_code[0:6])\nprint(secret_code[::-1])\nprint(secret_code[-4:])\n',
  theory: [
    { h: '1. Что такое строка', html: `<p>Строка — это тип данных, который хранит текст. Она похожа на ожерелье из бусинок-символов. Чтобы создать строку, текст пишут в кавычках:</p>
      <ul><li>одинарные: <code>'Привет'</code></li><li>двойные: <code>"Привет"</code></li><li>тройные, для длинного текста в несколько строк: <code>'''Привет, мир!'''</code></li></ul>
      ${C("greeting = 'Привет'\nname = \"Python\"\nprint(greeting, name)")}` },
    { h: '2. Индексы — номера бусинок', html: `<p>У каждого символа есть номер — <b>индекс</b>. Счёт начинается с <b>нуля</b>! Индекс <code>[-1]</code> — последний символ.</p>
      <div class="indexer"></div>
      ${C('myString = "kiberOne"\nprint(myString[0])\nprint(myString[2])\nprint(myString[-1])')}`,
      init(el, A){
        const box = A.$('.indexer', el);
        const word = 'kiberOne';
        box.innerHTML = `<div class="row" style="gap:6px;margin:8px 0">${[...word].map((ch, i) => `<button class="chip ib" data-i="${i}" style="min-width:44px;text-align:center">${ch}<br><small style="color:var(--muted)">[${i}]</small></button>`).join('')}</div><div class="result">Нажми на бусинку</div>`;
        A.$$('.ib', box).forEach(b => b.addEventListener('click', () => { A.$$('.ib', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); const i = +b.dataset.i; A.$('.result', box).textContent = `myString[${i}] = '${word[i]}'   и ещё myString[${i - word.length}] = '${word[i]}'`; }));
      } },
    { h: '3. Срезы — разрезаем ожерелье', html: `<p>Срез берёт часть строки: <code>[начало:конец:шаг]</code>. <b>Конец не входит</b> в срез.</p>
      <ul><li><code>[0:3]</code> — символы с 0 по 2;</li><li><code>[::2]</code> — каждый второй символ;</li><li><code>[::-1]</code> — строка задом наперёд;</li><li><code>[-4:]</code> — последние 4 символа.</li></ul>
      <div class="slicer"></div>`,
      init(el, A){
        const box = A.$('.slicer', el);
        box.innerHTML = `<div class="row" style="margin:10px 0"><span class="mono">s = "PythonMagic"</span></div>
          <div class="row"><span class="mono">s[</span><input class="inp" id="slA" value="0" style="width:60px" aria-label="Начало"><span class="mono">:</span><input class="inp" id="slB" value="6" style="width:60px" aria-label="Конец"><span class="mono">:</span><input class="inp" id="slC" value="" style="width:60px" aria-label="Шаг"><span class="mono">]</span></div>
          <div class="chips"><button class="chip" data-v="0,6,">[0:6]</button><button class="chip" data-v=",,-1">[::-1]</button><button class="chip" data-v="-4,,">[-4:]</button><button class="chip" data-v=",,2">[::2]</button><button class="chip" data-v="2,9,3">[2:9:3]</button></div>
          <div class="result" id="slR"></div>`;
        const s = 'PythonMagic';
        const calc = () => {
          const g = id => { const v = A.$('#' + id, box).value.trim(); return v === '' ? null : parseInt(v, 10); };
          let a = g('slA'), b = g('slB'), c = g('slC'); if (c === 0){ A.$('#slR', box).textContent = 'ValueError: шаг не может быть 0'; return; }
          c = c == null ? 1 : c; const n = s.length;
          const norm = (x, def) => x == null ? def : (x < 0 ? Math.max(x + n, c < 0 ? -1 : 0) : Math.min(x, c < 0 ? n - 1 : n));
          a = norm(a, c > 0 ? 0 : n - 1); b = norm(b, c > 0 ? n : -1);
          let r = ''; if (c > 0) for (let i = a; i < b; i += c) r += s[i]; else for (let i = a; i > b; i += c) r += s[i];
          A.$('#slR', box).textContent = `'${r}'`;
        };
        A.$$('input', box).forEach(i => i.addEventListener('input', calc));
        A.$$('.chip', box).forEach(ch => ch.addEventListener('click', () => { const [a, b, c] = ch.dataset.v.split(','); A.$('#slA', box).value = a; A.$('#slB', box).value = b; A.$('#slC', box).value = c; calc(); }));
        calc();
      } },
    { h: '4. Особые символы и операции', html: `<table class="cmds"><tr><td><code>\\n</code></td><td>перенос текста на новую строку</td></tr><tr><td><code>\\t</code></td><td>отступ (табуляция)</td></tr><tr><td><code>\\"</code></td><td>кавычка внутри строки (экранирование)</td></tr><tr><td><code>+</code></td><td>склеивает строки: <code>"Ки" + "бер"</code> → <code>"Кибер"</code></td></tr><tr><td><code>*</code></td><td>повторяет строку: <code>"а" * 3</code> → <code>"ааа"</code></td></tr></table>
      ${C('print("Первая строка\\nВторая строка")\nprint("\\tС отступом")\nprint("Он сказал: \\"Привет!\\"")\nprint("Ура" + "!" * 3)')}` },
  ],
  example: {
    title: 'Задача: секретный код',
    task: '<p>Дана строка <code>secret_code = "PythonMagic"</code>. Нужно вывести: первые 6 символов, перевёрнутую строку и последние 5 символов.</p>',
    steps: [
      { h: 'Смотрим на строку', html: '<pre class="code">P  y  t  h  o  n  M  a  g  i  c\n0  1  2  3  4  5  6  7  8  9  10</pre>' },
      { h: 'Первые 6 символов', html: '<p>Нужны символы с 0 по 5. Конец не входит, поэтому пишем <code>[0:6]</code>.</p>', code: 'print(secret_code[0:6])   # Python' },
      { h: 'Перевёрнутая строка', html: '<p>Срез с шагом -1, начало и конец не указываем.</p>', code: 'print(secret_code[::-1])  # cigaMnohtyP' },
      { h: 'Последние символы', html: '<p><code>[-5:]</code> — начать с 5-го символа с конца и идти до самого конца.</p>', code: 'print(secret_code[-5:])   # Magic' },
    ],
    code: 'secret_code = "PythonMagic"\nprint(secret_code[0:6])\nprint(secret_code[::-1])\nprint(secret_code[-5:])',
  },
  quiz: [
    { q: 'С какого числа начинается нумерация символов в строке?', o: ['С 1', 'С 0', 'С -1', 'С любого'], a: 1, e: 'Первый символ всегда имеет индекс 0.' },
    { q: 'Что выведет код?', code: 'word = "kiberOne"\nprint(word[-1])', o: ['k', 'O', 'e', 'Ошибку'], a: 2, e: 'Индекс -1 — это последний символ строки.' },
    { q: 'Что выведет код?', code: 'print("Привет"[0:3])', o: ['При', 'Прив', 'рив', 'Привет'], a: 0, e: 'Срез [0:3] берёт символы 0, 1 и 2 — конец не входит.' },
    { q: 'Что получится?', code: 'print("ха" * 3)', o: ['ха3', 'хахаха', 'ха ха ха', 'Ошибка'], a: 1, e: 'Умножение строки на число повторяет её.' },
    { q: 'Какой срез переворачивает строку задом наперёд?', o: ['[::2]', '[-1]', '[::-1]', '[0:-1]'], a: 2, e: 'Шаг -1 означает «идти с конца к началу».' },
    { q: 'Что делает <code>\\n</code> внутри строки?', o: ['Печатает букву n', 'Переносит текст на новую строку', 'Делает отступ', 'Удаляет символ'], a: 1, e: '\\n — символ переноса строки, а \\t — табуляция.' },
  ],
  bugs: [
    { code: 'name = "Аня"\nage = 11\nprint("Меня зовут " + name + ", мне " + age + " лет")', bad: 2, e: 'Нельзя склеить строку и число через <code>+</code> — будет TypeError. Нужно <code>str(age)</code> или <code>age = "11"</code>.' },
    { code: 'word = "Кот"\nprint(word[0])\nprint(word[3])', bad: 2, e: 'В слове «Кот» индексы 0, 1, 2. Индекса 3 нет — будет IndexError. Последнюю букву удобно брать так: <code>word[-1]</code>.' },
    { code: 'text = "Он сказал: "Привет!""\nprint(text)', bad: 0, e: 'Кавычки внутри строки закрывают её раньше времени. Нужно экранировать: <code>"Он сказал: \\"Привет!\\""</code> или взять одинарные кавычки снаружи.' },
  ],
  tasks: [
    { id: 'meet', lvl: 1, stars: 2, title: 'Знакомство', kind: 'creative',
      text: '<p>Создай три переменные: <code>name</code> (твоё имя), <code>age</code> (возраст) и <code>hobby</code> (хобби). С помощью <code>+</code> склей их в одно предложение и выведи. Например: <code>"Меня зовут " + name + ", мне " + age + " лет, и я люблю " + hobby</code>.</p><p>Не забудь пробелы в кавычках, чтобы слова не слипались! И помни: возраст тоже должен быть строкой.</p>',
      starter: 'name = ""\nage = ""\nhobby = ""\n\n# склей и выведи предложение\n',
      needs: [{ re: /\bname\s*=\s*["'][^"']+["']/, label: 'в name записано имя' }, { re: /\bage\s*=/, label: 'есть переменная age' }, { re: /\bhobby\s*=\s*["'][^"']+["']/, label: 'в hobby записано хобби' }, { re: /print\s*\([^)]*\+[^)]*\)/, label: 'строки склеены через + внутри print' }],
      outCheck: [{ label: 'программа вывела предложение', test: o => o.trim().length > 10 }],
      hint: 'Если возраст — число, например <code>age = 11</code>, склеить не получится. Напиши <code>age = "11"</code> или <code>str(age)</code>.' },
    { id: 'index', lvl: 1, stars: 2, title: 'Индексы', lines: true,
      text: '<p>Дана строка <code>word = "Космонавт"</code>. Выведи, каждую с новой строки:</p><ol><li>первую букву;</li><li>последнюю букву (используй отрицательный индекс);</li><li>третью букву.</li></ol>',
      starter: 'word = "Космонавт"\n',
      tests: [{ in: [], expect: ['К', 'т', 'с'], show: 'К, т, с — каждая с новой строки' }],
      needs: [{ re: /word\s*\[\s*0\s*\]/, label: 'первая буква взята по индексу [0]' }, { re: /word\s*\[\s*-\s*1\s*\]/, label: 'последняя буква взята по индексу [-1]' }, { re: /word\s*\[\s*2\s*\]/, label: 'третья буква — это индекс [2]' }],
      hint: 'Третья буква — это индекс 2, потому что счёт идёт с нуля: К[0] о[1] с[2].' },
    { id: 'slices', lvl: 2, stars: 3, title: 'Срезы алфавита', lines: true,
      text: '<p>Дана строка <code>alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФ"</code>. Выведи, каждое с новой строки:</p><ol><li>первые 5 букв;</li><li>буквы с индекса 5 по индекс 10, не включая 10-й;</li><li>каждый второй символ всей строки;</li><li>всю строку в обратном порядке.</li></ol>',
      starter: 'alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФ"\n',
      tests: [{ in: [], expect: ['АБВГД', 'ЕЁЖЗИ', 'АВДЁЗЙЛНПСУ', 'ФУТСРПОНМЛКЙИЗЖЁЕДГВБА'], show: 'АБВГД / ЕЁЖЗИ / АВДЁЗЙЛНПСУ / ФУТС…ВБА' }],
      needs: [{ re: /alphabet\s*\[[^\]]*:[^\]]*\]/, label: 'используются срезы alphabet[…:…]' }],
      hint: 'Подсказки: <code>[0:5]</code>, <code>[5:10]</code>, <code>[::2]</code>, <code>[::-1]</code>.' },
    { id: 'hooray', lvl: 2, stars: 2, title: 'Ура!!!', lines: true,
      text: '<p>Создай строки <code>part1 = "Ура"</code> и <code>part2 = "!"</code>. Склей их так, чтобы получилось <code>Ура!!!</code> — используй и сложение, и умножение. Выведи результат, а следующей строкой — последние 3 символа получившейся строки.</p>',
      starter: 'part1 = "Ура"\npart2 = "!"\n',
      tests: [{ in: [], expect: ['Ура!!!', '!!!'], show: 'Ура!!! и затем !!!' }],
      needs: [{ re: /part2\s*\*\s*3|3\s*\*\s*part2/, label: 'восклицательный знак умножен на 3' }, { re: /part1\s*\+/, label: 'строки склеены через +' }, { re: /\[\s*-\s*3\s*:\s*\]/, label: 'последние 3 символа взяты срезом [-3:]' }],
      hint: 'Сначала <code>result = part1 + part2 * 3</code>, потом <code>print(result)</code> и <code>print(result[-3:])</code>.' },
    { id: 'poem', lvl: 5, stars: 3, title: 'Стихотворение', kind: 'creative',
      text: '<p>Напиши программу, которая выводит небольшое стихотворение или диалог из 3–4 строчек. Обязательно используй <code>\\n</code> для переноса строк и <code>\\t</code> для отступа (например, для красной строки).</p><p>Если нужны кавычки внутри текста — экранируй их: <code>\\"</code>.</p>',
      starter: 'print("")\n',
      needs: [{ raw: true, re: /\\n/, label: 'используется \\n' }, { raw: true, re: /\\t/, label: 'используется \\t' }],
      outCheck: [{ label: 'на экране минимум 3 строчки', test: o => o.split('\n').filter(l => l.trim()).length >= 3 }],
      hint: 'Можно всё одной строкой: <code>print("\\tЖил-был кот,\\nОн ел компот,\\nА потом пошёл в поход.")</code>' },
  ],
});
