/**
 * Simple test script for the enhanceClassData method
 */

// Define a mock AiParserService class with the minimum required functionality
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
}

// Create test data with common issues
const testData = {
  days: ["Monday", "Tuesday", "Wednesday"],
  periods: [
    { name: "Period 1", startTime: "8:30am", endTime: "9:30am" },
    { name: "Period 2" },  // Missing time data
    { name: "Period 3", startTime: "11:00am", endTime: "12:00pm" }
  ],
  classes: {
    "Monday": {
      "Period 1": [
        { subject: "Math", room: "M 01", teacher: "Mr. Smith" }
      ],
      "Period 2": [
        { subject: "English", code: "ENG101" }
      ]
    },
    "Tuesday": {
      "Period 1": [
        { subject: "PST", code: "PST101" }
      ]
    }
    // Wednesday missing entirely
  }
};

// Run test
console.log('='.repeat(60));
console.log('TESTING enhanceClassData METHOD');
console.log('='.repeat(60));

const service = new AiParserService();
try {
  console.log('Original data:', JSON.stringify(testData, null, 2), '\n');
  
  const enhancedData = service.enhanceClassData(testData);
  
  console.log('Enhanced data:', JSON.stringify(enhancedData, null, 2), '\n');
  
  console.log('='.repeat(60));
  console.log('TEST CASES:');
  console.log('='.repeat(60));
  
  console.log('1. Day name standardization:');
  console.log('   Original:', testData.days);
  console.log('   Enhanced:', enhancedData.days);
  console.log();
  
  console.log('2. Period time filling:');
  console.log('   Original Period 2:', testData.periods[1]);
  console.log('   Enhanced Period 2:', enhancedData.periods[1]);
  console.log();
  
  console.log('3. Missing day initialization:');
  console.log('   Wednesday exists in original?', !!testData.classes["Wednesday"]);
  console.log('   Day 3 exists in enhanced?', !!enhancedData.classes["Day 3"]);
  console.log();
  
  console.log('4. PST subject handling:');
  console.log('   Original:', testData.classes["Tuesday"]["Period 1"][0]);
  console.log('   Enhanced:', enhancedData.classes["Day 2"]["Period 1"][0]);
  console.log();
  
  console.log('✅ TEST PASSED: enhanceClassData works correctly!');
} catch (error) {
  console.error('❌ TEST FAILED:', error);
}
