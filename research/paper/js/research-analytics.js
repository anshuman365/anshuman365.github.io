/**
 * Research Paper Analytics and Tracking
 * Advanced analytics for research paper interactions, downloads, and engagement
 */

class ResearchAnalytics {
    constructor() {
        this.paperId = null;
        this.paperTitle = null;
        this.startTime = null;
        this.sectionsRead = new Set();
        this.downloaded = false;
        this.shared = false;
        this.printed = false;
        
        // Initialize when DOM is ready
        this.init();
    }

    init() {
        // Extract paper information from page
        this.extractPaperInfo();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Track page view
        this.trackPageView();
        
        // Track reading start time
        this.startTime = Date.now();
        
        // Set up section visibility tracking
        this.setupSectionTracking();
        
        // Set up idle time tracking
        this.setupIdleTracking();
        
        console.log('Research Analytics initialized for:', this.paperTitle);
    }

    extractPaperInfo() {
        // Get paper ID from URL or data attribute
        const urlParts = window.location.pathname.split('/');
        this.paperId = urlParts[urlParts.length - 1].replace('.html', '') || 'unknown';
        
        // Get paper title from page
        const titleElement = document.querySelector('h1') || document.querySelector('[itemprop="headline"]');
        this.paperTitle = titleElement ? titleElement.textContent.trim() : document.title;
        
        // Store in session for cross-page tracking
        sessionStorage.setItem('lastResearchPaper', JSON.stringify({
            id: this.paperId,
            title: this.paperTitle,
            timestamp: Date.now()
        }));
    }

    setupEventListeners() {
        // Download button tracking
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Download tracking
            if (target.matches('.download-btn, [onclick*="download"], [href*=".pdf"]')) {
                this.trackDownload();
            }
            
            // Print tracking
            if (target.matches('[onclick*="print"], [href*="print"]')) {
                this.trackPrint();
            }
            
            // Share tracking
            if (target.matches('[href*="twitter.com/intent/tweet"], [href*="linkedin.com/shareArticle"], [href*="mailto:?subject"]')) {
                this.trackShare(target.href);
            }
            
            // External link tracking
            if (target.tagName === 'A' && target.href && !target.href.includes(window.location.hostname)) {
                this.trackExternalLink(target.href, target.textContent);
            }
        });

        // Copy event tracking
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection.length > 20) { // Only track significant copies
                this.trackCopy(selection);
            }
        });

        // Visibility change tracking (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackTabSwitch();
            }
        });

        // Before unload (closing page)
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
    }

    setupSectionTracking() {
        const sections = document.querySelectorAll('section[id]');
        const options = {
            threshold: 0.3,
            rootMargin: '-100px 0px -200px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (!this.sectionsRead.has(sectionId)) {
                        this.sectionsRead.add(sectionId);
                        this.trackSectionRead(sectionId, entry.target);
                        
                        // Update TOC highlight
                        this.highlightTOCItem(sectionId);
                    }
                }
            });
        }, options);

        sections.forEach(section => observer.observe(section));
    }

    setupIdleTracking() {
        let idleTimeout;
        let isIdle = false;
        
        const resetIdleTimer = () => {
            clearTimeout(idleTimeout);
            if (isIdle) {
                this.trackUserReturn();
                isIdle = false;
            }
            
            idleTimeout = setTimeout(() => {
                this.trackUserIdle();
                isIdle = true;
            }, 300000); // 5 minutes idle time
        };

        // Events that reset idle timer
        ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        resetIdleTimer(); // Start idle timer
    }

    // Analytics Tracking Methods
    trackPageView() {
        const data = {
            paper_id: this.paperId,
            paper_title: this.paperTitle,
            page_url: window.location.href,
            referrer: document.referrer,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            user_agent: navigator.userAgent
        };

        this.sendAnalytics('page_view', data);
        console.log('Page view tracked:', data);
    }

    trackSectionRead(sectionId, sectionElement) {
        const sectionTitle = sectionElement.querySelector('h2, h3')?.textContent.trim() || sectionId;
        const data = {
            paper_id: this.paperId,
            section_id: sectionId,
            section_title: sectionTitle,
            sections_completed: this.sectionsRead.size,
            reading_time: Date.now() - this.startTime,
            scroll_position: window.scrollY
        };

        this.sendAnalytics('section_read', data);
        
        // Check if all sections read
        const totalSections = document.querySelectorAll('section[id]').length;
        if (this.sectionsRead.size === totalSections) {
            this.trackPaperCompleted();
        }
    }

    trackDownload() {
        if (this.downloaded) return; // Prevent multiple tracking
        
        this.downloaded = true;
        const data = {
            paper_id: this.paperId,
            paper_title: this.paperTitle,
            download_time: Date.now() - this.startTime,
            sections_read: this.sectionsRead.size
        };

        this.sendAnalytics('paper_download', data);
        
        // Show download confirmation
        this.showToast('Research paper download started!', 'success');
    }

    trackPrint() {
        this.printed = true;
        const data = {
            paper_id: this.paperId,
            print_time: Date.now() - this.startTime,
            sections_read: this.sectionsRead.size
        };

        this.sendAnalytics('paper_print', data);
    }

    trackShare(platform) {
        this.shared = true;
        const platformName = platform.includes('twitter') ? 'twitter' :
                            platform.includes('linkedin') ? 'linkedin' :
                            platform.includes('mailto') ? 'email' : 'other';
        
        const data = {
            paper_id: this.paperId,
            platform: platformName,
            share_time: Date.now() - this.startTime
        };

        this.sendAnalytics('paper_share', data);
    }

    trackCopy(text) {
        const data = {
            paper_id: this.paperId,
            copied_text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            copy_length: text.length,
            copy_time: Date.now() - this.startTime
        };

        this.sendAnalytics('text_copy', data);
    }

    trackExternalLink(url, linkText) {
        const data = {
            paper_id: this.paperId,
            external_url: url,
            link_text: linkText,
            click_time: Date.now() - this.startTime
        };

        this.sendAnalytics('external_link_click', data);
    }

    trackTabSwitch() {
        const data = {
            paper_id: this.paperId,
            time_spent: Date.now() - this.startTime,
            sections_read: this.sectionsRead.size,
            last_section: Array.from(this.sectionsRead).pop()
        };

        this.sendAnalytics('tab_switch', data);
    }

    trackUserIdle() {
        const data = {
            paper_id: this.paperId,
            idle_start_time: Date.now() - this.startTime,
            sections_read: this.sectionsRead.size,
            scroll_position: window.scrollY
        };

        this.sendAnalytics('user_idle', data);
    }

    trackUserReturn() {
        const data = {
            paper_id: this.paperId,
            idle_duration: Date.now() - (Date.now() - 300000) // Approximate idle time
        };

        this.sendAnalytics('user_return', data);
    }

    trackPaperCompleted() {
        const data = {
            paper_id: this.paperId,
            completion_time: Date.now() - this.startTime,
            total_sections: this.sectionsRead.size,
            average_time_per_section: (Date.now() - this.startTime) / this.sectionsRead.size
        };

        this.sendAnalytics('paper_completed', data);
        
        // Show completion message
        this.showCompletionMessage();
    }

    trackSessionEnd() {
        const data = {
            paper_id: this.paperId,
            total_time_spent: Date.now() - this.startTime,
            sections_read: this.sectionsRead.size,
            downloaded: this.downloaded,
            shared: this.shared,
            printed: this.printed
        };

        // Use sendBeacon for reliable sending on page unload
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify({
                event: 'session_end',
                ...data,
                timestamp: new Date().toISOString()
            })], { type: 'application/json' });
            
            navigator.sendBeacon('/api/analytics', blob);
        } else {
            this.sendAnalytics('session_end', data);
        }
    }

    // Helper Methods
    sendAnalytics(eventName, data) {
        // Send to Google Analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...data,
                event_category: 'Research',
                event_label: this.paperTitle,
                value: data.reading_time || data.time_spent || 1
            });
        }

        // Send to custom analytics endpoint
        this.sendToBackend(eventName, data);
        
        // Console log for debugging
        console.log(`[Research Analytics] ${eventName}:`, data);
    }

    sendToBackend(eventName, data) {
        const payload = {
            event: eventName,
            paper_id: this.paperId,
            paper_title: this.paperTitle,
            ...data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_id: this.getUserId(),
            session_id: this.getSessionId()
        };

        // Use fetch with keepalive flag for reliability
        fetch('/api/research-analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            keepalive: true, // Works even if page is unloading
            mode: 'no-cors' // If CORS is not configured
        }).catch(error => {
            console.error('Analytics send failed:', error);
            // Fallback to localStorage for offline storage
            this.storeOffline(payload);
        });
    }

    getUserId() {
        let userId = localStorage.getItem('research_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('research_user_id', userId);
        }
        return userId;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('research_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('research_session_id', sessionId);
        }
        return sessionId;
    }

    storeOffline(payload) {
        try {
            let offlineEvents = JSON.parse(localStorage.getItem('research_offline_events') || '[]');
            offlineEvents.push(payload);
            
            // Keep only last 100 events
            if (offlineEvents.length > 100) {
                offlineEvents = offlineEvents.slice(-100);
            }
            
            localStorage.setItem('research_offline_events', JSON.stringify(offlineEvents));
            
            // Try to send offline events later
            this.retryOfflineEvents();
        } catch (e) {
            console.error('Failed to store offline analytics:', e);
        }
    }

    retryOfflineEvents() {
        if (navigator.onLine) {
            const offlineEvents = JSON.parse(localStorage.getItem('research_offline_events') || '[]');
            if (offlineEvents.length > 0) {
                // Send in batches
                const batchSize = 10;
                for (let i = 0; i < offlineEvents.length; i += batchSize) {
                    const batch = offlineEvents.slice(i, i + batchSize);
                    setTimeout(() => {
                        fetch('/api/research-analytics/batch', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ events: batch }),
                            keepalive: true
                        }).then(() => {
                            // Remove sent events from localStorage
                            const remaining = offlineEvents.slice(i + batchSize);
                            localStorage.setItem('research_offline_events', JSON.stringify(remaining));
                        }).catch(() => {
                            // Keep remaining events for later retry
                        });
                    }, i * 100); // Stagger requests
                }
            }
        }
    }

    highlightTOCItem(sectionId) {
        const tocItem = document.querySelector(`.toc-item[data-section="${sectionId}"]`);
        if (tocItem) {
            // Remove active class from all items
            document.querySelectorAll('.toc-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to current item
            tocItem.classList.add('active');
            
            // Scroll TOC item into view if needed
            const tocContainer = tocItem.closest('.table-of-contents');
            if (tocContainer) {
                const itemTop = tocItem.offsetTop;
                const containerTop = tocContainer.scrollTop;
                const containerHeight = tocContainer.clientHeight;
                
                if (itemTop < containerTop || itemTop > containerTop + containerHeight - 50) {
                    tocContainer.scrollTo({
                        top: itemTop - 20,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-slide-up ${type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`;
        toast.textContent = message;
        toast.style.maxWidth = '300px';
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    showCompletionMessage() {
        const completionDiv = document.createElement('div');
        completionDiv.className = 'fixed top-20 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-slide-up';
        completionDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-trophy text-2xl mr-3"></i>
                <div>
                    <div class="font-bold">Research Paper Completed!</div>
                    <div class="text-sm opacity-90">You've read all sections of "${this.paperTitle.substring(0, 40)}..."</div>
                </div>
            </div>
            <button class="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition">
                Download Certificate
            </button>
        `;
        
        document.body.appendChild(completionDiv);
        
        // Remove after 10 seconds
        setTimeout(() => {
            completionDiv.style.opacity = '0';
            completionDiv.style.transform = 'translateY(-20px)';
            setTimeout(() => document.body.removeChild(completionDiv), 300);
        }, 10000);
        
        // Add click event to download button
        completionDiv.querySelector('button').addEventListener('click', () => {
            this.generateCertificate();
        });
    }

    generateCertificate() {
        const certificateData = {
            paper_title: this.paperTitle,
            paper_id: this.paperId,
            user_name: localStorage.getItem('user_name') || 'Reader',
            completion_date: new Date().toLocaleDateString(),
            sections_completed: this.sectionsRead.size,
            reading_time: Math.round((Date.now() - this.startTime) / 60000) + ' minutes'
        };

        // Create certificate PDF (simulated)
        this.showToast('Certificate generation started!', 'success');
        this.sendAnalytics('certificate_generated', certificateData);
    }

    // Public API methods
    trackCustomEvent(eventName, data = {}) {
        this.sendAnalytics(`custom_${eventName}`, {
            ...data,
            custom_timestamp: Date.now()
        });
    }

    getReadingStats() {
        return {
            paperId: this.paperId,
            title: this.paperTitle,
            timeSpent: Date.now() - this.startTime,
            sectionsRead: this.sectionsRead.size,
            totalSections: document.querySelectorAll('section[id]').length,
            progress: Math.round((this.sectionsRead.size / document.querySelectorAll('section[id]').length) * 100),
            downloaded: this.downloaded,
            shared: this.shared
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ResearchAnalytics = new ResearchAnalytics();
    
    // Expose public methods
    window.trackResearchEvent = (eventName, data) => {
        window.ResearchAnalytics.trackCustomEvent(eventName, data);
    };
    
    window.getResearchStats = () => {
        return window.ResearchAnalytics.getReadingStats();
    };
});

// Handle offline/online events
window.addEventListener('online', () => {
    if (window.ResearchAnalytics) {
        window.ResearchAnalytics.retryOfflineEvents();
        window.ResearchAnalytics.showToast('Back online! Analytics resumed.', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.ResearchAnalytics) {
        window.ResearchAnalytics.showToast('You are offline. Analytics will sync when back online.', 'info');
    }
});