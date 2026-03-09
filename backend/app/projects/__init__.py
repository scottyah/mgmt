from flask import Blueprint

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

from app.projects import routes  # noqa: E402, F401
