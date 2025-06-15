import React, { useState, useEffect } from 'react';
import '../styles/components/TutorialModal.css';

const TutorialModal = ({ isOpen, onClose, tutorialId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tutorialData, setTutorialData] = useState(null);

    // Tutorial content for each tutorial type
    const tutorials = {
        'getting-started': {
            title: '🚀 Getting Started with Premium Timetable',
            steps: [
                {
                    title: 'Welcome to Premium Timetable!',
                    content: 'Welcome! This interactive tutorial will guide you through using your timetable app. You\'ll learn navigation, viewing schedules, and basic features. Let\'s start!',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Day Navigation',
                    content: 'These buttons let you switch between different school days (Day 1, Day 2, etc.). The current day is highlighted. Try clicking on different days to see how the timetable changes.',
                    image: null,
                    highlight: '.day-selector'
                },
                {
                    title: 'Your Timetable Grid',
                    content: 'This is your main timetable view. Each cell shows a class with subject name, teacher, room, and class code. The time periods are shown on the left.',
                    image: null,
                    highlight: '.timetable'
                },
                {
                    title: 'Current Period Indicator',
                    content: 'During school hours, your current class will glow with a special highlight so you always know where you should be right now.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Control Panel',
                    content: 'These buttons give you access to key features: Templates, Edit Mode, Colors, Import, and Tutorials. We\'ll explore these in other tutorials.',
                    image: null,
                    highlight: '.controls'
                },
                {
                    title: 'Ready to Explore!',
                    content: 'Great! You now know the basics. Try the other tutorials to learn about creating timetables, importing data, and customizing colors. Happy scheduling!',
                    image: null,
                    highlight: null
                }
            ]
        },
        'creating-timetable': {
            title: '📅 Creating Your Timetable',
            steps: [
                {
                    title: 'Let\'s Create Your Timetable',
                    content: 'Ready to build your perfect timetable? This tutorial will show you how to add and edit classes step by step.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Enter Edit Mode',
                    content: 'First, click the "Edit Mode" button to unlock editing features. This will reveal "Add Class" buttons in empty slots and make existing classes editable.',
                    image: null,
                    highlight: '.edit-btn'
                },
                {
                    title: 'Add New Classes',
                    content: 'In edit mode, empty time slots show "Add Class" buttons. Click any of these to create a new class in that time period.',
                    image: null,
                    highlight: '.add-time-slot'
                },
                {
                    title: 'Edit Class Details',
                    content: 'Click on any existing class to edit its details. You can change the subject name, teacher, room number, and class code.',
                    image: null,
                    highlight: '.time-slot'
                },
                {
                    title: 'Save Your Work',
                    content: 'When you\'re done editing, click "View Mode" to save your changes and return to the normal view. Your timetable is automatically saved!',
                    image: null,
                    highlight: '.edit-btn'
                }
            ]
        },
        'importing-data': {
            title: '📥 Importing Timetable Data',
            steps: [
                {
                    title: 'Import Your Existing Timetable',
                    content: 'Already have a timetable from your school? No need to recreate it! This tutorial shows you how to import your existing schedule quickly.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Open Import Options',
                    content: 'Click the "Import" button to see all the different ways you can bring your timetable data into the app.',
                    image: null,
                    highlight: '.import-button'
                },
                {
                    title: 'Text Import Method',
                    content: 'Got your timetable as text? Just copy and paste it! The app will automatically try to understand the format and extract your classes.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'AI-Powered Parsing',
                    content: 'For complex formats or messy data, use the AI parser. It can understand screenshots, PDFs, and even handwritten schedules!',
                    image: null,
                    highlight: null
                },
                {
                    title: 'File Upload Option',
                    content: 'Have an image of your timetable? Upload it directly and let the smart AI extract all your class information automatically.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Import Complete!',
                    content: 'Once imported, review the extracted data and make any adjustments needed. Your timetable will be ready in seconds!',
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
        'keyboard-shortcuts': {
            title: '⌨️ Keyboard Shortcuts',
            steps: [
                {
                    title: 'Speed Up Your Workflow',
                    content: 'Learn these handy keyboard shortcuts to navigate and use your timetable more efficiently!',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Quick Day Navigation',
                    content: 'Press 1, 2, 3, 4, etc. to quickly switch between different timetable days without clicking.',
                    image: null,
                    highlight: '.day-selector'
                },
                {
                    title: 'Edit Mode Toggle',
                    content: 'Press "E" to quickly toggle between Edit Mode and View Mode.',
                    image: null,
                    highlight: '.edit-btn'
                },
                {
                    title: 'Escape to Cancel',
                    content: 'Press "Escape" to cancel any form or close any modal dialog quickly.',
                    image: null,
                    highlight: null
                }
            ]
        },
        'mobile-tips': {
            title: '📱 Mobile Usage Tips',
            steps: [
                {
                    title: 'Mobile-Friendly Design',
                    content: 'Your timetable works great on phones and tablets! Here are some tips for the best mobile experience.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Touch Gestures',
                    content: 'Tap to select, long-press for options, and swipe to navigate between days on mobile devices.',
                    image: null,
                    highlight: '.timetable'
                },
                {
                    title: 'Mobile Editing',
                    content: 'In edit mode on mobile, forms are optimized for touch input with larger buttons and better spacing.',
                    image: null,
                    highlight: null
                },
                {
                    title: 'Add to Home Screen',
                    content: 'For the best experience, add this app to your phone\'s home screen for quick access!',
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
            // Remove previous highlights
            document.querySelectorAll('.tutorial-highlight').forEach(el => {
                el.classList.remove('tutorial-highlight');
            });
            
            // Add new highlight
            const highlightElement = document.querySelector(tutorialData.steps[currentStep].highlight);
            if (highlightElement) {
                highlightElement.classList.add('tutorial-highlight');
                
                // Scroll element into view
                highlightElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
                
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
