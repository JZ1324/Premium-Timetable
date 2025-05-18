// Import the English truncation fix utility
// Using dynamic import pattern to ensure compatibility
let fixEnglishTruncation, recoverFromEnglishTruncation;
try {
  // Try ES Module import first
  const EnglishFix = require('../utils/EnglishTruncationFix');
  fixEnglishTruncation = EnglishFix.fixEnglishTruncation;
  recoverFromEnglishTruncation = EnglishFix.recoverFromEnglishTruncation;
} catch (e) {
  console.warn("ES Module import failed, trying alternative import", e);
  // Try alternate import path (root directory)
  try {
    const EnglishFix = require('../../EnglishTruncationFix');
    fixEnglishTruncation = EnglishFix.fixEnglishTruncation;
    recoverFromEnglishTruncation = EnglishFix.recoverFromEnglishTruncation;
  } catch (e2) {
    console.error("All English truncation fix imports failed:", e2);
    // Provide fallback empty functions
    fixEnglishTruncation = (json) => json;
    recoverFromEnglishTruncation = () => null;
  }
}

// Multiple API keys for token limit management
const API_KEYS = [
  "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", // Primary key
  "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", // Second backup key
  "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", // Third backup key for additional reliability
  "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"  // Fourth backup key for increased reliability
];
let currentKeyIndex = 0; // Start with the first key
// Track which keys have been exhausted in this session to prevent useless retries
const exhaustedKeys = new Set();

// Using Gemini 2.0 Flash exclusively for improved consistency
const MODELS = [
  "google/gemini-2.0-flash-exp:free" // Primary model - Gemini 2.0 Flash
];
let currentModelIndex = 0; // Stay with the only model
// Track which models have failed in the current parsing attempt (kept for compatibility)
const failedModels = new Set();

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Provider: chute (using Gemini 2.0 Flash model via OpenRouter)
async function parseTimetableWithChuteAI(timetableText) {
  // Reset failed models set at the start of each new parsing attempt
  failedModels.clear();
  
  // Select the best available API key (non-exhausted if possible)
  if (exhaustedKeys.size > 0 && exhaustedKeys.size < API_KEYS.length) {
    // Find first non-exhausted key
    for (let i = 0; i < API_KEYS.length; i++) {
      if (!exhaustedKeys.has(i)) {
        currentKeyIndex = i;
        console.log(`Starting with non-exhausted API key #${i + 1}`);
        break;
      }
    }
  }
  
  const prompt = `You are an expert at extracting structured timetable data.

I will give you a school timetable in grid format (each column is a day, each row is a period). Convert it into this exact JSON format:

{
  "days": [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Tutorial", "startTime": "10:45am", "endTime": "11:20am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
 "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Specialist Mathematics",
          "code": "10SPE251101",
          "room": "M 07",
          "teacher": "Mr Paul Jefimenko",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [
        {
          "subject": "Biology Units 1 & 2",
          "code": "11BIO251101",
          "room": "S 06",
          "teacher": "Mr Andrew Savage",
          "startTime": "9:40am",
          "endTime": "10:40am"
        }
      ],
    ...
    "Day 10": {
      ...
    }
  }
}

⚠️ DO NOT group all Period 1 classes from all days under "Period 1" in one place. That is incorrect.

⚠️ IMPORTANT: Make sure to include Tutorial classes in each day (typically between Period 2 and Period 3).
Tutorial times are typically 10:45am-11:20am. Include Tutorial exactly like other periods.

✅ Instead, for each day, create a separate structure like:
"Day 1" → contains "Period 1" to "Period 5"
"Day 2" → contains "Period 1" to "Period 5"
...
"Day 10" → contains "Period 1" to "Period 5"

Each "Period" entry must include:
- "subject"
- "code"
- "room"
- "teacher"
- "startTime"
- "endTime"

If any period has no class, just leave it as an empty array (e.g., "Period 3": []).

Return only valid JSON. No markdown. No explanation.`;

  try {
    // Function to make a request with a specific API key and model
    async function makeRequest(keyIndex, modelIndex) {
      const apiKey = API_KEYS[keyIndex];
      const model = MODELS[modelIndex];
      console.log(`Sending request to OpenRouter API using model: ${model} (API Key ${keyIndex + 1})`);

      // Format request body based on model requirements
      const requestBody = {
        "model": model,
        "messages": [
          {
            "role": "system",
            "content": "You are a timetable parsing expert that always returns valid JSON data."
          },
          {
            "role": "user",
            "content": prompt + "\n\n" + timetableText
          }
        ],
        "response_format": { "type": "json_object" },
        "max_tokens": 4000,
        "temperature": 0.1
      };

      // Log the request for debugging
      console.log("Request body:", JSON.stringify(requestBody).substring(0, 500) + "...");

      return await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://timetable-premium.vercel.app", 
          "X-Title": "Premium Timetable App", 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
    }

    // Try with the current API key and model
    let response = await makeRequest(currentKeyIndex, currentModelIndex);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API request failed:", response.status, errorBody);
      
      // Strategy: first try different models with same key, then try different keys
      let shouldRetry = false;
      let nextModelIndex = currentModelIndex;
      let nextKeyIndex = currentKeyIndex;
      
      // Check if this is a model-specific issue (provider error)
      if (errorBody.includes("Provider returned error") || 
          errorBody.includes("provider") || 
          errorBody.includes("model") ||
          errorBody.includes("unavailable") ||
          errorBody.includes("error code")) {
        
        // Log the provider error
        console.log(`Provider error detected with Gemini 2.0 Flash. Will try again with a different API key.`);
        
        // Since we only have one model, we'll try with a different API key if available
        if (currentKeyIndex < API_KEYS.length - 1) {
          nextKeyIndex = currentKeyIndex + 1;
          console.log(`Trying Gemini 2.0 Flash with a different API key (#${nextKeyIndex + 1})`);
          shouldRetry = true;
        }
      }
      // Enhanced token limit detection and handling
      else if ((errorBody.includes("limit") || 
                errorBody.includes("quota") || 
                errorBody.includes("token") ||
                errorBody.includes("rate") ||
                errorBody.includes("exceeded") ||
                errorBody.includes("free tier") ||
                errorBody.includes("capacity") ||
                response.status === 429)) {
                
        // Mark current key as exhausted
        exhaustedKeys.add(currentKeyIndex);
        console.log(`API token/rate limit detected (status: ${response.status}), marking key #${currentKeyIndex + 1} as exhausted`);
        
        // Find next non-exhausted key if available
        let foundNonExhausted = false;
        for (let i = 0; i < API_KEYS.length; i++) {
          if (!exhaustedKeys.has(i)) {
            nextKeyIndex = i;
            foundNonExhausted = true;
            console.log(`Switching to non-exhausted API key #${i + 1}`);
            shouldRetry = true;
            break;
          }
        }
        
        // Since we only have one model, we only need to report if all keys are exhausted
        if (!foundNonExhausted) {
          console.log(`All API keys exhausted. Cannot proceed with Gemini 2.0 Flash.`);
        }
      }
      
      // If either key or model should be changed, retry
      if (shouldRetry) {
        currentModelIndex = nextModelIndex;
        currentKeyIndex = nextKeyIndex;
        
        console.log(`Retrying with model: ${MODELS[currentModelIndex]} and key #${currentKeyIndex + 1}`);
        response = await makeRequest(currentKeyIndex, currentModelIndex);
        
        // If still not ok, try one more permutation before giving up
        if (!response.ok) {
          const secondErrorBody = await response.text();
          console.error("API request failed on retry:", response.status, secondErrorBody);
          
          // One last attempt - try with a different key if we haven't already tried all keys
          if (nextKeyIndex === currentKeyIndex && currentKeyIndex < API_KEYS.length - 1) {
            currentKeyIndex++;
            console.log(`Final attempt with Gemini 2.0 Flash and key #${currentKeyIndex + 1}`);
            response = await makeRequest(currentKeyIndex, currentModelIndex);
          }
          
          if (!response.ok) {
            const finalErrorBody = await response.text();
            throw new Error(`API request failed with all attempted combinations. Status: ${response.status}, Error: ${finalErrorBody}`);
          }
        }
      } else {
        // If we have no more models or keys to try, give up
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }
    }

    console.log("OpenRouter API response received");
    
    const data = await response.json();
    console.log("OpenRouter API raw response:", JSON.stringify(data));
    
    // Check for error in the API response
    if (data.error) {
      const errorMessage = typeof data.error === 'object' 
        ? (data.error.message || JSON.stringify(data.error)) 
        : data.error;
      console.error(`OpenRouter API returned an error:`, errorMessage);
      
      // Handle provider errors with Gemini
      if (errorMessage.includes("Provider returned error") || 
          errorMessage.includes("provider") || 
          errorMessage.includes("error code") ||
          errorMessage.includes("google/gemini") ||   // Specifically capture Gemini model errors
          errorMessage.includes("Model") || 
          errorMessage.includes("model")) {
        
        // With only one model option, we need to try different API keys
        if (currentKeyIndex < API_KEYS.length - 1) {
          // Try the next API key
          currentKeyIndex++;
          console.log(`Provider error detected with Gemini 2.0 Flash. Trying with API key #${currentKeyIndex + 1}`);
          
          // Recursive call with the same model but different key
          return parseTimetableWithChuteAI(timetableText);
        } else {
          console.log("All API keys tried with Gemini 2.0 Flash, but provider errors persist.");
        }
      }
      // Check if error is token/quota related
      else if ((errorMessage.includes("limit") || errorMessage.includes("quota") || errorMessage.includes("token")) && 
               currentKeyIndex < API_KEYS.length - 1) {
        // Try the next API key
        console.log(`API token limit reached in response, switching to backup API key ${currentKeyIndex + 2}`);
        currentKeyIndex++;
        
        // Recursive call with the next key
        return parseTimetableWithChuteAI(timetableText);
      }
      
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }
    
    let content = null;
    
    // Get content from the API response - handle different response structures
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      
      // Handle different response formats
      if (choice.message && choice.message.content) {
        content = choice.message.content;
      } else if (choice.text) {
        content = choice.text;
      } else if (choice.message && choice.message.tool_calls) {
        // Handle tool_calls format for some models
        const toolCall = choice.message.tool_calls.find(tc => tc.function && tc.function.arguments);
        if (toolCall) {
          content = toolCall.function.arguments;
        }
      }
    }
    
    if (!content) {
      console.error(`Unexpected API response structure:`, JSON.stringify(data).substring(0, 1000));
      throw new Error(`Unexpected API response structure. Could not find content in the response.`);
    }
    
    try {
      // Process the content to extract valid JSON
      let jsonContent = content.trim();
      
      // Remove any markdown code block markers if present
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      jsonContent = jsonContent.replace(/```javascript\s*/g, '').replace(/```\s*$/g, '');
      
      // Special fix for common truncation issues with Gemini models around position ~10982
      if (jsonContent.length > 10500 && jsonContent.length < 11500) {
        console.log("Response length in known truncation range (~10982), checking for truncation pattern");
        
        // Check for specific truncation patterns - enhanced for English subject pattern
        const endWithSubject = jsonContent.match(/\"subject\"\s*:\s*\"[^\"]*\"?,\s*\"code\"\s*:\s*\"[^\"]*$/);
        const endWithCode = jsonContent.match(/\"code\"\s*:\s*\"[^\"]*/); // Removed problematic parenthesis
        const truncatedEnglish = jsonContent.match(/\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*/); // Fixed pattern
        const exactTruncationLength = Math.abs(jsonContent.length - 10982) < 5; // Within 5 chars of exact truncation point
        
        // Enhanced pattern detection for the specific English class truncation - fix regex issues
        const englishPatterns = [
          /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/,  // Basic pattern without parenthesis
          /\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"10EN[^\"]*$/  // 10EN specific pattern
        ];
        const isEnglishTruncation = englishPatterns.some(pattern => pattern.test(jsonContent));
        
        // If any truncation pattern is detected
        if (endWithSubject || endWithCode || truncatedEnglish || exactTruncationLength || isEnglishTruncation) {
          console.log("Detected specific truncation pattern in class definition");
          
          // 1. Extract all completed day blocks first
          const completeDayBlocks = [];
          const dayBlockRegex = /\"Day \d+\"\s*:\s*\{[\s\S]*?\}\s*(?=,\s*\"Day|$)/g;
          let dayMatch;
          
          while ((dayMatch = dayBlockRegex.exec(jsonContent)) !== null) {
            if (dayMatch.index + dayMatch[0].length < jsonContent.length - 100) {
              // Only use day blocks that are well before the truncation point
              completeDayBlocks.push(dayMatch[0]);
            }
          }
          
          if (completeDayBlocks.length > 0) {
            console.log(`Found ${completeDayBlocks.length} complete day blocks before truncation point`);
            
            // Extract days and periods sections
            const daysMatch = jsonContent.match(/\"days\"\s*:\s*\[[\s\S]*?\]/);
            const periodsMatch = jsonContent.match(/\"periods\"\s*:\s*\[[\s\S]*?\]/);
            
            if (daysMatch && periodsMatch) {
              // Rebuild a complete JSON with the extracted parts
              let fixedJson = '{\n';
              fixedJson += daysMatch[0] + ',\n';
              fixedJson += periodsMatch[0] + ',\n';
              fixedJson += '"classes": {\n';
              
              // Add each complete day block
              for (let i = 0; i < completeDayBlocks.length; i++) {
                fixedJson += completeDayBlocks[i];
                if (i < completeDayBlocks.length - 1) {
                  fixedJson += ',\n';
                }
              }
              
              fixedJson += '}\n}'; // Close classes and root object
              
              console.log(`Applied enhanced fix for Gemini truncation, reconstructed with ${completeDayBlocks.length} complete day blocks`);
              jsonContent = fixedJson;
              
              // Try to parse it immediately to validate our fix
              try {
                const testParse = JSON.parse(jsonContent);
                console.log("Successfully validated reconstructed JSON structure");
              } catch (validationError) {
                console.error("Validation of reconstructed JSON failed:", validationError);
                
                // Try one more cleanup pass if validation failed
                try {
                  // Count opening and closing braces to ensure balance
                  const openBraces = (jsonContent.match(/\{/g) || []).length;
                  const closeBraces = (jsonContent.match(/\}/g) || []).length;
                  
                  if (openBraces > closeBraces) {
                    // Add missing closing braces
                    for (let i = 0; i < openBraces - closeBraces; i++) {
                      jsonContent += '\n}';
                    }
                    console.log("Added missing closing braces to balance JSON structure");
                  }
                } catch (e) {
                  console.error("Failed to balance braces:", e);
                }
              }
              
              return; // Skip additional processing
            }
          } else {
            // Fallback: If we can't find complete day blocks, find the last complete period
            
            // Find the last complete class entry we can reliably use
            const lastCompleteClassPattern = /(\{\s*\"subject\".*?\}\s*\])/g;
            const matches = [...jsonContent.matchAll(lastCompleteClassPattern)];
            
            if (matches.length > 0) {
              // Get the position of the last complete class entry
              const lastMatchPos = matches[matches.length - 1].index + matches[matches.length - 1][0].length;
              
              // Find the last valid period section ending
              const periodSectionEnd = jsonContent.lastIndexOf(']', lastMatchPos);
              
              if (periodSectionEnd > 0) {
                // Cut off everything after the last complete period section
                let partialJson = jsonContent.substring(0, periodSectionEnd + 1) + '}';
                
                // Find the last complete day block
                const lastDayIndex = partialJson.lastIndexOf('"Day');
                if (lastDayIndex > 0) {
                  // Find the starting brace for this day block
                  const dayBlockStartIndex = partialJson.indexOf(':', lastDayIndex);
                  if (dayBlockStartIndex > 0) {
                    // Get everything before this day block
                    const beforeLastDay = partialJson.substring(0, dayBlockStartIndex + 1);
                    // Complete the JSON with minimal structure
                    partialJson = beforeLastDay + ' {}}}}';
                  }
                }
                
                // Validate and balance the JSON structure
                const openBraces = (partialJson.match(/\{/g) || []).length;
                const closeBraces = (partialJson.match(/\}/g) || []).length;
                
                if (openBraces > closeBraces) {
                  // Add missing closing braces
                  for (let i = 0; i < openBraces - closeBraces; i++) {
                    partialJson += '}';
                  }
                }
                
                console.log(`Applied emergency truncation fix, cut off at position ${periodSectionEnd}`);
                jsonContent = partialJson;
              }
            }
          }
        }
      }
      
      // If the content doesn't look like JSON, try to extract JSON
      if (!jsonContent.startsWith('{')) {
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        } else {
          throw new Error(`Could not extract JSON from response content: ${jsonContent.substring(0, 100)}...`);
        }
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.log("Attempting to clean and fix JSON...");
        
        // Store error details to guide reconstruction strategy
        const errorPos = parseError.message && parseError.message.match(/position (\d+)/);
        const errorPosition = errorPos ? parseInt(errorPos[1], 10) : -1;
        const errorMessage = parseError.message || "";
        
        // Special handling for the English class truncation pattern
        if (errorMessage.includes("Unterminated string") && 
            Math.abs(errorPosition - 10982) < 50 && // Within 50 chars of common truncation point
            jsonContent.includes('"subject": "English"')) {
          
          console.log("Detected potential English class truncation pattern at position ~10982");
          
          // Apply the specialized fix for English class truncation
          const fixedJson = fixEnglishTruncation(jsonContent, errorPosition);
          
          // Try to parse the fixed JSON
          try {
            const fixedResponse = JSON.parse(fixedJson);
            console.log("Successfully applied English truncation fix!");
            parsedResponse = fixedResponse;
            
            // Skip the rest of the error recovery logic
            const normalizedResponse = {
              days: parsedResponse.days || parsedResponse.day || [],
              periods: parsedResponse.periods || parsedResponse.period || [],
              classes: parsedResponse.classes || parsedResponse.class || {}
            };
            return normalizedResponse;
          } catch (fixError) {
            console.error("English truncation fix failed. Continuing with standard recovery.", fixError);
            // Continue with standard recovery process
          }
        }
        
        // Determine error types
        const isUnterminatedString = errorMessage.includes("Unterminated string");
        const isUnexpectedToken = errorMessage.includes("Expected") || errorMessage.includes("Unexpected");
        const isSyntaxError = errorMessage.includes("Syntax error");
        
        console.log(`Error details: Type=${parseError.name}, Position=${errorPosition}, Message=${errorMessage}`);
        
        let cleanedJson = jsonContent;
        
        // STEP 1: Apply basic JSON syntax fixes
        cleanedJson = cleanedJson
          .replace(/,\s*}/g, '}') // Remove trailing commas in objects
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":'); // Ensure property names are quoted
        
        // STEP 2: Handle truncation issues by advanced reconstruction strategies
        if (isUnterminatedString || isUnexpectedToken || isSyntaxError) {
          console.log("Detected malformed JSON response. Applying advanced reconstruction...");
          
          // STRATEGY 1: Extract and validate core structure (days and periods)
          const daysMatch = cleanedJson.match(/"days"\s*:\s*\[([\s\S]*?)\]/);
          const periodsMatch = cleanedJson.match(/"periods"\s*:\s*\[([\s\S]*?)\]/);
          
          // If we found both days and periods, we can start reconstruction
          if (daysMatch && periodsMatch) {
            console.log("Found days and periods sections, building skeleton structure");
            const days = daysMatch[0];
            const periods = periodsMatch[0];
            
            // Build minimal valid structure
            let reconstructedJson = '{\n';
            reconstructedJson += days + ',\n';
            reconstructedJson += periods + ',\n';
            reconstructedJson += '"classes": {}\n}';
            
            try {
              // Validate our basic structure
              const basicStructure = JSON.parse(reconstructedJson);
              console.log("Basic structure validation successful");
              
              // STRATEGY 2: Extract partial classes data
              const classesStartMatch = cleanedJson.match(/"classes"\s*:\s*\{([\s\S]*)/);
              
              if (classesStartMatch) {
                const classesContent = classesStartMatch[1];
                
                // STRATEGY 2A: Try to extract complete day blocks first
                const dayBlocks = classesContent.match(/"Day \d+"\s*:\s*\{[\s\S]*?\}\s*(?=,\s*"Day|$)/g);
                
                if (dayBlocks && dayBlocks.length > 0) {
                  console.log(`Found ${dayBlocks.length} complete day blocks`);
                  
                  reconstructedJson = '{\n';
                  reconstructedJson += days + ',\n';
                  reconstructedJson += periods + ',\n';
                  reconstructedJson += '"classes": {\n';
                  
                  // Add each complete day block
                  for (let i = 0; i < dayBlocks.length; i++) {
                    // Check if this day block is valid JSON when wrapped
                    let cleanBlock = dayBlocks[i].trim();
                    
                    // Fix common JSON issues in the day block
                    cleanBlock = cleanBlock
                      // Fix dangling commas at the end of period arrays
                      .replace(/,\s*\]/g, ']')
                      // Ensure proper quotes for keys
                      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
                      // Fix unterminated strings in the block
                      .replace(/("\w+"\s*:\s*")([^"]*?)(?=,\s*")/g, '$1$2"');
                    
                    // Check for specific Gemini truncation pattern
                    if (cleanBlock.match(/"code"\s*:\s*"[^"]*$/)) {
                      // This block ends with a truncated code field, find last complete period
                      const lastCompletePeriod = cleanBlock.match(/("Period \d+"|"Tutorial")\s*:\s*\[.*?\]\s*(?=,\s*(?:"Period|"Tutorial)|$)/g);
                      if (lastCompletePeriod && lastCompletePeriod.length > 0) {
                        // Use only the complete periods
                        const dayId = cleanBlock.match(/"(Day \d+)"/)[1];
                        cleanBlock = `"${dayId}": {`;
                        for (let j = 0; j < lastCompletePeriod.length; j++) {
                          cleanBlock += lastCompletePeriod[j];
                          if (j < lastCompletePeriod.length - 1) {
                            cleanBlock += ',';
                          }
                        }
                        cleanBlock += '}';
                        console.log(`Fixed truncated day block for ${dayId}`);
                      }
                    }
                    
                    reconstructedJson += cleanBlock;
                    if (i < dayBlocks.length - 1) {
                      reconstructedJson += ',\n';
                    }
                  }
                  
                  reconstructedJson += '}\n}';
                } 
                // STRATEGY 2B: If day blocks extraction failed, try more aggressive parsing
                else {
                  console.log("No complete day blocks found. Attempting more aggressive parsing...");
                  
                  // Extract day IDs from the days array to know what to look for
                  const daysData = daysMatch[1] || "";
                  const dayIds = daysData.match(/"(Day \d+)"/g) || [];
                  
                  if (dayIds.length > 0) {
                    console.log(`Found ${dayIds.length} day IDs in days array`);
                    
                    // Build classes object with partial data where possible
                    reconstructedJson = '{\n';
                    reconstructedJson += days + ',\n';
                    reconstructedJson += periods + ',\n';
                    reconstructedJson += '"classes": {\n';
                    
                    let addedDays = 0;
                    
                    // For each day ID, attempt to extract any period data we can
                    for (let i = 0; i < dayIds.length; i++) {
                      const dayId = dayIds[i].replace(/"/g, '');
                      const dayRegex = new RegExp(`"${dayId}"\\s*:\\s*\\{([\\s\\S]*?)(?:}\\s*,\\s*"Day|})`, 'i');
                      const dayMatch = classesContent.match(dayRegex);
                      
                      if (dayMatch) {
                        // Try to make it a valid JSON object
                        let dayContent = `"${dayId}": {${dayMatch[1]}}`;
                        
                        // Complete any unterminated strings
                        if (dayContent.includes('": "') && !dayContent.includes('",')) {
                          dayContent = dayContent.replace(/("\w+"\s*:\s*")([^"]*?)(?=}|,\s*")/g, '$1$2"');
                        }
                        
                        // Fix trailing commas and missing commas between objects
                        dayContent = dayContent
                          .replace(/,\s*}/g, '}')
                          .replace(/}\s*{/g, '},{')
                          .replace(/"\s*}/g, '"}');
                        
                        reconstructedJson += dayContent;
                        
                        if (i < dayIds.length - 1) {
                          reconstructedJson += ',\n';
                        }
                        
                        addedDays++;
                      }
                    }
                    
                    if (addedDays === 0) {
                      // If we couldn't extract any valid day data, revert to empty classes
                      reconstructedJson = '{\n';
                      reconstructedJson += days + ',\n';
                      reconstructedJson += periods + ',\n';
                      reconstructedJson += '"classes": {}\n}';
                    } else {
                      reconstructedJson += '}\n}';
                      console.log(`Successfully extracted partial data for ${addedDays} days`);
                    }
                  }
                }
              }
              
              // STRATEGY 3: Fix unterminated strings at truncation point
              if (errorPosition > 0 && isUnterminatedString) {
                console.log("Attempting to fix unterminated string at error position");
                let before = reconstructedJson.substring(0, errorPosition);
                let after = reconstructedJson.substring(errorPosition);
                
                // Check if we're inside a string that needs closing
                const unclosedQuote = (before.match(/"/g) || []).length % 2 === 1;
                if (unclosedQuote) {
                  reconstructedJson = before + '"' + after;
                }
              }
              
              // Try parsing the reconstructed JSON
              try {
                parsedResponse = JSON.parse(reconstructedJson);
                console.log("Successfully reconstructed JSON from partial response!");
                return parsedResponse; // Skip the outer parse attempt
              } catch (reconstructError) {
                console.error("First reconstruction attempt failed:", reconstructError);
                
                // STRATEGY 4: Even more aggressive cleaning for severely truncated responses
                try {
                  // Check for the specific English class truncation pattern at position ~10982
                  const englishTruncationMatch = reconstructedJson.match(/\"subject\"\s*:\s*\"English\"\s*,\s*\"code\"\s*:\s*\"[^\"]*$/);
                  if (englishTruncationMatch) {
                    console.log("Applying specialized fix for English class truncation pattern");
                    
                    // Find the position of the truncated English class entry
                    const truncatedPos = reconstructedJson.lastIndexOf('"subject": "English"');
                    
                    // Find the last valid period block before the truncation
                    const lastPeriodPos = reconstructedJson.lastIndexOf('"Period', truncatedPos);
                    const lastPeriodClose = reconstructedJson.indexOf(']', lastPeriodPos);
                    
                    if (lastPeriodPos > 0 && lastPeriodClose > 0 && lastPeriodClose < truncatedPos) {
                      // Cut off at the end of the last complete period
                      let cleanerJson = reconstructedJson.substring(0, lastPeriodClose + 1);
                      
                      // Find the current day block to close it properly
                      const currentDayPos = reconstructedJson.lastIndexOf('"Day', truncatedPos);
                      if (currentDayPos > 0) {
                        // Add a closing brace for the current day
                        cleanerJson += '}';
                      }
                      
                      // Count unclosed braces to balance them
                      const openBraces = (cleanerJson.match(/\{/g) || []).length;
                      const closeBraces = (cleanerJson.match(/\}/g) || []).length;
                      const unclosedBraces = openBraces - closeBraces;
                      
                      // Add missing closing braces
                      for (let i = 0; i < unclosedBraces; i++) {
                        cleanerJson += '\n}';
                      }                        // Try parsing with the English truncation fix
                      try {
                        const parsedFixed = JSON.parse(cleanerJson);
                        console.log("SUCCESS: Fixed English class truncation at position ~10982!");
                        console.log(`Recovered JSON with ${Object.keys(parsedFixed.classes || {}).length} day blocks`);
                        return parsedFixed;
                      } catch (englishFixError) {
                        console.error("English truncation fix failed:", englishFixError);
                        // Continue with other recovery methods
                      }
                    }
                  }
                  
                  // Remove any incomplete tokens at the error position
                  if (errorPosition > 0) {
                    let cleanerJson = reconstructedJson.substring(0, errorPosition);
                    // Find the last complete property to determine where to close brackets
                    const lastValidProp = cleanerJson.lastIndexOf('",');
                    if (lastValidProp > 0) {
                      cleanerJson = cleanerJson.substring(0, lastValidProp + 2);
                      // Count unclosed braces to balance them
                      const openBraces = (cleanerJson.match(/\{/g) || []).length;
                      const closeBraces = (cleanerJson.match(/\}/g) || []).length;
                      const unclosedBraces = openBraces - closeBraces;
                      
                      // Add missing closing braces
                      for (let i = 0; i < unclosedBraces; i++) {
                        cleanerJson += '\n}';
                      }
                      
                      // Try parsing this aggressively cleaned JSON
                      parsedResponse = JSON.parse(cleanerJson);
                      console.log("Successfully reconstructed JSON using aggressive truncation strategy!");
                      return parsedResponse;
                    }
                  }
                } catch (finalError) {
                  console.error("All reconstruction attempts failed. Using basic structure instead.");
                  return basicStructure; // Fall back to minimum valid structure
                }
              }
            } catch (basicStructureError) {
              console.error("Basic structure validation failed:", basicStructureError);
            }
          }
          
          // STRATEGY 5: Last resort - if all else fails, try to extract the days and periods
          // and create a minimal valid timetable structure
          const daysExtract = cleanedJson.match(/"days"\s*:\s*\[([\s\S]*?)\]/);
          const periodsExtract = cleanedJson.match(/"periods"\s*:\s*\[([\s\S]*?)\]/);
          
          if (daysExtract && periodsExtract) {
            let fallbackJson = '{\n';
            fallbackJson += daysExtract[0] + ',\n';
            fallbackJson += periodsExtract[0] + ',\n';
            fallbackJson += '"classes": {}\n}';
            
            try {
              parsedResponse = JSON.parse(fallbackJson);
              console.log("Using minimal valid structure as last resort");
              return parsedResponse;
            } catch (lastError) {
              console.error("Even minimal structure parsing failed:", lastError);
            }
          }
        }
        
        // If all reconstruction attempts failed, try the basic cleaned JSON as a last resort
        try {
          parsedResponse = JSON.parse(cleanedJson);
        } catch (finalError) {
          console.error("All JSON recovery strategies failed:", finalError);
          throw new Error(`Unable to parse or repair the JSON response: ${finalError.message}. Original error: ${parseError.message}`);
        }
      }
      
      // Normalize the response - handle various property names & formats
      const normalizedResponse = {
        days: parsedResponse.days || parsedResponse.day || [],
        periods: parsedResponse.periods || parsedResponse.period || [],
        classes: parsedResponse.classes || parsedResponse.class || {}
      };
      
      // Validate the response structure
      if (normalizedResponse.days.length === 0) {
        throw new Error("Invalid response: No days found in the parsed data");
      }
      if (normalizedResponse.periods.length === 0) {
        throw new Error("Invalid response: No periods found in the parsed data");
      }
      if (Object.keys(normalizedResponse.classes).length === 0) {
        throw new Error("Invalid response: No classes found in the parsed data");
      }
      
      // Enhance the timetable data by converting string classes to structured objects
      // Instead of using an external import, we'll implement the enhancing functionality inline
      const enhancedData = enhanceTimetableData(normalizedResponse);
      
      console.log(`Successfully parsed timetable data and enhanced class objects`);
      return enhancedData;
      
      // Helper function to parse a class string into a structured object
      function parseClassString(classString) {
        if (!classString || typeof classString !== 'string') {
          return { subject: "Unknown", code: "", room: "", teacher: "" };
        }
        
        // Initialize default object
        const classObj = { subject: "", code: "", room: "", teacher: "" };
        
        try {
          // Extract code (pattern: text inside parentheses)
          const codeMatch = classString.match(/\(([^)]+)\)/);
          if (codeMatch && codeMatch[1]) {
            classObj.code = codeMatch[1].trim();
            
            // Extract subject (text before the code parentheses)
            const subjectPart = classString.split('(')[0];
            if (subjectPart) {
              classObj.subject = subjectPart.trim();
            }
            
            // Extract the part after the code for room and teacher
            const afterCodePart = classString.split(')')[1];
            if (afterCodePart) {
              // Look for room pattern (usually one or two chars followed by a number)
              const roomMatch = afterCodePart.match(/([A-Za-z]{1,2}\s+\d+)/);
              if (roomMatch && roomMatch[1]) {
                classObj.room = roomMatch[1].trim();
                
                // Teacher is likely everything after the room
                const roomIndex = afterCodePart.indexOf(roomMatch[1]);
                if (roomIndex >= 0) {
                  const teacherPart = afterCodePart.substring(roomIndex + roomMatch[1].length);
                  classObj.teacher = teacherPart.trim();
                }
              } else {
                // If no room pattern found, just use the rest as teacher
                classObj.teacher = afterCodePart.trim();
              }
            }
          } else {
            // No code found, use basic splitting
            const parts = classString.split(' ');
            if (parts.length >= 1) {
              // Assume first half is subject, second half is teacher
              const halfIndex = Math.floor(parts.length / 2);
              classObj.subject = parts.slice(0, halfIndex).join(' ').trim();
              classObj.teacher = parts.slice(halfIndex).join(' ').trim();
            } else {
              classObj.subject = classString;
            }
          }
          
          return classObj;
        } catch (error) {
          console.error("Error parsing class string:", error);
          // Fallback to using the entire string as subject
          return { subject: classString, code: "", room: "", teacher: "" };
        }
      }
      
      // Helper function to enhance timetable data
      function enhanceTimetableData(timetableData) {
        if (!timetableData || !timetableData.classes) {
          return timetableData;
        }
        
        const enhancedData = {
          ...timetableData,
          classes: {}
        };
        
        // Process each day
        Object.keys(timetableData.classes).forEach(day => {
          enhancedData.classes[day] = {};
          
          // Process each period in the day
          Object.keys(timetableData.classes[day]).forEach(period => {
            const classes = timetableData.classes[day][period];
            
            // If period contains an array of class strings, convert each to an object
            if (Array.isArray(classes)) {
              enhancedData.classes[day][period] = classes.map(classString => {
                return parseClassString(classString);
              });
            } else {
              // If not an array, create empty array
              enhancedData.classes[day][period] = [];
            }
          });
        });
        
        return enhancedData;
      }
    } catch (e) {
      console.error(`Failed to parse JSON response from AI:`, e);
      console.error("Raw AI response content:", content);
      throw new Error(`Failed to parse JSON from the AI response: ${e.message}`);
    }
  } catch (error) {
    console.error(`Error calling OpenRouter API:`, error);
    throw new Error(`Error parsing timetable with OpenRouter API (Gemini 2.0 Flash, key: ${currentKeyIndex + 1}): ${error.message}`);
  }
}

// Browser-compatible backup tracking
function logBackupInfo() {
  try {
    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    
    console.log(`AI Parser service initialized at: ${timestamp}`);
    // No filesystem operations in browser
  } catch (err) {
    // Ignore errors in browser context
  }
}

// Log initialization info
logBackupInfo();

// To make this function available for import in other modules:
export { parseTimetableWithChuteAI };

// Example usage (uncomment to test, e.g., in a Node.js environment):

async function test() {
  const exampleTimetableText = `
    Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
    Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
    Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
    Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
    Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
    Day 2,Period 1,Chemistry,CHEM101,Room C,Dr. Brown,8:35am,9:35am
    Day 2,Period 2,Computer Science,CS101,Room E,Ms. Miller,9:40am,10:40am
    Day 2,Tutorial,Research Skills,TUT102,Library,Mr. Taylor,10:45am,11:20am
  `; // Sample with Tutorial periods included

  try {
    console.log("Sending request to AI...");
    const result = await parseTimetableWithChuteAI(exampleTimetableText);
    console.log("Parsed Timetable Data:");
    console.log(JSON.stringify(result, null, 2));
    
    // Check if Tutorial periods were included
    let tutorialFound = false;
    for (const day in result.classes) {
      if (result.classes[day].Tutorial && result.classes[day].Tutorial.length > 0) {
        tutorialFound = true;
        console.log(`✅ Tutorial found in ${day}`);
      }
    }
    
    if (!tutorialFound) {
      console.warn("⚠️ No Tutorial periods were found in the parsed output");
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Uncomment to run the test
// test();
