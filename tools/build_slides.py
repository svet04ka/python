"""Собирает презентации slides/urok-8..11.html.
Код на слайдах прогоняется настоящим Python (assets/harness.py): вывод и рисунки черепашки
вставляются в слайды автоматически, так что на слайдах не бывает нерабочего кода.
Запуск:  python3 tools/build_slides.py
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'assets'))
import harness  # noqa: E402

KW = r'\b(def|for|in|if|elif|else|while|return|import|from|as|pass|break|continue|True|False|None|and|or|not|try|except|finally|with|lambda|global|del)\b'


def hl(code):
    out = []
    pat = re.compile(r'(#.*$)|("(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\')|' + KW + r'|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(?=\()', re.M)
    pos = 0
    for m in pat.finditer(code):
        out.append(html.escape(code[pos:m.start()], quote=False))
        c, s, k, n, f = m.groups()
        cls = 'c' if c else 's' if s else 'k' if k else 'n' if n else 'f'
        out.append(f'<span class="{cls}">{html.escape(m.group(0), quote=False)}</span>')
        pos = m.end()
    out.append(html.escape(code[pos:], quote=False))
    return ''.join(out)


def run(code, stdin=None):
    r = json.loads(harness.run_user(code, json.dumps(stdin or []), 'run'))
    if r['error']:
        raise SystemExit(f'Ошибка в коде слайда: {r["error"]}\n{code}')
    return r


def code(src, size='', out=False, stdin=None, lines=12, prefix=''):
    """Блок кода; out=True — запустить и показать вывод."""
    h = f'<pre class="code {size}">{hl(src)}</pre>'
    if out:
        r = run(prefix + src, stdin)
        text = r['out']
        text = re.sub(r'\x01(.*?)\x02(.*?)\x03', lambda m: html.escape(m.group(1)) + '<span class="in">' + html.escape(m.group(2)) + '</span>', html.escape(text, quote=False).replace('&#x27;', "'"), flags=re.S)
        ls = text.rstrip('\n').split('\n')
        if len(ls) > lines:
            ls = ls[:lines] + ['…']
        h += f'<div class="out">{chr(10).join(ls)}</div>'
    return h


def draw(src, zoom=1.2):
    r = run(src)
    ops = [{k: (round(v, 1) if isinstance(v, float) else v) for k, v in o.items() if k in ('t', 'x1', 'y1', 'x2', 'y2', 'd', 'c', 'w', 'bg', 'pts', 'x', 'y', 'r')} for o in r['ops'] if o['t'] in ('m', 'clear', 'bg', 'fill', 'dot')]
    ops = [o for o in ops if o['t'] != 'm' or o['d']]
    for o in ops:
        if 'pts' in o:
            o['pts'] = [[round(a, 1), round(b, 1)] for a, b in o['pts']]
    return f'<canvas class="draw" data-zoom="{zoom}" data-ops="{html.escape(json.dumps(ops, separators=(",", ":")))}"></canvas>'


def S(inner, cls=''):
    return f'<section class="slide {cls}">{inner}</section>'


def title(lesson, h, sub):
    return S(f'<div class="k">Python · Урок {lesson}</div><h1>{h}</h1><p>{sub}</p><div class="foot">KIBERone · Программирование на Python</div>', 'title')


def H(text, small=''):
    return f'<h2>{f"<small>{small}</small>" if small else ""}{text}</h2>'


def ul(items, tag='ul'):
    return f'<{tag}>' + ''.join(f'<li>{i}</li>' for i in items) + f'</{tag}>'


def page(n, name, slides):
    body = '\n'.join(slides)
    doc = f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Урок {n}: {name} — презентация</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/slides.css">
</head>
<body>
<main class="deck" aria-label="Презентация: урок {n}">
{body}
</main>
<script src="../assets/slides.js"></script>
</body>
</html>
'''
    with open(os.path.join(ROOT, 'slides', f'urok-{n}.html'), 'w', encoding='utf-8') as f:
        f.write(doc)
    print('slides/urok-%d.html: %d слайдов' % (n, len(slides)))


os.makedirs(os.path.join(ROOT, 'slides'), exist_ok=True)
T = 'from turtle import *\n'

# ======================= УРОК 8 =======================
SQ = 'def drawSquare(size):\n    for i in range(4):\n        forward(size)\n        right(90)\n'
page(8, 'Функции', [
    title(8, 'Знакомство с функциями', 'Пишем свои функции и рисуем ими узоры черепашкой'),
    S(H('План урока') + ul(['Разминка в тренажёре скоропечати', 'Что такое функция и зачем она нужна', 'Как написать и вызвать свою функцию', 'Функции-фигуры для черепашки', 'Узоры, цвета по кругу и градиенты', 'Итоги и домашнее задание'], 'ol')),
    S(H('Разминка', 'Перед началом') + '<p>Открываем тренажёр <b>speedcoder.net/lessons</b> и печатаем код на скорость.</p><p>Результат записываем в блокнот — так видно, как растёт скорость от урока к уроку.</p><div class="note">Тьютор тоже записывает свой результат!</div>'),
    S(H('Что такое функция') + '<div class="cols"><div><p>Функция — участок кода с <b>именем</b>. Он отделён от остальной программы и выполняется только тогда, когда его <b>вызывают</b>.</p><p>Мы уже пользовались готовыми функциями:</p></div><div class="cards" style="--n:2"><div class="cardx"><h3>print()</h3><p>вывести на экран</p></div><div class="cardx"><h3>len()</h3><p>длина</p></div><div class="cardx"><h3>int()</h3><p>в целое число</p></div><div class="cardx"><h3>input()</h3><p>ввод с клавиатуры</p></div></div></div>'),
    S(H('Первая своя функция') + '<div class="cols"><div>' + code('def sumAB(a, b):\n    print(a + b)', '') + '<p style="margin-top:18px">Запускаем — и <b>ничего не происходит</b>. Функцию только объявили.</p></div><div>' + code('def sumAB(a, b):\n    print(a + b)\n\nsumAB(10, 40)\nsumAB(30, 5400)\nsumAB("30", "001")', 'sm', out=True) + '</div></div>'),
    S(H('Как устроена функция', 'Записать в блокнот') + '<div class="cols wide"><div>' + ul(['в начале ключевое слово <code>def</code>;', 'потом <b>имя</b> функции;', 'в скобках — <b>параметры</b> (их может и не быть);', 'в конце — двоеточие <code>:</code>, как у циклов;', 'тело — с отступом в 1 табуляцию;', 'вызов — имя и значения в скобках.']) + '</div><div>' + code('def sumAB(a, b):\n    print(a + b)\n\nsumAB(10, 40)\n# a = 10, b = 40\n# print(10 + 40) → 50') + '</div></div>'),
    S(H('Подключаем черепашку', 'PyCharm') + '<div class="cols"><div>' + code('from turtle import *\n\nforward(100)\nright(90)\nforward(100)\n\ndone()') + '</div><div><p><code>from turtle import *</code> — берём все команды черепашки.</p><p><code>done()</code> — последняя строка: без неё окно с рисунком сразу закроется.</p><p>Черепашка стартует в центре, в точке (0, 0), и смотрит <b>вправо</b>.</p></div></div>'),
    S(H('Квадрат — без функции и с функцией') + '<div class="cols"><div>' + code('forward(100)\nright(90)\nforward(100)\nright(90)\nforward(100)\nright(90)\nforward(100)', 'sm') + '</div><div>' + code('def drawSquare():\n    for i in range(4):\n        forward(100)\n        right(90)\n\ndrawSquare()', 'sm') + '<p style="margin-top:16px">Но какой смысл в функции, которая всегда рисует один и тот же квадрат?</p></div></div>'),
    S(H('Параметр size') + '<div class="cols"><div>' + code(SQ + '\ndrawSquare(50)\ndrawSquare(100)\ndrawSquare(150)', 'sm') + '<p style="margin-top:16px">Параметр стоит везде, где черепашка идёт вперёд.</p></div><div>' + draw(T + SQ + 'width(2)\ndrawSquare(50)\ndrawSquare(100)\ndrawSquare(150)', zoom=1.9) + '</div></div>'),
    S(H('Зачем нужны функции') + '<div class="cards"><div class="cardx"><h3>Короче</h3><p>Код не повторяется: написал один раз, вызываешь сколько угодно.</p></div><div class="cardx"><h3>Понятнее</h3><p>По имени drawSquare сразу видно, что делает код, без комментариев.</p></div><div class="cardx"><h3>Мощнее</h3><p>Из простых функций собираются сложные узоры.</p></div></div>'),
    S(H('Узор из квадратов') + '<div class="cols"><div>' + code(SQ + '\nspeed(0)\nfor i in range(20):\n    drawSquare(80)\n    forward(360 / 20)\n    left(360 / 20)\nhideturtle()', 'sm') + '</div><div>' + draw(T + SQ + 'speed(0)\nfor i in range(20):\n    drawSquare(80)\n    forward(18)\n    left(18)\nhideturtle()') + '</div></div>'),
    S(H('Функции-фигуры') + '<div class="cols"><div>' + code('def drawTriangle(size):\n    for i in range(3):\n        forward(size)\n        left(120)\n\ndef drawPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        left(360 / edges)\n\ndef drawRound(size):\n    for i in range(360):\n        forward(size)\n        backward(size)\n        right(1)', 'xs') + '</div><div>' + draw(T + 'def drawPolygon(size, edges):\n    for i in range(edges):\n        forward(size)\n        left(360 / edges)\nwidth(2)\nfor e in range(3, 9):\n    color(["red","orange","gold","green","blue","purple"][e-3])\n    drawPolygon(60, e)', zoom=2.1) + '<p style="margin-top:14px;font-size:22px">Подставь в узор вместо drawSquare любую другую функцию — получится новый узор.</p></div></div>'),
    S(H('Цвета по кругу: i % len(colors)') + '<div class="cols"><div>' + code('colors = ["red", "orange", "gold"]\nfor i in range(7):\n    print(i, i % len(colors), colors[i % len(colors)])', 'sm', out=True) + '</div><div><p><code>colors[i]</code> сломается, когда <code>i</code> станет больше количества цветов: <b>IndexError</b>.</p><p>Остаток от деления <code>i % len(colors)</code> всегда от 0 до len − 1, и цвета идут <b>по кругу</b>.</p></div></div>'),
    S(H('Разноцветный круг') + '<div class="cols"><div>' + code('colors = ["plum", "orchid", "mediumpurple",\n          "slateblue", "indigo"]\n\ndef colorRound(size):\n    speed(0)\n    for i in range(360):\n        color(colors[i % len(colors)])\n        forward(size)\n        backward(size)\n        right(1)\n\ncolorRound(150)', 'sm') + '</div><div>' + draw(T + 'colors = ["plum", "orchid", "mediumpurple", "slateblue", "indigo"]\nwidth(2)\nfor i in range(360):\n    color(colors[i % len(colors)])\n    forward(150)\n    backward(150)\n    right(1)') + '</div></div>'),
    S(H('Цвет тремя числами: RGB') + '<div class="cols"><div><p>Три числа от 0 до 255 — сколько в цвете <b style="color:#e5484d">красного</b>, <b style="color:#30a46c">зелёного</b> и <b style="color:#3e63dd">синего</b>.</p>' + ul(['<code>(255, 0, 0)</code> — красный', '<code>(0, 0, 0)</code> — чёрный', '<code>(255, 255, 255)</code> — белый']) + '<div class="note warn" style="margin-top:20px">Сначала <code>colormode(255)</code>, иначе ошибка bad color sequence.</div></div><div>' + code('colormode(255)\nfor i in range(360):\n    color(255, int(i * 255 / 360), 0)\n    forward(150)\n    backward(150)\n    right(1)', 'sm') + '</div></div>'),
    S(H('Градиент') + '<div class="cols"><div>' + draw(T + 'colormode(255)\nwidth(2)\nfor i in range(360):\n    color(255, int(i * 255 / 360), 0)\n    forward(150)\n    backward(150)\n    right(1)') + '</div><div>' + draw(T + 'colormode(255)\nwidth(2)\nfor i in range(360):\n    color(int(i * 255 / 360), 80, 255 - int(i * 255 / 360))\n    forward(150)\n    backward(150)\n    right(1)') + '</div></div><p style="margin-top:20px">Градиент — цвета, которые плавно меняются. Здесь номер луча <code>i</code> управляет цветом.</p>'),
    S(H('Итоги урока') + ul(['Функция — код с именем, который работает только при вызове.', '<code>def имя(параметры):</code> и тело с отступом.', 'Параметры делают функцию гибкой.', 'Из маленьких функций собираются большие узоры.', '<code>colors[i % len(colors)]</code> — цвета по кругу, <code>colormode(255)</code> — для RGB.']) + '<div class="note ok">Домашка: <b>сайт курса → Урок 8 → Домашнее задание</b></div>'),
])

# ======================= УРОК 9 =======================
DRAW = 'def drawBoard(board):\n    print("-" * 13)\n    for i in range(3):\n        print("|", board[0 + i * 3], "|", board[1 + i * 3], "|", board[2 + i * 3], "|")\n        print("-" * 13)\n'
VALID = 'def isValidInput(playerAnswer):\n    try:\n        playerAnswer = int(playerAnswer)\n    except ValueError:\n        print("Некорректный ввод. Вы уверены, что ввели число?")\n        return False\n    if playerAnswer < 1 or playerAnswer > 9:\n        print("Некорректный ввод. Введите число от 1 до 9")\n        return False\n    return True\n'
TAKE = 'def takeInput(playerToken):\n    valid = False\n    while not valid:\n        playerAnswer = input("Куда поставим " + playerToken + "? ")\n        if not isValidInput(playerAnswer):\n            continue\n        playerAnswer = int(playerAnswer)\n        if str(board[playerAnswer - 1]) not in "XO":\n            board[playerAnswer - 1] = playerToken\n            valid = True\n        else:\n            print("Эта клетка уже занята!")\n'
CHECK = 'def checkWin(board):\n    winCoord = ((0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6),\n                (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6))\n    for coord in winCoord:\n        if board[coord[0]] == board[coord[1]] == board[coord[2]]:\n            return board[coord[0]]\n    return False\n'
MAIN = 'def main(board):\n    counter = 0\n    win = False\n    while not win:\n        drawBoard(board)\n        if counter % 2 == 0:\n            takeInput("X")\n        else:\n            takeInput("O")\n        counter += 1\n        if counter > 4:\n            tmp = checkWin(board)\n            if tmp:\n                print(tmp, "выиграл!")\n                win = True\n                break\n        if counter == 9:\n            print("Ничья!")\n            break\n    drawBoard(board)\n'
TTT = 'board = list(range(1, 10))\n\n' + DRAW + '\n' + VALID + '\n' + TAKE + '\n' + CHECK + '\n' + MAIN + '\nmain(board)\n'
page(9, 'Крестики-нолики', [
    title(9, 'Игра «Крестики-нолики»', 'Собираем консольную игру из функций, циклов, условий и списков'),
    S(H('План урока') + ul(['Разминка в тренажёре скоропечати', 'Продумываем игру: поле, ходы, победа', 'Пишем 5 функций', 'Собираем игру и тестируем', 'Практикум: две задачи на условия'], 'ol')),
    S(H('Что должно быть в игре') + '<div class="cards"><div class="cardx"><h3>1. Поле</h3><p>В консоли рисуется поле 3 × 3 с номерами клеток.</p></div><div class="cardx"><h3>2. Ходы</h3><p>Игрок вводит номер клетки, ставит X или O, ход переходит к другому.</p></div><div class="cardx"><h3>3. Победа</h3><p>Три одинаковых знака в ряд — игра заканчивается.</p></div></div><div class="note" style="margin-top:30px">Если игрок ввёл не номер клетки, программа не должна ломаться — это тоже надо обработать.</div>'),
    S(H('Пять функций игры') + '<div class="cards" style="--n:2">' + ''.join(f'<div class="cardx"><h3>{a}</h3><p>{b}</p></div>' for a, b in [('main()', 'главный цикл игры, запускает остальные функции'), ('drawBoard()', 'рисует поле с ходами'), ('takeInput()', 'принимает ход и передаёт его другому игроку'), ('isValidInput()', 'проверяет, что ввели число от 1 до 9'), ('checkWin()', 'проверяет, не победил ли кто-то')]) + '</div>'),
    S(H('Игровое поле — список') + '<div class="cols"><div>' + code('board = list(range(1, 10))\nprint(board)', 'sm', out=True) + '<p style="margin-top:18px">Список из 9 клеток. Клетка в строке <code>i</code> и столбце <code>j</code> — это <code>board[j + i * 3]</code>.</p></div><div><pre class="code" style="font-size:34px;line-height:1.7"> 0 | 1 | 2\n 3 | 4 | 5\n 6 | 7 | 8</pre><p style="margin-top:14px">Индексы клеток в списке. Номера для игрока — на 1 больше.</p></div></div>'),
    S(H('drawBoard() — рисуем поле') + '<div class="cols wide"><div>' + code(DRAW + '\nboard = list(range(1, 10))\ndrawBoard(board)', 'xs') + '</div><div><div class="out">' + html.escape(run(DRAW + 'drawBoard(list(range(1, 10)))')['out'].rstrip()) + '</div></div></div>'),
    S(H('try / except — защита от ошибок') + '<div class="cols"><div>' + code(VALID, 'xs') + '</div><div><p><code>int("abc")</code> обычно ломает программу. Внутри <code>try</code> ошибка не останавливает игру — Python переходит в <code>except</code>.</p><p><code>return</code> возвращает значение туда, где функцию вызвали: <code>True</code> или <code>False</code>.</p></div></div>'),
    S(H('takeInput() — ход игрока') + '<div class="cols wide"><div>' + code(TAKE, 'xs') + '</div><div>' + ul(['<code>valid = False</code> — пока ход не принят, крутимся в цикле;', '<code>continue</code> — сразу на новый круг;', 'клетка свободна, если в ней ещё не X и не O;', 'занята — просим другую.']) + '</div></div>'),
    S(H('checkWin() — кто победил?') + '<div class="cols wide"><div>' + code(CHECK, 'xs') + '</div><div><p>8 выигрышных линий: 3 строки, 3 столбца, 2 диагонали.</p><p>Функция вернёт <code>"X"</code>, <code>"O"</code> или <code>False</code>.</p>' + code(CHECK + '\nprint(checkWin(["X", "X", "X", 4, 5, 6, 7, 8, 9]))\nprint(checkWin([1, 2, 3, 4, 5, 6, 7, 8, 9]))', 'xs', out=True).split('</pre>', 1)[1] + '</div></div>'),
    S(H('main() — главный цикл') + '<div class="cols wide"><div>' + code(MAIN, 'xs') + '</div><div>' + ul(['<code>counter</code> считает ходы: чётный — X, нечётный — O;', 'проверять победу есть смысл после 5-го хода;', '<code>if tmp:</code> — строка "X" или "O" считается истиной;', '9 ходов без победы — ничья, <code>break</code>.']) + '</div></div>'),
    S(H('Запускаем и тестируем') + '<div class="cols"><div><p>Попробуй сломать игру:</p>' + ul(['ввести букву вместо числа;', 'ввести 0 или 10;', 'поставить знак в занятую клетку;', 'собрать каждую из 8 победных линий;', 'сыграть вничью.']) + '</div><div>' + ('<div class="out" style="font-size:15px">' + '\n'.join(html.escape(re.sub(r'[\x01-\x03]', '', run(TTT, ['5', 'abc', '10', '5', '1', '9', '3', '7', '2'])['out'])).rstrip().split('\n')[-17:]) + '</div>') + '</div></div>'),
    S(H('Практикум: задача 1', 'Максимум из трёх') + '<div class="cols"><div><p>Вводятся три числа. Найди максимальное <b>без</b> <code>max()</code> и <code>sort()</code>. Если максимум не один — сообщи, что числа равны.</p><div class="note">Протестируй так, чтобы программа зашла в каждое условие.</div></div><div>' + code('a = int(input())\nb = int(input())\nc = int(input())\nif a > b and a > c:\n    print("Первое максимальное:", a)\nelif b > a and b > c:\n    print("Второе максимальное:", b)\nelif c > a and c > b:\n    print("Третье максимальное:", c)\nelse:\n    print("Числа равны")', 'xs', out=True, stdin=['4', '9', '2']) + '</div></div>'),
    S(H('Практикум: задача 2', 'Функция по частям') + '<div class="cols"><div><p>y = 10, если x ≥ 0<br>y = 2·x + 5, если x ≤ −10<br>y = x·x − 3, если −10 &lt; x &lt; 0</p><p>Для каждого диапазона — своё условие.</p></div><div>' + code('x = float(input())\nif x >= 0:\n    y = 10\nelif x <= -10:\n    y = 2 * x + 5\nelse:\n    y = x * x - 3\nprint(y)', 'sm', out=True, stdin=['-4']) + '</div></div>'),
    S(H('Итоги урока') + ul(['Большая программа — это несколько маленьких функций.', '<code>return</code> возвращает результат функции.', '<code>try / except</code> не даёт программе упасть от неверного ввода.', 'Игру надо тестировать, пытаясь её сломать.']) + '<div class="note ok">Сыграйте в свою игру с соседом!</div>'),
])

# ======================= УРОК 10 =======================
DICE_BAD = 'import random\n\nplayer1 = input("Имя первого игрока: ")\nplayer2 = input("Имя второго игрока: ")\ndice1 = [1, 2, 3, 4, 5, 6]\ndice2 = [1, 2, 3, 4, 5, 6]\nscore1 = 0\nscore2 = 0\n\nfor i in range(3):\n    input(player1 + ", нажми Enter, чтобы бросить кости")\n    result = random.choice(dice1) + random.choice(dice2)\n    print("Выпало:", result)\n    score1 = score1 + result\n    input(player2 + ", нажми Enter, чтобы бросить кости")\n    result = random.choice(dice1) + random.choice(dice2)\n    print("Выпало:", result)\n    score2 = score2 + result\n\nif score1 > score2:\n    print("Победил", player1)\nelif score2 > score1:\n    print("Победил", player2)\nelse:\n    print("Ничья")'
DICE_GOOD = 'import random\n\ndef rollDice():\n    return random.randint(1, 6) + random.randint(1, 6)\n\ndef playerTurn(name):\n    input(name + ", нажми Enter, чтобы бросить кости")\n    result = rollDice()\n    print(name, "выбросил", result)\n    return result\n\ndef announceWinner(name1, score1, name2, score2):\n    if score1 > score2:\n        print("Победил", name1)\n    elif score2 > score1:\n        print("Победил", name2)\n    else:\n        print("Ничья")\n\nplayer1 = input("Имя первого игрока: ")\nplayer2 = input("Имя второго игрока: ")\nscore1 = 0\nscore2 = 0\nfor i in range(3):\n    score1 += playerTurn(player1)\n    score2 += playerTurn(player2)\nannounceWinner(player1, score1, player2, score2)'
run(DICE_BAD, ['Аня', 'Петя'] + [''] * 6)
run(DICE_GOOD, ['Аня', 'Петя'] + [''] * 6)
page(10, 'Библиотеки и рефакторинг', [
    title(10, 'Библиотеки и рефакторинг', 'Модули math, random и time, игра в кости и правила чистого кода'),
    S(H('План урока') + ul(['Что такое библиотеки (модули)', 'math — математика', 'random — случайность', 'Игра в кости', 'Рефакторинг и чистый код', 'Бонус: модуль time'], 'ol')),
    S(H('Библиотеки — готовые инструменты') + '<p>Библиотеки — наборы функций, которые уже написали другие программисты. Берём и пользуемся, чтобы не «изобретать велосипед».</p><div class="cards" style="margin-top:20px"><div class="cardx"><h3>turtle</h3><p>уже знакомы: рисуем черепашкой</p></div><div class="cardx"><h3>math</h3><p>математика: корни, округление, π</p></div><div class="cardx"><h3>random</h3><p>случайные числа и выбор</p></div></div><div class="note" style="margin-top:24px"><code>import math</code> — подключить модуль. Дальше пишем <code>math.</code> и имя функции.</div>'),
    S(H('Модуль math') + '<div class="cols"><div>' + ul(['<code>math.ceil(x)</code> — округлить вверх', '<code>math.floor(x)</code> — округлить вниз', '<code>math.sqrt(x)</code> — квадратный корень', '<code>math.pi</code> — число π', '<code>math.sin</code>, <code>math.cos</code> — тригонометрия']) + '</div><div>' + code('import math\n\nprint(math.ceil(4.2))\nprint(math.floor(4.8))\nprint(math.sqrt(81))\nprint(math.pi)', 'sm', out=True) + '</div></div>'),
    S(H('Длина окружности') + '<div class="cols"><div><p>Радиус вводится с клавиатуры. Длина окружности = <b>2 · π · R</b>. Потом отбрасываем дробную часть, округлив вниз.</p></div><div>' + code('import math\n\nR = float(input("Радиус: "))\nlength = 2 * math.pi * R\nprint(length)\nprint(math.floor(length))', 'sm', out=True, stdin=['10']) + '</div></div>'),
    S(H('Модуль random') + '<div class="cols"><div>' + ul(['<code>random.choice(список)</code> — случайный элемент', '<code>random.randint(1, 6)</code> — случайное целое от 1 до 6', '<code>random.shuffle(список)</code> — перемешать']) + '<p style="margin-top:16px">Запусти несколько раз — результат каждый раз разный!</p></div><div>' + code('import random\n\nfruits = ["яблоко", "груша", "банан"]\nprint(random.choice(fruits))\nprint(random.randint(1, 6))\nrandom.shuffle(fruits)\nprint(fruits)', 'sm') + '</div></div>'),
    S(H('Розыгрыш призов') + '<div class="cols"><div><p>Кто получит главный приз? Пусть решит random.</p></div><div>' + code('import random\n\nplayers = ["Аня", "Петя", "Маша", "Ваня"]\nwinner = random.choice(players)\nprint("Главный приз получает", winner)', 'sm') + '</div></div>'),
    S(H('Игра в кости', 'Первая версия') + '<div class="cols wide"><div>' + code(DICE_BAD.replace('\n\n', '\n'), 'xxs') + '</div><div><p>Два игрока бросают по две кости три раза. У кого сумма больше — тот победил.</p><p><code>input()</code> — чтобы игра не пролетала за долю секунды.</p></div></div>'),
    S(H('Что не так с этим кодом?') + '<div class="cols"><div>' + ul(['Код для первого и второго игрока <b>почти одинаковый</b>.', 'Условие победы — отдельная часть логики.', 'Если захотим 3 игрока — придётся копировать ещё.']) + '</div><div class="note" style="margin:0">Одинаковые куски кода — сигнал: <b>выдели их в функцию</b>.</div></div>'),
    S(H('Рефакторинг', 'Улучшаем код, не меняя поведение') + '<div class="cols"><div>' + code(DICE_GOOD.split('player1 = input')[0].strip(), 'xxs') + '</div><div>' + code('player1 = input' + DICE_GOOD.split('player1 = input')[1], 'xxs') + '<p style="margin-top:16px;font-size:22px">Игра работает так же, но код читается как рассказ: бросок, ход игрока, объявление победителя.</p></div></div>'),
    S(H('Чистый код: одна задача — три решения') + '<p style="font-size:24px">Вывести все числа списка, которые меньше 10.</p><div class="cards"><div class="cardx"><h3>Понятно</h3>' + code('for number in numbers:\n    if number < 10:\n        print(number)', 'xs') + '</div><div class="cardx"><h3>Слишком сложно</h3>' + code('print(list(filter(\n  lambda x: x < 10,\n  numbers)))', 'xs') + '</div><div class="cardx"><h3>Опытно</h3>' + code('print([n for n in numbers\n       if n < 10])', 'xs') + '</div></div>'),
    S(H('Имена говорят за себя') + '<div class="cols"><div>' + code('a = int(input())\nif a % 4 == 0 and a % 100 != 0 or a % 400 == 0:\n    print("Да")\nelse:\n    print("Нет")', 'xs') + '<p style="margin-top:14px">Что делает этот код? Сразу не понять.</p></div><div>' + code('def isLeapYear(year):\n    return year % 4 == 0 and year % 100 != 0 \\\n        or year % 400 == 0\n\nyear = int(input())\nif isLeapYear(year):\n    print("Високосный")\nelse:\n    print("Обычный")', 'xs', out=True, stdin=['2024']) + '</div></div>'),
    S(H('Правила чистого кода') + ul(['Имя переменной объясняет, что в ней: <code>apples</code>, а не <code>a</code>.', 'Список — во множественном числе: <code>numbers</code>, а не <code>number</code>.', 'Имя функции — действие: <code>drawBoard</code>, <code>isLeapYear</code>.', 'Имена — на английском, слова слитно с большой буквы или через <code>_</code>.', 'Повторяющийся код — в функцию.', 'Комментарии — там, где без них не понять, а не на каждой строке.'])),
    S(H('Бонус: модуль time') + '<div class="cols"><div>' + ul(['<code>time.sleep(2)</code> — пауза 2 секунды', '<code>time.time()</code> — секунды с 1 января 1970', '<code>time.ctime(t)</code> — время в читаемом виде']) + '<p style="margin-top:14px">Задача: какое время будет ровно через неделю? В неделе 60 · 60 · 24 · 7 = 604 800 секунд.</p></div><div>' + code('import time\n\nweek = 60 * 60 * 24 * 7\nprint(time.ctime(time.time() + week))', 'sm') + '</div></div>'),
    S(H('Итоги урока') + ul(['<code>import</code> подключает библиотеку.', 'math — округление, корни, π; random — случайности.', 'Рефакторинг делает код понятнее, не меняя его работу.', 'Хорошие имена и функции — основа чистого кода.'])),
])

# ======================= УРОК 11 =======================
page(11, 'ИИ-ассистент', [
    title(11, 'ИИ-ассистент программиста', 'Учимся просить нейросеть о помощи и проверять её ответы'),
    S(H('План урока') + ul(['Что такое ИИ-ассистент', 'Пишем запрос и получаем код', 'Когда ИИ действительно полезен', 'Решаем задачи сами, потом сравниваем с ИИ', 'Где ИИ ошибается']), ),
    S(H('Друг-программист рядом') + '<p>Представь друга, который сидит рядом и в любой момент подсказывает код, предлагает варианты и находит ошибки.</p><p><b>ИИ-ассистент</b> — программа, обученная на миллионах строк кода. Она понимает, что ты хочешь, и предлагает решения.</p><div class="note">Многие среды разработки уже содержат ИИ внутри. Ещё есть отдельные сервисы: YandexGPT, GigaChat, DeepSeek и другие.</div>'),
    S(H('Пишем запрос', 'Промпт') + '<div class="cols"><div class="note" style="margin:0;font-size:24px">«Напиши программу на Python: два игрока бросают кости по три раза каждый. Значения двух костей складываются и добавляются к очкам игрока. После трёх бросков суммы сравниваются и определяется победитель».</div><div>' + ul(['Сравни ответ с кодом с прошлого урока.', 'Сравни ответы у соседей — они разные!', 'Любую программу можно написать по-разному.']) + '</div></div>'),
    S(H('Когда ИИ полезен') + '<div class="cards">' + ''.join(f'<div class="cardx"><h3>{a}</h3><p>{b}</p></div>' for a, b in [('Новая тема', 'объяснить 2–3 функции библиотеки простыми словами'), ('Быстрый старт', 'сделать каркас программы: функции и структуру'), ('Понять ошибку', 'вставить текст ошибки и спросить причину'), ('Рефакторинг', '«вынеси повтор в функцию», «подбери понятные имена»'), ('Тестовые данные', 'списки чисел и примеры для проверки'), ('Перенос', 'переписать пример с turtle под ColabTurtle и обратно')]) + '</div>'),
    S(H('Правило урока') + '<div class="cols"><div class="big">1 → 2</div><div><p><b>Сначала</b> решаем задачу сами.</p><p><b>Потом</b> просим ИИ решить её же.</p><p><b>Сравниваем</b>: что лучше, что понятнее, где ошибки?</p></div></div>'),
    S(H('Задача 1: калькулятор') + '<div class="cols"><div><p>Функция принимает два числа и операцию и печатает результат. Ввод гарантированно верный.</p></div><div>' + code('def calculator(a, b, op):\n    if op == "+":\n        print(a + b)\n    elif op == "-":\n        print(a - b)\n    elif op == "*":\n        print(a * b)\n    elif op == "/":\n        print(a / b)\n\ncalculator(10, 4, "*")', 'sm', out=True) + '</div></div>'),
    S(H('Задача 2: сколько цифр в числе') + '<div class="cols"><div><p>Делим число нацело на 10, пока оно не станет нулём, и считаем шаги.</p></div><div>' + code('def digitCounter(n):\n    count = 0\n    while n > 0:\n        n = n // 10\n        count = count + 1\n    print(count)\n\ndigitCounter(103)\ndigitCounter(7)', 'sm', out=True) + '</div></div>'),
    S(H('Задача 3: треугольник из звёздочек') + '<div class="cols"><div><p>Вспоминаем умножение строки на число.</p>' + code('def buildTriangle(height):\n    for i in range(1, height + 1):\n        print("*" * i)\n\nbuildTriangle(4)', 'sm') + '</div><div><div class="out" style="font-size:30px">' + run('for i in range(1, 5):\n    print("*" * i)')['out'].rstrip() + '</div></div></div>'),
    S(H('Задача 4: палиндром') + '<div class="cols"><div><p>Слово читается одинаково слева направо и справа налево. Сравниваем первый символ с последним, второй — с предпоследним… до середины.</p></div><div>' + code('def isPalindrome(text):\n    result = True\n    for i in range(len(text) // 2):\n        if text[i] != text[-1 - i]:\n            result = False\n    if result:\n        print("Yes")\n    else:\n        print("No")\n\nisPalindrome("121")\nisPalindrome("шалаш")\nisPalindrome("кот")', 'xs', out=True) + '</div></div>'),
    S(H('ИИ тоже ошибается') + '<div class="cols"><div>' + ul(['На сложных задачах ИИ путается, особенно в длинных условиях.', 'Олимпиадные задачи (например, Timus 1731) — слабое место.', 'ИИ может уверенно написать неправильный код.']) + '</div><div class="note warn" style="margin:0">Никогда не выдавай код нейросети за правильный, пока сам не разобрался и не проверил его.</div></div>'),
    S(H('Как писать хороший запрос') + ul(['Короткие и чёткие предложения — с ними ИИ справляется отлично.', 'Пиши, на каком языке и для какой среды (Python, turtle, PyCharm).', 'Дай пример: что вводится и что должно получиться.', 'Большую задачу разбей на маленькие шаги.', 'Попроси объяснить код — и проверь, понятно ли тебе.'])),
    S(H('Итоги урока') + ul(['ИИ-ассистент ускоряет работу: каркас, объяснения, поиск ошибок.', 'Сначала думаем сами, потом сверяемся с ИИ.', 'Любой код от ИИ нужно проверять и понимать.']) + '<div class="note ok">Попробуй дома: реши задачу сам, а потом попроси ИИ найти, что можно улучшить.</div>'),
])
