// Builds one product detail page. Layout wording lives in pages/product/content.html.
// Nothing here shows prices, ratings, stock or discounts (we never have verified data for them).
const { basePath, url, escapeHtml, render, readText } = require("./lib");
const { amazonLink, externalLink } = require("./links");
const { productGrid } = require("./components");
const { relatedProducts } = require("./related");

// Splits plain text into paragraphs (blank line = new paragraph). All text is escaped.
function paragraphs(text) {
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((p) => `          <p>${escapeHtml(p)}</p>`)
    .join("\n");
}

function shorten(text, max) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:!?-]+$/, "") + "\u2026";
}

function breadcrumb(product, category) {
  const items = [`          <li><a href="${escapeHtml(url("/"))}">Home</a></li>`];
  if (category) items.push(`          <li><a href="${escapeHtml(url(category.sitePath))}">${escapeHtml(category.name)}</a></li>`);
  items.push(`          <li><span aria-current="page">${escapeHtml(product.title)}</span></li>`);
  return items.join("\n");
}

// Main image plus optional thumbnails. Thumbnails are plain links to the images,
// so they still work without JavaScript; js/gallery.js upgrades them to switch the main image.
function gallery(product) {
  const images = [product.image, ...product.additionalImages];
  const many = images.length > 1;
  const altFor = (i) => (many ? `${product.altText} (image ${i + 1} of ${images.length})` : product.altText);

  const main = `          <div class="gallery__frame">
            <img class="gallery__main" data-gallery-main src="${escapeHtml(url(images[0]))}" alt="${escapeHtml(altFor(0))}" width="800" height="800" fetchpriority="high" decoding="async">
          </div>`;
  if (!many) return `        <div class="gallery">\n${main}\n        </div>`;

  const thumbs = images
    .map((img, i) => {
      const current = i === 0 ? ' aria-current="true"' : "";
      return `            <li><a class="gallery__thumb" href="${escapeHtml(url(img))}" data-gallery-thumb data-alt="${escapeHtml(altFor(i))}" aria-label="Show image ${i + 1} of ${images.length}"${current}><img src="${escapeHtml(url(img))}" alt="" width="160" height="160" loading="lazy" decoding="async"></a></li>`;
    })
    .join("\n");
  return `        <div class="gallery" data-gallery>
${main}
          <ul class="gallery__thumbs" role="list">
${thumbs}
          </ul>
          <p class="visually-hidden" role="status" data-gallery-status></p>
        </div>`;
}

function features(product) {
  if (!product.features.length) return "";
  const items = product.features.map((f) => `            <li>${escapeHtml(f)}</li>`).join("\n");
  return `          <section aria-labelledby="features-heading">
            <h2 class="product__heading" id="features-heading">Key features</h2>
            <ul class="product__features">
${items}
            </ul>
          </section>`;
}

function note(product) {
  if (!product.note.trim()) return "";
  return `          <section aria-labelledby="note-heading">
            <h2 class="product__heading" id="note-heading">Why it caught our attention</h2>
${paragraphs(product.note)}
          </section>`;
}

function cta(product, site) {
  const link = amazonLink({ href: product.amazonUrl, html: "Check it on Amazon &rarr;" });
  return `          <div class="product__cta">
            ${link}
            <p class="product__disclosure">${escapeHtml(site.amazonDisclosure)} Details can change, so check Amazon for the current information.</p>
          </div>`;
}

function instagram(product) {
  if (!product.instagramUrl) return "";
  const link = externalLink({ href: product.instagramUrl, html: "Find it here." });
  return `          <p class="product__instagram">Seen this on Instagram? ${link}</p>`;
}

// "Related finds" block. Returns an empty string when nothing is related,
// so the page never shows an empty heading.
function relatedSection(product, model) {
  const items = relatedProducts(product, model.products);
  if (items.length === 0) return "";
  return `<section class="related" aria-labelledby="related-heading">
        <h2 class="product__heading" id="related-heading">Related finds</h2>
${productGrid(items, model.categories)}
      </section>`;
}

function renderProductPage(product, model) {
  const category = model.categories.find((c) => c.slug === product.category);
  const hasGallery = product.additionalImages.length > 0;

  const content = render(
    readText("pages", "product", "content.html"),
    {
      breadcrumb: breadcrumb(product, category),
      gallery: gallery(product),
      categoryLine: category ? `<p class="product__category">${escapeHtml(category.name)}</p>` : "",
      badge: product.badge ? `<span class="${product.badge === "New" ? "badge badge--new" : "badge"}">${escapeHtml(product.badge)}</span>` : "",
      title: escapeHtml(product.title),
      description: escapeHtml(product.description),
      features: features(product),
      note: note(product),
      cta: cta(product, model.site),
      instagram: instagram(product),
      related: relatedSection(product, model),
      guide: "", // "Read the guide" is added in Session 12
    },
    "pages/product/content.html"
  );

  const head = [
    `  <link rel="stylesheet" href="${basePath}/css/product.css">`,
    hasGallery ? `  <script src="${basePath}/js/gallery.js" defer></script>` : "",
  ].filter(Boolean).join("\n");

  return {
    title: `${product.seoTitle || product.title} | ${model.site.brandName}`,
    description: product.seoDescription || product.shortDescription || shorten(product.description, 160),
    content,
    head,
  };
}

module.exports = { renderProductPage };