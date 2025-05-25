# Multi-Model Fallback System - May 17, 2025

## Overview

This document outlines the implementation of a multi-model fallback system for the AI timetable parser. The system now rotates through both API keys and model providers to maximize reliability and success rates.

## Problem Background

The timetable parser was encountering errors with the Gemini 2.0 Flash model:
```
Error calling OpenRouter API: Error: OpenRouter API error: Provider returned error
Error parsing with OpenRouter DeepSeek API: Error: Error parsing timetable with OpenRouter API (google/gemini-2.0-flash-exp:free): OpenRouter API error: Provider returned error
```

This "Provider returned error" typically indicates an issue with the model provider rather than with our API key or token limits. These errors can occur due to:
- The provider's backend having availability issues
- The model being temporarily unavailable/overloaded
- The model provider having downtime or maintenance
- The model being deprecated or changed

## Enhanced Solution: Model and API Key Rotation System

To improve reliability, we've implemented a dual fallback mechanism that rotates through both different API keys and different model providers:

### 1. Multiple Model Providers
```javascript
const MODELS = [
  "google/gemini-2.0-flash-exp:free", // Primary model
  "google/gemini-pro-1.5-flash:free", // Alternative Gemini model
  "anthropic/claude-3-haiku:free",    // Alternative provider (Claude)
  "mistralai/mistral-large-latest:free" // Last resort (Mistral)
];
```

### 2. Multiple API Keys
```javascript
const API_KEYS = [
  "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", // Primary key
  "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", // Second backup key
  "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"  // Third backup key
];
```

### Intelligent Fallback Strategy

The system uses an intelligent fallback strategy:

1. For "Provider returned error" issues:
   - The system first tries alternative models with the same API key
   - This addresses model-specific provider issues without wasting token quota

2. For token limit issues:
   - The system rotates to the next API key 
   - This addresses quota limitations while keeping the preferred model

3. Combined fallback:
   - If both issues occur, the system tries different combinations of models and keys
   - This maximizes the chances of successful processing

### Prioritization Logic

The fallback mechanism focuses on identifying the right error type:
- It differentiates between provider errors and quota errors
- For provider errors, it prioritizes switching models
- For quota errors, it prioritizes switching API keys

## Benefits

1. **Higher Success Rate**
   - The system now has multiple backup models and keys
   - It can recover from both provider issues and token limit errors

2. **Improved Reliability**
   - Even if one model provider is having issues, the system can still function
   - Multiple alternative paths ensure continued operation

3. **Intelligent Resource Management**
   - By distinguishing between error types, the system preserves API quota
   - Only switches keys when necessary due to quota limitations
   - Only switches models when necessary due to provider errors

4. **Better Error Reporting**
   - Error messages now include both the model and key information
   - Makes troubleshooting easier by providing more context

## Files Updated

- `/Users/joshuazheng/Downloads/Vscode/timetable premium/Premium-Timetable/src/services/aiParserService.js`
