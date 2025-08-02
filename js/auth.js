// js/auth.js
import { loginAdmin, logoutAdmin, checkAuth } from './api.js';
import { logDebug } from './debug-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    logDebug('Auth module initialized');
    
    const loginSection = document.getElementById('login-section');
    const dashboardContent = document.getElementById('dashboard-content');
    
    logDebug('Checking authentication status...');
    const isAuthenticated = await checkAuth();
    logDebug(`Authentication status: ${isAuthenticated}`);
    
    if (isAuthenticated) {
        logDebug('User is authenticated', 'success');
        loginSection.classList.add('hidden');
        dashboardContent.classList.remove('hidden');
    } else {
        logDebug('User is not authenticated');
        loginSection.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
    }

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        logDebug(`Login attempt with password: ${password}`);
        
        try {
            const result = await loginAdmin(password);
            logDebug(`Login result: ${JSON.stringify(result)}`);
            
            if (result.status === 'logged_in') {
                logDebug('Login successful', 'success');
                loginSection.classList.add('hidden');
                dashboardContent.classList.remove('hidden');
            } else {
                const errorMsg = result.error || 'Invalid credentials';
                logDebug(`Login failed: ${errorMsg}`, 'error');
                alert(`Login failed: ${errorMsg}`);
            }
        } catch (error) {
            alert('Login error: Server communication failed. Please try again.');
            console.error('Login error:', error);
            logDebug(`Login error: ${error.message}`, 'error');
        }
    });

    // Logout handler
    document.getElementById('logout-link').addEventListener('click', async (e) => {
        e.preventDefault();
        logDebug('Logout initiated');
        
        try {
            await logoutAdmin();
            logDebug('Logout successful', 'success');
            loginSection.classList.remove('hidden');
            dashboardContent.classList.add('hidden');
        } catch (error) {
            logDebug(`Logout error: ${error.message}`, 'error');
            alert('Logout failed. Please try again.');
        }
    });
});