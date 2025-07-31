# backend/main.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os 
import secrets
from flask import make_response
from datetime import timedelta
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_session import Session
from functools import wraps

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './.flask_session/'
app.config['SESSION_COOKIE_NAME'] = 'portfolio_session'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = os.getenv('ENVIRONMENT') == 'production'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

Session(app)

CORS(app, supports_credentials=True, origins=[
    "http://localhost:5000", 
    "https://anshuman365.github.io",
    "https://bargains-dog-ran-anaheim.trycloudflare.com",
    "https://anshuman365.github.io"  # Add your GitHub Pages URL here
])

# Add CSRF protection
csrf = CSRFProtect(app)

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

@app.after_request
def set_csrf_cookie(response):
    if response.status_code < 400:
        response.set_cookie('csrf_token', generate_csrf(), httponly=True, secure=app.config['SESSION_COOKIE_SECURE'])
    return response

# Add CSRF validation middleware
def csrf_protection(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            csrf_token = request.cookies.get('csrf_token')
            if not csrf_token or csrf_token != request.headers.get('X-CSRF-Token'):
                return jsonify({"error": "Invalid CSRF token"}), 403
        return f(*args, **kwargs)
    return decorated_function

def register_bp():
    from blog_api import blog_bp
    from contact_api import contact_bp
    app.register_blueprint(blog_bp)
    app.register_blueprint(contact_bp)

@app.route('/api/login', methods=['POST'])
def login():
    print("login start")
    try:
        # Handle both form data and JSON
        if request.content_type == 'application/json':
            data = request.get_json()
        else:
            data = request.form
            
        print("Received data:", data)
        
        if not data or 'password' not in data:
            return jsonify({"error": "Password required"}), 400
            
        password = data['password']
        admin_password = os.getenv('ADMIN_PASSWORD', 'secret123')
        
        if password == admin_password:
            session['logged_in'] = True
            session['admin'] = True
            session.permanent = True
            
            return jsonify({
                "status": "logged_in",
                "session_expiry": int((datetime.now() + app.config['PERMANENT_SESSION_LIFETIME']).timestamp())
            })
        return jsonify({"status": "fail", "error": "Invalid credentials"}), 401
    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/validate-session', methods=['GET'])
def validate_session():
    if session.get('admin'):
        return jsonify({"status": "valid"})
    return jsonify({"status": "invalid"}), 401

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('logged_in', None)
    session.pop('admin', None)
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

@app.route('/api/stats', methods=['GET'])
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
def get_all_messages():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from contact_api import MESSAGES
        return jsonify({"messages": MESSAGES})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/blogs', methods=['GET'])
def get_all_blogs():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        from blog_api import BLOGS
        return jsonify({"blogs": BLOGS})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
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