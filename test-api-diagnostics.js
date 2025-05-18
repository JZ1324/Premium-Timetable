// test-api-diagnostics.js - Test the OpenRouter API with diagnostics
// This script helps identify issues with the OpenRouter API and provides detailed error information

// Import both functions correctly
const { parseTimetableSimple } = require('./src/services/aiParserSimplified.js');

// Define API keys directly here for testing
const API_KEYS = [
  "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", // Primary key (previously third)
  "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", // Second backup key
  "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"  // Third backup key
];

// Simple timetable data for testing
const testData = `
Day,Period,Subject,Code,Room,Teacher,StartTime,EndTime
Day 1,Period 1,Mathematics,MATH101,Room A,Mr. Smith,8:35am,9:35am
Day 1,Period 2,Physics,PHY101,Room B,Ms. Jones,9:40am,10:40am
Day 1,Tutorial,Study Hall,TUT101,Library,Ms. Wilson,10:45am,11:20am
Day 1,Period 3,English,ENG101,Room C,Mrs. Davis,11:25am,12:25pm
`;

/**
 * Tests the OpenRouter API with a specific API key
 * @param {number} keyIndex - The index of the API key to use (0, 1, or 2)
 * @returns {Promise<Object>} - The API response or error details
 */
async function testApiKey(keyIndex) {
  console.log(`\n=== TESTING API KEY #${keyIndex + 1} ===`);
  
  // Get the API key from our array
  const apiKey = API_KEYS[keyIndex];
  console.log(`Using API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  
  try {
    console.time(`API Key #${keyIndex + 1} Request`);
    
    // Create a minimal test request directly to verify key validity
    const MODEL = "google/gemini-2.0-flash-exp:free";
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    
    // Make a minimal API request to test the key
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://timetable-premium.vercel.app", 
        "X-Title": "Premium Timetable App", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": [
          {
            "role": "system",
            "content": "You are a simple test assistant."
          },
          {
            "role": "user",
            "content": "Test message. Reply with 'OK'"
          }
        ],
        "max_tokens": 10
      })
    });
    
    console.timeEnd(`API Key #${keyIndex + 1} Request`);
    
    // Get response as text
    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ API Key #${keyIndex + 1}: SUCCESS`);
      
      try {
        // Try to parse as JSON
        const jsonResponse = JSON.parse(responseText);
        console.log(`Response: ${JSON.stringify(jsonResponse).substring(0, 100)}...`);
      } catch (e) {
        console.log(`Raw response: ${responseText.substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ API Key #${keyIndex + 1}: FAILED - Status ${response.status}`);
      console.log(`Error: ${responseText.substring(0, 200)}...`);
    }
    
    return {
      success: response.ok,
      status: response.status,
      response: responseText
    };
  } catch (error) {
    console.log(`❌ API Key #${keyIndex + 1}: ERROR - ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tests the OpenRouter API model availability
 */
async function testOpenRouterModelAvailability() {
  console.log("\n=== TESTING OPENROUTER MODEL AVAILABILITY ===");
  
  try {
    // Use fetch to check model availability through OpenRouter's API
    const response = await fetch("https://openrouter.ai/api/v1/models");
    
    if (!response.ok) {
      console.log(`❌ Could not fetch models: ${response.status} ${response.statusText}`);
      return;
    }
    
    const models = await response.json();
    
    // Check if Gemini models are available
    const geminiModels = models.data.filter(model => 
      model.id.toLowerCase().includes('gemini')
    );
    
    console.log(`Found ${geminiModels.length} Gemini models:`);
    geminiModels.forEach(model => {
      console.log(`- ${model.id}: ${model.pricing.prompt} per prompt token, ${model.pricing.completion} per completion token`);
    });
    
    // Find our specific model
    const ourModel = models.data.find(model => model.id === "google/gemini-2.0-flash-exp:free");
    
    if (ourModel) {
      console.log(`\n✅ Our model "google/gemini-2.0-flash-exp:free" is available!`);
      console.log(`Context window: ${ourModel.context_length} tokens`);
    } else {
      console.log(`\n❌ Our model "google/gemini-2.0-flash-exp:free" was NOT found! It may have been renamed or discontinued.`);
      console.log("Consider updating the model name in the code.");
    }
  } catch (error) {
    console.log(`❌ Error checking model availability: ${error.message}`);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log("=== OPENROUTER API DIAGNOSTICS ===");
  console.log("Running tests to diagnose API issues...\n");
  
  // Test all API keys
  for (let i = 0; i < 3; i++) {
    await testApiKey(i);
  }
  
  // Test model availability
  await testOpenRouterModelAvailability();
  
  console.log("\n=== TESTS COMPLETED ===");
}

// Run the tests
runTests();
