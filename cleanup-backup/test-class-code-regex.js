/**
 * Test script for verifying the class code regex pattern
 * This tests both short and long code patterns to make sure
 * we only match codes with at least 5 alphanumeric characters
 */

// Sample class text strings
const testCases = [
  "Mathematics - Advanced\n(10MAA251105)\nM 05 Mr Scott Kertes", // Valid long code
  "Physics\n(PHYS)\nS 01 Ms Laura Diaz", // Short code (should not match)
  "English (ENG) A 08", // Short code inline (should not match)
  "Chemistry (11CHE251103) S 02", // Valid long code inline
  "Biology (ABC) S 06", // Short code (should not match)
  "Computer Science (10CSC251107)", // Valid long code
  "Legal Studies (LS) B 02", // Short code (should not match)
  "(AB)", // Very short code only (should not match)
  "(10SPE251101)", // Valid long code only
  "Subject without any code" // No code
];

// Original pattern that matches any length
const originalPattern = /\(([A-Z0-9]+)\)/;

// Enhanced pattern requiring min 5 chars
const enhancedPattern = /\(([A-Z0-9]{5,})\)/;

// Function to simulate the class cell parsing with both patterns
function parseWithBothPatterns(text) {
  const originalMatch = text.match(originalPattern);
  const originalCode = originalMatch ? originalMatch[1] : null;
  
  const enhancedMatch = text.match(enhancedPattern);
  const enhancedCode = enhancedMatch ? enhancedMatch[1] : null;
  
  return {
    text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
    originalCode,
    enhancedCode,
    isShortCode: originalCode !== null && originalCode.length < 5,
    properlyFiltered: (originalCode === null && enhancedCode === null) || 
                      (originalCode !== null && originalCode.length < 5 && enhancedCode === null) ||
                      (originalCode !== null && originalCode.length >= 5 && enhancedCode !== null)
  };
}

// Run tests
console.log('======= CLASS CODE REGEX PATTERN TEST =======');
console.log('Testing if the enhanced regex pattern successfully filters out short codes (<5 chars)');
console.log('');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test Case #${index + 1}: "${testCase.substring(0, 30)}${testCase.length > 30 ? '...' : ''}"`);
  
  const result = parseWithBothPatterns(testCase);
  
  console.log(`  Original pattern: ${result.originalCode || 'No match'}`);
  console.log(`  Enhanced pattern: ${result.enhancedCode || 'No match'}`);
  
  if (result.properlyFiltered) {
    console.log('  ✅ PASS: Pattern behavior is correct');
    passedTests++;
  } else {
    console.log('  ❌ FAIL: Pattern behavior is incorrect');
    failedTests++;
  }
  
  if (result.isShortCode) {
    if (result.enhancedCode === null) {
      console.log('  ✅ Short code was correctly filtered out by enhanced pattern');
    } else {
      console.log('  ❌ Short code was NOT filtered out by enhanced pattern');
    }
  }
  
  console.log('');
});

console.log('====== TEST SUMMARY ======');
console.log(`Passed: ${passedTests} tests`);
console.log(`Failed: ${failedTests} tests`);
console.log(`Total: ${testCases.length} tests`);
console.log('');

if (failedTests === 0) {
  console.log('✅ SUCCESS: All tests passed! The enhanced regex pattern correctly filters short codes.');
} else {
  console.log('❌ FAILURE: Some tests failed. The regex pattern needs further improvement.');
}
