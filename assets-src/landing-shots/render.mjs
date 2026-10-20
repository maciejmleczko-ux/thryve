// node render.mjs OUT pl|en  -> landing/img[/en]/r-split-l|r, r-caro-0..5  (needs :8094 serving OUT/landing)
import { writeFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process'; import { chrome } from './cdp.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const [OUT, LANG] = process.argv.slice(2); const sub = LANG === 'pl' ? '' : 'en/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const jobs = [['split-l','scr-logset','rx=0.08&ry=0.45&rz=-0.05'],['split-r','scr-gym-finish','rx=0.08&ry=-0.45&rz=0.05'],
  ['caro-0','scr-dashboard','rx=0.03&ry=-0.14'],['caro-1','scr-gym','rx=0.03&ry=-0.14'],['caro-2','scr-logset','rx=0.03&ry=-0.14'],
  ['caro-3','scr-gym-finish','rx=0.03&ry=-0.14'],['caro-4','scr-history','rx=0.03&ry=-0.14'],['caro-5','scr-stats','rx=0.03&ry=-0.14'],
  ['ai','scr-ai','rx=0.1&ry=-0.3&rz=0.02&rim=%23b69cff'],['ai-blur','scr-ai-blur','rx=0.1&ry=-0.3&rz=0.02&rim=%23b69cff']];
const c = await chrome(OUT, 9348, { gl: true });
await c.send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1500, deviceScaleFactor: 1, mobile: false });
await c.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
for(const [name, scr, rot] of jobs){
  await c.send('Page.navigate', { url: `http://localhost:8094/render.html?img=${sub}${scr}.webp&${rot}&t=${Date.now()}` });
  for(let i = 0; i < 100; i++){ if(await c.ev('document.title') === 'ready') break; await c.sleep(400); } await c.sleep(300);
  const r = await c.send('Page.captureScreenshot', { format: 'png' });
  const png = `${OUT}/render-${LANG}-${name}.png`; writeFileSync(png, Buffer.from(r.result.data, 'base64'));
  execFileSync('python3', ['-c', `from PIL import Image
im=Image.open('${png}').convert('RGBA'); b=im.getbbox()
im.crop((max(0,b[0]-12),max(0,b[1]-12),min(im.width,b[2]+12),min(im.height,b[3]+12))).save('${ROOT}/landing/img/${sub}r-${name}.webp',quality=82,method=6)`]);
  console.log(LANG, name);
}
c.close(); process.exit(0);
