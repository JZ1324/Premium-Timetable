import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Opens a React component in a new browser window
 * @param {React.Component} Component - The React component to render
 * @param {Object} props - Props to pass to the component
 * @param {String} title - Window title
 * @param {String} windowFeatures - Window features string
 * @returns {Window} The new window object
 */
export const openComponentInNewWindow = (Component, props = {}, title = 'New Window', windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes') => {
    // Open a new window
    const newWindow = window.open('', '_blank', windowFeatures);
    
    if (!newWindow) {
        alert('Please allow popups for this site to open the colors customization window.');
        return null;
    }
    
    // Set up the basic HTML structure
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                }
                
                /* CSS Variables for theming */
                :root {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f5f5f5;
                    --text-primary: #333333;
                    --text-secondary: #666666;
                    --border-color: #e0e0e0;
                    --accent-color: #4a90e2;
                    --accent-color-dark: #3a7bc8;
                    --error-color: #f44336;
                    --error-color-dark: #d32f2f;
                    --error-color-light: #ffebee;
                }
                
                @media (prefers-color-scheme: dark) {
                    :root {
                        --bg-primary: #1a1a1a;
                        --bg-secondary: #2d2d2d;
                        --text-primary: #ffffff;
                        --text-secondary: #cccccc;
                        --border-color: #404040;
                    }
                }
            </style>
        </head>
        <body>
            <div id="react-root"></div>
        </body>
        </html>
    `);
    
    newWindow.document.close();
    
    // Wait for the window to load, then render the React component
    newWindow.addEventListener('load', () => {
        const container = newWindow.document.getElementById('react-root');
        if (container) {
            // Create React root and render the component
            const root = createRoot(container);
            root.render(React.createElement(Component, props));
            
            // Copy CSS styles from the main window
            copyStylesToNewWindow(newWindow);
            
            // Set up cleanup when window closes
            const cleanup = () => {
                try {
                    root.unmount();
                } catch (e) {
                    console.log('Error during cleanup:', e);
                }
            };
            
            newWindow.addEventListener('beforeunload', cleanup);
            
            // Optional: Focus the new window
            newWindow.focus();
        }
    });
    
    return newWindow;
};

/**
 * Copy CSS styles from the main window to the new window
 * @param {Window} newWindow - The new window to copy styles to
 */
const copyStylesToNewWindow = (newWindow) => {
    try {
        // Get all stylesheets from the main window
        const stylesheets = Array.from(document.styleSheets);
        
        stylesheets.forEach((stylesheet, index) => {
            try {
                // Create a new style element
                const newStyle = newWindow.document.createElement('style');
                newStyle.type = 'text/css';
                
                // Try to copy CSS rules
                if (stylesheet.cssRules) {
                    const cssText = Array.from(stylesheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                    newStyle.textContent = cssText;
                } else if (stylesheet.href) {
                    // For external stylesheets, create a link element
                    const newLink = newWindow.document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.type = 'text/css';
                    newLink.href = stylesheet.href;
                    newWindow.document.head.appendChild(newLink);
                    return;
                }
                
                newWindow.document.head.appendChild(newStyle);
            } catch (e) {
                // Handle CORS issues with external stylesheets
                console.log(`Could not copy stylesheet ${index}:`, e);
                
                // Try to copy as external link if it has an href
                if (stylesheet.href) {
                    try {
                        const newLink = newWindow.document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.type = 'text/css';
                        newLink.href = stylesheet.href;
                        newWindow.document.head.appendChild(newLink);
                    } catch (linkError) {
                        console.log(`Could not copy external stylesheet:`, linkError);
                    }
                }
            }
        });
        
        // Also copy any inline styles
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(styleEl => {
            const newStyle = newWindow.document.createElement('style');
            newStyle.textContent = styleEl.textContent;
            newWindow.document.head.appendChild(newStyle);
        });
        
    } catch (e) {
        console.error('Error copying styles to new window:', e);
    }
};
