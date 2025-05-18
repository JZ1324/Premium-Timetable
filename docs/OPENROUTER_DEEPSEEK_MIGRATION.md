# Migration to OpenRouter DeepSeek AI Parser

## Overview
This document describes the migration from the previous AI Parser implementation to the OpenRouter DeepSeek model implementation.

## Changes Made
1. Removed the previous AI parser implementation and fallback parser
2. Implemented a new parser using OpenRouter API with DeepSeek model
3. Updated ImportTimetable.js to use the new parser
4. Updated test files to use the new parser

## Implementation Details

### OpenRouter DeepSeek Integration
- API Endpoint: https://openrouter.ai/api/v1/chat/completions
- Model: deepseek/deepseek-chat-v3-0324:free
- Provider: chute
- Temperature: 0

### Key Features
- Provides robust timetable parsing capabilities
- Uses the same expected JSON output format as before
- Returns structured timetable data with days, periods, and classes
- Handles potential response format variations (singular vs plural key names)

### Code Structure
The new implementation consists of a single async function `parseTimetableWithChuteAI` that:
1. Takes timetable text as input
2. Sends a request to the OpenRouter API with a system prompt
3. Processes the API response
4. Returns the parsed timetable data

## Usage
Import and use the parser as follows:

```javascript
import { parseTimetableWithChuteAI } from '../services/aiParserService';

// Use the parser
async function parseTimetable(timetableText) {
  try {
    const result = await parseTimetableWithChuteAI(timetableText);
    // Process the result
    if (result && result.days && result.periods && result.classes) {
      // Success - use the parsed data
    }
  } catch (error) {
    // Handle error
  }
}
```

## Error Handling
The parser includes robust error handling for:
- API request failures
- Invalid JSON responses
- Unexpected API response structures
- Inconsistent key naming (e.g., "day" vs "days", "period" vs "periods", "class" vs "classes")
- Missing or invalid data structures in the response

## Testing
Tests have been updated to use the new parser implementation and can be run using the test runner.

## Known Issues and Solutions

### Key Name Inconsistency
**Issue:** The DeepSeek model sometimes returns responses with singular key names (`"day"`, `"period"`, `"class"`) instead of the expected plural forms (`"days"`, `"periods"`, `"classes"`).

**Solution:** The parser includes normalization logic that checks for both singular and plural key names and standardizes them to the plural form expected by the application.

### Response Validation
**Issue:** Occasionally, the model might return incomplete data structures.

**Solution:** Additional validation has been implemented to check that all required data structures (days array, periods array, and classes object) are present and valid before returning the response.

### JSON Formatting
**Issue:** In rare cases, the model might return malformed JSON or JSON with markdown code blocks.

**Solution:** The parser handles JSON parsing errors gracefully and provides detailed error messages for debugging purposes. The system prompt has been updated to explicitly request proper JSON formatting.
