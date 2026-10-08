'use strict';
// Copies the admin panel (admin/ folder) into dist/admin/ so it is published with the site.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

function copyAdmin() {
  const from = path.join(root, 'admin');
  const to = path.join(root, 'dist', 'admin');
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, {
    recursive: true,
    filter: (src) => path.basename(src) !== '.gitkeep',
  });
  console.log('Admin panel copied to dist/admin');
}

module.exports = { copyAdmin };