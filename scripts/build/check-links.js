// Link audit on the built site (dist/). Runs at the end of every build.
//  - Every Amazon link must be an affiliate link: target="_blank" and
//    rel containing sponsored, nofollow, noopener and noreferrer.
//  - Every other link that opens a new tab must have rel noopener.
// A problem stops the build, so a link that bypasses amazonLink() can never be deployed.
const fs = require("node:fs");
const path = require("node:path");
const { isAmazonHost } = require("./links");

const AMAZON_REL = ["sponsored", "nofollow", "noopener", "noreferrer"];

function htmlFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "style-reference") continue; // dev-only page
      found.push(...htmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      found.push(full);
    }
  }
  return found;
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return match ? match[1] : null;
}

function hostOf(href) {
  if (!href || !/^https?:\/\//i.test(href)) return null;
  try {
    return new URL(href.replace(/&amp;/g, "&")).hostname;
  } catch {
    return null;
  }
}

function auditLinks(distDir) {
  const problems = [];
  let amazonLinks = 0;

  for (const file of htmlFiles(distDir)) {
    const html = fs.readFileSync(file, "utf8");
    const page = path.relative(distDir, file).split(path.sep).join("/");

    for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
      const tag = match[0];
      const href = attribute(tag, "href");
      const host = hostOf(href);
      if (!host) continue; // internal link

      const rel = (attribute(tag, "rel") || "").toLowerCase().split(/\s+/).filter(Boolean);
      const newTab = attribute(tag, "target") === "_blank";

      if (isAmazonHost(host)) {
        amazonLinks += 1;
        const missing = AMAZON_REL.filter((token) => !rel.includes(token));
        if (missing.length > 0) problems.push(`${page}: Amazon link is missing rel "${missing.join(" ")}" (${href})`);
        if (!newTab) problems.push(`${page}: Amazon link should open in a new tab (${href})`);
      } else if (newTab && !rel.includes("noopener")) {
        problems.push(`${page}: link that opens a new tab is missing rel "noopener" (${href})`);
      }
    }
  }
  return { problems, amazonLinks };
}

module.exports = { auditLinks };