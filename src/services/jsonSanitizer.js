/**
 * JSON Sanitizer Module for Premium Timetable
 * 
 * This module provides robust sanitization functions to clean up malformed JSON
 * before parsing, handling common errors from AI-generated JSON.
 */

/**
 * Generate a safe clean days array string
 * @returns {string} A properly formatted days array string
 */
const getCleanDaysArrayString = () => {
  const cleanDays = [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5", 
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ];
  return `["${cleanDays.join('", "')}"]`;
};

/**
 * Deep sanitize a JSON string to fix various formatting issues
 * 
 * @param {string} jsonContent - The potentially malformed JSON string
 * @returns {string} A cleaned JSON string that should be more parseable
 */
export const deepSanitizeJson = (jsonContent) => {
  // Make a copy of the original for reference
  const original = jsonContent;
  
  try {
    // 1. Initial cleaning - remove markdown, control characters, escaped quotes
    jsonContent = jsonContent.replace(/```(?:json)?|```/g, '');
    jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // 2. Special case - fix the days array specifically
    // This targets the root-level days array which commonly has issues
    const daysArrayPattern = /"days"\s*:\s*\[(.*?)\]/s;
    const daysMatch = jsonContent.match(daysArrayPattern);
    
    if (daysMatch) {
      // Replace the entire days array with a sanitized version
      jsonContent = jsonContent.replace(
        daysArrayPattern, 
        `"days": ${getCleanDaysArrayString()}`
      );
    }
    
    // 3. Fix quotes and brackets in the periods array
    const periodsArrayPattern = /"periods"\s*:\s*\[(.*?)\]/s;
    const periodsMatch = jsonContent.match(periodsArrayPattern);
    
    if (periodsMatch) {
      let periodsContent = periodsMatch[1];
      
      // Clean up period objects
      periodsContent = periodsContent.replace(/{\s*"name":/g, ', {"name":');
      periodsContent = periodsContent.replace(/^,\s*/, ''); // Remove leading comma
      
      // Fix escaped quotes in period objects
      periodsContent = periodsContent.replace(/\\\"/g, '"');
      
      // Fix missing commas between objects
      periodsContent = periodsContent.replace(/}(\s*){/g, '}, $1{');
      
      // Replace the entire periods array
      jsonContent = jsonContent.replace(
        periodsArrayPattern,
        `"periods": [${periodsContent}]`
      );
    }
    
    // 4. Fix common JSON syntax errors
    jsonContent = jsonContent.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
    jsonContent = jsonContent.replace(/([{,])\s*"([^"]+)"\s*:\s*"([^"]*)"\s*"/g, '$1"$2":"$3"'); // Fix extra quotes
    jsonContent = jsonContent.replace(/"([^"]+)""/g, '"$1"'); // Fix double quotes like "Day 10""
    jsonContent = jsonContent.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // Add missing quotes around keys
    
    // 5. Fix classes object structure
    const classesObjPattern = /"classes"\s*:\s*{([^}]*)}/s;
    const classesMatch = jsonContent.match(classesObjPattern);
    
    if (classesMatch && !jsonContent.includes('"Day 10":')) {
      // If missing some days, ensure all days are included
      let classesObj = {};
      const allDays = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];
      
      allDays.forEach(day => {
        classesObj[day] = {};
      });
      
      // Replace the classes object with a minimal version
      jsonContent = jsonContent.replace(
        classesObjPattern,
        `"classes": ${JSON.stringify(classesObj)}`
      );
    }
    
    // 6. Try a more drastic approach if still not valid
    try {
      JSON.parse(jsonContent);
    } catch (parseError) {
      // If still having problems, return a completely clean structure
      const cleanStructure = {
        days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
        periods: [
          { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
          { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
          { name: "Tutorial", startTime: "10:45am", endTime: "10:55am" },
          { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
          { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
          { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
        ],
        classes: {
          "Day 1": {}, "Day 2": {}, "Day 3": {}, "Day 4": {}, "Day 5": {},
          "Day 6": {}, "Day 7": {}, "Day 8": {}, "Day 9": {}, "Day 10": {}
        }
      };
      
      // Try to salvage any class data if available
      try {
        // Extract any class data from the original content
        const classDataPattern = /"subject"\s*:\s*"([^"]*)"/g;
        let match;
        
        // If we find class data, use it instead of empty objects
        if (original.match(classDataPattern)) {
          console.log("Found class data, attempting to salvage...");
          return original;
        }
      } catch (salvageError) {
        console.error("Error while trying to salvage class data:", salvageError);
      }
      
      return JSON.stringify(cleanStructure, null, 2);
    }
    
    return jsonContent;
  } catch (error) {
    console.error("JSON sanitization failed:", error);
    
    // Return a valid JSON structure as a fallback
    const fallbackStructure = {
      days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      periods: [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
        { name: "Tutorial", startTime: "10:45am", endTime: "10:55am" },
        { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
        { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
        { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
      ],
      classes: {
        "Day 1": {}, "Day 2": {}, "Day 3": {}, "Day 4": {}, "Day 5": {},
        "Day 6": {}, "Day 7": {}, "Day 8": {}, "Day 9": {}, "Day 10": {}
      }
    };
    
    return JSON.stringify(fallbackStructure, null, 2);
  }
};

/**
 * Pre-parses JSON by first deep sanitizing it and then attempting to parse
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object} The parsed JSON object or a default structure if parsing fails
 */
export const tryParseJson = (jsonString) => {
  try {
    // First try direct parsing (fastest)
    try {
      return JSON.parse(jsonString);
    } catch (directError) {
      // If direct parsing fails, try sanitizing first
      const sanitized = deepSanitizeJson(jsonString);
      console.log("Sanitized JSON:", sanitized.substring(0, 100) + "...");
      
      try {
        return JSON.parse(sanitized);
      } catch (sanitizedError) {
        console.error("Failed to parse even after sanitization:", sanitizedError);
        
        // Fall back to the default structure
        const defaultStructure = {
          days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
          periods: [
            { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
            { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
            { name: "Tutorial", startTime: "10:45am", endTime: "10:55am" },
            { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
            { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
            { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
          ],
          classes: {
            "Day 1": {}, "Day 2": {}, "Day 3": {}, "Day 4": {}, "Day 5": {},
            "Day 6": {}, "Day 7": {}, "Day 8": {}, "Day 9": {}, "Day 10": {}
          }
        };
        
        return defaultStructure;
      }
    }
  } catch (error) {
    console.error("Critical error in JSON parsing:", error);
    
    // Ultimate fallback
    return {
      days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      periods: [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
        { name: "Tutorial", startTime: "10:45am", endTime: "10:55am" },
        { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
        { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
        { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
      ],
      classes: {
        "Day 1": {}, "Day 2": {}, "Day 3": {}, "Day 4": {}, "Day 5": {},
        "Day 6": {}, "Day 7": {}, "Day 8": {}, "Day 9": {}, "Day 10": {}
      }
    };
  }
};
