/**
 * Premium Timetable AI Parser Test
 * 
 * This script helps test the enhanced JSON parsing capabilities
 * of the AI Parser service, specifically focusing on handling truncated
 * responses from Gemini models via OpenRouter API.
 */

const { parseTimetableWithChuteAI } = require('./src/services/aiParserService.js');

// Sample timetable data for testing
const sampleTimetableText = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
Day 1,Period 4,History,HIST101,Room D,Mr. Johnson,12:30pm,1:30pm
Day 1,Period 5,Biology,BIO101,Lab 1,Dr. Brown,2:25pm,3:25pm
Day 2,Period 1,Chemistry,CHEM101,Lab 2,Dr. Miller,8:35am,9:35am
Day 2,Period 2,Computer Science,CS101,Room E,Ms. Taylor,9:40am,10:40am
Day 2,Tutorial,Research Skills,TUT102,Library,Mr. Clark,10:45am,11:20am
`;

// Function to test the parser with handling different error scenarios
async function testAIParser() {
  console.log("Starting AI Parser test with enhanced JSON handling...");
  console.log("------------------------------------------------------");
  
  try {
    // Test normal parsing with model fallback and token limit handling
    console.log("Testing AI Parser with sample timetable data...");
    const result = await parseTimetableWithChuteAI(sampleTimetableText);
    
    // Validate the result
    console.log("\n✅ AI Parser test completed successfully!");
    console.log(`📊 Parsed data summary:`);
    console.log(`   - Days: ${result.days.length}`);
    console.log(`   - Periods: ${result.periods.length}`);
    console.log(`   - Classes days: ${Object.keys(result.classes).length}`);
    
    // Check for Tutorial periods (a common issue)
    let tutorialFound = false;
    for (const day in result.classes) {
      if (result.classes[day].Tutorial && result.classes[day].Tutorial.length > 0) {
        tutorialFound = true;
        console.log(`   - ✅ Tutorial found in ${day}`);
      }
    }
    
    if (!tutorialFound) {
      console.log("   - ⚠️ No Tutorial periods were found in the parsed output");
    }
    
    return result;
  } catch (error) {
    console.error("\n❌ AI Parser test failed:", error.message);
    console.error("Stack trace:", error.stack);
    return null;
  }
}

// Run the test
testAIParser().then(result => {
  if (result) {
    console.log("\nFull parsed result:");
    console.log(JSON.stringify(result, null, 2));
  }
}).catch(error => {
  console.error("Fatal error during test execution:", error);
});

// To run this test: node test-ai-parser-enhanced.js
