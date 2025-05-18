import React from 'react';
import '../styles/components/LoadingUI.css';

/**
 * Loading UI component with animated words
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
  return (
    <div className="loader-container">
      <div className="card">
        <div className="loader">
          <p>{message}</p>
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
