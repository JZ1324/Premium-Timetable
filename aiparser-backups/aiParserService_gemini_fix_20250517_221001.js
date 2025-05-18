const OPENROUTER_API_KEY = "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";
const MODEL_NAME = "google/gemini-2.0-flash-exp:free";
const FALLBACK_MODEL = "anthropic/claude-3-opus:beta"; // Fallback model if Gemini fails
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 2; // Maximum number of retry attempts
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

/**
 * Helper function to delay execution
 * @param {number} ms - milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Provider: chute (using Gemini 2.0 Flash model with fallback to Claude)
async function parseTimetableWithChuteAI(timetableText) {
  const systemPrompt = `You are an expert at extracting structured timetable data.

I will give you a school timetable in grid format (each column is a day, each row is a period). Convert it into this exact JSON format:

{
  "days": [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
  "classes": {
    "Day 1": {
      "Period 1": [...],
      "Period 2": [...],
      "Period 3": [...],
      "Period 4": [...],
      "Period 5": [...]
    },
    ...
    "Day 10": {
      ...
    }
  }
}

IMPORTANT: Make sure to use the EXACT field names "days", "periods", and "classes" (plural form). Do not use singular forms like "day", "period", or "class".

⚠️ DO NOT group all Period 1 classes from all days under "Period 1" in one place. That is incorrect.

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
    let lastError = null;
    
    // Implement retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} of ${MAX_RETRIES} after ${RETRY_DELAY}ms delay`);
          await delay(RETRY_DELAY);
        }
        
        console.log(`Sending request to OpenRouter API using model: ${MODEL_NAME}`);
        
        const requestBody = {
          "model": MODEL_NAME,
          "messages": [
            {
              "role": "system",
              "content": systemPrompt
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": timetableText
                }
              ]
            }
          ],
          "temperature": 0,
          "max_tokens": 2048,
          "stream": false,
          "response_format": { "type": "json_object" }
        };
        
        console.log(`Request attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        // Try fallback to original format if we're retrying
        if (attempt > 0) {
          delete requestBody.response_format;
          console.log("Removed response_format for retry attempt");
        }
        
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://timetable-premium.vercel.app", 
            "X-Title": "Premium Timetable App", 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`API request failed (attempt ${attempt + 1}):`, response.status, errorBody);
          throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }
        
        console.log("OpenRouter API response received");
        console.log("Response status:", response.status);
        console.log("Response headers:", JSON.stringify([...response.headers.entries()]));
    

    const data = await response.json();
    console.log("OpenRouter API raw response:", JSON.stringify(data));
    
    // Check for error in the API response first
    if (data.error) {
      const errorMessage = typeof data.error === 'object' 
        ? (data.error.message || JSON.stringify(data.error)) 
        : data.error;
        
      console.error("OpenRouter API returned an error:", errorMessage);
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }
    
    // Extract the content based on different possible response structures
    let content = null;
    
    // Standard OpenAI/OpenRouter format
    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        content = data.choices[0].message.content;
      } 
      // Gemini might use a different structure
      else if (data.choices[0].content) {
        content = data.choices[0].content;
      }
      // Some models might nest content differently
      else if (data.choices[0].text) {
        content = data.choices[0].text;
      }
      // For Gemini 2.0 Flash model
      else if (data.choices[0].parts && data.choices[0].parts.length > 0) {
        const textParts = data.choices[0].parts
          .filter(part => part.text)
          .map(part => part.text);
        
        if (textParts.length > 0) {
          content = textParts.join('\n');
        }
      }
    }
    // Gemini direct format without choices array
    else if (data.message && data.message.content) {
      content = data.message.content;
    }
    // Gemini alternative format
    else if (data.content) {
      content = data.content;
    }
    // Pure text response
    else if (typeof data.text === 'string') {
      content = data.text;
    }
    // Handle parts format (Google Gemini specific)
    else if (data.parts && Array.isArray(data.parts)) {
      const textParts = data.parts
        .filter(part => part.text)
        .map(part => part.text);
      
      if (textParts.length > 0) {
        content = textParts.join('\n');
      }
    }
    // Last attempt to find content
    else if (data.response) {
      content = data.response;
    }
    
    if (content) {
      try {
        // Try to safely parse the JSON from the content
        // First, try to find JSON within the content (in case there's additional text)
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        let jsonContent = jsonMatch ? jsonMatch[0] : content;
        
        // Try to sanitize the content in case it has extra non-JSON text
        jsonContent = jsonContent.trim();
        
        // Remove any markdown code block markers if present
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        
        const parsedResponse = JSON.parse(jsonContent);
        
        // Handle different key formats - Some AI models might return day/period/class (singular)
        // instead of days/periods/classes (plural)
        const normalizedResponse = {
          days: parsedResponse.days || parsedResponse.day || [],
          periods: parsedResponse.periods || parsedResponse.period || [],
          classes: parsedResponse.classes || parsedResponse.class || {}
        };
        
        return normalizedResponse;
      } catch (e) {
        console.error("Failed to parse JSON response from AI:", e);
        console.error("Raw AI response content:", content);
        throw new Error("Failed to parse JSON from the AI response. Raw content: " + content.substring(0, 200) + "...");
      }
    } else {
      console.error("Unexpected API response structure:", data);
      throw new Error("Unexpected API response structure. Could not find content in the response.");
    }
    
    // If we got here, we succeeded
    break;
    
      } catch (error) {
        lastError = error;
        
        // Only log and continue if we have more retries left
        if (attempt < MAX_RETRIES) {
          console.log(`Attempt ${attempt + 1} failed: ${error.message}. Will retry...`);
          continue;
        }
        
        // If we're out of retries, throw the error
        throw error;
      }
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    
    // Try to provide more context on the error
    let errorMessage = error.message;
    
    // If this was a parsing error, add more context
    if (errorMessage.includes("Unexpected API response structure")) {
      errorMessage += " This could be due to the OpenRouter API returning an unexpected format for the Gemini model. You may want to try again or use a different model.";
    }
    
    // Before giving up, try the fallback model
    console.log(`Attempting fallback to ${FALLBACK_MODEL} model`);
    try {
      // Almost identical process but with fallback model
      const fallbackRequestBody = {
        "model": FALLBACK_MODEL,
        "messages": [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": timetableText
              }
            ]
          }
        ],
        "temperature": 0,
        "max_tokens": 4000 // Claude can handle larger responses
      };
      
      console.log(`Sending request to fallback model: ${FALLBACK_MODEL}`);
      
      const fallbackResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://timetable-premium.vercel.app", 
          "X-Title": "Premium Timetable App", 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fallbackRequestBody)
      });

      if (!fallbackResponse.ok) {
        throw new Error("Fallback model also failed");
      }
      
      const fallbackData = await fallbackResponse.json();
      
      // Claude has a more reliable structure
      if (fallbackData.choices && fallbackData.choices.length > 0 && 
          fallbackData.choices[0].message && fallbackData.choices[0].message.content) {
        
        const content = fallbackData.choices[0].message.content;
        // Find JSON in the content
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        let jsonContent = jsonMatch ? jsonMatch[0] : content;
        
        // Remove any markdown code block markers if present
        jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        
        const parsedResponse = JSON.parse(jsonContent);
        
        const normalizedResponse = {
          days: parsedResponse.days || parsedResponse.day || [],
          periods: parsedResponse.periods || parsedResponse.period || [],
          classes: parsedResponse.classes || parsedResponse.class || {}
        };
        
        console.log("Successfully used fallback model");
        return normalizedResponse;
      } else {
        throw new Error("Fallback model returned unexpected structure");
      }
    } catch (fallbackError) {
      console.error("Fallback model also failed:", fallbackError);
      
      // Now we can give up and throw the enhanced error
      const enhancedError = new Error(`Error parsing timetable with OpenRouter API (${MODEL_NAME} and fallback ${FALLBACK_MODEL}): ${errorMessage}`);
      enhancedError.originalError = error;
      enhancedError.modelName = MODEL_NAME;
      enhancedError.fallbackError = fallbackError;
      throw enhancedError;
    }
  }
}

// To make this function available for import in other modules:
export { parseTimetableWithChuteAI };

// Example usage (uncomment to test, e.g., in a Node.js environment):
/*
async function test() {
  const exampleTimetableText = \`
    Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
    Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
    Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
    Day 2,Period 1,Chemistry,CHEM101,Room C,Dr. Brown,8:35am,9:35am
  \`; // Replace with actual timetable text or grid data

  try {
    console.log("Sending request to AI...");
    const result = await parseTimetableWithChuteAI(exampleTimetableText);
    console.log("Parsed Timetable Data:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// test();
*/
