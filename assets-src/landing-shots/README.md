# Landing screenshots + phone renders (mekkio.app)

Real app screens for the landing, rendered onto the Blender iPhone model (`landing/3d/iphone.glb`).
Work files go to `$OUT` (default: a temp dir), results go straight into `landing/img/`.

```
OUT=/tmp/mekkio-shots
python3 assets-src/landing-shots/build.py $OUT          # seeded copy of the current app + landing copy
(cd $OUT/app && python3 -m http.server 8093) &           # app with demo data
(cd $OUT/landing && python3 -m http.server 8094) &       # landing copy (+ render.html)
node assets-src/landing-shots/appshot.mjs $OUT pl dashboard gym logset finish history stats
node assets-src/landing-shots/appshot.mjs $OUT en dashboard gym logset finish history stats
python3 assets-src/landing-shots/pad.py $OUT pl          # -> landing/img/scr-*.webp
python3 assets-src/landing-shots/pad.py $OUT en          # -> landing/img/en/scr-*.webp
node assets-src/landing-shots/render.mjs $OUT pl         # -> landing/img/r-split-*, r-caro-*
node assets-src/landing-shots/render.mjs $OUT en         # -> landing/img/en/...
node assets-src/landing-shots/poster.mjs $OUT /          # hero orbit poster -> landing/img/r-orbit.webp
node assets-src/landing-shots/poster.mjs $OUT /en/       # -> landing/img/en/r-orbit.webp
```

- Demo data = the seed from `EXPORT FIGMA/01-dashboard.html` (plan, 5 weeks of workouts, weight log).
- `?s=` screens: dashboard, gym, logset (set logging), finish (Gratulacje), history, stats. `?lang=pl|en`.
- The "create an account" nudge is suppressed; name is Kasia (pl) / Kate (en).
- Textures: 393×778 pt at 2× padded to 786×1704 (status bar on top, 10 pt sheet margin for logset).
