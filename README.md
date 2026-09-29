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
| `npm run build` | Builds the site into the `dist/` folder |
| `npm run dev` | Builds, then serves `dist/` at http://localhost:3000 (Ctrl+C to stop) |

## Folder structure

| Folder | Purpose |
|---|---|
| `assets/` | Brand files, images, icons |
| `css/` | Stylesheets (design system) |
| `js/` | Browser JavaScript |
| `data/` | Site settings and generated data files |
| `content/` | Products, guides, categories (edited via the CMS) |
| `pages/` | Page templates/content for static pages |
| `admin/` | CMS admin interface |
| `scripts/build/` | Build scripts (Node) |
| `dist/` | Generated output. Not committed. This is what gets deployed |

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

## Development Status

One line per completed session: number, date, commit message, open notes.

- Session 01 | 2026-09-30 | `feat: initialize repository skeleton and build tooling (Session 01)` | Open: logo asset not yet supplied (needed by Session 20 at the latest).

## Owner-supplied inputs still needed

- Logo asset (Session 02 ideally, Session 20 at the latest)
- Real contact method (Session 13)
- Amazon Special Links and permitted images (Session 27)
- Final domain (Session 27)