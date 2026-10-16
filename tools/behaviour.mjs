// Behavioural smoke test for the shell (run with the dev server up). Prints PASS/FAIL per check.
import { chromium } from 'playwright';
import fs from 'fs';
const URL_ = process.env.URL || 'http://localhost:4173/';
const OUT = 'test-output/';
const results = [];
const check = (name, ok, extra = '') => results.push({ check: name, result: ok ? 'PASS' : 'FAIL', extra });
fs.mkdirSync(OUT, { recursive: true });
const browser = await browser0();
async function browser0() { return chromium.launch(); }

// ---- desktop
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(URL_, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);

// announcement
const msg = () => p.evaluate(() => { const t = document.querySelector('.announce-track'); return t.style.transform || 'translateX(0%)'; });
await p.click('[data-announce=next]'); await p.waitForTimeout(100);
check('announcement next moves track', (await msg()).includes('-100'), await msg());
await p.click('[data-announce=prev]');
check('announcement prev returns', (await msg()).includes('0%') || (await msg()).includes('-0'), await msg());

// sticky
await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(300);
const top = await p.evaluate(() => document.querySelector('#site-header').getBoundingClientRect().top);
check('header sticky at scrollY 1500 (top = 0)', Math.abs(top) < 0.5, `top=${top}`);
await p.screenshot({ path: OUT + 'behaviour-sticky-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 260 } });
await p.evaluate(() => scrollTo(0, 0));


// navbar: single-page anchors, Privacy Policy is the only page
const navLinks = await p.$$eval('.nav-list a', n => n.map(a => [a.textContent.trim(), a.getAttribute('href')]));
check('navbar: Home, Collections, Trending Jewellery, Customer Reviews, Why Trust, Contact Us, Privacy Policy', navLinks.map(x => x[0]).join('|') === 'Home|Collections|Trending Jewellery|Customer Reviews|Why Trust House of Vincy|Contact Us|Privacy Policy', navLinks.map(x => x[0]).join('|'));
check('every nav link is an anchor except Why Trust and Privacy Policy (the only pages)', navLinks.every(([l, h]) => (l === 'Privacy Policy' ? h === 'privacy-policy.html' : l === 'Why Trust House of Vincy' ? h === 'why-trust.html' : h.startsWith('#'))), JSON.stringify(navLinks));
check('nav fits on one row at 1440', await p.$eval('.nav-list', n => n.scrollWidth <= n.parentElement.clientWidth && n.getBoundingClientRect().height < 80));
await p.screenshot({ path: OUT + 'behaviour-nav-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 260 } });
for (const [label, id] of [['Collections', 'collections'], ['Trending Jewellery', 'featured'], ['Customer Reviews', 'reviews'], ['Contact Us', 'contact']]) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1200);
  await p.click(`.nav-list >> text="${label}"`); await p.waitForTimeout(1800);
  const r = await p.evaluate(id => ({ top: document.getElementById(id).getBoundingClientRect().top, hdr: document.querySelector('#site-header').getBoundingClientRect().bottom, y: scrollY, max: document.documentElement.scrollHeight - innerHeight }), id);
  check(`nav "${label}" smooth-scrolls to #${id} just below the sticky header`, r.y > 0 && (Math.abs(r.top - r.hdr) <= 2 || r.y >= r.max - 2), JSON.stringify(r));
}
await p.click('.nav-list >> text="Home"'); await p.waitForTimeout(3000);
check('nav "Home" scrolls back to the top', (await p.evaluate(() => scrollY)) < 2);
check('URL stays on the homepage after anchor navigation', new URL(p.url()).pathname === '/');

// search
await p.click('#search-toggle'); await p.waitForTimeout(200);
check('search opens', await p.isVisible('#search-modal'));
await p.keyboard.type('kada', { delay: 30 });
await p.waitForTimeout(200);
const sugg = await p.$$eval('.predictive li', n => n.length);
check('search shows local suggestions for "kada"', sugg > 0, `${sugg} items`);
await p.screenshot({ path: OUT + 'behaviour-search-desktop.png' });
await p.fill('#search-input', 'zzzz'); await p.waitForTimeout(100);
check('search shows empty state', (await p.textContent('.predictive__empty')).includes('No results'));
await p.fill('#search-input', 'bracelet'); await p.waitForTimeout(100);
check('search shows product results', (await p.$$eval('.predictive__product', n => n.length)) > 0);
await p.click('#search-close');
check('search closes', !(await p.isVisible('#search-modal')));
check('overlay hidden after search closes', !(await p.isVisible('#page-overlay')));

// cart
check('cart badge hidden when empty', !(await p.isVisible('#cart-count')));
await p.click('#cart-toggle'); await p.waitForTimeout(400);
check('cart drawer opens (empty state)', (await p.textContent('#cart-body')).includes('empty'));
await p.screenshot({ path: OUT + 'behaviour-cart-empty-desktop.png' });
await p.click('#cart-close'); await p.waitForTimeout(400);
await p.evaluate(() => { window.VincyCart.add('p1', 2); window.VincyCart.add('p2', 1, false); });
await p.waitForTimeout(500);
check('cart badge shows total count 3', (await p.textContent('#cart-count')) === '3');
check('cart subtotal says Price on request while prices are unset', (await p.textContent('#cart-subtotal')) === 'Price on request', await p.textContent('#cart-subtotal'));
await p.screenshot({ path: OUT + 'behaviour-cart-filled-desktop.png' });
await p.click('.cart-line[data-id=p1] [data-qty="1"]');
check('cart + increases to 4', (await p.textContent('#cart-count')) === '4');
await p.click('.cart-line[data-id=p1] [data-remove]');
check('cart remove works (count 1)', (await p.textContent('#cart-count')) === '1');
await p.click('#cart-checkout');
check('checkout shows demo note', await p.isVisible('#cart-note'));
await p.reload({ waitUntil: 'networkidle' });
check('cart persists across reload (localStorage)', (await p.textContent('#cart-count')) === '1');
await p.evaluate(() => localStorage.removeItem('vincy-cart'));
await ctx.close();


// ---- sections + interactions (desktop)
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
p = await ctx.newPage();
const errs4 = [];
p.on('pageerror', e => errs4.push(e.message));
await p.goto(URL_, { waitUntil: 'networkidle' });
await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
const order = await p.$$eval('main > section', n => n.map(s => s.id));
check('sections in page order', order.join(',') === 'hero-1,trust,reviews,collections,rich-text,marquee,featured,newsletter', order.join(','));
check('footer shows client phone + address', (await p.textContent('#site-footer')).includes('6385202221') && (await p.textContent('#site-footer')).includes('251 Velachery Main Road'));
check('footer phone is a tel: link', (await p.getAttribute('.footer-contact', 'href')) === 'tel:+916385202221');
check('no PLACEHOLDER text left in copy/footer/products', !(await p.textContent('#rich-text')).includes('PLACEHOLDER') && !(await p.textContent('#site-footer')).includes('PLACEHOLDER') && !(await p.textContent('.announce-track')).includes('PLACEHOLDER') && !(await p.textContent('#featured')).includes('PLACEHOLDER'));
const badLinks = await p.$$eval('a[href]', n => n.map(a => a.getAttribute('href')).filter(h => !(h.startsWith('#') || h.startsWith('tel:') || h === 'privacy-policy.html' || h === 'why-trust.html' || h === 'index.html')));
check('no link on the homepage points at a placeholder or unknown page', badLinks.length === 0, badLinks.join(', '));
const missing = await p.$$eval('a[href^="#"]', n => n.map(a => a.getAttribute('href').slice(1)).filter(id => id && !document.getElementById(id)));
check('every in-page anchor has a matching element', missing.length === 0, missing.join(', '));
check('homepage welcome copy is the supplied text (₹3,000 minimum order)', (await p.textContent('#rich-text')).includes('minimum order value of ₹3,000'));
check('logo image shows in header and is loaded', (await p.$eval('.header__logo-img', n => n.complete && n.naturalWidth > 0 && n.getBoundingClientRect().height > 100)));
check('header is still 154px tall with the logo', Math.round(await p.$eval('#site-header', n => n.getBoundingClientRect().height)) === 154);
check('hero banner (desktop): image visible, call hotspot is tel:, shop hotspot present', (await p.isVisible('#hero-1 .slide-art--desktop .slide-img')) && (await p.getAttribute('#hero-1 .slide-art--desktop .hotspot >> nth=0', 'href')) === 'tel:+916385202221' && (await p.isVisible('#hero-1 .slide-art--desktop .hotspot >> nth=1')));
check('hero banner (desktop): mobile variant hidden', !(await p.isVisible('#hero-1 .slide-art--mobile')));
check('reviews banner (desktop): image visible, mobile variant hidden', (await p.isVisible('#reviews .slide-art--desktop .slide-img')) && !(await p.isVisible('#reviews .slide-art--mobile')));
for (let y = 0; y < 8000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120); }
await p.waitForTimeout(600); await p.evaluate(() => scrollTo(0, 0));
check('all banner images loaded (no broken images)', (await p.$$eval('img', n => n.filter(i => i.offsetParent !== null && (!i.complete || i.naturalWidth === 0)).length)) === 0);
check('trust banner (desktop): image visible, call hotspot is a tel: link, shop hotspot is a link', (await p.isVisible('.slide-art--desktop .slide-img')) && (await p.getAttribute('.slide-art--desktop .hotspot >> nth=0', 'href')) === 'tel:+916385202221' && (await p.isVisible('.slide-art--desktop .hotspot >> nth=1')));
check('trust banner (desktop): mobile variant hidden', !(await p.isVisible('.slide-art--mobile')));
const hs = await p.$eval('#trust .slide-art--desktop .slide-img', n => { const r = n.getBoundingClientRect(); return [r.width, r.height]; });
check('trust banner desktop shows at 3:2 (1440 x 960)', Math.round(hs[0]) === 1440 && Math.round(hs[1]) === 960, hs.map(Math.round).join('x'));
check('3 collection cards per row on desktop', (await p.$$eval('.coll__item', n => new Set(n.map(x => Math.round(x.getBoundingClientRect().top))).size)) === 2);
check('collection slider buttons hidden on desktop', !(await p.isVisible('#collections .slider-buttons')));
check('4 product cards in first row on desktop', (await p.$$eval('.feat__item', n => n.filter(x => Math.round(x.getBoundingClientRect().top) === Math.round(n[0].getBoundingClientRect().top)).length)) === 4);
check('no Sold out badge (client has not marked any item sold out)', (await p.$$eval('.badge', n => n.length)) === 0);
// marquee animates
const m1 = await p.$eval('.marquee-content', n => new DOMMatrix(getComputedStyle(n).transform).m41);
await p.waitForTimeout(700);
const m2 = await p.$eval('.marquee-content', n => new DOMMatrix(getComputedStyle(n).transform).m41);
check('marquee is scrolling', m1 !== m2, `${m1.toFixed(1)} -> ${m2.toFixed(1)}`);
// product hover scales image + shows actions
await p.evaluate(() => document.querySelector('#featured').scrollIntoView());
const card = (await p.$$('.pcard'))[0];
await card.hover(); await p.waitForTimeout(700);
const sc = await card.$eval('.pcard__media img', n => getComputedStyle(n).transform);
check('product image scales 1.03 on hover', sc.startsWith('matrix(1.03'), sc);
check('add-to-cart + wishlist visible on hover', (await card.$eval('.pcard__btn--add', n => getComputedStyle(n).opacity)) === '1');
// wishlist toggle persists
await card.$eval('.wish', n => n.click());
check('wishlist toggles on (aria-pressed)', (await card.$eval('.wish', n => n.getAttribute('aria-pressed'))) === 'true');
check('wishlist toast shown', await p.isVisible('#toast'));
await p.reload({ waitUntil: 'networkidle' });
check('wishlist persists after reload', (await p.$eval('.wish', n => n.getAttribute('aria-pressed'))) === 'true');
await p.$eval('.wish', n => n.click());
check('wishlist toggles off', (await p.$eval('.wish', n => n.getAttribute('aria-pressed'))) === 'false');
// add to cart from card
await p.evaluate(() => document.querySelector('#featured').scrollIntoView());
const c0 = (await (await p.$('#cart-count')).isVisible()) ? await p.textContent('#cart-count') : '0';
await p.hover('.pcard >> nth=1');
await p.$eval('.pcard >> nth=1', n => n.querySelector('[data-add]').click());
await p.waitForTimeout(400);
check('add to cart from product card updates badge', (await p.textContent('#cart-count')) === String(+c0 + 1), await p.textContent('#cart-count'));
check('cart drawer opens after add', await p.isVisible('#cart-drawer'));
await p.$eval('#cart-close', n => n.click());
await p.evaluate(() => localStorage.clear());
// newsletter validation
await p.evaluate(() => document.querySelector('#newsletter').scrollIntoView());
await p.click('.news__btn');
check('newsletter: empty email shows error', (await p.textContent('#news-msg')).includes('enter your email'));
await p.fill('#news-email', 'nope'); await p.click('.news__btn');
check('newsletter: invalid email shows error', (await p.textContent('#news-msg')).includes('valid email'));
await p.fill('#news-email', 'a@b.co'); await p.click('.news__btn');
check('newsletter: valid email shows success and clears field', (await p.textContent('#news-msg')).includes('Thanks') && (await p.inputValue('#news-email')) === '');
check('page errors (stage 4 desktop)', errs4.length === 0, errs4.join(' | ').slice(0, 200));
await p.evaluate(() => localStorage.clear());
await ctx.close();

// ---- sliders on mobile
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
p = await ctx.newPage();
await p.goto(URL_, { waitUntil: 'networkidle' });
const counter = sel => p.$eval(sel, n => n.innerText.replace(/\s+/g, ''));
check('collections counter starts 1/5', (await counter('#collections .slider-counter')) === '1/5');
check('collections prev disabled at start', await p.$eval('#collections .slider-button[data-dir="-1"]', n => n.disabled));
await p.$eval('#collections .slider-button[data-dir="1"]', n => n.click()); await p.waitForTimeout(800);
check('collections next -> 2/5', (await counter('#collections .slider-counter')) === '2/5', await counter('#collections .slider-counter'));
check('featured counter starts 1/7', (await counter('#featured .slider-counter')) === '1/7', await counter('#featured .slider-counter'));
await p.$eval('#featured .slider-button[data-dir="1"]', n => n.click()); await p.waitForTimeout(800);
check('featured next -> 2/7', (await counter('#featured .slider-counter')) === '2/7', await counter('#featured .slider-counter'));
check('hero banner (mobile): variant visible, desktop hidden, call link is tel:', (await p.isVisible('#hero-1 .slide-art--mobile .slide-img')) && !(await p.isVisible('#hero-1 .slide-art--desktop')) && (await p.getAttribute('#hero-1 .slide-art--mobile .hotspot >> nth=0', 'href')) === 'tel:+916385202221');
check('reviews banner (mobile): variant visible, desktop hidden', (await p.isVisible('#reviews .slide-art--mobile .slide-img')) && !(await p.isVisible('#reviews .slide-art--desktop')));
check('trust banner (mobile): variant visible, desktop hidden, call link is tel:', (await p.isVisible('.slide-art--mobile .slide-img')) && !(await p.isVisible('.slide-art--desktop')) && (await p.getAttribute('.slide-art--mobile .hotspot >> nth=0', 'href')) === 'tel:+916385202221');
check('2 product cards per view on mobile', (await p.$$eval('.feat__item', n => Math.round(n[0].getBoundingClientRect().width))) === 155);
await ctx.close();

// ---- overflow + mobile drawer at all widths
for (const [name, w, h] of [['desktop', 1440, 900], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
  ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
  p = await ctx.newPage();
  await p.goto(URL_, { waitUntil: 'networkidle' });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`no horizontal overflow @${name} (${w})`, ov <= 0, `scrollWidth-clientWidth=${ov}`);
  if (name !== 'desktop') {
    check(`desktop nav hidden @${name}`, !(await p.isVisible('.header__nav')));
    await p.click('#menu-toggle'); await p.waitForTimeout(300);
    check(`drawer opens @${name}`, await p.isVisible('#menu-drawer'));
    await p.screenshot({ path: `${OUT}behaviour-drawer-${name}.png` });
    const dl = await p.$$eval('#drawer-list a', n => n.map(a => a.textContent.trim()));
    check(`drawer lists the 7 nav items @${name}`, dl.length === 7 && dl[0] === 'Home' && dl[6] === 'Privacy Policy', dl.join('|'));
    await p.click('#drawer-list >> text="Trending Jewellery"'); await p.waitForTimeout(1800);
    check(`drawer link closes the drawer and scrolls to #featured @${name}`, !(await p.isVisible('#menu-drawer')) && (await p.evaluate(() => document.getElementById('featured').getBoundingClientRect().top < innerHeight / 2)));
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.click('#menu-toggle'); await p.waitForTimeout(200);
    await p.click('#menu-toggle');
    check(`drawer closes @${name}`, !(await p.isVisible('#menu-drawer')));
    await p.click('#search-toggle'); await p.waitForTimeout(200);
    await p.keyboard.type('kada'); await p.waitForTimeout(200);
    await p.screenshot({ path: `${OUT}behaviour-search-${name}.png` });
    const sOv = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`no overflow with search open @${name}`, sOv <= 0, `${sOv}`);
  }
  await ctx.close();
}
// ---- why trust page
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
p = await ctx.newPage();
const werr = [];
p.on('pageerror', e => werr.push(e.message));
await p.goto(URL_ + 'why-trust.html', { waitUntil: 'networkidle' });
check('why-trust page: heading, 6 trust cards, current nav item, no overflow/errors', (await p.textContent('h2.about__title')) === 'Why Trust House of Vincy?' && (await p.$$eval('.about__card', n => n.length)) === 6 && (await p.$$eval('#nav-list [aria-current=page]', n => n.map(a => a.textContent.trim()))).join() === 'Why Trust House of Vincy' && (await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0 && werr.length === 0);
await p.screenshot({ path: OUT + 'behaviour-whytrust-desktop.png' });
await ctx.close();
// from the homepage, the nav item opens that page
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
p = await ctx.newPage();
await p.goto(URL_, { waitUntil: 'networkidle' });
await p.click('.nav-list >> text="Why Trust House of Vincy"'); await p.waitForURL(/why-trust\.html/);
check('homepage nav "Why Trust" opens why-trust.html', true);
await ctx.close();

// ---- privacy policy page
for (const [name, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
  p = await ctx.newPage();
  const perr = [];
  p.on('pageerror', e => perr.push(e.message));
  await p.goto(URL_ + 'privacy-policy.html', { waitUntil: 'networkidle' });
  const m = await p.evaluate(() => { const r = e => document.querySelector(e).getBoundingClientRect(); const cs = e => getComputedStyle(document.querySelector(e)); return { w: r('.policy').width, h1: cs('.policy__title').fontSize, h3: cs('.policy h3').fontSize, p: cs('.policy p').fontSize, h3count: document.querySelectorAll('.policy h3').length, ov: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
  check(`privacy page @${name}: container + type sizes match reference`, name === 'desktop' ? Math.abs(m.w - 749) < 1 && m.h1 === '44px' && m.h3 === '19.8px' && m.p === '19.2px' : Math.abs(m.w - 390) < 1 && m.h1 === '33px' && m.h3 === '18.7px' && m.p === '18px', JSON.stringify(m));
  check(`privacy page @${name}: 7 sections, no overflow, no errors`, m.h3count === 7 && m.ov <= 0 && perr.length === 0, JSON.stringify(m) + perr.join());
  if (name === 'desktop') {
    const hrefs = await p.$$eval('#nav-list a', n => n.map(a => a.getAttribute('href')));
    check('privacy page nav links back to homepage sections', hrefs.slice(0, 4).every(h => h.startsWith('index.html#')) && hrefs[4] === 'why-trust.html' && hrefs[5] === 'index.html#contact' && hrefs[6] === 'privacy-policy.html', hrefs.join());
    check('privacy page: current nav item marked', (await p.$$eval('#nav-list [aria-current=page]', n => n.length)) === 1);
    await p.click('#nav-list >> text="Collections"'); await p.waitForURL(/index\.html#collections/); await p.waitForTimeout(1500);
    check('nav from policy page lands on homepage #collections', new URL(p.url()).hash === '#collections' && (await p.evaluate(() => document.getElementById('collections').getBoundingClientRect().top < 400)));
  }
  await p.screenshot({ path: `${OUT}behaviour-privacy-${name}.png`, fullPage: name === 'mobile' });
  await ctx.close();
}
await browser.close();
check('no console/page errors', errors.length === 0, errors.join(' | ').slice(0, 300));
console.table(results);
fs.writeFileSync(`${OUT}behaviour-results.json`, JSON.stringify(results, null, 1));
process.exitCode = results.some(r => r.result === 'FAIL') ? 1 : 0;
