// Shop page: category filter, "featured only" filter and sorting.
// - The full product list is already in the page HTML (works without JavaScript).
// - Filters stay hidden until this script runs.
// - With no filter active nothing is fetched; the HTML list is shown as it is.
// - With a filter active, data/products.json is loaded once and cards are drawn
//   with AHF.createProductCard (js/components.js), so they look like the built cards.
// - State lives in the URL: ?category=kitchen&featured=1&sort=az
// Everything is drawn with the DOM (textContent); no raw HTML is ever inserted.
(function () {
  "use strict";

  var root = document.querySelector("[data-filters]");
  var defaultView = document.querySelector("[data-filter-default]");
  var resultsView = document.querySelector("[data-filter-results]");
  if (!root || !defaultView || !resultsView || !window.AHF || !window.AHF.createProductCard) return;

  var categorySelect = root.querySelector("[data-filter-category]");
  var sortSelect = root.querySelector("[data-filter-sort]");
  var featuredBox = root.querySelector("[data-filter-featured]");
  var clearButton = root.querySelector("[data-filter-clear]");
  var statusEl = root.querySelector("[data-filter-status]");

  var DEFAULT_SORT = "newest";
  var SORTS = ["newest", "featured", "az"];

  // Product pages of featured products (written by the build). Used as a fallback
  // when products.json has no "featured" field.
  var featuredUrls = (root.getAttribute("data-featured-urls") || "").split(",").filter(Boolean);

  // slug -> name, read from the category <select> (no extra request needed)
  var categoryNames = {};
  for (var i = 0; i < categorySelect.options.length; i++) {
    var option = categorySelect.options[i];
    if (option.value) categoryNames[option.value] = option.textContent;
  }

  var dataPromise = null;
  var runId = 0;

  function isFeatured(product) {
    return product.featured === true || featuredUrls.indexOf(product.url) !== -1;
  }

  function time(product) {
    return Date.parse(product.publishedAt) || 0;
  }

  function byTitle(a, b) {
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  }

  function byNewest(a, b) {
    return time(b) - time(a) || byTitle(a, b);
  }

  function byFeatured(a, b) {
    return (isFeatured(b) ? 1 : 0) - (isFeatured(a) ? 1 : 0) || byNewest(a, b);
  }

  var sorters = { newest: byNewest, featured: byFeatured, az: byTitle };

  function isDefault(state) {
    return !state.category && !state.featured && state.sort === DEFAULT_SORT;
  }

  // ---- State <-> controls <-> URL --------------------------------------------

  function stateFromControls() {
    return {
      category: categorySelect.value,
      featured: featuredBox.checked,
      sort: sortSelect.value,
    };
  }

  function applyToControls(state) {
    categorySelect.value = state.category;
    featuredBox.checked = state.featured;
    sortSelect.value = state.sort;
  }

  // Unknown or broken values in the address bar fall back to the defaults.
  function stateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get("category") || "";
    var sort = params.get("sort") || DEFAULT_SORT;
    return {
      category: Object.prototype.hasOwnProperty.call(categoryNames, category) ? category : "",
      featured: params.get("featured") === "1",
      sort: SORTS.indexOf(sort) !== -1 ? sort : DEFAULT_SORT,
    };
  }

  function urlForState(state) {
    var params = new URLSearchParams();
    if (state.category) params.set("category", state.category);
    if (state.featured) params.set("featured", "1");
    if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
    var query = params.toString();
    return window.location.pathname + (query ? "?" + query : "");
  }

  // ---- Data -------------------------------------------------------------------

  function loadProducts() {
    if (!dataPromise) {
      dataPromise = fetch(root.getAttribute("data-products-url"))
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          return response.json();
        })
        .catch(function (error) {
          dataPromise = null; // allow a retry on the next change
          throw error;
        });
    }
    return dataPromise;
  }

  // ---- Drawing ----------------------------------------------------------------

  function clearResults() {
    while (resultsView.firstChild) resultsView.removeChild(resultsView.firstChild);
  }

  function showDefault() {
    clearResults();
    resultsView.hidden = true;
    defaultView.hidden = false;
    statusEl.textContent = "";
  }

  function showEmpty() {
    var box = document.createElement("div");
    box.className = "listing__empty";
    var text = document.createElement("p");
    text.textContent = "No finds match these filters.";
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--secondary";
    button.textContent = "Clear filters";
    button.addEventListener("click", resetFilters);
    box.appendChild(text);
    box.appendChild(button);
    resultsView.appendChild(box);
  }

  function showFiltered(list, total) {
    defaultView.hidden = true;
    resultsView.hidden = false;
    clearResults();
    if (list.length === 0) {
      showEmpty();
    } else {
      var grid = document.createElement("div");
      grid.className = "product-grid";
      list.forEach(function (product) {
        grid.appendChild(window.AHF.createProductCard(product, categoryNames[product.category] || ""));
      });
      resultsView.appendChild(grid);
    }
    statusEl.textContent = "Showing " + list.length + " of " + total + (total === 1 ? " find" : " finds");
  }

  function render(state) {
    var id = ++runId; // ignore answers that arrive after a newer change
    clearButton.hidden = isDefault(state);

    if (isDefault(state)) {
      showDefault();
      return;
    }
    statusEl.textContent = "Loading\u2026";
    loadProducts().then(
      function (products) {
        if (id !== runId) return;
        var list = products.filter(function (product) {
          if (state.category && product.category !== state.category) return false;
          if (state.featured && !isFeatured(product)) return false;
          return true;
        });
        list.sort(sorters[state.sort]);
        showFiltered(list, products.length);
      },
      function () {
        if (id !== runId) return;
        showDefault();
        statusEl.textContent = "Filters could not load right now. Showing all finds.";
      }
    );
  }

  // Update the address bar (so the view can be shared and Back works), then draw.
  function commit(state) {
    var next = urlForState(state);
    if (next !== window.location.pathname + window.location.search) {
      history.pushState(null, "", next);
    }
    render(state);
  }

  function resetFilters() {
    var state = { category: "", featured: false, sort: DEFAULT_SORT };
    applyToControls(state);
    commit(state);
    categorySelect.focus();
  }

  // ---- Events -----------------------------------------------------------------

  root.addEventListener("change", function () {
    commit(stateFromControls());
  });

  root.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  clearButton.addEventListener("click", resetFilters);

  window.addEventListener("popstate", function () {
    var state = stateFromUrl();
    applyToControls(state);
    render(state);
  });

  // First load: read the URL, show the controls, draw.
  var initial = stateFromUrl();
  applyToControls(initial);
  root.hidden = false;
  render(initial);
})();