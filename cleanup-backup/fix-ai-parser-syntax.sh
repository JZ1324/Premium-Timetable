#!/bin/bash

# Quick fix for the AI parser service to ensure it compiles properly

echo "Fixing syntax issues in aiParserService.js..."

# Backup original file
cp src/services/aiParserService.js src/services/aiParserService.js.bak

# Simple fixes to common issues using sed
# 1. Fix missing commas
sed -i '' -e 's/}/},/g' src/services/aiParserService.js
# 2. Fix the last line
sed -i '' -e 's/export const parseWithAI = parseTimetableText;/export const parseWithAI = parseTimetableText;/' src/services/aiParserService.js

# Check if the file compiles
echo "Checking if the fixed file compiles..."
node -c src/services/aiParserService.js
if [ $? -eq 0 ]; then
  echo "Fix successful! The parser now compiles without syntax errors."
else
  echo "Automatic fix failed. Restoring backup."
  cp src/services/aiParserService.js.bak src/services/aiParserService.js
  echo "Please check src/services/aiParserService.js manually."
fi
