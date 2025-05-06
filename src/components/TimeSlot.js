import React, { useState, useEffect } from 'react';

const TimeSlot = ({ slot, onUpdate, onRemove, displaySettings }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSlot, setEditedSlot] = useState({ ...slot });
    
    // Update edited slot when the original slot changes
    useEffect(() => {
        setEditedSlot({ ...slot });
    }, [slot]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedSlot({ ...editedSlot, [name]: value });
    };

    const saveChanges = () => {
        onUpdate(slot.id || `${slot.day}-${slot.period}`, editedSlot);
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setEditedSlot({ ...slot });
        setIsEditing(false);
    };

    // Determine class color based on subject
    const getSubjectColor = () => {
        const subjectColors = {
            'Mathematics - Advanced': '#4a90e2',
            'Specialist Mathematics': '#5c6bc0',
            'Physics': '#43a047',
            'Biology Units 1 & 2': '#66bb6a',
            'English': '#ec407a',
            'War Boom and Bust': '#ff7043',
            'Active and Able': '#ffca28',
            'Tutorial': '#bdbdbd'
        };
        
        return subjectColors[slot.subject] || '#9e9e9e';
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

    // View mode
    if (!isEditing) {
        return (
            <div 
                className="time-slot" 
                style={{ 
                    backgroundColor: getSubjectColor(),
                    color: getSubjectColor() === '#ffca28' ? '#333' : '#fff'
                }}
            >
                <div className="time-slot-header">
                    <span className="time">{slot.startTime} - {slot.endTime}</span>
                    <div className="time-slot-actions">
                        <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
                        <button onClick={() => onRemove(slot.id || `${slot.day}-${slot.period}`)} className="delete-button">×</button>
                    </div>
                </div>
                <h3>{slot.subject}</h3>
                {displaySettings?.displayCode && slot.code && <p className="code">{slot.code}</p>}
                {displaySettings?.displayRoom && slot.room && <p className="room">Room: {slot.room}</p>}
                {displaySettings?.displayTeacher && slot.teacher && <p className="teacher">Teacher: {getTeacherDisplayName()}</p>}
            </div>
        );
    }

    // Edit mode
    return (
        <div className="time-slot editing">
            <div className="time-slot-edit-header">
                <h4>Edit Class</h4>
            </div>
            <div className="time-slot-edit-form">
                <div className="form-group">
                    <label>Subject:</label>
                    <input 
                        type="text" 
                        name="subject" 
                        value={editedSlot.subject || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Code:</label>
                    <input 
                        type="text" 
                        name="code" 
                        value={editedSlot.code || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Start Time:</label>
                    <input 
                        type="text" 
                        name="startTime" 
                        value={editedSlot.startTime || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>End Time:</label>
                    <input 
                        type="text" 
                        name="endTime" 
                        value={editedSlot.endTime || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Room:</label>
                    <input 
                        type="text" 
                        name="room" 
                        value={editedSlot.room || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label>Teacher:</label>
                    <input 
                        type="text" 
                        name="teacher" 
                        value={editedSlot.teacher || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-actions">
                    <button onClick={saveChanges} className="save-button">Save</button>
                    <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default TimeSlot;