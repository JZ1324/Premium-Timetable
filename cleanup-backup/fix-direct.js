// This is a direct JavaScript fix for the aiParserService.js
const fs = require('fs');

// Read the file
const filePath = 'src/services/aiParserService.js';
console.log(`Reading ${filePath}`);
const original = fs.readFileSync(filePath, 'utf8');

// Back up the original file
const backupPath = `${filePath}.direct_fix_bak`;
fs.writeFileSync(backupPath, original);
console.log(`Created backup at ${backupPath}`);

// Fix approach:
// 1. Remove the stray semicolon after the function's closing brace
// 2. Remove the problematic try block in the line-by-line parser section
// 3. Make sure we have matching try/catch blocks
let fixed = original;

// First, replace the stray "};" with "}" at the end of the fallbackParser function
fixed = fixed.replace(/\};(\s*\/\/ Helper functions)/, '}$1');

// Next, remove the problematic try block at the line-by-line parser section
fixed = fixed.replace(
  /(console\.log\("Using standard line-by-line parser"\);)\s*try\s*\{/,
  '$1'
);

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixed);
console.log(`Fixed content written to ${filePath}`);

// Verification
console.log('Running syntax check...');
const { execSync } = require('child_process');
try {
  execSync('node --check ' + filePath);
  console.log('✅ Syntax check passed!');
} catch (error) {
  console.error('❌ Syntax check failed:', error.message);
  // Restore the backup if the fix didn't work
  fs.copyFileSync(backupPath, filePath);
  console.log('Restored original file from backup');
}
