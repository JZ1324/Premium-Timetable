# OpenRouter API Token Limit Handling - May 17, 2025

## Overview

This document explains the implementation of a token limit handling system for the AI timetable parser that uses OpenRouter API with the Gemini 2.0 Flash model. The system now includes multiple API keys with an automatic rotation mechanism when token limits are reached.

## Problem

OpenRouter API has a token limit of 1000 tokens per day for free keys. When this limit is reached, the API returns an error which causes the timetable parsing to fail. Previously, users would see error messages like:

```
Provider returned error
Error parsing with OpenRouter DeepSeek API: Error: Error parsing timetable with OpenRouter API (google/gemini-2.0-flash-exp:free): OpenRouter API error: Provider returned error
```

## Solution: API Key Rotation System

To handle token limits, we've implemented an API key rotation system that:

1. Starts with a primary API key
2. Automatically detects token limit errors
3. Switches to a backup API key when the primary key's token limit is reached
4. Provides detailed logging for better troubleshooting

### Implementation Details

1. **Multiple API Keys Storage**
   ```javascript
   const API_KEYS = [
     "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", // Primary key
     "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", // Second backup key
     "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"  // Third backup key
   ];
   let currentKeyIndex = 0; // Start with the first key
   ```

2. **Dynamic Request Function**
   Created a `makeRequest` function that takes a key index parameter, allowing the system to make requests with different API keys.

3. **Token Limit Detection**
   Added logic to detect token limit-related errors through keywords like "limit", "quota", or "token" in error responses.

4. **Automatic Retry with Backup Key**
   When a token limit error is detected and backup keys are available, the system automatically retries the request with the next key.

5. **Enhanced Error Handling**
   Improved error handling with detailed logging to track which key is being used and the switching process.

## Benefits

1. **Improved Reliability**
   The timetable parsing feature will continue to work even when one API key hits its token limit.

2. **Better User Experience**
   Users won't see token limit errors as the system handles them transparently.

3. **Efficient Resource Management**
   The system only uses backup API keys when needed, preserving their token quotas.

4. **Scalability**
   Additional API keys can be easily added to the `API_KEYS` array for further increased capacity.

## Files Modified

- `/Users/joshuazheng/Downloads/Vscode/timetable premium/Premium-Timetable/src/services/aiParserService.js`

## Testing

To test the token limit handling:

1. Force a token limit error by using an invalid key for the first entry in the `API_KEYS` array
2. Verify that the system properly switches to the backup key
3. Check the console logs to confirm the key rotation is working as expected

For real-world testing, monitor the application logs after heavy usage to verify the key rotation happens automatically when needed.
