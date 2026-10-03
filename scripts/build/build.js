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
const { renderShopPage, renderCategoryPage } = require("./listing-pages");
const { renderSearchPage } = require("./search-page");
const { staticPages, renderStaticPage, countOwnerTodos } = require("./static-pages");
const { renderGuidesIndex, renderGuidePage } = require("./guide-pages");
const { auditLinks } = require("./check-links");
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

// Owner placeholders (TODO-OWNER) in the page texts are launch blockers.
const ownerTodos = countOwnerTodos();
if (ownerTodos > 0) {
  console.warn(`WARNING ${ownerTodos} TODO-OWNER placeholder(s) in pages/. Search the project for TODO-OWNER and replace them before launch.`);
}
if (strict && ownerTodos > 0) {
  console.error("\nBuild stopped: TODO-OWNER placeholders are still in pages/. Replace them, then build again.");
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

// Shop page and one page per category (empty categories still get a page with an empty state)
writePage(dist, "/shop/", renderPage({ sitePath: "/shop/", ...renderShopPage(model) }));
for (const category of model.categories) {
  writePage(dist, category.sitePath, renderPage({ sitePath: category.sitePath, ...renderCategoryPage(category, model) }));
}

// Search page (results are drawn in the browser by js/search.js)
writePage(dist, "/search/", renderPage({ sitePath: "/search/", ...renderSearchPage(model) }));

// About, Contact, Privacy Policy, Affiliate Disclosure and Terms (text in pages/<name>/content.html)
for (const page of staticPages) {
  writePage(dist, page.sitePath, renderPage({ sitePath: page.sitePath, ...renderStaticPage(page, model) }));
}
// Guides: the list page and one page per published guide (drafts get none)
writePage(dist, "/guides/", renderPage({ sitePath: "/guides/", ...renderGuidesIndex(model) }));
for (const guide of model.guides) {
  writePage(dist, guide.sitePath, renderPage({ sitePath: guide.sitePath, ...renderGuidePage(guide, model) }));
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

// 6) Link audit on the finished pages. Any problem stops the build.
const audit = auditLinks(dist);
for (const problem of audit.problems) console.error(`LINK    ${problem}`);
if (audit.problems.length > 0) {
  console.error("\nBuild stopped: fix the links above. Amazon links must be built with amazonLink() (scripts/build/links.js).");
  process.exit(1);
}
console.log(`Link audit: ${audit.amazonLinks} Amazon link(s) checked, all correct`);



const hiddenNote = `${model.hidden.draft} draft, ${model.hidden.archived} archived hidden`;
console.log(`Content: ${model.products.length} products published (${hiddenNote}), ${model.categories.length} categories (shop + ${model.categories.length} category pages built), ${model.guides.length} guides published`);
console.log(`Build complete: ${path.relative(root, dist)}/ created`);