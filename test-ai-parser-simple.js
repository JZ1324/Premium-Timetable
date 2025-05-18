// test-ai-parser-simple.js - Test the simplified AI parser

const { parseTimetableSimple } = require('./src/services/aiParserSimplified.js');

// Simple timetable data for testing
const testData = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
Day 2,Period 1,Chemistry,CHEM101,Room C,Dr. Brown,8:35am,9:35am
Day 2,Period 2,Computer Science,CS101,Room E,Ms. Miller,9:40am,10:40am
Day 2,Tutorial,Research Skills,TUT102,Library,Mr. Taylor,10:45am,11:20am
`;

// Function to run the test
async function runTest() {
  console.log("Testing simplified AI parser...");
  console.log("Sending sample timetable data to OpenRouter API");
  
  try {
    console.time("API Request");
    const result = await parseTimetableSimple(testData);
    console.timeEnd("API Request");
    
    console.log("\n--- RESULT SUMMARY ---");
    console.log(`Success: ${result.success}`);
    console.log(`Error: ${result.error || 'None'}`);
    
    if (result.rawResponse) {
      console.log("\n--- RAW API RESPONSE (first 500 chars) ---");
      console.log(result.rawResponse.substring(0, 500) + "...");
    }
    
    if (result.data) {
      console.log("\n--- PARSED DATA (if available) ---");
      if (typeof result.data === 'object') {
        // Pretty print the first part of the object
        const stringified = JSON.stringify(result.data, null, 2);
        console.log(stringified.substring(0, 500) + "...");
      } else {
        console.log(result.data.substring(0, 500) + "...");
      }
    }
    
    console.log("\n--- TEST COMPLETED ---");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test
runTest();
