// Local data (frontend only). Categories, address and phone come from the client brief.
// Product names are descriptive labels for the supplied photos; PRICES HAVE NOT BEEN SUPPLIED yet:
// set `price` (a number, in rupees) on each product below and the cards, search and cart pick it up.
// Single-page site: every link is an anchor on the homepage, except the Privacy Policy and Why Trust pages.
// `target` is the section id on index.html (or the policy page file).
export const NAV = [
  { label: 'Home', target: 'top' },
  { label: 'Collections', target: 'collections' },
  { label: 'Trending Jewellery', target: 'featured' },
  { label: 'Customer Reviews', target: 'reviews' },
  { label: 'Why Trust House of Vincy', page: 'why-trust.html' },
  { label: 'Contact Us', target: 'contact' },
  { label: 'Privacy Policy', page: 'privacy-policy.html' },
];
// Where an item points from the homepage ('') or from the policy page ('index.html').
export const hrefFor = (n, base = '') => (n.page ? n.page : `${base}#${n.target}`);

// Product categories (used by search suggestions and the footer; they all lead to the Collections section).
export const CATEGORIES = [
  { label: 'Earrings', children: ['Oxidised Earrings', 'Anti Tarnish Earrings', 'Studs', 'Twisted Earrings'] },
  { label: 'Rings' },
  { label: 'Chains', children: ['Anti Tarnish Chains'] },
  { label: 'Anklets' },
  { label: 'Necklaces', children: ['American Diamond Necklaces', 'Oxidised Necklaces', 'Temple Necklaces', 'Hasli Necklaces', 'Tennis Chain Necklaces'] },
  { label: 'Bracelets', children: ['Kada Bracelets', 'Chain Bracelets'] },
  { label: 'Watches' },
  { label: 'Bangles' },
  { label: 'Hair Accessories', children: ['Hair Clips', 'Stone Clips', 'Hair Bands'] },
  { label: 'Beauty Products', children: ['Nail Polish', 'Nail Polish Remover', 'Wipes', 'Sunscreen', 'Nail Art', 'Eyeliner', 'Mascara', 'Lipstick'] },
];

export const CONTACT = {
  phone: '6385202221',
  phoneHref: 'tel:+916385202221',
  address: '251 Velachery Main Road, Thanthai Periyar Nagar, Velachery, Chennai 600042',
};

export const FOOTER = {
  brand: {
    heading: 'HOUSE OF VINCY',
    text: 'House of Vincy brings you everyday jewellery, hair accessories and beauty essentials in one place. Explore earrings, necklaces, bracelets, bangles and more, chosen to be easy to wear and easy to love.',
  },
  categories: CATEGORIES.map(n => ({ label: n.label, target: 'collections' })),
  links: [
    { label: 'Why Trust House of Vincy', page: 'why-trust.html' },
    { label: 'Privacy Policy', page: 'privacy-policy.html' },
    { label: 'Contact Us', target: 'contact' },
  ],
  support: [
    { k: 'Mobile', v: CONTACT.phone, href: CONTACT.phoneHref },
    { k: 'Address', v: CONTACT.address },
  ],
};

// Trending products (the 8 supplied photos). price: null = not supplied yet -> shown as "Price on request".
export const PRODUCTS = [
  { id: 'p1', name: 'Multicolour Stone Bracelet', price: null, img: 'assets/product-01-multicolour-stone-bracelet.jpg', alt: 'Slim bracelet set with small multicoloured stones on ivory satin' },
  { id: 'p2', name: 'Gold Pendant Necklace', price: null, img: 'assets/product-02-gold-pendant-necklace.jpg', alt: 'Fine gold-tone chain necklace with a single pendant on a velvet display bust' },
  { id: 'p3', name: 'Blue Stone Bracelet', price: null, img: 'assets/product-03-blue-stone-bracelet.jpg', alt: 'Bracelet with deep blue and clear stones on satin' },
  { id: 'p4', name: 'Rose Gold Marquise Bracelet', price: null, img: 'assets/product-04-rose-gold-marquise-bracelet.jpg', alt: 'Rose gold-tone bracelet with long pointed clear stones' },
  { id: 'p5', name: 'Golden Leaf Cuff', price: null, img: 'assets/product-05-golden-leaf-cuff.jpg', alt: 'Gold-tone leaf wreath cuff bracelet on a satin-lined dish' },
  { id: 'p6', name: 'Rainbow Stone Bracelet', price: null, img: 'assets/product-06-rainbow-stone-bracelet.jpg', alt: 'Bracelet with rainbow-coloured stones on ivory satin' },
  { id: 'p7', name: 'Evil Eye Charm Bracelet', price: null, img: 'assets/product-07-evil-eye-charm-bracelet.jpg', alt: 'Gold-tone bracelet with evil eye charms on a ceramic dish' },
  { id: 'p8', name: 'Green Stone Leaf Bracelet', price: null, img: 'assets/product-08-green-stone-leaf-bracelet.jpg', alt: 'Bracelet with green leaf-shaped stones on satin' },
];

// Search suggestions: every category and sub-category (product names are searched separately).
export const SEARCH_TERMS = [...new Set(CATEGORIES.flatMap(n => [n.label, ...(n.children || [])]).map(t => t.toLowerCase()))];

export const money = n => (n == null ? 'Price on request' : `Rs. ${n.toFixed(2)}`);
