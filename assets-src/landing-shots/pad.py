# python3 pad.py OUT pl|en  -> landing/img[/en]/scr-*.webp  (786×1704: status bar on top; logset keeps a 10 pt sheet margin)
import os, sys
from PIL import Image, ImageDraw
OUT, LANG = sys.argv[1], sys.argv[2]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
dst = os.path.join(ROOT, 'landing', 'img', '' if LANG == 'pl' else 'en'); os.makedirs(dst, exist_ok=True)
NAMES = {'ai':'scr-ai','dashboard':'scr-dashboard','gym':'scr-gym','logset':'scr-logset','finish':'scr-gym-finish','history':'scr-history','stats':'scr-stats'}
for s, name in NAMES.items():
    p = f'{OUT}/shots-{LANG}/{s}.png'
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB'); w, h = im.size
    if s == 'logset':          # bottom sheet: cut the clipped last button, end the sheet 10 pt above the bottom
        bg = im.getpixel((10, h // 2)); cut = h - 72
        out = Image.new('RGB', (786, 1704), bg)
        ImageDraw.Draw(out).rounded_rectangle((20, 118 + cut - 300, 765, 1704 - 20), radius=64, fill=(255, 255, 255))
        out.paste(im.crop((0, 0, w, 1)).resize((w, 118)), (0, 0)); out.paste(im.crop((0, 0, w, cut)), (0, 118))
    else:
        out = Image.new('RGB', (786, 1704), im.getpixel((3, h - 1)))
        out.paste(im.crop((0, 0, w, 1)).resize((w, 118)), (0, 0)); out.paste(im, (0, 118))
    out.save(os.path.join(dst, name + '.webp'), 'WEBP', quality=86, method=6); print(LANG, name)
    if s == 'ai':              # the AI section blurs the screen behind its HTML popup
        from PIL import ImageFilter
        out.filter(ImageFilter.GaussianBlur(14)).save(os.path.join(dst, 'scr-ai-blur.webp'), 'WEBP', quality=80, method=6)
