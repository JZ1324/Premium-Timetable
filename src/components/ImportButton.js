// ImportButton.js component
import React, { useState } from 'react';
import ImportTimetable from './ImportTimetable';
import '../styles/components/ImportButton.css';

const ImportButton = ({ onImport }) => {
    const [showImportModal, setShowImportModal] = useState(false);
    
    const handleOpenModal = () => {
        setShowImportModal(true);
    };
    
    const handleCloseModal = () => {
        setShowImportModal(false);
        
        // Additional cleanup to ensure body styles are reset
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
        document.body.style.height = '';
        document.body.style.minHeight = '';
        document.body.style.position = '';
        document.body.classList.remove('modal-open');
    };
    
    const handleImportData = (importedData) => {
        if (importedData && typeof onImport === 'function') {
            onImport(importedData);
        }
        handleCloseModal();
    };

    return (
        <div className="import-timetable-button">
            <button 
                className="import-button" 
                onClick={handleOpenModal} 
                role="button" 
                tabIndex="0"
            >
                Import
            </button>
            
            {showImportModal && (
                <ImportTimetable 
                    onImport={handleImportData} 
                    onCancel={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default ImportButton;
