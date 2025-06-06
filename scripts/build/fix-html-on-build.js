/**
 * This script is run after the webpack build to make additional adjustments
 * to the generated HTML files, specifically adding path fix scripts
 */

const fs = require('fs');
const path = require('path');

// Configuration
const buildDir = path.join(__dirname, '..', '..', 'build');
const indexHtmlPath = path.join(buildDir, 'index.html');
const pathFixScripts = `
    <!-- Path fix scripts for deployment - must be loaded first -->
    <script src="/path-fix.js"></script>
    <script src="/vercel-path-fix.js"></script>
    <script src="/EnglishTruncationFixDirectGlobal.js"></script>
    <script src="/EnglishTruncationFixStandalone.js"></script>
    <script src="/compatibility-polyfill.js"></script>
    <script src="/webpack-config-override.js"></script>
`;

// Main function
async function fixHtmlOnBuild() {
    console.log('Running post-build HTML fixes...');
    
    try {
        // Check if the build directory and index.html exist
        if (!fs.existsSync(buildDir)) {
            throw new Error(`Build directory doesn't exist: ${buildDir}`);
        }
        
        if (!fs.existsSync(indexHtmlPath)) {
            throw new Error(`Index HTML file doesn't exist: ${indexHtmlPath}`);
        }
        
        // Read the index.html file
        let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // Check if scripts already exist
        if (htmlContent.includes('path-fix.js') && 
            htmlContent.includes('vercel-path-fix.js') && 
            htmlContent.includes('EnglishTruncationFixStandalone.js') &&
            htmlContent.includes('EnglishTruncationFixDirectGlobal.js') &&
            htmlContent.includes('compatibility-polyfill.js') &&
            htmlContent.includes('webpack-config-override.js')) {
            console.log('Required scripts already present in HTML, skipping...');
        } else {
            // Insert the path fix scripts after the head tag
            htmlContent = htmlContent.replace('<head>', '<head>' + pathFixScripts);
            
            // Write the modified content back to the file
            fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
            console.log('Successfully added path fix scripts to index.html');
        }
        
        // Check if required scripts exist in the build directory
        const pathFixScriptPath = path.join(buildDir, 'path-fix.js');
        const vercelPathFixScriptPath = path.join(buildDir, 'vercel-path-fix.js');
        const englishFixScriptPath = path.join(buildDir, 'EnglishTruncationFixStandalone.js');
        
        if (!fs.existsSync(pathFixScriptPath)) {
            console.log('Copying path-fix.js to build directory...');
            const sourcePathFixPath = path.join(__dirname, '..', '..', 'public', 'path-fix.js');
            fs.copyFileSync(sourcePathFixPath, pathFixScriptPath);
        }
        
        if (!fs.existsSync(vercelPathFixScriptPath)) {
            console.log('Copying vercel-path-fix.js to build directory...');
            const sourceVercelPathFixPath = path.join(__dirname, '..', '..', 'public', 'vercel-path-fix.js');
            fs.copyFileSync(sourceVercelPathFixPath, vercelPathFixScriptPath);
        }
        
        if (!fs.existsSync(englishFixScriptPath)) {
            console.log('Copying EnglishTruncationFixStandalone.js to build directory...');
            const sourceEnglishFixPath = path.join(__dirname, '..', '..', 'src', 'utils', 'EnglishTruncationFixStandalone.js');
            if (fs.existsSync(sourceEnglishFixPath)) {
                fs.copyFileSync(sourceEnglishFixPath, englishFixScriptPath);
                console.log('Successfully copied EnglishTruncationFixStandalone.js');
            } else {
                console.error('Source EnglishTruncationFixStandalone.js not found');
            }
        }
        
        // Copy direct global fix
        const directGlobalFixPath = path.join(buildDir, 'EnglishTruncationFixDirectGlobal.js');
        if (!fs.existsSync(directGlobalFixPath)) {
            console.log('Copying EnglishTruncationFixDirectGlobal.js to build directory...');
            const sourceDirectGlobalPath = path.join(__dirname, '..', '..', 'src', 'utils', 'EnglishTruncationFixDirectGlobal.js');
            if (fs.existsSync(sourceDirectGlobalPath)) {
                fs.copyFileSync(sourceDirectGlobalPath, directGlobalFixPath);
                console.log('Successfully copied EnglishTruncationFixDirectGlobal.js');
            } else {
                console.error('Source EnglishTruncationFixDirectGlobal.js not found');
            }
        }
        
        // Copy compatibility polyfill
        const compatibilityPolyfillPath = path.join(buildDir, 'compatibility-polyfill.js');
        if (!fs.existsSync(compatibilityPolyfillPath)) {
            console.log('Copying compatibility-polyfill.js to build directory...');
            const sourcePolyfillPath = path.join(__dirname, '..', '..', 'src', 'compatibility-polyfill.js');
            if (fs.existsSync(sourcePolyfillPath)) {
                fs.copyFileSync(sourcePolyfillPath, compatibilityPolyfillPath);
                console.log('Successfully copied compatibility-polyfill.js');
            } else {
                console.error('Source compatibility-polyfill.js not found');
            }
        }
        
        // Copy webpack config override
        const webpackOverridePath = path.join(buildDir, 'webpack-config-override.js');
        if (!fs.existsSync(webpackOverridePath)) {
            console.log('Copying webpack-config-override.js to build directory...');
            const sourceOverridePath = path.join(__dirname, '..', '..', 'src', 'webpack-config-override.js');
            if (fs.existsSync(sourceOverridePath)) {
                fs.copyFileSync(sourceOverridePath, webpackOverridePath);
                console.log('Successfully copied webpack-config-override.js');
            } else {
                console.error('Source webpack-config-override.js not found');
            }
        }
        
        console.log('Post-build HTML fixes completed successfully.');
    } catch (error) {
        console.error('Error during post-build HTML fixes:', error);
        process.exit(1);
    }
}

// Execute the function
fixHtmlOnBuild();
