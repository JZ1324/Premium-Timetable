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
    // Add state for remaining time and precise progress
    const [remainingTime, setRemainingTime] = useState(task.estimatedTime);
    const [preciseProgress, setPreciseProgress] = useState(task.progress || 0);
    
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
        const elapsedSeconds = (new Date() - studyTimer.startTime) / 1000;
        
        // Calculate precise progress to 2 decimal places
        const preciseTimerProgress = parseFloat((elapsedMinutes / estimatedMinutes * 100).toFixed(2));
        const timerProgress = Math.min(preciseTimerProgress, 100);
        
        // Update the remaining time
        const remainingTimeStr = formatRemainingTime(task.estimatedTime, elapsedMinutes);
        setRemainingTime(remainingTimeStr);
        
        // Update precise progress state
        setPreciseProgress(timerProgress);
        
        // Return the higher of manual progress or timer progress
        return Math.max(task.progress || 0, timerProgress);
    };

    const progress = calculateTimerProgress();

    // Function to format remaining time
    const formatRemainingTime = (estimatedTimeStr, elapsedMinutes) => {
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
        
        const estimatedMinutes = parseEstimatedTime(estimatedTimeStr);
        const remainingMinutes = Math.max(0, estimatedMinutes - elapsedMinutes);
        
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = Math.floor(remainingMinutes % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        } else {
            return `${minutes}m remaining`;
        }
    };

    // Handle timer button click
    const handleTimerClick = () => {
        try {
            // Get the button element first before accessing its properties
            const button = document.getElementById(`timer-btn-${task.id}`);
            if (!button) {
                console.error('Timer button not found for task:', task.id);
                return;
            }
            
            // Prevent multiple rapid clicks
            const now = new Date().getTime();
            const lastClickRef = button.dataset.lastClick ? parseInt(button.dataset.lastClick) : 0;
            const clickDelay = 1000; // 1 second minimum between clicks
            
            // Check if this is a rapid click (less than clickDelay ms since last click)
            if (now - lastClickRef < clickDelay) {
                console.log('Ignoring rapid click, too soon after last click');
                return;
            }
            
            // Store current time as last click time
            button.dataset.lastClick = now.toString();
            
            // Enhanced logging for debugging
            console.log('Timer button clicked:', {
                taskId: task.id,
                isRunning: studyTimer.isRunning,
                currentTaskId: studyTimer.taskId,
                buttonElement: button,
                task: task,
                timeSinceLastClick: now - lastClickRef
            });
            
            button.classList.add('click-flash');
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            button.appendChild(ripple);
            
            // Add timer button specific class for additional effects
            button.classList.add('timer-button-ripple');
            
            // Clean up after animation completes
            setTimeout(() => {
                button.classList.remove('click-flash');
                button.classList.remove('timer-button-ripple');
                if (ripple.parentNode) {
                    button.removeChild(ripple);
                }
            }, 800);
            
            // Add sparkle animation to progress bar
            const progressContainer = document.querySelector(`.task-card .progress-container`);
            if (progressContainer && !studyTimer.isRunning) {
                progressContainer.classList.add('sparkle-animation');
                
                // Add dynamic particles for more visual feedback
                const addParticles = () => {
                    const particleCount = 5;
                    for (let i = 0; i < particleCount; i++) {
                        const particle = document.createElement('span');
                        particle.classList.add('particle');
                        particle.style.left = `${Math.random() * 100}%`;
                        particle.style.animationDelay = `${Math.random() * 0.5}s`;
                        progressContainer.appendChild(particle);
                        
                        // Remove particles after animation completes
                        setTimeout(() => {
                            if (particle.parentNode) {
                                particle.parentNode.removeChild(particle);
                            }
                        }, 2000);
                    }
                };
                
                addParticles();
                setTimeout(() => progressContainer.classList.remove('sparkle-animation'), 2000);
            }
            
            if (studyTimer.isRunning && studyTimer.taskId === task.id) {
                console.log('Stopping timer for task:', task.title, 'Current timer state:', studyTimer);
                stopStudyTimer();
            } else {
                console.log('Starting timer for task:', task.title, 'Current timer state:', studyTimer);
                // Make sure startStudyTimer is properly passed as a prop and is a function
                if (typeof startStudyTimer === 'function') {
                    startStudyTimer(task.id);
                    console.log('Timer start function called for task:', task.id);
                } else {
                    console.error('startStudyTimer is not a function:', startStudyTimer);
                }
            }
        } catch (error) {
            console.error('Error in handleTimerClick:', error);
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
    const isTimerRunning = studyTimer.isRunning && studyTimer.taskId === task.id;

    // Add effect to update progress when timer is running
    useEffect(() => {
        let progressInterval;
        
        if (isTimerRunning && studyTimer.startTime) {
            console.log('Setting up progress interval for task:', task.id, 'Timer state:', studyTimer);
            
            // Update progress every 100ms for smoother animation
            progressInterval = setInterval(() => {
                try {
                    // Make sure timer is still running before updating progress
                    if (!studyTimer.isRunning || studyTimer.taskId !== task.id) {
                        console.log('Timer state changed, clearing interval');
                        clearInterval(progressInterval);
                        return;
                    }
                    
                    // Calculate current progress
                    const newProgress = calculateTimerProgress();
                    
                    // Only update if progress has changed significantly
                    if (Math.abs(newProgress - progress) > 0.01) {
                        console.log('Updating progress for task:', task.id, 'from', progress, 'to', newProgress);
                        if (handleProgressUpdate && typeof handleProgressUpdate === 'function') {
                            handleProgressUpdate(task.id, newProgress);
                        }
                    }
                } catch (error) {
                    console.error('Error in progress interval:', error);
                }
            }, 100); // Update 10 times per second for smoother animation
        }
        
        return () => {
            if (progressInterval) {
                console.log('Clearing progress interval for task:', task.id);
                clearInterval(progressInterval);
            }
        };
    }, [isTimerRunning, task.id, studyTimer.startTime, handleProgressUpdate, progress]);

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
                    <span className={`status-circle status-${task.status} mr-2 ${task.status === 'starting' ? 'animate-pulse' : ''}`}></span>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeConfig(task.status).class} ${task.status === 'starting' ? 'shimmer-effect' : ''}`}>
                        {getStatusBadgeConfig(task.status).label}
                    </div>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
                <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">
                        {isTimerRunning ? preciseProgress.toFixed(2) : Math.round(progress)}%
                    </span>
                </div>
                <div className={`progress-container ${isTimerRunning ? 'timer-active' : ''}`}>
                    <div 
                        className={`progress-bar ${getProgressBarColor(progress)} ${isTimerRunning ? 'timer-running' : ''}`} 
                        style={{ 
                            width: `${isTimerRunning ? preciseProgress : progress}%`,
                            '--progress-color': getProgressBarColor(progress) === 'progress-bar-low' ? '#ef4444' :
                                              getProgressBarColor(progress) === 'progress-bar-medium' ? '#f59e0b' : '#10b981',
                            animation: isTimerRunning ? 'progressShimmer 2s infinite linear' : 'none'
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
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-medium text-sm transition-all duration-200 ${
                            isTimerRunning 
                                ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-200 hover:bg-red-700 active:bg-red-800 scale-110 pulse-shadow' 
                                : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:border-green-300 active:bg-green-200'
                        } transform hover:scale-105 active:scale-95`}
                        onClick={handleTimerClick}
                        title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                        style={{
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <i className={`${isTimerRunning ? "ri-pause-circle-fill" : "ri-play-circle-fill"} text-xl`} 
                           style={{
                               animation: isTimerRunning ? 'pulse-play-pause 2s infinite' : 'none',
                               textShadow: isTimerRunning ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                               willChange: 'transform, opacity'
                           }}
                        ></i>
                        {isTimerRunning && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                    
                    {/* Estimated Time Display */}
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className={`${isTimerRunning ? "ri-timer-flash-line" : "ri-time-line"}`}></i>
                        </div>
                        {isTimerRunning ? (
                            <span className="text-blue-600 font-medium">{remainingTime}</span>
                        ) : (
                            <span>Est. {task.estimatedTime}</span>
                        )}
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
                <div className="timer-display mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-pulse-subtle">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            <i className="ri-time-fill mr-2 text-blue-600"></i>
                            <span className="text-blue-800 font-medium">Timer: <span className="text-blue-900 font-bold">{getTimerDisplay()}</span></span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 px-2 py-1 bg-blue-100 rounded-full">
                            <span className="timer-active-indicator"></span>
                            {preciseProgress.toFixed(2)}% complete
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;