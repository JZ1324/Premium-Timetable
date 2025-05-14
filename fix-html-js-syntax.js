// fix-html-js-syntax.js - New script to fix JS syntax errors in the HTML
const fs = require('fs');
const path = require('path');

// Path to the HTML file
const htmlFilePath = path.join(__dirname, 'build', 'index.html');

// Check if the file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error('❌ build/index.html does not exist. Please run "npm run build" first.');
  process.exit(1);
}

console.log('Reading index.html...');
let html = fs.readFileSync(htmlFilePath, 'utf8');

// Make a backup of the original file
fs.writeFileSync(htmlFilePath + '.bak', html);
console.log('Original HTML backed up to build/index.html.bak');

// Fix 1: Fix webpack_public_path assignment - missing semicolon or extra parenthesis
html = html.replace(
  /window\.__webpack_public_path__="\/";?\)/g,
  'window.__webpack_public_path__="/"'
);

// Fix 2: Fix Firebase initialization - missing semicolon
html = html.replace(
  /firebase\.initializeApp\(window\.firebaseConfig\);?,/g,
  'firebase.initializeApp(window.firebaseConfig);'
);

// Fix 3: Fix environment detection script syntax error (extra comma)
html = html.replace(
  /window\.__PRODUCTION="localhost"!==window\.location\.hostname&&"127\.0\.0\.1"!==window\.location\.hostname;?,/g,
  'window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;'
);

// Fix 4: Fix document.querySelectorAll with extra closing parenthesis
html = html.replace(
  /e\.src\.includes\("\.\/bundle\.js"\)&&\(e\.src="\/bundle\.js"\)\}\)\;?\)\;?,/g,
  'e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));'
);

// Fix 5: Fix DOMContentLoaded with extra closing parenthesis
html = html.replace(
  /document\.addEventListener\("DOMContentLoaded",\(function\(\)\{[^}]*\}\)\;?\)\;?/g,
  'document.addEventListener("DOMContentLoaded",(function(){if(window.__VERCEL_DEPLOYMENT){document.querySelectorAll(\'script[src*="bundle.js"]\').forEach((e=>{e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));console.log("Adjusted bundle.js path for Vercel deployment")}}));'
);

// Write the fixed content back to the file
fs.writeFileSync(htmlFilePath, html);

console.log('✅ Fixed JavaScript syntax errors in build/index.html');
