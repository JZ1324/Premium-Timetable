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

const ACCENT_STYLE_ID = 'dynamic-accent-style';

/**
 * Update accent hue (0-359) and optionally persist
 */
const setAccentHue = (hue, persist = true) => {
  const clamped = Math.max(0, Math.min(359, parseInt(hue, 10) || 0));
  document.documentElement.style.setProperty('--h-accent', clamped);
  if (persist) {
    try { localStorage.setItem('accent-hue', clamped); } catch (e) {}
  }
  injectDynamicAccentStyle();
};

/**
 * Injects a small style block that recalculates derived accent shades when hue changes.
 * (Modern browsers update HSL derived vars automatically, but we can provide extra utilities.)
 */
const injectDynamicAccentStyle = () => {
  let style = document.getElementById(ACCENT_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = ACCENT_STYLE_ID;
    document.head.appendChild(style);
  }
  // Could add darker/lighter algorithmic overrides here if needed.
  style.textContent = `/* dynamic accent overrides */\n:root { /* current hue: ${getAccentHue()} */ }`;
};

const getAccentHue = () => {
  const stored = localStorage.getItem('accent-hue');
  if (stored) return parseInt(stored, 10);
  // fallback to computed value
  const val = getComputedStyle(document.documentElement).getPropertyValue('--h-accent').trim();
  return parseInt(val || '230', 10);
};

/**
 * Create / update a fully custom theme based on user parameters.
 * @param {Object} opts
 * @param {number} opts.hue base accent hue
 * @param {number} opts.contrastBoost 0-1 range to increase contrast
 * @param {string} opts.id custom theme id (default 'custom')
 */
const applyCustomTheme = ({ hue = 230, contrastBoost = 0, id = 'custom' } = {}) => {
  setAccentHue(hue, true);
  const styleId = `custom-theme-${id}`;
  let style = document.getElementById(styleId);
  if (!style) { style = document.createElement('style'); style.id = styleId; document.head.appendChild(style); }
  // Adjust background & text lightness based on contrastBoost
  const boost = Math.max(0, Math.min(1, contrastBoost));
  const darken = boost * 6; // reduce L by up to 6%
  style.textContent = `/* custom theme ${id} */\nhtml[data-theme='${id}'], body[data-theme='${id}'] {\n  --h-accent: ${hue};\n  --color-bg-app: hsl(220 20% ${98 - darken}%);\n  --color-bg-surface: hsl(0 0% ${100 - darken * 1.2}%);\n  --color-bg-elevated: hsl(220 20% ${97 - darken}%);\n  --color-text-main: hsl(220 25% ${12 + boost * 5}%);\n  --color-text-muted: hsl(220 10% ${35 - boost * 5}%);\n}`;
};

// Extend init to load accent hue
const initTheme = () => {
  const savedTheme = localStorage.getItem('preferred-theme');
  loadTheme(savedTheme || 'light');
  const savedHue = localStorage.getItem('accent-hue');
  if (savedHue) setAccentHue(parseInt(savedHue, 10), false); else injectDynamicAccentStyle();
};

// Export new functions
export { loadTheme, getCurrentTheme, setTheme, initTheme, setAccentHue, getAccentHue, applyCustomTheme };