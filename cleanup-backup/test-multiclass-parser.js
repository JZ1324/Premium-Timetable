/**
 * Command-line test runner for the AI parser with multiple classes per period
 * 
 * This script runs tests against the fallback parser to verify
 * that it correctly handles timetables with multiple classes per period.
 * 
 * Usage: node test-multiclass-parser.js
 */

// Set up path for ES module imports
require('@babel/register')({
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-class-properties'
  ]
});

// Import the test runner
const runFallbackParserTests = require('./src/tests/multiClassTestRunner').default;

// Run the tests
console.log("Premium Timetable - Multiple Classes Per Period Parser Test");
console.log("========================================================");
console.log("Testing the parser's ability to handle multiple classes per period");
console.log("");

runFallbackParserTests();
