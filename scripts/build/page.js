// Page generation: wraps page content in the shared layout, header and footer.
const { basePath, url, escapeHtml, render, readText } = require("./lib");
const nav = require("./nav");

function loadTemplates() {
  return {
    layout: readText("scripts", "build", "templates", "layout.html"),
    header: readText("scripts", "build", "templates", "header.html"),
    footer: readText("scripts", "build", "templates", "footer.html"),
  };
}

// Returns renderPage({ sitePath, title, description, content, head }).
// `head` is an optional slot for extra tags inside <head> (used for SEO in Session 18).
function createPageRenderer(site) {
  const templates = loadTemplates();
  const shared = {
    brandName: escapeHtml(site.brandName),
    description: escapeHtml(site.description),
    instagramUrl: escapeHtml(site.instagramUrl),
    instagramHandle: escapeHtml(site.instagramHandle),
  };

  return function renderPage({ sitePath, title, description, content, head = "" }) {
    const header = render(
      templates.header,
    { ...shared, homeUrl: url("/"), searchUrl: url("/search/"), mainLinks: nav.mainLinks(sitePath) },
      "header.html"
    );
    const footer = render(
      templates.footer,
      {
        ...shared,
        disclosure: escapeHtml(site.amazonDisclosure),
        year: String(new Date().getFullYear()),
        exploreLinks: nav.exploreLinks(sitePath),
        infoLinks: nav.infoLinks(sitePath),
      },
      "footer.html"
    );
    return render(
      templates.layout,
      { title: escapeHtml(title), description: escapeHtml(description), base: basePath, head, header, content, footer },
      "layout.html"
    );
  };
}

module.exports = { createPageRenderer };