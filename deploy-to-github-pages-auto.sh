#!/bin/zsh

# Automated GitHub Pages deployment script
# This script automates the process of deploying to GitHub Pages without interactive prompts

echo "🚀 Starting GitHub Pages automated deployment process..."

# Ensure we're working with the latest code
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# Create .nojekyll file to prevent Jekyll processing
echo "📄 Creating .nojekyll file..."
touch build/.nojekyll

# Deploy using gh-pages
echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d build -m "Deploy timetable app to GitHub Pages"

# Check if deployment succeeded
if [ $? -ne 0 ]; then
  echo "❌ Deployment failed."
  exit 1
fi

echo "✅ Deployment successful!"
echo "📊 Your site will be available at: https://jz1324.github.io/Premium-Timetable/"
echo "⏱️ It may take a few minutes for the changes to propagate."

# Offer to check deployment status
echo "🔍 Do you want to check deployment status? (y/n)"
read check_status

if [[ $check_status == "y" || $check_status == "Y" ]]; then
  echo "Checking deployment status..."
  ./check-github-pages-health.sh
fi

echo "Done! 🎉"
