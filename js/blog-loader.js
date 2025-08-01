// js/blog-loader.js
import { fetchBlogs } from './api.js';

export const loadBlogPosts = async () => {
  try {
    const response = await fetchBlogs();
    const blogContainer = document.getElementById('blog-container');
    
    if (!blogContainer) return;
    
    if (response.blogs && response.blogs.length > 0) {
      blogContainer.innerHTML = '';
      
      response.blogs.forEach(blog => {
        const blogCard = document.createElement('article');
        blogCard.className = 'bg-white rounded-xl shadow-md overflow-hidden card-hover transition-all duration-300 hover:shadow-xl';
        
        // Fix image path
        const imageUrl = blog.image.startsWith('http') 
          ? blog.image 
          : `https://transcription-highland-hawk-na.trycloudflare.com/${blog.image}`;
        
        blogCard.innerHTML = `
          <img src="${imageUrl}" 
               alt="${blog.title}" 
               class="w-full h-48 object-cover"
               loading="lazy">
          <div class="p-6">
            <span class="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-4">
              ${blog.category}
            </span>
            <h3 class="text-xl font-bold mb-3 text-gray-800">${blog.title}</h3>
            <p class="text-gray-600 mb-4 line-clamp-2">${blog.summary}</p>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">${blog.date}</span>
              <a href="#" class="text-primary font-medium hover:text-secondary transition-colors">
                Read More →
              </a>
            </div>
          </div>
        `;
        blogContainer.appendChild(blogCard);
      });
    } else {
      blogContainer.innerHTML = `
        <div class="col-span-3 text-center py-12">
          <i class="fas fa-exclamation-circle text-4xl text-primary mb-4"></i>
          <p class="text-gray-600">No blog posts available at the moment.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Blog Loading Error:', error);
    const blogContainer = document.getElementById('blog-container');
    if (blogContainer) {
      blogContainer.innerHTML = `
        <div class="col-span-3 text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p class="text-gray-600">Failed to load blog posts. Please try again later.</p>
        </div>
      `;
    }
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadBlogPosts);