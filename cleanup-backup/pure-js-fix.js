const fs = require('fs');

// Read the file
const filePath = 'src/services/aiParserService.js';
console.log(`Reading ${filePath}...`);
const content = fs.readFileSync(filePath, 'utf8');

// Create a backup
const backupPath = `${filePath}.pure_js_fix`;
fs.writeFileSync(backupPath, content);
console.log(`Created backup at ${backupPath}`);

// Use a regular expression to find and fix the syntax error
// This looks for a try without a catch around the line parser section
let fixed = content.replace(
  /(console\.log\("Using standard line-by-line parser"\);)([\s\n\r]*)(try)([\s\n\r]*){/g,
  '$1$2'
);

// Write the fixed content back
fs.writeFileSync(filePath, fixed);
console.log("Applied fixes to file.");

// Verify with Node.js
try {
  require('child_process').execSync(`node --check ${filePath}`);
  console.log("✅ FIXED! File passes Node.js syntax check.");
} catch (error) {
  console.error("❌ Fix failed:", error.message);
  console.log("Restoring backup...");
  fs.copyFileSync(backupPath, filePath);
}
