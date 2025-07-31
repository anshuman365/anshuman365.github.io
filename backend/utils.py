# backend/utils.py
import re
import json
from datetime import datetime
from html import escape

def validate_email(email):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def sanitize_input(input_str):
    if not input_str:
        return ""
    return escape(input_str.strip())

def validate_blog_post(data):
    required = ['title', 'summary', 'content', 'category']
    if not all(key in data for key in required):
        return False, "Missing required fields"
    
    if len(data['title']) > 200:
        return False, "Title too long (max 200 chars)"
    
    if len(data['summary']) > 300:
        return False, "Summary too long (max 300 chars)"
    
    return True, ""