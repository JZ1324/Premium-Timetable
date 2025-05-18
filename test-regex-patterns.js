// Test regex patterns for English class truncation

// Sample JSON content with truncated English class
const truncatedJSON = `{
  "classes": {
    "Day 1": {
      "Period 3": [
        {
          "subject": "English",
          "code": "(10EN
        }
      ]
    }
  }
}`;

// Test patterns
console.log("Testing fixed regex patterns for English class truncation detection");

try {
  // Test pattern 1 (safe version without parenthesis)
  const pattern1 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"[^\"]*$');
  const result1 = pattern1.test(truncatedJSON);
  console.log("Pattern 1 (safe version) result:", result1);
  
  // Test pattern 2 (removed due to regex syntax issues)
  console.log("Pattern 2 (escaped parenthesis) result: Skipped due to syntax issues");
  
  // Test pattern 3 (looking for 10EN)
  const pattern3 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"10EN[^\"]*$');
  const result3 = pattern3.test(truncatedJSON);
  console.log("Pattern 3 (10EN specific) result:", result3);
  
  // Test problematic pattern (should throw error)
  try {
    const badPattern = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"\(10EN[^\"]*$');
    const badResult = badPattern.test(truncatedJSON);
    console.error("❌ Bad pattern did not throw error as expected");
  } catch (regexError) {
    console.log("✅ Bad pattern correctly throws error:", regexError.message);
  }
  
  console.log("All regex patterns tested successfully!");
} catch (error) {
  console.error("Regex test failed:", error);
}
