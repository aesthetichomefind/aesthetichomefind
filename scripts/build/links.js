// Single place that builds outbound links. Session 14 audits and tightens the rules here.
const { escapeHtml } = require("./lib");

// Amazon affiliate link. The URL always comes from content (never invented or changed here).
function amazonLink({ href, html, className = "btn btn--primary" }) {
  return `<a class="${className}" href="${escapeHtml(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${html}<span class="visually-hidden"> (opens Amazon in a new tab)</span></a>`;
}

// Other outbound links (Instagram etc.). Not affiliate links, so no "sponsored".
function externalLink({ href, html, className = "" }) {
  const cls = className ? ` class="${className}"` : "";
  return `<a${cls} href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
}

module.exports = { amazonLink, externalLink };