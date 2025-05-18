#!/bin/bash

echo "Fixing aiParserService.js syntax errors..."

# Backup the original file
cp src/services/aiParserService.js src/services/aiParserService.js.bak
echo "Backup created at src/services/aiParserService.js.bak"

# Search for specific patterns and fix them manually
grep -n "^};" src/services/aiParserService.js
grep -n "console.log(\"Using standard line-by-line parser\");" src/services/aiParserService.js 

echo "Fixing error 1: Stray semicolon after parseTimetableText function..."
# Fix by directly editing line 352
sed -i '' '352s/^};\s*$/}/' src/services/aiParserService.js

echo "Fixing error 2: Missing try block around line-by-line parser..."
# Fix by directly editing line 897
sed -i '' '897s/console\.log("Using standard line-by-line parser");/console.log("Using standard line-by-line parser");\n    try {/' src/services/aiParserService.js

# Verify fixes
echo "Verifying syntax..."
node --check src/services/aiParserService.js
if [ $? -eq 0 ]; then
  echo "✅ All syntax errors fixed successfully!"
else
  echo "❌ Some errors still remain. Restoring backup..."
  cp src/services/aiParserService.js.bak src/services/aiParserService.js
fi
