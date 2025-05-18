/**
 * Simple Test for AI Parser Service
 */

// Import the service
import aiParserService from './src/services/aiParserService.js';

console.log("=== Testing AI Parser Service ===");
console.log("AI Parser Service:", aiParserService ? "Loaded successfully" : "Failed to load");
console.log("Model being used:", aiParserService.MODEL);

// Test the parse function
async function testParse() {
  try {
    // Simple timetable data
    const simpleTimetable = `Day 1 - Period 1: Math with Mr. Smith
Day 2 - Period 1: English with Ms. Johnson`;
    
    console.log("\nTesting with simple timetable data...");
    const result = await aiParserService.parseTimeTable(simpleTimetable);
    
    console.log("Parse result:", result ? "Success" : "Failed");
    console.log("Days:", result.days);
    console.log("Periods:", result.periods.map(p => p.name));
    
  } catch (error) {
    console.error("Error testing parser:", error);
  }
}

testParse();
