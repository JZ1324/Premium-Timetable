import React, { useState, useEffect } from 'react';
import Header from './Header';
import Timetable from './Timetable';
import Settings from './Settings';
import ThemeSwitcher from './ThemeSwitcher';
import AcademicPlanner from './AcademicPlanner';
import Login from './Login';
import ThemeInitializer from './ThemeInitializer';
import { useAuth } from './AuthProvider';

const AppContent = () => {
  // Get saved theme or default to light
  const getSavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem('preferred-theme');
      return savedTheme || 'light';
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return 'light';
    }
  };

  const [currentTheme, setCurrentTheme] = useState(getSavedTheme());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAcademicPlanner, setShowAcademicPlanner] = useState(false);
  
  // Get authentication state from context
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleThemeChange = (theme) => {
    console.log("%c THEME CHANGE: ", "background: #6e3cbf; color: white; padding: 4px; border-radius: 4px", theme);
    
    // Update state
    setCurrentTheme(theme);
    
    // Save to localStorage
    try {
      localStorage.setItem('preferred-theme', theme);
      console.log("Saved theme to localStorage:", theme);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Apply theme classes directly
    document.documentElement.className = `theme-${theme}`;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    document.body.setAttribute('data-theme', theme);
    
    console.log(`Applied theme classes. document.body.className: ${document.body.className}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAcademicPlanner = () => {
    setShowAcademicPlanner(!showAcademicPlanner);
  };

  // Double-check theme is applied after component is mounted
  useEffect(() => {
    // Extra safety mechanism to ensure theme is properly applied
    const forceApplyTheme = () => {
      console.log("Force applying theme to ensure it's active:", currentTheme);
      document.documentElement.className = `theme-${currentTheme}`;
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.body.className = `theme-${currentTheme}`;
      document.body.setAttribute('data-theme', currentTheme);
      
      // Force re-render by touching the state
      setCurrentTheme(prev => prev);
    };
    
    // Apply immediately and after a delay to handle any race conditions
    forceApplyTheme();
    const timerId = setTimeout(forceApplyTheme, 500);
    
    return () => clearTimeout(timerId);
  }, [currentTheme]);

  // Set initial theme on mount
  useEffect(() => {
    const initialTheme = getSavedTheme();
    console.log("%c INITIAL THEME: ", "background: #6e3cbf; color: white; padding: 4px; border-radius: 4px", initialTheme);
    
    // Apply theme classes directly
    document.documentElement.className = `theme-${initialTheme}`;
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.body.className = `theme-${initialTheme}`;
    document.body.setAttribute('data-theme', initialTheme);
    
    // Force update the current theme state
    setCurrentTheme(initialTheme);
    
    // Load sidebar state from localStorage if available
    try {
      const savedSidebarState = localStorage.getItem('sidebar-open');
      if (savedSidebarState !== null) {
        setSidebarOpen(savedSidebarState === 'true');
      }
    } catch (error) {
      console.error('Error reading sidebar state from localStorage:', error);
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-open', sidebarOpen.toString());
    } catch (error) {
      console.error('Error saving sidebar state to localStorage:', error);
    }
  }, [sidebarOpen]);

  // Handle successful login
  const handleLoginSuccess = (user) => {
    console.log('Login successful, user:', user.uid);
    // The Auth Provider will handle the authentication state now
  };

  // Conditionally render Login or main app
  return (
    <div className={`app theme-${currentTheme}`} data-theme={currentTheme}>
      <ThemeInitializer theme={currentTheme} />
      
      {isLoading ? (
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      ) : (
        isAuthenticated ? (
          // Main app when authenticated
          <>
            <Header 
              toggleSidebar={toggleSidebar} 
              sidebarOpen={sidebarOpen} 
              toggleAcademicPlanner={toggleAcademicPlanner}
              academicPlannerActive={showAcademicPlanner}
              user={user}
            />
            <main className="main-content">
              {showAcademicPlanner ? (
                <div className="planner-full-width">
                  <div className="animated-container fade-in-up">
                    <AcademicPlanner />
                  </div>
                </div>
              ) : (
                <div className={`main-container ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
                  <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
                    <ThemeSwitcher 
                      onThemeChange={handleThemeChange} 
                      currentTheme={currentTheme} 
                    />
                    <Settings sidebarOpen={sidebarOpen} />
                  </div>
                  <div className="timetable-section">
                    <div className="animated-container fade-in-up">
                      <h2 className="section-title">Weekly Schedule</h2>
                      <Timetable />
                    </div>
                  </div>
                </div>
              )}
            </main>
            <footer className="footer">
              <p>© {new Date().getFullYear()} School Timetable App</p>
            </footer>
          </>
        ) : (
          // Login screen when not authenticated
          <Login onLoginSuccess={handleLoginSuccess} />
        )
      )}
    </div>
  );
};

export default AppContent;
