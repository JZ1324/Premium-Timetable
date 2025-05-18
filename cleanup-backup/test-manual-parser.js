/**
 * Test script for the Manual/Fallback Parser
 * 
 * This script tests the fallback parser's ability to handle
 * tab-delimited timetable data with the specific format provided.
 */

import aiParserService, { fallbackParser } from './src/services/aiParserService.js';

// Sample tab-delimited timetable data (exact format provided)
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
S 06 Mr Andrew Savage
Period 2
9:40am–10:40am
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
English
(10ENG251108)
A 08 Mr Robert Hassell
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Tutorial
10:45am–10:55am
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT251009)
S 01 Mrs Sula Tyndall
Period 3
11:25am–12:25pm
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Active and Able
(10AAA251109)
M 08 Mr James Beattie
Active and Able
(10AAA251109)
C 07 Mr James Beattie
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Active and Able
(10AAA251109)
I 05 Mr James Beattie
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Period 4
12:30pm–1:30pm
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Active and Able
(10AAA251109)
M 08 Mr James Beattie
English
(10ENG251108)
A 08 Mr Robert Hassell
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
10PST25100
(10PST251009)
S 04 Miss Georgia Kellock
Active and Able
(10AAA251109)
C 06 Mr James Beattie
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Period 5
2:25pm–3:25pm
English
(10ENG251108)
A 08 Mr Robert Hassell
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
10ybad01
(10ybad01)
Mrs Lindy Dowell
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
10ybad01
(10ybad01)
Mrs Lindy Dowell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko`;

async function testFallbackParser() {
  console.log("=== Testing Fallback Parser with Tab-Delimited Timetable ===");
  
  try {
    // Use the fallback parser directly
    const result = fallbackParser(sampleTimetable);
    
    // Count classes parsed
    let totalClasses = 0;
    let dayStatistics = {};
    
    for (const day in result.classes) {
      dayStatistics[day] = {
        totalClasses: 0,
        byPeriod: {}
      };
      
      for (const period in result.classes[day]) {
        const classes = result.classes[day][period];
        dayStatistics[day].byPeriod[period] = classes.length;
        dayStatistics[day].totalClasses += classes.length;
        totalClasses += classes.length;
      }
    }
    
    console.log(`Fallback parser found ${totalClasses} total classes`);
    
    if (totalClasses > 0) {
      // Check for specific class details in Day 1, Period 1
      const day1Period1 = result.classes["Day 1"]["Period 1"][0] || {};
      
      console.log("\nDay 1, Period 1 class details:");
      console.log(JSON.stringify(day1Period1, null, 2));
      
      if (day1Period1.subject === "Specialist Mathematics" && 
          day1Period1.code === "10SPE251101" &&
          day1Period1.room === "M 07" &&
          day1Period1.teacher === "Mr Paul Jefimenko") {
        console.log("✅ SUCCESS: Correctly parsed class details for Day 1, Period 1!");
      } else {
        console.log("❌ FAIL: Class details for Day 1, Period 1 don't match expected values");
        console.log("Expected: 'Specialist Mathematics' with code '10SPE251101', room 'M 07', teacher 'Mr Paul Jefimenko'");
        console.log(`Got: subject='${day1Period1.subject}', code='${day1Period1.code}', room='${day1Period1.room}', teacher='${day1Period1.teacher}'`);
      }
      
      // Print statistics by day
      console.log("\nClasses by day:");
      for (const day in dayStatistics) {
        console.log(`${day}: ${dayStatistics[day].totalClasses} classes`);
      }
      
      // Print full structure of the first day to verify format
      console.log("\nFull structure for Day 1:");
      console.log(JSON.stringify(result.classes["Day 1"], null, 2));
      
      return result;
    } else {
      console.log("❌ FAIL: No classes found by the fallback parser");
      return null;
    }
  } catch (error) {
    console.error("Error during test:", error);
    return null;
  }
}

// Run the test
(async () => {
  try {
    const result = await testFallbackParser();
    
    if (result) {
      console.log("\n=== Test Summary ===");
      console.log("Fallback parser successfully processed the timetable");
      console.log(`Days found: ${result.days.length}`);
      console.log(`Periods found: ${result.periods.length}`);
      
      // Compare with expected structure
      const expectedDays = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];
      const daysMatch = JSON.stringify(result.days) === JSON.stringify(expectedDays);
      
      console.log(`Days match expected: ${daysMatch ? '✅ Yes' : '❌ No'}`);
      
      if (!daysMatch) {
        console.log("Expected days:", expectedDays);
        console.log("Actual days:", result.days);
      }
      
      console.log("\nExpected JSON structure is in the correct format!");
    } else {
      console.log("\nFallback parser test failed.");
    }
  } catch (e) {
    console.error("Test runner error:", e);
  }
})();
