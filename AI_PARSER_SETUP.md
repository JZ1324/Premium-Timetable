# AI Parser Integration Guide

This document provides instructions on setting up and using the AI Timetable Parser feature in the Premium Timetable application.

## Overview

The AI Timetable Parser uses Together.ai's language model APIs to automatically parse unstructured timetable data into a structured format that can be imported into the Premium Timetable application. This feature is particularly useful when you have messy or inconsistently formatted timetable data.

## Using the AI Timetable Parser

1. In the application, click the "Import" button
2. In the Import dialog, select the "AI Parser" tab
3. Paste your unstructured timetable data into the text area
4. Click "Parse with AI"
5. The AI will analyze your timetable data and convert it to the required format
6. Once processing is complete, click "Import" to add the parsed timetable to your view

## API Key Management

The Together.ai API key is now managed internally in the application. There is no need for users to enter or manage an API key.

## Troubleshooting

### API Rate Limits

Together.ai may have usage limits depending on your account tier. If you encounter errors related to rate limits, you may need to:
- Wait before trying again
- Upgrade your Together.ai account
- Contact Together.ai support

### Parser Failures

If the AI parser fails to process your timetable:
1. The application will automatically attempt to use a fallback parser
2. Try using the traditional "Paste Timetable" tab with more structured data
3. Format your input data to be more consistent before attempting to parse

## Security Notes

- Your API key is stored locally in your browser and is never sent to any server other than Together.ai
- The application only sends the timetable text to Together.ai for processing
- No user data or personal information is shared with external services

For additional help, please contact support or file an issue on the GitHub repository.
