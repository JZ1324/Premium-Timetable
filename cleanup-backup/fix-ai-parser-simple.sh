#!/bin/bash

echo "Creating a fixed copy of aiParserService.js..."

# File paths
SRC_FILE="src/services/aiParserService.js"
FIXED_FILE="src/services/aiParserService.js.fixed"
BACKUP_FILE="src/services/aiParserService.js.backup"

# Make a backup
cp "$SRC_FILE" "$BACKUP_FILE"
echo "Backup created at $BACKUP_FILE"

# Process file content in a single operation
cat "$SRC_FILE" | 
  # Fix 1: Remove stray semicolon
  sed 's/^};\s*$/}/' |
  # Fix 2: Add missing try block
  sed 's/console\.log("Using standard line-by-line parser");/console.log("Using standard line-by-line parser");\n    try {/' > "$FIXED_FILE"

# Check if fixed file exists
if [ -s "$FIXED_FILE" ]; then
  # Apply the fix
  mv "$FIXED_FILE" "$SRC_FILE"
  echo "Fixed file created and replaced original"
  
  # Check if it compiles
  node --check "$SRC_FILE"
  if [ $? -eq 0 ]; then
    echo "✅ Fix successful! The parser now compiles without syntax errors."
  else
    echo "❌ Fix incomplete. Some errors may remain."
    # Restore backup if requested
    read -p "Do you want to restore the backup? (y/n) " answer
    if [ "$answer" == "y" ]; then
      cp "$BACKUP_FILE" "$SRC_FILE"
      echo "Backup restored."
    fi
  fi
else
  echo "❌ Failed to create fixed file"
fi
