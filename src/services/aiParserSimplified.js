// aiParserSimplified.js - A simplified version that just returns raw API responses
// This file eliminates complex parsing logic to diagnose API errors

// Import the API error diagnostics
const { diagnoseApiError, generateErrorReport } = require('../utils/apiErrorDiagnostics');

// API keys for OpenRouter
const API_KEYS = [
  "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", // Primary key (previously third)
  "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", // Second backup key
  "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"  // Third backup key
];

// Use only Gemini 2.0 models
const MODEL = "google/gemini-2.0-flash-exp:free";  // Primary Gemini 2.0 model
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Simplified function to parse a timetable using OpenRouter API
 * This version just returns the raw API response without complex error handling
 * 
 * @param {string} timetableText - The raw timetable text to parse
 * @returns {object} - The parsed JSON response or error details
 */
async function parseTimetableSimple(timetableText, forceKeyIndex = null) {
  console.log("Starting simple timetable parsing with OpenRouter API");
  
  // Allow overriding the API key selection
  const keyIndex = forceKeyIndex !== null ? forceKeyIndex : 0;
  apiKey = API_KEYS[keyIndex];
  
  console.log(`Using API key #${keyIndex + 1}`);
  
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
      "model": MODEL,
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

    console.log(`Sending request to OpenRouter API using ${MODEL}`);
    
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
async function parseTimetableWithFallback(timetableText) {
  console.log("Starting timetable parsing with fallback keys");
  
  // Try each API key in sequence
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      console.log(`Trying with API key #${i + 1}`);
      
      // Override the default API key selection in parseTimetableSimple
      const result = await parseTimetableSimple(timetableText, i);
      
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
