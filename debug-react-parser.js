// Debug script to test React parsing logic specifically
const sampleTimetableData = `Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
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

// Simulate the React parsing logic
function testReactParsing() {
    console.log('=== TESTING REACT PARSING LOGIC ===');
    
    // Clean and split the data (same as React component)
    const lines = sampleTimetableData.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log(`Total lines: ${lines.length}`);
    
    // Extract days from first line
    const dayHeaderRow = lines[0];
    const days = dayHeaderRow.split('\t').map(day => day.trim()).filter(day => day);
    console.log(`Days extracted:`, days);
    
    // Check period count detection
    const periodCount = lines.filter(line => line.match(/^(Period\s+\d+|Tutorial)$/i)).length;
    console.log(`Period count: ${periodCount}`);
    
    // Show all period lines
    console.log('\n=== PERIOD LINES DETECTED ===');
    lines.forEach((line, index) => {
        const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
        if (periodMatch) {
            console.log(`Line ${index}: "${line}" - MATCHED as period`);
        }
    });
    console.log('=== END PERIOD LINES ===\n');
    
    // Main parsing loop simulation
    let rowIndex = 1;
    let periods = [];
    
    console.log('=== MAIN PARSING SIMULATION ===');
    
    while (rowIndex < lines.length) {
        const line = lines[rowIndex].trim();
        
        if (!line) {
            rowIndex++;
            continue;
        }
        
        console.log(`\nProcessing line ${rowIndex}: "${line}"`);
        
        // Check for period header
        const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
        
        if (line.toLowerCase().includes('period') || line.toLowerCase().includes('tutorial')) {
            console.log(`DEBUG: Potential period line - Match: ${!!periodMatch}`);
        }
        
        if (periodMatch) {
            const periodName = line;
            console.log(`✅ FOUND PERIOD: ${periodName}`);
            
            // Check for existing period (duplicate detection)
            const existingPeriod = periods.find(p => p.name === periodName);
            if (existingPeriod) {
                console.log(`⚠️ Duplicate period detected: ${periodName} already exists, skipping...`);
                rowIndex++;
                continue;
            }
            
            // Look for time in next line
            let startTime = null;
            let endTime = null;
            
            if (rowIndex + 1 < lines.length) {
                const timeLine = lines[rowIndex + 1].trim();
                console.log(`Checking time line: "${timeLine}"`);
                const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                
                if (timeMatch) {
                    startTime = timeMatch[1];
                    endTime = timeMatch[2];
                    console.log(`Found time range: ${startTime} - ${endTime}`);
                    rowIndex++; // Skip time line
                } else {
                    console.log(`No time range found`);
                }
            }
            
            // Add period
            periods.push({
                name: periodName,
                startTime: startTime || '',
                endTime: endTime || ''
            });
            
            console.log(`Added period: ${periodName} (${startTime} - ${endTime})`);
        }
        
        rowIndex++;
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Total periods found: ${periods.length}`);
    periods.forEach(period => {
        console.log(`- ${period.name}: ${period.startTime} - ${period.endTime}`);
    });
}

testReactParsing();
