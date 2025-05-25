# AI Parser Migration: Together.ai → OpenRouter.ai

## Migration Summary (May 2025)
The AI timetable parser service has been migrated from Together.ai to OpenRouter.ai. This document outlines the technical details of the migration and how to use the new API.

## Technical Changes

### 1. API Integration
- **Before**: Used Together.ai SDK with structured API calls
- **After**: Uses native fetch API with OpenRouter.ai endpoints

### 2. Key Management
- New API key functions added:
  - `getOpenRouterApiKey()`
  - `setOpenRouterApiKey(apiKey)`
  - `clearOpenRouterApiKey()`

- Backward compatibility maintained with:
  - `getTogetherApiKey()` → redirects to `getOpenRouterApiKey()`
  - `setTogetherApiKey(apiKey)` → redirects to `setOpenRouterApiKey(apiKey)`

### 3. Streaming Implementation
- **Before**: Used Together SDK's async iterator for streaming
- **After**: Manually parses Server-Sent Events (SSE) format:
  ```js
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ") && line !== "data: [DONE]") {
      // Process each data chunk
    }
  }
  ```

### 4. Error Handling
- Updated error detection for OpenRouter-specific patterns:
  - Token limit errors
  - Rate limiting
  - Server errors (500, 503)
  - Timeouts

## Using the OpenRouter API

### Setting Your API Key
You can set your OpenRouter API key in the application using localStorage:
```javascript
localStorage.setItem('OPENROUTER_API_KEY', 'your-openrouter-api-key');
```

### Testing the Integration
You can test if the migration was successful by:
1. Setting your OpenRouter API key
2. Using the Import Timetable function with a sample timetable
3. Verifying the parsed timetable structure is correct

### Troubleshooting
If you encounter issues:
- Check browser console for specific error messages
- Ensure your API key is correctly set and has sufficient credits
- Verify network connectivity to OpenRouter.ai endpoints

## Benefits of Migration
- Access to broader range of LLM models
- More reliable API service with better uptime
- Competitive pricing model
- Future compatibility with multiple AI providers

## Future Improvements
- Add model selection capability
- Implement response caching
- Add fallback model support
