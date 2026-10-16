// Shared by the homepage and the Privacy Policy page: navigation, mobile drawer, footer.
import { NAV, FOOTER, hrefFor } from './data.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// base: '' on the homepage (in-page anchors), 'index.html' on the policy page.
export function initShell({ base = '', onDrawerOpen = () => {} } = {}) {
  const here = location.pathname.split('/').pop() || 'index.html';
  const current = n => (n.page ? n.page === here : false);
  const link = (n, cls) => `<a class="${cls}" href="${hrefFor(n, base)}"${current(n) ? ' aria-current="page"' : ''}><span>${esc(n.label)}</span></a>`;

  /* desktop nav */
  $('#nav-list').innerHTML = NAV.map(n => `<li>${link(n, 'nav-item')}</li>`).join('');

  /* mobile / tablet drawer */
  const menuToggle = $('#menu-toggle');
  const drawer = $('#menu-drawer');
  $('#drawer-list').innerHTML = NAV.map(n => `<li>${link(n, 'menu-drawer__item')}</li>`).join('');
  let open = false;
  const setDrawer = on => {
    open = on;
    if (on) onDrawerOpen();
    drawer.hidden = !on;
    menuToggle.setAttribute('aria-expanded', on);
    menuToggle.classList.toggle('is-open', on);
    document.body.classList.toggle('no-scroll', on);
    if (on) {
      drawer.style.height = '';
      drawer.style.height = `${Math.max(0, innerHeight - drawer.getBoundingClientRect().top)}px`;
    }
  };
  menuToggle.addEventListener('click', () => setDrawer(!open));
  // choosing an item closes the drawer; the browser then smooth-scrolls to the anchor
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('resize', () => { if (open && matchMedia('(min-width: 990px)').matches) setDrawer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) { setDrawer(false); menuToggle.focus(); } });

  /* anchored sections stop below the sticky header */
  const header = $('#site-header');
  const setOffset = () => document.documentElement.style.setProperty('--header-offset', `${Math.round(header.getBoundingClientRect().height)}px`);
  setOffset();
  addEventListener('resize', setOffset);
  document.fonts.ready.then(setOffset);

  /* footer */
  $('#footer-blocks').innerHTML = `
    <div class="footer-block"><h2 class="footer-block__heading footer-block__heading--brand">${esc(FOOTER.brand.heading)}</h2><div class="footer-block__text"><p>${esc(FOOTER.brand.text)}</p></div></div>
    <div class="footer-block"><h2 class="footer-block__heading">Categories</h2><ul class="footer-links">${FOOTER.categories.map(l => `<li><a href="${hrefFor(l, base)}">${esc(l.label)}</a></li>`).join('')}</ul></div>
    <div class="footer-block"><h2 class="footer-block__heading">Policies</h2><ul class="footer-links">${FOOTER.links.map(l => `<li><a href="${hrefFor(l, base)}">${esc(l.label)}</a></li>`).join('')}</ul></div>
    <div class="footer-block" id="contact"><h2 class="footer-block__heading">Customer Support</h2><div class="footer-block__text">${FOOTER.support.map(s => `<p><b>${esc(s.k)}:</b> ${s.href ? `<a class="footer-contact" href="${s.href}">${esc(s.v)}</a>` : esc(s.v)}</p>`).join('')}</div></div>`;
  $('#footer-policies').insertAdjacentHTML('beforeend', `<li><a href="${hrefFor({ page: 'privacy-policy.html' }, base)}">Privacy policy</a></li>`);

  return { setDrawer };
}
