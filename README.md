# AestheticHomeFind

Static, GitHub Pages-compatible home-finds discovery website. Visitors discover
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

- Session 08 | 2026-10-02 | `feat: add shop page and category pages (Session 08)` | Open: header "Categories" link goes to `/shop/#categories` (the chip row). Header search icon still links to `/shop/` until Session 09. Guides, About, Contact, Privacy Policy, Affiliate Disclosure and Terms are still stubs (Sessions 12-13).

## Shop and category pages (Session 08)

Generated by `scripts/build/listing-pages.js`; styles in `css/listing.css` (loaded only on these pages).

- `/shop/` lists every published product, newest first. `/category/<slug>/` lists one category's products, with name, description, optional image and a breadcrumb (Home / Shop / Category).
- A category with no published products still gets a page, with a "No finds yet" message and a link to the Shop.
- Category chips (All finds + each category) sit above the grid on all listing pages; the current one is highlighted.
- **No pagination in V1.** The full list is on one page, which is fine up to roughly 100 products. Future path: build-time pages (`/shop/page/2/`) or a "load more" button, decided when the catalogue grows. Session 10 adds client-side filters and sorting on `/shop/`.
- Category image (optional `image` field) is shown 16:9 above the title; it is decorative, so it has empty alt text.


- Session 09 | 2026-10-02 | `feat: add client-side search page (Session 09)` | Open: the header search icon opens `/search/` (a dedicated page, not a dropdown). The search page is `noindex` and must stay out of the sitemap (Session 19). `js/components.js` (browser product card) was created now because search needs it; Session 10 reuses it.

## Search (Session 09)

- Page: `/search/`, built by `scripts/build/search-page.js`. Script: `js/search.js`. Browser product card: `js/components.js`. Styles: `css/search.css`.
- Searches title, category name, tags and description. Every word typed must match somewhere. Ranking: title matches first, then category/tags, then description; ties show the newest first. Case, accents and extra spaces are ignored; partial words work ("lamp" finds "lamps").
- Data is `dist/data/products.json` and `categories.json`, loaded only when the Search page is used.
- Results are built with the DOM (`textContent`), never raw `innerHTML`. If you change the card in `scripts/build/components.js`, change `js/components.js` to match.
- Typing searches after a short pause; Enter or the Search button also works; Esc or the X button clears. The address (`/search/?q=word`) can be shared or reloaded.
- Without JavaScript the page shows a link to the Shop.



- Session 10 | 2026-10-03 | `feat: add shop filters and sorting (Session 10)` | Open: filters are not combined with search (search stays on `/search/`). The Shop page shows both the category chips (links to category pages) and a category select (filters in place). No tags filter (sample data does not justify one). Category pages have no filter or sort yet.

## Shop filters and sorting (Session 10)

- Controls on `/shop/`: Category select, "Featured only" checkbox, Sort (Newest, Featured first, A-Z). Built by `filterBar()` in `scripts/build/listing-pages.js`. Script: `js/filters.js`. Styles: `css/listing.css`.
- Without JavaScript the controls stay hidden and the full list (already in the HTML) is shown.
- With no filter active nothing is fetched. When a filter is active, `dist/data/products.json` is loaded once and the cards are drawn with `AHF.createProductCard` from `js/components.js` (DOM and `textContent`, never raw `innerHTML`).
- The state is in the address: `/shop/?category=kitchen&featured=1&sort=az`. Newest is the default and is left out of the address. Unknown values fall back to the defaults. Back, Forward and reload work.
- "Featured" comes from the `featured` field of `products.json`. The build also writes the featured product URLs into the form (`data-featured-urls`) as a fallback.
- If you change the card in `scripts/build/components.js`, change `js/components.js` to match (same rule as Search).

- Session 11 | 2026-10-03 | `feat: add related products to product pages (Session 11)` | Open: the Instagram link text on product pages is "Find it here." (PRD wording); it is vague when read alone by a screen reader. Products with no related items show no "Related finds" section.

## Related products (Session 11)

- Logic: `scripts/build/related.js`. The block is built by `relatedSection()` in `scripts/build/product-page.js` and fills the `{{related}}` slot of `pages/product/content.html`. Style: `.related` in `css/product.css`.
- Rule: never the product itself; same category first, then more shared tags, then newest. A product must share the category or at least one tag to count. Up to 4 (`RELATED_COUNT` in `related.js`). Drafts and archived products never appear, because only published products are considered.
- No filler: if nothing is related, the section (and its heading) is not shown.
- Homepage was reviewed: Latest Finds shows up to 8 and Featured Finds up to 4 (`home.js`), so large catalogues need no change. Instagram links (header, footer, homepage section, product `instagramUrl`) were reviewed; they appear only where data exists and open in a new tab.



- Session 13 | 2026-10-03 | `feat: add about, contact, privacy, disclosure and terms pages (Session 13)` | Open (launch blockers): every `TODO-OWNER` marker in `pages/` (About story, real contact method, legal dates, claims to confirm, legal review). `npm run build` warns about them; `npm run build:strict` fails until they are gone. Privacy Policy is updated again in Sessions 23-24 if analytics or AdSense are added.



- Session 12 | 2026-10-03 | `feat: add guides system with markdown pages (Session 12)` | Open: the two sample guides ("Sample: ...") are placeholders and are removed in Session 27. Guides support no images or tables yet. The guide pages get SEO extras (Article structured data) in Session 18 and are added to the sitemap in Session 19. Amazon links written inside a guide are checked together with all other Amazon links in Session 14.

## Guides (Session 12)

- Files: `content/guides/<slug>.md`. Fields (see Content schema): `title`, `slug`, `description`, `date` (required); `draft`, `seoTitle`, `seoDescription`, `relatedProducts` (optional list of product slugs). The text below the front matter is the article.
- Pages: `/guides/` (list, newest first) and `/guide/<slug>/`. Built by `scripts/build/guide-pages.js`. Article text is converted by `scripts/build/markdown.js`, a small converter written for this project (no dependency, so nothing to update or secure). Styles: `css/guides.css` (guide page), `.guide-card` in `css/components.css` (cards).
- **Draft rule:** `draft: true` means the guide gets no page and appears nowhere (list, homepage, product pages, search).
- **Markdown supported:** `##` / `###` / `####` headings (a single `#` becomes `##`, because the page title is the only h1), paragraphs, `-` bullet lists, `1.` numbered lists, `>` quotes, `---` rules, `**bold**`, `*italic*`, `` `code` `` and `[links](...)`. Not supported: images, tables, raw HTML (it is shown as text). All text is escaped.
- **Links in guides:** `[Shop](/shop/)` stays on this site and keeps the base path; `https://` links open in a new tab; Amazon links automatically get the affiliate attributes (`sponsored nofollow noopener noreferrer`) through `amazonLink()`. Any other kind of address is shown as plain text.
- **Related products:** `relatedProducts` shows a "Related finds" grid at the bottom of the guide, in the listed order. Drafted or archived products are skipped. The same list adds a "Read the guide" link on each product page (up to 2 guides).
- Homepage: "Helpful Guides" shows the newest 3 guides (`GUIDES_COUNT` in `scripts/build/home.js`) and disappears when there are none.
- The Amazon Associate disclosure is shown at the bottom of every guide.
- Header navigation now includes Guides (a comment in `nav.js` had hidden it).


## Trust and legal pages (Session 13)

- Pages: `/about/`, `/contact/`, `/privacy-policy/`, `/affiliate-disclosure/`, `/terms/`. Built by `scripts/build/static-pages.js`. The wording is plain HTML in `pages/about/`, `pages/contact/`, `pages/privacy/`, `pages/disclosure/` and `pages/terms/` (each a `content.html`). Edit these files directly; no code change is needed.
- Placeholders available in the texts: `{{brandName}}`, `{{disclosure}}`, `{{instagramUrl}}`, `{{instagramHandle}}`, `{{aboutUrl}}`, `{{contactUrl}}`, `{{privacyUrl}}`, `{{disclosureUrl}}`, `{{termsUrl}}`, `{{shopUrl}}`. Use these for links so they keep working on a GitHub project site. An unknown placeholder fails the build with a clear message.
- **`TODO-OWNER` markers:** everything the owner must still supply or confirm. Find them with Search in VS Code (Ctrl+Shift+F, search `TODO-OWNER`). All markers must be gone before launch.
- The Privacy Policy describes only what the site does today: no analytics, no ads, no cookies of its own, GitHub Pages hosting, outbound links to Amazon and Instagram. If analytics or AdSense are added later, update it first (Sessions 23-24).
- The wording is a draft written in plain language. It is not legal advice; the owner must review it before launch.



