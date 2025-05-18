#!/bin/bash

# Premium-Timetable Workspace Cleanup Script
# This script removes unnecessary backup files and redundant test/fix scripts
# to clean up your workspace.

echo "==========================================="
echo "Premium-Timetable Workspace Cleanup Script"
echo "==========================================="
echo

# Create a backup directory for files we're removing
# (just in case you need to recover something later)
echo "Creating backup directory..."
BACKUP_DIR="./old-files-backup-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Move backup files
echo -e "\nMoving backup files..."
find . -name "*.backup" -type f -exec mv {} "$BACKUP_DIR/" \;
find . -name "*.bak" -type f -exec mv {} "$BACKUP_DIR/" \;
mv ImportTimetable.js.bak "$BACKUP_DIR/" 2>/dev/null

# List of test script patterns to clean up
# We're keeping the most recent or important ones and removing duplicates
echo -e "\nMoving redundant test scripts..."
TEST_FILES=(
  "test-simple.js"
  "test-parser-simple.js" 
  "test-tab-parser-simple.js"
  "test-class-cell-parser.js"
  "test-parser-syntax.js"
  "test-fallback-parser.js"
  "test-tab-delimited-fix.js"
  "test-regex-enhancement.js"
  "test-scrollbar-fix.sh"
  "test-signup-button-fix.sh"
  "test-basic-parser.sh"
)

# Move these files to the backup directory
for file in "${TEST_FILES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "$BACKUP_DIR/" 
    echo "  - Moved $file"
  fi
done

# List of fix script patterns to clean up
# We're keeping the final versions or the comprehensive ones
echo -e "\nMoving redundant fix scripts..."
FIX_FILES=(
  "fix-ai-parser.js"
  "fix-syntax.js"
  "fix-syntax-errors.js"
  "fix-syntax-errors-new.js"
  "fix-syntax-errors-fixed.js"
  "fix-html-js-syntax.js"
  "fix-all-syntax-issues.js"
  "fix-api-call-error.js"
  "fix-direct.js"
  "fix-webpack-run-error.sh"
  "fix-html-syntax-errors.sh"
  "fix-html-js-errors.sh"
  "fix-ai-parser-syntax.sh"
  "fix-ai-parser-syntax-perl.sh"
  "fix-ai-parser-manual.sh"
  "fix-ai-parser-simple.sh"
  "fix-missing-semicolon.js"
  "fix-js-try-catch.js"
  "fix-html-on-build.js"
  "fix-environment-detection.js"
)

# Move these files to the backup directory
for file in "${FIX_FILES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "$BACKUP_DIR/"
    echo "  - Moved $file"
  fi
done

# Clean up duplicate documentation files
echo -e "\nMoving redundant documentation files..."
DOC_FILES=(
  "ENV_SETUP.md"
  "ADMIN_SETUP.md"
  "FIREBASE_SECURITY.md"
  "GITHUB_PAGES.md"
)

# Move these files to the backup directory
for file in "${DOC_FILES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "$BACKUP_DIR/"
    echo "  - Moved $file"
  fi
done

# Clean up other redundant files
echo -e "\nMoving other redundant files..."
OTHER_FILES=(
  "clean-regex-test.js"
  "check-try-catch-structure.js"
  "check-try-catch-detailed.js"
  "analyze-try-catch.js"
  "diagnose-parser-issue.js"
  "check-output.txt"
)

# Move these files to the backup directory
for file in "${OTHER_FILES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "$BACKUP_DIR/"
    echo "  - Moved $file"
  fi
done

echo -e "\nCleanup complete!"
echo "Files have been moved to $BACKUP_DIR"
echo "You can safely delete this directory once you confirm everything works properly:"
echo "  rm -rf $BACKUP_DIR"
echo
echo "Workspace is now cleaner!"
