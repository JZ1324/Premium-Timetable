#!/bin/zsh

# Script to rebuild and run the application with fixed Firebase configuration

echo "🔧 Rebuilding the application with fixed Firebase configuration..."

# Clean up build cache
rm -rf node_modules/.cache

# Rebuild the application
npm run build

echo "✅ Build complete. Starting the development server..."
echo "📝 Note: If you still see authentication errors, check the browser console for details."

# Start the development server
npm start
