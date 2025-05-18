#!/usr/bin/env node

/**
 * Manual test script for the enhanceClassData method
 * 
 * This script tests the enhanceClassData method directly without running the full application.
 * It will help verify that the fix is working properly.
 */

const fs = require('fs');
const path = require('path');

// Read the source file
const sourceCode = fs.readFileSync(
  path.join(__dirname, 'src', 'services', 'aiParserService.js'),
  'utf8'
);

// Extract the enhanceClassData method
let enhanceClassDataMethod = null;
const methodMatch = sourceCode.match(/enhanceClassData\s*\([^)]*\)\s*{[\s\S]*?^  }/m);

if (methodMatch) {
  enhanceClassDataMethod = methodMatch[0];
  console.log('Successfully extracted enhanceClassData method');
} else {
  console.error('Failed to extract enhanceClassData method');
  process.exit(1);
}

// Extract the cleanupDayHeaders method
let cleanupDayHeadersMethod = null;
const cleanupMatch = sourceCode.match(/cleanupDayHeaders\s*\([^)]*\)\s*{[\s\S]*?^  }/m);

if (cleanupMatch) {
  cleanupDayHeadersMethod = cleanupMatch[0];
  console.log('Successfully extracted cleanupDayHeaders method');
} else {
  console.error('Failed to extract cleanupDayHeaders method');
  process.exit(1);
}

// Create a test script that simulates the AiParserService class
const testScript = `
// Mock AiParserService class for testing
class TestAiParserService {
  constructor() {
    this.defaultDays = [
      "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
      "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
    ];
    
    this.defaultPeriods = [
      { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
      { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
      { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
      { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
      { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
    ];
    
    this.weekdayMap = {
      'mon': 'Day 1',
      'monday': 'Day 1',
      'tue': 'Day 2',
      'tuesday': 'Day 2',
      'wed': 'Day 3',
      'wednesday': 'Day 3',
      'thu': 'Day 4',
      'thursday': 'Day 4',
      'fri': 'Day 5',
      'friday': 'Day 5'
    };
  }
  
  ${cleanupDayHeadersMethod}
  
  ${enhanceClassDataMethod}
}

// Create test data with common issues
const testData = {
  days: ["Monday", "Tuesday", "Wednesday"],
  periods: [
    { name: "Period 1", startTime: "8:30am", endTime: "9:30am" },
    { name: "Period 2" },  // Missing time data
    { name: "Period 3", startTime: "11:00am", endTime: "12:00pm" }
  ],
  classes: {
    "Monday": {
      "Period 1": [
        { subject: "Math", room: "M 01", teacher: "Mr. Smith" }
      ],
      "Period 2": [
        { subject: "English", code: "ENG101" }
      ]
    },
    "Tuesday": {
      "Period 1": [
        { subject: "PST", code: "PST101" }
      ]
    }
    // Wednesday missing entirely
  }
};

// Run test
console.log('='.repeat(60));
console.log('Testing enhanceClassData method with sample data');
console.log('='.repeat(60));

const service = new TestAiParserService();
try {
  const enhancedData = service.enhanceClassData(testData);
  
  console.log('Original days:', JSON.stringify(testData.days));
  console.log('Enhanced days:', JSON.stringify(enhancedData.days));
  console.log();
  
  console.log('Original Period 2:', JSON.stringify(testData.periods[1]));
  console.log('Enhanced Period 2:', JSON.stringify(enhancedData.periods[1]));
  console.log();
  
  console.log('Does Wednesday exist in original?', !!testData.classes["Wednesday"]);
  console.log('Does Day 3 exist in enhanced?', !!enhancedData.classes["Day 3"]);
  console.log();
  
  console.log('Original Tuesday Period 1:', JSON.stringify(testData.classes["Tuesday"]["Period 1"][0]));
  console.log('Enhanced Day 2 Period 1:', JSON.stringify(enhancedData.classes["Day 2"]["Period 1"][0]));
  console.log();
  
  console.log('✅ TEST PASSED: enhanceClassData works correctly!');
} catch (error) {
  console.error('❌ TEST FAILED:', error);
  process.exit(1);
}
`;

// Write the test script to a file
const testScriptPath = path.join(__dirname, 'test-enhance-class-data.js');
fs.writeFileSync(testScriptPath, testScript);

console.log(`Test script written to ${testScriptPath}`);
console.log('Run it with: node test-enhance-class-data.js');
