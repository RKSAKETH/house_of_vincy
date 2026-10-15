// Usage: node tools/optimise-banners.mjs <src.png> <out.jpg> [quality]
// Converts a banner PNG to JPG at its native size (no cropping), moves the original to assets/originals/.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const [src, out, q = '0.88'] = process.argv.slice(2);
fs.mkdirSync('assets/originals', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage();
const res = await p.evaluate(async ([d, q]) => {
  const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = d; });
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  return { w: c.width, h: c.height, data: c.toDataURL('image/jpeg', +q).split(',')[1] };
}, ['data:image/png;base64,' + fs.readFileSync(src).toString('base64'), q]);
fs.writeFileSync(out, Buffer.from(res.data, 'base64'));
fs.renameSync(src, path.join('assets/originals', path.basename(src)));
console.log(out, res.w + 'x' + res.h, Math.round(fs.statSync(out).size / 1024) + ' KB');
await b.close();
