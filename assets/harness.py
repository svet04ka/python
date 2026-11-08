# Песочница для кода учеников: ввод, вывод, черепашка, понятные ошибки.
# Работает и в браузере (Pyodide), и в обычном Python (для тестов).
import sys, io, json, math, types, traceback, builtins, time as _time

MAX_OPS = 200000
MAX_OUT = 200000


class StopProgram(BaseException):
    pass


class TurtleGraphicsError(Exception):
    pass


# ---------------- запись рисунка ----------------
class Recorder:
    def __init__(self):
        self.ops = []
        self.bg = 'white'
        self.mode = None

    def push(self, op):
        if len(self.ops) >= MAX_OPS:
            raise StopProgram('Слишком много шагов черепашки. Возможно, цикл никогда не заканчивается.')
        self.ops.append(op)


REC = Recorder()


def _num(v, fn):
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise TypeError(f'{fn}() ждёт число, а получила {v!r}')
    return float(v)


# ---------------- обычный turtle (как в PyCharm) ----------------
class _Screen:
    def __init__(self):
        self._cmode = 1.0
        self._bg = 'white'

    def colormode(self, m=None):
        if m is None:
            return self._cmode
        if m not in (1, 1.0, 255):
            raise TurtleGraphicsError('colormode бывает только 1.0 или 255')
        self._cmode = 255 if m == 255 else 1.0

    def color_to_css(self, args, fn):
        if len(args) == 1 and isinstance(args[0], (tuple, list)):
            args = tuple(args[0])
        if len(args) == 1 and isinstance(args[0], str):
            name = args[0].replace(' ', '')
            if not name:
                raise TurtleGraphicsError(f'bad color string: {args[0]!r}')
            return name
        if len(args) == 3:
            v = [_num(a, fn) for a in args]
            if self._cmode == 1.0:
                if any(a < 0 or a > 1 for a in v):
                    raise TurtleGraphicsError(f'bad color sequence: {tuple(args)}. Если числа от 0 до 255, сначала напиши colormode(255)')
                v = [round(a * 255) for a in v]
            else:
                if any(a < 0 or a > 255 for a in v):
                    raise TurtleGraphicsError(f'bad color sequence: {tuple(args)}. Числа цвета должны быть от 0 до 255')
                v = [round(a) for a in v]
            return 'rgb(%d,%d,%d)' % tuple(v)
        raise TurtleGraphicsError(f'{fn}(): непонятный цвет {args!r}')

    def bgcolor(self, *args):
        if not args:
            return self._bg
        self._bg = self.color_to_css(args, 'bgcolor')
        REC.push({'t': 'bg', 'c': self._bg})

    def setup(self, *a, **k): pass
    def screensize(self, *a, **k): pass
    def title(self, *a, **k): pass
    def tracer(self, *a, **k): pass
    def update(self, *a, **k): pass
    def delay(self, *a, **k): pass
    def listen(self, *a, **k): pass
    def onkey(self, *a, **k): pass
    def onkeypress(self, *a, **k): pass
    def onclick(self, *a, **k): pass
    def ontimer(self, *a, **k): pass
    def mainloop(self): pass
    def exitonclick(self): pass
    def bye(self): pass
    def window_width(self): return 800
    def window_height(self): return 500
    done = mainloop


class Turtle:
    def __init__(self, *a, **k):
        self._x = 0.0
        self._y = 0.0
        self._h = 0.0  # градусы, 0 — вправо, против часовой
        self._pen = True
        self._pc = 'black'
        self._fc = 'black'
        self._w = 1.0
        self._vis = True
        self._shape = 'classic'
        self._fill = None
        self._push({'t': 'r'})

    # служебное
    def _cx(self):
        return 400 + self._x, 250 - self._y

    def _push(self, op):
        x, y = self._cx()
        op.update({'x': x, 'y': y, 'h': (-self._h) % 360, 'vis': self._vis, 'sh': self._shape, 'pc': self._pc})
        REC.push(op)

    def _move(self, nx, ny):
        x1, y1 = self._cx()
        self._x, self._y = nx, ny
        x2, y2 = self._cx()
        self._push({'t': 'm', 'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2, 'd': self._pen, 'c': self._pc, 'w': self._w})
        if self._fill is not None:
            self._fill.append([x2, y2])

    # движение
    def forward(self, d):
        d = _num(d, 'forward')
        r = math.radians(self._h)
        self._move(self._x + d * math.cos(r), self._y + d * math.sin(r))
    fd = forward

    def backward(self, d):
        self.forward(-_num(d, 'backward'))
    back = bk = backward

    def left(self, a):
        self._h = (self._h + _num(a, 'left')) % 360
        self._push({'t': 'r'})
    lt = left

    def right(self, a):
        self._h = (self._h - _num(a, 'right')) % 360
        self._push({'t': 'r'})
    rt = right

    def goto(self, x, y=None):
        if y is None:
            x, y = x
        self._move(_num(x, 'goto'), _num(y, 'goto'))
    setpos = setposition = goto

    def setx(self, x): self._move(_num(x, 'setx'), self._y)
    def sety(self, y): self._move(self._x, _num(y, 'sety'))

    def home(self):
        self._move(0.0, 0.0)
        self._h = 0.0
        self._push({'t': 'r'})

    def setheading(self, a):
        self._h = _num(a, 'setheading') % 360
        self._push({'t': 'r'})
    seth = setheading

    def heading(self): return round(self._h, 6) % 360
    def position(self): return (round(self._x, 2), round(self._y, 2))
    pos = position
    def xcor(self): return round(self._x, 2)
    def ycor(self): return round(self._y, 2)

    def distance(self, x, y=None):
        if y is None:
            x, y = x
        return math.hypot(x - self._x, y - self._y)

    def towards(self, x, y=None):
        if y is None:
            x, y = x
        return math.degrees(math.atan2(y - self._y, x - self._x)) % 360

    def circle(self, radius, extent=None, steps=None):
        radius = _num(radius, 'circle')
        if extent is None:
            extent = 360
        extent = _num(extent, 'circle')
        frac = abs(extent) / 360
        if steps is None:
            steps = 1 + int(min(11 + abs(radius) / 6.0, 59.0) * frac)
        w = extent / steps
        w2 = 0.5 * w
        l = 2.0 * radius * math.sin(math.radians(w2))
        if radius < 0:
            l, w, w2 = -l, -w, -w2
        self.left(w2)
        for _ in range(steps):
            self.forward(l)
            self.left(w)
        self.right(w2)

    # перо
    def penup(self): self._pen = False
    pu = up = penup
    def pendown(self): self._pen = True
    pd = down = pendown
    def isdown(self): return self._pen

    def pensize(self, w=None):
        if w is None:
            return self._w
        self._w = _num(w, 'pensize')
    width = pensize

    def pencolor(self, *args):
        if not args:
            return self._pc
        self._pc = SCREEN.color_to_css(args, 'pencolor')
        self._push({'t': 'r'})

    def fillcolor(self, *args):
        if not args:
            return self._fc
        self._fc = SCREEN.color_to_css(args, 'fillcolor')

    def color(self, *args):
        if not args:
            return (self._pc, self._fc)
        if len(args) == 2:
            self._pc = SCREEN.color_to_css((args[0],), 'color')
            self._fc = SCREEN.color_to_css((args[1],), 'color')
        else:
            self._pc = self._fc = SCREEN.color_to_css(args, 'color')
        self._push({'t': 'r'})

    def begin_fill(self):
        x, y = self._cx()
        self._fill = [[x, y]]

    def end_fill(self):
        if self._fill and len(self._fill) > 2:
            self._push({'t': 'fill', 'pts': self._fill, 'c': self._fc})
        self._fill = None

    def filling(self): return self._fill is not None

    def dot(self, size=None, *color):
        c = SCREEN.color_to_css(color, 'dot') if color else self._pc
        if size is None:
            size = max(self._w + 4, self._w * 2)
        self._push({'t': 'dot', 'r': max(_num(size, 'dot'), 1) / 2, 'c': c})

    def write(self, arg, move=False, align='left', font=None):
        size = 12
        if isinstance(font, (tuple, list)) and len(font) > 1 and isinstance(font[1], (int, float)):
            size = font[1]
        self._push({'t': 'text', 's': str(arg), 'c': self._pc, 'al': align, 'fs': size})

    # вид
    def speed(self, s=None): return 0 if s is None else None
    def shape(self, name=None):
        if name is None:
            return self._shape
        self._shape = str(name)
        self._push({'t': 'r'})
    def shapesize(self, *a, **k): pass
    turtlesize = shapesize
    def hideturtle(self):
        self._vis = False
        self._push({'t': 'r'})
    ht = hideturtle
    def showturtle(self):
        self._vis = True
        self._push({'t': 'r'})
    st = showturtle
    def isvisible(self): return self._vis
    def stamp(self): return 0
    def clear(self): REC.push({'t': 'clear', 'bg': SCREEN._bg, 'keep': 1})
    def reset(self):
        self.__init__()
        REC.push({'t': 'clear', 'bg': SCREEN._bg, 'keep': 1})
    def getscreen(self): return SCREEN
    def onclick(self, *a, **k): pass
    def ondrag(self, *a, **k): pass


SCREEN = _Screen()
_DEFAULT = [None]


def _default():
    if _DEFAULT[0] is None:
        _DEFAULT[0] = Turtle()
    return _DEFAULT[0]


def _make_turtle_module():
    m = types.ModuleType('turtle')
    m.Turtle = Turtle
    m.Pen = Turtle
    m.RawTurtle = Turtle
    m.TurtleGraphicsError = TurtleGraphicsError
    m.Screen = lambda: SCREEN
    m.Terminator = StopProgram
    names = ['forward', 'fd', 'backward', 'back', 'bk', 'left', 'lt', 'right', 'rt', 'goto', 'setpos', 'setposition',
             'setx', 'sety', 'home', 'setheading', 'seth', 'heading', 'position', 'pos', 'xcor', 'ycor', 'distance',
             'towards', 'circle', 'penup', 'pu', 'up', 'pendown', 'pd', 'down', 'isdown', 'pensize', 'width',
             'pencolor', 'fillcolor', 'color', 'begin_fill', 'end_fill', 'filling', 'dot', 'write', 'speed', 'shape',
             'shapesize', 'turtlesize', 'hideturtle', 'ht', 'showturtle', 'st', 'isvisible', 'stamp', 'clear', 'reset',
             'onclick', 'ondrag']
    for n in names:
        def f(*a, _n=n, **k):
            return getattr(_default(), _n)(*a, **k)
        f.__name__ = n
        setattr(m, n, f)
    for n in ['bgcolor', 'colormode', 'setup', 'screensize', 'title', 'tracer', 'update', 'delay', 'listen', 'onkey',
              'onkeypress', 'onscreenclick', 'ontimer', 'mainloop', 'exitonclick', 'bye', 'done', 'window_width',
              'window_height']:
        attr = 'onclick' if n == 'onscreenclick' else n
        setattr(m, n, getattr(SCREEN, attr))
    m.__all__ = [k for k in vars(m) if not k.startswith('_')]
    return m


# ---------------- ColabTurtle (как в Google Colab) ----------------
class _Colab:
    def __init__(self):
        self.inited = False

    def need(self):
        if not self.inited:
            raise TurtleGraphicsError('Сначала вызови initializeTurtle()')

    def init(self, initial_speed=4, initial_window_size=(800, 500)):
        self.inited = True
        self.x, self.y, self.h = 400.0, 250.0, 270.0
        self.pen, self.c, self.w, self.vis = True, 'white', 4.0, True
        self.bg = 'black'
        REC.mode = 'colab'
        REC.push({'t': 'clear', 'bg': 'black', 'x': 400, 'y': 250, 'h': 270, 'vis': True, 'sh': 'turtle', 'pc': 'white'})

    def push(self, op):
        op.update({'x': self.x, 'y': self.y, 'h': self.h % 360, 'vis': self.vis, 'sh': 'turtle', 'pc': self.c})
        REC.push(op)

    def move(self, nx, ny):
        self.need()
        x1, y1 = self.x, self.y
        self.x, self.y = nx, ny
        self.push({'t': 'm', 'x1': x1, 'y1': y1, 'x2': nx, 'y2': ny, 'd': self.pen, 'c': self.c, 'w': self.w})

    def color(self, args, fn):
        if len(args) == 1 and isinstance(args[0], (tuple, list)):
            args = tuple(args[0])
        if len(args) == 1 and isinstance(args[0], str):
            return args[0].replace(' ', '')
        if len(args) == 3:
            v = [_num(a, fn) for a in args]
            if any(a < 0 or a > 255 for a in v):
                raise ValueError('Числа цвета должны быть от 0 до 255')
            return 'rgb(%d,%d,%d)' % tuple(round(a) for a in v)
        raise ValueError(f'{fn}(): непонятный цвет')


COLAB = _Colab()


def _make_colab_module():
    C = COLAB
    m = types.ModuleType('ColabTurtle.Turtle')

    def initializeTurtle(initial_speed=4, initial_window_size=(800, 500)):
        C.init(initial_speed, initial_window_size)

    def forward(d):
        C.need(); d = _num(d, 'forward'); r = math.radians(C.h)
        C.move(C.x + d * math.cos(r), C.y + d * math.sin(r))

    def backward(d): forward(-_num(d, 'backward'))

    def right(a):
        C.need(); C.h = (C.h + _num(a, 'right')) % 360; C.push({'t': 'r'})

    def left(a):
        C.need(); C.h = (C.h - _num(a, 'left')) % 360; C.push({'t': 'r'})

    def goto(x, y=None):
        if y is None:
            x, y = x
        C.move(_num(x, 'goto'), _num(y, 'goto'))

    def setx(x): C.need(); C.move(_num(x, 'setx'), C.y)
    def sety(y): C.need(); C.move(C.x, _num(y, 'sety'))

    def home():
        C.need(); C.move(400.0, 250.0); C.h = 270.0; C.push({'t': 'r'})

    def face(a): C.need(); C.h = _num(a, 'face') % 360; C.push({'t': 'r'})

    def penup(): C.need(); C.pen = False
    def pendown(): C.need(); C.pen = True

    def pencolor(*a):
        C.need()
        if not a:
            return C.c
        C.c = C.color(a, 'pencolor'); C.push({'t': 'r'})

    def bgcolor(*a):
        C.need()
        if not a:
            return C.bg
        C.bg = C.color(a, 'bgcolor'); REC.push({'t': 'bg', 'c': C.bg})

    def width(w): C.need(); C.w = _num(w, 'width')
    def speed(s=None, *a): C.need()
    def hideturtle(): C.need(); C.vis = False; C.push({'t': 'r'})
    def showturtle(): C.need(); C.vis = True; C.push({'t': 'r'})
    def position(): return (round(C.x, 2), round(C.y, 2))
    def getx(): return round(C.x, 2)
    def gety(): return round(C.y, 2)
    def getheading(): return C.h
    def isvisible(): return C.vis
    def isdown(): return C.pen
    def window_width(): return 800
    def window_height(): return 500
    def done(): pass

    for k, v in list(locals().items()):
        if callable(v) and not k.startswith('_') and k != 'C':
            setattr(m, k, v)
    m.color = pencolor
    m.fd, m.bk, m.back, m.rt, m.lt = forward, backward, backward, right, left
    m.pu = m.up = penup
    m.pd = m.down = pendown
    m.setheading = m.seth = face
    m.pos = position
    m.pensize = width
    m.ht, m.st = hideturtle, showturtle
    m.__all__ = [k for k in vars(m) if not k.startswith('_')]
    pkg = types.ModuleType('ColabTurtle')
    pkg.Turtle = m
    pkg.__path__ = []
    return pkg, m


# ---------------- ошибки по-русски ----------------
HINTS = {
    'NameError': 'Имя не найдено: проверь, что переменная или функция объявлена выше и написана без опечаток. Python различает большие и маленькие буквы.',
    'SyntaxError': 'Python не понял запись. Проверь двоеточия, скобки и кавычки.',
    'IndentationError': 'Проблема с отступами. После строки с двоеточием нужен отступ в 4 пробела, а строки одного блока должны начинаться ровно.',
    'TabError': 'Перемешаны пробелы и Tab в отступах. Используй что-то одно.',
    'TypeError': 'Неподходящий тип данных. Например, нельзя сложить строку и число: используй str() или int().',
    'ValueError': 'Неподходящее значение. Например, int("abc") не работает: в строке не число.',
    'IndexError': 'Индекс вышел за пределы. Помни: нумерация начинается с 0, а последний индекс — len(...) - 1.',
    'KeyError': 'Такого ключа нет в словаре. Проверь написание ключа.',
    'ZeroDivisionError': 'Деление на ноль. На 0 делить нельзя.',
    'AttributeError': 'У этого объекта нет такой команды. Проверь написание и большие/маленькие буквы.',
    'EOFError': 'Программа просит ввод (input), а данных не осталось. Впиши значения в поле «Ввод» — каждое с новой строки.',
    'TurtleGraphicsError': 'Ошибка черепашки.',
    'RecursionError': 'Функция бесконечно вызывает сама себя.',
    'ModuleNotFoundError': 'Такой библиотеки здесь нет.',
    'ImportError': 'Не получилось импортировать.',
    'UnboundLocalError': 'Переменную используют в функции раньше, чем ей присвоили значение.',
    'OverflowError': 'Число получилось слишком большим.',
    'TimeoutError': 'Программа работает слишком долго. Проверь, что цикл while когда-нибудь заканчивается.',
}


def _format_error(exc, code):
    name = type(exc).__name__
    line = None
    if isinstance(exc, SyntaxError) and getattr(exc, 'filename', None) == '<код>':
        line = exc.lineno
        msg = exc.msg
    else:
        msg = str(exc)
        for fr in traceback.extract_tb(exc.__traceback__):
            if fr.filename == '<код>':
                line = fr.lineno
    if isinstance(exc, StopProgram):
        name = 'TimeoutError'
    text = ''
    if line:
        lines = code.split('\n')
        if 0 < line <= len(lines):
            text = lines[line - 1].strip()
    return {'type': name, 'line': line, 'msg': msg, 'hint': HINTS.get(name, ''), 'text': text}


# ---------------- запуск ----------------
def run_user(code, stdin_json='[]', mode='run'):
    """mode: run — показать ученику (подсказки input печатаются), check — для проверки (подсказки не печатаются)."""
    global REC, SCREEN, COLAB
    REC = Recorder()
    SCREEN = _Screen()
    COLAB = _Colab()
    _DEFAULT[0] = None
    try:
        stdin = json.loads(stdin_json) if stdin_json else []
    except Exception:
        stdin = []
    stdin = [str(s) for s in stdin]
    buf = io.StringIO()
    used = [0]

    def _input(prompt=''):
        if used[0] >= len(stdin):
            raise EOFError('input(): данные для ввода закончились')
        val = stdin[used[0]]
        used[0] += 1
        if mode == 'run':
            buf.write('\x01' + str(prompt) + '\x02' + val + '\x03\n')
        return val

    class _Out(io.TextIOBase):
        def write(self, s):
            if buf.tell() > MAX_OUT:
                raise StopProgram('Слишком много вывода. Возможно, цикл никогда не заканчивается.')
            buf.write(s)
            return len(s)

        def flush(self):
            pass

    tmod = _make_turtle_module()
    cpkg, cmod = _make_colab_module()
    saved = {k: sys.modules.get(k) for k in ('turtle', 'ColabTurtle', 'ColabTurtle.Turtle')}
    sys.modules['turtle'] = tmod
    sys.modules['ColabTurtle'] = cpkg
    sys.modules['ColabTurtle.Turtle'] = cmod
    old_out, old_err, old_input, old_sleep = sys.stdout, sys.stderr, builtins.input, _time.sleep
    sys.stdout = sys.stderr = _Out()
    builtins.input = _input
    _time.sleep = lambda s=0: None
    error = None
    # строки Colab-«заклинаний» (!pip …) — не Python, пропускаем, сохраняя номера строк
    clean = '\n'.join('' if l.lstrip().startswith(('!', '%')) else l for l in code.replace('\r', '').replace('\t', '    ').split('\n'))
    try:
        compiled = compile(clean, '<код>', 'exec')
        g = {'__name__': '__main__', '__builtins__': builtins}
        exec(compiled, g)
    except SystemExit:
        pass
    except BaseException as e:  # noqa
        error = _format_error(e, clean)
    finally:
        sys.stdout, sys.stderr, builtins.input, _time.sleep = old_out, old_err, old_input, old_sleep
        for k, v in saved.items():
            if v is None:
                sys.modules.pop(k, None)
            else:
                sys.modules[k] = v
    ops = REC.ops
    if error and error['type'] == 'TimeoutError' and len(ops) > 20000:
        ops = ops[-20000:]
    return json.dumps({'out': buf.getvalue(), 'error': error, 'ops': ops, 'mode': REC.mode or 'turtle',
                       'used': used[0], 'given': len(stdin)}, ensure_ascii=False)
