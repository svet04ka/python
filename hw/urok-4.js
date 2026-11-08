/* Домашка к уроку 4: условия */
var C = HW.code;
HW.mount({
  id: 'hw4', lesson: 4, title: 'Условия if, elif, else', short: 'Условия',
  titleHTML: 'Условия: <span>если… иначе…</span>',
  intro: 'Программа умеет выбирать путь: если условие верно — делать одно, иначе — другое. Повторим синтаксис, операторы сравнения и логические операторы.',
  sandbox: 'x = int(input("Введи число: "))\nif x > 0:\n    print("Положительное")\nelif x < 0:\n    print("Отрицательное")\nelse:\n    print("Ноль")\n',
  theory: [
    { h: '1. Синтаксис условий', html: `<p>После условия всегда ставится <b>двоеточие</b>, а действия пишутся с <b>отступом</b> (4 пробела или Tab).</p>
      ${C('if (условие1):\n    # действие 1\nelif (условие2):\n    # действие 2\nelse:\n    # действие 3 — если все условия выше ложны', { try: false })}
      <div class="callout tip"><b>Как читать.</b><span>Python проверяет условия сверху вниз и выполняет только <b>первый</b> подходящий блок. Остальные он пропускает.</span></div>` },
    { h: '2. Операторы сравнения', html: `<p>Сравнение даёт <code>True</code> (истина) или <code>False</code> (ложь).</p>
      <div class="tblwrap"><table class="cmds"><tr><td><code>&gt;</code> <code>&lt;</code></td><td>больше, меньше</td></tr><tr><td><code>&gt;=</code> <code>&lt;=</code></td><td>больше или равно, меньше или равно</td></tr><tr><td><code>==</code></td><td>равно. Не путай с <code>=</code> — это присваивание!</td></tr><tr><td><code>!=</code></td><td>не равно</td></tr></table></div>
      <div class="cmp"></div>`,
      init(el, A){
        const box = A.$('.cmp', el);
        box.innerHTML = `<p class="cap" style="margin-top:12px">Проверь сам</p><div class="row"><input class="inp" id="cA" value="7" aria-label="Левое число"><select class="inp" id="cOp" style="width:80px" aria-label="Оператор"><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>==</option><option>!=</option></select><input class="inp" id="cB" value="5" aria-label="Правое число"></div><div class="result" id="cR" style="margin-top:10px"></div>`;
        const calc = () => { const a = parseFloat(A.$('#cA', box).value), b = parseFloat(A.$('#cB', box).value), op = A.$('#cOp', box).value; if (isNaN(a) || isNaN(b)){ A.$('#cR', box).textContent = 'Впиши два числа'; return; } const r = { '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b, '==': a === b, '!=': a !== b }[op]; const R = A.$('#cR', box); R.textContent = `${a} ${op} ${b}  →  ${r ? 'True' : 'False'}`; R.classList.toggle('err', !r); };
        A.$$('input,select', box).forEach(i => i.addEventListener('input', calc)); calc();
      } },
    { h: '3. Логические операторы', html: `<ul><li><code>and</code> (И) — истинно, только если <b>оба</b> условия истинны;</li><li><code>or</code> (ИЛИ) — истинно, если хотя бы одно истинно;</li><li><code>not</code> (НЕ) — меняет значение на противоположное.</li></ul>
      ${C('age = 12\nprint(age > 10 and age < 18)   # True\nprint(age < 5 or age > 60)     # False\nprint(not age > 10)            # False')}` },
    { h: '4. Ввод данных', html: `<p><code>input()</code> всегда возвращает <b>строку</b>. Чтобы сравнивать и считать, превращаем её в число: <code>int()</code> — целое, <code>float()</code> — дробное (через точку).</p>
      ${C('a = int(input())\nb = int(input())\nprint(a + b)', { stdin: '5\n7' })}
      <div class="callout"><b>На этом сайте</b><span>значения для <code>input()</code> пишутся в поле «Ввод» под редактором — каждое с новой строки.</span></div>` },
  ],
  example: {
    title: 'Задача: наименьшее из трёх чисел',
    task: '<p>Пользователь вводит три целых числа. Нужно вывести, какое из них наименьшее. Если минимальных чисел два или три одинаковых — вывести «Минимум 2 числа равны».</p>',
    stdin: ['8', '3', '5'],
    steps: [
      { h: 'Получаем числа', html: '<p><code>input()</code> возвращает строку, поэтому сразу превращаем её в число.</p>', code: 'a = int(input("Введите первое число: "))\nb = int(input("Введите второе число: "))\nc = int(input("Введите третье число: "))' },
      { h: 'Проверяем первое число', html: '<p><code>a</code> должно быть меньше <code>b</code> <b>и</b> меньше <code>c</code>.</p>', code: 'if (a < b and a < c):\n    print("Первое число минимальное")' },
      { h: 'Второе через elif', code: 'elif (b < a and b < c):\n    print("Второе число минимальное")' },
      { h: 'Третье', code: 'elif (c < a and c < b):\n    print("Третье число минимальное")' },
      { h: 'Остальное — равенство', html: '<p>Если ни одно строгое условие не сработало, минимум повторяется.</p>', code: 'else:\n    print("Минимум 2 числа равны")' },
    ],
    code: 'a = int(input("Введите первое число: "))\nb = int(input("Введите второе число: "))\nc = int(input("Введите третье число: "))\nif (a < b and a < c):\n    print("Первое число минимальное")\nelif (b < a and b < c):\n    print("Второе число минимальное")\nelif (c < a and c < b):\n    print("Третье число минимальное")\nelse:\n    print("Минимум 2 числа равны")',
  },
  quiz: [
    { q: 'Что обязательно ставится в конце строки с <code>if</code>?', o: ['Точка с запятой ;', 'Двоеточие :', 'Скобка )', 'Ничего'], a: 1, e: 'После условия всегда двоеточие, а на следующей строке — отступ.' },
    { q: 'Какой оператор проверяет равенство?', o: ['=', '==', '===', '!='], a: 1, e: '= — это присваивание, == — сравнение.' },
    { q: 'Что выведет код?', code: 'x = 15\nif x > 10 and x < 20:\n    print("A")\nelse:\n    print("B")', o: ['A', 'B', 'A и B', 'Ошибку'], a: 0, e: 'Оба условия верны: 15 > 10 и 15 < 20.' },
    { q: 'Что вернёт <code>input()</code>, если ввести 42?', o: ['Число 42', 'Строку "42"', 'True', 'Ошибку'], a: 1, e: 'input() всегда возвращает строку. Нужен int().' },
    { q: 'Что выведет код?', code: 'x = 5\nif x > 3:\n    print("больше 3")\nelif x > 1:\n    print("больше 1")', o: ['больше 3', 'больше 1', 'оба', 'ничего'], a: 0, e: 'Выполняется только первый подходящий блок, elif уже не проверяется.' },
    { q: 'Как проверить, что число чётное?', o: ['x / 2 == 0', 'x % 2 == 0', 'x // 2 == 1', 'x * 2 == 0'], a: 1, e: '% — остаток от деления. У чётного числа остаток от деления на 2 равен 0.' },
  ],
  bugs: [
    { code: 'x = int(input())\nif x > 0\n    print("Положительное")', bad: 1, e: 'После условия нет двоеточия. Нужно <code>if x > 0:</code>' },
    { code: 'login = input()\nif login = "admin":\n    print("Привет, админ")', bad: 1, e: 'Для сравнения нужно <code>==</code>, а не <code>=</code>.' },
    { code: 'age = input()\nif age >= 18:\n    print("Взрослый")', bad: 0, e: 'input() возвращает строку, а строку нельзя сравнить с числом. Нужно <code>age = int(input())</code>.' },
  ],
  tasks: [
    { id: 'even', lvl: 1, stars: 2, title: 'Чётное или нечётное', input: true, sample: ['7'], lines: true,
      text: '<p>Программа запрашивает целое число. Если оно делится на 2 без остатка, выведи «Четное», иначе — «Нечетное».</p>',
      starter: 'x = int(input())\n',
      tests: [{ in: ['4'], expect: ['Четное'] }, { in: ['7'], expect: ['Нечетное'] }, { in: ['0'], expect: ['Четное'] }],
      needs: [{ re: /%\s*2/, label: 'используется остаток от деления % 2' }, { re: /\bif\b[\s\S]*\belse\b/, label: 'есть if … else' }],
      hint: '<code>if x % 2 == 0:</code> → «Четное», иначе — «Нечетное».' },
    { id: 'age', lvl: 2, stars: 3, title: 'Возрастные категории', input: true, sample: ['14'],
      text: '<p>Программа запрашивает возраст. Выведи категорию:</p><ul><li>от 0 до 12 — «Ребёнок»;</li><li>от 13 до 17 — «Подросток»;</li><li>от 18 до 64 — «Взрослый»;</li><li>65 и больше — «Пенсионер»;</li><li>отрицательный возраст — «Неверный возраст».</li></ul>',
      starter: 'age = int(input())\n',
      tests: [{ in: ['5'], expect: ['Ребёнок'] }, { in: ['12'], expect: ['Ребёнок'] }, { in: ['13'], expect: ['Подросток'] }, { in: ['18'], expect: ['Взрослый'] }, { in: ['64'], expect: ['Взрослый'] }, { in: ['70'], expect: ['Пенсионер'] }, { in: ['-3'], expect: ['Неверный возраст'] }],
      needs: [{ re: /\belif\b/, label: 'используется elif' }],
      hint: 'Начни с <code>if age < 0:</code>, потом <code>elif age <= 12:</code> и так далее.' },
    { id: 'discount', lvl: 2, stars: 3, title: 'Скидка в магазине', input: true, sample: ['2000'],
      text: '<p>Программа запрашивает сумму покупки и выводит итог со скидкой:</p><ul><li>меньше 1000 рублей — скидки нет;</li><li>от 1000 до 5000 — скидка 5% (платим 95%: <code>total * 0.95</code>);</li><li>больше 5000 — скидка 10%.</li></ul><p>Используй <code>float(input())</code>: сумма может быть дробной.</p>',
      starter: 'total = float(input())\n',
      tests: [{ in: ['500'], expect: ['500'] }, { in: ['1000'], expect: ['950'] }, { in: ['2000'], expect: ['1900'] }, { in: ['5000'], expect: ['4750'] }, { in: ['10000'], expect: ['9000'] }],
      needs: [{ re: /float\s*\(\s*input/, label: 'сумма читается через float(input())' }],
      hint: '<code>if total < 1000:</code> <code>final = total</code>, <code>elif total <= 5000:</code> <code>final = total * 0.95</code>, <code>else:</code> <code>final = total * 0.9</code>.' },
    { id: 'triangle', lvl: 2, stars: 2, title: 'Существует ли треугольник', input: true, sample: ['3', '4', '5'],
      text: '<p>Вводятся три длины отрезков <code>a</code>, <code>b</code>, <code>c</code>. Треугольник существует, если сумма любых двух сторон больше третьей. Выведи «Треугольник существует» или «Треугольник не существует».</p>',
      starter: 'a = float(input())\nb = float(input())\nc = float(input())\n',
      tests: [{ in: ['3', '4', '5'], expect: ['Треугольник существует'] }, { in: ['1', '2', '3'], expect: ['Треугольник не существует'] }, { in: ['10', '1', '1'], expect: ['Треугольник не существует'] }, { in: ['2', '2', '3'], expect: ['Треугольник существует'] }],
      needs: [{ re: /\band\b/, label: 'условия объединены через and' }],
      hint: '<code>if (a + b > c) and (a + c > b) and (b + c > a):</code>' },
    { id: 'login', lvl: 3, stars: 3, title: 'Логин и пароль', input: true, sample: ['admin', '12345'],
      text: '<p>Создай <code>correct_login = "admin"</code> и <code>correct_password = "12345"</code>. Программа запрашивает логин, потом пароль.</p><ul><li>Оба совпадают — «Добро пожаловать!»</li><li>Логин верный, пароль нет — «Неверный пароль»</li><li>Логин неверный — «Пользователь не найден»</li></ul>',
      starter: 'correct_login = "admin"\ncorrect_password = "12345"\n',
      tests: [{ in: ['admin', '12345'], expect: ['Добро пожаловать'] }, { in: ['admin', '111'], expect: ['Неверный пароль'] }, { in: ['vasya', '12345'], expect: ['Пользователь не найден'] }],
      needs: [{ re: /input\s*\(/, label: 'логин и пароль запрашиваются через input()' }] },
  ],
});
