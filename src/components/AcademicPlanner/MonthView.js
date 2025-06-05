import React from 'react';
import TaskCard from './TaskCard';
import '../../styles/components/AcademicPlanner/month.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

const MonthView = ({
    currentDate,
    tasks,
    handleEditTask,
    handleDeleteTask,
    handleTaskStatusChange,
    setCurrentDate,
    setCurrentView
}) => {
    // Get current month and year
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Adjust for Sunday as first day of week (for display purposes)
    const startOffset = firstDayWeekday;
    
    // Calculate calendar cells
    const totalDays = lastDayOfMonth.getDate();
    const totalCalendarCells = Math.ceil((totalDays + startOffset) / 7) * 7;
    
    // Create calendar days array
    const calendarDays = Array.from({ length: totalCalendarCells }, (_, i) => {
        const dayOffset = i - startOffset;
        const date = new Date(year, month, dayOffset + 1);
        const isCurrentMonth = date.getMonth() === month;
        
        return {
            date,
            dayOfMonth: date.getDate(),
            isCurrentMonth
        };
    });

    // Chunk the days into weeks for grid display
    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const getTasksForDay = (date) => {
        return tasks.filter(task => 
            task.dueDate.toDateString() === date.toDateString()
        );
    };

    const getTaskColor = (priority) => {
        switch(priority.toLowerCase()) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-7 border-b border-gray-200">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {calendarWeeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
                                {week.map((day, dayIndex) => {
                                    const isToday = day.date.toDateString() === new Date().toDateString();
                                    const dayTasks = getTasksForDay(day.date);
                                    
                                    return (
                                        <div 
                                            key={dayIndex}
                                            className={`month-cell relative p-2 min-h-[100px] ${
                                                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                                            } ${isToday ? 'today' : ''}`}
                                        >
                                            <div className="text-sm font-medium mb-1">{day.dayOfMonth}</div>
                                            <div className="space-y-1">
                                                {dayTasks.slice(0, 3).map(task => (
                                                    <div 
                                                        key={task.id}
                                                        className="flex items-center text-xs cursor-pointer"
                                                        onClick={() => handleEditTask(task)}
                                                    >
                                                        <span className={`task-dot ${getTaskColor(task.priority)} mr-1`}></span>
                                                        <span className="truncate">{task.title}</span>
                                                    </div>
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <div className="text-xs text-gray-500">
                                                        +{dayTasks.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthView;