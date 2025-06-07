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
    // Local state for real-time progress updates during timer
    const [localProgress, setLocalProgress] = useState(task.progress || 0);
    
    // Check if this task is currently running the timer
    const isTimerRunning = studyTimer.isRunning && studyTimer.taskId === task.id;
    
    // Calculate real-time progress based on timer
    useEffect(() => {
        if (isTimerRunning && studyTimer.startTime) {
            const updateProgress = () => {
                const elapsedMinutes = (Date.now() - studyTimer.startTime) / (1000 * 60);
                const estimatedMinutes = parseEstimatedTime(task.estimatedTime);
                const timerProgress = Math.min((elapsedMinutes / estimatedMinutes) * 100, 100);
                const combinedProgress = Math.min((task.progress || 0) + timerProgress, 100);
                setLocalProgress(combinedProgress);
            };
            
            updateProgress();
            const interval = setInterval(updateProgress, 1000);
            return () => clearInterval(interval);
        } else {
            setLocalProgress(task.progress || 0);
        }
    }, [isTimerRunning, studyTimer.startTime, task.progress, task.estimatedTime]);
    
    // Parse estimated time to minutes
    const parseEstimatedTime = (timeStr) => {
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

    // Handle timer button click
    const handleTimerClick = () => {
        if (isTimerRunning) {
            stopStudyTimer();
        } else {
            startStudyTimer(task.id);
        }
    };

    const { color: priorityColor } = getPriorityColor(task.priority);
    const { text: statusText, className: statusClass, color: statusColor } = getStatusBadgeConfig(task.status);

    return (
        <div className={`task-card ${isTimerRunning ? 'timer-active' : ''}`}>
            <div className="task-header">
                <div className="task-title-section">
                    <h3 className="task-title">{task.title}</h3>
                    <span 
                        className={`priority-badge ${task.priority?.toLowerCase()}`}
                        style={{ backgroundColor: priorityColor }}
                    >
                        {task.priority}
                    </span>
                </div>
                <div className="task-actions">
                    <button 
                        className={`timer-btn ${isTimerRunning ? 'active' : ''}`}
                        onClick={handleTimerClick}
                        title={isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                    >
                        {isTimerRunning ? '⏸️' : '▶️'}
                    </button>
                    <button onClick={() => handleEditTask(task)} className="edit-btn" title="Edit Task">
                        ✏️
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="delete-btn" title="Delete Task">
                        🗑️
                    </button>
                </div>
            </div>

            <div className="task-body">
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                    <div className="meta-item">
                        <span className="meta-label">Due:</span>
                        <span className="meta-value">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    {task.estimatedTime && (
                        <div className="meta-item">
                            <span className="meta-label">Estimated:</span>
                            <span className="meta-value">{task.estimatedTime}</span>
                        </div>
                    )}
                    <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`status-badge ${statusClass}`} style={{ color: statusColor }}>
                            {statusText}
                        </span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-info">
                        <span className="progress-label">Progress</span>
                        <span className="progress-percentage">{Math.round(localProgress)}%</span>
                    </div>
                    <div className={`progress-container ${isTimerRunning ? 'timer-active' : ''}`}>
                        <div 
                            className={`progress-bar ${getProgressBarColor(localProgress)} ${isTimerRunning ? 'timer-running' : ''}`}
                            style={{ 
                                width: `${localProgress}%`,
                                '--progress-color': getProgressBarColor(localProgress) === 'progress-bar-low' ? '#ef4444' :
                                                   getProgressBarColor(localProgress) === 'progress-bar-medium' ? '#f59e0b' : '#10b981'
                            }}
                        >
                            {isTimerRunning && <div className="progress-animation-overlay"></div>}
                        </div>
                    </div>
                </div>

                {isTimerRunning && (
                    <div className="timer-display">
                        <span className="timer-label">Timer:</span>
                        <span className="timer-time">{getTimerDisplay()}</span>
                    </div>
                )}
            </div>

            <div className="task-footer">
                <button onClick={() => enterFocusMode(task)} className="focus-btn">
                    Focus Mode
                </button>
                <button onClick={() => shareTask(task)} className="share-btn">
                    Share
                </button>
                <button 
                    onClick={() => handleTaskComplete(task.id)} 
                    className="complete-btn"
                    disabled={task.status === 'completed'}
                >
                    {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                </button>
            </div>
        </div>
    );
};

export default TaskCard;