// Picks the "Related finds" shown at the bottom of a product page.
// Rule (decided in Session 11):
//   1. Never the product itself. Drafts and archived products are already excluded,
//      because model.products only contains published products.
//   2. Same category first, then more shared tags, then newest first.
//   3. A product must share the category or at least one tag to count as related.
//   4. At most RELATED_COUNT products. If nothing is related, nothing is shown.
const RELATED_COUNT = 4;

function tagSet(product) {
  return new Set(product.tags.map((tag) => String(tag).trim().toLowerCase()));
}

function relatedProducts(product, products, limit = RELATED_COUNT) {
  const tags = tagSet(product);
  return products
    .filter((other) => other.slug !== product.slug)
    .map((other, index) => {
      const sameCategory = other.category === product.category;
      let sharedTags = 0;
      for (const tag of tagSet(other)) if (tags.has(tag)) sharedTags += 1;
      // index keeps the existing newest-first order when everything else is equal
      return { other, index, sameCategory, sharedTags };
    })
    .filter((item) => item.sameCategory || item.sharedTags > 0)
    .sort(
      (a, b) =>
        Number(b.sameCategory) - Number(a.sameCategory) ||
        b.sharedTags - a.sharedTags ||
        a.index - b.index
    )
    .slice(0, limit)
    .map((item) => item.other);
}

module.exports = { relatedProducts, RELATED_COUNT };