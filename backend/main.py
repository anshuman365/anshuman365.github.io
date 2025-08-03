# backend/main.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os 
import secrets
import json
from datetime import datetime, timedelta
from flask_session import Session
from functools import wraps

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './.flask_session/'
app.config['SESSION_COOKIE_NAME'] = 'portfolio_session'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Required for cross-site requests

Session(app)

# Define allowed origins directly
ALLOWED_ORIGINS = [
    "http://localhost:5000", 
    "https://anshuman365.github.io",
    "https://serum-warranties-infant-speeds.trycloudflare.com",
    "http://localhost:8000"
]

CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({"status": "preflight"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, X-Session-Token")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

@app.before_request
def log_request_info():
    app.logger.debug('Received %s request to %s', request.method, request.path)
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data(as_text=True))
    app.logger.debug('Form data: %s', request.form)
    app.logger.debug('JSON data: %s', request.get_json(silent=True))
    app.logger.debug('Cookies: %s', request.cookies)

# Replace the existing add_cors_headers function with:
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Session-Token'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    
    # Set origin based on request
    origin = request.headers.get('Origin')
    if origin and origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
    return response

# Add session validation middleware
def session_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

def register_bp():
    from blog_api import blog_bp
    from contact_api import contact_bp
    app.register_blueprint(blog_bp)
    app.register_blueprint(contact_bp)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({"error": "Password required"}), 400
            
        password = data['password']
        admin_password = os.getenv('ADMIN_PASSWORD', 'secret123')
        
        if password == admin_password:
            session['logged_in'] = True
            session['admin'] = True
            session.permanent = True
            
            # Generate and store a simple session token
            session_token = secrets.token_hex(16)
            session['session_token'] = session_token
            
            return jsonify({
                "status": "logged_in",
                "session_token": session_token,
                "session_expiry": int((datetime.now() + app.config['PERMANENT_SESSION_LIFETIME']).timestamp())
            })
        return jsonify({"status": "fail", "error": "Invalid credentials"}), 401
    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/validate-session', methods=['GET'])
def validate_session():
    if session.get('admin') and session.get('session_token'):
        return jsonify({"status": "valid"})
    return jsonify({"status": "invalid"}), 401

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "logged_out"})

@app.route('/')
def health_check():
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

# All protected routes use session_required decorator
@app.route('/api/stats', methods=['GET'])
@session_required
def get_stats():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        from contact_api import MESSAGES
        
        total_views = sum(b.get('views', 0) for b in BLOGS)
        engagement_rate = min(100, (total_views / (len(BLOGS) * 100)) * 100) if BLOGS else 0
        
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

@app.route('/api/contact/all-messages', methods=['GET'])
@session_required
def get_all_messages():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from contact_api import MESSAGES
        return jsonify({"messages": MESSAGES})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/blogs', methods=['GET'])
@session_required
def get_all_blogs():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        return jsonify({"blogs": BLOGS})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
@session_required
def delete_blog(blog_id):
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        global BLOGS
        
        original_count = len(BLOGS)
        BLOGS = [blog for blog in BLOGS if blog['id'] != blog_id]
        
        if len(BLOGS) == original_count:
            return jsonify({"error": "Blog not found"}), 404
            
        return jsonify({"status": "deleted", "id": blog_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    register_bp()
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=True)