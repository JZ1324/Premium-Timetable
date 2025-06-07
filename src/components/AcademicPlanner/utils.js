// Common utility functions for Academic Planner

// Get appropriate color for priority levels
export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High':
            return 'priority-high';
        case 'Medium':
            return 'priority-medium';
        case 'Low':
            return 'priority-low';
        default:
            return 'priority-medium';
    }
};

// Get appropriate color for status
export const getStatusColor = (status) => {
    switch (status) {
        case 'completed':
            return 'status-completed';
        case 'in-progress':
            return 'status-in-progress';
        case 'not-started':
            return 'status-not-started';
        default:
            return 'status-not-started';
    }
};

// Format date for display
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Format due date with relative time
export const formatDueDate = (date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays < 7) {
        return `Due in ${diffDays} days`;
    } else {
        return `Due on ${date.toLocaleDateString()}`;
    }
};

// Get status badge component data
export const getStatusBadgeConfig = (status) => {
    const statusConfig = {
        'completed': {
            label: 'Completed',
            icon: 'ri-check-line',
            class: 'bg-green-100 text-green-800'
        },
        'in-progress': {
            label: 'In progress',
            icon: 'ri-play-line',
            class: 'bg-yellow-100 text-yellow-800'
        },
        'starting': {
            label: 'Starting...',
            icon: 'ri-loader-4-line',
            class: 'bg-blue-100 text-blue-800 animate-pulse'
        },
        'not-started': {
            label: 'Not started',
            icon: 'ri-pause-line',
            class: 'bg-gray-100 text-gray-800'
        }
    };

    return statusConfig[status] || statusConfig['not-started'];
};

// Format timer display
export const formatTimerDisplay = (startTime) => {
    if (!startTime) return '00:00';
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Parse time string to minutes
export const parseTimeToMinutes = (timeString) => {
    if (!timeString || timeString === '0 hours') return 0;
    const hoursMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/);
    const minutesMatch = timeString.match(/(\d+)\s*m/);
    
    let totalMinutes = 0;
    if (hoursMatch) totalMinutes += parseFloat(hoursMatch[1]) * 60;
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
    
    return totalMinutes;
};

// Format minutes to time string
export const formatMinutesToTimeString = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
        }
    }
};

// Get week key for stats
export const getWeekKey = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
};