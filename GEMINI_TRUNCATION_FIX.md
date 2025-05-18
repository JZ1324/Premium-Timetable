# Gemini Response Truncation Fix

This document explains the special handling added for truncated responses from the Gemini models in the Premium Timetable AI parser service.

## Problem

The OpenRouter API with Gemini models (especially 2.0-flash-exp) frequently returns truncated JSON responses. The truncation typically happens:

1. Around position ~10982 characters
2. Often in the middle of a class definition (especially in the "code" field)
3. Without proper closing of JSON objects

Example of truncated response:
```json
{
  "days": [...],
  "periods": [...],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Mathematics",
          "code": "MATH101",
          ...
        }
      ],
      ...
    },
    ...
    "Day 8": {
      "Period 4": [
        {
          "subject": "English",
          "code": "(10EN
```

## Solution

The AI parser service has been enhanced with a multi-layered approach to handle these truncations:

1. **Early detection**: Check response length in the known truncation range (~10982 characters)

2. **Pattern recognition**: Identify specific truncation patterns (e.g., ending with `"code": "` or in the middle of a string)

3. **Partial data extraction**:
   - Find the last complete class entry
   - Locate the complete period containing it
   - Find the complete day section containing the period
   - Extract all valid data up to that point

4. **Structure completion**: 
   - Balance open and close braces
   - Add missing closing quotes and brackets
   - Ensure the resulting JSON structure is valid

5. **Validation**: Ensure the rebuilt JSON contains the essential timetable structure

## Benefits

- Recovers partial data from truncated responses instead of failing
- Intelligently preserves complete days/periods when possible
- Provides a valid timetable structure even with partial data
- Eliminates the "Provider returned error" issues with Gemini models

## Technical Implementation

The implementation uses regex pattern matching and string manipulation to:

1. Detect truncation patterns specific to Gemini responses
2. Extract the maximum amount of valid data
3. Reconstruct a proper JSON structure
4. Apply syntax fixing for common issues

This solution allows the Premium Timetable app to successfully parse timetables even when the AI model response is truncated.
