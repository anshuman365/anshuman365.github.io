// Dark Mode functionality
class DarkMode {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference or default to light
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
        
        // Add event listeners to all toggle buttons
        this.addEventListeners();
    }

    addEventListeners() {
        // Desktop toggle
        const desktopToggle = document.getElementById('dark-mode-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile toggle
        const mobileToggle = document.getElementById('dark-mode-toggle-mobile');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Floating button toggle
        const floatToggle = document.getElementById('dark-mode-float');
        if (floatToggle) {
            floatToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
            this.updateIcons('dark');
        } else {
            html.classList.remove('dark');
            this.updateIcons('light');
        }
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

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkMode();
});