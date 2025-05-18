// test-regex-fix.js - Simple version to verify correct regex behavior

// Sample string that mimics our truncation case
const sample = '"subject": "English", "code": "(10EN';
console.log("Sample text to match:", sample);

// Test our fixed patterns
console.log("\nTesting pattern 1 (basic):");
const pattern1 = /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/;
console.log("Match result:", pattern1.test(sample));

console.log("\nTesting pattern 2 (with escaped parenthesis):");
const pattern2 = /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"\([^\"]*$/;
console.log("Match result:", pattern2.test(sample));

console.log("\nTesting pattern 3 (direct 10EN):");
const pattern3 = /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"10EN[^\"]*$/;
console.log("Match result:", pattern3.test(sample));

// Test the equivalent patterns as used in our code
console.log("\nTesting as used in the code:");
const codePattern1 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"[^\"]*$');
console.log("Code Pattern 1:", codePattern1.test(sample));

// This pattern was causing errors due to the unescaped parenthesis - removing it
console.log("Code Pattern 2: Skipped due to regex syntax issues");

// Test the problematic pattern that should be fixed in our code
console.log("\nThe pattern that caused the error (should still fail):");
try {
  const badPattern = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"\(10EN[^\"]*$');
  console.log("Error: This pattern should have failed but didn't!");
} catch (e) {
  console.log("Correctly failed with error:", e.message);
}
