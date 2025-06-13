import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import selectingGif from '../assets/Selecting.gif';
import '../styles/components/ImportTutorialPopup.css';

/**
 * Tutorial popup that shows users how to select text for importing timetables
 * Only appears for first-time users
 */
const ImportTutorialPopup = ({ isVisible, onClose, onDontShowAgain }) => {
    const gifRef = useRef(null);

    useEffect(() => {
        if (!isVisible || !gifRef.current) return;

        const gif = gifRef.current;
        let intervalId = null;
        let timeoutId = null;
        
        // Create a timer to restart the GIF with controlled timing
        const createGifLoop = () => {
            const originalSrc = selectingGif;
            let isFirstLoop = true;
            
            const restartGif = () => {
                // Force GIF to restart by adding a timestamp to prevent caching
                const timestamp = Date.now();
                gif.src = `${originalSrc}?t=${timestamp}`;
            };

            const scheduleNextRestart = () => {
                // Clear any existing timeouts
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                // GIF plays for approximately 4 seconds, then we pause for 1.5 seconds on last frame
                timeoutId = setTimeout(() => {
                    restartGif();
                    scheduleNextRestart(); // Schedule the next restart
                }, 5500); // 4s GIF duration + 1.5s pause = 5.5s total cycle
            };

            // Start the loop after the initial GIF completes (4 seconds)
            if (isFirstLoop) {
                timeoutId = setTimeout(() => {
                    isFirstLoop = false;
                    scheduleNextRestart();
                }, 4000); // Wait for initial GIF to complete
            }
        };

        // Start the controlled looping
        createGifLoop();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }
    };

    const handleCloseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        onClose();
    };

    const handleDontShowAgainClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Dont show again clicked');
        onDontShowAgain();
    };

    const handleGotItClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Got it clicked');
        onClose();
    };

    return createPortal(
        <div 
            className="import-tutorial-overlay"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            aria-describedby="tutorial-description"
        >
            <div className="import-tutorial-popup">
                <div className="tutorial-header">
                    <h2 id="tutorial-title">How to Import Your Timetable</h2>
                    <button 
                        className="tutorial-close-button"
                        onClick={handleCloseClick}
                        aria-label="Close tutorial"
                        type="button"
                    >
                        ×
                    </button>
                </div>
                
                <div className="tutorial-content">
                    <div id="tutorial-description" className="tutorial-text">
                        <p>Follow this guide to select and import your timetable:</p>
                        <ol>
                            <li>Select your timetable text from your school portal or document</li>
                            <li>Copy the selected text (Ctrl+C or Cmd+C)</li>
                            <li>Paste it into the import box below</li>
                            <li>Click "Parse" to process your timetable</li>
                        </ol>
                    </div>
                    
                    <div className="tutorial-gif-container">
                        <div className="gif-wrapper">
                            <img 
                                ref={gifRef}
                                src={selectingGif} 
                                alt="Animation showing how to select timetable text for importing"
                                className="tutorial-gif"
                                loading="lazy"
                                onLoad={() => {
                                    console.log('Tutorial GIF loaded successfully');
                                }}
                                onError={(e) => {
                                    // Only show fallback if this is the first load attempt
                                    if (!e.target.src.includes('?t=')) {
                                        console.error('Failed to load tutorial GIF on initial load');
                                        e.target.style.display = 'none';
                                        
                                        // Show fallback message
                                        const fallback = document.createElement('div');
                                        fallback.className = 'tutorial-gif-fallback';
                                        fallback.innerHTML = '<p>📋 Tutorial animation not available<br/>Follow the steps above to import your timetable</p>';
                                        if (e.target.parentNode && !e.target.parentNode.querySelector('.tutorial-gif-fallback')) {
                                            e.target.parentNode.appendChild(fallback);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="tutorial-actions">
                    <button 
                        className="tutorial-dont-show-button"
                        onClick={handleDontShowAgainClick}
                        type="button"
                    >
                        Don't show this again
                    </button>
                    <button 
                        className="tutorial-got-it-button"
                        onClick={handleGotItClick}
                        type="button"
                        autoFocus
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ImportTutorialPopup;
