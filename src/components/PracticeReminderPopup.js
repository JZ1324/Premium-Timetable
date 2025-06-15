import React, { useEffect, useRef } from 'react';
import '../styles/components/PracticeReminderPopup.css';

const PracticeReminderPopup = ({ 
    practiceData, 
    onClose, 
    onShowLater 
}) => {
    const modalRef = useRef(null);

    // Don't render if no practice data
    if (!practiceData) {
        return null;
    }

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onShowLater(practiceData.id);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [practiceData.id, onShowLater]);

    // Prevent background click from closing
    const handleBackgroundClick = (e) => {
        if (e.target === modalRef.current) {
            // Don't close on background click - require explicit action
        }
    };

    const getDayName = (day) => {
        const dayNames = {
            1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday',
            6: 'Monday', 7: 'Tuesday', 8: 'Wednesday', 9: 'Thursday', 10: 'Friday'
        };
        return dayNames[day] || `Day ${day}`;
    };

    return (
        <div 
            className="practice-reminder-overlay" 
            ref={modalRef}
            onClick={handleBackgroundClick}
        >
            <div className="practice-reminder-content">
                <div className="practice-reminder-header">
                    <div className="reminder-icon">🏃‍♂️</div>
                    <h2>Practice Reminder</h2>
                </div>
                
                <div className="practice-reminder-body">
                    <div className="reminder-subject">
                        <h3>{practiceData.subject}</h3>
                        <p className="reminder-period">Period {practiceData.period}</p>
                    </div>
                    
                    <div className="reminder-details">
                        <div className="detail-item">
                            <span className="detail-label">Tomorrow:</span>
                            <span className="detail-value">{getDayName(practiceData.day)}</span>
                        </div>
                        
                        <div className="detail-item">
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{practiceData.time}</span>
                        </div>
                        
                        {practiceData.room && (
                            <div className="detail-item">
                                <span className="detail-label">Room:</span>
                                <span className="detail-value">{practiceData.room}</span>
                            </div>
                        )}
                        
                        {practiceData.teacher && (
                            <div className="detail-item">
                                <span className="detail-label">Teacher:</span>
                                <span className="detail-value">{practiceData.teacher}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="reminder-message">
                        <p>Don't forget to prepare for your practice session tomorrow!</p>
                        <p className="reminder-note">
                            Make sure you have all the materials you need and review any relevant content.
                        </p>
                    </div>
                </div>
                
                <div className="practice-reminder-actions">
                    <button 
                        className="reminder-btn secondary"
                        onClick={() => onShowLater(practiceData.id)}
                    >
                        Remind Me Later
                    </button>
                    
                    <button 
                        className="reminder-btn primary"
                        onClick={() => onClose(practiceData.id, false)}
                    >
                        Got It, Thanks!
                    </button>
                </div>
                
                <div className="reminder-footer">
                    <p>This reminder won't show again today unless you choose "Remind Me Later"</p>
                </div>
            </div>
        </div>
    );
};

export default PracticeReminderPopup;
