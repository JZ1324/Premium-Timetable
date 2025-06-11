/**
 * Service to manage custom colors for timetable subjects
 * This service provides functions to save, retrieve, and manage custom colors
 */

class ColorService {
    constructor() {
        this.customColors = {};
        this.loadCustomColors();
        
        // Available colors for the color picker dropdown
        this.availableColors = [
            { label: 'Blue', value: '#4a90e2', darkValue: '#2c5b9e' },
            { label: 'Indigo', value: '#5c6bc0', darkValue: '#3f4d8c' },
            { label: 'Purple', value: '#9c27b0', darkValue: '#6a1b7a' },
            { label: 'Deep Purple', value: '#673ab7', darkValue: '#4527a0' },
            { label: 'Pink', value: '#ec407a', darkValue: '#aa2c57' },
            { label: 'Red', value: '#e53935', darkValue: '#b71c1c' },
            { label: 'Orange', value: '#ff7043', darkValue: '#c8502b' },
            { label: 'Amber', value: '#ffca28', darkValue: '#c19412' },
            { label: 'Yellow', value: '#ffeb3b', darkValue: '#c8b900' },
            { label: 'Lime', value: '#c0ca33', darkValue: '#827717' },
            { label: 'Light Green', value: '#66bb6a', darkValue: '#3d703f' },
            { label: 'Green', value: '#43a047', darkValue: '#2d6e30' },
            { label: 'Teal', value: '#26a69a', darkValue: '#00796b' },
            { label: 'Cyan', value: '#00bcd4', darkValue: '#00838f' },
            { label: 'Light Blue', value: '#29b6f6', darkValue: '#0277bd' },
            { label: 'Brown', value: '#8d6e63', darkValue: '#5d4037' },
            { label: 'Grey', value: '#9e9e9e', darkValue: '#616161' },
            { label: 'Blue Grey', value: '#78909c', darkValue: '#455a64' }
        ];
    }

    /**
     * Load custom colors from localStorage
     */
    loadCustomColors() {
        try {
            const savedColors = localStorage.getItem('timetable-custom-colors');
            if (savedColors) {
                this.customColors = JSON.parse(savedColors);
            }
        } catch (error) {
            console.error('Error loading custom colors:', error);
            this.customColors = {};
        }
    }

    /**
     * Save custom colors to localStorage
     */
    saveCustomColors() {
        try {
            localStorage.setItem('timetable-custom-colors', JSON.stringify(this.customColors));
        } catch (error) {
            console.error('Error saving custom colors:', error);
        }
    }

    /**
     * Set a custom color for a subject
     * @param {string} subject - The subject name
     * @param {string} colorValue - The color value (must be one of the available colors)
     * @returns {boolean} - True if successful, false otherwise
     */
    setSubjectColor(subject, colorValue) {
        if (!subject) return false;
        
        // If colorValue is empty, remove the custom color
        if (!colorValue) {
            return this.removeSubjectColor(subject);
        }
        
        // Find the color object from available colors
        const colorObj = this.availableColors.find(c => c.value === colorValue);
        if (!colorObj) return false;
        
        // Check if any other subject already has this color
        const existingSubject = Object.keys(this.customColors).find(
            s => s !== subject && this.customColors[s].value === colorValue
        );
        
        if (existingSubject) {
            console.warn(`Color ${colorValue} is already used by subject ${existingSubject}`);
            return false;
        }
        
        // Set the color
        this.customColors[subject] = {
            value: colorObj.value,
            darkValue: colorObj.darkValue,
            label: colorObj.label
        };
        
        this.saveCustomColors();
        return true;
    }

    /**
     * Get the custom color for a subject
     * @param {string} subject - The subject name
     * @param {boolean} isDarkMode - Whether dark mode is active
     * @returns {string|null} - The custom color or null if not set
     */
    getSubjectColor(subject, isDarkMode = false) {
        if (!subject || !this.customColors[subject]) return null;
        
        return isDarkMode ? 
            this.customColors[subject].darkValue : 
            this.customColors[subject].value;
    }

    /**
     * Remove custom color for a subject
     * @param {string} subject - The subject name
     */
    removeSubjectColor(subject) {
        if (subject && this.customColors[subject]) {
            delete this.customColors[subject];
            this.saveCustomColors();
            return true;
        }
        return false;
    }

    /**
     * Get all subjects with custom colors
     * @returns {Object} - Object with subject names as keys and color objects as values
     */
    getAllCustomColors() {
        return { ...this.customColors };
    }

    /**
     * Get all available colors for the color picker
     * @returns {Array} - Array of color objects with label and value properties
     */
    getAvailableColors() {
        return [...this.availableColors];
    }

    /**
     * Get available colors that are not already assigned to other subjects
     * @param {string} currentSubject - The subject we're selecting a color for (to exclude from check)
     * @returns {Array} - Array of available color objects
     */
    getUnusedColors(currentSubject = null) {
        // Get all colors currently in use by subjects other than the current one
        const usedColors = new Set();
        
        Object.entries(this.customColors).forEach(([subject, colorInfo]) => {
            if (subject !== currentSubject) {
                usedColors.add(colorInfo.value);
            }
        });
        
        // Return colors that are not in use
        return this.availableColors.filter(color => !usedColors.has(color.value));
    }

    /**
     * Get subject color previews
     * @param {Array} subjects - Array of subject names to include
     * @param {boolean} isDarkMode - Whether dark mode is active
     * @returns {Array} - Array of objects with subject, color, and textColor properties
     */
    getSubjectColorPreviews(subjects = [], isDarkMode = false) {
        if (!subjects || subjects.length === 0) return [];
        
        return subjects.map(subject => {
            // Get custom color if available
            const customColor = this.getSubjectColor(subject, isDarkMode);
            
            // Use predefined colors for specific subjects
            const predefinedColors = isDarkMode ? {
                'Tutorial': '#757575',
                'Private Study': '#673ab7',
                'PST': '#673ab7', 
                'Recess': '#5d4037',
                'Lunch': '#e65100'
            } : {
                'Tutorial': '#bdbdbd',
                'Private Study': '#9575cd',
                'PST': '#9575cd',
                'Recess': '#8d6e63',
                'Lunch': '#fb8c00'
            };
            
            if (customColor) {
                // Use custom color
                return {
                    subject,
                    color: customColor,
                    source: 'custom'
                };
            } else if (predefinedColors[subject]) {
                // Use predefined color
                return {
                    subject,
                    color: predefinedColors[subject],
                    source: 'predefined'
                };
            } else {
                // Use generated color (we need to simulate the stringToColor algorithm)
                // This is a placeholder - in a real implementation you'd use the same algorithm
                // as in TimeSlot.js and ColorLegend.js
                const baseColor = isDarkMode ? '#444' : '#aaa';
                return {
                    subject,
                    color: baseColor,
                    source: 'generated'
                };
            }
        });
    }
    
    /**
     * Auto-assign colors to all subjects
     * @param {Array} subjects - Array of subject names to assign colors to
     * @returns {Object} - Object with success status and results
     */
    autoAssignColors(subjects = []) {
        if (!subjects || subjects.length === 0) return { success: false, message: 'No subjects provided' };
        
        // First, clear any existing color assignments for these subjects
        subjects.forEach(subject => this.removeSubjectColor(subject));
        
        // Get all available colors
        const colors = [...this.availableColors];
        
        // Shuffle the colors for random assignment
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }
        
        // Assign colors to subjects
        const results = {
            success: true,
            assigned: [],
            failed: []
        };
        
        subjects.forEach((subject, index) => {
            // Skip break periods and tutorials
            if (['Recess', 'Lunch', 'Break', 'Interval', 'Tutorial'].includes(subject)) {
                return;
            }
            
            // Assign a color if available
            if (index < colors.length) {
                const success = this.setSubjectColor(subject, colors[index].value);
                if (success) {
                    results.assigned.push(subject);
                } else {
                    results.failed.push(subject);
                }
            } else {
                results.failed.push(subject);
            }
        });
        
        return results;
    }
}

const colorService = new ColorService();
export default colorService;
