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
        .mobile-portfolio-submenu {
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

// Safe element selector with null checks
const safeQuerySelector = (selector) => {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
};

const safeGetElementById = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element not found: #${id}`);
    }
    return element;
};

// Initialize navigation functionality - FUNCTION DECLARATION (hoisted)
function initNavigation() {
    // Load CSS first
    loadNavCSS();
    
    console.log('Initializing navigation...');
    
    // Mobile menu toggle with safe checks
    const menuToggle = safeGetElementById('menu-toggle');
    const mobileMenu = safeGetElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        console.log('Mobile menu elements found, attaching event listeners...');
        
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
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
    } else {
        console.warn('Mobile menu toggle elements not found');
    }
    
    // Mobile translate dropdown toggle
    const translateToggle = safeQuerySelector('.mobile-translate-toggle');
    if (translateToggle) {
        translateToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const submenu = safeQuerySelector('.mobile-translate-submenu');
            const icon = translateToggle.querySelector('i.fa-chevron-down');
            
            if (submenu && icon) {
                submenu.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
            }
        });
    }
    
    // Mobile portfolio dropdown toggle
    const portfolioToggle = safeQuerySelector('.mobile-portfolio-toggle');
    if (portfolioToggle) {
        portfolioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const submenu = safeQuerySelector('.mobile-portfolio-submenu');
            const icon = portfolioToggle.querySelector('i.fa-chevron-down');
            
            if (submenu && icon) {
                submenu.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
            }
        });
    }
    
    // Close mobile menu when clicking on links (except dropdown toggles)
    const mobileLinks = document.querySelectorAll('#mobile-menu a:not(.mobile-translate-toggle):not(.mobile-portfolio-toggle)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
                // Reset menu icon
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            const isClickInsideNav = mobileMenu.contains(e.target) || 
                                   (menuToggle && menuToggle.contains(e.target));
            if (!isClickInsideNav) {
                mobileMenu.classList.add('hidden');
                // Reset menu icon
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                
                // Close all mobile dropdowns
                const mobileSubmenus = document.querySelectorAll('.mobile-translate-submenu, .mobile-portfolio-submenu');
                mobileSubmenus.forEach(submenu => {
                    submenu.classList.add('hidden');
                });
                
                // Reset dropdown icons
                const dropdownIcons = document.querySelectorAll('.mobile-translate-toggle i.fa-chevron-down, .mobile-portfolio-toggle i.fa-chevron-down');
                dropdownIcons.forEach(icon => {
                    icon.classList.remove('rotate-180');
                });
            }
        }
    });
    
    // Prevent dropdown toggles from closing the menu
    const dropdownToggles = document.querySelectorAll('.mobile-translate-toggle, .mobile-portfolio-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
        });
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
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
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
        if (mobileMenu && window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
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
            if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
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
}

// Make initNavigation globally available - AFTER function declaration
window.initNavigation = initNavigation;