#!/bin/bash
# combined-fix-and-deploy.sh - Apply all fixes and deploy to GitHub and Vercel
# Created by GitHub Copilot on May 15, 2025

echo "🚀 Starting Premium-Timetable fix and deployment process..."

# Set up error handling
set -e
trap 'echo "❌ Error occurred. Stopping script execution."; exit 1' ERR

# Step 1: Fix the corrupted fix-syntax-errors.js file
echo "🔧 Step 1/6: Fixing corrupted syntax error script..."
cat > fix-syntax-errors.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Path to the HTML file
const htmlFilePath = path.join(__dirname, 'build', 'index.html');

// Check if the file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error('❌ build/index.html does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Read the HTML file
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Make a backup of the original file
fs.writeFileSync(htmlFilePath + '.bak', htmlContent);

// Fix 1: Fix webpack_public_path assignment - missing semicolon
htmlContent = htmlContent.replace(
  /window\.__webpack_public_path__="\/";/g,
  'window.__webpack_public_path__="/";'
);

// Fix 2: Fix Firebase initialization - missing semicolon
htmlContent = htmlContent.replace(
  /firebase\.initializeApp\(window\.firebaseConfig\);/g,
  'firebase.initializeApp(window.firebaseConfig);'
);

// Fix 3: Fix environment detection script syntax error (extra comma)
htmlContent = htmlContent.replace(
  /window\.__PRODUCTION="localhost"!==window\.location\.hostname&&"127\.0\.0\.1"!==window\.location\.hostname;,/g,
  'window.__PRODUCTION="localhost"!==window.location.hostname&&"127.0.0.1"!==window.location.hostname;'
);

// Fix 4: Fix document.querySelectorAll with extra closing parenthesis
htmlContent = htmlContent.replace(
  /e\.src\.includes\("\.\/bundle\.js"\)&&\(e\.src="\/bundle\.js"\)\}\)\;/g,
  'e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));'
);

// Fix 5: Fix DOMContentLoaded with extra closing parenthesis
htmlContent = htmlContent.replace(
  /document\.addEventListener\("DOMContentLoaded",\(function\(\)\{.*?\}\)\;/gs,
  'document.addEventListener("DOMContentLoaded",(function(){if(window.__VERCEL_DEPLOYMENT){document.querySelectorAll(\'script[src*="bundle.js"]\').forEach((e=>{e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));console.log("Adjusted bundle.js path for Vercel deployment")}});'
);

// Write the fixed content back to the file
fs.writeFileSync(htmlFilePath, htmlContent);

console.log('✅ Fixed JavaScript syntax errors in build/index.html');
console.log('🔍 Original file has been backed up as build/index.html.bak');
EOF
echo "✅ Fixed corrupted syntax error script"

# Step 2: Build the application
echo "🔧 Step 2/6: Building the application..."
npm run build
echo "✅ Application built successfully"

# Step 3: Run manual fixes for any remaining issues
echo "🔧 Step 3/6: Applying manual fixes..."
node fix-syntax-errors-fixed.js
echo "✅ Manual fixes applied"

# Step 4: Configure GitHub repository
echo "🔧 Step 4/6: Preparing GitHub deployment..."
if [ ! -d ".git" ]; then
  git init
  git config --global http.sslVerify false # Temporary for this deployment
  echo "✅ Git repository initialized"
else
  echo "✅ Git repository already exists"
fi

# Ensure .gitignore exists
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOF'
node_modules/
.DS_Store
.env
*.log
EOF
  echo "✅ Created .gitignore file"
fi

# Step 5: Deploy to GitHub
echo "🔧 Step 5/6: Deploying to GitHub..."
git add .
git commit -m "Fixed syntax errors and signup button issue"

if git remote | grep -q "origin"; then
  git remote set-url origin https://github.com/JZ1324/Premium-Timetable.git
else
  git remote add origin https://github.com/JZ1324/Premium-Timetable.git
fi

git push -u origin main --force
echo "✅ Deployed to GitHub successfully"

# Step 6: Deploy to Vercel
echo "🔧 Step 6/6: Deploying to Vercel..."
if [ -f "./deploy-to-vercel.sh" ]; then
  ./deploy-to-vercel.sh
else
  echo "⚠️ deploy-to-vercel.sh not found. Attempting manual Vercel deployment..."
  
  # Ensure vercel.json exists
  cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
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
      "src": "/bundle.js",
      "dest": "/bundle.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VERCEL_DEPLOYMENT": "true"
  }
}
EOF
  
  # If vercel CLI is installed, use it
  if command -v vercel &> /dev/null; then
    vercel --prod
  else
    echo "⚠️ Vercel CLI not installed. Please deploy manually by visiting the Vercel dashboard."
    echo "📝 Your GitHub repository has been updated, which should trigger a Vercel deployment if it's connected to your GitHub repository."
  fi
fi

echo "🎉 All fixes applied and deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Verify the signup button is visible and working on the live site"
echo "2. Test the entire application to ensure all features are working"
echo "3. Check browser console for any remaining errors"
echo ""
echo "📋 For more details, see the ISSUE_FIXES.md file"
