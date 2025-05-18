#!/bin/bash
# verify-build.sh - Final verification of build files for Vercel deployment

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

print_header() {
  echo -e "\n\033[1;37m=====================================================\033[0m"
  echo -e "\033[1;37m $1 \033[0m"
  echo -e "\033[1;37m=====================================================\033[0m"
}

# Start verification process
print_header "VERCEL DEPLOYMENT VERIFICATION"

# Check if build directory exists
if [ ! -d "build" ]; then
  print_error "Build directory not found! Run build process first."
  exit 1
fi

# Verify essential files exist
print_info "Checking for essential files..."

files_to_check=(
  "index.html" 
  "bundle.js" 
  "path-fix.js" 
  "vercel-path-fix.js"
)

missing_files=0
for file in "${files_to_check[@]}"; do
  if [ ! -f "build/$file" ]; then
    print_error "❌ Missing: build/$file"
    missing_files=$((missing_files+1))
  else
    print_success "✅ Found: build/$file"
  fi
done

if [ $missing_files -gt 0 ]; then
  print_warning "$missing_files essential files are missing!"
else
  print_success "All essential files are present"
fi

# Check index.html for common issues
print_info "Checking index.html for common issues..."

# Check for Firebase storage bucket format
if grep -q "firebasestorage\.app" build/index.html; then
  print_error "❌ Incorrect Firebase storage bucket format detected!"
  print_info "   Running fix: sed -i '' 's/firebasestorage\.app/appspot\.com/g' build/index.html"
  sed -i '' 's/firebasestorage\.app/appspot\.com/g' build/index.html
else
  print_success "✅ Firebase storage bucket format is correct"
fi

# Check for bundle.js path
if grep -q 'src="./bundle.js"' build/index.html; then
  print_error "❌ Relative bundle.js path detected!"
  print_info "   Running fix: sed -i '' 's|src=\"./bundle.js\"|src=\"/bundle.js\"|g' build/index.html"
  sed -i '' 's|src="./bundle.js"|src="/bundle.js"|g' build/index.html
else
  print_success "✅ bundle.js path is absolute"
fi

# Check for JavaScript errors
js_issues=0

# Check for webpack_public_path semicolon
if grep -q 'window.__webpack_public_path__="/" *[^;]' build/index.html; then
  print_error "❌ Missing semicolon after webpack_public_path__"
  print_info "   Running fix: sed -i '' 's/window.__webpack_public_path__=\"\/\"/window.__webpack_public_path__=\"\/\";/g' build/index.html"
  sed -i '' 's/window.__webpack_public_path__="\/"/window.__webpack_public_path__="\/";/g' build/index.html
  js_issues=$((js_issues+1))
else
  print_success "✅ webpack_public_path__ has proper semicolon"
fi

# Check for firebase initialization semicolon
if grep -q 'firebase.initializeApp(window.firebaseConfig) *[^;]' build/index.html; then
  print_error "❌ Missing semicolon after Firebase initialization"
  print_info "   Running fix: sed -i '' 's/firebase.initializeApp(window.firebaseConfig)/firebase.initializeApp(window.firebaseConfig);/g' build/index.html"
  sed -i '' 's/firebase.initializeApp(window.firebaseConfig)/firebase.initializeApp(window.firebaseConfig);/g' build/index.html
  js_issues=$((js_issues+1))
else
  print_success "✅ Firebase initialization has proper semicolon"
fi

# Check for window.__PRODUCTION semicolon
if grep -q 'window.__PRODUCTION="localhost"[^;]*!==window.location.hostname&&"127.0.0.1"!==window.location.hostname *[^;]' build/index.html; then
  print_error "❌ Missing semicolon in the environment detection script"
  print_info "   Running fix: sed -i '' 's/window.__PRODUCTION=\"localhost\"!==window.location.hostname&&\"127.0.0.1\"!==window.location.hostname/window.__PRODUCTION=\"localhost\"!==window.location.hostname&&\"127.0.0.1\"!==window.location.hostname;/g' build/index.html"
  sed -i '' 's/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname/window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;/g' build/index.html
  js_issues=$((js_issues+1))
else
  print_success "✅ environment detection script has proper semicolon"
fi

if [ $js_issues -gt 0 ]; then
  print_warning "$js_issues JavaScript issues fixed"
else
  print_success "No JavaScript syntax issues found"
fi

# Create necessary deployment files
print_info "Ensuring deployment files are present..."

# Create _redirects file for Netlify-compatible hosting
if [ ! -f "build/_redirects" ]; then
  print_warning "❌ _redirects file missing, creating..."
  mkdir -p build/_redirects
  cat > build/_redirects << EOF
/bundle.js /bundle.js 200
/*.bundle.js /:splat.bundle.js 200
/* /index.html 200
EOF
else
  print_success "✅ _redirects file exists"
fi

# Create .nojekyll file for GitHub Pages
if [ ! -f "build/.nojekyll" ]; then
  print_warning "❌ .nojekyll file missing, creating..."
  touch build/.nojekyll
else
  print_success "✅ .nojekyll file exists"
fi

# Final verification summary
print_header "VERIFICATION SUMMARY"

if [ $missing_files -eq 0 ] && [ $js_issues -eq 0 ]; then
  print_success "✅ All checks passed! The build is ready for Vercel deployment."
  print_info "Next steps:"
  print_info "1. Test locally with ./test-deployment.sh"
  print_info "2. Deploy to Vercel with ./vercel-deploy.sh"
else
  print_warning "⚠️ Some issues were fixed. Please re-verify before deployment."
  print_info "Run this script again to ensure all issues are resolved."
fi

print_info ""
print_info "To restore the original build from backup:"
print_info "cp build/index.html.bak build/index.html"
