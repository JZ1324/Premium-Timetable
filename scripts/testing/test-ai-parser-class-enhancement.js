// test-ai-parser-class-enhancement.js
// Tests the AI parser with class data enhancement

// Import the AI parser function
const { parseTimetableWithChuteAI } = require('./src/services/aiParserService');

// Simple test timetable data
const sampleTimetable = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Specialist Mathematics,10SPE251101,M 07,Mr Paul Jefimenko,8:35am,9:35am
Day 1,Period 2,Biology Units 1 & 2,11BIO251101,S 06,Mr Andrew Savage,9:40am,10:40am
Day 1,Tutorial,Tutorial,10TUT251009,S 01,Mrs Sula Tyndall,10:45am,11:20am
Day 1,Period 3,War Boom and Bust,10WBB251102,C 07,Ms Dianne McKenzie,11:25am,12:25pm
`;

/**
 * Test that the AI parser enhances class data
 */
async function runTest() {
  console.log("=== TESTING AI PARSER WITH CLASS DATA ENHANCEMENT ===");
  console.log("Sending sample timetable data to AI parser...\n");
  
  try {
    // Mock AI response to avoid actual API calls
    // This is just for testing the class enhancement functionality
    global.mockParserData = {
      "days": ["Day 1", "Day 2"],
      "periods": [
        { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
        { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
        { "name": "Tutorial", "startTime": "10:45am", "endTime": "11:20am" },
        { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" }
      ],
      "classes": {
        "Day 1": {
          "Period 1": [
            "Specialist Mathematics (10SPE251101) M 07 Mr Paul Jefimenko"
          ],
          "Period 2": [
            "Biology Units 1 & 2 (11BIO251101) S 06 Mr Andrew Savage"
          ],
          "Tutorial": [
            "Tutorial (10TUT251009) S 01 Mrs Sula Tyndall"
          ],
          "Period 3": [
            "War Boom and Bust (10WBB251102) C 07 Ms Dianne McKenzie"
          ]
        },
        "Day 2": {
          "Period 1": [
            "Mathematics - Advanced (10MAA251105) M 05 Mr Scott Kertes"
          ],
          "Period 2": [],
          "Tutorial": [],
          "Period 3": []
        }
      }
    };
    
    // Override the parser's fetch function for testing
    global.originalFetch = global.fetch;
    global.fetch = function mockFetch() {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("Mock AI response"),
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify(global.mockParserData)
            }
          }]
        })
      });
    };
    
    const result = await parseTimetableWithChuteAI(sampleTimetable);
    
    console.log("AI Parser returned the following structured data:");
    console.log(JSON.stringify(result, null, 2));
    
    // Check if classes are properly structured as objects
    let hasStructuredClasses = false;
    if (result.classes && 
        result.classes["Day 1"] && 
        result.classes["Day 1"]["Period 1"] && 
        Array.isArray(result.classes["Day 1"]["Period 1"]) &&
        typeof result.classes["Day 1"]["Period 1"][0] === 'object' &&
        result.classes["Day 1"]["Period 1"][0].subject) {
      
      hasStructuredClasses = true;
      
      console.log("\nVerification: Classes are correctly structured as objects with properties:");
      console.log("Example class from Day 1, Period 1:");
      console.log(`  Subject: ${result.classes["Day 1"]["Period 1"][0].subject}`);
      console.log(`  Code: ${result.classes["Day 1"]["Period 1"][0].code}`);
      console.log(`  Room: ${result.classes["Day 1"]["Period 1"][0].room}`);
      console.log(`  Teacher: ${result.classes["Day 1"]["Period 1"][0].teacher}`);
    }
    
    if (hasStructuredClasses) {
      console.log("\n✅ SUCCESS: AI parser correctly enhances class data to structured objects");
    } else {
      console.log("\n❌ FAILED: Classes were not properly structured");
    }
    
    // Restore original fetch function
    global.fetch = global.originalFetch;
    delete global.originalFetch;
    delete global.mockParserData;
    
  } catch (error) {
    console.error(`Error during test: ${error.message}`);
    console.error(error);
    
    // Make sure we restore fetch even if there's an error
    if (global.originalFetch) {
      global.fetch = global.originalFetch;
      delete global.originalFetch;
    }
    if (global.mockParserData) {
      delete global.mockParserData;
    }
  }
  
  console.log("\n=== TEST COMPLETE ===");
}

// Run the test
runTest();
