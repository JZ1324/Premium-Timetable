// Comprehensive test data with Tutorial periods for debugging React app
// This file contains exact test data that should trigger Tutorial detection

export const TUTORIAL_TEST_DATA = `Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
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
9:40am–10:40am
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
C 07 Ms Dianne McKenzie
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

// Instructions for testing:
// 1. Copy the TUTORIAL_TEST_DATA
// 2. Open the React app 
// 3. Go to Import section
// 4. Paste the data above
// 5. Check browser console for the debug messages
// 6. Look for:
//    - "🎯 TUTORIAL PERIODS DETECTED"  
//    - "✅ FINAL CHECK: Tutorial period"
//    - Detailed breakdown showing Tutorial classes

export const EXPECTED_RESULTS = {
    totalPeriods: 4,
    periodNames: ['Period 1', 'Period 2', 'Tutorial', 'Period 3'],
    tutorialPeriod: {
        name: 'Tutorial',
        startTime: '10:45am',
        endTime: '11:20am',
        totalClasses: 50 // 5 classes per day × 10 days
    }
};

console.log('Tutorial test data loaded. Use TUTORIAL_TEST_DATA for testing.');
console.log('Expected results:', EXPECTED_RESULTS);
