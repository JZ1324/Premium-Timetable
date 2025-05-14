#!/bin/bash
# check-deployment.sh
# This script checks if a deployed URL correctly serves bundle.js

# Set variables
DEFAULT_URL="https://your-vercel-app.vercel.app"
VERBOSE=true

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

# Get deployment URL from command line argument or use default
DEPLOYMENT_URL=${1:-$DEFAULT_URL}

print_info "Checking deployment: $DEPLOYMENT_URL"
print_info "This tool will verify your deployment serves bundle.js correctly"
echo ""

# 1. Check if the site responds at all
print_info "Testing basic connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

if [ $HTTP_CODE -ne 200 ]; then
  print_error "Could not connect to $DEPLOYMENT_URL (HTTP code: $HTTP_CODE)"
  exit 1
else
  print_success "Site is responding at $DEPLOYMENT_URL"
fi

# 2. Check if index.html loads and contains expected content
print_info "Checking index.html content..."
INDEX_CONTENT=$(curl -s "$DEPLOYMENT_URL")

if ! echo "$INDEX_CONTENT" | grep -q "bundle.js"; then
  print_error "Could not find bundle.js reference in index.html"
  exit 1
else
  print_success "index.html contains bundle.js reference"
  
  # Extract bundle.js path
  BUNDLE_PATH=$(echo "$INDEX_CONTENT" | grep -o 'src="[^"]*bundle.js[^"]*"' | sed 's/src="//;s/"$//')
  
  if [ -z "$BUNDLE_PATH" ]; then
    print_error "Failed to extract bundle.js path from HTML"
    exit 1
  else
    print_info "Detected bundle.js path: $BUNDLE_PATH"
  fi
fi

# 3. Check if bundle.js loads
if [[ "$BUNDLE_PATH" == /* ]]; then
  # Absolute path
  BUNDLE_URL="${DEPLOYMENT_URL}${BUNDLE_PATH}"
else
  # Relative path
  BUNDLE_URL="${DEPLOYMENT_URL}/${BUNDLE_PATH}"
fi

print_info "Checking if bundle.js loads from: $BUNDLE_URL"
BUNDLE_RESPONSE=$(curl -s -I "$BUNDLE_URL")
BUNDLE_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BUNDLE_URL")

if [ $BUNDLE_HTTP_CODE -ne 200 ]; then
  print_error "bundle.js returns HTTP code $BUNDLE_HTTP_CODE"
  print_error "This is likely the cause of the 'Unexpected token <' error!"
  
  # Show the first few lines of the response
  print_warning "First few lines of bundle.js response:"
  curl -s "$BUNDLE_URL" | head -n 5
  echo ""
  
  print_info "Troubleshooting tips:"
  echo "1. Check if bundle.js is being redirected to index.html (common error)"
  echo "2. Verify Vercel routes configuration in vercel.json"
  echo "3. Make sure your path-fix scripts are working"
  exit 1
else
  print_success "bundle.js loads successfully (HTTP 200)"
  
  # Check content type
  CONTENT_TYPE=$(echo "$BUNDLE_RESPONSE" | grep -i "content-type" | head -n 1)
  if ! echo "$CONTENT_TYPE" | grep -qi "javascript"; then
    print_warning "bundle.js has unexpected Content-Type: $CONTENT_TYPE"
    print_warning "It should contain 'javascript' in the Content-Type"
  else
    print_success "bundle.js has correct Content-Type: $CONTENT_TYPE"
  fi
  
  # Test first few bytes to see if it's JavaScript
  if $VERBOSE; then
    print_info "First 80 bytes of bundle.js:"
    curl -s "$BUNDLE_URL" | head -c 80
    echo ""
  fi
fi

# 4. Check if path-fix.js and vercel-path-fix.js load
for FIX_SCRIPT in "path-fix.js" "vercel-path-fix.js"; do
  print_info "Checking if $FIX_SCRIPT loads..."
  FIX_SCRIPT_URL="${DEPLOYMENT_URL}/${FIX_SCRIPT}"
  FIX_SCRIPT_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FIX_SCRIPT_URL")
  
  if [ $FIX_SCRIPT_HTTP_CODE -ne 200 ]; then
    print_warning "$FIX_SCRIPT returns HTTP code $FIX_SCRIPT_HTTP_CODE"
    print_warning "This could cause bundle.js path fixing to fail"
  else
    print_success "$FIX_SCRIPT loads successfully"
  fi
done

echo ""
print_success "Deployment check complete!"
print_info "If all checks passed, your site should be working correctly."
print_info "If any checks failed, see VERCEL_DEPLOYMENT_GUIDE.md for troubleshooting."
