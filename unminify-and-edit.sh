#!/bin/bash
# unminify-and-edit.sh - Unminifies HTML and opens in editor

# Color output
print_info() {
  echo -e "\033[36m[INFO] $1\033[0m"
}

print_success() {
  echo -e "\033[32m[SUCCESS] $1\033[0m"
}

# Check for HTML file
if [ ! -f "build/index.html" ]; then
  print_info "build/index.html not found. Please run the build process first."
  exit 1
fi

# Create a backup
cp build/index.html build/index.html.minified.bak

# Check if we have prettier installed
if ! command -v npx >/dev/null 2>&1; then
  print_info "npx not found. Installing prettier globally..."
  npm install -g prettier
fi

# Unminify HTML
print_info "Unminifying HTML with prettier..."
npx prettier --write build/index.html

# Open in editor (tries VS Code first, then falls back to system default)
print_info "Opening unminified HTML in editor..."
if command -v code >/dev/null 2>&1; then
  code -r build/index.html
elif command -v open >/dev/null 2>&1; then
  open build/index.html
else
  print_info "Could not find editor. Please open build/index.html manually."
fi

print_success "Done! After editing, run the test-deployment.sh script to test your changes."
