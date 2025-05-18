/**
 * Test script to check the AI parser console output
 */
const { parseTimetableText } = require('./src/services/aiParserService');

// Sample timetable data
const sampleData = `
Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:35am–9:35am
Mathematics\tScience\tEnglish\tHistory\tGeography
(MATH101)\t(SCI102)\t(ENG103)\t(HIST104)\t(GEO105)
Room A1\tRoom B2\tRoom C3\tRoom D4\tRoom E5
`;

console.log('Starting AI parser test with sample data...');

// Use an async function to run the test
async function runTest() {
  try {
    console.log('Calling parseTimetableText...');
    const result = await parseTimetableText(sampleData);
    
    console.log('Parsing successful!');
    console.log('Result summary:');
    console.log(`- Days: ${result.days.length}`);
    console.log(`- Periods: ${result.periods.length}`);
    
    // Count total classes
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(`- Total classes found: ${totalClasses}`);
    
    // Check if mock data is being used
    if (result.usingMockData) {
      console.log('⚠️ WARNING: Using mock data instead of actual parsed data');
      console.log(`Error message: ${result.apiErrorMessage || 'Unknown error'}`);
    }
    
    if (result.usingFallbackParser) {
      console.log('⚠️ WARNING: Using fallback parser instead of AI parser');
      console.log(`Error message: ${result.apiErrorMessage || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Error running test:', error.message);
  }
}

runTest();
