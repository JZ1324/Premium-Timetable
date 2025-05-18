#!/bin/bash
# Organize MD documentation files into a structured docs directory

# Print header
echo "========================================================="
echo "  Documentation Files Organization"
echo "  $(date)"
echo "========================================================="

# Create docs directory with subdirectories
echo "Creating docs directory structure..."
mkdir -p docs/ai-parser
mkdir -p docs/deployment
mkdir -p docs/setup
mkdir -p docs/features

# Move AI parser-related docs
echo -e "\nOrganizing AI Parser documentation..."
mv AI_PARSER_*.md docs/ai-parser/
mv ai-parser-fix-documentation.md docs/ai-parser/
mv DEEPSEEK_TAB_PARSER_ENHANCEMENT.md docs/ai-parser/
mv PARSER_ENHANCEMENTS_SUMMARY.md docs/ai-parser/
mv TAB_DELIMITED_*.md docs/ai-parser/

# Move deployment-related docs
echo -e "\nOrganizing Deployment documentation..."
mv DEPLOYMENT_STATUS.md docs/deployment/
mv VERCEL_DEPLOYMENT*.md docs/deployment/
mv GITHUB_PAGES*.md docs/deployment/
mv MANUAL_DEPLOYMENT.md docs/deployment/
mv FIREBASE_SECURITY.md docs/deployment/

# Move setup-related docs
echo -e "\nOrganizing Setup documentation..."
mv ADMIN_SETUP.md docs/setup/
mv ENV_SETUP.md docs/setup/

# Move feature-related docs
echo -e "\nOrganizing Feature documentation..."
mv MULTIPLE_CLASSES_PER_PERIOD.md docs/features/
mv SIGNUP_BUTTON_FIX.md docs/features/
mv ISSUE_FIXES.md docs/features/
mv OPENROUTER_MIGRATION.md docs/features/

# Handle README specially
echo -e "\nUpdating README..."
if [ -f "README 10.27.47 PM.md" ]; then
  mv "README 10.27.47 PM.md" docs/README-backup.md
  # Create a new README.md if it doesn't exist
  if [ ! -f "README.md" ]; then
    cat > README.md << EOL
# Premium-Timetable

A customizable timetable application that allows users to personalize their own timetable and select from different themes.

## Documentation

Documentation is available in the \`docs\` directory, organized by topic:

- [AI Parser Documentation](docs/ai-parser/) - Information about the AI parser implementation and fixes
- [Deployment Guides](docs/deployment/) - Instructions for deploying to various platforms
- [Setup Guides](docs/setup/) - Setup instructions for admins and developers
- [Feature Documentation](docs/features/) - Details about specific features and fixes

## Recent Changes

See the [ai-parser-fix-documentation.md](docs/ai-parser/ai-parser-fix-documentation.md) for details about the recent AI parser enhancement fix.
EOL
    echo "Created a new README.md file"
  fi
fi

# Move other MD files that don't fit into categories
echo -e "\nMoving other documentation files..."
mkdir -p docs/misc
mv *.md docs/misc/ 2>/dev/null || true
# Move README back to root if it was moved
[ -f docs/misc/README.md ] && mv docs/misc/README.md ./

echo -e "\nDocumentation organization complete!"
echo "All documentation files have been moved to the docs/ directory"
echo "========================================================="
