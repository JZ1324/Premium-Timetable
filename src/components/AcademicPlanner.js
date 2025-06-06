import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/components/AcademicPlanner.css';
import '../styles/components/AcademicPlannerYear.css';
import '../styles/components/AcademicPlanner/main.css';
import '../styles/components/AcademicPlanner/nav.css';
import '../styles/components/AcademicPlanner/day.css';
import '../styles/components/AcademicPlanner/week.css';
import '../styles/components/AcademicPlanner/month.css';
import '../styles/components/AcademicPlanner/year.css';
import '../styles/components/AcademicPlanner/tailwind-utils.css';
import '../styles/components/AcademicPlanner/AdvancedSearch.css';
import '../styles/components/AcademicPlanner/TaskTemplates.css';
import '../styles/components/AcademicPlanner/AnalyticsDashboard.css';
import AddTaskForm from './AcademicPlanner/AddTaskForm';
import TopNavigation from './AcademicPlanner/TopNavigation';
import Sidebar from './AcademicPlanner/Sidebar';
import DayView from './AcademicPlanner/DayView';
import WeekView from './AcademicPlanner/WeekView';
import MonthView from './AcademicPlanner/MonthView';
import YearView from './AcademicPlanner/YearView';
import TaskCard from './AcademicPlanner/TaskCard';
import AdvancedSearch from './AcademicPlanner/AdvancedSearch';
import TaskTemplates from './AcademicPlanner/TaskTemplates';
import AnalyticsDashboard from './AcademicPlanner/AnalyticsDashboard';
import { formatDate } from './AcademicPlanner/utils';

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
    const templatesModalRef = useRef(null);
    const advancedSearchModalRef = useRef(null);
    const analyticsDashboardRef = useRef(null);

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
                setTimeout(() => {
                    centerModalWithSmoothScroll(advancedSearchModalRef);
                }, 150);
            }
            // Ctrl/Cmd + T: Templates
            else if ((event.ctrlKey || event.metaKey) && event.key === 't') {
                event.preventDefault();
                setShowTemplates(true);
                setTimeout(() => {
                    centerModalWithSmoothScroll(templatesModalRef);
                }, 150);
            }
            // Ctrl/Cmd + D: Data visualization
            else if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
                event.preventDefault();
                setShowDataVisualization(true);
                setTimeout(() => {
                    centerModalWithSmoothScroll(analyticsDashboardRef);
                }, 150);
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
        
        // Use setTimeout to ensure modal state is updated and modal is rendered before scrolling
        setTimeout(() => {
            centerModalWithSmoothScroll(addTaskModalRef);
        }, 150);
    };

    // Functions to handle opening modals with smooth scrolling
    const handleOpenTemplatesModal = () => {
        setShowTemplates(true);
        // Use setTimeout to ensure modal state is updated and modal is rendered before scrolling
        setTimeout(() => {
            centerModalWithSmoothScroll(templatesModalRef);
        }, 150);
    };
    
    const handleOpenAdvancedSearchModal = () => {
        setShowAdvancedSearch(true);
        // Use setTimeout to ensure modal state is updated and modal is rendered before scrolling
        setTimeout(() => {
            centerModalWithSmoothScroll(advancedSearchModalRef);
        }, 150);
    };
    
    const handleOpenAnalyticsDashboard = () => {
        setShowDataVisualization(true);
        // Use setTimeout to ensure modal state is updated and modal is rendered before scrolling
        setTimeout(() => {
            centerModalWithSmoothScroll(analyticsDashboardRef);
        }, 150);
    };

    // Generic function to smoothly scroll modal to center of screen
    const centerModalWithSmoothScroll = (modalRef) => {
        if (!modalRef?.current) return;
        
        // Wait for modal to be fully rendered and visible
        const attemptScroll = (retryCount = 0) => {
            const modalWrapper = modalRef.current;
            if (!modalWrapper) return;
            
            // Find the actual modal content within the wrapper
            // Look for specific modal selectors for each modal type
            const modalContent = modalWrapper.querySelector('.templates-modal') || 
                               modalWrapper.querySelector('.advanced-search-modal') || 
                               modalWrapper.querySelector('.analytics-modal') ||
                               modalWrapper.querySelector('.add-task-modal') ||
                               modalWrapper.querySelector('.modal-content') ||
                               modalWrapper.querySelector('[class*="modal"]') ||
                               modalWrapper.firstElementChild;
            
            if (!modalContent) {
                if (retryCount < 10) {
                    setTimeout(() => attemptScroll(retryCount + 1), 50);
                }
                return;
            }
            
            // Check if modal content is actually visible
            const modalRect = modalContent.getBoundingClientRect();
            if (modalRect.height === 0 || modalRect.width === 0) {
                if (retryCount < 10) {
                    // Modal not yet rendered, try again
                    setTimeout(() => attemptScroll(retryCount + 1), 50);
                }
                return;
            }
            
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;
            
            // Calculate the position to center the modal in viewport
            const modalTop = modalRect.top + scrollTop;
            const modalCenter = modalTop + (modalRect.height / 2);
            const targetScrollTop = modalCenter - (viewportHeight / 2);
            
            // Smooth scroll to center the modal
            window.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            });
        };
        
        // Start attempting to scroll
        attemptScroll();
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
        // Handle both old format and new format from TaskTemplates component
        let newTask;
        
        if (template.template) {
            // Old format
            newTask = {
                id: Date.now() + Math.random(),
                title: customTitle || `${template.name} - ${customSubject || 'Task'}`,
                subject: customSubject || 'General',
                ...template.template,
                dueDate: new Date(Date.now() + 86400000 * 7), // Default to 1 week from now
                status: 'not-started',
                progress: 0,
                timeSpent: '0 hours',
                createdAt: new Date()
            };
        } else {
            // New format from TaskTemplates component
            newTask = {
                id: Date.now() + Math.random(),
                title: customTitle || template.title,
                subject: customSubject || template.subject,
                type: template.type,
                priority: template.priority,
                estimatedTime: template.estimatedTime,
                description: template.description,
                dueDate: new Date(Date.now() + 86400000 * 7), // Default to 1 week from now
                status: 'not-started',
                progress: 0,
                timeSpent: '0 hours',
                createdAt: new Date()
            };
        }
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        setShowTemplates(false);
        showToast(`Task created from template: ${template.template ? template.name : template.title}`, 'success');
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
                task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.type.toLowerCase().includes(searchQuery.toLowerCase())
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
                task.subject === searchFilters.subject
            );
        }
        
        if (searchFilters.type) {
            filtered = filtered.filter(task =>
                task.type === searchFilters.type
            );
        }

        if (searchFilters.priority) {
            filtered = filtered.filter(task => task.priority === searchFilters.priority);
        }

        if (searchFilters.status) {
            filtered = filtered.filter(task => task.status === searchFilters.status);
        }

        if (searchFilters.dateRange.start && searchFilters.dateRange.end) {
            const startDate = new Date(searchFilters.dateRange.start);
            const endDate = new Date(searchFilters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Set to end of day
            
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= startDate && taskDate <= endDate;
            });
        } else if (searchFilters.dateRange.start) {
            const startDate = new Date(searchFilters.dateRange.start);
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= startDate;
            });
        } else if (searchFilters.dateRange.end) {
            const endDate = new Date(searchFilters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Set to end of day
            
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate <= endDate;
            });
        }
        
        // Filter by tags (if task has tags property)
        if (searchFilters.tags && searchFilters.tags.length > 0) {
            filtered = filtered.filter(task => {
                if (!task.tags) return false;
                return searchFilters.tags.some(tag => task.tags.includes(tag));
            });
        }

        // Apply existing filters
        if (filters.hideCompleted) {
            filtered = filtered.filter(task => task.status !== 'completed');
        }
        
        if (filters.showUpcoming) {
            const now = new Date();
            const twoWeeksFromNow = new Date(now);
            twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
            
            filtered = filtered.filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate >= now && dueDate <= twoWeeksFromNow;
            });
        }
        
        filtered = filtered.filter(task => 
            filters.subjects.includes(task.subject) && 
            filters.types.includes(task.type) &&
            filters.priorities.includes(task.priority)
        );

        return filtered;
    };

    // Memoize filtered tasks to avoid recalculating on every render
    const filteredTasks = useMemo(() => getFilteredTasks(), [tasks, filters, searchQuery, searchFilters]);

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

    // Sidebar component has been extracted to its own file

    // TopNavigation component has been extracted to its own file

    // TaskCard component has been extracted to its own file

    // DayView component has been extracted to its own file

    // WeekView component has been extracted to its own file

    // MonthView component has been extracted to its own file

    // YearView component has been extracted to its own file

    // All utility functions have been moved to utils.js
    // Using utility functions imported from utils.js

    // Advanced search filtering function
    const applyAdvancedSearchFilters = useMemo(() => {
        return (tasks, filters) => {
            // Start with all tasks
            let filteredResults = [...tasks];
            
            // Filter by title
            if (filters.title) {
                filteredResults = filteredResults.filter(task => 
                    task.title.toLowerCase().includes(filters.title.toLowerCase())
                );
            }
            
            // Filter by subject
            if (filters.subject) {
                filteredResults = filteredResults.filter(task => 
                    task.subject === filters.subject
                );
            }
            
            // Filter by type
            if (filters.type) {
                filteredResults = filteredResults.filter(task => 
                    task.type === filters.type
                );
            }
            
            // Filter by priority
            if (filters.priority) {
                filteredResults = filteredResults.filter(task => 
                    task.priority === filters.priority
                );
            }
            
            // Filter by status
            if (filters.status) {
                filteredResults = filteredResults.filter(task => 
                    task.status === filters.status
                );
            }
            
            // Filter by date range
            if (filters.dateRange.start && filters.dateRange.end) {
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);
                endDate.setHours(23, 59, 59, 999); // Set to end of day
                
                filteredResults = filteredResults.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate >= startDate && taskDate <= endDate;
                });
            } else if (filters.dateRange.start) {
                const startDate = new Date(filters.dateRange.start);
                filteredResults = filteredResults.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate >= startDate;
                });
            } else if (filters.dateRange.end) {
                const endDate = new Date(filters.dateRange.end);
                endDate.setHours(23, 59, 59, 999); // Set to end of day
                
                filteredResults = filteredResults.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate <= endDate;
                });
            }
            
            return filteredResults;
        };
    }, []);

    return (
        <div className="academic-planner">
            <Sidebar 
                tasks={tasks}
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleOpenAddTaskModal={handleOpenAddTaskModal}
            />
            <div className={`main-content ${currentView === 'year' ? 'year-view-active' : ''}`}>
                <TopNavigation 
                    currentView={currentView}
                    currentDate={currentDate}
                    handleViewChange={handleViewChange}
                    handleDateNavigation={handleDateNavigation}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    openTemplates={handleOpenTemplatesModal}
                    openAdvancedSearch={handleOpenAdvancedSearchModal}
                    openDataVisualization={handleOpenAnalyticsDashboard}
                    setShowNotifications={setShowNotifications}
                    showNotifications={showNotifications}
                    tasks={tasks}
                    exportTasks={exportTasks}
                    importTasks={importTasks}
                    markAllCompleted={markAllCompleted}
                    deleteAllCompleted={deleteAllCompleted}
                    showSettingsDropdown={showSettingsDropdown}
                    setShowSettingsDropdown={setShowSettingsDropdown}
                    settingsDropdownRef={settingsDropdownRef}
                    settingsBtnRef={settingsBtnRef}
                />
                
                <div className="view-content">
                    {currentView === 'day' && (
                        <DayView 
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            handleEditTask={handleEditTask}
                            handleDeleteTask={handleDeleteTask}
                            handleTaskStatusChange={handleTaskStatusChange}
                            handleOpenAddTaskModal={handleOpenAddTaskModal}
                        />
                    )}
                    
                    {currentView === 'week' && (
                        <WeekView 
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            handleEditTask={handleEditTask}
                            handleDeleteTask={handleDeleteTask}
                            handleTaskStatusChange={handleTaskStatusChange}
                            setCurrentDate={setCurrentDate}
                            setCurrentView={setCurrentView}
                        />
                    )}
                    
                    {currentView === 'month' && (
                        <MonthView 
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            handleEditTask={handleEditTask}
                            handleDeleteTask={handleDeleteTask}
                            handleTaskStatusChange={handleTaskStatusChange}
                            setCurrentDate={setCurrentDate}
                            setCurrentView={setCurrentView}
                        />
                    )}
                    
                    {currentView === 'year' && (
                        <YearView 
                            currentDate={currentDate}
                            tasks={filteredTasks}
                            handleEditTask={handleEditTask}
                            setCurrentDate={setCurrentDate}
                            setCurrentView={setCurrentView}
                            handleOpenAddTaskModal={handleOpenAddTaskModal}
                            exportTasks={exportTasks}
                            importTasks={importTasks}
                            markAllCompleted={markAllCompleted}
                            deleteAllCompleted={deleteAllCompleted}
                        />
                    )}
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
            
            {/* Templates Modal */}
            {showTemplates && (
                <div ref={templatesModalRef}>
                <TaskTemplates
                    onApplyTemplate={createTaskFromTemplate}
                    onClose={() => setShowTemplates(false)}
                    onSaveTemplate={(template) => {
                        // Add the new template to the taskTemplates array
                        setTaskTemplates(prev => [...prev, {
                            id: template.id,
                            name: template.title,
                            template: {
                                type: template.type,
                                priority: template.priority,
                                estimatedTime: template.estimatedTime,
                                description: template.description
                            }
                        }]);
                        showToast('Template saved successfully!', 'success');
                    }}
                />
                </div>
            )}
            
            {/* Advanced Search Modal */}
            {showAdvancedSearch && (
                <div ref={advancedSearchModalRef}>
                <AdvancedSearch
                    onSearch={(filters) => {
                        setSearchFilters(filters);
                        setShowAdvancedSearch(false);
                        // Implement advanced search logic here
                        showToast('Search filters applied', 'info');
                    }}
                    onClose={() => setShowAdvancedSearch(false)}
                    initialFilters={searchFilters}
                />
                </div>
            )}
            
            {/* Analytics Dashboard */}
            {showDataVisualization && (
                <div ref={analyticsDashboardRef}>
                <AnalyticsDashboard
                    tasks={tasks}
                    onClose={() => setShowDataVisualization(false)}
                />
                </div>
            )}
            
            {/* Task Focus Modal */}
            {focusTask && (
                <div className="modal-overlay" onClick={() => setFocusTask(null)}>
                    <div className="focus-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Focus Mode</h2>
                            <button className="close-btn" onClick={() => setFocusTask(null)}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                        <div className="focus-modal-body">
                            <div className="focus-task-info">
                                <h3>{focusTask.title}</h3>
                                <div className="task-meta">
                                    <div className="meta-item">
                                        <i className="ri-book-mark-line"></i>
                                        {focusTask.subject}
                                    </div>
                                    <div className="meta-item">
                                        <i className="ri-calendar-line"></i>
                                        Due: {formatDate(focusTask.dueDate)}
                                    </div>
                                    <div className="meta-item">
                                        <i className="ri-time-line"></i>
                                        Est. Time: {focusTask.estimatedTime}
                                    </div>
                                </div>
                                <div className="task-description">
                                    {focusTask.description}
                                </div>
                                <div className="study-timer">
                                    <div className="timer-display">
                                        {studyTimer.isRunning && studyTimer.taskId === focusTask.id 
                                            ? formatTimerDisplay(studyTimer.startTime) 
                                            : '00:00'}
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
