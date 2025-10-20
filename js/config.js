// js/config.js
class Config {
    constructor() {
        this.values = {};
        this.isLoaded = false;
        this.backendUrl = 'https://nexoraindustries365.pythonanywhere.com';
        this.loadConfig();
    }

    async loadConfig() {
        try {
            console.log('Loading configuration from backend...');
            
            // Try to get API key from backend
            const backendSuccess = await this.loadFromBackend();
            
            if (!backendSuccess) {
                console.log('Backend failed, chatbot will use its own backend connection');
                // Chatbot will handle its own backend connection
            }
            
            this.isLoaded = true;
            console.log('Configuration system ready');
            
        } catch (error) {
            console.warn('Config loading failed:', error);
            this.isLoaded = true;
        }
    }

    async loadFromBackend() {
        try {
            console.log('Trying to load from backend...');
            
            const response = await fetch(`${this.backendUrl}/api/config/openrouter-api-key`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.openrouter_api_key) {
                    this.values.OPENROUTER_API_KEY = data.openrouter_api_key;
                    console.log('Successfully loaded API key from backend in config');
                    return true;
                }
            }
            return false;
            
        } catch (error) {
            console.warn('Failed to load from backend in config:', error);
            return false;
        }
    }

    get(key, defaultValue = '') {
        return this.values[key] || defaultValue;
    }

    isConfigLoaded() {
        return this.isLoaded;
    }
}

// Create global config instance
window.APP_CONFIG = new Config();