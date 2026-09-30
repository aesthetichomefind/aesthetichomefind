// Build script. Session 02: also copies css/ and assets/ into dist/.
// Later sessions will read content/ and generate the full site (Session 05).
//
// Usage:
//   node scripts/build/build.js                 (production build)
//   node scripts/build/build.js --styleguide    (dev build, adds /style-reference/)
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const dist = path.join(root, "dist");
const withStyleguide = process.argv.includes("--styleguide");

// Start clean every time
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Copy the placeholder page into the output folder
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));

// Copy static folders if they exist
for (const folder of ["css", "assets"]) {
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
  fs.copyFileSync(
    path.join(__dirname, "dev", "style-reference.html"),
    path.join(out, "index.html")
  );
  console.log("Dev: /style-reference/ included");
}

console.log("Build complete: dist/ created");