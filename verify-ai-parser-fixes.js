// Final validation of aiParserService.js syntax fixes

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Get the aiParserService.js file path
const filePath = path.join(__dirname, 'src', 'services', 'aiParserService.js');

// Read the file
console.log(`Reading file ${filePath}...`);
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  console.log(`Read file, length: ${fileContent.length} characters`);

  // Test compile using node
  try {
    console.log('Testing syntax with node --check...');
    const output = child_process.execSync(`node --check "${filePath}" 2>&1`, { encoding: 'utf8' });
    console.log('✅ File compiles correctly with node!');
    
    // Split into lines for analysis
    const lines = fileContent.split('\n');
    
    // Check Fix 1: No stray semicolon after parseTimetableText function
    console.log('\nChecking Fix 1: No stray semicolon after parseTimetableText function');
    // Look around line 352 where the stray semicolon was removed
    const region1 = lines.slice(350, 355);
    console.log(region1.join('\n'));
    const hasFix1 = region1.some(line => line.trim() === '}') && 
                   !region1.some(line => line.trim() === '};');
    console.log(hasFix1 ? '✅ Fix 1 verified: No stray semicolon' : '❌ Fix 1 failed: Stray semicolon still present');
    
    // Check Fix 2: No duplicate try blocks around line-by-line parser
    console.log('\nChecking Fix 2: No duplicate try blocks in line-by-line parser');
    const region2 = lines.slice(895, 905);
    console.log(region2.join('\n'));
    let tryCount = 0;
    region2.forEach(line => {
      if (line.includes('try {')) {
        tryCount++;
      }
    });
    console.log(tryCount === 1 ? '✅ Fix 2 verified: No duplicate try blocks' : `❌ Fix 2 failed: Found ${tryCount} try blocks`);
    
    // Check Fix 3: Proper matching of try/catch blocks
    console.log('\nChecking Fix 3: Proper matching of try/catch blocks');
    console.log('Since the file compiles with node --check, this is implicitly verified ✅');
    
    console.log('\n== Summary of Fixes ==');
    console.log('1. Stray semicolon after parseTimetableText function: ' + (hasFix1 ? '✅ Fixed' : '❌ Not Fixed'));
    console.log('2. Duplicate try blocks in line-by-line parser: ' + (tryCount === 1 ? '✅ Fixed' : '❌ Not Fixed'));
    console.log('3. Proper matching of try/catch blocks: ✅ Fixed (verified by successful compilation)');
    
    if (hasFix1 && tryCount === 1) {
      console.log('\n✅ All three syntax issues have been successfully fixed!');
    } else {
      console.log('\n❌ Some issues may remain. Please review the output.');
    }
    
  } catch (error) {
    console.error('❌ File does not compile correctly.');
    console.error(error.message);
  }
} catch (error) {
  console.error('Error reading file:', error);
}
