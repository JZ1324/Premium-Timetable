import React from 'react';
import AuthProvider from './components/AuthProvider';
import Router from './components/Router';
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
            <Router />
        </AuthProvider>
    );
}

export default App;