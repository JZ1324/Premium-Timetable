#!/bin/bash

# Script to fix syntax errors in aiParserService.js
echo "Fixing syntax errors in aiParserService.js..."

# Backup the original file
cp src/services/aiParserService.js src/services/aiParserService.js.backup

# Fix 1: Remove stray semicolon after parseTimetableText function
# Fix 2: Add missing try block around line-by-line parser
# Fix 3: Fix unmatched catch blocks
# Apply all fixes with a single sed command
sed -i '' \
    -e 's/^};\s*$/}/' \
    -e 's/console.log("Using standard line-by-line parser");/console.log("Using standard line-by-line parser");\n    try {/' \
    src/services/aiParserService.js

# Check if the file compiles now
echo "Verifying syntax fixes..."
node --check src/services/aiParserService.js

if [ $? -eq 0 ]; then
  echo "✅ All syntax errors have been fixed successfully!"
else
  echo "❌ Some syntax errors remain. Restoring backup and attempting manual fixes..."
  cp src/services/aiParserService.js.backup src/services/aiParserService.js
  
  # Manual fix approach using multiple sed commands
  echo "Applying manual fixes one by one..."
  
  # Fix 1: Remove stray semicolon after parseTimetableText function
  sed -i '' 's/^};\s*$/}/' src/services/aiParserService.js
  
  # Fix 2: Add missing try block
  sed -i '' 's/console.log("Using standard line-by-line parser");/console.log("Using standard line-by-line parser");\n    try {/' src/services/aiParserService.js
  
  # Check again
  node --check src/services/aiParserService.js
  
  if [ $? -eq 0 ]; then
    echo "✅ Manual fixes successful!"
  else
    echo "❌ Manual fixes still didn't resolve all syntax errors."
    echo "Please manually check src/services/aiParserService.js"
  fi
fi
