// js/library-security.js
class SecurePDFLibrary {
    constructor() {
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.pdfjsLib = null;
        this.booksMetadata = {};
        this.currentScale = 1.0;
        this.isRendering = false;
        this.renderQueue = [];
        
        this.init();
    }

    async init() {
        console.log('🔄 Initializing PDF Library...');
        await this.loadPDFJS();
        await this.loadBooksMetadata();
        this.setupEventListeners();
        this.renderBooks();
    }

    async loadPDFJS() {
        // Load PDF.js from CDN
        if (!window.pdfjsLib) {
            console.log('📦 Loading PDF.js...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            
            // Load worker separately
            const workerScript = document.createElement('script');
            workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            document.head.appendChild(workerScript);
            
            this.pdfjsLib = window.pdfjsLib;
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            console.log('✅ PDF.js loaded successfully');
        } else {
            this.pdfjsLib = window.pdfjsLib;
        }
    }

    async loadBooksMetadata() {
        try {
            console.log('📚 Loading books metadata...');
            const response = await fetch('assets/pdf/books_metadata.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.booksMetadata = await response.json();
            console.log(`✅ Loaded ${Object.keys(this.booksMetadata).length} books`);
        } catch (error) {
            console.error('❌ Error loading books metadata:', error);
            this.showError('Failed to load books catalog. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Basic navigation
        this.setupBasicNavigation();
        
        // Advanced navigation
        this.setupAdvancedNavigation();
        
        // Zoom controls
        this.setupZoomControls();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Security: Disable right-click in viewer
        const canvas = document.getElementById('pdf-canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }
    }

    setupBasicNavigation() {
        // Close button
        const closeBtn = document.getElementById('close-pdf');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePDF();
            });
        }

        // Previous/Next buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousPage();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextPage();
            });
        }

        // First/Last page buttons
        const firstBtn = document.getElementById('first-page');
        const lastBtn = document.getElementById('last-page');
        
        if (firstBtn) {
            firstBtn.addEventListener('click', () => {
                this.goToPage(1);
            });
        }

        if (lastBtn) {
            lastBtn.addEventListener('click', () => {
                this.goToPage(this.totalPages);
            });
        }

        // Modal backdrop click
        const modal = document.getElementById('pdf-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'pdf-modal') {
                    this.closePDF();
                }
            });
        }
    }

    setupAdvancedNavigation() {
        // Page slider
        const pageSlider = document.getElementById('page-slider');
        if (pageSlider) {
            let sliderTimeout;
            
            pageSlider.addEventListener('input', (e) => {
                const page = parseInt(e.target.value);
                const pageInput = document.getElementById('page-input');
                if (pageInput) pageInput.value = page;
                
                // Show page jump overlay
                this.showPageJumpOverlay(page);
                
                // Debounce the page change
                clearTimeout(sliderTimeout);
                sliderTimeout = setTimeout(() => {
                    this.goToPage(page);
                }, 100);
            });

            // Page slider click for instant jump
            pageSlider.addEventListener('change', (e) => {
                this.goToPage(parseInt(e.target.value));
            });
        }

        // Page input
        const pageInput = document.getElementById('page-input');
        if (pageInput) {
            pageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handlePageInput();
                }
            });

            pageInput.addEventListener('blur', () => {
                this.handlePageInput();
            });
        }
    }

    setupZoomControls() {
        // Zoom in
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomIn();
            });
        }

        // Zoom out
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomOut();
            });
        }

        // Fit to width
        const fitToWidthBtn = document.getElementById('fit-to-width');
        if (fitToWidthBtn) {
            fitToWidthBtn.addEventListener('click', () => {
                this.fitToWidth();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.currentPdf || document.getElementById('pdf-modal').classList.contains('hidden')) {
                return;
            }

            // Prevent default if we're handling the key
            let handled = false;

            switch(e.key) {
                case 'ArrowRight':
                case 'Right':
                    this.nextPage();
                    handled = true;
                    break;
                    
                case 'ArrowLeft':
                case 'Left':
                    this.previousPage();
                    handled = true;
                    break;
                    
                case 'Home':
                    this.goToPage(1);
                    handled = true;
                    break;
                    
                case 'End':
                    this.goToPage(this.totalPages);
                    handled = true;
                    break;
                    
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        this.zoomIn();
                        handled = true;
                    }
                    break;
                    
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        this.zoomOut();
                        handled = true;
                    }
                    break;
                    
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        this.fitToWidth();
                        handled = true;
                    }
                    break;
                    
                case 'Escape':
                    this.closePDF();
                    handled = true;
                    break;
            }

            if (handled) {
                e.preventDefault();
            }
        });
    }

    showPageJumpOverlay(page) {
        const overlay = document.getElementById('page-jump-overlay');
        const pageNumber = document.getElementById('jump-page-number');
        
        if (overlay && pageNumber) {
            pageNumber.textContent = page;
            overlay.classList.remove('opacity-0');
            overlay.classList.add('opacity-100');
            
            // Hide after 1 second
            setTimeout(() => {
                overlay.classList.remove('opacity-100');
                overlay.classList.add('opacity-0');
            }, 1000);
        }
    }

    handlePageInput() {
        const pageInput = document.getElementById('page-input');
        if (!pageInput) return;

        let page = parseInt(pageInput.value);
        
        // Validate page number
        if (isNaN(page) || page < 1) {
            page = 1;
        } else if (page > this.totalPages) {
            page = this.totalPages;
        }
        
        pageInput.value = page;
        const pageSlider = document.getElementById('page-slider');
        if (pageSlider) pageSlider.value = page;
        
        this.goToPage(page);
    }

    async goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPage) {
            return;
        }

        // Add to render queue to prevent multiple simultaneous renders
        this.renderQueue.push(pageNum);
        
        if (this.isRendering) {
            return; // Let the current render finish
        }

        await this.processRenderQueue();
    }

    async processRenderQueue() {
        if (this.isRendering || this.renderQueue.length === 0) {
            return;
        }

        this.isRendering = true;
        
        while (this.renderQueue.length > 0) {
            const pageNum = this.renderQueue.shift();
            
            // Skip if we're already on this page
            if (pageNum === this.currentPage) continue;
            
            this.currentPage = pageNum;
            await this.renderPage(this.currentPage);
            this.updateNavigationControls();
        }
        
        this.isRendering = false;
    }

    renderBooks() {
        const grid = document.getElementById('books-grid');
        if (!grid) {
            console.error('❌ Books grid element not found');
            return;
        }

        // Check if we have books data
        if (Object.keys(this.booksMetadata).length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">No Books Available</h3>
                    <p class="text-gray-500">Books catalog is currently empty.</p>
                </div>
            `;
            return;
        }

        const categories = {};
        
        // Group books by category
        Object.values(this.booksMetadata).forEach(book => {
            if (!categories[book.category]) {
                categories[book.category] = [];
            }
            categories[book.category].push(book);
        });

        let html = '';
        
        Object.entries(categories).forEach(([category, books]) => {
            html += `
                <div class="col-span-full mb-12">
                    <h3 class="text-2xl font-bold text-primary mb-6 capitalize border-b-2 border-primary/20 pb-2">
                        ${category.replace('_', ' ')} Books
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            `;
            
            books.forEach(book => {
                const coverPath = book.cover_image ? 
                    `assets/pdf/cover_img/${book.cover_image}` : 
                    null;
                
                html += `
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
                            <div class="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                ${this.formatFileSize(book.original_size)}
                            </div>
                            <div class="absolute bottom-3 left-3 bg-primary/90 text-white px-2 py-1 rounded text-xs capitalize">
                                ${book.category.replace('_', ' ')}
                            </div>
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
            });
            
            html += `
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        console.log('✅ Books rendered successfully');

        // Add loading animation for images
        this.setupImageLoading();
    }

    setupImageLoading() {
        const images = document.querySelectorAll('.book-card img');
        images.forEach(img => {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in-out';
            
            // If image is already loaded
            if (img.complete) {
                img.style.opacity = '1';
            }
        });
    }

    getPageCountText(book) {
        const sizeMB = book.original_size / (1024 * 1024);
        let estimatedPages = Math.round(sizeMB * 10);
        
        if (estimatedPages < 10) estimatedPages = 10;
        if (estimatedPages > 500) estimatedPages = 500;
        
        return `~${estimatedPages} pages`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    async openBook(bookId) {
        try {
            console.log(`📖 Opening book: ${bookId}`);
            
            const book = this.booksMetadata[bookId];
            if (!book) {
                throw new Error(`Book "${bookId}" not found in metadata`);
            }

            // Show loading state
            this.showPDFModal('Loading...');
            this.showLoadingSpinner(true);

            // Reset scale and navigation
            this.currentScale = 1.0;
            this.currentPage = 1;
            this.renderQueue = [];

            // Fetch encrypted PDF
            const encryptedData = await this.fetchEncryptedPDF(book.filename);
            console.log(`🔐 Fetched encrypted data: ${encryptedData.byteLength} bytes`);
            
            // Decrypt PDF
            const pdfData = await this.decryptPDF(encryptedData, book);
            console.log(`✅ Decrypted PDF data: ${pdfData.byteLength} bytes`);
            
            // Load PDF for display
            console.log('📄 Loading PDF document...');
            this.currentPdf = await this.pdfjsLib.getDocument({ data: pdfData }).promise;
            this.totalPages = this.currentPdf.numPages;
            this.currentPage = 1;
            
            console.log(`📄 PDF loaded: ${this.totalPages} pages`);
            
            this.showPDFModal(book.title);
            await this.renderPage(this.currentPage);
            this.updateNavigationControls();
            this.showLoadingSpinner(false);
            
        } catch (error) {
            console.error('❌ Error opening book:', error);
            this.showError(`Error loading book: ${error.message}`);
            this.closePDF();
        }
    }

    showPDFModal(title) {
        const modal = document.getElementById('pdf-modal');
        const titleElement = document.getElementById('pdf-title');
        
        if (modal) modal.classList.remove('hidden');
        if (titleElement) titleElement.textContent = title;
        
        document.body.style.overflow = 'hidden';
    }

    async fetchEncryptedPDF(filename) {
        console.log(`📥 Fetching encrypted file: ${filename}`);
        const response = await fetch(`assets/pdf/encrypted/${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch encrypted PDF: ${response.status} ${response.statusText}`);
        }
        
        return await response.arrayBuffer();
    }

    async decryptPDF(encryptedArrayBuffer, book) {
        try {
            console.log('🔓 Starting decryption...');
            
            // Convert ArrayBuffer to Uint8Array
            const encryptedData = new Uint8Array(encryptedArrayBuffer);
            
            if (encryptedData.length < 32) {
                throw new Error('Encrypted data too short');
            }
            
            // Extract salt and IV (first 16 bytes each)
            const salt = encryptedData.slice(0, 16);
            const iv = encryptedData.slice(16, 32);
            const actualEncryptedData = encryptedData.slice(32);
            
            console.log(`🔑 Salt: ${salt.length} bytes, IV: ${iv.length} bytes, Data: ${actualEncryptedData.length} bytes`);
            
            // Generate key from password
            const key = await this.deriveKey(LIBRARY_PASSWORD, salt);
            
            // Decrypt data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv: iv
                },
                key,
                actualEncryptedData
            );
            
            console.log('✅ Decryption successful');
            return new Uint8Array(decryptedData);
            
        } catch (error) {
            console.error('❌ Decryption error:', error);
            throw new Error(`Failed to decrypt PDF: ${error.message}`);
        }
    }

    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        // Import password as key
        const baseKey = await crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        
        // Derive key using PBKDF2
        return await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-CBC", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    async renderPage(pageNum) {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) {
            throw new Error('PDF canvas element not found');
        }

        const ctx = canvas.getContext('2d');
        const page = await this.currentPdf.getPage(pageNum);
        
        // Calculate viewport with current scale
        const viewport = page.getViewport({ scale: this.currentScale });
        
        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Clear previous content
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render page
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Update dimensions display
        this.updateDimensionsInfo(viewport.width, viewport.height);
        
        console.log(`📄 Rendered page ${pageNum} at ${Math.round(this.currentScale * 100)}% scale`);
    }

    updateDimensionsInfo(width, height) {
        const dimensions = document.getElementById('pdf-dimensions');
        if (dimensions) {
            dimensions.textContent = `${Math.round(width)} × ${Math.round(height)}`;
        }
        
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.currentScale * 100)}%`;
        }
    }

    updateNavigationControls() {
        // Update page info
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }

        // Update slider
        const pageSlider = document.getElementById('page-slider');
        if (pageSlider) {
            pageSlider.max = this.totalPages;
            pageSlider.value = this.currentPage;
        }

        // Update page input
        const pageInput = document.getElementById('page-input');
        if (pageInput) {
            pageInput.max = this.totalPages;
            pageInput.value = this.currentPage;
        }

        // Update total pages display
        const totalPages = document.getElementById('total-pages');
        if (totalPages) {
            totalPages.textContent = `/ ${this.totalPages}`;
        }

        // Update button states
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const firstBtn = document.getElementById('first-page');
        const lastBtn = document.getElementById('last-page');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
            prevBtn.classList.toggle('opacity-50', this.currentPage <= 1);
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
            nextBtn.classList.toggle('opacity-50', this.currentPage >= this.totalPages);
        }
        
        if (firstBtn) {
            firstBtn.disabled = this.currentPage <= 1;
            firstBtn.classList.toggle('opacity-50', this.currentPage <= 1);
        }
        
        if (lastBtn) {
            lastBtn.disabled = this.currentPage >= this.totalPages;
            lastBtn.classList.toggle('opacity-50', this.currentPage >= this.totalPages);
        }
    }

    zoomIn() {
        this.currentScale = Math.min(this.currentScale + 0.25, 3.0);
        this.renderPage(this.currentPage);
    }

    zoomOut() {
        this.currentScale = Math.max(this.currentScale - 0.25, 0.5);
        this.renderPage(this.currentPage);
    }

    async fitToWidth() {
        const canvas = document.getElementById('pdf-canvas');
        const container = document.getElementById('pdf-container');
        
        if (!canvas || !container) return;

        const page = await this.currentPdf.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Calculate scale to fit container width
        const containerWidth = container.clientWidth - 40; // 20px padding on each side
        this.currentScale = containerWidth / viewport.width;
        
        await this.renderPage(this.currentPage);
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.goToPage(this.currentPage + 1);
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            await this.goToPage(this.currentPage - 1);
        }
    }

    closePDF() {
        const modal = document.getElementById('pdf-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        document.body.style.overflow = 'auto';
        
        // Clean up PDF resources
        if (this.currentPdf) {
            this.currentPdf.destroy();
            this.currentPdf = null;
        }
        
        // Clear canvas
        const canvas = document.getElementById('pdf-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        this.currentPage = 1;
        this.totalPages = 0;
        this.currentScale = 1.0;
        this.renderQueue = [];
        
        this.showLoadingSpinner(false);
    }

    showLoadingSpinner(show) {
        let spinner = document.getElementById('pdf-loading-spinner');
        
        if (show) {
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.id = 'pdf-loading-spinner';
                spinner.className = 'absolute inset-0 flex items-center justify-center bg-white/90 z-50';
                spinner.innerHTML = `
                    <div class="flex flex-col items-center space-y-4">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p class="text-gray-700 font-medium">Loading PDF...</p>
                    </div>
                `;
                const canvasContainer = document.querySelector('#pdf-modal .relative');
                if (canvasContainer) {
                    canvasContainer.appendChild(spinner);
                }
            }
            spinner.classList.remove('hidden');
        } else if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    showError(message) {
        // Remove existing error modal if any
        const existingError = document.querySelector('.error-modal');
        if (existingError) {
            existingError.remove();
        }

        const errorHtml = `
            <div class="error-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                    <div class="text-red-500 text-center mb-4">
                        <i class="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-center mb-2 text-gray-800">Error</h3>
                    <p class="text-gray-600 text-center mb-4">${message}</p>
                    <button onclick="this.closest('.error-modal').remove()" 
                            class="w-full bg-primary text-white py-3 rounded-lg hover:bg-secondary transition font-medium">
                        OK
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }
}

// Initialize library when page loads
let library;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Secure PDF Library...');
    library = new SecurePDFLibrary();
});

// Add global error handler for better debugging
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Export for global access
window.SecurePDFLibrary = SecurePDFLibrary;