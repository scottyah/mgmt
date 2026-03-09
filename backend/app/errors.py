from flask import jsonify


def register_error_handlers(app):
    """Register global JSON error handlers on the Flask app."""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "message": str(e.description)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found", "message": "The requested resource was not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed", "message": str(e.description)}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "message": "An unexpected error occurred"}), 500
