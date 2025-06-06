import React from 'react';
import TaskCard from './TaskCard';
import '../../styles/components/AcademicPlanner/week.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

const WeekView = ({
    currentDate,
    tasks,
    handleEditTask,
    handleDeleteTask,
    handleTaskStatusChange,
    setCurrentDate,
    setCurrentView
}) => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return day;
    });

    const getTasksForDay = (date) => {
        return tasks.filter(task => 
            task.dueDate.toDateString() === date.toDateString()
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full">
                <div className="mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-600 italic">
                            "Success is the sum of small efforts, repeated day in and day out."
                        </p>
                        <p className="text-gray-500 text-sm mt-1">— Robert Collier</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-gray-200">
                        {weekDays.map((day, index) => (
                            <div 
                                key={index} 
                                className={`py-4 px-2 text-center text-sm font-medium ${
                                    day.toDateString() === new Date().toDateString() 
                                        ? 'text-gray-900 bg-gray-50' 
                                        : 'text-gray-500'
                                } border-r border-gray-200 ${index === 6 ? '' : ''}`}
                            >
                                <div>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="font-semibold">
                                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 min-h-[600px]">
                        {weekDays.map((day, dayIndex) => (
                            <div key={dayIndex} className="p-3 border-r border-gray-200 overflow-y-auto">
                                <div className="space-y-2">
                                    {getTasksForDay(day).map(task => (
                                        <div 
                                            key={task.id} 
                                            className={`task-card bg-white p-3 rounded border border-gray-200 shadow-sm priority-${task.priority.toLowerCase()} cursor-pointer hover:shadow-md transition-shadow`}
                                            onClick={() => handleEditTask(task)}
                                        >
                                            <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{task.title}</div>
                                            <div className="text-xs text-gray-500 mb-2">
                                                {task.dueDate.toLocaleTimeString('en-US', { 
                                                    hour: 'numeric', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{task.subject}</span>
                                                <span className={`status-circle status-${task.status}`}></span>
                                            </div>
                                        </div>
                                    ))}
                                    {getTasksForDay(day).length === 0 && (
                                        <div className="text-xs text-gray-400 text-center py-4">No tasks</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekView;