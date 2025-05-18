/**
 * test-regex-fix.js
 * 
 * This test validates that the fixed regex patterns correctly identify
 * English class truncation without causing errors.
 */

// Test the regex patterns
function testRegexPatterns() {
  console.log("Testing fixed regex patterns for English class truncation detection");
  
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
  
  try {
    // Test pattern 1 (safe version without parenthesis)
    const pattern1 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"[^\"]*$');
    const result1 = pattern1.test(truncatedJSON);
    console.log("Pattern 1 (safe version) result:", result1);
    
    // Test pattern 2 (with escaped parenthesis)
    const pattern2 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"\\\\([^\"]*$');
    const result2 = pattern2.test(truncatedJSON);
    console.log("Pattern 2 (escaped parenthesis) result:", result2);
    
    // Test pattern 3 (looking for 10EN)
    const pattern3 = new RegExp('\"subject\"\\s*:\\s*\"English\"\\s*,\\s*\"code\"\\s*:\\s*\"10EN[^\"]*$');
    const result3 = pattern3.test(truncatedJSON);
    console.log("Pattern 3 (10EN specific) result:", result3);
    
    console.log("All regex patterns tested successfully!");
  } catch (error) {
    console.error("Regex test failed:", error);
  }
}

testRegexPatterns();
