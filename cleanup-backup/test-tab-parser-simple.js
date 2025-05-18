/**
 * Simple Test for Tab-Delimited Parser Enhancement
 */

// Import the necessary modules
const aiParserService = require('./src/services/aiParserService').default;

// Sample tab-delimited timetable data
const sampleData = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:35am-9:35am
Math\tEnglish\tScience\tHistory\tArt
(10MAT)\t(10ENG)\t(10SCI)\t(10HIS)\t(10ART)
Room 1\tRoom 2\tRoom 3\tRoom 4\tRoom 5
Mr. Smith\tMs. Johnson\tDr. Lee\tMrs. Brown\tMr. Wilson

Period 2
9:40am-10:40am
English\tMath\tHistory\tScience\tPE
(10ENG)\t(10MAT)\t(10HIS)\t(10SCI)\t(10PE)
Room 2\tRoom 1\tRoom 4\tRoom 3\tGym
Ms. Johnson\tMr. Smith\tMrs. Brown\tDr. Lee\tMs. Davis`;

// Run format analysis test
console.log("Testing tab-delimited format analysis...");
const formatResult = aiParserService.analyzeTimetableFormat(sampleData);
console.log("Format analysis result:");
console.log(JSON.stringify(formatResult, null, 2));

// Test tab-delimited prompt construction
console.log("\nTesting tab-delimited prompt construction...");
const prompt = aiParserService.constructTabDelimitedPrompt(sampleData);
console.log(`Generated prompt (${prompt.length} chars)`);
console.log("First 100 chars:", prompt.substring(0, 100) + "...");

console.log("\nTest completed successfully!");
