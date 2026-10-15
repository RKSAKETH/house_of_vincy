// Local data (frontend only). Categories, address and phone come from the client brief.
// Product names are descriptive labels for the supplied photos; PRICES HAVE NOT BEEN SUPPLIED yet:
// set `price` (a number, in rupees) on each product below and the cards, search and cart pick it up.
const page = slug => `pages/placeholder.html?slug=${encodeURIComponent(slug)}`;
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const NAV = [
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
].map(n => {
  const slug = slugify(n.label);
  return {
    ...n,
    slug,
    href: page(slug),
    children: n.children && n.children.map(c => ({ label: c, href: page(`${slug}-${slugify(c)}`) })),
  };
});

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
  categories: NAV.map(n => ({ label: n.label, href: n.href })),
  policies: ['Privacy Policy', 'Refund Policy', 'Shipping Policy', 'Terms of Service', 'Contact Information'].map(l => ({ label: l, href: page(slugify(l)) })),
  bottomPolicies: ['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy', 'Contact information'].map(l => ({ label: l, href: page(slugify(l)) })),
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
export const SEARCH_TERMS = [...new Set(NAV.flatMap(n => [n.label, ...(n.children || []).map(c => c.label)]).map(t => t.toLowerCase()))];

export const money = n => (n == null ? 'Price on request' : `Rs. ${n.toFixed(2)}`);
export { page };
