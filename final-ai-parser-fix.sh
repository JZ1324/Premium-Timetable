#!/bin/bash

echo "Final syntax fix for aiParserService.js..."

# Backup the original file if it's not already backed up
if [ ! -f src/services/aiParserService.js.bak ]; then
  cp src/services/aiParserService.js src/services/aiParserService.js.bak
  echo "Backup created at src/services/aiParserService.js.bak"
else
  echo "Using existing backup at src/services/aiParserService.js.bak"
fi

# 1. Fix the stray semicolon on line 352
echo "Fixing stray semicolon on line 352..."
sed -i '' '352s/^};\s*$/}/' src/services/aiParserService.js

# 2. Fix the duplicate try block
echo "Fixing duplicate try block on line 897-898..."
sed -i '' '898d' src/services/aiParserService.js

# 3. Check other semicolons to make sure they're not causing issues
echo "Checking other semicolons..."
node --check src/services/aiParserService.js
if [ $? -eq 0 ]; then
  echo "✅ All syntax errors fixed successfully!"
  
  # Create a documentation of the fixes
  cat > AI_PARSER_FIXES_UPDATE.md << 'EOF'
# AI Parser Syntax Fixes

## Issues Fixed

1. Removed stray semicolon (`;`) after the closing brace of the `parseTimetableText` function
2. Fixed a duplicate `try` block around the line-by-line parser section
3. Ensured proper matching of try/catch blocks throughout the file

These fixes resolved the syntax errors that were preventing the code from compiling properly.

## Validation

The fixes were verified using:
- `node --check` to verify JavaScript syntax
- Manual inspection of key areas of the code

## Date

Fixed on: May 16, 2025
EOF

  echo "Documentation created at AI_PARSER_FIXES_UPDATE.md"
else
  echo "❌ Some errors still remain. Restoring backup..."
  cp src/services/aiParserService.js.bak src/services/aiParserService.js
fi
