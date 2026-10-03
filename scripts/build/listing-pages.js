// Builds the Shop page (all products) and one page per category.
// Cards come from components.js, so they look the same as on the homepage.
// Everything shown here comes from content; nothing is hard-coded.
const { basePath, url, escapeHtml } = require("./lib");
const { productGrid } = require("./components");

// Listing CSS loads only on these pages, through the page <head> slot.
const HEAD = `  <link rel="stylesheet" href="${basePath}/css/listing.css">`;

// Shop page only: the filter scripts (deferred, so they never block the page).
const SHOP_HEAD = `${HEAD}
  <script src="${basePath}/js/components.js" defer></script>
  <script src="${basePath}/js/filters.js" defer></script>`;

// V1 shows the full list on one page (no pagination). See README "Listing pages".

function countText(n) {
  return n === 1 ? "1 find" : `${n} finds`;
}

// trail: [{ label, path }, ...]; the last item is the current page and is not a link.
function breadcrumb(trail) {
  const items = trail
    .map((item, i) =>
      i === trail.length - 1
        ? `          <li><span aria-current="page">${escapeHtml(item.label)}</span></li>`
        : `          <li><a href="${escapeHtml(url(item.path))}">${escapeHtml(item.label)}</a></li>`
    )
    .join("\n");
  return `      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
${items}
        </ol>
      </nav>`;
}

// "All finds" plus one chip per category. The current page gets aria-current.
function categoryChips(categories, currentSlug) {
  const chip = (label, path, current) =>
    `          <li><a class="chip" href="${escapeHtml(url(path))}"${current ? ' aria-current="true"' : ""}>${escapeHtml(label)}</a></li>`;
  const items = [
    chip("All finds", "/shop/", currentSlug === null),
    ...categories.map((c) => chip(c.name, c.sitePath, c.slug === currentSlug)),
  ].join("\n");
  return `      <nav class="listing__filters" id="categories" aria-label="Browse by category">
        <ul class="chip-list" role="list">
${items}
        </ul>
      </nav>`;
}

function productsOrEmpty(products, categories, emptyText) {
  if (products.length > 0) return productGrid(products, categories);
  return `      <div class="listing__empty">
        <p>${escapeHtml(emptyText)}</p>
        <a class="btn btn--secondary" href="${escapeHtml(url("/shop/"))}">Browse all finds</a>
      </div>`;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured first" },
  { value: "az", label: "A\u2013Z" },
];

// Shop-only controls. They start hidden; js/filters.js shows them. Without JavaScript
// the page still shows every product (the list below is already in the HTML).
function filterBar(categories, products) {
  const featuredUrls = products
    .filter((p) => String(p.featured) === "true")
    .map((p) => url(p.sitePath))
    .join(",");
  const categoryOptions = categories
    .map((c) => `            <option value="${escapeHtml(c.slug)}">${escapeHtml(c.name)}</option>`)
    .join("\n");
  const sortOptions = SORT_OPTIONS.map(
    (s) => `            <option value="${s.value}">${escapeHtml(s.label)}</option>`
  ).join("\n");
  return `      <form class="filter-bar" data-filters hidden data-products-url="${escapeHtml(url("/data/products.json"))}" data-featured-urls="${escapeHtml(featuredUrls)}" aria-label="Filter and sort finds">
        <div class="filter-bar__field">
          <label class="filter-bar__label" for="filter-category">Category</label>
          <select class="filter-bar__select" id="filter-category" name="category" data-filter-category>
            <option value="">All categories</option>
${categoryOptions}
          </select>
        </div>
        <div class="filter-bar__field">
          <label class="filter-bar__label" for="filter-sort">Sort by</label>
          <select class="filter-bar__select" id="filter-sort" name="sort" data-filter-sort>
${sortOptions}
          </select>
        </div>
        <label class="filter-bar__check">
          <input type="checkbox" name="featured" value="1" data-filter-featured>
          <span>Featured only</span>
        </label>
        <button class="btn btn--secondary" type="button" data-filter-clear hidden>Clear filters</button>
        <p class="filter-bar__status" role="status" data-filter-status></p>
      </form>`;
}

function renderShopPage(model) {
  const { site, categories, products } = model;
  const content = `    <div class="container listing">
${breadcrumb([{ label: "Home", path: "/" }, { label: "Shop", path: "/shop/" }])}
      <header class="listing__header">
        <h1 class="listing__title">Shop all finds</h1>
        <p class="listing__intro">Everything we have featured so far.</p>
        <p class="listing__count">${countText(products.length)}</p>
      </header>
${categoryChips(categories, null)}
${filterBar(categories, products)}
      <div data-filter-default>
${productsOrEmpty(products, categories, "New finds are on the way. Check back soon.")}
      </div>
      <div data-filter-results hidden></div>
    </div>`;
  return {
    title: `Shop all finds | ${site.brandName}`,
    description: `Browse every home decor, organization and everyday essentials find featured on ${site.brandName}.`,
    content,
    head: SHOP_HEAD,
  };
}

function renderCategoryPage(category, model) {
  const { site, categories, products } = model;
  const inCategory = products.filter((p) => p.category === category.slug);
  const image = category.image
    ? `\n        <img class="listing__image" src="${escapeHtml(url(category.image))}" alt="" width="1200" height="675" decoding="async">`
    : "";
  const content = `    <div class="container listing">
${breadcrumb([
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop/" },
    { label: category.name, path: category.sitePath },
  ])}
      <header class="listing__header">${image}
        <h1 class="listing__title">${escapeHtml(category.name)}</h1>
        <p class="listing__intro">${escapeHtml(category.description)}</p>
        <p class="listing__count">${countText(inCategory.length)}</p>
      </header>
${categoryChips(categories, category.slug)}
${productsOrEmpty(inCategory, categories, "No finds in this category yet. Check back soon.")}
    </div>`;
  return {
    title: `${category.seoTitle || category.name} | ${site.brandName}`,
    description: category.seoDescription || category.description,
    content,
    head: HEAD,
  };
}

module.exports = { renderShopPage, renderCategoryPage, breadcrumb };