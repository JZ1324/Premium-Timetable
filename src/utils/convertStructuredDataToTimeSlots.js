/**
 * Convert structured timetable data to time slots for the timetable component
 */
function convertStructuredDataToTimeSlots(structuredData) {
  console.log("Converting structured data to time slots:", structuredData);
  
  if (!structuredData || !structuredData.days || !structuredData.periods || !structuredData.classes) {
    console.error('Invalid structured data format:', structuredData);
    return [];
  }

  const timeSlots = [];
  
  // Generate a unique ID
  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);
  
  // Process each day and period
  structuredData.days.forEach(day => {
    const dayNumber = parseInt(day.match(/\d+/)[0]);
    
    // Only process if the day actually has classes
    if (structuredData.classes[day]) {
      Object.keys(structuredData.classes[day]).forEach(periodName => {
        // Skip Recess and Lunch periods - these will be handled separately
        if (periodName === "Recess" || periodName === "Lunch") {
          return;
        }
        
        const classes = structuredData.classes[day][periodName];
        
        // Find period details
        const periodInfo = structuredData.periods.find(p => p.name === periodName);
        
        // Format the period ID
        let periodId = periodName;
        if (periodName.includes("Period")) {
          periodId = periodName.replace("Period ", "").trim();
        }
        
        // Process each class in this period
        classes.forEach(classInfo => {
          const timeSlot = {
            id: generateId(),
            day: dayNumber,
            period: periodId,
            subject: classInfo.subject,
            code: classInfo.code,
            room: classInfo.room,
            teacher: classInfo.teacher,
            startTime: periodInfo?.startTime || classInfo.startTime,
            endTime: periodInfo?.endTime || classInfo.endTime
          };
          
          timeSlots.push(timeSlot);
        });
      });
    }
  });
  
  console.log("Converted time slots:", timeSlots);
  return timeSlots;
}

export default convertStructuredDataToTimeSlots;
