// Comprehensive syntax check for aiParserService.js

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Get the file path
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Read the file
console.log(`Reading file ${filePath}...`);
const fileContent = fs.readFileSync(filePath, 'utf8');
console.log(`Read file, length: ${fileContent.length} characters`);

// Analyze the try/catch structure
console.log('Analyzing try/catch structure...');
let tryCount = 0;
let catchCount = 0;
let topLevelTryCount = 0;
let topLevelCatchCount = 0;

// Split into lines
const lines = fileContent.split('\n');

// Track indentation levels to identify nested blocks
let currentIndent = 0;
let tryIndentLevels = [];
let tryLineNumbers = [];
let catchLineNumbers = [];

lines.forEach((line, index) => {
  const lineNumber = index + 1;
  const trimmedLine = line.trim();
  
  // Calculate indentation level
  const indent = line.search(/\S|$/);
  
  // Track block structure
  if (trimmedLine.includes('{')) {
    currentIndent++;
  }
  if (trimmedLine.includes('}')) {
    currentIndent--;
  }
  
  // Track try statements
  if (trimmedLine === 'try {') {
    tryCount++;
    tryIndentLevels.push(currentIndent);
    tryLineNumbers.push(lineNumber);
    
    if (currentIndent === 1) {
      topLevelTryCount++;
    }
  }
  
  // Track catch statements
  if (trimmedLine.startsWith('catch ') && trimmedLine.includes('{')) {
    catchCount++;
    catchLineNumbers.push(lineNumber);
    
    if (currentIndent === 1) {
      topLevelCatchCount++;
    }
  }
});

console.log(`Total try statements: ${tryCount}`);
console.log(`Total catch statements: ${catchCount}`);
console.log(`Top-level try statements: ${topLevelTryCount}`);
console.log(`Top-level catch statements: ${topLevelCatchCount}`);

// Print the line-by-line parser region
console.log('\nLine-by-line parser region:');
const lineByLineRegion = lines.slice(890, 900);
console.log(lineByLineRegion.join('\n'));

// Print the end of the fallback parser function
console.log('\nEnd of fallback parser function:');
const endRegion = lines.slice(985, 995);
console.log(endRegion.join('\n'));

// Validate syntax with node
try {
  console.log('\nValidating with node --check...');
  child_process.execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
  console.log('✅ Syntax is valid according to Node.js');
} catch (error) {
  console.error('❌ Syntax error detected by Node.js:', error.message);
}

// Look for suspicious try without matching catch
if (tryCount !== catchCount) {
  console.log('\n⚠️ Warning: Mismatch between try and catch counts');
  console.log('Try statements at lines:', tryLineNumbers.join(', '));
  console.log('Catch statements at lines:', catchLineNumbers.join(', '));
  
  // Try to locate the unmatched try or catch
  console.log('\nAnalyzing for unmatched try blocks...');
  
  // Create a map of try blocks with their indentation levels
  const tryBlocks = tryLineNumbers.map((line, index) => ({
    line,
    indentLevel: tryIndentLevels[index]
  }));
  
  // Create a map of catch blocks with their line numbers
  const catchBlocks = catchLineNumbers.map(line => ({ line }));
  
  // Check for try blocks without matching catch blocks
  if (tryBlocks.length > catchBlocks.length) {
    console.log(`There are ${tryBlocks.length - catchBlocks.length} try blocks without matching catch blocks`);
    
    // Check for the specific line-by-line parser try block
    const lineByLineParserTry = tryBlocks.find(block => {
      return block.line >= 890 && block.line <= 900;
    });
    
    if (lineByLineParserTry) {
      console.log(`The line-by-line parser try block at line ${lineByLineParserTry.line} might be missing its catch statement`);
      
      // Suggest a fix
      console.log('\nSuggested fix: Remove the extra try block if there is one, or add a matching catch block');
    }
  }
}
