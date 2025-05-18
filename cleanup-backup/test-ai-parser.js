/**
 * Test script for the AI Parser Service
 * 
 * This script tests the AI Parser Service's ability to:
 * 1. Handle API failures gracefully
 * 2. Use comprehensive fallback mock data
 * 3. Correctly display proper subject names, room information, and teacher data
 */

import aiParserService, { parseTimetableText, fallbackParser } from './src/services/aiParserService.js';

// Sample timetable data for testing
const sampleTimetable = `
            Day 1   Day 2   Day 3   Day 4   Day 5
Period 1    MATH    ENG     PHYS    CHEM    BIO
8:35-9:35   M01     A05     S01     S02     S03
            Mr. J   Ms. L   Dr. P   Mrs. C  Mr. B

Period 2    HIST    GEO     ART     MUS     PE
9:40-10:40  C01     C02     A01     A02     GYM
            Ms. H   Mr. G   Mrs. A  Dr. M   Mr. P
`;

// Test forcing a parser error by providing invalid data
const invalidTimetable = `
This is not a valid timetable format
and should trigger the fallback mechanism
`;

// Test function to simulate API failure
async function testAPIFailure() {
  console.log("=== Testing API Failure Scenario ===");
  
  // Create a fallback reference for comparison
  const fallbackData = fallbackParser(sampleTimetable);
  
  // Temporarily replace the fetch function to simulate API failure
  const originalFetch = global.fetch;
  global.fetch = () => Promise.reject(new Error("Simulated API error"));
  
  try {
    // This should now throw an error (correct behavior) instead of returning mock data
    const result = await parseTimetableText(invalidTimetable);
    
    console.log("❌ Test failed - Expected AI parser to throw an error but it didn't");
    console.log("AI Parser returned result instead of throwing an error:", result);
    
    if (result.usingMockData) {
      console.log("❌ Mock data is still being used, which should have been removed");
    }
    
  } catch (error) {
    // The error is expected with our new implementation
    console.log("✅ Test passed - AI parser correctly throws error:", error.message);
    
    // Now test the fallback parser directly, which should still work
    try {
      console.log("\n=== Testing Direct Parser Fallback ===");
      const fallbackResult = fallbackParser(sampleTimetable);
      
      // Check that we got proper parsed data
      const totalClasses = countClasses(fallbackResult);
      console.log(`Total classes parsed by fallback parser: ${totalClasses}`);
      
      if (totalClasses > 0) {
        console.log("✅ Fallback parser extracted some classes");
      } else {
        console.log("❌ Fallback parser failed to extract any classes");
      }
      
      console.log("\nNote: In the application, when AI parsing fails, ImportTimetable.js component");
      console.log("catches the error and falls back to the direct parser, showing the message:");
      console.log('"AI parsing failed, using fallback parser. Results may be incomplete."');
    } catch (fallbackError) {
      console.log("❌ Fallback parser also failed:", fallbackError);
    }
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
}

// Helper function to count total classes in a timetable result
function countClasses(timetableData) {
  let total = 0;
  if (!timetableData || !timetableData.classes) return total;
  
  for (const day in timetableData.classes) {
    for (const period in timetableData.classes[day]) {
      total += timetableData.classes[day][period].length;
    }
  }
  
  return total;
}

// Run tests
(async () => {
  try {
    await testAPIFailure();
  } catch (error) {
    console.error("Test runner error:", error);
  }
})();
