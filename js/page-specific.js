// page-specific.js - Essential page-specific functionality only

class PageSpecific {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        console.log(`Initializing essential features for: ${this.currentPage}`);
        
        // Only essential common features
        this.initSmoothScrolling();
        this.initButtonLoadingStates();
        
        // Page-specific initialization (only essential ones)
        this.initPageSpecific();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    initPageSpecific() {
        // Only initialize essential page features
        switch(this.currentPage) {
            case 'services.html':
                this.initServicesPage();
                break;
            case 'contact.html':
                this.initContactFormValidation();
                break;
            // Skip other pages to avoid errors
            default:
                console.log(`No essential features for ${this.currentPage}`);
        }
    }

    // === ESSENTIAL FEATURES ONLY ===

    initSmoothScrolling() {
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
                    if (submitBtn.parentNode) { // Check if element still exists
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }, 3000);
            }
        });
    }

    // === ONLY ESSENTIAL PAGE FEATURES ===

    initServicesPage() {
        console.log('Initializing essential services page features');
        // Only essential service page features
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
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Error boundary for safe execution
    safeExecute(callback, featureName) {
        try {
            callback();
        } catch (error) {
            console.warn(`Feature ${featureName} skipped due to error:`, error);
        }
    }
}

// Initialize only essential features
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.pageSpecific = new PageSpecific();
    }, 100);
});

// Basic utility functions only
window.PageUtils = {
    // Simple debounce function
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
    }
};