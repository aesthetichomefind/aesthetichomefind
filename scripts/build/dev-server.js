// Tiny local web server (no dependencies). Serves the dist/ folder.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const dist = path.resolve(__dirname, "..", "..", "dist");
const port = 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = path.join(dist, urlPath);

    if (!filePath.startsWith(dist)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("404 Not Found");
      }
      const type = types[path.extname(filePath)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Local site: http://localhost:${port}  (press Ctrl+C to stop)`);
  });