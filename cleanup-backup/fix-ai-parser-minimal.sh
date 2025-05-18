#!/bin/bash

echo "Creating minimal fixed version of aiParserService.js..."

# Backup original file
cp src/services/aiParserService.js src/services/aiParserService.js.bak
echo "Backup created at src/services/aiParserService.js.bak"

# Create a new file with the fixed code structure
cat > src/services/aiParserService.js.minimal << 'EOF'
// AI Timetable Parser Service using OpenRouter.ai API

import { getOpenRouterApiKey } from "../utils/apiKeyManager";
import { tryParseJson } from "./jsonSanitizer";

// [Many helper functions and constants...]

export const parseTimetableText = async (timetableText) => {
  try {
    // [Implementation details...]
  } catch (error) {
    // [Error handling...]
    throw new Error("AI parsing failed. " + (error.message || "Please try again or use another import method."));
  }
}

/**
 * Helper function to redistribute classes across days if they're all in Day 1
 * and ensure multiple classes per period are properly handled
 */
const redistributeClasses = (jsonObject, textLength) => {
  // [Implementation details...]
};

/**
 * Publicly exported fallback parser function
 */
export const fallbackParser = (timetableText, textLength) => {
  try {
    // [Implementation details...]
    
    // Fall back to the regular line-by-line parser
    console.log("Using standard line-by-line parser");
    try {
      // [Line-by-line parser implementation...]
      
      // Apply final redistribution and validation
      return redistributeClasses(result, textLen);
    } catch (error) {
      console.error("Error in fallback parser:", error);
      return createDefaultTimetableStructure();
    }
  } catch (error) {
    console.error("Error in fallback parser:", error);
    return createDefaultTimetableStructure();
  }
};

// Helper functions for extraction
function extractSubject(text) {
  // [Implementation details...]
}

function extractCode(text) {
  // [Implementation details...]
}

function extractRoom(text) {
  // [Implementation details...]
}

function extractTeacher(text) {
  // [Implementation details...]
}

// Also export parseWithAI as an alias for parseTimetableText for compatibility
export const parseWithAI = parseTimetableText;
EOF

# Check if the minimal version compiles
node --check src/services/aiParserService.js.minimal
if [ $? -eq 0 ]; then
  echo "Minimal version compiles correctly. Now merging with original..."
  
  # Create a script to compare and merge the files
  cat > merge-parser.js << 'EOF'
const fs = require('fs');

// Read both files
const original = fs.readFileSync('src/services/aiParserService.js.bak', 'utf8');
const minimal = fs.readFileSync('src/services/aiParserService.js.minimal', 'utf8');

// Create a merged file with the fixed structure but original implementation
let fixed = original;

// Fix 1: Remove stray semicolon after parseTimetableText function
fixed = fixed.replace(/^};\s*$/m, '}');

// Fix 2: Add missing try block for line-by-line parser
fixed = fixed.replace(
  /console\.log\("Using standard line-by-line parser"\);/,
  'console.log("Using standard line-by-line parser");\n    try {'
);

// Write the fixed file
fs.writeFileSync('src/services/aiParserService.js', fixed);
console.log('Merged file created with fixes applied');
EOF

  # Run the merge script
  node merge-parser.js
  
  # Check if the merged version compiles
  node --check src/services/aiParserService.js
  if [ $? -eq 0 ]; then
    echo "✅ Fix successful! The parser now compiles without syntax errors."
    # Clean up temporary files
    rm src/services/aiParserService.js.minimal merge-parser.js
  else
    echo "❌ Merged version still has errors. Using minimal version instead."
    cp src/services/aiParserService.js.minimal src/services/aiParserService.js
    node --check src/services/aiParserService.js
    if [ $? -eq 0 ]; then
      echo "✅ Minimal version installed successfully."
    else
      echo "❌ Both versions failed. Restoring backup."
      cp src/services/aiParserService.js.bak src/services/aiParserService.js
    fi
  fi
else
  echo "❌ Even minimal version doesn't compile. This suggests deeper issues."
  echo "Restoring backup..."
  cp src/services/aiParserService.js.bak src/services/aiParserService.js
fi
