import { PRODUCTS, SEARCH_TERMS, money } from './data.js';
import { $, $$, esc, initShell } from './shell.js';
const ARROW = '<svg class="icon icon-arrow" viewBox="0 0 14 10" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546" clip-rule="evenodd"/></svg>';

const overlay = $('#page-overlay');
const headerWrap = $('.header-wrapper');

/* ---------- announcement bar (2 messages, arrows, no autoplay) ---------- */
(() => {
  const track = $('.announce-track');
  const n = $$('.announce-msg', track).length;
  let i = 0;
  const go = d => { i = (i + d + n) % n; track.style.transform = `translateX(${-i * 100}%)`; };
  $$('[data-announce]').forEach(b => b.addEventListener('click', () => go(b.dataset.announce === 'next' ? 1 : -1)));
})();

/* ---------- navigation, drawer, footer (shared with the policy page) ---------- */
const { setDrawer } = initShell({ onDrawerOpen: () => { closeSearch(); closeCart(); } });

/* ---------- local search (mock data) ---------- */
const searchModal = $('#search-modal');
const searchToggle = $('#search-toggle');
const searchInput = $('#search-input');
const results = $('#search-results');
const reset = $('#search-reset');

function openSearch() {
  setDrawer(false); closeCart();
  searchModal.hidden = false;
  searchToggle.setAttribute('aria-expanded', 'true');
  overlay.hidden = false; overlay.dataset.owner = 'search';
  searchInput.focus();
}
function closeSearch() {
  if (searchModal.hidden) return;
  searchModal.hidden = true;
  searchToggle.setAttribute('aria-expanded', 'false');
  if (overlay.dataset.owner === 'search') { overlay.hidden = true; overlay.dataset.owner = ''; }
  results.hidden = true;
}
searchToggle.addEventListener('click', () => (searchModal.hidden ? openSearch() : closeSearch()));
$('#search-close').addEventListener('click', closeSearch);

function renderResults() {
  const q = searchInput.value.trim().toLowerCase();
  reset.hidden = !q;
  if (!q) { results.hidden = true; return; }
  const words = q.split(/\s+/);
  const match = t => words.every(w => t.toLowerCase().includes(w));
  const sugg = SEARCH_TERMS.filter(match).slice(0, 7);
  const prods = PRODUCTS.filter(p => match(p.name)).slice(0, 4);
  const bold = t => { const i = t.toLowerCase().indexOf(q); return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<b>${esc(t.slice(i, i + q.length))}</b>${esc(t.slice(i + q.length))}`; };
  results.innerHTML = `<div class="predictive__cols">
      ${sugg.length ? `<div class="predictive__col"><h3 class="predictive__title">Suggestions</h3><ul>${sugg.map(s => `<li><a href="#collections">${bold(s)}</a></li>`).join('')}</ul></div>` : ''}
      ${prods.length ? `<div class="predictive__col"><h3 class="predictive__title">Products</h3><ul>${prods.map(p => `<li><a class="predictive__product" href="#featured"><img class="predictive__thumb" src="${p.img}" alt="" width="50" height="50"><span>${esc(p.name)}</span></a></li>`).join('')}</ul></div>` : ''}
      ${!sugg.length && !prods.length ? '<p class="predictive__empty">No results found</p>' : ''}
    </div>
    <a class="predictive__all" href="#featured"><span>Browse trending jewellery</span>${ARROW}</a>`;
  results.hidden = false;
}
searchInput.addEventListener('input', renderResults);
reset.addEventListener('click', () => setTimeout(() => { renderResults(); searchInput.focus(); }));
// links in the results scroll to a homepage section; the form itself never leaves the page
results.addEventListener('click', e => { if (e.target.closest('a')) closeSearch(); });
$('#search-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!searchInput.value.trim()) return;
  closeSearch();
  $('#featured').scrollIntoView();
});

/* ---------- cart (localStorage, frontend only) ---------- */
const KEY = 'vincy-cart';
const cartDrawer = $('#cart-drawer');
const cartToggle = $('#cart-toggle');
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* storage unavailable: keep in memory */ mem = c; } };
let mem = null;
const getCart = () => mem || read();

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const badge = $('#cart-count');
  badge.hidden = !count; badge.textContent = count > 99 ? '99+' : count;
  const body = $('#cart-body');
  const foot = $('#cart-foot');
  if (!cart.length) {
    body.innerHTML = '<p class="cart-drawer__empty">Your cart is empty</p><a class="btn" href="#featured" data-close-cart>Continue shopping</a>';
    foot.hidden = true; return;
  }
  let total = 0, unpriced = false;
  body.innerHTML = `<ul class="cart-lines">${cart.map(l => {
    const p = PRODUCTS.find(x => x.id === l.id); if (!p) return '';
    if (p.price == null) unpriced = true; else total += p.price * l.qty;
    return `<li class="cart-line" data-id="${p.id}"><img class="cart-line__img" src="${p.img}" alt="" width="80" height="80">
      <div class="cart-line__info"><span class="cart-line__name">${esc(p.name)}</span><span class="cart-line__price">${money(p.price)}</span>
      <div class="qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${l.qty}</span><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div></div>
      <button type="button" class="cart-line__remove" data-remove aria-label="Remove ${esc(p.name)}">Remove</button></li>`;
  }).join('')}</ul>`;
  $('#cart-subtotal').textContent = unpriced ? (total ? `${money(total)} + items on request` : 'Price on request') : money(total);
  foot.hidden = false;
  $('#cart-note').hidden = true;
}
function change(id, delta) {
  const cart = getCart().map(l => ({ ...l }));
  const l = cart.find(x => x.id === id);
  if (l) l.qty += delta; else if (delta > 0) cart.push({ id, qty: delta });
  write(cart.filter(x => x.qty > 0));
  renderCart();
}
$('#cart-body').addEventListener('click', e => {
  if (e.target.closest('[data-close-cart]')) { closeCart(); return; }
  const line = e.target.closest('.cart-line'); if (!line) return;
  if (e.target.closest('[data-remove]')) { write(getCart().filter(l => l.id !== line.dataset.id)); renderCart(); return; }
  const q = e.target.closest('[data-qty]'); if (q) change(line.dataset.id, +q.dataset.qty);
});
$('#cart-checkout').addEventListener('click', () => { $('#cart-note').hidden = false; });

function openCart() {
  setDrawer(false); closeSearch();
  cartDrawer.classList.add('is-open'); cartDrawer.setAttribute('aria-hidden', 'false');
  cartToggle.setAttribute('aria-expanded', 'true');
  overlay.hidden = false; overlay.dataset.owner = 'cart';
  document.body.classList.add('no-scroll');
  $('#cart-close').focus();
}
function closeCart() {
  if (!cartDrawer.classList.contains('is-open')) return;
  cartDrawer.classList.remove('is-open'); cartDrawer.setAttribute('aria-hidden', 'true');
  cartToggle.setAttribute('aria-expanded', 'false');
  if (overlay.dataset.owner === 'cart') { overlay.hidden = true; overlay.dataset.owner = ''; }
  document.body.classList.remove('no-scroll');
}
cartToggle.addEventListener('click', () => (cartDrawer.classList.contains('is-open') ? closeCart() : openCart()));
$('#cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', () => { closeSearch(); closeCart(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); closeCart(); } });
renderCart();
// public hook used by the product cards
window.VincyCart = { add: (id, qty = 1, open = true) => { change(id, qty); if (open) openCart(); } };

/* ---------- featured products (local mock data) + wishlist + add to cart ---------- */
const HEART = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const BAG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.5 8.5h13l-1 11h-11zM9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const WKEY = 'vincy-wishlist';
const readW = () => { try { return JSON.parse(localStorage.getItem(WKEY)) || []; } catch { return []; } };
let wishMem = null;
const getW = () => wishMem || readW();
const saveW = w => { try { localStorage.setItem(WKEY, JSON.stringify(w)); } catch { wishMem = w; } };
const toast = $('#toast');
let toastTimer;
function say(msg) { toast.textContent = msg; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toast.hidden = true), 2200); }

const feat = $('#feat-slider');
const wished = new Set(getW());
feat.innerHTML = PRODUCTS.map((p, i) => `
  <li class="slider__item feat__item"><div class="pcard">
    <div class="pcard__media"><img src="${p.img}" width="900" height="900" alt="${esc(p.alt)}" loading="lazy">
      ${p.soldOut ? '<span class="badge">Sold out</span>' : ''}
      <div class="pcard__actions">
        <button type="button" class="pcard__btn wish" data-wish="${p.id}" aria-pressed="${wished.has(p.id)}" aria-label="Save ${esc(p.name)} to wishlist">${HEART}</button>
        ${p.soldOut ? '' : `<button type="button" class="pcard__btn pcard__btn--add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${BAG}</button>`}
      </div></div>
    <div class="pcard__info"><h3 class="pcard__title">${esc(p.name)}</h3>
      <div class="price${p.price == null ? ' price--request' : ''}"><span class="visually-hidden">Regular price </span>${money(p.price)}</div></div>
  </div></li>`).join('');
feat.addEventListener('click', e => {
  const w = e.target.closest('[data-wish]');
  if (w) {
    const id = w.dataset.wish; const on = !wished.has(id);
    on ? wished.add(id) : wished.delete(id);
    saveW([...wished]);
    w.setAttribute('aria-pressed', on);
    say(on ? 'Saved to wishlist' : 'Removed from wishlist');
    return;
  }
  const a = e.target.closest('[data-add]');
  if (a) window.VincyCart.add(a.dataset.add, 1, true);
});

/* ---------- sliders (collections, featured): scroll-snap + prev/next + "n/total" counter ---------- */
function initSlider(list) {
  const wrap = list.closest('.slider-wrap');
  const controls = $(`.slider-buttons[data-slider="${list.id}"]`, wrap);
  if (!controls) return;
  const [prev, next] = $$('.slider-button', controls);
  const cur = $('.slider-counter__current', controls);
  const tot = $('.slider-counter__total', controls);
  const items = $$(':scope > .slider__item', list);
  const step = () => items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : list.clientWidth;
  const visible = () => Math.max(1, Math.floor((list.clientWidth - parseFloat(getComputedStyle(list).paddingLeft)) / step()));
  const update = () => {
    const pages = Math.max(1, items.length - visible() + 1);
    const page = Math.min(pages, Math.round(list.scrollLeft / step()) + 1);
    tot.textContent = pages; cur.textContent = page;
    prev.disabled = page <= 1;
    next.disabled = page >= pages;
  };
  prev.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: 'smooth' }));
  list.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  addEventListener('resize', update);
  update();
}
$$('.slider').forEach(initSlider);

/* ---------- newsletter (frontend only: validates, stores locally, shows a message) ---------- */
(() => {
  const form = $('#news-form'), input = $('#news-email'), msg = $('#news-msg');
  const show = (text, error) => { msg.textContent = text; msg.hidden = false; msg.classList.toggle('news__msg--error', !!error); input.setAttribute('aria-invalid', !!error); };
  const valid = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) { show('Please enter your email address.', true); input.focus(); return; }
    if (!valid(v)) { show('Please enter a valid email address, for example name@example.com.', true); input.focus(); return; }
    try { localStorage.setItem('vincy-newsletter', JSON.stringify({ email: v, at: Date.now() })); } catch { /* storage unavailable */ }
    input.value = '';
    show('Thanks for subscribing! (Frontend demo: your address is only stored in this browser.)', false);
  });
  input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') { msg.hidden = true; input.setAttribute('aria-invalid', 'false'); } });
})();

/* ---------- placeholder labels ---------- */
$$('.ph[data-label]').forEach(el => { if (el.dataset.label) el.setAttribute('aria-label', el.dataset.label); });
