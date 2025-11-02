// js/library-recommendations-ui.js - Complete Updated Version
class RecommendationsUI {
    constructor() {
        this.recommender = window.BookRecommender;
        this.init();
    }

    async init() {
        if (!this.recommender) {
            setTimeout(() => this.init(), 100);
            return;
        }

        await this.recommender.init();
        this.renderRecommendations();
        this.attachEventListeners();
        
        const recommendationsSection = document.getElementById('ai-recommendations');
        if (recommendationsSection) {
            recommendationsSection.classList.remove('hidden');
        }
    }

    async renderRecommendations() {
        await this.renderPersonalized();
        await this.renderTrending();
        await this.renderRecent();
    }

    async renderPersonalized() {
        const container = document.getElementById('personalized-recommendations');
        if (!container) return;

        const recommendations = this.recommender.getPersonalizedRecommendations(4);
        
        if (recommendations.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('personalized');
            return;
        }

        container.innerHTML = recommendations.map(book => 
            this.getBookCardHTML(book, 'personalized')
        ).join('');
    }

    async renderTrending() {
        const container = document.getElementById('trending-books');
        if (!container) return;

        const trending = this.recommender.getTrendingBooks(4);
        
        if (trending.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('trending');
            return;
        }

        container.innerHTML = trending.map(book => 
            this.getBookCardHTML(book, 'trending')
        ).join('');
    }

    async renderRecent() {
        const container = document.getElementById('recent-books');
        if (!container) return;

        const recent = this.recommender.readingHistory
            .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
            .slice(0, 4)
            .map(entry => this.recommender.booksMetadata[entry.bookId])
            .filter(book => book);
        
        if (recent.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('recent');
            return;
        }

        container.innerHTML = recent.map(book => 
            this.getBookCardHTML(book, 'recent')
        ).join('');
    }

    getBookCardHTML(book, type) {
        const coverPath = book.cover_image ? 
            `assets/pdf/cover_img/${book.cover_image}` : 
            null;
        
        const isEncrypted = book.encrypted !== false;
        const typeColors = {
            personalized: 'from-purple-500 to-pink-500',
            trending: 'from-orange-500 to-red-500',
            recent: 'from-blue-500 to-cyan-500'
        };

        return `
            <div class="recommendation-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div class="h-48 relative overflow-hidden">
                    ${coverPath ? `
                        <img src="${coverPath}" 
                             alt="${book.title}" 
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                             loading="lazy"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="absolute inset-0 hidden items-center justify-center bg-gradient-to-br ${typeColors[type]} flex-col text-center p-4">
                            <i class="fas fa-book text-white text-4xl opacity-80"></i>
                            <h4 class="text-sm font-bold text-white mt-2 line-clamp-2">${book.title}</h4>
                        </div>
                    ` : `
                        <div class="w-full h-full bg-gradient-to-br ${typeColors[type]} flex items-center justify-center flex-col text-center p-4">
                            <i class="fas fa-book text-white text-4xl opacity-80"></i>
                            <h4 class="text-sm font-bold text-white mt-2 line-clamp-2">${book.title}</h4>
                        </div>
                    `}
                    
                    <div class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs capitalize">
                        ${type}
                    </div>
                    
                    <div class="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded flex items-center space-x-1">
                        ${isEncrypted ? 
                            '<i class="fas fa-lock text-blue-600"></i>' : 
                            '<i class="fas fa-lock-open text-green-600"></i>'
                        }
                    </div>
                </div>
                
                <div class="p-4">
                    <h4 class="font-bold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        ${book.title}
                    </h4>
                    <p class="text-gray-600 text-xs mb-2 italic">by ${book.author}</p>
                    <p class="text-gray-700 text-xs line-clamp-2 mb-3">${book.description}</p>
                    
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500 capitalize">
                            ${book.category.replace(/_/g, ' ')}
                        </span>
                        <button onclick="library.openBook('${book.id}')" 
                                class="bg-primary text-white px-3 py-1 rounded-lg hover:bg-secondary transition text-xs flex items-center space-x-1">
                            <i class="fas fa-eye"></i>
                            <span>Read</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEmptyStateHTML(type) {
        const messages = {
            personalized: 'Read more books to get personalized recommendations',
            trending: 'No trending books yet',
            recent: 'You haven\'t viewed any books recently'
        };

        return `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-book-open text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 text-sm">${messages[type]}</p>
            </div>
        `;
    }

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-recommendations');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderRecommendations();
                
                const btn = document.getElementById('refresh-recommendations');
                btn.innerHTML = '<i class="fas fa-sync-alt animate-spin mr-2"></i>Refreshing';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh';
                }, 1000);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecommendationsUI();
});