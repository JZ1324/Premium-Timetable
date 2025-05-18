// Test script to verify the aiParserService.js in action
const fs = require('fs');
const path = require('path');

// Since the aiParserService.js exports functions and doesn't define them globally,
// we need to extract and evaluate them to test
console.log("Reading aiParserService.js...");
const servicePath = path.join(__dirname, 'src/services/aiParserService.js');
const serviceContent = fs.readFileSync(servicePath, 'utf8');

// Create a test environment that simulates the imported modules
const mockContent = `
// Mock dependencies
const getOpenRouterApiKey = () => 'test-api-key';
const tryParseJson = (text) => { try { return JSON.parse(text); } catch(e) { return {}; } };

// Import the actual code
${serviceContent}

// Test the fallbackParser function with a simple test case
console.log("Testing fallbackParser function...");
try {
  const testText = \`
    Day 1  Day 2  Day 3
Period 1
8:35am-9:35am
    Math   Science  English
    A101   B202     C303
    Mr. Smith Ms. Johnson Mr. Davis

Period 2  
9:40am-10:40am
    Art    Music    P.E.
    D404   E505     Gym
    Mrs. Brown Mr. Wilson Ms. Lee
  \`;
  
  const result = fallbackParser(testText, testText.length);
  console.log("✅ fallbackParser executed successfully");
  console.log("Sample output:", JSON.stringify(result, null, 2).substring(0, 150) + "...");
} catch (error) {
  console.error("❌ Error executing fallbackParser:", error);
}

console.log("Test completed.");
`;

// Write the test file
const testPath = path.join(__dirname, 'test-parser-execution.js');
fs.writeFileSync(testPath, mockContent);

console.log(`Test script created at ${testPath}`);
console.log("Run the test with: node test-parser-execution.js");
