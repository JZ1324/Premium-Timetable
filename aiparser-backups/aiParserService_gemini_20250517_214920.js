const OPENROUTER_API_KEY = "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";
const MODEL_NAME = "google/gemini-2.0-flash-exp:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Provider: chute (using Gemini 2.0 Flash model)
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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional: Replace <YOUR_SITE_URL> with your actual site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional: Replace <YOUR_SITE_NAME> with your actual site name for rankings on openrouter.ai.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
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
        "temperature": 0
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API request failed:", response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      try {
        const parsedResponse = JSON.parse(data.choices[0].message.content);
        
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
        console.error("Raw AI response content:", data.choices[0].message.content);
        throw new Error("Failed to parse JSON response from AI. Raw content: " + data.choices[0].message.content);
      }
    } else {
      console.error("Unexpected API response structure:", data);
      throw new Error("Unexpected API response structure.");
    }

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
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
