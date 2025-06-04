import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../styles/components/AcademicPlanner.css'; // Main CSS
import '../styles/components/AddTaskForm.css'; // Add Task Form CSS
import 'remixicon/fonts/remixicon.css'; // Corrected path
import AddTaskForm from './AcademicPlanner/AddTaskForm'; // Import AddTaskForm for Academic Planner
import { useTaskTracker } from './TaskTracker/useTaskTracker'; // Import useTaskTracker

const AcademicPlanner = () => {
    const [currentView, setCurrentView] = useState('day'); // 'day', 'week', 'month', 'year'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: 'History Essay Draft',
            subject: 'History',
            type: 'Assignment',
            priority: 'High',
            status: 'in-progress',
            dueDate: new Date(),
            estimatedTime: '4 hours',
            description: 'Write a comprehensive essay on World War II'
        },
        {
            id: 2,
            title: 'Math Problem Set',
            subject: 'Mathematics',
            type: 'Assignment',
            priority: 'Medium',
            status: 'not-started',
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            estimatedTime: '3 hours',
            description: 'Complete calculus problem set chapter 12'
        },
        {
            id: 3,
            title: 'Science Lab Report',
            subject: 'Science',
            type: 'Assignment',
            priority: 'Low',
            status: 'not-started',
            dueDate: new Date(Date.now() + 259200000), // 3 days
            estimatedTime: '2 hours',
            description: 'Lab report on chemical reactions'
        },
        {
            id: 4,
            title: 'Programming Project',
            subject: 'Computer Science',
            type: 'Assignment',
            priority: 'High',
            status: 'not-started',
            dueDate: new Date(Date.now() + 432000000), // 5 days
            estimatedTime: '8 hours',
            description: 'Build a web application using React'
        },
        {
            id: 5,
            title: 'Calculus Review Session',
            subject: 'Mathematics',
            type: 'Study Block',
            priority: 'Low',
            status: 'in-progress',
            dueDate: new Date(),
            estimatedTime: '2 hours',
            description: 'Review calculus concepts for upcoming exam'
        }
    ]);
    const [filters, setFilters] = useState({
        hideCompleted: false,
        showUpcoming: true,
        subjects: ['Mathematics', 'History', 'Science', 'Literature', 'Computer Science'],
        types: ['Assignment', 'Exam', 'Study Block', 'Event', 'Reminder'],
        priorities: ['High', 'Medium', 'Low'],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState(null);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false); // State for modal visibility
    
    // Create ref for the add task modal to enable smooth scrolling
    const addTaskModalRef = useRef(null);

    // const { addTask: addTaskFromHook, formatDate: formatDateFromHook, formatTime: formatTimeFromHook } = useTaskTracker(); // Get functions from hook, aliasing formatDate

    // Function to show toast
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Function to handle opening add task modal with smooth scroll
    const handleOpenAddTaskModal = () => {
        setShowAddTaskModal(true);
        
        // Use setTimeout to ensure the modal is rendered before scrolling
        setTimeout(() => {
            if (addTaskModalRef.current) {
                // Calculate the position to center the modal
                const modalElement = addTaskModalRef.current;
                const modalRect = modalElement.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;
                
                // Calculate the position to center the modal in viewport
                const modalCenter = modalRect.top + scrollTop + (modalRect.height / 2);
                const targetScrollTop = modalCenter - (viewportHeight / 2);
                
                // Smooth scroll to center the modal
                window.scrollTo({
                    top: Math.max(0, targetScrollTop),
                    behavior: 'smooth'
                });
            }
        }, 100); // Small delay to ensure modal is fully rendered
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleDateNavigation = (direction) => {
        const newDate = new Date(currentDate);
        if (currentView === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (currentView === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (currentView === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (currentView === 'year') {
            newDate.setFullYear(newDate.getFullYear() + direction);
        }
        setCurrentDate(newDate);
    };

    const handleTaskComplete = (taskId) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed, status: task.completed ? 'Not Started' : 'Completed' } : task
            )
        );
        showToast(tasks.find(t => t.id === taskId)?.completed ? 'Task marked as incomplete.' : 'Task marked as complete!');
    };

    const handleAddTask = (newTaskData) => {
        const newTask = {
            id: Date.now(), // Simple ID generation
            ...newTaskData,
            subject: newTaskData.subject || 'General', // Default subject if not provided
            type: newTaskData.type || 'Task', // Default type
            status: 'Not Started',
            completed: false,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setShowAddTaskModal(false);
        showToast('New task added successfully!');
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            if (filterType === 'hideCompleted' || filterType === 'showOnlyUpcoming') {
                return { ...prev, [filterType]: !prev[filterType] };
            } else {
                const currentValues = prev[filterType];
                const newValues = currentValues.includes(value)
                    ? currentValues.filter(v => v !== value)
                    : [...currentValues, value];
                return { ...prev, [filterType]: newValues };
            }
        });
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            if (filters.hideCompleted && task.status === 'completed') return false;
            if (filters.showOnlyUpcoming) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                if (task.dueDate < tomorrow) return false;
            }
            if (!filters.subjects.includes(task.subject)) return false;
            if (!filters.types.includes(task.type)) return false;
            if (!filters.priorities.includes(task.priority)) return false;
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    };

    const formatDate = (date) => {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'not-started': { class: 'bg-gray-100 text-gray-800', text: 'Not started' },
            'in-progress': { class: 'bg-yellow-100 text-yellow-800', text: 'In progress' },
            'completed': { class: 'bg-green-100 text-green-800', text: 'Completed' }
        };
        const config = statusConfig[status] || statusConfig['not-started'];
        return (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.class}`}>
                {config.text}
            </span>
        );
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': 'bg-red-500',
            'Medium': 'bg-amber-500',
            'Low': 'bg-blue-500'
        };
        return colors[priority] || colors['Low'];
    };

    const renderSidebar = () => (
        <div className="academic-planner-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Academic Planner</h2>
            </div>
            <div className="sidebar-content">
                <div className="add-task-section">
                    <button className="add-task-btn" onClick={handleOpenAddTaskModal}>
                        <i className="ri-add-line"></i>
                        Add New Task
                    </button>
                </div>

                <div className="filters-section">
                    <h3 className="section-title">FILTERS</h3>
                    <div className="filter-group">
                        <label className="custom-switch">
                            <input 
                                type="checkbox" 
                                checked={filters.hideCompleted}
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
                                checked={filters.showOnlyUpcoming}
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
                        {['Mathematics', 'History', 'Science', 'Literature', 'Computer Science'].map(subject => (
                            <div key={subject} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    id={`subject-${subject.toLowerCase()}`}
                                    checked={filters.subjects.includes(subject)}
                                    onChange={() => handleFilterChange('subjects', subject)}
                                />
                                <label htmlFor={`subject-${subject.toLowerCase()}`} className="checkbox-label">
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
                                    <span className={`priority-dot ${getPriorityColor(priority)}`}></span>
                                    {priority}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="upcoming-deadlines">
                    <h3 className="section-title">Upcoming Deadlines</h3>
                    <div className="deadlines-list">
                        <div className="deadline-item">
                            <span>History Essay Draft</span>
                            <span className="deadline-date today">Today</span>
                        </div>
                        <div className="deadline-item">
                            <span>Math Problem Set</span>
                            <span className="deadline-date">Tomorrow</span>
                        </div>
                        <div className="deadline-item">
                            <span>Science Lab Report</span>
                            <span className="deadline-date">May 25</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTopNavigation = () => (
        <div className="top-navigation">
            <div className="top-row">
                <div className="view-buttons">
                    {['day', 'week', 'month', 'year'].map(view => (
                        <button 
                            key={view}
                            className={`view-btn ${currentView === view ? 'active' : ''}`}
                            onClick={() => handleViewChange(view)}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="date-navigation">
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(-1)}
                    >
                        <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <h2 className="current-date">{formatDate(currentDate)}</h2>
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(1)}
                    >
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </div>
            </div>
            <div className="bottom-row">
                <div className="search-box">
                    <i className="ri-search-line search-icon"></i>
                    <input 
                        type="text" 
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="nav-actions">
                    <button className="nav-icon-btn">
                        <i className="ri-notification-line"></i>
                    </button>
                    <button className="nav-icon-btn">
                        <i className="ri-settings-4-line"></i>
                    </button>
                    <div className="user-avatar">JS</div>
                </div>
            </div>
        </div>
    );

    const renderTaskCard = (task) => (
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
                    </div>
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                        <span className={`status-circle status-${task.status}`}></span>
                        {getStatusBadge(task.status)}
                    </div>
                </div>
                <div className="task-actions">
                    <div className="task-details">
                        <i className="ri-time-line"></i>
                        <span>{task.estimatedTime}</span>
                    </div>
                    <div className="action-buttons">
                        <button className="action-btn">
                            <i className="ri-edit-line"></i>
                        </button>
                        <button 
                            className="action-btn"
                            onClick={() => handleTaskComplete(task.id)}
                        >
                            <i className="ri-check-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDayView = () => {
        const filteredTasks = getFilteredTasks();
        const todayTasks = filteredTasks.filter(task => {
            const today = new Date();
            return task.dueDate.toDateString() === today.toDateString();
        });

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

                    <div className="tasks-section">
                        <div className="section-header-with-count">
                            <h3 className="section-header">Today - {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
                            <span className="task-count">{todayTasks.length} tasks</span>
                        </div>
                        <div className="tasks-list">
                            {todayTasks.map(task => renderTaskCard(task))}
                        </div>
                    </div>

                    <div className="ai-suggestions">
                        <h3 className="section-header">AI Study Suggestions</h3>
                        <div className="suggestions-list">
                            <div className="suggestion-card">
                                <div className="suggestion-icon">
                                    <i className="ri-lightbulb-line"></i>
                                </div>
                                <div className="suggestion-content">
                                    <h4>History Essay Preparation</h4>
                                    <p>Suggested: Today, 2:00 PM - 4:00 PM</p>
                                    <p className="suggestion-desc">
                                        Start with an outline and gather your research materials for the essay.
                                    </p>
                                    <button className="suggestion-btn">Add to schedule</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderWeekView = () => (
        <div className="week-view">
            <div className="week-calendar">
                <div className="week-header">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                        <div key={day} className="week-day-header">
                            {day}<br />
                            <span className="week-date">May {19 + index}</span>
                        </div>
                    ))}
                </div>
                <div className="week-grid">
                    {/* Week grid content would go here */}
                    <div className="week-content">Week view content coming soon...</div>
                </div>
            </div>
        </div>
    );

    const renderMonthView = () => (
        <div className="month-view">
            <div className="month-calendar">
                <div className="month-header">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="month-day-header">{day}</div>
                    ))}
                </div>
                <div className="month-grid">
                    {/* Month grid content would go here */}
                    <div className="month-content">Month view content coming soon...</div>
                </div>
            </div>
        </div>
    );

    const renderYearView = () => (
        <div className="year-view">
            <div className="year-grid">
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <div key={month} className="year-month-card">
                        <h3 className="month-title">{month}</h3>
                        <div className="month-events">
                            <div className="event-item">
                                <span className="event-dot bg-red-500"></span>
                                <span className="event-text">Sample Event</span>
                            </div>
                        </div>
                        <div className="month-stats">
                            <div className="stat-row">
                                <span>Total Tasks:</span>
                                <span>10</span>
                            </div>
                            <div className="stat-row">
                                <span>Exams:</span>
                                <span>2</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'day':
                return renderDayView();
            case 'week':
                return renderWeekView();
            case 'month':
                return renderMonthView();
            case 'year':
                return renderYearView();
            default:
                return renderDayView();
        }
    };

    return (
        <div className="academic-planner">
            {renderSidebar()}
            <div className="main-content">
                {renderTopNavigation()}
                <div className="view-content">
                    {currentView === 'day' && renderDayView()}
                    {currentView === 'week' && renderWeekView()}
                    {currentView === 'month' && renderMonthView()}
                    {currentView === 'year' && renderYearView()}
                </div>
            </div>
            {toastMessage && (
                <div className="toast-container">
                    <div className={`toast-notification ${toastMessage ? '' : 'fade-out'}`}>
                        {toastMessage}
                    </div>
                </div>
            )}
            {showAddTaskModal && (
                <div ref={addTaskModalRef}>
                    <AddTaskForm
                        onAddTask={handleAddTask}
                        onClose={() => setShowAddTaskModal(false)}
                        // Pass any other necessary props like subjects, task types if AddTaskForm needs them for dropdowns
                    />
                </div>
            )}
        </div>
    );
};

export default AcademicPlanner;
