#!/bin/bash

# Test script for the updated AI parser with llama-3.3-8b model

echo "========================================"
echo "Premium Timetable - Testing Updated Parser"
echo "========================================"

# Create a sample test file
echo "Creating sample timetable for testing..."
cat > test-timetable.txt << 'EOF'
         Day 1     Day 2     Day 3     Day 4     Day 5
Period 1  Math A12  English A8  Science B3  History C5  Art D1
          French C2  Spanish B6  Music D4    PE Gym     Drama E2 
Period 2  Science B3  Math A12  English A8  French C2   History C5
Period 3  History C5  Science B3  Math A12   English A8  French C2
Period 4  English A8  History C5  French C2  Math A12    Science B3
Period 5  PE Gym     Art D1      Drama E2    Music D4    Spanish B6
EOF

# Create a simple test script
cat > test-ai-parser.js << 'EOF'
// Test script for the AI parser

// Import required modules
const fs = require('fs');
const { parseTimetableText } = require('./src/services/aiParserService');

// Read the test timetable
const timetableText = fs.readFileSync('./test-timetable.txt', 'utf8');

// Define a mock API key management function for testing
jest.mock('./src/utils/apiKeyManager', () => ({
  getOpenRouterApiKey: () => 'test-api-key'
}));

// Mock the fetch function
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  body: {
    getReader: () => ({
      read: () => Promise.resolve({
        done: true,
        value: new Uint8Array(0)
      })
    })
  },
  json: () => Promise.resolve({
    choices: [
      {
        message: {
          content: `{
            "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
            "periods": [
              { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
              { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" }
            ],
            "classes": {
              "Day 1": {
                "Period 1": [
                  { "subject": "Math", "code": "", "room": "A12", "teacher": "", "startTime": "8:35am", "endTime": "9:35am" },
                  { "subject": "French", "code": "", "room": "C2", "teacher": "", "startTime": "8:35am", "endTime": "9:35am" }
                ]
              }
            }
          }`
        }
      }
    ]
  })
}));

// TextDecoder mock
global.TextDecoder = class TextDecoder {
  decode() {
    return '';
  }
};

// Run the test
async function runTest() {
  try {
    console.log('Testing parser with sample timetable...');
    const result = await parseTimetableText(timetableText);
    console.log('Parser returned a result:', !!result);
    console.log('Result has days:', Array.isArray(result.days));
    console.log('Result has periods:', Array.isArray(result.periods));
    console.log('Result has classes object:', typeof result.classes === 'object');
    
    // Check if we have multiple classes in any period
    let multiClassCount = 0;
    let totalClasses = 0;
    
    Object.keys(result.classes).forEach(day => {
      Object.keys(result.classes[day]).forEach(period => {
        const classes = result.classes[day][period];
        if (Array.isArray(classes)) {
          totalClasses += classes.length;
          if (classes.length > 1) {
            multiClassCount++;
          }
        }
      });
    });
    
    console.log(`Total classes found: ${totalClasses}`);
    console.log(`Periods with multiple classes: ${multiClassCount}`);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during parser test:', error);
  }
}

runTest();
EOF

echo "Running mock test of updated parser..."
node test-ai-parser.js

echo ""
echo "Test Complete!"
echo "Note: This was a mock test that didn't actually call the API."
echo "To run a real test with your API key, you'll need to modify the test script."
echo "=========================================="
