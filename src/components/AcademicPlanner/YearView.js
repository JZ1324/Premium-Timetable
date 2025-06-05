import React from 'react';
import '../../styles/components/AcademicPlanner/year.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

const YearView = ({
    currentDate,
    tasks,
    handleEditTask,
    setCurrentDate,
    setCurrentView,
    handleOpenAddTaskModal,
    exportTasks = () => {},
    importTasks = () => {},
    markAllCompleted = () => {},
    deleteAllCompleted = () => {}
}) => {
    const currentYear = currentDate.getFullYear();
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getTasksForMonth = (monthIndex) => {
        return tasks.filter(task => {
            return task.dueDate.getMonth() === monthIndex && 
                  task.dueDate.getFullYear() === currentYear;
        });
    };

    const getMonthColor = (monthIndex) => {
        const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 
                         'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
        
        const colors = {
            winter: 'bg-blue-100 border-blue-300',
            spring: 'bg-green-100 border-green-300',
            summer: 'bg-orange-100 border-orange-300',
            autumn: 'bg-amber-100 border-amber-300'
        };
        
        return colors[seasons[monthIndex]];
    };

    const yearStats = {
        totalTasks: tasks.filter(t => t.dueDate.getFullYear() === currentYear).length,
        completedTasks: tasks.filter(t => 
            t.dueDate.getFullYear() === currentYear && t.status === 'completed'
        ).length,
        highPriorityTasks: tasks.filter(t => 
            t.dueDate.getFullYear() === currentYear && t.priority === 'High'
        ).length,
        upcomingExams: tasks.filter(t => 
            t.dueDate.getFullYear() === currentYear && 
            t.type === 'Exam' && 
            t.status !== 'completed'
        ).length
    };

    const completionRate = yearStats.totalTasks > 0 
        ? Math.round((yearStats.completedTasks / yearStats.totalTasks) * 100) 
        : 0;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{currentYear} Academic Overview</h2>
                    <p className="text-gray-500 mt-1">Plan your academic year at a glance</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-500">Total Tasks</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{yearStats.totalTasks}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-500">Completion Rate</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{completionRate}%</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-500">High Priority</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{yearStats.highPriorityTasks}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-500">Upcoming Exams</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{yearStats.upcomingExams}</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthNames.map((month, index) => {
                        const monthTasks = getTasksForMonth(index);
                        const completedTasks = monthTasks.filter(t => t.status === 'completed').length;
                        const monthPercent = monthTasks.length > 0 
                            ? Math.round((completedTasks / monthTasks.length) * 100) 
                            : 0;
                        
                        return (
                            <div 
                                key={month} 
                                className={`year-cell p-4 rounded-lg border ${getMonthColor(index)} shadow-sm transition-transform hover:scale-105`}
                                onClick={() => {
                                    const newDate = new Date(currentYear, index, 1);
                                    setCurrentDate(newDate);
                                    setCurrentView('month');
                                }}
                            >
                                <h3 className="font-semibold text-gray-800">{month}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm text-gray-500">{monthTasks.length} tasks</div>
                                    <div className="text-sm text-gray-500">{monthPercent}% done</div>
                                </div>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary" 
                                        style={{ width: `${monthPercent}%` }}
                                    ></div>
                                </div>
                                {monthTasks.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {monthTasks.slice(0, 2).map(task => (
                                            <div key={task.id} className="flex items-center text-xs">
                                                <span className={`w-2 h-2 rounded-full bg-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'amber' : 'blue'}-500 mr-2`}></span>
                                                <span className="truncate">{task.title}</span>
                                            </div>
                                        ))}
                                        {monthTasks.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{monthTasks.length - 2} more tasks
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default YearView;