// Builds the Search page. The results are drawn in the browser by js/search.js
// from dist/data/products.json (loaded only when this page is used).
const { basePath, url, escapeHtml } = require("./lib");
const { breadcrumb } = require("./listing-pages");

// Search result pages should not appear in Google (noindex), but links on them may be followed.
const HEAD = `  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="${basePath}/css/listing.css">
  <link rel="stylesheet" href="${basePath}/css/search.css">
  <script src="${basePath}/js/components.js" defer></script>
  <script src="${basePath}/js/search.js" defer></script>`;

function renderSearchPage(model) {
  const { site } = model;
  const content = `    <div class="container listing search" data-search data-products-url="${escapeHtml(url("/data/products.json"))}" data-categories-url="${escapeHtml(url("/data/categories.json"))}" data-shop-url="${escapeHtml(url("/shop/"))}">
${breadcrumb([{ label: "Home", path: "/" }, { label: "Search", path: "/search/" }])}
      <header class="listing__header">
        <h1 class="listing__title">Search</h1>
        <p class="listing__intro">Search our finds by name, category or keyword.</p>
      </header>

      <form class="search-form" role="search" action="${escapeHtml(url("/search/"))}" method="get" data-search-form>
        <label class="visually-hidden" for="search-input">Search home finds</label>
        <div class="search-form__field">
          <input class="search-form__input" id="search-input" name="q" type="search" placeholder="Search home finds&hellip;" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" data-search-input>
          <button class="search-form__clear" type="button" hidden data-search-clear>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>
            <span class="visually-hidden">Clear search</span>
          </button>
        </div>
        <button class="btn btn--primary" type="submit">Search</button>
      </form>

      <noscript>
        <p class="search-status">Search needs JavaScript. You can still <a href="${escapeHtml(url("/shop/"))}">browse every find in the Shop</a>.</p>
      </noscript>

      <p class="search-status" role="status" aria-live="polite" data-search-status></p>
      <div class="search-results" data-search-results></div>
    </div>`;
  return {
    title: `Search | ${site.brandName}`,
    description: `Search home decor, organization and everyday essentials finds on ${site.brandName}.`,
    content,
    head: HEAD,
  };
}

module.exports = { renderSearchPage };