const fs = require('fs');
const path = require('path');

// File path
const filePath = path.resolve(__dirname, 'src/services/aiParserService.js');
console.log(`Working on file: ${filePath}`);

// Create backup
const backupPath = `${filePath}.backup-${Date.now()}`;
fs.copyFileSync(filePath, backupPath);
console.log(`Created backup at: ${backupPath}`);

// Read the file content
const content = fs.readFileSync(filePath, 'utf8');

// Fixed version of the function
const fixedFunction = `const cleanAndValidateJson = (jsonObject, textLength) => {
  try {
    // Ensure all required top-level properties exist
    if (!jsonObject.days || !Array.isArray(jsonObject.days)) {
      jsonObject.days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"];
    }

    if (!jsonObject.periods || !Array.isArray(jsonObject.periods) || jsonObject.periods.length < 3) {
      jsonObject.periods = [
        { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
        { name: "Period 3", startTime: "11:25am", endTime: "12:25pm" },
        { name: "Period 4", startTime: "12:30pm", endTime: "1:30pm" },
        { name: "Period 5", startTime: "2:25pm", endTime: "3:25pm" }
      ];
    }

    if (!jsonObject.classes || typeof jsonObject.classes !== 'object') {
      jsonObject.classes = {};
    }

    // Ensure each day has an entry in classes
    jsonObject.days.forEach(day => {
      if (!jsonObject.classes[day]) {
        jsonObject.classes[day] = {};
      }
      
      // Ensure each period exists for each day
      jsonObject.periods.forEach(period => {
        if (!jsonObject.classes[day][period.name]) {
          jsonObject.classes[day][period.name] = [];
        }
      });
    });

    // Return the validated object
    return redistributeClasses(jsonObject, textLength);
  } catch (error) {
    console.error("Error during JSON validation:", error);
    return createDefaultTimetableStructure();
  }
};`;

// Define the portion to replace (from function declaration to closing brace after catch)
const pattern = /const cleanAndValidateJson = \(jsonObject, textLength\) => \{[\s\S]+?return createDefaultTimetableStructure\(\);[\s\S]+?\}\n}/;

// Replace the problematic function
if (pattern.test(content)) {
  const updatedContent = content.replace(pattern, fixedFunction);
  fs.writeFileSync(filePath, updatedContent);
  console.log('Function replaced successfully!');
  
  // Verify the fix
  try {
    require('child_process').execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log('✅ Syntax check passed! The fix was successful.');
  } catch (error) {
    console.error('❌ Syntax check failed:', error.message);
    console.log('Restoring the backup...');
    fs.copyFileSync(backupPath, filePath);
    console.log('Backup restored. Manual intervention may be required.');
  }
} else {
  console.error('Could not find the function pattern to replace.');
  
  // Try a more direct approach - split the file and rewrite it
  console.log('Trying direct file manipulation...');
  
  // Find the lines containing the beginning and end of the function
  const lines = content.split('\n');
  let functionStartLine = -1;
  let functionEndLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const cleanAndValidateJson = (jsonObject, textLength)')) {
      functionStartLine = i;
    }
    if (functionStartLine !== -1 && lines[i].includes('return createDefaultTimetableStructure();')) {
      // Find the closing brace after this line
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes('}')) {
          functionEndLine = j;
          break;
        }
      }
      break;
    }
  }
  
  if (functionStartLine !== -1 && functionEndLine !== -1) {
    console.log(`Found function from line ${functionStartLine} to ${functionEndLine}`);
    
    // Replace the function
    const newLines = [
      ...lines.slice(0, functionStartLine),
      ...fixedFunction.split('\n'),
      ...lines.slice(functionEndLine + 1)
    ];
    
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Function replaced using line-by-line approach.');
    
    // Verify the fix
    try {
      require('child_process').execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
      console.log('✅ Syntax check passed! The line-by-line fix was successful.');
    } catch (error) {
      console.error('❌ Syntax check failed:', error.message);
      console.log('Restoring the backup...');
      fs.copyFileSync(backupPath, filePath);
      console.log('Backup restored. Manual intervention may be required.');
    }
  } else {
    console.error('Could not locate the function in the file.');
    console.log('Manual intervention is required.');
  }
}
