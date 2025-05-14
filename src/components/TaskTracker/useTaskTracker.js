import { useState, useEffect } from 'react';

export const useTaskTracker = () => {
    // Helper function to format date to YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // Helper function to format time to HH:MM for input[type="time"]
    const formatTimeForInput = (date) => {
        const d = new Date(date);
        let hours = '' + d.getHours();
        let minutes = '' + d.getMinutes();

        if (hours.length < 2) hours = '0' + hours;
        if (minutes.length < 2) minutes = '0' + minutes;

        return `${hours}:${minutes}`;
    };

    // Get current date and time for default task
    const getCurrentDateAndTime = () => {
        const now = new Date();
        return {
            date: formatDateForInput(now),
            time: formatTimeForInput(now)
        };
    };

    // Create default task with current date and time
    const getDefaultNewTask = () => {
        const { date, time } = getCurrentDateAndTime();
        return {
            id: null,
            title: '',
            date: date,
            time: time,
            notes: '',
            priority: false
        };
    };

    const [tasks, setTasks] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState(getDefaultNewTask());
    const [counter, setCounter] = useState(0); // For triggering re-renders for countdown

    // Force update every second for real-time countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCounter(prev => prev + 1);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    // Load tasks from localStorage when component mounts
    useEffect(() => {
        const savedTasks = localStorage.getItem('timetable-tasks');
        if (savedTasks) {
            try {
                setTasks(JSON.parse(savedTasks));
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('timetable-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleAddTask = () => {
        if (newTask.title.trim() === '') return;
        
        const taskToAdd = {
            ...newTask,
            id: Date.now()
        };
        
        setTasks([...tasks, taskToAdd]);
        setNewTask(getDefaultNewTask()); // Reset with current date and time
        setShowAddForm(false);
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleCancelAdd = () => {
        setNewTask(getDefaultNewTask()); // Reset with current date and time
        setShowAddForm(false);
    };

    // Set up new task form with current date and time
    const handleShowAddForm = () => {
        setNewTask(getDefaultNewTask()); // Always use current date and time
        setShowAddForm(true);
    };

    // Format date for display with enhanced countdown
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        // Get the task object by dateString
        const task = tasks.find(t => t.date === dateString);
        const timeString = task?.time || "23:59"; // Default to end of day if no time
        
        // Parse date and time separately
        const dueDate = new Date(dateString);
        
        // Set time properly from the time field
        if (timeString) {
            const [hours, minutes] = timeString.split(':').map(Number);
            dueDate.setHours(hours, minutes, 0, 0);
        } else {
            // Default to end of day if no time specified
            dueDate.setHours(23, 59, 59, 0);
        }
        
        const now = new Date();
        
        // Calculate time difference in milliseconds
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // If the due date has passed
        if (timeDiff < 0) {
            const absDiff = Math.abs(timeDiff);
            const overdueDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
            
            if (overdueDays === 0) {
                // If less than a day overdue, show hours
                const hours = Math.floor(absDiff / (1000 * 60 * 60));
                if (hours === 0) {
                    const minutes = Math.floor(absDiff / (1000 * 60));
                    if (minutes === 0) {
                        return `Overdue by seconds`;
                    }
                    return `Overdue by ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
                }
                return `Overdue by ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            }
            
            return `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`;
        }
        
        // Calculate time units
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        // Display logic based on how much time is left
        if (days > 1) {
            // More than 1 day left - show regular date format
            return dueDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            }) + ` (${days} days left)`;
        } else if (days === 1) {
            // Exactly 1 day left
            return `Tomorrow (${hours} hrs left)`;
        } else if (hours >= 1) {
            // Less than a day but more than an hour
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
        } else if (minutes >= 1) {
            // Less than an hour but more than a minute
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${seconds} ${seconds === 1 ? 'second' : 'seconds'} left`;
        } else {
            // Less than a minute
            return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} left`;
        }
    };

    // Calculate the urgency of the task based on due date
    const calculateTaskUrgency = (dateString) => {
        if (!dateString) return 'normal';
        
        const dueDate = new Date(dateString);
        const now = new Date();
        
        // Set due date to end of day if no time specified
        if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
            dueDate.setHours(23, 59, 59);
        }
        
        // Calculate time difference in milliseconds
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // Convert to hours for more granular classification
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (timeDiff < 0) return 'overdue'; // Past due date
        if (hoursDiff <= 24) return 'due-today'; // Due within 24 hours
        if (hoursDiff <= 48) return 'due-soon'; // Due within 48 hours
        if (hoursDiff <= 72) return 'approaching'; // Due within 72 hours
        return 'normal'; // Due in 3+ days
    };
    
    // Toggle task priority
    const togglePriority = (id) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, priority: !task.priority } : task
        ));
    };
    
    // Sort tasks by priority and due date
    const sortedTasks = [...tasks].sort((a, b) => {
        // First sort by priority
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        
        // Then sort by due date
        if (a.date && b.date) {
            const urgencyA = calculateTaskUrgency(a.date);
            const urgencyB = calculateTaskUrgency(b.date);
            
            // Custom urgency order (most urgent first)
            const urgencyOrder = {
                'overdue': 0,
                'due-today': 1,
                'due-soon': 2,
                'approaching': 3,
                'normal': 4
            };
            
            return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
        }
        
        // If one has a date and the other doesn't
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        
        // If neither has a date, sort by newest task first
        return b.id - a.id;
    });

    return {
        tasks,
        showAddForm,
        newTask,
        handleInputChange,
        handleAddTask,
        handleDeleteTask,
        handleCancelAdd,
        handleShowAddForm,
        togglePriority,
        formatDate,
        calculateTaskUrgency,
        sortedTasks,
        counter // Add counter to trigger re-renders
    };
};
