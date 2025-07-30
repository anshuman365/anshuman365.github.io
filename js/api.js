// js/api.js
const BASE_URL = "https://your-cloudflared-url"; // Replace with your Cloudflared URL

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