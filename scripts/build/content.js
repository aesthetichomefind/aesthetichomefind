// Loads raw content files from content/ and data/. No validation here (see validate.js).
const fs = require("node:fs");
const path = require("node:path");
const { parseFrontMatter } = require("./frontmatter");

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== ".gitkeep")
    .map((entry) => entry.name)
    .sort();
}

// Markdown files with front matter (products, guides).
function loadMarkdownCollection(root, folder) {
  const dir = path.join(root, "content", folder);
  return listFiles(dir).map((fileName) => {
    const entry = { file: `content/${folder}/${fileName}`, fileName, data: null, body: "", error: null, isMarkdown: fileName.endsWith(".md") };
    if (!entry.isMarkdown) return entry;
    try {
      const parsed = parseFrontMatter(fs.readFileSync(path.join(dir, fileName), "utf8"));
      entry.data = parsed.data;
      entry.body = parsed.body;
    } catch (err) {
      entry.error = err.line ? `line ${err.line}: ${err.message}` : err.message;
    }
    return entry;
  });
}

// JSON files (categories).
function loadJsonCollection(root, folder) {
  const dir = path.join(root, "content", folder);
  return listFiles(dir).map((fileName) => {
    const entry = { file: `content/${folder}/${fileName}`, fileName, data: null, error: null, isJson: fileName.endsWith(".json") };
    if (!entry.isJson) return entry;
    try {
      entry.data = JSON.parse(fs.readFileSync(path.join(dir, fileName), "utf8"));
    } catch (err) {
      entry.error = `invalid JSON: ${err.message}`;
    }
    return entry;
  });
}

function loadSite(root) {
  const entry = { file: "data/site.json", data: null, error: null };
  try {
    entry.data = JSON.parse(fs.readFileSync(path.join(root, "data", "site.json"), "utf8"));
  } catch (err) {
    entry.error = err.code === "ENOENT" ? "file not found" : `invalid JSON: ${err.message}`;
  }
  return entry;
}

module.exports = {
  loadProducts: (root) => loadMarkdownCollection(root, "products"),
  loadGuides: (root) => loadMarkdownCollection(root, "guides"),
  loadCategories: (root) => loadJsonCollection(root, "categories"),
  loadSite,
};