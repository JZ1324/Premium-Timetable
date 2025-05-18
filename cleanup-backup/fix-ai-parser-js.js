// Fix AI Parser Syntax by creating a new corrected file

const fs = require('fs');
const path = require('path');

// Define file paths
const originalFilePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');
const fixedFilePath = path.join(__dirname, 'src', 'services', 'aiParserService.js.fixed');
const backupFilePath = path.join(__dirname, 'src', 'services', 'aiParserService.js.backup');

// Make sure we have a backup
console.log('Creating backup of original file...');
fs.copyFileSync(originalFilePath, backupFilePath);

try {
    // Read the original file
    const content = fs.readFileSync(originalFilePath, 'utf8');
    
    // Split the file content by lines
    const lines = content.split('\n');
    
    // Fixed content
    let fixedContent = '';
    let inParseTimetableText = false;
    let parseTimetableTextClosed = false;
    let inFallbackParser = false;
    let tryBlockAdded = false;
    
    // Process the file line by line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect if we're inside the parseTimetableText function
        if (line.startsWith('export const parseTimetableText')) {
            inParseTimetableText = true;
        }
        
        // Fix 1: Remove stray semicolon after parseTimetableText function
        if (inParseTimetableText && line === '};' && !parseTimetableTextClosed) {
            fixedContent += '}\n';
            parseTimetableTextClosed = true;
            console.log('Fixed stray semicolon after parseTimetableText function.');
            continue;
        }
        
        // Detect if we're inside the fallbackParser function
        if (line.startsWith('export const fallbackParser')) {
            inFallbackParser = true;
        }
        
        // Fix 2: Add try block around line-by-line parser
        if (inFallbackParser && line === 'console.log("Using standard line-by-line parser");' && !tryBlockAdded) {
            fixedContent += lines[i] + '\n';
            fixedContent += '    try {\n';
            tryBlockAdded = true;
            console.log('Added missing try block around line-by-line parser.');
            continue;
        }
        
        // Add the line to the fixed content
        fixedContent += lines[i] + '\n';
    }
    
    // Write the fixed content to the new file
    fs.writeFileSync(fixedFilePath, fixedContent);
    console.log(`Fixed content written to ${fixedFilePath}`);
    
    // Replace the original file with the fixed one
    fs.copyFileSync(fixedFilePath, originalFilePath);
    console.log('Original file replaced with fixed version.');
    
    console.log('Fixes completed successfully.');
} catch (error) {
    console.error('Error fixing the file:', error);
    console.log('Restoring backup...');
    fs.copyFileSync(backupFilePath, originalFilePath);
    console.log('Backup restored.');
}
