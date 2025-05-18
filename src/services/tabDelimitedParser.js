/**
 * Tab Delimited Parser Module
 * 
 * This module provides specialized functions for parsing tab-delimited timetable formats,
 * which are common in school systems.
 */

/**
 * Extract class information from a text block
 * @param {string} text - The text block containing class information
 * @param {string} period - The current period name
 * @param {string} startTime - The period start time
 * @param {string} endTime - The period end time
 * @returns {Object|null} - Extracted class data or null if extraction failed
 */
export function extractClassInfo(text, period = 'Period 1', startTime = '8:35am', endTime = '9:35am') {
  if (!text || text.trim().length === 0) return null;
  
  try {
    // Default class data structure
    const classData = {
      subject: 'Unknown',
      code: '',
      room: '',
      teacher: '',
      startTime: startTime,
      endTime: endTime
    };
    
    // Split the text into lines for processing
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) return null;
    
    // First line is typically the subject
    classData.subject = lines[0];
    
    // Look for course code in parentheses
    const codeMatch = text.match(/\(([A-Za-z0-9\-\s]+)\)/);
    if (codeMatch && codeMatch[1]) {
      classData.code = codeMatch[1].trim();
    }
    
    // Look for room information - typically starts with a letter followed by numbers
    // or contains keywords like "Room", "Lab", etc.
    const roomPatterns = [
      /\b([A-Z]\s*\d+)\b/,                // M 07, S 01 format
      /\broom\s+([A-Za-z0-9\-\s]+)\b/i,  // "Room 101" format
      /\blab\s+([A-Za-z0-9\-\s]+)\b/i    // "Lab A" format
    ];
    
    for (const pattern of roomPatterns) {
      const roomMatch = text.match(pattern);
      if (roomMatch && roomMatch[1]) {
        classData.room = roomMatch[1].trim();
        break;
      }
    }
    
    // Look for teacher information - typically prefixed with Mr, Mrs, Ms, Dr, etc.
    const teacherPatterns = [
      /\b(Mr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      /\b(Mrs\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      /\b(Ms\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      /\b(Dr\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      /\b(Prof(?:essor)?\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/
    ];
    
    for (const pattern of teacherPatterns) {
      const teacherMatch = text.match(pattern);
      if (teacherMatch && teacherMatch[1]) {
        classData.teacher = teacherMatch[1].trim();
        break;
      }
    }
    
    return classData;
  } catch (error) {
    console.error('Error extracting class info:', error);
    return null;
  }
}

/**
 * Parse a tab-delimited timetable format
 * @param {string} timetableData - The raw timetable data
 * @param {Array} defaultDays - Default day headers
 * @param {Array} defaultPeriods - Default period information
 * @returns {Object} - Parsed timetable structure
 */
export function parseTabDelimitedTimetable(timetableData, defaultDays, defaultPeriods) {
  console.log('Starting specialized tab-delimited timetable parser');
  
  const result = {
    days: [...defaultDays],
    periods: [...defaultPeriods],
    classes: {}
  };
  
  // Initialize the classes structure
  defaultDays.forEach(day => {
    result.classes[day] = {};
    defaultPeriods.forEach(period => {
      result.classes[day][period.name] = [];
    });
  });
  
  try {
    // Split the input by lines
    const lines = timetableData.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.error('No lines found in timetable data');
      return result;
    }
    
    console.log(`Found ${lines.length} non-empty lines in tab-delimited timetable`);
    
    // Extract day headers from the first line
    const firstLine = lines[0];
    if (!firstLine.includes('\t')) {
      console.warn('Expected tab-delimited format, but no tabs found in first line');
    }
    
    const dayHeaders = firstLine.split('\t')
      .map(header => header.trim())
      .filter(header => header.length > 0);
    
    console.log(`Extracted ${dayHeaders.length} day headers:`, dayHeaders);
    
    // If we found valid day headers, update the days in the result
    if (dayHeaders.length > 0) {
      // Clean up day headers to map them to standard format
      result.days = cleanupDayHeaders(dayHeaders);
      console.log('Using day headers from timetable:', result.days);
      
      // Reset the classes structure with the actual days
      result.days.forEach(day => {
        result.classes[day] = {};
        defaultPeriods.forEach(period => {
          result.classes[day][period.name] = [];
        });
      });
    }
    
    // Find period information
    let currentPeriod = "Period 1";
    let periodStartTime = "8:35am";
    let periodEndTime = "9:35am";
    
    // Process each line after the header to extract class information
    let lineIndex = 1; // Start from the second line (after day headers)
    let classBuffer = Array(dayHeaders.length).fill('');
    let classCount = 0;
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      lineIndex++;
      
      // Check if this line defines a new period
      if (/period\s*\d+/i.test(line)) {
        // Extract period number
        const periodMatch = line.match(/period\s*(\d+)/i);
        if (periodMatch && periodMatch[1]) {
          currentPeriod = `Period ${periodMatch[1]}`;
          console.log(`Found period marker: ${currentPeriod}`);
        }
        
        // Look for time information in the next line
        if (lineIndex < lines.length) {
          const timeLine = lines[lineIndex];
          const timeMatch = timeLine.match(/(\d+[:\.]\d+\s*[ap]m)[^\d]*(\d+[:\.]\d+\s*[ap]m)/i);
          
          if (timeMatch && timeMatch[1] && timeMatch[2]) {
            periodStartTime = timeMatch[1];
            periodEndTime = timeMatch[2];
            console.log(`Found period time: ${periodStartTime} - ${periodEndTime}`);
            lineIndex++; // Skip this line as we've processed it
          }
        }
        
        // Process all the classes in the buffer before moving to the next period
        for (let dayIndex = 0; dayIndex < dayHeaders.length; dayIndex++) {
          if (classBuffer[dayIndex].length > 0) {
            // Try to extract class information from the buffer
            const classData = extractClassInfo(classBuffer[dayIndex], currentPeriod, periodStartTime, periodEndTime);
            
            if (classData) {
              const dayName = result.days[dayIndex] || `Day ${dayIndex + 1}`;
              
              // Ensure this period exists in the structure
              if (!result.classes[dayName][currentPeriod]) {
                result.classes[dayName][currentPeriod] = [];
              }
              
              result.classes[dayName][currentPeriod].push(classData);
              classCount++;
            }
          }
          
          // Reset the buffer for this day
          classBuffer[dayIndex] = '';
        }
        
        continue;
      }
      
      // If this line has tabs, it might contain class data for different days
      if (line.includes('\t')) {
        const parts = line.split('\t');
        
        // Add each part to the corresponding day's buffer
        for (let i = 0; i < Math.min(parts.length, classBuffer.length); i++) {
          if (parts[i].trim().length > 0) {
            classBuffer[i] += (classBuffer[i].length > 0 ? '\n' : '') + parts[i].trim();
          }
        }
      } else {
        // If no tabs, this might be continuation of class data for all days
        // or a specific piece of information like time
        
        // Check for time pattern to update period times
        const timeMatch = line.match(/(\d+[:\.]\d+\s*[ap]m)[^\d]*(\d+[:\.]\d+\s*[ap]m)/i);
        if (timeMatch && timeMatch[1] && timeMatch[2]) {
          periodStartTime = timeMatch[1];
          periodEndTime = timeMatch[2];
          console.log(`Updated period time: ${periodStartTime} - ${periodEndTime}`);
          continue;
        }
        
        // Otherwise, add to all non-empty buffers as additional information
        for (let i = 0; i < classBuffer.length; i++) {
          if (classBuffer[i].length > 0) {
            classBuffer[i] += '\n' + line;
          }
        }
      }
    }
    
    // Process any remaining class data in the buffer
    for (let dayIndex = 0; dayIndex < dayHeaders.length; dayIndex++) {
      if (classBuffer[dayIndex].length > 0) {
        const classData = extractClassInfo(classBuffer[dayIndex], currentPeriod, periodStartTime, periodEndTime);
        
        if (classData) {
          const dayName = result.days[dayIndex] || `Day ${dayIndex + 1}`;
          
          // Ensure this period exists in the structure
          if (!result.classes[dayName][currentPeriod]) {
            result.classes[dayName][currentPeriod] = [];
          }
          
          result.classes[dayName][currentPeriod].push(classData);
          classCount++;
        }
      }
    }
    
    console.log(`Tab-delimited parser found ${classCount} classes total`);
    
    // Update periods in the result with the actual times we found
    const periodWithTimes = result.periods.find(p => p.name === currentPeriod);
    if (periodWithTimes) {
      periodWithTimes.startTime = periodStartTime;
      periodWithTimes.endTime = periodEndTime;
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing tab-delimited timetable:', error);
    return result;
  }
}

/**
 * Helper function to clean up day headers
 * @param {Array} headers - The raw day headers
 * @returns {Array} - Cleaned up day headers
 */
function cleanupDayHeaders(headers) {
  if (!headers || !Array.isArray(headers)) return [];
  
  // Map of common weekday names
  const weekdayMap = {
    'mon': 'Day 1',
    'monday': 'Day 1',
    'tue': 'Day 2',
    'tuesday': 'Day 2',
    'wed': 'Day 3',
    'wednesday': 'Day 3',
    'thu': 'Day 4',
    'thursday': 'Day 4',
    'fri': 'Day 5',
    'friday': 'Day 5'
  };
  
  return headers.map(header => {
    const lowerHeader = header.toLowerCase().trim();
    
    // Check if it's already a "Day X" format
    const dayMatch = lowerHeader.match(/day\s*(\d+)/i);
    if (dayMatch && dayMatch[1]) {
      return `Day ${dayMatch[1]}`;
    }
    
    // Check if it's a weekday name
    for (const [key, value] of Object.entries(weekdayMap)) {
      if (lowerHeader.includes(key)) {
        return value;
      }
    }
    
    // If no match, return as is
    return header;
  });
}

export default { 
  parseTabDelimitedTimetable,
  extractClassInfo
};
