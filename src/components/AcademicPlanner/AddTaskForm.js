import React, { useState } from 'react';

const AddTaskForm = ({ onAddTask, onClose }) => {
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
        const newTask = {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            type: formData.type,
            priority: formData.priority,
            dueDate: formData.dueDate,
            dueTime: formData.dueTime,
            estimatedTime: formData.estimatedTime,
            createdAt: new Date().toISOString(),
        };

        onAddTask(newTask);
        onClose();
    };

    const priorities = ['High', 'Medium', 'Low'];

    return (
        <div className="task-form-overlay">
            <div className="task-form-modal">
                <div className="task-form-header">
                    <h3>Add New Task</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Task Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
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
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                >
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="add-btn"
                                    onClick={() => setShowAddSubject(!showAddSubject)}
                                    title="Add new subject"
                                >
                                    +
                                </button>
                            </div>
                            {showAddSubject && (
                                <div className="add-custom-input">
                                    <input
                                        type="text"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        placeholder="Enter new subject"
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                                    />
                                    <button type="button" onClick={addCustomSubject}>Add</button>
                                    <button type="button" onClick={() => setShowAddSubject(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group type-group">
                            <label htmlFor="type">Type</label>
                            <div className="select-with-add">
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    {types.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button" 
                                    className="add-btn"
                                    onClick={() => setShowAddType(!showAddType)}
                                    title="Add new type"
                                >
                                    +
                                </button>
                            </div>
                            {showAddType && (
                                <div className="add-custom-input">
                                    <input
                                        type="text"
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        placeholder="Enter new type"
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomType()}
                                    />
                                    <button type="button" onClick={addCustomType}>Add</button>
                                    <button type="button" onClick={() => setShowAddType(false)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            >
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="estimatedTime">Estimated Time</label>
                            <input
                                type="text"
                                id="estimatedTime"
                                name="estimatedTime"
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
                                value={formData.dueTime}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskForm;
