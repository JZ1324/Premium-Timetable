# Tab-Delimited Parser Enhancement Guide

This document explains how to enhance the AI parser to better handle tab-delimited timetable formats using the DeepSeek Chat model.

## Overview

The Premium-Timetable application's AI parser has been updated to use the DeepSeek Chat model, but it needs specific enhancements to handle tab-delimited timetable formats properly. This guide explains the changes needed.

## Implementation Steps

1. Add a specialized prompt generator for tab-delimited formats
2. Update the parsing logic to detect and handle tab-delimited formats differently
3. Test the enhanced parser with tab-delimited timetable data

### Step 1: Add the Tab-Delimited Prompt Generator

Add the following method to the `AiParserService` class:

```javascript
/**
 * Generate a specialized prompt for tab-delimited timetable formats
 * @param {string} timetableData - The raw timetable data
 * @returns {string} - Specialized prompt for tab-delimited formats
 */
constructTabDelimitedPrompt(timetableData) {
  return `You are an expert at extracting structured timetable data from tab-delimited formats.

I will provide you with a school timetable where days are organized in columns separated by tabs.
Each row typically represents a period, subject, course code, room, or teacher information.

Your task is to convert this into a structured JSON format, organizing classes by day and period.

IMPORTANT: Pay special attention to tab characters (\\t) in the first line, which typically separate day headers.
Each column in the tab-separated data represents a different day.

Convert the timetable into this EXACT JSON format:

{
  "days": [
    "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
    "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
  ],
  "periods": [
    { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
    { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
    { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
    { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
    { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
  ],
  "classes": {
    "Day 1": {
      "Period 1": [
        {
          "subject": "Specialist Mathematics",
          "code": "10SPE251101",
          "room": "M 07",
          "teacher": "Mr Paul Jefimenko",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    },
    "Day 2": {
      "Period 1": [
        {
          "subject": "Mathematics - Advanced",
          "code": "10MAA251105",
          "room": "M 05",
          "teacher": "Mr Scott Kertes",
          "startTime": "8:35am",
          "endTime": "9:35am"
        }
      ],
      "Period 2": [],
      "Period 3": [],
      "Period 4": [],
      "Period 5": []
    }
    // ... and so on for all days
  }
}

For each class entry, extract:
1. subject: The name of the subject (e.g., "Mathematics", "English")
2. code: The course code, typically in parentheses (e.g., "10SPE251101")
3. room: The room number/code (e.g., "M 07", "S 01")
4. teacher: The teacher's name (e.g., "Mr Paul Jefimenko")
5. startTime: Start time of the period
6. endTime: End time of the period

Return ONLY valid JSON without explanations or markdown formatting.

Here is the tab-delimited timetable data:

${timetableData}`;
}
```

### Step 2: Update the Parsing Logic

Modify the AI parsing section in the `parseTimeTable` method to detect tab-delimited formats:

```javascript
// Fallback to AI parsing
try {
  console.log("Attempting AI-based parsing with DeepSeek Chat model");
  
  // Check for tab-delimited format that needs special handling
  const hasTabFormat = timetableData.includes('\t');
  const firstLine = timetableData.split('\n')[0] || '';
  const hasTabsInFirstLine = firstLine.includes('\t');
  const hasDayHeaders = firstLine.toLowerCase().includes('day') || /day\s*\d+/i.test(firstLine);
  
  // Use different prompt based on format detection
  let response;
  if (hasTabFormat && hasTabsInFirstLine && hasDayHeaders) {
    console.log("Using specialized prompt for tab-delimited timetable format");
    const tabDelimitedPrompt = this.constructTabDelimitedPrompt(timetableData);
    response = await this.callAiApi(tabDelimitedPrompt);
  } else {
    console.log("Using standard prompt for timetable format");
    response = await this.callAiApi(timetableData);
  }
  
  // Check if AI returned actual class data
  let aiTotalClasses = 0;
  if (response && response.classes) {
    for (const day in response.classes) {
      for (const period in response.classes[day]) {
        aiTotalClasses += response.classes[day][period].length;
      }
    }
  }
```

### Step 3: Test the Enhanced Parser

1. Create a test file with tab-delimited timetable data
2. Run the parser with the enhanced code
3. Verify that the parser correctly extracts classes from the tab-delimited format

## Example Test Data

```
Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
Period 1
8:35am–9:35am
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Mathematics - Advanced
(10MAA251105)
M 05 Mr Scott Kertes
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
War Boom and Bust
(10WBB251102)
C 07 Ms Dianne McKenzie
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
English
(10ENG251108)
A 08 Mr Robert Hassell
Physics
(10PHY251102)
S 01 Mr Paul Jefimenko
Specialist Mathematics
(10SPE251101)
M 07 Mr Paul Jefimenko
Biology Units 1 & 2
(11BIO251101)
S 06 Mr Andrew Savage
```

## Conclusion

These enhancements will significantly improve the AI parser's ability to handle tab-delimited timetable formats. By using a specialized prompt for the DeepSeek Chat model, we can better extract structured data from complex tab-delimited timetables.
