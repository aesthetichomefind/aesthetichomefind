// Turns validated content into the objects the build and the browser use.
// Rule: products with draft: true or archived: true are never published.
const { url } = require("./lib");
const { loadProducts, loadCategories, loadSite } = require("./content");

function toProduct(entry) {
  const d = entry.data;
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    category: d.category,
    description: d.description,
    shortDescription: d.shortDescription || "",
    features: d.features || [],
    image: d.image,
    altText: d.altText,
    additionalImages: d.additionalImages || [],
    amazonUrl: d.amazonUrl,
    instagramUrl: d.instagramUrl || null,
    publishedAt: d.publishedAt,
    featured: d.featured === true,
    badge: d.badge || null,
    tags: d.tags || [],
    seoTitle: d.seoTitle || "",
    seoDescription: d.seoDescription || "",
    note: entry.body, // "why it caught our attention" text
    draft: d.draft === true,
    archived: d.archived === true,
    sitePath: `/product/${d.slug}/`,
  };
}

function toCategory(d) {
  return {
    name: d.name,
    slug: d.slug,
    description: d.description,
    order: d.order,
    image: d.image || null,
    seoTitle: d.seoTitle || "",
    seoDescription: d.seoDescription || "",
    sitePath: `/category/${d.slug}/`,
  };
}

// Newest first; same date -> A to Z
const byNewest = (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.title.localeCompare(b.title);
const byOrder = (a, b) => a.order - b.order || a.name.localeCompare(b.name);

// Call only after validate() reports no errors.
function loadModel(root) {
  const site = loadSite(root).data;
  const categories = loadCategories(root).filter((e) => e.isJson && e.data).map((e) => toCategory(e.data)).sort(byOrder);
  const all = loadProducts(root).filter((e) => e.isMarkdown && e.data).map(toProduct);
  const products = all.filter((p) => !p.draft && !p.archived).sort(byNewest);
  const hidden = {
    draft: all.filter((p) => p.draft).length,
    archived: all.filter((p) => p.archived && !p.draft).length,
  };
  return { site, categories, products, hidden };
}

// Browser data: only what cards and search need. URLs already include the base path.
// Deliberately leaves out amazonUrl, features, notes and SEO fields.
function toClientProducts(products) {
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    shortDescription: p.shortDescription,
    description: p.description,
    image: url(p.image),
    altText: p.altText,
    tags: p.tags,
    featured: p.featured,
    badge: p.badge,
    publishedAt: p.publishedAt,
    url: url(p.sitePath),
  }));
}

function toClientCategories(categories, products) {
  return categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    order: c.order,
    image: c.image ? url(c.image) : null,
    url: url(c.sitePath),
    count: products.filter((p) => p.category === c.slug).length,
  }));
}

module.exports = { loadModel, toClientProducts, toClientCategories };