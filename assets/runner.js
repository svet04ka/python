/* Запуск Python-кода учеников. PyRun.run(code, stdinLines, mode) → Promise<{out, error, ops, mode}> */
(function () {
  const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, '');
  const TEST = /[?&]pytest=1/.test(location.search);
  const TIMEOUT = 10000;
  let worker = null, state = 'idle', listeners = [], queue = Promise.resolve(), pending = null, seq = 0;

  function setState(s, msg) { state = s; listeners.forEach(f => { try { f(s, msg); } catch (e) {} }); }
  function boot() {
    if (TEST) { setState('ready'); return; }
    setState('loading');
    try { worker = new Worker(BASE + 'py-worker.js'); }
    catch (e) { setState('error', 'Браузер не разрешил запустить Python. Открой сайт по ссылке https://…, а не как файл.'); return; }
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') setState('ready');
      else if (m.type === 'fail') setState('error', 'Не удалось загрузить Python. Проверь интернет и обнови страницу.');
      else if (m.type === 'result' && pending && pending.id === m.id) { const p = pending; pending = null; clearTimeout(p.timer); p.resolve(parse(m.result)); }
    };
    worker.onerror = () => { if (state === 'loading') setState('error', 'Не удалось загрузить Python. Проверь интернет и обнови страницу.'); };
  }
  function parse(txt) {
    try { const r = JSON.parse(txt); r.ops = r.ops || []; return r; }
    catch (e) { return { out: '', ops: [], error: { type: 'InternalError', msg: 'Не удалось прочитать результат' } }; }
  }
  function runOnce(code, stdin, mode) {
    if (TEST) {
      return fetch('/__py', { method: 'POST', body: JSON.stringify({ code, stdin, mode }) }).then(r => r.text()).then(parse);
    }
    return new Promise((resolve) => {
      if (!worker) boot();
      const id = ++seq;
      const timer = setTimeout(() => {
        // бесконечный цикл: останавливаем поток и запускаем новый
        pending = null;
        try { worker.terminate(); } catch (e) {}
        worker = null;
        resolve({ out: '', ops: [], error: { type: 'TimeoutError', line: null, msg: 'Программа работает дольше 10 секунд, я её остановил.', hint: 'Скорее всего, цикл while никогда не заканчивается: проверь, что переменная в условии меняется.' } });
        boot();
      }, TIMEOUT + (state === 'ready' ? 0 : 60000));
      pending = { id, resolve, timer };
      worker.postMessage({ id, code, stdin, mode });
    });
  }
  window.PyRun = {
    run(code, stdin, mode) { const p = queue.then(() => runOnce(code, stdin || [], mode || 'run')); queue = p.catch(() => {}); return p; },
    onState(f) { listeners.push(f); f(state); },
    get state() { return state; },
    boot() { if (state === 'idle') boot(); },
  };
})();
