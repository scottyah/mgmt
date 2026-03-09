import logging
import os

from cryptography.fernet import Fernet
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()

logger = logging.getLogger(__name__)


class Config:
    # Require SECRET_KEY in production, use random for dev
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32).hex())

    # Fernet key — MUST be set via env var for data persistence
    FERNET_KEY = os.environ.get("FERNET_KEY")

    # Auth
    AUTH_USERNAME = os.environ.get("AUTH_USERNAME", "admin")
    AUTH_PASSWORD_HASH = os.environ.get("AUTH_PASSWORD_HASH", generate_password_hash("admin"))

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///osa.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Session
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "false").lower() == "true"
    PERMANENT_SESSION_LIFETIME = 28800  # 8 hours

    # Upload limit
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB

    @staticmethod
    def get_fernet_key():
        key = os.environ.get("FERNET_KEY")
        if key:
            return key
        # Dev fallback: persist to file so encrypted data survives restarts
        logger.warning(
            "FERNET_KEY not set via environment variable. "
            "Using file-based key for development. Set FERNET_KEY in production."
        )
        key_file = os.path.join(os.path.dirname(__file__), ".fernet_key")
        if os.path.exists(key_file):
            with open(key_file, "r") as f:
                return f.read().strip()
        key = Fernet.generate_key().decode()
        with open(key_file, "w") as f:
            f.write(key)
        return key
