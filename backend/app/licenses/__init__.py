from flask import Blueprint

licenses_bp = Blueprint("licenses", __name__, url_prefix="/api/licenses")

from app.licenses import routes  # noqa: E402, F401
