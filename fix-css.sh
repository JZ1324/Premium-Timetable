#!/bin/bash

# First, let's create a backup of the original file
cp src/styles/components/Timetable.css src/styles/components/Timetable.css.backup

# Create a new file with the fixed CSS content
cat << 'END' > src/styles/components/Timetable-fixed.css
/* Day selector fixes to ensure all day buttons (1-10) appear in a single row */
.day-selector {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
}

.day-button {
    padding: 5px 7px;
    border-radius: 6px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    min-width: 32px; /* Smaller width to fit all buttons */
    text-align: center;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
    .day-selector {
        gap: 3px;
    }
    
    .day-selector button {
        padding: 4px 5px;
        font-size: 0.75rem;
        min-width: 30px;
    }
}
END

# Display the fixed CSS
echo "Created new CSS with day selector fixes. Please manually apply these changes to fix the day buttons layout."
