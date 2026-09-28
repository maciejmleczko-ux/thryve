#!/bin/sh
# Build for Cloudflare Pages (app.mekkio.app): copies only the files the app
# serves into dist/, so supabase/, docs/, SQL and prototypes stay unpublished.
# Cloudflare Pages settings: build command `sh scripts/build-web.sh`, output `dist`.
# GitHub Pages (github.io/thryve mirror) still serves the repo root as before.
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cp index.html manifest.json sw.js lottie.min.js success.json \
   polityka-prywatnosci.html favicon.png apple-touch-icon.png \
   icon-192.png icon-512.png dist/
cp -R icons dist/icons
find dist -name .DS_Store -delete
echo "dist/ ready: $(find dist -type f | wc -l | tr -d ' ') files"
