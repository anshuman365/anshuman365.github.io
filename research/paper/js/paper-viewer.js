/**
 * Paper Viewer for Research Papers
 * Enhanced reading experience with navigation, annotations, and accessibility features
 */

class PaperViewer {
    constructor() {
        this.currentSection = null;
        this.annotations = [];
        this.highlights = [];
        this.bookmarks = [];
        this.readingMode = 'default';
        this.fontSize = 16;
        this.lineHeight = 1.6;
        this.theme = 'dark';
        this.isFullscreen = false;
        this.isSidebarOpen = false;
        this.isOutlineVisible = true;
        this.zoomLevel = 1;
        
        // Initialize when DOM is ready
        this.init();
    }

    init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Set up DOM elements
        this.setupElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up navigation
        this.setupNavigation();
        
        // Set up annotations system
        this.setupAnnotations();
        
        // Set up accessibility features
        this.setupAccessibility();
        
        // Initialize reading progress
        this.updateReadingProgress();
        
        console.log('Paper Viewer initialized');
    }

    setupElements() {
        // Create toolbar if not exists
        if (!document.getElementById('paper-toolbar')) {
            this.createToolbar();
        }
        
        // Create sidebar if not exists
        if (!document.getElementById('paper-sidebar')) {
            this.createSidebar();
        }
        
        // Create annotations panel
        if (!document.getElementById('annotations-panel')) {
            this.createAnnotationsPanel();
        }
        
        // Create reading mode overlay
        if (!document.getElementById('reading-mode-overlay')) {
            this.createReadingModeOverlay();
        }
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'paper-toolbar';
        toolbar.className = 'fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-40 py-2 px-4 hidden print:hidden';
        toolbar.innerHTML = `
            <div class="container mx-auto flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button id="sidebar-toggle" class="toolbar-btn" title="Toggle sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <div class="h-6 w-px bg-slate-600"></div>
                    
                    <button id="prev-section" class="toolbar-btn" title="Previous section">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    <button id="next-section" class="toolbar-btn" title="Next section">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    
                    <div class="h-6 w-px bg-slate-600"></div>
                    
                    <div class="flex items-center space-x-2">
                        <button id="zoom-out" class="toolbar-btn" title="Zoom out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        
                        <span id="zoom-level" class="text-sm text-slate-300 min-w-[40px] text-center">${Math.round(this.zoomLevel * 100)}%</span>
                        
                        <button id="zoom-in" class="toolbar-btn" title="Zoom in">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        
                        <button id="reset-zoom" class="toolbar-btn" title="Reset zoom">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <button id="decrease-font" class="toolbar-btn" title="Decrease font size">
                            <i class="fas fa-font"></i><i class="fas fa-minus ml-1 text-xs"></i>
                        </button>
                        
                        <span id="font-size" class="text-sm text-slate-300 min-w-[40px] text-center">${this.fontSize}px</span>
                        
                        <button id="increase-font" class="toolbar-btn" title="Increase font size">
                            <i class="fas fa-font"></i><i class="fas fa-plus ml-1 text-xs"></i>
                        </button>
                    </div>
                    
                    <div class="h-6 w-px bg-slate-600"></div>
                    
                    <button id="reading-mode-toggle" class="toolbar-btn" title="Toggle reading mode">
                        <i class="fas fa-book-reader"></i>
                    </button>
                    
                    <button id="annotations-toggle" class="toolbar-btn" title="Toggle annotations">
                        <i class="fas fa-highlighter"></i>
                    </button>
                    
                    <button id="fullscreen-toggle" class="toolbar-btn" title="Toggle fullscreen">
                        <i class="fas fa-expand"></i>
                    </button>
                    
                    <button id="print-paper" class="toolbar-btn" title="Print paper">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertBefore(toolbar, document.body.firstChild);
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.id = 'paper-sidebar';
        sidebar.className = 'fixed left-0 top-0 h-screen w-80 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 z-30 transform -translate-x-full transition-transform duration-300 print:hidden';
        sidebar.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="p-4 border-b border-slate-700">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-white">Navigation</h3>
                        <button id="sidebar-close" class="toolbar-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto">
                    <div class="p-4">
                        <h4 class="font-bold text-slate-300 mb-3">Table of Contents</h4>
                        <div id="sidebar-toc" class="space-y-2"></div>
                    </div>
                    
                    <div class="p-4 border-t border-slate-700">
                        <h4 class="font-bold text-slate-300 mb-3">Bookmarks</h4>
                        <div id="sidebar-bookmarks" class="space-y-2">
                            <div class="text-slate-500 text-sm italic">No bookmarks yet</div>
                        </div>
                    </div>
                    
                    <div class="p-4 border-t border-slate-700">
                        <h4 class="font-bold text-slate-300 mb-3">Annotations</h4>
                        <div id="sidebar-annotations" class="space-y-2">
                            <div class="text-slate-500 text-sm italic">No annotations yet</div>
                        </div>
                    </div>
                </div>
                
                <div class="p-4 border-t border-slate-700">
                    <h4 class="font-bold text-slate-300 mb-3">Reading Stats</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-slate-400">Time spent:</span>
                            <span class="text-white" id="reading-time">0m</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Sections read:</span>
                            <span class="text-white" id="sections-read">0/0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Progress:</span>
                            <span class="text-white" id="reading-progress">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Populate TOC
        this.populateSidebarTOC();
    }

    createAnnotationsPanel() {
        const panel = document.createElement('div');
        panel.id = 'annotations-panel';
        panel.className = 'fixed right-0 top-0 h-screen w-96 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 z-30 transform translate-x-full transition-transform duration-300 print:hidden';
        panel.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="p-4 border-b border-slate-700">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-white">Annotations</h3>
                        <button id="annotations-close" class="toolbar-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto p-4">
                    <div class="mb-6">
                        <h4 class="font-bold text-white mb-3">Add Annotation</h4>
                        <div class="space-y-3">
                            <select id="annotation-type" class="w-full bg-slate-800 text-white rounded-lg px-3 py-2">
                                <option value="highlight">Highlight</option>
                                <option value="note">Note</option>
                                <option value="question">Question</option>
                                <option value="important">Important</option>
                            </select>
                            
                            <div class="flex space-x-2">
                                <button id="annotation-color-yellow" class="w-8 h-8 bg-yellow-500 rounded-full border-2 border-slate-700 annotation-color-btn" data-color="#fbbf24"></button>
                                <button id="annotation-color-blue" class="w-8 h-8 bg-blue-500 rounded-full border-2 border-slate-700 annotation-color-btn" data-color="#3b82f6"></button>
                                <button id="annotation-color-green" class="w-8 h-8 bg-green-500 rounded-full border-2 border-slate-700 annotation-color-btn" data-color="#10b981"></button>
                                <button id="annotation-color-red" class="w-8 h-8 bg-red-500 rounded-full border-2 border-slate-700 annotation-color-btn" data-color="#ef4444"></button>
                                <button id="annotation-color-purple" class="w-8 h-8 bg-purple-500 rounded-full border-2 border-slate-700 annotation-color-btn" data-color="#8b5cf6"></button>
                            </div>
                            
                            <textarea id="annotation-text" class="w-full h-32 bg-slate-800 text-white rounded-lg px-3 py-2" placeholder="Add your note..."></textarea>
                            
                            <button id="save-annotation" class="w-full bg-quantum-primary text-white py-2 rounded-lg font-bold">
                                Save Annotation
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-bold text-white mb-3">Your Annotations</h4>
                        <div id="annotations-list" class="space-y-3">
                            <div class="text-slate-500 text-sm italic">No annotations yet</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }

    createReadingModeOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'reading-mode-overlay';
        overlay.className = 'fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-slate-900 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">Reading Mode</h3>
                    <button id="close-reading-mode" class="toolbar-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div id="reading-mode-content" class="prose prose-lg prose-invert max-w-none">
                    <!-- Content will be loaded here -->
                </div>
                
                <div class="mt-6 pt-6 border-t border-slate-700 flex justify-between">
                    <button id="prev-reading-page" class="px-4 py-2 bg-slate-800 text-white rounded-lg">
                        <i class="fas fa-chevron-left mr-2"></i>Previous
                    </button>
                    
                    <div class="text-slate-300" id="reading-page-info">Page 1 of 1</div>
                    
                    <button id="next-reading-page" class="px-4 py-2 bg-quantum-primary text-white rounded-lg">
                        Next<i class="fas fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebar-close')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('prev-section')?.addEventListener('click', () => this.navigateToPrevSection());
        document.getElementById('next-section')?.addEventListener('click', () => this.navigateToNextSection());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.adjustZoom(-0.1));
        document.getElementById('zoom-in')?.addEventListener('click', () => this.adjustZoom(0.1));
        document.getElementById('reset-zoom')?.addEventListener('click', () => this.resetZoom());
        document.getElementById('decrease-font')?.addEventListener('click', () => this.adjustFontSize(-1));
        document.getElementById('increase-font')?.addEventListener('click', () => this.adjustFontSize(1));
        document.getElementById('reading-mode-toggle')?.addEventListener('click', () => this.toggleReadingMode());
        document.getElementById('annotations-toggle')?.addEventListener('click', () => this.toggleAnnotationsPanel());
        document.getElementById('annotations-close')?.addEventListener('click', () => this.toggleAnnotationsPanel());
        document.getElementById('fullscreen-toggle')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('print-paper')?.addEventListener('click', () => this.printPaper());
        document.getElementById('close-reading-mode')?.addEventListener('click', () => this.toggleReadingMode());
        document.getElementById('prev-reading-page')?.addEventListener('click', () => this.navigateReadingPage(-1));
        document.getElementById('next-reading-page')?.addEventListener('click', () => this.navigateReadingPage(1));

        // Annotation buttons
        document.getElementById('save-annotation')?.addEventListener('click', () => this.saveAnnotation());
        document.querySelectorAll('.annotation-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedColor = e.target.dataset.color;
                document.querySelectorAll('.annotation-color-btn').forEach(b => {
                    b.classList.remove('border-white');
                    b.classList.add('border-slate-700');
                });
                e.target.classList.remove('border-slate-700');
                e.target.classList.add('border-white');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input/textarea
            if (e.target.matches('input, textarea, select')) return;

            switch(e.key) {
                case 'ArrowLeft':
                    if (e.ctrlKey) this.navigateToPrevSection();
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey) this.navigateToNextSection();
                    break;
                case '-':
                    if (e.ctrlKey) this.adjustZoom(-0.1);
                    break;
                case '+':
                case '=':
                    if (e.ctrlKey) this.adjustZoom(0.1);
                    break;
                case '0':
                    if (e.ctrlKey) this.resetZoom();
                    break;
                case '[':
                    if (e.ctrlKey) this.adjustFontSize(-1);
                    break;
                case ']':
                    if (e.ctrlKey) this.adjustFontSize(1);
                    break;
                case 'f':
                    if (e.ctrlKey) this.toggleFullscreen();
                    break;
                case 'p':
                    if (e.ctrlKey) this.printPaper();
                    break;
                case 'm':
                    if (e.ctrlKey) this.toggleReadingMode();
                    break;
                case 'a':
                    if (e.ctrlKey) this.toggleAnnotationsPanel();
                    break;
                case 's':
                    if (e.ctrlKey) this.toggleSidebar();
                    break;
                case 'Escape':
                    if (this.isFullscreen) this.exitFullscreen();
                    if (this.isSidebarOpen) this.toggleSidebar();
                    if (document.getElementById('annotations-panel')?.classList.contains('translate-x-0')) {
                        this.toggleAnnotationsPanel();
                    }
                    break;
            }
        });

        // Text selection for annotations
        document.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 0 && !e.target.closest('#annotations-panel')) {
                this.showAnnotationTooltip(selection);
            }
        });

        // Scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateCurrentSection();
                this.updateReadingProgress();
                this.saveReadingPosition();
            }, 100);
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.updateReadingModeContent();
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveReadingPosition();
            }
        });
    }

    setupNavigation() {
        // Get all sections
        this.sections = Array.from(document.querySelectorAll('section[id]'));
        
        // Add navigation buttons to each section
        this.sections.forEach((section, index) => {
            const navDiv = document.createElement('div');
            navDiv.className = 'section-navigation flex justify-between items-center mt-8 pt-6 border-t border-slate-700';
            navDiv.innerHTML = `
                ${index > 0 ? `
                    <button class="prev-section-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition flex items-center" data-target="${this.sections[index-1].id}">
                        <i class="fas fa-chevron-left mr-2"></i>
                        Previous: ${this.sections[index-1].querySelector('h2, h3')?.textContent.substring(0, 30)}...
                    </button>
                ` : '<div></div>'}
                
                ${index < this.sections.length - 1 ? `
                    <button class="next-section-btn px-4 py-2 bg-quantum-primary hover:bg-quantum-secondary text-white rounded-lg transition flex items-center" data-target="${this.sections[index+1].id}">
                        Next: ${this.sections[index+1].querySelector('h2, h3')?.textContent.substring(0, 30)}...
                        <i class="fas fa-chevron-right ml-2"></i>
                    </button>
                ` : '<div></div>'}
            `;
            
            section.appendChild(navDiv);
            
            // Add event listeners
            navDiv.querySelector('.prev-section-btn')?.addEventListener('click', (e) => {
                this.navigateToSection(e.target.closest('button').dataset.target);
            });
            
            navDiv.querySelector('.next-section-btn')?.addEventListener('click', (e) => {
                this.navigateToSection(e.target.closest('button').dataset.target);
            });
        });
        
        // Initialize current section
        this.updateCurrentSection();
    }

    setupAnnotations() {
        // Load saved annotations
        this.loadAnnotations();
        
        // Set up text selection tooltip
        this.selectedColor = '#fbbf24'; // Default yellow
        
        // Enable annotation mode
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.quantum-card, .equation-wrapper, p, li')) {
                this.enableAnnotationMode();
            }
        });
    }

    setupAccessibility() {
        // Add skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-main';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add aria labels to interactive elements
        this.addAriaLabels();
        
        // Enable keyboard navigation
        this.enableKeyboardNavigation();
        
        // Set up screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    // Navigation Methods
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Update current section
            this.currentSection = sectionId;
            this.updateSidebarHighlight();
            
            // Announce to screen reader
            this.announceToScreenReader(`Navigated to section: ${section.querySelector('h2, h3')?.textContent}`);
            
            // Track navigation
            if (window.ResearchAnalytics) {
                window.ResearchAnalytics.trackCustomEvent('section_navigation', {
                    section_id: sectionId,
                    section_title: section.querySelector('h2, h3')?.textContent
                });
            }
        }
    }

    navigateToPrevSection() {
        if (!this.currentSection || !this.sections) return;
        
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        if (currentIndex > 0) {
            this.navigateToSection(this.sections[currentIndex - 1].id);
        }
    }

    navigateToNextSection() {
        if (!this.currentSection || !this.sections) return;
        
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        if (currentIndex < this.sections.length - 1) {
            this.navigateToSection(this.sections[currentIndex + 1].id);
        }
    }

    updateCurrentSection() {
        const scrollPosition = window.scrollY + 100;
        
        for (const section of this.sections) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                if (this.currentSection !== section.id) {
                    this.currentSection = section.id;
                    this.updateSidebarHighlight();
                    
                    // Auto-save reading position
                    this.saveReadingPosition();
                }
                break;
            }
        }
    }

    updateSidebarHighlight() {
        document.querySelectorAll('#sidebar-toc .toc-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === this.currentSection) {
                item.classList.add('active');
                
                // Scroll into view
                const sidebarToc = document.getElementById('sidebar-toc');
                if (sidebarToc) {
                    const itemTop = item.offsetTop;
                    const containerTop = sidebarToc.scrollTop;
                    const containerHeight = sidebarToc.clientHeight;
                    
                    if (itemTop < containerTop || itemTop > containerTop + containerHeight - 50) {
                        sidebarToc.scrollTo({
                            top: itemTop - 20,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    }

    // Zoom and Font Methods
    adjustZoom(delta) {
        this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel + delta));
        document.documentElement.style.transform = `scale(${this.zoomLevel})`;
        document.documentElement.style.transformOrigin = 'top center';
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
        
        this.savePreferences();
    }

    resetZoom() {
        this.zoomLevel = 1;
        document.documentElement.style.transform = 'scale(1)';
        document.getElementById('zoom-level').textContent = '100%';
        
        this.savePreferences();
    }

    adjustFontSize(delta) {
        this.fontSize = Math.max(12, Math.min(24, this.fontSize + delta));
        document.documentElement.style.fontSize = `${this.fontSize}px`;
        document.getElementById('font-size').textContent = `${this.fontSize}px`;
        
        this.savePreferences();
    }

    // Reading Mode Methods
    toggleReadingMode() {
        const overlay = document.getElementById('reading-mode-overlay');
        if (overlay.classList.contains('hidden')) {
            this.enterReadingMode();
        } else {
            this.exitReadingMode();
        }
    }

    enterReadingMode() {
        const overlay = document.getElementById('reading-mode-overlay');
        overlay.classList.remove('hidden');
        
        // Load current section content
        this.updateReadingModeContent();
        
        // Hide toolbar and sidebar
        document.getElementById('paper-toolbar')?.classList.add('hidden');
        this.toggleSidebar(false);
        this.toggleAnnotationsPanel(false);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        this.readingMode = 'active';
        
        // Announce to screen reader
        this.announceToScreenReader('Entered reading mode');
    }

    exitReadingMode() {
        const overlay = document.getElementById('reading-mode-overlay');
        overlay.classList.add('hidden');
        
        // Show toolbar
        document.getElementById('paper-toolbar')?.classList.remove('hidden');
        
        // Enable body scroll
        document.body.style.overflow = '';
        
        this.readingMode = 'default';
        
        // Announce to screen reader
        this.announceToScreenReader('Exited reading mode');
    }

    updateReadingModeContent() {
        const contentDiv = document.getElementById('reading-mode-content');
        if (!contentDiv || !this.currentSection) return;
        
        const currentSection = document.getElementById(this.currentSection);
        if (!currentSection) return;
        
        // Clone and clean the section content
        const clone = currentSection.cloneNode(true);
        
        // Remove navigation buttons and other non-content elements
        clone.querySelectorAll('.section-navigation, .equation-copy-btn, .equation-zoom-btn, .ad-container, .no-print').forEach(el => el.remove());
        
        // Update styles for reading mode
        clone.querySelectorAll('*').forEach(el => {
            el.classList.add('reading-mode');
        });
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(clone);
        
        // Update page info
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        document.getElementById('reading-page-info').textContent = 
            `Section ${currentIndex + 1} of ${this.sections.length}`;
    }

    navigateReadingPage(direction) {
        if (!this.currentSection || !this.sections) return;
        
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.sections.length) {
            this.currentSection = this.sections[newIndex].id;
            this.updateReadingModeContent();
            this.updateSidebarHighlight();
        }
    }

    // Annotation Methods
    enableAnnotationMode() {
        document.body.classList.add('annotation-mode');
        
        // Show annotation tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'annotation-mode-tooltip';
        tooltip.className = 'fixed bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        tooltip.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>Select text to annotate</span>
                <button id="cancel-annotation" class="text-slate-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const updateTooltipPosition = () => {
            tooltip.style.top = '20px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
        };
        
        updateTooltipPosition();
        window.addEventListener('resize', updateTooltipPosition);
        
        // Cancel button
        document.getElementById('cancel-annotation').addEventListener('click', () => {
            this.disableAnnotationMode();
        });
        
        // Auto-cancel after 10 seconds
        setTimeout(() => {
            if (document.body.classList.contains('annotation-mode')) {
                this.disableAnnotationMode();
            }
        }, 10000);
    }

    disableAnnotationMode() {
        document.body.classList.remove('annotation-mode');
        const tooltip = document.getElementById('annotation-mode-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    showAnnotationTooltip(selection) {
        if (!document.body.classList.contains('annotation-mode')) return;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'fixed bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        tooltip.innerHTML = `
            <div class="flex items-center space-x-2">
                <button class="annotation-action-btn" data-action="highlight" title="Highlight">
                    <i class="fas fa-highlighter"></i>
                </button>
                <button class="annotation-action-btn" data-action="note" title="Add note">
                    <i class="fas fa-sticky-note"></i>
                </button>
                <button class="annotation-action-btn" data-action="bookmark" title="Bookmark">
                    <i class="fas fa-bookmark"></i>
                </button>
                <button class="annotation-action-btn" data-action="cancel" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip above selection
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        
        // Add event listeners
        tooltip.querySelectorAll('.annotation-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('button').dataset.action;
                this.handleAnnotationAction(action, selection, range);
                tooltip.remove();
                this.disableAnnotationMode();
            });
        });
        
        // Remove tooltip when clicking elsewhere
        setTimeout(() => {
            const clickHandler = (e) => {
                if (!tooltip.contains(e.target)) {
                    tooltip.remove();
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }, 100);
    }

    handleAnnotationAction(action, selection, range) {
        const selectedText = selection.toString().trim();
        const sectionId = this.currentSection;
        
        switch(action) {
            case 'highlight':
                this.addHighlight(range, selectedText, sectionId);
                break;
            case 'note':
                this.openAnnotationEditor(selectedText, sectionId, 'note');
                break;
            case 'bookmark':
                this.addBookmark(selectedText, sectionId);
                break;
        }
        
        // Clear selection
        selection.removeAllRanges();
    }

    addHighlight(range, text, sectionId) {
        const span = document.createElement('span');
        span.className = 'annotation-highlight';
        span.style.backgroundColor = `${this.selectedColor}40`; // 40 = 25% opacity
        span.style.padding = '2px 0';
        span.style.borderRadius = '2px';
        span.dataset.annotationId = `highlight-${Date.now()}`;
        span.dataset.sectionId = sectionId;
        span.dataset.text = text;
        span.dataset.color = this.selectedColor;
        
        range.surroundContents(span);
        
        // Save annotation
        const annotation = {
            id: span.dataset.annotationId,
            type: 'highlight',
            text: text,
            sectionId: sectionId,
            color: this.selectedColor,
            timestamp: new Date().toISOString(),
            position: this.getTextPosition(range)
        };
        
        this.annotations.push(annotation);
        this.saveAnnotations();
        this.updateAnnotationsList();
        
        // Track analytics
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackCustomEvent('annotation_added', {
                type: 'highlight',
                text_length: text.length,
                section_id: sectionId
            });
        }
    }

    openAnnotationEditor(text, sectionId, type) {
        // Open annotations panel
        this.toggleAnnotationsPanel(true);
        
        // Pre-fill form
        document.getElementById('annotation-type').value = type;
        document.getElementById('annotation-text').value = text;
        document.getElementById('annotation-text').focus();
    }

    saveAnnotation() {
        const type = document.getElementById('annotation-type').value;
        const text = document.getElementById('annotation-text').value.trim();
        const color = this.selectedColor;
        
        if (!text) return;
        
        const annotation = {
            id: `annotation-${Date.now()}`,
            type: type,
            text: text,
            sectionId: this.currentSection,
            color: color,
            timestamp: new Date().toISOString()
        };
        
        this.annotations.push(annotation);
        this.saveAnnotations();
        this.updateAnnotationsList();
        
        // Clear form
        document.getElementById('annotation-text').value = '';
        
        // Show success message
        this.showToast('Annotation saved!', 'success');
        
        // Track analytics
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackCustomEvent('annotation_added', {
                type: type,
                text_length: text.length,
                section_id: this.currentSection
            });
        }
    }

    addBookmark(text, sectionId) {
        const bookmark = {
            id: `bookmark-${Date.now()}`,
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            sectionId: sectionId,
            timestamp: new Date().toISOString(),
            position: window.scrollY
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.updateBookmarksList();
        
        // Show success message
        this.showToast('Bookmark added!', 'success');
        
        // Track analytics
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackCustomEvent('bookmark_added', {
                text_length: text.length,
                section_id: sectionId
            });
        }
    }

    // UI Control Methods
    toggleSidebar(forceState) {
        const sidebar = document.getElementById('paper-sidebar');
        if (forceState !== undefined) {
            this.isSidebarOpen = forceState;
        } else {
            this.isSidebarOpen = !this.isSidebarOpen;
        }
        
        if (this.isSidebarOpen) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
        } else {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
        }
    }

    toggleAnnotationsPanel(forceState) {
        const panel = document.getElementById('annotations-panel');
        if (forceState !== undefined) {
            panel.classList.toggle('translate-x-full', !forceState);
            panel.classList.toggle('translate-x-0', forceState);
        } else {
            panel.classList.toggle('translate-x-full');
            panel.classList.toggle('translate-x-0');
        }
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
        document.getElementById('fullscreen-toggle').innerHTML = '<i class="fas fa-compress"></i>';
        
        // Announce to screen reader
        this.announceToScreenReader('Entered fullscreen mode');
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isFullscreen = false;
        document.getElementById('fullscreen-toggle').innerHTML = '<i class="fas fa-expand"></i>';
        
        // Announce to screen reader
        this.announceToScreenReader('Exited fullscreen mode');
    }

    printPaper() {
        window.print();
        
        // Track analytics
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackPrint();
        }
    }

    // Utility Methods
    populateSidebarTOC() {
        const tocDiv = document.getElementById('sidebar-toc');
        if (!tocDiv || !this.sections) return;
        
        tocDiv.innerHTML = this.sections.map((section, index) => {
            const title = section.querySelector('h2, h3')?.textContent || `Section ${index + 1}`;
            return `
                <div class="toc-item ${section.id === this.currentSection ? 'active' : ''}" 
                     data-section="${section.id}">
                    <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition flex items-center">
                        <span class="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center mr-3 text-xs">
                            ${index + 1}
                        </span>
                        <span class="truncate">${title}</span>
                    </button>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        tocDiv.querySelectorAll('.toc-item button').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.navigateToSection(this.sections[index].id);
                this.toggleSidebar(false);
            });
        });
    }

    updateAnnotationsList() {
        const listDiv = document.getElementById('annotations-list');
        if (!listDiv) return;
        
        if (this.annotations.length === 0) {
            listDiv.innerHTML = '<div class="text-slate-500 text-sm italic">No annotations yet</div>';
            return;
        }
        
        listDiv.innerHTML = this.annotations.map(anno => `
            <div class="annotation-item bg-slate-800 rounded-lg p-3">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${anno.color}"></div>
                        <span class="text-xs text-slate-400">${this.formatDate(anno.timestamp)}</span>
                    </div>
                    <button class="delete-annotation text-slate-500 hover:text-red-400" data-id="${anno.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-sm text-white mb-2">${anno.text}</div>
                <div class="text-xs text-slate-400">
                    <i class="fas fa-tag mr-1"></i>${anno.type}
                    <i class="fas fa-map-marker-alt ml-3 mr-1"></i>${anno.sectionId || 'Unknown'}
                </div>
            </div>
        `).join('');
        
        // Add delete handlers
        listDiv.querySelectorAll('.delete-annotation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.deleteAnnotation(id);
            });
        });
    }

    updateBookmarksList() {
        const listDiv = document.getElementById('sidebar-bookmarks');
        if (!listDiv) return;
        
        if (this.bookmarks.length === 0) {
            listDiv.innerHTML = '<div class="text-slate-500 text-sm italic">No bookmarks yet</div>';
            return;
        }
        
        listDiv.innerHTML = this.bookmarks.map(bookmark => `
            <div class="bookmark-item bg-slate-800 rounded-lg p-3">
                <div class="flex justify-between items-start mb-2">
                    <button class="goto-bookmark text-left text-sm text-white hover:text-quantum-primary" 
                            data-section="${bookmark.sectionId}" data-position="${bookmark.position}">
                        <i class="fas fa-bookmark mr-2 text-yellow-400"></i>
                        ${bookmark.text}
                    </button>
                    <button class="delete-bookmark text-slate-500 hover:text-red-400" data-id="${bookmark.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-xs text-slate-400">
                    ${this.formatDate(bookmark.timestamp)}
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        listDiv.querySelectorAll('.goto-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.target.closest('button').dataset.section;
                const position = e.target.closest('button').dataset.position;
                
                if (sectionId) {
                    this.navigateToSection(sectionId);
                    setTimeout(() => {
                        window.scrollTo({ top: position, behavior: 'smooth' });
                    }, 500);
                }
                
                this.toggleSidebar(false);
            });
        });
        
        listDiv.querySelectorAll('.delete-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.deleteBookmark(id);
            });
        });
    }

    updateReadingProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = totalHeight > 0 ? Math.round((scrolled / totalHeight) * 100) : 0;
        
        // Update progress bar
        const progressBar = document.getElementById('readingProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update sidebar stats
        const sectionsRead = this.sections ? this.sections.filter(s => {
            const rect = s.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }).length : 0;
        
        document.getElementById('sections-read')?.textContent = 
            `${sectionsRead}/${this.sections?.length || 0}`;
        document.getElementById('reading-progress')?.textContent = `${progress}%`;
        
        // Update reading time
        if (window.ResearchAnalytics) {
            const stats = window.ResearchAnalytics.getReadingStats();
            if (stats && stats.timeSpent) {
                const minutes = Math.floor(stats.timeSpent / 60000);
                document.getElementById('reading-time')?.textContent = `${minutes}m`;
            }
        }
    }

    // Data Persistence Methods
    loadPreferences() {
        try {
            const prefs = JSON.parse(localStorage.getItem('paperViewerPrefs') || '{}');
            
            this.fontSize = prefs.fontSize || 16;
            this.zoomLevel = prefs.zoomLevel || 1;
            this.theme = prefs.theme || 'dark';
            this.readingMode = prefs.readingMode || 'default';
            
            // Apply preferences
            document.documentElement.style.fontSize = `${this.fontSize}px`;
            
            // Set initial zoom
            setTimeout(() => {
                document.documentElement.style.transform = `scale(${this.zoomLevel})`;
                document.documentElement.style.transformOrigin = 'top center';
            }, 100);
            
        } catch (e) {
            console.error('Failed to load preferences:', e);
        }
    }

    savePreferences() {
        const prefs = {
            fontSize: this.fontSize,
            zoomLevel: this.zoomLevel,
            theme: this.theme,
            readingMode: this.readingMode,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('paperViewerPrefs', JSON.stringify(prefs));
    }

    loadAnnotations() {
        try {
            const paperId = window.location.pathname.split('/').pop().replace('.html', '');
            const key = `paper_annotations_${paperId}`;
            
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            this.annotations = data.annotations || [];
            this.bookmarks = data.bookmarks || [];
            this.highlights = data.highlights || [];
            
            this.updateAnnotationsList();
            this.updateBookmarksList();
            
        } catch (e) {
            console.error('Failed to load annotations:', e);
        }
    }

    saveAnnotations() {
        try {
            const paperId = window.location.pathname.split('/').pop().replace('.html', '');
            const key = `paper_annotations_${paperId}`;
            
            const data = {
                annotations: this.annotations,
                bookmarks: this.bookmarks,
                highlights: this.highlights,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(data));
            
        } catch (e) {
            console.error('Failed to save annotations:', e);
        }
    }

    saveBookmarks() {
        this.saveAnnotations(); // Bookmarks are saved with annotations
    }

    saveReadingPosition() {
        try {
            const paperId = window.location.pathname.split('/').pop().replace('.html', '');
            const key = `paper_position_${paperId}`;
            
            const position = {
                sectionId: this.currentSection,
                scrollY: window.scrollY,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(position));
            
        } catch (e) {
            console.error('Failed to save reading position:', e);
        }
    }

    loadReadingPosition() {
        try {
            const paperId = window.location.pathname.split('/').pop().replace('.html', '');
            const key = `paper_position_${paperId}`;
            const position = JSON.parse(localStorage.getItem(key) || '{}');
            
            if (position.sectionId && position.scrollY) {
                // Navigate to saved position after page loads
                setTimeout(() => {
                    if (position.sectionId) {
                        this.navigateToSection(position.sectionId);
                        setTimeout(() => {
                            window.scrollTo({ top: position.scrollY });
                        }, 1000);
                    }
                }, 500);
            }
            
        } catch (e) {
            console.error('Failed to load reading position:', e);
        }
    }

    // Helper Methods
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getTextPosition(range) {
        const rect = range.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }

    deleteAnnotation(id) {
        this.annotations = this.annotations.filter(anno => anno.id !== id);
        this.saveAnnotations();
        this.updateAnnotationsList();
        
        // Remove from DOM
        document.querySelector(`[data-annotation-id="${id}"]`)?.remove();
        
        this.showToast('Annotation deleted', 'info');
    }

    deleteBookmark(id) {
        this.bookmarks = this.bookmarks.filter(bm => bm.id !== id);
        this.saveBookmarks();
        this.updateBookmarksList();
        
        this.showToast('Bookmark deleted', 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-slide-up ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Accessibility Methods
    addAriaLabels() {
        // Add labels to toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const title = btn.getAttribute('title');
                if (title) {
                    btn.setAttribute('aria-label', title);
                }
            }
        });
        
        // Add landmark roles
        document.querySelector('main')?.setAttribute('role', 'main');
        document.querySelector('nav')?.setAttribute('role', 'navigation');
        document.querySelector('aside')?.setAttribute('role', 'complementary');
    }

    enableKeyboardNavigation() {
        // Add tabindex to interactive elements
        document.querySelectorAll('button, input, select, textarea, a[href]').forEach(el => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
        
        // Enable focus styles
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderAnnouncements() {
        // Create announcement area
        const announcement = document.createElement('div');
        announcement.id = 'screen-reader-announcement';
        announcement.className = 'sr-only';
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcement);
    }

    announceToScreenReader(message) {
        const announcement = document.getElementById('screen-reader-announcement');
        if (announcement) {
            announcement.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                announcement.textContent = '';
            }, 1000);
        }
    }

    // Public API Methods
    getCurrentSection() {
        return {
            id: this.currentSection,
            title: document.getElementById(this.currentSection)?.querySelector('h2, h3')?.textContent,
            index: this.sections?.findIndex(s => s.id === this.currentSection) + 1,
            total: this.sections?.length
        };
    }

    getReadingStats() {
        return {
            timeSpent: window.ResearchAnalytics?.getReadingStats()?.timeSpent || 0,
            sectionsRead: new Set(this.sections?.filter(s => {
                const rect = s.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            }).map(s => s.id)).size,
            totalSections: this.sections?.length || 0,
            annotations: this.annotations.length,
            bookmarks: this.bookmarks.length
        };
    }

    exportAnnotations(format = 'json') {
        const data = {
            paperId: window.location.pathname.split('/').pop().replace('.html', ''),
            paperTitle: document.title,
            exportDate: new Date().toISOString(),
            annotations: this.annotations,
            bookmarks: this.bookmarks,
            highlights: this.highlights
        };
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `annotations-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'text') {
            const text = data.annotations.map(a => 
                `[${a.type.toUpperCase()}] ${a.text}\nSection: ${a.sectionId}\nDate: ${a.timestamp}\n`
            ).join('\n---\n');
            
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `annotations-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // Track export
        if (window.ResearchAnalytics) {
            window.ResearchAnalytics.trackCustomEvent('annotations_exported', {
                format: format,
                count: data.annotations.length
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.PaperViewer = new PaperViewer();
    
    // Load saved reading position
    setTimeout(() => {
        window.PaperViewer.loadReadingPosition();
    }, 1000);
    
    // Expose public API
    window.getPaperViewer = () => window.PaperViewer;
    window.exportAnnotations = (format) => window.PaperViewer?.exportAnnotations(format);
    window.getReadingStats = () => window.PaperViewer?.getReadingStats();
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (window.PaperViewer) {
        window.PaperViewer.isFullscreen = !!document.fullscreenElement;
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (window.PaperViewer) {
        window.PaperViewer.isFullscreen = !!document.webkitFullscreenElement;
    }
});