import React, { useEffect, useRef } from 'react';
import '../styles/components/NotificationPopup.css';

/**
 * Reusable notification popup component for showing alerts/messages
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether the notification is visible
 * @param {function} props.onClose - Function to call when notification is closed
 * @param {string} props.message - The message to display
 * @param {string} props.type - The type of notification (info, success, error, warning)
 * @param {string} props.title - Optional title for the notification
 */
const NotificationPopup = ({
  isOpen,
  onClose,
  message,
  type = 'info',
  title
}) => {
  const modalRef = useRef(null);
  const notificationRef = useRef(null);

  // Auto-close for non-error messages
  useEffect(() => {
    if (isOpen && type !== 'error' && type !== 'warning') {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  // Center the notification in the viewport
  useEffect(() => {
    if (isOpen && notificationRef.current) {
      setTimeout(() => {
        const modalContainer = notificationRef.current;
        if (modalContainer) {
          const modalRect = modalContainer.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Calculate how far off-center the modal is
          const offset = modalRect.top + (modalRect.height / 2) - (viewportHeight / 2);
          
          // If the modal is significantly off-center, scroll to center it
          if (Math.abs(offset) > 50) {
            const scrollPosition = window.scrollY + offset;
            window.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling on the background
      document.body.style.overflow = 'hidden';
      
      // Re-enable scrolling when component unmounts or closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Prevent clicks on the modal background from closing it
  const handleBackgroundClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  // Determine title if not provided
  const displayTitle = title || {
    'info': 'Information',
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning'
  }[type] || 'Notification';

  return (
    <div className="notification-popup-modal" onClick={handleBackgroundClick} ref={modalRef}>
      <div 
        className={`notification-popup-container notification-type-${type}`} 
        ref={notificationRef}
      >
        <h2>{displayTitle}</h2>
        <div className="notification-popup-content">
          {message}
        </div>
        <div className="notification-popup-actions">
          <button
            className="notification-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
