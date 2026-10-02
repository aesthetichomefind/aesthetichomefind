// Search page: finds products by title, category, tags and description.
// Data comes from data/products.json and data/categories.json, loaded only on first use.
// Everything is drawn with the DOM (textContent); no raw HTML is ever inserted.
(function () {
  "use strict";

  var root = document.querySelector("[data-search]");
  if (!root || !window.AHF || !window.AHF.createProductCard) return;

  var form = root.querySelector("[data-search-form]");
  var input = root.querySelector("[data-search-input]");
  var clearButton = root.querySelector("[data-search-clear]");
  var statusEl = root.querySelector("[data-search-status]");
  var resultsEl = root.querySelector("[data-search-results]");
  var shopUrl = root.getAttribute("data-shop-url");

  var dataPromise = null;
  var runId = 0;
  var typingTimer = null;

  // Lowercase, no accents, single spaces. Used for both the query and the product text.
  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function fetchJson(address) {
    return fetch(address).then(function (response) {
      if (!response.ok) throw new Error("Request failed: " + address);
      return response.json();
    });
  }

  // Loads data once and prepares searchable text for every product.
  function loadData() {
    if (!dataPromise) {
      dataPromise = Promise.all([
        fetchJson(root.getAttribute("data-products-url")),
        fetchJson(root.getAttribute("data-categories-url")),
      ])
        .then(function (loaded) {
          var names = {};
          loaded[1].forEach(function (category) {
            names[category.slug] = category.name;
          });
          return loaded[0].map(function (product) {
            var categoryName = names[product.category] || "";
            return {
              product: product,
              categoryName: categoryName,
              title: normalize(product.title),
              category: normalize(categoryName),
              tags: normalize((product.tags || []).join(" ")),
              text: normalize(product.shortDescription + " " + product.description),
            };
          });
        })
        .catch(function (error) {
          dataPromise = null; // allow a retry on the next search
          throw error;
        });
    }
    return dataPromise;
  }

  // Every word of the query must appear somewhere (title, category, tags or description).
  // Title matches rank first, then category/tags, then description; ties: newest first.
  function search(entries, query) {
    var words = query.split(" ");
    var found = [];
    entries.forEach(function (entry) {
      var score = 0;
      if (entry.title.indexOf(query) !== -1) score += 50;
      if (entry.title.indexOf(query) === 0) score += 20;
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var inTitle = entry.title.indexOf(word) !== -1;
        var inCategory = entry.category.indexOf(word) !== -1;
        var inTags = entry.tags.indexOf(word) !== -1;
        var inText = entry.text.indexOf(word) !== -1;
        if (!inTitle && !inCategory && !inTags && !inText) return;
        score += (inTitle ? 10 : 0) + (inCategory ? 4 : 0) + (inTags ? 4 : 0) + (inText ? 1 : 0);
      }
      found.push({ entry: entry, score: score });
    });
    found.sort(function (a, b) {
      return b.score - a.score || Date.parse(b.entry.product.publishedAt) - Date.parse(a.entry.product.publishedAt);
    });
    return found.map(function (item) {
      return item.entry;
    });
  }

  function clearResults() {
    while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);
  }

  function shopLink(text) {
    var link = document.createElement("a");
    link.setAttribute("href", shopUrl);
    link.textContent = text;
    return link;
  }

  function showMessage(parts) {
    clearResults();
    var p = document.createElement("p");
    p.className = "search-message";
    parts.forEach(function (part) {
      p.appendChild(typeof part === "string" ? document.createTextNode(part) : part);
    });
    resultsEl.appendChild(p);
  }

  function showResults(entries) {
    clearResults();
    var grid = document.createElement("div");
    grid.className = "product-grid";
    entries.forEach(function (entry) {
      grid.appendChild(window.AHF.createProductCard(entry.product, entry.categoryName));
    });
    resultsEl.appendChild(grid);
  }

  function run(rawQuery) {
    var query = normalize(rawQuery);
    var id = ++runId; // ignore answers that arrive after a newer search
    clearButton.hidden = rawQuery === "";

    if (!query) {
      statusEl.textContent = "";
      showMessage(["Type a product name, category or keyword, or ", shopLink("browse every find in the Shop"), "."]);
      return;
    }
    statusEl.textContent = "Searching\u2026";
    loadData().then(
      function (entries) {
        if (id !== runId) return;
        var matches = search(entries, query);
        if (matches.length === 0) {
          statusEl.textContent = "No finds match \u201C" + rawQuery.trim() + "\u201D.";
          showMessage(["Try a different word, or ", shopLink("browse every find in the Shop"), "."]);
        } else {
          statusEl.textContent = (matches.length === 1 ? "1 find" : matches.length + " finds") + " for \u201C" + rawQuery.trim() + "\u201D";
          showResults(matches);
        }
      },
      function () {
        if (id !== runId) return;
        statusEl.textContent = "";
        showMessage(["Search could not load right now. Please try again, or ", shopLink("browse the Shop"), "."]);
      }
    );
  }

  function queryFromUrl() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  // Keeps the address bar in sync so a search can be shared or reloaded.
  function updateUrl(rawQuery, push) {
    var next = window.location.pathname + (rawQuery.trim() ? "?q=" + encodeURIComponent(rawQuery.trim()) : "");
    var change = push ? history.pushState : history.replaceState;
    change.call(history, null, "", next);
  }

  // Search while typing (short pause), without reloading the page.
  input.addEventListener("input", function () {
    window.clearTimeout(typingTimer);
    clearButton.hidden = input.value === "";
    typingTimer = window.setTimeout(function () {
      updateUrl(input.value, false);
      run(input.value);
    }, 200);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    window.clearTimeout(typingTimer);
    updateUrl(input.value, true);
    run(input.value);
    input.blur(); // closes the phone keyboard so the results are visible
  });

  clearButton.addEventListener("click", function () {
    window.clearTimeout(typingTimer);
    input.value = "";
    updateUrl("", false);
    run("");
    input.focus();
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && input.value !== "") {
      event.preventDefault();
      clearButton.click();
    }
  });

  window.addEventListener("popstate", function () {
    input.value = queryFromUrl();
    run(input.value);
  });

  // First load: fill the box from ?q= and search. With no query, focus the box.
  input.value = queryFromUrl();
  run(input.value);
  if (!input.value) input.focus();
})();