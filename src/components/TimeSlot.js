import React, { useState, useEffect, useRef } from 'react';

const TimeSlot = ({ slot, onUpdate, onRemove, displaySettings, isEditing, onStartEditing, onCancelEditing, isCurrentPeriod }) => {
    const [editedSlot, setEditedSlot] = useState({ ...slot });
    const timeSlotRef = useRef(null);
    
    // Update edited slot when the original slot changes
    useEffect(() => {
        console.log('Slot changed, updating editedSlot:', slot);
        setEditedSlot({ ...slot });
    }, [slot]);

    // Scroll into view when editing starts
    useEffect(() => {
        if (isEditing && timeSlotRef.current) {
            // Small delay to ensure the expanded form is rendered before scrolling
            setTimeout(() => {
                timeSlotRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 50);
        }
    }, [isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedSlot({ ...editedSlot, [name]: value });
        // Ensure we're modifying a deep copy to avoid reference issues
        console.log(`Updating ${name} to ${value}`);
    };

    const saveChanges = () => {
        // Create a complete copy of the edited slot with all required properties
        const updatedSlot = { 
            ...slot,         // Preserve original properties like day and period
            ...editedSlot,   // Add edited values
            id: slot.id      // Ensure ID is preserved
        };
        
        // Make sure day and period are preserved from the original slot
        if (slot.day) updatedSlot.day = slot.day;
        if (slot.period) updatedSlot.period = slot.period;
        
        console.log('Saving changes:', updatedSlot);
        
        // Provide visual feedback that we're saving
        const saveButton = document.querySelector('.form-actions .save-button');
        if (saveButton) {
            saveButton.textContent = 'Saving...';
            saveButton.style.opacity = '0.7';
        }
        
        // Small delay to show the saving state
        setTimeout(() => {
            onUpdate(slot.id || `${slot.day}-${slot.period}`, updatedSlot);
        }, 150);
    };

    const cancelEdit = () => {
        setEditedSlot({ ...slot });
        
        // Provide visual feedback that we're canceling
        const cancelButton = document.querySelector('.form-actions .cancel-button');
        if (cancelButton) {
            cancelButton.textContent = 'Canceling...';
            cancelButton.style.opacity = '0.7';
        }
        
        // Small delay to show the canceling state
        setTimeout(() => {
            onCancelEditing();
        }, 150);
    };

    // Determine class color based on subject
    const getSubjectColor = () => {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                          document.body.classList.contains('theme-dark');
        
        // Regular colors
        const lightSubjectColors = {
            'Mathematics - Advanced': '#4a90e2',
            'Specialist Mathematics': '#5c6bc0',
            'Physics': '#43a047',
            'Biology Units 1 & 2': '#66bb6a',
            'English': '#ec407a',
            'War Boom and Bust': '#ff7043',
            'Active and Able': '#ffca28',
            'Tutorial': '#bdbdbd',
            'Private Study': '#9c27b0',
            'Recess': '#8d6e63',  // Brown color for Recess
            'Lunch': '#fb8c00'    // Orange color for Lunch
        };
        
        // Darker variants for dark mode
        const darkSubjectColors = {
            'Mathematics - Advanced': '#2c5b9e', // Darker blue
            'Specialist Mathematics': '#3f4d8c', // Darker indigo
            'Physics': '#2d6e30', // Darker green
            'Biology Units 1 & 2': '#3d703f', // Darker light green
            'English': '#aa2c57', // Darker pink
            'War Boom and Bust': '#c8502b', // Darker orange
            'Active and Able': '#c19412', // Darker amber
            'Tutorial': '#757575', // Darker grey
            'Private Study': '#6a1b7a', // Darker purple
            'Recess': '#5d4037', // Darker brown
            'Lunch': '#e65100'  // Darker orange
        };
        
        const subjectColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
        return subjectColors[slot.subject] || (isDarkMode ? '#5c5c5c' : '#9e9e9e');
    };

    // Get teacher's display name based on settings
    const getTeacherDisplayName = () => {
        if (!slot.teacher) return '';
        
        if (displaySettings?.useFirstNameForTeachers) {
            // Extract first name (assuming format is "Mr/Mrs/Ms First Last")
            const parts = slot.teacher.split(' ');
            if (parts.length >= 2) {
                return parts[1]; // Return first name
            }
        }
        return slot.teacher;
    };

    // Get appropriate text color based on background
    const getTextColor = () => {
        const subjectColor = getSubjectColor();
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                          document.body.classList.contains('theme-dark');
        
        // For amber/yellow colors, always use dark text
        if (subjectColor === '#ffca28' || subjectColor === '#c19412') {
            return '#222';
        }
        
        // In dark mode, use slightly brighter text for better contrast
        return isDarkMode ? '#ffffff' : '#ffffff';
    };

    // View mode
    if (!isEditing) {
        // Handle special case for PST (Private Study)
        let subjectName = slot.subject || 'Unnamed Class';
        if (subjectName.trim().toUpperCase() === 'PST') {
            subjectName = 'Private Study';
        }                return (
            <div 
                className={`time-slot ${isCurrentPeriod ? 'current-period' : ''}`}
                style={{
                    backgroundColor: getSubjectColor(),
                    color: getTextColor(),
                    cursor: 'pointer'
                }}
                ref={timeSlotRef}
                data-subject={slot.subject}
                data-period={`Period ${slot.period}`}
                data-time={`${slot.startTime} - ${slot.endTime}`}
                onClick={(e) => {
                    if (!e.target.closest('.time-slot-actions')) {
                        onStartEditing(slot.id || `${slot.day}-${slot.period}`);
                    }
                }}
                title={isCurrentPeriod ? `Current class: ${subjectName}` : "Click to edit this class"}
            >
                <div className="time-slot-header">
                    <span className="time">{slot.startTime} - {slot.endTime}</span>
                    <div className="time-slot-actions">
                        <button 
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation();
                                onStartEditing(slot.id || `${slot.day}-${slot.period}`);
                            }} 
                            className="edit-button"
                            type="button"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(slot.id || `${slot.day}-${slot.period}`);
                            }} 
                            className="delete-button"
                            type="button"
                        >
                            ×
                        </button>
                    </div>
                </div>
                <h3 className="subject-title">{subjectName}</h3>
                {slot.subject !== 'Recess' && slot.subject !== 'Lunch' && displaySettings?.displayCode && slot.code && <p className="code">{slot.code}</p>}
                {slot.subject !== 'Recess' && slot.subject !== 'Lunch' && displaySettings?.displayRoom && slot.room && <p className="room">Room: {slot.room}</p>}
                {slot.subject !== 'Recess' && slot.subject !== 'Lunch' && displaySettings?.displayTeacher && slot.teacher && <p className="teacher">Teacher: {getTeacherDisplayName()}</p>}
            </div>
        );
    }

    // Edit mode
    return (
        <div className="time-slot editing" ref={timeSlotRef}>
            <div className="time-slot-edit-header">
                <h4>Edit Class</h4>
                <span className="edit-period-label">Period {slot.period} • {slot.startTime} - {slot.endTime}</span>
            </div>
            <div className="time-slot-edit-form">
                <div className="form-group">
                    <label>Subject: {editedSlot.subject?.trim().toUpperCase() === 'PST' && <span style={{fontSize: '0.8em', color: '#ff5e3a'}}>(PST will display as "Private Study")</span>}</label>
                    <input 
                        type="text" 
                        name="subject" 
                        value={editedSlot.subject || ''} 
                        onChange={handleChange} 
                        placeholder="Enter subject name (use PST for Private Study)"
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label>Code:</label>
                    <input 
                        type="text" 
                        name="code" 
                        value={editedSlot.code || ''} 
                        onChange={handleChange} 
                        placeholder="Enter class code"
                    />
                </div>
                <div className="form-group">
                    <label>Start Time:</label>
                    <input 
                        type="text" 
                        name="startTime" 
                        value={editedSlot.startTime || ''} 
                        onChange={handleChange} 
                        placeholder="e.g., 8:35am"
                    />
                </div>
                <div className="form-group">
                    <label>End Time:</label>
                    <input 
                        type="text" 
                        name="endTime" 
                        value={editedSlot.endTime || ''} 
                        onChange={handleChange} 
                        placeholder="e.g., 9:35am"
                    />
                </div>
                <div className="form-group">
                    <label>Room:</label>
                    <input 
                        type="text" 
                        name="room" 
                        value={editedSlot.room || ''} 
                        onChange={handleChange} 
                        placeholder="Enter room number"
                    />
                </div>
                <div className="form-group">
                    <label>Teacher:</label>
                    <input 
                        type="text" 
                        name="teacher" 
                        value={editedSlot.teacher || ''} 
                        onChange={handleChange} 
                        placeholder="e.g., Mr Smith"
                    />
                </div>
                <div className="form-actions">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            saveChanges();
                        }} 
                        className="save-button"
                        type="button"
                    >
                        Save
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelEdit();
                        }} 
                        className="cancel-button"
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeSlot;