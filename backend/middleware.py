from flask import session, jsonify, request

def admin_required(f):
    def decorated_function(*args, **kwargs):
        # Skip for login route
        if request.path == '/api/login':
            return f(*args, **kwargs)
            
        # Check session
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function