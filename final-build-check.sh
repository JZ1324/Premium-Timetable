#!/bin/bash
# final-build-check.sh
# This script performs final checks and fixes on the build directory before deployment

set -e  # Exit on any error

# Helper functions for colorful output
print_info() {
  echo -e "\033[36m[INFO] $1\033[0m"
}

print_success() {
  echo -e "\033[32m[SUCCESS] $1\033[0m"
}

print_warning() {
  echo -e "\033[33m[WARNING] $1\033[0m"
}

print_error() {
  echo -e "\033[31m[ERROR] $1\033[0m"
}

# Check if build directory exists
if [ ! -d "build" ]; then
  print_error "Build directory not found. Run the build process first."
  exit 1
fi

print_info "Starting final build check and fixes..."

# Check for bundle.js
if [ ! -f "build/bundle.js" ]; then
  print_error "bundle.js is missing from the build directory!"
  exit 1
else
  print_success "bundle.js exists in build directory"
fi

# Check for path-fix scripts
if [ ! -f "build/path-fix.js" ]; then
  print_warning "path-fix.js is missing, copying from public directory..."
  cp public/path-fix.js build/ || print_error "Failed to copy path-fix.js"
else
  print_success "path-fix.js exists in build directory"
fi

if [ ! -f "build/vercel-path-fix.js" ]; then
  print_warning "vercel-path-fix.js is missing, copying from public directory..."
  cp public/vercel-path-fix.js build/ || print_error "Failed to copy vercel-path-fix.js"
else
  print_success "vercel-path-fix.js exists in build directory"
fi

# Fix JavaScript syntax errors in index.html
print_info "Checking for JavaScript syntax errors in index.html..."

# Create a backup of the original index.html
cp build/index.html build/index.html.original.bak

# Fix missing semicolons and syntax errors
print_info "Fixing JavaScript syntax issues..."

# Fix 1: Missing semicolon after webpack_public_path assignment
if grep -q 'window.__webpack_public_path__="/"' build/index.html; then
  print_warning "Found missing semicolon in webpack_public_path assignment, fixing..."
  sed -i.bak 's/window.__webpack_public_path__="\/"/window.__webpack_public_path__="\/";/g' build/index.html
fi

# Fix 2: Missing semicolon after firebase initialization
if grep -q 'firebase.initializeApp(window.firebaseConfig)' build/index.html; then
  print_warning "Found missing semicolon after Firebase initialization, fixing..."
  sed -i.bak 's/firebase.initializeApp(window.firebaseConfig)/firebase.initializeApp(window.firebaseConfig);/g' build/index.html
fi

# Fix 3: Missing semicolons in event listeners and function calls
if grep -q '}))[^;]' build/index.html; then
  print_warning "Found missing semicolons in function closures, fixing..."
  sed -i.bak 's/}))\([^;]\)/}));/g' build/index.html
fi

# Fix 4: Try to improve overall script tag formatting
print_info "Attempting to improve script tag formatting..."
if command -v npx >/dev/null 2>&1 && npm list -g prettier >/dev/null 2>&1; then
  print_info "Prettier found, formatting HTML..."
  npx prettier --write build/index.html >/dev/null 2>&1 || print_warning "Prettier failed, skipping formatting"
else
  print_warning "Prettier not installed, skipping HTML formatting"
fi
  print_success "vercel-path-fix.js exists in build directory"
fi

# Check for _redirects file
if [ ! -f "build/_redirects" ]; then
  print_warning "_redirects file is missing, creating it..."
  echo "/bundle.js /bundle.js 200
/*.bundle.js /:splat.bundle.js 200
/* /index.html 200" > build/_redirects
else
  print_success "_redirects file exists in build directory"
fi

# Fix index.html bundle path if needed
print_info "Checking index.html for proper path references..."
if grep -q 'src="./bundle.js"' build/index.html; then
  print_warning "Fixing relative bundle.js path in index.html"
  sed -i.bak 's|src="./bundle.js"|src="/bundle.js"|g' build/index.html
  rm -f build/index.html.bak
fi

# Check Firebase storage bucket
if grep -q "timetable-28639.firebasestorage.app" build/index.html; then
  print_warning "Fixing Firebase storage bucket in index.html"
  sed -i.bak 's/timetable-28639\.firebasestorage\.app/timetable-28639\.appspot\.com/g' build/index.html
  rm -f build/index.html.bak
else
  print_success "Firebase storage bucket configuration is correct"
fi

# Ensure path-fix scripts are properly included
if ! grep -q '<script src="/path-fix.js"></script>' build/index.html; then
  print_warning "Adding path-fix.js reference to index.html"
  sed -i.bak 's|<head>|<head>\n  <script src="/path-fix.js"></script>|' build/index.html
  rm -f build/index.html.bak
fi

if ! grep -q '<script src="/vercel-path-fix.js"></script>' build/index.html; then
  print_warning "Adding vercel-path-fix.js reference to index.html"
  sed -i.bak 's|<head>|<head>\n  <script src="/vercel-path-fix.js"></script>|' build/index.html
  rm -f build/index.html.bak
fi

# Create .nojekyll file
if [ ! -f "build/.nojekyll" ]; then
  print_info "Creating .nojekyll file"
  touch build/.nojekyll
fi

# Create a vercel.json file in the build directory for better routing
print_info "Creating vercel.json in build directory..."
cat > build/vercel.json << EOF
{
  "version": 2,
  "routes": [
    {
      "src": "/bundle.js",
      "dest": "/bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/bundle.js\\?v=.*",
      "dest": "/bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/(\\d+)\\.bundle\\.js",
      "dest": "/$1.bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/(.*\\.[a-z0-9]{3,}\\.(js|css|jpg|png|gif|svg|ico))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Show final build stats
print_info "Build directory size: $(du -sh build | cut -f1)"
print_info "Index.html size: $(wc -c build/index.html | awk '{print $1}') bytes"
print_info "Bundle.js size: $(wc -c build/bundle.js | awk '{print $1}') bytes"

# Output a summary of what's in the build directory
echo ""
print_info "Build directory contains these files:"
find build -type f | sort

echo ""
print_success "Final build check complete! Your application is ready for deployment."
print_info "Deploy with 'vercel --prod' or by running './vercel-deploy.sh'"
