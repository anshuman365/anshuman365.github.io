// nav.js - Navigation functionality for Anshuman Singh's portfolio

// Auto-load CSS for navigation
const loadNavCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Mobile dropdown rotation */
        .rotate-180 {
            transform: rotate(180deg);
        }
        
        /* Smooth transitions for mobile menu */
        .mobile-translate-submenu,
        .mobile-resources-submenu {
            transition: all 0.3s ease-in-out;
        }
        
        /* Mobile menu animations */
        #mobile-menu {
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }
        
        /* Navigation hover effects */
        .nav-item-hover {
            transition: all 0.2s ease-in-out;
        }
        
        .nav-item-hover:hover {
            transform: translateY(-1px);
        }
        
        /* Active link styling */
        .nav-link-active {
            color: #2563EB;
            font-weight: 600;
        }
        
        .dark .nav-link-active {
            color: #60A5FA;
        }
        
        /* Backdrop blur for mobile menu */
        @supports (backdrop-filter: blur(10px)) {
            #mobile-menu {
                backdrop-filter: blur(10px);
                background-color: rgba(255, 255, 255, 0.95);
            }
            
            .dark #mobile-menu {
                background-color: rgba(30, 41, 59, 0.95);
            }
        }
    `;
    document.head.appendChild(style);
};

// Initialize navigation functionality
const initNavigation = () => {
    // Load CSS first
    loadNavCSS();
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            
            // Change icon based on menu state
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (isHidden) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // Mobile translate dropdown toggle
    const translateToggle = document.querySelector('.mobile-translate-toggle');
    if (translateToggle) {
        translateToggle.addEventListener('click', () => {
            const submenu = document.querySelector('.mobile-translate-submenu');
            const icon = translateToggle.querySelector('i.fa-chevron-down');
            
            submenu.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    }
    
    // Mobile resources dropdown toggle
    const resourcesToggle = document.querySelector('.mobile-resources-toggle');
    if (resourcesToggle) {
        resourcesToggle.addEventListener('click', () => {
            const submenu = document.querySelector('.mobile-resources-submenu');
            const icon = resourcesToggle.querySelector('i.fa-chevron-down');
            
            submenu.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    }
    
    // Close mobile menu when clicking on links (except dropdown toggles)
    const mobileLinks = document.querySelectorAll('#mobile-menu a:not(.mobile-translate-toggle):not(.mobile-resources-toggle)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            // Reset menu icon
            const icon = menuToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.classList.contains('hidden')) {
            const isClickInsideNav = mobileMenu.contains(e.target) || menuToggle.contains(e.target);
            if (!isClickInsideNav) {
                mobileMenu.classList.add('hidden');
                // Reset menu icon
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
    
    // Set active navigation link based on current page
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a[href]');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html') ||
                (currentPage === '/' && linkPage === 'index.html')) {
                link.classList.add('nav-link-active');
            } else {
                link.classList.remove('nav-link-active');
            }
        });
    };
    
    // Initialize active link highlighting
    setActiveNavLink();
    
    // Smooth scrolling for anchor links
    const initSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        const icon = menuToggle?.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-times');
                            icon.classList.add('fa-bars');
                        }
                    }
                }
            });
        });
    };
    
    initSmoothScrolling();
    
    // Handle window resize - close mobile menu on desktop
    const handleResize = () => {
        if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = menuToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Keyboard navigation for accessibility
    const initKeyboardNavigation = () => {
        document.addEventListener('keydown', (e) => {
            // Escape key closes mobile menu
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                menuToggle?.focus();
            }
        });
    };
    
    initKeyboardNavigation();
    
    console.log('Navigation initialized successfully');
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initNavigation };
}