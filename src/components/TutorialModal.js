import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/TutorialModal.css';

const TutorialModal = ({ isOpen, onClose, tutorialId, onBackToTutorials }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tutorialData, setTutorialData] = useState(null);
    const [isWaitingForClick, setIsWaitingForClick] = useState(false);
    const [stepCompleted, setStepCompleted] = useState(false);
    const [autoPlayMode, setAutoPlayMode] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoPlayTimer, setAutoPlayTimer] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [isFullyAutomatic, setIsFullyAutomatic] = useState(false);
    const [autoCloseCountdown, setAutoCloseCountdown] = useState(0);
    const clickListenerRef = useRef(null);
    const autoPlayTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const autoCloseTimerRef = useRef(null);

    // Tutorial content for each tutorial type
    const tutorials = {
        'getting-started': {
            title: '🚀 Getting Started with Premium Timetable',
            steps: [
                {
                    title: 'Welcome to Premium Timetable!',
                    content: 'Welcome! This interactive tutorial will guide you through using your timetable app. You\'ll learn navigation, viewing schedules, and basic features. Let\'s start!',
                    image: null,
                    highlight: null,
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Day Navigation',
                    content: 'Let\'s try switching between different school days. Click on "Day 2" to see how the timetable changes for different days.',
                    image: null,
                    highlight: '.day-selector',
                    interactive: true,
                    clickTarget: '.day-button:nth-child(2)',
                    instruction: 'Click on the "Day 2" button'
                },
                {
                    title: 'Great! You Switched Days',
                    content: 'Perfect! You can see how each day has a different schedule. Now click on "Day 1" to go back to the first day.',
                    image: null,
                    highlight: '.day-selector',
                    interactive: true,
                    clickTarget: '.day-button:nth-child(1)',
                    instruction: 'Click on the "Day 1" button'
                },
                {
                    title: 'Your Timetable Grid',
                    content: 'This is your main timetable view. Each cell shows a class with subject name, teacher, room, and class code. The time periods are shown on the left.',
                    image: null,
                    highlight: '.timetable',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Try Edit Mode',
                    content: 'Now let\'s try editing your timetable. Click the "Edit Mode" button to unlock editing features.',
                    image: null,
                    highlight: '.edit-mode-toggle',
                    interactive: true,
                    clickTarget: '.edit-mode-toggle',
                    instruction: 'Click the "Edit Mode" button'
                },
                {
                    title: 'Exit Edit Mode',
                    content: 'Great! You can see the editing options now. Click "View Mode" to return to the normal view.',
                    image: null,
                    highlight: '.edit-mode-toggle',
                    interactive: true,
                    clickTarget: '.edit-mode-toggle',
                    instruction: 'Click the "View Mode" button'
                },
                {
                    title: 'Control Panel',
                    content: 'These buttons give you access to key features: Templates, Edit Mode, Colors, Import, and more. Try the other tutorials to learn about each feature!',
                    image: null,
                    highlight: '.template-controls',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Tutorial Complete!',
                    content: 'Excellent! You now know the basics of navigating your timetable. Try the other tutorials to learn about creating timetables, importing data, and customizing colors. Happy scheduling!',
                    image: null,
                    highlight: null,
                    interactive: false,
                    clickTarget: null
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
                    highlight: null,
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Enter Edit Mode',
                    content: 'First, click the "Edit Mode" button to unlock editing features. This will reveal "Add Class" buttons in empty slots.',
                    image: null,
                    highlight: '.edit-mode-toggle',
                    interactive: true,
                    clickTarget: '.edit-mode-toggle',
                    instruction: 'Click the "Edit Mode" button'
                },
                {
                    title: 'Add Your First Class',
                    content: 'Perfect! Now you can see "Add Class" buttons in empty time slots. Click the "Add Class" button in Period 1 to create your first class.',
                    image: null,
                    highlight: '.add-time-slot',
                    interactive: true,
                    clickTarget: '.add-time-slot button',
                    instruction: 'Click any "Add Class" button'
                },
                {
                    title: 'Fill in Class Details',
                    content: 'Great! A form appeared. Fill in the subject name and other details, then click "Save" to create your class.',
                    image: null,
                    highlight: '.time-slot-edit-form',
                    interactive: true,
                    clickTarget: '.form-actions .save-btn',
                    instruction: 'Fill in the form and click "Save"'
                },
                {
                    title: 'Edit Existing Classes',
                    content: 'Excellent! You created your first class. Now click on any existing class to edit its details.',
                    image: null,
                    highlight: '.time-slot',
                    interactive: true,
                    clickTarget: '.time-slot',
                    instruction: 'Click on any class to edit it'
                },
                {
                    title: 'Return to View Mode',
                    content: 'Perfect! When you\'re done editing, click "View Mode" to save your changes and return to the normal view.',
                    image: null,
                    highlight: '.edit-mode-toggle',
                    interactive: true,
                    clickTarget: '.edit-mode-toggle',
                    instruction: 'Click "View Mode" to finish'
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
                    highlight: null,
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Open Import Options',
                    content: 'Click the "Import" button to see all the different ways you can bring your timetable data into the app.',
                    image: null,
                    highlight: '.import-button',
                    interactive: true,
                    clickTarget: '.import-button',
                    instruction: 'Click the "Import" button'
                },
                {
                    title: 'Import Methods Available',
                    content: 'Great! Now you can see the import options. You can import from text, upload files, or use AI-powered parsing for complex formats.',
                    image: null,
                    highlight: '.import-modal',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Text Import Method',
                    content: 'The text import method is great when you have your timetable as text. Just copy and paste it and the app will try to understand the format automatically.',
                    image: null,
                    highlight: '.text-import-section',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'AI-Powered Parsing',
                    content: 'For complex formats or messy data, use the AI parser. It can understand screenshots, PDFs, and even handwritten schedules!',
                    image: null,
                    highlight: '.ai-import-section',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Close Import Panel',
                    content: 'Let\'s close the import panel for now. You can always come back to it when you have data to import.',
                    image: null,
                    highlight: '.import-modal .close-btn',
                    interactive: true,
                    clickTarget: '.import-modal .close-btn, .modal-overlay',
                    instruction: 'Click outside the modal or the close button to close it'
                }
            ]
        },
        'customizing-colors': {
            title: '🎨 Customizing Colors',
            steps: [
                {
                    title: 'Open Color Settings',
                    content: 'Click the "Colours" button to open the color customization panel.',
                    image: null,
                    highlight: '.color-legend-btn',
                    interactive: true,
                    clickTarget: '.color-legend-btn',
                    instruction: 'Click the "Colours" button'
                },
                {
                    title: 'Subject Colors',
                    content: 'Each subject can have its own color. The color panel shows all your subjects with their current colors.',
                    image: null,
                    highlight: '.color-legend',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Change a Subject Color',
                    content: 'Try clicking on any subject color to change it. This will open a color picker.',
                    image: null,
                    highlight: '.color-legend .subject-color',
                    interactive: true,
                    clickTarget: '.color-legend .subject-color:first-child',
                    instruction: 'Click on any subject color'
                },
                {
                    title: 'Color Schemes',
                    content: 'You can choose from preset color schemes or create your own custom palette. Changes are applied immediately to your timetable.',
                    image: null,
                    highlight: '.color-legend',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Close Color Panel',
                    content: 'When you\'re done customizing colors, click the "Colours" button again to close the panel.',
                    image: null,
                    highlight: '.color-legend-btn',
                    interactive: true,
                    clickTarget: '.color-legend-btn',
                    instruction: 'Click the "Colours" button to close'
                }
            ]
        },
        'templates': {
            title: '📋 Using Templates',
            steps: [
                {
                    title: 'Template Selector',
                    content: 'Use the dropdown at the top to switch between different timetable templates and manage your schedules.',
                    image: null,
                    highlight: '.template-selector',
                    interactive: true,
                    clickTarget: '.template-selector select',
                    instruction: 'Click on the template dropdown'
                },
                {
                    title: 'Creating New Templates',
                    content: 'You can create new templates for different terms, subjects, or schedules. Each template stores a complete timetable configuration.',
                    image: null,
                    highlight: '.template-controls',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Template Management',
                    content: 'Use the template controls to rename, duplicate, or delete templates. This helps you keep your schedules organized across different periods.',
                    image: null,
                    highlight: '.template-controls',
                    interactive: false,
                    clickTarget: null
                },
                {
                    title: 'Switching Templates',
                    content: 'Let\'s try switching back to the original template. Click on the dropdown again and select the first template.',
                    image: null,
                    highlight: '.template-selector',
                    interactive: true,
                    clickTarget: '.template-selector select',
                    instruction: 'Click the dropdown and select the first template'
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
        if (isOpen && tutorialData?.steps[currentStep]) {
            const currentStepData = tutorialData.steps[currentStep];
            
            // Remove previous highlights
            document.querySelectorAll('.tutorial-highlight').forEach(el => {
                el.classList.remove('tutorial-highlight');
            });
            
            // Remove previous overlay
            const existingOverlay = document.querySelector('.tutorial-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Add new highlight if specified
            if (currentStepData.highlight) {
                const highlightElement = document.querySelector(currentStepData.highlight);
                if (highlightElement) {
                    highlightElement.classList.add('tutorial-highlight');
                    
                    // Scroll element into view
                    highlightElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                }
            }
            
            // If this is an interactive step, set up click detection
            if (currentStepData.interactive && currentStepData.clickTarget) {
                setIsWaitingForClick(true);
                setStepCompleted(false);
                
                // Remove existing click listener
                if (clickListenerRef.current) {
                    document.removeEventListener('click', clickListenerRef.current, false);
                }
                
                // Create new click listener that only detects correct clicks
                clickListenerRef.current = (event) => {
                    const targetElement = document.querySelector(currentStepData.clickTarget);
                    
                    // Check if the clicked element matches our target
                    if (targetElement && (
                        event.target === targetElement || 
                        targetElement.contains(event.target) ||
                        event.target.closest(currentStepData.clickTarget)
                    )) {
                        // Don't prevent the default behavior - let the click work normally
                        console.log('Correct element clicked, advancing tutorial automatically');
                        
                        // Show a brief completion indicator
                        const completionIndicator = document.createElement('div');
                        completionIndicator.className = 'tutorial-completion-checkmark';
                        completionIndicator.innerHTML = '✓ Task Complete!';
                        completionIndicator.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 390px;
                            transform: translateY(0);
                            background: #4caf50;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 14px;
                            font-weight: bold;                            z-index: 10001;
                            animation: tutorial-completion-appear 0.5s ease forwards;
                        `;
                        
                        // Add checkmark animation CSS if not already added
                        if (!document.getElementById('tutorial-checkmark-styles')) {
                            const style = document.createElement('style');
                            style.id = 'tutorial-checkmark-styles';
                            style.textContent = `
                                @keyframes tutorial-completion-appear {
                                    0% { opacity: 0; transform: translateY(-10px); }
                                    100% { opacity: 1; transform: translateY(0); }
                                }
                            `;
                            document.head.appendChild(style);
                        }
                        
                        document.body.appendChild(completionIndicator);
                        
                        // Mark step as no longer waiting
                        setIsWaitingForClick(false);
                        
                        // Auto-advance to next step after showing completion
                        setTimeout(() => {
                            // Remove completion indicator
                            if (completionIndicator.parentNode) {
                                completionIndicator.parentNode.removeChild(completionIndicator);
                            }
                            
                            // Advance to next step
                            nextStep();
                        }, 1500); // Show completion for 1.5 seconds then advance
                    }
                    // For wrong clicks, do nothing - let them work normally
                    // Users can still interact with other elements freely
                };
                
                // Add click listener with capture: false to not interfere with normal clicks
                document.addEventListener('click', clickListenerRef.current, false);
                
            } else {
                setIsWaitingForClick(false);
                setStepCompleted(false);
            }
        }
        
        return () => {
            // Cleanup
            if (clickListenerRef.current) {
                document.removeEventListener('click', clickListenerRef.current, false);
            }
        };
    }, [isOpen, currentStep, tutorialData]);

    // Comprehensive auto-play system - automatically progresses through all steps
    useEffect(() => {
        if (autoPlayMode && tutorialData && isOpen && !isAutoPlaying) {
            // Clear any existing timers
            if (autoPlayTimerRef.current) {
                clearTimeout(autoPlayTimerRef.current);
            }
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
            
            const currentStepData = tutorialData.steps[currentStep];
            
            // Only proceed if we're not at the last step
            if (currentStep < tutorialData.steps.length - 1) {
                // Set timing - interactive steps get more time to be visible
                const delay = currentStepData?.interactive ? 4000 : 3000;
                let timeLeft = Math.ceil(delay / 1000);
                setCountdown(timeLeft);
                
                // Start countdown timer
                countdownTimerRef.current = setInterval(() => {
                    timeLeft--;
                    setCountdown(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(countdownTimerRef.current);
                        setCountdown(0);
                    }
                }, 1000);
                
                // Set up the main auto-play timer
                autoPlayTimerRef.current = setTimeout(() => {
                    if (currentStepData?.interactive && currentStepData?.clickTarget) {
                        // For interactive steps, perform the action automatically
                        console.log('Auto-play: Performing action for interactive step', currentStep);
                        performAutoAction(currentStepData.clickTarget);
                    } else {
                        // For non-interactive steps, just advance
                        console.log('Auto-play: Advancing from non-interactive step', currentStep);
                        setCurrentStep(prev => prev + 1);
                        setStepCompleted(false);
                    }
                }, delay);
            } else {
                // We're at the last step, clear countdown
                setCountdown(0);
            }
        } else {
            // Reset countdown when not in auto-play mode
            setCountdown(0);
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
        }
        
        return () => {
            if (autoPlayTimerRef.current) {
                clearTimeout(autoPlayTimerRef.current);
            }
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
        };
    }, [autoPlayMode, currentStep, tutorialData, isOpen, isAutoPlaying]);

    // Auto-close tutorial after completion
    useEffect(() => {
        if (isOpen && tutorialData && currentStep === tutorialData.steps.length - 1) {
            // We're on the last step, start the auto-close countdown
            setAutoCloseCountdown(10);
            
            let timeLeft = 10;
            autoCloseTimerRef.current = setInterval(() => {
                timeLeft--;
                setAutoCloseCountdown(timeLeft);
                
                if (timeLeft <= 0) {
                    clearInterval(autoCloseTimerRef.current);
                    closeTutorial();
                }
            }, 1000);
        } else {
            // Not on last step, clear any existing auto-close timer
            setAutoCloseCountdown(0);
            if (autoCloseTimerRef.current) {
                clearInterval(autoCloseTimerRef.current);
            }
        }
        
        return () => {
            if (autoCloseTimerRef.current) {
                clearInterval(autoCloseTimerRef.current);
            }
        };
    }, [currentStep, tutorialData, isOpen]);

    const nextStep = () => {
        // In auto-play mode, don't allow manual next
        if (autoPlayMode && !isAutoPlaying) {
            return;
        }
        
        // Normal next step behavior for manual mode
        if (currentStep < (tutorialData?.steps.length - 1)) {
            setCurrentStep(currentStep + 1);
            setIsWaitingForClick(false);
            setStepCompleted(false);
        }
    };

    const performAutoAction = (clickTarget) => {
        setIsAutoPlaying(true);
        
        // Find the target element with better logic for color elements
        const findTargetElement = (retryCount = 0) => {
            // Try multiple selectors for better element finding
            const selectors = [
                clickTarget,
                // Specific selectors for color elements
                '.color-legend .subject-color',
                '.color-legend button',
                '.color-legend .color-box',
                '.color-legend [class*="color"]',
                '.subject-color',
                '[data-color]',
                '.color-picker button',
                '.color-picker .color-option',
                // Generic fallbacks
                clickTarget.replace(':first-child', ''),
                clickTarget.split(' ').pop(), // Get the last class in case of compound selectors
                // Remove pseudo-selectors
                clickTarget.replace(/:[\w-]+/g, ''),
            ];
            
            let targetElement = null;
            
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        // For color elements, find the first visible and clickable one
                        targetElement = Array.from(elements).find(el => {
                            const rect = el.getBoundingClientRect();
                            const isVisible = rect.width > 0 && rect.height > 0;
                            const isClickable = !el.disabled && 
                                               el.style.pointerEvents !== 'none' && 
                                               window.getComputedStyle(el).display !== 'none' &&
                                               window.getComputedStyle(el).visibility !== 'hidden';
                            return isVisible && isClickable;
                        }) || elements[0];
                        
                        if (targetElement) {
                            console.log(`Found target element with selector: ${selector}`, targetElement);
                            console.log('Element position:', targetElement.getBoundingClientRect());
                            break;
                        }
                    }
                } catch (error) {
                    console.warn(`Invalid selector: ${selector}`, error);
                }
            }
            
            // If still not found and we haven't retried too many times
            if (!targetElement && retryCount < 5) {
                console.log(`Element not found, retrying in 300ms... (attempt ${retryCount + 1})`);
                console.log('Available elements on page:');
                // Debug: show what elements are available
                document.querySelectorAll('[class*="color"], button').forEach((el, i) => {
                    if (i < 10) { // Limit output
                        console.log(`- ${el.tagName}.${el.className}`, el.getBoundingClientRect());
                    }
                });
                setTimeout(() => findTargetElement(retryCount + 1), 300);
                return null;
            }
            
            return targetElement;
        };
        
        const targetElement = findTargetElement();
        
        if (targetElement) {
            // Create dramatic spotlight effect
            const spotlight = document.createElement('div');
            spotlight.className = 'tutorial-auto-click-spotlight';
            spotlight.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                pointer-events: none;
                animation: tutorial-spotlight-appear 0.5s ease forwards;
            `;
            document.body.appendChild(spotlight);
            
            // Scroll element into view with improved centering
            const elementRect = targetElement.getBoundingClientRect();
            const isInViewport = elementRect.top >= 0 && 
                               elementRect.left >= 0 && 
                               elementRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
                               elementRect.right <= (window.innerWidth || document.documentElement.clientWidth);
            
            if (!isInViewport) {
                // Calculate position to center the element
                const elementTop = targetElement.offsetTop;
                const elementHeight = targetElement.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollToPosition = elementTop - (windowHeight / 2) + (elementHeight / 2);
                
                // Smooth scroll to center the element
                window.scrollTo({
                    top: Math.max(0, scrollToPosition),
                    behavior: 'smooth'
                });
                
                // Also use scrollIntoView as fallback
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
            }
            
            // Wait for scroll to complete, then add effects
            setTimeout(() => {
                // Get element position for spotlight cutout
                const rect = targetElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Update spotlight with cutout
                spotlight.style.background = `radial-gradient(circle at ${centerX}px ${centerY}px, transparent 80px, rgba(0, 0, 0, 0.8) 150px)`;
                
                // Add multiple visual effects to the target element
                targetElement.classList.add('tutorial-auto-clicking');
                
                // Create clicking indicator with fixed positioning for better control
                const clickIndicator = document.createElement('div');
                clickIndicator.className = 'tutorial-click-indicator';
                clickIndicator.innerHTML = '🤖 AUTO-CLICKING';
                
                // Position the indicator above the element using fixed positioning
                const indicatorRect = targetElement.getBoundingClientRect();
                const indicatorTop = indicatorRect.top - 60;
                const indicatorLeft = indicatorRect.left + (indicatorRect.width / 2);
                
                clickIndicator.style.cssText = `
                    position: fixed;
                    top: ${indicatorTop}px;
                    left: ${indicatorLeft}px;
                    transform: translateX(-50%);
                    background: linear-gradient(45deg, #ff4444, #ff6666);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-size: 16px;
                    font-weight: bold;
                    z-index: 10001;
                    animation: tutorial-click-bounce 0.6s ease infinite alternate;
                    box-shadow: 0 10px 30px rgba(255, 68, 68, 0.6);
                    white-space: nowrap;
                    pointer-events: none;
                `;
                
                // Add to document body instead of target element for better positioning
                document.body.appendChild(clickIndicator);
                
                // Add pulse rings around the element with fixed positioning
                const pulseRing = document.createElement('div');
                pulseRing.className = 'tutorial-pulse-ring';
                
                // Position the pulse ring exactly over the element
                pulseRing.style.cssText = `
                    position: fixed;
                    top: ${indicatorRect.top - 8}px;
                    left: ${indicatorRect.left - 8}px;
                    width: ${indicatorRect.width + 16}px;
                    height: ${indicatorRect.height + 16}px;
                    border: 4px solid #ff4444;
                    border-radius: 12px;
                    animation: tutorial-pulse-ring 1.2s ease-out infinite;
                    pointer-events: none;
                    z-index: 9998;
                    box-sizing: border-box;
                `;
                document.body.appendChild(pulseRing);
                
                // Wait for dramatic build-up, then click
                setTimeout(() => {
                    try {
                        // Show final click animation
                        clickIndicator.innerHTML = '🤖 CLICKING NOW!';
                        clickIndicator.style.background = 'linear-gradient(45deg, #00ff00, #44ff44)';
                        clickIndicator.style.animation = 'tutorial-click-final 0.3s ease infinite';
                        
                        // Try multiple click methods for better compatibility
                        if (targetElement.click && typeof targetElement.click === 'function') {
                            targetElement.click();
                            console.log('Auto-clicked element using .click():', clickTarget);
                        } else {
                            // Fallback to dispatching click event
                            const clickEvent = new MouseEvent('click', {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                detail: 1
                            });
                            targetElement.dispatchEvent(clickEvent);
                            console.log('Auto-clicked element using dispatchEvent:', clickTarget);
                        }
                        
                        // Also try triggering change event for form elements
                        if (targetElement.tagName === 'SELECT' || targetElement.tagName === 'INPUT') {
                            const changeEvent = new Event('change', { bubbles: true });
                            targetElement.dispatchEvent(changeEvent);
                        }
                    } catch (error) {
                        console.warn('Failed to click element:', error);
                    }
                    
                    // Show completion feedback
                    setStepCompleted(true);
                    setIsWaitingForClick(false);
                    
                    // Clean up visual effects and advance after showing success
                    setTimeout(() => {
                        // Remove all visual effects
                        targetElement.classList.remove('tutorial-auto-clicking');
                        if (clickIndicator.parentNode) {
                            clickIndicator.parentNode.removeChild(clickIndicator);
                        }
                        if (pulseRing.parentNode) {
                            pulseRing.parentNode.removeChild(pulseRing);
                        }
                        if (spotlight.parentNode) {
                            spotlight.parentNode.removeChild(spotlight);
                        }
                        
                        // Reset element styles
                        targetElement.style.position = '';
                        targetElement.style.zIndex = '';
                        
                        setIsAutoPlaying(false);
                        
                        // Advance to next step
                        if (currentStep < (tutorialData?.steps.length - 1)) {
                            setCurrentStep(prev => prev + 1);
                            setStepCompleted(false);
                        }
                    }, 1500); // Show success for 1.5 seconds
                }, 2000); // Wait 2 seconds for dramatic build-up
            }, 1000); // Wait for scroll to complete
        } else {
            console.warn('Target element not found for auto-play:', clickTarget);
            console.warn('Available elements that might match:');
            
            // Debug: Log all available elements that might match
            const possibleSelectors = [
                '.color-legend-btn',
                '.color-legend .subject-color',
                '.color-legend',
                '[class*="color"]',
                'button',
                '.color-box',
                '[data-color]'
            ];
            
            possibleSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        console.log(`Found ${elements.length} elements for ${selector}:`, elements);
                    }
                } catch (error) {
                    console.warn(`Invalid selector: ${selector}`);
                }
            });
            
            setIsAutoPlaying(false);
            
            // Fall back to normal next step
            if (currentStep < (tutorialData?.steps.length - 1)) {
                setCurrentStep(prev => prev + 1);
                setIsWaitingForClick(false);
                setStepCompleted(false);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setIsWaitingForClick(false);
            setStepCompleted(false);
            setIsAutoPlaying(false);
        }
    };

    const closeTutorial = () => {
        // Clear all timers
        if (autoPlayTimerRef.current) {
            clearTimeout(autoPlayTimerRef.current);
        }
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }
        if (autoCloseTimerRef.current) {
            clearInterval(autoCloseTimerRef.current);
        }
        
        // Remove any remaining highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // Remove overlay
        const overlay = document.querySelector('.tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Remove auto-clicking class from any elements
        document.querySelectorAll('.tutorial-auto-clicking').forEach(el => {
            el.classList.remove('tutorial-auto-clicking');
        });
        
        // Remove click listener
        if (clickListenerRef.current) {
            document.removeEventListener('click', clickListenerRef.current, false);
            clickListenerRef.current = null;
        }
        
        // Reset states
        setIsWaitingForClick(false);
        setStepCompleted(false);
        setIsAutoPlaying(false);
        setCountdown(0);
        onClose();
    };

    if (!isOpen || !tutorialData) return null;

    const currentStepData = tutorialData.steps[currentStep];
    const progress = ((currentStep + 1) / tutorialData.steps.length) * 100;

    return (
        <div 
            className={`tutorial-modal-sidebar ${isWaitingForClick ? 'waiting-for-click' : ''} ${currentStepData.interactive ? 'interactive-step' : 'info-step'}`} 
            onClick={(e) => e.stopPropagation()}
        >
            <div className="tutorial-header">
                <h2>{tutorialData.title}</h2>
                <div className="tutorial-header-buttons">
                    <button 
                        className={`tutorial-autoplay-toggle ${autoPlayMode ? 'active' : ''}`}
                        onClick={() => {
                            const newAutoPlayMode = !autoPlayMode;
                            setAutoPlayMode(newAutoPlayMode);
                            
                            // If disabling auto-play, clear timers and reset states
                            if (!newAutoPlayMode) {
                                if (autoPlayTimerRef.current) {
                                    clearTimeout(autoPlayTimerRef.current);
                                }
                                if (countdownTimerRef.current) {
                                    clearInterval(countdownTimerRef.current);
                                }
                                setCountdown(0);
                                setIsAutoPlaying(false);
                            }
                        }}
                        title={autoPlayMode ? 'Disable Auto-Play (Return to Manual Mode)' : 'Enable Auto-Play (Fully Automatic Demo)'}
                    >
                        {autoPlayMode ? '🤖 Auto' : '👤 Manual'}
                    </button>
                    <button className="tutorial-close" onClick={closeTutorial} title="Close Tutorial">×</button>
                </div>
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
                
                {/* Show completion message on last step */}
                {currentStep === tutorialData.steps.length - 1 && (
                    <div className="tutorial-completion-notice">
                        <div className="completion-icon">🎉</div>
                        <div className="completion-text">
                            <strong>Tutorial Complete!</strong>
                            <p>Great job! You've mastered the basics of Premium Timetable.</p>
                            {autoCloseCountdown > 0 && (
                                <p className="auto-close-text">
                                    This tutorial will automatically close in <strong>{autoCloseCountdown} seconds</strong>.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                
                {currentStepData.interactive && (
                    <div className={`tutorial-instruction ${autoPlayMode ? 'auto-play-mode' : ''}`}>
                        <div className="instruction-icon">
                            {isAutoPlaying ? '🤖' : isWaitingForClick ? '👆' : autoPlayMode && countdown > 0 ? '⏱️' : '✅'}
                        </div>
                        <div className="instruction-text">
                            <strong>
                                {autoPlayMode ? (
                                    isAutoPlaying ? (
                                        `🤖 Auto-clicking: ${currentStepData.instruction || 'Performing action'}...`
                                    ) : countdown > 0 ? (
                                        `🤖 Auto-action in ${countdown}s: ${currentStepData.instruction || 'Will perform action automatically'}`
                                    ) : (
                                        `🤖 Auto-mode: ${currentStepData.instruction || 'Action will be performed automatically'}`
                                    )
                                ) : (
                                    currentStepData.instruction
                                )}
                            </strong>
                            {isAutoPlaying && (
                                <div className="auto-playing-indicator">
                                    <div className="pulse-dot"></div>
                                    🤖 Auto-clicking for you...
                                </div>
                            )}
                            {isWaitingForClick && !autoPlayMode && !isAutoPlaying && (
                                <div className="waiting-indicator">
                                    <div className="pulse-dot"></div>
                                    Waiting for you to click...
                                </div>
                            )}
                            {stepCompleted && (
                                <div className="completed-indicator">
                                    <div className="checkmark-icon">✓</div>
                                    Task completed! Moving to next step...
                                </div>
                            )}
                            {autoPlayMode && countdown > 0 && !isAutoPlaying && (
                                <div className="auto-countdown-indicator">
                                    <div className="countdown-circle">{countdown}</div>
                                    Automatically advancing in {countdown} second{countdown !== 1 ? 's' : ''}...
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {!currentStepData.interactive && autoPlayMode && countdown > 0 && (
                    <div className="tutorial-auto-progress">
                        <div className="auto-progress-icon">🤖</div>
                        <div className="auto-progress-text">
                            <strong>Auto-play enabled</strong>
                            <div className="auto-countdown-indicator">
                                <div className="countdown-circle">{countdown}</div>
                                Automatically advancing in {countdown} second{countdown !== 1 ? 's' : ''}...
                            </div>
                        </div>
                    </div>
                )}
                
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
                            onClick={() => !isWaitingForClick && setCurrentStep(index)}
                            style={{ cursor: isWaitingForClick ? 'not-allowed' : 'pointer' }}
                        ></span>
                    ))}
                </div>
                
                {currentStepData.interactive ? (
                    <button 
                        className="tutorial-btn tutorial-btn-disabled" 
                        disabled={true}
                        title={autoPlayMode ? "Auto-play will handle this step" : "Complete the action above to continue"}
                    >
                        {autoPlayMode ? (
                            isAutoPlaying ? 'Auto-clicking...' : 
                            countdown > 0 ? `Auto (${countdown}s)` : 'Auto-play'
                        ) : isWaitingForClick ? 'Waiting...' : 'Next'}
                    </button>
                ) : currentStep < tutorialData.steps.length - 1 ? (
                    <button 
                        className={`tutorial-btn tutorial-btn-primary ${autoPlayMode ? 'auto-mode' : ''}`}
                        onClick={nextStep}
                        disabled={autoPlayMode}
                        title={autoPlayMode ? "Auto-play will advance automatically" : "Continue to next step"}
                    >
                        {autoPlayMode ? (
                            countdown > 0 ? `Auto (${countdown}s)` : '🤖 Auto-play'
                        ) : (
                            'Next'
                        )}
                    </button>
                ) : (
                    <div className="tutorial-finish-options">
                        {autoCloseCountdown > 0 && (
                            <div className="tutorial-auto-close-notice">
                                <span className="auto-close-icon">⏰</span>
                                Auto-closing in {autoCloseCountdown}s...
                            </div>
                        )}
                        {onBackToTutorials && (
                            <button 
                                className="tutorial-btn tutorial-btn-secondary" 
                                onClick={() => {
                                    closeTutorial();
                                    onBackToTutorials();
                                }}
                            >
                                ← Back to Tutorials
                            </button>
                        )}
                        <button 
                            className="tutorial-btn tutorial-btn-primary" 
                            onClick={closeTutorial}
                        >
                            {autoCloseCountdown > 0 ? `Close Now (${autoCloseCountdown}s)` : 
                             onBackToTutorials ? 'Close' : 'Finish'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorialModal;
