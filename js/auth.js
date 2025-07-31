// js/auth.js
const BASE_URL = "https://antibodies-usual-header-emily.trycloudflare.com";

export const loginAdmin = async (password) => {
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'include'  // Important for session cookies
        });
        return response.json();
    } catch (error) {
        console.error('Login Error:', error);
        return { status: 'error', message: 'Login failed' };
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'  // Important for session cookies
        });
        return response.json();
    } catch (error) {
        console.error('Logout Error:', error);
        return { status: 'error', message: 'Logout failed' };
    }
};

export const checkAuth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/stats`, {
            credentials: 'include'  // Send cookies with request
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

// Add at the bottom of auth.js
// Auto-renew session every 5 minutes
setInterval(async () => {
    const sessionData = JSON.parse(localStorage.getItem('portfolio_session_data'));
    if (sessionData && sessionData.loggedIn) {
        try {
            await fetch(`${BASE_URL}/api/validate-session`, {
                credentials: 'include'
            });
            console.log('Session renewed');
        } catch (e) {
            console.error('Session renewal failed:', e);
        }
    }
}, 5 * 60 * 1000); // 5 minutes