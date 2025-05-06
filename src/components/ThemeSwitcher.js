import React, { useState, useEffect } from 'react';
import { getCurrentTheme, setTheme } from '../services/themeService';
import './ThemeSwitcher.css'; // Assuming you have some styles for the ThemeSwitcher

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState('light');

    useEffect(() => {
        // Initialize with the current theme from the service
        setCurrentTheme(getCurrentTheme());
    }, []);

    const handleThemeChange = (event) => {
        const selectedTheme = event.target.value;
        setTheme(selectedTheme);
        setCurrentTheme(selectedTheme);
    };

    return (
        <div className="theme-switcher">
            <label htmlFor="theme-select">Theme:</label>
            <select id="theme-select" value={currentTheme} onChange={handleThemeChange}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="colorful">Colorful</option>
                <option value="minimal">Minimal</option>
                <option value="pastel">Pastel</option>
            </select>
        </div>
    );
};

export default ThemeSwitcher;