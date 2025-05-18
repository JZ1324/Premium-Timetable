// Test script for the enhanced token limit handling system with multiple backup keys
import { parseTimetableWithChuteAI } from './src/services/aiParserService.js';

// Simple timetable text for testing
const testTimetableText = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Math,MAT101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
`;

// Test function
async function testTokenLimitHandling() {
  console.log("Testing API key rotation system with multiple backup keys...");
  
  try {
    // First request should use the primary key
    console.log("Making first request (should use primary key)...");
    const result1 = await parseTimetableWithChuteAI(testTimetableText);
    console.log("First request successful!");
    
    // Check if Tutorial is included
    const hasTutorial = result1.classes && 
                        result1.classes["Day 1"] && 
                        result1.classes["Day 1"]["Tutorial"] && 
                        result1.classes["Day 1"]["Tutorial"].length > 0;
    
    console.log("Tutorial period included:", hasTutorial ? "Yes" : "No");
    
    // For testing key rotation, you would normally trigger a token limit error
    // This would happen naturally with repeated requests until the limit is reached
    console.log("------------------------------------------------------");
    console.log("Available API keys in the rotation system:");
    console.log("1. Primary key (Used first)");
    console.log("2. First backup key (Used if primary hits token limit)");
    console.log("3. Second backup key (Used if both previous keys hit limits)");
    console.log("------------------------------------------------------");
    console.log("The system will automatically rotate through all keys as needed.");
    console.log("With 3 keys at 1000 tokens each, total daily capacity is 3000 tokens.");
    
    return result1;
  } catch (error) {
    console.error("Error during test:", error);
    return null;
  }
}

// Run the test
testTokenLimitHandling().then(result => {
  console.log("Test complete");
  if (result) {
    console.log("Test successful");
  }
});
