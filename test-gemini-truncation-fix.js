/**
 * This test file helps validate the enhanced JSON parsing functionality
 * that has been implemented to handle truncated responses from Gemini models.
 * 
 * Special focus on the English class truncation pattern at position ~10982.
 */

// Import the specialized English truncation fix handlers
import { fixEnglishTruncation, recoverFromEnglishTruncation } from './EnglishTruncationFix.js';

// Simulating a truncated JSON response from Gemini
const truncatedResponse = `{
  "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Tutorial", "startTime": "10:45am", "endTime": "11:20am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "MATH101",
          "room": "Room A1",
          "teacher": "Mr. Smith",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [
        {
          "subject": "English",
          "code": "ENG102",
          "room": "Room B2",
          "teacher": "Ms. Johnson",
          "startTime": "9:40am",
          "endTime": "10:40am"
        }
      ],
      "Tutorial": [],
      "Period 3": [
        {
          "subject": "History",
          "code": "HIST103",
          "room": "Room C3",
          "teacher": "Dr. Williams",
          "startTime": "11:25am",
          "endTime": "12:25pm"
        }
      ]
    },
    "Day 2": {
      "Period 1": [
        {
          "subject": "Science",
          "code": "SCI201",
          "room": "Lab 1",
          "teacher": "Dr. Brown",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [
        {
          "subject": "English",
          "code": "(10EN`;

/**
 * Function to attempt to fix truncated JSON from Gemini models
 * This is a standalone version of the recovery logic implemented in aiParserService.js
 */
function fixTruncatedGeminiResponse(jsonContent) {
  console.log("Running specialized Gemini truncation fix");

  try {
    // First try with basic cleaning
    const cleanedJson = jsonContent
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
    
    try {
      // Maybe it was just some minor issues?
      return JSON.parse(cleanedJson);
    } catch (e) {
      console.log("Basic cleaning insufficient, attempting advanced reconstruction");
      
      // Check if response is truncated mid-string
      const truncatedMidString = jsonContent.match(/\"[^\"]*$/);
      
      // Extract key structures
      const daysMatch = jsonContent.match(/"days"\s*:\s*\[([\s\S]*?)\]/);
      const periodsMatch = jsonContent.match(/"periods"\s*:\s*\[([\s\S]*?)\]/);
      
      if (daysMatch && periodsMatch) {
        console.log("Found days and periods, attempting to build valid structure");
        
        // Extract class data
        const classesStart = jsonContent.match(/"classes"\s*:\s*\{([\s\S]*)/);
        if (classesStart) {
          const classesContent = classesStart[1];
          
          // Find day blocks
          const dayBlockRegex = /"Day \d+"\s*:\s*\{[\s\S]*?(?:\}\s*,|\}$)/g;
          const dayBlocks = [...classesContent.matchAll(dayBlockRegex)].map(match => match[0]);
          
          if (dayBlocks.length > 0) {
            console.log(`Found ${dayBlocks.length} complete day blocks`);
            
            // Build a minimal valid structure
            let reconstructed = '{\n';
            reconstructed += daysMatch[0] + ',\n';
            reconstructed += periodsMatch[0] + ',\n';
            reconstructed += '"classes": {\n';
            
            // Add all complete days
            for (let i = 0; i < dayBlocks.length; i++) {
              let block = dayBlocks[i];
              
              // Clean this block
              block = block
                .replace(/,\s*\}/g, '}')
                .replace(/,\s*\]/g, ']');
              
              // Check if this block ends with a comma
              const needsComma = !block.trim().endsWith(',') && i < dayBlocks.length - 1;
              
              reconstructed += block;
              if (needsComma && i < dayBlocks.length - 1) {
                reconstructed += ',';
              }
            }
            
            reconstructed += '}\n}';
            
            try {
              return JSON.parse(reconstructed);
            } catch (e) {
              console.log("Reconstruction with day blocks failed:", e.message);
            }
          } else {
            console.log("No complete day blocks found, attempting minimal structure");
            
            // Create minimal structure
            const minimal = `{
              ${daysMatch[0]},
              ${periodsMatch[0]},
              "classes": {}
            }`;
            
            return JSON.parse(minimal);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fix truncated JSON:", error);
    throw new Error("Cannot recover from this truncation pattern");
  }
}

// Test the function with our sample truncated response
try {
  console.log("Testing Gemini truncation fix with sample data...");
  const parsedData = fixTruncatedGeminiResponse(truncatedResponse);
  console.log("Successfully recovered JSON structure!");
  console.log(`Recovered ${Object.keys(parsedData.classes).length} days of data`);
} catch (error) {
  console.error("Test failed:", error);
}

// This file can be run with: node test-gemini-truncation-fix.js
