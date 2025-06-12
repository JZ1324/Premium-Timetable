// multiModelParser.js - An enhanced parser with multi-model fallback capability
// This service tries different models when one fails, providing better reliability

import { diagnoseApiError, generateErrorReport } from '../utils/apiErrorDiagnostics.js';

// API keys for OpenRouter
const API_KEYS = [
  "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", // Primary key
  "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", // Backup key 1
  "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", // Backup key 2
  "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", // Backup key 3
  "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", // Backup key 4
  "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"  // Backup key 5
];

// Available models in priority order - USING MULTIPLE MODEL PROVIDERS FOR FALLBACK
const MODELS = [
 
"google/gemma-3n-e4b-it:free"
];

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Validates that the parsed data contains real information, not placeholder values
 * @param {object} data - The parsed timetable data
 * @returns {boolean} - True if data contains real information
 */
function validateParsedData(data) {
  if (!data || !data.classes) {
    return false;
  }
  
  // Check if any class has real data (not "Unknown" or empty strings)
  for (const day in data.classes) {
    for (const period in data.classes[day]) {
      const classes = data.classes[day][period];
      if (Array.isArray(classes)) {
        for (const classInfo of classes) {
          if (classInfo.subject && 
              classInfo.subject !== "Unknown" && 
              classInfo.subject !== "" &&
              classInfo.subject.length > 1) {
            return true; // Found at least one real class
          }
        }
      }
    }
  }
  
  return false; // No real class data found
}

/**
 * Attempts to repair truncated JSON by adding missing closing brackets and braces
 * @param {string} jsonString - The potentially truncated JSON string
 * @returns {object|null} - Parsed JSON object or null if repair fails
 */
function repairTruncatedJson(jsonString) {
  try {
    // First, try to parse as-is
    return JSON.parse(jsonString);
  } catch (error) {
    // If that fails, try to repair truncated JSON
    let repaired = jsonString.trim();
    
    // Remove any trailing incomplete text after the last valid character
    const lastBrace = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
    const lastQuote = repaired.lastIndexOf('"');
    
    if (lastBrace > lastQuote) {
      // Truncate after the last complete brace/bracket
      repaired = repaired.substring(0, lastBrace + 1);
    } else if (lastQuote > lastBrace) {
      // We have an unterminated string, try to close it
      repaired = repaired.substring(0, lastQuote + 1);
    }
    
    // Count opening and closing braces/brackets to balance them
    let openBraces = (repaired.match(/\{/g) || []).length;
    let closeBraces = (repaired.match(/\}/g) || []).length;
    let openBrackets = (repaired.match(/\[/g) || []).length;
    let closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing brackets and braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }
    
    // Try to parse the repaired JSON
    try {
      return JSON.parse(repaired);
    } catch (repairError) {
      console.log('JSON repair failed:', repairError.message);
      return null;
    }
  }
}

/**
 * Attempts to parse timetable data with a specific model and API key
 * @param {string} timetableText - Raw timetable text to parse
 * @param {string} model - Model to use (from MODELS array)
 * @param {string} apiKey - API key to use
 * @returns {object} - Result object with success status and data
 */
async function parseTimetableWithModel(timetableText, model, apiKey) {
  console.log(`Attempting to parse timetable with model: ${model}`);
  console.log(`Input timetable data length: ${timetableText ? timetableText.length : 0} characters`);
  console.log(`First 1000 characters of input:`, timetableText ? timetableText.substring(0, 1000) : 'NO INPUT DATA');
  console.log(`Last 500 characters of input:`, timetableText ? timetableText.substring(Math.max(0, timetableText.length - 500)) : 'NO INPUT DATA');
  
  // Save the full input to console for debugging
  console.log('FULL TIMETABLE INPUT DATA:');
  console.log('========================');
  console.log(timetableText);
  console.log('========================');
  
  // Use the exact user prompt format for consistency
  const prompt = `Please convert my school timetable data into a structured JSON format and return it as copypastable JSON.

Timetable format explanation:
Each subject block in the timetable consists of 3 lines:

The subject name (e.g., "Mathematics - Advanced")

The subject code in parentheses on the next line (e.g., "(10MAA252103)")

The room and teacher, with the room listed first (e.g., "M 06 Mrs Leah Manning")

There are 10 days total, from "Day 1" to "Day 10". For each period, Day 1's class appears first, then Day 2, and so on up to Day 10.

Required output format:
Return a JSON object with:

"days": list of strings from "Day 1" to "Day 10"

"periods": each with "name", "startTime", and "endTime" (format: "8:35am")

"classes": an object where each day (e.g. "Day 1") maps to a dictionary of all periods

Each period has an array of classes (or an empty array [] if no class)

Each class must include:

"subject" (string)

"code" (string)

"room" (string)

"teacher" (string)

"startTime" and "endTime" from the period

Important Notes:

Do not guess. If any field is missing, leave it as an empty string "".

Always include all periods and all 10 days, even if a period has no classes.

Tutorial must be treated like a normal period and shown with its time: "10:45am–10:55am"

If the subject name and code are on different lines, still link them correctly.

The subject code is always wrapped in brackets (e.g. "(10MAA252103)")

Room format is typically one letter and two digits (e.g. "M 06"), followed by teacher's name.

Keep the times exactly as they appear (e.g. "8:35am", not "08:35")

Output rules:
Return a single valid JSON object only — no extra commentary or explanation

Ensure it is copy-paste ready

Make sure all days and periods are present

If a value is missing, set it to "" but never omit the field
Return only valid raw JSON, not a stringified JSON. Do not wrap the JSON object in quotes or escape any characters.

Here's my timetable data:`;

  let result = {
    success: false,
    data: null,
    model: model,
    rawResponse: null,
    error: null,
    diagnosis: null
  };
  
  try {
    // Prepare the request
    const requestBody = {
      "model": model,
      "messages": [
        {
          "role": "system", 
          "content": "You are a timetable parsing expert. Extract REAL data from the user's input. Do NOT use 'Unknown' or placeholder values - only return actual class information found in the data. Always return ONLY valid, complete JSON with no extra text, explanations, or markdown formatting. If you cannot find real class data for a period, return an empty array [] for that period."
        },
        {
          "role": "user",
          "content": prompt + "\n\n" + timetableText
        }
      ],
      "response_format": { "type": "json_object" },
      "max_tokens": 8000,
      "temperature": 0.1
    };

    console.log(`Sending request to OpenRouter API using ${model}`);
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin || "https://premium-timetable-git-main-jzs-projects-88f4a016.vercel.app", 
        "X-Title": "Premium Timetable App", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    // Get the raw response text and store it
    const rawResponseText = await response.text();
    result.rawResponse = rawResponseText;
    
    // Check if the response is OK
    if (!response.ok) {
      console.error(`API request failed with ${model}:`, response.status, rawResponseText);
      result.error = `API request failed with status ${response.status}: ${rawResponseText}`;
      
      // Diagnose the error
      const diagnosis = diagnoseApiError(rawResponseText);
      result.diagnosis = diagnosis;
      
      return result;
    }
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(rawResponseText);
      
      // Check for error inside the JSON response (OpenRouter sometimes returns 200 OK with an error inside)
      if (jsonResponse.error) {
        console.error(`Model ${model} returned error in response:`, jsonResponse.error);
        result.error = jsonResponse.error.message || "Error in API response";
        
        // Diagnose the error
        const diagnosis = diagnoseApiError(jsonResponse.error.message);
        result.diagnosis = diagnosis;
        
        return result;
      }
      
      // Extract the actual content from the API response
      if (jsonResponse.choices && jsonResponse.choices.length > 0) {
        const choice = jsonResponse.choices[0];
        if (choice.message && choice.message.content) {
          try {
            // Clean the content before parsing
            let cleanContent = choice.message.content.trim();
            
            // Remove any leading/trailing whitespace and markdown formatting
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            
            // Try to parse the cleaned content
            const contentJson = JSON.parse(cleanContent);
            
            // Validate that we got real data, not just "Unknown" placeholders
            if (!validateParsedData(contentJson)) {
              console.log(`Model ${model} returned placeholder data with "Unknown" values. Treating as failure.`);
              result.error = `Model ${model} could not extract real class data from input - returned only placeholder values`;
              return result;
            }
            
            result.success = true;
            result.data = contentJson;
          } catch (parseError) {
            // Try to repair truncated JSON
            try {
              const repairedJson = repairTruncatedJson(choice.message.content);
              if (repairedJson && validateParsedData(repairedJson)) {
                result.success = true;
                result.data = repairedJson;
                console.log(`Successfully repaired truncated JSON from ${model}`);
              } else {
                console.log(`Repaired JSON from ${model} contains no real data, treating as failure`);
                throw parseError; // Fall back to original error
              }
            } catch (repairError) {
              // If repair fails, store the raw content and error
              result.data = choice.message.content;
              result.error = `Content from ${model} is not valid JSON: ${parseError.message}`;
            }
          }
        } else {
          result.error = `No content found in API response from ${model}`;
        }
      } else {
        result.error = `No choices found in API response from ${model}`;
      }
    } catch (jsonError) {
      result.error = `Failed to parse API response from ${model} as JSON: ${jsonError.message}`;
    }
  } catch (error) {
    console.error(`Error calling OpenRouter API with ${model}:`, error);
    result.error = `Error calling OpenRouter API with ${model}: ${error.message}`;
    
    // Diagnose the error
    const diagnosis = diagnoseApiError(error.message);
    result.diagnosis = diagnosis;
  }
  
  return result;
}

/**
 * Parses timetable data with multiple model fallbacks
 * This function tries models in order of preference until one succeeds
 * @param {string} timetableText - The raw timetable text to parse
 * @returns {object} - The parsed data or error information
 */
async function parseWithModelFallback(timetableText) {
  console.log("Starting multi-model timetable parsing with fallbacks");
  
  // Try each API key
  for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
    const apiKey = API_KEYS[keyIndex];
    console.log(`Trying with API key #${keyIndex + 1}`);
    
    // Try each model with the current API key
    for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
      const model = MODELS[modelIndex];
      
      try {
        console.log(`Attempting model ${model} with API key #${keyIndex + 1}`);
        
        // Try parsing with this model and API key
        const result = await parseTimetableWithModel(timetableText, model, apiKey);
        
        if (result.success) {
          console.log(`Successfully parsed timetable with model ${model} and API key #${keyIndex + 1}`);
          return {
            ...result,
            usedModel: model,
            usedKeyIndex: keyIndex
          };
        }
        
        // If we got a rate limit or provider error, try the next model
        if (result.diagnosis && 
            (result.diagnosis.errorType === 'rate_limiting' || 
             result.diagnosis.errorType === 'provider_error' ||
             result.diagnosis.errorType === 'provider_rate_limit' ||
             result.diagnosis.errorType === 'authorization' ||
             result.diagnosis.errorType === 'network_restriction')) {
          
          // Check if this is a DeepSeek model and there's an auth/network error
          const isDeepSeekModel = model.includes('deepseek');
          const isNetworkOrAuthError = result.diagnosis.errorType === 'authorization' || 
                                       result.diagnosis.errorType === 'network_restriction';
          
          if (isDeepSeekModel && isNetworkOrAuthError) {
            console.log(`DeepSeek model ${model} appears to be blocked by network restrictions. Trying different model provider...`);
            // Skip all DeepSeek models if one is blocked
            continue;
          }
          
          console.log(`Rate limit or provider error with model ${model}, trying next model...`);
          continue;
        }
        
        // For other errors, return the result
        return result;
      } catch (error) {
        console.error(`Error with model ${model} and API key #${keyIndex + 1}:`, error);
        
        // Check if this is a DeepSeek model with potential network issues
        const isDeepSeekModel = model.includes('deepseek');
        const isNetworkError = error.name === 'TypeError' || 
                               error.name === 'NetworkError' || 
                               error.message.includes('fetch') ||
                               error.message.includes('network') ||
                               error.message.includes('connection');
        
        if (isDeepSeekModel && isNetworkError) {
          console.log(`DeepSeek model ${model} might be blocked by network restrictions. Trying different model provider...`);
          // Continue to next model to try a different provider
          continue;
        }
        
        // Continue to next model for any network/connection errors
        if (error.name === 'TypeError' || error.name === 'NetworkError' || error.message.includes('fetch')) {
          console.log(`Network error detected, trying next model...`);
          continue;
        }
        
        // For other errors, throw
        throw error;
      }
    }
  }
  
  // If all models and keys failed, return a detailed error
  return {
    success: false,
    error: "All models and API keys failed. Could not parse timetable.",
    diagnosis: {
      errorType: "all_models_failed",
      possibleCauses: [
        "Free tier usage limits exceeded for all models",
        "Provider services may be experiencing outages",
        "All API keys may have exhausted their quota",
        "Your network (e.g., school) may be blocking access to AI services"
      ],
      recommendations: [
        "Try again tomorrow when quotas typically reset",
        "Consider adding credits to your OpenRouter account",
        "Try parsing a smaller section of the timetable",
        "If on a school network, try using the app on a different network (home WiFi or mobile data)"
      ],
      severity: "critical"
    }
  };
}

// For use in browser environments
export { 
  parseWithModelFallback,
  parseTimetableWithModel,
  MODELS
};
