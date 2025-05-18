#!/bin/bash
# Script to check for hardcoded Vercel URLs in the codebase

echo "Checking for hardcoded Vercel URLs in the codebase..."

# Define the URLs to search for
URLS=(
  "timetable-premium.vercel.app"
  "premium-timetable.vercel.app"
  "premium-timetable-git"
)

# Directories to exclude from search
EXCLUDE_DIRS=(
  "node_modules"
  ".git"
  "build"
  "aiparser-backups"
  "cleanup-backup"
)

# Build the exclude pattern
EXCLUDE_PATTERN=""
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude-dir=$dir"
done

# Search for each URL
for url in "${URLS[@]}"; do
  echo -e "\nSearching for: $url"
  grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" $EXCLUDE_PATTERN "$url" . || echo "No occurrences found for $url in code files"
done

echo -e "\nChecking service files specifically..."
grep -r --include="*Service*.js" --include="*Parser*.js" $EXCLUDE_PATTERN "HTTP-Referer" . 

echo -e "\nDone checking for hardcoded URLs."
