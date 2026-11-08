/* Домашка к уроку 3: списки, кортежи, словари */
var C = HW.code;
HW.mount({
  id: 'hw3', lesson: 3, title: 'Структуры данных', short: 'Списки, кортежи, словари',
  titleHTML: 'Рюкзак, коробка и <span>переводчик</span>',
  intro: 'Списки, кортежи и словари — три способа хранить много значений в одной переменной. Повторим команды и потренируемся.',
  sandbox: 'pets = ["кот", "собака", "попугай"]\npets.append("хомяк")\npets.remove("собака")\npets.sort()\nprint(pets)\n',
  theory: [
    { h: '1. Список (list) — это рюкзак', html: `<p>Список можно менять: складывать вещи, вынимать их, менять местами. Создаётся квадратными скобками <code>[]</code>.</p>
      ${C('my_list = [1, 2, 3, "привет"]\nmy_list[0] = 100\nprint(my_list)')}
      <div class="tblwrap"><table class="cmds">
      <tr><td><code>.append(x)</code></td><td>добавить в конец</td></tr>
      <tr><td><code>.remove(x)</code></td><td>удалить конкретный элемент</td></tr>
      <tr><td><code>del(список[i])</code></td><td>удалить элемент по номеру</td></tr>
      <tr><td><code>.reverse()</code></td><td>развернуть наоборот</td></tr>
      <tr><td><code>.sort()</code></td><td>отсортировать по возрастанию или по алфавиту</td></tr>
      <tr><td><code>.count(x)</code></td><td>сколько раз встречается x</td></tr>
      <tr><td><code>.index(x)</code></td><td>номер элемента x</td></tr>
      <tr><td><code>len(список)</code></td><td>количество элементов</td></tr></table></div>
      <div class="backpack"></div>`,
      init(el, A){
        const box = A.$('.backpack', el);
        let items = ['тетрадь', 'ручка', 'учебник'];
        const log = [];
        const paint = () => {
          box.innerHTML = `<p class="cap" style="margin-top:12px">Поиграй с рюкзаком</p><div class="result">backpack = [${items.map(i => `"${i}"`).join(', ')}]   # len = ${items.length}</div>
            <div class="chips"><button class="chip" data-a="append">.append("бутерброд")</button><button class="chip" data-a="remove">.remove("ручка")</button><button class="chip" data-a="sort">.sort()</button><button class="chip" data-a="reverse">.reverse()</button><button class="chip" data-a="del">del(backpack[0])</button><button class="chip" data-a="reset">сначала</button></div>
            <div class="fb">${log.length ? log[log.length - 1] : 'Нажимай на команды.'}</div>`;
          A.$$('.chip', box).forEach(b => b.addEventListener('click', () => {
            const a = b.dataset.a;
            if (a === 'append'){ items.push('бутерброд'); log.push('Добавили в конец.'); }
            if (a === 'remove'){ const i = items.indexOf('ручка'); if (i < 0) log.push('<b class="no">ValueError</b>: ручки в рюкзаке уже нет!'); else { items.splice(i, 1); log.push('Удалили ручку.'); } }
            if (a === 'sort'){ items.sort((x, y) => x.localeCompare(y, 'ru')); log.push('Отсортировали по алфавиту.'); }
            if (a === 'reverse'){ items.reverse(); log.push('Развернули.'); }
            if (a === 'del'){ if (!items.length) log.push('<b class="no">IndexError</b>: рюкзак пуст!'); else { log.push(`Удалили элемент с индексом 0: «${items[0]}».`); items.splice(0, 1); } }
            if (a === 'reset'){ items = ['тетрадь', 'ручка', 'учебник']; log.push('Начали сначала.'); }
            paint();
          }));
        };
        paint();
      } },
    { h: '2. Кортеж (tuple) — запечатанная коробка', html: `<p>Кортеж похож на список, но его нельзя изменить. Создаётся круглыми скобками <code>()</code>. Попробуй запустить — Python выдаст ошибку.</p>
      ${C('my_tuple = (1, 2, 3)\nprint(my_tuple[0])\nmy_tuple[0] = 5')}` },
    { h: '3. Словарь (dict) — переводчик', html: `<p>Словарь хранит пары <b>ключ — значение</b>. Значение находим по ключу, как перевод слова. Создаётся фигурными скобками <code>{}</code>. Ключи не повторяются.</p>
      ${C('slovar = {"яблоко": "apple", "кот": "cat"}\nprint(slovar["кот"])\nslovar["собака"] = "dog"   # добавили пару\ndel(slovar["яблоко"])      # удалили пару\nprint(slovar)')}` },
    { h: '4. Магия split()', html: `<p><code>.split()</code> разрезает строку по пробелам и превращает её в список слов.</p>${C('text = "Я люблю Python"\nwords = text.split()\nprint(words)\nprint(len(words))')}` },
  ],
  example: {
    title: 'Задача: питомцы',
    task: '<p>Создай список питомцев <code>"кот", "собака", "попугай"</code>. Добавь <code>"хомяк"</code>, удали <code>"собака"</code>, отсортируй. Создай словарь звуков и выведи список и звук кота.</p>',
    steps: [
      { h: 'Создаём список', code: 'pets = ["кот", "собака", "попугай"]' },
      { h: 'Добавляем хомяка', html: '<p>Команда <code>.append()</code> кладёт элемент в конец.</p>', code: 'pets.append("хомяк")' },
      { h: 'Удаляем собаку', code: 'pets.remove("собака")' },
      { h: 'Сортируем по алфавиту', code: 'pets.sort()' },
      { h: 'Создаём словарь', code: 'pet_sounds = {"кот": "мяу", "попугай": "чирик"}' },
      { h: 'Выводим', code: 'print(pets)\nprint(pet_sounds["кот"])' },
    ],
    code: 'pets = ["кот", "собака", "попугай"]\npets.append("хомяк")\npets.remove("собака")\npets.sort()\npet_sounds = {"кот": "мяу", "попугай": "чирик"}\nprint(pets)\nprint(pet_sounds["кот"])',
  },
  quiz: [
    { q: 'Какими скобками создаётся список?', o: ['()', '[]', '{}', '<>'], a: 1, e: 'Список — [], кортеж — (), словарь — {}.' },
    { q: 'Что выведет код?', code: 'nums = [5, 2, 8]\nnums.append(1)\nprint(len(nums))', o: ['3', '4', '8', '1'], a: 1, e: 'После append в списке стало 4 элемента.' },
    { q: 'Что произойдёт?', code: 'colors = ("красный", "синий")\ncolors[0] = "жёлтый"', o: ['Цвет поменяется', 'Ошибка TypeError', 'Добавится новый цвет', 'Ничего'], a: 1, e: 'Кортеж нельзя изменить: Python выдаст TypeError.' },
    { q: 'Как получить перевод слова «кот»?', code: 'slovar = {"кот": "cat", "пёс": "dog"}', o: ['slovar[0]', 'slovar["кот"]', 'slovar("кот")', 'slovar.кот'], a: 1, e: 'В словаре обращаемся по ключу в квадратных скобках.' },
    { q: 'Что выведет код?', code: 'nums = [15, 3, 42]\nnums.sort()\nprint(nums)', o: ['[42, 15, 3]', '[3, 15, 42]', '[15, 3, 42]', '[3, 42, 15]'], a: 1, e: '.sort() сортирует по возрастанию.' },
    { q: 'Сколько элементов получится?', code: 'words = "Я учусь программировать на Python".split()', o: ['1', '5', '6', '33'], a: 1, e: 'split() режет по пробелам: получается 5 слов.' },
  ],
  bugs: [
    { code: 'backpack = ["тетрадь", "ручка"]\nbackpack.append("ластик")\nbackpack.remove("пенал")\nprint(backpack)', bad: 2, e: 'Пенала в списке нет, поэтому <code>.remove("пенал")</code> выдаст ValueError.' },
    { code: 'zoo = {"слон": "серый", "тигр": "оранжевый"}\nprint(zoo["слон"])\nprint(zoo[1])', bad: 2, e: 'У словаря нет номеров — только ключи. <code>zoo[1]</code> даст KeyError.' },
    { code: 'numbers = [4, 1, 3]\nnumbers.sort\nprint(numbers)', bad: 1, e: 'Команду надо вызвать со скобками: <code>numbers.sort()</code>. Без скобок ничего не отсортируется.' },
  ],
  tasks: [
    { id: 'backpack', lvl: 1, stars: 2, title: 'Мой рюкзак', lines: true,
      text: '<ul><li>Создай список <code>backpack</code>: <code>"тетрадь", "ручка", "учебник"</code>.</li><li>Добавь в конец <code>"бутерброд"</code>.</li><li>Удали <code>"ручку"</code>.</li><li>Выведи список.</li><li>Выведи, сколько предметов теперь в рюкзаке (<code>len()</code>).</li></ul>',
      starter: 'backpack = ["тетрадь", "ручка", "учебник"]\n',
      tests: [{ in: [], expect: ["['тетрадь', 'учебник', 'бутерброд']", '3'], show: "['тетрадь', 'учебник', 'бутерброд'] и 3" }],
      needs: [{ re: /\.append\s*\(/, label: 'используется .append()' }, { re: /\.remove\s*\(|del\s*\(?/, label: 'ручка удалена (.remove или del)' }, { re: /len\s*\(/, label: 'количество посчитано через len()' }] },
    { id: 'sortnums', lvl: 1, stars: 2, title: 'Сортировка чисел', lines: true,
      text: '<ul><li>Создай список <code>numbers = [15, 3, 42, 8, 1]</code>.</li><li>Отсортируй по возрастанию и выведи.</li><li>Разверни наоборот (от большего к меньшему) и снова выведи.</li></ul>',
      starter: 'numbers = [15, 3, 42, 8, 1]\n',
      tests: [{ in: [], expect: ['[1, 3, 8, 15, 42]', '[42, 15, 8, 3, 1]'], show: '[1, 3, 8, 15, 42] и [42, 15, 8, 3, 1]' }],
      needs: [{ re: /\.sort\s*\(/, label: 'используется .sort()' }, { re: /\.reverse\s*\(|reverse\s*=\s*True|\[::-1\]/, label: 'список развёрнут' }] },
    { id: 'zoo', lvl: 2, stars: 2, title: 'Мой зоопарк',
      text: '<ul><li>Создай словарь <code>zoo</code>: ключи — животные, значения — их цвета. Например: <code>{"слон": "серый", "тигр": "оранжевый"}</code>.</li><li>Добавь ещё одно животное.</li><li>Выведи цвет тигра, обратившись по ключу.</li><li>Удали слона с помощью <code>del()</code> и выведи словарь.</li></ul>',
      starter: 'zoo = {"слон": "серый", "тигр": "оранжевый"}\n',
      tests: [{ in: [], expect: ['оранжевый'], show: 'оранжевый, а потом словарь без слона', fn: (o) => /оранжевый/.test(o) && /\{[^}]*\}/.test(o.split('оранжевый').slice(1).join('')) && !/слон/.test(o.split('оранжевый').slice(1).join('')) }],
      needs: [{ re: /zoo\s*\[\s*["'][^"']+["']\s*\]\s*=/, label: 'в словарь добавлено животное' }, { re: /zoo\s*\[\s*["']тигр["']\s*\]/, label: 'цвет тигра получен по ключу' }, { re: /del\s*\(?\s*zoo\s*\[\s*["']слон["']\s*\]/, label: 'слон удалён через del' }],
      hint: 'Добавить пару: <code>zoo["жираф"] = "жёлтый"</code>. Удалить: <code>del(zoo["слон"])</code>.' },
    { id: 'tuple', lvl: 2, stars: 2, title: 'Неизменяемый кортеж', allowError: true,
      text: '<ul><li>Создай кортеж <code>colors = ("красный", "зеленый", "синий")</code>.</li><li>Попробуй изменить первый элемент: <code>colors[0] = "желтый"</code>.</li><li>Запусти. Что произошло? Напиши в комментарии <code>#</code>, какую ошибку выдал Python.</li></ul>',
      starter: 'colors = ("красный", "зеленый", "синий")\n',
      needs: [{ re: /colors\s*=\s*\(/, label: 'создан кортеж colors' }, { re: /colors\s*\[\s*0\s*\]\s*=/, label: 'есть попытка изменить colors[0]' }, { raw: true, re: /#.*TypeError/i, label: 'в комментарии записано название ошибки' }],
      outCheck: [{ label: 'Python действительно выдал TypeError', test: (o, r) => r.error && r.error.type === 'TypeError' }],
      hint: 'Ошибка называется так, как написано в первом слове красной строки, например <code># TypeError</code>.' },
    { id: 'split', lvl: 1, stars: 2, title: 'Магия split()',
      text: '<p>Дана строка <code>text = "Я учусь программировать на Python"</code>. С помощью <code>.split()</code> преврати её в список слов, запиши в переменную <code>words</code> и выведи. Получится список из 5 слов.</p>',
      starter: 'text = "Я учусь программировать на Python"\n',
      tests: [{ in: [], expect: ["['Я', 'учусь', 'программировать', 'на', 'Python']"], show: "['Я', 'учусь', 'программировать', 'на', 'Python']" }],
      needs: [{ re: /words\s*=\s*text\.split\s*\(\s*\)/, label: 'words = text.split()' }] },
    { id: 'shop', lvl: 4, stars: 3, title: 'Бонус: список покупок', lines: true,
      text: '<p>Дан список <code>shop = ["хлеб", "молоко", "хлеб", "сыр", "хлеб"]</code>. Выведи, каждое с новой строки: сколько раз в списке встречается «хлеб» (<code>.count()</code>), под каким индексом стоит «сыр» (<code>.index()</code>) и сколько всего покупок.</p>',
      starter: 'shop = ["хлеб", "молоко", "хлеб", "сыр", "хлеб"]\n',
      tests: [{ in: [], expect: ['3', '3', '5'], show: '3, 3, 5' }],
      needs: [{ re: /\.count\s*\(/, label: 'используется .count()' }, { re: /\.index\s*\(/, label: 'используется .index()' }, { re: /len\s*\(/, label: 'используется len()' }] },
  ],
});
