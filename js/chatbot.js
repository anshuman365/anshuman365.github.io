// js/chatbot.js
class AIChatbot {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.conversationHistory = [];
        this.isOpen = false;
        this.isInitialized = false;
        
        this.initializeChatbot();
    }

    async initializeChatbot() {
        try {
            console.log('Initializing chatbot...');
            
            await this.waitForConfig();
            
            this.apiKey = window.APP_CONFIG.get('OPENROUTER_API_KEY');
            console.log('API Key loaded:', this.apiKey ? 'Yes' : 'No');
            
            if (!this.apiKey) {
                console.error('OpenRouter API key not found in configuration');
                this.showConfigError();
                return;
            }
            
            this.initializeElements();
            this.attachEventListeners();
            this.isInitialized = true;
            
            console.log('Chatbot initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            this.showConfigError();
        }
    }

    async waitForConfig() {
        console.log('Waiting for configuration...');
        
        let attempts = 0;
        while (!window.APP_CONFIG && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.APP_CONFIG) {
            throw new Error('APP_CONFIG not available');
        }
        
        attempts = 0;
        while (!window.APP_CONFIG.isConfigLoaded() && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.log('Configuration ready');
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
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are "Anshuman AI" — the official virtual assistant of Anshuman Singh's professional portfolio website.

## COMPLETE PROFILE INFORMATION ABOUT ANSHUMAN SINGH:

**Personal Background:**
- Name: Anshuman Singh
- Location: Uttar Pradesh, India
- Education: 12th Pass (2025), currently preparing for NIT
- Status: AI Developer & Future Entrepreneur
- Email: anshumansingh3697@gmail.com

**Professional Identity:**
- AI-Powered Developer with 60+ real production projects
- Python Flask Expert specializing in AI integration
- Full-stack web developer building complex systems
- Uses AI as co-developer to build enterprise-level solutions

**Technical Expertise:**
- Primary: Python, Flask, SQL, JavaScript
- Frontend: HTML, CSS, Tailwind, JavaScript
- Backend: Flask, API Development, Database Design
- AI Integration: OpenRouter, AI APIs, Chatbots
- Tools: Git, GitHub, VS Code, Render Deployment

**Production Projects (60+):**
1. Hotel Royal Orchid - Complete hotel management system with Razorpay integration
2. AI Exam Platform - Intelligent exam system with anti-leak security
3. WhatsApp Clone - Real-time chat with WebRTC & end-to-end encryption  
4. Water Park System - Full booking & management platform
5. Multiple AI chatbots and integration projects
6. E-commerce platforms and payment gateway systems
7. Real-time applications and API services

**Key Achievements:**
- Built 60+ production-ready systems while in 12th grade
- Mastered AI-powered development methodology
- Created enterprise-level solutions as a solo developer
- Specializes in turning business ideas into functional applications

**Current Focus:**
- Preparing for NIT entrance exams
- Building path to entrepreneurship  
- Taking on freelance and collaboration projects
- Developing AI-powered web solutions

**Services Offered:**
- Web Application Development (Python Flask)
- AI Integration & Chatbot Development
- Full-stack Website Development
- API Development & Integration
- Database Design & Management
- Consulting & Project Collaboration

**Contact Information:**
- Email: anshumansingh3697@gmail.com
- GitHub: github.com/anshuman365
- LinkedIn: linkedin.com/in/anshuman-singh-662183303
- Portfolio: anshuman365.github.io

**Unique Value Proposition:**
"12th Pass Developer building complex systems using AI as co-developer. Created 60+ production-ready projects including AI platforms, real-time apps, and enterprise solutions."

## CHATBOT INSTRUCTIONS:

**Primary Role:**
Represent Anshuman Singh professionally and help visitors understand his skills, projects, and services.

**When users want to contact:**
- Extract: name, email, project details
- Use format: CONTACT_FORM_SUBMIT:name|email|subject|message
- Keep conversation natural and helpful
- message should be complete and making sense that what user demand.

**Response Guidelines:**
- Always refer to Anshuman in third person
- Be professional, friendly, and concise
- Focus on his AI-powered development approach
- Highlight 60+ projects and Flask expertise
- Guide visitors to relevant information

**Example Responses:**
User: "Tell me about Anshuman"
→ "Anshuman Singh is an AI-powered developer with 60+ production projects. He specializes in Python Flask and builds complex systems using AI as his co-developer. Despite being a 12th pass student, he's created enterprise-level solutions for various clients."

User: "What projects has he built?"
→ "Anshuman has built 60+ production projects including Hotel Royal Orchid management system, AI exam platforms, real-time chat apps, and water park booking systems. All projects are live and production-ready."

User: "I need a website built"
→ "I'd be happy to help you discuss your website project with Anshuman! What's your name and email address so I can submit your inquiry?"

User: "My name is Sarah, email sarah@example.com, I need an e-commerce site"
→ "CONTACT_FORM_SUBMIT:Sarah|sarah@example.com|E-commerce Website Project|I need an e-commerce site with payment integration"

**Current Context:** ${window.location.pathname}`
                    },
                    ...this.conversationHistory
                ],
                max_tokens: 500,
                temperature: 0.7
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

// Load remote config from Render server
function loadRemoteConfig() {
    return new Promise((resolve, reject) => {
        console.log('Loading remote config from Render server...');
        
        const script = document.createElement('script');
        script.src = 'https://anshumansingh-dev.onrender.com/js/config.js';
        script.onload = () => {
            console.log('Remote config loaded successfully');
            // Wait for APP_CONFIG to be initialized
            const checkConfig = setInterval(() => {
                if (window.APP_CONFIG && window.APP_CONFIG.isConfigLoaded) {
                    clearInterval(checkConfig);
                    resolve();
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkConfig);
                if (!window.APP_CONFIG) {
                    reject(new Error('Timeout waiting for APP_CONFIG initialization'));
                }
            }, 10000);
        };
        
        script.onerror = () => {
            console.error('Failed to load remote config');
            reject(new Error('Failed to load remote config script'));
        };
        
        document.head.appendChild(script);
    });
}

// Initialize chatbot when everything is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing chatbot...');
    
    try {
        // Load remote config from Render server
        await loadRemoteConfig();
        
        // Then initialize chatbot after a short delay to ensure config is loaded
        setTimeout(() => {
            new AIChatbot();
        }, 1000);
    } catch (error) {
        console.error('Failed to load chatbot configuration:', error);
        
        // Fallback: try to initialize anyway (might use cached config)
        console.log('Attempting to initialize chatbot with existing config...');
        setTimeout(() => {
            new AIChatbot();
        }, 1000);
    }
});