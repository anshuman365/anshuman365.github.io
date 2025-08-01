// js/api.js
import { logDebug } from './debug-utils.js';

const BASE_URL = "https://transcription-highland-hawk-na.trycloudflare.com";
const SESSION_KEY = 'portfolio_session_data';

// Add this to the top
logDebug(`API Base URL: ${BASE_URL}`);

export const fetchBlogs = async () => {
  try {
    logDebug('Fetching blogs...');
    const response = await fetch(`${BASE_URL}/api/blogs`);
    
    logDebug(`Blogs response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logDebug(`Blogs fetch error: ${errorText}`, 'error');
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    logDebug('Blogs fetched successfully', 'success');
    logDebug(`Blogs data: ${JSON.stringify(data, null, 2)}`);
    
    return data;
  } catch (error) {
    logDebug(`Blogs fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch data' };
  }
};

export const submitContact = async (data) => {
  try {
    logDebug('Submitting contact form...');
    
    // Get CSRF token
    let csrfToken = getCSRFToken();
    if (!csrfToken) {
        logDebug('No CSRF token found, fetching base URL to get token');
        await fetch(BASE_URL, { credentials: 'include' });
        csrfToken = getCSRFToken();
    }
    
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      }),
      credentials: 'include'
    });
    
    logDebug(`Contact response status: ${response.status}`);
    const result = await response.json();
    logDebug(`Contact response: ${JSON.stringify(result)}`);
    
    return result;
  } catch (error) {
    logDebug(`Contact submission error: ${error.message}`, 'error');
    return { status: 'error', message: 'Failed to submit form' };
  }
};

export const addBlog = async (blog) => {
  try {
    logDebug('Adding new blog...');
    logDebug(`Blog data: ${JSON.stringify(blog)}`);
    
    const response = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken()
      },
      body: JSON.stringify(blog),
      credentials: 'include'
    });
    
    logDebug(`Add blog response status: ${response.status}`);
    const result = await response.json();
    logDebug(`Add blog response: ${JSON.stringify(result)}`);
    
    return result;
  } catch (error) {
    logDebug(`Add blog error: ${error.message}`, 'error');
    return { status: 'error', message: 'Failed to add blog' };
  }
};

export const loginAdmin = async (password) => {
    try {
        logDebug(`Attempting login with password: ${password}`);
        
        // Get CSRF token
        let csrfToken = getCSRFToken();
        logDebug(`Initial CSRF token: ${csrfToken}`);
        
        // If we don't have a token, try to get one by making a GET request
        if (!csrfToken) {
            logDebug('No CSRF token found, fetching base URL to get token');
            await fetch(BASE_URL, { credentials: 'include' });
            csrfToken = getCSRFToken();
            logDebug(`New CSRF token: ${csrfToken}`);
        }
        
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        
        logDebug(`Login response status: ${response.status}`);
        
        const result = await response.json();
        logDebug(`Login response: ${JSON.stringify(result)}`);
        
        if (result.status === 'logged_in') {
            logDebug('Login successful', 'success');
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                loggedIn: true,
                timestamp: Date.now()
            }));
        } else {
            logDebug(`Login failed: ${result.error}`, 'error');
        }
        
        return result;
    } catch (error) {
        logDebug(`Login error: ${error.message}`, 'error');
        return { status: 'error', message: 'Login failed' };
    }
};

export const logoutAdmin = async () => {
    try {
        logDebug('Logging out...');
        
        const response = await fetch(`${BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        logDebug(`Logout response status: ${response.status}`);
        const result = await response.json();
        logDebug(`Logout response: ${JSON.stringify(result)}`);
        
        localStorage.removeItem(SESSION_KEY);
        return result;
    } catch (error) {
        logDebug(`Logout error: ${error.message}`, 'error');
        return { status: 'error', message: 'Logout failed' };
    }
};

export const checkAuth = async () => {
    logDebug('Checking authentication...');
    
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    
    if (sessionData && sessionData.loggedIn) {
        try {
            const response = await fetch(`${BASE_URL}/api/validate-session`, {
                credentials: 'include'
            });
            
            logDebug(`Session validation status: ${response.status}`);
            
            if (response.status === 200) {
                logDebug('Session is valid', 'success');
                return true;
            } else {
                logDebug('Session is invalid', 'warning');
            }
        } catch (e) {
            logDebug(`Session validation error: ${e.message}`, 'error');
        }
    } else {
        logDebug('No session data found');
    }
    
    return false;
};

export const getCSRFToken = () => {
    // Get all cookies as a string
    const cookieString = document.cookie;
    logDebug(`All cookies: ${cookieString}`);
    
    // Split cookies into individual parts
    const cookies = cookieString.split(';');
    let token = '';
    
    // Loop through all cookies to find the csrf_token
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Check if this cookie is the csrf_token
        if (cookie.startsWith('csrf_token=')) {
            token = cookie.substring('csrf_token='.length);
            break;
        }
    }
    
    logDebug(`CSRF Token: ${token}`);
    return token;
};

export const getStats = async () => {
  try {
    logDebug('Fetching stats...');
    
    const response = await fetch(`${BASE_URL}/api/stats`, {
      credentials: 'include'
    });
    
    logDebug(`Stats response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logDebug(`Stats fetch error: ${errorText}`, 'error');
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    logDebug('Stats fetched successfully', 'success');
    logDebug(`Stats data: ${JSON.stringify(data, null, 2)}`);
    
    return data;
  } catch (error) {
    logDebug(`Stats fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch stats' };
  }
};

export const getAllMessages = async () => {
  try {
    logDebug('Fetching all messages...');
    
    const response = await fetch(`${BASE_URL}/api/contact/all-messages`, {
      credentials: 'include'
    });
    
    logDebug(`Messages response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logDebug(`Messages fetch error: ${errorText}`, 'error');
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    logDebug('Messages fetched successfully', 'success');
    logDebug(`Messages data: ${JSON.stringify(data, null, 2)}`);
    
    return data;
  } catch (error) {
    logDebug(`Messages fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch messages' };
  }
};

export const getAllBlogs = async () => {
  try {
    logDebug('Fetching all blogs...');
    
    const response = await fetch(`${BASE_URL}/api/admin/blogs`, {
      credentials: 'include'
    });
    
    logDebug(`Blogs response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logDebug(`Blogs fetch error: ${errorText}`, 'error');
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    logDebug('Blogs fetched successfully', 'success');
    logDebug(`Blogs data: ${JSON.stringify(data, null, 2)}`);
    
    return data;
  } catch (error) {
    logDebug(`Blogs fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch blogs' };
  }
};

export const deleteBlog = async (blog_id) => {
  try {
    logDebug(`Deleting blog ID: ${blog_id}`);
    
    const response = await fetch(`${BASE_URL}/api/blogs/${blog_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    logDebug(`Delete blog response status: ${response.status}`);
    const result = await response.json();
    logDebug(`Delete blog response: ${JSON.stringify(result)}`);
    
    return result;
  } catch (error) {
    logDebug(`Delete blog error: ${error.message}`, 'error');
    return { status: 'error', message: 'Failed to delete blog' };
  }
};