// Output helpers: everything the build writes into dist/ goes through here.
const fs = require("node:fs");
const path = require("node:path");

// Empties and recreates the output folder.
function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

// Writes dist/<relPath>, creating folders as needed. Refuses to write outside dist/.
function writeFile(distDir, relPath, content) {
  const target = path.resolve(distDir, "." + path.sep + relPath);
  if (!target.startsWith(path.resolve(distDir) + path.sep)) {
    throw new Error(`Refusing to write outside the output folder: ${relPath}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

// "/shop/" -> dist/shop/index.html, "/" -> dist/index.html
function writePage(distDir, sitePath, html) {
  writeFile(distDir, path.join(sitePath, "index.html"), html);
}

function writeJson(distDir, relPath, data) {
  writeFile(distDir, relPath, JSON.stringify(data));
}

// Copies whole folders (if they exist) from the project into dist/.
function copyFolders(rootDir, distDir, folders) {
  for (const folder of folders) {
    const from = path.join(rootDir, folder);
    if (!fs.existsSync(from)) continue;
    fs.cpSync(from, path.join(distDir, folder), {
      recursive: true,
      filter: (src) => path.basename(src) !== ".gitkeep",
    });
  }
}

function copyFile(from, distDir, relPath) {
  writeFile(distDir, relPath, fs.readFileSync(from));
}

module.exports = { cleanDir, writeFile, writePage, writeJson, copyFolders, copyFile };