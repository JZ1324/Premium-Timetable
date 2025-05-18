// Test script for the updated AI parser service
import { parseTimetableWithChuteAI } from './src/services/aiParserService.js';

// Sample timetable text in format that might be encountered
const exampleTimetableText = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
Day 1,Period 4,Biology,BIO101,Lab 1,Dr. Johnson,12:30pm,1:30pm
Day 1,Period 5,History,HIST101,Room D,Mr. Brown,2:25pm,3:25pm
Day 2,Period 1,Chemistry,CHEM101,Lab 2,Dr. White,8:35am,9:35am
Day 2,Period 2,Computer Science,CS101,Room E,Ms. Miller,9:40am,10:40am
Day 2,Tutorial,Research Skills,TUT102,Library,Mr. Taylor,10:45am,11:20am
Day 2,Period 3,Art,ART101,Art Studio,Ms. Green,11:25am,12:25pm
Day 2,Period 4,Physical Education,PE101,Gym,Coach Wilson,12:30pm,1:30pm
Day 2,Period 5,Music,MUS101,Music Room,Mr. Lee,2:25pm,3:25pm
`;

async function testParser() {
  console.log("Starting AI Parser test...");
  console.log("Using timetable sample with Tutorial periods included");

  try {
    console.log("Sending request to AI parser...");
    const result = await parseTimetableWithChuteAI(exampleTimetableText);
    
    console.log("Parsing successful! Results:");
    console.log(JSON.stringify(result, null, 2));
    
    // Check if Tutorial periods were included
    let tutorialFound = false;
    for (const day in result.classes) {
      if (result.classes[day].Tutorial && result.classes[day].Tutorial.length > 0) {
        tutorialFound = true;
        console.log(`✅ Tutorial found in ${day}`);
      }
    }
    
    if (!tutorialFound) {
      console.warn("⚠️ No Tutorial periods were found in the parsed output");
    } else {
      console.log("✅ Tutorial periods were successfully included");
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error during test:", error);
    return null;
  }
}

// Run the test
testParser();
