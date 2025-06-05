import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/components/AcademicPlanner.css';
import '../styles/components/AcademicPlannerYear.css';
import AddTaskForm from './AcademicPlanner/AddTaskForm';

const AcademicPlanner = () => {
    const [currentView, setCurrentView] = useState('day'); // 'day', 'week', 'month', 'year'
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Load tasks from localStorage on component mount
    const loadTasksFromStorage = () => {
        try {
            const savedTasks = localStorage.getItem('academicPlannerTasks');
            if (savedTasks) {
                return JSON.parse(savedTasks).map(task => ({
                    ...task,
                    dueDate: new Date(task.dueDate),
                    createdAt: new Date(task.createdAt)
                }));
            }
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
        }
        return [
            {
                id: 1,
                title: 'History Essay Draft',
                subject: 'History',
                type: 'Assignment',
                priority: 'High',
                status: 'in-progress',
                dueDate: new Date(),
                estimatedTime: '4 hours',
                description: 'Write a comprehensive essay on World War II',
                createdAt: new Date(),
                progress: 0.3,
                timeSpent: '1.5 hours'
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
                description: 'Complete calculus problem set chapter 12',
                createdAt: new Date(),
                progress: 0,
                timeSpent: '0 hours'
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
                description: 'Lab report on chemical reactions',
                createdAt: new Date(),
                progress: 0,
                timeSpent: '0 hours'
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
                description: 'Build a web application using React',
                createdAt: new Date(),
                progress: 0,
                timeSpent: '0 hours'
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
                description: 'Review calculus concepts for upcoming exam',
                createdAt: new Date(),
                progress: 0.6,
                timeSpent: '1.2 hours'
            }
        ];
    };

    const [tasks, setTasks] = useState(loadTasksFromStorage);
    
    // Save tasks to localStorage whenever tasks change
    useEffect(() => {
        try {
            localStorage.setItem('academicPlannerTasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    }, [tasks]);

    const [filters, setFilters] = useState({
        hideCompleted: false,
        showUpcoming: true,
        subjects: ['Mathematics', 'History', 'Science', 'Literature', 'Computer Science'],
        types: ['Assignment', 'Exam', 'Study Block', 'Event', 'Reminder'],
        priorities: ['High', 'Medium', 'Low'],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState(null);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [studyTimer, setStudyTimer] = useState({ taskId: null, startTime: null, isRunning: false });
    
    // New features state
    const [draggedTask, setDraggedTask] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showDataVisualization, setShowDataVisualization] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        title: '',
        subject: '',
        priority: '',
        status: '',
        dateRange: { start: '', end: '' },
        tags: []
    });
    const [taskTemplates, setTaskTemplates] = useState([
        {
            id: 'template1',
            name: 'Essay Assignment',
            template: {
                type: 'Assignment',
                priority: 'High',
                estimatedTime: '4 hours',
                description: 'Research, outline, and write essay'
            }
        },
        {
            id: 'template2',
            name: 'Math Problem Set',
            template: {
                type: 'Assignment',
                priority: 'Medium',
                estimatedTime: '2 hours',
                description: 'Complete assigned problem set'
            }
        },
        {
            id: 'template3',
            name: 'Study Session',
            template: {
                type: 'Study Block',
                priority: 'Medium',
                estimatedTime: '1.5 hours',
                description: 'Review material and practice problems'
            }
        },
        {
            id: 'template4',
            name: 'Exam Preparation',
            template: {
                type: 'Study Block',
                priority: 'High',
                estimatedTime: '3 hours',
                description: 'Intensive review for upcoming exam'
            }
        }
    ]);
    
    // Create ref for the add task modal to enable smooth scrolling
    const addTaskModalRef = useRef(null);
    const settingsDropdownRef = useRef(null);
    const settingsBtnRef = useRef(null);

    // Handle click outside to close settings dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if clicking on the settings button itself
            if (settingsBtnRef.current && settingsBtnRef.current.contains(event.target)) {
                return;
            }
            
            // Close if clicking outside the dropdown
            if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
                setShowSettingsDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [settingsDropdownRef, settingsBtnRef]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Don't trigger shortcuts when typing in inputs
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl/Cmd + N: New task
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                setShowAddTaskModal(true);
            }
            // Ctrl/Cmd + F: Search
            else if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                event.preventDefault();
                setShowAdvancedSearch(true);
            }
            // Ctrl/Cmd + T: Templates
            else if ((event.ctrlKey || event.metaKey) && event.key === 't') {
                event.preventDefault();
                setShowTemplates(true);
            }
            // Ctrl/Cmd + D: Data visualization
            else if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
                event.preventDefault();
                setShowDataVisualization(true);
            }
            // Escape: Close modals
            else if (event.key === 'Escape') {
                setShowAddTaskModal(false);
                setShowAdvancedSearch(false);
                setShowTemplates(false);
                setShowDataVisualization(false);
                setEditingTask(null);
            }
            // 1-4: Switch views
            else if (['1', '2', '3', '4'].includes(event.key)) {
                const views = ['day', 'week', 'month', 'year'];
                setCurrentView(views[parseInt(event.key) - 1]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Drag and drop functionality
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (!draggedTask) return;

        const draggedIndex = tasks.findIndex(task => task.id === draggedTask.id);
        if (draggedIndex === -1 || draggedIndex === targetIndex) return;

        const newTasks = [...tasks];
        const [draggedItem] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, draggedItem);

        setTasks(newTasks);
        setDraggedTask(null);
        showToast('Task order updated', 'success');
    };

    // Load user preferences from localStorage
    useEffect(() => {
        try {
            const savedFilters = localStorage.getItem('academicPlannerFilters');
            if (savedFilters) {
                setFilters(JSON.parse(savedFilters));
            }
        } catch (error) {
            console.error('Error loading filters from storage:', error);
        }
    }, []);

    // Save filters to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('academicPlannerFilters', JSON.stringify(filters));
        } catch (error) {
            console.error('Error saving filters to storage:', error);
        }
    }, [filters]);

    // Check for upcoming deadlines and notifications
    useEffect(() => {
        const checkDeadlines = () => {
            const now = new Date();
            const upcomingTasks = tasks.filter(task => {
                const timeDiff = task.dueDate.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 3600);
                return hoursDiff <= 24 && hoursDiff > 0 && task.status !== 'completed';
            });

            if (upcomingTasks.length > 0) {
                // Show browser notifications if permission granted
                if (Notification.permission === 'granted') {
                    upcomingTasks.forEach(task => {
                        const timeDiff = task.dueDate.getTime() - now.getTime();
                        const hoursDiff = Math.round(timeDiff / (1000 * 3600));
                        
                        new Notification(`Academic Planner - Deadline Alert`, {
                            body: `${task.title} is due in ${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''}`,
                            icon: '/favicon.ico',
                            tag: `task-${task.id}` // Prevent duplicate notifications
                        });
                    });
                }
                console.log('Upcoming deadlines:', upcomingTasks);
            }
        };

        // Request notification permission on component mount
        const requestNotificationPermission = async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        showToast('Notifications enabled! You\'ll receive deadline alerts.', 'success');
                    }
                } catch (error) {
                    console.log('Notification permission error:', error);
                }
            }
        };

        requestNotificationPermission();
        const interval = setInterval(checkDeadlines, 60000); // Check every minute
        checkDeadlines(); // Initial check

        return () => clearInterval(interval);
    }, [tasks]);

    // Function to show toast
    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Function to handle opening add task modal with smooth scroll
    const handleOpenAddTaskModal = () => {
        setShowAddTaskModal(true);
        setEditingTask(null);
        
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

    // Function to handle editing a task
    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowAddTaskModal(true);
    };

    // Function to handle deleting a task
    const handleDeleteTask = (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            showToast('Task deleted successfully', 'info');
        }
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
        showToast(`Switched to ${view} view`, 'info');
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

    const handleTaskStatusChange = (taskId, newStatus) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId 
                    ? { 
                        ...task, 
                        status: newStatus,
                        progress: newStatus === 'completed' ? 1 : newStatus === 'in-progress' ? task.progress || 0.5 : 0,
                        completedAt: newStatus === 'completed' ? new Date() : undefined
                    } 
                    : task
            )
        );
        
        const statusMessages = {
            'completed': 'Task marked as complete! 🎉',
            'in-progress': 'Task marked as in progress',
            'not-started': 'Task marked as not started'
        };
        
        showToast(statusMessages[newStatus] || 'Task status updated');
    };

    // Export/Import functionality
    const exportTasks = () => {
        const dataToExport = {
            tasks: tasks,
            filters: filters,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `academic-planner-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Tasks exported successfully! 📁', 'success');
    };

    const importTasks = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.tasks && Array.isArray(importedData.tasks)) {
                    const processedTasks = importedData.tasks.map(task => ({
                        ...task,
                        id: task.id || Date.now() + Math.random(), // Ensure unique IDs
                        dueDate: new Date(task.dueDate),
                        createdAt: new Date(task.createdAt || Date.now())
                    }));
                    
                    setTasks(prevTasks => {
                        const combinedTasks = [...prevTasks, ...processedTasks];
                        // Remove duplicates based on title and dueDate
                        const uniqueTasks = combinedTasks.filter((task, index, self) =>
                            index === self.findIndex(t => 
                                t.title === task.title && 
                                t.dueDate.getTime() === task.dueDate.getTime()
                            )
                        );
                        return uniqueTasks;
                    });
                    
                    if (importedData.filters) {
                        setFilters(importedData.filters);
                    }
                    
                    showToast(`Imported ${processedTasks.length} tasks successfully! 📥`, 'success');
                } else {
                    showToast('Invalid file format. Please select a valid export file.', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing file. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    // Bulk operations
    const markAllCompleted = () => {
        if (window.confirm('Mark all visible tasks as completed?')) {
            const filteredTasks = getFilteredTasks();
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    filteredTasks.find(ft => ft.id === task.id)
                        ? { ...task, status: 'completed', progress: 1, completedAt: new Date() }
                        : task
                    )
            );
            showToast(`Marked ${filteredTasks.length} tasks as completed! 🎉`, 'success');
        }
    };

    const deleteAllCompleted = () => {
        const completedTasks = tasks.filter(task => task.status === 'completed');
        if (completedTasks.length === 0) {
            showToast('No completed tasks to delete.', 'info');
            return;
        }

        if (window.confirm(`Delete ${completedTasks.length} completed tasks? This cannot be undone.`)) {
            setTasks(prevTasks => prevTasks.filter(task => task.status !== 'completed'));
            showToast(`Deleted ${completedTasks.length} completed tasks.`, 'info');
        }
    };

    const handleTaskComplete = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const newStatus = task?.status === 'completed' ? 'not-started' : 'completed';
        handleTaskStatusChange(taskId, newStatus);
    };

    // Enhanced task progress tracking
    const handleProgressUpdate = (taskId, progress) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId 
                    ? { 
                        ...task, 
                        progress: Math.min(Math.max(progress, 0), 1),
                        status: progress >= 1 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
                    } 
                    : task
            )
        );
    };

    // Study timer functionality
    const startStudyTimer = (taskId) => {
        setStudyTimer({
            taskId,
            startTime: new Date(),
            isRunning: true
        });
        showToast('Study timer started! 📚');
    };

    const stopStudyTimer = () => {
        if (studyTimer.isRunning && studyTimer.taskId) {
            const timeSpent = (new Date() - studyTimer.startTime) / 1000 / 60; // minutes
            const timeSpentFormatted = timeSpent < 60 
                ? `${Math.round(timeSpent)} minutes`
                : `${Math.floor(timeSpent / 60)}h ${Math.round(timeSpent % 60)}m`;
            
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === studyTimer.taskId
                        ? { 
                            ...task, 
                            timeSpent: addTimeSpent(task.timeSpent || '0 hours', timeSpentFormatted)
                        }
                        : task
                )
            );
            
            showToast(`Study session completed! Time: ${timeSpentFormatted}`);
        }
        
        setStudyTimer({ taskId: null, startTime: null, isRunning: false });
    };

    // Helper function to add time spent
    const addTimeSpent = (existingTime, newTime) => {
        // Simple implementation - you could make this more sophisticated
        return `${existingTime} + ${newTime}`;
    };

    // Get timer display for running timer
    const getTimerDisplay = () => {
        if (!studyTimer.isRunning || !studyTimer.startTime) return '00:00';
        
        const elapsed = Math.floor((new Date() - studyTimer.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update timer display every second when running
    useEffect(() => {
        let interval;
        if (studyTimer.isRunning) {
            interval = setInterval(() => {
                // Force re-render to update timer display
                setStudyTimer(prev => ({ ...prev }));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [studyTimer.isRunning]);

    // AI Suggestions based on task analysis
    const generateAISuggestions = useMemo(() => {
        const suggestions = [];
        const now = new Date();
        const todayTasks = tasks.filter(task => 
            task.dueDate.toDateString() === now.toDateString()
        );
        const upcomingTasks = tasks.filter(task => {
            const timeDiff = task.dueDate.getTime() - now.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            return daysDiff > 0 && daysDiff <= 7 && task.status !== 'completed';
        });
        const highPriorityTasks = tasks.filter(task => 
            task.priority === 'High' && task.status !== 'completed'
        );
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress');

        // Suggestion for overdue tasks
        const overdueTasks = tasks.filter(task => 
            task.dueDate < now && task.status !== 'completed'
        );
        if (overdueTasks.length > 0) {
            suggestions.push({
                id: 'overdue',
                title: 'Address Overdue Tasks',
                description: `You have ${overdueTasks.length} overdue task(s). Consider prioritizing these immediately.`,
                type: 'urgent',
                action: 'Review overdue tasks',
                icon: 'ri-alarm-warning-line'
            });
        }

        // Suggestion for high priority tasks
        if (highPriorityTasks.length > 0) {
            suggestions.push({
                id: 'high-priority',
                title: 'Focus on High Priority Tasks',
                description: `You have ${highPriorityTasks.length} high priority task(s) that need attention.`,
                type: 'important',
                action: 'Start high priority task',
                icon: 'ri-star-line'
            });
        }

        // Study session suggestions
        if (inProgressTasks.length > 0) {
            const task = inProgressTasks[0];
            suggestions.push({
                id: 'continue-work',
                title: `Continue working on ${task.title}`,
                description: `You're ${Math.round(task.progress * 100)}% complete. A focused session could help you make significant progress.`,
                type: 'productive',
                action: 'Start study session',
                icon: 'ri-focus-3-line',
                taskId: task.id
            });
        }

        // Break suggestion based on time spent
        const longStudySessions = tasks.filter(task => {
            const timeSpent = task.timeSpent || '0 hours';
            return timeSpent.includes('hours') && parseInt(timeSpent) > 2;
        });
        if (longStudySessions.length > 0) {
            suggestions.push({
                id: 'take-break',
                title: 'Time for a Break',
                description: 'You\'ve been studying for a while. Consider taking a 15-minute break to recharge.',
                type: 'wellness',
                action: 'Schedule break',
                icon: 'ri-cup-line'
            });
        }

        // Subject variety suggestion
        const recentSubjects = todayTasks.map(task => task.subject);
        const uniqueSubjects = [...new Set(recentSubjects)];
        if (uniqueSubjects.length < 2 && todayTasks.length > 2) {
            suggestions.push({
                id: 'subject-variety',
                title: 'Mix Up Your Subjects',
                description: 'Consider switching between different subjects to maintain engagement and improve retention.',
                type: 'strategy',
                action: 'Plan subject rotation',
                icon: 'ri-shuffle-line'
            });
        }

        // Upcoming deadline preparation
        if (upcomingTasks.length > 0) {
            const nextTask = upcomingTasks.sort((a, b) => a.dueDate - b.dueDate)[0];
            const daysUntilDue = Math.ceil((nextTask.dueDate - now) / (1000 * 3600 * 24));
            suggestions.push({
                id: 'prepare-deadline',
                title: `Prepare for ${nextTask.title}`,
                description: `Due in ${daysUntilDue} day(s). Start preparing early to avoid last-minute stress.`,
                type: 'planning',
                action: 'Start preparation',
                icon: 'ri-calendar-check-line',
                taskId: nextTask.id
            });
        }

        return suggestions.slice(0, 3); // Return top 3 suggestions
    }, [tasks]);

    const handleSuggestionAction = (suggestion) => {
        switch (suggestion.id) {
            case 'overdue':
                setFilters(prev => ({ ...prev, showOnlyOverdue: true }));
                showToast('Showing overdue tasks', 'info');
                break;
            case 'high-priority':
                setFilters(prev => ({ ...prev, priorities: ['High'] }));
                showToast('Filtering high priority tasks', 'info');
                break;
            case 'continue-work':
            case 'prepare-deadline':
                if (suggestion.taskId) {
                    startStudyTimer(suggestion.taskId);
                }
                break;
            case 'take-break':
                showToast('Great idea! Take a well-deserved break 😊', 'success');
                break;
            case 'subject-variety':
                showToast('Consider mixing subjects in your next study session', 'info');
                break;
            default:
                showToast('Suggestion noted!', 'info');
        }
    };

    const handleAddTask = (newTaskData) => {
        if (editingTask) {
            // Update existing task
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === editingTask.id
                        ? { 
                            ...task, 
                            ...newTaskData,
                            updatedAt: new Date()
                        }
                        : task
                )
            );
            showToast('Task updated successfully! ✏️');
        } else {
            // Add new task
            const newTask = {
                id: Date.now(), // Simple ID generation
                ...newTaskData,
                subject: newTaskData.subject || 'General',
                type: newTaskData.type || 'Task',
                status: 'not-started',
                progress: 0,
                timeSpent: '0 hours',
                createdAt: new Date()
            };
            setTasks(prevTasks => [newTask, ...prevTasks]);
            showToast('New task added successfully! ✅');
        }
        
        setShowAddTaskModal(false);
        setEditingTask(null);
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

    // Task template functionality
    const createTaskFromTemplate = (template, customTitle, customSubject) => {
        const newTask = {
            id: Date.now() + Math.random(),
            title: customTitle || `${template.name} - ${customSubject}`,
            subject: customSubject || 'General',
            ...template.template,
            dueDate: new Date(Date.now() + 86400000 * 7), // Default to 1 week from now
            status: 'not-started',
            progress: 0,
            timeSpent: '0 hours',
            createdAt: new Date()
        };
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        setShowTemplates(false);
        showToast(`Task created from template: ${template.name}`, 'success');
    };

    const addCustomTemplate = (name, template) => {
        const newTemplate = {
            id: `template_${Date.now()}`,
            name,
            template
        };
        setTaskTemplates(prev => [...prev, newTemplate]);
        showToast('Custom template saved!', 'success');
    };

    // Advanced search functionality  
    const getFilteredTasks = () => {
        let filtered = tasks;

        // Apply basic search
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.subject.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply advanced search filters
        if (searchFilters.title) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchFilters.title.toLowerCase())
            );
        }

        if (searchFilters.subject) {
            filtered = filtered.filter(task =>
                task.subject.toLowerCase().includes(searchFilters.subject.toLowerCase())
            );
        }

        if (searchFilters.priority) {
            filtered = filtered.filter(task => task.priority === searchFilters.priority);
        }

        if (searchFilters.status) {
            filtered = filtered.filter(task => task.status === searchFilters.status);
        }

        if (searchFilters.dateRange.start) {
            const startDate = new Date(searchFilters.dateRange.start);
            filtered = filtered.filter(task => task.dueDate >= startDate);
        }

        if (searchFilters.dateRange.end) {
            const endDate = new Date(searchFilters.dateRange.end);
            filtered = filtered.filter(task => task.dueDate <= endDate);
        }

        // Apply existing filters
        if (filters.hideCompleted) {
            filtered = filtered.filter(task => task.status !== 'completed');
        }

        return filtered;
    };

    // Data visualization functions
    const getTaskAnalytics = () => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;
        const overdueTasks = tasks.filter(task => 
            task.dueDate < new Date() && task.status !== 'completed'
        ).length;

        // Subject distribution
        const subjectStats = {};
        tasks.forEach(task => {
            subjectStats[task.subject] = (subjectStats[task.subject] || 0) + 1;
        });

        // Priority distribution
        const priorityStats = {};
        tasks.forEach(task => {
            priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
        });

        // Weekly completion rates
        const weeklyStats = {};
        tasks.filter(task => task.completedAt).forEach(task => {
            const weekKey = getWeekKey(task.completedAt);
            weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
        });

        // Average time tracking
        const tasksWithTime = tasks.filter(task => task.timeSpent && task.timeSpent !== '0 hours');
        const averageTimeSpent = tasksWithTime.length > 0 
            ? tasksWithTime.reduce((sum, task) => sum + parseTimeToMinutes(task.timeSpent), 0) / tasksWithTime.length
            : 0;

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            notStartedTasks,
            overdueTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
            subjectStats,
            priorityStats,
            weeklyStats,
            averageTimeSpent: Math.round(averageTimeSpent)
        };
    };

    const getWeekKey = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
    };

    const parseTimeToMinutes = (timeString) => {
        if (!timeString || timeString === '0 hours') return 0;
        const hoursMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/);
        const minutesMatch = timeString.match(/(\d+)\s*m/);
        
        let totalMinutes = 0;
        if (hoursMatch) totalMinutes += parseFloat(hoursMatch[1]) * 60;
        if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
        
        return totalMinutes;
    };

    // Recurring task functionality
    const createRecurringTask = (task, frequency) => {
        const frequencies = {
            daily: 1,
            weekly: 7,
            biweekly: 14,
            monthly: 30
        };
        
        const daysToAdd = frequencies[frequency];
        if (!daysToAdd) return;

        const nextTask = {
            ...task,
            id: Date.now() + Math.random(),
            dueDate: new Date(task.dueDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000),
            status: 'not-started',
            progress: 0,
            timeSpent: '0 hours',
            createdAt: new Date(),
            isRecurring: true,
            recurringFrequency: frequency,
            originalTaskId: task.id
        };

        setTasks(prev => [...prev, nextTask]);
        showToast(`Recurring task created (${frequency})`, 'success');
    };

    // Task collaboration features
    const shareTask = (task) => {
        const shareText = `Task: ${task.title}\nSubject: ${task.subject}\nDue: ${task.dueDate.toLocaleString()}\nPriority: ${task.priority}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Academic Task: ${task.title}`,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            showToast('Task details copied to clipboard!', 'success');
        }
    };

    // Task notes and comments system
    const addTaskNote = (taskId, note) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        notes: [...(task.notes || []), {
                            id: Date.now(),
                            text: note,
                            timestamp: new Date()
                        }]
                    }
                    : task
            )
        );
        showToast('Note added to task', 'success');
    };

    // Task priority scoring system
    const calculateTaskPriorityScore = (task) => {
        let score = 0;
        
        // Priority weight
        const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
        score += priorityWeights[task.priority] || 1;
        
        // Due date urgency
        const now = new Date();
        const daysUntilDue = (task.dueDate - now) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 1) score += 5; // Due today or overdue
        else if (daysUntilDue < 3) score += 3; // Due within 3 days
        else if (daysUntilDue < 7) score += 2; // Due within a week
        
        // Progress factor (less progress = higher priority)
        score += (1 - task.progress) * 2;
        
        return score;
    };

    // Smart task suggestions based on context
    const getSmartTaskSuggestions = (currentTask) => {
        if (!currentTask) return [];
        
        const suggestions = [];
        
        // Related tasks by subject
        const relatedTasks = tasks.filter(task => 
            task.id !== currentTask.id && 
            task.subject === currentTask.subject && 
            task.status !== 'completed'
        );
        
        if (relatedTasks.length > 0) {
            suggestions.push({
                type: 'related',
                title: `Continue with ${currentTask.subject}`,
                tasks: relatedTasks.slice(0, 3)
            });
        }
        
        // Similar priority tasks
        const similarPriorityTasks = tasks.filter(task =>
            task.id !== currentTask.id &&
            task.priority === currentTask.priority &&
            task.status !== 'completed'
        );
        
        if (similarPriorityTasks.length > 0) {
            suggestions.push({
                type: 'priority',
                title: `Other ${currentTask.priority.toLowerCase()} priority tasks`,
                tasks: similarPriorityTasks.slice(0, 3)
            });
        }
        
        return suggestions;
    };

    // Focus mode functionality
    const [focusMode, setFocusMode] = useState(false);
    const [focusTask, setFocusTask] = useState(null);
    
    const enterFocusMode = (task) => {
        setFocusMode(true);
        setFocusTask(task);
        startStudyTimer(task.id);
        showToast(`Focus mode activated for: ${task.title}`, 'success');
        
        // Hide other tasks and show minimal UI
        document.body.classList.add('focus-mode');
    };

    const exitFocusMode = () => {
        setFocusMode(false);
        setFocusTask(null);
        if (studyTimer.isRunning) {
            stopStudyTimer();
        }
        document.body.classList.remove('focus-mode');
        showToast('Focus mode deactivated', 'info');
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

    const renderTopNavigation = () => (
        <div className="top-navigation">
            {/* Top Row: View Buttons Centered */}
            <div className="view-buttons-row">
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
            </div>
            
            {/* Middle Row: Date Navigation Centered */}
            <div className="date-navigation-row">
                <div className="date-navigation">
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(-1)}
                        title="Previous"
                    >
                        <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <h2 className="current-date">{formatDate(currentDate)}</h2>
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(1)}
                        title="Next"
                    >
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </div>
            </div>
            
            {/* Bottom Row: Search and Action Buttons */}
            <div className="actions-row">
                <div className="search-box">
                    <i className="ri-search-line search-icon"></i>
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="nav-actions">
                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowTemplates(true)}
                        title="Task Templates (Ctrl+T)"
                    >
                        <i className="ri-file-copy-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowAdvancedSearch(true)}
                        title="Advanced Search (Ctrl+F)"
                    >
                        <i className="ri-search-2-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowDataVisualization(true)}
                        title="Analytics Dashboard (Ctrl+D)"
                    >
                        <i className="ri-bar-chart-line"></i>
                    </button>

                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Notifications"
                    >
                        <i className="ri-notification-line"></i>
                        {tasks.filter(task => {
                            const timeDiff = task.dueDate.getTime() - new Date().getTime();
                            const hoursDiff = timeDiff / (1000 * 3600);
                            return hoursDiff <= 24 && hoursDiff > 0 && task.status !== 'completed';
                        }).length > 0 && <span className="notification-badge"></span>}
                    </button>
                    
                    <div className="dropdown-container">
                        <button className="nav-icon-btn" title="More Options">
                            <i className="ri-more-line"></i>
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={exportTasks} className="dropdown-item year-view-action">
                                <i className="ri-download-line"></i>
                                Export Tasks
                            </button>
                            <label className="dropdown-item year-view-action file-input-label">
                                <i className="ri-upload-line"></i>
                                Import Tasks
                                <input 
                                    type="file" 
                                    accept=".json"
                                    onChange={importTasks}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <div className="dropdown-divider"></div>
                            <button onClick={markAllCompleted} className="dropdown-item year-view-action">
                                <i className="ri-checkbox-multiple-line"></i>
                                Mark All Complete
                            </button>
                            <button onClick={deleteAllCompleted} className="dropdown-item danger year-view-action">
                                <i className="ri-delete-bin-line"></i>
                                Clear Completed
                            </button>
                        </div>
                    </div>
                    
                    <div className="dropdown">
                        <button 
                            className="nav-icon-btn" 
                            title="Settings" 
                            ref={settingsBtnRef}
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                        >
                            <i className="ri-settings-4-line"></i>
                        </button>
                        
                        <div className={`dropdown-menu ${showSettingsDropdown ? 'show' : ''}`} ref={settingsDropdownRef}>
                            <h6 className="dropdown-header">Settings</h6>
                            <button onClick={exportTasks} className="dropdown-item">
                                <i className="ri-download-line"></i>
                                Export Tasks
                            </button>
                            <label className="dropdown-item" style={{cursor: 'pointer'}}>
                                <i className="ri-upload-line"></i>
                                Import Tasks
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    style={{display: 'none'}} 
                                    onChange={importTasks}
                                />
                            </label>
                            <div className="dropdown-divider"></div>
                            <button onClick={markAllCompleted} className="dropdown-item">
                                <i className="ri-checkbox-multiple-line"></i>
                                Mark All Complete
                            </button>
                            <button onClick={deleteAllCompleted} className="dropdown-item danger">
                                <i className="ri-delete-bin-line"></i>
                                Clear Completed
                            </button>
                        </div>
                    </div>
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
                        {getStatusBadge(task.status)}
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

    const renderWeekView = () => {
        const filteredTasks = getFilteredTasks();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
        
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            return day;
        });

        const getTasksForDay = (date) => {
            return filteredTasks.filter(task => 
                task.dueDate.toDateString() === date.toDateString()
            );
        };

        return (
            <div className="week-view">
                <div className="week-calendar">
                    <div className="week-header">
                        {weekDays.map((day, index) => (
                            <div key={index} className="week-day-header">
                                <div className="day-name">
                                    {day.toLocaleDateString('en-US', { weekday: 'long' })}
                                </div>
                                <div className="day-date">
                                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="task-count-badge">
                                    {getTasksForDay(day).length}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="week-grid">
                        {weekDays.map((day, dayIndex) => (
                            <div key={dayIndex} className="week-day-column">
                                <div className="day-tasks">
                                    {getTasksForDay(day).map(task => (
                                        <div key={task.id} className={`week-task-item priority-${task.priority.toLowerCase()}`}>
                                            <div className="task-time">
                                                {task.dueDate.toLocaleTimeString('en-US', { 
                                                    hour: 'numeric', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                            <div className="task-title-short">{task.title}</div>
                                            <div className="task-subject-small">{task.subject}</div>
                                            <div className={`task-status-dot status-${task.status}`}></div>
                                        </div>
                                    ))}
                                    {getTasksForDay(day).length === 0 && (
                                        <div className="no-tasks-message">No tasks scheduled</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="week-summary">
                    <h3>Week Summary</h3>
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-number">{filteredTasks.length}</span>
                            <span className="stat-label">Total Tasks</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {filteredTasks.filter(t => t.status === 'completed').length}
                            </span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {filteredTasks.filter(t => t.priority === 'High').length}
                            </span>
                            <span className="stat-label">High Priority</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const filteredTasks = getFilteredTasks();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Make Monday = 1
        
        // Create array of all days to display (including previous/next month)
        const calendarDays = [];
        
        // Add days from previous month
        for (let i = startingDayOfWeek - 1; i > 0; i--) {
            const prevDay = new Date(year, month, 1 - i);
            calendarDays.push({ date: prevDay, isCurrentMonth: false });
        }
        
        // Add days from current month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            calendarDays.push({ date: currentDay, isCurrentMonth: true });
        }
        
        // Add days from next month to complete the grid
        const remainingSlots = 42 - calendarDays.length; // 6 rows × 7 days
        for (let day = 1; day <= remainingSlots; day++) {
            const nextDay = new Date(year, month + 1, day);
            calendarDays.push({ date: nextDay, isCurrentMonth: false });
        }

        const getTasksForDate = (date) => {
            return filteredTasks.filter(task => 
                task.dueDate.toDateString() === date.toDateString()
            );
        };

        const isToday = (date) => {
            const today = new Date();
            return date.toDateString() === today.toDateString();
        };

        return (
            <div className="month-view">
                <div className="month-calendar">
                    <div className="month-header">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="month-day-header">{day}</div>
                        ))}
                    </div>
                    <div className="month-grid">
                        {calendarDays.map((dayObj, index) => {
                            const dayTasks = getTasksForDate(dayObj.date);
                            return (
                                <div 
                                    key={index} 
                                    className={`month-day-cell ${
                                        dayObj.isCurrentMonth ? 'current-month' : 'other-month'
                                    } ${isToday(dayObj.date) ? 'today' : ''}`}
                                >
                                    <div className="day-number">
                                        {dayObj.date.getDate()}
                                    </div>
                                    <div className="day-tasks-preview">
                                        {dayTasks.slice(0, 2).map(task => (
                                            <div 
                                                key={task.id} 
                                                className={`task-dot priority-${task.priority.toLowerCase()}`}
                                                title={task.title}
                                            >
                                                <span className="task-dot-text">{task.title.substring(0, 15)}...</span>
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <div className="more-tasks">+{dayTasks.length - 2} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="month-sidebar">
                    <div className="month-stats">
                        <h3>Month Overview</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-number">{filteredTasks.length}</div>
                                <div className="stat-label">Total Tasks</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {filteredTasks.filter(t => t.status === 'completed').length}
                                </div>
                                <div className="stat-label">Completed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {filteredTasks.filter(t => t.status === 'in-progress').length}
                                </div>
                                <div className="stat-label">In Progress</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">
                                    {filteredTasks.filter(t => t.priority === 'High').length}
                                </div>
                                <div className="stat-label">High Priority</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="upcoming-this-month">
                        <h4>Upcoming This Month</h4>
                        <div className="upcoming-list">
                            {filteredTasks
                                .filter(task => task.dueDate.getMonth() === month && task.status !== 'completed')
                                .sort((a, b) => a.dueDate - b.dueDate)
                                .slice(0, 5)
                                .map(task => (
                                    <div key={task.id} className="upcoming-item">
                                        <div className="upcoming-date">
                                            {task.dueDate.getDate()}
                                        </div>
                                        <div className="upcoming-details">
                                            <div className="upcoming-title">{task.title}</div>
                                            <div className="upcoming-subject">{task.subject}</div>
                                        </div>
                                        <div className={`upcoming-priority priority-${task.priority.toLowerCase()}`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderYearView = () => {
        const filteredTasks = getFilteredTasks();
        const currentYear = currentDate.getFullYear();
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Define seasons for each month
        const monthSeasons = [
            'Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer',
            'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'
        ];

        // Define season colors
        const getSeasonColor = (season) => {
            switch(season) {
                case 'Winter': return '#3b82f6'; // blue
                case 'Spring': return '#10b981'; // green
                case 'Summer': return '#f59e0b'; // amber
                case 'Autumn': return '#ef4444'; // red
                default: return '#6b7280'; // gray
            }
        };

        const getTasksForMonth = (monthIndex) => {
            return filteredTasks.filter(task => 
                task.dueDate.getFullYear() === currentYear && 
                task.dueDate.getMonth() === monthIndex
            );
        };

        const getMonthStats = (monthIndex) => {
            const monthTasks = getTasksForMonth(monthIndex);
            return {
                total: monthTasks.length,
                completed: monthTasks.filter(t => t.status === 'completed').length,
                inProgress: monthTasks.filter(t => t.status === 'in-progress').length,
                highPriority: monthTasks.filter(t => t.priority === 'High').length,
                exams: monthTasks.filter(t => t.type === 'Exam').length,
                assignments: monthTasks.filter(t => t.type === 'Assignment').length
            };
        };

        const yearStats = {
            totalTasks: filteredTasks.filter(t => t.dueDate.getFullYear() === currentYear).length,
            completedTasks: filteredTasks.filter(t => 
                t.dueDate.getFullYear() === currentYear && t.status === 'completed'
            ).length,
            totalExams: filteredTasks.filter(t => 
                t.dueDate.getFullYear() === currentYear && t.type === 'Exam'
            ).length,
            totalAssignments: filteredTasks.filter(t => 
                t.dueDate.getFullYear() === currentYear && t.type === 'Assignment'
            ).length,
            highPriorityTasks: filteredTasks.filter(t => 
                t.dueDate.getFullYear() === currentYear && t.priority === 'High'
            ).length
        };

        const completionRate = yearStats.totalTasks > 0 
            ? Math.round((yearStats.completedTasks / yearStats.totalTasks) * 100) 
            : 0;

        return (
            <div className="year-view">
                <div className="year-header">
                    <div className="year-title">
                        <h2>{currentYear} Academic Year Overview</h2>
                    </div>
                    
                    {/* Centered action buttons for year view */}
                    <div className="year-view-actions">
                        <button className="year-action-btn" onClick={exportTasks}>
                            <i className="ri-download-line"></i> Export Tasks
                        </button>
                        <label className="year-action-btn file-input-label">
                            <i className="ri-upload-line"></i> Import Tasks
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={importTasks}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <button className="year-action-btn" onClick={markAllCompleted}>
                            <i className="ri-checkbox-multiple-line"></i> Mark All Complete
                        </button>
                        <button className="year-action-btn" onClick={deleteAllCompleted}>
                            <i className="ri-delete-bin-line"></i> Clear Completed
                        </button>
                    </div>
                    
                    <div className="year-stats-summary">
                        <div className="year-stat-item">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <div className="year-stat-number">{yearStats.totalTasks}</div>
                                    <div className="year-stat-label">Total Tasks</div>
                                </div>
                                <div className="w-10 h-10 bg-opacity-50 rounded-full flex items-center justify-center bg-blue-400">
                                    <i className="ri-file-list-3-line text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="year-stat-item">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <div className="year-stat-number">{yearStats.totalAssignments}</div>
                                    <div className="year-stat-label">Assignments</div>
                                </div>
                                <div className="w-10 h-10 bg-opacity-50 rounded-full flex items-center justify-center bg-amber-400">
                                    <i className="ri-article-line text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="year-stat-item">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <div className="year-stat-number">{yearStats.totalExams}</div>
                                    <div className="year-stat-label">Exams</div>
                                </div>
                                <div className="w-10 h-10 bg-opacity-50 rounded-full flex items-center justify-center bg-red-400">
                                    <i className="ri-file-text-line text-xl"></i>
                                </div>
                            </div>
                        </div>
                        <div className="year-stat-item">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <div className="year-stat-number">{completionRate}%</div>
                                    <div className="year-stat-label">Completion Rate</div>
                                </div>
                                <div className="w-10 h-10 bg-opacity-50 rounded-full flex items-center justify-center bg-green-400">
                                    <i className="ri-checkbox-circle-line text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="year-grid">
                    {monthNames.map((month, index) => {
                        const monthStats = getMonthStats(index);
                        const monthTasks = getTasksForMonth(index);
                        const monthCompletionRate = monthStats.total > 0 
                            ? Math.round((monthStats.completed / monthStats.total) * 100) 
                            : 0;
                        const season = monthSeasons[index];
                        const seasonColor = getSeasonColor(season);

                        return (
                            <div key={month} className="year-month-card">
                                <div className="month-header-year">
                                    <h3 className="month-title">{month}</h3>
                                    <div className="month-season" style={{backgroundColor: `${seasonColor}20`, color: seasonColor}}>
                                        {season}
                                    </div>
                                </div>
                                
                                <div className="month-events">
                                    {monthTasks.slice(0, 3).map(task => (
                                        <div key={task.id} className="event-item">
                                            <span className={`event-dot priority-${task.priority.toLowerCase()}`}></span>
                                            <span className="event-text">{task.title}</span>
                                            <span className="event-date">
                                                {month.substring(0, 3)} {task.dueDate.getDate()}
                                            </span>
                                        </div>
                                    ))}
                                    {monthTasks.length > 3 && (
                                        <div className="more-events">
                                            +{monthTasks.length - 3} more tasks
                                        </div>
                                    )}
                                    {monthTasks.length === 0 && (
                                        <div className="no-events">No tasks scheduled</div>
                                    )}
                                </div>
                                
                                <div className="month-stats">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">{monthStats.total}</p>
                                            <p className="text-xs text-gray-500">Tasks</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold" style={{color: seasonColor}}>{monthStats.exams}</p>
                                            <p className="text-xs text-gray-500">Exams</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

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

    // Utility functions
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'priority-high';
            case 'Medium':
                return 'priority-medium';
            case 'Low':
                return 'priority-low';
            default:
                return 'priority-medium';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'in-progress':
                return 'status-in-progress';
            case 'not-started':
                return 'status-not-started';
            default:
                return 'status-not-started';
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatDueDate = (date) => {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else {
            return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'completed': {
                label: 'Completed',
                icon: 'ri-check-line',
                className: 'status-completed'
            },
            'in-progress': {
                label: 'In Progress',
                icon: 'ri-play-line',
                className: 'status-in-progress'
            },
            'not-started': {
                label: 'Not Started',
                icon: 'ri-pause-line',
                className: 'status-not-started'
            }
        };

        const config = statusConfig[status] || statusConfig['not-started'];
        
        return (
            <span className={`status-badge ${config.className}`}>
                <i className={config.icon}></i>
                {config.label}
            </span>
        );
    };

    const formatTimerDisplay = (startTime) => {
        if (!startTime) return '00:00';
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="academic-planner">
            {renderSidebar()}
            <div className={`main-content ${currentView === 'year' ? 'year-view-active' : ''}`}>
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
                    <div className={`toast-notification toast-${toastMessage.type} ${toastMessage ? 'show' : 'fade-out'}`}>
                        <div className="toast-content">
                            <div className="toast-icon">
                                {toastMessage.type === 'success' && <i className="ri-check-line"></i>}
                                {toastMessage.type === 'error' && <i className="ri-error-warning-line"></i>}
                                {toastMessage.type === 'info' && <i className="ri-information-line"></i>}
                                {toastMessage.type === 'warning' && <i className="ri-alert-line"></i>}
                            </div>
                            <span className="toast-message">{toastMessage.message}</span>
                        </div>
                        <button 
                            className="toast-close"
                            onClick={() => setToastMessage(null)}
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Task Templates Modal */}
            {showTemplates && (
                <div className="modal-overlay">
                    <div className="modal-content templates-modal">
                        <div className="modal-header">
                            <h3><i className="ri-file-copy-line"></i> Task Templates</h3>
                            <button onClick={() => setShowTemplates(false)} className="close-btn">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="templates-grid">
                            {taskTemplates.map(template => (
                                <div key={template.id} className="template-card">
                                    <div className="template-header">
                                        <h4>{template.name}</h4>
                                        <span className="template-type">{template.template.type}</span>
                                    </div>
                                    <p>{template.template.description}</p>
                                    <div className="template-details">
                                        <span className="priority-badge priority-{template.template.priority.toLowerCase()}">
                                            {template.template.priority}
                                        </span>
                                        <span className="estimated-time">{template.template.estimatedTime}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const title = prompt('Task title:', `${template.name} - ${new Date().toLocaleDateString()}`);
                                            const subject = prompt('Subject:', 'General');
                                            if (title && subject) {
                                                createTaskFromTemplate(template, title, subject);
                                            }
                                        }}
                                        className="use-template-btn"
                                    >
                                        <i className="ri-add-line"></i> Use Template
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowTemplates(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Search Modal */}
            {showAdvancedSearch && (
                <div className="modal-overlay">
                    <div className="modal-content search-modal">
                        <div className="modal-header">
                            <h3><i className="ri-search-2-line"></i> Advanced Search</h3>
                            <button onClick={() => setShowAdvancedSearch(false)} className="close-btn">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="search-form">
                            <div className="search-row">
                                <div className="search-field">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={searchFilters.title}
                                        onChange={(e) => setSearchFilters(prev => ({...prev, title: e.target.value}))}
                                        placeholder="Search by title..."
                                    />
                                </div>
                                <div className="search-field">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        value={searchFilters.subject}
                                        onChange={(e) => setSearchFilters(prev => ({...prev, subject: e.target.value}))}
                                        placeholder="Search by subject..."
                                    />
                                </div>
                            </div>
                            <div className="search-row">
                                <div className="search-field">
                                    <label>Priority</label>
                                    <select
                                        value={searchFilters.priority}
                                        onChange={(e) => setSearchFilters(prev => ({...prev, priority: e.target.value}))}
                                    >
                                        <option value="">Any Priority</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="search-field">
                                    <label>Status</label>
                                    <select
                                        value={searchFilters.status}
                                        onChange={(e) => setSearchFilters(prev => ({...prev, status: e.target.value}))}
                                    >
                                        <option value="">Any Status</option>
                                        <option value="not-started">Not Started</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="search-row">
                                <div className="search-field">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={searchFilters.dateRange.start}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            dateRange: {...prev.dateRange, start: e.target.value}
                                        }))}
                                    />
                                </div>
                                <div className="search-field">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={searchFilters.dateRange.end}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            dateRange: {...prev.dateRange, end: e.target.value}
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="search-results">
                            <h4>Search Results ({getFilteredTasks().length} tasks)</h4>
                            <div className="search-results-list">
                                {getFilteredTasks().slice(0, 10).map(task => (
                                    <div key={task.id} className="search-result-item">
                                        <div className="result-info">
                                            <h5>{task.title}</h5>
                                            <span className="result-subject">{task.subject}</span>
                                            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="result-actions">
                                            <button onClick={() => {
                                                setEditingTask(task);
                                                setShowAddTaskModal(true);
                                                setShowAdvancedSearch(false);
                                            }}>
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setSearchFilters({
                                        title: '',
                                        subject: '',
                                        priority: '',
                                        status: '',
                                        dateRange: { start: '', end: '' },
                                        tags: []
                                    });
                                }}
                            >
                                Clear Filters
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowAdvancedSearch(false)}>
                                Apply & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Visualization Modal */}
            {showDataVisualization && (
                <div className="modal-overlay">
                    <div className="modal-content analytics-modal">
                        <div className="modal-header">
                            <h3><i className="ri-bar-chart-line"></i> Task Analytics</h3>
                            <button onClick={() => setShowDataVisualization(false)} className="close-btn">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="analytics-content">
                            {(() => {
                                const analytics = getTaskAnalytics();
                                return (
                                    <>
                                        <div className="stats-overview">
                                            <div className="stat-card">
                                                <div className="stat-number">{analytics.totalTasks}</div>
                                                <div className="stat-label">Total Tasks</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-number">{analytics.completedTasks}</div>
                                                <div className="stat-label">Completed</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-number">{analytics.completionRate}%</div>
                                                <div className="stat-label">Completion Rate</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-number">{analytics.overdueTasks}</div>
                                                <div className="stat-label">Overdue</div>
                                            </div>
                                        </div>
                                        
                                        <div className="charts-grid">
                                            <div className="chart-container">
                                                <h4>Status Distribution</h4>
                                                <div className="progress-chart">
                                                    <div className="progress-bar">
                                                        <div 
                                                            className="progress-segment completed" 
                                                            style={{width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%`}}
                                                        ></div>
                                                        <div 
                                                            className="progress-segment in-progress" 
                                                            style={{width: `${(analytics.inProgressTasks / analytics.totalTasks) * 100}%`}}
                                                        ></div>
                                                        <div 
                                                            className="progress-segment not-started" 
                                                            style={{width: `${(analytics.notStartedTasks / analytics.totalTasks) * 100}%`}}
                                                        ></div>
                                                    </div>
                                                    <div className="chart-legend">
                                                        <span><span className="legend-color completed"></span>Completed ({analytics.completedTasks})</span>
                                                        <span><span className="legend-color in-progress"></span>In Progress ({analytics.inProgressTasks})</span>
                                                        <span><span className="legend-color not-started"></span>Not Started ({analytics.notStartedTasks})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="chart-container">
                                                <h4>Subject Distribution</h4>
                                                <div className="subject-stats">
                                                    {Object.entries(analytics.subjectStats).map(([subject, count]) => (
                                                        <div key={subject} className="subject-stat">
                                                            <span className="subject-name">{subject}</span>
                                                            <div className="subject-bar">
                                                                <div 
                                                                    className="subject-fill" 
                                                                    style={{width: `${(count / analytics.totalTasks) * 100}%`}}
                                                                ></div>
                                                            </div>
                                                            <span className="subject-count">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="chart-container">
                                                <h4>Priority Breakdown</h4>
                                                <div className="priority-stats">
                                                    {Object.entries(analytics.priorityStats).map(([priority, count]) => (
                                                        <div key={priority} className="priority-stat">
                                                            <span className={`priority-badge priority-${priority.toLowerCase()}`}>
                                                                {priority}
                                                            </span>
                                                            <span className="priority-count">{count} tasks</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="chart-container">
                                                <h4>Performance Insights</h4>
                                                <div className="insights-list">
                                                    <div className="insight-item">
                                                        <i className="ri-time-line"></i>
                                                        <span>Average time per task: {analytics.averageTimeSpent} minutes</span>
                                                    </div>
                                                    <div className="insight-item">
                                                        <i className="ri-calendar-check-line"></i>
                                                        <span>Most productive subject: {Object.entries(analytics.subjectStats).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}</span>
                                                    </div>
                                                    <div className="insight-item">
                                                        <i className="ri-trophy-line"></i>
                                                        <span>Completion streak: {analytics.completionRate}% overall</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDataVisualization(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Focus Mode Overlay */}
            {focusMode && focusTask && (
                <div className="focus-mode-overlay">
                    <div className="focus-mode-content">
                        <div className="focus-header">
                            <h2><i className="ri-focus-3-line"></i> Focus Mode</h2>
                            <button onClick={exitFocusMode} className="exit-focus-btn">
                                <i className="ri-close-line"></i> Exit Focus
                            </button>
                        </div>
                        <div className="focus-task">
                            <h3>{focusTask.title}</h3>
                            <p>{focusTask.description}</p>
                            <div className="focus-details">
                                <span className="focus-subject">{focusTask.subject}</span>
                                <span className={`priority-badge priority-${focusTask.priority.toLowerCase()}`}>
                                    {focusTask.priority}
                                </span>
                            </div>
                            <div className="focus-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{width: `${focusTask.progress * 100}%`}}
                                    ></div>
                                </div>
                                <span>{Math.round(focusTask.progress * 100)}% Complete</span>
                            </div>
                            <div className="focus-timer">
                                <div className="timer-display">
                                    {studyTimer.isRunning && studyTimer.taskId === focusTask.id
                                        ? formatTimerDisplay(studyTimer.startTime)
                                        : '00:00'
                                    }
                                </div>
                                <div className="timer-controls">
                                    {studyTimer.isRunning && studyTimer.taskId === focusTask.id ? (
                                        <button onClick={stopStudyTimer} className="btn btn-danger">
                                            <i className="ri-pause-line"></i> Pause
                                        </button>
                                    ) : (
                                        <button onClick={() => startStudyTimer(focusTask.id)} className="btn btn-success">
                                            <i className="ri-play-line"></i> Start
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddTaskModal && (
                <div ref={addTaskModalRef}>
                    <AddTaskForm
                        onAddTask={handleAddTask}
                        onClose={() => setShowAddTaskModal(false)}
                        // Pass any other necessary props like subjects, task types if AddTaskForm needs them for dropdowns
                        initialData={editingTask} // Pass editingTask data to the form for editing
                    />
                </div>
            )}
        </div>
    );
};

export default AcademicPlanner;
