// js/debug-utils.js
const debugPanel = document.createElement('div');
debugPanel.id = 'debug-panel';
debugPanel.style.position = 'fixed';
debugPanel.style.bottom = '0';
debugPanel.style.left = '0';
debugPanel.style.right = '0';
debugPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
debugPanel.style.color = 'white';
debugPanel.style.padding = '10px';
debugPanel.style.zIndex = '9999';
debugPanel.style.maxHeight = '200px';
debugPanel.style.overflowY = 'auto';
debugPanel.style.fontFamily = 'monospace';
debugPanel.style.fontSize = '12px';
debugPanel.style.display = 'none';

const debugToggle = document.createElement('button');
debugToggle.textContent = 'Debug';
debugToggle.style.position = 'fixed';
debugToggle.style.bottom = '0';
debugToggle.style.right = '0';
debugToggle.style.zIndex = '10000';
debugToggle.style.padding = '5px 10px';
debugToggle.style.backgroundColor = '#333';
debugToggle.style.color = '#fff';

debugToggle.addEventListener('click', () => {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
});

document.body.appendChild(debugPanel);
document.body.appendChild(debugToggle);

export const logDebug = (message, type = 'info') => {
    const messageElement = document.createElement('div');
    messageElement.style.margin = '5px 0';
    
    if (type === 'error') {
        messageElement.style.color = '#ff5555';
    } else if (type === 'success') {
        messageElement.style.color = '#55ff55';
    } else if (type === 'warning') {
        messageElement.style.color = '#ffff55';
    }
    
    const timestamp = new Date().toLocaleTimeString();
    messageElement.textContent = `[${timestamp}] ${message}`;
    debugPanel.appendChild(messageElement);
    debugPanel.scrollTop = debugPanel.scrollHeight;
};

// Override console methods to also log to debug panel
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
    originalConsoleLog(...args);
    logDebug(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
};

console.error = (...args) => {
    originalConsoleError(...args);
    logDebug(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '), 'error');
};

console.warn = (...args) => {
    originalConsoleWarn(...args);
    logDebug(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '), 'warning');
};

// Initial debug message
logDebug('Debug system initialized');