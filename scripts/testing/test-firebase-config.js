#!/usr/bin/env node
/**
 * Test Firebase configuration and API key validity
 */

const https = require('https');
const config = require('./src/firebase-config.js').default;

console.log('Testing Firebase configuration...');
console.log('Project ID:', config.projectId);
console.log('Auth Domain:', config.authDomain);
console.log('API Key:', config.apiKey.substring(0, 10) + '...');

// Test 1: Check if API key format is valid
if (!config.apiKey || !config.apiKey.startsWith('AIza')) {
  console.error('❌ Invalid API key format');
  process.exit(1);
}

// Test 2: Check if we can reach the Firebase Auth REST API
const testUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.apiKey}`;

console.log('\nTesting Firebase Auth API accessibility...');

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  port: 443,
  path: `/v1/accounts:lookup?key=${config.apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 400 && response.error && response.error.message) {
        if (response.error.message.includes('INVALID_ID_TOKEN') || 
            response.error.message.includes('MISSING_ID_TOKEN')) {
          console.log('✅ API key is valid (expected error for test call)');
        } else if (response.error.message.includes('API_KEY_INVALID')) {
          console.log('❌ API key is invalid');
        } else {
          console.log('⚠️  Unexpected error:', response.error.message);
        }
      } else {
        console.log('Response:', data);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Network error:', e.message);
});

// Send empty body for the test
req.write(JSON.stringify({}));
req.end();
