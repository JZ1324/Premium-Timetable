#!/bin/bash
# fix-html-js-errors.sh - Fixes JavaScript syntax errors in the minified HTML file

echo "🔧 Fixing JavaScript syntax errors in build/index.html..."

# Create a backup of the original file
cp build/index.html build/index.html.bak

# Make the HTML more readable with proper formatting
npx prettier --write build/index.html

# Fix specific syntax errors
# 1. Fix missing semicolons
sed -i '' 's/window.__webpack_public_path__="\/"/window.__webpack_public_path__="\/";/g' build/index.html
sed -i '' 's/firebase.initializeApp(window.firebaseConfig)/firebase.initializeApp(window.firebaseConfig);/g' build/index.html

# 2. Fix unexpected token issues by ensuring all JavaScript blocks have proper semicolons
sed -i '' 's/})/});/g' build/index.html

# 3. Fix any other specific syntax issues
sed -i '' 's/window.__PRODUCTION="localhost"/window.__PRODUCTION = "localhost"/g' build/index.html

# Pretty print the HTML again to ensure good formatting
npx prettier --write build/index.html

echo "✅ Fixed JavaScript syntax errors in build/index.html"
echo "   Original file backed up as build/index.html.bak"

# Validate the HTML with html-validator (if available)
if command -v npx html-validator 2>/dev/null; then
  echo "🔍 Validating HTML..."
  npx html-validator --file=build/index.html --verbose
else
  echo "ℹ️ HTML validation skipped (html-validator not installed)"
  echo "   You can install it with: npm install -g html-validator-cli"
fi

echo "✅ Done. Please check for any remaining errors in your editor."
