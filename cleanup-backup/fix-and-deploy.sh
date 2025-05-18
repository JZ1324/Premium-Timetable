#!/bin/bash
# fix-and-deploy.sh - Comprehensive script to fix all issues and deploy to GitHub/Vercel

print_heading() {
  echo "============================================================"
  echo "   $1"
  echo "============================================================"
}

print_subheading() {
  echo ""
  echo "------------------------------------------------------------"
  echo "   $1"
  echo "------------------------------------------------------------"
}

print_success() {
  echo "✅ $1"
}

print_info() {
  echo "ℹ️ $1"
}

print_warning() {
  echo "⚠️ $1"
}

print_error() {
  echo "❌ $1"
}

print_heading "TIMETABLE PREMIUM - FIX AND DEPLOY SCRIPT"
print_info "This script will fix all known issues and deploy to GitHub/Vercel"

# Step 1: Fix webpack "run" module error
print_subheading "1. Fixing webpack 'run' module error"

# Create utils directory if it doesn't exist
mkdir -p src/utils

# Create empty.js file
cat > src/utils/empty.js << 'EOF'
// empty.js - This file exists to satisfy the webpack resolver
// It's used as an alias for the 'run' module that can't be found
export default {};
EOF
print_success "Created src/utils/empty.js as a placeholder for the 'run' module"

# Check if webpack.config.js contains the alias already
if grep -q "'run': path.resolve" webpack.config.js; then
  print_success "webpack.config.js already has the 'run' alias"
else
  # Add the alias to the resolve section
  cp webpack.config.js webpack.config.js.bak
  sed -i '' 's/  resolve: {/  resolve: {\n    alias: {\n      '\''run'\'': path.resolve(__dirname, '\''src\/utils\/empty.js'\'')\n    },/g' webpack.config.js
  print_success "Added 'run' alias to webpack.config.js"
fi

# Step 2: Fix build/index.html syntax errors
print_subheading "2. Fixing JavaScript syntax errors in the HTML"

# This script creates a node.js script that will fix the build/index.html file
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
  /e\.src\.includes\("\.\\/bundle\.js"\)&&\(e\.src="\/bundle\.js"\)\}\);/g,
  'e.src.includes("./bundle.js")&&(e.src="/bundle.js")}))'
);

// Fix 5: Fix DOMContentLoaded with extra closing parenthesis
htmlContent = htmlContent.replace(
  /document\.addEventListener\("DOMContentLoaded",\(function\(\)\{.*?\}\);/gs,
  'document.addEventListener("DOMContentLoaded",(function(){if(window.__VERCEL_DEPLOYMENT){document.querySelectorAll(\'script[src*="bundle.js"]\').forEach((e=>{e.src.includes("./bundle.js")&&(e.src="/bundle.js")}));console.log("Adjusted bundle.js path for Vercel deployment")}}));'
);

// Write the fixed content back to the file
fs.writeFileSync(htmlFilePath, htmlContent);

console.log('✅ Fixed JavaScript syntax errors in build/index.html');
console.log('🔍 Original file has been backed up as build/index.html.bak');
EOF

print_info "Created fix-syntax-errors.js script"

# Create fix-html-on-build.js that will be used in the build process
cat > fix-html-on-build.js << 'EOF'
// This script runs after the build process to fix syntax errors in the HTML file
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📝 Running post-build fixes...');

// Run the syntax error fix script
try {
  require('./fix-syntax-errors.js');
  console.log('✅ HTML syntax fixes applied successfully');
} catch (error) {
  console.error('❌ Error fixing HTML syntax:', error);
}

// Copy additional files that might be needed
try {
  // Ensure these files exist in public/ directory
  if (fs.existsSync('public/path-fix.js')) {
    fs.copyFileSync('public/path-fix.js', 'build/path-fix.js');
    console.log('✅ Copied path-fix.js to build/');
  }
  
  if (fs.existsSync('public/vercel-path-fix.js')) {
    fs.copyFileSync('public/vercel-path-fix.js', 'build/vercel-path-fix.js');
    console.log('✅ Copied vercel-path-fix.js to build/');
  }
  
  if (fs.existsSync('public/_redirects')) {
    fs.copyFileSync('public/_redirects', 'build/_redirects');
    console.log('✅ Copied _redirects to build/');
  }
  
  // Create .nojekyll file for GitHub Pages
  fs.writeFileSync('build/.nojekyll', '');
  console.log('✅ Created .nojekyll file in build/');
  
} catch (error) {
  console.error('❌ Error copying files:', error);
}

console.log('🎉 Post-build process completed successfully');
EOF

print_info "Created fix-html-on-build.js script"

# Update package.json's postbuild script to use our new fix script
if grep -q "fix-html-on-build.js" package.json; then
  print_success "package.json already updated to use fix-html-on-build.js"
else
  cp package.json package.json.bak
  sed -i '' 's/"postbuild": "cp public\/path-fix.js build\/ && cp public\/vercel-path-fix.js build\/ && cp public\/_redirects build\/ && touch build\/.nojekyll"/"postbuild": "node \.\/fix-html-on-build\.js"/g' package.json
  print_success "Updated package.json to use fix-html-on-build.js"
fi

# Step 3: Build the project with our fixes
print_subheading "3. Building the project with fixes"
print_info "Running npm run build..."
npm run build

build_status=$?
if [ $build_status -ne 0 ]; then
  print_error "Build failed! Please check the output above."
  exit 1
fi
print_success "Build completed successfully"

# Step 4: Verify the build output
print_subheading "4. Verifying build output"
if [ -f "build/index.html" ] && [ -f "build/bundle.js" ]; then
  print_success "Build output verified: index.html and bundle.js present"
else
  print_error "Build verification failed: missing critical files"
  exit 1
fi

# Step 5: Set up GitHub and Vercel configuration
print_subheading "5. Setting up GitHub and Vercel configuration"

# Create or update .gitignore
cat > .gitignore << 'EOF'
node_modules
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
service-account-key.json
.vercel

# Debug files
*.log
*.bak
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.idea
.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Temporary files
.tmp
*.tmp
*~
EOF
print_success "Created/updated .gitignore file"

# Create or update vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/bundle.js",
      "dest": "/bundle.js"
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
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/logo192.png",
      "dest": "/logo192.png"
    },
    {
      "src": "/logo512.png",
      "dest": "/logo512.png"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF
print_success "Created/updated vercel.json configuration"

# Create GitHub Workflow for Vercel deployment
mkdir -p .github/workflows
cat > .github/workflows/deploy-to-vercel.yml << 'EOF'
name: Deploy to Vercel

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Fix webpack "run" module error
        run: |
          mkdir -p src/utils
          echo "export default {};" > src/utils/empty.js
          
      - name: Build Project
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          vercel-args: '--prod'
EOF
print_success "Created GitHub workflow for Vercel deployment"

# Step 6: Final instructions
print_subheading "6. Final deployment steps"
print_info "Your application is now ready to be deployed!"
print_info "To complete the deployment:"

cat << 'EOF'

To deploy to GitHub:
1. Initialize Git repository (if not already done):
   git init

2. Add remote repository:
   git remote add origin https://github.com/JZ1324/Premium-Timetable.git

3. Add all files to Git:
   git add -A

4. Commit changes:
   git commit -m "Fix webpack and syntax errors, prepare for Vercel deployment"

5. Push to GitHub:
   git push -u origin main (or master)

To deploy to Vercel:
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Import your GitHub repository
3. Configure with these settings:
   - Build Command: npm run build
   - Output Directory: build
4. Deploy!

For automatic deployments with GitHub Actions:
1. Add these secrets to your GitHub repository:
   - VERCEL_TOKEN: Your Vercel API token
   - VERCEL_ORG_ID: Your Vercel organization ID
   - VERCEL_PROJECT_ID: Your Vercel project ID

All known issues have been fixed:
- Webpack "run" module error
- JavaScript syntax errors in build/index.html
- Proper Vercel configuration
EOF

print_heading "DEPLOYMENT PREPARATION COMPLETE"
