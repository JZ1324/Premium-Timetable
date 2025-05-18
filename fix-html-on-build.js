/**
 * This script is run after the webpack build to make additional adjustments
 * to the generated HTML files, specifically adding path fix scripts
 */

const fs = require('fs');
const path = require('path');

// Configuration
const buildDir = path.join(__dirname, 'build');
const indexHtmlPath = path.join(buildDir, 'index.html');
const pathFixScripts = `
    <!-- Path fix scripts for deployment - must be loaded first -->
    <script src="/path-fix.js"></script>
    <script src="/vercel-path-fix.js"></script>
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
        
        // Check if path-fix scripts already exist
        if (htmlContent.includes('path-fix.js') && htmlContent.includes('vercel-path-fix.js')) {
            console.log('Path fix scripts already present in HTML, skipping...');
        } else {
            // Insert the path fix scripts after the head tag
            htmlContent = htmlContent.replace('<head>', '<head>' + pathFixScripts);
            
            // Write the modified content back to the file
            fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
            console.log('Successfully added path fix scripts to index.html');
        }
        
        // Check if path-fix.js and vercel-path-fix.js exist in the build directory
        const pathFixScriptPath = path.join(buildDir, 'path-fix.js');
        const vercelPathFixScriptPath = path.join(buildDir, 'vercel-path-fix.js');
        
        if (!fs.existsSync(pathFixScriptPath)) {
            console.log('Copying path-fix.js to build directory...');
            const sourcePathFixPath = path.join(__dirname, 'public', 'path-fix.js');
            fs.copyFileSync(sourcePathFixPath, pathFixScriptPath);
        }
        
        if (!fs.existsSync(vercelPathFixScriptPath)) {
            console.log('Copying vercel-path-fix.js to build directory...');
            const sourceVercelPathFixPath = path.join(__dirname, 'public', 'vercel-path-fix.js');
            fs.copyFileSync(sourceVercelPathFixPath, vercelPathFixScriptPath);
        }
        
        console.log('Post-build HTML fixes completed successfully.');
    } catch (error) {
        console.error('Error during post-build HTML fixes:', error);
        process.exit(1);
    }
}

// Execute the function
fixHtmlOnBuild();
