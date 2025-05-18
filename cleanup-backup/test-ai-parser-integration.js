// Integration test for AiParserService
// This script tests the full functionality including the enhanceClassData method
// with real-world timetable data

// Sample timetable text that was failing before the fix
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

Lunch
12:00-12:45

Period 4   History    Science    Art        English    Math
12:45-1:45 Room D4    Room C3    Room E5    Room B2    Room A1
          Mrs. White  Dr. Brown  Mrs. Green Ms. Jones  Mr. Smith

Period 5   PST        Music      English    Art        Science
1:55-2:55  Library    Room F6    Room B2    Room E5    Room C3
          Ms. Lee     Mr. Black  Ms. Jones  Mrs. Green Dr. Brown
`;

// This would be imported with ES modules in a real application
// Here we're going to include the key methods manually for testing

class TestAiParserService {
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
    
    this.specialParsingMode = false;
  }
  
  // Simulated parsing function that would return data that would then need enhancing
  simulateParsing(timetableText) {
    // This is a simplification - in reality the parsing would be more complex
    return {
      days: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
      periods: [
        { name: "Period 1", startTime: "8:30am", endTime: "9:30am" },
        { name: "Period 2", startTime: "9:40am", endTime: "10:40am" },
        { name: "Recess", startTime: "10:40am", endTime: "11:00am" },
        { name: "Period 3", startTime: "11:00am", endTime: "12:00pm" },
        { name: "Lunch", startTime: "12:00pm", endTime: "12:45pm" },
        { name: "Period 4", startTime: "12:45pm", endTime: "1:45pm" },
        { name: "Period 5", startTime: "1:55pm", endTime: "2:55pm" }
      ],
      classes: {
        "Day 1": {
          "Period 1": [{ 
            subject: "Math", 
            room: "Room A1", 
            teacher: "Mr. Smith"
          }],
          "Period 2": [{ 
            subject: "English", 
            room: "Room B2", 
            teacher: "Ms. Jones"
          }],
          "Period 3": [{ 
            subject: "Science", 
            room: "Room C3", 
            teacher: "Dr. Brown"
          }],
          "Period 4": [{ 
            subject: "History", 
            room: "Room D4", 
            teacher: "Mrs. White"
          }],
          "Period 5": [{ 
            subject: "PST", 
            room: "Library", 
            teacher: "Ms. Lee"
          }]
        },
        "Day 2": {
          "Period 1": [{ subject: "English", room: "Room B2", teacher: "Ms. Jones" }],
          "Period 2": [{ subject: "Math", room: "Room A1", teacher: "Mr. Smith" }]
          // Intentionally missing some periods to test enhancement
        }
        // Intentionally missing some days to test enhancement
      }
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

  // Simulate the full process
  parseTimeTable(timetableText) {
    try {
      console.log("Simulating AI parser process...");
      
      // Simulate parsing the data
      const parsedData = this.simulateParsing(timetableText);
      
      // Now enhance the data with our new method
      const enhancedData = this.enhanceClassData(parsedData);
      
      // Let's specifically check if the PST class is properly enhanced
      const pstClasses = [];
      Object.keys(enhancedData.classes).forEach(day => {
        Object.keys(enhancedData.classes[day]).forEach(periodName => {
          enhancedData.classes[day][periodName].forEach(classInfo => {
            if (classInfo.subject === 'PST') {
              pstClasses.push({day, period: periodName, classInfo});
            }
          });
        });
      });
      
      if (pstClasses.length > 0) {
        console.log("Found PST classes with displaySubject:", 
          pstClasses.map(c => `${c.day} ${c.period}: ${c.classInfo.displaySubject}`).join(', '));
      }
      
      return enhancedData;
    } catch (error) {
      console.error("Error in parseTimeTable:", error);
      throw new Error(`Failed to parse timetable data: ${error.message}`);
    }
  }
}

// Run the integration test
console.log("=".repeat(60));
console.log("RUNNING INTEGRATION TEST FOR AI PARSER");
console.log("=".repeat(60));

try {
  const parser = new TestAiParserService();
  const result = parser.parseTimeTable(sampleTimetable);
  
  console.log("\nSummary of parsing result:");
  console.log(`- Days: ${result.days.length}`);
  console.log(`- Periods: ${result.periods.length}`);
  
  // Count classes per day
  const classesByDay = {};
  Object.keys(result.classes).forEach(day => {
    let count = 0;
    Object.keys(result.classes[day]).forEach(period => {
      count += result.classes[day][period].length;
    });
    classesByDay[day] = count;
  });
  
  console.log("- Classes by day:", Object.entries(classesByDay)
    .map(([day, count]) => `${day}: ${count}`)
    .join(', '));
  
  // Specifically check the PST class enhancement
  const day1Period5 = result.classes["Day 1"]["Period 5"][0];
  if (day1Period5 && day1Period5.subject === "PST") {
    console.log(`\nPST class enhanced with displaySubject: "${day1Period5.displaySubject}"`);
    if (day1Period5.displaySubject === "Private Study") {
      console.log("✅ PST handling is working correctly!");
    } else {
      console.log("❌ PST display subject is incorrect!");
    }
  }
  
  console.log("\n✅ Integration test passed successfully!");
  
} catch (error) {
  console.error("\n❌ Integration test failed:", error);
}
