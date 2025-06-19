#!/usr/bin/env node
/**
 * Simple script to test if an OpenRouter API key is working
 * Usage: node test-api-key.js YOUR_API_KEY_HERE
 */

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('Usage: node test-api-key.js YOUR_API_KEY_HERE');
  process.exit(1);
}

async function testApiKey(apiKey) {
  console.log(`Testing API key: ${apiKey.substring(0, 10)}...`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [{ role: 'user', content: 'Hello, are you working?' }],
        max_tokens: 20
      })
    });

    const data = await response.text();
    
    if (response.ok) {
      console.log('✅ API key is working!');
      console.log('Response:', data);
    } else {
      console.log('❌ API key failed');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testApiKey(API_KEY);
