import React, { useState, useEffect } from 'react';
import '../styles/components/TutorialModal.css';

const TutorialModal = ({ isOpen, onClose, tutorialId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tutorialData, setTutorialData] = useState(null);

    // Tutorial content for each tutorial type
    const tutorials = {
        'getting-started': {
            title: 'Getting Started with Premium Timetable',
            steps: [
                {
                    title: 'Welcome to Premium Timetable!',
                    content: 'This tutorial will help you get started with using your timetable app. You\'ll learn the basics of navigation and viewing your schedule.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Day Navigation',
                    content: 'Use the day selector buttons at the top to switch between different school days. The current day is highlighted in blue.',
                    image: null,
                    highlight: '.day-selector'
                },
                {
                    title: 'Viewing Your Classes',
                    content: 'Your classes are displayed in a grid format. Each time slot shows the subject, teacher, room, and class code.',
                    image: null,
                    highlight: '.timetable'
                },
                {
                    title: 'Current Period Indicator',
                    content: 'During school hours, your current class will be highlighted with a special border to help you know where you should be.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Control Buttons',
                    content: 'Use the buttons at the top to switch between templates, enter edit mode, customize colors, and access help.',
                    image: null,
                    highlight: '.controls'
                }
            ]
        },
        'creating-timetable': {
            title: 'Creating Your Timetable',
            steps: [
                {
                    title: 'Enter Edit Mode',
                    content: 'Click the "Edit Mode" button to start creating or modifying your timetable.',
                    image: null,
                    highlight: '.edit-btn'
                },
                {
                    title: 'Add New Classes',
                    content: 'In edit mode, you\'ll see "+ Add Class" buttons in empty time slots. Click these to create new classes.',
                    image: null,
                    highlight: '.add-time-slot'
                },
                {
                    title: 'Edit Existing Classes',
                    content: 'Click on any existing class to edit its details including subject name, teacher, room, and class code.',
                    image: null,
                    highlight: '.time-slot'
                },
                {
                    title: 'Save Your Changes',
                    content: 'After making changes, click "View Mode" to save and see your updated timetable.',
                    image: null,
                    highlight: '.edit-btn'
                }
            ]
        },
        'importing-data': {
            title: 'Importing Timetable Data',
            steps: [
                {
                    title: 'Import Options',
                    content: 'Click the "Import" button to see different ways to add your timetable data.',
                    image: null,
                    highlight: '.import-button'
                },
                {
                    title: 'Text Import',
                    content: 'You can paste your timetable as plain text and the app will try to parse it automatically.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'AI Assistance',
                    content: 'Use AI to help extract timetable information from screenshots or complex text formats.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'File Upload',
                    content: 'Upload image files of your timetable and let the app extract the data for you.',
                    image: null,
                    highlight: null
                }
            ]
        },
        'customizing-colors': {
            title: 'Customizing Colors',
            steps: [
                {
                    title: 'Open Color Settings',
                    content: 'Click the "Colours" button to open the color customization panel.',
                    image: null,
                    highlight: '.color-legend-btn'
                },
                {
                    title: 'Subject Colors',
                    content: 'Each subject can have its own color. Click on a subject in the color panel to change its color.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Color Schemes',
                    content: 'Choose from preset color schemes or create your own custom palette.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Preview Changes',
                    content: 'Your color changes are applied immediately so you can see how they look on your timetable.',
                    image: null,
                    highlight: null
                }
            ]
        },
        'templates': {
            title: 'Using Templates',
            steps: [
                {
                    title: 'Template Selector',
                    content: 'Use the dropdown at the top to switch between different timetable templates.',
                    image: null,
                    highlight: '.template-selector'
                },
                {
                    title: 'Creating Templates',
                    content: 'Create new templates for different terms, subjects, or schedules using the template options.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Managing Templates',
                    content: 'You can rename, duplicate, or delete templates to keep your schedules organized.',
                    image: null,
                    highlight: null
                }
            ]
        },
        'notifications': {
            title: 'Setting Up Notifications',
            steps: [
                {
                    title: 'Browser Notifications',
                    content: 'Enable browser notifications to get reminders about upcoming classes.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Notification Timing',
                    content: 'Set how many minutes before class you want to be notified.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Practice Reminders',
                    content: 'Set up special reminders for classes that require preparation or practice.',
                    image: null,
                    highlight: null
                }
            ]
        }
    };

    useEffect(() => {
        if (isOpen && tutorialId) {
            setTutorialData(tutorials[tutorialId] || null);
            setCurrentStep(0);
        }
    }, [isOpen, tutorialId]);

    useEffect(() => {
        if (isOpen && tutorialData?.steps[currentStep]?.highlight) {
            const highlightElement = document.querySelector(tutorialData.steps[currentStep].highlight);
            if (highlightElement) {
                highlightElement.classList.add('tutorial-highlight');
                return () => {
                    highlightElement.classList.remove('tutorial-highlight');
                };
            }
        }
    }, [isOpen, currentStep, tutorialData]);

    const nextStep = () => {
        if (currentStep < (tutorialData?.steps.length - 1)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const closeTutorial = () => {
        // Remove any remaining highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        onClose();
    };

    if (!isOpen || !tutorialData) return null;

    const currentStepData = tutorialData.steps[currentStep];
    const progress = ((currentStep + 1) / tutorialData.steps.length) * 100;

    return (
        <div className="tutorial-modal-overlay" onClick={closeTutorial}>
            <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tutorial-header">
                    <h2>{tutorialData.title}</h2>
                    <button className="tutorial-close" onClick={closeTutorial}>×</button>
                </div>
                
                <div className="tutorial-progress">
                    <div className="tutorial-progress-bar">
                        <div 
                            className="tutorial-progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="tutorial-step-counter">
                        Step {currentStep + 1} of {tutorialData.steps.length}
                    </span>
                </div>

                <div className="tutorial-content">
                    <h3>{currentStepData.title}</h3>
                    <p>{currentStepData.content}</p>
                    
                    {currentStepData.image && (
                        <div className="tutorial-image">
                            <img src={currentStepData.image} alt={currentStepData.title} />
                        </div>
                    )}
                </div>

                <div className="tutorial-navigation">
                    <button 
                        className="tutorial-btn tutorial-btn-secondary" 
                        onClick={prevStep}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </button>
                    
                    <div className="tutorial-dots">
                        {tutorialData.steps.map((_, index) => (
                            <span 
                                key={index}
                                className={`tutorial-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(index)}
                            ></span>
                        ))}
                    </div>
                    
                    {currentStep < tutorialData.steps.length - 1 ? (
                        <button 
                            className="tutorial-btn tutorial-btn-primary" 
                            onClick={nextStep}
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            className="tutorial-btn tutorial-btn-primary" 
                            onClick={closeTutorial}
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
