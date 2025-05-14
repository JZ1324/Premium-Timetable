import React, { useState, useEffect, useRef, useMemo } from 'react';
import UserProfile from './UserProfile';
import UserInfo from './UserInfo';
import ChangePassword from './ChangePassword';
import LogoutButton from './LogoutButton';
import LogoutConfirm from './LogoutConfirm';
import HelpPage from './HelpPage';
import { useAuth } from './AuthProvider';
import '../styles/components/Header.css';

const Header = ({ toggleSidebar, sidebarOpen, toggleTaskTracker, taskTrackerActive }) => {
    const [scrolled, setScrolled] = useState(false);
    const [expanding, setExpanding] = useState(false);
    const [headerClass, setHeaderClass] = useState('enlarged');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showHelpPage, setShowHelpPage] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const userMenuRef = useRef(null);
    
    // Get user from auth context
    const { user } = useAuth();
    
    // Check if user just registered based on account creation time
    const isNewlyRegistered = useMemo(() => {
        if (!user || !user.metadata || !user.metadata.creationTime) return false;
        
        const creationTime = new Date(user.metadata.creationTime).getTime();
        const currentTime = new Date().getTime();
        const minutesSinceCreation = (currentTime - creationTime) / (1000 * 60);
        
        // Consider new if account was created less than 2 minutes ago and
        // if the last login time is close to creation time (within 30 seconds)
        const isNew = minutesSinceCreation < 2;
        
        if (isNew) {
            console.log('Detected newly registered user');
        }
        
        return isNew;
    }, [user]);

    useEffect(() => {
        const handleScroll = () => {
            // Get current scroll position
            const currentScrollY = window.scrollY;
            const isScrolled = currentScrollY > 20;
            
            // Only update state if scrolled status changes
            if (isScrolled !== scrolled) {
                // If transitioning from scrolled to not scrolled, set expanding state
                if (scrolled && !isScrolled) {
                    setExpanding(true);
                    // Use a slightly longer timeout for smoother transition with the full-width header
                    setTimeout(() => setExpanding(false), 500);
                }
                setScrolled(isScrolled);
            }

            if (currentScrollY > 50) {
                setHeaderClass('shrunk');
            } else {
                setHeaderClass('enlarged');
            }
        };

        // Use passive for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
            handleScroll();
        
        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    // Add click outside handler for user menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle successful logout
    const handleLogoutSuccess = () => {
        // Close the user menu
        setShowUserMenu(false);
        console.log('User logged out successfully');
    };

    // Show the logout confirmation dialog
    const confirmLogout = () => {
        setShowUserMenu(false);
        setShowLogoutConfirm(true);
    };

    // Toggle user menu
    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    // Show user profile modal
    const handleShowUserProfile = () => {
        setShowUserMenu(false);
        setShowUserProfile(true);
    };

    // Show change password modal
    const handleShowChangePassword = () => {
        // Prevent showing change password for newly registered users
        if (isNewlyRegistered) {
            console.log('Change password not shown for newly registered user');
            setShowUserMenu(false);
            // Optionally show a message indicating they should check their email first
            return;
        }
        
        setShowUserMenu(false);
        setShowChangePassword(true);
    };

    // Show user info modal
    const handleShowUserInfo = () => {
        setShowUserMenu(false);
        setShowUserInfo(true);
    };

    // Toggle help page
    const handleToggleHelp = () => {
        setShowHelpPage(!showHelpPage);
    };

    // Get the first letter of the email or username for the avatar
    const getAvatarInitial = () => {
        if (user) {
            if (user.displayName) {
                return user.displayName[0].toUpperCase();
            } else if (user.email) {
                return user.email[0].toUpperCase();
            }
        }
        return '👤';
    };

    return (
        <>
            <div className="header-trigger-zone"></div>
            <header 
                className={`header ${scrolled ? 'scrolled' : ''} ${expanding ? 'expanding' : ''} ${headerClass}`}
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
                        {user && (
                            <div className="user-menu-container" ref={userMenuRef}>
                                <button 
                                    className="user-profile-button" 
                                    onClick={toggleUserMenu}
                                    title="User profile"
                                >
                                    <span className="user-initial">{getAvatarInitial()}</span>
                                </button>
                                {showUserMenu && (
                                    <div className="user-dropdown-menu">
                                        <div className="user-info">
                                            <div className="user-avatar-large">
                                                <span>{getAvatarInitial()}</span>
                                            </div>
                                            <p className="user-email">{user.email}</p>
                                            {user.displayName && (
                                                <p className="user-name">{user.displayName}</p>
                                            )}
                                        </div>
                                        <div className="user-menu-actions">
                                            <button className="user-menu-button" onClick={handleShowUserProfile}>
                                                <span className="user-menu-icon">👤</span>
                                                <span>Profile</span>
                                            </button>
                                            <button className="user-menu-button" onClick={handleShowUserInfo}>
                                                <span className="user-menu-icon">ℹ️</span>
                                                <span>Account Info</span>
                                            </button>
                                            <button className="user-menu-button" onClick={handleShowChangePassword} disabled={isNewlyRegistered}>
                                                <span className="user-menu-icon">🔒</span>
                                                <span>{isNewlyRegistered ? 'Verify Email First' : 'Change Password'}</span>
                                            </button>
                                            <LogoutButton onLogoutSuccess={handleLogoutSuccess} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <button className="help-button" title="Help" onClick={handleToggleHelp}>
                            <span>?</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Modals */}
            {showUserProfile && <UserProfile onClose={() => setShowUserProfile(false)} />}
            {showChangePassword && !isNewlyRegistered && <ChangePassword onClose={() => setShowChangePassword(false)} />}
            {showUserInfo && <UserInfo onClose={() => setShowUserInfo(false)} />}
            {showLogoutConfirm && <LogoutConfirm 
                onCancel={() => setShowLogoutConfirm(false)} 
                onConfirm={handleLogoutSuccess} 
            />}
            {showHelpPage && <HelpPage onClose={() => setShowHelpPage(false)} />}
        </>
    );
};

export default Header;