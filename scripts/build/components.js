// HTML builders for reusable parts (product card, category tile, product grid).
// Output works without JavaScript. Session 10 mirrors the card markup in js/components.js.
const { url, escapeHtml } = require("./lib");

// Product photos are shown in a square frame (see .card__media), so the
// width/height attributes describe that frame and stop layout shift while loading.
const IMAGE_FRAME = 800;

// Shortens text at a word boundary. Used when a product has no shortDescription.
function excerpt(text, max = 110) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:!?-]+$/, "") + "\u2026";
}

function productCard(product, categoryName) {
  const badgeClass = product.badge === "New" ? "badge badge--new" : "badge";
  const badge = product.badge ? `\n        <span class="${badgeClass} card__badge">${escapeHtml(product.badge)}</span>` : "";
  const text = product.shortDescription || excerpt(product.description);
  return `    <article class="card">
      <div class="card__media">
        <img src="${escapeHtml(url(product.image))}" alt="${escapeHtml(product.altText)}" width="${IMAGE_FRAME}" height="${IMAGE_FRAME}" loading="lazy" decoding="async">${badge}
      </div>
      <div class="card__body">
        <p class="card__category">${escapeHtml(categoryName)}</p>
        <h3 class="card__title"><a class="card__link" href="${escapeHtml(url(product.sitePath))}">${escapeHtml(product.title)}</a></h3>
        <p class="card__text">${escapeHtml(text)}</p>
        <span class="card__cta">View product</span>
      </div>
    </article>`;
}

function productGrid(products, categories) {
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  const cards = products.map((p) => productCard(p, names.get(p.category) || "")).join("\n");
  return `    <div class="product-grid">\n${cards}\n    </div>`;
}

function categoryTile(category, count) {
  const countText = count === 0 ? "No finds yet" : count === 1 ? "1 find" : `${count} finds`;
  return `    <li class="category-tile">
      <h3 class="category-tile__name"><a class="category-tile__link" href="${escapeHtml(url(category.sitePath))}">${escapeHtml(category.name)}</a></h3>
      <p class="category-tile__text">${escapeHtml(category.description)}</p>
      <span class="category-tile__count">${countText}</span>
    </li>`;
}

function categoryGrid(categories, products) {
  const tiles = categories
    .map((c) => categoryTile(c, products.filter((p) => p.category === c.slug).length))
    .join("\n");
  return `    <ul class="category-grid" role="list">\n${tiles}\n    </ul>`;
}

// "3 October 2026". Always uses the date as written in the file (no time zone surprises).
function formatDate(value) {
  const date = new Date(Date.parse(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// "2026-10-03" for the <time datetime> attribute
function isoDate(value) {
  return String(value).slice(0, 10);
}

// level: heading level of the title (3 under a section heading, 2 under the page title)
function guideCard(guide, level = 3) {
  const tag = `h${level}`;
  return `    <article class="guide-card">
      <p class="guide-card__date"><time datetime="${escapeHtml(isoDate(guide.date))}">${escapeHtml(formatDate(guide.date))}</time></p>
      <${tag} class="guide-card__title"><a class="guide-card__link" href="${escapeHtml(url(guide.sitePath))}">${escapeHtml(guide.title)}</a></${tag}>
      <p class="guide-card__text">${escapeHtml(guide.description)}</p>
      <span class="guide-card__cta">Read the guide</span>
    </article>`;
}

function guideGrid(guides, level = 3) {
  return `    <div class="guide-grid">\n${guides.map((g) => guideCard(g, level)).join("\n")}\n    </div>`;
}

module.exports = { productCard, productGrid, categoryGrid, guideCard, guideGrid, formatDate, isoDate };