// This script runs after the build process to fix syntax errors in the HTML file
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📝 Running post-build fixes...');

// Run the syntax error fix script
try {
  if (fs.existsSync('./fix-html-js-syntax.js')) {
    require('./fix-html-js-syntax.js');
    console.log('✅ HTML syntax fixes applied successfully');
  } else if (fs.existsSync('./fix-syntax-errors-fixed.js')) {
    require('./fix-syntax-errors-fixed.js');
    console.log('✅ Updated HTML syntax fixes applied');
  } else if (fs.existsSync('./fix-syntax-errors.js')) {
    require('./fix-syntax-errors.js');
    console.log('✅ Original HTML syntax fixes applied');
  } else {
    console.log('⚠️ No HTML syntax fix script found');
  }
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
  
  // Fix _redirects file - make sure it's a file, not a directory
  try {
    // Remove any existing _redirects directory or file
    if (fs.existsSync('build/_redirects')) {
      try {
        fs.unlinkSync('build/_redirects'); // Try to remove as a file
      } catch (e) {
        // If it's a directory, we'll handle it differently
        execSync('rm -rf build/_redirects');
      }
    }
    
    // Create proper _redirects file
    fs.writeFileSync('build/_redirects', '/* /index.html 200\n');
    console.log('✅ Created proper _redirects file in build/');
  } catch (error) {
    console.error('❌ Error creating _redirects file:', error);
  }
  
  // Create .nojekyll file for GitHub Pages
  fs.writeFileSync('build/.nojekyll', '');
  console.log('✅ Created .nojekyll file in build/');
  
} catch (error) {
  console.error('❌ Error copying files:', error);
}

console.log('🎉 Post-build process completed successfully');
