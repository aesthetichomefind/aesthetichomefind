# AestheticHomeFind

Static, GitHub Pages-compatible home-finds discovery website. Visitors discover
real home products and click through to Amazon via affiliate links.
real home products and click through to Amazon via affiliate links.
Instagram: @AestheticHomeFind

- Stack: HTML5, CSS3, vanilla JavaScript (no frontend framework)
- Content is data, UI is code: products/guides/categories live in `content/`
- Monetization: Amazon Associates (primary), Google AdSense (later)

## Requirements

- Node.js 20 or newer (developed on Node 24)
- Git

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Builds the site into the `dist/` folder (production build) |
| `npm run dev` | Builds with the dev-only style reference page, then serves `dist/` at http://localhost:3000 (Ctrl+C to stop). Style reference: http://localhost:3000/style-reference/ |

## Folder structure

| Folder | Purpose |
|---|---|
| `assets/` | Brand files, images, icons, fonts |
| `css/` | Stylesheets (design system) |
| `js/` | Browser JavaScript |
| `data/` | Site settings and generated data files |
| `content/` | Products, guides, categories (edited via the CMS) |
| `pages/` | Page templates/content for static pages |
| `admin/` | CMS admin interface |
| `scripts/build/` | Build scripts (Node). `dev/` holds dev-only files (style reference page) |
| `dist/` | Generated output. Not committed. This is what gets deployed |

## Design system (Session 02)

CSS files, in the order pages must link them:

1. `fonts.css` - self-hosted `@font-face` rules
2. `reset.css` - minimal reset
3. `variables.css` - all design tokens. **The only file allowed to contain raw color values.**
4. `base.css` - element defaults (type, links, focus, forms)
5. `layout.css` - container, sections, product grid (2 / 3 / 4 columns)
6. `components.css` - buttons, badges, chips, product card base
7. `utilities.css` - small helpers (visually-hidden, skip-link)

Palette is sampled from the real logo: cream `#FAF3E6`, paper `#FDFAF3`, sand `#F0E7D7`,
ink brown `#3C1C04`, roof brown `#5E3818`, tan `#AF7A4A` (ring/heart/shelf), leaf green `#546624`.
Tan is too light for small text on cream (3.3:1), so links and small accent text use
`--color-accent-text` (`#8A5526`, 5.6:1). Body text is 14:1, muted text 6.8:1, button text 9.8:1.

Grid columns come from card width, not device names: 2 columns below 40em, then as many
columns as fit (3 on tablet, 4 on desktop) with a minimum card width of 14rem.

### Fonts

Display: Cormorant Garamond (variable). UI: Inter (variable). Latin subset, self-hosted, `font-display: swap`.
Place these two files in `assets/fonts/` (download once, then commit them):

- `cormorant-garamond-latin-wght-normal.woff2`
- `inter-latin-wght-normal.woff2`

Source: Fontsource (open-source font packages), e.g. `https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2`
and `https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond:vf@latest/latin-wght-normal.woff2`.
Both fonts are under the SIL Open Font License. Until the files exist, the fallback stacks
(Georgia/Palatino and system-ui) are used and the browser console shows two 404s for the fonts.

## Architecture Decisions

Decided in Session 01. Treated as fixed unless the owner approves a change.

- **Build approach:** small dependency-free Node script (`scripts/build/build.js`) that reads `content/` and generates real static files into `dist/`. No frameworks, no bundlers.
- **Node version:** 20 or newer (`engines` in `package.json`).
- **Output folder:** `dist/` (git-ignored). GitHub Actions will build and deploy `dist/` to GitHub Pages.
- **Templates:** plain HTML partial files (header, footer, layout) with simple placeholder replacement done in the build script. No template engine. Wired in Session 03.
- **URL strategy:** real generated files with clean URLs, e.g. `/product/[slug]/index.html`, `/category/[slug]/index.html`, `/guide/[slug]/index.html`. No server-side routing.
- **GitHub Pages base path:** every internal URL will go through one base-path helper, driven by a single config value. Final choice (user site, project site, or custom domain) is confirmed in Session 15 and Session 27.
- **CMS candidate:** Decap CMS (Git-based), writing Markdown/JSON into `content/`. Set up in Sessions 16-17.
- **Dev server:** tiny built-in Node server (`scripts/build/dev-server.js`), no dependencies.
- **Dependencies:** none so far. Any new dependency needs a one-line justification here.
- **Local development first:** the project is developed locally, then pushed to GitHub when the owner decides (deployment work starts in Session 15).
- **Styles:** plain CSS files with custom properties, no preprocessor. Files are minified/combined at build time in Session 22.
- **Style reference page:** lives in `scripts/build/dev/`, included only when building with `--styleguide` (`npm run dev`). It is never part of `npm run build`.

## Development Status

One line per completed session: number, date, commit message, open notes.

- Session 01 | 2026-09-30 | `feat: initialize repository skeleton and build tooling (Session 01)` | Open: none.
- Session 02 | 2026-09-30 | `design: add CSS design system with logo-sampled palette (Session 02)` | Open: add the two font files to `assets/fonts/` (see Fonts). Logo file itself is added in Session 20 (colors already sampled). Header/footer styles come in Session 03.

## Owner-supplied inputs still needed

- Logo file for `assets/brand/` (Session 20 at the latest; colors already sampled from the supplied image)
- Real contact method (Session 13)
- Amazon Special Links and permitted images (Session 27)
- Final domain (Session 27)


## Responsive policy

Applies to every session. Mobile-first CSS; wider layouts are added with `min-width` media queries.
Breakpoints follow layout needs (`40em` tablet, `52em` two-column), not device names.
Before every commit, check 320, 390, 768, 1024, 1440 and 1920 px widths: no horizontal scroll,
no cramped cards, tap targets at least 44px, images with explicit width and height.


- Session 03 | 2026-09-30 | `feat: add site shell with header, footer and mobile menu (Session 03)` | Open: Categories link goes to `/#categories` until Session 06/08. Search icon links to `/shop/` until Session 09. Stub pages (Shop, Guides, About, Contact, Privacy Policy, Affiliate Disclosure, Terms) say "built in a later session" and are replaced in Sessions 08, 12 and 13. Text wordmark in use until the logo file is added (Session 20).


## Site shell (Session 03)

Header and footer are written once in `scripts/build/templates/` (`layout.html`, `header.html`, `footer.html`)
and added to every page by `scripts/build/build.js`. Navigation links live in `scripts/build/nav.js`.
Site-wide text (brand name, Instagram URL, Amazon disclosure) lives in `data/site.json`.
Every internal URL goes through `url()` in `scripts/build/lib.js`; for a GitHub project site build with
`BASE_PATH=/repo-name`. A template typo such as `{{yeer}}` fails the build with a clear message.
The mobile menu needs JavaScript (`js/app.js`); without it `css/no-js.css` shows the links as a plain list.


- Session 04 | 2026-10-01 | `feat: add content schema, sample content and validator (Session 04)` | Open: all 10 sample products use placeholder Amazon links and fake text (the validator warns until they are replaced, Session 27). `npm run validate` is not yet part of `npm run build` (Session 05). Price/rating/scarcity wording checks come in Session 14. Guide samples come in Session 12.

## Content schema (Session 04)

Check content any time with `npm run validate`. Before launch run `npm run validate -- --strict` (warnings then fail too).

**Products**: `content/products/<slug>.md`. File name must equal the slug. Text between the `---` lines is the data; text below is the optional
"why it caught our attention" note.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | unique, lowercase letters, numbers, hyphens |
| `slug` | yes | unique, same as file name, used in the URL |
| `title` | yes | |
| `category` | yes | slug of a category in `content/categories/` |
| `description` | yes | original text, no invented claims |
| `image` | yes | path like `/assets/images/name.jpg`, file must exist |
| `altText` | yes | describes the image (required for accessibility) |
| `amazonUrl` | yes | your Amazon Special Link, full `https://` URL, never invented |
| `publishedAt` | yes | date like `2026-09-15` |
| `shortDescription` | no | card text, up to 160 characters |
| `features` | no | list of short points |
| `badge` | no | `New` or `Featured` |
| `featured` | no | `true` or `false` |
| `instagramUrl` | no | link to the Instagram post, must be instagram.com |
| `tags` | no | list |
| `additionalImages` | no | list of image paths |
| `seoTitle`, `seoDescription` | no | up to 70 / 170 characters |
| `draft` | no | `true` = not published yet, hidden everywhere |
| `archived` | no | `true` = removed from the site, file kept for history |

**Archive rule:** a product with `draft: true` or `archived: true` gets no page and appears nowhere (lists, search, related products, sitemap).
Never delete a product file to hide it; set `archived: true` instead. Wiring this rule into the build happens in Session 05.

**Categories**: `content/categories/<slug>.json` with `name`, `slug`, `description`, `order` (number, sets display order), and optional `image`, `seoTitle`, `seoDescription`.

**Guides**: `content/guides/<slug>.md` with `title`, `slug`, `description`, `date`, and optional `draft`, `seoTitle`, `seoDescription`,
`relatedProducts` (list of product slugs). The text below the front matter is the article.

**Site settings**: `data/site.json` (brand name, tagline, description, Instagram handle and URL, Amazon disclosure, optional `socialLinks` list).

Unknown field names are errors, so a typo like `ammazonUrl` is caught immediately. Sample content is clearly fake (titles start with "Sample:").


- Session 05 | 2026-10-01 | `feat: add build pipeline with validation, content model and data files (Session 05)` | Open: product and category pages are generated in Sessions 07-08, the homepage content in Session 06. After editing content, stop the dev server (Ctrl+C) and run `npm run dev` again. Validation warnings (placeholder links) appear on every build until Session 27.


| Command | What it does |
|---|---|
| `npm run validate` | Checks all content and settings, reports errors and warnings |
| `npm run build` | Validates, then builds the site into `dist/`. Stops if content has errors |
| `npm run build:strict` | Same, but warnings also stop the build (use before launch) |
| `npm run dev` | Builds with the dev-only style reference page, then serves `dist/` at http://localhost:3000 (Ctrl+C to stop). Style reference: http://localhost:3000/style-reference/ |


## Build pipeline (Session 05)

`npm run build` runs these steps in order (code in `scripts/build/`):

1. **Validate** (`validate.js`). Errors stop the build before `dist/` is touched, so a broken edit can never replace a working site.
2. **Load** (`model.js`). Products with `draft: true` or `archived: true` are dropped. Products sort newest first, categories by `order`.
3. **Pages** (`page.js`, `templates/`). Each page is wrapped in the shared header and footer. Pages can add extra tags to `<head>` through the `head` slot.
4. **Data files** (`output.js`). `dist/data/products.json` and `dist/data/categories.json` are generated for search and filters.
   They contain only what the browser needs (no Amazon links, features or notes) and all URLs already include the base path.
   They are build output, not source files, so they are not stored in the `data/` folder and not committed.
5. **Static files.** `css/`, `js/` and `assets/` are copied into `dist/`.

Rebuild after any content change. Adding, editing, drafting, archiving or deleting a product file changes the output on the next build.


- Session 06 | 2026-10-01 | `feat: add product card and data-driven homepage (Session 06)` | Open: product card links go to /product/<slug>/ and category tiles to /category/<slug>/, which are built in Sessions 07 and 08 (they show "not found" until then). Latest Finds shows up to 8 products, Featured Finds up to 4 (`LATEST_COUNT` and `FEATURED_COUNT` in `scripts/build/home.js`). The Helpful Guides section is added in Session 12.

## Homepage and product card (Session 06)

The homepage is generated by `scripts/build/home.js` from the content. Fixed wording (hero buttons, Instagram section) lives in `pages/home/content.html`.
Card and tile markup comes from `scripts/build/components.js`.

- **Latest Finds:** newest products, up to 8. **Featured Finds:** products with `featured: true`, up to 4. The section disappears when no product is featured.
- If a product has no `shortDescription`, the card shows the start of its `description`.
- Badges appear only when the product has a `badge` (`New` or `Featured`).
- Grid: 2 columns on phones, 3 on tablets, 4 from about 1024px; the column count follows card width (`--card-min` in `variables.css`).

## Images

Product photos go in `assets/images/products/` (square, about 1200 px, JPG or WebP, under 300 KB, lowercase-with-hyphens names).
Reference them as `/assets/images/products/<name>.jpg`. Category photos go in `assets/images/categories/`. Brand files go in `assets/brand/`.
`assets/images/samples/` holds placeholders and is removed before launch.


- Session 07 | 2026-10-01 | `feat: add product detail pages with gallery (Session 07)` | Open: breadcrumb category links go to /category/<slug>/ (built in Session 08). "Related finds" (Session 11) and "Read the guide" (Session 12) are placeholders that stay hidden. All outbound Amazon links use `amazonLink()` in `scripts/build/links.js`; Session 14 audits it. The "why it caught our attention" note supports plain paragraphs only (blank line = new paragraph).


## Product pages (Session 07)

Each published product gets `/product/<slug>/`, generated by `scripts/build/product-page.js` using the layout in `pages/product/content.html`.
Drafts and archived products get no page.

- Sections appear only when the data exists: key features (`features`), "why it caught our attention" (text below the front matter), Instagram line (`instagramUrl`), gallery thumbnails (`additionalImages`).
- The Amazon button is built by `amazonLink()` in `scripts/build/links.js` (new tab, `rel="sponsored nofollow noopener noreferrer"`). The affiliate URL is taken exactly from the product file.
- No prices, ratings, stock or discounts are ever shown. The page tells visitors to check Amazon for current details.
- Gallery: extra images share the product's `altText` with a number added ("image 2 of 3"). Thumbnails are links, so they work without JavaScript; `js/gallery.js` switches the main image.
- Product-page CSS and JS load only on product pages through the `head` slot of the page layout.