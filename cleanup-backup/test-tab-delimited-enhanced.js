/**
 * Enhanced Tab-Delimited Timetable Parser Test
 * 
 * This script tests the enhanced AI parser's capability to handle tab-delimited timetable formats.
 */

// Import the necessary dependencies
const aiParserService = require('./src/services/aiParserService.js').default;
const fs = require('fs');
const path = require('path');

// Additional tab-delimited timetable examples with more complex formats
const sampleTabDelimited = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:30am-9:30am
Mathematics\t\tEnglish\tScience\tHistory
(10MAT251)\t\t(10ENG251)\t(10SCI251)\t(10HIS251)
Room M1\t\tRoom E3\tRoom S2\tRoom H4
Mr. Smith\t\tMs. Johnson\tMr. Lee\tMr. Williams

Period 2
9:35am-10:35am
English\tMathematics\t\tGeography\tPhysical Education
(10ENG251)\t(10MAT251)\t\t(10GEO251)\t(10PED251)
Room E3\tRoom M1\t\tRoom G2\tGym
Ms. Johnson\tMr. Smith\t\tMrs. Brown\tMs. Davis

Period 3
11:00am-12:00pm
Science\tHistory\tMathematics\tPhysical Education\t
(10SCI251)\t(10HIS251)\t(10MAT251)\t(10PED251)\t
Room S2\tRoom H4\tRoom M1\tGym\t
Mr. Lee\tMr. Williams\tMr. Smith\tMs. Davis\t`;

// More complex example with multiple subjects in the same period
const complexTabDelimited = `Monday\tTuesday\tWednesday\tThursday\tFriday
Period 1
8:35am - 9:35am
Mathematics Advanced
(10MAA251105)
M 05 Mr Jones
	Physics
(10PHY251102)
S 01 Mr Smith
	English
(10ENG251108)
A 08 Mr Brown
	Mathematics Advanced
(10MAA251105)
M 05 Mr Jones
	Physics
(10PHY251102)
S 01 Mr Smith

Period 2
9:40am - 10:40am
English
(10ENG251108)
A 08 Mr Brown
	Mathematics Advanced
(10MAA251105)
M 05 Mr Jones
	Physics
(10PHY251102)
S 01 Mr Smith
	Biology Units 1 & 2
(11BIO251101)
S 06 Mr Green
	English
(10ENG251108)
A 08 Mr Brown

Tutorial
10:40am - 11:10am
Year 10 Tutorial
	Year 10 Tutorial
	Year 10 Tutorial
	Year 10 Tutorial
	Year 10 Tutorial

Period 3
11:30am - 12:30pm
War Boom and Bust
(10WBB251102)
C 07 Ms Wilson
	English
(10ENG251108)
A 08 Mr Brown
	Mathematics Advanced
(10MAA251105)
M 05 Mr Jones
	Physics
(10PHY251102)
S 01 Mr Smith
	Biology Units 1 & 2
(11BIO251101)
S 06 Mr Green`;

// Run tests
async function runTests() {
  try {
    console.log("========== TAB-DELIMITED PARSER ENHANCEMENT TEST ==========\n");
    
    // Test 1: Format Detection
    console.log("Test 1: Format Detection");
    console.log("-------------------------------------------");
    const simpleFormat = aiParserService.analyzeTimetableFormat(sampleTabDelimited);
    const complexFormat = aiParserService.analyzeTimetableFormat(complexTabDelimited);
    
    console.log("Simple format detection result:", simpleFormat);
    console.log("Complex format detection result:", complexFormat);
    console.log("Format detection test completed.\n");
    
    // Test 2: Tab Delimited Parser Module
    console.log("Test 2: Tab Delimited Parser Module");
    console.log("-------------------------------------------");
    try {
      const tabResult = tabDelimitedParser.parseTabDelimitedTimetable(
        sampleTabDelimited,
        aiParserService.defaultDays,
        aiParserService.defaultPeriods
      );
      
      // Count classes
      let classCount = 0;
      for (const day in tabResult.classes) {
        for (const period in tabResult.classes[day]) {
          classCount += tabResult.classes[day][period].length;
        }
      }
      
      console.log(`Tab Parser found ${classCount} classes`);
      console.log("Sample class:", JSON.stringify(
        Object.values(tabResult.classes)[0]["Period 1"][0] || {}, null, 2
      ));
      
      console.log("Tab Parser module test completed.\n");
    } catch (err) {
      console.error("Tab Parser module test failed:", err);
    }
    
    // Test 3: Full AI Parser Integration
    console.log("Test 3: Full AI Parser Integration");
    console.log("-------------------------------------------");
    try {
      // Create a test file to process
      const testFilePath = path.join(__dirname, 'tab-delimited-test.txt');
      await fs.writeFile(testFilePath, complexTabDelimited);
      
      console.log("Created test timetable file. Starting parsing process...");
      
      const result = await aiParserService.parseTimeTable(complexTabDelimited);
      
      // Count classes
      let aiClassCount = 0;
      for (const day in result.classes) {
        for (const period in result.classes[day]) {
          aiClassCount += result.classes[day][period].length;
        }
      }
      
      console.log(`AI Parser found ${aiClassCount} classes using enhanced approach`);
      console.log("Sample class:", JSON.stringify(
        Object.values(result.classes)[0]["Period 1"][0] || {}, null, 2
      ));
      
      // Clean up
      try {
        await fs.unlink(testFilePath);
        console.log("Test file removed.");
      } catch (cleanupErr) {
        console.warn("Could not remove test file:", cleanupErr);
      }
      
      console.log("Full AI Parser integration test completed.\n");
    } catch (err) {
      console.error("Full AI Parser integration test failed:", err);
    }
    
    console.log("========== ALL TESTS COMPLETED ==========");
  } catch (err) {
    console.error("Test process failed:", err);
  }
}

runTests();
