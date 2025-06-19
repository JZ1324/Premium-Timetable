import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MobileDetector = ({ children, timeSlots, currentTemplate, templates, currentDay, onDayChange, editMode }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size and update mobile state
    useEffect(() => {
        const checkScreenSize = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ['mobile', 'iphone', 'ipod', 'android', 'blackberry', 'windows phone'];
            const isMobileAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
            const isSmallScreen = window.innerWidth <= 768;
            
            setIsMobile(isMobileAgent || isSmallScreen);
        };

        // Initial check
        checkScreenSize();

        // Add resize listener with debouncing
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(checkScreenSize, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // Save timetable data to localStorage for consistency
    useEffect(() => {
        if (timeSlots && timeSlots.length > 0) {
            const dataToSave = {
                timeSlots,
                currentTemplate,
                templates,
                currentDay,
                editMode,
                lastUpdated: Date.now()
            };
            localStorage.setItem('timetableData', JSON.stringify(dataToSave));
        }
    }, [timeSlots, currentTemplate, templates, currentDay, editMode]);

    // If mobile, render mobile UI using a portal to bypass desktop layout completely
    if (isMobile) {
        return (
            <>
                {/* Hide desktop content completely */}
                <div style={{ display: 'none' }}>
                    {children}
                </div>
                {/* Render mobile view using portal to document.body */}
                {createPortal(
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999999,
                        background: '#f8f9fa',
                        overflow: 'auto',
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}>
                        <MobileView 
                            timeSlots={timeSlots}
                            currentDay={currentDay}
                            onDayChange={onDayChange}
                            templates={templates}
                            currentTemplate={currentTemplate}
                        />
                    </div>,
                    document.body
                )}
            </>
        );
    }

    // If desktop, render desktop UI only
    return children;
};

// Mobile View Component
const MobileView = ({ timeSlots, currentDay, onDayChange, templates, currentTemplate }) => {
    const [selectedDay, setSelectedDay] = useState(currentDay || 1);
    const [currentWeek, setCurrentWeek] = useState('A');

    // Determine current school week (A or B)
    const getCurrentSchoolWeek = () => {
        const today = new Date();
        const savedSettings = localStorage.getItem('timetable-settings');
        let settings = { startWithWeek: 'B' };
        
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                if (parsedSettings.startWithWeek) {
                    settings.startWithWeek = parsedSettings.startWithWeek;
                }
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
        
        const target = new Date(today.valueOf());
        const dayNumber = (today.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNumber + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
        
        let isWeekA = weekNumber % 2 === 1;
        if (settings.startWithWeek === 'B') {
            isWeekA = !isWeekA;
        }
        
        return isWeekA ? 'A' : 'B';
    };

    // Initialize week on mount
    useEffect(() => {
        const detectedWeek = getCurrentSchoolWeek();
        const savedWeek = localStorage.getItem('mobile-selected-week');
        if (savedWeek && (savedWeek === 'A' || savedWeek === 'B')) {
            setCurrentWeek(savedWeek);
        } else {
            setCurrentWeek(detectedWeek);
        }
    }, []);

    const getCurrentWeekDays = (week) => {
        return week === 'A' ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
    };

    const switchWeek = (week) => {
        setCurrentWeek(week);
        const days = getCurrentWeekDays(week);
        setSelectedDay(days[0]);
        localStorage.setItem('mobile-selected-week', week);
    };

    const handleDayChange = (day) => {
        setSelectedDay(day);
        if (onDayChange) {
            onDayChange(day);
        }
    };

    // Standard periods structure
    const STANDARD_PERIODS = [
        { number: 1, name: 'Period 1' },
        { number: 2, name: 'Period 2' },
        { number: 'Tutorial', name: 'Tutorial' },
        { number: 'Recess', name: 'Recess', isBreak: true },
        { number: 3, name: 'Period 3' },
        { number: 4, name: 'Period 4' },
        { number: 'Lunch', name: 'Lunch', isBreak: true },
        { number: 5, name: 'Period 5' }
    ];

    // Check if break period should be shown
    const shouldShowBreakPeriod = (periodName) => {
        if (periodName !== 'Recess' && periodName !== 'Lunch') return true;
        
        const now = new Date();
        const day = now.getDay();
        if (day === 0 || day === 6) return false;
        
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        
        if (totalMinutes < 8 * 60 + 30 || totalMinutes > 16 * 60 + 30) return false;
        
        const breakPeriods = {
            'Recess': { start: 10 * 60 + 55, end: 11 * 60 + 25 },
            'Lunch': { start: 13 * 60 + 30, end: 14 * 60 + 25 }
        };
        
        const period = breakPeriods[periodName];
        const showBreakStart = period.start - 5;
        
        return totalMinutes >= showBreakStart && totalMinutes < period.end;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: 'auto',
            zIndex: 99999
        }}>
            {/* Enhanced Header with Glassmorphism */}
            <div style={{
                textAlign: 'center',
                padding: '30px 20px 25px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        marginRight: '12px',
                        fontSize: '20px'
                    }}>
                        📚
                    </div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '26px', 
                        fontWeight: '800',
                        background: 'linear-gradient(45deg, #ffffff, #f8fafc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        School Timetable
                    </h1>
                </div>
                <p style={{ 
                    margin: '0 0 20px 0', 
                    opacity: 0.9, 
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    📱 Mobile View
                </p>
                
                {/* Enhanced Week Toggle with Glass Effect */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    {['A', 'B'].map(week => (
                        <button
                            key={week}
                            onClick={() => switchWeek(week)}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: currentWeek === week 
                                    ? 'rgba(255, 255, 255, 0.25)' 
                                    : 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '700',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                minWidth: '85px',
                                transform: currentWeek === week ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                                boxShadow: currentWeek === week 
                                    ? '0 8px 25px rgba(0, 0, 0, 0.15)' 
                                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                                border: currentWeek === week ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.target.style.transform = currentWeek === week ? 'scale(1.05) translateY(-2px)' : 'scale(1)'}
                        >
                            Week {week}
                        </button>
                    ))}
                </div>
            </div>

            {/* Enhanced Content Container */}
            <div style={{ 
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, #f1f5f9 100%)',
                minHeight: 'calc(100vh - 140px)',
                padding: '0 0 20px 0'
            }}>
                {/* Enhanced Day Selector with Glassmorphism */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    margin: '20px 15px 25px 15px',
                    gap: '6px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '30px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    {getCurrentWeekDays(currentWeek).map(day => (
                        <button
                            key={day}
                            onClick={() => handleDayChange(day)}
                            style={{
                                padding: '14px 12px',
                                border: 'none',
                                background: selectedDay === day 
                                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                                    : 'transparent',
                                borderRadius: '22px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '700',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                flex: 1,
                                minWidth: '55px',
                                color: selectedDay === day ? 'white' : '#64748b',
                                transform: selectedDay === day ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                                boxShadow: selectedDay === day 
                                    ? '0 8px 25px rgba(99, 102, 241, 0.3)' 
                                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                textShadow: selectedDay === day ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                            onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
                            onTouchEnd={(e) => e.target.style.transform = selectedDay === day ? 'scale(1.05) translateY(-2px)' : 'scale(1)'}
                        >
                            Day {day}
                        </button>
                    ))}
                </div>

                {/* Timetable Content */}
                <div>
                    {timeSlots && timeSlots.length > 0 ? (
                        <div>
                            {STANDARD_PERIODS.map(period => {
                                if (period.isBreak && !shouldShowBreakPeriod(period.name)) {
                                    return null;
                                }
                                
                                const slot = timeSlots.find(s => 
                                    s.day === selectedDay && 
                                    (s.period === period.number || s.period === period.name)
                                );
                                
                                const isBreak = period.number === 'Recess' || period.number === 'Lunch';
                                const isTutorial = period.number === 'Tutorial';
                                
                                return (
                                    <div
                                        key={period.number}
                                        style={{
                                            padding: '20px',
                                            margin: '0 15px 16px 15px',
                                            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                            borderRadius: '20px',
                                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            borderLeft: isBreak 
                                                ? '6px solid #10b981' 
                                                : isTutorial 
                                                ? '6px solid #f59e0b' 
                                                : '6px solid #6366f1',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: 'translateY(0)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(2px) scale(0.98)'}
                                        onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginBottom: '12px' 
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <div style={{
                                                    background: isBreak 
                                                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                                                        : isTutorial 
                                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                                        : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    padding: '8px 10px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    {isBreak ? '🌅' : isTutorial ? '📖' : '📚'}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '19px', 
                                                    fontWeight: '800', 
                                                    color: '#1e293b',
                                                    letterSpacing: '-0.025em'
                                                }}>
                                                    {period.name}
                                                </div>
                                            </div>
                                            <div style={{ 
                                                fontSize: '13px', 
                                                color: '#64748b', 
                                                fontWeight: '600',
                                                background: 'rgba(100, 116, 139, 0.1)',
                                                padding: '6px 12px',
                                                borderRadius: '12px'
                                            }}>
                                                {slot && slot.startTime && slot.endTime ? 
                                                    `${slot.startTime} - ${slot.endTime}` :
                                                    period.number === 'Recess' ? '10:55am - 11:25am' :
                                                    period.number === 'Lunch' ? '1:30pm - 2:25pm' :
                                                    period.number === 'Tutorial' ? '10:45am - 10:55am' : ''
                                                }
                                            </div>
                                        </div>
                                        
                                        <div style={{ 
                                            fontSize: '17px', 
                                            fontWeight: '700', 
                                            color: '#0f172a', 
                                            marginBottom: '8px',
                                            letterSpacing: '-0.025em'
                                        }}>
                                            {slot && slot.subject && slot.subject !== 'Free Period' ? 
                                                slot.subject :
                                                period.number === 'Recess' ? '☕ Recess Break' :
                                                period.number === 'Lunch' ? '🍽️ Lunch Break' :
                                                period.number === 'Tutorial' ? '📖 Tutorial Time' : '📝 Free Period'
                                            }
                                        </div>
                                        
                                        {slot && slot.subject && slot.subject !== 'Free Period' && (
                                            <div style={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: '8px', 
                                                marginTop: '12px' 
                                            }}>
                                                {slot.code && (
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                    }}>
                                                        📚 {slot.code}
                                                    </div>
                                                )}
                                                {slot.room && (
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                                    }}>
                                                        🏛️ Room {slot.room}
                                                    </div>
                                                )}
                                                {slot.teacher && (
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                    }}>
                                                        👨‍🏫 {slot.teacher}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            margin: '20px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '16px'
                            }}>
                                📚
                            </div>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1e293b',
                                marginBottom: '8px'
                            }}>
                                No Timetable Data
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                fontWeight: '500'
                            }}>
                                Please import your timetable from the desktop version
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileDetector;