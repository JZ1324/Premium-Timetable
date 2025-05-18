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
  console.log();
  patterns.forEach(pattern => {
    const match = test.match(pattern.regex);
    console.log();
  });
});

console.log('
=== TEST COMPLETE ===');
