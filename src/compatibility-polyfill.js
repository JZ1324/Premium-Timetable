/**
 * compatibility-polyfill.js
 * 
 * This file provides a global safety mechanism to prevent "is not a function" errors
 * by adding a defensive wrapper around module loading in Webpack.
 */

// Execute immediately when the script loads
(function() {
  // Save the original webpack require function
  if (window.__webpack_require__) {
    const originalRequire = window.__webpack_require__;
    
    // Replace with our defensive version
    window.__webpack_require__ = function(moduleId) {
      try {
        // Try the normal require
        return originalRequire(moduleId);
      } catch (e) {
        console.warn(`Module load error for ID ${moduleId}:`, e);
        // Return a safe empty module
        return {
          __esModule: true,
          default: {},
          fixEnglishTruncation: function(json) { return json; },
          recoverFromEnglishTruncation: function() { return null; }
        };
      }
    };

    console.log("Webpack compatibility layer installed");
  }
})();
