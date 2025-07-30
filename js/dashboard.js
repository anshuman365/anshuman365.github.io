import { loginAdmin, logoutAdmin, checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    const loginSection = document.getElementById('login-section');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (isAuthenticated) {
        loginSection.classList.add('hidden');
        dashboardContent.classList.remove('hidden');
    } else {
        loginSection.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
    }

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        const result = await loginAdmin(password);
        
        if (result.status === 'logged_in') {
            loginSection.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
        } else {
            alert('Login failed: ' + (result.error || 'Invalid credentials'));
        }
    });

    // Logout handler
    document.getElementById('logout-link').addEventListener('click', async (e) => {
        e.preventDefault();
        await logoutAdmin();
        loginSection.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
    });
});