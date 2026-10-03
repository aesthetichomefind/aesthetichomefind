// Builds the homepage content from the content model.
// Static wording (hero buttons, Instagram section) lives in pages/home/content.html.
const { url, escapeHtml, render, readText } = require("./lib");
const { productGrid, categoryGrid, guideGrid } = require("./components");

const LATEST_COUNT = 8; // newest products shown on the homepage
const FEATURED_COUNT = 4; // products marked featured: true shown on the homepage
const GUIDES_COUNT = 3; // newest guides shown on the homepage

function section({ id, heading, linkHtml = "", body, modifier = "" }) {
  return `    <section class="section${modifier}" aria-labelledby="${id}-heading">
      <div class="container">
        <div class="section__header">
          <h2 id="${id}-heading">${heading}</h2>${linkHtml}
        </div>
${body}
      </div>
    </section>`;
}

function renderHomeContent(model) {
  const { site, categories, products } = model;

  const categoriesSection = categories.length
    ? section({ id: "categories", heading: "Shop by Category", body: categoryGrid(categories, products) }).replace(
        '<section class="section" aria-labelledby="categories-heading">',
        '<section class="section" id="categories" aria-labelledby="categories-heading">'
      )
    : "";

  const viewAll = `\n          <a href="${escapeHtml(url("/shop/"))}">View all finds &rarr;</a>`;
  const latestSection = products.length
    ? section({
        id: "latest",
        heading: "Latest Finds",
        linkHtml: viewAll,
        body: productGrid(products.slice(0, LATEST_COUNT), categories),
      })
    : section({
        id: "latest",
        heading: "Latest Finds",
        body: '        <p class="text-muted">New finds are on the way. Check back soon.</p>',
      });

  // Helpful Guides: the section disappears when there are no published guides
  const homeGuides = (model.guides || []).slice(0, GUIDES_COUNT);
  const guidesSection = homeGuides.length
    ? section({
        id: "guides",
        heading: "Helpful Guides",
        linkHtml: `\n          <a href="${escapeHtml(url("/guides/"))}">All guides &rarr;</a>`,
        body: guideGrid(homeGuides, 3),
      })
    : "";



  const featured = products.filter((p) => p.featured).slice(0, FEATURED_COUNT);
  const featuredSection = featured.length
    ? section({ id: "featured", heading: "Featured Finds", modifier: " section--soft", body: productGrid(featured, categories) })
    : "";

  return render(
    readText("pages", "home", "content.html"),
    {
      tagline: escapeHtml(site.tagline),
      description: escapeHtml(site.description),
      shopUrl: escapeHtml(url("/shop/")),
      instagramUrl: escapeHtml(site.instagramUrl),
      instagramHandle: escapeHtml(site.instagramHandle),
      categories: categoriesSection,
      latest: latestSection,
      featured: featuredSection,
      guides: guidesSection,
    },
    "pages/home/content.html"
  );
}

module.exports = { renderHomeContent };