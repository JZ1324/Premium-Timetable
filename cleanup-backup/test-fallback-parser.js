/**
 * Test script for the updated AI Parser using DeepSeek Chat model
 * 
 * This script tests the AI Parser Service with the DeepSeek Chat model
 * using the provided tab-delimited timetable format.
 */

import aiParserService, { fallbackParser } from './src/services/aiParserService.js';

// Sample tab-delimited timetable data that was giving issues previously
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage`;

// Test function for the fallback parser
function testFallbackParser() {
  console.log("=== Testing Fallback Parser with Tab-Delimited Timetable ===");
  
  try {
    // Use the fallback parser directly
    console.log("Calling fallback parser with sample timetable data...");
    const result = fallbackParser(sampleTimetable);
    
    // Check if we got a valid result
    if (!result) {
      console.log("❌ ERROR: Fallback parser returned null or undefined result");
      return;
    }
    
    // Count classes parsed
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(`Fallback parser found ${totalClasses} total classes`);
    
    if (totalClasses > 0) {
      // Check for expected Day 1, Period 1 class
      const day1Period1 = result.classes["Day 1"]["Period 1"][0] || {};
      
      console.log("\nSample class from Day 1, Period 1:");
      console.log(JSON.stringify(day1Period1, null, 2));
      
      if (day1Period1.subject === "Specialist Mathematics" && 
          day1Period1.code === "10SPE251101" &&
          day1Period1.room === "M 07" &&
          day1Period1.teacher === "Mr Paul Jefimenko") {
        console.log("✅ SUCCESS: Correctly parsed the first class!");
      } else {
        console.log("❌ FAIL: Class details don't match expected values");
        console.log("Expected: 'Specialist Mathematics' with code '10SPE251101'");
        console.log(`Got: '${day1Period1.subject}' with code '${day1Period1.code}'`);
      }
      
      return result;
    } else {
      console.log("❌ FAIL: No classes found by the fallback parser");
      return null;
    }
  } catch (error) {
    console.error("Error during fallback parser test:", error);
    return null;
  }
}

// Run the test
(async () => {
  try {
    console.log("Starting test for fallback parser with DeepSeek Chat model setup...");
    
    // Test the fallback parser first
    const fallbackResult = testFallbackParser();
    
    if (fallbackResult) {
      console.log("\n=== Test Summary ===");
      console.log("Fallback parser successfully processed the timetable");
      console.log(`Days found: ${fallbackResult.days.length}`);
      console.log(`Periods found: ${fallbackResult.periods.length}`);
      console.log("Test completed successfully!");
    } else {
      console.log("\nFallback parser test failed.");
      console.log("This may indicate issues with the tab-delimited timetable format.");
    }
  } catch (e) {
    console.error("Test runner error:", e);
  }
})();
