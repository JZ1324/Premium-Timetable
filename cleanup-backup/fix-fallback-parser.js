/**
 * Fix for AI Parser Service Fallback Parser
 * 
 * This script adds support for multi-line tab-delimited timetable format to the
 * fallback parser in the aiParserService.js file.
 */

const fs = require('fs');
const path = require('path');

// Path to the AI parser service file
const aiParserServicePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Modified fallbackParser function to export
const newFallbackParser = `
// Export the direct parser as the fallbackParser for ImportTimetable.js
export const fallbackParser = (timetableText) => {
  // Check if the timetable text is in the multi-line tab-delimited format
  const isTabDelimitedMultiLine = checkForMultiLineTabDelimited(timetableText);
  
  // Use specialized parser for this format if detected
  if (isTabDelimitedMultiLine) {
    console.log('Using specialized multi-line tab-delimited format parser');
    const result = parseMultiLineTabDelimitedTimetable(timetableText);
    return aiParserService.enhanceClassData(result);
  }
  
  // Otherwise use the regular direct parser
  const result = aiParserService.parseTimeTableDirectly(timetableText);
  return aiParserService.enhanceClassData(result);
};

// Helper to check if the timetable is in multi-line tab-delimited format
function checkForMultiLineTabDelimited(text) {
  // Check for key characteristics of this format:
  // 1. First line has tabs and contains day headers
  // 2. Followed by a period line
  // 3. Followed by time line
  // 4. Then subject line with tabs
  
  const lines = text.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 5) return false; // Need at least 5 lines
  
  // First line should have tabs and contain day headers
  const firstLine = lines[0];
  if (!firstLine.includes('\\t') || !firstLine.toLowerCase().includes('day')) {
    return false;
  }
  
  // Second line often starts with "Period"
  if (!lines[1].match(/^Period\\s+\\d+/i)) {
    return false;
  }
  
  // Third line often contains time range
  if (!lines[2].match(/(\\d+[:.]\\d+\\s*[ap]m)[–\\-\\—\\–](\\d+[:.]\\d+\\s*[ap]m)/i)) {
    return false;
  }
  
  // Fourth line should have tabs (subject names)
  if (!lines[3].includes('\\t')) {
    return false;
  }
  
  // Fifth line often has course codes in parentheses
  if (lines.length >= 5 && !lines[4].match(/\\([A-Z0-9]+\\)/)) {
    return false;
  }
  
  return true;
}

// Specialized parser for multi-line tab-delimited format
function parseMultiLineTabDelimitedTimetable(timetableData) {
  console.log('Starting specialized multi-line tab-delimited parser');
  
  // Initialize result structure
  const result = {
    days: [],
    periods: [
      { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
      { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
      { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
      { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
      { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
    ],
    classes: {}
  };

  try {
    // Normalize line endings and clean up the data
    timetableData = timetableData
      .replace(/\\r\\n/g, '\\n')
      .replace(/\\r/g, '\\n')
      .replace(/[\\u200B-\\u200D\\uFEFF]/g, ''); // Remove invisible characters
    
    // Split into lines and filter out empty ones
    const lines = timetableData.split('\\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.error('No data found in timetable');
      return result;
    }
    
    // Step 1: Extract day headers from the first line
    const dayHeaders = lines[0].split('\\t')
      .map(header => header.trim())
      .filter(header => header.length > 0);
    
    console.log(\`Found \${dayHeaders.length} day headers: \${dayHeaders.join(', ')}\`);
    
    // Update result with actual day headers
    result.days = dayHeaders;
    
    // Initialize classes structure for all days
    dayHeaders.forEach(day => {
      result.classes[day] = {};
      result.periods.forEach(period => {
        result.classes[day][period.name] = [];
      });
    });
    
    // Step 2: Parse the timetable structure into period blocks
    let currentLineIndex = 1; // Start after the header line
    
    while (currentLineIndex < lines.length) {
      // Look for period header
      const periodMatch = lines[currentLineIndex].match(/^Period\\s+(\\d+)/i);
      
      if (periodMatch) {
        const periodNum = parseInt(periodMatch[1]);
        const currentPeriod = \`Period \${periodNum}\`;
        console.log(\`Found \${currentPeriod} at line \${currentLineIndex}\`);
        
        currentLineIndex++; // Move past the period line
        
        // Look for time range in the next line
        let startTime = '';
        let endTime = '';
        
        if (currentLineIndex < lines.length) {
          const timeMatch = lines[currentLineIndex].match(/(\\d+[:.]\\d+\\s*[ap]m)[–\\-\\—\\–](\\d+[:.]\\d+\\s*[ap]m)/i);
          
          if (timeMatch) {
            startTime = timeMatch[1].trim();
            endTime = timeMatch[2].trim();
            
            // Update period time in the result
            if (periodNum >= 1 && periodNum <= result.periods.length) {
              result.periods[periodNum-1].startTime = startTime;
              result.periods[periodNum-1].endTime = endTime;
            }
            
            currentLineIndex++; // Move past the time line
          }
        }
        
        // Skip "Tutorial" periods
        if (currentPeriod.toLowerCase().includes('tutorial')) {
          // Look for the next period or end of data
          while (currentLineIndex < lines.length && !lines[currentLineIndex].match(/^Period\\s+\\d+/i)) {
            currentLineIndex++;
          }
          continue;
        }
        
        // Process class data lines for this period
        // Classes are typically organized with:
        // Line 1: Subject line with tab-separated subjects for each day
        // Line 2: Code line with tab-separated codes in parentheses
        // Line 3: Room line with tab-separated room numbers
        // Line 4: Teacher line with tab-separated teacher names
        
        let subjectLine = null;
        let codeLine = null;
        let roomLine = null;
        let teacherLine = null;
        
        // Try to find these four lines for the current period
        while (currentLineIndex < lines.length) {
          const line = lines[currentLineIndex];
          
          // Stop if we hit the next period
          if (line.match(/^Period\\s+\\d+/i)) {
            break;
          }
          
          // Check what type of line this is
          if (line.includes('\\t')) {
            // Subject line - typically doesn't have parentheses or has text before parentheses
            if (!subjectLine && (!line.startsWith('(') || line.split('\\t').some(cell => {
              const parts = cell.split('(');
              return parts.length > 1 && parts[0].trim().length > 0;
            }))) {
              subjectLine = line;
            }
            // Code line - contains course codes in parentheses
            else if (!codeLine && line.includes('(') && line.includes(')') && 
                    line.match(/\\([A-Z0-9]{5,}\\)/)) {
              codeLine = line;
            }
            // Room line - typically short codes like "A1", "B2", etc.
            else if (!roomLine && line.split('\\t').some(cell => 
              /^[A-Z]\\s?\\d+$/.test(cell.trim()))) {
              roomLine = line;
            }
            // Teacher line - contains "Mr", "Ms", etc.
            else if (!teacherLine && (line.includes('Mr ') || line.includes('Ms ') || 
                   line.includes('Mrs ') || line.includes('Dr '))) {
              teacherLine = line;
            }
          }
          
          currentLineIndex++;
        }
        
        // Process these lines to extract class information for each day
        if (subjectLine && subjectLine.includes('\\t')) {
          const subjects = subjectLine.split('\\t');
          const codes = codeLine ? codeLine.split('\\t') : [];
          const rooms = roomLine ? roomLine.split('\\t') : [];
          const teachers = teacherLine ? teacherLine.split('\\t') : [];
          
          // Process each day's class
          for (let dayIndex = 0; dayIndex < Math.min(subjects.length, dayHeaders.length); dayIndex++) {
            const subject = subjects[dayIndex]?.trim();
            const codeText = codes[dayIndex]?.trim() || '';
            const room = rooms[dayIndex]?.trim() || '';
            const teacher = teachers[dayIndex]?.trim() || '';
            
            // Skip if no meaningful data
            if (!subject && !codeText) continue;
            
            // Extract code from text (e.g., "(10SPE251101)" -> "10SPE251101")
            const codeMatch = codeText.match(/\\(([A-Z0-9]{5,})\\)/);
            const code = codeMatch ? codeMatch[1] : '';
            
            const classEntry = {
              subject: subject || code,
              code: code,
              room: room,
              teacher: teacher,
              startTime: startTime || result.periods[periodNum-1].startTime,
              endTime: endTime || result.periods[periodNum-1].endTime
            };
            
            // Add to result
            const dayHeader = dayHeaders[dayIndex];
            if (result.classes[dayHeader] && result.classes[dayHeader][currentPeriod]) {
              result.classes[dayHeader][currentPeriod].push(classEntry);
              console.log(\`Added class for \${dayHeader}, \${currentPeriod}: \${classEntry.subject || '(unnamed)'} \${classEntry.code ? '(' + classEntry.code + ')' : ''}\`);
            }
          }
        }
      } else {
        // Skip lines that don't start periods
        currentLineIndex++;
      }
    }
    
    // Count total classes found
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(\`Multi-line tab parser found \${totalClasses} total classes\`);
    
    return result;
  } catch (error) {
    console.error('Error parsing timetable:', error);
    return result;
  }
}`;

// Function to patch the AI Parser Service file
function patchFallbackParser() {
  try {
    // Read the AI parser service file
    console.log('Reading AI Parser Service file...');
    const content = fs.readFileSync(aiParserServicePath, 'utf8');
    
    // Create a backup of the original file
    const backupPath = `${aiParserServicePath}.fallback_fix_backup`;
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`Original file backed up to ${backupPath}`);
    
    // Find the fallbackParser function to replace
    const fallbackParserRegex = /\/\/ Export the direct parser as the fallbackParser for ImportTimetable\.js[\s\S]*?export const fallbackParser[\s\S]*?};/g;
    
    if (fallbackParserRegex.test(content)) {
      // Replace the fallbackParser function with the enhanced version
      const updatedContent = content.replace(fallbackParserRegex, newFallbackParser);
      
      // Write the updated content back to the file
      fs.writeFileSync(aiParserServicePath, updatedContent, 'utf8');
      
      console.log('✅ Successfully patched the fallback parser with enhanced multi-line tab-delimited support');
      return true;
    } else {
      console.error('❌ Could not find the fallbackParser function in the AI Parser Service file');
      return false;
    }
  } catch (error) {
    console.error('Error patching the fallback parser:', error);
    return false;
  }
}

// Run the patch function if this script is executed directly
if (require.main === module) {
  console.log('Applying fix for AI Parser Service fallback parser...');
  const result = patchFallbackParser();
  console.log(result ? 'Fix applied successfully!' : 'Failed to apply fix.');
}
