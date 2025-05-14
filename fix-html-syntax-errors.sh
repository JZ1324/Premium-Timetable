#!/bin/bash
# fix-html-syntax-errors.sh - Script to fix JavaScript syntax errors in build/index.html

echo "🔧 Fixing JavaScript syntax errors in build/index.html..."

# Check if build/index.html exists
if [ ! -f "build/index.html" ]; then
  echo "❌ build/index.html does not exist. Please run 'npm run build' first."
  exit 1
fi

# Make a backup of the original file
cp build/index.html build/index.html.bak

# Fix the 'window.__webpack_public_path__="/"' missing semicolon
sed -i '' 's/window.__webpack_public_path__="\/";)/window.__webpack_public_path__="\/";/g' build/index.html

# Fix the 'firebase.initializeApp(window.firebaseConfig)' missing semicolon
sed -i '' 's/firebase.initializeApp(window.firebaseConfig);/firebase.initializeApp(window.firebaseConfig);/g' build/index.html

# Fix the environment detection script syntax error (extra comma)
sed -i '' 's/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;,/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;/g' build/index.html

# Fix the document.querySelectorAll with extra closing parenthesis
sed -i '' 's/e.src.includes(".\/bundle.js")&&(e.src="\/bundle.js")}););,/e.src.includes(".\/bundle.js")&&(e.src="\/bundle.js")}));/g' build/index.html

# Fix any DOMContentLoaded with extra closing parenthesis
sed -i '' 's/document.addEventListener("DOMContentLoaded",(function(){.*}););/document.addEventListener("DOMContentLoaded",(function(){if(window.__VERCEL_DEPLOYMENT){document.querySelectorAll('\''script[src*="bundle.js"]'\'').forEach((e=>{e.src.includes(".\/bundle.js")&&(e.src="\/bundle.js")}));console.log("Adjusted bundle.js path for Vercel deployment")}}));/g' build/index.html

echo "✅ Fixed JavaScript syntax errors in build/index.html"
echo "🔍 Original file has been backed up as build/index.html.bak"
