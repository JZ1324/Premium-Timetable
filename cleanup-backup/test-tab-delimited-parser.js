/**
 * Test script to verify the timetable parser can correctly handle tab-delimited format
 * 
 * This script tests the updated aiParserService.js with a sample tab-delimited timetable
 * to ensure it properly parses the input rather than falling back to mock data.
 */

import aiParserService, { parseTimetableText } from './src/services/aiParserService.js';

// Sample tab-delimited timetable data
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
M 05 Mr Scott Kertes`;

async function testDirectParsing() {
  console.log("=== Testing Tab-Delimited Timetable Parsing ===");

  try {
    // Parse using the direct parser
    const directResult = aiParserService.parseTimeTableDirectly(sampleTimetable);
    
    // Count classes parsed
    let totalClasses = 0;
    for (const day in directResult.classes) {
      for (const period in directResult.classes[day]) {
        totalClasses += directResult.classes[day][period].length;
      }
    }
    
    console.log(`Direct parsing found ${totalClasses} total classes`);
    
    if (totalClasses > 0) {
      // Check for actual classes vs. mock data
      // Mock data has generic classes like "Computer Science" that aren't in our sample
      const firstDayFirstPeriod = directResult.classes["Day 1"]["Period 1"][0] || {};
      
      if (firstDayFirstPeriod.subject === "Specialist Mathematics" && 
          firstDayFirstPeriod.code === "10SPE251101") {
        console.log("✅ SUCCESS: Correctly parsed tab-delimited timetable!");
        console.log(`Found subject: ${firstDayFirstPeriod.subject}`);
        console.log(`Found code: ${firstDayFirstPeriod.code}`);
        console.log(`Found room: ${firstDayFirstPeriod.room}`);
        console.log(`Found teacher: ${firstDayFirstPeriod.teacher}`);
      } else {
        console.log("❌ FAIL: Tab-delimited parsing didn't find the correct classes");
        console.log("Expected: 'Specialist Mathematics' with code '10SPE251101'");
        console.log(`Got: '${firstDayFirstPeriod.subject}' with code '${firstDayFirstPeriod.code}'`);
        console.log("This suggests we're still getting mock data, not actual parsed data");
      }
      
      // Print the first day's classes as a sample
      console.log("\nSample of parsed data (Day 1):");
      for (const period in directResult.classes["Day 1"]) {
        const classes = directResult.classes["Day 1"][period];
        if (classes.length > 0) {
          console.log(`${period}: ${classes.map(c => c.subject).join(', ')}`);
        }
      }
    } else {
      console.log("❌ FAIL: No classes found in direct parsing");
    }
    
    return directResult;
  } catch (error) {
    console.error("Error during test:", error);
    return null;
  }
}

async function testFullParsing() {
  console.log("\n=== Testing Full Parse Method (Combined Direct + AI) ===");

  try {
    // Parse using the full method (which tries direct then AI)
    const result = await parseTimetableText(sampleTimetable);
    
    // Count classes parsed
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(`Full parsing found ${totalClasses} total classes`);
    
    if (totalClasses > 0) {
      // Check for actual classes vs. mock data
      const firstDayFirstPeriod = result.classes["Day 1"]["Period 1"][0] || {};
      
      if (firstDayFirstPeriod.subject === "Specialist Mathematics" && 
          firstDayFirstPeriod.code === "10SPE251101") {
        console.log("✅ SUCCESS: Full parse method correctly handled tab-delimited timetable!");
      } else {
        console.log("❌ FAIL: Full parse method didn't find the correct classes");
        console.log("Expected: 'Specialist Mathematics' with code '10SPE251101'");
        console.log(`Got: '${firstDayFirstPeriod.subject}' with code '${firstDayFirstPeriod.code}'`);
      }
    } else {
      console.log("❌ FAIL: No classes found in full parsing");
    }
    
    return result;
  } catch (error) {
    console.error("Error during full parse test:", error);
    return null;
  }
}

// Run the tests
(async () => {
  try {
    const directResult = await testDirectParsing();
    const fullResult = await testFullParsing();
    
    // Compare results
    if (directResult && fullResult) {
      const directClassCount = Object.values(directResult.classes)
        .flatMap(day => Object.values(day))
        .flat().length;
        
      const fullClassCount = Object.values(fullResult.classes)
        .flatMap(day => Object.values(day))
        .flat().length;
      
      console.log("\n=== Comparison ===");
      console.log(`Direct parsing found: ${directClassCount} classes`);
      console.log(`Full parsing found: ${fullClassCount} classes`);
      
      if (directClassCount > 0 && fullClassCount > 0) {
        console.log("Both parsing methods successfully found classes!");
      } else if (directClassCount > 0) {
        console.log("Only direct parsing successfully found classes");
      } else if (fullClassCount > 0) {
        console.log("Only full parsing successfully found classes");
      } else {
        console.log("Neither parsing method found classes");
      }
    }
  } catch (e) {
    console.error("Test runner error:", e);
  }
})();
