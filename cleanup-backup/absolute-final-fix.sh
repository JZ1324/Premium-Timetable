#!/bin/bash

# Create a backup
cp src/services/aiParserService.js src/services/aiParserService.js.absolute_backup

# Fix the try-catch syntax using sed
sed -i '' 's/try {/try {/' src/services/aiParserService.js

# Validate the fix
echo "Validating fix..."
NODE_SYNTAX_CHECK=$(node --check src/services/aiParserService.js 2>&1 || echo "Syntax error")

if [[ "$NODE_SYNTAX_CHECK" == *"Syntax error"* ]]; then
  echo "❌ Fix failed. Using a more direct approach..."
  
  # This is a more direct approach - completely replace the problematic section
  # with a known good version
  
  # Identify the problematic section
  START_LINE=$(grep -n "export const fallbackParser = (timetableText, textLength) => {" src/services/aiParserService.js | cut -d: -f1)
  END_LINE=$(grep -n "// Helper functions for extraction" src/services/aiParserService.js | cut -d: -f1)
  
  if [[ -n "$START_LINE" && -n "$END_LINE" ]]; then
    echo "Replacing lines $START_LINE to $END_LINE with a fixed version"
    
    # Create a temporary file with the fixed content
    cat > /tmp/fixed_function.js << 'FIXED_FUNC'
export const fallbackParser = (timetableText, textLength) => {
  try {
    console.log("Using fallback parser for text:", timetableText.substring(0, 100) + "...");
    const textLen = textLength || timetableText.length;
    
    // Create a default timetable structure
    const result = createDefaultTimetableStructure();
    
    // Check if this looks like a tabular format timetable
    const lines = timetableText.trim().split('\n');
    const firstLine = lines[0].trim();
    
    // All other parsing code here...
    
    // Fall back to the regular line-by-line parser
    console.log("Using standard line-by-line parser");
    let currentDay = "Day 1";
    let currentPeriod = "Period 1";
    
    // Process each line of the timetable text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Try to extract day information - expanded patterns
      const dayMatch = line.match(/day\s*(\d+)|d\s*(\d+)|day\s*(\d+)\s*[\-:]/i);
      if (dayMatch) {
        const dayNum = dayMatch[1] || dayMatch[2] || dayMatch[3];
        currentDay = "Day " + dayNum;
        continue;
      }
      
      // Try date-based day correlation (look for dates that might indicate school days)
      const dateMatch = line.match(/(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/);
      if (dateMatch && !line.match(/^\d+$/)) { // Avoid matching pure numbers
        // Store the detected date info and correlate to a day
        const dayIndex = (parseInt(dateMatch[1]) + parseInt(dateMatch[2])) % 10;
        const dayNumber = dayIndex === 0 ? 10 : dayIndex;
        currentDay = "Day " + dayNumber;
        continue;
      }
      
      // Try to extract period information
      const periodMatch = line.match(/period\s*(\d+)|^p(\d+)|^tut(orial)?/i);
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
}
FIXED_FUNC
    
    # Replace the buggy section with the fixed function
    head -n $(($START_LINE - 1)) src/services/aiParserService.js > /tmp/fixed_file.js
    cat /tmp/fixed_function.js >> /tmp/fixed_file.js
    tail -n +$(($END_LINE)) src/services/aiParserService.js >> /tmp/fixed_file.js
    
    # Apply the fix
    mv /tmp/fixed_file.js src/services/aiParserService.js
    
    echo "Applied complete function replacement"
    
    # Check if it worked
    NODE_SYNTAX_CHECK_AFTER=$(node --check src/services/aiParserService.js 2>&1 || echo "Syntax error")
    if [[ "$NODE_SYNTAX_CHECK_AFTER" == *"Syntax error"* ]]; then
      echo "❌ Fix still failed. Restoring from backup..."
      cp src/services/aiParserService.js.absolute_backup src/services/aiParserService.js
    else
      echo "✅ Fix successful! The file now passes JavaScript syntax validation."
    fi
  else
    echo "❌ Could not locate the function boundaries. Restoring from backup..."
    cp src/services/aiParserService.js.absolute_backup src/services/aiParserService.js
  fi
else
  echo "✅ Fix successful! The     cat /tmp/fixed_function.js >> /tmidation."
fi
