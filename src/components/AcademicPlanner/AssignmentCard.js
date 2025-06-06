import React, { useState } from 'react';
import '../../styles/components/AcademicPlanner/AssignmentCard.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

const AssignmentCard = ({ 
    assignment, 
    handleEditAssignment, 
    handleDeleteAssignment,
    handleTaskComplete,
    handleProgressUpdate
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

    // Calculate completed subtasks
    const completedSubtasks = assignment.subtasks ? 
        assignment.subtasks.filter(task => task.status === 'completed').length : 0;
    const totalSubtasks = assignment.subtasks ? assignment.subtasks.length : 0;
    const completionPercentage = totalSubtasks > 0 ? 
        Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
        <div className={`assignment-card bg-white p-4 rounded-lg border border-gray-200 shadow-sm priority-${assignment.priority.toLowerCase()}`}>
            {/* Main Card Content */}
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
                    <span className="progress-percentage">{completionPercentage}%</span>
                </div>
                <div className="progress-container">
                    <div 
                        className={`progress-bar ${getProgressBarColor(completionPercentage)}`} 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* Action Buttons */}
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
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? "Collapse Subtasks" : "Expand Subtasks"}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className={expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                        </div>
                    </button>
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={() => handleEditAssignment(assignment)}
                        title="Edit Assignment"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                        </div>
                    </button>
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={() => handleDeleteAssignment(assignment.id)}
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
                        {assignment.subtasks && assignment.subtasks.map(subtask => (
                            <div key={subtask.id} className={`subtask-item priority-${subtask.priority.toLowerCase()}`}>
                                <div className="flex items-center">
                                    <button 
                                        className="subtask-complete-btn"
                                        onClick={() => handleTaskComplete(subtask.id, assignment.id)}
                                    >
                                        <span className={`status-circle status-${subtask.status} mr-2`}></span>
                                    </button>
                                    <div className="subtask-content">
                                        <div className="subtask-title">{subtask.title}</div>
                                        <div className="subtask-details">
                                            <span className="subtask-estimate">{subtask.estimatedTime}</span>
                                            <span className="subtask-priority">{subtask.priority}</span>
                                        </div>
                                        {subtask.description && (
                                            <div className="subtask-description">{subtask.description}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentCard;
