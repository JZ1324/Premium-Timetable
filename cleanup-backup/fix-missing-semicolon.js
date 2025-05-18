const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.resolve('./src/services/aiParserService.js');
console.log(`Fixing file: ${filePath}`);

// Create a backup
const backupPath = `${filePath}.bak`;
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup: ${backupPath}`);

// Read the content
let content = fs.readFileSync(filePath, 'utf8');

// Fix the cleanAndValidateJson function
// This adds a semicolon after the closing brace of the try block
content = content.replace(
  /(const cleanAndValidateJson = \(jsonObject, textLength\) => \{\s+)([^\}]+\s+\/\/ Return the validated object\s+return redistributeClasses\(jsonObject, textLength\);\s+\})\s+(catch \(error\) \{)/g,
  '$1$2;\n  $3'
);

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('Added missing semicolon to the cleanAndValidateJson function.');

// Verify the fix
try {
  require(filePath);
  console.log('✅ Syntax check passed! The file has been fixed successfully.');
} catch (error) {
  console.error('❌ Syntax check failed:', error.message);
  console.log('Restoring from backup...');
  fs.copyFileSync(backupPath, filePath);
  console.log('Restored from backup.');
}
