import React, { useState } from 'react';
import '../styles/components/Tutorial.css';

const Tutorial = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to Premium Timetable! 🎓",
            content: "This tutorial will guide you through all the features to help you create and manage your perfect school timetable.",
            image: "📚",
            tips: ["Take your time to explore each feature", "You can access this tutorial anytime", "All your changes are saved automatically"]
        },
        {
            title: "Understanding the Timetable Layout 📅",
            content: "Your timetable is organized into days (1-10) and periods. Each cell represents a class period where you can add subjects, teachers, and room information.",
            image: "🗓️",
            tips: ["Days 1-5 are Week A (Monday-Friday)", "Days 6-10 are Week B (Monday-Friday)", "Current day is highlighted in blue"]
        },
        {
            title: "Switching Between Days 🔄",
            content: "Click on any Day button (1-10) to switch between different days. The current day based on your school's cycle is automatically highlighted.",
            image: "📆",
            tips: ["Today's day shows 'Today', 'Tomorrow', etc.", "Weekend days show countdown to next school day", "Your last viewed day is remembered"]
        },
        {
            title: "Edit Mode - Adding Classes ✏️",
            content: "Click 'Edit Mode' to start customizing your timetable. You can add new classes, edit existing ones, or remove classes you no longer need.",
            image: "📝",
            tips: ["Edit Mode shows '+ Add Class' buttons", "Click directly on any class to edit it", "Changes are saved automatically"]
        },
        {
            title: "Adding a New Class ➕",
            content: "In Edit Mode, click '+ Add Class' in any period. Fill in the subject name, teacher, room number, and subject code. All fields are optional.",
            image: "🎯",
            tips: ["Subject name is the most important field", "Teacher and room help with navigation", "Subject codes are useful for quick reference"]
        },
        {
            title: "Editing Existing Classes 🛠️",
            content: "Click on any existing class to edit its details. You can modify the subject, teacher, room, or completely remove the class.",
            image: "⚙️",
            tips: ["Changes appear immediately", "Use the 'Remove' button to delete classes", "Cancel to discard changes"]
        },
        {
            title: "Templates - Save Your Work 💾",
            content: "Templates let you save different timetable layouts. Use 'Save Template' to create backups or different semester schedules.",
            image: "📁",
            tips: ["Always save before major changes", "Create templates for different semesters", "The 'school' template is your default"]
        },
        {
            title: "Loading Templates 📂",
            content: "Use the dropdown menu to switch between saved templates. You can also delete custom templates (but not the default 'school' template).",
            image: "📋",
            tips: ["Templates include all your classes and settings", "Switching templates loads everything instantly", "Deleted templates cannot be recovered"]
        },
        {
            title: "Importing Timetables 📥",
            content: "Click 'Import' to bring in timetable data from text, AI parsing, or file uploads. The system will automatically organize your classes.",
            image: "📤",
            tips: ["Copy-paste from school websites or PDFs", "AI can parse messy timetable formats", "Imported data becomes a new template"]
        },
        {
            title: "AI Import Assistant 🤖",
            content: "Use AI to parse complex timetable formats. Just paste your raw timetable text and let the AI organize it into a proper schedule.",
            image: "🧠",
            tips: ["Works with most timetable formats", "Handles messy or unstructured data", "Review results before saving"]
        },
        {
            title: "Customizing Colors 🎨",
            content: "Click 'Colours' to personalize your timetable. Assign custom colors to subjects, adjust transparency, and create visual themes.",
            image: "🌈",
            tips: ["Each subject can have its own color", "Use similar colors for related subjects", "High contrast improves readability"]
        },
        {
            title: "Color Management 🎭",
            content: "The color system automatically assigns colors to new subjects. You can override these with your preferred colors and save custom themes.",
            image: "🎪",
            tips: ["Colors are saved per template", "Export/import color themes", "Reset to defaults anytime"]
        },
        {
            title: "Current Period Highlighting ⏰",
            content: "The system automatically highlights your current period based on the time of day. This helps you quickly see what class you should be in.",
            image: "⭐",
            tips: ["Updates automatically throughout the day", "Includes break periods (Recess/Lunch)", "Works with your school's schedule"]
        },
        {
            title: "Break Periods & Special Times 🍎",
            content: "Tutorial, Recess, Lunch, and After School periods are automatically managed. They appear when relevant based on the time of day.",
            image: "☕",
            tips: ["Break periods show/hide automatically", "Edit Mode always shows all periods", "Timing matches typical school schedules"]
        },
        {
            title: "Responsive Design 📱",
            content: "Your timetable works perfectly on phones, tablets, and computers. The layout adapts to your screen size for optimal viewing.",
            image: "📲",
            tips: ["Swipe or scroll to navigate on mobile", "Zoom in/out as needed", "Portrait mode works great on phones"]
        },
        {
            title: "Keyboard Shortcuts ⌨️",
            content: "Press 'E' to toggle Edit Mode quickly. Use Tab to navigate between fields when editing classes.",
            image: "⚡",
            tips: ["E = Toggle Edit Mode", "Tab = Next field", "Enter = Save changes", "Escape = Cancel editing"]
        },
        {
            title: "Data Safety & Backup 🔒",
            content: "All your data is saved locally in your browser and optionally synced to your account. Your timetables are always safe and accessible.",
            image: "🛡️",
            tips: ["Data saves automatically", "Templates persist between sessions", "Export timetables as backup files"]
        },
        {
            title: "Tips for Best Experience 💡",
            content: "Keep subject names short and clear. Use consistent naming for teachers and rooms. Regularly save templates as backups.",
            image: "🚀",
            tips: ["Short names display better", "Consistent formatting looks professional", "Regular backups prevent data loss"]
        },
        {
            title: "You're All Set! 🎉",
            content: "You now know how to use all the features of Premium Timetable. Start creating your perfect schedule and enjoy the organized school life!",
            image: "🏆",
            tips: ["Experiment with different layouts", "Share templates with friends", "Check back for new features"]
        }
    ];

    const nextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    const closeTutorial = () => {
        setCurrentStep(0);
        onClose();
    };

    if (!isOpen) return null;

    const step = tutorialSteps[currentStep];

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-modal">
                <div className="tutorial-header">
                    <h2>Tutorial</h2>
                    <button className="tutorial-close" onClick={closeTutorial}>
                        ✕
                    </button>
                </div>

                <div className="tutorial-content">
                    <div className="tutorial-step">
                        <div className="step-indicator">
                            Step {currentStep + 1} of {tutorialSteps.length}
                        </div>
                        
                        <div className="step-image">
                            <span className="step-emoji">{step.image}</span>
                        </div>
                        
                        <h3 className="step-title">{step.title}</h3>
                        
                        <div className="step-description">
                            <p>{step.content}</p>
                        </div>

                        {step.tips && (
                            <div className="step-tips">
                                <h4>💡 Pro Tips:</h4>
                                <ul>
                                    {step.tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="tutorial-navigation">
                    <div className="tutorial-dots">
                        {tutorialSteps.map((_, index) => (
                            <button
                                key={index}
                                className={`tutorial-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                onClick={() => goToStep(index)}
                                title={`Step ${index + 1}: ${tutorialSteps[index].title}`}
                            />
                        ))}
                    </div>

                    <div className="tutorial-buttons">
                        <button 
                            className="tutorial-btn tutorial-btn-secondary" 
                            onClick={prevStep}
                            disabled={currentStep === 0}
                        >
                            ← Previous
                        </button>

                        {currentStep === tutorialSteps.length - 1 ? (
                            <button 
                                className="tutorial-btn tutorial-btn-primary" 
                                onClick={closeTutorial}
                            >
                                Get Started! 🚀
                            </button>
                        ) : (
                            <button 
                                className="tutorial-btn tutorial-btn-primary" 
                                onClick={nextStep}
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>

                <div className="tutorial-progress">
                    <div 
                        className="tutorial-progress-bar" 
                        style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
