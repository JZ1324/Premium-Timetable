/**
 * Utility to manage API keys for external services
 */

/**
 * Set the OpenRouter API key globally
 * @param {string} apiKey - The API key to set
 * @returns {boolean} - True if set successfully
 */
export const setOpenRouterApiKey = (apiKey) => {
  try {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error('Invalid API key provided');
      return false;
    }
    
    // Store in window object for current session
    window.OPENROUTER_API_KEY = apiKey.trim();
    
    // Optionally store in localStorage for persistence
    try {
      localStorage.setItem('OPENROUTER_API_KEY', apiKey.trim());
    } catch (storageError) {
      console.warn('Could not save API key to localStorage:', storageError);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting API key:', error);
    return false;
  }
};

/**
 * Get the stored OpenRouter API key
 * @returns {string|null} - The API key or null if not set
 */
export const getOpenRouterApiKey = () => {
  // First try from window object (session)
  if (window.OPENROUTER_API_KEY) {
    return window.OPENROUTER_API_KEY;
  }
  
  // Then try from localStorage (persistent)
  try {
    const storedKey = localStorage.getItem('OPENROUTER_API_KEY');
    if (storedKey) {
      // Also set on window for future use
      window.OPENROUTER_API_KEY = storedKey;
      return storedKey;
    }
  } catch (storageError) {
    console.warn('Could not retrieve API key from localStorage:', storageError);
  }
  
  return null;
};

/**
 * Clear the stored OpenRouter API key
 */
export const clearOpenRouterApiKey = () => {
  try {
    // Clear from window object
    delete window.OPENROUTER_API_KEY;
    
    // Clear from localStorage
    localStorage.removeItem('OPENROUTER_API_KEY');
    
    return true;
  } catch (error) {
    console.error('Error clearing API key:', error);
    return false;
  }
};

// For backward compatibility
export const getTogetherApiKey = getOpenRouterApiKey;
export const setTogetherApiKey = setOpenRouterApiKey;
export const clearTogetherApiKey = clearOpenRouterApiKey;

// Initialize with the default key if available or load from localStorage
(() => {
  // Use the default key if no key is stored
  if (!getOpenRouterApiKey()) {
    // Set the internal API key that will be used by the AI parser service
    // This uses a proper API key for the service to function
    setOpenRouterApiKey('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');
  }
})();
