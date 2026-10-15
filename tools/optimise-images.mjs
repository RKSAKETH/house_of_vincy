// Usage: node tools/optimise-images.mjs
// Resizes the supplied PNGs (assets/ or assets/originals/) to 900x900 JPG (quality .85, centre-cropped to square)
// with clean names, and moves the originals into assets/originals/. Already-processed files are left alone.
import { chromium } from 'playwright';
import fs from 'fs';

const MAP = {
  'Gold Charm Necklace on Satin.png': 'collection-necklaces.jpg',
  'Luksuriöses Goldarmband im Schmuckkästchen.png': 'collection-bracelets.jpg',
  'Sculpted Gold Open Cuff Ring.png': 'collection-rings.jpg',
  'Sculptural Gold Petal Earrings.png': 'collection-statement-collection.jpg',
  'Pavé Gold Huggie Earrings on Silk.png': 'collection-earrings.jpg',
  'Multicoloured Gemstone Bracelet on Satin.png': 'product-01-multicolour-stone-bracelet.jpg',
  'Elegant Gold Pendant on Velvet Bust.png': 'product-02-gold-pendant-necklace.jpg',
  'Sapphire and Diamond Bracelet on Satin.png': 'product-03-blue-stone-bracelet.jpg',
  'Rose Gold Marquise Tennis Bracelet.png': 'product-04-rose-gold-marquise-bracelet.jpg',
  'Golden Leaf Cuff on Satin Dish.png': 'product-05-golden-leaf-cuff.jpg',
  'Rainbow Gemstone Bracelet on Ivory Satin.png': 'product-06-rainbow-stone-bracelet.jpg',
  'Gold Evil Eye Charm Bracelet on Ceramic Dish.png': 'product-07-evil-eye-charm-bracelet.jpg',
  'Emerald Leaf Marquise Bracelet on Satin.png': 'product-08-green-stone-leaf-bracelet.jpg',
};
fs.mkdirSync('assets/originals', { recursive: true });
const b = await chromium.launch();
const p = await b.newPage();
for (const [src, out] of Object.entries(MAP)) {
  if (fs.existsSync(`assets/${out}`)) { console.log('skip (exists)', out); continue; }
  const from = fs.existsSync(`assets/${src}`) ? `assets/${src}` : `assets/originals/${src}`;
  if (!fs.existsSync(from)) { console.log('missing', src); continue; }
  const b64 = await p.evaluate(async d => {
    const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = d; });
    const s = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - s) / 2, sy = (img.naturalHeight - s) / 2;
    const c = document.createElement('canvas'); c.width = c.height = 900;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, sx, sy, s, s, 0, 0, 900, 900);
    return c.toDataURL('image/jpeg', 0.85).split(',')[1];
  }, 'data:image/png;base64,' + fs.readFileSync(from).toString('base64'));
  fs.writeFileSync(`assets/${out}`, Buffer.from(b64, 'base64'));
  if (from === `assets/${src}`) fs.renameSync(from, `assets/originals/${src}`);
  console.log(out, Math.round(fs.statSync(`assets/${out}`).size / 1024) + ' KB');
}
await b.close();
