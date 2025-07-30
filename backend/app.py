# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage (replace with database in production)
BLOGS = [
    {
        "id": 1,
        "title": "Getting Started with React",
        "summary": "Learn the fundamentals of React development",
        "content": "In this article, we'll cover the basics of React...",
        "category": "Web Development",
        "date": "2023-07-15",
        "image": "react.jpg"
    },
    {
        "id": 2,
        "title": "Startup Funding Strategies",
        "summary": "How to secure funding for your tech startup",
        "content": "Securing funding is crucial for startup growth...",
        "category": "Startups",
        "date": "2023-07-10",
        "image": "funding.jpg"
    }
]

MESSAGES = []
ADMIN_PASSWORD = "secret123"  # Change in production

@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    return jsonify({"blogs": BLOGS})

@app.route('/api/blogs', methods=['POST'])
def add_blog():
    # Check authorization
    if request.headers.get('Authorization') != ADMIN_PASSWORD:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Create new blog
    new_blog = request.json
    new_blog['id'] = len(BLOGS) + 1
    new_blog['date'] = datetime.now().strftime("%Y-%m-%d")
    BLOGS.append(new_blog)
    
    # Log to file (optional)
    with open('blog_log.json', 'a') as f:
        f.write(json.dumps(new_blog) + '\n')
    
    return jsonify({"status": "added", "id": new_blog['id']})

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    data['timestamp'] = datetime.now().isoformat()
    MESSAGES.append(data)
    
    # Log to file (optional)
    with open('contact_log.json', 'a') as f:
        f.write(json.dumps(data) + '\n')
    
    return jsonify({"status": "success"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data.get("password") == ADMIN_PASSWORD:
        return jsonify({"status": "logged_in"})
    return jsonify({"status": "fail"}), 401

if __name__ == '__main__':
    # Create logs directory if not exists
    os.makedirs('logs', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)