# backend/main.py
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from blog_api import blog_bp
from contact_api import contact_bp
import os 
import secrets

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(16))
CORS(app)

# Register blueprints
app.register_blueprint(blog_bp)
app.register_blueprint(contact_bp)

# Update login endpoint
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

# Add logout endpoint
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
            "login": "/api/login"
        }
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics"""
    try:
        # Check authorization
        if request.headers.get('Authorization') != os.getenv('ADMIN_PASSWORD', 'secret123'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from .blog_api import BLOGS
        from .contact_api import MESSAGES
        
        return jsonify({
            "blog_count": len(BLOGS),
            "total_blog_views": sum(b.get('views', 0) for b in BLOGS),
            "total_blog_likes": sum(b.get('likes', 0) for b in BLOGS),
            "message_count": len(MESSAGES),
            "latest_message": MESSAGES[-1] if MESSAGES else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)