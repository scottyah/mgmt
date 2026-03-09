import logging

from flask import request, session, jsonify, current_app
from werkzeug.security import check_password_hash

from app.auth import auth_bp
from app.auth.decorators import login_required

logger = logging.getLogger(__name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    expected_username = current_app.config["AUTH_USERNAME"]
    expected_hash = current_app.config["AUTH_PASSWORD_HASH"]

    if username != expected_username or not check_password_hash(expected_hash, password):
        logger.warning(
            "Failed login attempt for user '%s' from IP %s",
            username,
            request.remote_addr,
        )
        return jsonify({"error": "Invalid credentials"}), 401

    session.clear()
    session["user"] = username
    session.permanent = True
    return jsonify({"user": {"username": username}}), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({"user": {"username": session["user"]}}), 200
