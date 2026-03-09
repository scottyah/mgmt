from functools import wraps

from flask import session, jsonify


def login_required(f):
    """Decorator that checks for an authenticated session."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401
        return f(*args, **kwargs)

    return decorated_function
