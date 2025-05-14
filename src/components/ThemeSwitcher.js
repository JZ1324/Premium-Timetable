import React from 'react';
import '../styles/components/ThemeSwitcher.css';

const ThemeSwitcher = ({ onThemeChange, currentTheme }) => {
    const handleClick = (event, theme) => {
        // Prevent default behavior and stop propagation
        event.preventDefault();
        event.stopPropagation();
        
        console.log("Theme button clicked:", theme);
        
        // Only trigger if actually changing to a different theme
        if (theme !== currentTheme) {
            onThemeChange(theme);
        }
    };


const themes = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'colorful', name: 'Colorful' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'pastel', name: 'Pastel' },
    { id: 'cosmos', name: 'Cosmos' }
];

    return (
        <div className="theme-switcher-container">
            <h3 className="theme-switcher-title">Select a Theme</h3>
            <div className="theme-buttons">
                {themes.map(theme => (
                    <button 
                        key={theme.id}
                        type="button"
                        className={`theme-button ${theme.id} ${currentTheme === theme.id ? 'active' : ''}`}
                        onClick={(e) => handleClick(e, theme.id)}
                        aria-label={`${theme.name} theme`}
                        title={`Switch to ${theme.name} theme`}
                    >
                        <div className="theme-button-preview"></div>
                        <span>{theme.name}</span>
                    </button>
                ))}
            </div>
            <div className="current-theme-label">
                Current theme: <span>{currentTheme ? currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1) : 'Light'}</span>
            </div>
        </div>
    );
};

export default ThemeSwitcher;
