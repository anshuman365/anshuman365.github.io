import { loginAdmin, logoutAdmin, checkAuth } from './auth.js';
import { getStats, getAllMessages, getAllBlogs, addBlog, deleteBlog } from './api.js';
import { createMessageElement, createBlogElement, formatDate } from './dashboard-utils.js';

// Current active section
let currentSection = 'overview';

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    const loginSection = document.getElementById('login-section');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (isAuthenticated) {
        loginSection.classList.add('hidden');
        dashboardContent.classList.remove('hidden');
        loadDashboardData();
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
            loadDashboardData();
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

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Blog form submission
    document.getElementById('blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Publishing...';
        submitBtn.disabled = true;
        
        try {
            const blogData = {
                title: form.querySelector('#blog-title').value,
                summary: form.querySelector('#blog-summary').value,
                content: form.querySelector('#blog-content').value,
                category: form.querySelector('#blog-category').value,
                image: form.querySelector('#blog-image').value || 'default.jpg'
            };
            
            const response = await addBlog(blogData);
            
            if (response.status === 'added') {
                alert('Blog post published successfully!');
                form.reset();
                // Refresh blog list
                if (currentSection === 'blog') {
                    loadBlogPosts();
                }
                // Refresh stats
                loadStats();
            } else {
                throw new Error(response.error || 'Failed to publish blog post');
            }
        } catch (error) {
            console.error('Error publishing blog:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Restore button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

// Show a section
function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show the selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Load data if needed
    switch(section) {
        case 'overview':
            loadStats();
            break;
        case 'blog':
            loadBlogPosts();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    loadStats();
}

// Load stats for overview
async function loadStats() {
    try {
        const statsContainer = document.getElementById('stats-container');
        const messagesContainer = document.getElementById('recent-messages');
        
        // Show loading state
        statsContainer.innerHTML = '<div class="col-span-4 text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-primary"></i></div>';
        messagesContainer.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-primary"></i> Loading messages...</div>';
        
        const response = await getStats();
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        // Update stats cards
        statsContainer.innerHTML = `
            <div class="stat-card bg-white p-6 rounded-xl shadow">
                <div class="text-3xl font-bold text-primary">${response.blog_count}</div>
                <div class="text-gray-600">Blog Posts</div>
            </div>
            <div class="stat-card bg-white p-6 rounded-xl shadow">
                <div class="text-3xl font-bold text-primary">${response.message_count}</div>
                <div class="text-gray-600">Messages</div>
            </div>
            <div class="stat-card bg-white p-6 rounded-xl shadow">
                <div class="text-3xl font-bold text-primary">${response.total_blog_views}</div>
                <div class="text-gray-600">Page Views</div>
            </div>
            <div class="stat-card bg-white p-6 rounded-xl shadow">
                <div class="text-3xl font-bold text-primary">${response.engagement_rate}%</div>
                <div class="text-gray-600">Engagement Rate</div>
            </div>
        `;
        
        // Update recent messages
        messagesContainer.innerHTML = '';
        if (response.recent_messages && response.recent_messages.length > 0) {
            response.recent_messages.forEach(message => {
                messagesContainer.appendChild(createMessageElement(message));
            });
        } else {
            messagesContainer.innerHTML = '<p class="p-6 text-gray-600">No recent messages</p>';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
        document.getElementById('stats-container').innerHTML = '<div class="col-span-4 text-center py-8 text-red-500">Failed to load statistics</div>';
    }
}

// Load all blog posts
async function loadBlogPosts() {
    try {
        const container = document.getElementById('blog-posts-container');
        container.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-primary"></i> Loading blog posts...</div>';
        
        const response = await getAllBlogs();
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        container.innerHTML = '';
        if (response.blogs && response.blogs.length > 0) {
            // Sort by date (newest first)
            const sortedBlogs = response.blogs.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            
            sortedBlogs.forEach(blog => {
                container.appendChild(createBlogElement(blog));
            });
            
            // Add event listeners for delete buttons
            container.querySelectorAll('.delete-blog').forEach(button => {
                button.addEventListener('click', async function() {
                    const blogId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this blog post?')) {
                        const result = await deleteBlog(blogId);
                        if (result.status === 'deleted') {
                            loadBlogPosts();
                            loadStats(); // Refresh stats
                        } else {
                            alert('Failed to delete blog: ' + (result.error || 'Unknown error'));
                        }
                    }
                });
            });
        } else {
            container.innerHTML = '<p class="p-6 text-gray-600">No blog posts available</p>';
        }
    } catch (error) {
        console.error('Failed to load blog posts:', error);
        document.getElementById('blog-posts-container').innerHTML = '<p class="p-6 text-red-500">Failed to load blog posts</p>';
    }
}

// Load all messages
async function loadMessages() {
    try {
        const container = document.getElementById('all-messages-container');
        container.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-primary"></i> Loading messages...</div>';
        
        const response = await getAllMessages();
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        container.innerHTML = '';
        if (response.messages && response.messages.length > 0) {
            // Sort by date (newest first)
            const sortedMessages = response.messages.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            sortedMessages.forEach(message => {
                container.appendChild(createMessageElement(message));
            });
        } else {
            container.innerHTML = '<p class="p-6 text-gray-600">No messages available</p>';
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
        document.getElementById('all-messages-container').innerHTML = '<p class="p-6 text-red-500">Failed to load messages</p>';
    }
}