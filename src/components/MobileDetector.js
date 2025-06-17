import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

const MobileDetector = ({ 
    timeSlots, 
    currentTemplate, 
    templates, 
    currentDay, 
    onDayChange, 
    editMode, 
    children 
}) => {
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [hasRedirected, setHasRedirected] = useState(false);

    // Check if screen is mobile-sized
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            // If switching from mobile back to desktop, redirect to main app
            if (!mobile && (window.location.pathname === '/mobile.html' || window.location.pathname === '/mobile-signin.html')) {
                window.location.href = '/';
                return;
            }

            // If mobile and haven't redirected yet, check for auth and data then redirect appropriately
            if (mobile && !hasRedirected && window.location.pathname !== '/mobile.html' && window.location.pathname !== '/mobile-signin.html') {
                setHasRedirected(true);
                
                // Save current data to localStorage for mobile.html to access
                const dataToSave = {
                    timeSlots,
                    currentTemplate,
                    templates,
                    currentDay,
                    editMode,
                    lastUpdated: Date.now()
                };
                localStorage.setItem('timetableData', JSON.stringify(dataToSave));

                // Check if user is authenticated and has data
                if (user) {
                    // User is signed in - go to mobile timetable (even if no data yet)
                    window.location.href = '/mobile.html';
                } else {
                    // Not signed in - go to mobile sign-in page
                    window.location.href = '/mobile-signin.html';
                }
            }
        };

        checkMobile();
        
        // Debounced resize handler to prevent excessive redirects
        const handleResize = () => {
            setTimeout(checkMobile, 200);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [timeSlots, currentTemplate, templates, currentDay, editMode, user, hasRedirected]);

    // Save data to localStorage whenever it changes (for mobile.html to access)
    useEffect(() => {
        const dataToSave = {
            timeSlots,
            currentTemplate,
            templates,
            currentDay,
            editMode,
            lastUpdated: Date.now()
        };
        localStorage.setItem('timetableData', JSON.stringify(dataToSave));
    }, [timeSlots, currentTemplate, templates, currentDay, editMode]);

    // Render children (desktop version)
    return children;
};

export default MobileDetector;