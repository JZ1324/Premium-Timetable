import React, { useState, useEffect, useRef } from 'react';
import TimeSlot from './TimeSlot';
import ImportButton from './ImportButton';
import ImportTimetable from './ImportTimetable';
import TemplateNamePopup from './TemplateNamePopup';
import NotificationPopup from './NotificationPopup';
import ConfirmDialog from './ConfirmDialog';
import ColorsPopup from './ColorsPopup';
import timetableService from '../services/timetableService';
import parseTimetable from '../utils/timetableParser';
import convertStructuredDataToTimeSlots from '../utils/convertStructuredDataToTimeSlots';
import { getCurrentSchoolDay, getCurrentPeriod, shouldShowBreakPeriod } from '../utils/dateUtils';
import { saveCurrentTimetableDay, getLastActiveTimetableDay, saveCurrentTemplate, getLastActiveTemplate } from '../utils/userPreferences';
import { useAuth } from './AuthProvider';
import { isAdmin } from '../services/userService';
import AdminTerminal from './AdminTerminal';
import { isNotificationSupported, requestNotificationPermission, checkUpcomingClasses } from '../services/notificationService';
import '../styles/components/Timetable.css';
import '../styles/components/TimeSlot.css';
import '../styles/components/CurrentDay.css';
import '../styles/components/BreakPeriods.css';
import '../styles/components/DefaultButton.css';
import '../styles/components/TemplateNamePopup.css';
import '../styles/components/NotificationPopup.css';
import '../styles/components/ConfirmDialog.css';
import '../styles/components/ColorsPopup.css';

const Timetable = () => {
    const { user } = useAuth();
    const [timeSlots, setTimeSlots] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [currentTemplate, setCurrentTemplate] = useState('');
    const [currentDay, setCurrentDay] = useState(1);
    const [editMode, setEditMode] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [currentEditingSlot, setCurrentEditingSlot] = useState(null);
    const [currentPeriod, setCurrentPeriod] = useState('');
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [showAdminTerminal, setShowAdminTerminal] = useState(false);
    const [templatePopup, setTemplatePopup] = useState({
        isOpen: false,
        suggestedName: '',
        onSave: null,
        successMessage: '',
        fallbackMessage: ''
    });
    const [notification, setNotification] = useState({
        isOpen: false,
        message: '',
        type: 'info', // 'info', 'success', 'error', 'warning'
        title: ''
    });
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' // 'warning', 'danger', 'info'
    });
    const [displaySettings, setDisplaySettings] = useState({
        displayCode: true,
        displayTeacher: true,
        displayRoom: true,
        useFirstNameForTeachers: false
    });
    const [visiblePeriods, setVisiblePeriods] = useState({
        Recess: false,
        Lunch: false
    });
    const [showColorLegend, setShowColorLegend] = useState(false);
    const [editingRowHeight, setEditingRowHeight] = useState(null);
    
    /**
     * Generate a template name for auto-saving imported timetables
     * @param {Array} slots - The time slots to extract subject names from
     * @returns {string} A generated template name
     */
    const generateImportTemplateName = (slots) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString().replace(/\//g, '-');
        
        // Find a few subjects to include in the template name (skip break periods)
        const subjectNames = [...new Set(
            slots
                .filter(slot => slot.subject && !['Lunch', 'Recess', 'Tutorial'].includes(slot.subject))
                .map(slot => slot.subject)
        )].slice(0, 2);
        
        // Create template name with subjects if available, otherwise just date
        if (subjectNames.length > 0) {
            return `Imported (${subjectNames.join(', ')}) ${dateStr}`;
        } else {
            return `Imported ${dateStr}`;
        }
    };
    
    /**
     * Automatically save the current timetable as a template with custom name prompt
     * @param {string} suggestedName - The suggested name to use for the template
     * @param {string} successMessage - The success message to show in the alert
     * @param {string} fallbackMessage - The fallback message if saving fails
     * @returns {boolean} Whether the save was successful
     */
    const saveAutoTemplate = (suggestedName, successMessage, fallbackMessage) => {
        // Open the template name popup with the suggested name
        setTemplatePopup({
            isOpen: true,
            suggestedName: suggestedName,
            successMessage,
            fallbackMessage,
            onSave: (userTemplateName) => {
                try {
                    // If user provides a name, use it; otherwise use the suggested name
                    const templateName = userTemplateName ? userTemplateName.trim() : suggestedName;
                    
                    // If we still have no name, generate a timestamp-based one
                    const finalTemplateName = templateName || `Imported ${new Date().toISOString().slice(0, 10)}`;
                    
                    // Save the timetable as a template
                    timetableService.saveAsTemplate(finalTemplateName);
                    
                    // Update the templates list and current template
                    setTemplates(timetableService.getTemplateNames());
                    setCurrentTemplate(finalTemplateName);
                    saveCurrentTemplate(finalTemplateName);
                    
                    // Close the popup without showing any alert
                    setTemplatePopup(prev => ({ ...prev, isOpen: false }));
                    
                    return true;
                } catch (error) {
                    console.error('Error saving timetable as template:', error);
                    
                    // Close the popup without showing any alert
                    setTemplatePopup(prev => ({ ...prev, isOpen: false }));
                    
                    return false;
                }
            }
        });
        
        // Return true to indicate that the popup was shown
        return true;
    };
    const [notificationSettings, setNotificationSettings] = useState({
        enabled: false,
        permissionGranted: false,
        timeMinutes: 15
    });
    const editingRowRef = useRef(null);
    const labelRefs = useRef({});
    const notificationIntervalRef = useRef(null);

    // Get all days from 1 to 10
    const days = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Get day name based on day number
    const getDayName = (dayNum) => {
        const dayNames = {
            1: 'Monday (Week A)', 2: 'Tuesday (Week A)', 3: 'Wednesday (Week A)', 4: 'Thursday (Week A)', 5: 'Friday (Week A)',
            6: 'Monday (Week B)', 7: 'Tuesday (Week B)', 8: 'Wednesday (Week B)', 
            9: 'Thursday (Week B)', 10: 'Friday (Week B)'
        };
        return dayNames[dayNum] || `Day ${dayNum}`;
    };
    
    // Handle day selection with improved event handling
    const handleDayChange = (event, day) => {
        event.preventDefault();
        event.stopPropagation();
        
        console.log("Switching to day:", day);
        setCurrentDay(day);
        // Save the current day to localStorage
        saveCurrentTimetableDay(day);
        // Close any open editing form when switching days
        setCurrentEditingSlot(null);
    };

    useEffect(() => {
        // Load templates on component mount
        const templateNames = timetableService.getTemplateNames();
        setTemplates(templateNames);
        
        // Load the last active template from localStorage (defaults to 'school')
        const lastActiveTemplate = getLastActiveTemplate();
        if (templateNames.includes(lastActiveTemplate)) {
            loadTemplate(lastActiveTemplate);
        } else if (templateNames.includes('school')) {
            loadTemplate('school');
        }

        // Always default to today's day on page load/refresh
        const todayDay = getCurrentSchoolDay();
        setCurrentDay(todayDay);
        console.log(`Setting current day to today: Day ${todayDay}`);
        
        // Save today's day as the current selection
        saveCurrentTimetableDay(todayDay);
        
        // Set current period based on current time
        const nowPeriod = getCurrentPeriod();
        setCurrentPeriod(nowPeriod);
        console.log(`Current period is ${nowPeriod}`);
        
        // Check if break periods should be visible
        const showRecess = shouldShowBreakPeriod('Recess');
        const showLunch = shouldShowBreakPeriod('Lunch');
        setVisiblePeriods({
            Recess: showRecess,
            Lunch: showLunch
        });
        
        // Update current period and break visibility every minute
        const updateInterval = setInterval(() => {
            const updatedPeriod = getCurrentPeriod();
            console.log(`Updating current period to: ${updatedPeriod}`);
            setCurrentPeriod(updatedPeriod);
            
            // Update break period visibility
            const updatedShowRecess = shouldShowBreakPeriod('Recess');
            const updatedShowLunch = shouldShowBreakPeriod('Lunch');
            setVisiblePeriods({
                Recess: updatedShowRecess,
                Lunch: updatedShowLunch
            });
        }, 30000); // check every 30 seconds for more responsive UI

        // Clean up on unmount
        return () => {
            clearInterval(updateInterval);
        };

        // Load display settings from localStorage
        const savedSettings = localStorage.getItem('timetable-settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setDisplaySettings({
                    displayCode: parsedSettings.displayCode !== undefined ? parsedSettings.displayCode : true,
                    displayTeacher: parsedSettings.displayTeacher !== undefined ? parsedSettings.displayTeacher : true,
                    displayRoom: parsedSettings.displayRoom !== undefined ? parsedSettings.displayRoom : true,
                    useFirstNameForTeachers: parsedSettings.useFirstNameForTeachers || false
                });
                
                // Load notification settings
                setNotificationSettings({
                    enabled: parsedSettings.enableNotifications || false,
                    permissionGranted: false, // Will be updated later
                    timeMinutes: parsedSettings.notificationTime || 15
                });
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
    }, []);
    
    // Initialize notification system
    useEffect(() => {
        const initializeNotifications = async () => {
            // Check if notifications are supported
            if (!isNotificationSupported()) {
                console.log('Browser notifications are not supported');
                return;
            }
            
            // Check if notifications are enabled in settings
            if (!notificationSettings.enabled) {
                console.log('Notifications are disabled in settings');
                return;
            }
            
            // Request permission if needed
            const permissionGranted = await requestNotificationPermission();
            setNotificationSettings(prev => ({
                ...prev,
                permissionGranted
            }));
            
            if (!permissionGranted) {
                console.log('Notification permission denied');
                return;
            }
            
            console.log(`Notification system initialized with ${notificationSettings.timeMinutes} minute alert time`);
        };
        
        initializeNotifications();
    }, [notificationSettings.enabled]);
    
    // Set up notification checking interval
    useEffect(() => {
        // Clear any existing interval
        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
            notificationIntervalRef.current = null;
        }
        
        // If notifications are enabled and permission is granted, set up the interval
        if (notificationSettings.enabled && notificationSettings.permissionGranted) {
            // Check every minute for upcoming classes
            notificationIntervalRef.current = setInterval(() => {
                const todayDay = getCurrentSchoolDay();
                
                // Only check for notifications if we're viewing today's timetable
                if (todayDay === currentDay) {
                    const notificationResult = checkUpcomingClasses(
                        timeSlots,
                        notificationSettings.timeMinutes,
                        currentDay
                    );
                    
                    if (notificationResult && notificationResult.length > 0) {
                        notificationResult.forEach(result => {
                            console.log('Notification sent for upcoming class:', result.slot.subject);
                        });
                    }
                }
            }, 60000); // Check every minute
            
            // Run an initial check
            const todayDay = getCurrentSchoolDay();
            if (todayDay === currentDay) {
                const notificationResult = checkUpcomingClasses(
                    timeSlots,
                    notificationSettings.timeMinutes,
                    currentDay
                );
                
                if (notificationResult && notificationResult.length > 0) {
                    notificationResult.forEach(result => {
                        console.log('Initial notification sent for upcoming class:', result.slot.subject);
                    });
                }
            }
        }
        
        // Clean up on unmount
        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
                notificationIntervalRef.current = null;
            }
        };
    }, [
        notificationSettings.enabled, 
        notificationSettings.permissionGranted, 
        notificationSettings.timeMinutes,
        timeSlots,
        currentDay
    ]);
    
    /**
     * Handle importing timetable data and automatically save as template
     * @param {object|string} data - The timetable data to import, can be structured object or raw text
     */
    const importTimetable = (data) => {
        console.log('Importing timetable data:', data);
        if (!data) return;
        
        // Convert the imported data to time slots
        const convertedSlots = convertStructuredDataToTimeSlots(data);
        
        if (convertedSlots && convertedSlots.length > 0) {
            // Clear existing timetable first
            timetableService.clearTimetable();
            
            // Add each time slot to the service
            convertedSlots.forEach(slot => {
                timetableService.addTimeSlot(slot);
            });
            
            // Update the UI
            setTimeSlots(convertedSlots);
            
            // Make sure we have a current day that exists in the data
            // Get unique days from the imported data
            const importedDays = [...new Set(convertedSlots.map(slot => slot.day))];
            if (importedDays.length > 0) {
                const newDay = importedDays.includes(currentDay) ? currentDay : importedDays[0];
                setCurrentDay(newDay);
                saveCurrentTimetableDay(newDay);
            }
            
            // Automatically save the imported timetable as a template
            // Generate a meaningful template name using our utility function
            const importedTemplateName = generateImportTemplateName(convertedSlots);
            
            // Save the timetable as a template using our utility function
            saveAutoTemplate(
                importedTemplateName,
                `Timetable imported successfully and saved as template "${importedTemplateName}"`,
                'Timetable imported successfully!'
            )
        } else {
            setNotification({
                isOpen: true,
                message: 'Failed to import timetable. The data format may be incorrect.',
                type: 'error',
                title: 'Import Error'
            });
        }
    };

    // Check if user has admin privileges
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user && user.uid) {
                try {
                    const adminStatus = await isAdmin(user.uid);
                    setIsAdminUser(adminStatus);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setIsAdminUser(false);
                }
            } else {
                setIsAdminUser(false);
            }
        };
        
        checkAdminStatus();
    }, [user]);

    useEffect(() => {
        if (currentEditingSlot && editingRowRef.current) {
            // Get the height of the row being edited
            const height = editingRowRef.current.clientHeight;
            setEditingRowHeight(height);
        } else {
            setEditingRowHeight(null);
        }
    }, [currentEditingSlot]);

    const loadTemplate = (templateName) => {
        timetableService.loadTemplate(templateName);
        setTimeSlots(timetableService.getTimeSlots());
        setCurrentTemplate(templateName);
        // Save the current template to localStorage
        saveCurrentTemplate(templateName);
        // Close any open editing form when loading a template
        setCurrentEditingSlot(null);
    };

    const saveTemplate = () => {
        if (newTemplateName.trim()) {
            timetableService.saveAsTemplate(newTemplateName);
            setTemplates(timetableService.getTemplateNames());
            setNewTemplateName('');
            setCurrentTemplate(newTemplateName);
            // Save current template to localStorage
            saveCurrentTemplate(newTemplateName);
        }
    };
    
    const deleteTemplate = (templateName) => {
        // Don't delete built-in templates
        if (templateName === 'school') {
            setNotification({
                isOpen: true,
                message: 'The default school template cannot be deleted.',
                type: 'warning',
                title: 'Cannot Delete Template'
            });
            return;
        }
        
        // Show confirm dialog for deletion
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Template',
            message: `Are you sure you want to delete the template "${templateName}"?`,
            type: 'danger',
            onConfirm: () => {
                // Close the confirm dialog
                setConfirmDialog(prev => ({...prev, isOpen: false}));
                
                const success = timetableService.deleteTemplate(templateName);
                if (success) {
                    // Update template list
                    setTemplates(timetableService.getTemplateNames());
                    
                    // If the deleted template was the current template, switch to the school template
                    if (currentTemplate === templateName) {
                        loadTemplate('school');
                    }
                    
                    // Show success notification
                    setNotification({
                        isOpen: true,
                        message: `Template "${templateName}" has been deleted.`,
                        type: 'success',
                        title: 'Template Deleted'
                    });
                }
            }
        });
    };

    /**
     * Handle data imports from structured data (JSON/object) 
     * and automatically save as template
     * @param {object|string} importedData - The data to import
     */
    const handleImportData = (importedData) => {
        try {
            console.log("Received import data:", importedData);
            
            // Check if data is already in the correct structured format (from AI tab)
            if (importedData && typeof importedData === 'object' && !Array.isArray(importedData) && 
                importedData.days && importedData.periods && importedData.classes) {
                console.log("Received structured data from AI tab");
                // This is already structured data from the AI tab
                const slots = convertStructuredDataToTimeSlots(importedData);
                
                if (!slots || slots.length === 0) {
                    console.error("Failed to convert structured data to time slots");
                    setNotification({
                        isOpen: true,
                        message: 'Failed to process the structured data. The data format may be invalid or incomplete.',
                        type: 'error',
                        title: 'Import Error'
                    });
                    return;
                }
                
                console.log(`Successfully converted ${slots.length} classes to time slots`);
                timetableService.clearTimetable();
                slots.forEach(slot => {
                    timetableService.addTimeSlot(slot);
                });
                // Ensure recess and lunch periods are preserved
                timetableService.preserveBreakPeriods();
                setTimeSlots(timetableService.getTimeSlots());
                
                // Auto-save as template for structured AI data
                // Generate a meaningful template name using our utility function
                const importedTemplateName = generateImportTemplateName(slots);
                
                // Save the timetable as a template using our utility function
                saveAutoTemplate(
                    importedTemplateName,
                    `Timetable imported successfully and saved as template "${importedTemplateName}"! Added ${slots.length} classes.`,
                    `Timetable imported successfully! Added ${slots.length} classes.`
                )
                return;
            }
            // Raw text input - parse it
            else if (typeof importedData === 'string') {
                if (!importedData.trim()) {
                    setNotification({
                        isOpen: true,
                        message: 'The imported text is empty. Please provide timetable data.',
                        type: 'warning',
                        title: 'Empty Import'
                    });
                    return;
                }
                
                console.log("Parsing raw text input");
                const parsedData = parseTimetable(importedData);
                
                // Check if the parsed data has necessary structure
                if (!parsedData || !parsedData.days || parsedData.days.length === 0) {
                    console.error("Failed to extract days from timetable data");
                    setNotification({
                        isOpen: true,
                        message: 'Could not identify days in your timetable. Please check the format.',
                        type: 'error',
                        title: 'Parsing Error'
                    });
                    return;
                }
                
                if (!parsedData.periods || parsedData.periods.length === 0) {
                    console.error("Failed to extract periods from timetable data");
                    setNotification({
                        isOpen: true,
                        message: 'Could not identify periods in your timetable. Please check the format.',
                        type: 'error',
                        title: 'Parsing Error'
                    });
                    return;
                }
                
                console.log(`Parsed data has ${parsedData.days.length} days and ${parsedData.periods.length} periods`);
                
                // Check if any classes were parsed
                let totalClasses = 0;
                Object.keys(parsedData.classes).forEach(day => {
                    Object.keys(parsedData.classes[day] || {}).forEach(period => {
                        totalClasses += (parsedData.classes[day][period] || []).length;
                    });
                });
                
                if (totalClasses === 0) {
                    console.error("No classes were found in the parsed data");
                    setNotification({
                        isOpen: true,
                        message: 'No classes were found in your timetable. Please check the format.',
                        type: 'error',
                        title: 'Parsing Error'
                    });
                    return;
                }
                
                console.log(`Found ${totalClasses} classes in parsed data`);
                
                const slots = convertStructuredDataToTimeSlots(parsedData);
                if (!slots || slots.length === 0) {
                    console.error("Failed to convert parsed data to time slots");
                    setNotification({
                        isOpen: true,
                        message: 'Failed to process the parsed data. The data may be in an incorrect format.',
                        type: 'error',
                        title: 'Import Error'
                    });
                    return;
                }
                
                console.log(`Successfully converted ${slots.length} classes to time slots`);
                timetableService.clearTimetable();
                slots.forEach(slot => {
                    timetableService.addTimeSlot(slot);
                });
                // Ensure recess and lunch periods are preserved
                timetableService.preserveBreakPeriods();
                setTimeSlots(timetableService.getTimeSlots());
                
                // Auto-save as template for raw text imports
                // Generate a meaningful template name using our utility function
                const importedTemplateName = generateImportTemplateName(slots);
                
                // Save the timetable as a template using our utility function
                saveAutoTemplate(
                    importedTemplateName,
                    `Timetable parsed and imported successfully and saved as template "${importedTemplateName}"! Added ${slots.length} classes.`,
                    `Timetable parsed and imported successfully! Added ${slots.length} classes.`
                )
                return;
            }
            // Legacy format with timeSlots array
            else if (importedData.timeSlots) {
                timetableService.clearTimetable();
                importedData.timeSlots.forEach(slot => {
                    timetableService.addTimeSlot(slot);
                });
                // Ensure recess and lunch periods are preserved
                timetableService.preserveBreakPeriods();
                setTimeSlots(timetableService.getTimeSlots());
                
                // Auto-save as template for legacy timeSlots format
                // Get the imported slots and generate a template name
                const importedSlots = timetableService.getTimeSlots();
                const importedTemplateName = generateImportTemplateName(importedSlots);
                
                // Save the timetable as a template using our utility function
                saveAutoTemplate(
                    importedTemplateName, 
                    `Timetable imported successfully and saved as template "${importedTemplateName}"!`,
                    'Timetable imported successfully!'
                )
                return;
            }
            
            // If we get here, we couldn't process the data
            setNotification({
                isOpen: true,
                message: 'The imported file does not contain any timetable data in a recognized format.',
                type: 'error',
                title: 'Import Error'
            });
        } catch (error) {
            console.error('Error processing imported data:', error);
            setNotification({
                isOpen: true,
                message: 'Failed to process the imported timetable data: ' + error.message,
                type: 'error',
                title: 'Import Error'
            });
        }
    };

    const addTimeSlot = () => {
        const newSlot = { 
            id: Date.now(), 
            day: currentDay,
            period: '', 
            subject: '', 
            startTime: '', 
            endTime: '',
            room: '',
            teacher: '',
            code: ''
        };
        
        timetableService.addTimeSlot(newSlot);
        setTimeSlots([...timeSlots, newSlot]);
    };

    const updateTimeSlot = (id, updatedSlot) => {
        const index = timeSlots.findIndex(slot => 
            slot.id === id || `${slot.day}-${slot.period}` === id
        );
        
        if (index !== -1) {
            console.log('Updating time slot at index:', index);
            console.log('Old slot:', timeSlots[index]);
            console.log('New slot:', updatedSlot);
            
            // Ensure we preserve the day and period values from the original slot
            const finalUpdatedSlot = {
                ...updatedSlot,
                day: timeSlots[index].day,
                period: timeSlots[index].period
            };
            
            // Update the slot in the service
            timetableService.editTimeSlot(index, finalUpdatedSlot);
            
            // Update the state immutably
            const updatedSlots = [...timeSlots];
            updatedSlots[index] = finalUpdatedSlot;
            setTimeSlots(updatedSlots);
            
            console.log('Updated slots array:', updatedSlots);
        }
        
        // Close the editing form
        setCurrentEditingSlot(null);
    };

    const removeTimeSlot = (id) => {
        const index = timeSlots.findIndex(slot => 
            slot.id === id || `${slot.day}-${slot.period}` === id
        );
        
        if (index !== -1) {
            timetableService.deleteTimeSlot(index);
            const updatedSlots = [...timeSlots];
            updatedSlots.splice(index, 1);
            setTimeSlots(updatedSlots);
        }
        
        // If the removed slot was being edited, close the editing form
        if (currentEditingSlot === id) {
            setCurrentEditingSlot(null);
        }
    };

    // Handle when a user starts editing a slot
    const handleStartEditing = (id) => {
        console.log('Starting edit for slot:', id);
        // Enable edit mode if not already enabled
        if (!editMode) {
            setEditMode(true);
        }
        setCurrentEditingSlot(id);
    };
    
    // Handle when a user cancels editing
    const handleCancelEditing = () => {
        console.log('Canceling edit');
        setCurrentEditingSlot(null);
    };

    // Get all periods for the selected day
    const getPeriods = () => {
        // Start with all non-break periods
        const allPeriods = ['1', '2', 'Tutorial', '3', '4', '5', 'After School'];
        
        // Only insert break periods if they should be visible or we're in edit mode
        if (visiblePeriods.Recess || editMode) {
            // Insert Recess after Tutorial
            allPeriods.splice(3, 0, 'Recess');
        }
        
        if (visiblePeriods.Lunch || editMode) {
            // Insert Lunch after period 4
            allPeriods.splice(allPeriods.indexOf('4') + 1, 0, 'Lunch');
        }
        
        return allPeriods;
    };

    // Filter slots by day and period
    const filterSlots = (day, period) => {
        return timeSlots.filter(slot => 
            slot.day === day && 
            String(slot.period) === String(period)
        );
    };

    // Store a reference to each period's corresponding label
    const getPeriodLabelRef = (period) => {
        if (!labelRefs.current[period]) {
            labelRefs.current[period] = React.createRef();
        }
        return labelRefs.current[period];
    };

    // Listen for color changes
    useEffect(() => {
        const handleColorChange = () => {
            // Force a re-render of the timetable by updating the timeSlots array
            // This will cause all TimeSlot components to re-render with new colors
            setTimeSlots([...timeSlots]);
        };
        
        // Add event listener for color changes
        window.addEventListener('timetable-colors-changed', handleColorChange);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('timetable-colors-changed', handleColorChange);
        };
    }, [timeSlots]);

    return (
        <div className="timetable-container">
            <div className="timetable-header">
                <h2>School Timetable</h2>
                <div className="current-day-display">
                    <span>{getDayName(currentDay)}</span>
                </div>
                
                <div className="template-controls">
                    <div className="default-timetable-dropdown-container">
                        <select 
                            value={currentTemplate} 
                            onChange={(e) => loadTemplate(e.target.value)}
                            className="default-timetable-btn"
                        >
                            <option value="" disabled>Default Timetable</option>
                            {templates.map(template => (
                                <option key={template} value={template}>
                                    {template.charAt(0).toUpperCase() + template.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="save-template">
                        <input 
                            type="text" 
                            placeholder="Template Name" 
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                        <button onClick={saveTemplate}>Save</button>
                    </div>
                    
                    {currentTemplate && currentTemplate !== 'school' && (
                        <button 
                            className="delete-template-btn" 
                            onClick={() => deleteTemplate(currentTemplate)}
                        >
                            Delete
                        </button>
                    )}
                    
                    <button 
                        className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
                        onClick={() => {
                            setEditMode(!editMode);
                            // Close any open editing form when toggling edit mode
                            setCurrentEditingSlot(null);
                        }}
                    >
                        {editMode ? 'View Mode' : 'Edit Mode'}
                    </button>
                    
                    <button 
                        className="color-legend-btn"
                        onClick={() => setShowColorLegend(!showColorLegend)}
                    >
                        Colours
                    </button>
                    
                    {isAdminUser && (
                        <button 
                            className="admin-button" 
                            onClick={() => setShowAdminTerminal(true)}
                        >
                            Admin
                        </button>
                    )}
                    
                    <ImportButton onImport={importTimetable} />
                </div>
                
                {editMode && (
                    <div className="edit-mode-hint">
                        <p>Click directly on any class to edit its details, or use the <span className="edit-button-hint">Edit</span> button</p>
                    </div>
                )}
                
                <div className="day-selector">
                    {days.map(day => {
                        // Get today's real school day number
                        const todayDay = getCurrentSchoolDay();
                        const isToday = day === todayDay;
                        
                        // Check if it's a weekend
                        const today = new Date();
                        
                        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
                        const isSaturday = dayOfWeek === 6;
                        const isSunday = dayOfWeek === 0;
                        
                        // Helper function to get appropriate hover text
                        const getHoverText = () => {
                            if (!isToday) return null;
                            if (isSaturday) return "2 days";
                            if (isSunday) return "1 day";
                            return "Today";
                        };
                        
                        // Determine the title for the button
                        let titleText = getDayName(day);
                        if (isToday) {
                            const hoverText = getHoverText();
                            titleText += ` (${hoverText})`;
                        }
                        
                        return (
                            <button 
                                key={day} 
                                type="button"
                                className={`day-button ${currentDay === day ? 'active' : ''} ${isToday ? 'current-day' : ''}`}
                                onClick={(e) => handleDayChange(e, day)}
                                title={titleText}
                            >
                                <span>Day {day}</span>
                                {isToday && <span className="today-text">{getHoverText()}</span>}
                            </button>
                        );
                    })}
                </div>
                
                {/* ColorsPopup Component */}
                <ColorsPopup 
                    isVisible={showColorLegend}
                    onClose={() => setShowColorLegend(false)}
                />
            </div>

            <div className="timetable">
                <div className="periods-column">
                    {getPeriods().map(period => {
                        const isEditingThisPeriod = filterSlots(currentDay, period).some(
                            slot => currentEditingSlot === (slot.id || `${slot.day}-${slot.period}`)
                        );
                        
                        return (
                            <div 
                                key={period} 
                                className={`period-label ${isEditingThisPeriod ? 'editing' : ''}`}
                                data-period={period}
                                ref={getPeriodLabelRef(period)}
                                style={isEditingThisPeriod && editingRowHeight ? { height: `${editingRowHeight}px` } : {}}
                            >
                                <span>{period}</span>
                                {period === '1' && <span className="time">8:35am–9:35am</span>}
                                {period === '2' && <span className="time">9:35am–10:35am</span>}
                                {period === 'Tutorial' && <span className="time">10:35am–11:05am</span>}
                                {period === 'Recess' && <span className="time">10:55am–11:25am</span>}
                                {period === '3' && <span className="time">11:30am–12:30pm</span>}
                                {period === '4' && <span className="time">12:30pm–1:30pm</span>}
                                {period === 'Lunch' && <span className="time">1:30pm–2:25pm</span>}
                                {period === '5' && <span className="time">2:25pm–3:25pm</span>}
                                {period === 'After School' && <span className="time">3:35pm–4:30pm</span>}
                            </div>
                        );
                    })}
                </div>
                
                <div className="day-column">
                    {getPeriods().map(period => {
                        const isEditingThisPeriod = filterSlots(currentDay, period).some(
                            slot => currentEditingSlot === (slot.id || `${slot.day}-${slot.period}`)
                        );
                        
                        return (
                            <div 
                                key={period} 
                                className={`period-row ${isEditingThisPeriod ? 'has-editing-slot' : ''}`}
                                data-period={period}
                                ref={isEditingThisPeriod ? editingRowRef : null}
                            >
                                {filterSlots(currentDay, period).map(slot => (
                                    <TimeSlot
                                        key={slot.id || `${slot.day}-${slot.period}`}
                                        slot={slot}
                                        onUpdate={updateTimeSlot}
                                        onRemove={removeTimeSlot}
                                        isEditing={currentEditingSlot === (slot.id || `${slot.day}-${slot.period}`)}
                                        onStartEditing={handleStartEditing}
                                        onCancelEditing={handleCancelEditing}
                                        displaySettings={displaySettings}
                                        isCurrentPeriod={currentPeriod !== null && slot.day === getCurrentSchoolDay() && String(slot.period) === String(currentPeriod)}
                                    />
                                ))}
                                
                                {editMode && filterSlots(currentDay, period).length === 0 && (
                                    <div className="add-time-slot">
                                        <button 
                                            onClick={() => {
                                                const newSlot = {
                                                    day: currentDay,
                                                    period: period,
                                                    startTime: period === '1' ? '8:35am' :
                                                              period === '2' ? '9:35am' :
                                                              period === 'Tutorial' ? '10:35am' :
                                                              period === '3' ? '11:30am' :
                                                              period === '4' ? '12:30pm' :
                                                              period === '5' ? '2:25pm' : '3:35pm',
                                                    endTime: period === '1' ? '9:35am' :
                                                             period === '2' ? '10:35am' :
                                                             period === 'Tutorial' ? '11:05am' :
                                                             period === '3' ? '12:30pm' :
                                                             period === '4' ? '1:30pm' :
                                                             period === '5' ? '3:25pm' : '4:30pm',
                                                    subject: '',
                                                    code: '',
                                                    room: '',
                                                    teacher: ''
                                                };
                                                
                                                timetableService.addTimeSlot(newSlot);
                                                setTimeSlots([...timeSlots, newSlot]);
                                            }}
                                        >
                                            + Add Class
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Admin Terminal */}
            {showAdminTerminal && (
                <AdminTerminal onClose={() => setShowAdminTerminal(false)} />
            )}
            
            {/* Template Name Popup */}
            <TemplateNamePopup
                isOpen={templatePopup.isOpen}
                suggestedName={templatePopup.suggestedName}
                onSave={templatePopup.onSave}
                onClose={() => setTemplatePopup(prev => ({ ...prev, isOpen: false }))}
            />
            
            {/* Notification Popup - replaces alert() */}
            <NotificationPopup 
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                title={notification.title}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
            />
            
            {/* Confirm Dialog - replaces window.confirm() */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default Timetable;