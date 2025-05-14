/**
 * Enhanced Vercel build script with path fixes
 * This script ensures proper loading of bundle.js in a Vercel environment 
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Output colored logs
const log = {
  info: (msg) => console.log('\x1b[36m%s\x1b[0m', `[INFO] ${msg}`),
  success: (msg) => console.log('\x1b[32m%s\x1b[0m', `[SUCCESS] ${msg}`),
  warning: (msg) => console.log('\x1b[33m%s\x1b[0m', `[WARNING] ${msg}`),
  error: (msg) => console.log('\x1b[31m%s\x1b[0m', `[ERROR] ${msg}`)
};

// Build directory
const BUILD_DIR = path.join(__dirname, 'build');

// Log environment info
log.info(`Node.js version: ${process.version}`);
log.info(`Working directory: ${process.cwd()}`);
log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
log.info(`Vercel: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);

/**
 * Run the webpack build
 */
function runBuild() {
  log.info('Running webpack build...');
  try {
    execSync('NODE_ENV=production webpack --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', VERCEL: '1' }
    });
    log.success('Webpack build completed successfully');
    return true;
  } catch (error) {
    log.error(`Build failed: ${error.message}`);
    return false;
  }
}

/**
 * Fix paths in the built HTML file
 */
function fixPaths() {
  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    log.error(`index.html not found at: ${indexHtmlPath}`);
    return false;
  }
  
  log.info('Fixing paths in index.html...');
  
  try {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Fix bundle.js path
    html = html.replace(/src="\.\/bundle\.js"/g, 'src="/bundle.js"');
    
    // Fix Firebase storage bucket if needed
    html = html.replace(/timetable-28639\.firebasestorage\.app/g, 'timetable-28639.appspot.com');
    
    // Add Vercel deployment detection if not present
    if (!html.includes('__VERCEL_DEPLOYMENT')) {
      html = html.replace('</head>', `<script>window.__VERCEL_DEPLOYMENT = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('now.sh');</script></head>`);
    }
    
    fs.writeFileSync(indexHtmlPath, html);
    log.success('index.html paths fixed successfully');
    return true;
  } catch (error) {
    log.error(`Failed to fix paths: ${error.message}`);
    return false;
  }
}

/**
 * Create necessary files for proper routing
 */
function createRoutingFiles() {
  log.info('Creating routing files...');
  
  try {
    // Create _redirects file for Netlify-compatible hosting
    fs.writeFileSync(path.join(BUILD_DIR, '_redirects'), 
      '/bundle.js /bundle.js 200\n' +
      '/*.bundle.js /:splat.bundle.js 200\n' +
      '/* /index.html 200'
    );
    log.success('Created _redirects file');
    
    // Create .nojekyll file to prevent GitHub Pages processing 
    fs.writeFileSync(path.join(BUILD_DIR, '.nojekyll'), '');
    log.success('Created .nojekyll file');
    
    // Create Vercel routing config
    fs.writeFileSync(path.join(BUILD_DIR, 'vercel.json'), JSON.stringify({
      "version": 2,
      "routes": [
        { "src": "/bundle.js", "dest": "/bundle.js" },
        { "src": "/(\\d+)\\.bundle\\.js", "dest": "/$1.bundle.js" },
        { "src": "/static/(.*)", "dest": "/static/$1" },
        { "src": "/assets/(.*)", "dest": "/assets/$1" },
        { "src": "/favicon.ico", "dest": "/favicon.ico" },
        { "src": "/(.*)", "dest": "/index.html" }
      ]
    }, null, 2));
    log.success('Created vercel.json file in build directory');
    
    return true;
  } catch (error) {
    log.error(`Failed to create routing files: ${error.message}`);
    return false;
  }
}

/**
 * Main build process
 */
async function main() {
  log.info('Starting enhanced Vercel build process...');
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  
  // Run webpack build
  if (!runBuild()) {
    process.exit(1);
  }
  
  // Fix paths in HTML
  if (!fixPaths()) {
    log.warning('Path fixing had errors, but continuing...');
  }
  
  // Create routing files
  if (!createRoutingFiles()) {
    log.warning('Creating routing files had errors, but continuing...');
  }
  
  log.success('Build process completed successfully!');
}

// Run the main function
main().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
