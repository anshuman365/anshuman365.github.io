// Dark Mode functionality with template support
class DarkMode {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply theme immediately
        this.applyTheme(this.currentTheme);
        
        // Add event listeners with retry for template elements
        this.initializeWithRetry();
    }

    initializeWithRetry() {
        const maxRetries = 10;
        const retryDelay = 300;
        let attempts = 0;

        const tryInitialize = () => {
            attempts++;
            
            // Check if all required elements exist
            const desktopToggle = document.getElementById('dark-mode-toggle');
            const mobileToggle = document.getElementById('dark-mode-toggle-mobile');
            const floatToggle = document.getElementById('dark-mode-float');
            
            if (desktopToggle || mobileToggle || floatToggle) {
                console.log('Dark mode elements found, attaching event listeners...');
                this.addEventListeners();
                return;
            }
            
            if (attempts < maxRetries) {
                console.log(`Dark mode elements not found, retrying... (${attempts}/${maxRetries})`);
                setTimeout(tryInitialize, retryDelay);
            } else {
                console.warn('Dark mode elements not found after retries');
            }
        };

        tryInitialize();
    }

    addEventListeners() {
        // Desktop toggle
        const desktopToggle = document.getElementById('dark-mode-toggle');
        if (desktopToggle) {
            // Remove existing event listeners to prevent duplicates
            desktopToggle.replaceWith(desktopToggle.cloneNode(true));
            const newDesktopToggle = document.getElementById('dark-mode-toggle');
            newDesktopToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile toggle
        const mobileToggle = document.getElementById('dark-mode-toggle-mobile');
        if (mobileToggle) {
            mobileToggle.replaceWith(mobileToggle.cloneNode(true));
            const newMobileToggle = document.getElementById('dark-mode-toggle-mobile');
            newMobileToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Floating button toggle
        const floatToggle = document.getElementById('dark-mode-float');
        if (floatToggle) {
            floatToggle.replaceWith(floatToggle.cloneNode(true));
            const newFloatToggle = document.getElementById('dark-mode-float');
            newFloatToggle.addEventListener('click', () => this.toggleTheme());
        }

        console.log('Dark mode event listeners attached');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        console.log(`Theme changed to: ${this.currentTheme}`);
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        this.updateIcons(theme);
    }

    updateIcons(theme) {
        const moonIcons = [
            document.getElementById('dark-mode-icon'),
            document.getElementById('dark-mode-icon-mobile'),
            document.getElementById('dark-mode-float-icon')
        ];

        moonIcons.forEach(icon => {
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun text-yellow-400';
                } else {
                    icon.className = 'fas fa-moon text-gray-700';
                }
            }
        });
    }
}

// Global instance
let darkModeInstance = null;

// Initialize dark mode - call this after templates are loaded
function initializeDarkMode() {
    if (!darkModeInstance) {
        darkModeInstance = new DarkMode();
        console.log('Dark mode initialized');
    }
    return darkModeInstance;
}

// Auto-initialize when DOM is ready, but also allow manual initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for templates to load
        setTimeout(initializeDarkMode, 1000);
    });
} else {
    setTimeout(initializeDarkMode, 1000);
}

// Make function available globally for template system
window.initializeDarkMode = initializeDarkMode;