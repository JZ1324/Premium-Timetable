import React, { useState, useEffect } from 'react';
import '../../styles/components/AcademicPlanner/AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, onClose, initialFilters = {} }) => {
    const [searchFilters, setSearchFilters] = useState({
        title: initialFilters.title || '',
        subject: initialFilters.subject || '',
        type: initialFilters.type || '',
        priority: initialFilters.priority || '',
        status: initialFilters.status || '',
        dateRange: initialFilters.dateRange || { start: '', end: '' },
        tags: initialFilters.tags || []
    });
    
    const [newTag, setNewTag] = useState('');

    // Prevent body scroll when modal is open
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Re-enable body scroll on cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSearchFilters(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setSearchFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addTag = () => {
        if (newTag.trim() && !searchFilters.tags.includes(newTag.trim())) {
            setSearchFilters(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setSearchFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchFilters);
    };

    const clearFilters = () => {
        setSearchFilters({
            title: '',
            subject: '',
            type: '',
            priority: '',
            status: '',
            dateRange: { start: '', end: '' },
            tags: []
        });
    };

    return (
        <div className="advanced-search-overlay">
            <div className="advanced-search-modal">
                <div className="advanced-search-header">
                    <h3>Advanced Search</h3>
                    <button className="advanced-search-close-btn" onClick={onClose}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                <form onSubmit={handleSearch} className="advanced-search-content">
                    <div className="search-section">
                        <div className="search-row">
                            <div className="search-group">
                                <label htmlFor="title">Task Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="search-control"
                                    value={searchFilters.title}
                                    onChange={handleInputChange}
                                    placeholder="Search by title"
                                />
                            </div>
                        </div>

                        <div className="search-row">
                            <div className="search-group">
                                <label htmlFor="subject">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className="search-control"
                                    value={searchFilters.subject}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Any Subject</option>
                                    <option value="Math">Math</option>
                                    <option value="English">English</option>
                                    <option value="Science">Science</option>
                                    <option value="History">History</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div className="search-group">
                                <label htmlFor="type">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    className="search-control"
                                    value={searchFilters.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Any Type</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Study Block">Study Block</option>
                                    <option value="Event">Event</option>
                                    <option value="Reminder">Reminder</option>
                                </select>
                            </div>
                        </div>

                        <div className="search-row">
                            <div className="search-group">
                                <label htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="search-control"
                                    value={searchFilters.priority}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Any Priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div className="search-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    className="search-control"
                                    value={searchFilters.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Any Status</option>
                                    <option value="not-started">Not Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="search-row">
                            <div className="search-group">
                                <label htmlFor="dateRange.start">Due Date Range</label>
                                <div className="date-range">
                                    <input
                                        type="date"
                                        id="dateRange.start"
                                        name="dateRange.start"
                                        className="search-control"
                                        value={searchFilters.dateRange.start}
                                        onChange={handleInputChange}
                                        placeholder="From"
                                    />
                                    <span className="date-separator">to</span>
                                    <input
                                        type="date"
                                        id="dateRange.end"
                                        name="dateRange.end"
                                        className="search-control"
                                        value={searchFilters.dateRange.end}
                                        onChange={handleInputChange}
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="search-row">
                            <div className="search-group">
                                <label htmlFor="tags">Tags</label>
                                <div className="tags-input">
                                    <div className="tags-container">
                                        {searchFilters.tags.map(tag => (
                                            <span key={tag} className="tag">
                                                {tag}
                                                <button 
                                                    type="button" 
                                                    className="tag-remove" 
                                                    onClick={() => removeTag(tag)}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="tag-add-container">
                                        <input
                                            type="text"
                                            id="newTag"
                                            className="search-control"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Add a tag"
                                        />
                                        <button 
                                            type="button" 
                                            className="tag-add-btn"
                                            onClick={addTag}
                                        >
                                            <i className="ri-add-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="search-actions">
                        <button type="button" className="btn-secondary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                        <button type="submit" className="btn-primary">
                            <i className="ri-search-line"></i>
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvancedSearch;
