// This utility file contains functions for managing localStorage
// related to user preferences and timetable state

/**
 * Save user preference to localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to save (will be JSON stringified)
 */
export const saveUserPreference = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

/**
 * Get user preference from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or defaultValue
 */
export const getUserPreference = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Save the current active timetable day
 * @param {number} day - The current day (1-10)
 */
export const saveCurrentTimetableDay = (day) => {
  saveUserPreference('last-active-timetable-day', day);
};

/**
 * Get the last active timetable day
 * @returns {number|null} The last active day or null if not set
 */
export const getLastActiveTimetableDay = () => {
  return getUserPreference('last-active-timetable-day', null);
};

/**
 * Save the current active template
 * @param {string} templateName - The current template name
 */
export const saveCurrentTemplate = (templateName) => {
  if (templateName) {
    saveUserPreference('last-active-template', templateName);
  }
};

/**
 * Get the last active template
 * @returns {string|null} The last active template or null if not set
 */
export const getLastActiveTemplate = () => {
  return getUserPreference('last-active-template', 'school');
};
