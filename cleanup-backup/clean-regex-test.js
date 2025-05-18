/**
 * Clean regex test for code detection
 */
const patterns = [
  { name: 'Original', regex: /\(([A-Z0-9]+)\)/ },
  { name: 'Enhanced', regex: /\(([A-Z0-9]{5,})\)/ }
];

const tests = [
  '(10SPE251101)',
  '(10MAA251105)',
  '(10PHY251102)',
  '(10WBB251102)',
  '(10ENG251108)',
  '(ABC)',
  '(123)'
];

console.log('=== CODE DETECTION TEST ===');

tests.forEach(test => {
  console.log(`\nTesting: ${test}`);
  patterns.forEach(pattern => {
    const match = test.match(pattern.regex);
    console.log(`${pattern.name}: ${match ? match[1] : 'No match'}`);
  });
});

console.log('\n=== TEST COMPLETE ===');
