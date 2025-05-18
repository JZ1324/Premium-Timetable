# OpenRouter Gemini API Fix Documentation

## Overview

This document details the fixes implemented to resolve the "Provider returned error" issue when using the OpenRouter API with the Gemini 2.0 Flash model for timetable parsing.

## Problem

The application was encountering errors when making API requests to OpenRouter using the Gemini 2.0 Flash model:

```
OpenRouter API returned an error: Provider returned error
Error parsing with OpenRouter DeepSeek API: Error: Error parsing timetable with OpenRouter API (google/gemini-2.0-flash-exp:free): OpenRouter API error: Provider returned error
```

This error could occur due to:
- Incompatible request format for the Gemini model
- Model availability/quota issues with OpenRouter
- Changes in the OpenRouter API requirements for Gemini models

## Implemented Fixes

### 1. Added Model Fallback Mechanism

Implemented a fallback system that tries an alternative model if the primary model fails:
- Primary: `google/gemini-2.0-flash-exp:free`
- Fallback: `google/gemini-pro-1.5:free`

### 2. Improved Request Structure

Enhanced the API request format for better compatibility:
- Added a system message to set the context
- Used a single user message instead of complex content arrays
- Added response format specification requesting JSON
- Set appropriate parameters (max_tokens, temperature)

### 3. Enhanced Response Handling

Improved the code to handle different response structures:
- Added support for multiple response formats
- Added better error detection and reporting
- Added proper validation of the parsed data

### 4. Improved JSON Parsing

Enhanced the JSON extraction and parsing:
- Added support for different code block markers
- Added JSON cleaning and fixing for malformed responses
- Added validation of the normalized response structure

### 5. Added Automatic Backup Functionality

Implemented automatic backup creation when running in Node.js environments to preserve changes and allow for rollbacks if needed.

## Expected Results

With these changes, the timetable parser should:
1. Successfully parse timetables using the primary Gemini model when possible
2. Automatically fall back to an alternative model if the primary fails
3. Properly extract and format JSON data from the model responses
4. Include Tutorial periods in the parsed timetable data as specified in the prompt
5. Handle various input and output formats more robustly

## Testing

The changes should be tested with different timetable formats to ensure they are correctly parsed, with special attention to verifying that Tutorial periods are properly included in the output data.
