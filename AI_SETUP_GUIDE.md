# AI Parsing Setup Guide

## Current Status
✅ **CORS Issues Fixed** - The application no longer has CORS policy errors  
❌ **API Authentication Failed** - All current API keys have expired or been invalidated  
✅ **User Interface Complete** - Settings panel includes AI model preferences  
✅ **Fallback Logic Implemented** - Multiple models and providers are configured  

## Issue Summary
The AI timetable parsing feature is currently not working because all OpenRouter API keys in the application have expired or been invalidated. You'll see this error:

```
{"error":{"message":"No auth credentials found","code":401}}
```

## How to Fix This

### Step 1: Get a New OpenRouter API Key
1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account (no credit card required initially)
3. Navigate to "API Keys" in your dashboard
4. Click "Create API Key"
5. Copy the new API key (it should start with `sk-or-v1-`)

### Step 2: Update the Application Code
You need to update the API key in **three files**:

1. **`src/services/multiModelParser.js`** (lines 27-32)
2. **`src/services/aiParserService.js`** (lines 30-37)  
3. **`src/services/aiParserSimplified.js`** (lines 11-16)

Replace `"YOUR_NEW_OPENROUTER_API_KEY_HERE"` with your actual API key.

### Step 3: Test Your API Key
Run this command to test if your API key works:
```bash
node test-api-key.js YOUR_ACTUAL_API_KEY_HERE
```

You should see: `✅ API key is working!`

### Step 4: Rebuild and Deploy
After updating the API keys:
```bash
npm run build
```

## Available AI Models
The application is configured to use these free models:
- **DeepSeek**: `deepseek/deepseek-chat-v3-0324:free`
- **Qwen**: `qwen/qwen3-32b:free`, `qwen/qwen3-14b:free`
- **Claude**: `anthropic/claude-3-haiku:free`
- **Gemini**: `google/gemini-2.0-flash-exp:free`
- **Mistral**: `mistralai/mistral-medium:free`, `mistralai/mistral-small:free`

Users can select their preferred model provider in the Settings panel.

## Free Tier Limitations
OpenRouter's free tier includes:
- Limited requests per day
- Access to free models only (marked with `:free`)
- May require verification for some models

## Network Restrictions
If you're on a school network, some AI services may be blocked. The application will detect this and provide helpful error messages suggesting to try a different network.

## Current Features Working
- ✅ Settings panel with AI model preferences
- ✅ Multiple fallback models configured
- ✅ Smart error handling and diagnosis
- ✅ Manual timetable import (JSON format)
- ✅ All other timetable features (display, export, notifications, etc.)

## Developer Notes
- The application now properly handles CORS by using only the required headers
- Authentication logic includes specific 401 error detection
- Fallback mechanism tries different model providers when one fails
- User preferences are saved to localStorage and passed to the parsing functions
- Error messages provide clear guidance for common issues

## Quick Fix for Developers
If you need to get this working immediately:
1. Go to [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Get an API key
4. Replace the first entry in the `API_KEYS` array in all three parser files
5. Test with `node test-api-key.js YOUR_KEY`
6. Rebuild the application

The application architecture is solid - it just needs valid API credentials to function.
