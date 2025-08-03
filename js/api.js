// js/api.js
import { logDebug } from './debug-utils.js';

const BASE_URL = "https://serum-warranties-infant-speeds.trycloudflare.com";
const SESSION_KEY = 'portfolio_session_data';

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
    
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken
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
        
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
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
                sessionToken: result.session_token,
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

const handleResponse = async (response, endpoint) => {
    logDebug(`${endpoint} response status: ${response.status}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        logDebug(`${endpoint} fetch error: ${errorText}`, 'error');
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
};

export const getStats = async () => {
  try {
    logDebug('Fetching stats...');
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/stats`, {
      headers: {
        'X-Session-Token': sessionToken
      },
      credentials: 'include'
    });
    
    return handleResponse(response, 'Stats');
  } catch (error) {
    logDebug(`Stats fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch stats' };
  }
};

export const getAllMessages = async () => {
  try {
    logDebug('Fetching all messages...');
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/contact/all-messages`, {
      headers: {
        'X-Session-Token': sessionToken
      },
      credentials: 'include'
    });
    
    return handleResponse(response, 'Messages');
  } catch (error) {
    logDebug(`Messages fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch messages' };
  }
};

export const getAllBlogs = async () => {
  try {
    logDebug('Fetching all blogs...');
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/admin/blogs`, {
      headers: {
        'X-Session-Token': sessionToken
      },
      credentials: 'include'
    });
    
    return handleResponse(response, 'Blogs');
  } catch (error) {
    logDebug(`Blogs fetch failed: ${error.message}`, 'error');
    return { error: 'Failed to fetch blogs' };
  }
};

export const deleteBlog = async (blog_id) => {
  try {
    logDebug(`Deleting blog ID: ${blog_id}`);
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/blogs/${blog_id}`, {
      method: 'DELETE',
      headers: {
        'X-Session-Token': sessionToken
      },
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

export const updateBlog = async (blog_id, blogData) => {
  try {
    logDebug(`Updating blog ID: ${blog_id}...`);
    logDebug(`Blog data: ${JSON.stringify(blogData)}`);
    
    // Get session data
    const sessionData = JSON.parse(localStorage.getItem(SESSION_KEY));
    const sessionToken = sessionData?.sessionToken || '';
    
    const response = await fetch(`${BASE_URL}/api/blogs/${blog_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken
      },
      body: JSON.stringify(blogData),
      credentials: 'include'
    });
    
    logDebug(`Update blog response status: ${response.status}`);
    const result = await response.json();
    logDebug(`Update blog response: ${JSON.stringify(result)}`);
    
    return result;
  } catch (error) {
    logDebug(`Update blog error: ${error.message}`, 'error');
    return { status: 'error', message: 'Failed to update blog' };
  }
};