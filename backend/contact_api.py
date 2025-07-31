# backend/contact_api.py
from flask import Blueprint, request, jsonify, session
from datetime import datetime
import os
import json
from utils import validate_email, sanitize_input

contact_bp = Blueprint('contact', __name__)

# In-memory storage (replace with database in production)
MESSAGES = []

@contact_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    """Submit a contact form message"""
    try:
        data = request.json
        
        # Validate input
        required_fields = ['name', 'email', 'message']
        print("required_fields",required_fields)
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        print(validate_email(data['email']))
        if not validate_email(data['email']):
            return jsonify({"error": "Invalid email address"}), 400
        
        # Sanitize inputs
        sanitized_data = {
            "name": sanitize_input(data.get('name', '')),
            "email": sanitize_input(data.get('email', '')),
            "subject": sanitize_input(data.get('subject', 'No Subject')),
            "message": sanitize_input(data.get('message', '')),
            "timestamp": datetime.now().isoformat()
        }
        
        MESSAGES.append(sanitized_data)
        
        # Log to file
        os.makedirs('logs', exist_ok=True)
        with open('logs/contact_log.json', 'a') as f:
            f.write(json.dumps(sanitized_data) + '\n')
        
        return jsonify({"status": "success"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@contact_bp.route('/api/contact/messages', methods=['GET'])
def get_messages():
    """Get all contact messages (admin only)"""
    try:
        # Check session authentication
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        return jsonify({"messages": MESSAGES})
    except Exception as e:
        return jsonify({"error": str(e)}), 500