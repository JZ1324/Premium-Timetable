const fs = require("fs");
const path = require("path");

// Path to the source and destination files
const sourcePath = path.join(__dirname, "src/services/aiParserService.js");
const fixedPath = path.join(__dirname, "src/services/aiParserService.js.fixed");

// Read the file content
let content = fs.readFileSync(sourcePath, "utf8");

// Fix 1: Remove the stray semicolon after closing brace
content = content.replace(/}\s*;(\s*)

\/\*\*\s*
 \* Helper function to redistribute classes/g, "}

/**
 * Helper function to redistribute classes");

// Write the fixed content to the destination file
fs.writeFileSync(fixedPath, content);

console.log("Created fixed file at: " + fixedPath);
