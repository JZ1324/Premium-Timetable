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
    return (
        <div key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
            <div className="task-card-content">
                <div className="task-info">
                    <div className="task-badges">
                        <span className={`type-badge bg-blue-100 text-blue-800`}>
                            {task.type}
                        </span>
                        <span className={`subject-badge bg-purple-100 text-purple-800`}>
                            {task.subject}
                        </span>
                        <span className={`priority-badge ${getPriorityColor(task.priority)} text-white`}>
                            {task.priority}
                        </span>
                    </div>
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">Progress</span>
                            <span className="progress-percentage">{Math.round(task.progress * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar"
                                style={{ width: `${task.progress * 100}%` }}
                            ></div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress * 100}
                            onChange={(e) => handleProgressUpdate(task.id, e.target.value / 100)}
                            className="progress-slider"
                        />
                    </div>

                    <div className="task-meta">
                        <span className={`status-circle status-${task.status}`}></span>
                        {getStatusBadgeConfig(task.status).label}
                        <div className="time-spent">
                            <i className="ri-time-line"></i>
                            <span>Spent: {task.timeSpent}</span>
                        </div>
                    </div>
                </div>
                <div className="task-actions">
                    <div className="task-details">
                        <div className="due-date">
                            <i className="ri-calendar-line"></i>
                            <span>{task.dueDate.toLocaleDateString()}</span>
                        </div>
                        <div className="estimated-time">
                            <i className="ri-time-line"></i>
                            <span>{task.estimatedTime}</span>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEditTask(task)}
                            title="Edit Task"
                        >
                            <i className="ri-edit-line"></i>
                        </button>
                        <button 
                            className="action-btn focus-btn"
                            onClick={() => enterFocusMode(task)}
                            title="Enter Focus Mode"
                        >
                            <i className="ri-focus-3-line"></i>
                        </button>
                        <button 
                            className="action-btn share-btn"
                            onClick={() => shareTask(task)}
                            title="Share Task"
                        >
                            <i className="ri-share-line"></i>
                        </button>
                        <button 
                            className="action-btn timer-btn"
                            onClick={() => studyTimer.taskId === task.id && studyTimer.isRunning 
                                ? stopStudyTimer() 
                                : startStudyTimer(task.id)}
                            title={studyTimer.taskId === task.id && studyTimer.isRunning ? "Stop Timer" : "Start Timer"}
                        >
                            <i className={studyTimer.taskId === task.id && studyTimer.isRunning 
                                ? "ri-pause-line" 
                                : "ri-play-line"}></i>
                        </button>
                        <button 
                            className="action-btn complete-btn"
                            onClick={() => handleTaskComplete(task.id)}
                            title="Toggle Complete"
                        >
                            <i className={task.status === 'completed' ? "ri-checkbox-circle-fill" : "ri-checkbox-circle-line"}></i>
                        </button>
                        <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete Task"
                        >
                            <i className="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
            {studyTimer.taskId === task.id && studyTimer.isRunning && (
                <div className="timer-display">
                    <i className="ri-timer-line"></i>
                    <span>Timer running... {getTimerDisplay()}</span>
                </div>
            )}
        </div>
    );
};

export default TaskCard;