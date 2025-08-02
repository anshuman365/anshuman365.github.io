# backend/blog_api.py
from flask import Blueprint, request, jsonify
from datetime import datetime
import os

blog_bp = Blueprint('blog', __name__)

# In-memory storage (replace with database in production)
BLOGS = [
    {
        "id": 1,
        "title": "Getting Started with React",
        "summary": "Learn the fundamentals of React development",
        "content": "React is a powerful JavaScript library for building user interfaces. In this article, we'll cover the basics of React components, state management, and hooks...",
        "category": "Web Development",
        "date": "2023-07-15",
        "image": "backend/images/react.jpg",
        "views": 1250,
        "likes": 42
    },
    {
        "id": 2,
        "title": "Startup Funding Strategies",
        "summary": "How to secure funding for your tech startup",
        "content": "Securing funding is crucial for startup growth. We'll explore different funding options including bootstrapping, angel investors, venture capital, and crowdfunding...",
        "category": "Startups",
        "date": "2023-07-10",
        "image": "backend/images/funding.jpg",
        "views": 890,
        "likes": 31
    }
]

@blog_bp.route('/api/blogs', methods=['GET'])
def get_blogs():
    return jsonify({"blogs": BLOGS})

@blog_bp.route('/api/blogs', methods=['POST'])
def add_blog():
    # Check authorization
    if request.headers.get('Authorization') != os.getenv('ADMIN_PASSWORD', 'secret123'):
        return jsonify({"error": "Unauthorized"}), 401
    
    # Create new blog
    new_blog = request.json
    new_blog['id'] = len(BLOGS) + 1
    new_blog['date'] = datetime.now().strftime("%Y-%m-%d")
    BLOGS.append(new_blog)
    
    # Log to file
    os.makedirs('logs', exist_ok=True)
    with open('logs/blog_log.json', 'a') as f:
        f.write(json.dumps(new_blog) + '\n')
    
    return jsonify({"status": "added", "id": new_blog['id']})