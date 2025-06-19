// Test script to verify break period visibility logic

// Test various times
const testTimes = [
    { time: '09:00', description: 'Early morning' },
    { time: '10:49', description: '6 minutes before recess' },
    { time: '10:50', description: '5 minutes before recess (should show)' },
    { time: '10:55', description: 'Recess starts (should show)' },
    { time: '11:10', description: 'During recess (should show)' },
    { time: '11:25', description: 'Recess ends (should not show)' },
    { time: '12:00', description: 'After recess' },
    { time: '13:25', description: '5 minutes before lunch (should show)' },
    { time: '13:30', description: 'Lunch starts (should show)' },
    { time: '14:00', description: 'During lunch (should show)' },
    { time: '14:25', description: 'Lunch ends (should not show)' },
    { time: '15:00', description: 'After lunch' },
];

console.log('Break Period Visibility Test Results:');
console.log('===================================');

testTimes.forEach(({ time, description }) => {
    // Mock current time
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    
    // Mock the current time check
    const mockShouldShow = (periodName) => {
        const breakPeriods = {
            'Recess': { start: 10 * 60 + 55, end: 11 * 60 + 25 },
            'Lunch': { start: 13 * 60 + 30, end: 14 * 60 + 25 }
        };
        
        const period = breakPeriods[periodName];
        const showBreakStart = period.start - 5;
        
        return totalMinutes >= showBreakStart && totalMinutes < period.end;
    };
    
    const recessVisible = mockShouldShow('Recess');
    const lunchVisible = mockShouldShow('Lunch');
    
    console.log(`${time} (${description})`);
    console.log(`  Recess visible: ${recessVisible}`);
    console.log(`  Lunch visible: ${lunchVisible}`);
    console.log('');
});
