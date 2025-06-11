// multiModelParser.js - An enhanced parser with multi-model fallback capability
// This service tries different models when one fails, providing better reliability

const { diagnoseApiError, generateErrorReport } = require('../utils/apiErrorDiagnostics');

// API keys for OpenRouter
const API_KEYS = [
  "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", // Primary key (previously third)
  "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", // Second backup key
  "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", // Third backup key
  "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"  // Fourth backup key (added May 18, 2025)
];

// Available models in priority order - USING MULTIPLE MODEL PROVIDERS FOR FALLBACK
const MODELS = [
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-r1-0528:free"
];

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Attempts to parse timetable data with a specific model and API key
 * @param {string} timetableText - Raw timetable text to parse
 * @param {string} model - Model to use (from MODELS array)
 * @param {string} apiKey - API key to use
 * @returns {object} - Result object with success status and data
 */
async function parseTimetableWithModel(timetableText, model, apiKey) {
  console.log(`Attempting to parse timetable with model: ${model}`);
  
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
            // If the content is valid JSON, parse it
            const contentJson = JSON.parse(choice.message.content);
            result.success = true;
            result.data = contentJson;
          } catch (parseError) {
            // If not valid JSON, just store the raw content
            result.data = choice.message.content;
            result.error = `Content from ${model} is not valid JSON: ${parseError.message}`;
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
module.exports = { 
  parseWithModelFallback,
  parseTimetableWithModel,
  MODELS
};
