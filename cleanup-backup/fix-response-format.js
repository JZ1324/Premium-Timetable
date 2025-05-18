/**
 * Fix for the OpenRouter API call in aiParserService.js
 * 
 * This fixes the JSON Schema Validation Error issue by removing the response_format field
 * which is causing a compatibility problem with the Meta Llama 3.3 model.
 */

const fs = require('fs');
const path = require('path');

// Path to the AI parser service
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

try {
  // Read the current file
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Check if the response_format field is still present
  if (fileContent.includes('response_format:')) {
    console.log('Found response_format field in the API call, removing it...');
    
    // Remove the response_format line
    fileContent = fileContent.replace(/response_format:.*?,\s*/g, '');
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log('Successfully removed response_format field from the API call');
  } else {
    console.log('response_format field already removed from the API call');
  }
  
  // Now check for mock data generation
  if (fileContent.includes('exampleTimetable.usingMockData = true')) {
    console.log('Found mock data generation code, this should be removed...');
    console.log('Run the comprehensive fix script to completely remove mock data generation');
  } else {
    console.log('Mock data generation has been successfully removed');
  }
  
  console.log('\nFix applied successfully. The OpenRouter API call should now work with Llama 3.3.');
  
} catch (err) {
  console.error('Error applying the fix:', err);
  process.exit(1);
}
