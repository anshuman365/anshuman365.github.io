# backend/utils.py
import re
from datetime import datetime

def validate_email(email):
    """Validate email format using regex"""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def sanitize_input(input_str):
    """Basic input sanitization"""
    return input_str.strip() if input_str else ""

def log_activity(action, details):
    """Log admin activities"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "details": details
    }
    
    # Save to log file
    with open('logs/activity.log', 'a') as f:
        f.write(json.dumps(log_entry) + '\n')
    
    return True