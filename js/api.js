// js/api.js
const BASE_URL = "https://bargains-dog-ran-anaheim.trycloudflare.com";
const SESSION_KEY = 'portfolio_session_data';

export const fetchBlogs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/blogs`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Failed to fetch data' };
  }
};

export const submitContact = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { status: 'error', message: 'Failed to submit form' };
  }
};

export const addBlog = async (blog) => {
  try {
    const response = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken()  // Add this
      },
      body: JSON.stringify(blog),
      credentials: 'include'
    });
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { status: 'error', message: 'Failed to add blog' };
  }
};

export const loginAdmin = async (password) => {
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'include'  // Important for cookies
        });
        
        const result = await response.json();
        if (result.status === 'logged_in') {
            // Store session info in localStorage
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                loggedIn: true,
                timestamp: Date.now()
            }));
        }
        return result;
    } catch (error) {
        console.error('Login Error:', error);
        return { status: 'error', message: 'Login failed' };
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        // Clear local session data
        localStorage.removeItem(SESSION_KEY);
        return response.json();
    } catch (error) {
        console.error('Logout Error:', error);
        return { status: 'error', message: 'Logout failed' };
    }
};

export const checkAuth = async () => {
    // Check local session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    
    if (sessionData && sessionData.loggedIn) {
        try {
            // Validate session with server
            const response = await fetch(`${BASE_URL}/api/validate-session`, {
                credentials: 'include'
            });
            
            if (response.status === 200) {
                return true;
            }
        } catch (e) {
            console.error('Session validation failed:', e);
        }
    }
    
    return false;
};

// Add this new function
export const getCSRFToken = () => {
    const token = document.cookie.match('(^|;)\\s*csrf_token\\s*=\\s*([^;]+)');
    return token ? token.pop() : '';
};

// Auto-renew session periodically
setInterval(async () => {
    const sessionExpiry = localStorage.getItem(SESSION_KEY);
    if (sessionExpiry && Date.now() < sessionExpiry * 1000 - 60000) { // Renew if < 1 min left
        try {
            await fetch(`${BASE_URL}/api/validate-session`, {
                credentials: 'include'
            });
        } catch (e) {
            console.error('Session renewal failed:', e);
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// Add new API methods
export const getStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/stats`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Failed to fetch stats' };
  }
};

export const getAllMessages = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/contact/all-messages`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Failed to fetch messages' };
  }
};

export const getAllBlogs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blogs`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Failed to fetch blogs' };
  }
};

export const deleteBlog = async (blog_id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/blogs/${blog_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { status: 'error', message: 'Failed to delete blog' };
  }
};

