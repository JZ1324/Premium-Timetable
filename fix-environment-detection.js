// fix-environment-detection.js
const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'build', 'index.html');

console.log('Reading index.html...');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Regular expression to find the window.__PRODUCTION without semicolon
const regex = /(window\.__PRODUCTION\s*=\s*"localhost"\s*!==\s*window\.location\.hostname\s*&&\s*"127\.0\.0\.1"\s*!==\s*window\.location\.hostname)([^;])/g;

// Add semicolon after the expression
const fixed = html.replace(regex, '$1;$2');

if (html === fixed) {
  console.log('No changes needed or pattern not found.');
} else {
  console.log('Fixing window.__PRODUCTION semicolon issue...');
  fs.writeFileSync(indexHtmlPath, fixed, 'utf8');
  console.log('Fixed successfully!');
}
