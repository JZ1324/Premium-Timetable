import React from 'react';
import '../styles/components/LoadingUI.css';

/**
 * Enhanced Loading UI component with animated words and processing indication
 * @param {object} props Component props
 * @param {string} props.message The loading message to display
 * @param {string} props.status Additional status text (optional)
 */
const LoadingUI = ({ 
  message = "Parsing", 
  status
}) => {
  return (
    <div className="loader-container">
      <div className="card">
        <div className="loader">
          {/* Simple spinner */}
          <div className="spinner"></div>
          <p>{message}...</p>
          <div className="words">
            <span className="word">timetable</span>
            <span className="word">classes</span>
            <span className="word">periods</span>
          </div>
        </div>
      </div>
      {status && <div className="loading-status">{status}</div>}
    </div>
  );
};

export default LoadingUI;
