// Direct fix approach for aiParserService.js syntax issues
// This script uses a more surgical approach to fix the three specific issues
const fs = require('fs');
const { execSync } = require('child_process');

// Create a backup
const filePath = 'src/services/aiParserService.js';
const backupPath = `${filePath}.direct_fix_bak`;
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup at ${backupPath}`);

// Read content
const content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add a try block before the line-by-line parser section
// This is the most critical fix and should resolve all three issues
const fixedContent = content.replace(
  /(console\.log\("Using standard line-by-line parser"\);)\s*(\s*let currentDay)/gs,
  (match, group1, group2) => {
    return `${group1}\n    try {\n    ${group2}`;
  }
);

// Write the fixed content
fs.writeFileSync(filePath, fixedContent);
console.log('Applied direct fix');

// Test if it works
try {
  execSync('node --check src/services/aiParserService.js', { stdio: 'pipe' });
  console.log('✅ Success! The file now passes JavaScript syntax check');
} catch (error) {
  console.error('❌ Fix failed:', error.message);
  
  // Restore backup
  fs.copyFileSync(backupPath, filePath);
  console.log('Restored original file from backup');
  process.exit(1);
}

// Create a verification report
console.log('Creating verification report...');
const verificationReport = `
# aiParserService.js Direct Fix Report

## Issue Fixed:

The main issue was with the try-catch structure in the fallbackParser function. 
The line-by-line parser section needed to be wrapped in a try block to match
the existing catch block at the end of the function.

This fix added the missing try block at the correct position:

\`\`\`javascript
// Before
console.log("Using standard line-by-line parser");

let currentDay = "Day 1";

// After
console.log("Using standard line-by-line parser");
try {
    let currentDay = "Day 1";
\`\`\`

## Verification:

The file now passes the Node.js syntax check:
\`node --check src/services/aiParserService.js\`

This fix ensures proper try-catch balancing in the JavaScript file.
`;

fs.writeFileSync('AI_PARSER_DIRECT_FIX_REPORT.md', verificationReport);
console.log('Created verification report at AI_PARSER_DIRECT_FIX_REPORT.md');
