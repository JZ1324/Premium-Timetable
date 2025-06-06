import React from 'react';
import '../../styles/components/AcademicPlanner/nav.css';
import { formatDate } from './utils';

const TopNavigation = ({ 
    currentView,
    currentDate,
    handleViewChange,
    handleDateNavigation,
    searchQuery,
    setSearchQuery,
    openTemplates,
    openAdvancedSearch,
    openDataVisualization,
    setShowNotifications,
    showNotifications,
    tasks,
    exportTasks,
    importTasks,
    markAllCompleted,
    deleteAllCompleted,
    showSettingsDropdown,
    setShowSettingsDropdown,
    settingsDropdownRef,
    settingsBtnRef
}) => {
    return (
        <div className="top-navigation">
            {/* Top Row: View Buttons Centered */}
            <div className="view-buttons-row">
                <div className="view-buttons">
                    {['day', 'week', 'month', 'year'].map(view => (
                        <button 
                            key={view}
                            className={`view-btn ${currentView === view ? 'active' : ''}`}
                            onClick={() => handleViewChange(view)}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Middle Row: Date Navigation Centered */}
            <div className="date-navigation-row">
                <div className="date-navigation">
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(-1)}
                        title="Previous"
                    >
                        <i className="ri-arrow-left-s-line"></i>
                    </button>
                    <h2 className="current-date">{formatDate(currentDate)}</h2>
                    <button 
                        className="nav-arrow"
                        onClick={() => handleDateNavigation(1)}
                        title="Next"
                    >
                        <i className="ri-arrow-right-s-line"></i>
                    </button>
                </div>
            </div>
            
            {/* Bottom Row: Search and Action Buttons */}
            <div className="actions-row">
                <div className="search-box">
                    <i className="ri-search-line search-icon"></i>
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="nav-actions">
                    <button 
                        className="nav-icon-btn"
                        onClick={openTemplates}
                        title="Task Templates (Ctrl+T)"
                    >
                        <i className="ri-file-copy-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={openAdvancedSearch}
                        title="Advanced Search (Ctrl+F)"
                    >
                        <i className="ri-search-2-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={openDataVisualization}
                        title="Analytics Dashboard (Ctrl+D)"
                    >
                        <i className="ri-bar-chart-line"></i>
                    </button>

                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Notifications"
                    >
                        <i className="ri-notification-line"></i>
                        {tasks.filter(task => {
                            const timeDiff = task.dueDate.getTime() - new Date().getTime();
                            const hoursDiff = timeDiff / (1000 * 3600);
                            return hoursDiff <= 24 && hoursDiff > 0 && task.status !== 'completed';
                        }).length > 0 && <span className="notification-badge"></span>}
                    </button>
                    
                    <div className="dropdown-container">
                        <button className="nav-icon-btn" title="More Options">
                            <i className="ri-more-line"></i>
                        </button>
                        <div className="dropdown-menu">
                            <button onClick={exportTasks} className="dropdown-item year-view-action">
                                <i className="ri-download-line"></i>
                                Export Tasks
                            </button>
                            <label className="dropdown-item year-view-action file-input-label">
                                <i className="ri-upload-line"></i>
                                Import Tasks
                                <input 
                                    type="file" 
                                    accept=".json"
                                    onChange={importTasks}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <div className="dropdown-divider"></div>
                            <button onClick={markAllCompleted} className="dropdown-item year-view-action">
                                <i className="ri-checkbox-multiple-line"></i>
                                Mark All Complete
                            </button>
                            <button onClick={deleteAllCompleted} className="dropdown-item danger year-view-action">
                                <i className="ri-delete-bin-line"></i>
                                Clear Completed
                            </button>
                        </div>
                    </div>
                    
                    <div className="dropdown">
                        <button 
                            className="nav-icon-btn" 
                            title="Settings" 
                            ref={settingsBtnRef}
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                        >
                            <i className="ri-settings-4-line"></i>
                        </button>
                        
                        <div className={`dropdown-menu ${showSettingsDropdown ? 'show' : ''}`} ref={settingsDropdownRef}>
                            <h6 className="dropdown-header">Settings</h6>
                            <button onClick={exportTasks} className="dropdown-item">
                                <i className="ri-download-line"></i>
                                Export Tasks
                            </button>
                            <label className="dropdown-item" style={{cursor: 'pointer'}}>
                                <i className="ri-upload-line"></i>
                                Import Tasks
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    style={{display: 'none'}} 
                                    onChange={importTasks}
                                />
                            </label>
                            <div className="dropdown-divider"></div>
                            <button onClick={markAllCompleted} className="dropdown-item">
                                <i className="ri-checkbox-multiple-line"></i>
                                Mark All Complete
                            </button>
                            <button onClick={deleteAllCompleted} className="dropdown-item danger">
                                <i className="ri-delete-bin-line"></i>
                                Clear Completed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopNavigation;