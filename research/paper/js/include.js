// include.js - Template include system for Anshuman Singh's portfolio

class TemplateLoader {
    constructor() {
        this.templates = {
            nav: 'https://anshuman365.github.io/templates/nav.html',
            footer: 'https://anshuman365.github.io/templates/footer.html'
        };
        this.loadedTemplates = new Map();
    }

    // Load a template from file
    async loadTemplate(templateName) {
        if (this.loadedTemplates.has(templateName)) {
            return this.loadedTemplates.get(templateName);
        }

        try {
            const response = await fetch(this.templates[templateName]);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templateName}`);
            }
            
            const html = await response.text();
            this.loadedTemplates.set(templateName, html);
            return html;
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            return `<div class="error">Error loading ${templateName}</div>`;
        }
    }

    // Insert template into element
    async insertTemplate(templateName, elementId) {
        const template = await this.loadTemplate(templateName);
        const element = document.getElementById(elementId);
        
        if (element) {
            element.innerHTML = template;
            
            // Initialize components after DOM update
            await this.initializeComponents(templateName);
            
            console.log(`Template ${templateName} loaded into ${elementId}`);
        } else {
            console.warn(`Element ${elementId} not found for template ${templateName}`);
        }
    }

    // Initialize components based on template
    async initializeComponents(templateName) {
        switch (templateName) {
            case 'nav':
                await this.initializeNavigation();
                // Initialize dark mode after nav is loaded
                if (typeof window.initializeDarkMode === 'function') {
                    console.log('Initializing dark mode after nav load...');
                    window.initializeDarkMode();
                }
                break;
            case 'footer':
                this.initializeFooter();
                break;
        }
    }

    // Initialize navigation functionality with retry logic
    async initializeNavigation() {
        const maxRetries = 5;
        const retryDelay = 200;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            if (typeof window.initNavigation === 'function') {
                console.log('Calling initNavigation...');
                window.initNavigation();
                return;
            }
            
            console.log(`Waiting for initNavigation (attempt ${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
        console.error('initNavigation function not found after retries');
    }

    // Initialize footer functionality
    initializeFooter() {
        console.log('Footer initialized');
    }

    // Load all templates
    async loadAllTemplates() {
        try {
            // Load navigation first
            if (document.getElementById('nav-placeholder')) {
                console.log('Loading navigation template...');
                await this.insertTemplate('nav', 'nav-placeholder');
            }
            
            // Load footer
            if (document.getElementById('footer-placeholder')) {
                console.log('Loading footer template...');
                await this.insertTemplate('footer', 'footer-placeholder');
            }
            
            console.log('All templates loaded successfully');
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }
}

// Create global instance
const templateLoader = new TemplateLoader();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing templates...');
        templateLoader.loadAllTemplates();
    });
} else {
    console.log('DOM already loaded, initializing templates...');
    templateLoader.loadAllTemplates();
}