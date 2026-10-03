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

// Amazon addresses: amazon.<country>, amzn.<tld> short links, and a.co
const AMAZON_HOST = /(^|\.)amazon\.[a-z.]+$|^amzn\.[a-z]+$|^a\.co$/i;
const SHORT_AMAZON_HOST = /^(amzn\.[a-z]+|a\.co)$/i;
const isAmazonHost = (hostname) => AMAZON_HOST.test(hostname);
const isShortAmazonHost = (hostname) => SHORT_AMAZON_HOST.test(hostname);

module.exports = { amazonLink, externalLink, isAmazonHost, isShortAmazonHost };