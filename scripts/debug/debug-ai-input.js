#!/usr/bin/env node
/**
 * Debug script to test what data is being sent to the AI parser
 */

import fetch from 'node-fetch';

// Simple test to see what the AI actually receives
async function testAiParser() {
  console.log('=== AI PARSER DEBUG TEST ===');
  
  // Sample timetable data - let's create a simple test case
  const sampleTimetable = `Day 1	Day 2	Day 3	Day 4	Day 5	Day 6	Day 7	Day 8	Day 9	Day 10
Period 1
8:35am–9:35am
Psychology
(10PSY252103)
C 07 Ms Dianne McKenzie	Literature
(10LIT252101)
I 03 Miss Olivia Berry	Mathematics
(10MAT252104)
B 15 Mr John Smith	Science
(10SCI252105)
L 02 Dr Sarah Wilson	History
(10HIS252106)
H 08 Mrs Jane Brown	Art
(10ART252107)
A 12 Ms Lisa Green	Music
(10MUS252108)
M 05 Mr Tom White	PE
(10PE252109)
Gym Mr Mike Strong	English
(10ENG252110)
E 04 Miss Kate Davis	Free Study
Free Study
Library Study Area`;

  console.log('Sample timetable data:');
  console.log('Length:', sampleTimetable.length, 'characters');
  console.log('First 500 chars:', sampleTimetable.substring(0, 500));
  console.log('Last 200 chars:', sampleTimetable.substring(Math.max(0, sampleTimetable.length - 200)));
  console.log('\n=== TESTING API CALL ===');

  // Test API call
  const API_KEY = "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";
  const API_URL = "https://openrouter.ai/api/v1/chat/completions";
  
  const simplePrompt = `Extract class information from this timetable data and return as JSON:

{
  "days": ["Day 1", "Day 2", etc],
  "periods": [{"name": "Period 1", "startTime": "8:35am", "endTime": "9:35am"}],
  "classes": {
    "Day 1": {
      "Period 1": [{"subject": "Psychology", "code": "10PSY252103", "room": "C 07", "teacher": "Ms Dianne McKenzie"}]
    }
  }
}

CRITICAL: Extract REAL data from the input. Do NOT use "Unknown" values.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [
          { role: 'system', content: 'You are a timetable parser. Return only valid JSON.' },
          { role: 'user', content: simplePrompt + '\n\nTimetable data:\n' + sampleTimetable }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    const result = await response.text();
    console.log('API Response Status:', response.status);
    console.log('API Response:', result);
    
    if (response.ok) {
      try {
        const parsed = JSON.parse(result);
        if (parsed.choices && parsed.choices[0]) {
          console.log('\n=== EXTRACTED CONTENT ===');
          console.log(parsed.choices[0].message.content);
          
          try {
            const contentJson = JSON.parse(parsed.choices[0].message.content);
            console.log('\n=== PARSED JSON ===');
            console.log(JSON.stringify(contentJson, null, 2));
          } catch (e) {
            console.log('Failed to parse content as JSON:', e.message);
          }
        }
      } catch (e) {
        console.log('Failed to parse response:', e.message);
      }
    }
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testAiParser();
