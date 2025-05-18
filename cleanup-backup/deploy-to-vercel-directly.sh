#!/bin/bash
# deploy-to-vercel.sh - Deploy existing build folder to Vercel

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Check if build directory exists and has required files
if [ ! -d "build" ] || [ ! -f "build/index.html" ] || [ ! -f "build/bundle.js" ]; then
  echo "❌ Build directory is missing or incomplete."
  echo "   Run 'npm run build' first."
  exit 1
fi

# Run the verification script to ensure all issues are fixed
echo "🔍 Verifying build output..."
bash verify-build.sh

if [ $? -ne 0 ]; then
  echo "❌ Build verification failed. Please fix issues before deploying."
  exit 1
fi

# Create Vercel configuration if not exists
if [ ! -f "vercel.json" ]; then
  echo "📝 Creating vercel.json..."
  cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/bundle.js",
      "dest": "/build/bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/bundle.js\\?v=.*",
      "dest": "/build/bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/(\\d+)\\.bundle\\.js",
      "dest": "/build/$1.bundle.js",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "application/javascript; charset=utf-8"
      }
    },
    {
      "src": "/static/(.*)",
      "dest": "/build/static/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/build/assets/$1"
    },
    {
      "src": "/path-fix.js",
      "dest": "/build/path-fix.js"
    },
    {
      "src": "/vercel-path-fix.js",
      "dest": "/build/vercel-path-fix.js"
    },
    {
      "src": "/favicon.ico",
      "dest": "/build/favicon.ico"
    },
    {
      "src": "/(.*)",
      "dest": "/build/index.html"
    }
  ]
}
EOF
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel deploy --prod

# Provide instructions for checking deployment
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check your Vercel dashboard for deployment status"
echo "2. Once deployed, verify the site works correctly"
echo "3. If there are any issues, check browser console for errors"
echo ""
echo "👀 Remember to check for the 'Unexpected token <' error in the browser console"
echo "   If it appears, you may need to run the fix scripts again and redeploy."
