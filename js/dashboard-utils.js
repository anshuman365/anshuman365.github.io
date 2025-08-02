// js/dashboard-utils.js
// Format date for display
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Create a message element
export const createMessageElement = (message) => {
  const messageEl = document.createElement('div');
  messageEl.className = 'p-6 flex items-start hover:bg-gray-50';
  
  // Extract initials
  const names = message.name.split(' ');
  const initials = names.length > 1 
    ? `${names[0][0]}${names[1][0]}` 
    : message.name.substring(0, 2);
  
  // Generate random color based on name
  const colors = ['bg-primary', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
  const colorIndex = message.name.charCodeAt(0) % colors.length;
  
  messageEl.innerHTML = `
    <div class="mr-4">
      <div class="w-10 h-10 rounded-full ${colors[colorIndex]} text-white flex items-center justify-center">
        ${initials.toUpperCase()}
      </div>
    </div>
    <div class="flex-1">
      <div class="font-bold">${message.name}</div>
      <div class="text-gray-600 mb-2">${message.subject}</div>
      <p class="text-gray-600 mb-2 line-clamp-2">${message.message}</p>
      <div class="text-sm text-gray-500">${formatDate(message.timestamp)}</div>
    </div>
    <div>
      <a href="mailto:${message.email}" class="text-primary hover:text-secondary mr-2">
        <i class="fas fa-reply"></i>
      </a>
      <button class="text-gray-400 hover:text-red-500 delete-message" data-id="${message.timestamp}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  return messageEl;
};

// Create a blog element for admin view
export const createBlogElement = (blog) => {
  const blogEl = document.createElement('div');
  blogEl.className = 'p-6 border-b hover:bg-gray-50';
  blogEl.innerHTML = `
    <div class="flex items-start">
      <img src="https://source.unsplash.com/random/100x100/?technology,${blog.id}" 
           alt="${blog.title}" 
           class="w-16 h-16 object-cover rounded-lg mr-4">
      <div class="flex-1">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold">${blog.title}</h3>
            <div class="flex items-center mt-1">
              <span class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs mr-2">
                ${blog.category}
              </span>
              <span class="text-gray-500 text-sm">${formatDate(blog.date)}</span>
            </div>
          </div>
          <div class="flex space-x-2">
            <span class="flex items-center text-gray-500">
              <i class="fas fa-eye mr-1"></i> ${blog.views}
            </span>
            <span class="flex items-center text-gray-500">
              <i class="fas fa-heart mr-1"></i> ${blog.likes}
            </span>
          </div>
        </div>
        <p class="text-gray-600 mt-2">${blog.summary}</p>
        <div class="mt-4 flex space-x-2">
          <button class="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-secondary transition edit-blog" data-id="${blog.id}">
            Edit
          </button>
          <button class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition delete-blog" data-id="${blog.id}">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
  
  return blogEl;
};