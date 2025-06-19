import React, { useState, useEffect } from 'react';
import timetableService from '../services/timetableService';
import { getCurrentTheme, setTheme } from '../services/themeService';
import { isNotificationSupported, requestNotificationPermission } from '../services/notificationService';
import '../styles/components/Settings.css';

const Settings = ({ sidebarOpen }) => {
    // Start with settings hidden on page load/refresh, automatically hide when sidebar collapses
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        displayCode: true,
        displayTeacher: true,
        displayRoom: true,
        useFirstNameForTeachers: false,
        enableNotifications: false,
        notificationTime: 15,
        weekStartsOn: 'monday',
        startWithWeek: 'B', // Default to Week B
        preferredAIModel: 'auto' // Auto select the best model
    });

    // Save settings to localStorage and check notification permission status
    useEffect(() => {
        const savedSettings = localStorage.getItem('timetable-settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                
                // Check if notifications are actually available and permitted
                if (parsedSettings.enableNotifications) {
                    const hasPermission = Notification?.permission === 'granted';
                    const isSupported = isNotificationSupported();
                    
                    // If notifications were enabled but are no longer available/permitted, disable them
                    if (!hasPermission || !isSupported) {
                        parsedSettings.enableNotifications = false;
                        localStorage.setItem('timetable-settings', JSON.stringify(parsedSettings));
                        console.log('Notifications were disabled because permission is no longer granted or notifications are not supported');
                    }
                }
                
                setSettings(parsedSettings);
            } catch (error) {
                console.error('Error parsing saved settings:', error);
            }
        }
    }, []);

    // Automatically hide settings when sidebar is collapsed
    useEffect(() => {
        if (!sidebarOpen && showSettings) {
            setShowSettings(false);
        }
    }, [sidebarOpen, showSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        
        // If trying to enable notifications, check if it's possible
        if (name === 'enableNotifications' && checked === true) {
            if (!isNotificationSupported()) {
                alert('Browser notifications are not supported in your browser.');
                return; // Don't update the setting
            }
            if (Notification?.permission === 'denied') {
                alert('Notification permission was denied. Please enable notifications in your browser settings to receive class reminders.');
                return; // Don't update the setting
            }
            // If permission is default (not yet asked), request it
            if (Notification?.permission === 'default') {
                handleNotificationPermission();
                return; // handleNotificationPermission will update the setting if permission is granted
            }
        }
        
        const updatedSettings = {
            ...settings,
            [name]: newValue
        };
        
        setSettings(updatedSettings);
        try {
            localStorage.setItem('timetable-settings', JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    };
    
    // Handle notification permission request
    const handleNotificationPermission = async () => {
        // Check if notifications are supported in this browser
        if (!isNotificationSupported()) {
            alert('Browser notifications are not supported in your browser.');
            return;
        }
        
        // Request permission to show notifications
        const permissionGranted = await requestNotificationPermission();
        
        if (permissionGranted) {
            // Permission granted - enable notifications
            const updatedSettings = { ...settings, enableNotifications: true };
            setSettings(updatedSettings);
            try {
                localStorage.setItem('timetable-settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error saving settings to localStorage:', error);
            }
        } else {
            alert('Notification permission was denied. Please enable notifications in your browser settings to receive class reminders.');
            // Ensure the setting remains false
            const updatedSettings = { ...settings, enableNotifications: false };
            setSettings(updatedSettings);
            try {
                localStorage.setItem('timetable-settings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error('Error saving settings to localStorage:', error);
            }
        }
    };

    const handleExport = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Exporting timetable...");
        
        const timetableData = {
            timeSlots: timetableService.getTimeSlots(),
            settings: settings
        };

        const dataStr = JSON.stringify(timetableData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'my-timetable.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (importedData.timeSlots) {
                    // Replace current timetable data with imported data
                    timetableService.clearTimetable();
                    importedData.timeSlots.forEach(slot => {
                        timetableService.addTimeSlot(slot);
                    });
                }
                
                if (importedData.settings) {
                    setSettings(importedData.settings);
                    localStorage.setItem('timetable-settings', JSON.stringify(importedData.settings));
                }
                
                alert('Timetable imported successfully!');
                window.location.reload(); // Refresh to show changes
            } catch (error) {
                console.error('Error importing timetable:', error);
                alert('Failed to import timetable. The file may be corrupted.');
            }
        };
        reader.readAsText(file);
    };

    const toggleSettings = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSettings(!showSettings);
    };
        
        return (
        <div className="settings-container">
            <button 
                className={`settings-toggle ${showSettings ? 'active' : ''}`}
                type="button"
                onClick={toggleSettings}
            >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            
            {showSettings && (
                <div className="settings-panel">
                    <h2>Timetable Settings</h2>
                    
                    <div className="settings-section">
                        <h3>Display Options</h3>
                        
                        <div className="setting-item">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="displayCode" 
                                    checked={settings.displayCode} 
                                    onChange={handleChange} 
                                />
                                Show class codes
                            </label>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="displayTeacher" 
                                    checked={settings.displayTeacher} 
                                    onChange={handleChange} 
                                />
                                Show teacher names
                            </label>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="displayRoom" 
                                    checked={settings.displayRoom} 
                                    onChange={handleChange} 
                                />
                                Show room numbers
                            </label>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="useFirstNameForTeachers" 
                                    checked={settings.useFirstNameForTeachers} 
                                    onChange={handleChange} 
                                />
                                Use first names for teachers
                            </label>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>Notifications</h3>
                        
                        <div className="setting-item">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="enableNotifications" 
                                    checked={settings.enableNotifications && isNotificationSupported() && Notification?.permission === 'granted'} 
                                    onChange={handleChange}
                                    disabled={!isNotificationSupported()}
                                />
                                Enable class notifications
                            </label>
                            {isNotificationSupported() ? (
                                Notification?.permission === 'granted' ? (
                                    <small className="setting-help-text">
                                        ✅ Notifications are enabled and working.
                                    </small>
                                ) : Notification?.permission === 'denied' ? (
                                    <small className="setting-help-text error">
                                        ❌ Notification permission was denied. Please enable notifications in your browser settings.
                                    </small>
                                ) : (
                                    <small className="setting-help-text">
                                        Get notifications before your classes start.
                                    </small>
                                )
                            ) : (
                                <small className="setting-help-text error">
                                    ❌ Notifications are not supported in your browser.
                                </small>
                            )}
                        </div>
                        
                        {settings.enableNotifications && (
                            <div className="setting-item">
                                <label>
                                    Notify me 
                                    <select 
                                        name="notificationTime" 
                                        value={settings.notificationTime} 
                                        onChange={handleChange}
                                    >
                                        <option value="5">5 minutes</option>
                                        <option value="10">10 minutes</option>
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                    </select>
                                    before class
                                </label>
                            </div>
                        )}
                    </div>
                    
                    <div className="settings-section">
                        <h3>Calendar Settings</h3>
                        
                        <div className="setting-item">
                            <label>
                                Week starts on:
                                <select 
                                    name="weekStartsOn" 
                                    value={settings.weekStartsOn} 
                                    onChange={handleChange}
                                >
                                    <option value="monday">Monday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                            </label>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                First week of year is:
                                <select 
                                    name="startWithWeek" 
                                    value={settings.startWithWeek} 
                                    onChange={handleChange}
                                >
                                    <option value="A">Week A</option>
                                    <option value="B">Week B</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>AI Parser Settings</h3>
                        
                        <div className="setting-item">
                            <label>
                                Preferred AI model:
                                <select 
                                    name="preferredAIModel" 
                                    value={settings.preferredAIModel} 
                                    onChange={handleChange}
                                >
                                    <option value="auto">Auto (try multiple models)</option>
                                    <option value="deepseek">DeepSeek models</option>
                                    <option value="qwen">Qwen models</option>
                                    <option value="anthropic">Claude (Anthropic)</option>
                                    <option value="google">Gemini (Google)</option>
                                    <option value="mistral">Mistral AI</option>
                                </select>
                            </label>
                            <small className="setting-help-text">
                                If timetable imports are failing, try a different model provider.
                            </small>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>Import/Export</h3>
                        
                        <div className="setting-actions">
                            <button 
                                type="button"
                                onClick={handleExport} 
                                className="export-button"
                            >
                                Export Timetable
                            </button>
                            
                            <div className="import-container">
                                <label className="import-label" role="button" tabIndex="0">
                                    Import Timetable
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        onChange={handleImport} 
                                        style={{ display: 'none' }}
                                        aria-label="Import Timetable"
                                    />
                                </label>
                            </div>
                        </div>
                        <p className="help-text">
                            Export your timetable to save it or share with friends.
                            Import a timetable someone has shared with you.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;