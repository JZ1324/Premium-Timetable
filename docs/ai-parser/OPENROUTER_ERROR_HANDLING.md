# OpenRouter API Error Handling

## Problem

The Premium Timetable application was encountering errors when calling the OpenRouter API:

```
Error calling OpenRouter API: Error: OpenRouter API error: Provider returned error
```

This error was happening in the AI parser functionality, which uses Gemini 2.0 Flash through OpenRouter to convert unstructured timetable data into structured JSON format.

## Diagnosis

The error messages indicated that the provider (Google's Gemini 2.0 Flash) was returning errors, which could be due to:

1. Provider availability issues (Gemini service being down or overloaded)
2. API key limitations or quota issues
3. Malformed requests or other OpenRouter-specific problems

## Solution

We've implemented a simplified and more robust approach to AI parsing with improved error handling:

### 1. Simplified API Parser

The new `aiParserSimplified.js` module replaces the complex error handling and JSON parsing logic with a simpler approach that:

- Makes clean API requests to OpenRouter
- Returns both success and error responses with minimal processing
- Provides the raw API response for debugging
- Implements automatic fallback to multiple API keys

### 2. Detailed Error Diagnostics

The new `apiErrorDiagnostics.js` utility provides:

- Detection of specific error types (authorization, rate limiting, provider errors, etc.)
- Possible causes for each error type
- Actionable recommendations to resolve issues
- Severity assessment
- Formatted error reports

### 3. Intelligent Key Rotation

The updated parser includes:

- Automatic fallback to alternative API keys when one fails
- Different handling strategies based on error type
- Clear logging of API key usage

### 4. Improved User Experience

Error messages now provide:

- More user-friendly descriptions of what went wrong
- Clear suggestions for how to fix issues
- Appropriate level of technical detail

## Usage

### Basic Usage

```javascript
import { parseTimetableWithFallback } from '../services/aiParserSimplified';

// Use the parser with automatic fallback to multiple API keys
const response = await parseTimetableWithFallback(timetableText);

if (response.success) {
  // Use the successfully parsed data
  const result = response.data;
} else {
  // Handle errors with diagnostics
  console.error(`Error: ${response.error}`);
  
  if (response.diagnosis) {
    console.log(`Error type: ${response.diagnosis.errorType}`);
    console.log(`Recommendations: ${response.diagnosis.recommendations.join(', ')}`);
  }
}
```

### Testing the API

A diagnostic tool is available to test the API keys and model availability:

```bash
node test-api-diagnostics.js
```

This will:
- Test each configured API key
- Check if the specified model is available
- Report detailed diagnostics for any issues

## Future Improvements

Potential enhancements to consider:

1. Implementing a local fallback parser for when the API is unavailable
2. Adding support for alternative models (Claude, GPT, etc.)
3. Caching successful responses for similar inputs
4. Implementing retry logic with exponential backoff

## References

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
