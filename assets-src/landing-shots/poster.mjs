// node poster.mjs OUT /|/en/  -> landing/img[/en]/r-orbit.webp: transparent capture of the live hero orbit at rest
import { writeFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process'; import { chrome } from './cdp.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const [OUT, PAGE] = process.argv.slice(2); const sub = PAGE === '/' ? '' : 'en/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const c = await chrome(OUT, 9347, { gl: true });
await c.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1300, deviceScaleFactor: 1, mobile: false });
await c.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
await c.send('Page.navigate', { url: `http://localhost:8094${PAGE}?t=${Date.now()}` });
for(let i = 0; i < 120; i++){ if(await c.ev('!!document.querySelector("#heroOrbit.gl-on")')) break; await c.sleep(500); }
await c.sleep(4000);
const b = await c.ev(`(()=>{const st=document.createElement('style'); st.textContent='html,body,.hero,.hero-panel{background:transparent!important} .hero-panel::before,.hero-panel::after,.hero-giant,.hero-copy,.nav,.orbit-nav,section:not(.hero),footer{display:none!important;visibility:hidden!important}'; document.head.appendChild(st); const r=document.getElementById('heroOrbit').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}})()`);
await c.sleep(1500);
const r = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
const png = `${OUT}/orbit-${sub ? 'en' : 'pl'}.png`; writeFileSync(png, Buffer.from(r.result.data, 'base64'));
execFileSync('python3', ['-c', `from PIL import Image; Image.open('${png}').save('${ROOT}/landing/img/${sub}r-orbit.webp','WEBP',quality=82,method=6)`]);
console.log('poster', PAGE, b); c.close(); process.exit(0);
