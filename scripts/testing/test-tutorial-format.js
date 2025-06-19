// Test script for the Tutorial format issue
const testData = `Day 1	Day 2	Day 3
Period 1
8:35am–9:35am
Psychology
(10PSY252103)
C 07 Ms Dianne McKenzie
Literature
(10LIT252101)
I 03 Miss Olivia Berry
Mathematics
(10MAA252103)
M 06 Mrs Leah Manning
Tutorial
10:45am–10:55am
Tutorial
(10TUT252009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT252009)
S 01 Mrs Sula Tyndall
Tutorial
(10TUT252009)
S 01 Mrs Sula Tyndall`;

function testTutorialParsing() {
    console.log('=== TESTING TUTORIAL FORMAT ISSUE ===');
    
    const lines = testData.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    // Find the Tutorial section
    const tutorialLineIndex = lines.findIndex(line => line.toLowerCase() === 'tutorial');
    if (tutorialLineIndex === -1) {
        console.log('❌ Tutorial period not found');
        return;
    }
    
    console.log(`✅ Tutorial period found at line ${tutorialLineIndex}: "${lines[tutorialLineIndex]}"`);
    
    // Check the next few lines (time + first few classes)
    console.log('\nTutorial section:');
    for (let i = tutorialLineIndex; i < Math.min(tutorialLineIndex + 8, lines.length); i++) {
        console.log(`Line ${i}: "${lines[i]}"`);
    }
    
    // Simulate the parsing logic for Tutorial classes
    console.log('\n=== SIMULATING TUTORIAL CLASS PARSING ===');
    
    const timeLineIndex = tutorialLineIndex + 1;
    const firstClassStart = tutorialLineIndex + 2;
    
    console.log(`Time line (${timeLineIndex}): "${lines[timeLineIndex]}"`);
    
    // Process first few Tutorial classes
    let classIndex = firstClassStart;
    const days = ['Day 1', 'Day 2', 'Day 3'];
    
    for (let dayIndex = 0; dayIndex < days.length && classIndex + 2 < lines.length; dayIndex++) {
        const subjectLine = lines[classIndex];
        const codeLine = lines[classIndex + 1];
        const roomTeacherLine = lines[classIndex + 2];
        
        console.log(`\n${days[dayIndex]} Tutorial Class:`);
        console.log(`  Subject: "${subjectLine}"`);
        console.log(`  Code: "${codeLine}"`);
        console.log(`  Room/Teacher: "${roomTeacherLine}"`);
        
        // Check if this would be flagged as an error by the old logic
        const wouldBeError = subjectLine.match(/^(Period\s+\d+|Tutorial)$/i);
        console.log(`  Would old logic flag as error: ${!!wouldBeError}`);
        
        // Test the new logic
        const isValidTutorial = subjectLine.toLowerCase() === 'tutorial';
        console.log(`  New logic recognizes as valid Tutorial: ${isValidTutorial}`);
        
        // Extract data
        if (isValidTutorial) {
            const codeMatch = codeLine.match(/\(([^)]+)\)/);
            const code = codeMatch ? codeMatch[1] : '';
            
            const roomMatch = roomTeacherLine.match(/^([A-Z]\s+\d+)/);
            const room = roomMatch ? roomMatch[1] : '';
            const teacherText = roomMatch ? roomTeacherLine.replace(roomMatch[0], '').trim() : roomTeacherLine;
            const teacherMatch = teacherText.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
            const teacher = teacherMatch ? teacherMatch[0].trim() : teacherText;
            
            console.log(`  ✅ Parsed: Subject="Tutorial", Code="${code}", Room="${room}", Teacher="${teacher}"`);
        }
        
        classIndex += 3;
    }
    
    console.log('\n🎯 CONCLUSION: The Tutorial format is NORMAL and should be processed correctly with the fix.');
}

testTutorialParsing();
