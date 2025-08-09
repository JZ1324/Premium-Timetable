import React, { useRef, useEffect, useState } from 'react';
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
    openSmartStudySearch,
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
    settingsBtnRef,
    handleOpenAddTaskModal,
    handleOpenAddAssignmentModal
}) => {
    // Animation refs & state
    const viewButtonsRef = useRef(null);
    const [indicator, setIndicator] = useState({ width: 0, x: 0, ready: false });

    // Measure active button and update indicator
    useEffect(() => {
        const container = viewButtonsRef.current;
        if (!container) return;
        const activeBtn = container.querySelector('.view-btn.active');
        if (!activeBtn) return;
        const { offsetWidth, offsetLeft } = activeBtn;
        // Defer to next frame to avoid layout thrash on first paint
        requestAnimationFrame(() => {
            setIndicator(prev => {
                if (prev.width === offsetWidth && prev.x === offsetLeft && prev.ready) return prev;
                return { width: offsetWidth, x: offsetLeft, ready: true };
            });
        });
    }, [currentView]);

    // Recompute on resize
    useEffect(() => {
        const onResize = () => {
            const container = viewButtonsRef.current;
            if (!container) return;
            const activeBtn = container.querySelector('.view-btn.active');
            if (!activeBtn) return;
            setIndicator({ width: activeBtn.offsetWidth, x: activeBtn.offsetLeft, ready: true });
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Mount class for fade/slide in
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

    return (
        <div className={`top-navigation ${mounted ? 'nav-mounted' : ''}`}>
            {/* Top Row: View Buttons Centered */}
            <div className="view-buttons-row">
                <div className="view-buttons" ref={viewButtonsRef}>
                    {indicator.ready && (
                        <span 
                          className="active-indicator" 
                          style={{ width: indicator.width, transform: `translateX(${indicator.x}px)` }} 
                        />
                    )}
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
                        aria-label="Open task templates"
                    >
                        <i className="ri-file-copy-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={openAdvancedSearch}
                        title="Advanced Search (Ctrl+F)"
                        aria-label="Open advanced search"
                    >
                        <i className="ri-search-2-line"></i>
                    </button>
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={openDataVisualization}
                        title="Analytics Dashboard (Ctrl+D)"
                        aria-label="Open analytics dashboard"
                    >
                        <i className="ri-bar-chart-line"></i>
                    </button>

                    <button 
                        className="nav-icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Notifications"
                        aria-label="Toggle notifications"
                    >
                        <i className="ri-notification-line"></i>
                        {tasks.filter(task => {
                            const timeDiff = task.dueDate.getTime() - new Date().getTime();
                            const hoursDiff = timeDiff / (1000 * 3600);
                            return hoursDiff <= 24 && hoursDiff > 0 && task.status !== 'completed';
                        }).length > 0 && <span className="notification-badge"></span>}
                    </button>
                    
                    <div className="dropdown-container">
                        <button className="nav-icon-btn" title="More Options" aria-label="More options">
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
                                    aria-label="Import tasks JSON"
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
                    
                    <button 
                        className="nav-icon-btn"
                        onClick={openSmartStudySearch}
                        title="Smart Study Search (Ctrl+S)"
                        aria-label="Open smart study search"
                    >
                        🔍
                    </button>
                    
                    <div className="dropdown">
                        <button 
                            className="nav-icon-btn" 
                            title="Settings" 
                            ref={settingsBtnRef}
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                            aria-label="Open settings"
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
                                    aria-label="Import tasks JSON"
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