import React from 'react';

// Function to convert 24hr time to 12hr format with AM/PM
const formatTime = (time) => {
    if (!time) return '';
    
    // Check if time is already in the right format or exists
    if (time.includes('AM') || time.includes('PM')) return time;
    
    try {
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return time;
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
        // If there's any error in parsing, return the original time
        return time;
    }
};

const TaskItem = ({ task, urgencyClass, onTogglePriority, onDelete, formatDate }) => {
    // Calculate if task is actually overdue based on current date/time
    const isActuallyOverdue = () => {
        if (!task.date) return false;
        
        const now = new Date();
        const dueDate = new Date(task.date);
        
        // If comparing different days
        if (dueDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
            return true;
        }
        
        // If same day and time is specified, check time
        if (dueDate.getDate() === now.getDate() && 
            dueDate.getMonth() === now.getMonth() && 
            dueDate.getFullYear() === now.getFullYear() && 
            task.time) {
            
            const currentTime = new Date();
            const [hours, minutes] = task.time.split(':').map(Number);
            const dueTime = new Date();
            dueTime.setHours(hours, minutes, 0, 0);
            
            return currentTime > dueTime;
        }
        
        return false;
    };
    
    // Calculate time remaining for tasks due soon
    const getTimeRemaining = () => {
        if (!task.date || !task.time) return null;
        
        const now = new Date();
        const dueDate = new Date(task.date);
        const [hours, minutes] = task.time.split(':').map(Number);
        
        dueDate.setHours(hours, minutes, 0, 0);
        
        const diffMs = dueDate - now;
        if (diffMs <= 0) return null; // Task is already overdue
        
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 24) {
            return diffHrs === 0 
                ? `(less than 1 hr left)` 
                : `(${diffHrs} hr${diffHrs !== 1 ? 's' : ''} left)`;
        }
        
        return null;
    };
    
    // Determine which urgency badge to show with consistent colors
    const getUrgencyBadge = () => {
        // First check if it's actually overdue
        if (urgencyClass === 'overdue' && isActuallyOverdue()) {
            return <span className="urgency-badge overdue">Overdue!</span>;
        } 

        // Check if task is due today (within 24 hours)
        const isDueToday = () => {
            if (!task.date) return false;

            const now = new Date();

            // Reset time parts to compare dates only
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);

            // Check if it's today
            if (taskDate.getTime() === today.getTime()) {
                return true;
            }

            // Check if it's tomorrow but within 24 hours
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (taskDate.getTime() === tomorrow.getTime() && task.time) {
                const [hours, minutes] = task.time.split(':').map(Number);
                const dueTime = new Date();
                dueTime.setDate(dueTime.getDate() + 1);
                dueTime.setHours(hours, minutes, 0, 0);

                // Calculate 24 hours from now
                const twentyFourHoursFromNow = new Date();
                twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

                return dueTime <= twentyFourHoursFromNow;
            }

            return false;
        };

        if (urgencyClass === 'due-today' || isDueToday()) {
            return <span className="urgency-badge due-today">Urgent!</span>;
        } else if (urgencyClass === 'due-soon') {
            return <span className="urgency-badge due-soon">Due Soon</span>;
        } else if (urgencyClass === 'approaching') {
            return <span className="urgency-badge approaching">Approaching</span>;
        }

        return null;
    };

    return (
        <div className={`task-item ${urgencyClass} ${task.priority ? 'priority' : ''}`}>
            <div className="task-header">
                <h3>
                    {task.title}
                    {task.priority && <span className="priority-tag">Priority</span>}
                </h3>
                <div className="task-actions">
                    <button 
                        className={`priority-button ${task.priority ? 'active' : ''}`}
                        onClick={() => onTogglePriority(task.id)}
                        title={task.priority ? "Unpin task" : "Pin as priority"}
                    >
                        <span className="priority-icon">📌</span>
                    </button>
                    <button 
                        className="delete-task-button" 
                        onClick={() => onDelete(task.id)}
                    >
                        ×
                    </button>
                </div>
            </div>
            <div className="task-details">
                {task.date && !task.time && (
                    <p className="task-date">
                        <span className="detail-label">Due:</span> {formatDate(task.date)}
                        {getUrgencyBadge()}
                    </p>
                )}
                {task.time && (
                    <p className="task-time">
                        <span className="detail-label">Time:</span> {formatTime(task.time)}
                        <div className="sub-date">{task.date && formatDate(task.date)}</div>
                        {task.date && getUrgencyBadge()}
                    </p>
                )}
                {task.notes && (
                    <p className="task-notes">
                        <span className="detail-label">Notes:</span> {task.notes}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TaskItem;