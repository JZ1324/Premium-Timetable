/**
 * Simplified test for the enhanced class parsing
 */

// Test cell data
const testCell1 = `Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko`;

const testCell2 = `Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes`;

// Replicate the fixed parseClassCell function with improved code detection
function parseClassCell(cellText) {
  if (!cellText || cellText.trim().length === 0) {
    return null;
  }
  
  console.log('Parsing:', cellText);
  
  // Enhanced regex pattern for class codes - requiring at least 5 alphanumerics
  const codeMatches = cellText.match(/\(([A-Z0-9]{5,})\)/);
  const code = codeMatches ? codeMatches[1] : '';
  
  if (code) {
    console.log(`Found code: ${code}`);
  } 
  
  // Multi-line parsing approach
  const lines = cellText.split('\n').map(line => line.trim()).filter(Boolean);
  console.log(`Found ${lines.length} lines`);
  
  if (lines.length >= 2) {
    let subject = lines[0];
    let foundCode = code;
    let room = '';
    let teacher = '';
    
    // Clean subject if it contains code
    if (subject.includes('(') && subject.includes(')')) {
      subject = subject.replace(/\([A-Z0-9]+\)/g, '').trim();
    }
    
    // Look for room information (typically letter + number)
    for (const line of lines) {
      const roomMatch = line.match(/\b[A-Z]\s?[0-9]+\b/);
      if (roomMatch && !line.includes(subject)) {
        room = roomMatch[0];
        break;
      }
    }
    
    // Look for teacher name (Mr, Ms, etc.)
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
      startTime: "8:35am", // Example
      endTime: "9:35am"    // Example
    };
  } 
  
  // Simple fallback
  return {
    subject: cellText.replace(/\([A-Z0-9]+\)/g, '').trim() || 'Unknown Subject',
    code: code || '',
    room: '',
    teacher: '',
    startTime: "8:35am",
    endTime: "9:35am"
  };
}

// Test the parsing
console.log("=== Testing Enhanced Class Cell Parsing ===");
const classInfo1 = parseClassCell(testCell1);
console.log("Class 1 Result:", {
  subject: classInfo1.subject,
  code: classInfo1.code,
  room: classInfo1.room,
  teacher: classInfo1.teacher
});

const classInfo2 = parseClassCell(testCell2);
console.log("Class 2 Result:", {
  subject: classInfo2.subject,
  code: classInfo2.code,
  room: classInfo2.room,
  teacher: classInfo2.teacher
});

console.log("\nVerifying improvements:");
console.log(`✅ Enhanced code detection: ${classInfo1.code.length >= 5 ? 'PASSED' : 'FAILED'}`);
console.log(`✅ Subject extraction: ${classInfo1.subject === 'Specialist Mathematics' ? 'PASSED' : 'FAILED'}`);
console.log(`✅ Room detection: ${classInfo1.room === 'M 07' ? 'PASSED' : 'FAILED'}`);
console.log(`✅ Teacher parsing: ${classInfo1.teacher.includes('Mr Paul') ? 'PASSED' : 'FAILED'}`);
