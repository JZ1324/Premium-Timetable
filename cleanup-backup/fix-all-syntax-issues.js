// Comprehensive fix for all three syntax issues in aiParserService.js
const fs = require('fs');
const { execSync } = require('child_process');

console.log("Starting comprehensive fix for aiParserService.js...");

// Make a backup of the original file
const filePath = 'src/services/aiParserService.js';
const backupPath = `${filePath}.comprehensive_fix_backup`;
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup at ${backupPath}`);

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Extract the fallbackParser function to avoid modifying other parts of the file
// This is important as we need to be precise about the function we're fixing
const fallbackParserStartRegex = /export const fallbackParser = \(timetableText, textLength\) => \{/;
const startMatch = content.match(fallbackParserStartRegex);

if (!startMatch) {
  console.error("Could not find the fallbackParser function start!");
  process.exit(1);
}

const startIndex = content.indexOf(startMatch[0]);

// Find the end of the function
// We'll look for the last "}" before the next function or the end of file
const remainingContent = content.substring(startIndex);
const functionEndRegex = /}\s*\n\s*\/\/ Helper functions/;
const endMatch = remainingContent.match(functionEndRegex);

if (!endMatch) {
  console.error("Could not find the fallbackParser function end!");
  process.exit(1);
}

const endIndex = startIndex + remainingContent.indexOf(endMatch[0]) + 1; // +1 to include the closing brace
const functionContent = content.substring(startIndex, endIndex);

console.log("Found fallbackParser function, length:", functionContent.length);

// Fix all three issues:
// 1. Remove the try block after "Using standard line-by-line parser"
// 2. Fix the catch block structure
// 3. Make sure all braces are balanced

// First, let's replace the problematic try block
let fixedFunction = functionContent.replace(
  /(console\.log\("Using standard line-by-line parser"\);)\s*try\s*\{/,
  '$1'
);

// Check try-catch balance
const tryCount = (fixedFunction.match(/try\s*\{/g) || []).length;
const catchCount = (fixedFunction.match(/catch\s*\(/g) || []).length;
console.log(`Try blocks: ${tryCount}, Catch blocks: ${catchCount}`);

// If needed, add a try block around the line-by-line parser section
if (tryCount < catchCount) {
  console.log("Adding a try block to balance try-catch...");
  fixedFunction = fixedFunction.replace(
    /(console\.log\("Using standard line-by-line parser"\);)\s*\n\s*(let currentDay)/,
    '$1\n    try {\n    $2'
  );
}

// Fix any stray semicolons after closing braces
fixedFunction = fixedFunction.replace(/};\s*\n/g, '}\n');

// Replace the old function with the fixed one
const fixedContent = content.substring(0, startIndex) + fixedFunction + content.substring(endIndex);

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent);
console.log("Applied fixes to the file");

// Verify the fixes worked
try {
  execSync(`node --check ${filePath}`, { stdio: 'pipe' });
  console.log("✅ Success! The file now passes JavaScript syntax check.");
  
  // Create a small report file
  const report = `
# aiParserService.js Syntax Fix Report

## Issues Fixed:

1. **Unbalanced try/catch blocks**: Fixed the structure to ensure each try has a matching catch.
2. **Stray semicolons**: Removed any stray semicolons after function closing braces.
3. **General syntax correction**: Ensured valid JavaScript syntax throughout the file.

## Verification:

The file now passes the Node.js syntax check: \`node --check ${filePath}\`

## Note:

VS Code's TypeScript analyzer might still show some warnings due to its stricter analysis, 
but the JavaScript syntax itself is now valid.
  `;
  
  fs.writeFileSync('AI_PARSER_SYNTAX_FIX_REPORT.md', report);
  console.log("Created fix report at AI_PARSER_SYNTAX_FIX_REPORT.md");
  
} catch (error) {
  console.error("❌ Fixes did not resolve all issues:", error.message);
  
  // Restore the backup
  fs.copyFileSync(backupPath, filePath);
  console.log("Restored original file from backup");
}
