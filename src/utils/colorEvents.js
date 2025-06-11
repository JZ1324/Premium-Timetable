/**
 * Utility for handling color-related events
 * This enables components to communicate about color changes
 */

// Create a custom event for color changes
export const COLOR_CHANGED_EVENT = 'timetable-colors-changed';

/**
 * Notify that colors have been changed
 * @param {Object} detail - Details about the color change
 */
export const notifyColorChanged = (detail = {}) => {
    const event = new CustomEvent(COLOR_CHANGED_EVENT, { 
        detail,
        bubbles: true,
        cancelable: true
    });
    
    // Dispatch on window so it's globally available
    window.dispatchEvent(event);
};
