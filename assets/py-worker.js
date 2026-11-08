// Фоновый поток: настоящий Python (Pyodide) для кода учеников.
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
let py = null, runUser = null;
const ready = (async () => {
  py = await loadPyodide();
  const src = await (await fetch('harness.py')).text();
  py.runPython(src);
  runUser = py.globals.get('run_user');
  postMessage({ type: 'ready' });
})().catch(err => { postMessage({ type: 'fail', msg: String(err && err.message || err) }); throw err; });

onmessage = async (e) => {
  const { id, code, stdin, mode } = e.data;
  try {
    await ready;
    const res = runUser(code, JSON.stringify(stdin || []), mode || 'run');
    postMessage({ type: 'result', id, result: res });
  } catch (err) {
    postMessage({ type: 'result', id, result: JSON.stringify({ out: '', ops: [], error: { type: 'InternalError', line: null, msg: String(err && err.message || err), hint: 'Попробуй обновить страницу.' } }) });
  }
};
