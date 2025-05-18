import React, { useEffect, useRef } from 'react';
import '../styles/components/ConfirmDialog.css';

/**
 * Reusable confirm dialog component to replace window.confirm
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {function} props.onConfirm - Function to call when user confirms
 * @param {function} props.onCancel - Function to call when user cancels
 * @param {string} props.message - The message to display
 * @param {string} props.title - Title for the dialog
 * @param {string} props.confirmText - Text for confirmation button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.type - The type of dialog (danger, warning, info)
 */
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title = 'Confirm Action',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  const modalRef = useRef(null);
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  
  // Focus the cancel button when the modal opens and center it in the viewport
  useEffect(() => {
    if (isOpen && dialogRef.current && confirmButtonRef.current) {
      setTimeout(() => {
        // Focus confirm button
        confirmButtonRef.current.focus();
        
        // Center the modal in the viewport
        const modalContainer = dialogRef.current;
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

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onConfirm, onCancel]);

  // Prevent clicks on the modal background from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-modal" onClick={handleModalClick} ref={modalRef}>
      <div 
        className={`confirm-dialog-container confirm-type-${type}`}
        ref={dialogRef}
      >
        <h2>{title}</h2>
        <div className="confirm-dialog-content">
          {message}
        </div>
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="confirm-action-button"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
