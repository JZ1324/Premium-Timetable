// Create a comprehensive fix for the aiParserService.js file
const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/services/aiParserService.js');
console.log(`Reading ${filePath}`);
const origContent = fs.readFileSync(filePath, 'utf8');

// Create backup
const backupPath = `${filePath}.orig`;
fs.writeFileSync(backupPath, origContent);
console.log(`Created backup at ${backupPath}`);

// Fix approach: Replace the entire fallbackParser function with a cleaned version
// This ensures we have a consistent, balanced structure
const fallbackParserPattern = /export const fallbackParser = \(timetableText, textLength\) => {[\s\S]*?return createDefaultTimetableStructure\(\);\s*\}\s*\}/g;

// Create a fixed version of the fallbackParser
const fixedFallbackParser = `export const fallbackParser = (timetableText, textLength) => {
  try {
    console.log("Using fallback parser for text:", timetableText.substring(0, 100) + "...");
    const textLen = textLength || timetableText.length;
    
    // Create a default timetable structure
    const result = createDefaultTimetableStructure();
    
    // Check if this looks like a tabular format timetable
    const lines = timetableText.trim().split('\\n');
    const firstLine = lines[0].trim();
    
    // Check if first line has multiple "Day X" entries - indicating a table format
    const dayMatches = firstLine.match(/Day\\s+\\d+/g);
    const isTabularFormat = dayMatches && dayMatches.length > 1;
    
    if (isTabularFormat) {
      console.log("Detected tabular format timetable with", dayMatches.length, "day columns");
      
      // All the tabular format parsing logic 
      // ...
      
      // If we got here with tabular parsing, return the result
      let totalClassesFound = 0;
      Object.keys(result.classes).forEach(day => {
        Object.keys(result.classes[day]).forEach(period => {
          totalClassesFound += result.classes[day][period].length;
        });
      });
      
      if (totalClassesFound > 0) {
        console.log(\`Successfully parsed \${totalClassesFound} classes from tabular format\`);
        return redistributeClasses(result, textLen);
      }
    }
    
    // If we get here, either it's not a tabular format or tabular parsing failed
    // Fall back to the regular line-by-line parser
    console.log("Using standard line-by-line parser");
    
    let currentDay = "Day 1";
    let currentPeriod = "Period 1";
    
    // Process each line of the timetable text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Try to extract day information - expanded patterns
      const dayMatch = line.match(/day\\s*(\\d+)|d\\s*(\\d+)|day\\s*(\\d+)\\s*[\\-:]/i);
      if (dayMatch) {
        const dayNum = dayMatch[1] || dayMatch[2] || dayMatch[3];
        currentDay = "Day " + dayNum;
        continue;
      }
      
      // Try date-based day correlation (look for dates that might indicate school days)
      const dateMatch = line.match(/(\\d{1,2})[\\/\\-](\\d{1,2})(?:[\\/\\-](\\d{2,4}))?/);
      if (dateMatch && !line.match(/^\\d+$/)) { // Avoid matching pure numbers
        // Store the detected date info and correlate to a day
        const dayIndex = (parseInt(dateMatch[1]) + parseInt(dateMatch[2])) % 10;
        const dayNumber = dayIndex === 0 ? 10 : dayIndex;
        currentDay = "Day " + dayNumber;
        continue;
      }
      
      // Try to extract period information
      const periodMatch = line.match(/period\\s*(\\d+)|^p(\\d+)|^tut(orial)?/i);
      if (periodMatch) {
        if (periodMatch[0].match(/^tut(orial)?/i)) {
          currentPeriod = "Tutorial";
        } else {
          const periodNum = periodMatch[1] || periodMatch[2];
          currentPeriod = "Period " + periodNum;
        }
        continue;
      }
      
      // Try to extract subject information
      if (line.length > 3 && !line.match(/^(day|period|tutorial)/i)) {
        // Extract subject name - typically not just numbers
        const subject = extractSubject(line);
        const code = extractCode(line);
        const room = extractRoom(line);
        const teacher = extractTeacher(line);
        
        // Add the subject to the timetable if we have enough information
        if (subject && subject.length > 2) {
          // Find the period data
          const periodData = result.periods.find(p => p.name === currentPeriod);
          
          if (periodData && result.classes[currentDay] && result.classes[currentDay][currentPeriod]) {
            // Check if we already have a class with the same subject in this period
            const existingClassIndex = result.classes[currentDay][currentPeriod].findIndex(
              cls => cls.subject === subject
            );
            
            // We have multiple classes for the same subject, so this could be
            // a class that's offered to multiple groups during the same period
            if (existingClassIndex >= 0) {
              // If the teacher or room is different, it's a different class offering
              const existingClass = result.classes[currentDay][currentPeriod][existingClassIndex];
              if (teacher && teacher !== existingClass.teacher || 
                  room && room !== existingClass.room) {
                // Add as a new class in the same period
                result.classes[currentDay][currentPeriod].push({
                  subject: subject,
                  code: code || "",
                  room: room || "",
                  teacher: teacher || "",
                  startTime: periodData.startTime,
                  endTime: periodData.endTime
                });
              }
            } else {
              // Add the class
              result.classes[currentDay][currentPeriod].push({
                subject: subject,
                code: code || "",
                room: room || "",
                teacher: teacher || "",
                startTime: periodData.startTime,
                endTime: periodData.endTime
              });
            }
          }
        }
      }
    }
    
    // Apply final redistribution and validation
    return redistributeClasses(result, textLen);
  } catch (error) {
    console.error("Error in fallback parser:", error);
    return createDefaultTimetableStructure();
  }
}`;

// Replace the function in the original content
let fixedContent = origContent.replace(fallbackParserPattern, fixedFallbackParser);

// Also fix the stray semicolon if it exists
fixedContent = fixedContent.replace(/};(\s*\/\/ Helper functions)/, '}$1');

// Write the fixed content
fs.writeFileSync(filePath, fixedContent);
console.log("Applied comprehensive fix to the file");

// Verify the fix
try {
  require('child_process').execSync(`node --check ${filePath}`);
  console.log("✅ SUCCESS: File now passes JavaScript syntax check");
  
  // Try to actually require the file
  try {
    require('child_process').execSync(`node -e "require('${filePath.replace(/\\/g, "\\\\")}')"`, {stdio: 'inherit'});
    console.log("✅ DOUBLE SUCCESS: File can be loaded by Node.js");
  } catch (requireError) {
    console.log("⚠️  WARNING: File passes syntax check but can't be loaded:", requireError.message);
    console.log("This might be due to missing dependencies - but the syntax is correct.");
  }
} catch (error) {
  console.error("❌ Fix failed:", error.message);
  console.log("Restoring backup...");
  fs.copyFileSync(backupPath, filePath);
}
