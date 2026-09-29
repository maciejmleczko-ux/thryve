# Recolour the pre-baked base colour to Black Titanium: light (desert) areas -> graphite, dark parts untouched.
import numpy as np
from PIL import Image, ImageChops
import os
Image.MAX_IMAGE_PIXELS = None
D = os.path.dirname(os.path.abspath(__file__)) + '/'
T = D + '../textures/iphone-16-pro-001-'
S = 2048
col = Image.open(T + 'col-metalness-8k.png').convert('RGB').resize((S, S), Image.LANCZOS)
ao = Image.open(T + 'ao-metalness-8k.png').convert('RGB').resize((S, S), Image.LANCZOS)
base = np.asarray(ImageChops.multiply(col, ao)).astype(np.float32) / 255
lum = base @ np.array([.2126, .7152, .0722], dtype=np.float32)
graphite = np.array([.235, .235, .245], dtype=np.float32)           # Black Titanium base (linear-ish sRGB)
target = graphite[None, None, :] * (lum[..., None] / max(lum.mean(), 1e-3)) ** .35 * .9
mask = np.clip((lum - .22) / .12, 0, 1)[..., None]                 # blend in above ~0.22 luminance
out = base * (1 - mask) + np.clip(target, 0, 1) * mask
Image.fromarray((out * 255).astype(np.uint8)).save(D + 'basecolor.png')
print('basecolor written', out.shape)
