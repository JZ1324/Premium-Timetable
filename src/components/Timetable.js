import React, { useState, useEffect } from 'react';
import TimeSlot from './TimeSlot';
import timetableService from '../services/timetableService';

const Timetable = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [currentTemplate, setCurrentTemplate] = useState('');
    const [currentDay, setCurrentDay] = useState(1);
    const [editMode, setEditMode] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [displaySettings, setDisplaySettings] = useState({
        displayCode: true,
        displayTeacher: true,
        displayRoom: true,
        useFirstNameForTeachers: false
    });

    useEffect(() => {
        // Load templates on component mount
        const templateNames = timetableService.getTemplateNames();
        setTemplates(templateNames);
        
        // Load the school template by default
        if (templateNames.includes('school')) {
            loadTemplate('school');
        }

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
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
    }, []);

    const loadTemplate = (templateName) => {
        timetableService.loadTemplate(templateName);
        setTimeSlots(timetableService.getTimeSlots());
        setCurrentTemplate(templateName);
    };

    const saveTemplate = () => {
        if (newTemplateName.trim()) {
            timetableService.saveAsTemplate(newTemplateName);
            setTemplates(timetableService.getTemplateNames());
            setNewTemplateName('');
            setCurrentTemplate(newTemplateName);
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
            timetableService.editTimeSlot(index, updatedSlot);
            const updatedSlots = [...timeSlots];
            updatedSlots[index] = updatedSlot;
            setTimeSlots(updatedSlots);
        }
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
    };

    // Get all days from 1 to 10
    const days = Array.from({ length: 10 }, (_, i) => i + 1);

    // Get all periods for the selected day
    const getPeriods = () => {
        const periods = ['1', '2', 'Tutorial', '3', '4', '5', 'After School'];
        return periods;
    };

    // Filter slots by day and period
    const filterSlots = (day, period) => {
        return timeSlots.filter(slot => 
            slot.day === day && 
            String(slot.period) === String(period)
        );
    };

    return (
        <div className="timetable-container">
            <div className="timetable-header">
                <h2>School Timetable</h2>
                
                <div className="template-controls">
                    <select 
                        value={currentTemplate} 
                        onChange={(e) => loadTemplate(e.target.value)}
                    >
                        <option value="">Select Template</option>
                        {templates.map(template => (
                            <option key={template} value={template}>
                                {template.charAt(0).toUpperCase() + template.slice(1)}
                            </option>
                        ))}
                    </select>
                    
                    <div className="save-template">
                        <input 
                            type="text" 
                            placeholder="New Template Name" 
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                        <button onClick={saveTemplate}>Save As</button>
                    </div>
                    
                    <button 
                        className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Exit Edit Mode' : 'Edit Timetable'}
                    </button>
                </div>
                
                <div className="day-selector">
                    {days.map(day => (
                        <button 
                            key={day} 
                            className={currentDay === day ? 'active' : ''}
                            onClick={() => setCurrentDay(day)}
                        >
                            Day {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="timetable">
                <div className="periods-column">
                    {getPeriods().map(period => (
                        <div key={period} className="period-label">
                            <span>{period}</span>
                            {period === '1' && <span className="time">8:35am–9:35am</span>}
                            {period === '2' && <span className="time">9:40am–10:40am</span>}
                            {period === 'Tutorial' && <span className="time">10:45am–10:55am</span>}
                            {period === '3' && <span className="time">11:25am–12:25pm</span>}
                            {period === '4' && <span className="time">12:30pm–1:30pm</span>}
                            {period === '5' && <span className="time">2:25pm–3:25pm</span>}
                            {period === 'After School' && <span className="time">3:30pm–4:30pm</span>}
                        </div>
                    ))}
                </div>
                
                <div className="day-column">
                    {getPeriods().map(period => (
                        <div key={period} className="period-row">
                            {filterSlots(currentDay, period).map(slot => (
                                <TimeSlot
                                    key={slot.id || `${slot.day}-${slot.period}`}
                                    slot={slot}
                                    onUpdate={updateTimeSlot}
                                    onRemove={removeTimeSlot}
                                    displaySettings={displaySettings}
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
                                                          period === '2' ? '9:40am' :
                                                          period === 'Tutorial' ? '10:45am' :
                                                          period === '3' ? '11:25am' :
                                                          period === '4' ? '12:30pm' :
                                                          period === '5' ? '2:25pm' : '3:30pm',
                                                endTime: period === '1' ? '9:35am' :
                                                         period === '2' ? '10:40am' :
                                                         period === 'Tutorial' ? '10:55am' :
                                                         period === '3' ? '12:25pm' :
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timetable;