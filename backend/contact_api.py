# backend/contact_api.py
from flask import Blueprint, request, jsonify, session
from datetime import datetime
import os
import json
from utils import validate_email, sanitize_input

contact_bp = Blueprint('contact', __name__)

MESSAGES = []

@contact_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        print("Received contact data:", data)
        
        if not data:
            return jsonify({"error": "No data received"}), 400
            
        required_fields = ['name', 'email', 'message']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        if not validate_email(data['email']):
            return jsonify({"error": "Invalid email address"}), 400
        
        # Create message object
        message = {
            'id': len(MESSAGES) + 1,
            'name': sanitize_input(data['name']),
            'email': sanitize_input(data['email']),
            'subject': sanitize_input(data.get('subject', 'No Subject')),
            'message': sanitize_input(data['message']),
            'timestamp': datetime.now().isoformat()
        }
        
        MESSAGES.append(message)
        print(f"New message received from {message['email']}")
        
        # Log the message
        os.makedirs('logs', exist_ok=True)
        with open('logs/contact_log.json', 'a') as f:
            f.write(json.dumps(message) + '\n')
        
        return jsonify({
            "status": "success",
            "message": "Contact message received successfully"
        })
            
    except Exception as e:
        print("Contact error:", str(e))
        return jsonify({"error": str(e)}), 500

@contact_bp.route('/api/contact/all-messages', methods=['GET'])
def get_all_messages():
    try:
        if not session.get('admin'):
            return jsonify({"error": "Unauthorized"}), 401
        
        return jsonify({"messages": MESSAGES})
    except Exception as e:
        return jsonify({"error": str(e)}), 500