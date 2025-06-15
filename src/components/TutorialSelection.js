import React, { useState } from 'react';
import TutorialModal from './TutorialModal';
import '../styles/components/TutorialSelection.css';

const TutorialSelection = ({ isOpen, onClose }) => {
    const [activeTutorial, setActiveTutorial] = useState(null);

    const tutorials = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            description: 'Learn the basics of using the timetable',
            icon: '🚀',
            duration: '3 mins',
            difficulty: 'Beginner'
        },
        {
            id: 'creating-timetable',
            title: 'Creating Your Timetable',
            description: 'Add and edit classes in your timetable',
            icon: '📅',
            duration: '5 mins',
            difficulty: 'Beginner'
        },
        {
            id: 'importing-data',
            title: 'Importing Timetable Data',
            description: 'Import from text, files, or AI assistance',
            icon: '📥',
            duration: '4 mins',
            difficulty: 'Intermediate'
        },
        {
            id: 'customizing-colors',
            title: 'Customizing Colors',
            description: 'Personalize your timetable with custom colors',
            icon: '🎨',
            duration: '3 mins',
            difficulty: 'Beginner'
        },
        {
            id: 'templates',
            title: 'Using Templates',
            description: 'Save and manage multiple timetable templates',
            icon: '📋',
            duration: '4 mins',
            difficulty: 'Intermediate'
        },
        {
            id: 'notifications',
            title: 'Setting Up Notifications',
            description: 'Get reminders for upcoming classes',
            icon: '🔔',
            duration: '3 mins',
            difficulty: 'Intermediate'
        },
        {
            id: 'practice-reminders',
            title: 'Practice Reminders',
            description: 'Set reminders for practice sessions',
            icon: '⏰',
            duration: '3 mins',
            difficulty: 'Intermediate'
        },
        {
            id: 'advanced-features',
            title: 'Advanced Features',
            description: 'Explore all the advanced functionality',
            icon: '⚡',
            duration: '6 mins',
            difficulty: 'Advanced'
        }
    ];

    const startTutorial = (tutorialId) => {
        setActiveTutorial(tutorialId);
    };

    const closeTutorial = () => {
        setActiveTutorial(null);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return '#4caf50';
            case 'Intermediate': return '#ff9800';
            case 'Advanced': return '#f44336';
            default: return '#666';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="tutorial-selection-overlay" onClick={onClose}>
                <div className="tutorial-selection-modal" onClick={e => e.stopPropagation()}>
                    <div className="tutorial-selection-header">
                        <h2>📚 Choose Your Tutorial</h2>
                        <button className="tutorial-close-btn" onClick={onClose}>×</button>
                    </div>
                    
                    <div className="tutorial-selection-content">
                        <p className="tutorial-intro">
                            Select a tutorial to learn how to use different features of the timetable app:
                        </p>
                        
                        <div className="tutorials-grid">
                            {tutorials.map(tutorial => (
                                <div 
                                    key={tutorial.id} 
                                    className="tutorial-card"
                                    onClick={() => startTutorial(tutorial.id)}
                                >
                                    <div className="tutorial-icon">{tutorial.icon}</div>
                                    <div className="tutorial-info">
                                        <h3>{tutorial.title}</h3>
                                        <p>{tutorial.description}</p>
                                        <div className="tutorial-meta">
                                            <span className="tutorial-duration">⏱️ {tutorial.duration}</span>
                                            <span 
                                                className="tutorial-difficulty"
                                                style={{ color: getDifficultyColor(tutorial.difficulty) }}
                                            >
                                                📊 {tutorial.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="tutorial-arrow">→</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="tutorial-selection-footer">
                            <button className="tutorial-btn secondary" onClick={onClose}>
                                Maybe Later
                            </button>
                            <button 
                                className="tutorial-btn primary" 
                                onClick={() => startTutorial('getting-started')}
                            >
                                🚀 Start with Basics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Show the actual tutorial modal when a tutorial is selected */}
            {activeTutorial && (
                <TutorialModal 
                    isOpen={true}
                    tutorialId={activeTutorial}
                    onClose={closeTutorial}
                />
            )}
        </>
    );
};

export default TutorialSelection;
