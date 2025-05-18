/**
 * Test and Fix for the DeepSeek-based AI Timetable Parser
 * 
 * This script tests and fixes issues with tab-delimited timetables parsing
 * in the Premium-Timetable application by enhancing the AI parser's capabilities
 * to properly handle tab-delimited data.
 */

// Import necessary dependencies
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// Sample tab-delimited timetable data for testing
const sampleTimetable = `Day 1\tDay 2\tDay 3\tDay 4\tDay 5\tDay 6\tDay 7\tDay 8\tDay 9\tDay 10
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
S 06 Mr Andrew Savage`;

// Define the AI model configuration
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';

// The enhanced prompt specifically designed for tab-delimited formats
const generateTabDelimitedPrompt = (timetableData) => {
  return `You are an expert at extracting structured timetable data from tab-delimited formats.

I will provide you with a school timetable where days are organized in columns separated by tabs.
Each row typically represents a period, subject, course code, room, or teacher information.

Your task is to convert this into a structured JSON format, organizing classes by day and period.

IMPORTANT: Pay special attention to tab characters (\t) in the first line, which typically separate day headers.
Each column in the tab-separated data represents a different day.

Convert the timetable into this EXACT JSON format:

{
  "days": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
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
};

/**
 * Call the DeepSeek model via OpenRouter API
 * @param {string} timetableData - The tab-delimited timetable data
 * @returns {Object} - The parsed timetable structure
 */
async function callDeepSeekApi(timetableData) {
  console.log('Calling OpenRouter API with DeepSeek Chat model...');
  
  // Add timeout to prevent hanging indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
  
  try {
    console.log('Starting API request with timeout...');
    console.log('Making API call to OpenRouter with model:', MODEL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://premium-timetable.app',
        'X-Title': 'Premium Timetable'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: generateTabDelimitedPrompt(timetableData)
          }
        ],
        temperature: 0, // Set temperature to 0 for consistent results
        max_tokens: 4000, // Ensure we get a complete response
        top_p: 0.9 // Add top_p to control randomness
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error response:', errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Empty response choices from API:', data);
      throw new Error(`No response choices from AI service.`);
    }
    
    if (!data.choices[0].message || !data.choices[0].message.content) {
      console.error('Missing content in API response:', data.choices[0]);
      throw new Error('Missing content in AI service response');
    }
    
    const content = data.choices[0].message.content;
    console.log('Received response from AI service', content ? `(${content.length} chars)` : '(empty)');
    
    // Parse the JSON response from the content string
    try {
      // Clean the content string - sometimes AI models include markdown code block markers
      let cleanedContent = content;
      if (content.includes('```json')) {
        cleanedContent = content.replace(/```json|```/g, '').trim();
      }
      
      const parsedData = JSON.parse(cleanedContent);
      
      // Count actual classes
      let totalClasses = 0;
      for (const day in parsedData.classes) {
        for (const period in parsedData.classes[day]) {
          if (Array.isArray(parsedData.classes[day][period])) {
            totalClasses += parsedData.classes[day][period].length;
          }
        }
      }
      
      console.log(`AI parser found ${totalClasses} total classes`);
      
      // If no classes were found, throw an error
      if (totalClasses === 0) {
        throw new Error('No classes found in AI response');
      }
      
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      console.log('Raw response:', content);
      throw parseError;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

/**
 * Main function to test the DeepSeek model with tab-delimited timetable
 */
async function testDeepSeekTabDelimitedParser() {
  console.log('=== Testing DeepSeek Chat model with tab-delimited timetable ===');
  console.log('This test will verify the improved parsing capabilities for tab-delimited formats');
  
  try {
    console.log('Processing tab-delimited timetable data:');
    console.log(sampleTimetable.split('\n').slice(0, 6).join('\n') + '\n...');
    
    // Call the DeepSeek model
    console.log('\nCalling DeepSeek Chat model (this might take up to 60 seconds)...');
    const result = await callDeepSeekApi(sampleTimetable);
    
    console.log('\nParsing successful! DeepSeek model extracted the timetable data.');
    console.log(`Found ${Object.keys(result.classes).length} days and identified classes.`);
    
    // Save the result to a test-output.json file
    await fs.writeFile(
      path.join(process.cwd(), 'deepseek-parser-result.json'), 
      JSON.stringify(result, null, 2)
    );
    console.log('\nSaved parsed timetable to deepseek-parser-result.json');
    
    // Log a sample of the parsed data
    const sampleDay = Object.keys(result.classes)[0];
    const samplePeriod = Object.keys(result.classes[sampleDay])[0];
    const sampleClass = result.classes[sampleDay][samplePeriod][0];
    
    console.log('\nSample of parsed data:');
    console.log(`Day: ${sampleDay}`);
    console.log(`Period: ${samplePeriod}`);
    console.log(`Subject: ${sampleClass.subject}`);
    console.log(`Code: ${sampleClass.code}`);
    console.log(`Room: ${sampleClass.room}`);
    console.log(`Teacher: ${sampleClass.teacher}`);
    console.log(`Time: ${sampleClass.startTime} - ${sampleClass.endTime}`);
    
    console.log('\n=== Test Completed Successfully ===');
    console.log('The DeepSeek Chat model successfully parsed the tab-delimited timetable data.');
    console.log('✅ Use this approach in the aiParserService.js file for handling tab-delimited formats.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Please check the error details above and try again.');
  }
}

// Execute the test
testDeepSeekTabDelimitedParser();
