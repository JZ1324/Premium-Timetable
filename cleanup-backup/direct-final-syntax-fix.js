// Final direct fix for syntax errors in aiParserService.js
const fs = require('fs');

// Define file path
const filePath = './src/services/aiParserService.js';

// Create backup
console.log('Creating backup...');
fs.copyFileSync(filePath, `${filePath}.final_backup`);

// Read the file
console.log('Reading file...');
const content = fs.readFileSync(filePath, 'utf8');

// The problematic code structure has a missing try statement before the line-by-line parser
// A proper fix is to add the try statement before the line-by-line parser logic starts
// And ensure the catch block is properly structured

// STEP 1: Fix the try block that should be before console.log("Using standard line-by-line parser")
let fixedContent = content.replace(
  /(\/\/ If we get here, either it's not a tabular format or tabular parsing failed[\s\S]*?\/\/ Fall back to the regular line-by-line parser[\s\S]*?)console\.log\("Using standard line-by-line parser"\);/,
  '$1try {\n      console.log("Using standard line-by-line parser");'
);

// STEP 2: Fix any malformed catch blocks that might be causing syntax errors
fixedContent = fixedContent.replace(
  /return redistributeClasses\(result, textLen\);[\s\S]*?\} catch \(error\) \{[\s\S]*?return createDefaultTimetableStructure\(\);[\s\S]*?\}\s*\}/,
  'return redistributeClasses(result, textLen);\n  } catch (error) {\n    console.error("Error in fallback parser:", error);\n    return createDefaultTimetableStructure();\n  }\n}'
);

// Write the fixed content
console.log('Writing fixed content...');
fs.writeFileSync(filePath, fixedContent);

// Verify syntax
console.log('Verifying syntax...');
try {
  require('child_process').execSync(`node --check ${filePath}`, { stdio: 'pipe' });
  console.log('✅ SUCCESS: Fixed all syntax errors in the file!');
} catch (error) {
  console.error('❌ ERROR: Syntax errors still present:');
  console.error(error.message);
  console.log('Restoring backup...');
  fs.copyFileSync(`${filePath}.final_backup`, filePath);
}
