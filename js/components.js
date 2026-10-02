// Browser versions of reusable parts. The product card here must stay identical to
// productCard() in scripts/build/components.js. Built with the DOM (textContent),
// never innerHTML, so product text can never inject HTML. Session 10 reuses this file.
(function () {
  "use strict";

  var IMAGE_FRAME = 800; // same value as IMAGE_FRAME in scripts/build/components.js

  function excerpt(text, max) {
    max = max || 110;
    var clean = String(text).replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    var cut = clean.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:!?-]+$/, "") + "\u2026";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // product: one entry of data/products.json. categoryName: text shown above the title.
  function createProductCard(product, categoryName) {
    var card = el("article", "card");

    var media = el("div", "card__media");
    var img = document.createElement("img");
    img.src = product.image;
    img.alt = product.altText;
    img.width = IMAGE_FRAME;
    img.height = IMAGE_FRAME;
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);
    if (product.badge) {
      var badgeClass = product.badge === "New" ? "badge badge--new card__badge" : "badge card__badge";
      media.appendChild(el("span", badgeClass, product.badge));
    }

    var body = el("div", "card__body");
    body.appendChild(el("p", "card__category", categoryName || ""));
    var title = el("h3", "card__title");
    var link = el("a", "card__link", product.title);
    link.setAttribute("href", product.url);
    title.appendChild(link);
    body.appendChild(title);
    body.appendChild(el("p", "card__text", product.shortDescription || excerpt(product.description)));
    body.appendChild(el("span", "card__cta", "View product"));

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  window.AHF = window.AHF || {};
  window.AHF.createProductCard = createProductCard;
})();