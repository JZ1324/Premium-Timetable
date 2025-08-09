// Timer and time formatting utilities for AcademicPlanner

export const formatSecondsToTimeString = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${remainingSeconds}s`;
    }
};

export const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === '0 hours') return 0;
    const hoursMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/);
    const minutesMatch = timeString.match(/(\d+)\s*m/);
    let totalMinutes = 0;
    if (hoursMatch) totalMinutes += parseFloat(hoursMatch[1]) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
    return totalMinutes;
};

export const addTimeSpent = (existingTime, newTime) => {
    const parseTime = (timeStr) => {
        if (!timeStr || timeStr === '0 hours') return 0;
        let totalMinutes = 0;
        const hourMatch = timeStr.match(/(\d+)h/);
        const minuteMatch = timeStr.match(/(\d+)m/);
        const hoursOnlyMatch = timeStr.match(/(\d+)\s*hours?/);
        const minutesOnlyMatch = timeStr.match(/(\d+)\s*minutes?/);
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
        if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
        if (hoursOnlyMatch && !hourMatch) totalMinutes += parseInt(hoursOnlyMatch[1]) * 60;
        if (minutesOnlyMatch && !minuteMatch) totalMinutes += parseInt(minutesOnlyMatch[1]);
        return totalMinutes;
    };
    const formatTime = (totalMinutes) => {
        if (totalMinutes === 0) return '0 hours';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours === 0) return `${minutes} minutes`;
        if (minutes === 0) return `${hours} hours`;
        return `${hours}h ${minutes}m`;
    };
    const existingMinutes = parseTime(existingTime);
    const newMinutes = parseTime(newTime);
    const totalMinutes = existingMinutes + newMinutes;
    return formatTime(totalMinutes);
};
