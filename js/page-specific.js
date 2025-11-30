// page-specific.js - Page-specific functionality and utilities

class PageSpecific {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        console.log(`Initializing page-specific features for: ${this.currentPage}`);
        
        // Common initialization for all pages
        this.initCommonFeatures();
        
        // Page-specific initialization
        this.initPageSpecific();
        
        // Performance monitoring
        this.initPerformanceMonitoring();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    initCommonFeatures() {
        // Add smooth scrolling to all pages
        this.initSmoothScrolling();
        
        // Add loading states to buttons
        this.initButtonLoadingStates();
        
        // Add intersection observer for animations
        this.initScrollAnimations();
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
        
        // Add print functionality
        this.initPrintFunctionality();
    }

    initPageSpecific() {
        switch(this.currentPage) {
            case 'index.html':
                this.initHomePage();
                break;
            case 'projects.html':
                this.initProjectsPage();
                break;
            case 'services.html':
                this.initServicesPage();
                break;
            case 'real-estate.html':
                this.initRealEstatePage();
                break;
            case 'library.html':
                this.initLibraryPage();
                break;
            case 'blog.html':
                this.initBlogPage();
                break;
            case 'contact.html':
                this.initContactPage();
                break;
            case 'about-anshuman-singh.html':
                this.initAboutPage();
                break;
            default:
                this.initDefaultPage();
        }
    }

    // === COMMON FEATURES ===

    initSmoothScrolling() {
        // Enhanced smooth scrolling with offset for fixed header
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initButtonLoadingStates() {
        // Add loading states to all submit buttons
        document.addEventListener('submit', (e) => {
            const submitBtn = e.target.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                `;
                submitBtn.disabled = true;

                // Revert after 3 seconds (fallback)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    initScrollAnimations() {
        // Animate elements on scroll
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }

    initKeyboardShortcuts() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], .search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }

    initPrintFunctionality() {
        // Add print buttons dynamically
        const printButtons = document.querySelectorAll('[data-print]');
        printButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.print;
                this.printSection(target);
            });
        });

        // Add print shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.printPage();
            }
        });
    }

    // === PAGE-SPECIFIC INITIALIZATIONS ===

    initHomePage() {
        console.log('Initializing home page features');
        
        // Hero section animations
        this.initHeroAnimations();
        
        // Statistics counter
        this.initStatisticsCounter();
        
        // Testimonial slider
        this.initTestimonialSlider();
    }

    initProjectsPage() {
        console.log('Initializing projects page features');
        
        // Project filtering
        this.initProjectFilters();
        
        // Project modal details
        this.initProjectModals();
        
        // Technology tags
        this.initTechTags();
    }

    initServicesPage() {
        console.log('Initializing services page features');
        
        // Service tabs
        this.initServiceTabs();
        
        // Pricing toggle
        this.initPricingToggle();
        
        // Service calculator
        this.initServiceCalculator();
    }

    initRealEstatePage() {
        console.log('Initializing real estate page features');
        
        // Property filters
        this.initPropertyFilters();
        
        // Mortgage calculator
        this.initMortgageCalculator();
        
        // Schedule tour functionality
        this.initScheduleTour();
    }

    initLibraryPage() {
        console.log('Initializing library page features');
        
        // Reading progress
        this.initReadingProgress();
        
        // Bookmark functionality
        this.initBookmarkSystem();
        
        // Citation generator
        this.initCitationGenerator();
    }

    initBlogPage() {
        console.log('Initializing blog page features');
        
        // Reading time calculator
        this.initReadingTime();
        
        // Table of contents
        this.initTableOfContents();
        
        // Social sharing
        this.initSocialSharing();
    }

    initContactPage() {
        console.log('Initializing contact page features');
        
        // Form validation
        this.initContactFormValidation();
        
        // Map integration
        this.initMapIntegration();
        
        // Contact method tabs
        this.initContactTabs();
    }

    initAboutPage() {
        console.log('Initializing about page features');
        
        // Timeline animations
        this.initTimelineAnimations();
        
        // Skill progress bars
        this.initSkillProgress();
        
        // Download resume
        this.initResumeDownload();
    }

    initDefaultPage() {
        console.log('Initializing default page features');
        // Add any default functionality here
    }

    // === SPECIFIC FEATURE IMPLEMENTATIONS ===

    initHeroAnimations() {
        // Add floating animations to hero elements
        const heroElements = document.querySelectorAll('.hero-float');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
            el.classList.add('animate-float');
        });
    }

    initStatisticsCounter() {
        const counters = document.querySelectorAll('.stat-counter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target);
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.ceil(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    initProjectFilters() {
        const filterButtons = document.querySelectorAll('.project-filter');
        const projectItems = document.querySelectorAll('.project-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.dataset.filter;

                // Filter projects
                projectItems.forEach(item => {
                    if (filterValue === 'all' || item.dataset.category === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => item.classList.add('show'), 10);
                    } else {
                        item.classList.remove('show');
                        setTimeout(() => item.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    initMortgageCalculator() {
        const calculatorForm = document.getElementById('mortgage-calculator');
        if (calculatorForm) {
            calculatorForm.addEventListener('input', this.calculateMortgage.bind(this));
        }
    }

    calculateMortgage() {
        const price = parseFloat(document.getElementById('property-price').value) || 0;
        const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
        const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
        const loanTerm = parseFloat(document.getElementById('loan-term').value) || 30;

        const loanAmount = price - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const payments = loanTerm * 12;

        if (monthlyRate === 0) {
            const monthlyPayment = loanAmount / payments;
            this.updateMortgageResult(monthlyPayment, loanAmount);
        } else {
            const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, payments) / 
                                 (Math.pow(1 + monthlyRate, payments) - 1);
            this.updateMortgageResult(monthlyPayment, loanAmount);
        }
    }

    updateMortgageResult(monthlyPayment, loanAmount) {
        const resultElement = document.getElementById('mortgage-result');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 class="font-bold text-green-800 dark:text-green-300">Estimated Monthly Payment</h4>
                    <p class="text-2xl font-bold text-green-600 dark:text-green-400">$${monthlyPayment.toFixed(2)}</p>
                    <p class="text-sm text-green-600 dark:text-green-300">Loan Amount: $${loanAmount.toLocaleString()}</p>
                </div>
            `;
        }
    }

    initReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #0E7490, #059669);
            z-index: 1000;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const progress = (scrollTop / (docHeight - winHeight)) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }

    initContactFormValidation() {
        const forms = document.querySelectorAll('.contact-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                let isValid = true;
                const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        this.showValidationError(input, 'This field is required');
                    } else {
                        this.clearValidationError(input);
                    }

                    // Email validation
                    if (input.type === 'email' && input.value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value)) {
                            isValid = false;
                            this.showValidationError(input, 'Please enter a valid email address');
                        }
                    }

                    // Phone validation
                    if (input.type === 'tel' && input.value) {
                        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                        if (!phoneRegex.test(input.value.replace(/[\s\-\(\)]/g, ''))) {
                            isValid = false;
                            this.showValidationError(input, 'Please enter a valid phone number');
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    this.showFormMessage(form, 'Please fix the errors above', 'error');
                }
            });
        });
    }

    showValidationError(input, message) {
        this.clearValidationError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error text-red-600 dark:text-red-400 text-sm mt-1';
        errorDiv.textContent = message;
        
        input.classList.add('border-red-500');
        input.parentNode.appendChild(errorDiv);
    }

    clearValidationError(input) {
        input.classList.remove('border-red-500');
        const existingError = input.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showFormMessage(form, message, type = 'info') {
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message p-3 rounded-lg mb-4 ${
            type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
        }`;
        messageDiv.textContent = message;
        
        form.insertBefore(messageDiv, form.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // === UTILITY METHODS ===

    closeAllModals() {
        const modals = document.querySelectorAll('.modal, [role="dialog"]');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl+K', action: 'Focus search' },
            { key: 'Ctrl+P', action: 'Print page' },
            { key: 'Esc', action: 'Close modals' },
            { key: 'Ctrl+/', action: 'Show this help' }
        ];

        let helpHTML = '<div class="p-4"><h3 class="font-bold mb-3">Keyboard Shortcuts</h3>';
        shortcuts.forEach(shortcut => {
            helpHTML += `<div class="flex justify-between mb-2"><kbd class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">${shortcut.key}</kbd><span>${shortcut.action}</span></div>`;
        });
        helpHTML += '</div>';

        this.showModal('Keyboard Shortcuts', helpHTML);
    }

    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.getElementById('dynamic-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="dynamic-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h3 class="font-bold text-lg">${title}</h3>
                        <button onclick="this.closest('#dynamic-modal').remove()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-4">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    printSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print ${sectionId}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        ${section.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    printPage() {
        window.print();
    }

    initPerformanceMonitoring() {
        // Log page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
            
            // Send to analytics (if you have any)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    'name': 'page_load',
                    'value': loadTime,
                    'event_category': 'Load Time'
                });
            }
        });
    }

    // Error boundary for page-specific features
    safeExecute(callback, featureName) {
        try {
            callback();
        } catch (error) {
            console.error(`Error in ${featureName}:`, error);
        }
    }
}

// Initialize page-specific features
document.addEventListener('DOMContentLoaded', () => {
    // Wait for templates to load
    setTimeout(() => {
        window.pageSpecific = new PageSpecific();
    }, 100);
});

// Make utility functions globally available
window.PageUtils = {
    // Format currency
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate: (date, options = {}) => {
        const defaultOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageSpecific, PageUtils };
}