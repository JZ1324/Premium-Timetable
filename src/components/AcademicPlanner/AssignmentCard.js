import React, { useState } from 'react';
import '../../styles/components/AcademicPlanner/AssignmentCard.css';
import { getPriority, getPriorityColor, getStatusBadgeConfig } from './utils';

const AssignmentCard = ({ 
    assignment, 
    handleEditAssignment, 
    handleDeleteAssignment,
    handleTaskComplete,
    handleProgressUpdate,
    studyTimer,
    startStudyTimer,
    stopStudyTimer,
    getTimerDisplay
}) => {
    const [expanded, setExpanded] = useState(false);
    const [progress, setProgress] = useState(assignment.progress || 0);

    // Helper function to get progress bar color based on percentage
    const getProgressBarColor = (percentage) => {
        if (percentage < 30) return 'progress-bar-low';
        if (percentage < 70) return 'progress-bar-medium';
        return 'progress-bar-high';
    };

    // Handle progress update
    const handleProgressChange = (e) => {
        const newProgress = parseInt(e.target.value);
        setProgress(newProgress);
        handleProgressUpdate && handleProgressUpdate(assignment.id, newProgress);
    };

    // Helper function to get due date status
    const getDueDateStatus = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(assignment.dueDate);
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
        } else if (diffDays <= 3) {
            return { text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`, class: 'bg-blue-100 text-blue-800' };
        }
        return null;
    };

    const dueDateStatus = getDueDateStatus();

    // Calculate assignment progress based on actual subtask progress, not just completion count
    const completedSubtasks = assignment.subtasks ? 
        assignment.subtasks.filter(task => task.status === 'completed').length : 0;
    const totalSubtasks = assignment.subtasks ? assignment.subtasks.length : 0;
    
    // Calculate progress based on actual subtask progress
    const completionPercentage = totalSubtasks > 0 ? (() => {
        let totalProgress = 0;
        assignment.subtasks.forEach(subtask => {
            if (subtask.status === 'completed') {
                totalProgress += 100;
            } else {
                // Use the subtask's current progress (from timer or manual progress)
                totalProgress += (subtask.progress || 0);
            }
        });
        return Math.round(totalProgress / totalSubtasks);
    })() : 0;

    return (
        <div className={`assignment-card bg-white p-4 rounded-lg border border-gray-200 shadow-sm priority-${assignment.priority.toLowerCase()}`}>
            {/* Main Card Content - Clickable to expand */}
            <div 
                className="assignment-card-main cursor-pointer"
                onClick={() => setExpanded(!expanded)}
                title="Click to expand/collapse subtasks"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center mb-1">
                            {dueDateStatus && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded mr-2 ${dueDateStatus.class}`}>
                                    {dueDateStatus.text}
                                </span>
                            )}
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {assignment.subject}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded ml-2 bg-purple-100 text-purple-800">
                                Major Assignment
                            </span>
                        </div>
                        <h4 className="font-medium text-gray-900">
                            {assignment.title}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                                <i className="ri-time-line"></i>
                            </div>
                            <span>Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                            })}</span>
                            <span className="mx-2">•</span>
                            <div className="w-4 h-4 flex items-center justify-center mr-1">
                                <i className="ri-list-check-2"></i>
                            </div>
                            <span>{completedSubtasks}/{totalSubtasks} subtasks completed</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className={`status-circle status-${assignment.status} mr-2`}></span>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeConfig(assignment.status).class}`}>
                            {getStatusBadgeConfig(assignment.status).label}
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="progress-info">
                        <span className="progress-label">Assignment Progress</span>
                        <span className="progress-percentage">
                            {completionPercentage < 10 ? completionPercentage.toFixed(1) : Math.round(completionPercentage)}%
                        </span>
                    </div>
                    <div className="progress-container">
                        <div 
                            className={`progress-bar ${getProgressBarColor(completionPercentage)}`} 
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons - Click events need to stop propagation */}
            <div className="flex justify-between mt-3">
                <div className="flex items-center text-sm text-gray-500">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-time-line"></i>
                    </div>
                    <span>Est. {assignment.estimatedTime}</span>
                </div>
                <div className="flex space-x-2">
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering card click
                            setExpanded(!expanded);
                        }}
                        title={expanded ? "Collapse Subtasks" : "Expand Subtasks"}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className={expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                        </div>
                    </button>
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering card click
                            handleEditAssignment(assignment);
                        }}
                        title="Edit Assignment"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                        </div>
                    </button>
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering card click
                            handleDeleteAssignment(assignment.id);
                        }}
                        title="Delete Assignment"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-delete-bin-line"></i>
                        </div>
                    </button>
                </div>
            </div>
            
            {/* Subtasks Section */}
            {expanded && (
                <div className="subtasks-section mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h5>
                    <div className="subtasks-list">
                        {assignment.subtasks && assignment.subtasks.map(subtask => {
                            const isSubtaskTimerRunning = studyTimer && studyTimer.isRunning && studyTimer.taskId === subtask.id;
                            const { color: priorityColor } = getPriorityColor(subtask.priority);
                            const { text: statusText, className: statusClass, color: statusColor } = getStatusBadgeConfig(subtask.status);
                            
                            // Helper function to get due date status for subtask
                            const getSubtaskDueDateStatus = () => {
                                if (!subtask.dueDate) return null;
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const dueDate = new Date(subtask.dueDate);
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
                                }
                                return null;
                            };
                            
                            const dueDateStatus = getSubtaskDueDateStatus();
                            const subtaskProgress = subtask.progress || (subtask.status === 'completed' ? 100 : 0);
                            
                            return (
                                <div key={subtask.id} className={`subtask-card ${isSubtaskTimerRunning ? 'timer-active' : ''} priority-${subtask.priority.toLowerCase()}`}>
                                    {/* Subtask Header */}
                                    <div className="subtask-header">
                                        <div className="subtask-title-section">
                                            <button 
                                                className="subtask-complete-btn"
                                                onClick={() => handleTaskComplete(subtask.id, assignment.id)}
                                                title={subtask.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                                            >
                                                <span className={`status-circle status-${subtask.status}`}></span>
                                            </button>
                                            <h4 className="subtask-title">{subtask.title}</h4>
                                            <span 
                                                className={`priority-badge ${subtask.priority?.toLowerCase()}`}
                                                style={{ backgroundColor: priorityColor }}
                                            >
                                                {subtask.priority}
                                            </span>
                                        </div>
                                        <div className="subtask-actions">
                                            {/* Timer Button */}
                                            <button 
                                                className={`timer-btn ${isSubtaskTimerRunning ? 'timer-button-active' : ''} ${subtask.status === 'completed' ? 'timer-disabled' : ''}`}
                                                onClick={() => {
                                                    if (isSubtaskTimerRunning) {
                                                        stopStudyTimer && stopStudyTimer();
                                                    } else {
                                                        startStudyTimer && startStudyTimer(subtask.id);
                                                    }
                                                }}
                                                title={
                                                    subtask.status === 'completed' ? 'Task Completed - Timer Disabled' :
                                                    isSubtaskTimerRunning ? 'Stop Timer' : 'Start Timer'
                                                }
                                                disabled={subtask.status === 'completed'}
                                            >
                                                {subtask.status === 'completed' ? '✅' : (isSubtaskTimerRunning ? '⏸️' : '▶️')}
                                            </button>
                                            {/* Edit Button - For future enhancement */}
                                            <button 
                                                className="edit-btn" 
                                                title="Edit Subtask"
                                                onClick={() => {
                                                    // Future: Add subtask editing functionality
                                                    console.log('Edit subtask:', subtask.id);
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            {/* Delete Button - For future enhancement */}
                                            <button 
                                                className="delete-btn" 
                                                title="Delete Subtask"
                                                onClick={() => {
                                                    // Future: Add subtask deletion functionality
                                                    if (window.confirm('Delete this subtask?')) {
                                                        console.log('Delete subtask:', subtask.id);
                                                    }
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtask Body */}
                                    <div className="subtask-body">
                                        {subtask.description && (
                                            <p className="subtask-description">{subtask.description}</p>
                                        )}
                                        
                                        <div className="subtask-meta">
                                            {subtask.estimatedTime && (
                                                <div className="meta-item">
                                                    <span className="meta-label">Estimated:</span>
                                                    <span className="meta-value">{subtask.estimatedTime}</span>
                                                </div>
                                            )}
                                            <div className="meta-item">
                                                <span className="meta-label">Status:</span>
                                                <span className={`status-badge ${statusClass}`} style={{ color: statusColor }}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            {dueDateStatus && (
                                                <div className="meta-item">
                                                    <span className={`due-date-badge ${dueDateStatus.class}`}>
                                                        {dueDateStatus.text}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    
                                        {/* Progress Section with Slider */}
                                        <div className="subtask-progress-section">
                                            <div className="progress-info">
                                                <span className="progress-label">Progress</span>
                                                <span className="progress-percentage">
                                                    {subtaskProgress < 10 ? subtaskProgress.toFixed(1) : Math.round(subtaskProgress)}%
                                                </span>
                                            </div>
                                            <div className={`progress-container ${isSubtaskTimerRunning ? 'timer-active' : ''}`}>
                                                <div 
                                                    className={`progress-bar ${getProgressBarColor(subtaskProgress)} ${isSubtaskTimerRunning ? 'timer-running' : ''}`} 
                                                    style={{ 
                                                        width: `${subtaskProgress}%`,
                                                        '--progress-color': getProgressBarColor(subtaskProgress) === 'progress-bar-low' ? '#ef4444' :
                                                                          getProgressBarColor(subtaskProgress) === 'progress-bar-medium' ? '#f59e0b' : '#10b981'
                                                    }}
                                                ></div>
                                                {isSubtaskTimerRunning && (
                                                    <div className="progress-animation-overlay"></div>
                                                )}
                                            </div>
                                            
                                            {/* Progress Slider for Manual Adjustment */}
                                            <div className="progress-slider-container">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={subtaskProgress}
                                                    onChange={(e) => {
                                                        const newProgress = parseFloat(e.target.value);
                                                        // Update subtask progress using the handleProgressUpdate function
                                                        handleProgressUpdate && handleProgressUpdate(assignment.id, newProgress, subtask.id);
                                                    }}
                                                    className="progress-slider"
                                                    disabled={subtask.status === 'completed'}
                                                />
                                            </div>
                                        </div>

                                        {/* Timer Display when Running */}
                                        {isSubtaskTimerRunning && (
                                            <div className="timer-display">
                                                <div className="timer-elapsed">
                                                    <span className="timer-label">Timer:</span>
                                                    <span className="timer-time">{getTimerDisplay && getTimerDisplay(subtask.id)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subtask Footer with Action Buttons */}
                                    <div className="subtask-footer">
                                        <button 
                                            onClick={() => {
                                                // Future: Add subtask focus mode
                                                console.log('Focus mode for subtask:', subtask.id);
                                            }}
                                            className="focus-btn"
                                            title="Focus on this subtask"
                                        >
                                            Focus
                                        </button>
                                        <button 
                                            onClick={() => handleTaskComplete(subtask.id, assignment.id)} 
                                            className={`complete-btn ${subtask.status === 'completed' ? 'completed' : ''}`}
                                        >
                                            {subtask.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentCard;
