#!/usr/bin/env node
// Checks the exercise icon sets against the slug lists in index.html. Run from the repo root:  node scripts/check-icon-sets.js
//  - every slug in EXERCISE_ICON_PNG_SLUGS has a file in icons/exercises/ (male set)
//  - every slug in EXERCISE_ICON_PNG_SLUGS_F has a file in icons/exercises/female/ and is also in the male list
//  - every file in icons/exercises/female/ is on the female list (and the other way round)
//  - lists exercises (slugs used by a library entry) that have a male icon but no female one (they fall back to the male icon)
// Exit code 1 if anything that must hold doesn't.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const list = name => {
  const m = html.match(new RegExp('const ' + name + ' = new Set\\(\\[(.*?)\\]\\);', 's'));
  if(!m) throw new Error(name + ' not found in index.html');
  return [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]);
};
const male = list('EXERCISE_ICON_PNG_SLUGS'), female = list('EXERCISE_ICON_PNG_SLUGS_F');
const dirOf = d => fs.readdirSync(path.join(root, 'icons/exercises', d)).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4));
const maleFiles = new Set(fs.readdirSync(path.join(root, 'icons/exercises')).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)));
const femaleFiles = new Set(dirOf('female'));
const problems = [];
male.forEach(s => { if(!maleFiles.has(s)) problems.push('male list slug without file: ' + s); });
female.forEach(s => {
  if(!femaleFiles.has(s)) problems.push('female list slug without file: ' + s);
  if(!male.includes(s)) problems.push('female slug not on the male list: ' + s);
});
femaleFiles.forEach(s => { if(!female.includes(s)) problems.push('female file not on the female list: ' + s); });
// slugs actually used by library entries
const used = new Set([...html.matchAll(/icon:"([a-z0-9_]+)"/g)].map(m => m[1]));
const mapBlock = html.match(/const EXERCISE_ICON_MAP = \{(.*?)\n\};/s);
if(mapBlock) [...mapBlock[1].matchAll(/:\s*"([a-z0-9_]+)"/g)].forEach(m => used.add(m[1]));
const noFemale = [...used].filter(s => male.includes(s) && !female.includes(s));
console.log(`male slugs: ${male.length}, female slugs: ${female.length}, female files: ${femaleFiles.size}`);
console.log('library icons without a female version (male icon is shown): ' + (noFemale.join(', ') || 'none'));
if(problems.length){ console.error('PROBLEMS:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('OK');
