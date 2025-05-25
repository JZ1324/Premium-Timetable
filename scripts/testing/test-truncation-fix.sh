#!/bin/zsh
# test-truncation-fix.sh
# This script tests the enhanced truncation fix for the English class pattern in Gemini responses

# Set the execution path
cd /Users/joshuazheng/Downloads/Vscode/timetable\ premium/Premium-Timetable

# Bold and color outputs for better readability
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo "${BOLD}${GREEN}=======================================================${RESET}"
echo "${BOLD}${GREEN}     TESTING GEMINI JSON TRUNCATION FIX     ${RESET}"
echo "${BOLD}${GREEN}=======================================================${RESET}"

# 1. Test the general Gemini truncation fix
echo "\n${YELLOW}[1] Testing general Gemini truncation fix...${RESET}"
node test-gemini-truncation-fix.js

# 2. Test the specific English truncation fix
echo "\n${YELLOW}[2] Testing specific English class truncation fix...${RESET}"
node test-english-truncation.js

# 3. Test the integrated fix in the aiParser service (requires mock response)
echo "\n${YELLOW}[3] Running integrated aiParserService test...${RESET}"

# Create a temporary test file for the integrated test
cat > test-integrated-fix.js << EOL
import { parseTimetableWithChuteAI } from './src/services/aiParserService.js';

// Mock fetch for testing
globalThis.fetch = async () => {
  return {
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify({
            "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
            "periods": [
              { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
              { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" }
            ],
            "classes": {
              "Day 1": {
                "Period 1": [{ 
                  "subject": "English", 
                  "code": "(10EN", 
                  "room": "Room A1"
                }]
              }
            }
          })
        }
      }]
    })
  };
};

// Test the parser with artificial response
async function testIntegratedFix() {
  try {
    console.log("Testing integrated fix in aiParserService...");
    const result = await parseTimetableWithChuteAI("Sample timetable");
    console.log("✅ Parser returned successfully with result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Parser test failed:", error);
  }
}

testIntegratedFix();
EOL

# Run the integrated test
node test-integrated-fix.js

# Clean up the temporary file
rm test-integrated-fix.js

echo "\n${BOLD}${GREEN}=======================================================${RESET}"
echo "${BOLD}${GREEN}     TRUNCATION FIX TESTING COMPLETE     ${RESET}"
echo "${BOLD}${GREEN}=======================================================${RESET}"
