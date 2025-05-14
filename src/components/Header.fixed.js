import React, { useState, useEffect } from 'react';
import '../styles/components/Header.css';

const Header = ({ toggleSidebar, sidebarOpen, toggleTaskTracker, taskTrackerActive }) => {
    const [scrolled, setScrolled] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
            
            // Auto-collapse when scrolling down
            if (isScrolled && !expanded) {
                // Keep collapsed when scrolled
            } else if (!isScrolled) {
                // Always expanded at the top of the page
                setExpanded(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();
        
        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [expanded]);

    const handleMouseEnter = () => {
        setExpanded(true);
    };

    const handleMouseLeave = () => {
        if (scrolled) {
            setExpanded(false);
        }
    };

    return (
        <>
            <div 
                className="header-trigger-zone"
                onMouseEnter={handleMouseEnter}
            ></div>
            <header 
                className={`header ${scrolled ? 'scrolled' : ''} ${!expanded ? 'compact' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="header-content">
                    <div className="logo-container">
                        <div className="logo">
                            <span className="logo-icon">📚</span>
                        </div>
                        <button 
                            className={`calendar-toggle ${taskTrackerActive ? 'active' : ''}`}
                            onClick={toggleTaskTracker}
                            title={taskTrackerActive ? "View Timetable" : "Tasks & Assignments"}
                        >
                            <span className="toggle-icon">📅</span>
                        </button>
                        <button 
                            className={`sidebar-toggle ${!sidebarOpen ? 'collapsed' : ''}`}
                            onClick={toggleSidebar}
                            title={sidebarOpen ? "Settings panel is open" : "Open settings panel"}
                        >
                            <span className="toggle-icon">⚙️</span>
                        </button>
                    </div>
                    <div className="title-container">
                        <h1>School Timetable</h1>
                        <p className="subtitle">Your Customizable Class Schedule</p>
                    </div>
                    <div className="header-actions">
                        <button className="help-button" title="Help">
                            <span>?</span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
