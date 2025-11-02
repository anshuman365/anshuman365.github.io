// js/library-search.js - Complete Updated Version
class AdvancedSearch {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.filters = {
            category: '',
            encrypted: '',
            author: '',
            sortBy: 'relevance'
        };
        this.init();
    }

    async init() {
        if (!window.BookRecommender) {
            setTimeout(() => this.init(), 100);
            return;
        }
        
        await window.BookRecommender.init();
        this.createSearchUI();
        this.attachEventListeners();
        console.log('🔍 Advanced Search initialized');
    }

    createSearchUI() {
        const existingContainer = document.querySelector('.search-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200';
        searchContainer.innerHTML = this.getSearchHTML();

        const heroSection = document.querySelector('.gradient-bg');
        if (heroSection && heroSection.nextSibling) {
            heroSection.parentNode.insertBefore(searchContainer, heroSection.nextSibling);
        } else {
            const targetSection = document.querySelector('section.py-8') || document.querySelector('section.py-12');
            if (targetSection) {
                targetSection.prepend(searchContainer);
            }
        }
    }

    getSearchHTML() {
        const categories = window.BookRecommender ? window.BookRecommender.getCategories() : [];
        
        return `
            <div class="flex flex-col space-y-4">
                <div class="relative">
                    <input type="text" 
                           id="library-search" 
                           placeholder="Search books by title, author, category, or description..."
                           class="w-full px-6 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-lg">
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                </div>

                <div class="flex flex-wrap gap-4 items-center">
                    <select id="category-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                        <option value="">All Categories</option>
                        ${categories.map(cat => 
                            `<option value="${cat}">${cat.replace(/_/g, ' ')}</option>`
                        ).join('')}
                    </select>

                    <select id="encryption-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                        <option value="">All Protection Types</option>
                        <option value="true">Protected Only</option>
                        <option value="false">Open Access</option>
                    </select>

                    <select id="sort-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                        <option value="relevance">Sort by Relevance</option>
                        <option value="title">Sort by Title</option>
                        <option value="author">Sort by Author</option>
                        <option value="size">Sort by Size</option>
                    </select>

                    <button id="clear-filters" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm">
                        <i class="fas fa-times mr-2"></i>Clear Filters
                    </button>
                </div>

                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-sm text-gray-600 mr-2">Quick search:</span>
                    <button class="quick-tag px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition" data-search="python">
                        Python
                    </button>
                    <button class="quick-tag px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition" data-search="psychology">
                        Psychology
                    </button>
                    <button class="quick-tag px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition" data-search="business">
                        Business
                    </button>
                    <button class="quick-tag px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm transition" data-search="free">
                        Free Books
                    </button>
                </div>
            </div>

            <div id="search-results-info" class="hidden mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex justify-between items-center">
                    <span id="results-count" class="font-medium text-blue-800"></span>
                    <button id="close-search" class="text-blue-600 hover:text-blue-800 transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        this.searchInput = document.getElementById('library-search');
        let searchTimeout;
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });
        }

        const categoryFilter = document.getElementById('category-filter');
        const encryptionFilter = document.getElementById('encryption-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.performSearch();
            });
        }

        if (encryptionFilter) {
            encryptionFilter.addEventListener('change', (e) => {
                this.filters.encrypted = e.target.value;
                this.performSearch();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.performSearch();
            });
        }

        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        document.querySelectorAll('.quick-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const searchTerm = e.target.dataset.search;
                if (this.searchInput) {
                    this.searchInput.value = searchTerm;
                }
                this.performSearch();
            });
        });

        const closeSearch = document.getElementById('close-search');
        if (closeSearch) {
            closeSearch.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    }

    performSearch() {
        if (!window.BookRecommender) {
            console.error('BookRecommender not available');
            return;
        }

        const query = this.searchInput ? this.searchInput.value.trim() : '';
        const hasQuery = query.length > 0;
        const hasFilters = Object.values(this.filters).some(val => val !== '' && val !== 'relevance');

        if (!hasQuery && !hasFilters) {
            this.clearSearch();
            return;
        }

        console.log('🔍 Performing search:', { query, filters: this.filters });
        
        const results = window.BookRecommender.searchBooks(query, this.filters);
        console.log('📚 Search results:', results.length);
        
        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const resultsInfo = document.getElementById('search-results-info');
        const resultsCount = document.getElementById('results-count');
        const booksGrid = document.getElementById('books-grid');

        if (!resultsInfo || !resultsCount || !booksGrid) {
            console.error('Required DOM elements not found');
            return;
        }

        if (results.length === 0) {
            resultsCount.textContent = `No books found for "${query}"`;
            resultsInfo.classList.remove('hidden');
            
            booksGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">No Books Found</h3>
                    <p class="text-gray-500">Try different search terms or clear filters</p>
                    <button onclick="advancedSearch.clearSearch()" class="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
                        Clear Search
                    </button>
                </div>
            `;
            return;
        }

        resultsCount.textContent = `Found ${results.length} books for "${query}"`;
        resultsInfo.classList.remove('hidden');

        if (this.filters.sortBy !== 'relevance') {
            this.sortResults(results, this.filters.sortBy);
        }

        this.renderBooksGrid(results, booksGrid);
    }

    sortResults(results, sortBy) {
        switch (sortBy) {
            case 'title':
                results.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                results.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'size':
                results.sort((a, b) => b.original_size - a.original_size);
                break;
        }
    }

    renderBooksGrid(books, container) {
        let html = '';

        const categories = {};
        books.forEach(book => {
            if (!categories[book.category]) {
                categories[book.category] = [];
            }
            categories[book.category].push(book);
        });

        if (Object.keys(categories).length === 0) {
            html = this.renderBooksList(books);
        } else {
            Object.entries(categories).forEach(([category, categoryBooks]) => {
                html += `
                    <div class="col-span-full mb-8">
                        <h3 class="text-2xl font-bold text-primary mb-4 capitalize border-b-2 border-primary/20 pb-2">
                            ${category.replace(/_/g, ' ')} (${categoryBooks.length})
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                `;
                
                html += this.renderBooksList(categoryBooks);
                
                html += `
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    renderBooksList(books) {
        return books.map(book => {
            const coverPath = book.cover_image ? 
                `assets/pdf/cover_img/${book.cover_image}` : 
                null;
            
            const isEncrypted = book.encrypted !== false;
            const isDownloadable = book.downloadable === true;

            return `
                <div class="book-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                    <div class="h-64 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        ${coverPath ? `
                            <img src="${coverPath}" 
                                 alt="${book.title} - Cover" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                 loading="lazy"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 flex-col text-center p-4">
                                <i class="fas fa-book text-4xl text-primary opacity-20 mb-2"></i>
                                <h4 class="text-sm font-bold text-gray-800 line-clamp-2">${book.title}</h4>
                            </div>
                        ` : `
                            <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 flex-col text-center p-4">
                                <i class="fas fa-book text-4xl text-primary opacity-20 mb-2"></i>
                                <h4 class="text-sm font-bold text-gray-800 line-clamp-2">${book.title}</h4>
                            </div>
                        `}
                        <div class="absolute top-3 left-3 bg-white/90 text-xs px-2 py-1 rounded flex items-center space-x-1">
                            ${isEncrypted ? 
                                '<i class="fas fa-lock text-blue-600"></i><span class="text-blue-600 font-medium">Protected</span>' : 
                                '<i class="fas fa-lock-open text-green-600"></i><span class="text-green-600 font-medium">Free</span>'
                            }
                        </div>
                        <div class="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                            ${this.formatFileSize(book.original_size)}
                        </div>
                        ${isDownloadable ? `
                            <div class="absolute bottom-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                                <i class="fas fa-download"></i>
                                <span>Downloadable</span>
                            </div>
                        ` : `
                            <div class="absolute bottom-3 left-3 bg-primary/90 text-white px-2 py-1 rounded text-xs capitalize">
                                ${book.category.replace(/_/g, ' ')}
                            </div>
                        `}
                    </div>
                    <div class="p-5">
                        <h3 class="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">${book.title}</h3>
                        <p class="text-gray-600 text-sm mb-2 italic">by ${book.author}</p>
                        <p class="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">${book.description}</p>
                        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span class="text-xs text-gray-500">
                                ${this.getPageCountText(book)}
                            </span>
                            <button onclick="library.openBook('${book.id}')" 
                                    class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition flex items-center space-x-2 group/btn shadow-md hover:shadow-lg">
                                <i class="fas fa-eye group-hover/btn:animate-pulse"></i>
                                <span class="text-sm font-medium">Read Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearFilters() {
        this.filters = {
            category: '',
            encrypted: '',
            author: '',
            sortBy: 'relevance'
        };

        const categoryFilter = document.getElementById('category-filter');
        const encryptionFilter = document.getElementById('encryption-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) categoryFilter.value = '';
        if (encryptionFilter) encryptionFilter.value = '';
        if (sortFilter) sortFilter.value = 'relevance';

        this.performSearch();
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.clearFilters();
        
        const resultsInfo = document.getElementById('search-results-info');
        if (resultsInfo) {
            resultsInfo.classList.add('hidden');
        }
        
        if (window.library) {
            window.library.renderBooks();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    getPageCountText(book) {
        const sizeMB = book.original_size / (1024 * 1024);
        let estimatedPages = Math.round(sizeMB * 10);
        
        if (estimatedPages < 10) estimatedPages = 10;
        if (estimatedPages > 500) estimatedPages = 500;
        
        return `~${estimatedPages} pages`;
    }
}

let advancedSearch;

document.addEventListener('DOMContentLoaded', () => {
    advancedSearch = new AdvancedSearch();
    window.advancedSearch = advancedSearch;
});