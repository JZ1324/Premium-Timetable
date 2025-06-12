// Debug script to test code extraction logic
function testCodeExtraction() {
    const testCases = [
        "(10PSY252103)",
        "(10CHE111103)",
        "(10ENG101103)",
        "(10MAT101103)",
        "10PSY252103",  // without parentheses
        "No code here",
        "",
        "Subject (10PSY252103) with text after"
    ];
    
    console.log('=== CODE EXTRACTION TESTS ===');
    
    testCases.forEach(testCase => {
        let code = '';
        const codeMatch = testCase.match(/\(([^)]+)\)/);
        if (codeMatch) {
            code = codeMatch[1];
        }
        
        console.log(`Input: "${testCase}" -> Code: "${code}"`);
    });
}

testCodeExtraction();

// Test the room/teacher extraction
function testRoomTeacherExtraction() {
    const testCases = [
        "C 07 Ms Dianne McKenzie",
        "S 01 Mrs Sula Tyndall",
        "L 10 Ms Carolyn Butler",
        "M 06 Mr Darren Hamilton",
        "M 09 Mr Darren Hamilton",
        "S 02 Mr Ben Gooley",
        "Just a teacher name",
        "C 07",
        ""
    ];
    
    console.log('\n=== ROOM/TEACHER EXTRACTION TESTS ===');
    
    testCases.forEach(testCase => {
        let room = '';
        let teacher = '';
        
        if (testCase) {
            // Look for room pattern at the start
            const roomMatch = testCase.match(/^([A-Z]\s+\d+)/);
            if (roomMatch) {
                room = roomMatch[1];
                // Extract teacher from the remainder
                const teacherText = testCase.replace(roomMatch[0], '').trim();
                // More flexible teacher matching
                const teacherMatch = teacherText.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                if (teacherMatch) {
                    teacher = teacherMatch[0].trim();
                } else if (teacherText.length > 0) {
                    teacher = teacherText;
                }
            } else {
                // If no room found, try to extract just the teacher
                const teacherMatch = testCase.match(/(Mr|Mrs|Ms|Miss|Dr|Prof)\s+[A-Za-z\s\.]+/);
                if (teacherMatch) {
                    teacher = teacherMatch[0].trim();
                } else {
                    teacher = testCase;
                }
            }
        }
        
        console.log(`Input: "${testCase}" -> Room: "${room}", Teacher: "${teacher}"`);
    });
}

testRoomTeacherExtraction();
