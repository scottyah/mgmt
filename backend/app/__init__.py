from flask import Flask
from flask_cors import CORS

from config import Config
from app.extensions import db, migrate
from app.errors import register_error_handlers


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Resolve Fernet key via the static method (with dev fallback)
    if not app.config.get("FERNET_KEY"):
        app.config["FERNET_KEY"] = Config.get_fernet_key()

    # CORS: allow Vite dev server with credentials
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register error handlers
    register_error_handlers(app)

    # Security headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # Register blueprints
    from app.auth import auth_bp
    from app.projects import projects_bp
    from app.licenses import licenses_bp
    from app.certs import certs_bp
    from app.dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(licenses_bp)
    app.register_blueprint(certs_bp)
    app.register_blueprint(dashboard_bp)

    # Import models so they are known to SQLAlchemy
    from app.projects.models import Project  # noqa: F401
    from app.licenses.models import License  # noqa: F401
    from app.certs.models import Cert  # noqa: F401
    from app.audit import AuditLog  # noqa: F401

    return app
