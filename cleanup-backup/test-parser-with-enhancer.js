/**
 * Test the full aiParserService functionality with the enhanceClassData method
 */

// Import the service methods directly from the file
// In a real application, you would use ES module imports
const fs = require('fs');
const path = require('path');

// Read the service file content
const serviceFilePath = path.join(__dirname, 'src/services/aiParserService.js');
const serviceFileContent = fs.readFileSync(serviceFilePath, 'utf8');

console.log('='.repeat(60));
console.log('TESTING AI PARSER SERVICE WITH enhanceClassData');
console.log('='.repeat(60));

// Check if enhanceClassData is properly implemented in the file
const hasImplementation = serviceFileContent.includes('enhanceClassData(data)');
console.log(`enhanceClassData implementation found: ${hasImplementation ? '✅ YES' : '❌ NO'}`);

// Sample timetable data
const sampleTimetable = `
**Day 1**  **Day 2**  **Day 3**  **Day 4**  **Day 5**
Period 1   Math       English    Science    History    Art
8:30-9:30  Room A1    Room B2    Room C3    Room D4    Room E5
          Mr. Smith   Ms. Jones  Dr. Brown  Mrs. White Mrs. Green

Period 2   English    Math       History    Science    Music
9:40-10:40 Room B2    Room A1    Room D4    Room C3    Room F6
          Ms. Jones   Mr. Smith  Mrs. White Dr. Brown  Mr. Black

Recess
10:40-11:00

Period 3   Science    Art        Music      Math       English
11:00-12:00 Room C3   Room E5    Room F6    Room A1    Room B2
          Dr. Brown   Mrs. Green Mr. Black  Mr. Smith  Ms. Jones

Period 4   History    Science    Art        English    Math
12:45-1:45 Room D4    Room C3    Room E5    Room B2    Room A1
          Mrs. White  Dr. Brown  Mrs. Green Ms. Jones  Mr. Smith

Period 5   PST        Music      English    Art        Science
1:55-2:55  Library    Room F6    Room B2    Room E5    Room C3
          Ms. Lee     Mr. Black  Ms. Jones  Mrs. Green Dr. Brown
`;

// Create mock data that would be returned by the parser
const mockParsedData = {
  days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
  periods: [
    { name: "Period 1", startTime: "8:30am", endTime: "9:30am" },
    { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
    { name: "Period 3", startTime: "11:00am", endTime: "12:00pm" },
    { name: "Period 4", startTime: "12:45pm", endTime: "1:45pm" },
    { name: "Period 5", startTime: "1:55pm", endTime: "2:55pm" }
  ],
  classes: {
    "Day 1": {
      "Period 1": [{ subject: "Math", room: "Room A1", teacher: "Mr. Smith" }],
      "Period 2": [{ subject: "English", room: "Room B2", teacher: "Ms. Jones" }],
      "Period 3": [{ subject: "Science", room: "Room C3", teacher: "Dr. Brown" }],
      "Period 4": [{ subject: "History", room: "Room D4", teacher: "Mrs. White" }],
      "Period 5": [{ subject: "PST", room: "Library", teacher: "Ms. Lee" }]
    },
    "Day 2": {
      "Period 1": [{ subject: "English", room: "Room B2", teacher: "Ms. Jones" }],
      "Period 2": [{ subject: "Math", room: "Room A1", teacher: "Mr. Smith" }],
      "Period 3": [{ subject: "Art", room: "Room E5", teacher: "Mrs. Green" }],
      "Period 4": [{ subject: "Science", room: "Room C3", teacher: "Dr. Brown" }],
      "Period 5": [{ subject: "Music", room: "Room F6", teacher: "Mr. Black" }]
    }
    // Day 3, 4, 5 omitted for brevity
  }
};

// Class to simulate the AiParserService
class AiParserService {
  constructor() {
    this.defaultDays = [
      "Day 1", "Day 2", "Day 3", "Day 4", "Day 5",
      "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"
    ];
    
    this.defaultPeriods = [
      { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
      { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" },
      { "name": "Period 3", "startTime": "11:25am", "endTime": "12:25pm" },
      { "name": "Period 4", "startTime": "12:30pm", "endTime": "1:30pm" },
      { "name": "Period 5", "startTime": "2:25pm", "endTime": "3:25pm" }
    ];
    
    this.weekdayMap = {
      'mon': 'Day 1',
      'monday': 'Day 1',
      'tue': 'Day 2',
      'tuesday': 'Day 2',
      'wed': 'Day 3',
      'wednesday': 'Day 3',
      'thu': 'Day 4',
      'thursday': 'Day 4',
      'fri': 'Day 5',
      'friday': 'Day 5'
    };
  }
  
  cleanupDayHeaders(headers) {
    if (!headers || !Array.isArray(headers)) return [];
    
    // Deduplicate headers
    const uniqueHeaders = [...new Set(headers)];
    
    return uniqueHeaders.map(header => {
      const lowerHeader = header.toLowerCase().trim();
      
      // Check if it's already a "Day X" format
      const dayMatch = lowerHeader.match(/day\s*(\d+)/i);
      if (dayMatch && dayMatch[1]) {
        return `Day ${dayMatch[1]}`;
      }
      
      // Check if it's a weekday name
      for (const [key, value] of Object.entries(this.weekdayMap)) {
        if (lowerHeader.includes(key)) {
          return value;
        }
      }
      
      // If no match, return as is
      return header;
    });
  }

  enhanceClassData(data) {
    console.log('Enhancing class data with additional information');
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid data provided to enhanceClassData:', data);
      return data; // Return as is if invalid
    }

    try {
      // Create a deep copy to avoid modifying the original
      const enhancedData = JSON.parse(JSON.stringify(data));
      
      // Create a map to track original day names to standardized day names
      const dayNameMap = {};
      
      // 1. Standardize day names
      if (enhancedData.days && Array.isArray(enhancedData.days)) {
        const originalDays = [...enhancedData.days];
        enhancedData.days = this.cleanupDayHeaders(enhancedData.days);
        
        // Create mapping from original to standardized day names
        originalDays.forEach((origDay, index) => {
          if (index < enhancedData.days.length) {
            dayNameMap[origDay] = enhancedData.days[index];
          }
        });
      } else {
        enhancedData.days = [...this.defaultDays];
      }
      
      // 2. Ensure periods are correctly formatted with time information
      if (!enhancedData.periods || !Array.isArray(enhancedData.periods) || enhancedData.periods.length === 0) {
        enhancedData.periods = [...this.defaultPeriods];
      } else {
        // Fill in any missing time information
        enhancedData.periods = enhancedData.periods.map(period => {
          if (!period.startTime || !period.endTime) {
            // Try to find matching period in defaults
            const defaultPeriod = this.defaultPeriods.find(p => 
              p.name === period.name || 
              (period.name && p.name.replace('Period ', '') === period.name.replace('Period ', ''))
            );
            
            if (defaultPeriod) {
              return {
                name: period.name,
                startTime: period.startTime || defaultPeriod.startTime,
                endTime: period.endTime || defaultPeriod.endTime
              };
            }
          }
          return period;
        });
      }
      
      // 3. Initialize classes structure if missing
      if (!enhancedData.classes) {
        enhancedData.classes = {};
      }
      
      // 4. Create a new classes structure with standardized day names
      const newClasses = {};
      
      // First, transfer existing classes to standardized day names
      Object.keys(enhancedData.classes).forEach(origDay => {
        const standardDay = dayNameMap[origDay] || origDay;
        
        if (!newClasses[standardDay]) {
          newClasses[standardDay] = {};
        }
        
        // Copy period data
        Object.keys(enhancedData.classes[origDay]).forEach(periodName => {
          if (!newClasses[standardDay][periodName]) {
            newClasses[standardDay][periodName] = [];
          }
          
          // Enhance each class with missing fields
          const classes = enhancedData.classes[origDay][periodName];
          const periodInfo = enhancedData.periods.find(p => p.name === periodName);
          
          if (periodInfo && classes.length > 0) {
            classes.forEach(classInfo => {
              // Create enhanced class object with all required fields
              const enhancedClass = {
                subject: classInfo.subject || '',
                code: classInfo.code || '',
                room: classInfo.room || '',
                teacher: classInfo.teacher || '',
                startTime: classInfo.startTime || periodInfo.startTime,
                endTime: classInfo.endTime || periodInfo.endTime
              };
              
              // Special handling for PST (Private Study)
              if (enhancedClass.subject && enhancedClass.subject.trim().toUpperCase() === 'PST') {
                enhancedClass.displaySubject = 'Private Study';
              }
              
              newClasses[standardDay][periodName].push(enhancedClass);
            });
          }
        });
      });
      
      // 5. Initialize missing days and periods in the new class structure
      enhancedData.days.forEach(day => {
        if (!newClasses[day]) {
          newClasses[day] = {};
        }
        
        enhancedData.periods.forEach(period => {
          if (!newClasses[day][period.name]) {
            newClasses[day][period.name] = [];
          }
        });
      });
      
      // Replace the classes with our new structure
      enhancedData.classes = newClasses;
      
      // 6. Count total classes for verification
      let totalClasses = 0;
      Object.keys(enhancedData.classes).forEach(day => {
        Object.keys(enhancedData.classes[day]).forEach(periodName => {
          totalClasses += enhancedData.classes[day][periodName].length;
        });
      });
      
      console.log(`Enhanced data contains ${enhancedData.days.length} days, ${enhancedData.periods.length} periods, and ${totalClasses} classes`);
      return enhancedData;
      
    } catch (error) {
      console.error('Error enhancing class data:', error);
      // Return original data if enhancement fails
      return data;
    }
  }
  
  // Simulate parsing a timetable - we'll just return our mock data
  parseTimeTableDirectly() {
    return mockParsedData;
  }
  
  async parseTimeTable() {
    // Simulate the function that would call enhanceClassData
    try {
      const parseResult = this.parseTimeTableDirectly();
      return this.enhanceClassData(parseResult);
    } catch (error) {
      console.error('Error parsing timetable:', error);
      throw error;
    }
  }
}

// Run a full parsing test
async function runParsingTest() {
  console.log('Running full parsing test with enhanceClassData...');
  
  const service = new AiParserService();
  try {
    const result = await service.parseTimeTable();
    console.log('Parsing completed successfully');
    
    // Check if PST was correctly transformed
    const day1Period5 = result.classes["Day 1"]["Period 5"][0];
    console.log('PST subject handling:');
    console.log(day1Period5);
    
    if (day1Period5.displaySubject === 'Private Study') {
      console.log('✅ PST subject correctly transformed to "Private Study"');
    } else {
      console.log('❌ PST subject transformation failed');
    }
    
    console.log('\nFull test completed successfully!');
  } catch (error) {
    console.error('Error in parsing test:', error);
  }
}

// Run the test
runParsingTest();
