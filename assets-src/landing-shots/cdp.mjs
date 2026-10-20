// tiny headless-Chrome helper over CDP
import { spawn } from 'node:child_process'; import { setTimeout as sleep } from 'node:timers/promises';
export async function chrome(OUT, port, { gl = false } = {}){
  const args = ['--headless=new','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${OUT}/prof-${port}`,'about:blank'];
  if(gl) args.splice(2, 0, '--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args, { stdio: 'ignore' });
  let ws; for(let i = 0; i < 60; i++){ try{ const j = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = j.find(t => t.type === 'page'); if(p){ ws = new WebSocket(p.webSocketDebuggerUrl); break; } }catch{} await sleep(250); }
  await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if(m.id && pend.has(m.id)){ pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result.value;
  const close = () => { ws.close(); proc.kill(); };
  return { send, ev, close, sleep };
}
