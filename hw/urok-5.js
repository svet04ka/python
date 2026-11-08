/* Домашка к уроку 5: практикум — повторяем всё */
var C = HW.code;
HW.mount({
  id: 'hw5', lesson: 5, title: 'Практикум: вспоминаем всё', short: 'Практикум',
  titleHTML: 'Практикум: <span>вспоминаем всё</span>',
  intro: 'Математика, строки, списки, словари и условия — всё вместе. Семь задач от простой к олимпиадной.',
  sandbox: 'num = int(input("Введите четырёхзначное число: "))\nthousands = num // 1000\nhundreds = num % 1000 // 100\ndecs = num % 100 // 10\nones = num % 10\nprint(thousands, hundreds, decs, ones)\n',
  theory: [
    { h: '1. Математические операторы', html: `<div class="tblwrap"><table class="cmds"><tr><td><code>+ - * /</code></td><td>обычные действия. <code>/</code> всегда даёт дробное число</td></tr><tr><td><code>//</code></td><td>целочисленное деление: <code>7 // 2 = 3</code></td></tr><tr><td><code>%</code></td><td>остаток от деления: <code>7 % 2 = 1</code></td></tr><tr><td><code>**</code></td><td>степень: <code>2 ** 3 = 8</code></td></tr></table></div><div class="calc"></div>`,
      init(el, A){
        const box = A.$('.calc', el);
        box.innerHTML = `<p class="cap" style="margin-top:12px">Мини-калькулятор</p><div class="row"><input class="inp" id="mA" value="17" aria-label="Первое число"><input class="inp" id="mB" value="5" aria-label="Второе число"></div><div class="result" id="mR" style="margin-top:10px"></div>`;
        const calc = () => { const a = parseInt(A.$('#mA', box).value, 10), b = parseInt(A.$('#mB', box).value, 10); if (isNaN(a) || isNaN(b)){ A.$('#mR', box).textContent = 'Впиши два целых числа'; return; } const fd = b ? Math.floor(a / b) : 'ZeroDivisionError', md = b ? ((a % b) + b) % b : 'ZeroDivisionError', dv = b ? +(a / b).toFixed(6) : 'ZeroDivisionError'; A.$('#mR', box).textContent = `${a} / ${b} = ${dv}\n${a} // ${b} = ${fd}\n${a} % ${b} = ${md}\n${a} ** ${b} = ${a ** b}`; };
        A.$$('input', box).forEach(i => i.addEventListener('input', calc)); calc();
      } },
    { h: '2. Строки', html: `<ul><li>Склеивание: <code>"Привет" + " мир"</code>.</li><li>Повтор: <code>"=" * 40</code> — линия из 40 знаков.</li><li><code>\\n</code> — перенос строки, <code>\\t</code> — отступ.</li><li><code>.upper()</code> — большими буквами, <code>str(12)</code> — число в строку.</li></ul>${C('message = "домашка готова"\nprint("=" * 30)\nprint("\\t" + message.upper())\nprint("=" * 30)')}` },
    { h: '3. Списки и словари', html: `${C('ls = [1, 20, 10, 200]\ndel(ls[-1])      # удалить последний\nprint(ls)\n\nd = {"ручка": 20, "ноутбук": 1500}\ndel(d["ноутбук"]) # удалить по ключу\nprint(d)')}` },
    { h: '4. Разряды числа', html: `<p>Последняя цифра — <code>num % 10</code>. Отрезать последнюю цифру — <code>num // 10</code>.</p><div class="digits"></div>`,
      init(el, A){
        const box = A.$('.digits', el);
        box.innerHTML = `<div class="row"><span class="mono">num =</span><input class="inp" id="dN" value="456" aria-label="Трёхзначное число"></div><div class="result" id="dR" style="margin-top:10px"></div>`;
        const calc = () => { const n = parseInt(A.$('#dN', box).value, 10); if (isNaN(n) || n < 0){ A.$('#dR', box).textContent = 'Впиши положительное число'; return; } const h = Math.floor(n / 100), d = Math.floor(n % 100 / 10), o = n % 10; A.$('#dR', box).textContent = `сотни:   ${n} // 100      = ${h}\nдесятки: ${n} % 100 // 10 = ${d}\nединицы: ${n} % 10       = ${o}\nсумма цифр = ${h + d + o}`; };
        A.$('input', box).addEventListener('input', calc); calc();
      } },
    { h: '5. Обмен значениями', html: `<p>Через временную переменную или хитрым способом через кортеж:</p>${C('a, b = 1, 2\nc = b\nb = a\na = c\nprint(a, b)\n\na, b = b, a   # и обратно, без временной переменной\nprint(a, b)')}` },
  ],
  example: {
    title: 'Олимпиадная задача про Гришу',
    task: '<p>Гриша решает 12 задач за 5 часов. В первый час он решает <code>f</code> задач. Потом остаётся 4 часа (240 минут), и каждые 45 минут он решает одну задачу. Успеет ли он? Выведи YES или NO.</p>',
    stdin: ['7'],
    steps: [
      { h: 'Сколько задач осталось', code: 'f = int(input())\nexcersises = 12 - f' },
      { h: 'Сколько успеет за 4 часа', html: '<p>240 минут делим нацело на 45: <code>240 // 45 = 5</code>.</p>', code: 'time = 4 * 60\ncompleted = time // 45' },
      { h: 'Сравниваем', code: 'result = excersises - completed\nif (result <= 0):\n    print("YES")\nelse:\n    print("NO")' },
    ],
    code: 'f = int(input())\nexcersises = 12 - f\ntime = 4 * 60\ncompleted = time // 45\nresult = excersises - completed\nif (result <= 0):\n    print("YES")\nelse:\n    print("NO")',
  },
  quiz: [
    { q: 'Чему равно <code>17 // 5</code>?', o: ['3.4', '3', '2', '4'], a: 1, e: '// отбрасывает дробную часть: 17 / 5 = 3.4 → 3.' },
    { q: 'Чему равно <code>17 % 5</code>?', o: ['3', '2', '0', '5'], a: 1, e: '17 = 5 · 3 + 2, остаток 2.' },
    { q: 'Что напечатает код?', code: 'print("-" * 5)', o: ['-5', '-----', '- - - - -', 'Ошибку'], a: 1, e: 'Строка повторится 5 раз.' },
    { q: 'Как получить последнюю цифру числа <code>num</code>?', o: ['num // 10', 'num % 10', 'num / 10', 'num[-1]'], a: 1, e: 'Остаток от деления на 10 — это последняя цифра.' },
    { q: 'Что будет после кода?', code: 'a = 3\nb = 8\na, b = b, a\nprint(a, b)', o: ['3 8', '8 3', '8 8', '3 3'], a: 1, e: 'Значения поменялись местами.' },
  ],
  bugs: [
    { code: 'x = int(input())\ny = int(input())\nprint(x ^ 2 + y)', bad: 2, e: 'Степень в Python — это <code>**</code>, а не <code>^</code>. Нужно <code>x ** 2</code>.' },
    { code: 'name = input()\nage = int(input())\nprint("Возраст: " + age)', bad: 2, e: 'Число нельзя склеить со строкой. Нужно <code>str(age)</code>.' },
    { code: 'basket = ["яблоко", "хлеб", "молоко"]\ndel(basket[3])\nprint(basket)', bad: 1, e: 'В списке три элемента с индексами 0, 1, 2. Индекса 3 нет — IndexError.' },
  ],
  tasks: [
    { id: 'formula', lvl: 1, stars: 2, title: 'Сложная формула', input: true, sample: ['1', '1', '1'],
      text: '<p>Программа запрашивает три числа <code>x</code>, <code>y</code>, <code>z</code> и вычисляет выражение <b>(x² + y³) / (z + 1)</b>.</p><p>Используй <code>**</code> для степени и не забудь скобки.</p>',
      check: 'при x = 1, y = 1, z = 1 должно получиться 1.',
      starter: 'x = float(input())\ny = float(input())\nz = float(input())\n',
      tests: [{ in: ['1', '1', '1'], expect: ['1'] }, { in: ['2', '1', '4'], expect: ['1'] }, { in: ['3', '2', '0'], expect: ['17'] }, { in: ['1', '3', '1'], expect: ['14'] }],
      needs: [{ re: /\*\*/, label: 'используется ** для степени' }] },
    { id: 'card', lvl: 1, stars: 2, title: 'Визитная карточка', input: true, sample: ['Аня', '11'],
      text: '<p>Запроси имя и возраст. Выведи визитку, используя умножение строк и <code>\\t</code>:</p><pre class="code">********************\n\tИмя: Аня\n\tВозраст: 11\n********************</pre>',
      starter: 'name = input()\nage = int(input())\n',
      tests: [{ in: ['Аня', '11'], expect: ['********************', 'Имя: Аня', 'Возраст: 11', '********************'], show: 'звёздочки, Имя: Аня, Возраст: 11, звёздочки' }, { in: ['Петя', '12'], expect: ['Имя: Петя', 'Возраст: 12'] }],
      needs: [{ re: /["']\*["']\s*\*\s*20|20\s*\*\s*["']\*["']/, label: 'звёздочки сделаны умножением "*" * 20' }, { raw: true, re: /\\t/, label: 'используется \\t' }],
      hint: '<code>print("\\tВозраст: " + str(age))</code>' },
    { id: 'basket', lvl: 1, stars: 2, title: 'Корзина покупок', lines: true,
      text: '<p>Дан список <code>basket = ["яблоко", "хлеб", "молоко", "сыр", "шоколад"]</code>.</p><ol><li>Удали «молоко» по индексу (<code>del</code>).</li><li>Добавь в конец «бананы».</li><li>Выведи итоговый список.</li></ol>',
      starter: 'basket = ["яблоко", "хлеб", "молоко", "сыр", "шоколад"]\n',
      tests: [{ in: [], expect: ["['яблоко', 'хлеб', 'сыр', 'шоколад', 'бананы']"] }],
      needs: [{ re: /del\s*\(?\s*basket\s*\[\s*2\s*\]/, label: 'молоко удалено по индексу: del(basket[2])' }, { re: /\.append\s*\(/, label: 'бананы добавлены через .append()' }] },
    { id: 'calc', lvl: 2, stars: 3, title: 'Калькулятор', input: true, sample: ['6', '3', '*'],
      text: '<p>Программа запрашивает два числа и знак операции (<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>) и выводит результат. Если знак другой — «Неизвестная операция».</p><p>Порядок ввода: первое число, второе число, операция.</p>',
      starter: 'num1 = float(input())\nnum2 = float(input())\nop = input("Введите операцию (+, -, *, /): ")\n',
      tests: [{ in: ['6', '3', '+'], expect: ['9'] }, { in: ['6', '3', '-'], expect: ['3'] }, { in: ['6', '3', '*'], expect: ['18'] }, { in: ['6', '3', '/'], expect: ['2'] }, { in: ['2.5', '2', '*'], expect: ['5'] }, { in: ['1', '2', '%'], expect: ['Неизвестная операция'] }],
      needs: [{ re: /\belif\b/, label: 'используется elif' }] },
    { id: 'digits', lvl: 2, stars: 2, title: 'Сумма цифр трёхзначного числа', input: true, sample: ['456'],
      text: '<p>Запроси трёхзначное число (например, 456) и выведи сумму его цифр: 4 + 5 + 6 = 15.</p><p>Сотни — <code>num // 100</code>, десятки — <code>num % 100 // 10</code>, единицы — <code>num % 10</code>.</p>',
      starter: 'num = int(input())\n',
      tests: [{ in: ['456'], expect: ['15'] }, { in: ['100'], expect: ['1'] }, { in: ['999'], expect: ['27'] }, { in: ['305'], expect: ['8'] }],
      needs: [{ re: /\/\//, label: 'используется //' }, { re: /%/, label: 'используется %' }] },
    { id: 'swap', lvl: 2, stars: 2, title: 'Обмен по кругу', input: true, sample: ['1', '2', '3'],
      text: '<p>Запроси три переменные <code>x</code>, <code>y</code>, <code>z</code>. Поменяй значения по кругу: <code>x</code> получает значение <code>y</code>, <code>y</code> — значение <code>z</code>, а <code>z</code> — старое значение <code>x</code>. Выведи <code>print(x, y, z)</code>.</p>',
      starter: 'x = input()\ny = input()\nz = input()\n',
      tests: [{ in: ['1', '2', '3'], expect: ['2 3 1'], lines: true }, { in: ['a', 'b', 'c'], expect: ['b c a'], lines: true }],
      hint: '<code>temp = x</code>, <code>x = y</code>, <code>y = z</code>, <code>z = temp</code>. Или одной строкой: <code>x, y, z = y, z, x</code>.' },
    { id: 'vasya', lvl: 4, stars: 3, title: 'Олимпиада: реферат Васи', input: true, sample: ['6'],
      text: '<p>У Васи 2 часа. В первый час он пишет <code>n</code> страниц. Оставшийся час (60 минут) он пишет по 1 странице каждые 20 минут. Успеет ли он написать реферат на 10 страниц? Выведи YES или NO.</p>',
      starter: 'n = int(input())\n',
      tests: [{ in: ['7'], expect: ['YES'] }, { in: ['6'], expect: ['NO'] }, { in: ['10'], expect: ['YES'] }, { in: ['0'], expect: ['NO'] }],
      lines: true,
      hint: 'Осталось <code>10 - n</code> страниц, а успеет он <code>60 // 20</code>. Если первое меньше или равно второму — YES.' },
  ],
});
