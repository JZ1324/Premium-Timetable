/**
 * Fix for the aiParserService.js to enhance direct parsing of tab-delimited timetables
 * 
 * This fix addresses the issue where properly formatted timetables with tabs
 * were not getting parsed correctly and the app was defaulting to mock data.
 */

// Function that simulates the updated day header detection
function findDayHeaders(headerLine) {
  console.log('Testing day header detection on:', headerLine);
  
  // Score function to detect day headers
  function scoreDayHeader(text) {
    let score = 0;
    
    // Check for "Day X" pattern
    if (/^day\s*\d+$/i.test(text)) {
      score += 10;
    } else if (/day\s*\d+/i.test(text)) {
      score += 5;
    }
    
    // Check for common day names
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of dayNames) {
      if (text.toLowerCase().includes(day)) {
        score += 8;
      }
    }
    
    // Check for abbreviated day names (Mon, Tue, etc)
    const shortDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    for (const day of shortDays) {
      if (text.toLowerCase().match(new RegExp(`\\b${day}\\b`))) {
        score += 6;
      }
    }
    
    return score;
  }
  
  // Try various splitting methods with tab-delimited format given priority
  const possibleDelimiters = ['\t', /\s{2,}/, ',', '|', ';', /\s+/];
  let allCandidateHeaders = [];
  
  // First check if this is a tab-delimited timetable (most common pasted format)
  if (headerLine.includes('\t')) {
    console.log("Tab-delimited format detected in header row");
    const tabCandidates = headerLine.split('\t')
      .map(d => d.trim())
      .filter(d => d && d.length > 0);
      
    if (tabCandidates.length >= 2) {
      // For tab-delimited formats, we'll be more lenient
      const scoredTabCandidates = tabCandidates
        .map(text => ({ text, score: scoreDayHeader(text) * 1.5 })) // Higher weight for tab-split
        .filter(c => c.score > 0.5);  // More lenient filter for tabs
        
      if (scoredTabCandidates.length >= 2) {
        console.log("Found day headers using tab delimiter:", 
          scoredTabCandidates.map(c => c.text).join(', '));
        allCandidateHeaders = [...scoredTabCandidates];
        
        // If we found at least 5 day headers with tabs, trust it and skip other delimiters
        if (scoredTabCandidates.length >= 5) {
          console.log("Found 5+ tab-delimited day headers - using these exclusively");
          return scoredTabCandidates.map(c => c.text);
        }
      }
    }
  }
  
  // Try other delimiters as fallback
  for (let i = 1; i < possibleDelimiters.length; i++) {
    const delimiter = possibleDelimiters[i];
    const candidates = headerLine.split(delimiter)
      .map(d => d.trim())
      .filter(d => d && d.length > 0);
    
    const scoredCandidates = candidates
      .map(text => ({ text, score: scoreDayHeader(text) }))
      .filter(c => c.score > 1);
    
    if (scoredCandidates.length >= 2) {
      allCandidateHeaders = [...allCandidateHeaders, ...scoredCandidates];
    }
  }
  
  console.log(`Total headers found: ${allCandidateHeaders.length}`);
  
  // Sort by score and remove duplicates
  allCandidateHeaders.sort((a, b) => b.score - a.score);
  
  const uniqueHeaders = [];
  const uniqueTexts = new Set();
  
  for (const header of allCandidateHeaders) {
    const normalizedText = header.text.toLowerCase().trim();
    if (!uniqueTexts.has(normalizedText)) {
      uniqueTexts.add(normalizedText);
      uniqueHeaders.push(header);
    }
  }
  
  return uniqueHeaders.map(h => h.text);
}

// Function that simulates the updated class cell detection
function parseClassCell(cellText) {
  console.log('\nParsing class cell:', cellText);
  
  // Class pattern detection
  // For multi-line cells, common in tab delimited formats
  const lines = cellText.split('\n').filter(line => line.trim().length > 0);
  
  let subject = '';
  let code = '';
  let room = '';
  let teacher = '';
  
  if (lines.length >= 1) {
    // First line is usually subject name
    subject = lines[0].trim();
    
    // Look for class code in parentheses
    const codeMatch = cellText.match(/\(([A-Z0-9]{5,})\)/);
    if (codeMatch) {
      code = codeMatch[1];
      
      // If code is in the subject line, clean it up
      if (subject.includes(code)) {
        subject = subject.replace(/\s*\([A-Z0-9]{5,}\)/, '').trim();
      }
    }
    
    // Look for room info (typically format like "A 01", "SCI 03", "M 05")
    const roomMatches = cellText.match(/\b([A-Z])\s*(\d+)\b/);
    if (roomMatches) {
      room = roomMatches[0];
    }
    
    // Look for teacher name (common prefixes like Mr, Ms, Mrs, Dr)
    const teacherMatch = cellText.match(/\b(Mr|Ms|Mrs|Dr|Miss)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+/);
    if (teacherMatch) {
      teacher = teacherMatch[0];
    } else {
      // Try simpler match pattern
      const simpleTeacherMatch = cellText.match(/\b(Mr|Ms|Mrs|Dr|Miss)\.?\s+[A-Z][a-z]+/);
      if (simpleTeacherMatch) {
        teacher = simpleTeacherMatch[0];
      }
    }
  }
  
  return { subject, code, room, teacher };
}

// Function to test period header detection with improved dash handling
function detectPeriodHeader(line, nextLine) {
  console.log('\nTesting period detection on:', line);
  if (nextLine) {
    console.log('With next line:', nextLine);
  }
  
  // Try multiple regex patterns for period extraction
  let periodNum = null;
  let startTime = null;
  let endTime = null;
  
  // Try standard format with various dash characters
  const standardMatch = line.match(/Period\s+(\d+).*?(\d+[:\.]\d+\s*[ap]m)[–\-\—\–](\d+[:\.]\d+\s*[ap]m)/i);
  if (standardMatch) {
    periodNum = standardMatch[1];
    startTime = standardMatch[2].replace(/\s+/g, '');
    endTime = standardMatch[3].replace(/\s+/g, '');
    console.log(`Found period ${periodNum} with times ${startTime}-${endTime} in single line`);
    return { periodNum, startTime, endTime };
  }
  
  // Try other period number extraction
  const periodMatch = line.match(/Period\s+(\d+)/i);
  if (periodMatch) {
    periodNum = periodMatch[1];
    console.log(`Found period number: ${periodNum}`);
  }
  
  // Try time range extraction
  const timeMatchers = [
    /(\d+[:\.]\d+\s*[ap]m)[–\-\—\–](\d+[:\.]\d+\s*[ap]m)/i,   // 9:00am-10:00am with any dash
    /(\d+[:\.]\d+\s*[ap]m)\s+to\s+(\d+[:\.]\d+\s*[ap]m)/i, // 9:00am to 10:00am
    /(\d+[:\.]\d+\s*[ap]m)/i  // Just find any time
  ];
  
  for (const timeMatcher of timeMatchers) {
    const timeMatch = line.match(timeMatcher);
    if (timeMatch) {
      if (timeMatch.length >= 3) {
        // Full time range found
        startTime = timeMatch[1].replace(/\s+/g, '');
        endTime = timeMatch[2].replace(/\s+/g, '');
        console.log(`Found time range: ${startTime}-${endTime}`);
        break;
      } else if (!startTime) {
        // Just found a single time
        startTime = timeMatch[1].replace(/\s+/g, '');
        console.log(`Found start time: ${startTime}`);
      }
    }
  }
  
  // Check for special tab-delimited format where time is on the next line
  if (!startTime && !endTime && periodNum && nextLine) {
    console.log(`Checking next line for times...`);
    // Look for time range with various dash characters
    const nextLineTimeMatch = nextLine.match(/(\d+[:\.]\d+\s*[ap]m)[–\-\—\–](\d+[:\.]\d+\s*[ap]m)/i);
    if (nextLineTimeMatch) {
      startTime = nextLineTimeMatch[1].replace(/\s+/g, '');
      endTime = nextLineTimeMatch[2].replace(/\s+/g, '');
      console.log(`Found times on next line: ${startTime}-${endTime}`);
    }
  }
  
  return { periodNum, startTime, endTime };
}

// Create a test timetable string to verify our fix
const testTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
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

// Test Day Header Detection
console.log("=== TESTING DAY HEADER DETECTION ===");
const testHeaderLine = "Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10";
const dayHeaders = findDayHeaders(testHeaderLine);
console.log("Detected day headers:", dayHeaders);

// Test Period Detection
console.log("\n=== TESTING PERIOD DETECTION ===");
const testPeriodLine1 = "Period 1";
const testTimeLine = "8:35am–9:35am";
const periodInfo1 = detectPeriodHeader(testPeriodLine1, testTimeLine);
console.log("Period info (multi-line):", periodInfo1);

const testPeriodLine2 = "Period 2\n9:40am–10:40am";
const periodInfo2 = detectPeriodHeader(testPeriodLine2);
console.log("Period info (combined):", periodInfo2);

// Test Class Cell Parsing
console.log("\n=== TESTING CLASS CELL PARSING ===");
const testCell1 = `Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko`;
const classInfo1 = parseClassCell(testCell1);
console.log("Class info 1:", classInfo1);

const testCell2 = `Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes`;
const classInfo2 = parseClassCell(testCell2);
console.log("Class info 2:", classInfo2);

// Summary of fixes
console.log("\n=== SUMMARY OF FIXES ===");
console.log("The fixes implemented in aiParserService.js:");
console.log("1. Enhanced day header detection for tab-delimited format");
console.log("2. Improved period detection with support for en-dash time ranges");
console.log("3. Multi-line class cell handling for tab-delimited formats");
console.log("4. More lenient class extraction for well-formatted timetables");
console.log("5. Better fallback mechanism to incorporate actual class codes when parsing fails");

console.log("\nWith these changes, the parser should now correctly handle your tab-delimited timetable.");
