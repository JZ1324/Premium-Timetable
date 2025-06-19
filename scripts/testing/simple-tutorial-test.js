console.log('=== TESTING TUTORIAL DETECTION ===');

const testData = 'Day 1\tDay 2\tDay 3\nPeriod 1\n8:35am–9:35am\nMath\n(10MAT101)\nA01 Mr Smith\nEnglish\n(10ENG101)\nB02 Ms Jones\nScience\n(10SCI101)\nC03 Dr Brown\nTutorial\n10:45am–11:20am\nStudy Skills\n(10STU101)\nLibrary Ms Taylor\nResearch\n(10RES101)\nLab Mr Wilson\nWriting\n(10WRI101)\nD04 Mrs Davis';

// Split into lines
const lines = testData.trim().split('\n').map(line => line.trim()).filter(line => line);

console.log('Total lines:', lines.length);

// Find all period lines
console.log('\nPERIOD DETECTION:');
lines.forEach((line, index) => {
    const periodMatch = line.match(/^(Period\s+\d+|Tutorial)$/i);
    if (periodMatch) {
        console.log('Line', index, ':', line, '- PERIOD DETECTED');
    }
});

// Check specifically for Tutorial
const tutorialLine = lines.find(line => line.toLowerCase() === 'tutorial');
if (tutorialLine) {
    console.log('\nTutorial found:', tutorialLine);
} else {
    console.log('\nTutorial NOT found');
}

// Test regex pattern
const testRegex = /^(Period\s+\d+|Tutorial)$/i;
console.log('\nREGEX TESTING:');
console.log('Tutorial matches regex:', testRegex.test('Tutorial'));
console.log('Period 1 matches regex:', testRegex.test('Period 1'));

console.log('\nTEST COMPLETE');
