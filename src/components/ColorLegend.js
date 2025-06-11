import React, { useState, useEffect } from 'react';
import colorService from '../services/colorService';
import '../styles/components/ColorLegend.css';

/**
 * Component to display a color legend for the timetable subjects
 * @param {object} props Component props
 * @param {Array} props.timeSlots The current time slots in the timetable
 * @param {boolean} props.isVisible Whether the legend is visible
 * @param {function} props.onToggle Function to toggle visibility
 */
const ColorLegend = ({ timeSlots = [], isVisible = false, onToggle }) => {
    const [subjectColors, setSubjectColors] = useState({});
    
    useEffect(() => {
        // Extract unique subjects and their colors
        const uniqueSubjects = {};
        
        timeSlots.forEach(slot => {
            if (slot.subject && !uniqueSubjects[slot.subject]) {
                // We'll get the color from our algorithm
                uniqueSubjects[slot.subject] = true;
            }
        });
        
        setSubjectColors(uniqueSubjects);
    }, [timeSlots]);
    
    // Function to generate color based on subject name (same as in TimeSlot.js)
    const getSubjectColor = (subject) => {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                          document.body.classList.contains('theme-dark');
        
        // Common predefined colors for frequently used subjects
        const lightSubjectColors = {
            'Mathematics - Advanced': '#4a90e2',
            'Specialist Mathematics': '#5c6bc0',
            'Physics': '#43a047',
            'Chemistry': '#26a69a',
            'Biology Units 1 & 2': '#66bb6a',
            'English': '#ec407a',
            'Literature': '#e91e63',
            'Psychology': '#9c27b0',
            'War Boom and Bust': '#ff7043',
            'Active and Able': '#ffca28',
            'Tutorial': '#bdbdbd',
            'Private Study': '#9575cd',
            'PST': '#9575cd',
            'Recess': '#8d6e63',
            'Lunch': '#fb8c00'
        };
        
        // Darker variants for dark mode
        const darkSubjectColors = {
            'Mathematics - Advanced': '#2c5b9e',
            'Specialist Mathematics': '#3f4d8c',
            'Physics': '#2d6e30',
            'Chemistry': '#00796b',
            'Biology Units 1 & 2': '#3d703f',
            'English': '#aa2c57',
            'Literature': '#ad1457',
            'Psychology': '#6a1b7a',
            'War Boom and Bust': '#c8502b',
            'Active and Able': '#c19412',
            'Tutorial': '#757575',
            'Private Study': '#673ab7',
            'PST': '#673ab7',
            'Recess': '#5d4037',
            'Lunch': '#e65100'
        };
        
        // Enhanced hash function to generate a color based on subject name
        // This ensures consistent colors for the same subject with better visual distinction
        const stringToColor = (str) => {
            if (!str) return isDarkMode ? '#5c5c5c' : '#9e9e9e'; // Default gray for empty subjects
            
            // Generate a base hash from the string
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            // Define color palettes for better visual distinction
            // These are base HSL values that we'll modify
            const colorPalettes = [
                { h: 0, s: 75, l: 60 },     // Red family
                { h: 30, s: 75, l: 60 },    // Orange family
                { h: 60, s: 75, l: 60 },    // Yellow family
                { h: 120, s: 60, l: 40 },   // Green family
                { h: 180, s: 65, l: 45 },   // Teal family
                { h: 210, s: 70, l: 55 },   // Blue family
                { h: 240, s: 70, l: 60 },   // Indigo family
                { h: 270, s: 70, l: 55 },   // Purple family
                { h: 300, s: 70, l: 60 },   // Pink family
                { h: 330, s: 70, l: 60 }    // Magenta family
            ];
            
            // Select a base palette using the hash
            const paletteIndex = Math.abs(hash) % colorPalettes.length;
            const baseColor = colorPalettes[paletteIndex];
            
            // Adjust the hue within the palette range (+/- 15 degrees)
            const hueAdjust = ((hash >> 8) & 0xFF) % 30 - 15;
            let h = (baseColor.h + hueAdjust) % 360;
            if (h < 0) h += 360;
            
            // Adjust saturation slightly based on hash
            const satAdjust = ((hash >> 16) & 0xFF) % 20 - 10;
            let s = Math.max(50, Math.min(90, baseColor.s + satAdjust));
            
            // Adjust lightness based on theme and hash
            let l = baseColor.l;
            if (isDarkMode) {
                // Darker colors for dark mode, but ensure they're still visible
                l = Math.max(25, Math.min(50, l - 15 + ((hash >> 24) & 0xFF) % 10));
            } else {
                // Brighter colors for light mode
                l = Math.max(40, Math.min(65, l + ((hash >> 24) & 0xFF) % 10));
            }
            
            // Convert HSL to RGB
            const toRGB = (h, s, l) => {
                s /= 100;
                l /= 100;
                const k = n => (n + h / 30) % 12;
                const a = s * Math.min(l, 1 - l);
                const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
                return [
                    Math.round(255 * f(0)),
                    Math.round(255 * f(8)),
                    Math.round(255 * f(4))
                ];
            };
            
            // Convert to hex
            const rgb = toRGB(h, s, l);
            return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
        };
        
        // Check for break periods first
        if (['Recess', 'Lunch', 'Break', 'Interval'].includes(subject)) {
            const breakColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
            if (subject === 'Recess') return breakColors['Recess'];
            if (subject === 'Lunch') return breakColors['Lunch'];
            return isDarkMode ? '#5d4037' : '#8d6e63';
        }
        
        // Check for Tutorial periods
        if (subject === 'Tutorial') {
            const tutorialColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
            return tutorialColors['Tutorial'];
        }
        
        // Lookup in our predefined color maps first
        const subjectColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
        
        // Check for custom color from colorService first
        const customColor = colorService.getSubjectColor(subject, isDarkMode);
        if (customColor) {
            return customColor;
        }
        
        // Then check predefined colors
        if (subject && subjectColors[subject]) {
            return subjectColors[subject];
        }
        
        // For any other subject, generate a color based on the subject name
        return stringToColor(subject);
    };
    
    // Get text color for contrast based on background color
    const getTextColor = (bgColor) => {
        // Calculate luminance
        const r = parseInt(bgColor.substring(1, 3), 16);
        const g = parseInt(bgColor.substring(3, 5), 16);
        const b = parseInt(bgColor.substring(5, 7), 16);
        
        // Calculate luminance (perceived brightness)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // For yellow-ish colors, use darker text regardless of luminance
        const isYellowish = (r > 200 && g > 150 && b < 100) || 
                           (r > 200 && g > 180 && b < 140);
        
        // For light backgrounds, use dark text; for dark backgrounds, use light text
        // Use white text for most colors except very light ones
        if (isYellowish || luminance > 0.75) {
            return '#111111'; // Very dark text only for very light or yellow backgrounds
        }
        
        return '#ffffff'; // White text for most backgrounds
    };
    
    // Sort subjects alphabetically
    const sortedSubjects = Object.keys(subjectColors).sort((a, b) => {
        // Put break periods at the end
        if (['Recess', 'Lunch', 'Tutorial'].includes(a)) return 1;
        if (['Recess', 'Lunch', 'Tutorial'].includes(b)) return -1;
        return a.localeCompare(b);
    });
    
    // Update when color preferences change
    useEffect(() => {
        // Listen for storage events (when colors are updated in Settings)
        const handleStorageChange = (e) => {
            if (e.key === 'timetable-custom-colors') {
                // Force a re-render when colors change
                setSubjectColors({...subjectColors});
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [subjectColors]);
    
    // Listen for color changes
    useEffect(() => {
        const handleColorChange = () => {
            // Update colors by forcing a re-render of the legend
            setSubjectColors({...subjectColors});
        };
        
        // Add event listener for color changes
        window.addEventListener('timetable-colors-changed', handleColorChange);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('timetable-colors-changed', handleColorChange);
        };
    }, [subjectColors]);
    
    if (!isVisible) {
        return (
            <div className="color-legend-toggle">
                <button onClick={onToggle} className="toggle-legend-button">
                    Show Color Legend
                </button>
            </div>
        );
    }
    
    return (
        <div className="color-legend-container">
            <div className="color-legend-header">
                <h3>Subject Color Legend</h3>
                <button onClick={onToggle} className="close-legend-button">×</button>
            </div>
            <div className="color-legend-content">
                {sortedSubjects.length === 0 ? (
                    <p className="no-subjects-message">No subjects to display</p>
                ) : (
                    <div className="color-legend-items">
                        {sortedSubjects.map(subject => {
                            const bgColor = getSubjectColor(subject);
                            const textColor = getTextColor(bgColor);
                            
                            return (
                                <div 
                                    key={subject} 
                                    className="color-legend-item"
                                    style={{ backgroundColor: bgColor, color: textColor }}
                                >
                                    {subject}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorLegend;
