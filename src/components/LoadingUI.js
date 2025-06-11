import React, { useState, useEffect } from 'react';
import '../styles/components/LoadingUI.css';

/**
 * Enhanced Loading UI component with animated words and processing indication
 * @param {object} props Component props
 * @param {string} props.message The loading message to display
 * @param {string[]} props.words Array of words to animate
 * @param {string} props.status Additional status text (optional)
 */
const LoadingUI = ({ 
  message = "Loading", 
  words = ["parsing", "analyzing", "processing", "formatting", "organizing"],
  status
}) => {
  // State to track dots for loading animation
  const [dots, setDots] = useState('');
  
  // Effect to animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="loader-container">
      <div className="card">
        <div className="loader">
          <p>{message}{dots}</p>
          <div className="words">
            {words.map((word, index) => (
              <span key={index} className="word">{word}</span>
            ))}
          </div>
        </div>
      </div>
      {status && <div className="loading-status">{status}</div>}
    </div>
  );
};

export default LoadingUI;
