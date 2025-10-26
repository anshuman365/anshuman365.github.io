// js/chatbot.js
class AIChatbot {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.config = null;
        this.conversationHistory = [];
        this.isOpen = false;
        this.isInitialized = false;
        
        this.initializeChatbot();
    }

    async initializeChatbot() {
        try {
            console.log('Initializing chatbot...');
            
            // Pehle configuration load karein
            await this.loadConfiguration();
            
            // Phir API key backend se lein
            await this.getApiKeyFromBackend();
            
            if (!this.apiKey) {
                console.error('OpenRouter API key not found from backend');
                this.showConfigError();
                return;
            }
            
            this.initializeElements();
            this.attachEventListeners();
            this.isInitialized = true;
            
            console.log('Chatbot initialized successfully with configuration');
            
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            this.showConfigError();
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/config/chatbot-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
            console.log('Chatbot configuration loaded successfully');
        } catch (error) {
            console.error('Error loading chatbot configuration:', error);
            // Fallback to default configuration
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            system_prompt: "You are a helpful AI assistant for Anshuman Singh's portfolio.",
            model: "openai/gpt-3.5-turbo",
            max_tokens: 500,
            temperature: 0.7,
            backend_url: "https://nexoraindustries365.pythonanywhere.com"
        };
    }

    getSystemPrompt() {
        if (!this.config || !this.config.system_prompt) {
            return this.getDefaultConfig().system_prompt;
        }
        
        // Replace dynamic content with current page
        return this.config.system_prompt.replace('{{currentPage}}', window.location.pathname);
    }

    async getApiKeyFromBackend() {
        try {
            console.log('Fetching API key from backend...');
            
            const backendUrl = this.config?.backend_url || 'https://nexoraindustries365.pythonanywhere.com';
            
            const response = await fetch(`${backendUrl}/api/config/openrouter-api-key`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.openrouter_api_key) {
                    this.apiKey = data.openrouter_api_key;
                    console.log('API key successfully retrieved from backend');
                    return true;
                } else {
                    console.error('Backend returned error:', data.message);
                    return false;
                }
            } else {
                console.error('Backend request failed:', response.status);
                return false;
            }
            
        } catch (error) {
            console.error('Error fetching API key from backend:', error);
            return false;
        }
    }

    initializeElements() {
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.closeBtn = document.getElementById('chatbot-close');
        this.chatWindow = document.getElementById('chatbot-window');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
    }

    attachEventListeners() {
        if (!this.toggleBtn) {
            console.error('Chatbot toggle button not found');
            return;
        }

        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.chatWindow.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (!this.isInitialized) {
            this.showNotInitializedMessage();
            return;
        }

        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.remove('hidden');
            this.input.focus();
            this.toggleBtn.classList.remove('animate-bounce');
        } else {
            this.chatWindow.classList.add('hidden');
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.add('hidden');
    }

    async sendMessage() {
        if (!this.isInitialized) {
            this.showNotInitializedMessage();
            return;
        }

        const message = this.input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            console.error('Chatbot error:', error);
        }
    }

    async getAIResponse(userMessage) {
        // Add user message to conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Anshuman Singh Portfolio'
            },
            body: JSON.stringify({
                model: this.config?.model || 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    ...this.conversationHistory
                ],
                max_tokens: this.config?.max_tokens || 500,
                temperature: this.config?.temperature || 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        let aiResponse = data.choices[0].message.content;

        // Check if the AI response contains contact form submission
        if (aiResponse.includes('CONTACT_FORM_SUBMIT:')) {
            await this.handleContactFormSubmission(aiResponse);
            // Remove the special marker from the response shown to user
            aiResponse = "✅ Great! I've submitted your contact form to Anshuman. He'll get back to you soon with details about your project!";
        }

        // Add AI response to conversation history
        this.conversationHistory.push({ role: 'assistant', content: aiResponse });

        // Keep conversation history manageable (last 10 messages)
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }

        return aiResponse;
    }

    async handleContactFormSubmission(aiResponse) {
        // Extract contact data from the AI response
        const contactData = this.extractContactData(aiResponse);
        
        if (contactData) {
            await this.submitToFormspree(contactData);
        }
    }

    extractContactData(aiResponse) {
        const match = aiResponse.match(/CONTACT_FORM_SUBMIT:([^|]+)\|([^|]+)\|([^|]+)\|(.+)/);
        if (match) {
            return {
                name: match[1].trim(),
                email: match[2].trim(),
                subject: match[3].trim(),
                message: match[4].trim()
            };
        }
        return null;
    }

    async submitToFormspree(contactData) {
        try {
            console.log('Submitting to Formspree:', contactData);
            
            // Create FormData object like the contact page does
            const formData = new FormData();
            formData.append('name', contactData.name);
            formData.append('email', contactData.email);
            formData.append('subject', contactData.subject);
            formData.append('message', contactData.message);
            
            // Submit to Formspree (same endpoint as contact page)
            const response = await fetch('https://formspree.io/f/mdklpdpo', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Formspree submission successful');
                this.addMessage('📧 Your message has been sent successfully! Anshuman will reply to ' + contactData.email + ' soon.', 'system');
            } else {
                console.error('Formspree submission failed:', response.status);
                this.addMessage('❌ There was an issue sending your message. Please try the contact form on the website.', 'system');
            }
            
        } catch (error) {
            console.error('Formspree submission error:', error);
            this.addMessage('❌ There was an error submitting the form. Please email anshumansingh3697@gmail.com directly.', 'system');
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-2 ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;
        
        const avatar = sender === 'user' 
            ? '<div class="bg-secondary text-white p-2 rounded-full"><i class="fas fa-user text-sm"></i></div>'
            : '<div class="bg-primary text-white p-2 rounded-full"><i class="fas fa-robot text-sm"></i></div>';
        
        const bubbleClass = sender === 'user' 
            ? 'bg-primary text-white rounded-lg p-3 max-w-[80%]'
            : 'bg-gray-100 rounded-lg p-3 max-w-[80%]';
        
        messageDiv.innerHTML = `
            ${avatar}
            <div class="${bubbleClass}">
                <p class="text-sm whitespace-pre-line">${this.escapeHtml(content)}</p>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-start space-x-2';
        typingDiv.innerHTML = `
            <div class="bg-primary text-white p-2 rounded-full">
                <i class="fas fa-robot text-sm"></i>
            </div>
            <div class="bg-gray-100 rounded-lg p-3">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showConfigError() {
        console.error('Chatbot failed to initialize. Please check your configuration.');
        this.initializeElements();
        this.attachEventListeners();
        this.addMessage('⚠️ Chatbot is currently unavailable due to configuration issues. Please try again later or contact Anshuman directly.', 'assistant');
    }

    showNotInitializedMessage() {
        this.addMessage('Chatbot is still initializing. Please wait a moment and try again.', 'assistant');
    }
}

// Initialize chatbot when everything is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chatbot...');
    new AIChatbot();
});