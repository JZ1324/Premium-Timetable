/**
 * Test the fixed fallback parser with the full example
 * 
 * This script will test the fallback parser after applying the fix
 * for multi-line tab-delimited timetables.
 */

// Import the fallback parser from the AI Parser Service
import { fallbackParser } from './src/services/aiParserService.js';

// Full timetable example to test
const fullTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics\tMathematics - Advanced\tPhysics\tBiology Units 1 & 2\tWar Boom and Bust\tSpecialist Mathematics\tEnglish\tPhysics\tSpecialist Mathematics\tBiology Units 1 & 2
(10SPE251101)\t(10MAA251105)\t(10PHY251102)\t(11BIO251101)\t(10WBB251102)\t(10SPE251101)\t(10ENG251108)\t(10PHY251102)\t(10SPE251101)\t(11BIO251101)
M 07\tM 05\tS 01\tS 06\tC 07\tM 07\tA 08\tS 01\tM 07\tS 06
Mr Paul Jefimenko\tMr Scott Kertes\tMr Paul Jefimenko\tMr Andrew Savage\tMs Dianne McKenzie\tMr Paul Jefimenko\tMr Robert Hassell\tMr Paul Jefimenko\tMr Paul Jefimenko\tMr Andrew Savage
Period 2
9:40am–10:40am
Biology Units 1 & 2\tWar Boom and Bust\tMathematics - Advanced\tSpecialist Mathematics\tBiology Units 1 & 2\tEnglish\tSpecialist Mathematics\tEnglish\tPhysics\tEnglish
(11BIO251101)\t(10WBB251102)\t(10MAA251105)\t(10SPE251101)\t(11BIO251101)\t(10ENG251108)\t(10SPE251101)\t(10ENG251108)\t(10PHY251102)\t(10ENG251108)
S 06\tC 07\tM 05\tM 07\tS 06\tA 08\tM 07\tA 08\tS 01\tA 08
Mr Andrew Savage\tMs Dianne McKenzie\tMr Scott Kertes\tMr Paul Jefimenko\tMr Andrew Savage\tMr Robert Hassell\tMr Paul Jefimenko\tMr Robert Hassell\tMr Paul Jefimenko\tMr Robert Hassell
Tutorial
10:45am–10:55am
Tutorial\tTutorial\tTutorial\tTutorial\tTutorial\tTutorial\tTutorial\tTutorial\tTutorial\tTutorial
(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)\t(10TUT251009)
S 01\tS 01\tS 01\tS 01\tS 01\tS 01\tS 01\tS 01\tS 01\tS 01
Mrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall\tMrs Sula Tyndall
Period 3
11:25am–12:25pm
War Boom and Bust\tActive and Able\tActive and Able\tPhysics\tPhysics\tWar Boom and Bust\tActive and Able\tMathematics - Advanced\tBiology Units 1 & 2\tMathematics - Advanced
(10WBB251102)\t(10AAA251109)\t(10AAA251109)\t(10PHY251102)\t(10PHY251102)\t(10WBB251102)\t(10AAA251109)\t(10MAA251105)\t(11BIO251101)\t(10MAA251105)
C 07\tM 08\tC 07\tS 01\tS 01\tC 07\tI 05\tM 05\tS 06\tM 05
Ms Dianne McKenzie\tMr James Beattie\tMr James Beattie\tMr Paul Jefimenko\tMr Paul Jefimenko\tMs Dianne McKenzie\tMr James Beattie\tMr Scott Kertes\tMr Andrew Savage\tMr Scott Kertes
Period 4
12:30pm–1:30pm
Mathematics - Advanced\tSpecialist Mathematics\tEnglish\tActive and Able\tEnglish\tMathematics - Advanced\tWar Boom and Bust\t10PST25100\tActive and Able\tSpecialist Mathematics
(10MAA251105)\t(10SPE251101)\t(10ENG251108)\t(10AAA251109)\t(10ENG251108)\t(10MAA251105)\t(10WBB251102)\t(10PST251009)\t(10AAA251109)\t(10SPE251101)
M 05\tM 07\tA 08\tM 08\tA 08\tM 05\tC 07\tS 04\tC 06\tM 07
Mr Scott Kertes\tMr Paul Jefimenko\tMr Robert Hassell\tMr James Beattie\tMr Robert Hassell\tMr Scott Kertes\tMs Dianne McKenzie\tMiss Georgia Kellock\tMr James Beattie\tMr Paul Jefimenko
Period 5
2:25pm–3:25pm
English\tBiology Units 1 & 2\tWar Boom and Bust\t10ybad01\tMathematics - Advanced\tPhysics\tBiology Units 1 & 2\tWar Boom and Bust\t10ybad01\tPhysics
(10ENG251108)\t(11BIO251101)\t(10WBB251102)\t(10ybad01)\t(10MAA251105)\t(10PHY251102)\t(11BIO251101)\t(10WBB251102)\t(10ybad01)\t(10PHY251102)
A 08\tS 06\tC 07\t\tM 05\tS 01\tS 06\tC 07\t\tS 01
Mr Robert Hassell\tMr Andrew Savage\tMs Dianne McKenzie\tMrs Lindy Dowell\tMr Scott Kertes\tMr Paul Jefimenko\tMr Andrew Savage\tMs Dianne McKenzie\tMrs Lindy Dowell\tMr Paul Jefimenko`;

// Function to test the fallback parser
async function testFallbackParser() {
  console.log("=== Testing Fixed Fallback Parser with Full Timetable ===");
  
  try {
    // Parse the timetable using the fallback parser
    console.log("Parsing timetable with fallback parser...");
    const result = fallbackParser(fullTimetable);
    
    // Count classes by day and period
    let totalClasses = 0;
    const classCountsByDay = {};
    
    for (const day of result.days) {
      classCountsByDay[day] = 0;
      for (const period of result.periods) {
        const classes = result.classes[day][period.name];
        if (classes && classes.length > 0) {
          classCountsByDay[day] += classes.length;
          totalClasses += classes.length;
        }
      }
    }
    
    console.log(`\nTotal classes found: ${totalClasses}`);
    console.log("Classes by day:");
    for (const day in classCountsByDay) {
      console.log(`${day}: ${classCountsByDay[day]} classes`);
    }
    
    // Check if we got the expected number of classes (1 per day per period, minus any empty cells)
    const expectedClassesPerDay = 5; // 5 periods, excluding Tutorial
    const expectedTotalClasses = result.days.length * expectedClassesPerDay;
    
    if (totalClasses > 0 && totalClasses >= 0.9 * expectedTotalClasses) {
      console.log("\n✅ SUCCESS: Fixed parser correctly extracted classes!");
      
      // Check a specific class to verify correct parsing
      const day1Period1 = result.classes["Day 1"]["Period 1"][0] || {};
      
      if (day1Period1.subject === "Specialist Mathematics" && 
          day1Period1.code === "10SPE251101" &&
          day1Period1.room === "M 07" &&
          day1Period1.teacher === "Mr Paul Jefimenko") {
        console.log("\n✅ VERIFIED: Day 1, Period 1 class correctly parsed:");
        console.log(JSON.stringify(day1Period1, null, 2));
      } else {
        console.log("\n❌ ISSUE: Day 1, Period 1 class not correctly parsed:");
        console.log("Expected: Subject='Specialist Mathematics', Code='10SPE251101', Room='M 07', Teacher='Mr Paul Jefimenko'");
        console.log(`Got: Subject='${day1Period1.subject}', Code='${day1Period1.code}', Room='${day1Period1.room}', Teacher='${day1Period1.teacher}'`);
      }
    } else {
      console.log(`\n❌ ISSUE: Expected approximately ${expectedTotalClasses} classes, but found ${totalClasses}`);
    }
    
    return result;
  } catch (error) {
    console.error("Error testing fallback parser:", error);
    return null;
  }
}

// Run the test and display results
testFallbackParser().then(result => {
  if (result) {
    console.log("\nSample of parsed data (Day 1):");
    console.log(JSON.stringify(result.classes["Day 1"], null, 2));
  }
});
