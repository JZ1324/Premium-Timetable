// Debug script to test the manual parser logic
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

function debugParser() {
    console.log('=== DEBUGGING PARSER ===');
    
    // Split the text into lines and clean up
    const lines = sampleTimetableData.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Total lines: ${lines.length}`);
    console.log('Lines:');
    lines.forEach((line, index) => {
        console.log(`${index}: "${line}"`);
    });
    
    console.log('\n=== PERIOD DETECTION ===');
    
    // Process each line to find periods
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
        
        if (periodMatch) {
            console.log(`✓ Found period at line ${i}: "${line}"`);
            
            // Check next line for time
            if (i + 1 < lines.length) {
                const timeLine = lines[i + 1].trim();
                const timeMatch = timeLine.match(/(\d+:\d+[ap]m)[–\-](\d+:\d+[ap]m)/i);
                if (timeMatch) {
                    console.log(`  ✓ Time found: ${timeMatch[1]} - ${timeMatch[2]}`);
                } else {
                    console.log(`  ✗ No time match for: "${timeLine}"`);
                }
            }
        }
    }
}

debugParser();
