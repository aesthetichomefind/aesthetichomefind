// Builds the About, Contact, Privacy Policy, Affiliate Disclosure and Terms pages.
// The wording lives in pages/<folder>/content.html (plain HTML, edit it directly).
// Anything the owner still has to fill in is marked TODO-OWNER. The build warns about
// the markers, and "npm run build:strict" refuses to build while any are left.
const { url, escapeHtml, render, readText } = require("./lib");

const staticPages = [
  {
    sitePath: "/about/",
    folder: "about",
    title: "About",
    description: "Who is behind AestheticHomeFind and how we choose the home finds we share.",
  },
  {
    sitePath: "/contact/",
    folder: "contact",
    title: "Contact",
    description: "How to get in touch with AestheticHomeFind.",
  },
  {
    sitePath: "/privacy-policy/",
    folder: "privacy",
    title: "Privacy Policy",
    description: "What information AestheticHomeFind collects and how it is used.",
  },
  {
    sitePath: "/affiliate-disclosure/",
    folder: "disclosure",
    title: "Affiliate Disclosure",
    description: "How AestheticHomeFind earns money through Amazon affiliate links.",
  },
  {
    sitePath: "/terms/",
    folder: "terms",
    title: "Terms",
    description: "The terms for using the AestheticHomeFind website.",
  },
];

// Placeholders a page's content.html may use, written like {{brandName}}.
// Links go through url() so they keep working on a GitHub project site.
function placeholderValues(site) {
  return {
    brandName: escapeHtml(site.brandName),
    disclosure: escapeHtml(site.amazonDisclosure),
    instagramUrl: escapeHtml(site.instagramUrl),
    instagramHandle: escapeHtml(site.instagramHandle),
    aboutUrl: escapeHtml(url("/about/")),
    contactUrl: escapeHtml(url("/contact/")),
    privacyUrl: escapeHtml(url("/privacy-policy/")),
    disclosureUrl: escapeHtml(url("/affiliate-disclosure/")),
    termsUrl: escapeHtml(url("/terms/")),
    shopUrl: escapeHtml(url("/shop/")),
  };
}

function renderStaticPage(page, model) {
  const file = `pages/${page.folder}/content.html`;
  const template = readText("pages", page.folder, "content.html");
  const all = placeholderValues(model.site);

  // Only pass the placeholders this page actually uses; unknown ones fail with a clear message.
  const values = {};
  for (const match of template.matchAll(/\{\{(\w+)\}\}/g)) {
    const key = match[1];
    if (!(key in all)) throw new Error(`${file} uses an unknown placeholder {{${key}}}`);
    values[key] = all[key];
  }

  const body = render(template, values, file);
  const content = `    <section class="section">
      <div class="container container--narrow stack">
${body}
      </div>
    </section>`;
  return {
    title: `${page.title} | ${model.site.brandName}`,
    description: page.description,
    content,
  };
}

// How many TODO-OWNER markers are still left in the page texts.
function countOwnerTodos() {
  let total = 0;
  for (const page of staticPages) {
    const matches = readText("pages", page.folder, "content.html").match(/TODO-OWNER/g);
    total += matches ? matches.length : 0;
  }
  return total;
}

module.exports = { staticPages, renderStaticPage, countOwnerTodos };