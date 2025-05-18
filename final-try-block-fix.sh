#!/bin/bash

echo "Final fix for duplicate try blocks in aiParserService.js..."

# Backup the original file if it's not already backed up
if [ ! -f src/services/aiParserService.js.final_bak ]; then
  cp src/services/aiParserService.js src/services/aiParserService.js.final_bak
  echo "Backup created at src/services/aiParserService.js.final_bak"
fi

# Get the line number of the duplicate try block
duplicate_line=$(grep -n "    try {" src/services/aiParserService.js | head -n 2 | tail -n 1 | cut -d':' -f1)
echo "Found duplicate try block at line $duplicate_line"

# Remove the duplicate try block (the second one)
sed -i '' "${duplicate_line}d" src/services/aiParserService.js
echo "Removed duplicate try block"

# Verify the fix
echo "Verifying fix..."
node --check src/services/aiParserService.js
if [ $? -eq 0 ]; then
  echo "✅ Fix successful! The parser now compiles without syntax errors."
  
  # Run the verification script
  echo "Running full verification script..."
  node verify-ai-parser-fixes.js
else
  echo "❌ Fix failed. Restoring backup."
  cp src/services/aiParserService.js.final_bak src/services/aiParserService.js
fi
