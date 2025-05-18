#!/bin# Clean up any existing build
rm -rf build-test
mkdir -p build-test

# Build the project with our enhanced build process
echo "🔨 Building project for testing..."
NODE_ENV=production VERCEL=1 node vercel.build.js

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix the errors before deploying."
  exit 1
fi

# Run final build check and fixes
echo "🔍 Running final build checks and fixes..."
./final-build-check.sh

# Copy build to test directory
echo "📦 Copying build to test directory..."
cp -r build/* build-test/ript to verify if the build is ready for deployment
# This helps ensure that the bundle.js path issue is fixed

echo "🧪 Starting deployment test..."

# Clean up any existing build
rm -rf build-test
mkdir -p build-test

# Build the project with our enhanced build script
echo "🔨 Building project for testing..."
NODE_ENV=production VERCEL=1 node vercel.build.js

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix the errors before deploying."
  exit 1
fi

# Copy build to test directory
cp -r build/* build-test/

# Create a simple server script with enhanced path fixers
cat > build-test/server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Additional console output for debugging
const verbose = true;

function log(message) {
  if (verbose) {
    console.log(message);
  }
}

const server = http.createServer((req, res) => {
  log(`Request: ${req.method} ${req.url}`);
  
  // Handle redirects for SPA
  if (req.url !== '/' && !req.url.includes('.')) {
    log(`SPA route detected: ${req.url} -> /index.html`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
    return;
  }
  
  // Normalize the URL
  let url = req.url === '/' ? '/index.html' : req.url;
  
  // Fix common bundle.js path issues
  if (url.includes('bundle.js')) {
    // If using relative path ./bundle.js, fix it
    if (url.includes('./bundle.js')) {
      const fixedUrl = url.replace('./bundle.js', '/bundle.js');
      log(`Fixed bundle path: ${url} -> ${fixedUrl}`);
      url = fixedUrl;
    }
    
    // If it's still not /bundle.js, try that
    if (url !== '/bundle.js' && !url.match(/\/\d+\.bundle\.js/)) {
      log(`Attempting to serve canonical bundle path: /bundle.js`);
      url = '/bundle.js';
    }
  }
  
  // Resolve the file path
  const filePath = path.join(__dirname, url);
  log(`Resolved path: ${filePath}`);
  
  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Set the content type
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      log(`File not found: ${filePath}`);
      
      // Bundle.js special handling
      if (url.includes('bundle.js')) {
        // Try all possible locations of bundle.js
        const possiblePaths = [
          path.join(__dirname, 'bundle.js'),
          path.join(__dirname, '/bundle.js'),
          path.join(__dirname, './bundle.js')
        ];
        
        for (const possiblePath of possiblePaths) {
          try {
            if (fs.existsSync(possiblePath)) {
              log(`Found bundle at alternative location: ${possiblePath}`);
              res.writeHead(200, { 'Content-Type': contentType });
              fs.createReadStream(possiblePath).pipe(res);
              return;
            }
          } catch (error) {
            log(`Error checking path ${possiblePath}: ${error.message}`);
          }
        }
      }
      
      // If all fallbacks fail, return 404
      log(`Resource not found after all fallbacks: ${url}`);
      res.writeHead(404);
      res.end(`File not found: ${url}`);
      return;
    }
    
    // If the file exists, return it
    log(`Serving: ${filePath} (${contentType})`);
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// Track requests for debugging
let requestCount = 0;
server.on('request', () => {
  requestCount++;
  if (requestCount % 10 === 0) {
    log(`Processed ${requestCount} requests`);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`
----------------------------------------------------------
🔍 TESTING INSTRUCTIONS:
1. Open http://localhost:${PORT}/ in your browser
2. Check the browser console for any errors
   - Look specifically for "Unexpected token '<'" errors
3. Check this terminal for any 404 errors or path issues
4. Press Ctrl+C to stop the server when done testing
----------------------------------------------------------
  `);
});
EOF

# Start the test server
echo "🚀 Starting test server on http://localhost:3333"
cd build-test && node server.js
