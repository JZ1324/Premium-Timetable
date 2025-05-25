// Parse and check the entire structure of the file
const fs = require('fs');

// Read the file
const filePath = 'src/services/aiParserService.js';
const content = fs.readFileSync(filePath, 'utf8');

// Create a simple validator
function validateJavaScript(code) {
  try {
    // Use Function constructor to validate syntax (doesn't execute code)
    new Function(code);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      message: error.message,
      lineNumber: error.lineNumber
    };
  }
}

// Validate the entire file
const validationResult = validateJavaScript(content);
console.log('File validation result:', validationResult);

// Also check with Node's vm module
const vm = require('vm');
try {
  vm.runInNewContext(content);
  console.log('✅ File passes vm.runInNewContext() validation');
} catch (error) {
  console.log('❌ vm.runInNewContext() validation failed:', error.message);
}

// Look at the structure specifically
const fallbackParserMatch = content.match(/export const fallbackParser = \(.*?\) => {[\s\S]*?catch \(error\) {[\s\S]*?return createDefaultTimetableStructure\(\);[\s\S]*?}/);
if (fallbackParserMatch) {
  const fallbackParser = fallbackParserMatch[0];
  console.log('Found fallbackParser function, checking its structure...');
  
  // Check if it contains a try after the line parser log
  const hasLineParserTry = fallbackParser.includes('console.log("Using standard line-by-line parser");\n    try {');
  console.log('Has problematic try block after line parser log:', hasLineParserTry);
  
  // Check semicolon after closing brace
  const hasSemicolon = fallbackParser.match(/}\s*;(?:\s*\/\/|\s*$)/);
  console.log('Has stray semicolon after closing brace:', !!hasSemicolon);
  
  // Check balanced try-catch
  const tryCount = (fallbackParser.match(/try\s*{/g) || []).length;
  const catchCount = (fallbackParser.match(/catch\s*\(/g) || []).length;
  console.log(`Try blocks: ${tryCount}, Catch blocks: ${catchCount}`);
}

// Check if the file is processed correctly by Node.js
const nodeResult = require('child_process').spawnSync('node', ['--check', filePath]);
if (nodeResult.status === 0) {
  console.log('✅ File passes node --check');
} else {
  console.log('❌ File fails node --check:', nodeResult.stderr.toString());
}

console.log('Syntax validation completed');
