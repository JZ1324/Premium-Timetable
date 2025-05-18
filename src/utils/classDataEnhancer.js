/**
 * Class Data Enhancer utility
 * 
 * This module transforms raw class strings from AI responses into structured class objects
 * with proper properties for subject, code, room, and teacher.
 */

/**
 * Parses a raw class string into a structured class object
 * 
 * @param {string} classString - Raw class string (e.g., "Specialist Mathematics (10SPE251101) M 07 Mr Paul Jefimenko")
 *                               or with newlines (e.g., "Specialist Mathematics\n(10SPE251101)\nM 07 Mr Paul Jefimenko")
 * @returns {Object} Structured class object with properties
 */
function parseClassString(classString) {
  if (!classString || typeof classString !== 'string') {
    return {
      subject: "Unknown",
      code: "",
      room: "",
      teacher: ""
    };
  }
  
  // Initialize default object
  const classObj = {
    subject: "",
    code: "",
    room: "",
    teacher: ""
  };
  
  // Replace newlines with spaces for consistent processing
  const normalizedString = classString.replace(/\n/g, ' ');
  
  try {
    // Extract code (pattern: text inside parentheses)
    const codeMatch = normalizedString.match(/\(([^)]+)\)/);
    if (codeMatch && codeMatch[1]) {
      classObj.code = codeMatch[1].trim();
      
      // Extract subject (text before the code parentheses)
      const subjectPart = normalizedString.split('(')[0];
      if (subjectPart) {
        classObj.subject = subjectPart.trim();
      }
      
      // Extract the part after the code for room and teacher
      const afterCodePart = normalizedString.split(')')[1];
      if (afterCodePart) {
        // Look for room pattern (usually one or two chars followed by a number)
        const roomMatch = afterCodePart.match(/([A-Za-z]{1,2}\s+\d+)/);
        if (roomMatch && roomMatch[1]) {
          classObj.room = roomMatch[1].trim();
          
          // Teacher is likely everything after the room
          const roomIndex = afterCodePart.indexOf(roomMatch[1]);
          if (roomIndex >= 0) {
            const teacherPart = afterCodePart.substring(roomIndex + roomMatch[1].length);
            classObj.teacher = teacherPart.trim();
          }
        } else {
          // If no room pattern found, just use the rest as teacher
          classObj.teacher = afterCodePart.trim();
        }
      }
    } else {
      // No code found, use basic splitting
      const parts = normalizedString.split(' ');
      if (parts.length >= 1) {
        // Assume first half is subject, second half is teacher
        const halfIndex = Math.floor(parts.length / 2);
        classObj.subject = parts.slice(0, halfIndex).join(' ').trim();
        classObj.teacher = parts.slice(halfIndex).join(' ').trim();
      } else {
        classObj.subject = normalizedString;
      }
    }
    
    // If we couldn't extract any fields properly, use the original string as subject
    if (!classObj.subject) {
      classObj.subject = normalizedString;
    }
    
    return classObj;
  } catch (error) {
    console.error("Error parsing class string:", error);
    // Fallback to using the entire string as subject
    return {
      subject: normalizedString || classString,
      code: "",
      room: "",
      teacher: ""
    };
  }
}

/**
 * Enhances a timetable data object by converting raw class strings to structured objects
 * 
 * @param {Object} timetableData - The raw timetable data
 * @returns {Object} Enhanced timetable data with structured class objects
 */
function enhanceTimetableData(timetableData) {
  if (!timetableData || !timetableData.classes) {
    return timetableData;
  }
  
  const enhancedData = {
    ...timetableData,
    classes: {}
  };
  
  // Process each day
  Object.keys(timetableData.classes).forEach(day => {
    enhancedData.classes[day] = {};
    
    // Process each period in the day
    Object.keys(timetableData.classes[day]).forEach(period => {
      const classes = timetableData.classes[day][period];
      
      // If period contains an array of class strings, convert each to an object
      if (Array.isArray(classes)) {
        enhancedData.classes[day][period] = classes.map(classString => {
          return parseClassString(classString);
        });
      } else {
        // If not an array, create empty array
        enhancedData.classes[day][period] = [];
      }
    });
  });
  
  return enhancedData;
}

// Export functions for use in other modules
module.exports = {
  parseClassString,
  enhanceTimetableData
};
