# DeepSeek Chat Tab-Delimited Timetable Parser Enhancement

## Overview

This document summarizes the enhancements made to the Premium-Timetable application's AI parser to better handle tab-delimited timetable formats using the DeepSeek Chat model (`deepseek/deepseek-chat-v3-0324:free`).

## Key Improvements

1. **Model Update**: Changed from Meta Llama 3.3 to DeepSeek Chat v3
2. **Specialized Tab-Delimited Format Handling**: Added detection and specialized parsing for tab-delimited timetables
3. **Enhanced Prompt Engineering**: Created format-specific prompts to better guide the AI model
4. **Improved Error Handling**: Added robust error handling and recovery mechanisms
5. **Comprehensive Testing**: Created test scripts to validate the enhanced parser

## Implementation Details

### 1. Model Update

The AI model was changed from `meta-llama/llama-3.3-8b-instruct:free` to `deepseek/deepseek-chat-v3-0324:free` in the AI parser service configuration:

```javascript
// Before
this.MODEL = 'meta-llama/llama-3.3-8b-instruct:free';

// After
this.MODEL = 'deepseek/deepseek-chat-v3-0324:free';
```

### 2. Tab-Delimited Format Analysis

Added a specialized method to analyze timetable formats and detect tab-delimited structures:

```javascript
analyzeTimetableFormat(timetableData) {
  if (!timetableData || timetableData.trim() === '') {
    return { isTabDelimited: false, tabCount: 0, lineCount: 0 };
  }
  
  try {
    // Split the input by lines and get the first non-empty line
    const lines = timetableData.trim().split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { isTabDelimited: false, tabCount: 0, lineCount: 0 };
    }
    
    const firstLine = lines[0];
    
    // Check for tab-delimited format
    const tabCount = (firstLine.match(/\t/g) || []).length;
    
    // Check if first line contains multiple day headers
    let dayHeaderCount = 0;
    
    // Check for day headers like "Day 1", "Day 2", etc.
    const dayMatches = firstLine.match(/Day\s*\d+/gi) || [];
    dayHeaderCount += dayMatches.length;
    
    // Check for weekday names
    const weekdayPatterns = [
      /\b(Mon|Monday)\b/i,
      /\b(Tue|Tuesday)\b/i,
      /\b(Wed|Wednesday)\b/i,
      /\b(Thu|Thurs|Thursday)\b/i,
      /\b(Fri|Friday)\b/i
    ];
    
    for (const pattern of weekdayPatterns) {
      if (pattern.test(firstLine)) {
        dayHeaderCount++;
      }
    }
    
    // Analyze if this is likely a tab-delimited timetable
    const isTabDelimited = tabCount >= 2 || (tabCount > 0 && dayHeaderCount >= 2);
    
    return {
      isTabDelimited,
      tabCount,
      dayHeaderCount,
      lineCount: lines.length,
      hasWeekdayHeaders: weekdayPatterns.some(p => p.test(firstLine))
    };
  } catch (error) {
    console.error('Error analyzing timetable format:', error);
    return { isTabDelimited: false, error: error.message };
  }
}
```

### 3. Enhanced Tab-Delimited Format Detection and Processing

Updated the main parsing function to use specialized handling for tab-delimited formats:

```javascript
// Check if this is a tab-delimited format that needs specialized handling
const formatAnalysis = this.analyzeTimetableFormat(timetableData);
console.log("Format analysis result:", formatAnalysis);

let response;

// If this is a tab-delimited format, use specialized parsing
if (formatAnalysis.isTabDelimited) {
  console.log("Using specialized tab-delimited parser with DeepSeek model");
  
  // First try with the tabDelimitedParser module
  try {
    const tabResult = this.tabParser.parseTabDelimitedTimetable(
      timetableData, 
      this.defaultDays, 
      this.defaultPeriods
    );
    
    // Check if we got meaningful results
    let tabTotalClasses = 0;
    for (const day in tabResult.classes) {
      for (const period in tabResult.classes[day]) {
        tabTotalClasses += tabResult.classes[day][period].length;
      }
    }
    
    if (tabTotalClasses >= 3) {
      console.log("Tab parser successful with classes found");
      return this.enhanceClassData(tabResult);
    }
  } catch (tabError) {
    console.error("Tab parser failed with error:", tabError);
  }
  
  // If tabParser didn't work well, try with the specialized DeepSeek prompt
  console.log("Using specialized DeepSeek prompt for tab-delimited format");
  const tabDelimitedPrompt = this.constructTabDelimitedPrompt(timetableData);
  response = await this.callAiApi(tabDelimitedPrompt);
} else {
  // Standard AI parsing
  console.log("Using standard prompt for timetable format");
  response = await this.callAiApi(timetableData);
}
```

### 3. Specialized Prompt for Tab-Delimited Formats

Created a specialized prompt generator method for tab-delimited timetables:

```javascript
constructTabDelimitedPrompt(timetableData) {
  return `You are an expert at extracting structured timetable data from tab-delimited formats.

I will provide you with a school timetable where days are organized in columns separated by tabs.
Each row typically represents a period, subject, course code, room, or teacher information.

Your task is to convert this into a structured JSON format, organizing classes by day and period.

IMPORTANT: Pay special attention to tab characters (\\t) in the first line, which typically separate day headers.
Each column in the tab-separated data represents a different day.

Convert the timetable into this EXACT JSON format:
...
`;
}
```

### 4. Additional Enhancements

- Increased API call timeout from 30 to 60 seconds to allow for more complex timetable processing
- Added more detailed logging for easier debugging
- Enhanced error handling with specific messages for various API failure conditions
- Improved the format analysis function to better detect tab-delimited formats

## Testing

Several test scripts were created to validate the enhanced parser:

1. `test-tab-delimited-enhancement.sh`: A comprehensive test script that runs both the specialized tab parser and the DeepSeek integration tests
2. `test-tab-delimited-enhanced.js`: A new test script that validates both the format detection and specialized parsing capabilities
3. `test-deepseek-tab-parser.js`: A specialized test for the DeepSeek model with tab-delimited formats
4. `TAB_DELIMITED_PARSER_GUIDE.md`: A guide with implementation instructions and examples

The test scripts include multiple tab-delimited format examples of varying complexity, including:
- Simple tab-delimited formats with days as columns
- Complex tab-delimited formats with multi-line entries per class
- Edge cases with missing data or unusual formatting

## Integration Components

The enhanced parser uses a multi-layered approach:

1. **Format Detection**: The `analyzeTimetableFormat` method identifies if the timetable uses tab-delimited structure
2. **Specialized Parser**: The `tabDelimitedParser` module provides direct parsing of tab-delimited formats without requiring AI
3. **DeepSeek Prompt**: If direct parsing isn't sufficient, a specialized prompt is sent to the DeepSeek Chat model
4. **Fallback Mechanism**: The system falls back to standard parsing if specialized methods fail

This layered approach ensures maximum reliability when processing a wide variety of timetable formats.

## Conclusion

The enhanced AI parser now effectively handles tab-delimited timetable formats using the DeepSeek Chat model. The improvements make the parser more robust and accurate when processing tab-delimited timetables, which are commonly used in educational institutions.

These changes have been thoroughly tested and validated with sample data, ensuring that the Premium-Timetable application can reliably parse a wide variety of timetable formats.

### Benefits

1. **Improved Accuracy**: Better handling of tab-delimited formats results in more accurate parsing
2. **Faster Processing**: The specialized tab parser can handle common formats without requiring AI calls
3. **Enhanced Reliability**: The multi-layered approach provides multiple fallbacks
4. **Better Model**: The DeepSeek Chat model provides enhanced understanding of complex timetable structures
5. **Comprehensive Testing**: Extensive test scripts validate the implementation in various scenarios
