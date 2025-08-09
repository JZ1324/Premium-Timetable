import React, { useState, useEffect, memo } from 'react';
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
    getTimerDisplay,
    getEstimatedTimeCountdown
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
        
        // Don't allow timer to start if task is completed
        if (task.status === 'completed') {
            console.log('⚠️ Cannot start timer - task is completed');
            return;
        }
        
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

    // Helper function to get due date status - use from DayView if available, otherwise calculate
    const getDueDateStatus = () => {
        // If DayView has already calculated the status, use it
        if (task.dueDateStatus) {
            return task.dueDateStatus;
        }
        
        // Otherwise calculate it ourselves (for backward compatibility)
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
    const { color: priorityColor } = getPriorityColor(task.priority);
    const { text: statusText, className: statusClass, color: statusColor } = getStatusBadgeConfig(task.status);

    return (
        <div className={`task-card ${isTimerRunning ? 'timer-active' : ''}`} data-task-id={task.id}>
            <div className="task-header">
                <div className="task-title-section">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-badges">
                        <span 
                            className={`priority-badge ${task.priority?.toLowerCase()}`}
                            style={{ backgroundColor: priorityColor }}
                        >
                            {task.priority}
                        </span>
                        {dueDateStatus && (
                            <span className={`due-date-badge ${dueDateStatus.class}`}>
                                {dueDateStatus.text}
                            </span>
                        )}
                    </div>
                </div>
                <div className="task-actions">
                    <button 
                        className={`timer-btn ${isTimerRunning ? 'timer-button-active' : ''} ${task.status === 'completed' ? 'timer-disabled' : ''}`}
                        onClick={handleTimerClick}
                        title={
                            task.status === 'completed' ? 'Task Completed - Timer Disabled' :
                            isTimerRunning ? 'Stop Timer' : 'Start Timer'
                        }
                        disabled={task.status === 'completed'}
                    >
                        {task.status === 'completed' ? '✅' : (isTimerRunning ? '⏸️' : '▶️')}
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
                        className="progress-slider"
                    />
                </div>

                {isTimerRunning && (
                    <div className="timer-display">
                        <div className="timer-elapsed">
                            <span className="timer-label">Timer:</span>
                            <span className="timer-time">{getTimerDisplay()}</span>
                        </div>
                        {getEstimatedTimeCountdown && (
                            <div className="timer-countdown">
                                <span className="timer-label">Remaining:</span>
                                <span className="timer-time">{getEstimatedTimeCountdown(task)}</span>
                            </div>
                        )}
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
                    className={`complete-btn ${task.status === 'completed' ? 'completed' : ''}`}
                >
                    {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
        </div>
    );
};

// Memo comparison to avoid re-render if key props unchanged
const areEqual = (prev, next) => {
  const a = prev.task; const b = next.task;
  if (a.id !== b.id) return false;
  if (a.status !== b.status) return false;
  if (a.progress !== b.progress) return false;
  if (a.dueDate !== b.dueDate) return false;
  if (a.priority !== b.priority) return false;
  // Timer changes
  const prevTimerActive = prev.studyTimer.isRunning && prev.studyTimer.taskId === a.id;
  const nextTimerActive = next.studyTimer.isRunning && next.studyTimer.taskId === b.id;
  if (prevTimerActive !== nextTimerActive) return false;
  return true;
};

export default memo(TaskCard, areEqual);
