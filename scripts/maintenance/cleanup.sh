#!/bin/bash
# Cleanup script for Premium-Timetable project
# This script removes redundant test files and backups after fixing the enhanceClassData issue

# Print a header
echo "========================================================="
echo "  Premium-Timetable Cleanup Script"
echo "  $(date)"
echo "========================================================="
echo

# Create a backup directory for files we're removing
echo "Creating backup directory for removed files..."
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Backup directory created: $BACKUP_DIR"
echo

# Files to keep (modify this list as needed)
KEEP_FILES=(
  "test-enhance-class-data.js"  # Main test for the enhanceClassData fix
  "ai-parser-fix-documentation.md"  # Documentation of the fix
)

# Function to check if a file should be kept
should_keep() {
  local filename=$(basename "$1")
  for keep_file in "${KEEP_FILES[@]}"; do
    if [[ "$filename" == "$keep_file" ]]; then
      return 0  # Should keep
    fi
  done
  return 1  # Should not keep
}

# Process test files
echo "Moving test files to backup..."
for test_file in test-*.js test-*.sh test-*.mjs; do
  if [[ -f "$test_file" ]]; then
    if should_keep "$test_file"; then
      echo "Keeping: $test_file"
    else
      echo "Moving to backup: $test_file"
      mv "$test_file" "$BACKUP_DIR/"
    fi
  fi
done

# Process fix scripts
echo -e "\nMoving fix scripts to backup..."
for fix_file in fix-*.js fix-*.sh fix-*mjs; do
  if [[ -f "$fix_file" ]]; then
    echo "Moving to backup: $fix_file"
    mv "$fix_file" "$BACKUP_DIR/"
  fi
done

# Process validation/verification scripts
echo -e "\nMoving validation scripts to backup..."
for val_file in validate-*.js validation-*.js verify-*.js simple-test.js; do
  if [[ -f "$val_file" ]]; then
    echo "Moving to backup: $val_file"
    mv "$val_file" "$BACKUP_DIR/"
  fi
done

# Process other redundant scripts
echo -e "\nMoving other redundant scripts to backup..."
REDUNDANT_SCRIPTS=(
  "analyze-try-catch.js"
  "check-try-catch-detailed.js"
  "check-try-catch-structure.js"
  "clean-regex-test.js"
  "complete-parser-test.js"
  "comprehensive-fallback-fix.js"
  "create-parser-test.js"
  "debug-ai-parser.mjs"
  "diagnose-parser-issue.js"
  "direct-final-syntax-fix.js"
  "direct-final-test.js"
  "direct-manual-fix.js"
  "manual-test-enhancer.js"
  "minimal-tab-parser-test.js"
  "minimal-test.js"
  "new-aiParserService.js"
  "one-step-fix.js"
  "patch-fallback-parser.js"
  "pure-js-fix.js"
  "regex-test.js"
)

for script in "${REDUNDANT_SCRIPTS[@]}"; do
  if [[ -f "$script" ]]; then
    echo "Moving to backup: $script"
    mv "$script" "$BACKUP_DIR/"
  fi
done

# Process deployment scripts (keep main ones, move others)
echo -e "\nMoving redundant deployment scripts to backup..."
DEPLOYMENT_TO_MOVE=(
  "deploy-fixed-version.sh"
  "deploy-to-github-pages-auto.sh"
  "deploy-to-vercel-directly.sh"
  "check-deployment.sh"
  "final-build-check.sh"
  "verify-build.sh"
  "combined-fix-and-deploy.sh"
  "fixed-final-parser.sh"
  "absolute-final-fix.sh"
)

for deploy_script in "${DEPLOYMENT_TO_MOVE[@]}"; do
  if [[ -f "$deploy_script" ]]; then
    echo "Moving to backup: $deploy_script"
    mv "$deploy_script" "$BACKUP_DIR/"
  fi
done

# Keep track of how many files we moved
file_count=$(find "$BACKUP_DIR" -type f | wc -l)

echo -e "\n========================================================="
echo "Cleanup complete!"
echo "$file_count files moved to backup directory: $BACKUP_DIR"
echo "If everything works correctly, you can delete the backup directory."
echo "========================================================="
