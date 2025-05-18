#!/bin/bash

# This script adds the path-fix.js and vercel-path-fix.js scripts to the build/index.html file

BUILD_DIR="build"
INDEX_HTML="${BUILD_DIR}/index.html"

# Check if build/index.html exists
if [[ ! -f "$INDEX_HTML" ]]; then
  echo "Error: $INDEX_HTML does not exist. Please run build first."
  exit 1
fi

echo "Adding path-fix scripts to $INDEX_HTML..."

# Create temporary file
TEMP_FILE=$(mktemp)

# Add path-fix scripts after the head tag
sed '/<head>/a\
    <!-- Path fix scripts for deployment - must be loaded first -->\
    <script src="/path-fix.js"></script>\
    <script src="/vercel-path-fix.js"></script>
' "$INDEX_HTML" > "$TEMP_FILE"

# Replace original file with the modified one
mv "$TEMP_FILE" "$INDEX_HTML"

echo "Successfully added path-fix scripts to $INDEX_HTML"

# Make sure path-fix.js and vercel-path-fix.js exist in the build directory
for SCRIPT in "path-fix.js" "vercel-path-fix.js"; do
  if [[ ! -f "${BUILD_DIR}/${SCRIPT}" ]]; then
    echo "Warning: ${BUILD_DIR}/${SCRIPT} does not exist. Copying from public directory..."
    cp "public/${SCRIPT}" "${BUILD_DIR}/" || echo "Error: Failed to copy ${SCRIPT}"
  fi
done

echo "Post-build script completed successfully."
