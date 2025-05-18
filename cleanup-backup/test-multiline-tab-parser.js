/**
 * Enhanced test for the multi-line tab-delimited timetable parser
 * 
 * This script tests a dedicated parser for tab-delimited timetables
 * where each class entry spans multiple lines.
 */

// Enhanced parser function for multi-line tab-delimited timetables
function parseMultiLineTabDelimitedTimetable(rawTimetableData) {
  console.log('Starting dedicated multi-line tab parser');
  
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
    const timetableData = rawTimetableData
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove invisible characters
    
    // Split into lines and filter out empty ones
    const lines = timetableData.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.error('No data found in timetable');
      return result;
    }
    
    // Step 1: Extract day headers from the first line
    if (!lines[0].includes('\t')) {
      console.error('First line does not contain tabs - not a tab-delimited format');
      return result;
    }
    
    const dayHeaders = lines[0].split('\t')
      .map(header => header.trim())
      .filter(header => header.length > 0);
    
    if (dayHeaders.length === 0) {
      console.error('No day headers found in the first line');
      return result;
    }
    
    console.log(`Found ${dayHeaders.length} day headers: ${dayHeaders.join(', ')}`);
    
    // Update result with actual day headers
    result.days = dayHeaders;
    
    // Initialize classes structure for all days
    dayHeaders.forEach(day => {
      result.classes[day] = {};
      result.periods.forEach(period => {
        result.classes[day][period.name] = [];
      });
    });
    
    // Step 2: Parse the timetable structure
    // We'll treat this as a series of blocks, each starting with "Period X"
    
    let currentLineIndex = 1; // Start after the header line
    let currentPeriod = null;
    
    // Process each period block
    while (currentLineIndex < lines.length) {
      // Look for period header (e.g., "Period 1")
      const periodMatch = lines[currentLineIndex].match(/^Period\s+(\d+)/i);
      
      if (periodMatch) {
        const periodNum = parseInt(periodMatch[1]);
        currentPeriod = `Period ${periodNum}`;
        console.log(`Found ${currentPeriod} at line ${currentLineIndex}`);
        
        // Move to the next line (which might contain the time range)
        currentLineIndex++;
        
        // Check for time range
        if (currentLineIndex < lines.length && 
            (lines[currentLineIndex].includes('am') || lines[currentLineIndex].includes('pm'))) {
          
          const timeMatch = lines[currentLineIndex].match(/(\d+:\d+[ap]m)[–\-\—\–](\d+:\d+[ap]m)/i);
          
          if (timeMatch) {
            const startTime = timeMatch[1];
            const endTime = timeMatch[2];
            
            // Update period time in the result
            if (periodNum >= 1 && periodNum <= result.periods.length) {
              result.periods[periodNum-1].startTime = startTime;
              result.periods[periodNum-1].endTime = endTime;
            }
            
            console.log(`Time range: ${startTime} to ${endTime}`);
            currentLineIndex++;
          }
        }
        
        // Now we should be at the first line of class data
        // In this format, we expect class entries to be organized in blocks of lines:
        // - First line: Subject names for each day
        // - Second line: Course codes for each day
        // - Third line: Room numbers for each day
        // - Fourth line: Teacher names for each day
        
        let subjectLine = null;
        let codeLine = null;
        let roomLine = null;
        let teacherLine = null;
        
        // Find subject line (contains actual subject names, possibly with some having codes)
        if (currentLineIndex < lines.length && !lines[currentLineIndex].toLowerCase().includes('period')) {
          subjectLine = lines[currentLineIndex];
          currentLineIndex++;
        }
        
        // Find code line (typically contains course codes in parentheses)
        if (currentLineIndex < lines.length && 
            lines[currentLineIndex].includes('(') && 
            !lines[currentLineIndex].toLowerCase().includes('period')) {
          codeLine = lines[currentLineIndex];
          currentLineIndex++;
        }
        
        // Find room line (typically contains room codes like "M 07")
        if (currentLineIndex < lines.length && 
            !lines[currentLineIndex].toLowerCase().includes('period') &&
            !lines[currentLineIndex].match(/^Tutorial/i)) {
          roomLine = lines[currentLineIndex];
          currentLineIndex++;
        }
        
        // Find teacher line (typically contains teacher names like "Mr Paul Smith")
        if (currentLineIndex < lines.length && 
            !lines[currentLineIndex].toLowerCase().includes('period') &&
            !lines[currentLineIndex].match(/^Tutorial/i) &&
            (lines[currentLineIndex].includes('Mr') || 
             lines[currentLineIndex].includes('Ms') || 
             lines[currentLineIndex].includes('Mrs') || 
             lines[currentLineIndex].includes('Dr'))) {
          teacherLine = lines[currentLineIndex];
          currentLineIndex++;
        }
        
        // Process these lines to extract class information for each day
        if (subjectLine && subjectLine.includes('\t')) {
          const subjects = subjectLine.split('\t');
          const codes = codeLine ? codeLine.split('\t') : [];
          const rooms = roomLine ? roomLine.split('\t') : [];
          const teachers = teacherLine ? teacherLine.split('\t') : [];
          
          // Process each day's class
          for (let dayIndex = 0; dayIndex < Math.min(subjects.length, dayHeaders.length); dayIndex++) {
            const subject = subjects[dayIndex]?.trim();
            const codeText = codes[dayIndex]?.trim() || '';
            const room = rooms[dayIndex]?.trim() || '';
            const teacher = teachers[dayIndex]?.trim() || '';
            
            // Skip if no meaningful data
            if (!subject && !codeText) continue;
            
            // Extract code from text (e.g., "(10SPE251101)" -> "10SPE251101")
            const codeMatch = codeText.match(/\(([A-Z0-9]{5,})\)/);
            const code = codeMatch ? codeMatch[1] : '';
            
            const classEntry = {
              subject: subject || code,
              code: code,
              room: room,
              teacher: teacher,
              startTime: result.periods[periodNum-1].startTime,
              endTime: result.periods[periodNum-1].endTime
            };
            
            // Add to result
            const dayHeader = dayHeaders[dayIndex];
            if (result.classes[dayHeader] && result.classes[dayHeader][currentPeriod]) {
              result.classes[dayHeader][currentPeriod].push(classEntry);
              console.log(`Added class for ${dayHeader}, ${currentPeriod}: ${classEntry.subject || '(unnamed)'} ${classEntry.code ? '(' + classEntry.code + ')' : ''}`);
            }
          }
        }
      } else {
        // If not a period header, skip the line
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
    
    console.log(`Parser found ${totalClasses} total classes`);
    
    return result;
  } catch (error) {
    console.error('Error parsing timetable:', error);
    return result;
  }
}

// Sample timetable data to test
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics\tMathematics - Advanced\tPhysics\tBiology Units 1 & 2\tWar Boom and Bust\tSpecialist Mathematics\tEnglish\tPhysics\tSpecialist Mathematics\tBiology Units 1 & 2
(10SPE251101)\t(10MAA251105)\t(10PHY251102)\t(11BIO251101)\t(10WBB251102)\t(10SPE251101)\t(10ENG251108)\t(10PHY251102)\t(10SPE251101)\t(11BIO251101)
M 07\tM 05\tS 01\tS 06\tC 07\tM 07\tA 08\tS 01\tM 07\tS 06
Mr Paul Jefimenko\tMr Scott Kertes\tMr Paul Jefimenko\tMr Andrew Savage\tMs Dianne McKenzie\tMr Paul Jefimenko\tMr Robert Hassell\tMr Paul Jefimenko\tMr Paul Jefimenko\tMr Andrew Savage
Period 2
9:40am–10:40am
Biology Units 1 & 2\tWar Boom and Bust\tMathematics - Advanced\tSpecialist Mathematics\tBiology Units 1 & 2\tEnglish\tSpecialist Mathematics\tEnglish\tPhysics\tEnglish
(11BIO251101)\t(10WBB251102)\t(10MAA251105)\t(10SPE251101)\t(11BIO251101)\t(10ENG251108)\t(10SPE251101)\t(10ENG251108)\t(10PHY251102)\t(10ENG251108)
S 06\tC 07\tM 05\tM 07\tS 06\tA 08\tM 07\tA 08\tS 01\tA 08
Mr Andrew Savage\tMs Dianne McKenzie\tMr Scott Kertes\tMr Paul Jefimenko\tMr Andrew Savage\tMr Robert Hassell\tMr Paul Jefimenko\tMr Robert Hassell\tMr Paul Jefimenko\tMr Robert Hassell`;

// Run the test
function runTest() {
  console.log("=== Testing Multi-Line Tab-Delimited Timetable Parser ===");
  const result = parseMultiLineTabDelimitedTimetable(sampleTimetable);
  
  // Verify key results
  if (result.days.length === 10) {
    console.log("✅ Successfully identified all 10 day headers");
  } else {
    console.log(`❌ Day headers not properly identified: found ${result.days.length}, expected 10`);
  }
  
  // Count classes
  let totalClasses = 0;
  for (const day in result.classes) {
    for (const period in result.classes[day]) {
      totalClasses += result.classes[day][period].length;
    }
  }
  
  console.log(`Total classes found: ${totalClasses}`);
  
  if (totalClasses > 0) {
    console.log("✅ Successfully extracted class data");
    
    // Check specific class as verification
    const day1Period1 = result.classes["Day 1"]["Period 1"][0] || {};
    
    if (day1Period1.subject === "Specialist Mathematics" && 
        day1Period1.code === "10SPE251101" &&
        day1Period1.room === "M 07" &&
        day1Period1.teacher === "Mr Paul Jefimenko") {
      console.log("✅ Verified Day 1, Period 1 class is correctly parsed");
      console.log(day1Period1);
    } else {
      console.log("❌ Class details for Day 1, Period 1 didn't match expected values");
      console.log("Expected: Subject='Specialist Mathematics', Code='10SPE251101', Room='M 07', Teacher='Mr Paul Jefimenko'");
      console.log(`Got: Subject='${day1Period1.subject}', Code='${day1Period1.code}', Room='${day1Period1.room}', Teacher='${day1Period1.teacher}'`);
    }
  } else {
    console.log("❌ Failed to extract any classes from the timetable");
  }
  
  // Display sample of parsed data
  console.log("\nSample of parsed data:");
  if (result.classes["Day 1"] && result.classes["Day 1"]["Period 1"]) {
    console.log(JSON.stringify(result.classes["Day 1"]["Period 1"], null, 2));
  }
  
  return result;
}

// Run the test and export the parser function
const testResult = runTest();
console.log("\nFull result structure (first day):");
console.log(JSON.stringify(testResult.classes["Day 1"], null, 2));

module.exports = {
  parseMultiLineTabDelimitedTimetable
};
