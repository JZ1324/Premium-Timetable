// Simplified AI Timetable Parser Service
// This is a simplified version that only provides the basic fallback parser functionality
// without any of the AI features that were causing syntax errors

/**
 * Creates a default timetable structure as fallback
 * @returns {Object} - Default timetable structure
 */
const createDefaultTimetableStructure = () => {
  return {
    days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
    periods: [
      { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
      { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
      { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
      { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
      { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
    ],
    classes: {
      "Day 1": {},
      "Day 2": {},
      "Day 3": {},
      "Day 4": {},
      "Day 5": {},
      "Day 6": {},
      "Day 7": {},
      "Day 8": {},
      "Day 9": {},
      "Day 10": {}
    }
  };
};

/**
 * Simple fallback parser that attempts to extract timetable information without AI
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
    
    // Simple timetable parsing logic
    const lines = timetableText.trim().split('\n');
    let currentDay = "Day 1";
    let currentPeriod = "Period 1";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Try to extract day information
      const dayMatch = line.match(/day\s*(\d+)|d\s*(\d+)/i);
      if (dayMatch) {
        const dayNum = dayMatch[1] || dayMatch[2];
        currentDay = "Day " + dayNum;
        continue;
      }
      
      // Try to extract period information
      const periodMatch = line.match(/period\s*(\d+)|p(\d+)/i);
      if (periodMatch) {
        const periodNum = periodMatch[1] || periodMatch[2];
        currentPeriod = "Period " + periodNum;
        continue;
      }
      
      // Try to extract subject information
      if (line.length > 3 && !line.match(/^(day|period)/i)) {
        const subject = extractSubject(line);
        const code = extractCode(line);
        const room = extractRoom(line);
        const teacher = extractTeacher(line);
        
        // Add the subject to the timetable if we have enough information
        if (subject && subject.length > 2) {
          // Find the period data
          const periodData = result.periods.find(p => p.name === currentPeriod);
          
          if (periodData && result.classes[currentDay]) {
            if (!result.classes[currentDay][currentPeriod]) {
              result.classes[currentDay][currentPeriod] = [];
            }
            
            // Check if we already have this class
            const existingClass = result.classes[currentDay][currentPeriod].find(
              cls => cls.subject === subject && cls.room === room && cls.teacher === teacher
            );
            
            if (!existingClass) {
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
    
    return result;
  } catch (error) {
    console.error("Error in fallback parser:", error);
    return createDefaultTimetableStructure();
  }
};

// Since we're removing the AI parser, this function now just calls the fallback parser directly
export const parseTimetableText = async (timetableText) => {
  console.log("AI parsing disabled, using fallback parser");
  return fallbackParser(timetableText, timetableText ? timetableText.length : 0);
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
