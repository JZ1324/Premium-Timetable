import React, { useState, useEffect } from 'react';
import '../../styles/components/AcademicPlanner/taskCard.css';
import '../../styles/components/AcademicPlanner/progressBar.css';
import '../../styles/components/AcademicPlanner/animations.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

// Helper function to determine progress bar color based on completion
const getProgressBarColor = (progress) => {
    if (progress < 33) return 'progress-bar-low';
    if (progress < 66) return 'progress-bar-medium';
    return 'progress-bar-high';
};

const TaskCard = ({ 
    task, 
    handleEditTask, 
    handleDeleteTask, 
    enterFocusMode, 
    shareTask, 
    studyTimer, 
    startStudyTimer, 
    stopStudyTimer, 
    handleTaskComplete,
    handleProgressUpdate,
    getTimerDisplay
}) => {
    // NEW TIMER SYSTEM - Simplified state management
    const [localProgress, setLocalProgress] = useState(task.progress || 0);
    const isTimerRunning = studyTimer.isRunning && studyTimer.taskId === task.id;
    
    // Parse time string to minutes
    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 60;
        
        let totalMinutes = 0;
        const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*h/);
        const minuteMatch = timeStr.match(/(\d+)\s*m/);
        const hoursOnlyMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*hours?/);
        
        if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
        if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
        if (hoursOnlyMatch && !hourMatch) totalMinutes += parseFloat(hoursOnlyMatch[1]) * 60;
        
        return totalMinutes || 60;
    };

    // Update local progress when timer is running or task progress changes
    useEffect(() => {
        if (isTimerRunning && studyTimer.startTime) {
            // Calculate real-time progress for display
            const elapsedMinutes = (new Date() - studyTimer.startTime) / (1000 * 60);
            const estimatedMinutes = parseTimeToMinutes(task.estimatedTime || '1 hour');
            const timerProgress = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100);
            setLocalProgress(Math.max(task.progress || 0, timerProgress));
        } else {
            setLocalProgress(task.progress || 0);
        }
    }, [isTimerRunning, task.progress, task.estimatedTime, studyTimer.startTime]);

    // Simplified timer button click handler
    const handleTimerClick = () => {
        console.log(`🎯 Timer button clicked for task: ${task.title}`);
        
        if (isTimerRunning) {
            console.log('⏹️ Stopping timer');
            stopStudyTimer();
        } else {
            console.log('▶️ Starting timer');
            startStudyTimer(task.id);
        }
    };

    // Progress bar change handler
    const handleProgressChange = (e) => {
        const newProgress = parseInt(e.target.value);
        handleProgressUpdate && handleProgressUpdate(task.id, newProgress);
    };

    // Helper function to get due date status
    const getDueDateStatus = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { 
                text: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`, 
                class: 'bg-red-100 text-red-800' 
            };
        } else if (diffDays === 0) {
            return { text: 'Due today', class: 'bg-orange-100 text-orange-800' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', class: 'bg-yellow-100 text-yellow-800' };
        } else if (diffDays <= 3) {
            return { text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`, class: 'bg-blue-100 text-blue-800' };
        }
        return null;
    };

    const dueDateStatus = getDueDateStatus();

    return (
        <div className={`task-card bg-white p-4 rounded-lg border border-gray-200 shadow-sm priority-${task.priority.toLowerCase()}`}>
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center mb-1">
                        {dueDateStatus && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded mr-2 ${dueDateStatus.class}`}>
                                {dueDateStatus.text}
                            </span>
                        )}
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {task.subject}
                        </span>
                    </div>
                    <h4 className="font-medium text-gray-900">
                        {task.title}
                    </h4>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-time-line"></i>
                        </div>
                        <span>Due {task.dueDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                        })}</span>
                        <span className="mx-2">•</span>
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-file-list-line"></i>
                        </div>
                        <span>{task.type}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className={`status-circle status-${task.status} mr-2`}></span>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeConfig(task.status).class}`}>
                        {getStatusBadgeConfig(task.status).label}
                    </div>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
                <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">
                        {Math.round(localProgress)}%
                    </span>
                </div>
                <div className={`progress-container ${isTimerRunning ? 'timer-active' : ''}`}>
                    <div 
                        className={`progress-bar ${getProgressBarColor(localProgress)} ${isTimerRunning ? 'timer-running' : ''}`} 
                        style={{ 
                            width: `${localProgress}%`,
                            '--progress-color': getProgressBarColor(localProgress) === 'progress-bar-low' ? '#ef4444' :
                                              getProgressBarColor(localProgress) === 'progress-bar-medium' ? '#f59e0b' : '#10b981'
                        }}
                    ></div>
                    {isTimerRunning && (
                        <div className="progress-animation-overlay"></div>
                    )}
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={Math.round(localProgress)} 
                    onChange={handleProgressChange}
                    className="w-full mt-2 accent-indigo-600"
                />
            </div>
            
            {/* Bottom Section */}
            <div className="flex justify-between items-center mt-3">
                {/* Left side - Timer Button */}
                <div className="flex items-center space-x-3">
                    <button 
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-medium text-sm transition-all duration-300 ${
                            isTimerRunning 
                                ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-200 hover:bg-red-700 timer-button-active' 
                                : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:border-green-300'
                        } transform hover:scale-105 active:scale-95`}
                        onClick={handleTimerClick}
                        title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                    >
                        <i className={`${isTimerRunning ? "ri-pause-circle-fill" : "ri-play-circle-fill"} text-xl`}></i>
                        {isTimerRunning && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                    
                    {/* Estimated Time Display */}
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className={`${isTimerRunning ? "ri-timer-flash-line" : "ri-time-line"}`}></i>
                        </div>
                        <span>Est. {task.estimatedTime}</span>
                    </div>
                </div>
                
                {/* Right side - Action Buttons */}
                <div className="flex items-center space-x-1">
                    {/* Edit Button */}
                    <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={() => handleEditTask(task)}
                        title="Edit Task"
                    >
                        <i className="ri-edit-line text-base"></i>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                    >
                        <i className="ri-delete-bin-line text-base"></i>
                    </button>
                    
                    {/* Complete Button */}
                    <button 
                        className={`p-2 rounded-lg transition-all duration-200 ${
                            task.status === 'completed'
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        onClick={() => handleTaskComplete(task.id)}
                        title="Toggle Complete"
                    >
                        <i className={`text-base ${task.status === 'completed' ? "ri-checkbox-circle-fill" : "ri-check-line"}`}></i>
                    </button>
                </div>
            </div>
            
            {/* Timer Display - Only show when timer is running */}
            {isTimerRunning && (
                <div className="timer-display mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            <i className="ri-time-fill mr-2 text-blue-600"></i>
                            <span className="text-blue-800 font-medium">
                                Timer: <span className="text-blue-900 font-bold">{getTimerDisplay()}</span>
                            </span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 px-2 py-1 bg-blue-100 rounded-full">
                            <span className="timer-active-indicator"></span>
                            {Math.round(localProgress)}% complete
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
