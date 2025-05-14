// Theme definitions - Using absolute paths for webpack dev server
const themes = {
    light: './assets/themes/light.css',
    dark: './assets/themes/dark.css',
    colorful: './assets/themes/colorful.css',
    minimal: './assets/themes/minimal.css',
    pastel: './assets/themes/pastel.css',
    cosmos: './assets/themes/cosmos.css'
};

let currentTheme = 'light';

const loadTheme = (theme) => {
    if (!themes[theme]) {
        console.warn(`Theme ${theme} is not available.`);
        return;
    }

    // Update current theme
    currentTheme = theme;
    
    console.log(`%c themeService: `, 'background: #6e3cbf; color: white; padding: 4px; border-radius: 4px', `Loading theme: ${theme} from path: ${themes[theme]}`);
    
    // Dynamically update or create the theme-stylesheet link
    let link = document.getElementById('theme-stylesheet');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'theme-stylesheet';
        document.head.appendChild(link);
        console.log('Created new link element for theme');
    }
    
    // Force browser to reload the CSS by adding a timestamp
    const timestamp = new Date().getTime();
    link.href = `${themes[theme]}?t=${timestamp}`;
    console.log(`Set link href to: ${link.href}`);
    
    // Apply theme class to both html and body elements with high specificity
    document.documentElement.className = `theme-${theme}`;
    document.body.className = `theme-${theme}`; // Add class to body as well
    
    // Also set data-theme attribute for CSS variable selection
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Check if the body has the right class after a short delay
    setTimeout(() => {
        console.log('Body class after timeout:', document.body.className);
        console.log('Document class after timeout:', document.documentElement.className);
    }, 100);
    
    // Store in localStorage
    try {
        localStorage.setItem('preferred-theme', theme);
        console.log(`Theme ${theme} applied and saved to localStorage`);
    } catch (error) {
        console.warn('Failed to save theme preference:', error);
    }
};

const getCurrentTheme = () => {
    try {
        // Try to get from localStorage first
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme && themes[savedTheme]) {
            currentTheme = savedTheme;
        }
    } catch (error) {
        console.warn('Failed to get theme from localStorage:', error);
    }
    return currentTheme;
};

const setTheme = (theme) => {
    if (themes[theme]) {
        loadTheme(theme);
        return true;
    }
    return false;
};

const initTheme = () => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('preferred-theme');
    loadTheme(savedTheme || 'light');
};

export { loadTheme, getCurrentTheme, setTheme, initTheme };