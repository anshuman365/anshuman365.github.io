# backend/main.py
from flask import Flask, jsonify
from flask_cors import CORS
from .blog_api import blog_bp
from .contact_api import contact_bp
import os

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(blog_bp)
app.register_blueprint(contact_bp)

# Admin authentication endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data.get("password") == os.getenv('ADMIN_PASSWORD', 'secret123'):
        return jsonify({"status": "logged_in"})
    return jsonify({"status": "fail"}), 401

@app.route('/')
def health_check():
    return jsonify({"status": "active", "service": "Anshuman Portfolio Backend"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False') == 'True')