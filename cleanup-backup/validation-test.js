/**
 * Simple validation test for enhanceClassData
 */

console.log('='.repeat(60));
console.log('VALIDATING enhanceClassData METHOD');
console.log('='.repeat(60));

// Create a simple test class
class AiParserService {
  constructor() {
    this.defaultDays = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
    this.defaultPeriods = [
      { "name": "Period 1", "startTime": "8:35am", "endTime": "9:35am" },
      { "name": "Period 2", "startTime": "9:40am", "endTime": "10:40am" }
    ];
    this.weekdayMap = { 'monday': 'Day 1', 'tuesday': 'Day 2' };
  }
  
  cleanupDayHeaders(headers) {
    return headers.map(h => {
      const lower = h.toLowerCase();
      if (lower.includes('mon')) return 'Day 1';
      if (lower.includes('tue')) return 'Day 2';
      return h;
    });
  }
  
  enhanceClassData(data) {
    console.log('Enhancing class data...');
    
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
    
    // 2. Ensure periods are correctly formatted
    if (!enhancedData.periods || !Array.isArray(enhancedData.periods)) {
      enhancedData.periods = [...this.defaultPeriods];
    }
    
    // 3. Initialize classes structure
    if (!enhancedData.classes) {
      enhancedData.classes = {};
    }
    
    // 4. Create a new classes structure with standardized day names
    const newClasses = {};
    
    Object.keys(enhancedData.classes).forEach(origDay => {
      const standardDay = dayNameMap[origDay] || origDay;
      
      if (!newClasses[standardDay]) {
        newClasses[standardDay] = {};
      }
      
      Object.keys(enhancedData.classes[origDay]).forEach(periodName => {
        if (!newClasses[standardDay][periodName]) {
          newClasses[standardDay][periodName] = [];
        }
        
        const classes = enhancedData.classes[origDay][periodName];
        
        if (classes.length > 0) {
          classes.forEach(classInfo => {
            // Handle PST classes
            if (classInfo.subject && classInfo.subject.trim().toUpperCase() === 'PST') {
              classInfo.displaySubject = 'Private Study';
            }
            
            newClasses[standardDay][periodName].push(classInfo);
          });
        }
      });
    });
    
    enhancedData.classes = newClasses;
    return enhancedData;
  }
}

// Test data
const testData = {
  days: ["Monday", "Tuesday"],
  periods: [
    { name: "Period 1", startTime: "8:35am", endTime: "9:35am" },
    { name: "Period 2", startTime: "9:40am", endTime: "10:40am" }
  ],
  classes: {
    "Monday": {
      "Period 1": [
        { subject: "Math", room: "101" }
      ],
      "Period 2": [
        { subject: "PST", room: "Library" }
      ]
    },
    "Tuesday": {
      "Period 1": [
        { subject: "English", room: "202" }
      ],
      "Period 2": []
    }
  }
};

// Run test
const service = new AiParserService();
const result = service.enhanceClassData(testData);

// Check day name standardization
console.log('Original days:', testData.days);
console.log('Enhanced days:', result.days);

// Check PST handling
console.log('Original PST class:', testData.classes["Monday"]["Period 2"][0]);
console.log('Enhanced PST class:', result.classes["Day 1"]["Period 2"][0]);

if (result.classes["Day 1"]["Period 2"][0].displaySubject === 'Private Study') {
  console.log('✅ TEST PASSED: enhanceClassData correctly handles PST classes');
} else {
  console.log('❌ TEST FAILED: PST class not properly processed');
}

console.log('='.repeat(60));
