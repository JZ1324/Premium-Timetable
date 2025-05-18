#!/bin/bash
# Script to clean up multiple backup versions of aiParserService.js

# Print header
echo "============================================================="
echo "  aiParserService.js Backup Files Cleanup"
echo "  $(date)"
echo "============================================================="

# Create a backup directory specifically for these files
BACKUP_DIR="./aiparser-backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Move all the backup versions to this directory
echo -e "\nMoving backup files..."
find ./src/services -name "aiParserService.js.*" -exec mv {} "$BACKUP_DIR/" \;

# Count how many files were moved
FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
echo -e "\n$FILE_COUNT backup files moved to $BACKUP_DIR"

# Keep only the current version
echo -e "\nOnly the current version of aiParserService.js remains in the src/services directory."
echo "You can safely delete the $BACKUP_DIR directory after confirming everything works correctly."
echo "============================================================="
