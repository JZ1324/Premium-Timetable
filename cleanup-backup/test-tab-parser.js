/**
 * Test for Tab-Delimited Parser
 * 
 * This script tests the optimized parsing for tab-delimited timetables
 * using the DeepSeek Chat model with specialized prompts.
 */

// Import the tab-delimited parser utility
const { constructTabDelimitedPrompt, isTabDelimitedTimetable } = require('./tab-delimited-parser');
const aiParserService = require('./src/services/aiParserService');

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
S 06 Mr Andrew Savage`;

/**
 * Test the tab-delimited parser
 */
async function testTabDelimitedParser() {
  console.log("=== Testing Tab-Delimited Parser with DeepSeek Model ===\n");
  
  // Check if this is detected as a tab-delimited timetable
  const isTabFormat = isTabDelimitedTimetable(sampleTimetable);
  console.log(`Is tab-delimited format: ${isTabFormat ? 'Yes' : 'No'}`);
  
  if (!isTabFormat) {
    console.log("Warning: Sample data not detected as tab-delimited format");
  }
  
  try {
    console.log("\nGenerating specialized prompt for tab-delimited format...");
    const prompt = constructTabDelimitedPrompt(sampleTimetable);
    
    // Temporarily extend the aiParserService to use our specialized prompt
    if (!aiParserService.constructTabDelimitedPrompt) {
      aiParserService.constructTabDelimitedPrompt = constructTabDelimitedPrompt;
    }
    
    console.log("\nParsing timetable with specialized prompt...");
    const result = await aiParserService.parseTimeTable(sampleTimetable);
    
    // Check the results
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    if (totalClasses > 0) {
      console.log(`\n✅ Success! Extracted ${totalClasses} classes from the tab-delimited timetable.`);
      
      // Print a sample class
      const firstDay = Object.keys(result.classes)[0];
      const firstPeriod = Object.keys(result.classes[firstDay])[0];
      if (result.classes[firstDay][firstPeriod].length > 0) {
        const sampleClass = result.classes[firstDay][firstPeriod][0];
        console.log("\nSample class:");
        console.log(`Subject: ${sampleClass.subject}`);
        console.log(`Code: ${sampleClass.code}`);
        console.log(`Room: ${sampleClass.room}`);
        console.log(`Teacher: ${sampleClass.teacher}`);
      }
    } else {
      console.log("\n❌ No classes found in the parsed result");
    }
  } catch (error) {
    console.error("\n❌ Error testing tab-delimited parser:", error.message);
  }
}

// Run the test
testTabDelimitedParser();
