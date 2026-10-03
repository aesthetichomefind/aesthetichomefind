// Builds /guides/ (the list) and one page per published guide.
// Draft guides never reach this file: model.guides only contains published guides.
const { basePath, url, escapeHtml } = require("./lib");
const { productGrid, guideGrid, formatDate, isoDate } = require("./components");
const { breadcrumb } = require("./listing-pages");
const { markdownToHtml } = require("./markdown");

const INDEX_HEAD = `  <link rel="stylesheet" href="${basePath}/css/listing.css">`;
const GUIDE_HEAD = `  <link rel="stylesheet" href="${basePath}/css/guides.css">`;

function countText(n) {
  return n === 1 ? "1 guide" : `${n} guides`;
}

function renderGuidesIndex(model) {
  const { site, guides } = model;
  const body = guides.length
    ? guideGrid(guides, 2)
    : `      <div class="listing__empty">
        <p>Guides are on the way. Check back soon.</p>
        <a class="btn btn--secondary" href="${escapeHtml(url("/shop/"))}">Browse all finds</a>
      </div>`;
  const content = `    <div class="container listing">
${breadcrumb([{ label: "Home", path: "/" }, { label: "Guides", path: "/guides/" }])}
      <header class="listing__header">
        <h1 class="listing__title">Guides</h1>
        <p class="listing__intro">Practical ideas for styling and organizing your home.</p>
        <p class="listing__count">${countText(guides.length)}</p>
      </header>
${body}
    </div>`;
  return {
    title: `Guides | ${site.brandName}`,
    description: `Practical home styling and organizing guides from ${site.brandName}.`,
    content,
    head: INDEX_HEAD,
  };
}

function renderGuidePage(guide, model) {
  const { site, products } = model;

  // Related products in the order the guide lists them. Drafts and archived products are
  // not in model.products, so they are skipped silently.
  const related = guide.relatedProducts.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  const relatedBlock = related.length
    ? `
      <section class="guide__related" aria-labelledby="guide-related-heading">
        <h2 id="guide-related-heading">Related finds</h2>
${productGrid(related, model.categories)}
      </section>`
    : "";

  const content = `    <article class="container container--narrow guide">
${breadcrumb([
    { label: "Home", path: "/" },
    { label: "Guides", path: "/guides/" },
    { label: guide.title, path: guide.sitePath },
  ])}
      <header class="guide__header">
        <h1 class="guide__title">${escapeHtml(guide.title)}</h1>
        <p class="guide__meta"><time datetime="${escapeHtml(isoDate(guide.date))}">${escapeHtml(formatDate(guide.date))}</time></p>
        <p class="guide__intro">${escapeHtml(guide.description)}</p>
      </header>
      <p class="guide__disclosure">${escapeHtml(site.amazonDisclosure)}</p>
      <div class="guide__body stack">
${markdownToHtml(guide.body)}
      </div>${relatedBlock}
    </article>`;

  return {
    title: `${guide.seoTitle || guide.title} | ${site.brandName}`,
    description: guide.seoDescription || guide.description,
    content,
    head: GUIDE_HEAD,
  };
}

module.exports = { renderGuidesIndex, renderGuidePage };