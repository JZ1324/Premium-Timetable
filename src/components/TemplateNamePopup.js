import React, { useEffect, useRef, useState } from 'react';
import '../styles/components/TemplateNamePopup.css';

const TemplateNamePopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  suggestedName, 
  title = 'Save as Template'
}) => {
  const [templateName, setTemplateName] = useState(suggestedName || '');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the input when the modal opens and center it in the viewport
  useEffect(() => {
    if (isOpen && inputRef.current && modalRef.current) {
      setTimeout(() => {
        // Focus and select the input field
        inputRef.current.focus();
        inputRef.current.select();
        
        // Center the modal in the viewport with smooth scrolling
        const modalContainer = modalRef.current.querySelector('.template-name-container');
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

  // Handle ESC key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, templateName]);

  // Prevent clicks on the modal background from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Handle save button click
  const handleSave = () => {
    onSave(templateName.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="template-name-modal" onClick={handleModalClick} ref={modalRef}>
      <div className="template-name-container">
        <h2>{title}</h2>
        <p>Enter a name for this imported timetable template:</p>
        
        <div className="template-name-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="template-name-input"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Name"
          />
        </div>
        
        <div className="template-name-actions">
          <button 
            className="template-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="template-save-button"
            onClick={handleSave}
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateNamePopup;
