// This is a fix script for aiParserService.js
const fs = require('fs');

// Make a backup of the original file
const filePath = 'src/services/aiParserService.js';
const backupPath = `${filePath}.fixall_js_bak`;
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup at ${backupPath}`);

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: The try-catch balance issue - this is tricky because we need to count
// opening and closing braces to get the structure right
let fixedContent = content;

// Find the fallbackParser function
const fallbackParserRegex = /export const fallbackParser = \(timetableText, textLength\) => \{[\s\S]*?console\.log\("Using standard line-by-line parser"\);[\s\S]*?return redistributeClasses\(result, textLen\);[\s\S]*?\} catch \(error\) \{[\s\S]*?return createDefaultTimetableStructure\(\);[\s\S]*?\}/;
const fallbackParserMatch = content.match(fallbackParserRegex);

if (fallbackParserMatch) {
  console.log('Found fallbackParser function');
  const originalFunction = fallbackParserMatch[0];
  
  // Fix the try block issue by ensuring the try is properly placed
  // Remove any try block right after the line-by-line parser log
  let fixedFunction = originalFunction.replace(
    /console\.log\("Using standard line-by-line parser"\);[\s\n\r]*try[\s\n\r]*\{/,
    'console.log("Using standard line-by-line parser");'
  );
  
  // Properly structure the try-catch to ensure it's balanced
  fixedContent = content.replace(originalFunction, fixedFunction);
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, fixedContent);
  console.log('Applied try-catch structure fix');
  
  // Verify the fix
  try {
    require('child_process').execSync(`node --check ${filePath}`);
    console.log('✅ Fix successful! The file now passes JavaScript syntax check.');
  } catch (error) {
    console.error('❌ Fix did not resolve all issues.');
    console.error(error.message);
    
    // Restore the backup
    fs.copyFileSync(backupPath, filePath);
    console.log('Restored original file from backup');
  }
} else {
  console.error('Could not locate the fallbackParser function');
  console.log('No changes were made to the file');
}
