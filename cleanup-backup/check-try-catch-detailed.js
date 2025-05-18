// This is a small JavaScript program to check the file structure
const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/services/aiParserService.js');
const content = fs.readFileSync(filePath, 'utf8');

// Check the balance of curly braces
let braceCount = 0;
let lineNumber = 1;
let errorLines = [];

content.split('\n').forEach((line, index) => {
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  braceCount += openBraces - closeBraces;
  
  if (braceCount < 0) {
    errorLines.push({ line: index + 1, content: line, message: 'Extra closing brace' });
  }
  
  lineNumber++;
});

if (braceCount !== 0) {
  console.log(`Brace imbalance detected: ${braceCount > 0 ? 'Missing' : 'Extra'} closing braces`);
} else {
  console.log('All braces are balanced');
}

if (errorLines.length > 0) {
  console.log('Error lines:');
  errorLines.forEach(err => {
    console.log(`Line ${err.line}: ${err.content} - ${err.message}`);
  });
}

// Check try-catch balance
const tryMatches = content.match(/try\s*{/g) || [];
const catchMatches = content.match(/catch\s*\(/g) || [];

console.log(`Try blocks: ${tryMatches.length}, Catch blocks: ${catchMatches.length}`);

// Extract the entire fallbackParser function for analysis
const fallbackParserMatch = content.match(/export const fallbackParser = \(.*?\) => {[\s\S]*?};/);
if (fallbackParserMatch) {
  const fallbackParser = fallbackParserMatch[0];
  
  // Check try-catch balance within the function
  const functionTryMatches = fallbackParser.match(/try\s*{/g) || [];
  const functionCatchMatches = fallbackParser.match(/catch\s*\(/g) || [];
  
  console.log(`Try blocks in fallbackParser: ${functionTryMatches.length}, Catch blocks: ${functionCatchMatches.length}`);
  
  // Find the line with "Using standard line-by-line parser"
  const lineParserLine = fallbackParser.match(/console\.log\("Using standard line-by-line parser"\);[\s\S]*?try\s*{/);
  if (lineParserLine) {
    console.log('Found problematic try block after line-by-line parser message');
    
    // Examine the context around this line
    const lineContext = lineParserLine[0];
    console.log('Context:');
    console.log(lineContext);
  }
}

// Look for suspicious patterns
if (content.match(/try\s*{\s*try\s*{/)) {
  console.log('Warning: Nested try blocks without catch detected');
}

if (content.match(/}\s*;\s*}/)) {
  console.log('Warning: Suspicious semicolon after closing brace detected');
}

// Print recommendations
console.log('\nRecommendations:');
console.log('1. Remove the try block after "Using standard line-by-line parser"');
console.log('2. Remove any stray semicolons after closing braces');
console.log('3. Ensure each try block has a matching catch block');
