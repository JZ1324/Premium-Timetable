#!/bin/bash
set -e

# Display versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build with webpack directly
echo "🔨 Building with webpack..."
node_modules/.bin/webpack --mode production

# Create a .nojekyll file
echo "📄 Creating .nojekyll file..."
touch build/.nojekyll

# Echo success message
echo "✅ Build completed successfully!"
