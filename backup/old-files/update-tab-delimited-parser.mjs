/**
 * Update aiParserService.js with Tab-Delimited Parser Support
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateAiParserService() {
  try {
    console.log("Updating aiParserService.js with tab-delimited parsing support...");
    
    // Read the current service file
    const serviceFilePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');
    const fileContent = await fs.readFile(serviceFilePath, 'utf8');
    
    // Check if the tab-delimited prompt method already exists
    if (fileContent.includes('constructTabDelimitedPrompt')) {
      console.log("Tab-delimited prompt method already exists, no update needed");
      return;
    }
    
    // Define the tab-delimited prompt method
    const tabDelimitedPromptMethod = `
  /**
   * Generate a specialized prompt for tab-delimited timetable formats
   * @param {string} timetableData - The raw timetable data
   * @returns {string} - Specialized prompt for tab-delimited formats
   */
  constructTabDelimitedPrompt(timetableData) {
    return \`You are an expert at extracting structured timetable data from tab-delimited formats.

I will provide you with a school timetable where days are organized in columns separated by tabs.
Each row typically represents a period, subject, course code, room, or teacher information.

Your task is to convert this into a structured JSON format, organizing classes by day and period.

IMPORTANT: Pay special attention to tab characters (\\\\t) in the first line, which typically separate day headers.
Each column in the tab-separated data represents a different day.

Convert the timetable into this EXACT JSON format:

{
  "days": [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Specialist Mathematics",
          "code": "10SPE251101",
          "room": "M 07",
          "teacher": "Mr Paul Jefimenko",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    },
    "Day 2": {
      "Period 1": [
        {
          "subject": "Mathematics - Advanced",
          "code": "10MAA251105",
          "room": "M 05",
          "teacher": "Mr Scott Kertes",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    }
    // ... and so on for all days
  }
}

For each class entry, extract:
1. subject: The name of the subject (e.g., "Mathematics", "English")
2. code: The course code, typically in parentheses (e.g., "10SPE251101")
3. room: The room number/code (e.g., "M 07", "S 01")
4. teacher: The teacher's name (e.g., "Mr Paul Jefimenko")
5. startTime: Start time of the period
6. endTime: End time of the period

Return ONLY valid JSON without explanations or markdown formatting.

Here is the tab-delimited timetable data:

\${timetableData}\`;
  }
`;
    
    // Insert the tab-delimited prompt method after the weekdayMap declaration
    const updatedContent = fileContent.replace(
      /this\.weekdayMap = {[\s\S]+?};/,
      match => match + '\n' + tabDelimitedPromptMethod
    );
    
    // Find the AI parsing section to update
    const aiParsingSection = /\/\/ Fallback to AI parsing[\s\S]+?const response = await this\.callAiApi\(timetableData\);/;
    
    // Define the updated AI parsing section with tab-delimited format detection
    const updatedAiSection = `// Fallback to AI parsing
      try {
        console.log("Attempting AI-based parsing with DeepSeek Chat model");
        
        // Check for tab-delimited format that needs special handling
        const hasTabFormat = timetableData.includes('\\t');
        const firstLine = timetableData.split('\\n')[0] || '';
        const hasTabsInFirstLine = firstLine.includes('\\t');
        const hasDayHeaders = firstLine.toLowerCase().includes('day') || /day\\s*\\d+/i.test(firstLine);
        
        // Use different prompt based on format detection
        let response;
        if (hasTabFormat && hasTabsInFirstLine && hasDayHeaders) {
          console.log("Using specialized prompt for tab-delimited timetable format");
          const tabDelimitedPrompt = this.constructTabDelimitedPrompt(timetableData);
          response = await this.callAiApi(tabDelimitedPrompt);
        } else {
          console.log("Using standard prompt for timetable format");
          response = await this.callAiApi(timetableData);
        }`;
    
    // Update the AI parsing section
    const finalContent = updatedContent.replace(aiParsingSection, updatedAiSection);
    
    // Save the updated content to a new file
    const updatedFilePath = path.join(__dirname, 'src', 'services', 'aiParserService.js.updated');
    await fs.writeFile(updatedFilePath, finalContent);
    
    console.log(`✅ Successfully created updated service file at ${updatedFilePath}`);
    console.log("Review the changes and then replace the original file if the changes look good.");
  } catch (error) {
    console.error("Error updating aiParserService.js:", error);
  }
}

updateAiParserService();
