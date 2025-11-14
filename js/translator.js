// js/translator.js - Enhanced Google Translate System
class GoogleTranslator {
    constructor() {
        this.languages = [
            { code: 'en', name: 'English', flag: 'fas fa-globe-americas', color: 'text-blue-500' },
            { code: 'hi', name: 'Hindi', flag: 'fas fa-flag', color: 'text-orange-500' },
            { code: 'es', name: 'Spanish', flag: 'fas fa-flag', color: 'text-red-500' },
            { code: 'fr', name: 'French', flag: 'fas fa-flag', color: 'text-blue-400' },
            { code: 'de', name: 'German', flag: 'fas fa-flag', color: 'text-yellow-500' }
        ];
        this.init();
    }

    init() {
        this.injectCSS();
        this.createTranslateElement();
        this.loadGoogleTranslateScript();
        this.setupEventListeners();
        this.applyStoredLanguage();
    }

    injectCSS() {
        const css = `
            /* Google Translate Styling */
            .google-translate-wrapper .dropdown-menu {
                min-width: 120px;
                padding: 0.5rem 0;
                background: white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
                border: none;
                border-radius: 8px;
            }

            .google-translate-wrapper .dropdown-item {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                transition: all 0.2s ease;
            }

            .google-translate-wrapper .dropdown-item:hover {
                background-color: #f8f9fa;
                transform: translateX(2px);
            }

            /* Dark theme support */
            .dark .google-translate-wrapper .dropdown-menu {
                background: #2d3748;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }

            .dark .google-translate-wrapper .dropdown-item {
                color: #f8f9fa;
            }

            .dark .google-translate-wrapper .dropdown-item:hover {
                background-color: #4a5568;
            }

            /* Hide all Google Translate elements */
            .goog-te-banner-frame, .goog-te-menu-frame, 
            .goog-te-gadget, .goog-te-combo, 
            .skiptranslate {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
            }

            /* Language dropdown styles */
            .language-option {
                cursor: pointer;
            }

            .language-option i {
                width: 16px;
                text-align: center;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    createTranslateElement() {
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }
    }

    loadGoogleTranslateScript() {
        if (!window.googleTranslateLoaded) {
            const script = document.createElement('script');
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.head.appendChild(script);
            window.googleTranslateLoaded = true;
        }
    }

    setupEventListeners() {
        // Use event delegation for dynamically loaded elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.language-option')) {
                e.preventDefault();
                const lang = e.target.closest('.language-option').dataset.lang;
                this.changeLanguage(lang);
            }
        });

        // Update dropdown text when language changes
        document.addEventListener('DOMContentLoaded', () => {
            this.updateDropdownText();
        });
    }

    changeLanguage(lang) {
        const expireDate = new Date();
        expireDate.setFullYear(expireDate.getFullYear() + 1);
        
        if (lang === 'en') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else {
            document.cookie = `googtrans=/en/${lang}; expires=${expireDate.toUTCString()}; path=/`;
        }
        
        sessionStorage.setItem('selectedLanguage', lang);
        this.updateDropdownText();
        window.location.reload();
    }

    updateDropdownText() {
        const storedLang = sessionStorage.getItem('selectedLanguage') || 'en';
        const language = this.languages.find(lang => lang.code === storedLang);
        const dropdownButtons = document.querySelectorAll('#languageDropdown');
        
        dropdownButtons.forEach(button => {
            if (language && button) {
                button.innerHTML = `
                    <i class="fas fa-language mr-2 ${language.color}"></i>
                    ${language.name}
                    <i class="fas fa-chevron-down ml-1 text-sm"></i>
                `;
            }
        });
    }

    applyStoredLanguage() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateDropdownText();
        });
    }
}

// Global function for Google Translate callback
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,es,fr,de',
        autoDisplay: false
    }, 'google_translate_element');
};

// Initialize translator when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new GoogleTranslator();
    });
} else {
    new GoogleTranslator();
}