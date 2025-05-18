/**
 * Complete test for tab-delimited timetable parsing
 * Tests the entire workflow from header detection to class cell parsing
 */

// Sample tab-delimited timetable with the fixed structure
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:35am–9:35am
Specialist Mathematics\tMathematics - Advanced\tPhysics\tBiology Units 1 & 2\tWar Boom and Bust
(10SPE251101)\t(10MAA251105)\t(10PHY251102)\t(11BIO251101)\t(10WBB251102)
M 07 Mr Paul Jefimenko\tM 05 Mr Scott Kertes\tS 01 Mr Paul Jefimenko\tS 06 Mr Andrew Savage\tC 07 Ms Dianne McKenzie`;

/**
 * Function to parse a class cell with enhanced code pattern detection
 */
function parseClassCell(cellText) {
  if (!cellText || cellText.trim().length === 0) {
    return null;
  }
  
  console.log('Parsing cell:', cellText);
  
  // Enhanced regex pattern for class codes - requiring 5+ alphanumerics
  const codeMatches = cellText.match(/\(([A-Z0-9]{5,})\)/);
  const code = codeMatches ? codeMatches[1] : '';
  
  if (code) {
    console.log(`Found code: ${code}`);
  } else {
    console.log('No code found');
    if (cellText.length < 5) {
      return null;  // Too short to be a real class
    }
  }
  
  // Multi-line parsing approach
  const lines = cellText.split('\n').map(line => line.trim()).filter(Boolean);
  
  let subject = lines[0] || '';
  let room = '';
  let teacher = '';
  
  // Clean subject if it contains code
  if (subject.includes('(') && subject.includes(')')) {
    subject = subject.replace(/\([A-Z0-9]+\)/g, '').trim();
  }
  
  // Look for room information (typically letter + number)
  const roomMatch = cellText.match(/\b[A-Z]\s?[0-9]+\b/);
  if (roomMatch) {
    room = roomMatch[0];
  }
  
  // Look for teacher name (starts with Mr, Ms, etc.)
  const teacherMatch = cellText.match(/\b(Mr|Ms|Mrs|Dr|Miss)\.?\s+[A-Za-z]+(\s+[A-Za-z]+)?/i);
  if (teacherMatch) {
    teacher = teacherMatch[0];
  }
  
  return {
    subject,
    code: code || '',
    room: room || '',
    teacher: teacher || '',
    startTime: "8:35am",
    endTime: "9:35am"
  };
}

console.log("=== TESTING TAB-DELIMITED TIMETABLE PARSING ===");

// Split the timetable into lines and extract day headers
const lines = sampleTimetable.split('\n');
const dayHeaders = lines[0].split('\t');
console.log('Day headers:', dayHeaders);

// Fixed structure for our sample:
// Line 0: Headers
// Line 1: Period
// Line 2: Times
// Line 3: Subjects
// Line 4: Codes
// Line 5: Room/Teacher

// Create class cells by combining information for each day
let classCells = [];
for (let dayIdx = 0; dayIdx < dayHeaders.length; dayIdx++) {
  let cellText = '';
  
  // Add subject
  if (dayIdx < lines[3].split('\t').length) {
    cellText += lines[3].split('\t')[dayIdx];
  }
  
  // Add code
  if (dayIdx < lines[4].split('\t').length) {
    cellText += '\n' + lines[4].split('\t')[dayIdx];
  }
  
  // Add room/teacher
  if (dayIdx < lines[5].split('\t').length) {
    cellText += '\n' + lines[5].split('\t')[dayIdx];
  }
  
  classCells.push(cellText.trim());
}

console.log(`\nExtracted ${classCells.length} class cells`);

// Parse each class cell
const parsedClasses = classCells.map(cellText => parseClassCell(cellText));

// Display results
console.log("\n=== PARSING RESULTS ===");
parsedClasses.forEach((parsedClass, idx) => {
  if (parsedClass && parsedClass.code) {
    console.log(`Day ${idx + 1} (${dayHeaders[idx]}) class:`, {
      subject: parsedClass.subject,
      code: parsedClass.code,
      room: parsedClass.room,
      teacher: parsedClass.teacher
    });
  } else {
    console.log(`Day ${idx + 1} class: No valid class found`);
  }
});

// Verify success
const successCount = parsedClasses.filter(c => c && c.code).length;
console.log(`\nSuccessfully parsed ${successCount} out of ${classCells.length} classes`);

if (successCount === classCells.length) {
  console.log("✅ SUCCESS: All classes parsed correctly!");
} else if (successCount > 0) {
  console.log("⚠️ PARTIAL SUCCESS: Some classes were parsed correctly");
} else {
  console.log("❌ FAILURE: No classes were parsed correctly");
}
