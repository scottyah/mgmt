import json
import os
from datetime import date, datetime, timedelta, timezone

from flask import request, jsonify, send_file
import io

from app.auth.decorators import login_required
from app.audit import log_audit
from app.extensions import db
from app.licenses import licenses_bp
from app.licenses.models import License

ALLOWED_LICENSE_EXTENSIONS = {".lic", ".key", ".txt", ".xml", ".json", ".dat", ".cert", ".pem"}


def _validate_file_extension(filename):
    """Validate that the file has an allowed extension. Returns True if valid."""
    if not filename:
        return False
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_LICENSE_EXTENSIONS


def _parse_date(value):
    """Parse a date string (YYYY-MM-DD) or return None."""
    if not value:
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def _populate_license(lic, data):
    """Set license fields from a dict (form or JSON)."""
    text_fields = ("name", "description", "product", "vendor", "license_type",
                   "cost", "license_key", "notes")
    for field in text_fields:
        if field in data:
            setattr(lic, field, data[field] or None)

    if "seat_count" in data:
        val = data["seat_count"]
        lic.seat_count = int(val) if val not in (None, "", "null") else None

    if "expiration_date" in data:
        lic.expiration_date = _parse_date(data["expiration_date"])
    if "purchase_date" in data:
        lic.purchase_date = _parse_date(data["purchase_date"])

    if "project_id" in data:
        val = data["project_id"]
        lic.project_id = int(val) if val not in (None, "", "null") else None


@licenses_bp.route("", methods=["GET"])
@login_required
def list_licenses():
    query = License.query

    # Filters
    search = request.args.get("search", "").strip()
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                License.name.ilike(pattern),
                License.product.ilike(pattern),
                License.vendor.ilike(pattern),
                License.description.ilike(pattern),
            )
        )

    project_id = request.args.get("project_id")
    if project_id:
        query = query.filter(License.project_id == int(project_id))

    status_filter = request.args.get("status")

    # Sorting
    sort_field = request.args.get("sort", "name")
    order = request.args.get("order", "asc")
    sortable = {
        "name": License.name,
        "vendor": License.vendor,
        "product": License.product,
        "expiration_date": License.expiration_date,
        "created_at": License.created_at,
        "updated_at": License.updated_at,
    }
    col = sortable.get(sort_field, License.name)
    if order == "desc":
        col = col.desc()
    query = query.order_by(col)

    licenses = query.all()

    # Apply status filter in Python (hybrid property)
    if status_filter:
        licenses = [l for l in licenses if l.status == status_filter]

    return jsonify({"licenses": [l.to_dict() for l in licenses]}), 200


@licenses_bp.route("", methods=["POST"])
@login_required
def create_license():
    # Support both multipart form data and JSON
    if request.content_type and "multipart" in request.content_type:
        data = request.form.to_dict()
        file = request.files.get("file")
    else:
        data = request.get_json() or {}
        file = None

    if not data.get("name", "").strip():
        return jsonify({"error": "Field 'name' is required"}), 400

    lic = License()
    _populate_license(lic, data)

    if file:
        if not _validate_file_extension(file.filename):
            return jsonify({
                "error": f"File type not allowed. Allowed extensions: {', '.join(sorted(ALLOWED_LICENSE_EXTENSIONS))}"
            }), 400
        lic.file_name = file.filename
        lic.file_data = file.read()
        lic.file_mime_type = file.content_type

    db.session.add(lic)
    db.session.commit()

    log_audit("license", lic.id, "created", {"name": lic.name})

    return jsonify(lic.to_dict()), 201


@licenses_bp.route("/<int:license_id>", methods=["GET"])
@login_required
def get_license(license_id):
    lic = db.session.get(License, license_id)
    if not lic:
        return jsonify({"error": "License not found"}), 404
    return jsonify(lic.to_dict()), 200


@licenses_bp.route("/<int:license_id>", methods=["PUT"])
@login_required
def update_license(license_id):
    lic = db.session.get(License, license_id)
    if not lic:
        return jsonify({"error": "License not found"}), 404

    if request.content_type and "multipart" in request.content_type:
        data = request.form.to_dict()
        file = request.files.get("file")
    else:
        data = request.get_json() or {}
        file = None

    _populate_license(lic, data)

    if file:
        if not _validate_file_extension(file.filename):
            return jsonify({
                "error": f"File type not allowed. Allowed extensions: {', '.join(sorted(ALLOWED_LICENSE_EXTENSIONS))}"
            }), 400
        lic.file_name = file.filename
        lic.file_data = file.read()
        lic.file_mime_type = file.content_type

    lic.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    log_audit("license", lic.id, "updated", {"name": lic.name})

    return jsonify(lic.to_dict()), 200


@licenses_bp.route("/<int:license_id>", methods=["DELETE"])
@login_required
def delete_license(license_id):
    lic = db.session.get(License, license_id)
    if not lic:
        return jsonify({"error": "License not found"}), 404

    lic_name = lic.name
    db.session.delete(lic)
    db.session.commit()

    log_audit("license", license_id, "deleted", {"name": lic_name})

    return jsonify({"message": f"License '{lic_name}' deleted"}), 200


@licenses_bp.route("/<int:license_id>/download", methods=["GET"])
@login_required
def download_file(license_id):
    lic = db.session.get(License, license_id)
    if not lic:
        return jsonify({"error": "License not found"}), 404
    if not lic.file_data:
        return jsonify({"error": "No file attached to this license"}), 404

    log_audit("license", license_id, "file_downloaded", {"name": lic.name})

    return send_file(
        io.BytesIO(lic.file_data),
        mimetype=lic.file_mime_type or "application/octet-stream",
        as_attachment=True,
        download_name=lic.file_name or "license_file",
    )


@licenses_bp.route("/<int:license_id>/upload", methods=["POST"])
@login_required
def upload_file(license_id):
    lic = db.session.get(License, license_id)
    if not lic:
        return jsonify({"error": "License not found"}), 404

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    if not _validate_file_extension(file.filename):
        return jsonify({
            "error": f"File type not allowed. Allowed extensions: {', '.join(sorted(ALLOWED_LICENSE_EXTENSIONS))}"
        }), 400

    lic.file_name = file.filename
    lic.file_data = file.read()
    lic.file_mime_type = file.content_type
    lic.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    log_audit("license", license_id, "file_uploaded", {"name": lic.name, "file_name": lic.file_name})

    return jsonify(lic.to_dict()), 200
