# backend/main.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from blog_api import blog_bp
from contact_api import contact_bp
import os 
import secrets
from flask import make_response
import time

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(blog_bp)
app.register_blueprint(contact_bp)

# Admin authentication endpoint
@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate admin user"""
    try:
        data = request.json
        if 'password' not in data:
            return jsonify({"error": "Password required"}), 400
            
        if data.get("password") == os.getenv('ADMIN_PASSWORD', 'secret123'):
            # Create session
            session['logged_in'] = True
            session['admin'] = True
            return jsonify({"status": "logged_in"})
        return jsonify({"status": "fail", "error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout admin user"""
    session.pop('logged_in', None)
    session.pop('admin', None)
    return jsonify({"status": "logged_out"})

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "active",
        "service": "Anshuman Portfolio Backend",
        "version": "1.0.0",
        "endpoints": {
            "blogs": "/api/blogs",
            "contact": "/api/contact",
            "login": "/api/login",
            "logout": "/api/logout"
        }
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    try:
        # Check session authentication
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        from contact_api import MESSAGES
        
        # Calculate engagement rate
        total_views = sum(b.get('views', 0) for b in BLOGS)
        engagement_rate = min(100, (total_views / (len(BLOGS) * 100)) * 100) if BLOGS else 0
        
        # Get recent messages (last 3)
        recent_messages = sorted(MESSAGES, key=lambda x: x['timestamp'], reverse=True)[:3]
        
        return jsonify({
            "blog_count": len(BLOGS),
            "total_blog_views": total_views,
            "total_blog_likes": sum(b.get('likes', 0) for b in BLOGS),
            "message_count": len(MESSAGES),
            "recent_messages": recent_messages,
            "engagement_rate": round(engagement_rate, 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this new endpoint for getting all messages
@app.route('/api/contact/all-messages', methods=['GET'])
def get_all_messages():
    """Get all contact messages (admin only)"""
    try:
        # Check session authentication
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from contact_api import MESSAGES
        return jsonify({"messages": MESSAGES})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this new endpoint for getting all blogs
@app.route('/api/admin/blogs', methods=['GET'])
def get_all_blogs():
    """Get all blog posts (admin only)"""
    try:
        # Check session authentication
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        return jsonify({"blogs": BLOGS})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this new endpoint for deleting a blog
@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    """Delete a blog post (admin only)"""
    try:
        # Check session authentication
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        global BLOGS
        
        # Find and remove the blog
        original_count = len(BLOGS)
        BLOGS = [blog for blog in BLOGS if blog['id'] != blog_id]
        
        if len(BLOGS) == original_count:
            return jsonify({"error": "Blog not found"}), 404
            
        return jsonify({"status": "deleted", "id": blog_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)