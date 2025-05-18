/**
 * Minimal regex test
 */

// Test cases
const tests = ["(10SPE251101)", "(ABC123)", "(123)", "(ABC)"];

// Original pattern
const originalPattern = /\(([A-Z0-9]+)\)/;

// Enhanced pattern 
const enhancedPattern = /\(([A-Z0-9]{5,})\)/;

tests.forEach(test => {
  const originalMatch = test.match(originalPattern);
  const enhancedMatch = test.match(enhancedPattern);
  
  console.log(`Testing: ${test}`);
  console.log(`Original: ${originalMatch ? originalMatch[1] : 'No match'}`);
  console.log(`Enhanced: ${enhancedMatch ? enhancedMatch[1] : 'No match'}`);
  console.log();
});
