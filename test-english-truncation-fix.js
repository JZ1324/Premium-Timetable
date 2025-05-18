// test-english-truncation-fix.js
// A comprehensive test for the English class truncation fix

// Import the fixEnglishTruncation function using CommonJS
const { fixEnglishTruncation } = require('./EnglishTruncationFix.js');

console.log("Testing English Truncation Fix Functionality");
console.log("============================================");

// Sample truncated JSON content with the English class issue
const truncatedJSON = `{
  "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
  "periods": [
    {"name": "Period 1", "startTime": "8:35am", "endTime": "9:35am"},
    {"name": "Period 2", "startTime": "9:40am", "endTime": "10:40am"},
    {"name": "Tutorial", "startTime": "10:45am", "endTime": "11:20am"},
    {"name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm"},
    {"name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm"},
    {"name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm"}
  ],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "10MAT",
          "room": "M 07",
          "teacher": "Mr Smith",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [],
      "Tutorial": [],
      "Period 3": [
        {
          "subject": "English",
          "code": "10EN`;

// Get the approximate truncation position
const truncationPos = truncatedJSON.lastIndexOf('"subject": "English"');
console.log(`Truncation position: ${truncationPos}`);

// Test the fixEnglishTruncation function
console.log("\n1. Testing fixEnglishTruncation function");
const fixedJSON = fixEnglishTruncation(truncatedJSON, truncationPos);

// Check if the fix worked
console.log("\n2. Checking if the fix worked");
try {
  const parsedJSON = JSON.parse(fixedJSON);
  console.log("✅ Successfully parsed fixed JSON");
  
  // Verify the structure is valid
  if (parsedJSON.days && parsedJSON.periods && parsedJSON.classes) {
    console.log("✅ JSON structure maintains days, periods, and classes");
    
    // Check if the truncated English class was properly handled
    const day1Classes = parsedJSON.classes["Day 1"] || {};
    const period3Classes = day1Classes["Period 3"] || [];
    
    if (Array.isArray(period3Classes)) {
      console.log(`✅ Period 3 remains an array with ${period3Classes.length} entries`);
    } else {
      console.log("❌ Period 3 is not properly structured");
    }
  } else {
    console.log("❌ JSON structure is missing required elements");
  }
  
  console.log("\nFixed JSON preview:");
  console.log(fixedJSON.substring(0, 200) + "...");
} catch (e) {
  console.log("❌ Failed to parse fixed JSON:", e.message);
}

// Test with other potential variations of the truncation pattern
console.log("\n3. Testing detection patterns");

// Test pattern 1 - basic pattern detection
const pattern1 = /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/;
const match1 = pattern1.test(truncatedJSON);
console.log(`Pattern 1 (basic pattern): ${match1 ? '✅ Detected' : '❌ Not detected'}`);

// Test pattern 3 - 10EN specific
const pattern3 = /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"10EN[^\"]*$/;
const match3 = pattern3.test(truncatedJSON);
console.log(`Pattern 3 (10EN specific): ${match3 ? '✅ Detected' : '❌ Not detected'}`);

// Test with pattern that was causing "Unterminated group" errors
console.log("\n4. Testing problematic pattern handling");
try {
  // This should fail - it's the pattern that was causing errors
  const badPattern = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"\(10EN[^\"]*$');
  console.log("❌ Bad pattern did not throw error as expected");
} catch (e) {
  console.log(`✅ Bad pattern correctly throws error: ${e.message}`);
}

console.log("\n============================================");
console.log("English truncation fix tests completed");
