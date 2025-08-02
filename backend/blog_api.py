# backend/blog_api.py
from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
import os
import json
from main import session_required
from utils import validate_blog_post


blog_bp = Blueprint('blog', __name__)

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
    try:
        sorted_blogs = sorted(BLOGS, key=lambda x: x['date'], reverse=True)
        return jsonify({"blogs": sorted_blogs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blog_bp.route('/api/blogs/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    try:
        blog = next((b for b in BLOGS if b['id'] == blog_id), None)
        if blog:
            blog['views'] = blog.get('views', 0) + 1
            return jsonify(blog)
        return jsonify({"error": "Blog not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blog_bp.route('/api/blogs', methods=['POST'])
@session_required
def add_blog():
    # Check session token
    session_token = request.headers.get('X-Session-Token')
    if not session_token or session_token != session.get('session_token'):
        return jsonify({"error": "Invalid session token"}), 401

    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        data = request.json
        required_fields = ['title', 'summary', 'content', 'category']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        new_blog = {
            "id": len(BLOGS) + 1,
            "title": data['title'],
            "summary": data['summary'],
            "content": data['content'],
            "category": data['category'],
            "date": datetime.now().strftime("%Y-%m-%d"),
            "image": data.get('image', 'default.jpg'),
            "views": 0,
            "likes": 0
        }
        
        BLOGS.append(new_blog)
        
        os.makedirs('logs', exist_ok=True)
        with open('logs/blog_log.json', 'a') as f:
            f.write(json.dumps(new_blog) + '\n')
        
        return jsonify({"status": "added", "id": new_blog['id']}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blog_bp.route('/api/blogs/<int:blog_id>/like', methods=['POST'])
def like_blog(blog_id):
    try:
        blog = next((b for b in BLOGS if b['id'] == blog_id), None)
        if blog:
            blog['likes'] = blog.get('likes', 0) + 1
            return jsonify({"likes": blog['likes']})
        return jsonify({"error": "Blog not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blog_bp.route('/api/blogs/<int:blog_id>', methods=['PUT'])
@session_required
def update_blog(blog_id):
    try:
        # Check session token
        session_token = request.headers.get('X-Session-Token')
        if not session_token or session_token != session.get('session_token'):
            return jsonify({"error": "Invalid session token"}), 401

        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        data = request.json
        blog = next((b for b in BLOGS if b['id'] == blog_id), None)
        
        if not blog:
            return jsonify({"error": "Blog not found"}), 404
        
        # Update blog fields
        blog['title'] = data.get('title', blog['title'])
        blog['summary'] = data.get('summary', blog['summary'])
        blog['content'] = data.get('content', blog['content'])
        blog['category'] = data.get('category', blog['category'])
        blog['image'] = data.get('image', blog['image'])
        
        return jsonify({"status": "updated", "id": blog_id})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500