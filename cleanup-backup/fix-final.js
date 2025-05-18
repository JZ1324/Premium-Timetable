const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/aiParserService.js');
const backupPath = path.join(__dirname, 'src/services/aiParserService.js.bak');

// Create a backup
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup at ${backupPath}`);

// Read the file content
const content = fs.readFileSync(filePath, 'utf8');

// Check for the specific pattern we need to fix
const pattern1 = /\/\/ If we get here, either it's not a tabular format or tabular parsing failed[\s\S]*?console\.log\("Using standard line-by-line parser"\);/g;
const replacement1 = `// If we get here, either it's not a tabular format or tabular parsing failed
    // Fall back to the regular line-by-line parser
    try {
      console.log("Using standard line-by-line parser");`;

// Check for other issues
const pattern2 = /return redistributeClasses\(result, textLen\);[\s\S]*?\} catch \(error\) \{[\s\S]*?return createDefaultTimetableStructure\(\);[\s\S]*?\}\s*\}/g;
const replacement2 = `return redistributeClasses(result, textLen);
    } catch (error) {
      console.error("Error in fallback parser:", error);
      return createDefaultTimetableStructure();
    }
  }`;

// Fix the file
let fixedContent = content.replace(pattern1, replacement1);
fixedContent = fixedContent.replace(pattern2, replacement2);

// Write the fixed content
fs.writeFileSync(filePath, fixedContent);
console.log('Fixed the syntax errors in the file');
