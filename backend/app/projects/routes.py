from datetime import datetime, timezone

from flask import request, jsonify, session

from app.auth.decorators import login_required
from app.audit import log_audit
from app.extensions import db
from app.projects import projects_bp
from app.projects.models import Project


@projects_bp.route("", methods=["GET"])
@login_required
def list_projects():
    username = session.get("user", "")
    query = Project.for_user(username)

    # Search
    search = request.args.get("search", "").strip()
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Project.key.ilike(pattern),
                Project.name.ilike(pattern),
                Project.description.ilike(pattern),
            )
        )

    # Sorting
    sort_field = request.args.get("sort", "name")
    order = request.args.get("order", "asc")

    sortable = {
        "key": Project.key,
        "name": Project.name,
        "status": Project.status,
        "created_at": Project.created_at,
        "updated_at": Project.updated_at,
    }
    col = sortable.get(sort_field, Project.name)
    if order == "desc":
        col = col.desc()
    query = query.order_by(col)

    projects = query.all()
    return jsonify({"projects": [p.to_dict() for p in projects]}), 200


@projects_bp.route("", methods=["POST"])
@login_required
def create_project():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    key = data.get("key", "").strip()
    name = data.get("name", "").strip()

    if not key or not name:
        return jsonify({"error": "Fields 'key' and 'name' are required"}), 400

    if Project.query.filter_by(key=key).first():
        return jsonify({"error": f"Project with key '{key}' already exists"}), 400

    status = data.get("status", "active")
    if status not in ("active", "archived", "on_hold"):
        return jsonify({"error": "Status must be one of: active, archived, on_hold"}), 400

    project = Project(
        key=key,
        name=name,
        description=data.get("description"),
        bfm=data.get("bfm"),
        bfm_email=data.get("bfm_email"),
        bfm_phone=data.get("bfm_phone"),
        pm=data.get("pm"),
        pm_email=data.get("pm_email"),
        pm_phone=data.get("pm_phone"),
        admin=data.get("admin"),
        admin_email=data.get("admin_email"),
        admin_phone=data.get("admin_phone"),
        status=status,
    )
    db.session.add(project)
    db.session.commit()

    log_audit("project", project.id, "created", {"key": project.key, "name": project.name})

    return jsonify(project.to_dict()), 201


@projects_bp.route("/<string:key>", methods=["GET"])
@login_required
def get_project(key):
    project = Project.query.filter_by(key=key).first()
    if not project:
        return jsonify({"error": f"Project '{key}' not found"}), 404

    d = project.to_dict()
    return jsonify({
        "project": d,
        "license_count": project.licenses.count(),
        "cert_count": project.certs.count(),
    }), 200


@projects_bp.route("/<string:key>", methods=["PUT"])
@login_required
def update_project(key):
    project = Project.query.filter_by(key=key).first()
    if not project:
        return jsonify({"error": f"Project '{key}' not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    updatable = ("name", "description", "bfm", "bfm_email", "bfm_phone", "pm", "pm_email", "pm_phone", "admin", "admin_email", "admin_phone", "status")
    changes = {}

    for field in updatable:
        if field in data:
            new_val = data[field]
            if field == "status" and new_val not in ("active", "archived", "on_hold"):
                return jsonify({"error": "Status must be one of: active, archived, on_hold"}), 400
            old_val = getattr(project, field)
            setattr(project, field, new_val)
            if old_val != new_val:
                changes[field] = {"old": old_val, "new": new_val}

    project.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    log_audit("project", project.id, "updated", changes)

    return jsonify(project.to_dict(include_counts=True)), 200


@projects_bp.route("/<string:key>", methods=["DELETE"])
@login_required
def delete_project(key):
    project = Project.query.filter_by(key=key).first()
    if not project:
        return jsonify({"error": f"Project '{key}' not found"}), 404

    # Nullify FKs on related items
    from app.licenses.models import License
    from app.certs.models import Cert

    License.query.filter_by(project_id=project.id).update({"project_id": None})
    Cert.query.filter_by(project_id=project.id).update({"project_id": None})

    project_id = project.id
    project_key = project.key
    db.session.delete(project)
    db.session.commit()

    log_audit("project", project_id, "deleted", {"key": project_key})

    return jsonify({"message": f"Project '{project_key}' deleted"}), 200
