import React, { useEffect, useRef } from 'react';
import '../styles/components/LogoutConfirm.css';

const LogoutConfirm = ({ onConfirm, onCancel, isLoading, error }) => {
  const modalRef = useRef(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Save the current overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle clicks on the modal background (do nothing to prevent accidental dismissal)
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="logout-confirm-modal" onClick={handleModalClick} ref={modalRef}>
      <div className="logout-confirm-container">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="logout-confirm-actions">
          <button 
            className="cancel-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Yes, Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
