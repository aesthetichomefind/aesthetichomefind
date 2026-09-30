// Build script. Session 03: layout + header/footer partials, stub pages.
// Session 05 will replace the stub-page list with content-driven generation.
//
// Usage:
//   node scripts/build/build.js                 (production build)
//   node scripts/build/build.js --styleguide    (dev build, adds /style-reference/)
//   BASE_PATH=/repo-name node scripts/build/build.js   (GitHub project-site base path)
const fs = require("node:fs");
const path = require("node:path");
const { root, basePath, url, escapeHtml, render, readText, readJson, writePage } = require("./lib");
const nav = require("./nav");

const dist = path.join(root, "dist");
const withStyleguide = process.argv.includes("--styleguide");
const site = readJson("data", "site.json");

const templates = {
  layout: readText("scripts", "build", "templates", "layout.html"),
  header: readText("scripts", "build", "templates", "header.html"),
  footer: readText("scripts", "build", "templates", "footer.html"),
};

function renderPage({ sitePath, title, description, content }) {
  const shared = {
    brandName: escapeHtml(site.brandName),
    description: escapeHtml(site.description),
    instagramUrl: escapeHtml(site.instagramUrl),
    instagramHandle: escapeHtml(site.instagramHandle),
  };
  const header = render(
    templates.header,
    { ...shared, homeUrl: url("/"), searchUrl: url("/shop/"), mainLinks: nav.mainLinks(sitePath) },
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
    { title: escapeHtml(title), description: escapeHtml(description), base: basePath, header, footer, content },
    "layout.html"
  );
}

// Start clean every time
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Homepage
writePage(
  dist,
  "/",
  renderPage({
    sitePath: "/",
    title: `${site.brandName} | ${site.tagline}`,
    description: site.description,
    content: readText("pages", "home", "content.html"),
  })
);

// Temporary stub pages so navigation has no dead links (replaced in later sessions)
const stubPages = [
  { sitePath: "/shop/", title: "Shop" },
  { sitePath: "/guides/", title: "Guides" },
  { sitePath: "/about/", title: "About" },
  { sitePath: "/contact/", title: "Contact" },
  { sitePath: "/privacy-policy/", title: "Privacy Policy" },
  { sitePath: "/affiliate-disclosure/", title: "Affiliate Disclosure" },
  { sitePath: "/terms/", title: "Terms" },
];
for (const page of stubPages) {
  const content = `    <section class="section">
      <div class="container container--narrow stack">
        <h1>${escapeHtml(page.title)}</h1>
        <p class="text-muted">This page is built in a later session.</p>
      </div>
    </section>`;
  writePage(
    dist,
    page.sitePath,
    renderPage({
      sitePath: page.sitePath,
      title: `${page.title} | ${site.brandName}`,
      description: site.description,
      content,
    })
  );
}

// Copy static folders if they exist
for (const folder of ["css", "js", "assets"]) {
  const from = path.join(root, folder);
  if (fs.existsSync(from)) {
    fs.cpSync(from, path.join(dist, folder), {
      recursive: true,
      filter: (src) => path.basename(src) !== ".gitkeep",
    });
  }
}

// Dev-only style reference page (never part of the production build)
if (withStyleguide) {
  const out = path.join(dist, "style-reference");
  fs.mkdirSync(out, { recursive: true });
  fs.copyFileSync(path.join(__dirname, "dev", "style-reference.html"), path.join(out, "index.html"));
  console.log("Dev: /style-reference/ included");
}

console.log("Build complete: dist/ created");