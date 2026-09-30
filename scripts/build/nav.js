// Navigation structure and link builders. Single source for header and footer.
const { url, escapeHtml } = require("./lib");

const mainNav = [
  { label: "Shop", path: "/shop/" },
  { label: "Categories", path: "/#categories" }, // becomes a menu in Session 08
  { label: "Guides", path: "/guides/" },
  { label: "About", path: "/about/" },
];

const exploreNav = [
  { label: "Shop", path: "/shop/" },
  { label: "Guides", path: "/guides/" },
  { label: "About", path: "/about/" },
];

const infoNav = [
  { label: "Contact", path: "/contact/" },
  { label: "Privacy Policy", path: "/privacy-policy/" },
  { label: "Affiliate Disclosure", path: "/affiliate-disclosure/" },
  { label: "Terms", path: "/terms/" },
];

function isCurrent(item, currentPath) {
  if (item.path.includes("#")) return false;
  return currentPath === item.path;
}

function links(items, currentPath) {
  return items
    .map((item) => {
      const current = isCurrent(item, currentPath) ? ' aria-current="page"' : "";
      return `<li><a href="${url(item.path)}"${current}>${escapeHtml(item.label)}</a></li>`;
    })
    .join("\n        ");
}

module.exports = {
  mainLinks: (currentPath) => links(mainNav, currentPath),
  exploreLinks: (currentPath) => links(exploreNav, currentPath),
  infoLinks: (currentPath) => links(infoNav, currentPath),
};