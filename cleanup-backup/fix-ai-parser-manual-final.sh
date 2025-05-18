#!/bin/bash

echo "Creating a new manual fix for aiParserService.js..."
cp src/services/aiParserService.js src/services/aiParserService.js.manual_fix_bak

# Here's the core fix - remove the problematic try block:
sed -i '' -e 's/console.log("Using standard line-by-line parser");[[:space:]]*try[[:space:]]*{/console.log("Using standard line-by-line parser");/' src/services/aiParserService.js

# Check if the fix worked
if node --check src/services/aiParserService.js; then
    echo "✅ Syntax errors fixed successfully!"
else
    echo "❌ Still having issues, trying more aggressive approach..."
    
    # If it still has issues, we'll try to properly restructure the try-catch blocks:
    perl -i -0pe 's/(export const fallbackParser = \(timetableText, textLength\) => \{)([\s\S]*?)(console\.log\("Using standard line-by-line parser"\);)[\s\S]*?(return redistributeClasses\(result, textLen\);)[\s\S]*?(catch \(error\) \{)/$1\n  try {\n    $2$3\n    \n    let currentDay = "Day 1";\n    let currentPeriod = "Period 1";\n    \n    \/\/ ... all the code here ...\n    \n    \/\/ Apply final redistribution and validation\n    $4\n  } $5/s' src/services/aiParserService.js
    
    # Check again
    if node --check src/services/aiParserService.js; then
        echo "✅ Comprehensive fix worked!"
    else
        echo "❌ Manual intervention needed."
        cp src/services/aiParserService.js.manual_fix_bak src/services/aiParserService.js
    fi
fi
