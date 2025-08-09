// Analytics and statistics helpers for AcademicPlanner

export const getTaskAnalytics = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;
    const overdueTasks = tasks.filter(task => 
        task.dueDate < new Date() && task.status !== 'completed'
    ).length;
    const subjectStats = {};
    tasks.forEach(task => {
        subjectStats[task.subject] = (subjectStats[task.subject] || 0) + 1;
    });
    const priorityStats = {};
    tasks.forEach(task => {
        priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
    });
    const weeklyStats = {};
    tasks.filter(task => task.completedAt).forEach(task => {
        const weekKey = getWeekKey(task.completedAt);
        weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
    });
    const tasksWithTime = tasks.filter(task => task.timeSpent && task.timeSpent !== '0 hours');
    const averageTimeSpent = tasksWithTime.length > 0 
        ? tasksWithTime.reduce((sum, task) => sum + parseTimeToMinutes(task.timeSpent), 0) / tasksWithTime.length
        : 0;
    return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
        subjectStats,
        priorityStats,
        weeklyStats,
        averageTimeSpent: Math.round(averageTimeSpent)
    };
};

export const getWeekKey = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
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
