#!/bin/bash
# deploy-fixed-version.sh - Deploy fixed version to Vercel

# Colorful output
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

# Start deployment process
print_header "PREPARING FOR VERCEL DEPLOYMENT"

# Check if build directory exists
if [ ! -d "build" ]; then
  print_error "Build directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if our fixed index.html exists
if [ ! -f "build/fixed-index.html" ]; then
  print_warning "Fixed index.html not found. Using current index.html."
else
  print_info "Using our manually fixed index.html."
  # Backup original index.html if not already backed up
  if [ ! -f "build/index.html.original" ]; then
    cp build/index.html build/index.html.original
  fi
  # Use our fixed version
  cp build/fixed-index.html build/index.html
  print_success "Applied fixed index.html"
fi

# Ensure all necessary files exist in build
print_info "Checking for essential files..."

MISSING_FILES=0
for file in "index.html" "bundle.js" "path-fix.js" "vercel-path-fix.js"; do
  if [ ! -f "build/$file" ]; then
    print_error "$file is missing from build directory!"
    MISSING_FILES=$((MISSING_FILES+1))
    
    # Copy from public if available
    if [ -f "public/$file" ]; then
      print_info "Copying $file from public directory..."
      cp "public/$file" "build/"
      if [ $? -eq 0 ]; then
        print_success "Successfully copied $file"
      else
        print_error "Failed to copy $file"
      fi
    fi
  else
    print_success "$file exists in build directory"
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  print_warning "$MISSING_FILES files were missing or fixed"
else
  print_success "All essential files are present"
fi

# Create necessary deployment files
print_info "Creating deployment support files..."

# Create _redirects file
cat > build/_redirects << EOF
/bundle.js /bundle.js 200
/*.bundle.js /:splat.bundle.js 200
/* /index.html 200
EOF
print_success "Created _redirects file"

# Create .nojekyll file
touch build/.nojekyll
print_success "Created .nojekyll file"

# Create vercel.json in the build directory
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
      "src": "/path-fix.js",
      "dest": "/path-fix.js"
    },
    {
      "src": "/vercel-path-fix.js",
      "dest": "/vercel-path-fix.js"
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
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF
print_success "Created vercel.json in build directory"

print_header "DEPLOYMENT READY"
print_info "The build is now ready for deployment to Vercel."
print_info ""
print_info "Deploy with one of these commands:"
print_info "1. vercel --prod                   # If Vercel CLI is installed"
print_info "2. npx vercel --prod               # Using npx"
print_info ""
print_info "Or run this to test locally first:"
print_info "cd build && python3 -m http.server 3333"
print_info ""
print_success "Deployment preparation complete!"
