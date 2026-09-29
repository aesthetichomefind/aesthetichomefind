// Session 01 hello-world build script.
// Later sessions will read content/ and generate the full site.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const dist = path.join(root, "dist");

// Start clean every time
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Copy the placeholder page into the output folder
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));

console.log("Build complete: dist/index.html created");