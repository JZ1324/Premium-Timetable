import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import colorService from '../services/colorService';
import timetableService from '../services/timetableService';
import { notifyColorChanged } from '../utils/colorEvents';
import '../styles/components/ColorsPopup.css';

/**
 * Color customization popup component
 * @param {object} props Component props
 * @param {boolean} props.isVisible Whether the popup is visible
 * @param {function} props.onClose Function to close the popup
 */
const ColorsPopup = ({ isVisible, onClose }) => {
    const [subjects, setSubjects] = useState([]);
    const [customColors, setCustomColors] = useState({});
    const [availableColors, setAvailableColors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeGroup, setActiveGroup] = useState('all');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    // Extract unique subjects from the timetable (excluding breaks and tutorial)
    useEffect(() => {
        if (isVisible) {
            const timeSlots = timetableService.getTimeSlots();
            const uniqueSubjects = {};
            
            timeSlots.forEach(slot => {
                // Skip break periods and tutorial - check both subject name and isBreakPeriod flag
                if (slot.subject && 
                    !slot.isBreakPeriod &&
                    !['Recess', 'Lunch', 'Break', 'Interval', 'Tutorial'].includes(slot.subject)) {
                    uniqueSubjects[slot.subject] = true;
                }
            });
            
            // Sort subjects alphabetically
            const sortedSubjects = Object.keys(uniqueSubjects).sort();
            setSubjects(sortedSubjects);
            
            // Load custom colors
            setCustomColors(colorService.getAllCustomColors());
            
            // Update available colors
            updateAvailableColors();
            
            // Reset search when opening
            setSearchTerm('');
            setActiveGroup('all');
        }
    }, [isVisible]);

    // Prevent background scrolling when modal is open - same as other modal components
    useEffect(() => {
        if (isVisible) {
            // Add modal-open class to body to prevent scrolling and interaction with background
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            document.body.style.overflowY = 'hidden';
            document.body.style.height = 'auto';
            document.body.style.minHeight = '100vh';
            document.body.style.position = 'relative';
            
            // Re-enable scrolling when component unmounts or closes
            return () => {
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.overflowY = '';
                document.body.style.height = '';
                document.body.style.minHeight = '';
                document.body.style.position = '';
            };
        }
    }, [isVisible]);

    // Check for window resize to update mobile state
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update the list of available colors (excluding ones already in use)
    const updateAvailableColors = () => {
        const allColors = colorService.getAvailableColors();
        setAvailableColors(allColors);
    };
    
    // Handle color selection for a subject
    const handleColorChange = (subject, colorValue) => {
        if (colorValue === '') {
            // Reset color (remove custom color)
            colorService.removeSubjectColor(subject);
        } else {
            // Set new color
            colorService.setSubjectColor(subject, colorValue);
        }
        
        // Update local state
        setCustomColors(colorService.getAllCustomColors());
        
        // Refresh the available colors
        updateAvailableColors();
        
        // Notify other components that colors have changed
        notifyColorChanged({ 
            subject, 
            colorValue,
            action: colorValue === '' ? 'removed' : 'updated'
        });
    };
    
    // Direct color swatch selection
    const handleSwatchSelect = (subject, colorValue) => {
        handleColorChange(subject, colorValue);
    };
    
    // Helper function to determine text color based on background color
    const getTextColor = (bgColor) => {
        if (!bgColor) return ''; // Default text color
        
        // Calculate the relative luminance of the background color
        // Formula: 0.299*R + 0.587*G + 0.114*B
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
    
    // Helper function to calculate a subject's color using the same algorithm as TimeSlot.js
    const getSubjectColorFromAlgorithm = (subject, isDarkMode) => {
        // Predefined colors for common subjects
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
        
        // Generate color based on subject name (simplified from TimeSlot.js)
        const stringToColor = (str) => {
            if (!str) return isDarkMode ? '#5c5c5c' : '#9e9e9e';
            
            // Generate a base hash from the string
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            // Define color palettes for better visual distinction
            const colorPalettes = [
                { h: 0, s: 75, l: 60 },     // Red
                { h: 30, s: 75, l: 60 },    // Orange
                { h: 60, s: 75, l: 60 },    // Yellow
                { h: 120, s: 60, l: 40 },   // Green
                { h: 180, s: 65, l: 45 },   // Teal
                { h: 210, s: 70, l: 55 },   // Blue
                { h: 240, s: 70, l: 60 },   // Indigo
                { h: 270, s: 70, l: 55 },   // Purple
                { h: 300, s: 70, l: 60 },   // Pink
                { h: 330, s: 70, l: 60 }    // Magenta
            ];
            
            // Select a base palette using the hash
            const paletteIndex = Math.abs(hash) % colorPalettes.length;
            const baseColor = colorPalettes[paletteIndex];
            
            // Adjust lightness based on theme
            let l = baseColor.l;
            if (isDarkMode) {
                l = Math.max(25, Math.min(50, l - 15));
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
            const rgb = toRGB(baseColor.h, baseColor.s, l);
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
        
        // Check for PST/Private Study
        if (subject === 'PST' || subject === 'Private Study') {
            const psColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
            return psColors['Private Study'];
        }
        
        // Lookup in predefined color maps
        const subjectColors = isDarkMode ? darkSubjectColors : lightSubjectColors;
        if (subject && subjectColors[subject]) {
            return subjectColors[subject];
        }
        
        // Generate color based on subject name
        return stringToColor(subject);
    };
    
    // Group subjects by first letter
    const groupedSubjects = useMemo(() => {
        const groups = {};
        
        subjects.forEach(subject => {
            if (!subject) return;
            
            // Skip if it doesn't match search term
            if (searchTerm && !subject.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }
            
            // Get first letter
            const firstLetter = subject.charAt(0).toUpperCase();
            
            // Create group if it doesn't exist
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            
            // Add subject to group
            groups[firstLetter].push(subject);
        });
        
        return groups;
    }, [subjects, searchTerm]);

    // Get list of group names (letters)
    const groupNames = useMemo(() => {
        return Object.keys(groupedSubjects).sort();
    }, [groupedSubjects]);

    // Filter subjects based on group and search
    const filteredSubjects = useMemo(() => {
        if (searchTerm) {
            return subjects.filter(subject => 
                subject.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        if (activeGroup === 'all') {
            return subjects;
        }
        
        return groupedSubjects[activeGroup] || [];
    }, [subjects, searchTerm, activeGroup, groupedSubjects]);
    
    if (!isVisible) {
        return null;
    }
    
    return createPortal(
        <div className="colors-popup-overlay" onClick={onClose}>
            <div className="colors-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="colors-popup-header">
                    <h2>Customize Subject Colours</h2>
                    <button className="close-popup-button" onClick={onClose} aria-label="Close popup">×</button>
                </div>
                
                <div className="colors-popup-body">
                    {subjects.length === 0 ? (
                        <p className="no-subjects-message">No subjects found in your timetable.</p>
                    ) : (
                        <div className="color-customization-container">
                            <p className="setting-help-text">
                                Customize the colours of your subjects. Each subject must have a unique colour.
                            </p>
                            
                            {/* Color palette preview */}
                            <div className="color-palette-preview">
                                <h4>Available Colours</h4>
                                <div className="color-palette-grid">
                                    {colorService.getAvailableColors().map(color => {
                                        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                                                        document.body.classList.contains('theme-dark');
                                        const colorValue = isDarkMode ? color.darkValue : color.value;
                                        const isUsed = Object.values(customColors).some(c => 
                                            (isDarkMode ? c.darkValue : c.value) === colorValue);
                                        
                                        return (
                                            <div 
                                                key={color.value}
                                                className={`palette-color-item ${isUsed ? 'used' : ''}`}
                                                style={{ backgroundColor: colorValue }}
                                                title={`${color.label}${isUsed ? ' (already in use)' : ''}`}
                                            >
                                                {isUsed && <span className="used-indicator">✓</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="action-buttons-container">
                                <button 
                                    className="auto-assign-button"
                                    onClick={() => {
                                        // Auto-assign unique colors to all subjects
                                        const result = colorService.autoAssignColors(subjects);
                                        
                                        if (result.success) {
                                            // Update state
                                            setCustomColors(colorService.getAllCustomColors());
                                            
                                            // Notify other components
                                            notifyColorChanged({ action: 'auto-assign' });
                                            
                                            if (result.failed.length > 0) {
                                                alert(`Assigned colours to ${result.assigned.length} subjects. Could not assign colours to ${result.failed.length} subjects due to not enough unique colours.`);
                                            } else {
                                                alert(`Successfully assigned unique colours to all ${result.assigned.length} subjects!`);
                                            }
                                        }
                                    }}
                                    aria-label="Automatically assign unique colours to all subjects"
                                >
                                    <span role="img" aria-hidden="true" style={{ marginRight: '6px' }}>🎨</span> Auto-Assign All Colours
                                </button>
                                
                                {Object.keys(customColors).length > 0 && (
                                    <button 
                                        className="reset-all-button"
                                        onClick={() => {
                                            // Confirm before resetting all colors
                                            if (window.confirm('Are you sure you want to reset all custom colours?')) {
                                                // Reset all custom colors
                                                Object.keys(customColors).forEach(subject => {
                                                    colorService.removeSubjectColor(subject);
                                                });
                                                
                                                // Update state
                                                setCustomColors({});
                                                
                                                // Notify other components
                                                notifyColorChanged({ action: 'reset-all' });
                                            }
                                        }}
                                        aria-label="Reset all subject colours to defaults"
                                    >
                                        <span role="img" aria-hidden="true" style={{ marginRight: '6px' }}>↩️</span> Reset All Colours
                                    </button>
                                )}
                            </div>
                            
                            {/* Search and grouping controls */}
                            <div className="subject-filter-container">
                                <div className="subject-search-container">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="subject-search"
                                        placeholder="Search subjects..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (e.target.value) {
                                                setActiveGroup('all');
                                            }
                                        }}
                                        aria-label="Search subjects"
                                    />
                                    {searchTerm && (
                                        <button 
                                            className="clear-search-button" 
                                            onClick={() => setSearchTerm('')}
                                            aria-label="Clear search"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                
                                {subjects.length > 5 && !searchTerm && (
                                    <div className="subject-group-tabs">
                                        <button 
                                            className={`group-tab ${activeGroup === 'all' ? 'active' : ''}`}
                                            onClick={() => setActiveGroup('all')}
                                        >
                                            All
                                        </button>
                                        {groupNames.map(letter => (
                                            <button 
                                                key={letter}
                                                className={`group-tab ${activeGroup === letter ? 'active' : ''}`}
                                                onClick={() => setActiveGroup(letter)}
                                            >
                                                {letter}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Subject list with group headers */}
                            <div className="subject-list-container">
                                {filteredSubjects.length === 0 ? (
                                    <p className="no-results-message">No subjects match your search.</p>
                                ) : (
                                    <div className="subject-color-grid">
                                        {filteredSubjects.map((subject, index) => {
                                            // Get currently assigned color (if any)
                                            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                                                                document.body.classList.contains('theme-dark');
                                            const currentColor = customColors[subject] ? 
                                                (isDarkMode ? customColors[subject].darkValue : customColors[subject].value) : '';
                                            
                                            return (
                                                <div className="subject-color-item" key={subject} style={{ '--index': index }}>
                                                    <div className="subject-details">
                                                        <div className="subject-name">{subject}</div>
                                                        <div 
                                                            className="subject-color-sample" 
                                                            style={{ 
                                                                backgroundColor: currentColor || getSubjectColorFromAlgorithm(subject, isDarkMode),
                                                                color: getTextColor(currentColor || getSubjectColorFromAlgorithm(subject, isDarkMode))
                                                            }}
                                                            aria-label={`Current color for ${subject}`}
                                                        >
                                                            <span className="color-name">
                                                                {subject}
                                                            </span>
                                                            <span className="color-type-badge">
                                                                {currentColor ? 'Custom' : 'Default'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="color-controls">
                                                        <div className="color-selector-wrapper">
                                                            <select 
                                                                value={currentColor} 
                                                                onChange={(e) => handleColorChange(subject, e.target.value)}
                                                                className="color-dropdown"
                                                                style={{
                                                                    backgroundColor: currentColor || 'transparent',
                                                                    color: getTextColor(currentColor)
                                                                }}
                                                            >
                                                                <option value="">Default Colour</option>
                                                                {colorService.getAvailableColors().map(color => {
                                                                    const isUsed = customColors[subject]?.value === color.value || 
                                                                                Object.values(customColors).some(c => 
                                                                                    c.value === color.value && !customColors[subject]);
                                                                    
                                                                    // Either show all colors, or only show colors that aren't already assigned
                                                                    // (except the one currently assigned to this subject)
                                                                    const shouldShow = !isUsed || (customColors[subject]?.value === color.value);
                                                                    
                                                                    if (shouldShow) {
                                                                        return (
                                                                            <option 
                                                                                key={color.value} 
                                                                                value={color.value}
                                                                                style={{
                                                                                    backgroundColor: color.value,
                                                                                    color: getTextColor(color.value)
                                                                                }}
                                                                            >
                                                                                <span className="color-preview" style={{ backgroundColor: color.value }}></span>
                                                                                {color.label}
                                                                            </option>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                            </select>
                                                            
                                                            {currentColor && (
                                                                <button 
                                                                    className="reset-color-button" 
                                                                    onClick={() => handleColorChange(subject, '')}
                                                                    title="Reset to default colour"
                                                                    aria-label={`Reset ${subject} to default colour`}
                                                                >
                                                                    ×
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Color swatches for easier selection */}
                                                        <div className="color-swatch-section">
                                                            <div className="color-swatch-header">Quick Select:</div>
                                                            <div className="color-swatch-wrapper">
                                                                {colorService.getAvailableColors().map((color, colorIndex) => {
                                                                    // Determine if this color is already used by another subject
                                                                    const isUsed = customColors[subject]?.value !== color.value &&
                                                                                Object.values(customColors).some(c => c.value === color.value);
                                                                    
                                                                    // Determine if this is the currently selected color
                                                                    const isSelected = customColors[subject]?.value === color.value;
                                                                
                                                                    return (
                                                                        <div 
                                                                            key={color.value}
                                                                            className={`color-swatch ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                                                                            style={{ 
                                                                                backgroundColor: color.value,
                                                                                borderColor: isSelected ? (isDarkMode ? '#fff' : '#333') : 'transparent'
                                                                            }}
                                                                            onClick={() => !isUsed && handleSwatchSelect(subject, isSelected ? '' : color.value)}
                                                                            onKeyDown={(e) => {
                                                                                // Handle keyboard interaction
                                                                                if (!isUsed && (e.key === 'Enter' || e.key === ' ')) {
                                                                                    e.preventDefault();
                                                                                    handleSwatchSelect(subject, isSelected ? '' : color.value);
                                                                                }
                                                                            }}
                                                                            role="button"
                                                                            tabIndex={isUsed ? -1 : 0}
                                                                            aria-label={`${color.label} colour${isUsed ? ' (already used)' : ''}`}
                                                                            aria-pressed={isSelected}
                                                                            title={isUsed ? `${color.label} (already used)` : color.label}
                                                                        ></div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            {/* Color summary section */}
                            <div className="color-summary">
                                <h4 className="color-summary-title">Colour Summary</h4>
                                <div className="color-preview-grid">
                                    {subjects.map(subject => {
                                        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                                                        document.body.classList.contains('theme-dark');
                                        
                                        // Get color for this subject
                                        const customColor = customColors[subject] ? 
                                            (isDarkMode ? customColors[subject].darkValue : customColors[subject].value) : null;
                                        
                                        // If no custom color, calculate what it would be (similar to TimeSlot logic)
                                        const calculatedColor = customColor || getSubjectColorFromAlgorithm(subject, isDarkMode);
                                        
                                        return (
                                            <div 
                                                key={subject} 
                                                className="color-preview-item"
                                                style={{ 
                                                    backgroundColor: calculatedColor,
                                                    color: getTextColor(calculatedColor)
                                                }}
                                                title={`${subject}${customColor ? ' (Custom colour)' : ' (Default colour)'}`}
                                                role="listitem"
                                                aria-label={`${subject} with ${customColor ? 'custom' : 'default'} colour`}
                                            >
                                                <span className="preview-subject-name">{subject}</span>
                                                <span className="preview-color-status">{customColor ? '●' : '○'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body // Render the portal at the end of the body
    );
};

export default ColorsPopup;
