// This file contains utility functions for date manipulation and formatting.

export const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);
    return start;
};

export const getEndOfWeek = (date) => {
    const end = new Date(date);
    const day = end.getDay();
    const diff = end.getDate() + (day === 0 ? 0 : 7 - day); // adjust when day is sunday
    end.setDate(diff);
    return end;
};

// Get the current school day number (1-10) based on the current date and user settings
export const getCurrentSchoolDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get user settings
    const savedSettings = localStorage.getItem('timetable-settings');
    let settings = {
        startWithWeek: 'A' // Default to Week A
    };
    
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings.startWithWeek) {
                settings.startWithWeek = parsedSettings.startWithWeek;
            }
        } catch (error) {
            console.error('Error parsing settings:', error);
        }
    }
    
    // If it's weekend, return the first day of next week
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return settings.startWithWeek === 'A' ? 1 : 6; // Monday of Week A or B
    }
    
    // Calculate the day number (1-10)
    let dayNumber;
    if (settings.startWithWeek === 'A') {
        // Week A: Days 1-5, Week B: Days 6-10
        dayNumber = dayOfWeek; // Monday = 1, Tuesday = 2, etc.
    } else {
        // Week B: Days 1-5, Week A: Days 6-10
        dayNumber = dayOfWeek + 5; // Monday = 6, Tuesday = 7, etc.
    }
    
    return dayNumber;
};

// Get the current period based on the current time
export const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Check if it's a weekend (Saturday or Sunday)
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
        return null; // Return null on weekends
    }
    
    // Check if it's outside school hours (before 8:30am or after 4:30pm)
    if (totalMinutes < 8 * 60 + 30 || totalMinutes > 16 * 60 + 30) {
        return null; // Return null outside school hours
    }
    
    // Define period time ranges in minutes from midnight
    const periodRanges = [
        { period: '1', start: 8 * 60 + 35, end: 9 * 60 + 35 }, // 8:35am - 9:35am
        { period: '2', start: 9 * 60 + 35, end: 10 * 60 + 35 }, // 9:35am - 10:35am
        { period: 'Tutorial', start: 10 * 60 + 35, end: 11 * 60 + 5 }, // 10:35am - 11:05am
        { period: 'Recess', start: 10 * 60 + 55, end: 11 * 60 + 25 }, // 10:55am - 11:25am
        { period: '3', start: 11 * 60 + 30, end: 12 * 60 + 30 }, // 11:30am - 12:30pm
        { period: '4', start: 12 * 60 + 30, end: 13 * 60 + 30 }, // 12:30pm - 1:30pm
        { period: 'Lunch', start: 13 * 60 + 30, end: 14 * 60 + 25 }, // 1:30pm - 2:25pm
        { period: '5', start: 14 * 60 + 25, end: 15 * 60 + 25 }, // 2:25pm - 3:25pm
        { period: 'After School', start: 15 * 60 + 35, end: 16 * 60 + 30 } // 3:35pm - 4:30pm
    ];
    
    // Find the current period
    for (const range of periodRanges) {
        if (totalMinutes >= range.start && totalMinutes < range.end) {
            return range.period;
        }
    }
    
    // If between periods but still during school hours, return null
    return null;
};

// Check if a break period should be shown (5 minutes before it starts or during it)
export const shouldShowBreakPeriod = (periodName) => {
    if (periodName !== 'Recess' && periodName !== 'Lunch') {
        return true; // Always show non-break periods
    }
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Define break periods
    const breakPeriods = {
        'Recess': { start: 10 * 60 + 55, end: 11 * 60 + 25 }, // 10:55am - 11:25am
        'Lunch': { start: 13 * 60 + 30, end: 14 * 60 + 25 } // 1:30pm - 2:25pm
    };
    
    const period = breakPeriods[periodName];
    
    // Show break 5 minutes before it starts and during the break
    const showBreakStart = period.start - 5;
    
    // Show if we're 5 minutes before break or during break
    if (totalMinutes >= showBreakStart && totalMinutes < period.end) {
        return true;
    }
    
    return false;
};