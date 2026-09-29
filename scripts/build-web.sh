#!/bin/sh
# Build for Cloudflare Workers static assets (app.mekkio.app): copies only the files the app
# serves into dist/, so supabase/, docs/, SQL and prototypes stay unpublished.
# Cloudflare build command: `sh scripts/build-web.sh`; wrangler.jsonc serves dist/.
# GitHub Pages (github.io/thryve mirror) still serves the repo root as before.
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cp index.html manifest.json sw.js lottie.min.js success.json \
   polityka-prywatnosci.html favicon.png apple-touch-icon.png \
   icon-192.png icon-512.png version.json dist/
cp -R icons dist/icons
cp -R email dist/email   # logo do maili z Supabase: https://app.mekkio.app/email/mekkio-email-logo.png
cp -R vendor dist/vendor
find dist -name .DS_Store -delete
echo "dist/ ready: $(find dist -type f | wc -l | tr -d ' ') files"
