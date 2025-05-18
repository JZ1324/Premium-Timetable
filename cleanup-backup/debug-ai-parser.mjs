/**
 * Comprehensive test for AI Parser errors
 * This script tests various aspects of the API error handling in aiParserService.js
 */

// Use native Node.js modules for network requests
const https = require('https');
const fs = require('fs');
const path = require('path');

// Mock window object for browser compatibility
global.window = {
  location: {
    origin: 'https://premium-timetable.app'
  }
};

// Import the service
// Use dynamic import to handle ES modules in CommonJS
(async () => {
  try {
    // Dynamically import the ES module
    const { default: aiParserService, parseTimetableText, fallbackParser } = await import('./src/services/aiParserService.js');

    console.log('=== AI PARSER DEBUG TEST ===');
    console.log('Testing the aiParserService.js API error handling');

    // Sample test data
    const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5
Period 1
8:35am–9:35am
Mathematics\tScience\tEnglish\tHistory\tGeography
(MATH101)\t(SCI102)\t(ENG103)\t(HIST104)\t(GEO105)
Room A1\tRoom B2\tRoom C3\tRoom D4\tRoom E5`;

    console.log('\n1. Testing direct parser with sample data:');
    try {
      const directResult = fallbackParser(sampleTimetable);
      console.log(`Direct parsing result - found classes: ${countClasses(directResult)}`);
    } catch (error) {
      console.error('Direct parsing failed with error:', error.message);
    }

    console.log('\n2. Testing AI parser (will likely throw error but should NOT return mock data):');
    try {
      const aiResult = await parseTimetableText(sampleTimetable);
      console.log(`AI parsing result - found classes: ${countClasses(aiResult)}`);
      
      if (aiResult.usingMockData) {
        console.error('❌ Test FAILED: Parser is still using mock data');
        console.log(`Mock data reason: ${aiResult.apiErrorMessage || 'Unknown'}`);
      } else {
        console.log('✅ Test PASSED: Parser correctly processed data without using mock data');
      }
    } catch (error) {
      console.log('✅ Expected error thrown (this is good):', error.message);
      console.log('✅ Test passed - error was correctly thrown instead of returning mock data');
    }

    // Helper to count classes in a timetable object
    function countClasses(timetable) {
      if (!timetable || !timetable.classes) return 0;
      
      let totalClasses = 0;
      for (const day in timetable.classes) {
        for (const period in timetable.classes[day]) {
          totalClasses += timetable.classes[day][period].length;
        }
      }
      return totalClasses;
    }

  } catch (importError) {
    console.error('Failed to import AI parser service:', importError);
  }
})();
