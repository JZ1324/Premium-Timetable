import React from 'react';
import AuthProvider from './components/AuthProvider';
import AppContent from './components/AppContent';
import './styles/global.css';

// Import theme CSS files
import './assets/themes/light.css';
import './assets/themes/dark.css';
import './assets/themes/colorful.css';
import './assets/themes/minimal.css';
import './assets/themes/pastel.css';

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;