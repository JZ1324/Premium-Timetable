import React, { useEffect } from 'react';
import Header from './components/Header';
import Timetable from './components/Timetable';
import Settings from './components/Settings';
import ThemeSwitcher from './components/ThemeSwitcher';
import { initTheme } from './services/themeService';
import './styles/global.css';

const App = () => {
    useEffect(() => {
        // Initialize the theme when the app loads
        initTheme();
    }, []);

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <ThemeSwitcher />
                <Timetable />
                <Settings />
            </main>
            <footer className="footer">
                <p>© {new Date().getFullYear()} School Timetable App</p>
            </footer>
        </div>
    );
};

export default App;