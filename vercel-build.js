#!/usr/bin/env node

/**
 * Custom build script for Vercel deployment
 * This script runs webpack directly instead of relying on react-scripts
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('📦 Starting custom Vercel build process...');
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);

try {
  // Install dependencies
  console.log('🔧 Installing dependencies...');
  execSync('npm install', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Make sure webpack is installed
  console.log('🔍 Checking for webpack...');
  try {
    require.resolve('webpack/bin/webpack.js');
    console.log('✅ Webpack found!');
  } catch (error) {
    console.log('⚠️ Webpack not found in node_modules, installing...');
    execSync('npm install webpack webpack-cli --no-save', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }

  // Execute webpack build
  console.log('🔨 Running webpack build...');
  execSync('node ./node_modules/.bin/webpack --mode production', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Create .nojekyll file to prevent GitHub Pages processing (just in case)
  console.log('📄 Creating .nojekyll file...');
  execSync('touch build/.nojekyll', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
