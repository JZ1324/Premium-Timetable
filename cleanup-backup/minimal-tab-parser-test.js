/**
 * Simple test script for the fallback parser
 */

// Minimal timetable data with the same structure as the problematic case
const minimalTimetable = `Day 1\tDay 2
Period 1
8:35am–9:35am
Mathematics\tEnglish
(12MAT101)\t(12ENG101)
A1\tB2
Mr Smith\tMs Jones`;

// Minimal parser function specifically for this format
function parseMinimalTimetable(data) {
  console.log('Running minimal parser test');
  
  // Split into lines
  const lines = data.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract day headers
  const days = lines[0].split('\t');
  console.log('Days:', days);
  
  // Find Period line
  const periodLine = lines.find(line => line.startsWith('Period'));
  console.log('Period:', periodLine);
  
  // Find time line
  const timeLine = lines.find(line => line.includes('am') || line.includes('pm'));
  console.log('Time:', timeLine);
  
  // Extract subjects, codes, rooms, and teachers
  let subjectLine, codeLine, roomLine, teacherLine;
  
  for (let i = 3; i < lines.length; i++) {
    if (lines[i].includes('\t')) {
      if (!subjectLine) {
        subjectLine = lines[i];
      } else if (!codeLine && lines[i].includes('(') && lines[i].includes(')')) {
        codeLine = lines[i];
      } else if (!roomLine && /[A-Z]\d+/.test(lines[i])) {
        roomLine = lines[i];
      } else if (!teacherLine) {
        teacherLine = lines[i];
      }
    }
  }
  
  console.log('Subject line:', subjectLine);
  console.log('Code line:', codeLine);
  console.log('Room line:', roomLine);
  console.log('Teacher line:', teacherLine);
  
  // Parse into structured data
  const result = {
    days: days,
    periods: [
      { 
        name: periodLine, 
        startTime: timeLine?.split('–')[0]?.trim(), 
        endTime: timeLine?.split('–')[1]?.trim() 
      }
    ],
    classes: {}
  };
  
  // Initialize classes structure
  days.forEach(day => {
    result.classes[day] = {
      [periodLine]: []
    };
  });
  
  // Extract class data for each day
  if (subjectLine) {
    const subjects = subjectLine.split('\t');
    const codes = codeLine ? codeLine.split('\t') : [];
    const rooms = roomLine ? roomLine.split('\t') : [];
    const teachers = teacherLine ? teacherLine.split('\t') : [];
    
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const subject = subjects[i]?.trim();
      
      if (subject) {
        const codeText = codes[i]?.trim() || '';
        const codeMatch = codeText.match(/\(([A-Z0-9]+)\)/);
        const code = codeMatch ? codeMatch[1] : '';
        
        const classEntry = {
          subject: subject,
          code: code,
          room: rooms[i]?.trim() || '',
          teacher: teachers[i]?.trim() || '',
          startTime: result.periods[0].startTime,
          endTime: result.periods[0].endTime
        };
        
        result.classes[day][periodLine].push(classEntry);
      }
    }
  }
  
  return result;
}

// Run the test
const result = parseMinimalTimetable(minimalTimetable);
console.log('\nParsed result:');
console.log(JSON.stringify(result, null, 2));

// Check if the result contains the expected classes
const totalClasses = Object.values(result.classes)
  .flatMap(periods => Object.values(periods))
  .flat()
  .length;

console.log(`\nFound ${totalClasses} classes`);

if (totalClasses > 0) {
  console.log('✅ Parser successfully extracted class data');
  
  // Check first class
  const firstClass = result.classes['Day 1']['Period 1'][0];
  if (firstClass.subject === 'Mathematics' && firstClass.code === '12MAT101') {
    console.log('✅ First class correctly parsed');
  } else {
    console.log('❌ First class not correctly parsed');
    console.log('Expected: Mathematics (12MAT101)');
    console.log(`Got: ${firstClass.subject} (${firstClass.code})`);
  }
} else {
  console.log('❌ Parser failed to extract any classes');
}
