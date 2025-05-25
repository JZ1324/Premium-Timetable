#!/bin/bash
# manual-html-fix.sh - Manually fixes JavaScript syntax errors in build/index.html

# Color output functions
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

# Make sure build/index.html exists
if [ ! -f "build/index.html" ]; then
  print_error "build/index.html not found! Run the build process first."
  exit 1
fi

# Create a backup of the original file
print_info "Creating backup of original index.html..."
cp build/index.html build/index.html.before-fix.bak
print_success "Backup created: build/index.html.before-fix.bak"

# Fix 1: ';' expected around column 751 (webpack_public_path__)
print_info "Fixing missing semicolon after webpack_public_path__..."
sed -i.bak 's/window.__webpack_public_path__="\/"/window.__webpack_public_path__="\/";/g' build/index.html

# Fix 2: '¡' expected around column 1115 (firebase initialization)
print_info "Fixing missing semicolon after Firebase initialization..."
sed -i.bak 's/firebase.initializeApp(window.firebaseConfig)/firebase.initializeApp(window.firebaseConfig);/g' build/index.html

# Fix 3: ';' expected around column 1844 (in the environment detection script)
print_info "Fixing environment detection script..."
sed -i.bak 's/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;/g' build/index.html

# Fix 4: Add missing semicolons at end of script blocks
print_info "Adding missing semicolons at the end of script blocks..."
sed -i.bak 's/}<\/script>/<\/script>/g' build/index.html
sed -i.bak 's/})<\/script>/});<\/script>/g' build/index.html
sed -i.bak 's/}))<\/script>/}));<\/script>/g' build/index.html

# Clean up backup files
rm -f build/index.html.bak

print_success "Manual fixes applied to build/index.html"
print_info "Next steps:"
print_info "1. Verify the changes in your editor"
print_info "2. Run the test-deployment.sh script to test locally"
print_info "3. Deploy to Vercel if everything looks good"
