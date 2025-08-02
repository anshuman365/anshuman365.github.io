// js/dashboard.js
import { getStats, getAllMessages, getAllBlogs, addBlog, deleteBlog, updateBlog } from './api.js';
import { createMessageElement, createBlogElement, formatDate } from './dashboard-utils.js';

// Current active section
let currentSection = 'overview';

document.addEventListener('DOMContentLoaded', async () => {
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

    // Initially show the overview section
    showSection('overview');
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
            
            // Add event listeners for edit buttons
            container.querySelectorAll('.edit-blog').forEach(button => {
                button.addEventListener('click', function() {
                    const blogId = this.getAttribute('data-id');
                    openEditBlogModal(blogId);
                });
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

// Open edit blog modal
function openEditBlogModal(blogId) {
    // Fetch blog data
    const blogs = document.querySelectorAll('#blog-posts-container > div');
    const blogElement = Array.from(blogs).find(el => 
        el.querySelector(`.edit-blog[data-id="${blogId}"]`)
    );
    
    if (!blogElement) return;
    
    // Get blog data
    const title = blogElement.querySelector('h3').textContent;
    const category = blogElement.querySelector('.bg-gray-200').textContent;
    const summary = blogElement.querySelector('.text-gray-600.mt-2').textContent;
    
    // Create modal HTML
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Edit Blog Post</h3>
                    <button id="close-edit-modal" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="edit-blog-form" data-id="${blogId}" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">Title</label>
                        <input type="text" id="edit-blog-title" value="${title}" class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Summary</label>
                        <input type="text" id="edit-blog-summary" value="${summary}" class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary" required>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2">Category</label>
                        <select id="edit-blog-category" class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary">
                            <option ${category === 'Web Development' ? 'selected' : ''}>Web Development</option>
                            <option ${category === 'Startups' ? 'selected' : ''}>Startups</option>
                            <option ${category === 'Tech Trends' ? 'selected' : ''}>Tech Trends</option>
                            <option ${category === 'Career Advice' ? 'selected' : ''}>Career Advice</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="cancel-edit" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition">Cancel</button>
                        <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary transition">Update Post</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.id = 'edit-blog-modal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    document.getElementById('close-edit-modal').addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
    
    // Handle form submission
    document.getElementById('edit-blog-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const blogId = form.getAttribute('data-id');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Updating...';
        submitBtn.disabled = true;
        
        try {
            const blogData = {
                title: document.getElementById('edit-blog-title').value,
                summary: document.getElementById('edit-blog-summary').value,
                category: document.getElementById('edit-blog-category').value
            };
            
            const response = await updateBlog(blogId, blogData);
            
            if (response.status === 'updated') {
                alert('Blog post updated successfully!');
                closeEditModal();
                loadBlogPosts();
            } else {
                throw new Error(response.error || 'Failed to update blog post');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Restore button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-blog-modal');
    if (modal) {
        modal.remove();
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
            
            // Add event listeners for delete buttons
            container.querySelectorAll('.delete-message').forEach(button => {
                button.addEventListener('click', function() {
                    const messageId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this message?')) {
                        // Implement message deletion logic here
                        alert('Message deletion would be implemented here');
                    }
                });
            });
        } else {
            container.innerHTML = '<p class="p-6 text-gray-600">No messages available</p>';
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
        document.getElementById('all-messages-container').innerHTML = '<p class="p-6 text-red-500">Failed to load messages</p>';
    }
}