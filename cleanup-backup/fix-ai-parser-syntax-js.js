// Fix AI Parser Syntax

// Read the file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

try {
  // Create a backup
  fs.copyFileSync(filePath, `${filePath}.backup`);
  console.log('Created backup at', `${filePath}.backup`);

  // Read the file
  let fileContent = fs.readFileSync(filePath, 'utf8');
  console.log('Read file successfully');

  // Fix 1: Remove stray semicolon after parseTimetableText function closing brace
  fileContent = fileContent.replace(/^};\s*$/m, '}');
  console.log('Fixed stray semicolon');

  // Fix 2: Add missing try block around line-by-line parser
  fileContent = fileContent.replace(
    /console\.log\("Using standard line-by-line parser"\);/,
    'console.log("Using standard line-by-line parser");\n    try {'
  );
  console.log('Added missing try block');

  // Write the fixed content back to the file
  fs.writeFileSync(filePath, fileContent);
  console.log('Wrote fixed content back to file');

  console.log('All fixes applied successfully!');
} catch (error) {
  console.error('Error fixing the file:', error);
}
