/**
 * test-english-truncation.js
 * 
 * This script is designed to test the specialized English class truncation fix
 * that handles the specific Gemini 2.0 Flash truncation at position ~10982
 */

import { fixEnglishTruncation } from './EnglishTruncationFix.js';

// Sample truncated JSON response that exhibits the English pattern truncation
const truncatedEnglishJson = `{
  "days": [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Tutorial", "startTime": "10:45am", "endTime": "11:20am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "(10MA)",
          "room": "Room 101",
          "teacher": "Mr. Smith",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [
        {
          "subject": "Physics",
          "code": "(10PH)",
          "room": "Lab 2",
          "teacher": "Ms. Johnson",
          "startTime": "9:40am",
          "endTime": "10:40am"
        }
      ],
      "Tutorial": [],
      "Period 3": [
        {
          "subject": "English",
          "code": "(10EN`;

// Create the exact 10982 length truncated version
const exactLengthTruncated = truncatedEnglishJson.padEnd(10982, ' ');

// Test various truncation patterns
const truncationTests = [
  { 
    name: "Basic English truncation",
    json: truncatedEnglishJson 
  },
  { 
    name: "Exact 10982 truncation",
    json: exactLengthTruncated
  },
  {
    name: "English with complete code field start",
    json: truncatedEnglishJson + ')"'
  },
  {
    name: "English truncated mid class object",
    json: truncatedEnglishJson + ')", "room": "Room '
  }
];

// Run all tests
async function runTruncationTests() {
  console.log("🧪 ENGLISH CLASS TRUNCATION FIX - TEST SUITE");
  console.log("===========================================\n");

  let passCount = 0;
  let failCount = 0;

  for (const test of truncationTests) {
    console.log(`📌 TEST CASE: ${test.name}`);

    try {
      // First try parsing directly (should fail)
      try {
        JSON.parse(test.json);
        console.log("❌ Test preparation error: Original JSON parsed successfully when it should fail");
        failCount++;
        continue;
      } catch (originalError) {
        const errorPosition = originalError.message.match(/position (\d+)/)?.[1];
        console.log(`✅ As expected, JSON parsing failed at position ${errorPosition || 'unknown'}`);
        
        // Now apply our fix
        console.log("🔧 Applying English truncation fix...");
        const fixedJson = fixEnglishTruncation(test.json, parseInt(errorPosition || 0));
        
        // Try to parse the fixed result
        try {
          const parsedResult = JSON.parse(fixedJson);
          console.log("✅ Successfully parsed fixed JSON!");
          
          // Verify structure
          if (parsedResult.days && parsedResult.periods && parsedResult.classes) {
            console.log("✅ Fixed JSON has valid structure");
            console.log(`   - Days: ${parsedResult.days.length}`);
            console.log(`   - Periods: ${parsedResult.periods.length}`);
            console.log(`   - Classes: ${Object.keys(parsedResult.classes).length} days\n`);
            passCount++;
          } else {
            console.log("❌ Fixed JSON is missing required properties\n");
            failCount++;
          }
        } catch (fixedError) {
          console.log(`❌ Failed to parse fixed JSON: ${fixedError.message}\n`);
          failCount++;
        }
      }
    } catch (testError) {
      console.log(`❌ Test error: ${testError.message}\n`);
      failCount++;
    }
  }

  // Report results
  console.log("===========================================");
  console.log(`TEST SUMMARY: ${passCount} passed, ${failCount} failed`);
  console.log(`RESULT: ${failCount === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run the tests
runTruncationTests();
