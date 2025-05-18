const fs = require('fs');
const path = require('path');

// Path to the file with errors
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove the stray "};" after the closing brace of the parseTimetableText function
content = content.replace(/}(\s*);(\s*)\n\n\/\*\*\n \* Helper function to redistribute classes/, '}\n\n/**\n * Helper function to redistribute classes');

// Fix 2: Add the missing 'catch' block to the line-by-line parser
content = content.replace(/console\.log\("Using standard line-by-line parser"\);(\s*)try {/, 'console.log("Using standard line-by-line parser");\ntry {');

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('Fixed 3 syntax errors in aiParserService.js:');
console.log('1. Removed stray "};" after parseTimetableText function');
console.log('2. Fixed try/catch block in line-by-line parser');
console.log('File saved successfully!');
