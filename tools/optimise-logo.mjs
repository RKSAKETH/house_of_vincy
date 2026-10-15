// Usage: node tools/optimise-logo.mjs "<logo.png>"
// Crops the white padding around the logo, writes assets/logo.png (400px high, white made transparent) and a square favicon
// (assets/favicon.png, 64x64) from the emblem above the wordmark, and moves the original to assets/originals/.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const src = process.argv[2];
if (!src) { console.error('usage: node tools/optimise-logo.mjs "<logo.png>"'); process.exit(1); }
fs.mkdirSync('assets/originals', { recursive: true });

const b = await chromium.launch();
const p = await b.newPage();
const out = await p.evaluate(async d => {
  const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = d; });
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const px = x.getImageData(0, 0, W, H).data;
  // bounds of everything that is not (near) white
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const i = (y * W + xx) * 4;
    if (px[i] < 235 || px[i + 1] < 235 || px[i + 2] < 235) { if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const m = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
  const sx = Math.max(0, minX - m), sy = Math.max(0, minY - m);
  const sw = Math.min(W, maxX + m) - sx, sh = Math.min(H, maxY + m) - sy;
  const outH = 400, outW = Math.round(sw * outH / sh);
  const o = document.createElement('canvas'); o.width = outW; o.height = outH;
  const ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high';   ox.drawImage(c, sx, sy, sw, sh, 0, 0, outW, outH);
  // make the white background transparent (alpha from how far each pixel is from white)
  const id = ox.getImageData(0, 0, outW, outH), dd = id.data;
  for (let i = 0; i < dd.length; i += 4) {
    const mn = Math.min(dd[i], dd[i + 1], dd[i + 2]);
    const a = Math.max(0, Math.min(255, Math.round((246 - mn) / 246 * 255 * 1.08)));
    dd[i + 3] = a;
  }
  ox.putImageData(id, 0, 0);
  // favicon: the round emblem is the top part of the mark, a square the width of the content
  const side = sw; // square covering the emblem (circle is as wide as the content block's emblem part)
  const emblemSide = Math.round(sw * 0.72);
  const ex = sx + Math.round((sw - emblemSide) / 2), ey = sy;
  const f = document.createElement('canvas'); f.width = f.height = 64;
  const fx = f.getContext('2d'); fx.imageSmoothingQuality = 'high'; fx.fillStyle = '#fff'; fx.fillRect(0, 0, 64, 64);
  fx.drawImage(c, ex, ey, emblemSide, emblemSide, 0, 0, 64, 64);
  return { bounds: [minX, minY, maxX, maxY], outW, outH, logo: o.toDataURL('image/png').split(',')[1], fav: f.toDataURL('image/png').split(',')[1] };
}, 'data:image/png;base64,' + fs.readFileSync(src).toString('base64'));
fs.writeFileSync('assets/logo.png', Buffer.from(out.logo, 'base64'));
fs.writeFileSync('assets/favicon.png', Buffer.from(out.fav, 'base64'));
fs.renameSync(src, path.join('assets/originals', path.basename(src)));
console.log('content bounds', out.bounds.join(','), '-> logo.png', `${out.outW}x${out.outH}`, Math.round(fs.statSync('assets/logo.png').size / 1024) + ' KB', '| favicon.png', Math.round(fs.statSync('assets/favicon.png').size / 1024) + ' KB');
await b.close();
