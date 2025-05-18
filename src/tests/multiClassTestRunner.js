/**
 * Test runner for the AI parser with multiple classes per period
 */

import { parseTimetableWithChuteAI } from '../services/aiParserService';
import { 
  tabularMultiClassTest, 
  listingMultiClassTest, 
  complexMultiClassTest, 
  sharedClassesTest 
} from './multiClassTests';

/**
 * Run tests with the DeepSeek AI parser
 */
const runAiParserTests = async () => {
  console.log("Running OpenRouter DeepSeek AI parser tests for multiple classes per period...");
  
  // Test 1: Tabular format
  console.log("\nTest 1: Tabular Format with Multiple Classes");
  try {
    const result1 = await parseTimetableWithChuteAI(tabularMultiClassTest);
    printClassStats(result1);
    console.log("Test 1 completed successfully");
  } catch (error) {
    console.error("Test 1 failed:", error);
  }
  
  // Test 2: Listing format
  console.log("\nTest 2: Listing Format with Multiple Classes");
  try {
    const result2 = await parseTimetableWithChuteAI(listingMultiClassTest);
    printClassStats(result2);
    console.log("Test 2 completed successfully");
  } catch (error) {
    console.error("Test 2 failed:", error);
  }
  
  // Test 3: Complex format
  console.log("\nTest 3: Complex Format with Multiple Classes");
  try {
    const result3 = await parseTimetableWithChuteAI(complexMultiClassTest);
    printClassStats(result3);
    console.log("Test 3 completed successfully");
  } catch (error) {
    console.error("Test 3 failed:", error);
  }
  
  // Test 4: Shared classes format
  console.log("\nTest 4: Shared Classes Format");
  try {
    const result4 = await parseTimetableWithChuteAI(sharedClassesTest);
    printClassStats(result4);
    console.log("Test 4 completed successfully");
  } catch (error) {
    console.error("Test 4 failed:", error);
  }
  
  console.log("\nAll fallback parser tests completed.");
};

/**
 * Helper to print statistics about the parsed classes
 */
const printClassStats = (result) => {
  if (!result || !result.classes) {
    console.log("No valid result to print stats for");
    return;
  }
  
  const stats = {
    totalClasses: 0,
    classesByDay: {},
    periodsWithMultipleClasses: 0,
    maxClassesInPeriod: 0
  };
  
  // Calculate statistics
  Object.keys(result.classes).forEach(day => {
    stats.classesByDay[day] = 0;
    
    if (result.classes[day]) {
      Object.keys(result.classes[day]).forEach(period => {
        const classes = result.classes[day][period];
        if (Array.isArray(classes)) {
          stats.totalClasses += classes.length;
          stats.classesByDay[day] += classes.length;
          
          if (classes.length > 1) {
            stats.periodsWithMultipleClasses++;
            stats.maxClassesInPeriod = Math.max(stats.maxClassesInPeriod, classes.length);
          }
        }
      });
    }
  });
  
  // Print statistics
  console.log("--- Parsing Statistics ---");
  console.log(`Total classes parsed: ${stats.totalClasses}`);
  console.log(`Classes by day: ${JSON.stringify(stats.classesByDay)}`);
  console.log(`Periods with multiple classes: ${stats.periodsWithMultipleClasses}`);
  console.log(`Maximum classes in a single period: ${stats.maxClassesInPeriod}`);
  
  // Print example of a period with multiple classes (if any)
  if (stats.periodsWithMultipleClasses > 0) {
    let exampleFound = false;
    
    outerLoop:
    for (const day of Object.keys(result.classes)) {
      for (const period of Object.keys(result.classes[day] || {})) {
        const classes = result.classes[day][period];
        if (Array.isArray(classes) && classes.length > 1) {
          console.log(`\nExample multiple classes in ${day} ${period}:`);
          classes.forEach((cls, i) => {
            console.log(`  Class ${i+1}: ${cls.subject} (${cls.room || 'No room'}, ${cls.teacher || 'No teacher'})`);
          });
          exampleFound = true;
          break outerLoop;
        }
      }
    }
    
    if (!exampleFound) {
      console.log("No example of multiple classes found despite count > 0 (possible error)");
    }
  }
};

// Export the test runner
export default runAiParserTests;
