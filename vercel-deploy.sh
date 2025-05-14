#!/bin/bash
set -e

# Vercel deploy script with path fixes
echo "🚀 Starting Vercel deployment process..."

# Ensure we're using proper Firebase version
echo "📦 Checking Firebase version in package.json..."
if grep -q '"firebase": "^11.7.1"' package.json; then
  echo "✅ Firebase 11.7.1 configured correctly"
else
  echo "❌ Firebase version needs to be updated, fixing..."
  sed -i '' 's/"firebase": *"[^"]*"/"firebase": "^11.7.1"/g' package.json
fi

# Use our enhanced build script for Vercel
echo "🔨 Running enhanced build process..."
export NODE_ENV=production 
export VERCEL=1
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please check the logs."
  exit 1
fi

echo "✅ Build successful!"

# Run the final build check
echo "🔍 Running final build check and fixes..."
./final-build-check.sh

echo "✅ Vercel deployment preparation complete!"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Run the test server first with './test-deployment.sh'"
echo "2. If everything works locally, deploy to Vercel with 'vercel --prod'"
echo ""
