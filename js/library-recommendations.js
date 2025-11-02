// js/library-recommendations.js - Complete Updated Version
class AIBookRecommender {
    constructor() {
        this.booksMetadata = {};
        this.userPreferences = this.loadUserPreferences();
        this.readingHistory = this.loadReadingHistory();
        this.recommendationModel = null;
    }

    async init() {
        await this.loadBooksMetadata();
        await this.initializeModel();
        console.log('✅ Book Recommender initialized');
    }

    async loadBooksMetadata() {
        try {
            const response = await fetch('assets/pdf/books_metadata.json');
            this.booksMetadata = await response.json();
            console.log(`📚 Loaded ${Object.keys(this.booksMetadata).length} books for recommendations`);
        } catch (error) {
            console.error('Error loading books metadata:', error);
        }
    }

    loadUserPreferences() {
        return JSON.parse(localStorage.getItem('library_preferences') || '{}');
    }

    loadReadingHistory() {
        return JSON.parse(localStorage.getItem('reading_history') || '[]');
    }

    saveUserPreferences() {
        localStorage.setItem('library_preferences', JSON.stringify(this.userPreferences));
    }

    saveReadingHistory() {
        localStorage.setItem('reading_history', JSON.stringify(this.readingHistory));
    }

    async initializeModel() {
        this.recommendationModel = {
            weights: {
                category: 0.4,
                author: 0.3,
                popularity: 0.2,
                recency: 0.1
            }
        };
    }

    recordBookView(bookId) {
        const timestamp = new Date().toISOString();
        const existingIndex = this.readingHistory.findIndex(entry => entry.bookId === bookId);
        
        if (existingIndex !== -1) {
            this.readingHistory[existingIndex].lastViewed = timestamp;
            this.readingHistory[existingIndex].viewCount++;
        } else {
            this.readingHistory.push({
                bookId,
                lastViewed: timestamp,
                viewCount: 1,
                firstViewed: timestamp
            });
        }

        const book = this.booksMetadata[bookId];
        if (book) {
            if (!this.userPreferences.categories) this.userPreferences.categories = {};
            if (!this.userPreferences.authors) this.userPreferences.authors = {};
            
            this.userPreferences.categories[book.category] = 
                (this.userPreferences.categories[book.category] || 0) + 1;
            this.userPreferences.authors[book.author] = 
                (this.userPreferences.authors[book.author] || 0) + 1;
        }

        this.saveReadingHistory();
        this.saveUserPreferences();
    }

    calculateBookScore(book, userPreferences, readingHistory) {
        let score = 0;
        const weights = this.recommendationModel.weights;

        if (userPreferences.categories && userPreferences.categories[book.category]) {
            score += weights.category * userPreferences.categories[book.category];
        }

        if (userPreferences.authors && userPreferences.authors[book.author]) {
            score += weights.author * userPreferences.authors[book.author];
        }

        const popularity = Math.min(book.original_size / (10 * 1024 * 1024), 1);
        score += weights.popularity * popularity;

        score += weights.recency * 0.5;

        return score;
    }

    getPersonalizedRecommendations(limit = 6) {
        const recommendations = Object.values(this.booksMetadata)
            .map(book => ({
                book,
                score: this.calculateBookScore(book, this.userPreferences, this.readingHistory)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.book);

        return recommendations;
    }

    getSimilarBooks(bookId, limit = 4) {
        const targetBook = this.booksMetadata[bookId];
        if (!targetBook) return [];

        const similarBooks = Object.values(this.booksMetadata)
            .filter(book => book.id !== bookId)
            .map(book => ({
                book,
                similarity: this.calculateSimilarity(targetBook, book)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.book);

        return similarBooks;
    }

    calculateSimilarity(bookA, bookB) {
        let similarity = 0;

        if (bookA.category === bookB.category) similarity += 0.4;

        if (bookA.author === bookB.author) similarity += 0.3;

        const wordsA = new Set(bookA.description.toLowerCase().split(/\s+/));
        const wordsB = new Set(bookB.description.toLowerCase().split(/\s+/));
        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
        similarity += 0.3 * jaccardSimilarity;

        return similarity;
    }

    getTrendingBooks(limit = 4) {
        const trending = this.readingHistory
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, limit)
            .map(entry => this.booksMetadata[entry.bookId])
            .filter(book => book);

        return trending;
    }

    searchBooks(query, filters = {}) {
        console.log('🔍 Searching books with:', { query, filters });
        
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        if (searchTerms.length === 0 && Object.values(filters).every(val => !val)) {
            return Object.values(this.booksMetadata);
        }

        const scoredBooks = Object.values(this.booksMetadata).map(book => {
            let score = 0;

            const titleScore = this.calculateTermScore(book.title, searchTerms);
            score += titleScore * 0.5;

            const authorScore = this.calculateTermScore(book.author, searchTerms);
            score += authorScore * 0.3;

            const descScore = this.calculateTermScore(book.description, searchTerms);
            score += descScore * 0.1;

            const categoryScore = this.calculateTermScore(book.category, searchTerms);
            score += categoryScore * 0.1;

            if (filters.category && book.category !== filters.category) {
                score = -1;
            }

            if (filters.encrypted !== undefined && filters.encrypted !== '') {
                const wantsEncrypted = filters.encrypted === 'true';
                if (book.encrypted !== wantsEncrypted) {
                    score = -1;
                }
            }

            return { book, score };
        });

        const validResults = scoredBooks.filter(item => item.score > 0);
        
        console.log(`📊 Search results: ${validResults.length} books found`);
        
        return validResults
            .sort((a, b) => b.score - a.score)
            .map(item => item.book);
    }

    calculateTermScore(text, searchTerms) {
        if (!text || searchTerms.length === 0) return 0;
        
        const textLower = text.toLowerCase();
        let score = 0;

        for (const term of searchTerms) {
            if (textLower.includes(term)) {
                score += 1;
                if (textLower.startsWith(term)) {
                    score += 0.5;
                }
                const occurrences = (textLower.match(new RegExp(term, 'g')) || []).length;
                score += (occurrences - 1) * 0.2;
            }
        }

        return score;
    }

    getCategories() {
        const categories = new Set();
        Object.values(this.booksMetadata).forEach(book => {
            categories.add(book.category);
        });
        return Array.from(categories);
    }
}

window.BookRecommender = new AIBookRecommender();