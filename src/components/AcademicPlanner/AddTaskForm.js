import React, { useState, useEffect } from 'react';
import '../../styles/components/AddTaskForm.css';

const AddTaskForm = ({ onAddTask, onClose, initialData = null }) => {
    // Get current date and time for defaults
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    
    // Load saved subjects and types from localStorage
    const loadSavedItems = (key, defaultItems) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? [...defaultItems, ...JSON.parse(saved)] : defaultItems;
        } catch {
            return defaultItems;
        }
    };

    const defaultSubjects = ['Math', 'English', 'Science', 'History', 'Computer Science', 'General'];
    const defaultTypes = ['Assignment', 'Exam', 'Study Block', 'Event', 'Reminder'];

    const [subjects, setSubjects] = useState(() => loadSavedItems('customSubjects', defaultSubjects));
    const [types, setTypes] = useState(() => loadSavedItems('customTypes', defaultTypes));
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [showAddType, setShowAddType] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newType, setNewType] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: 'Math',
        type: 'Assignment',
        priority: 'Medium',
        dueDate: currentDate,
        dueTime: currentTime,
        estimatedTime: '1 hour'
    });

    // Add autofocus after modal opens
    useEffect(() => {
        if (!initialData) {
            const titleInput = document.getElementById('title');
            if (titleInput) {
                setTimeout(() => {
                    titleInput.focus();
                }, 100);
            }
        }
    }, [initialData]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Initialize form with editing data if provided
    useEffect(() => {
        if (initialData) {
            const dueDate = new Date(initialData.dueDate);
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                subject: initialData.subject || 'Math',
                type: initialData.type || 'Assignment',
                priority: initialData.priority || 'Medium',
                dueDate: dueDate.toISOString().split('T')[0],
                dueTime: dueDate.toTimeString().slice(0, 5),
                estimatedTime: initialData.estimatedTime || '1 hour'
            });
        }
    }, [initialData]);

    // Save custom items to localStorage
    const saveCustomItems = (key, items, defaultItems) => {
        const customItems = items.filter(item => !defaultItems.includes(item));
        localStorage.setItem(key, JSON.stringify(customItems));
    };

    const addCustomSubject = () => {
        if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
            const updatedSubjects = [...subjects, newSubject.trim()];
            setSubjects(updatedSubjects);
            saveCustomItems('customSubjects', updatedSubjects, defaultSubjects);
            setFormData(prev => ({ ...prev, subject: newSubject.trim() }));
            setNewSubject('');
            setShowAddSubject(false);
        }
    };

    const addCustomType = () => {
        if (newType.trim() && !types.includes(newType.trim())) {
            const updatedTypes = [...types, newType.trim()];
            setTypes(updatedTypes);
            saveCustomItems('customTypes', updatedTypes, defaultTypes);
            setFormData(prev => ({ ...prev, type: newType.trim() }));
            setNewType('');
            setShowAddType(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        // Create the task object with the expected structure
        const taskData = {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            type: formData.type,
            priority: formData.priority,
            dueDate: new Date(`${formData.dueDate}T${formData.dueTime}`),
            estimatedTime: formData.estimatedTime,
        };

        onAddTask(taskData);
        onClose();
    };

    const priorities = ['High', 'Medium', 'Low'];

    return (
        <div className="task-form-overlay">
            <div className="task-form-modal">
                <div className="task-form-header">
                    <h3>{initialData ? 'Edit Task' : 'Add New Task'}</h3>
                    <button className="task-form-close-btn" onClick={onClose}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="task-form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Task Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-control"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter task title"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-control"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Task description (optional)"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group subject-group">
                            <label htmlFor="subject">Subject</label>
                            <div className="select-with-add">
                                <select
                                    id="subject"
                                    name="subject"
                                    className="form-control"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                >
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="add-link-btn"
                                    onClick={() => setShowAddSubject(!showAddSubject)}
                                    title="Add new subject"
                                >
                                    <i className="ri-add-line"></i> Add New
                                </button>
                            </div>
                            {showAddSubject && (
                                <div className="custom-input-container">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        placeholder="Enter new subject"
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                                    />
                                    <button type="button" className="add-custom-btn" onClick={addCustomSubject}>Add</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group type-group">
                            <label htmlFor="type">Type</label>
                            <div className="select-with-add">
                                <select
                                    id="type"
                                    name="type"
                                    className="form-control"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    {types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="add-link-btn"
                                    onClick={() => setShowAddType(!showAddType)}
                                    title="Add new type"
                                >
                                    <i className="ri-add-line"></i> Add New
                                </button>
                            </div>
                            {showAddType && (
                                <div className="custom-input-container">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        placeholder="Enter new type"
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomType()}
                                    />
                                    <button type="button" className="add-custom-btn" onClick={addCustomType}>Add</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <div className="priority-options">
                                {priorities.map(priority => (
                                    <label 
                                        key={priority} 
                                        className={`priority-option ${priority.toLowerCase()} ${formData.priority === priority ? 'selected' : ''}`}
                                    >
                                        {priority}
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={priority}
                                            checked={formData.priority === priority}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="estimatedTime">Estimated Time</label>
                            <input
                                type="text"
                                id="estimatedTime"
                                name="estimatedTime"
                                className="form-control"
                                value={formData.estimatedTime}
                                onChange={handleInputChange}
                                placeholder="e.g., 2 hours"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                className="form-control"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dueTime">Due Time</label>
                            <input
                                type="time"
                                id="dueTime"
                                name="dueTime"
                                className="form-control"
                                value={formData.dueTime}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            <i className="ri-save-line"></i>
                            {initialData ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskForm;
