#!/bin/bash

# Tab-Delimited Parser Test and Validation

echo "=== Testing Tab-Delimited Parser Enhancement ==="
echo

# Step 1: Make a backup of the original file
echo "Making backup of original aiParserService.js..."
cp src/services/aiParserService.js src/services/aiParserService.js.backup

# Step 2: Run the enhanced tab-delimited parser test
echo "Testing updated tab-delimited parser with DeepSeek Chat model..."
node test-tab-delimited-enhanced.js

# Step 3: Create a test script
cat > test-tab-delimited.js << 'EOF'
import { parseTimetableText } from './src/services/aiParserService.js';

// Sample tab-delimited timetable data
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
Period 1
8:35am–9:35am
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage`;

// Run the test
async function runTest() {
  console.log("Testing tab-delimited timetable parsing with enhanced parser...");
  
  try {
    const result = await parseTimetableText(sampleTimetable);
    
    // Count classes
    let totalClasses = 0;
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        totalClasses += result.classes[day][period].length;
      }
    }
    
    console.log(`\n✅ Parser extracted ${totalClasses} classes from tab-delimited timetable`);
    
    if (totalClasses > 0) {
      // Show an example class
      const firstDay = Object.keys(result.classes)[0];
      const firstPeriod = Object.keys(result.classes[firstDay])[0];
      const firstClass = result.classes[firstDay][firstPeriod][0];
      
      console.log("\nExample class from parsed data:");
      console.log(`Day: ${firstDay}`);
      console.log(`Period: ${firstPeriod}`);
      console.log(`Subject: ${firstClass.subject}`);
      console.log(`Code: ${firstClass.code}`);
      console.log(`Room: ${firstClass.room}`);
      console.log(`Teacher: ${firstClass.teacher}`);
      
      return result;
    } else {
      console.log("\n❌ No classes found in parsed result");
      return null;
    }
  } catch (error) {
    console.error("\n❌ Error running test:", error);
  }
}

runTest();
EOF

# Step 4: Run the test
echo "Running the test..."
echo 
node test-tab-delimited.js

# Step 5: Restore the original file (commented out for now)
# echo "Restoring original aiParserService.js..."
# cp src/services/aiParserService.js.backup src/services/aiParserService.js

echo 
echo "=== Test completed ==="
echo "To make the changes permanent, keep the updated file."
echo "To revert to the original, run: cp src/services/aiParserService.js.backup src/services/aiParserService.js"
