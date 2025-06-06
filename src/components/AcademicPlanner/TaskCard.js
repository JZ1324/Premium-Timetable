import React from 'react';
import '../../styles/components/AcademicPlanner/taskCard.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

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
            
            {/* Bottom Section */}
            <div className="flex justify-between mt-3">
                <div className="flex items-center text-sm text-gray-500">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <i className="ri-time-line"></i>
                    </div>
                    <span>Est. {task.estimatedTime}</span>
                </div>
                <div className="flex space-x-2">
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={() => handleEditTask(task)}
                        title="Edit Task"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                        </div>
                    </button>
                    <button 
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap"
                        onClick={() => handleTaskComplete(task.id)}
                        title="Toggle Complete"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <i className={task.status === 'completed' ? "ri-checkbox-circle-fill" : "ri-check-line"}></i>
                        </div>
                    </button>
                </div>
            </div>
            
            {studyTimer.taskId === task.id && studyTimer.isRunning && (
                <div className="timer-display mt-3 p-2 bg-blue-50 rounded-md">
                    <i className="ri-timer-line"></i>
                    <span>Timer running... {getTimerDisplay()}</span>
                </div>
            )}
        </div>
    );
};

export default TaskCard;