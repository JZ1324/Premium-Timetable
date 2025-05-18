#!/bin/bash

echo "Starting comprehensive fix of aiParserService.js file..."

# Create a backup of the original file
cp src/services/aiParserService.js src/services/aiParserService.js.final_bak
echo "Backup created at src/services/aiParserService.js.final_bak"

# First, check the current state with node syntax checker
echo "Current file syntax check:"
if node --check src/services/aiParserService.js 2>&1; then
  echo "File already has valid syntax!"
  exit 0
else
  echo "Detected syntax errors, applying fix..."
fi

# Most direct and focused fix - balance the try-catch blocks
# This uses perl for the complex regex replacement
perl -i -0pe 's/(console\.log\("Using standard line-by-line parser"\);)\s*(\s*let currentDay)/$1\n  try {\n    $2/g' src/services/aiParserService.js

# Also fix the stray semicolon after function closing braces
perl -i -0pe 's/};\s*\n\s*(\/\/ Helper functions)/}\n\n$1/g' src/services/aiParserService.js

# Verify the fix worked
echo "After fix syntax check:"
if node --check src/services/aiParserService.js 2>&1; then
  echo "✅ Fix successful! The parser compiles without syntax errors."
  
  # Count try and catch blocks to verify balance
  tryCount=$(grep -c "try\s*{" src/services/aiParserService.js)
  catchCount=$(grep -c "catch\s*(" src/services/aiParserService.js)
  
  echo "Try blocks: $tryCount, Catch blocks: $catchCount"
  
  if [ "$tryCount" -ne "$catchCount" ]; then
    echo "⚠️ Try-catch blocks are not balanced"
  else
    echo "✅ Try-catch blocks are balanced"
  fi
  
  # Print the relevant section for verification
  echo "Line-by-line parser section (after fix):"
  grep -A 10 "Using standard line-by-line parser" src/services/aiParserService.js
else
  echo "❌ Fix failed, restoring backup"
  cp src/services/aiParserService.js.final_bak src/services/aiParserService.js
fi

echo "Fix process completed."
