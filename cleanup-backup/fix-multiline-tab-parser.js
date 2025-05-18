/**
 * Enhanced fix for the AI parser to handle multi-line tab-delimited timetables
 * 
 * This script specifically addresses the issue with parsing tab-delimited timetables
 * where each class entry spans multiple lines (subject, code, room, and teacher on separate lines).
 */

// Implementation to improve the fallback parser handling of tab-delimited format
function enhancedParseTimeTableDirectly(timetableData) {
  console.log('Starting enhanced direct parsing of timetable data');
  
  // Initialize result structure with default values
  const result = {
    days: [
      "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
      "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
    ],
    periods: [
      { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
      { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
      { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
      { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
      { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
    ],
    classes: {}
  };
  
  // Initialize classes structure
  result.days.forEach(day => {
    result.classes[day] = {};
    result.periods.forEach(period => {
      result.classes[day][period.name] = [];
    });
  });

  try {
    // Clean the data: normalize line-endings, remove multiple consecutive newlines
    timetableData = timetableData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    timetableData = timetableData.replace(/\n{3,}/g, '\n\n');
    
    // Split into lines
    const lines = timetableData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return result;
    
    console.log(`Processing ${lines.length} non-empty lines`);
    
    // Extract day headers from the first line
    let dayHeaders = [];
    if (lines[0].includes('\t')) {
      dayHeaders = lines[0].split('\t')
        .map(header => header.trim())
        .filter(header => header.length > 0 && header.toLowerCase().includes('day'));
    }
    
    if (dayHeaders.length === 0) {
      console.log('No day headers found in tab-delimited format');
      return result;
    }
    
    console.log(`Found ${dayHeaders.length} day headers: ${dayHeaders.join(', ')}`);
    
    // Update result with actual day headers
    result.days = dayHeaders;
    
    // Prepare for class extraction
    let currentPeriod = null;
    let periodStartTime = null;
    let periodEndTime = null;
    let periodBlocks = [];
    
    // First, identify period blocks
    let blockStart = -1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a period header line
      const isPeriodLine = line.toLowerCase().includes('period') && 
                          !line.includes('\t');
      
      if (isPeriodLine) {
        // If we already have a block in progress, save it
        if (currentPeriod && blockStart >= 0) {
          periodBlocks.push({
            period: currentPeriod,
            startTime: periodStartTime,
            endTime: periodEndTime,
            startLine: blockStart,
            endLine: i - 1
          });
        }
        
        // Start a new period block
        currentPeriod = line.match(/period\s*(\d+)/i) ? `Period ${line.match(/period\s*(\d+)/i)[1]}` : null;
        blockStart = i;
        
        // Look for time in this line or the next line
        let timeMatch = line.match(/(\d+[:\.]\d+\s*[ap]m)[–\-\—\–](\d+[:\.]\d+\s*[ap]m)/i);
        
        if (!timeMatch && i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          timeMatch = nextLine.match(/(\d+[:\.]\d+\s*[ap]m)[–\-\—\–](\d+[:\.]\d+\s*[ap]m)/i);
          if (timeMatch) i++; // Skip the time line
        }
        
        if (timeMatch) {
          periodStartTime = timeMatch[1].replace(/\s+/g, '');
          periodEndTime = timeMatch[2].replace(/\s+/g, '');
        }
      }
    }
    
    // Add the last period block if there is one
    if (currentPeriod && blockStart >= 0) {
      periodBlocks.push({
        period: currentPeriod,
        startTime: periodStartTime,
        endTime: periodEndTime,
        startLine: blockStart,
        endLine: lines.length - 1
      });
    }
    
    console.log(`Found ${periodBlocks.length} period blocks`);
    
    // Update periods in result
    periodBlocks.forEach(block => {
      const periodIndex = parseInt(block.period.match(/\d+/)[0]) - 1;
      if (periodIndex >= 0 && periodIndex < result.periods.length) {
        result.periods[periodIndex] = {
          name: block.period,
          startTime: block.startTime || result.periods[periodIndex].startTime,
          endTime: block.endTime || result.periods[periodIndex].endTime
        };
      }
    });
    
    // Process each period block
    periodBlocks.forEach(block => {
      console.log(`Processing ${block.period} (lines ${block.startLine}-${block.endLine})`);
      
      // Skip blocks with "Tutorial" in the period name
      if (block.period.toLowerCase().includes('tutorial')) {
        console.log('Skipping tutorial period');
        return;
      }
      
      // Extract class content for this period
      // In this format, classes are typically grouped into blocks of 4-5 lines per day:
      // Line 1: Subject name
      // Line 2: Course code in parentheses
      // Line 3: Room number/location
      // Line 4: Teacher name
      
      // First, group lines by tab position to reconstruct the multi-line class entries
      let classLines = [];
      let columnCount = dayHeaders.length;
      
      // Look for subject lines which typically contain the course name and might have code in parentheses
      for (let i = block.startLine + 1; i <= block.endLine; i++) {
        const line = lines[i];
        
        // Skip the period header and time lines we've already processed
        if (i === block.startLine || 
            i === block.startLine + 1 && line.match(/\d+[:\.]\d+\s*[ap]m/i)) {
          continue;
        }
        
        // Check if this is a subject line (contains a code in parentheses or is a subject name)
        if (line.includes('(') && line.includes(')') && line.includes('\t')) {
          const cells = line.split('\t');
          classLines.push(cells);
        } else if (line.includes('\t')) {
          // Add other tab-delimited lines
          const cells = line.split('\t');
          classLines.push(cells);
        }
      }
      
      // Now process each column (day) separately
      for (let dayIndex = 0; dayIndex < dayHeaders.length; dayIndex++) {
        const dayHeader = dayHeaders[dayIndex];
        let classText = [];
        
        // Collect all lines for this day column
        for (const lineArray of classLines) {
          if (dayIndex < lineArray.length) {
            const cellText = lineArray[dayIndex].trim();
            if (cellText) classText.push(cellText);
          }
        }
        
        // If we have at least one non-empty line, try to parse the class
        if (classText.length > 0) {
          const classData = classText.join('\n');
          
          // Extract subject, code, room, and teacher
          let subject = '';
          let code = '';
          let room = '';
          let teacher = '';
          
          // Look for subject name (first line if no code in it, or explicit extraction)
          if (!classText[0].includes('(') && !classText[0].includes(')')) {
            subject = classText[0];
          } else {
            // Extract subject from first line that contains code in parentheses
            const subjectLine = classText.find(line => line.includes('(') && line.includes(')'));
            if (subjectLine) {
              subject = subjectLine.split('(')[0].trim();
            }
          }
          
          // Extract code (in parentheses)
          const codeMatch = classData.match(/\(([A-Z0-9]{5,})\)/);
          if (codeMatch) {
            code = codeMatch[1];
          }
          
          // Look for room (typically letter followed by number, before teacher name)
          const roomMatch = classData.match(/\b([A-Z][\s-]?[0-9]+)\b/);
          if (roomMatch) {
            room = roomMatch[0];
          }
          
          // Look for teacher (Mr, Mrs, Ms, Dr, etc.)
          const teacherMatch = classData.match(/\b(Mr|Mrs|Ms|Miss|Dr|Prof)\b\.?\s+[A-Za-z]+\s+[A-Za-z]+/i);
          if (teacherMatch) {
            teacher = teacherMatch[0];
          }
          
          // If we have at least subject and code, create a class entry
          if (subject || code) {
            const classEntry = {
              subject: subject || code,
              code: code,
              room: room,
              teacher: teacher,
              startTime: block.startTime,
              endTime: block.endTime
            };
            
            console.log(`Created class for ${dayHeader}, ${block.period}: ${classEntry.subject} (${classEntry.code})`);
            
            // Add to result
            if (result.classes[dayHeader] && result.classes[dayHeader][block.period]) {
              result.classes[dayHeader][block.period].push(classEntry);
            }
          }
        }
      }
    });
    
    console.log('Enhanced parsing complete');
    
    // Count total classes found
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(`Enhanced parser found ${totalClasses} total classes`);
    
    return result;
  } catch (error) {
    console.error('Error in enhanced parser:', error);
    return result;
  }
}

// Test function to run the enhanced parser on a sample timetable
function testEnhancedParser() {
  const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage`;

  const result = enhancedParseTimeTableDirectly(sampleTimetable);
  console.log('Enhanced parser result:', JSON.stringify(result, null, 2));
  return result;
}

// Export the function to be used in the main application
module.exports = {
  enhancedParseTimeTableDirectly
};

// Run test if executed directly
if (require.main === module) {
  testEnhancedParser();
}
