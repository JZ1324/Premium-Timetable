// test-openrouter-direct.js - Direct test of OpenRouter API without dependencies
// A minimal standalone script to test the OpenRouter API connection

const API_KEY = "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"; // Primary key (previously third)
const MODEL = "google/gemini-2.0-flash-exp:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Simple test input
const testInput = "Convert this to JSON: Day 1, Period 1, Math, Room A";

// Function to test the OpenRouter API directly
async function testOpenRouterDirect() {
  console.log("Testing OpenRouter API directly...");
  
  const requestBody = {
    "model": MODEL,
    "messages": [
      {
        "role": "system",
        "content": "Convert the input to JSON format."
      },
      {
        "role": "user",
        "content": testInput
      }
    ],
    "response_format": { "type": "json_object" },
    "max_tokens": 500,
    "temperature": 0.1
  };

  try {
    console.log(`Sending request to OpenRouter API using ${MODEL}`);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://timetable-premium.vercel.app", 
        "X-Title": "Premium Timetable App", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    // Get the raw response
    const responseText = await response.text();
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error("API ERROR:", responseText);
      return;
    }
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log("API SUCCESS! Response:");
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (jsonError) {
      console.error("Could not parse response as JSON:", jsonError);
      console.log("Raw response:", responseText);
    }
    
  } catch (error) {
    console.error("Network error:", error);
  }
}

// Function to check model availability
async function checkModelAvailability() {
  console.log("\nChecking model availability...");
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    // Find our specific model
    const ourModel = data.data.find(model => model.id === MODEL);
    
    if (ourModel) {
      console.log(`✅ Model "${MODEL}" is available:`);
      console.log(`   - Context length: ${ourModel.context_length} tokens`);
      console.log(`   - Pricing: ${ourModel.pricing.prompt} per prompt token, ${ourModel.pricing.completion} per completion token`);
    } else {
      console.log(`❌ Model "${MODEL}" was NOT found!`);
      
      // Check for any Gemini models
      const geminiModels = data.data.filter(model => model.id.toLowerCase().includes('gemini'));
      
      if (geminiModels.length > 0) {
        console.log(`Found ${geminiModels.length} other Gemini models that might work:`);
        geminiModels.forEach(model => {
          console.log(`   - ${model.id}`);
        });
      }
    }
  } catch (error) {
    console.error("Error checking model availability:", error);
  }
}

// Run both tests
async function runTests() {
  console.log("=== OPENROUTER DIRECT API TEST ===\n");
  
  // First check if the model is available
  await checkModelAvailability();
  
  // Then test the actual API call
  await testOpenRouterDirect();
  
  console.log("\n=== TEST COMPLETE ===");
}

runTests();
