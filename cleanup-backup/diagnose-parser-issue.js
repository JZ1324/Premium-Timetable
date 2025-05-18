/**
 * Simple diagnostic test for aiParserService.js
 */

// Sample timetable data
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:35am–9:35am
Mathematics\tScience\tEnglish\tHistory\tGeography
(10MAT251101)\t(10SCI251102)\t(10ENG251103)\t(10HIS251104)\t(10GEO251105)
Room A1\tRoom B2\tRoom C3\tRoom D4\tRoom E5`;

// Examine the API call structure and error handling
function analyzeApiCall() {
  console.log('=== ANALYZING API CALL STRUCTURE ===');
  
  const fs = require('fs');
  const path = require('path');

  try {
    const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Check for mock data in the callAiApi method
    const isMockDataPresent = fileContent.includes('exampleTimetable');
    const isMockDataReturned = fileContent.includes('exampleTimetable.usingMockData = true');

    console.log('Mock data generation still present in code:', isMockDataPresent);
    console.log('Mock data being returned on error:', isMockDataReturned);

    // Check for proper error handling
    const throwsErrors = fileContent.includes('throw new Error(`API call failed');
    console.log('Proper error throwing in place:', throwsErrors);

    // Check for API validation
    const hasJsonSchemaCheck = fileContent.includes('response_format');
    console.log('JSON Schema response_format in API call:', hasJsonSchemaCheck);
  } catch (error) {
    console.error('Error analyzing file:', error.message);
  }
}

// Analyze the integration with the ImportTimetable.js component
function analyzeFrontendIntegration() {
  console.log('\n=== ANALYZING FRONTEND INTEGRATION ===');
  
  const fs = require('fs');
  const path = require('path');

  try {
    const filePath = path.join(__dirname, 'src', 'components', 'ImportTimetable.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Check how UI handles fallback
    const showsFallbackMessage = fileContent.includes('AI parsing failed, using fallback parser');
    console.log('Shows fallback message to user:', showsFallbackMessage);

    // Check for validation of API errors
    const handlesApiErrors = fileContent.includes('catch (error)') && 
                             fileContent.includes('Error parsing with AI');
    console.log('Handles API errors properly:', handlesApiErrors);

    // Check for integration with fallback parser
    const usesFallbackParser = fileContent.includes('fallbackParser(importText.trim())');
    console.log('Integration with fallback parser:', usesFallbackParser);
  } catch (error) {
    console.error('Error analyzing frontend integration:', error.message);
  }
}

// Run the diagnostic functions
analyzeApiCall();
analyzeFrontendIntegration();

console.log('\n=== DIAGNOSTIC RESULT ===');
console.log('The issue is likely in one of the following areas:');
console.log('1. OpenRouter API schema validation with response_format field');
console.log('2. Window object reference in non-browser environment');
console.log('3. Error handling passing errors up to ImportTimetable.js');
console.log('4. Mock data still being generated despite attempted removal');
console.log('\nRecommendation: Review the API call structure and test response schema with response_format removed');
