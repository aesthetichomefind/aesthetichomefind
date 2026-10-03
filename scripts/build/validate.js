// Content validator. Run with: npm run validate
// Checks products, categories, guides and site settings. Exit code 1 if any error.
//   node scripts/build/validate.js            errors fail, warnings are shown
//   node scripts/build/validate.js --strict   warnings also fail (use before launch)
//   node scripts/build/validate.js --root <folder>   validate another folder (for tests)
const fs = require("node:fs");
const path = require("node:path");
const { loadProducts, loadGuides, loadCategories, loadSite } = require("./content");
const { isAmazonHost, isShortAmazonHost } = require("./links");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Words and numbers that must not be written into product or guide text.
// Hard claims are errors: prices, discounts, ratings and stock change often and we never
// have verified data for them. Soft claims are warnings: check that the sentence is true.
const HARD_CLAIMS = [
  { label: "a price", re: /(?:[₹$€£]|\b(?:rs|inr|usd|eur)\.?)\s?\d/i },
  { label: "a discount", re: /\d\s?%\s?off\b|\bsave\s+(?:up to\s+)?\d+\s?%/i },
  { label: "a rating", re: /\b\d(?:\.\d)?\s?(?:\/\s?5|out of 5)\b|\b\d(?:\.\d)?\s?stars?\b/i },
  { label: "a stock count", re: /\bonly\s+\d+\s+(?:left|remaining|in stock)\b|\b\d+\s+(?:left|remaining)\b/i },
  { label: "a review or sales count", re: /\b\d[\d,.]*\+?\s?(?:reviews?|ratings?|customers?|buyers?|sold)\b/i },
];
const SOFT_CLAIMS = [
  { label: "sale or deal wording", re: /\b(?:on sale|sale price|flash sale|hot deal|deal of the day|discounts?|bargain|cheapest|cheap)\b/i },
  { label: "popularity wording", re: /\b(?:best[\s-]?seller|top[\s-]rated|number one|best ever|viral)\b/i },
  { label: "urgency or stock wording", re: /\b(?:limited[\s-]time|hurry|act now|while (?:stocks?|supplies) last|in stock|out of stock|sold out|selling fast)\b/i },
  { label: "price, rating or review wording", re: /\b(?:prices?|ratings?|reviews?|reviewers?)\b/i },
];

const DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

const PRODUCT = {
  required: ["id", "slug", "title", "category", "description", "image", "altText", "amazonUrl", "publishedAt"],
  optional: ["shortDescription", "features", "badge", "featured", "instagramUrl", "seoTitle", "seoDescription", "tags", "additionalImages", "draft", "archived"],
  badges: ["New", "Featured"],
};
const CATEGORY = {
  required: ["name", "slug", "description", "order"],
  optional: ["image", "seoTitle", "seoDescription"],
};
const GUIDE = {
  required: ["title", "slug", "description", "date"],
  optional: ["draft", "seoTitle", "seoDescription", "relatedProducts"],
};
const SITE_REQUIRED = ["brandName", "tagline", "description", "instagramHandle", "instagramUrl", "amazonDisclosure", "contactEmail"];

const isText = (v) => typeof v === "string" && v.trim() !== "";
const isTextList = (v) => Array.isArray(v) && v.every(isText);

function isHttpsUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}
function isInstagramUrl(value) {
  if (!isHttpsUrl(value)) return false;
  const host = new URL(value).hostname;
  return host === "instagram.com" || host === "www.instagram.com";
}
function isDate(value) {
  return isText(value) && DATE.test(value) && !Number.isNaN(Date.parse(value));
}

function validate(root) {
  const errors = [];
  const warnings = [];
  const error = (file, msg) => errors.push(`${file}: ${msg}`);
  const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

  function checkFields(file, data, schema) {
    for (const key of Object.keys(data)) {
      if (!schema.required.includes(key) && !schema.optional.includes(key)) {
        error(file, `unknown field "${key}" (typo? allowed: ${[...schema.required, ...schema.optional].join(", ")})`);
      }
    }
    for (const key of schema.required) {
      if (data[key] === undefined || data[key] === null || (typeof data[key] === "string" && data[key].trim() === "")) {
        error(file, `missing required field "${key}"`);
      }
    }
  }

  function checkImage(file, field, sitePath) {
    if (!isText(sitePath)) return error(file, `"${field}" must be a path like /assets/images/name.jpg`);
    if (!sitePath.startsWith("/") || sitePath.includes("..")) return error(file, `"${field}" must start with / and must not contain .. (got "${sitePath}")`);
    if (!fs.existsSync(path.join(root, sitePath))) error(file, `"${field}" points to a file that does not exist: ${sitePath}`);
  }

  function checkOptionalLengths(file, data, limits) {
    for (const [field, max] of Object.entries(limits)) {
      if (isText(data[field]) && data[field].length > max) warn(file, `"${field}" is ${data[field].length} characters (recommended maximum ${max})`);
    }
  }

    function checkClaims(file, field, text) {
    if (!isText(text)) return;
    for (const rule of HARD_CLAIMS) {
      const m = text.match(rule.re);
      if (m) error(file, `"${field}" contains ${rule.label} ("${m[0].trim()}"). Prices, discounts, ratings and stock change often, so they are never written on this site; send visitors to Amazon for current details`);
    }
    for (const rule of SOFT_CLAIMS) {
      const m = text.match(rule.re);
      if (m) warn(file, `"${field}" contains ${rule.label} ("${m[0].trim()}"). Make sure it is true and not something we cannot verify`);
    }
  }

  function checkAmazonLink(file, value) {
    const link = new URL(value);
    if (!isAmazonHost(link.hostname)) {
      error(file, `"amazonUrl" must be an Amazon link (amazon.* or amzn.*), got "${link.hostname}"`);
      return;
    }
    if (isShortAmazonHost(link.hostname)) return; // short Special Links keep the tag inside Amazon's redirect
    if (!link.searchParams.get("tag")) {
      warn(file, '"amazonUrl" has no affiliate tag (tag=...), so it may not earn a commission. Copy the Special Link from Amazon SiteStripe and paste it unchanged');
    }
  }


  // ---------- Site settings ----------
  const site = loadSite(root);
  if (site.error) {
    error(site.file, site.error);
  } else {
    for (const key of SITE_REQUIRED) if (!isText(site.data[key])) error(site.file, `missing required field "${key}"`);
        if (isText(site.data.instagramUrl) && !isInstagramUrl(site.data.instagramUrl)) error(site.file, '"instagramUrl" must be an https://www.instagram.com/... link');
    if (isText(site.data.contactEmail) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.data.contactEmail)) error(site.file, '"contactEmail" must be an email address like name@example.com');
    if (site.data.socialLinks !== undefined) {
      if (!Array.isArray(site.data.socialLinks)) error(site.file, '"socialLinks" must be a list');
      else site.data.socialLinks.forEach((link, i) => {
        if (!link || !isText(link.label) || !isHttpsUrl(link.url)) error(site.file, `"socialLinks" item ${i + 1} needs a "label" and an https "url"`);
      });
    }
  }

  // ---------- Categories ----------
  const categories = loadCategories(root);
  const categorySlugs = new Set();
  for (const c of categories) {
    if (!c.isJson) { warn(c.file, "ignored (categories must be .json files)"); continue; }
    if (c.error) { error(c.file, c.error); continue; }
    if (typeof c.data !== "object" || c.data === null || Array.isArray(c.data)) { error(c.file, "must contain one JSON object"); continue; }
    checkFields(c.file, c.data, CATEGORY);
    const d = c.data;
    if (isText(d.slug)) {
      if (!SLUG.test(d.slug)) error(c.file, `slug "${d.slug}" must be lowercase letters, numbers and hyphens only`);
      if (c.fileName !== `${d.slug}.json`) error(c.file, `file name must match the slug (expected ${d.slug}.json)`);
      if (categorySlugs.has(d.slug)) error(c.file, `duplicate category slug "${d.slug}"`);
      categorySlugs.add(d.slug);
    }
    if (d.order !== undefined && typeof d.order !== "number") error(c.file, '"order" must be a number');
    if (d.image !== undefined && d.image !== "") checkImage(c.file, "image", d.image);
    checkOptionalLengths(c.file, d, { seoTitle: 70, seoDescription: 170 });
  }
  if (categories.filter((c) => c.isJson).length === 0) error("content/categories", "no categories found");

  // ---------- Products ----------
  const products = loadProducts(root);
  const ids = new Set();
  const slugs = new Set();
  let placeholderLinks = 0;
  for (const p of products) {
    if (!p.isMarkdown) { warn(p.file, "ignored (products must be .md files)"); continue; }
    if (p.error) { error(p.file, p.error); continue; }
    checkFields(p.file, p.data, PRODUCT);
    const d = p.data;

    if (isText(d.id)) {
      if (!SLUG.test(d.id)) error(p.file, `id "${d.id}" must be lowercase letters, numbers and hyphens only`);
      if (ids.has(d.id)) error(p.file, `duplicate id "${d.id}"`);
      ids.add(d.id);
    }
    if (isText(d.slug)) {
      if (!SLUG.test(d.slug)) error(p.file, `slug "${d.slug}" must be lowercase letters, numbers and hyphens only`);
      if (p.fileName !== `${d.slug}.md`) error(p.file, `file name must match the slug (expected ${d.slug}.md)`);
      if (slugs.has(d.slug)) error(p.file, `duplicate slug "${d.slug}"`);
      slugs.add(d.slug);
    }
    if (isText(d.category) && !categorySlugs.has(d.category)) {
      error(p.file, `category "${d.category}" does not exist (available: ${[...categorySlugs].join(", ") || "none"})`);
    }
    if (isText(d.amazonUrl)) {
      if (!isHttpsUrl(d.amazonUrl)) error(p.file, `"amazonUrl" must be a full https:// link (got "${d.amazonUrl}")`);
      else if (/placeholder/i.test(d.amazonUrl)) placeholderLinks++;
      else checkAmazonLink(p.file, d.amazonUrl);
    }
    if (d.instagramUrl !== undefined && d.instagramUrl !== null && d.instagramUrl !== "" && !isInstagramUrl(d.instagramUrl)) {
      error(p.file, `"instagramUrl" must be an https://www.instagram.com/... link (got "${d.instagramUrl}")`);
    }
    if (isText(d.image)) checkImage(p.file, "image", d.image);
    if (d.additionalImages !== undefined && d.additionalImages !== null) {
      if (!isTextList(d.additionalImages)) error(p.file, '"additionalImages" must be a list of image paths');
      else d.additionalImages.forEach((img) => checkImage(p.file, "additionalImages", img));
    }
    if (d.publishedAt !== undefined && d.publishedAt !== null && !isDate(d.publishedAt)) {
      error(p.file, `"publishedAt" must be a date like 2026-09-15 (got "${d.publishedAt}")`);
    }
    for (const flag of ["featured", "draft", "archived"]) {
      if (d[flag] !== undefined && d[flag] !== null && typeof d[flag] !== "boolean") error(p.file, `"${flag}" must be true or false (got "${d[flag]}")`);
    }
    if (isText(d.badge) && !PRODUCT.badges.includes(d.badge)) error(p.file, `"badge" must be one of: ${PRODUCT.badges.join(", ")} (got "${d.badge}")`);
    for (const list of ["features", "tags"]) {
      if (d[list] !== undefined && d[list] !== null && !isTextList(d[list])) error(p.file, `"${list}" must be a list of text items`);
    }
    if (Array.isArray(d.tags) && new Set(d.tags).size !== d.tags.length) warn(p.file, '"tags" contains duplicates');
    checkOptionalLengths(p.file, d, { shortDescription: 160, seoTitle: 70, seoDescription: 170 });
    for (const field of ["title", "shortDescription", "description", "seoTitle", "seoDescription"]) checkClaims(p.file, field, d[field]);
    if (Array.isArray(d.features)) d.features.forEach((feature) => checkClaims(p.file, "features", feature));
    checkClaims(p.file, "note (text below the front matter)", p.body);
  }
  if (placeholderLinks > 0) {
    warn("content/products", `${placeholderLinks} product(s) still use placeholder Amazon links - replace with your Special Links before launch (Session 27)`);
  }

  // ---------- Guides ----------
  const guides = loadGuides(root);
  const guideSlugs = new Set();
  for (const g of guides) {
    if (!g.isMarkdown) { warn(g.file, "ignored (guides must be .md files)"); continue; }
    if (g.error) { error(g.file, g.error); continue; }
    checkFields(g.file, g.data, GUIDE);
    const d = g.data;
    if (isText(d.slug)) {
      if (!SLUG.test(d.slug)) error(g.file, `slug "${d.slug}" must be lowercase letters, numbers and hyphens only`);
      if (g.fileName !== `${d.slug}.md`) error(g.file, `file name must match the slug (expected ${d.slug}.md)`);
      if (guideSlugs.has(d.slug)) error(g.file, `duplicate slug "${d.slug}"`);
      guideSlugs.add(d.slug);
    }
    if (d.date !== undefined && d.date !== null && !isDate(d.date)) error(g.file, `"date" must be a date like 2026-09-15 (got "${d.date}")`);
    if (d.draft !== undefined && d.draft !== null && typeof d.draft !== "boolean") error(g.file, `"draft" must be true or false (got "${d.draft}")`);
    if (d.draft !== true && g.body.trim() === "") error(g.file, "a published guide needs body text below the front matter (set draft: true to hide it)");
    if (d.relatedProducts !== undefined && d.relatedProducts !== null) {
      if (!isTextList(d.relatedProducts)) error(g.file, '"relatedProducts" must be a list of product slugs');
      else d.relatedProducts.forEach((slug) => { if (!slugs.has(slug)) error(g.file, `relatedProducts: no product with slug "${slug}"`); });
    }
    checkOptionalLengths(g.file, d, { seoTitle: 70, seoDescription: 170 });
    for (const field of ["title", "description", "seoTitle", "seoDescription"]) checkClaims(g.file, field, d[field]);
    checkClaims(g.file, "article text", g.body);
  }

  const counts = { products: products.filter((p) => p.isMarkdown).length, categories: categories.filter((c) => c.isJson).length, guides: guides.filter((g) => g.isMarkdown).length };
  return { errors, warnings, counts };
}

module.exports = { validate };

if (require.main === module) {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const rootIndex = args.indexOf("--root");
  const root = rootIndex !== -1 ? path.resolve(args[rootIndex + 1]) : path.resolve(__dirname, "..", "..");
  const { errors, warnings, counts } = validate(root);

  for (const message of errors) console.error(`ERROR   ${message}`);
  for (const message of warnings) console.warn(`WARNING ${message}`);
  console.log(`\nChecked ${counts.products} products, ${counts.categories} categories, ${counts.guides} guides.`);
  console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length > 0 || (strict && warnings.length > 0)) {
    console.error(strict && errors.length === 0 ? "Validation failed (strict mode: warnings count as errors)." : "Validation failed.");
    process.exit(1);
  }
  console.log("Validation passed.");
}