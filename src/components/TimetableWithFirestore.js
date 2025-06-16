// Example integration in your main Timetable component
import React, { useState, useEffect } from 'react';
import FirestoreTimetableService from '../services/firestoreTimetableService';
import { TimetableManager } from '../services/timetableManager';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TimetableWithFirestore = () => {
    const [timetableService, setTimetableService] = useState(null);
    const [timetableManager, setTimetableManager] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeServices = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
                const db = getFirestore();
                const firestoreService = new FirestoreTimetableService(db, user.uid);
                const localService = new TimetableService(); // Your existing service
                const manager = new TimetableManager(firestoreService, localService);
                
                setTimetableService(firestoreService);
                setTimetableManager(manager);
                
                // Perform initial migration if needed
                await manager.migrate();
                
                // Load timetable data
                const timetableData = await manager.loadTimetable();
                setTimeSlots(timetableData.timeSlots || []);
                
                setLoading(false);
            }
        };

        initializeServices();
    }, []);

    const saveTimetable = async (newTimeSlots) => {
        if (timetableManager) {
            try {
                await timetableManager.saveTimetable({
                    timeSlots: newTimeSlots,
                    currentDay: 1 // or whatever your current day is
                });
                setTimeSlots(newTimeSlots);
                console.log('✅ Timetable saved successfully');
            } catch (error) {
                console.error('❌ Error saving timetable:', error);
            }
        }
    };

    const saveTemplate = async (templateName, templateData) => {
        if (timetableService) {
            try {
                await timetableService.saveTemplate(templateName, templateData);
                console.log(`✅ Template "${templateName}" saved successfully`);
            } catch (error) {
                console.error('❌ Error saving template:', error);
            }
        }
    };

    if (loading) {
        return <div>Loading timetable...</div>;
    }

    return (
        <div>
            {/* Your existing timetable UI components */}
            <div className="timetable-grid">
                {timeSlots.map(slot => (
                    <div key={slot.id} className="time-slot">
                        {slot.subject}
                    </div>
                ))}
            </div>
            
            {/* Example buttons for testing */}
            <button onClick={() => saveTimetable([...timeSlots, { id: Date.now(), subject: 'Test', day: 1, period: 1 }])}>
                Add Test Slot
            </button>
            
            <button onClick={() => saveTemplate('My Template', timeSlots)}>
                Save as Template
            </button>
        </div>
    );
};

export default TimetableWithFirestore;
