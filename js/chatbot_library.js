// js/chatbot_library.js - Fully AI-driven with book data in system prompt
class LibraryChatbot {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.config = null;
        this.conversationHistory = [];
        this.isOpen = false;
        this.isInitialized = false;
        this.booksMetadata = {};
        this.categories = {};
        
        this.initializeChatbot();
    }

    async initializeChatbot() {
        try {
            console.log('Initializing Library Chatbot...');
            
            // Load books metadata first
            await this.loadBooksMetadata();
            
            // Load configuration
            await this.loadConfiguration();
            
            // Get API key from backend
            await this.getApiKeyFromBackend();
            
            if (!this.apiKey) {
                console.error('OpenRouter API key not found from backend');
                this.showConfigError();
                return;
            }
            
            this.initializeElements();
            this.attachEventListeners();
            this.isInitialized = true;
            
            console.log('Library Chatbot initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize library chatbot:', error);
            this.showConfigError();
        }
    }

    async loadConfiguration() {
        try {
            console.log('Loading library chatbot configuration...');
            
            const configPaths = [
                '/config/chatbot-config-library.json',
                'config/chatbot-config-library.json',
                './config/chatbot-config-library.json',
                'chatbot-config-library.json'
            ];
            
            let configLoaded = false;
            
            for (const path of configPaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        this.config = await response.json();
                        console.log('Library chatbot configuration loaded successfully from:', path);
                        configLoaded = true;
                        break;
                    }
                } catch (error) {
                    console.log(`Failed to load config from ${path}, trying next...`);
                }
            }
            
            if (!configLoaded) {
                console.log('Using default configuration for library chatbot');
                this.config = this.getDefaultConfig();
            }
            
        } catch (error) {
            console.error('Error loading library chatbot configuration:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        const bookData = this.generateBookDataForAI();
        
        return {
            system_prompt: `You are a friendly and helpful library assistant for Anshuman Singh's Digital Library.

ABOUT THE LIBRARY:
- This is a digital library with PDF books
- Some books are encrypted (protected) and can only be read online
- Some books are free and can be downloaded
- Books are organized by categories

COMPLETE BOOK CATALOG (${bookData.totalBooks} books across ${bookData.totalCategories} categories):

${bookData.categoriesList}

IMPORTANT INSTRUCTIONS:
1. Keep responses VERY SHORT and conversational (1-2 sentences maximum)
2. Be natural, friendly, and helpful like a librarian
3. Focus on book recommendations and helping users find what they want
4. When recommending books, mention if they're free (downloadable) or protected (online only)
5. Never use markdown, formatting, or special characters
6. Just use plain, friendly text
7. If you don't know something, be honest and suggest using the search feature

RESPONSE EXAMPLES:
User: "hi"
You: "Hello! I can help you find books in our library. What are you interested in?"

User: "programming books"
You: "We have great programming books! Check out Python guides and web development books. Many are free to download."

User: "what books do you have"
You: "We have books on programming, psychology, business, philosophy and more! Any specific interest?"`,
            model: "openai/gpt-3.5-turbo",
            max_tokens: 100, // Very short responses
            temperature: 0.8,
            backend_url: "https://nexoraindustries365.pythonanywhere.com"
        };
    }

    generateBookDataForAI() {
        const totalBooks = Object.keys(this.booksMetadata).length;
        const categories = {};
        
        Object.values(this.booksMetadata).forEach(book => {
            if (!categories[book.category]) {
                categories[book.category] = [];
            }
            categories[book.category].push(book);
        });

        let categoriesList = '';
        Object.entries(categories).forEach(([category, books]) => {
            const categoryName = category.replace(/_/g, ' ');
            const freeCount = books.filter(book => book.encrypted === false).length;
            const protectedCount = books.length - freeCount;
            
            categoriesList += `\n${categoryName.toUpperCase()} (${books.length} books):\n`;
            
            books.forEach(book => {
                const status = book.encrypted === false ? 'FREE (downloadable)' : 'PROTECTED (online only)';
                categoriesList += `- "${book.title}" by ${book.author} - ${status}\n`;
            });
        });

        return {
            totalBooks: totalBooks,
            totalCategories: Object.keys(categories).length,
            categoriesList: categoriesList
        };
    }

    getSystemPrompt() {
        if (!this.config || !this.config.system_prompt) {
            return this.getDefaultConfig().system_prompt;
        }
        
        // If the config has template variables, replace them with current book data
        const bookData = this.generateBookDataForAI();
        let prompt = this.config.system_prompt;
        
        prompt = prompt.replace('${bookSummary.summary}', `Total Books: ${bookData.totalBooks}`);
        prompt = prompt.replace('${bookSummary.categories}', bookData.categoriesList);
        prompt = prompt.replace('${bookSummary.totalBooks}', bookData.totalBooks);
        prompt = prompt.replace('${bookSummary.totalCategories}', bookData.totalCategories);
        
        return prompt;
    }

    async getApiKeyFromBackend() {
        try {
            console.log('Fetching API key from backend for library chatbot...');
            
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
                    console.log('API key successfully retrieved from backend for library chatbot');
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
            console.error('Error fetching API key from backend for library chatbot:', error);
            return false;
        }
    }

    async loadBooksMetadata() {
        try {
            console.log('Loading books metadata...');
            const response = await fetch('assets/pdf/books_metadata.json');
            if (!response.ok) {
                throw new Error(`Failed to load books metadata: ${response.status}`);
            }
            this.booksMetadata = await response.json();
            this.processCategories();
            console.log(` Loaded ${Object.keys(this.booksMetadata).length} books for library chatbot`);
        } catch (error) {
            console.error('Error loading books metadata for chatbot:', error);
            this.booksMetadata = {};
        }
    }

    processCategories() {
        this.categories = {};
        Object.values(this.booksMetadata).forEach(book => {
            if (!this.categories[book.category]) {
                this.categories[book.category] = [];
            }
            this.categories[book.category].push(book);
        });
    }

    initializeElements() {
        this.toggleBtn = document.getElementById('library-chatbot-toggle');
        this.closeBtn = document.getElementById('library-chatbot-close');
        this.chatWindow = document.getElementById('library-chatbot-window');
        this.messagesContainer = document.getElementById('library-chatbot-messages');
        this.input = document.getElementById('library-chatbot-input');
        this.sendBtn = document.getElementById('library-chatbot-send');
        
        if (!this.toggleBtn) {
            this.createChatbotUI();
        }
    }

    createChatbotUI() {
        const chatbotHTML = `
            <button id="library-chatbot-toggle" class="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center group">
                <i class="fas fa-robot text-xl group-hover:scale-110 transition-transform"></i>
                <span class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">AI</span>
            </button>

            <div id="library-chatbot-window" class="fixed bottom-24 left-6 z-40 w-96 max-h-[80vh] min-h-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 hidden flex-col">
                <div class="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-2xl flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-robot text-xl"></i>
                        <div>
                            <h3 class="font-bold">Library Assistant</h3>
                            <p class="text-xs opacity-90">Ask me about books!</p>
                        </div>
                    </div>
                    <button id="library-chatbot-close" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div id="library-chatbot-messages" class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50" style="max-height: calc(80vh - 160px); min-height: 200px;">
                    <div class="flex items-start space-x-2">
                        <div class="bg-primary text-white p-2 rounded-full">
                            <i class="fas fa-robot text-sm"></i>
                        </div>
                        <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p class="text-sm whitespace-pre-line">Hi! I'm your library assistant. I can help you find books and recommendations. What would you like to read today?</p>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div class="flex space-x-2">
                        <input 
                            type="text" 
                            id="library-chatbot-input" 
                            placeholder="Ask about books or recommendations..."
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        >
                        <button id="library-chatbot-send" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 text-center">
                        Powered by AI • Natural conversations
                    </p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        this.initializeElements();
    }

    attachEventListeners() {
        if (!this.toggleBtn) {
            console.error('Library chatbot toggle button not found');
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
            setTimeout(() => this.scrollToBottom(), 100);
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

        this.addMessage(message, 'user');
        this.input.value = '';

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I had trouble responding. Please try again.', 'assistant');
            console.error('Library chatbot error:', error);
        }
    }

    async getAIResponse(userMessage) {
        // COMPLETELY REMOVED ALL PREdefined responses
        // Everything is handled by AI with book data in system prompt
        return await this.getGeneralAIResponse(userMessage);
    }

    async getGeneralAIResponse(userMessage) {
        try {
            this.conversationHistory.push({ role: 'user', content: userMessage });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Digital Library'
                },
                body: JSON.stringify({
                    model: this.config?.model || 'openai/ggpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt()
                        },
                        ...this.conversationHistory
                    ],
                    max_tokens: this.config?.max_tokens || 100,
                    temperature: this.config?.temperature || 0.8
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            let aiResponse = data.choices[0].message.content;

            // Clean up response
            aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim();

            this.conversationHistory.push({ role: 'assistant', content: aiResponse });

            // Keep conversation manageable
            if (this.conversationHistory.length > 8) {
                this.conversationHistory = this.conversationHistory.slice(-8);
            }

            return aiResponse;
            
        } catch (error) {
            console.error('Error in getGeneralAIResponse:', error);
            return "I'm here to help you find books in our library!";
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
        typingDiv.id = 'library-typing-indicator';
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
        const typingIndicator = document.getElementById('library-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showConfigError(message = 'Library assistant is taking a break.') {
        console.error('Chatbot configuration error:', message);
        this.initializeElements();
        this.attachEventListeners();
        
        if (this.isOpen) {
            this.addMessage(` ${message} You can still browse books using the search above.`, 'assistant');
        }
    }

    showNotInitializedMessage() {
        this.addMessage('Just getting ready... try again in a moment!', 'assistant');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing library chatbot...');
    new LibraryChatbot();
});