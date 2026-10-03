// Minimal, safe Markdown to HTML for guides (no dependency).
// Supported: ## / ### / #### headings (a single # is treated as ##, because the page title is
// the h1), paragraphs, - or * bullet lists, 1. numbered lists, > quotes, --- rules,
// **bold**, *italic*, `code` and [links](...).
// Not supported: images, tables, raw HTML (HTML typed in a guide is shown as plain text).
// All text is escaped. Links: "/..." stays on this site, https:// links open in a new tab,
// and Amazon links go through amazonLink() so they get the affiliate rel attributes.
const { url, escapeHtml } = require("./lib");
const { amazonLink, externalLink, isAmazonHost } = require("./links");


function emphasis(escaped) {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(?!\s)(.+?)(?<!\s)\*/g, "<em>$1</em>");
}

function link(label, href) {
  const text = emphasis(escapeHtml(label));
  if (/^\/(?!\/)/.test(href)) return `<a href="${escapeHtml(url(href))}">${text}</a>`;
  if (/^mailto:/i.test(href)) return `<a href="${escapeHtml(href)}">${text}</a>`;
  let parsed = null;
  try {
    parsed = new URL(href);
  } catch {
    parsed = null;
  }
  if (parsed && parsed.protocol === "https:") {
    return isAmazonHost(parsed.hostname)
      ? amazonLink({ href, html: text, className: "inline-link" })
      : externalLink({ href, html: text });
  }
  return text; // unknown or unsafe address: show the words only, never a link
}

// Code spans and links are set aside first so their insides are not formatted twice.
function inline(raw) {
  const stash = [];
  const keep = (html) => {
    stash.push(html);
    return `\u0000${stash.length - 1}\u0000`;
  };
  let s = String(raw).replace(/\u0000/g, "");
  s = s.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => keep(link(label, href)));
  s = emphasis(escapeHtml(s));
  while (/\u0000\d+\u0000/.test(s)) s = s.replace(/\u0000(\d+)\u0000/g, (_, n) => stash[Number(n)]);
  return s;
}

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const RULE = /^(-{3,}|\*{3,})\s*$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;

function startsBlock(line) {
  return HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || BULLET.test(line) || NUMBER.test(line);
}

function markdownToHtml(markdown, indent = "        ") {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    let m = line.match(HEADING);
    if (m) {
      const level = Math.min(Math.max(m[1].length, 2), 4);
      blocks.push(`<h${level}>${inline(m[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push("<hr>");
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const parts = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        parts.push(lines[i].match(QUOTE)[1]);
        i += 1;
      }
      blocks.push(`<blockquote>\n  <p>${inline(parts.join(" ").trim())}</p>\n</blockquote>`);
      continue;
    }

    const listKind = BULLET.test(line) ? "ul" : NUMBER.test(line) ? "ol" : null;
    if (listKind) {
      const pattern = listKind === "ul" ? BULLET : NUMBER;
      const items = [];
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(`  <li>${inline(lines[i].match(pattern)[1])}</li>`);
        i += 1;
      }
      blocks.push(`<${listKind}>\n${items.join("\n")}\n</${listKind}>`);
      continue;
    }

    const parts = [];
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) {
      parts.push(lines[i].trim());
      i += 1;
    }
    blocks.push(`<p>${inline(parts.join(" "))}</p>`);
  }

  return blocks
    .map((block) => block.split("\n").map((l) => indent + l).join("\n"))
    .join("\n");
}

module.exports = { markdownToHtml };    