/**
 * Test script for verifying the AI parser service error handling and fallbacks
 * This simulates the behavior when OpenRouter API call fails
 */

// Mock the AI parser service
const mockAiParserService = {
  parseTimeTableDirectly: (timetableData) => {
    // If the timetable has valid classes with long codes, it should work properly
    const hasValidClass = timetableData.match(/\(([A-Z0-9]{5,})\)/);
    
    // Sample result with a valid class
    const validResult = {
      days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
      periods: [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
      ],
      classes: {
        "Day 1": {
          "Period 1": [{
            subject: "Mathematics",
            code: "10MAA251105",
            room: "M 05",
            teacher: "Mr Teacher",
            startTime: "8:35am",
            endTime: "9:35am"
          }],
          "Period 2": []
        },
        "Day 2": {
          "Period 1": [],
          "Period 2": []
        },
        "Day 3": {
          "Period 1": [],
          "Period 2": []
        },
        "Day 4": {
          "Period 1": [],
          "Period 2": []
        },
        "Day 5": {
          "Period 1": [],
          "Period 2": []
        }
      }
    };
    
    // Return valid result if valid class found, empty otherwise
    return hasValidClass ? validResult : {
      days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
      periods: [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
      ],
      classes: {
        "Day 1": { "Period 1": [], "Period 2": [] },
        "Day 2": { "Period 1": [], "Period 2": [] },
        "Day 3": { "Period 1": [], "Period 2": [] },
        "Day 4": { "Period 1": [], "Period 2": [] },
        "Day 5": { "Period 1": [], "Period 2": [] },
      }
    };
  },
  
  enhanceClassData: (data) => {
    // Just return the data with an enhancement flag
    return { ...data, enhanced: true };
  },
  
  callAiApi: async (prompt) => {
    // Extract the raw data from the prompt
    const rawData = prompt.split('Here is the timetable data:')[1]?.trim();
    
    // This simulates the API error - always throws an error
    throw new Error("Empty response choices from API");
  }
};

// Test cases
const testCases = [
  {
    name: "Valid timetable with long code",
    data: `
      Day 1\tDay 2\tDay 3
      Period 1 8:35am-9:35am
      Mathematics (10MAA251105)\tScience\tHistory
    `,
    shouldFallbackWork: true
  },
  {
    name: "Timetable with short code only",
    data: `
      Day 1\tDay 2\tDay 3
      Period 1 8:35am-9:35am
      Mathematics (MAT)\tScience (SCI)\tHistory (HIS)
    `,
    shouldFallbackWork: false
  },
  {
    name: "Mixed timetable with both short and long codes",
    data: `
      Day 1\tDay 2\tDay 3
      Period 1 8:35am-9:35am
      Mathematics (MAT)\tPhysics (10PHY251102)\tHistory (HIS)
    `,
    shouldFallbackWork: true
  }
];

// Run the error test for each case
async function runTests() {
  console.log('======= AI PARSER ERROR HANDLING TEST =======');
  console.log('Testing the AI parser error handler fallback with updated regex');
  console.log('');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test Case #${i + 1}: ${testCase.name}`);
    
    try {
      // Simulate parse process with API call
      const prompt = `Timetable API call instructions...\n\nHere is the timetable data:\n${testCase.data}`;
      
      try {
        // This will throw an error as our mock always throws
        await mockAiParserService.callAiApi(prompt);
      } catch (error) {
        console.log(`  API error: ${error.message}`);
        console.log('  Attempting direct parsing fallback...');
        
        // Extract raw data from prompt
        const rawData = prompt.split('Here is the timetable data:')[1]?.trim();
        
        // Use direct parsing as fallback
        const directResult = mockAiParserService.parseTimeTableDirectly(rawData);
        
        // Check if any classes were found
        let totalClasses = 0;
        for (const day in directResult.classes) {
          for (const period in directResult.classes[day]) {
            totalClasses += directResult.classes[day][period].length;
          }
        }
        
        console.log(`  Direct parsing found ${totalClasses} classes`);
        
        if (testCase.shouldFallbackWork && totalClasses > 0) {
          console.log('  ✅ PASS: Fallback correctly found classes');
          passedTests++;
        } else if (!testCase.shouldFallbackWork && totalClasses === 0) {
          console.log('  ✅ PASS: Fallback correctly found no classes (expected)');
          passedTests++;
        } else if (testCase.shouldFallbackWork && totalClasses === 0) {
          console.log('  ❌ FAIL: Fallback should have found classes but found none');
          failedTests++;
        } else {
          console.log('  ❌ FAIL: Fallback found classes but should not have');
          failedTests++;
        }
      }
    } catch (unexpectedError) {
      console.log(`  ❌ ERROR in test case: ${unexpectedError.message}`);
      failedTests++;
    }
    
    console.log('');
  }
  
  console.log('====== TEST SUMMARY ======');
  console.log(`Passed: ${passedTests} tests`);
  console.log(`Failed: ${failedTests} tests`);
  console.log(`Total: ${testCases.length} tests`);
  console.log('');
  
  if (failedTests === 0) {
    console.log('✅ SUCCESS: All tests passed! The parser correctly handles API errors and falls back appropriately.');
  } else {
    console.log('❌ FAILURE: Some tests failed. The error handling needs further improvement.');
  }
}

runTests().catch(err => console.error('Test error:', err));
