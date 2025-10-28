// js/library-protection.js
// Additional protection against downloading
document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable keyboard shortcuts for save
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+S, Ctrl+Shift+S, etc.
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
        
        // Disable F12 (Developer Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
    
    // Protect against iframe embedding
    if (window !== window.top) {
        window.top.location = window.location;
    }
});