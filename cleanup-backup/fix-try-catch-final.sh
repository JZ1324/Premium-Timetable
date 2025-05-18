#!/bin/bash

echo "Applying comprehensive fix to the aiParserService.js try-catch structure..."

# Backup the original file
cp src/services/aiParserService.js src/services/aiParserService.js.comprehensive_fix_bak
echo "Backup created at src/services/aiParserService.js.comprehensive_fix_bak"

# Use perl for the complex multi-line replacement
perl -i -0pe '
  # Remove the redundant try block in the line-by-line parser section
  s/(console\.log\("Using standard line-by-line parser"\);)\s*try\s*\{/$1\n    /s;
' src/services/aiParserService.js

# Check if the file compiles
node --check src/services/aiParserService.js
if [ $? -eq 0 ]; then
  echo "✅ Fix successful! The parser compiles without syntax errors."
  # Create a more detailed verification
  node -e "
    const fs = require('fs');
    const content = fs.readFileSync('src/services/aiParserService.js', 'utf8');
    
    // Check try-catch balance
    const tryCount = (content.match(/try\s*\{/g) || []).length;
    const catchCount = (content.match(/catch\s*\(/g) || []).length;
    
    console.log(\`Try blocks: \${tryCount}, Catch blocks: \${catchCount}\`);
    
    if (tryCount === catchCount) {
      console.log('✅ All try blocks have matching catch blocks');
    } else {
      console.log('⚠️ Try-catch blocks are not balanced');
    }
    
    // Print the fixed code around the line-by-line parser
    const lines = content.split('\\n');
    console.log('\\nLine-by-line parser section (after fix):');
    console.log(lines.slice(890, 900).join('\\n'));
  "
else
  echo "❌ Fix failed. Restoring backup..."
  cp src/services/aiParserService.js.comprehensive_fix_bak src/services/aiParserService.js
  echo "Original file restored. Please check the file manually."
fi
