/**
 * Fix for the fallback parser in the AI Parser Service
 * 
 * This script provides a function to patch the aiParserService.js file
 * to improve handling of tab-delimited timetables where each class spans
 * multiple lines.
 */

const fs = require('fs');
const path = require('path');

// Path to the AI Parser Service file
const aiParserServicePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Improved parseTimeTableDirectly method for tab-delimited format
const improvedParseTimeTableDirectly = `
  // Enhanced parseTimeTableDirectly method for tab-delimited timetables
  parseTimeTableDirectly(timetableData) {
    console.log('Starting direct parsing of timetable data');
    
    // Initialize result structure
    const result = {
      days: [...this.defaultDays],
      periods: [...this.defaultPeriods],
      classes: {}
    };
    
    // Initialize classes object with empty structure for all days and periods
    this.defaultDays.forEach(day => {
      result.classes[day] = {};
      this.defaultPeriods.forEach(period => {
        result.classes[day][period.name] = [];
      });
    });

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
      
      console.log('Timetable data preview:', 
        timetableData.split('\\n').slice(0, 5).join('\\n'));
      
      // Step 1: Process the day headers from the first line
      let dayHeaders = [];
      
      // Check if first line contains tabs, indicating tab-delimited format
      if (lines[0].includes('\\t')) {
        console.log("Tab-delimited format detected in header row");
        const tabCandidates = lines[0].split('\\t')
          .map(d => d.trim())
          .filter(d => d && d.length > 0);
          
        if (tabCandidates.length >= 2) {
          const scoredTabCandidates = tabCandidates
            .map(text => ({ text, score: this.isDayHeader(text) ? 10 : 0 }))
            .filter(c => c.score > 0);
            
          if (scoredTabCandidates.length >= 2) {
            console.log("Found day headers using tab delimiter:", 
              scoredTabCandidates.map(c => c.text).join(', '));
            dayHeaders = scoredTabCandidates.map(c => c.text);
          }
        }
      }
      
      // If no day headers found yet, try other methods
      if (dayHeaders.length === 0) {
        // Try various splitting methods with tab-delimited format given priority
        const possibleDelimiters = ['\\t', /\\s{2,}/, ',', '|', ';', /\\s+/];
        let allCandidateHeaders = [];
        
        for (const delimiter of possibleDelimiters) {
          const candidates = lines[0].split(delimiter)
            .map(d => d.trim())
            .filter(d => d && d.length > 0);
          
          const scoredCandidates = candidates
            .map(text => ({ text, score: this.isDayHeader(text) ? 10 : 0 }))
            .filter(c => c.score > 0);
          
          if (scoredCandidates.length >= 2) {
            allCandidateHeaders = [...allCandidateHeaders, ...scoredCandidates];
          }
        }
        
        // Sort by score and get unique values
        const uniqueHeaders = [...new Set(allCandidateHeaders
          .sort((a, b) => b.score - a.score)
          .map(c => c.text))];
        
        dayHeaders = uniqueHeaders;
      }
      
      // If we still don't have day headers, use default day names
      if (dayHeaders.length < 2) {
        console.log('No day headers found in data, using default day names');
        dayHeaders = this.defaultDays.slice(0, 10);
      }
      
      console.log(\`Found \${dayHeaders.length} day headers:\`, dayHeaders);
      
      // Update result with actual day headers we found
      result.days = dayHeaders;
      
      // Reinitialize classes structure with actual day headers
      Object.keys(result.classes).forEach(key => delete result.classes[key]);
      dayHeaders.forEach(day => {
        result.classes[day] = {};
        this.defaultPeriods.forEach(period => {
          result.classes[day][period.name] = [];
        });
      });
      
      // Step 2: Parse the timetable structure
      // For tab-delimited timetables where classes span multiple lines
      
      let currentPeriod = null;
      let periodStartTime = '';
      let periodEndTime = '';
      let currentPeriodStartLine = -1;
      
      // First, identify period blocks in the timetable
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line contains a period marker
        const periodMatch = line.match(/^Period\\s+(\\d+)$/i);
        
        if (periodMatch) {
          const periodNum = parseInt(periodMatch[1]);
          const newPeriod = \`Period \${periodNum}\`;
          
          // If we were already processing a period, consider the previous period block complete
          if (currentPeriod && currentPeriodStartLine >= 0) {
            // Process the previous period block here if needed
          }
          
          // Start a new period
          currentPeriod = newPeriod;
          currentPeriodStartLine = i;
          
          // Look for time in the next line
          if (i + 1 < lines.length) {
            const timeMatch = lines[i+1].match(/(\\d+[:.]\\d+\\s*[ap]m)[–\\-\\—\\–](\\d+[:.]\\d+\\s*[ap]m)/i);
            if (timeMatch) {
              periodStartTime = timeMatch[1].replace(/\\s+/g, '');
              periodEndTime = timeMatch[2].replace(/\\s+/g, '');
              
              // Update period information in the result
              const periodIndex = periodNum - 1;
              if (periodIndex >= 0 && periodIndex < result.periods.length) {
                result.periods[periodIndex] = {
                  name: currentPeriod,
                  startTime: periodStartTime,
                  endTime: periodEndTime
                };
              }
              
              // Skip the time line
              i++;
            }
          }
          
          // Skip to next iteration to process the content of this period
          continue;
        }
        
        // If we're in a period block and find a line with tabs, it might contain class information
        if (currentPeriod && line.includes('\\t')) {
          // Ignore lines with "tutorial" in them
          if (line.toLowerCase().includes('tutorial')) {
            continue;
          }
          
          const cells = line.split('\\t');
          
          // We need to collect multiple lines to form complete class entries
          // Check if this line contains subject names or course codes
          
          const containsSubject = !line.includes('(') || 
            (line.includes('(') && line.includes(')') && 
              cells.some(cell => cell.length > 10)); // Likely contains subject name
              
          const containsCode = line.includes('(') && line.includes(')') && 
            line.match(/\\(([A-Z0-9]{5,})\\)/); // Contains course codes
            
          const containsRoom = cells.some(cell => /[A-Z]\\s?\\d+/.test(cell)) &&
            !line.toLowerCase().includes('period'); // Contains room codes
            
          const containsTeacher = (line.includes('Mr ') || line.includes('Ms ') || 
            line.includes('Mrs ') || line.includes('Dr ')); // Contains teacher names
          
          // Keep track of what we've found for each column
          // For tab-delimited format, we need to track what we find per day/column
          if (containsSubject || containsCode || containsRoom || containsTeacher) {
            // Process each cell as a potential part of a class
            for (let dayIndex = 0; dayIndex < Math.min(cells.length, dayHeaders.length); dayIndex++) {
              const cellContent = cells[dayIndex].trim();
              if (!cellContent) continue;
              
              const dayHeader = dayHeaders[dayIndex];
              
              // Initialize or update class info for this day/period
              if (!result.classes[dayHeader][currentPeriod].length) {
                result.classes[dayHeader][currentPeriod].push({
                  subject: '',
                  code: '',
                  room: '',
                  teacher: '',
                  startTime: periodStartTime,
                  endTime: periodEndTime,
                  _raw: [] // Temporary array to collect all lines for this class
                });
              }
              
              // Add this cell content to the raw data for this class
              const classEntry = result.classes[dayHeader][currentPeriod][0];
              classEntry._raw.push(cellContent);
              
              // Try to extract information based on content
              if (containsSubject && !containsCode && !classEntry.subject) {
                classEntry.subject = cellContent;
              }
              
              if (containsCode) {
                const codeMatch = cellContent.match(/\\(([A-Z0-9]{5,})\\)/);
                if (codeMatch) {
                  classEntry.code = codeMatch[1];
                  
                  // If no subject is set yet, extract it from the code line
                  if (!classEntry.subject && cellContent.includes('(')) {
                    classEntry.subject = cellContent.split('(')[0].trim();
                  }
                }
              }
              
              if (containsRoom && !classEntry.room && /[A-Z]\\s?\\d+/.test(cellContent)) {
                const roomMatch = cellContent.match(/([A-Z]\\s?\\d+)/);
                if (roomMatch) classEntry.room = roomMatch[0];
              }
              
              if (containsTeacher && !classEntry.teacher) {
                const teacherPattern = /\\b(Mr|Mrs|Ms|Miss|Dr)\\b\\.?\\s+[A-Za-z]+\\s+[A-Za-z]+/i;
                const teacherMatch = cellContent.match(teacherPattern);
                if (teacherMatch) classEntry.teacher = teacherMatch[0];
              }
            }
          }
        }
      }
      
      // Process all classes to ensure they have complete information
      for (const day in result.classes) {
        for (const period in result.classes[day]) {
          const classes = result.classes[day][period];
          
          for (let i = 0; i < classes.length; i++) {
            const classEntry = classes[i];
            
            // Process the raw data collected to ensure all fields are populated
            if (classEntry._raw && classEntry._raw.length > 0) {
              const rawData = classEntry._raw.join('\\n');
              
              // Try to extract subject if not already set
              if (!classEntry.subject) {
                // First line is likely the subject if not containing parentheses
                if (classEntry._raw[0] && !classEntry._raw[0].includes('(')) {
                  classEntry.subject = classEntry._raw[0];
                }
              }
              
              // Try to extract code if not already set
              if (!classEntry.code) {
                const codeMatch = rawData.match(/\\(([A-Z0-9]{5,})\\)/);
                if (codeMatch) classEntry.code = codeMatch[1];
              }
              
              // Try to extract room if not already set
              if (!classEntry.room) {
                const roomMatch = rawData.match(/\\b([A-Z]\\s?\\d+)\\b/);
                if (roomMatch) classEntry.room = roomMatch[0];
              }
              
              // Try to extract teacher if not already set
              if (!classEntry.teacher) {
                const teacherMatch = rawData.match(/\\b(Mr|Mrs|Ms|Miss|Dr)\\b\\.?\\s+[A-Za-z]+\\s+[A-Za-z]+/i);
                if (teacherMatch) classEntry.teacher = teacherMatch[0];
              }
              
              // Clean up - remove the temporary raw data
              delete classEntry._raw;
              
              // If we don't have a subject but have a code, use code as subject
              if (!classEntry.subject && classEntry.code) {
                classEntry.subject = classEntry.code;
              }
              
              // Remove entry if we don't have minimum required data
              if (!classEntry.subject && !classEntry.code) {
                classes.splice(i, 1);
                i--;
              }
            }
          }
        }
      }
      
      console.log('Direct parsing complete');
      
      // Count classes found
      let totalClasses = 0;
      for (const day in result.classes) {
        for (const period in result.classes[day]) {
          totalClasses += result.classes[day][period].length;
        }
      }
      
      console.log(\`Direct parsing found \${totalClasses} classes across all days and periods\`);
      
      return this.enhanceClassData(result);
    } catch (error) {
      console.error('Error in direct parser:', error);
      return result;
    }
  }
`;

// Function to patch the AI Parser Service
function patchAiParserService() {
  try {
    console.log('Reading original AI Parser Service...');
    let content = fs.readFileSync(aiParserServicePath, 'utf8');
    
    // Backup the original file
    const backupPath = `${aiParserServicePath}.fallback_parser_bak`;
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`Original file backed up to ${backupPath}`);
    
    // Find and replace the parseTimeTableDirectly method
    const methodRegex = /parseTimeTableDirectly\(timetableData\)\s*\{[\s\S]*?(?=\n\s{2}[^\s])/g;
    
    if (methodRegex.test(content)) {
      content = content.replace(methodRegex, improvedParseTimeTableDirectly);
      
      // Write the patched file
      fs.writeFileSync(aiParserServicePath, content, 'utf8');
      console.log('AI Parser Service successfully patched with improved fallback parser');
      return true;
    } else {
      console.error('Could not find parseTimeTableDirectly method in AI Parser Service');
      return false;
    }
  } catch (error) {
    console.error('Error patching AI Parser Service:', error);
    return false;
  }
}

// Run the patch function
if (require.main === module) {
  const result = patchAiParserService();
  console.log(result ? 'Patch successful!' : 'Patch failed!');
}
