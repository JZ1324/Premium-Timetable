import React from 'react';

const AddTaskForm = ({ newTask, onChange, onSave, onCancel }) => {
    return (
        <div className="add-task-form task-form-container">
            <h3>Add New Task</h3>
            <div className="form-group">
                <label>Title:</label>
                <input 
                    type="text" 
                    name="title"
                    value={newTask.title}
                    onChange={onChange}
                    placeholder="Assignment name or task"
                    autoFocus
                />
            </div>
            <div className="form-group">
                <label>Date:</label>
                <input 
                    type="date" 
                    name="date"
                    value={newTask.date}
                    onChange={onChange}
                />
            </div>
            <div className="form-group">
                <label>Time:</label>
                <input 
                    type="time" 
                    name="time"
                    value={newTask.time}
                    onChange={onChange}
                />
            </div>
            <div className="form-group">
                <label>Notes:</label>
                <textarea 
                    name="notes"
                    value={newTask.notes}
                    onChange={onChange}
                    placeholder="Additional details"
                    rows="3"
                ></textarea>
            </div>
            <div className="form-group priority-checkbox-container">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="priority"
                        checked={newTask.priority}
                        onChange={(e) => onChange({
                            target: {
                                name: 'priority',
                                value: e.target.checked
                            }
                        })}
                    />
                    <span className="checkbox-text">Priority Task (Pin)</span>
                </label>
            </div>
            <div className="form-actions">
                <button 
                    className="save-button"
                    onClick={onSave}
                >
                    Save
                </button>
                <button 
                    className="cancel-button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddTaskForm;
