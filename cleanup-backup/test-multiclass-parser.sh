#!/bin/bash

# Test the multi-class parser feature

echo "=========================================="
echo "Premium Timetable - Multi-Class Parser Test"
echo "=========================================="
echo ""

# Make sure dependencies are installed
echo "Checking and installing dependencies..."
npm install @babel/register @babel/preset-env @babel/plugin-transform-modules-commonjs @babel/plugin-proposal-class-properties --save-dev

# Fix any syntax errors in the parser file
echo "Checking for syntax errors..."
node -c src/services/aiParserService.js 2> parser_errors.txt
if [ $? -ne 0 ]; then
  echo "Found syntax errors in the parser. See parser_errors.txt for details."
  echo "Attempting automatic fixes..."
  # Simple fix for common syntax errors
  sed -i '' -e 's/export const parseWithAI = parseTimetableText;/export const parseWithAI = parseTimetableText;/' src/services/aiParserService.js
  
  # Check again
  node -c src/services/aiParserService.js
  if [ $? -ne 0 ]; then
    echo "Could not automatically fix parser. Please check parser_errors.txt."
    exit 1
  fi
  echo "Fixed syntax errors."
else
  echo "No syntax errors detected."
  rm parser_errors.txt
fi

# Run the test
echo ""
echo "Running parser tests..."
node test-multiclass-parser.js

echo ""
echo "Tests complete!"
echo "=========================================="
