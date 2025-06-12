// aiParserSimplified.js - A simplified version that just returns raw API responses
// This file eliminates complex parsing logic to diagnose API errors

// Import the API error diagnostics
const { diagnoseApiError, generateErrorReport } = require('../utils/apiErrorDiagnostics');

// API keys for OpenRouter
const API_KEYS = [
  "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", // Primary key
  "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", // Backup key 1
  "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", // Backup key 2
  "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", // Backup key 3
  "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", // Backup key 4
  "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"  // Backup key 5
];

// Use only Gemini 2.0 models by default
const MODELS = {
  "auto": "google/gemini-2.0-flash-exp:free",  // Primary Gemini 2.0 model
  "deepseek": "deepseek/deepseek-chat-v3-0324:free",
  "qwen": "qwen/qwen3-32b:free",
  "anthropic": "anthropic/claude-3-haiku:free",
  "google": "google/gemini-2.0-flash-exp:free",
  "mistral": "mistralai/mistral-medium:free"
};
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Simplified function to parse a timetable using OpenRouter API
 * This version just returns the raw API response without complex error handling
 * 
 * @param {string} timetableText - The raw timetable text to parse
 * @param {number} forceKeyIndex - Optional index to force a specific API key
 * @param {string} preferredProvider - Optional preferred model provider (deepseek, qwen, etc.)
 * @returns {object} - The parsed JSON response or error details
 */
async function parseTimetableSimple(timetableText, forceKeyIndex = null, preferredProvider = 'auto') {
  console.log(`Starting simple timetable parsing with OpenRouter API. Preferred provider: ${preferredProvider}`);
  
  // Allow overriding the API key selection
  const keyIndex = forceKeyIndex !== null ? forceKeyIndex : 0;
  apiKey = API_KEYS[keyIndex];
  
  // Select the model based on preferred provider
  const model = MODELS[preferredProvider] || MODELS['auto'];
  
  console.log(`Using API key #${keyIndex + 1} with model: ${model}`);
  
  // Basic prompt for timetable formatting
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
      "Period 1": [],
      "Period 2": [],
      "Tutorial": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    }
    // ...and so on for all 10 days
  }
}

Include Tutorial periods in each day. If a period has no class, just leave it as an empty array.

Return only valid JSON. No markdown. No explanation.`;

  // Use the primary API key first
  let apiKey = API_KEYS[0];
  let result = {
    success: false,
    data: null,
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

    console.log(`Sending request to OpenRouter API using ${model}`);
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://premium-timetable.vercel.app",
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
      console.error("API request failed:", response.status, rawResponseText);
      result.error = `API request failed with status ${response.status}: ${rawResponseText}`;
      
      // Diagnose the error
      const diagnosis = diagnoseApiError(rawResponseText);
      result.diagnosis = diagnosis;
      
      // Log the error report
      const errorReport = generateErrorReport(diagnosis);
      console.error(errorReport);
      
      return result;
    }
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(rawResponseText);
      result.data = jsonResponse;
      
      // Extract the actual content from the API response
      if (jsonResponse.choices && jsonResponse.choices.length > 0) {
        const choice = jsonResponse.choices[0];
        if (choice.message && choice.message.content) {
          try {
            // If the content is valid JSON, parse it
            const contentJson = JSON.parse(choice.message.content);
            result.success = true;
            result.data = contentJson;
          } catch (parseError) {
            // If not valid JSON, just store the raw content
            result.data = choice.message.content;
            result.error = `Content is not valid JSON: ${parseError.message}`;
          }
        } else {
          result.error = "No content found in API response";
        }
      } else {
        result.error = "No choices found in API response";
      }
    } catch (jsonError) {
      result.error = `Failed to parse API response as JSON: ${jsonError.message}`;
    }
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    result.error = `Error calling OpenRouter API: ${error.message}`;
    
    // Diagnose the error
    const diagnosis = diagnoseApiError(error.message);
    result.diagnosis = diagnosis;
    
    // Log the error report
    const errorReport = generateErrorReport(diagnosis);
    console.error(errorReport);
  }
  
  return result;
}

// Try with multiple API keys if the first one fails
async function parseTimetableWithFallback(timetableText, preferredProvider = 'auto') {
  console.log(`Starting timetable parsing with fallback keys. Preferred provider: ${preferredProvider}`);
  
  // Try each API key in sequence
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      console.log(`Trying with API key #${i + 1}`);
      
      // Override the default API key selection in parseTimetableSimple
      const result = await parseTimetableSimple(timetableText, i, preferredProvider);
      
      if (result.success) {
        console.log(`Successfully parsed timetable with API key #${i + 1}`);
        return result;
      }
      
      // If we got a provider error, try the next key
      if (result.diagnosis && result.diagnosis.errorType === 'provider_error') {
        console.log(`Provider error with key #${i + 1}, trying next key...`);
        continue;
      }
      
      // For other errors, just return the result
      return result;
      
    } catch (error) {
      console.error(`Error with API key #${i + 1}:`, error);
      
      // Only continue if we have more keys to try
      if (i === API_KEYS.length - 1) {
        throw error;
      }
    }
  }
  
  // If all keys failed, return a generic error
  return {
    success: false,
    error: "All API keys failed. Could not parse timetable.",
    diagnosis: {
      errorType: "all_keys_failed",
      possibleCauses: ["All API keys have failed", "Provider may be down"],
      recommendations: ["Try again later", "Contact OpenRouter support"]
    }
  };
}

// For use in browser environments
module.exports = { 
  parseTimetableSimple,
  parseTimetableWithFallback
};
