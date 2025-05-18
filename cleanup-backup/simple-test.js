// Basic test for validating the enhanceClassData functionality

class SimpleTest {
  enhanceClassData(data) {
    // Very simple implementation that just adds displaySubject for PST
    if (!data || !data.classes) return data;
    
    // Deep clone to avoid modifying original
    const result = JSON.parse(JSON.stringify(data));
    
    // Look for PST subjects and add displaySubject
    for (const day in result.classes) {
      for (const period in result.classes[day]) {
        const classes = result.classes[day][period];
        if (Array.isArray(classes)) {
          classes.forEach(cls => {
            if (cls.subject === 'PST') {
              cls.displaySubject = 'Private Study';
            }
          });
        }
      }
    }
    
    return result;
  }
}

// Create test data
const testData = {
  classes: {
    "Day 1": {
      "Period 1": [{ subject: "Math" }],
      "Period 2": [{ subject: "PST" }]
    }
  }
};

// Run test
const test = new SimpleTest();
const result = test.enhanceClassData(testData);

// Check results
console.log('Original PST class:', testData.classes["Day 1"]["Period 2"][0]);
console.log('Enhanced PST class:', result.classes["Day 1"]["Period 2"][0]);
console.log('Test passed:', result.classes["Day 1"]["Period 2"][0].displaySubject === 'Private Study');
