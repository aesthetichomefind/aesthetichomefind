// Build script. Steps: 1) validate content  2) load content  3) write pages
// 4) write browser data files  5) copy static folders.
//
// Usage:
//   node scripts/build/build.js                 (production build)
//   node scripts/build/build.js --strict        (warnings also stop the build; use before launch)
//   node scripts/build/build.js --styleguide    (dev build, adds /style-reference/)
//   BASE_PATH=/repo-name node scripts/build/build.js   (GitHub project-site base path)
const path = require("node:path");
const { root, escapeHtml } = require("./lib");
const { validate } = require("./validate");
const { loadModel, toClientProducts, toClientCategories } = require("./model");
const { createPageRenderer } = require("./page");
const { renderHomeContent } = require("./home");
const { renderProductPage } = require("./product-page");
const { cleanDir, writePage, writeJson, copyFolders, copyFile } = require("./output");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const withStyleguide = args.includes("--styleguide");
const dist = path.join(root, "dist");

// 1) Validate first. Broken content stops the build before anything is touched.
const result = validate(root);
for (const message of result.errors) console.error(`ERROR   ${message}`);
for (const message of result.warnings) console.warn(`WARNING ${message}`);
if (result.errors.length > 0 || (strict && result.warnings.length > 0)) {
  console.error("\nBuild stopped: fix the problems above. You can re-check content any time with: npm run validate");
  process.exit(1);
}

// 2) Load content
const model = loadModel(root);
const renderPage = createPageRenderer(model.site);

// 3) Pages. Start from a clean output folder.
cleanDir(dist);

writePage(
  dist,
  "/",
  renderPage({
    sitePath: "/",
    title: `${model.site.brandName} | ${model.site.tagline}`,
    description: model.site.description,
    content: renderHomeContent(model),
  })
);

// Product pages: one per published product (drafts and archived products get none)
for (const product of model.products) {
  writePage(dist, product.sitePath, renderPage({ sitePath: product.sitePath, ...renderProductPage(product, model) }));
}

// Temporary stub pages so navigation has no dead links (replaced in Sessions 08, 12, 13)
const stubPages = [
  { sitePath: "/shop/", title: "Shop" },
  { sitePath: "/guides/", title: "Guides" },
  { sitePath: "/about/", title: "About" },
  { sitePath: "/contact/", title: "Contact" },
  { sitePath: "/privacy-policy/", title: "Privacy Policy" },
  { sitePath: "/affiliate-disclosure/", title: "Affiliate Disclosure" },
  { sitePath: "/terms/", title: "Terms" },
];
for (const page of stubPages) {
  const content = `    <section class="section">
      <div class="container container--narrow stack">
        <h1>${escapeHtml(page.title)}</h1>
        <p class="text-muted">This page is built in a later session.</p>
      </div>
    </section>`;
  writePage(
    dist,
    page.sitePath,
    renderPage({
      sitePath: page.sitePath,
      title: `${page.title} | ${model.site.brandName}`,
      description: model.site.description,
      content,
    })
  );
}

// 4) Browser data (used by search and filters in later sessions)
writeJson(dist, "data/products.json", toClientProducts(model.products));
writeJson(dist, "data/categories.json", toClientCategories(model.categories, model.products));

// 5) Static files
copyFolders(root, dist, ["css", "js", "assets"]);
if (withStyleguide) {
  copyFile(path.join(__dirname, "dev", "style-reference.html"), dist, "style-reference/index.html");
  console.log("Dev: /style-reference/ included");
}

const hiddenNote = `${model.hidden.draft} draft, ${model.hidden.archived} archived hidden`;
console.log(`Content: ${model.products.length} products published (${hiddenNote}), ${model.categories.length} categories`);
console.log(`Build complete: ${path.relative(root, dist)}/ created`);