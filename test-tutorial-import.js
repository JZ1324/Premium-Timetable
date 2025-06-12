// Test script to check if the issue is with the timetable data parsing or display
// This will simulate importing the exact same data through the React parsing function

const fs = require('fs');
const path = require('path');

// Sample test data that includes Tutorial periods
const testTimetableData = `Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
Period 1
8:35am–9:35am
Psychology Research & Design
(10PSY252103)
C 07 Ms Dianne McKenzie
Psychology Research & Design
(10PSY252103)
C 07 Ms Dianne McKenzie
Chemistry 1
(10CHE111103)
L 10 Ms Carolyn Butler
Chemistry 1
(10CHE111103)
L 10 Ms Carolyn Butler
Mathematics Core
(10MAT101103)
M 06 Mr Darren Hamilton
Period 2
9:45am–10:45am
Chemistry 1
(10CHE111103)
S 01 Mrs Sula Tyndall
English Communications
(10ENG101103)
C 03 Mrs Tina Campbell
Psychology Research & Design
(10PSY252103)
C 07 Ms Dianne McKenzie
English Communications
(10ENG101103)
C 03 Mrs Tina Campbell
Chemistry 1
(10CHE111103)
L 10 Ms Carolyn Butler
Tutorial
10:45am–11:20am
Chemistry 1
(10CHE111103)
S 02 Mr Ben Gooley
Psychology Research & Design
(10PSY252103)
C 07 Ms Dianne McKenzie
Mathematics Core
(10MAT101103)
M 06 Mr Darren Hamilton
English Communications
(10ENG101103)
C 03 Mrs Tina Campbell
Chemistry 1
(10CHE111103)
S 02 Mr Ben Gooley
Period 3
11:25am–12:25pm
English Communications
(10ENG101103)
C 03 Mrs Tina Campbell
Mathematics Core
(10MAT101103)
M 06 Mr Darren Hamilton
English Communications
(10ENG101103)
C 03 Mrs Tina Campbell
Mathematics Core
(10MAT101103)
M 09 Mr Darren Hamilton
Psychology Research & Design
(10PSY252103)
C 07 Ms Dianne McKenzie`;

function debugImportProcess() {
    console.log('=== DEBUGGING IMPORT PROCESS ===');
    
    // This simulates the exact same logic as the React component
    const text = testTimetableData.trim();
    
    // Clean and split the data
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract days from first line
    const dayHeaderRow = lines[0];
    const days = dayHeaderRow.split('\t').map(day => day.trim()).filter(day => day);
    
    // Validate periods
    const periodCount = lines.filter(line => line.match(/^(Period\s+\d+|Tutorial)$/i)).length;
    
    console.log(`Days found: ${days.length}`);
    console.log(`Period count: ${periodCount}`);
    
    if (days.length < 2) {
        console.error('❌ FAILED: Could not detect day columns');
        return;
    }
    
    if (periodCount === 0) {
        console.error('❌ FAILED: No periods found');
        return;
    }
    
    console.log('✅ Initial validation passed');
    
    // Initialize timetable data structure
    const timetableData = {
        days: days,
        periods: [],
        classes: {}
    };
    
    // Initialize days in classes object
    timetableData.days.forEach(day => {
        timetableData.classes[day] = {};
    });
    
    let rowIndex = 1; // Start after header
    
    console.log('\n=== PROCESSING PERIODS ===');
    
    // Process each period
    while (rowIndex < lines.length) {
        const line = lines[rowIndex].trim();
        
        if (!line) {
            rowIndex++;
            continue;
        }
        
        // Check for period header
        const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
        
        if (periodMatch) {
            const periodName = line;
            console.log(`\n📍 Processing ${periodName} at line ${rowIndex}`);
            
            // Check for duplicates
            const existingPeriod = timetableData.periods.find(p => p.name === periodName);
            if (existingPeriod) {
                console.log(`⚠️ Duplicate ${periodName} found, skipping...`);
                rowIndex++;
                continue;
            }
            
            // Look for time in next line
            let startTime = null;
            let endTime = null;
            
            if (rowIndex + 1 < lines.length) {
                const timeLine = lines[rowIndex + 1].trim();
                const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                
                if (timeMatch) {
                    startTime = timeMatch[1];
                    endTime = timeMatch[2];
                    console.log(`  ⏰ Time: ${startTime} - ${endTime}`);
                    rowIndex++; // Skip time line
                } else {
                    console.log(`  ⚠️ No time found in "${timeLine}"`);
                }
            }
            
            // Create period
            const currentPeriod = {
                name: periodName,
                startTime: startTime || '',
                endTime: endTime || ''
            };
            
            timetableData.periods.push(currentPeriod);
            
            // Initialize this period in each day's classes
            timetableData.days.forEach(day => {
                timetableData.classes[day][currentPeriod.name] = [];
            });
            
            rowIndex++; // Move to class data
            
            console.log(`  📚 Processing class data starting at line ${rowIndex}`);
            
            // Process class data for each day
            let dayIndex = 0;
            
            while (dayIndex < days.length && rowIndex + 2 < lines.length) {
                // Check if we hit the next period
                const nextPeriodCheck = lines[rowIndex].match(/^(Period\s+\d+|Tutorial)$/i);
                if (nextPeriodCheck) {
                    console.log(`  🔄 Hit next period: ${lines[rowIndex]}`);
                    break;
                }
                
                const dayName = days[dayIndex];
                const subjectLine = lines[rowIndex]?.trim() || '';
                const codeLine = lines[rowIndex + 1]?.trim() || '';
                const roomTeacherLine = lines[rowIndex + 2]?.trim() || '';
                
                console.log(`    Day ${dayIndex + 1} (${dayName}):`);
                console.log(`      Subject: "${subjectLine}"`);
                console.log(`      Code: "${codeLine}"`);
                console.log(`      Room/Teacher: "${roomTeacherLine}"`);
              
                if (subjectLine) {
                    // Extract course code
                    let code = '';
                    const codeMatch = codeLine.match(/\(([^)]+)\)/);
                    if (codeMatch) {
                        code = codeMatch[1];
                    }
                    
                    // Parse room and teacher
                    let room = '';
                    let teacher = '';
                    
                    if (roomTeacherLine) {
                        const roomMatch = roomTeacherLine.match(/^([A-Z]\s+\d+)/);
                        if (roomMatch) {
                            room = roomMatch[1];
                            const teacherText = roomTeacherLine.replace(roomMatch[0], '').trim();
                            const teacherMatch = teacherText.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                            if (teacherMatch) {
                                teacher = teacherMatch[0].trim();
                            } else if (teacherText.length > 0) {
                                teacher = teacherText;
                            }
                        } else {
                            teacher = roomTeacherLine;
                        }
                    }
                    
                    // Create class entry
                    const classEntry = {
                        subject: subjectLine,
                        code: code,
                        room: room,
                        teacher: teacher,
                        startTime: currentPeriod.startTime,
                        endTime: currentPeriod.endTime
                    };
                    
                    timetableData.classes[dayName][currentPeriod.name].push(classEntry);
                    console.log(`      ✅ Added: ${subjectLine} (${code}) - ${room} ${teacher}`);
                }
                
                dayIndex++;
                rowIndex += 3;
            }
            
            console.log(`  📊 ${periodName} completed - processed ${dayIndex} days`);
        } else {
            rowIndex++;
        }
    }
    
    // Final results
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Total periods: ${timetableData.periods.length}`);
    timetableData.periods.forEach(period => {
        console.log(`- ${period.name}: ${period.startTime} - ${period.endTime}`);
        
        // Count classes for this period
        let totalClasses = 0;
        timetableData.days.forEach(day => {
            totalClasses += timetableData.classes[day][period.name].length;
        });
        console.log(`  Classes: ${totalClasses}`);
    });
    
    // Check Tutorial specifically
    const tutorialPeriod = timetableData.periods.find(p => p.name === 'Tutorial');
    if (tutorialPeriod) {
        console.log('\n🎯 TUTORIAL PERIOD ANALYSIS:');
        console.log(`Found Tutorial: ${tutorialPeriod.name} (${tutorialPeriod.startTime} - ${tutorialPeriod.endTime})`);
        
        timetableData.days.forEach(day => {
            const tutorialClasses = timetableData.classes[day]['Tutorial'];
            console.log(`${day}: ${tutorialClasses.length} classes`);
            tutorialClasses.forEach(cls => {
                console.log(`  - ${cls.subject} (${cls.code}) - ${cls.room} ${cls.teacher}`);
            });
        });
    } else {
        console.log('\n❌ NO TUTORIAL PERIOD FOUND!');
    }
    
    return timetableData;
}

// Run the debug
const result = debugImportProcess();

// Optionally write results to file for inspection
fs.writeFileSync('debug-import-results.json', JSON.stringify(result, null, 2));
console.log('\n📁 Results written to debug-import-results.json');
