/**
 * Minimal test for the enhanced regex pattern
 */

// Test regex to match codes like (10SPE251101)
const testCases = [
  "(10SPE251101)",
  "(ABC123)",
  "(123)",
  "(ABC)",
  "(10MAA251105)",
  "(11BIO251101)"
];

// Original regex pattern
const originalPattern = /\(([A-Z0-9]+)\)/;

// Enhanced regex pattern requiring 5+ characters 
const enhancedPattern = /\(([A-Z0-9]{5,})\)/;

// Test and compare both patterns
console.log("=== Testing Code Detection Enhancements ===");
console.log("Original vs Enhanced Pattern Results:\n");

testCases.forEach(testCase => {
  const originalMatch = testCase.match(originalPattern);
  const enhancedMatch = testCase.match(enhancedPattern);
  
  console.log(`Test: ${testCase}`);
  console.log(`  Original: ${originalMatch ? originalMatch[1] : 'No match'}`);
  console.log(`  Enhanced: ${enhancedMatch ? enhancedMatch[1] : 'No match'}`);
  console.log("");
});

// Verify the enhanced pattern correctly filters short codes
const correctCount = testCases.filter(test => {
  const match = test.match(enhancedPattern);
  // Only codes with 5+ chars should match
  return (test.length >= 7) === !!match;
}).length;

console.log(`Summary: Enhanced pattern correctly handled ${correctCount} of ${testCases.length} test cases`);
console.log(correctCount === testCases.length ? 
  "✅ SUCCESS: Enhanced regex properly filters short codes" : 
  "❌ FAILURE: Enhanced regex not working as expected");
