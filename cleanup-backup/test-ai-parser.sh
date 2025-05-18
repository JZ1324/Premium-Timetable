#!/bin/bash
# Script to test the AI Parser Service with its fallback mechanisms

echo "=== AI Parser Service Test ==="
echo "Testing fallback mechanisms and comprehensive mock data"

# Set up the environment for running the test
NODE_ENV=development

# Run the test
echo "Running the test..."
node test-ai-parser.js

# Exit with success
echo "Test completed."
