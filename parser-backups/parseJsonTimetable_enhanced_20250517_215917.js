// Function to pre-process JSON text to fix common syntax issues
/**
 * Pre-processes JSON text to fix common syntax issues
 * @param {string} text - The text to preprocess
 * @returns {string} - Preprocessed text with fixed common issues
 */
const preprocessJsonText = (text) => {
    if (!text) return text;
    
    let processed = text;
    
    // Remove any HTML or XML-like tags that might be present
    processed = processed.replace(/<\/?[^>]+(>|$)/g, "");
    
    // Remove markdown code block syntax
    processed = processed.replace(/```(?:json|javascript|js)?\s*|\s*```/g, "");
    
    // Fix trailing commas in arrays or objects which are invalid in JSON
    processed = processed.replace(/,(\s*[\]}])/g, "$1");
    
    // Fix unquoted property names
    processed = processed.replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Fix single-quoted strings to double-quoted strings
    // This is more complex and can have edge cases, but this simple version handles most cases
    const singleQuoteRegex = /'([^'\\]*(\\.[^'\\]*)*)'(?=\s*[:,}\]])/g;
    processed = processed.replace(singleQuoteRegex, '"$1"');
    
    // Fix missing quotes around string literals in property values
    // Careful! This can break valid JSON if applied incorrectly
    // processed = processed.replace(/:\s*([a-zA-Z0-9_]+)(\s*[,\}])/g, ':"$1"$2');
    
    console.log("Preprocessed JSON text");
    return processed;
};

/**
 * Enhanced JSON Timetable Parser
 * 
 * This parser is designed to handle various JSON formats and potential issues that may arise
 * when parsing timetable data, especially from AI outputs like Gemini or DeepSeek.
 * 
 * Features:
 * - Handles markdown code blocks
 * - Extracts JSON from surrounding text
 * - Attempts repair of malformed JSON
 * - Converts singular key names (day/period/class) to plural (days/periods/classes)
 * - Provides detailed error messages and diagnostics
 * - Multiple fallback parsing strategies
 * 
 * Error cases handled:
 * - Unparseable JSON
 * - Missing or invalid JSON structure
 * - Key name inconsistencies
 * - Markdown formatting
 * - Unquoted property names
 * - Single quoted strings
 * - Trailing commas
 * 
 * Last updated: May 17, 2025
 */
const parseJsonTimetable = (jsonText, setIsProcessing, setParseError) => {
    try {
        setIsProcessing(true);
        console.log("Attempting to parse JSON timetable. Text length:", jsonText ? jsonText.length : 0);
        
        if (!jsonText || typeof jsonText !== 'string' || jsonText.trim() === '') {
            throw new Error("Empty or invalid input provided");
        }
        
        // Check for markdown code blocks and extract them if present
        if (jsonText.includes('```')) {
            console.log("Detected markdown code blocks, extracting JSON content...");
            const codeBlockRegex = /```(?:json|javascript|js)?\s*([\s\S]*?)```/g;
            const match = codeBlockRegex.exec(jsonText);
            if (match && match[1]) {
                console.log("Extracted content from markdown code block");
                jsonText = match[1].trim();
            }
        }
        
        // Pre-process the text to fix common JSON syntax issues
        const preprocessedText = preprocessJsonText(jsonText);
        
        // Try to parse the JSON
        let parsedJson;
        
        // First try direct parsing in case it's already valid JSON
        try {
            parsedJson = JSON.parse(preprocessedText);
            console.log("Successfully parsed preprocessed JSON:", parsedJson);
        } catch (directError) {
            console.log("Direct JSON parsing failed, trying to extract JSON object...", directError);
            
            // Handle the case where preprocessed text still doesn't parse
            // The text was already preprocessed but we'll do additional cleaning
            let cleanedText = preprocessedText.trim();
            
            console.log("Cleaned text:", cleanedText.substring(0, 100) + "...");
            
            // Try multiple pattern matching approaches
            let jsonString = null;
            
            // Approach 1: Find text between { and the last }
            const objectMatch = cleanedText.match(/(\{[\s\S]*\})/);
            if (objectMatch) {
                jsonString = objectMatch[0];
                console.log("Found JSON object pattern");
            } 
            
            // Approach 2: If we couldn't find a match, look for any JSON-like structure
            if (!jsonString) {
                // Try to find anything that looks like a JSON object or array
                const possibleMatch = cleanedText.match(/[\{\[][\s\S]*[\}\]]/);
                if (possibleMatch) {
                    jsonString = possibleMatch[0];
                    console.log("Found alternative JSON-like pattern");
                }
            }
            
            // Approach 3: Try to extract the largest subset of valid JSON
            if (!jsonString) {
                console.log("Attempting to find valid JSON subset...");
                // Start with the opening brace and try to find balanced closing
                const openBraceIndex = cleanedText.indexOf('{');
                if (openBraceIndex !== -1) {
                    let depth = 1;
                    let closeBraceIndex = -1;
                    
                    // Find matching closing brace
                    for (let i = openBraceIndex + 1; i < cleanedText.length; i++) {
                        if (cleanedText[i] === '{') depth++;
                        else if (cleanedText[i] === '}') {
                            depth--;
                            if (depth === 0) {
                                closeBraceIndex = i;
                                break;
                            }
                        }
                    }
                    
                    if (closeBraceIndex !== -1) {
                        jsonString = cleanedText.substring(openBraceIndex, closeBraceIndex + 1);
                        console.log("Extracted balanced JSON subset");
                    }
                }
            }
            
            // Add a final attempt with aggressive JSON repair
            if (!jsonString) {
                console.log("Attempting aggressive JSON repair...");
                try {
                    const repairedJson = attemptJsonRepair(cleanedText);
                    if (repairedJson) {
                        parsedJson = repairedJson;
                        console.log("Successfully repaired severely damaged JSON");
                        // Skip the remaining parsing since we've successfully repaired
                        return parsedJson;
                    }
                } catch (repairError) {
                    console.error("JSON repair failed:", repairError);
                }
            }
            
            if (jsonString) {
                console.log("Attempting to parse extracted JSON:", jsonString.substring(0, 100) + "...");
                try {
                    parsedJson = JSON.parse(jsonString);
                    console.log("Successfully parsed extracted JSON");
                } catch (extractError) {
                    console.error("Error parsing extracted JSON:", extractError);
                    throw new Error("Found JSON-like content but couldn't parse it: " + extractError.message);
                }
            } else {
                // Final attempt: Try wrapping text in braces or other approaches
                try {
                    if (!cleanedText.startsWith('{') && !cleanedText.includes('days') && !cleanedText.includes('periods')) {
                        // Text might be missing the outer braces
                        const wrappedJson = `{${cleanedText}}`;
                        parsedJson = JSON.parse(wrappedJson);
                        console.log("Successfully parsed by adding outer braces");
                    } else {
                        throw new Error("Not a valid JSON structure even with wrapping");
                    }
                } catch (finalError) {
                    console.error("Final parsing attempt failed:", finalError);
                    throw new Error("No JSON object found in the text");
                }
            }
        }
        
        // Special check for key name discrepancies which happen with some AI models
        if (parsedJson) {
            // Sometimes Gemini or other models return day/period/class (singular) instead of days/periods/classes (plural)
            if (!parsedJson.days && parsedJson.day) {
                console.log("Converting 'day' to 'days'");
                parsedJson.days = parsedJson.day;
                delete parsedJson.day;
            }
            
            if (!parsedJson.periods && parsedJson.period) {
                console.log("Converting 'period' to 'periods'");
                parsedJson.periods = parsedJson.period;
                delete parsedJson.period;
            }
            
            if (!parsedJson.classes && parsedJson.class) {
                console.log("Converting 'class' to 'classes'");
                parsedJson.classes = parsedJson.class;
                delete parsedJson.class;
            }
        }
        
        // Validate the JSON structure
        if (!parsedJson.days || !Array.isArray(parsedJson.days) || parsedJson.days.length === 0) {
            console.error("Invalid JSON structure - missing days array:", parsedJson);
            setParseError("Invalid JSON structure: 'days' array is missing or empty");
            setIsProcessing(false);
            return null;
        }
        
        if (!parsedJson.periods || !Array.isArray(parsedJson.periods) || parsedJson.periods.length === 0) {
            console.error("Invalid JSON structure - missing periods array:", parsedJson);
            setParseError("Invalid JSON structure: 'periods' array is missing or empty");
            setIsProcessing(false);
            return null;
        }
        
        if (!parsedJson.classes || typeof parsedJson.classes !== 'object') {
            console.error("Invalid JSON structure - missing classes object:", parsedJson);
            setParseError("Invalid JSON structure: 'classes' object is missing");
            setIsProcessing(false);
            return null;
        }
        
        // Verify each day has class data
        const dayErrors = [];
        for (const day of parsedJson.days) {
            if (!parsedJson.classes[day]) {
                dayErrors.push(day);
            }
        }
        
        if (dayErrors.length > 0) {
            console.error(`Invalid JSON structure: No class data for days: ${dayErrors.join(', ')}`);
            setParseError(`Invalid JSON structure: No class data for days: ${dayErrors.join(', ')}`);
            setIsProcessing(false);
            return null;
        }
        
        console.log("JSON validation passed, returning parsed data:", parsedJson);
        setIsProcessing(false);
        return parsedJson;
    } catch (error) {
        console.error('Error parsing JSON timetable data:', error);
        
        // More detailed error message with helpful suggestions
        let errorMessage = "Failed to parse JSON: " + error.message;
        
        // Add specific suggestions based on the error
        if (error.message.includes("Unexpected token")) {
            errorMessage += ". The text contains invalid characters for JSON. Try using the AI Parser tab instead.";
        } else if (error.message.includes("No JSON object found")) {
            errorMessage += ". Make sure you're pasting valid JSON data. If you have plain text timetable data, use the AI Parser tab instead.";
        } else if (error.message.includes("Found JSON-like content")) {
            errorMessage += ". The content appears to be JSON but has syntax errors. You might need to fix the format or use the AI Parser tab instead.";
        } else if (error.message.includes("Unexpected end of JSON input")) {
            errorMessage += ". The JSON data appears to be incomplete. Please check that you've copied the entire JSON content.";
        } else {
            errorMessage += ". Make sure you're pasting valid JSON data.";
        }
        
        // Log detailed diagnostic information to help debug the issue
        console.log("JSON parse error details:", {
            errorMessage: error.message,
            textType: typeof jsonText,
            textLength: jsonText ? jsonText.length : 0,
            textPreview: jsonText ? jsonText.substring(0, 200) + '...' : 'undefined',
            startsWithBrace: jsonText && jsonText.trim().startsWith('{'),
            endsWithBrace: jsonText && jsonText.trim().endsWith('}'),
            containsBraces: jsonText && jsonText.includes('{') && jsonText.includes('}')
        });
        
        setParseError(errorMessage);
        
        // If we have direct action the user can take, suggest it
        if (jsonText && jsonText.includes('"day":') && !jsonText.includes('"days":')) {
            console.warn("Detected 'day' instead of 'days' - this might be an AI response format issue");
            setParseError(errorMessage + " Detected singular key names (e.g., 'day' instead of 'days'). Try using the AI Parser tab instead.");
        } else if (jsonText && jsonText.includes('```')) {
            setParseError(errorMessage + " Detected markdown code blocks in the input. Please remove these before pasting.");
        }
        
        setIsProcessing(false);
        return null;
    }
};

/**
 * Attempts to repair severely damaged JSON 
 * @param {string} text - The potentially damaged JSON text
 * @returns {object|null} - The repaired JSON object or null if repair failed
 */
const attemptJsonRepair = (text) => {
    if (!text) return null;
    
    try {
        // Check if there are any braces at all
        if (!text.includes('{') || !text.includes('}')) {
            return null;
        }
        
        // Create a skeleton of valid timetable JSON structure
        const template = {
            days: [],
            periods: [],
            classes: {}
        };
        
        // Try to extract days
        const daysMatch = text.match(/days["']?\s*:?\s*\[(.*?)\]/s);
        if (daysMatch && daysMatch[1]) {
            // Extract what looks like an array of day strings
            const dayItems = daysMatch[1].match(/["']([^"']+)["']/g);
            if (dayItems) {
                template.days = dayItems.map(day => day.replace(/["']/g, ''));
            }
        }
        
        // Try to extract periods
        const periodsMatch = text.match(/periods["']?\s*:?\s*\[(.*?)\]/s);
        if (periodsMatch && periodsMatch[1]) {
            // This is more complex, just try to make something workable
            const periodObjects = periodsMatch[1].match(/\{[^{}]*\}/g);
            if (periodObjects) {
                periodObjects.forEach((periodObj, index) => {
                    try {
                        // Try to make it valid JSON by fixing common issues
                        let fixedPeriodObj = periodObj
                            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
                            .replace(/'/g, '"'); // Replace single quotes with double quotes
                        
                        const period = JSON.parse(fixedPeriodObj);
                        template.periods.push(period);
                    } catch (e) {
                        // If parsing fails, create a default period entry
                        template.periods.push({
                            name: `Period ${index + 1}`,
                            startTime: "",
                            endTime: ""
                        });
                    }
                });
            }
        }
        
        // Try to extract classes structure
        // This is the most complex part and hard to repair generically
        // We'll just create a minimal structure based on detected days
        if (template.days.length > 0) {
            template.days.forEach(day => {
                template.classes[day] = {};
                if (template.periods.length > 0) {
                    template.periods.forEach(period => {
                        template.classes[day][period.name] = [];
                    });
                }
            });
        }
        
        // If we have at least days and periods, return the template
        if (template.days.length > 0 && template.periods.length > 0) {
            return template;
        }
        
        return null;
    } catch (error) {
        console.error("JSON repair attempt failed:", error);
        return null;
    }
};

export default parseJsonTimetable;
