#!/bin/zsh

# GitHub Pages Deployment Health Check
# This script checks if your GitHub Pages deployment is healthy

echo "🔍 Checking GitHub Pages deployment health..."

# Define the deployment URL
GITHUB_PAGES_URL="https://jz1324.github.io/timetables/"

# Check if curl is available
if ! command -v curl &> /dev/null; then
  echo "❌ curl could not be found. Please install curl to run this health check."
  exit 1
fi

# Function to check HTTP status
check_url() {
  local url=$1
  local description=$2
  
  echo "Checking $description: $url"
  
  # Get HTTP status code
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [[ $status -eq 200 ]]; then
    echo "✅ $description is accessible (Status: $status)"
    return 0
  else
    echo "❌ $description is not accessible (Status: $status)"
    return 1
  fi
}

# Check main URL
check_url "$GITHUB_PAGES_URL" "Main Page"

# Check a specific route with hash
check_url "${GITHUB_PAGES_URL}#/settings" "Settings Page"

# Check if resources are accessible
check_url "${GITHUB_PAGES_URL}bundle.js" "JavaScript Bundle"
check_url "${GITHUB_PAGES_URL}assets/themes/light.css" "CSS Theme"

echo ""
echo "📋 Health Check Summary:"
echo "------------------------"
echo "1. If all checks passed, your deployment is healthy"
echo "2. If any checks failed, verify your GitHub Pages settings"
echo "3. Look for error messages in the browser console"
echo ""
echo "For detailed troubleshooting, see GITHUB_PAGES_VERIFICATION.md"
