// Test compile aiParserService.js with node

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Get the aiParserService.js file path
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Read the file
console.log(`Reading file ${filePath}...`);
const fileContent = fs.readFileSync(filePath, 'utf8');
console.log(`Read file, length: ${fileContent.length} characters`);

// Test compile using node
try {
  console.log('Testing syntax with node --check...');
  child_process.execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
  console.log('✅ File compiles correctly with node!');
  
  // Read the file again to show specific regions
  console.log('\nRegion after parseTimetableText function (around line 352):');
  const lines = fileContent.split('\n');
  const region1 = lines.slice(350, 355);
  console.log(region1.join('\n'));
  
  console.log('\nRegion around line-by-line parser (around line 897):');
  const region2 = lines.slice(895, 900);
  console.log(region2.join('\n'));
  
  console.log('\nChecking for remaining semicolons...');
  // Find instances of }; which might be problematic
  let linesWithSemicolon = [];
  lines.forEach((line, index) => {
    if (line.trim() === '};') {
      linesWithSemicolon.push({ line: index + 1, content: line });
    }
  });
  
  if (linesWithSemicolon.length > 0) {
    console.log('Possible problematic semicolons found:');
    linesWithSemicolon.forEach(item => {
      console.log(`Line ${item.line}: ${item.content}`);
    });
  } else {
    console.log('No problematic semicolons found.');
  }
  
} catch (error) {
  console.error('❌ File does not compile correctly.');
  console.error(error.message);
}
