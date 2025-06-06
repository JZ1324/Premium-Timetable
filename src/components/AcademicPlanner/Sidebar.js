import React, { useState, useEffect } from 'react';
import '../../styles/components/AcademicPlanner/sidebar.css';

const Sidebar = ({ 
    tasks, 
    filters = {}, // Add default value 
    handleFilterChange, 
    handleOpenAddTaskModal,
    handleOpenAddAssignmentModal
}) => {
    // Ensure filters has all required properties with defaults
    const safeFilters = {
        hideCompleted: false,
        showOnlyUpcoming: false,
        subjects: [],
        types: [],
        priorities: [],
        ...filters // Override defaults with actual values
    };

    // Load saved subjects from localStorage
    const loadSavedItems = (key, defaultItems) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? [...defaultItems, ...JSON.parse(saved)] : defaultItems;
        } catch {
            return defaultItems;
        }
    };

    // Default subjects changed to Math and English as requested
    const defaultSubjects = ['Math', 'English'];
    const [subjects, setSubjects] = useState(() => loadSavedItems('customSubjects', defaultSubjects));

    // Update subjects when localStorage changes (when new subjects are added via forms)
    useEffect(() => {
        const handleStorageChange = () => {
            setSubjects(loadSavedItems('customSubjects', defaultSubjects));
        };

        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Also check for changes periodically since storage events don't fire for same-origin changes
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);
    return (
        <div className="academic-planner-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Academic Planner</h2>
            </div>
            <div className="sidebar-content">
                <div className="add-task-section">
                    <div className="add-buttons-row">
                        <button className="add-task-btn half-width" onClick={handleOpenAddTaskModal}>
                            <i className="ri-add-line"></i>
                            Task
                        </button>
                        <button className="add-assignment-btn half-width" onClick={handleOpenAddAssignmentModal}>
                            <i className="ri-add-line"></i>
                            Assignment
                        </button>
                    </div>
                </div>

                <div className="filters-section">
                    <h3 className="section-title">FILTERS</h3>
                    <div className="filter-group">
                        <label className="custom-switch">
                            <input 
                                type="checkbox" 
                                checked={safeFilters.hideCompleted}
                                onChange={() => handleFilterChange('hideCompleted')}
                            />
                            <span className="switch-slider"></span>
                        </label>
                        <span className="filter-label">Hide completed tasks</span>
                    </div>
                    <div className="filter-group">
                        <label className="custom-switch">
                            <input 
                                type="checkbox" 
                                checked={safeFilters.showOnlyUpcoming}
                                onChange={() => handleFilterChange('showOnlyUpcoming')}
                            />
                            <span className="switch-slider"></span>
                        </label>
                        <span className="filter-label">Show only upcoming</span>
                    </div>
                </div>

                <div className="subjects-section">
                    <h3 className="section-title">SUBJECTS</h3>
                    <div className="checkbox-group">
                        {subjects.map(subject => (
                            <div key={subject} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    id={`subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                                    checked={filters.subjects.includes(subject)}
                                    onChange={() => handleFilterChange('subjects', subject)}
                                />
                                <label htmlFor={`subject-${subject.toLowerCase().replace(/\s+/g, '-')}`} className="checkbox-label">
                                    {subject}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="task-types-section">
                    <h3 className="section-title">TASK TYPES</h3>
                    <div className="checkbox-group">
                        {['Assignment', 'Exam', 'Study Block', 'Event', 'Reminder'].map(type => (
                            <div key={type} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    id={`type-${type.toLowerCase()}`}
                                    checked={filters.types.includes(type)}
                                    onChange={() => handleFilterChange('types', type)}
                                />
                                <label htmlFor={`type-${type.toLowerCase()}`} className="checkbox-label">
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="priority-section">
                    <h3 className="section-title">PRIORITY</h3>
                    <div className="checkbox-group">
                        {['High', 'Medium', 'Low'].map(priority => (
                            <div key={priority} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    id={`priority-${priority.toLowerCase()}`}
                                    checked={filters.priorities.includes(priority)}
                                    onChange={() => handleFilterChange('priorities', priority)}
                                />
                                <label htmlFor={`priority-${priority.toLowerCase()}`} className="checkbox-label priority-label">
                                    <span className={`priority-dot priority-${priority.toLowerCase()}`}></span>
                                    {priority}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="upcoming-deadlines">
                    <h3 className="section-title">Upcoming Deadlines</h3>
                    <div className="deadlines-list">
                        {tasks
                            .filter(task => {
                                const now = new Date();
                                const daysDiff = (task.dueDate - now) / (1000 * 3600 * 24);
                                return daysDiff >= 0 && daysDiff <= 7 && task.status !== 'completed';
                            })
                            .sort((a, b) => a.dueDate - b.dueDate)
                            .slice(0, 5)
                            .map(task => {
                                const now = new Date();
                                const daysDiff = Math.ceil((task.dueDate - now) / (1000 * 3600 * 24));
                                let dateLabel;
                                
                                if (daysDiff === 0) {
                                    dateLabel = "Today";
                                } else if (daysDiff === 1) {
                                    dateLabel = "Tomorrow";
                                } else {
                                    dateLabel = task.dueDate.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    });
                                }

                                return (
                                    <div key={task.id} className="deadline-item">
                                        <div className="deadline-task-info">
                                            <span className="deadline-title">{task.title}</span>
                                            <span className="deadline-subject">{task.subject}</span>
                                        </div>
                                        <span className={`deadline-date ${daysDiff === 0 ? 'today' : daysDiff === 1 ? 'tomorrow' : ''}`}>
                                            {dateLabel}
                                        </span>
                                    </div>
                                );
                            })
                        }
                        {tasks.filter(task => {
                            const now = new Date();
                            const daysDiff = (task.dueDate - now) / (1000 * 3600 * 24);
                            return daysDiff >= 0 && daysDiff <= 7 && task.status !== 'completed';
                        }).length === 0 && (
                            <div className="no-deadlines">
                                <i className="ri-calendar-check-line"></i>
                                <span>No upcoming deadlines</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;