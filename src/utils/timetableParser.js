/**
 * Timetable Parser
 * Converts raw timetable text into structured JSON format
 */

function parseTimetable(rawText) {
  console.log("Starting timetable parsing");
  
  // Trim input text and normalize line breaks
  rawText = rawText.trim();
  
  // Pre-process to remove excessive empty lines (more than 2 consecutive empty lines become 1)
  const originalLength = rawText.length;
  rawText = rawText.replace(/(\n\s*\n\s*\n\s*)+/g, '\n\n');
  const newLength = rawText.length;
  
  if (originalLength !== newLength) {
    console.log(`Removed ${originalLength - newLength} characters of excessive whitespace`);
  }
  
  // Initialize result structure
  const result = {
    days: [],
    periods: [],
    classes: {}
  };
  
  // Step 1: Extract days from the header
  const dayHeaderMatch = rawText.match(/\*\*Day 1(Day \d+)*\*\*/);
  if (dayHeaderMatch) {
    const dayHeader = dayHeaderMatch[0].replace(/\*\*/g, '');
    result.days = dayHeader.match(/Day \d+/g);
  } else {
    // Fallback method to extract days
    const dayMatches = rawText.match(/Day \d+/g);
    if (dayMatches) {
      // Unique days and sort them
      result.days = [...new Set(dayMatches)].sort((a, b) => {
        return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]);
      });
    }
  }
  
  // Step 2: Extract periods and their times - improved to handle more formats
  // This covers common patterns like "Period 1\n8:35am–9:35am" or "Training\n6:45am–8:00am"
  const extractTimeRange = (str) => {
    if (!str) return null;
    const timeMatch = str.match(/(\d+:\d+[ap]m)–(\d+:\d+[ap]m)/);
    return timeMatch ? { startTime: timeMatch[1], endTime: timeMatch[2] } : null;
  };
  
  // First check for periods defined in the standard way
  const periodMatches = [];
  const specialPeriods = ['Training', 'Tutorial', 'Lunch', 'Recess', 'Break', 'Assembly', 'Chapel', 'Study', 'Sport'];
  
  // Scan for periods manually from the lines
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    const nextLine = i+1 < lines.length ? lines[i+1].trim() : '';
    
    // Check for period headers followed by time ranges
    if ((line.match(/^Period \d+$/) || specialPeriods.includes(line)) && 
         nextLine.match(/\d+:\d+[ap]m–\d+:\d+[ap]m/)) {
      
      const periodName = line;
      const timeRange = extractTimeRange(nextLine);
      
      if (timeRange) {
        console.log(`Found period ${periodName} with time ${timeRange.startTime}-${timeRange.endTime}`);
        periodMatches.push({
          name: periodName,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime
        });
      }
    }
    // Also check for cases where the time appears on the same line as "Period X"
    else if (line.match(/Period \d+\s+\d+:\d+[ap]m–\d+:\d+[ap]m/) || 
            (specialPeriods.some(p => line.includes(p)) && line.match(/\d+:\d+[ap]m–\d+:\d+[ap]m/))) {
      
      let periodName;
      if (line.match(/Period \d+/)) {
        periodName = line.match(/Period \d+/)[0];
      } else {
        // Extract special period name
        for (const special of specialPeriods) {
          if (line.includes(special)) {
            periodName = special;
            break;
          }
        }
      }
      
      const timeRange = extractTimeRange(line);
      
      if (periodName && timeRange) {
        console.log(`Found inline period ${periodName} with time ${timeRange.startTime}-${timeRange.endTime}`);
        periodMatches.push({
          name: periodName,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime
        });
      }
    }
    // Handle cases where we have a time range alone (unnamed period)
    else if (line.match(/\d+:\d+[ap]m–\d+:\d+[ap]m/) && !line.match(/Period \d+/)) {
      // Look at previous line to see if it might be a period name
      const prevLine = i > 0 ? lines[i-1].trim() : '';
      
      // If previous line is not a time range and not empty, use it as period name
      if (prevLine && !prevLine.match(/\d+:\d+[ap]m–\d+:\d+[ap]m/) && 
          !specialPeriods.includes(prevLine) && !prevLine.match(/^Period \d+$/)) {
        // Check if the previous line might be a valid period name (not a subject)
        // Avoid picking up subject names as period names
        if (!prevLine.match(/\(.+\)/) && prevLine.length < 30) {
          const periodName = prevLine;
          const timeRange = extractTimeRange(line);
          
          if (timeRange) {
            console.log(`Found inferred period "${periodName}" with time ${timeRange.startTime}-${timeRange.endTime}`);
            periodMatches.push({
              name: periodName,
              startTime: timeRange.startTime,
              endTime: timeRange.endTime
            });
          }
        } else {
          // Generate a name based on the time if previous line is likely not a period name
          const timeRange = extractTimeRange(line);
          if (timeRange) {
            const periodName = `Period (${timeRange.startTime}-${timeRange.endTime})`;
            console.log(`Found unnamed period, assigning time-based name: ${periodName}`);
            periodMatches.push({
              name: periodName,
              startTime: timeRange.startTime,
              endTime: timeRange.endTime
            });
          }
        }
      } else {
        // No usable previous line, create a name based on the time
        const timeRange = extractTimeRange(line);
        if (timeRange) {
          // Check if this is potentially a lunch or break period based on time
          let periodName = `Period (${timeRange.startTime}-${timeRange.endTime})`;
          
          // If this looks like a typical lunch time, name it accordingly
          const startHour = parseInt(timeRange.startTime.split(':')[0]);
          if ((startHour === 12 || startHour === 1) && timeRange.startTime.includes('pm')) {
            periodName = `Lunch (${timeRange.startTime}-${timeRange.endTime})`;
          }
          // If this looks like a short break, name it accordingly
          const endTimeMinutes = parseInt(timeRange.endTime.split(':')[1]);
          const startTimeMinutes = parseInt(timeRange.startTime.split(':')[1]);
          const durationMinutes = (endTimeMinutes - startTimeMinutes + 60) % 60;
          if (durationMinutes <= 15) {
            periodName = `Break (${timeRange.startTime}-${timeRange.endTime})`;
          }
          
          console.log(`Found unnamed period, assigning name: ${periodName}`);
          periodMatches.push({
            name: periodName,
            startTime: timeRange.startTime,
            endTime: timeRange.endTime
          });
        }
      }
    }
  }
  
  // Add the found periods to the result
  result.periods = periodMatches;
  
  // Sort periods in chronological order
  result.periods.sort((a, b) => {
    const timeToMinutes = (timeStr) => {
      const [hours, minutesPart] = timeStr.split(':');
      const minutes = minutesPart.slice(0, 2);
      const isPM = timeStr.toLowerCase().includes('pm');
      return parseInt(hours) * 60 + parseInt(minutes) + (isPM && parseInt(hours) !== 12 ? 12 * 60 : 0);
    };
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // Initialize the classes structure
  result.days.forEach(day => {
    result.classes[day] = {};
    result.periods.forEach(period => {
      result.classes[day][period.name] = [];
    });
  });
  
  // Simple processing method using lines - filter out empty lines first
  const lines = rawText.split('\n').filter(line => line.trim() !== '');
  console.log(`Processing ${lines.length} non-empty lines`);
  
  let currentPeriod = null;
  
  // Find the line with days (column headers)
  let dayLine = null;
  
  // Try different patterns to find the header line with days
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    // Check if this line contains multiple "Day X" occurrences or tab-separated Day X
    const line = lines[i];
    const dayCount = (line.match(/Day \d+/g) || []).length;
    
    if (dayCount >= 2 || (line.match(/^Day \d+\t/) && line.includes('\t'))) {
      dayLine = line;
      console.log(`Found day header line at position ${i}: ${dayLine}`);
      break;
    }
  }
  
  if (dayLine) {
    // If days weren't extracted earlier, extract them now
    if (result.days.length === 0) {
      // First try tab separation
      let days = dayLine.split('\t').map(day => day.trim()).filter(day => day.match(/Day \d+/));
      
      // If that didn't work, try multiple spaces
      if (days.length < 2) {
        days = dayLine.match(/Day \d+/g) || [];
      }
      
      if (days.length >= 2) {
        result.days = days;
        console.log("Extracted days from table header:", result.days);
      } else {
        console.warn("Could not extract days from header line:", dayLine);
      }
    }
    
    // Find starting line for each period block
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip truly empty lines (should be already filtered out, but just in case)
      if (!line) continue;
      
      // Check if the line defines a period or a special period (like tutorial or training)
      const specialPeriodMatch = specialPeriods.some(sp => line === sp);
      if (line.match(/^Period \d+$/) || specialPeriodMatch) {
        currentPeriod = line;
        console.log(`Found period: ${currentPeriod}`);
        
        // Next line should have the time range
        if (i + 1 < lines.length) {
          const timeLine = lines[i + 1]?.trim();
          const timeRange = extractTimeRange(timeLine);
          
          if (timeRange) {
            console.log(`Found time range: ${timeRange.startTime} - ${timeRange.endTime}`);
            
            if (!result.periods.some(p => p.name === currentPeriod)) {
              result.periods.push({
                name: currentPeriod,
                startTime: timeRange.startTime,
                endTime: timeRange.endTime
              });
            }
            
            i++; // Skip the time line
        } else {
            // Check the surrounding lines (±2) for potential time ranges
            console.log(`No valid time range found directly after period: ${currentPeriod}, checking nearby lines`);
            let timeFound = false;
            
            // Check next few lines
            for (let j = i + 2; j < Math.min(i + 4, lines.length); j++) {
              const potentialTimeLine = lines[j]?.trim();
              const timeRange = extractTimeRange(potentialTimeLine);
              
              if (timeRange && !potentialTimeLine.match(/Period \d+/) && 
                  !specialPeriods.some(sp => potentialTimeLine.includes(sp))) {
                console.log(`Found time range in nearby line: ${timeRange.startTime} - ${timeRange.endTime}`);
                
                if (!result.periods.some(p => p.name === currentPeriod)) {
                  result.periods.push({
                    name: currentPeriod,
                    startTime: timeRange.startTime,
                    endTime: timeRange.endTime
                  });
                  
                  timeFound = true;
                  break;
                }
              }
            }
            
            if (!timeFound) {
              console.log(`Could not find time range for period: ${currentPeriod}`);
            }
        }
        continue;
      }
      
      // Process class details line
      if (currentPeriod && line) {
        const classDetails = line.split('\t');
        
        // Make sure the line contains tab-separated data and likely contains class details
        if (classDetails.length > 1) {
          console.log(`Processing class line for ${currentPeriod}: ${line.substr(0, 30)}...`);
          
          // Store the classes for each day for this line - we may need to combine info from multiple lines
          classDetails.forEach((classLine, index) => {
            if (index >= result.days.length) return;
            
            const day = result.days[index];
            if (!classLine.trim()) return;
            
            // Skip lines that only contain times
            if (classLine.trim().match(/^\d+:\d+[ap]m–\d+:\d+[ap]m$/)) return;
            
            // Parse class details
            const subjectMatch = classLine.match(/^([^(]+)/);
            const codeMatch = classLine.match(/\(([^)]+)\)/);
            
            // More flexible room pattern matching - handles both standalone and embedded in text
            const roomPatterns = [
              /\b([A-Z])\s*(\d+)\b/,  // Standard format like "M 07"
              /Room\s+([A-Z])\s*(\d+)/i,  // Extended format with "Room" prefix
              /([A-Z])[\-\.]?(\d+)/,   // Compact format like "M07" or "M-07"
              /\b([A-Z])[Rr]oom\s*(\d+)/  // Format like "BRoom 12"
            ];
            
            let roomMatch = null;
            for (const pattern of roomPatterns) {
              const match = classLine.match(pattern);
              if (match) {
                roomMatch = match;
                break;
              }
            }              // More comprehensive teacher pattern
            const teacherPatterns = [
              /(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.\-]+(?=\s|$)/, // Standard format with title prefix
              /(?<=\s|^)([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s|$)/, // Format with First Last name
              /([A-Z][a-z]+)\s+([A-Z]\.)\s*[A-Z][a-z]+/, // Format with middle initial
              /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\([^)]+\)/ // Name with designation in parentheses
            ];
            
            let teacherMatch = null;
            for (const pattern of teacherPatterns) {
              const match = classLine.match(pattern);
              if (match) {
                teacherMatch = match;
                break;
              }
            }
            
            // Only process if we have a subject or code
            if (subjectMatch || codeMatch) {
              // Ensure this period exists in the classes object
              if (!result.classes[day]) {
                result.classes[day] = {};
              }
              
              if (!result.classes[day][currentPeriod]) {
                result.classes[day][currentPeriod] = [];
              }
              
              // Get the period info for time data
              const periodInfo = result.periods.find(p => p.name === currentPeriod);
              
              // Extract subject properly - handle case where the subject might be a code
              let subject = subjectMatch ? subjectMatch[1].trim() : '';
              if (!subject && codeMatch) {
                subject = codeMatch[1].trim();
              }
              
              // Format room information consistently regardless of source pattern
              const formatRoomString = (match) => {
                // If it's room like "M 07", ensure there's a space and leading zeros are preserved
                if (match[2].length === 1) {
                  return `${match[1]} 0${match[2]}`;
                } else {
                  return `${match[1]} ${match[2]}`;
                }
              };
              
              // Create the class entry with all available details
              const classEntry = {
                subject: subject,
                code: codeMatch ? codeMatch[1].trim() : '',
                room: roomMatch ? formatRoomString(roomMatch) : '',
                teacher: teacherMatch ? teacherMatch[0].trim() : '',
                startTime: periodInfo?.startTime || '',
                endTime: periodInfo?.endTime || ''
              };
              
              // See if this might be a class continuation (same subject in same period/day)
              const existingClass = result.classes[day][currentPeriod].find(c => 
                c.subject === classEntry.subject || 
                (c.code && c.code === classEntry.code)
              );
              
              if (existingClass) {
                // Update the existing class with any new information
                if (!existingClass.room && classEntry.room) {
                  existingClass.room = classEntry.room;
                }
                if (!existingClass.teacher && classEntry.teacher) {
                  existingClass.teacher = classEntry.teacher;
                }
                if (!existingClass.code && classEntry.code) {
                  existingClass.code = classEntry.code;
                }
                console.log(`Updated existing class for ${day}, ${currentPeriod}: ${existingClass.subject}`);
              } else {
                // Add as a new class
                result.classes[day][currentPeriod].push(classEntry);
                console.log(`Added class for ${day}, ${currentPeriod}: ${classEntry.subject}`);
              }
            }
          });
        } else if (line.includes('(') && line.includes(')') && currentPeriod) {
          // This might be a line with just a code or additional details
          // Try to find which day this belongs to based on context
          const codeMatch = line.match(/\(([^)]+)\)/);
          
          // Use the same room patterns as above for consistency
          const roomPatterns = [
            /\b([A-Z])\s*(\d+)\b/,  // Standard format like "M 07"
            /Room\s+([A-Z])\s*(\d+)/i,  // Extended format with "Room" prefix
            /([A-Z])[\-\.]?(\d+)/,   // Compact format like "M07" or "M-07"
            /\b([A-Z])[Rr]oom\s*(\d+)/  // Format like "BRoom 12"
          ];
          
          let roomMatch = null;
          for (const pattern of roomPatterns) {
            const match = line.match(pattern);
            if (match) {
              roomMatch = match;
              break;
            }
          }
          
          // Use the same teacher patterns for consistency
          const teacherPatterns = [
            /(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.\-]+(?=\s|$)/,
            /(?<=\s|^)([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s|$)/,
            /([A-Z][a-z]+)\s+([A-Z]\.)\s*[A-Z][a-z]+/,
            /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\([^)]+\)/
          ];
          
          let teacherMatch = null;
          for (const pattern of teacherPatterns) {
            const match = line.match(pattern);
            if (match) {
              teacherMatch = match;
              break;
            }
          }
          
          if (codeMatch || roomMatch || teacherMatch) {
            // Use contextual clues to determine which day this belongs to
            // For now, assume it belongs to the most recently added class
            for (const day of result.days) {
              if (result.classes[day] && 
                  result.classes[day][currentPeriod] && 
                  result.classes[day][currentPeriod].length > 0) {
                
                const lastClass = result.classes[day][currentPeriod][result.classes[day][currentPeriod].length - 1];
                
                // Format room information consistently
                const formatRoomString = (match) => {
                  // If it's room like "M 07", ensure there's a space and leading zeros are preserved
                  if (match[2].length === 1) {
                    return `${match[1]} 0${match[2]}`;
                  } else {
                    return `${match[1]} ${match[2]}`;
                  }
                };
                
                // Update with any new information
                if (codeMatch && !lastClass.code) {
                  lastClass.code = codeMatch[1].trim();
                }
                if (roomMatch && !lastClass.room) {
                  lastClass.room = formatRoomString(roomMatch);
                }
                if (teacherMatch && !lastClass.teacher) {
                  lastClass.teacher = teacherMatch[0].trim();
                }
                
                console.log(`Updated class with additional details: ${day}, ${currentPeriod}, ${lastClass.subject}`);
                break;
              }
            }
          } else {
            console.log(`Skipping line - not enough tab-separated values: ${line}`);
          }
        }
      }
    }
  }
  
  // Final validation and statistics
  console.log(`Parsing complete. Found ${result.days.length} days, ${result.periods.length} periods`);
  
  // Ensure all periods are in the classes structure
  result.periods.forEach(period => {
    result.days.forEach(day => {
      if (!result.classes[day]) {
        result.classes[day] = {};
      }
      if (!result.classes[day][period.name]) {
        result.classes[day][period.name] = [];
      }
    });
  });
  
  // Check if we have parsed any classes
  let totalClasses = 0;
  let classesByDay = {};
  
  Object.keys(result.classes).forEach(day => {
    classesByDay[day] = 0;
    Object.keys(result.classes[day]).forEach(period => {
      classesByDay[day] += result.classes[day][period].length;
      totalClasses += result.classes[day][period].length;
    });
  });
  
  console.log(`Total classes parsed: ${totalClasses}`);
  console.log(`Classes by day:`, classesByDay);
  
  if (totalClasses === 0) {
    console.warn("No classes were parsed! Check the input format.");
  }
  
  return result;
}
}
export default parseTimetable;