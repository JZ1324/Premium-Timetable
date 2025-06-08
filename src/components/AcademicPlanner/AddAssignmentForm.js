import React, { useState, useEffect } from 'react';
import '../../styles/components/AcademicPlanner/AddAssignmentForm.css';

const AddAssignmentForm = ({ onAddAssignment, onClose, initialData = null }) => {
    // Get current date and time for defaults
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    
    // Load saved subjects from localStorage
    const loadSavedItems = (key, defaultItems) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? [...defaultItems, ...JSON.parse(saved)] : defaultItems;
        } catch {
            return defaultItems;
        }
    };

    const defaultSubjects = ['Math', 'English', 'Science', 'History', 'Computer Science', 'General'];
    
    const [subjects, setSubjects] = useState(() => loadSavedItems('customSubjects', defaultSubjects));
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState({ 
        title: '', 
        estimatedTime: '1 hour',
        priority: 'Medium',
        description: ''
    });
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: 'Math',
        priority: 'High',
        dueDate: currentDate,
        dueTime: currentTime,
        estimatedTime: '0 hours', // Will be calculated from subtasks
        type: 'Major Assignment' // Default type for assignments
    });

    // Add autofocus after modal opens
    useEffect(() => {
        if (!initialData) {
            const titleInput = document.getElementById('assignment-title');
            if (titleInput) {
                setTimeout(() => {
                    titleInput.focus();
                }, 100);
            }
        }
    }, [initialData]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Re-enable body scroll on cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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
                priority: initialData.priority || 'High',
                dueDate: dueDate.toISOString().split('T')[0],
                dueTime: dueDate.toTimeString().slice(0, 5),
                estimatedTime: initialData.estimatedTime || '0 hours',
                type: 'Major Assignment'
            });
            
            // Load subtasks if they exist
            if (initialData.subtasks && initialData.subtasks.length > 0) {
                setSubtasks(initialData.subtasks);
            }
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

    const handleSubtaskInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubtask(prev => ({ ...prev, [name]: value }));
    };

    const addSubtask = () => {
        if (newSubtask.title.trim()) {
            const subtask = {
                id: Date.now(),
                ...newSubtask,
                status: 'not-started',
                progress: 0
            };
            
            setSubtasks(prev => [...prev, subtask]);
            setNewSubtask({ 
                title: '', 
                estimatedTime: '1 hour',
                priority: 'Medium',
                description: ''
            });
            
            // Update total estimated time
            updateTotalEstimatedTime([...subtasks, subtask]);
        }
    };

    const removeSubtask = (id) => {
        setSubtasks(prev => {
            const updatedSubtasks = prev.filter(task => task.id !== id);
            updateTotalEstimatedTime(updatedSubtasks);
            return updatedSubtasks;
        });
    };

    const updateTotalEstimatedTime = (tasks) => {
        // Calculate total hours from all subtasks
        let totalHours = 0;
        tasks.forEach(task => {
            const timeStr = task.estimatedTime;
            const hoursMatch = timeStr.match(/(\d+)\s*hour/);
            if (hoursMatch) {
                totalHours += parseInt(hoursMatch[1]);
            }
        });
        
        setFormData(prev => ({ 
            ...prev, 
            estimatedTime: `${totalHours} hours` 
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format date and time properly
        const dateTime = new Date(formData.dueDate + 'T' + formData.dueTime);
        
        const assignmentData = {
            ...formData,
            dueDate: dateTime,
            createdAt: new Date(),
            status: 'not-started',
            progress: 0,
            timeSpent: '0 hours',
            subtasks: subtasks,
            isAssignment: true // Flag to identify this as an assignment
        };
        
        onAddAssignment(assignmentData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="assignment-form-container">
                <div className="form-header">
                    <h2>{initialData ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Assignment Details</h3>
                        <div className="form-group">
                            <label htmlFor="assignment-title">Assignment Title *</label>
                            <input
                                type="text"
                                id="assignment-title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter assignment title"
                                required
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                {!showAddSubject ? (
                                    <div className="select-with-action">
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {subjects.map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            className="add-action-btn"
                                            onClick={() => setShowAddSubject(true)}
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <div className="add-custom-item">
                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                            placeholder="Enter new subject"
                                        />
                                        <div className="add-custom-actions">
                                            <button type="button" onClick={addCustomSubject}>Add</button>
                                            <button type="button" onClick={() => setShowAddSubject(false)}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="priority">Priority *</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="dueDate">Due Date *</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="dueTime">Due Time *</label>
                                <input
                                    type="time"
                                    id="dueTime"
                                    name="dueTime"
                                    value={formData.dueTime}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter assignment description"
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <label>Total Estimated Time</label>
                            <div className="estimated-time-display">{formData.estimatedTime}</div>
                            <p className="help-text">This is calculated from your subtasks</p>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Subtasks</h3>
                        <div className="subtasks-list">
                            {subtasks.length === 0 ? (
                                <p className="no-subtasks">No subtasks added yet</p>
                            ) : (
                                subtasks.map(task => (
                                    <div key={task.id} className="subtask-item">
                                        <div className="subtask-info">
                                            <div className="subtask-title">{task.title}</div>
                                            <div className="subtask-details">
                                                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                                <span className="time-badge">{task.estimatedTime}</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="remove-subtask-btn"
                                            onClick={() => removeSubtask(task.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="add-subtask-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="title"
                                    value={newSubtask.title}
                                    onChange={handleSubtaskInputChange}
                                    placeholder="Enter subtask title"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <select
                                        name="estimatedTime"
                                        value={newSubtask.estimatedTime}
                                        onChange={handleSubtaskInputChange}
                                    >
                                        <option value="0.5 hour">0.5 hour</option>
                                        <option value="1 hour">1 hour</option>
                                        <option value="2 hours">2 hours</option>
                                        <option value="3 hours">3 hours</option>
                                        <option value="4 hours">4 hours</option>
                                        <option value="5 hours">5 hours</option>
                                        <option value="6 hours">6 hours</option>
                                        <option value="8 hours">8 hours</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <select
                                        name="priority"
                                        value={newSubtask.priority}
                                        onChange={handleSubtaskInputChange}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <textarea
                                    name="description"
                                    value={newSubtask.description}
                                    onChange={handleSubtaskInputChange}
                                    placeholder="Enter subtask description (optional)"
                                    rows="2"
                                ></textarea>
                            </div>
                            <button 
                                type="button" 
                                className="add-subtask-btn"
                                onClick={addSubtask}
                                disabled={!newSubtask.title.trim()}
                            >
                                Add Subtask
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={!formData.title.trim() || subtasks.length === 0}
                        >
                            {initialData ? 'Update Assignment' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssignmentForm;
