// js/config.js
class Config {
    constructor() {
        this.values = {};
        this.isLoaded = false;
        this.loadConfig();
    }

    async loadConfig() {
        try {
            console.log('Loading configuration...');
            
            // First try to load from env-config.js (this works in static hosting)
            await this.loadFromJSConfig();
            
            // If we still don't have the API key, try .env as fallback
            if (!this.values.OPENROUTER_API_KEY) {
                await this.loadFromEnvFile();
            }
            
            this.isLoaded = true;
            console.log('Configuration loaded successfully:', Object.keys(this.values));
            
        } catch (error) {
            console.warn('Config loading failed:', error);
            this.isLoaded = true; // Mark as loaded anyway to prevent infinite waiting
        }
    }

    async loadFromJSConfig() {
        return new Promise((resolve) => {
            // Check if ENV_CONFIG is already available (script might be loaded already)
            if (window.ENV_CONFIG) {
                console.log('Found ENV_CONFIG in window');
                this.values = { ...window.ENV_CONFIG };
                resolve();
                return;
            }
            
            // Try to load the env-config.js file
            const script = document.createElement('script');
            script.src = './js/env-config.js';
            script.onload = () => {
                console.log('env-config.js loaded');
                if (window.ENV_CONFIG) {
                    this.values = { ...window.ENV_CONFIG };
                }
                resolve();
            };
            script.onerror = () => {
                console.warn('Failed to load env-config.js');
                resolve(); // Resolve anyway to continue
            };
            document.head.appendChild(script);
        });
    }

    async loadFromEnvFile() {
        try {
            // Load from root directory .env file
            const response = await fetch('/.env');
            if (response.ok) {
                const envContent = await response.text();
                this.parseEnvContent(envContent);
                console.log('Successfully loaded .env from root directory');
            } else {
                console.warn('.env file not found in root directory');
            }
        } catch (error) {
            console.warn('Failed to load .env file from root:', error);
            // .env file not available, which is normal in production
        }
    }

    parseEnvContent(content) {
        const lines = content.split('\n');
        lines.forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match != null) {
                const key = match[1];
                let value = match[2] || '';
                
                // Remove surrounding quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }
                
                // Trim whitespace
                value = value.trim();
                
                this.values[key] = value;
                console.log(`Loaded env variable: ${key} = ${value ? '***' + value.slice(-2) : 'empty'}`);
            }
        });
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