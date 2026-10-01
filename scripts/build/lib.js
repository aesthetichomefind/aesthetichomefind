// Shared helpers for the build. No dependencies.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

// GitHub Pages base path. Empty for a custom domain or user site.
// For a project site set BASE_PATH=/repo-name when building.
function normalizeBasePath(value) {
  if (!value || value === "/") return "";
  return "/" + value.replace(/^\/+|\/+$/g, "");
}
const basePath = normalizeBasePath(process.env.BASE_PATH);

// Every internal URL goes through this helper.
function url(sitePath) {
  if (!sitePath.startsWith("/")) throw new Error(`url() needs an absolute site path, got "${sitePath}"`);
  return basePath + sitePath;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Replaces {{name}} placeholders in one pass. Unknown names fail the build.
function render(template, values, label = "template") {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error(`Unknown placeholder ${match} in ${label}`);
    }
    return values[key];
  });
}

function readText(...segments) {
  return fs.readFileSync(path.join(root, ...segments), "utf8");
}

function readJson(...segments) {
  return JSON.parse(readText(...segments));
}

module.exports = { root, basePath, url, escapeHtml, render, readText, readJson };