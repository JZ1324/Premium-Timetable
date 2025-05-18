/**
 * Fix for the API call error in aiParserService.js
 * 
 * The issue is that when the OpenRouter API call fails, the service automatically
 * falls back to creating mock data instead of properly handling the error or
 * using the direct parsing result.
 * 
 * This fix modifies the error handling to:
 * 1. First attempt to use the direct parser on the original data
 * 2. Only fall back to mock data if direct parsing also fails
 * 3. Add an error notification system to tell users when mock data is being used
 */

const fs = require('fs');
const path = require('path');

// Path to the aiParserService.js file
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

try {
  // Read the current file
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // The problematic code starts with the catch block for the API call
  // We need to modify it to prioritize the direct parser over mock data
  
  // Find the position of the API error handler
  const errorHandlerStart = fileContent.indexOf('catch (error) {', fileContent.indexOf('async callAiApi(prompt)'));
  
  if (errorHandlerStart === -1) {
    console.error('Error: Could not find the API error handler in aiParserService.js');
    process.exit(1);
  }
  
  // Find the start of the mock data generation
  const mockDataStart = fileContent.indexOf('// Create example timetable with some sample classes', errorHandlerStart);
  
  if (mockDataStart === -1) {
    console.error('Error: Could not find the mock data generation in aiParserService.js');
    process.exit(1);
  }
  
  // Extract the original error handler
  const originalErrorHandler = fileContent.substring(errorHandlerStart, mockDataStart);
  
  // Create the replacement error handler
  const newErrorHandler = `catch (error) {
    console.error('Error calling AI API:', error);
    
    // Extract raw data from prompt if available
    const rawData = prompt.split('Here is the timetable data:')[1]?.trim() || '';
    
    // First, try direct parsing instead of mock data
    if (rawData && rawData.length > 20) {
      try {
        console.log('API call failed. Attempting direct parsing as primary fallback...');
        const directResult = this.parseTimeTableDirectly(rawData);
        
        // Check if direct parsing found any classes
        let totalClasses = 0;
        for (const day in directResult.classes) {
          for (const period in directResult.classes[day]) {
            totalClasses += directResult.classes[day][period].length;
          }
        }
        
        if (totalClasses > 0) {
          console.log(\`Direct parsing found \${totalClasses} classes, using this instead of API result\`);
          // Add an indication this was fallback parsed
          directResult.usingFallbackParser = true;
          directResult.apiErrorMessage = error.message || 'API call failed';
          return this.enhanceClassData(directResult);
        } else {
          console.log('Direct parsing found no classes, will try enhanced preprocessing...');
          
          // Try alternative preprocessing
          let preprocessedData = rawData
            .replace(/([Dd]ay\\s*\\d+)\\t/g, '$1\\n')
            .replace(/([^\\n])Period\\s*\\d+/g, '$1\\nPeriod');
            
          const enhancedResult = this.parseTimeTableDirectly(preprocessedData);
          
          // Check if enhanced parsing found any classes
          let enhancedClasses = 0;
          for (const day in enhancedResult.classes) {
            for (const period in enhancedResult.classes[day]) {
              enhancedClasses += enhancedResult.classes[day][period].length;
            }
          }
          
          if (enhancedClasses > 0) {
            console.log(\`Enhanced direct parsing found \${enhancedClasses} classes, using these results\`);
            // Add an indication this was fallback parsed
            enhancedResult.usingFallbackParser = true;
            enhancedResult.apiErrorMessage = error.message || 'API call failed';
            return this.enhanceClassData(enhancedResult);
          }
        }
      } catch (directError) {
        console.error('Direct parsing also failed:', directError);
      }
    }
    
    // If we reach here, both the API call and direct parsing failed
    // Now we can use mock data as a last resort
    console.log('All parsing attempts failed. Using mock data as last resort.');
    
    // Create example timetable with some sample classes`;
  
  // Replace the original error handler with the new one
  fileContent = fileContent.replace(originalErrorHandler, newErrorHandler);
  
  // Add an error notification property to the returned mock data
  const mockDataReturnLine = fileContent.indexOf('return exampleTimetable;', mockDataStart);
  
  if (mockDataReturnLine !== -1) {
    const mockDataEnd = mockDataReturnLine + 'return exampleTimetable;'.length;
    
    // Add the indicator that this is mock data just before the return
    const modifiedReturn = `
      // Add indicators that this is mock data and there was an API error
      exampleTimetable.usingMockData = true;
      exampleTimetable.apiErrorMessage = error.message || 'API call failed';
      
      return exampleTimetable;`;
    
    fileContent = fileContent.substring(0, mockDataReturnLine) + modifiedReturn + fileContent.substring(mockDataEnd);
  }
  
  // Modify the main parseWithAI function to check and handle the error notification
  const parseExportLine = fileContent.indexOf('export const parseTimetableText = (timetableText) => {');
  
  if (parseExportLine !== -1) {
    // Find the end of the export function
    const parseExportEnd = fileContent.indexOf('};', parseExportLine) + 2;
    
    // Replace with a version that handles error notifications
    const newExportFunction = `export const parseTimetableText = async (timetableText) => {
  try {
    const result = await aiParserService.parseTimeTable(timetableText);
    
    // Check if we're using fallback parsing or mock data
    if (result.usingFallbackParser || result.usingMockData) {
      // Add warning to console
      console.warn(\`Warning: \${result.usingMockData ? 'Using mock data' : 'Using fallback parser'} due to API error: \${result.apiErrorMessage || 'Unknown error'}\`);
    }
    
    return result;
  } catch (error) {
    console.error('Error in parseTimetableText:', error);
    throw error;
  }
};`;
    
    fileContent = fileContent.substring(0, parseExportLine) + newExportFunction + fileContent.substring(parseExportEnd);
  }
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, fileContent, 'utf8');
  
  console.log('Successfully modified aiParserService.js to properly handle API errors');
  console.log('Changes made:');
  console.log('1. Modified the error handler to prioritize direct parsing over mock data');
  console.log('2. Added error notification properties to the returned data');
  console.log('3. Updated the exported function to handle and report errors to the user');
  
} catch (err) {
  console.error('Error applying the fix:', err);
  process.exit(1);
}
