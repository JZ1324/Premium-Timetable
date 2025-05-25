// test-multi-model-parser.js - Test the multi-model parser with fallback capability

const { parseWithModelFallback, MODELS } = require('./src/services/multiModelParser.js');

// Simple timetable data for testing
const testData = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
`;

/**
 * Main function to run the test
 */
async function runTest() {
  console.log("=== TESTING MULTI-MODEL PARSER ===");
  console.log("This test will try multiple models with fallback capability\n");
  
  try {
    console.log("Starting test with sample timetable data:");
    console.log(testData);
    console.log("\nAvailable models in priority order:");
    MODELS.forEach((model, index) => {
      console.log(`${index + 1}. ${model}`);
    });
    
    console.log("\nAttempting to parse with model fallback...");
    console.time("Total parsing time");
    
    const result = await parseWithModelFallback(testData);
    
    console.timeEnd("Total parsing time");
    
    if (result.success) {
      console.log("\n✅ SUCCESS: Timetable was successfully parsed!");
      console.log(`Used model: ${result.usedModel || result.model}`);
      console.log(`Used key index: ${result.usedKeyIndex !== undefined ? result.usedKeyIndex + 1 : 'unknown'}`);
      
      // Print a sample of the parsed data
      console.log("\nSample of parsed data:");
      
      if (result.data && result.data.days) {
        console.log(`Days: ${result.data.days.slice(0, 3).join(', ')}...`);
      }
      
      if (result.data && result.data.periods) {
        console.log(`Periods: ${result.data.periods.slice(0, 2).map(p => p.name).join(', ')}...`);
      }
    } else {
      console.log("\n❌ FAILED: Could not parse timetable");
      console.log(`Error: ${result.error}`);
      
      if (result.diagnosis) {
        console.log(`Diagnosis: ${result.diagnosis.errorType}`);
        
        if (result.diagnosis.possibleCauses && result.diagnosis.possibleCauses.length > 0) {
          console.log("Possible causes:");
          result.diagnosis.possibleCauses.forEach(cause => {
            console.log(`- ${cause}`);
          });
        }
      }
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
  
  console.log("\n=== TEST COMPLETED ===");
}

// Run the test
runTest();
