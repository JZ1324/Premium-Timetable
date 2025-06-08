import React, { useState, useEffect } from 'react';
import '../../styles/components/AcademicPlanner/TaskTemplates.css';

const TaskTemplates = ({ onApplyTemplate, onClose, onSaveTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [activeTab, setActiveTab] = useState('my-templates'); // 'my-templates' or 'create-template'
    const [newTemplate, setNewTemplate] = useState({
        title: '',
        description: '',
        subject: 'Math',
        type: 'Assignment',
        priority: 'Medium',
        estimatedTime: '1 hour'
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Load templates from localStorage on component mount
    useEffect(() => {
        try {
            const savedTemplates = localStorage.getItem('academicPlannerTemplates');
            if (savedTemplates) {
                setTemplates(JSON.parse(savedTemplates));
            } else {
                // Start with empty templates - users create their own
                setTemplates([]);
                localStorage.setItem('academicPlannerTemplates', JSON.stringify([]));
            }
        } catch (error) {
            console.error('Error loading templates from storage:', error);
        }
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Re-enable body scroll on cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Save templates to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('academicPlannerTemplates', JSON.stringify(templates));
        } catch (error) {
            console.error('Error saving templates to storage:', error);
        }
    }, [templates]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTemplate(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveTemplate = (e) => {
        e.preventDefault();
        
        if (!newTemplate.title.trim()) {
            alert('Please enter a template title');
            return;
        }
        
        const templateToSave = {
            ...newTemplate,
            id: Date.now(), // Simple unique ID
            createdAt: new Date().toISOString()
        };
        
        setTemplates(prev => [...prev, templateToSave]);
        
        // Clear form
        setNewTemplate({
            title: '',
            description: '',
            subject: 'Math',
            type: 'Assignment',
            priority: 'Medium',
            estimatedTime: '1 hour'
        });
        
        // Notify parent component
        if (onSaveTemplate) {
            onSaveTemplate(templateToSave);
        }
        
        // Switch to my templates tab
        setActiveTab('my-templates');
    };

    const deleteTemplate = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(template => template.id !== id));
        }
    };

    const applyTemplate = (template) => {
        if (onApplyTemplate) {
            onApplyTemplate(template);
        }
        onClose();
    };

    // Filter templates based on search query
    const filteredTemplates = templates.filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="templates-overlay">
            <div className="templates-modal">
                <div className="templates-header">
                    <h3>Task Templates</h3>
                    <button className="templates-close-btn" onClick={onClose}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                
                <div className="templates-tabs">
                    <button 
                        className={`template-tab ${activeTab === 'my-templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-templates')}
                    >
                        My Templates
                    </button>
                    <button 
                        className={`template-tab ${activeTab === 'create-template' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create-template')}
                    >
                        Create Template
                    </button>
                </div>
                
                <div className="templates-content">
                    {activeTab === 'my-templates' ? (
                        <div className="templates-list-container">
                            <div className="templates-search">
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="template-search-input"
                                />
                                <i className="ri-search-line"></i>
                            </div>
                            
                            {filteredTemplates.length > 0 ? (
                                <div className="templates-list">
                                    {filteredTemplates.map(template => (
                                        <div key={template.id} className="template-card">
                                            <div className="template-card-header">
                                                <h4 className="template-title">{template.title}</h4>
                                                <div className="template-actions">
                                                    <button 
                                                        className="template-action-btn delete"
                                                        onClick={() => deleteTemplate(template.id)}
                                                        title="Delete template"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="template-details">
                                                <p className="template-description">{template.description}</p>
                                                <div className="template-badges">
                                                    <span className="template-badge subject">{template.subject}</span>
                                                    <span className="template-badge type">{template.type}</span>
                                                    <span className={`template-badge priority ${template.priority.toLowerCase()}`}>
                                                        {template.priority}
                                                    </span>
                                                </div>
                                                <div className="template-meta">
                                                    <span className="template-time">
                                                        <i className="ri-time-line"></i> {template.estimatedTime}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                className="template-apply-btn"
                                                onClick={() => applyTemplate(template)}
                                            >
                                                Apply Template
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="templates-empty">
                                    <div className="empty-icon">
                                        <i className="ri-file-list-3-line"></i>
                                    </div>
                                    <h4>No templates found</h4>
                                    <p>Create your first template or try a different search.</p>
                                    <button 
                                        className="create-template-btn"
                                        onClick={() => setActiveTab('create-template')}
                                    >
                                        Create Template
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={saveTemplate} className="create-template-form">
                            <div className="template-form-row">
                                <div className="template-form-group">
                                    <label htmlFor="title">Template Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="template-form-control"
                                        value={newTemplate.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter template title"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="template-form-row">
                                <div className="template-form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="template-form-control"
                                        value={newTemplate.description}
                                        onChange={handleInputChange}
                                        placeholder="Template description (optional)"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            
                            <div className="template-form-row">
                                <div className="template-form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="template-form-control"
                                        value={newTemplate.subject}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Math">Math</option>
                                        <option value="English">English</option>
                                        <option value="Science">Science</option>
                                        <option value="History">History</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div className="template-form-group">
                                    <label htmlFor="type">Type</label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="template-form-control"
                                        value={newTemplate.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Assignment">Assignment</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Study Block">Study Block</option>
                                        <option value="Event">Event</option>
                                        <option value="Reminder">Reminder</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="template-form-row">
                                <div className="template-form-group">
                                    <label htmlFor="priority">Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        className="template-form-control"
                                        value={newTemplate.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="template-form-group">
                                    <label htmlFor="estimatedTime">Estimated Time</label>
                                    <input
                                        type="text"
                                        id="estimatedTime"
                                        name="estimatedTime"
                                        className="template-form-control"
                                        value={newTemplate.estimatedTime}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 2 hours"
                                    />
                                </div>
                            </div>
                            
                            <div className="template-form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setActiveTab('my-templates')}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    <i className="ri-save-line"></i>
                                    Save Template
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskTemplates;
