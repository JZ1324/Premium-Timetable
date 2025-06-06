import React from 'react';
import TaskCard from './TaskCard';
import AssignmentCard from './AssignmentCard';
import '../../styles/components/AcademicPlanner/day.css';
import { getPriorityColor, getStatusBadgeConfig } from './utils';

const DayView = ({
    currentDate,
    tasks,
    handleEditTask,
    handleDeleteTask,
    handleTaskStatusChange,
    handleOpenAddTaskModal,
    handleOpenAddAssignmentModal,
    enterFocusMode = () => {},
    shareTask = () => {},
    studyTimer = { taskId: null, startTime: null, isRunning: false },
    startStudyTimer = () => {},
    stopStudyTimer = () => {},
    handleTaskComplete = () => {},
    handleProgressUpdate = () => {},
    handleEditAssignment = () => {},
    handleDeleteAssignment = () => {},
    handleSubtaskComplete = () => {},
    getTimerDisplay = () => '00:00',
    generateAISuggestions = [],
    handleSuggestionAction = () => {}
}) => {
    // Filter tasks for today's date
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    const todayItems = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === todayDate.getTime();
    });
    
    // Separate assignments from regular tasks
    const assignments = todayItems.filter(task => task.isAssignment);
    const regularTasks = todayItems.filter(task => !task.isAssignment);

    return (
        <div className="day-view">
            <div className="view-content">
                <div className="quote-section">
                    <h3 className="section-header">Today's Quote</h3>
                    <div className="quote-card">
                        <p className="quote-text">
                            "The secret of getting ahead is getting started. The secret of 
                            getting started is breaking your complex overwhelming tasks 
                            into small manageable tasks, and then starting on the first one."
                        </p>
                        <p className="quote-author">— Mark Twain</p>
                    </div>
                </div>
                
                {/* Assignments Section */}
                {assignments.length > 0 && (
                    <div className="assignments-section">
                        <div className="section-header-with-actions">
                            <div className="section-header-with-count">
                                <h3 className="section-header">Major Assignments</h3>
                                <span className="task-count">{assignments.length}</span>
                            </div>
                            <button 
                                className="add-btn"
                                onClick={handleOpenAddAssignmentModal}
                                title="Add new assignment"
                            >
                                <i className="ri-add-line"></i> New Assignment
                            </button>
                        </div>
                        <div className={`assignments-list`}>
                            {assignments.map(assignment => (
                                <AssignmentCard 
                                    key={assignment.id}
                                    assignment={assignment}
                                    handleEditAssignment={handleEditAssignment}
                                    handleDeleteAssignment={handleDeleteAssignment}
                                    handleTaskComplete={handleSubtaskComplete}
                                    handleProgressUpdate={handleProgressUpdate}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Tasks Section */}
                <div className="tasks-section">
                    <div className="section-header-with-count">
                        <h3 className="section-header">Today - {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
                        <span className="task-count">{regularTasks.length}</span>
                    </div>
                    <div className={`tasks-list tasks-count-${regularTasks.length}`}>
                        {regularTasks.map(task => (
                            <TaskCard 
                                key={task.id}
                                task={task}
                                handleEditTask={handleEditTask}
                                handleDeleteTask={handleDeleteTask}
                                enterFocusMode={enterFocusMode}
                                shareTask={shareTask}
                                studyTimer={studyTimer}
                                startStudyTimer={startStudyTimer}
                                stopStudyTimer={stopStudyTimer}
                                handleTaskComplete={handleTaskComplete}
                                handleProgressUpdate={handleProgressUpdate}
                                getTimerDisplay={getTimerDisplay}
                            />
                        ))}
                        {regularTasks.length === 0 && (
                            <div className="no-tasks">
                                <i className="ri-checkbox-circle-line"></i>
                                <p>No tasks for today! Click "New Task" to add one.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ai-suggestions">
                    <h3 className="section-header">AI Study Suggestions</h3>
                    <div className="suggestions-list">
                        {generateAISuggestions.map(suggestion => (
                            <div key={suggestion.id} className={`suggestion-card ${suggestion.type}`}>
                                <div className="suggestion-icon">
                                    <i className={suggestion.icon}></i>
                                </div>
                                <div className="suggestion-content">
                                    <h4>{suggestion.title}</h4>
                                    <p className="suggestion-desc">{suggestion.description}</p>
                                    <button 
                                        className="suggestion-btn"
                                        onClick={() => handleSuggestionAction(suggestion)}
                                    >
                                        {suggestion.action}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {generateAISuggestions.length === 0 && (
                            <div className="no-suggestions">
                                <i className="ri-lightbulb-line"></i>
                                <p>Great job! No urgent suggestions at the moment. Keep up the good work!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayView;