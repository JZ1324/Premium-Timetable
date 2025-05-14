const fs = require('fs');
const path = require('path');

// Path to the HTML file
const htmlFilePath = path.join(__dirname, 'build', 'index.html');

// Check if the file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error('❌ build/index.html does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Read the HTML file
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Make a backup of the original file
fs.writeFileSync(htmlFilePath + '.bak', htmlContent);

// Fix 1: Fix webpack_public_path assignment - missing semicolon
htmlContent = htmlContent.replace(
  /window\.__webpack_public_path__="\/";/g,
  'window.__webpack_public_path__="/";'
);

// Fix 2: Fix Firebase initialization - missing semicolon
htmlContent = htmlContent.replace(
  /firebase\.initializeApp\(window\.firebaseConfig\);/g,
  'firebase.initializeApp(window.firebaseConfig);'
);

// Fix 3: Fix environment detection script syntax error (extra comma)
htmlContent = htmlContent.replace(
  /window\.__PRODUCTION="localhost"!==window\.location\.hostname&&"127\.0\.0\.1"!==window\.location\.hostname;,/g,
  'window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;'
);

// Fix 4: Fix document.querySelectorAll with extra closing parenthesis
fixed = fixed.replace(
  /e\.src\.includes\("\.\/bundle\.js"\)&&\(e\.src="\/bundle\.js"\)\}\)\;/g,
  'e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));'
);

// Fix 5: Fix DOMContentLoaded with extra closing parenthesis
fixed = fixed.replace(
  /document\.addEventListener\("DOMContentLoaded",\(function\(\)\{.*?\}\)\;/g,
  'document.addEventListener("DOMContentLoaded",(function(){if(window.__VERCEL_DEPLOYMENT){document.querySelectorAll(\'script[src*="bundle.js"]\').forEach((e=>{e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));console.log("Adjusted bundle.js path for Vercel deployment")}});'
);
);

// Write the fixed content back to the file
fs.writeFileSync(htmlFilePath, htmlContent);

console.log('✅ Fixed JavaScript syntax errors in build/index.html');
console.log('🔍 Original file has been backed up as build/index.html.bak');
