// js/api.js
const BASE_URL = "https://antibodies-usual-header-emily.trycloudflare.com"; // Update after tunnel setup

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

export const addBlog = async (blog, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': password
      },
      body: JSON.stringify(blog)
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
            body: JSON.stringify({ password })
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