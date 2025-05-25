/**
 * EnglishTruncationFix.js
 * 
 * This module provides specialized handling for the "English" class truncation 
 * pattern that occurs in Gemini 2.0 Flash responses around position 10982.
 * 
 * The specific pattern is when the JSON response is cut off after:
 * "subject": "English", "code": "(10EN
 */

/**
 * Attempts to repair JSON content that has been truncated specifically in an English class definition
 * @param {string} jsonContent - The truncated JSON content
 * @param {number} approxErrorPosition - Approximate position where truncation occurred (if known)
 * @returns {string} The repaired JSON string
 */
function fixEnglishTruncation(jsonContent, approxErrorPosition = 0) {
  console.log("Attempting specialized English class truncation fix");

  // Match the specific English truncation patterns
  const truncationPattern = jsonContent.match(/\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/);
  
  if (!truncationPattern) {
    // Try alternative pattern without the problematic parenthesis
    const altPattern = jsonContent.match(/\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"/);
    if (!altPattern) {
      console.log("English truncation pattern not found, skipping specialized fix");
      return jsonContent;
    }
  }
  
  console.log("Found English class truncation pattern, applying fix");

  // Determine where to cut the JSON to remove the truncated entry
  const truncationPos = jsonContent.lastIndexOf('"subject": "English"');
  if (truncationPos <= 0) {
    console.log("Could not locate English truncation position");
    return jsonContent;
  }

  // Find the containing array for this truncated entry
  let lastArrayOpen = jsonContent.lastIndexOf('[', truncationPos);
  let lastObjectOpen = jsonContent.lastIndexOf('{', truncationPos);
  
  // We need to find the immediate containing object for the English class
  if (lastObjectOpen < 0 || lastArrayOpen < 0) {
    console.log("Could not locate containing structures for truncated English entry");
    return jsonContent;
  }
  
  // If the object opening brace comes after the array opening bracket,
  // then this object is inside the array and is our target
  const isObjectInArray = lastObjectOpen > lastArrayOpen;
  
  if (isObjectInArray) {
    // Find where the object containing the truncated entry began
    const objectStart = lastObjectOpen;
    
    // Cut off at array opening, and close the array
    const fixedJson = jsonContent.substring(0, lastArrayOpen + 1) + ']';
    
    // Now we need to find what period this array belongs to, and close its parent structures
    const periodMatch = jsonContent.substring(0, lastArrayOpen).match(/\"(Period \d+|Tutorial)\"\s*:/);
    
    if (periodMatch) {
      // Try to find the day this period belongs to
      const dayMatch = jsonContent.substring(0, lastArrayOpen).match(/\"(Day \d+)\"\s*:/g);
      
      if (dayMatch && dayMatch.length > 0) {
        const lastDay = dayMatch[dayMatch.length - 1];
        // Extract the day name from the match
        const dayName = lastDay.match(/\"(Day \d+)\"/)[1];
        
        console.log(`Identified truncation in ${periodMatch[1]} of ${dayName}`);
        
        // Check if we need to close the period object
        let closingStructure = '';
        if (jsonContent.indexOf('"' + periodMatch[1] + '"', lastArrayOpen) < 0) {
          // This is the last period in this day
          closingStructure += '}';
          
          // Check if we need to close the day object and classes object
          if (jsonContent.indexOf('"Day', lastArrayOpen) < 0) {
            // No more days after this, close the "classes" object too
            closingStructure += '}}';
          } else {
            // There are more days after this, just close this day
            closingStructure += ',';
          }
        }
        
        return fixedJson + closingStructure;
      }
    }
  }
  
  // Default: just remove the truncated entry by cutting at last valid nested structure
  // Look for the last valid class entry
  const lastValidClassEnd = jsonContent.lastIndexOf('"}', truncationPos);
  const lastValidArrayEnd = jsonContent.lastIndexOf(']', truncationPos);
  
  // Use the latest of these positions as our cut point
  const cutPoint = Math.max(lastValidClassEnd, lastValidArrayEnd);
  
  if (cutPoint > 0) {
    const partialJson = jsonContent.substring(0, cutPoint + 1);
    
    // Balance braces and structure
    const openBraces = (partialJson.match(/\{/g) || []).length;
    const closeBraces = (partialJson.match(/\}/g) || []).length;
    const openBrackets = (partialJson.match(/\[/g) || []).length;
    const closeBrackets = (partialJson.match(/\]/g) || []).length;
    
    let balancedJson = partialJson;
    
    // Close any open arrays first
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      balancedJson += ']';
    }
    
    // Then close any open objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      balancedJson += '}';
    }
    
    console.log("Applied English class truncation fix by removing incomplete entry");
    return balancedJson;
  }
  
  // If all else fails, return the original
  return jsonContent;
}

/**
 * A more thorough fix for English class truncation that occurs in Gemini responses
 * This function attempts to salvage the JSON by rebuilding the structure from extracted parts
 * 
 * @param {string} content - The original API response content
 * @param {number} errorPosition - Position where JSON parsing error occurred
 * @returns {object|null} - The fixed JSON object or null if repair failed
 */
function recoverFromEnglishTruncation(content, errorPosition) {
  // Ensure we're dealing with the right pattern first
  if (!content.includes('"subject": "English"') || 
      !content.match(/\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/) ||
      Math.abs(content.length - 10982) > 50) {
    return null;
  }
  
  console.log("Applying comprehensive English truncation recovery");
  
  try {
    // 1. Extract the days array
    const daysMatch = content.match(/\"days\"\s*:\s*\[([\s\S]*?)\]/);
    
    // 2. Extract the periods array
    const periodsMatch = content.match(/\"periods\"\s*:\s*\[([\s\S]*?)\]/);
    
    if (!daysMatch || !periodsMatch) {
      console.log("Failed to extract necessary structure components");
      return null;
    }
    
    // 3. Extract all complete day blocks
    const dayBlocksRegex = /\"Day \d+\"\s*:\s*\{[\s\S]*?}\s*(?=,\s*\"Day|$)/g;
    const dayBlocks = [];
    let match;
    
    while ((match = dayBlocksRegex.exec(content)) !== null) {
      // Only use day blocks that end well before the truncation
      if (match.index + match[0].length < errorPosition - 200) {
        dayBlocks.push(match[0]);
      }
    }
    
    // 4. Construct valid JSON with extracted parts
    let fixedJson = '{\n';
    fixedJson += daysMatch[0] + ',\n';
    fixedJson += periodsMatch[0] + ',\n';
    fixedJson += '"classes": {\n';
    
    // Add all complete day blocks
    dayBlocks.forEach((block, index) => {
      fixedJson += block;
      if (index < dayBlocks.length - 1) {
        fixedJson += ',\n';
      }
    });
    
    fixedJson += '\n}\n}';
    
    // 5. Try to parse the reconstructed JSON
    try {
      const parsedJson = JSON.parse(fixedJson);
      console.log("Successfully recovered from English truncation!");
      return parsedJson;
    } catch (err) {
      console.error("Reconstruction parse error:", err);
      
      // One more attempt: balance braces and brackets
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        let balancedJson = fixedJson;
        for (let i = 0; i < openBraces - closeBraces; i++) {
          balancedJson += '\n}';
        }
        
        try {
          const parsedJson = JSON.parse(balancedJson);
          console.log("Successfully recovered after balancing braces!");
          return parsedJson;
        } catch (finalErr) {
          console.error("All recovery attempts failed:", finalErr);
          return null;
        }
      }
    }
  } catch (e) {
    console.error("Error during English truncation recovery:", e);
    return null;
  }
  
  return null;
}

// Export the functions for ES modules
export { fixEnglishTruncation, recoverFromEnglishTruncation };

// Also add CommonJS export for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fixEnglishTruncation, recoverFromEnglishTruncation };
}
