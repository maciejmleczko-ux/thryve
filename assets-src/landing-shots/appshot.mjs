// node appshot.mjs OUT pl|en screen...   -> OUT/shots-<lang>/<screen>.png (393×778 @2x)
import { writeFileSync, mkdirSync } from 'node:fs'; import { chrome } from './cdp.mjs';
const [OUT, LANG, ...screens] = process.argv.slice(2); mkdirSync(`${OUT}/shots-${LANG}`, { recursive: true });
const c = await chrome(OUT, 9346);
await c.send('Emulation.setDeviceMetricsOverride', { width: 393, height: 778, deviceScaleFactor: 2, mobile: true });
await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
for(const s of screens){
  await c.send('Page.navigate', { url: `http://localhost:8093/shot.html?s=${s}&lang=${LANG}${['stats','history'].includes(s)?'&today=1':''}&t=${Date.now()}` });
  let t = ''; for(let i = 0; i < 50; i++){ t = await c.ev('document.title'); if(t === 'ready' || t.startsWith('ERR')) break; await c.sleep(400); }
  await c.sleep(3000);
  const r = await c.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/shots-${LANG}/${s}.png`, Buffer.from(r.result.data, 'base64')); console.log(LANG, s, t);
}
c.close(); process.exit(0);
