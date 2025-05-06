const themes = {
    light: '/src/assets/themes/light.css',
    dark: '/src/assets/themes/dark.css',
    colorful: '/src/assets/themes/colorful.css',
    minimal: '/src/assets/themes/minimal.css',
    pastel: '/src/assets/themes/pastel.css'
};

let currentTheme = 'light';

const loadTheme = (theme) => {
    // Create or get the link element
    let linkElement = document.getElementById('theme-link');
    
    if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('id', 'theme-link');
        linkElement.setAttribute('rel', 'stylesheet');
        document.head.appendChild(linkElement);
    }
    
    linkElement.setAttribute('href', themes[theme]);
    currentTheme = theme;
    
    // Save preference to localStorage
    localStorage.setItem('preferred-theme', theme);
};

const getCurrentTheme = () => {
    // Try to get from localStorage first
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
    }
    return currentTheme;
};

const setTheme = (theme) => {
    if (themes[theme]) {
        loadTheme(theme);
    } else {
        console.warn(`Theme ${theme} is not available.`);
    }
};

const initTheme = () => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('preferred-theme');
    setTheme(savedTheme || 'light');
};

export { loadTheme, getCurrentTheme, setTheme, initTheme };