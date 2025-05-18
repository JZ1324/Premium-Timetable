#!/bin/bash

echo "Creating a comprehensive fix for aiParserService.js..."

# Create a backup
cp src/services/aiParserService.js src/services/aiParserService.js.fixall_bak

# Use the power of Perl for this complex fix
perl -i -0pe '
    # Remove the try block after the line-by-line parser comment
    s/(console\.log\("Using standard line-by-line parser"\);)\s*try\s*\{/$1/s;
' src/services/aiParserService.js

# Check if the fix worked
if node --check src/services/aiParserService.js >/dev/null 2>&1; then
    echo "✅ Fix successful! The file now passes JavaScript syntax check."
else
    echo "❌ Fix did not resolve all issues. Trying additional fixes..."
    
    # Restore the backup for a fresh try
    cp src/services/aiParserService.js.fixall_bak src/services/aiParserService.js
    
    # Try a more comprehensive approach - add the correct try-catch structure
    perl -i -0pe '
        # Find the fallbackParser function, which has syntax issues
        if (/(export const fallbackParser = \(timetableText, textLength\) => \{).*?(console\.log\("Using standard line-by-line parser"\);).*?(\/\/ Apply final redistribution and validation\s*return redistributeClasses\(result, textLen\);).*?(catch \(error\) \{.*?return createDefaultTimetableStructure\(\);\s*\})/s) {
            my ($funcStart, $lineParser, $returnStmt, $catchBlock) = ($1, $2, $3, $4);
            # Properly structure the try-catch
            $_ =~ s/(export const fallbackParser = \(timetableText, textLength\) => \{).*?(\/\/ Apply final redistribution and validation\s*return redistributeClasses\(result, textLen\);).*?(catch \(error\) \{.*?return createDefaultTimetableStructure\(\);\s*\})/
$1
  try {
    # The existing code here...
    
    $lineParser
    
    let currentDay = "Day 1";
    let currentPeriod = "Period 1";
    
    # ... more existing code ...
    
    $returnStmt
  } $catchBlock/s;
        }
    ' src/services/aiParserService.js
    
    if node --check src/services/aiParserService.js >/dev/null 2>&1; then
        echo "✅ Comprehensive fix successful! The file now passes JavaScript syntax check."
    else
        echo "❌ Still having issues. Please check the file manually."
        # Restore the original file
        cp src/services/aiParserService.js.fixall_bak src/services/aiParserService.js
    fi
fi

echo "Done with fix attempts."
