from flask import Blueprint

certs_bp = Blueprint("certs", __name__, url_prefix="/api/certs")

from app.certs import routes  # noqa: E402, F401
