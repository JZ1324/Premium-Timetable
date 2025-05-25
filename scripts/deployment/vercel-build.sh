#!/bin/bash
set -e

# Display versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Use the enhanced build process
echo "🔨 Running enhanced build process..."
export NODE_ENV=production
export VERCEL=1
node vercel.build.js

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Check the logs above for details."
  exit 1
fi

echo "✅ Enhanced build process completed successfully!"

# Final path fixes to ensure bundle.js loads correctly
echo "🔧 Applying final path fixes..."

# Fix the bundle.js path in index.html
if grep -q 'src="./bundle.js"' build/index.html; then
  echo "- Fixing relative bundle.js path"
  sed -i.bak 's|src="./bundle.js"|src="/bundle.js"|g' build/index.html
fi

# Add Vercel deployment detector if not already present
if ! grep -q "__VERCEL_DEPLOYMENT" build/index.html; then
  echo "- Adding Vercel deployment detector"
  sed -i.bak '/<\/head>/i\
<script>window.__VERCEL_DEPLOYMENT = window.location.hostname.includes("vercel.app") || window.location.hostname.includes("now.sh");</script>' build/index.html
fi

# Fix storage bucket if needed
if grep -q "timetable-28639\.firebasestorage\.app" build/index.html; then
  echo "- Fixing Firebase storage bucket format"
  sed -i.bak 's/timetable-28639\.firebasestorage\.app/timetable-28639\.appspot\.com/g' build/index.html
fi

# Add a pre-bundle.js loading script for path fixes
if ! grep -q "path-fix.js" build/index.html; then
  echo "- Adding path-fix.js script"
  sed -i.bak '/<head>/a\
  <script src="/path-fix.js"></script>' build/index.html
fi

# Clean up backup files
rm -f build/*.bak

# Create additional routing files
echo "📄 Creating additional routing files..."

# Create a .nojekyll file to prevent GitHub Pages processing
touch build/.nojekyll

# Ensure _redirects file exists
if [ ! -f build/_redirects ]; then
  cat > build/_redirects << EOF
/bundle.js /bundle.js 200
/*.bundle.js /:splat.bundle.js 200
/* /index.html 200
EOF
fi

# Echo success message with detailed information
echo "✅ Build process completed successfully!"
echo "📋 Build output contains:"
ls -la build/
echo "📋 Index.html contains:"
grep -n "bundle.js" build/index.html
