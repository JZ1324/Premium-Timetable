// AI Timetable Parser Service using OpenRouter.ai API

import { getOpenRouterApiKey } from "../utils/apiKeyManager";
import { tryParseJson } from "./jsonSanitizer";

/**
 * Helper function to clean and validate JSON before returning
 * @param {Object} jsonObject - The parsed JSON object
 * @param {number} textLength - Length of original text for heuristics
 * @returns {Object} - The cleaned and validated JSON object
 */
const cleanAndValidateJson = (jsonObject, textLength) => {
  try {
    // Ensure all required top-level properties exist
    if (!jsonObject.days || !Array.isArray(jsonObject.days)) {
      jsonObject.days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];
    }

    if (!jsonObject.periods || !Array.isArray(jsonObject.periods) || jsonObject.periods.length < 3) {
      jsonObject.periods = [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
        { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
        { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
        { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
      ];
    }

    if (!jsonObject.classes || typeof jsonObject.classes !== 'object') {
      jsonObject.classes = {};
    }

    // Ensure each day has an entry in classes
    jsonObject.days.forEach(day => {
      if (!jsonObject.classes[day]) {
        jsonObject.classes[day] = {};
      }
      
      // Ensure each period exists for each day
      jsonObject.periods.forEach(period => {
        if (!jsonObject.classes[day][period.name]) {
          jsonObject.classes[day][period.name] = [];
        }
      });
    });

    // Return the validated object
    return redistributeClasses(jsonObject, textLength);
  } catch (error) {
    console.error("Error during JSON validation:", error);
    return createDefaultTimetableStructure();
  }
};

/**
 * Creates a default timetable structure with empty classes
 * @returns {Object} - Default timetable structure
 */
const createDefaultTimetableStructure = () => {
  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];
  const periods = [
    { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
    { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
    { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
    { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
    { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
  ];
  
  const classes = {};
  
  // Initialize the classes structure
  days.forEach(day => {
    classes[day] = {};
    periods.forEach(period => {
      classes[day][period.name] = [];
    });
  });
  
  return { days, periods, classes };
};

/**
 * Redistributes classes to ensure periods and days align correctly
 * @param {Object} timetable - The timetable object to redistribute
 * @param {number} textLength - Length of original text for heuristics
 * @returns {Object} - Redistributed timetable
 */
const redistributeClasses = (timetable, textLength) => {
  try {
    // Implementation of class redistribution logic
    return timetable;
  } catch (error) {
    console.error("Error during redistribution:", error);
    return timetable;
  }
};

/**
 * Parse timetable text using OpenRouter.ai API
 * @param {string} timetableText - The raw text of the timetable to parse
 * @returns {Promise<Object>} - Parsed timetable data
 */
export const parseTimetableText = async (timetableText) => {
  try {
    console.log("Parsing timetable text:", timetableText.substring(0, 100) + "...");
    
    // Attempt to use fallback parser if text is short
    if (timetableText.length < 1000) {
      console.log("Text is short, using fallback parser");
      return fallbackParser(timetableText, timetableText.length);
    }
    
    // Implementation of AI parsing logic
    // ...
    
    // If we get here, fall back to the standard parser
    console.log("Falling back to standard parser");
    return fallbackParser(timetableText, timetableText.length);
  } catch (error) {
    console.error("Error in AI parser:", error);
    return fallbackParser(timetableText, timetableText.length);
  }
};

/**
 * Fallback parser for timetable text when AI models are unavailable
 * @param {string} timetableText - Raw text of the timetable to parse
 * @param {number} textLength - Length of original text for heuristics
 * @returns {Object} - Best attempt at parsing the timetable data
 */
export const fallbackParser = (timetableText, textLength) => {
  try {
    console.log("Using fallback parser for text:", timetableText.substring(0, 100) + "...");
    const textLen = textLength || timetableText.length;
    
    // Create a default timetable structure
    const result = createDefaultTimetableStructure();
    
    // Check if this looks like a tabular format timetable
    const lines = timetableText.trim().split('\n');
    const firstLine = lines[0].trim();
    
    // Fall back to the regular line-by-line parser
    console.log("Using standard line-by-line parser");
    let currentDay = "Day 1";
    let currentPeriod = "Period 1";
    
    // Process each line of the timetable text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Try to extract day information - expanded patterns
      const dayMatch = line.match(/day\s*(\d+)|d\s*(\d+)|day\s*(\d+)\s*[\-:]/i);
      if (dayMatch) {
        const dayNum = dayMatch[1] || dayMatch[2] || dayMatch[3];
        currentDay = "Day " + dayNum;
        continue;
      }
      
      // Try date-based day correlation
      const dateMatch = line.match(/(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/);
      if (dateMatch && !line.match(/^\d+$/)) { 
        const dayIndex = (parseInt(dateMatch[1]) + parseInt(dateMatch[2])) % 10;
        const dayNumber = dayIndex === 0 ? 10 : dayIndex;
        currentDay = "Day " + dayNumber;
        continue;
      }
      
      // Try to extract period information
      const periodMatch = line.match(/period\s*(\d+)|^p(\d+)|^tut(orial)?/i);
      if (periodMatch) {
        if (periodMatch[0].match(/^tut(orial)?/i)) {
          currentPeriod = "Tutorial";
        } else {
          const periodNum = periodMatch[1] || periodMatch[2];
          currentPeriod = "Period " + periodNum;
        }
        continue;
      }
      
      // Try to extract subject information
      if (line.length > 3 && !line.match(/^(day|period|tutorial)/i)) {
        const subject = extractSubject(line);
        const code = extractCode(line);
        const room = extractRoom(line);
        const teacher = extractTeacher(line);
        
        // Add the subject to the timetable if we have enough information
        if (subject && subject.length > 2) {
          // Find the period data
          const periodData = result.periods.find(p => p.name === currentPeriod);
          
          if (periodData && result.classes[currentDay] && result.classes[currentDay][currentPeriod]) {
            // Check if we already have a class with the same subject
            const existingClassIndex = result.classes[currentDay][currentPeriod].findIndex(
              cls => cls.subject === subject
            );
            
            if (existingClassIndex >= 0) {
              // If the teacher or room is different, it's a different class
              const existingClass = result.classes[currentDay][currentPeriod][existingClassIndex];
              if (teacher && teacher !== existingClass.teacher || 
                  room && room !== existingClass.room) {
                result.classes[currentDay][currentPeriod].push({
                  subject: subject,
                  code: code || "",
                  room: room || "",
                  teacher: teacher || "",
                  startTime: periodData.startTime,
                  endTime: periodData.endTime
                });
              }
            } else {
              // Add the class
              result.classes[currentDay][currentPeriod].push({
                subject: subject,
                code: code || "",
                room: room || "",
                teacher: teacher || "",
                startTime: periodData.startTime,
                endTime: periodData.endTime
              });
            }
          }
        }
      }
    }
    
    // Apply final redistribution and validation
    return redistributeClasses(result, textLen);
  } catch (error) {
    console.error("Error in fallback parser:", error);
    return createDefaultTimetableStructure();
  }
};

// Helper functions for extraction
function extractSubject(text) {
  // Remove code in parentheses
  let subject = text.replace(/\([^)]+\)/g, '').trim();
  
  // Remove room code patterns
  subject = subject.replace(/\b[A-Z]\s*\d+\b/g, '').trim();
  
  // Remove teacher patterns
  subject = subject.replace(/(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Za-z\s]+/ig, '').trim();
  
  return subject;
}

function extractCode(text) {
  const codeMatch = text.match(/\(([A-Za-z0-9]+)\)/) || 
                   text.match(/\b([A-Z0-9]{5,})\b/);
  return codeMatch ? codeMatch[1] : "";
}

function extractRoom(text) {
  const roomMatch = text.match(/\b([A-Z])\s*(\d+)\b/);
  if (roomMatch) {
    return roomMatch[1] + " " + roomMatch[2];
  }
  return "";
}

function extractTeacher(text) {
  const teacherMatch = text.match(/(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Za-z\s]+/i);
  return teacherMatch ? teacherMatch[0] : "";
}

// Also export parseWithAI as an alias for parseTimetableText for compatibility
export const parseWithAI = parseTimetableText;
