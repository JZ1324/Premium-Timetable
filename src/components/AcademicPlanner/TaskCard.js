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
    // Calculate progress based on current timer and estimated time
    const calculateTimerProgress = () => {
        if (!studyTimer.isRunning || studyTimer.taskId !== task.id || !studyTimer.startTime) {
            return task.progress || 0;
        }

        // Parse estimated time to minutes
        const parseEstimatedTime = (timeStr) => {
            if (!timeStr) return 60; // Default to 1 hour if no estimate
            
            let totalMinutes = 0;
            const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*h/);
            const minuteMatch = timeStr.match(/(\d+)\s*m/);
            const hoursOnlyMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*hours?/);
            
            if (hourMatch) totalMinutes += parseFloat(hourMatch[1]) * 60;
            if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
            if (hoursOnlyMatch && !hourMatch) totalMinutes += parseFloat(hoursOnlyMatch[1]) * 60;
            
            return totalMinutes || 60; // Default to 60 minutes if parsing fails
        };

        const estimatedMinutes = parseEstimatedTime(task.estimatedTime);
        const elapsedMinutes = (new Date() - studyTimer.startTime) / (1000 * 60);
        const timerProgress = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100);
        
        // Return the higher of manual progress or timer progress
        return Math.max(task.progress || 0, timerProgress);
    };

    const progress = calculateTimerProgress();

    // Handle timer button click
    const handleTimerClick = () => {
        console.log("Timer button clicked, current state:", { 
            isRunning: studyTimer.isRunning, 
            taskId: studyTimer.taskId, 
            currentTaskId: task.id 
        });
        
        // Create flash effect for visual feedback
        const button = document.getElementById(`timer-btn-${task.id}`);
        if (button) {
            button.classList.add('click-flash');
            setTimeout(() => button.classList.remove('click-flash'), 300);
        }
        
        if (studyTimer.isRunning && studyTimer.taskId === task.id) {
            console.log("Stopping timer");
            stopStudyTimer();
        } else {
            console.log("Starting timer for task:", task.id);
            startStudyTimer(task.id);
        }
    };

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

    // Check if timer is running for this task
    const isTimerRunning = studyTimer.isRunning && studyTimer.taskId === task.id;
    
    // Add effect to update progress when timer is running
    useEffect(() => {
        let progressInterval;
        if (isTimerRunning) {
            // Update progress every second while timer is running
            progressInterval = setInterval(() => {
                // Just forcing a re-render to recalculate progress
                console.log("Updating timer progress");
            }, 1000);
        }
        
        return () => {
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [isTimerRunning]);

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
                    <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
                <div className={`progress-container ${isTimerRunning ? 'timer-active' : ''}`}>
                    <div 
                        className={`progress-bar ${getProgressBarColor(progress)} ${isTimerRunning ? 'timer-running' : ''}`} 
                        style={{ 
                            width: `${progress}%`,
                            '--progress-color': getProgressBarColor(progress) === 'progress-bar-low' ? '#ef4444' :
                                              getProgressBarColor(progress) === 'progress-bar-medium' ? '#f59e0b' : '#10b981'
                        }}
                    ></div>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={Math.round(progress)} 
                    onChange={handleProgressChange}
                    className="w-full mt-2 accent-indigo-600"
                />
            </div>
            
            {/* Bottom Section */}
            <div className="flex justify-between items-center mt-3">
                {/* Left side - Timer Button */}
                <div className="flex items-center space-x-3">
                    <button 
                        id={`timer-btn-${task.id}`}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm border ${
                            isTimerRunning 
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 animate-pulse-subtle' 
                                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                        }`}
                        onClick={handleTimerClick}
                        title={isTimerRunning ? "Stop Timer" : "Start Timer"}
                    >
                        <div className="flex items-center space-x-1.5">
                            <i className={`${isTimerRunning ? "ri-stop-circle-line" : "ri-play-circle-line"} text-base ${isTimerRunning ? 'animate-pulse' : ''}`}></i>
                            <span className="text-xs font-semibold">
                                {isTimerRunning ? "Stop" : "Start"}
                            </span>
                        </div>
                    </button>
                    
                    {/* Estimated Time Display */}
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-time-line"></i>
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
            
            {/* Timer Display */}
            {isTimerRunning && (
                <div className="timer-display mt-3 p-3 bg-blue-100 rounded-md border border-blue-300 shadow-inner animate-pulse-subtle">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="timer-active-indicator"></span>
                            <i className="ri-timer-line mr-2 text-blue-600 animate-pulse"></i>
                            <span className="text-blue-800 font-medium">Timer running: <span className="text-blue-900 font-bold">{getTimerDisplay()}</span></span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 px-2 py-1 bg-blue-50 rounded-full">
                            {Math.round(progress)}% complete
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;