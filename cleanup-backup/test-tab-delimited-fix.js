/**
 * Simple tester for tab-delimited timetable parsing
 * 
 * This script provides a standalone test to validate the fix for
 * tab-delimited timetable parsing without requiring the full app environment.
 */

// Sample tab-delimited timetable
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics\tMathematics - Advanced\tPhysics\tBiology Units 1 & 2\tWar Boom and Bust\tSpecialist Mathematics\tEnglish\tPhysics\tSpecialist Mathematics\tBiology Units 1 & 2
(10SPE251101)\t(10MAA251105)\t(10PHY251102)\t(11BIO251101)\t(10WBB251102)\t(10SPE251101)\t(10ENG251108)\t(10PHY251102)\t(10SPE251101)\t(11BIO251101)
M 07 Mr Paul Jefimenko\tM 05 Mr Scott Kertes\tS 01 Mr Paul Jefimenko\tS 06 Mr Andrew Savage\tC 07 Ms Dianne McKenzie\tM 07 Mr Paul Jefimenko\tA 08 Mr Robert Hassell\tS 01 Mr Paul Jefimenko\tM 07 Mr Paul Jefimenko\tS 06 Mr Andrew Savage`;

/**
 * Function to parse a class cell
 * This function replicates the fixed parseClassCell method 
 * from aiParserService.js with enhanced code detection
 */
function parseClassCell(cellText) {
  if (!cellText || cellText.trim().length === 0) {
    return null;
  }
  
  console.log('Parsing class cell:', cellText);
  
  // Enhanced regex pattern for class codes - requiring 5+ alphanumerics
  const codeMatches = cellText.match(/\(([A-Z0-9]{5,})\)/);
  const code = codeMatches ? codeMatches[1] : '';
  
  if (code) {
    console.log(`Found subject code: ${code}`);
  } else {
    console.log('No code found in cell');
    if (cellText.length < 5) {
      return null;  // Too short to be a real class
    }
  }
  
  // Multi-line parsing approach
  const lines = cellText.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length >= 2) {
    console.log(`Processing ${lines.length} lines in cell`);
    
    let subject = lines[0];
    let foundCode = code;
    let room = '';
    let teacher = '';
    
    // Clean subject if it contains code
    if (subject.includes('(') && subject.includes(')')) {
      subject = subject.replace(/\([A-Z0-9]+\)/g, '').trim();
    }
    
    // Look for code in any line if not already found
    if (!foundCode) {
      for (const line of lines) {
        const m = line.match(/\(([A-Z0-9]{5,})\)/);
        if (m) {
          foundCode = m[1];
          break;
        }
      }
    }
    
    // Look for room information (typically letter + number)
    for (const line of lines) {
      const roomMatch = line.match(/\b[A-Z]\s?[0-9]+\b/);
      if (roomMatch && !line.includes(subject)) {
        room = roomMatch[0];
        break;
      }
    }
    
    // Look for teacher name (starts with Mr, Ms, etc.)
    for (const line of lines) {
      const teacherMatch = line.match(/\b(Mr|Ms|Mrs|Dr|Miss)\.?\s+[A-Za-z]+(\s+[A-Za-z]+)?/i);
      if (teacherMatch) {
        teacher = teacherMatch[0];
        break;
      }
    }
    
    return {
      subject,
      code: foundCode,
      room,
      teacher,
      startTime: "8:35am",  // Sample time
      endTime: "9:35am"     // Sample time
    };
  } 
  
  // Single line fallback if not multi-line
  return {
    subject: cellText.replace(/\([A-Z0-9]+\)/g, '').trim() || 'Unknown Subject',
    code: code || '',
    room: '',
    teacher: '',
    startTime: "8:35am",
    endTime: "9:35am"
  };
}

// Test the class parsing with our sample data
console.log("=== Testing Tab-Delimited Class Parsing ===");

// Extract classes from the timetable
const lines = sampleTimetable.split('\n');
const headerLine = lines[0];
const dayHeaders = headerLine.split('\t');

console.log(`Found ${dayHeaders.length} day headers:`, dayHeaders);

// Process the data as a simple structure
// Line 0: Day headers
// Line 1: Period
// Line 2: Time
// Line 3: Subject names
// Line 4: Codes
// Line 5: Room and teacher

// Create class cells by combining the information for each day
let classCells = [];

for (let dayIdx = 0; dayIdx < dayHeaders.length; dayIdx++) {
  let cellText = '';
  
  // Add subject line if available
  if (dayIdx < lines[3].split('\t').length) {
    cellText += lines[3].split('\t')[dayIdx];
  }
  
  // Add code line if available
  if (dayIdx < lines[4].split('\t').length) {
    cellText += '\n' + lines[4].split('\t')[dayIdx];
  }
  
  // Add room/teacher line if available
  if (dayIdx < lines[5].split('\t').length) {
    cellText += '\n' + lines[5].split('\t')[dayIdx];
  }
  
  classCells.push(cellText.trim());
}

console.log(`\nExtracted ${classCells.length} class cells from the tab-delimited timetable`);

// Parse each class cell
const parsedClasses = classCells.map(cellText => parseClassCell(cellText));

// Display the results
console.log("\n=== Parsing Results ===");
parsedClasses.forEach((parsedClass, idx) => {
  if (parsedClass) {
    console.log(`Day ${idx + 1} class:`, {
      subject: parsedClass.subject,
      code: parsedClass.code,
      room: parsedClass.room,
      teacher: parsedClass.teacher
    });
  } else {
    console.log(`Day ${idx + 1} class: No valid class found`);
  }
});

// Check if our parsing is successful
const successCount = parsedClasses.filter(c => c && c.code).length;
console.log(`\nSuccessfully parsed ${successCount} out of ${classCells.length} classes with codes`);

if (successCount > 0) {
  console.log("✅ SUCCESS: Tab-delimited class parsing is working correctly!");
} else {
  console.log("❌ FAIL: Failed to parse any classes with codes");
}
