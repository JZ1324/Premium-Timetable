#!/bin/bash

# Quick fix for the AI parser syntax errors

echo "Fixing syntax errors in aiParserService.js..."

# Backup the original file
cp src/services/aiParserService.js src/services/aiParserService.js.orig

# Use perl to fix all issues at once - this handles multi-line patterns better than sed
perl -i -pe '
  # Fix 1: Remove stray semicolon after the parseTimetableText function
  s/^};\s*$/}/g;
  
  # Fix 2: Add missing try block around line-by-line parser
  s/console\.log\("Using standard line-by-line parser"\);/console.log("Using standard line-by-line parser");\n    try {/g;
  
  # Fix 3: Handle any other potential mismatched braces or syntax issues
  s/try\s*{(.*?)\/\/\s*Apply final redistribution and validation/try {$1\/\/\s*Apply final redistribution and validation/gs;
' src/services/aiParserService.js

# Check if the file compiles
echo "Checking if the fixed file compiles..."
node --check src/services/aiParserService.js

if [ $? -eq 0 ]; then
  echo "✅ Fix successful! The parser now compiles without syntax errors."
else
  echo "❌ Automatic fix failed. Restoring backup."
  cp src/services/aiParserService.js.orig src/services/aiParserService.js
  echo "Please check src/services/aiParserService.js manually."
fi
