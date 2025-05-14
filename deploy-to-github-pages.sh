#!/bin/zsh

# GitHub Pages Deployment Script
# This script automates the process of deploying to GitHub Pages

echo "🚀 Starting GitHub Pages deployment process..."

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

# Determine deployment method
echo "🤔 How would you like to deploy?"
echo "1) Using gh-pages npm package (recommended)"
echo "2) Using git subtree push"
echo "3) Cancel deployment"
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo "🚀 Deploying using gh-pages package..."
    npx gh-pages -d build -m "Deploy timetable application to GitHub Pages"
    
    if [ $? -eq 0 ]; then
      echo "✅ Deployment successful! Your site should be available at https://jz1324.github.io/timetables/"
      echo "Note: It may take a few minutes for the changes to propagate."
    else
      echo "❌ Deployment failed. Please check the error messages above."
    fi
    ;;
    
  2)
    echo "🚀 Deploying using git subtree push..."
    
    # Create a temporary branch
    git checkout -b gh-pages-temp
    
    # Add the build folder
    git add -f build/
    
    # Commit the changes
    git commit -m "Deploy to GitHub Pages"
    
    # Push the subtree to the gh-pages branch
    git subtree push --prefix build origin gh-pages
    
    # Return to main branch
    git checkout main
    git branch -D gh-pages-temp
    
    echo "✅ Deployment initiated! Your site should be available at https://jz1324.github.io/timetables/"
    echo "Note: It may take a few minutes for the changes to propagate."
    ;;
    
  3)
    echo "🛑 Deployment cancelled."
    exit 0
    ;;
    
  *)
    echo "❌ Invalid choice. Deployment cancelled."
    exit 1
    ;;
esac

echo "📝 Done! If you encounter any issues, refer to COMPLETE_GITHUB_PAGES_GUIDE.md"
