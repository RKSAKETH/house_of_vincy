# House of Vincy

Homepage for **House of Vincy**: everyday jewellery, hair accessories and beauty products. It is a frontend-only static site (HTML, CSS and vanilla JavaScript) with no build step and no backend.

## Run it

```bash
npm install        # only needed for the tests and image tools (Playwright)
npm start          # serves the site at http://localhost:4173
```

You can also open `index.html` through any static file server. (Opening the file directly with `file://` will not work because the page uses JavaScript modules.)

## What's on the page

Announcement bar, sticky header with category navigation (dropdowns, a "More" menu when categories don't fit, mobile and tablet drawer), search with suggestions, cart drawer, hero banner, trust banner, customer reviews banner, collections, welcome text, scrolling highlights strip, trending products (wishlist and add to cart), newsletter signup and footer.

Everything is frontend-only: the cart, wishlist and newsletter email are kept in the browser (localStorage). There is no checkout, account or payment, and links to other pages go to a simple placeholder page.

## Project layout

```
index.html          the homepage
tokens.css          design tokens: colours, fonts, type scale, spacing, breakpoints
css/site.css        styles (uses tokens.css)
js/main.js          behaviour: nav, drawer, search, cart, sliders, wishlist, newsletter
js/data.js          the content you will edit most: categories, products, contact details
pages/placeholder.html   stand-in page for links that don't exist yet
assets/             images (banners, collections, products)
tools/              serve.mjs (dev server), behaviour.mjs (tests), image optimisers
```

## Editing content

All in `js/data.js`:

- **Categories and sub-categories**: the `NAV` list. The navigation, mobile drawer, footer links and search suggestions all update.
- **Phone and address**: the `CONTACT` object (shown in the footer and used for the call links).
- **Products**: the `PRODUCTS` list. Set `price` to a number (rupees) to show a price. While `price` is `null`, cards show "Price on request". Add `soldOut: true` to show a "Sold out" badge and hide the add-to-cart button.
- **Page text**: the announcement messages and the welcome paragraphs are in `index.html`.

## Images

Put source images in `assets/` and export web copies as JPG (about 100 to 350 KB each):

| Slot | File | Size |
|---|---|---|
| Logo | `logo.png` (transparent), `favicon.png` | about 339 × 400, 64 × 64 |
| Hero banner | `hero-banner-desktop.jpg`, `hero-banner-mobile.jpg` | 1672 × 940, 820 × 1918 |
| Trust banner | `trust-banner-desktop.jpg`, `trust-banner-mobile.jpg` | 1536 × 1024, 803 × 1958 |
| Reviews banner | `reviews-banner-desktop.jpg`, `reviews-banner-mobile.jpg` | 1536 × 1024, 1024 × 1536 |
| Collections (5) | `collection-*.jpg` | 900 × 900 |
| Products (8) | `product-0N-*.jpg` | 900 × 900 |

The banners contain their own text, call box and button. Transparent links are placed over the call box and button in `index.html` (the `hotspot` elements); if you replace a banner with a different layout, adjust those percentages.

`node tools/optimise-banners.mjs <input.png> <output.jpg> [quality]` converts a PNG banner to JPG at its native size. `node tools/optimise-images.mjs` does the same for the square collection and product images. `node tools/optimise-logo.mjs "<logo.png>"` crops the padding, makes the white background transparent and creates the favicon.

## Tests

With the server running (`npm start`), in a second terminal:

```bash
npm test
```

This runs about 75 browser checks (Playwright): sticky header, dropdowns, search, cart, wishlist, sliders, newsletter validation, mobile and tablet drawer, banner variants, and no horizontal overflow at 1440, 768 and 390 pixel widths. Screenshots are written to `test-output/` (not committed).

## Still to supply

- Product prices
- Email address and legal name for the footer
- Policy pages (Privacy, Refund, Shipping, Terms, Contact)

## Deploy (Vercel)

The site is fully static: no build step. `vercel.json` tells Vercel to skip install and build and serve the repository root, and `.vercelignore` keeps the dev tools out of the deployment.

1. Go to vercel.com, choose **Add New, Project**, and import the `house_of_vincy` GitHub repository.
2. Leave the settings as they are (Framework Preset: **Other**; Build Command and Output Directory are already set by `vercel.json`) and click **Deploy**.
3. Every push to `main` then redeploys automatically. Add your own domain under **Settings, Domains**.

Or from the terminal: `npx vercel` for a preview deployment and `npx vercel --prod` for production.

## Fonts

Playfair Display and Fraunces, loaded from Google Fonts (SIL Open Font License).
