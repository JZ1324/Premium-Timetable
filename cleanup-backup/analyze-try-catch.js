// This script finds try blocks without matching catch blocks
const fs = require('fs');

// Read the file
const filePath = 'src/services/aiParserService.js';
console.log(`Reading ${filePath}...`);
const content = fs.readFileSync(filePath, 'utf8');

// Split into lines for analysis
const lines = content.split('\n');

// Track try/catch blocks
let tryStack = [];
let tryLocations = [];
let errors = [];

// Process line by line to find try/catch blocks
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Look for try blocks
    if (line.match(/\btry\s*{/)) {
        tryStack.push(lineNum);
        tryLocations.push({ line: lineNum, content: line.trim() });
    }
    
    // Look for catch blocks
    if (line.match(/\bcatch\s*\(/)) {
        if (tryStack.length > 0) {
            tryStack.pop(); // Match with the most recent try
        } else {
            errors.push({ line: lineNum, type: 'catch', message: 'Catch without matching try' });
        }
    }
}

// Any remaining try blocks don't have matching catch blocks
if (tryStack.length > 0) {
    tryStack.forEach(tryLine => {
        errors.push({ 
            line: tryLine, 
            type: 'try', 
            message: 'Try without matching catch',
            content: tryLocations.find(loc => loc.line === tryLine)?.content
        });
    });
}

// Report findings
console.log("Analysis Complete");
console.log("-----------------");
console.log(`Total try blocks: ${tryLocations.length}`);
console.log(`Unmatched try/catch blocks: ${errors.length}`);

if (errors.length > 0) {
    console.log("\nIssues Found:");
    errors.forEach(error => {
        console.log(`Line ${error.line}: ${error.message}`);
        if (error.content) {
            console.log(`  > ${error.content}`);
        }
        
        // Show context (5 lines before and after)
        console.log("\nContext:");
        const startLine = Math.max(0, error.line - 6);
        const endLine = Math.min(lines.length - 1, error.line + 4);
        
        for (let i = startLine; i <= endLine; i++) {
            const prefix = i === error.line - 1 ? "==>" : "   ";
            console.log(`${prefix} ${i + 1}: ${lines[i].trim()}`);
        }
        console.log("");
    });
    
    // Provide fix suggestions
    console.log("\nFix Suggestions:");
    errors.forEach(error => {
        if (error.type === 'try') {
            console.log(`Line ${error.line}: Add a catch block OR remove the try block`);
        } else {
            console.log(`Line ${error.line}: Add a try block OR remove the catch block`);
        }
    });
} else {
    console.log("\n✅ All try blocks have matching catch blocks!");
}
