const sampleData = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
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
Period 3
11:15am–12:15pm
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
C 07 Ms Dianne McKenzie
Tutorial
12:15pm–1:15pm
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
S 02 Mr Ben Gooley`;

function debugFullParser() {
    console.log('=== FULL PARSER DEBUG ===');
    
    const lines = sampleData.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Total lines: ${lines.length}`);
    
    // Extract days from first line
    const dayHeaderRow = lines[0];
    const days = dayHeaderRow.split('\t').map(day => day.trim()).filter(day => day);
    
    console.log(`Days found: ${days.join(', ')}`);
    
    const timetableData = {
        days: days,
        periods: [],
        classes: {}
    };
    
    // Initialize days in classes object
    timetableData.days.forEach(day => {
        timetableData.classes[day] = {};
    });
    
    let rowIndex = 1;
    
    while (rowIndex < lines.length) {
        const line = lines[rowIndex].trim();
        
        if (!line) {
            rowIndex++;
            continue;
        }
        
        console.log(`\nProcessing line ${rowIndex}: "${line}"`);
        
        const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
        
        if (periodMatch) {
            const periodName = line;
            console.log(`✓ Found period: ${periodName} at line ${rowIndex}`);
            
            // Check for time on next line
            let startTime = null;
            let endTime = null;
            
            if (rowIndex + 1 < lines.length) {
                const timeLine = lines[rowIndex + 1].trim();
                console.log(`  Checking time line: "${timeLine}"`);
                const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                
                if (timeMatch) {
                    startTime = timeMatch[1];
                    endTime = timeMatch[2];
                    rowIndex++; // Skip the time line
                    console.log(`  Found time range: ${startTime} - ${endTime}`);
                }
            }
            
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
            
            rowIndex++; // Move to the line after period/time
            console.log(`  Starting class data processing at line ${rowIndex} for ${periodName}`);
            
            let dayIndex = 0;
            
            while (dayIndex < days.length && rowIndex + 2 < lines.length) {
                // Check if we've hit the next period
                if (lines[rowIndex].match(/^(Period\s+\d+|Tutorial)$/i)) {
                    console.log(`  Hit next period at line ${rowIndex}: "${lines[rowIndex]}"`);
                    break;
                }
                
                const dayName = days[dayIndex];
                const subjectLine = lines[rowIndex].trim();
                const codeLine = lines[rowIndex + 1].trim();
                const roomTeacherLine = lines[rowIndex + 2].trim();
                
                console.log(`  Processing ${periodName} for ${dayName}:`);
                console.log(`    Subject: ${subjectLine}`);
                console.log(`    Code: ${codeLine}`);
                console.log(`    Room/Teacher: ${roomTeacherLine}`);
                
                if (!subjectLine) {
                    console.log(`    No subject for ${dayName}, skipping...`);
                    dayIndex++;
                    rowIndex += 3;
                    continue;
                }
                
                // Extract course code
                let code = '';
                const codeMatch = codeLine.match(/\(([^)]+)\)/);
                if (codeMatch) {
                    code = codeMatch[1];
                }
                
                const classEntry = {
                    subject: subjectLine,
                    code: code,
                    room: roomTeacherLine.split(' ')[0] + ' ' + roomTeacherLine.split(' ')[1] || '',
                    teacher: roomTeacherLine.substring(roomTeacherLine.indexOf(' ', 3)).trim() || '',
                    startTime: currentPeriod.startTime,
                    endTime: currentPeriod.endTime
                };
                
                timetableData.classes[dayName][currentPeriod.name].push(classEntry);
                
                console.log(`    ✓ Added class for ${dayName}: ${subjectLine} (${code})`);
                
                dayIndex++;
                rowIndex += 3;
            }
            
            console.log(`  Completed processing ${periodName}, processed ${dayIndex} days`);
            
        } else {
            console.log(`  Skipping non-period line: "${line}"`);
            rowIndex++;
        }
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Periods found: ${timetableData.periods.map(p => p.name).join(', ')}`);
    
    // Count classes per period
    timetableData.periods.forEach(period => {
        let classCount = 0;
        timetableData.days.forEach(day => {
            classCount += timetableData.classes[day][period.name].length;
        });
        console.log(`${period.name}: ${classCount} classes`);
    });
}

debugFullParser();
