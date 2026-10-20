// node crops.mjs OUT pl|en -> landing/img[/en]/crop-ytd|ring|cal.webp (same pixel size as the originals, so the
// landing's draw-in overlays, positioned in % of the image, stay aligned)
import { writeFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process'; import { chrome } from './cdp.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const [OUT, LANG] = process.argv.slice(2); const sub = LANG === 'pl' ? '' : 'en/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const jobs = [['stats','.statsv2-ytd-card','crop-ytd',741,544],['stats','.statsv2-ring-card','crop-ring',741,402],['history','.histv2-cal-card','crop-cal',741,757]];
const c = await chrome(OUT, 9349);
await c.send('Emulation.setDeviceMetricsOverride', { width: 393, height: 1400, deviceScaleFactor: 2, mobile: true });
for(const [s, sel, name, W, H] of jobs){
  await c.send('Page.navigate', { url: `http://localhost:8093/shot.html?s=${s}&lang=${LANG}&today=1&t=${Date.now()}` });
  for(let i = 0; i < 50; i++){ if(await c.ev('document.title') === 'ready') break; await c.sleep(400); }
  await c.sleep(3500);
  const b = await c.ev(`(()=>{const r=document.querySelector('${sel}').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);
  const r = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
  const png = `${OUT}/${LANG}-${name}.png`; writeFileSync(png, Buffer.from(r.result.data, 'base64'));
  execFileSync('python3', ['-c', `from PIL import Image; Image.open('${png}').convert('RGB').resize((${W},${H}), Image.LANCZOS).save('${ROOT}/landing/img/${sub}${name}.webp','WEBP',quality=86,method=6)`]);
  console.log(LANG, name, b);
}
c.close(); process.exit(0);
