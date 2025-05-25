// test-basic-fetch.js - A very basic fetch test for OpenRouter API

const API_KEY = "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"; // Primary key (previously third)
const API_URL = "https://openrouter.ai/api/v1/models"; // Just checking available models

console.log("Starting basic OpenRouter API test...");

// Create a simple fetch request to check API connectivity
fetch(API_URL, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  }
})
.then(response => {
  console.log(`Response status: ${response.status} ${response.statusText}`);
  return response.text();
})
.then(text => {
  console.log("Response received!");
  
  try {
    // Try to parse as JSON
    const data = JSON.parse(text);
    console.log(`Found ${data.data?.length || 0} models`);
    
    // Log first model as example
    if (data.data && data.data.length > 0) {
      console.log("First model:", data.data[0].id);
    }
  } catch (err) {
    console.log("Could not parse response as JSON");
    console.log("Raw response:", text.substring(0, 200) + "...");
  }
})
.catch(error => {
  console.error("Fetch error:", error);
});
