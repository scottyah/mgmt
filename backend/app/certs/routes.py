import io
import json
import logging
from datetime import datetime, timezone

from flask import request, jsonify, send_file

from app.auth.decorators import login_required
from app.audit import log_audit
from app.crypto import encrypt_data, decrypt_data
from app.extensions import db
from app.certs import certs_bp
from app.certs.models import Cert
from app.certs.cert_utils import (
    auto_detect_and_parse,
    extract_metadata,
    export_pem,
    export_der,
    export_pkcs12,
    export_pem_bundle,
    export_private_key_pem,
    parse_pem_bundle,
)
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import Encoding

logger = logging.getLogger(__name__)


def _store_cert(cert_obj, key_obj, chain_certs, name, description=None,
                cert_type=None, project_id=None, notes=None):
    """Create and store a Cert record from parsed crypto objects."""
    metadata = extract_metadata(cert_obj)

    cert_pem = cert_obj.public_bytes(Encoding.PEM).decode()

    private_key_encrypted = None
    if key_obj is not None:
        key_pem = key_obj.private_bytes(
            encoding=Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        private_key_encrypted = encrypt_data(key_pem)

    chain_pem = None
    if chain_certs:
        chain_parts = [c.public_bytes(Encoding.PEM).decode() for c in chain_certs]
        chain_pem = "".join(chain_parts)

    cert = Cert(
        name=name,
        description=description,
        common_name=metadata["common_name"],
        subject=metadata["subject"],
        issuer=metadata["issuer"],
        serial_number=metadata["serial_number"],
        not_valid_before=metadata["not_valid_before"],
        not_valid_after=metadata["not_valid_after"],
        san=metadata["san"],
        cert_pem=cert_pem,
        private_key_encrypted=private_key_encrypted,
        chain_pem=chain_pem,
        cert_type=cert_type,
        key_algorithm=metadata["key_algorithm"],
        fingerprint_sha256=metadata["fingerprint_sha256"],
        project_id=int(project_id) if project_id else None,
        notes=notes,
    )

    db.session.add(cert)
    db.session.commit()

    return cert


@certs_bp.route("", methods=["GET"])
@login_required
def list_certs():
    query = Cert.query

    search = request.args.get("search", "").strip()
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Cert.name.ilike(pattern),
                Cert.common_name.ilike(pattern),
                Cert.subject.ilike(pattern),
                Cert.issuer.ilike(pattern),
                Cert.description.ilike(pattern),
            )
        )

    project_id = request.args.get("project_id")
    if project_id:
        query = query.filter(Cert.project_id == int(project_id))

    sort_field = request.args.get("sort", "name")
    order = request.args.get("order", "asc")
    sortable = {
        "name": Cert.name,
        "common_name": Cert.common_name,
        "not_valid_after": Cert.not_valid_after,
        "cert_type": Cert.cert_type,
        "created_at": Cert.created_at,
        "updated_at": Cert.updated_at,
    }
    col = sortable.get(sort_field, Cert.name)
    if order == "desc":
        col = col.desc()
    query = query.order_by(col)

    certs = query.all()
    # Never include private key in list response
    return jsonify({"certs": [c.to_dict(include_private_key=False) for c in certs]}), 200


@certs_bp.route("", methods=["POST"])
@login_required
def create_cert():
    """Create a cert from pasted PEM cert + optional key."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name", "").strip()
    cert_pem_text = data.get("cert_pem", "").strip()

    if not name:
        return jsonify({"error": "Field 'name' is required"}), 400
    if not cert_pem_text:
        return jsonify({"error": "Field 'cert_pem' is required"}), 400

    key_pem_text = data.get("private_key_pem", "").strip() or None

    try:
        # Parse the PEM bundle (cert may contain chain)
        combined = cert_pem_text
        if key_pem_text:
            combined = cert_pem_text + "\n" + key_pem_text
        cert_obj, key_obj, chain_certs = parse_pem_bundle(combined)
    except Exception as e:
        logger.error("Failed to parse certificate: %s", e)
        return jsonify({"error": "Failed to parse certificate. Ensure it is valid PEM format."}), 400

    try:
        cert = _store_cert(
            cert_obj, key_obj, chain_certs,
            name=name,
            description=data.get("description"),
            cert_type=data.get("cert_type"),
            project_id=data.get("project_id"),
            notes=data.get("notes"),
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to store certificate: %s", e)
        return jsonify({"error": "Failed to store certificate."}), 500

    log_audit("cert", cert.id, "created", {"name": cert.name, "common_name": cert.common_name})

    return jsonify(cert.to_dict()), 201


@certs_bp.route("/import", methods=["POST"])
@login_required
def import_cert():
    """Import a cert from file upload. Auto-detect format."""
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    name = request.form.get("name", "").strip()
    if not name:
        # Use filename as fallback name
        name = file.filename or "Imported Certificate"

    passphrase = request.form.get("passphrase")
    file_data = file.read()

    try:
        cert_obj, key_obj, chain_certs = auto_detect_and_parse(file_data, passphrase)
    except Exception as e:
        logger.error("Failed to parse uploaded cert file: %s", e)
        return jsonify({"error": "Failed to parse file. Ensure it is a valid certificate format (PEM, DER, or PKCS12)."}), 400

    try:
        cert = _store_cert(
            cert_obj, key_obj, chain_certs,
            name=name,
            description=request.form.get("description"),
            cert_type=request.form.get("cert_type"),
            project_id=request.form.get("project_id"),
            notes=request.form.get("notes"),
        )
    except Exception as e:
        db.session.rollback()
        logger.error("Failed to store imported certificate: %s", e)
        return jsonify({"error": "Failed to store certificate."}), 500

    log_audit("cert", cert.id, "imported", {
        "name": cert.name,
        "common_name": cert.common_name,
        "filename": file.filename,
    })

    return jsonify(cert.to_dict()), 201


@certs_bp.route("/<int:cert_id>", methods=["GET"])
@login_required
def get_cert(cert_id):
    cert = db.session.get(Cert, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404
    # Metadata only, no private key
    return jsonify(cert.to_dict(include_private_key=False)), 200


@certs_bp.route("/<int:cert_id>", methods=["PUT"])
@login_required
def update_cert(cert_id):
    cert = db.session.get(Cert, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    updatable = ("name", "description", "cert_type", "notes", "aws_secret_arn")
    changes = {}
    for field in updatable:
        if field in data:
            old_val = getattr(cert, field)
            new_val = data[field]
            setattr(cert, field, new_val)
            if old_val != new_val:
                changes[field] = {"old": old_val, "new": new_val}

    if "project_id" in data:
        val = data["project_id"]
        cert.project_id = int(val) if val not in (None, "", "null") else None

    cert.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    log_audit("cert", cert.id, "updated", changes)

    return jsonify(cert.to_dict()), 200


@certs_bp.route("/<int:cert_id>", methods=["DELETE"])
@login_required
def delete_cert(cert_id):
    cert = db.session.get(Cert, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404

    cert_name = cert.name
    db.session.delete(cert)
    db.session.commit()

    log_audit("cert", cert_id, "deleted", {"name": cert_name})

    return jsonify({"message": f"Certificate '{cert_name}' deleted"}), 200


@certs_bp.route("/<int:cert_id>/export", methods=["GET"])
@login_required
def export_cert(cert_id):
    cert = db.session.get(Cert, cert_id)
    if not cert:
        return jsonify({"error": "Certificate not found"}), 404

    fmt = request.args.get("format", "pem").lower()

    if not cert.cert_pem:
        return jsonify({"error": "No certificate data available"}), 400

    cert_obj = x509.load_pem_x509_certificate(cert.cert_pem.encode())

    # Load chain certs if present
    chain_certs = []
    if cert.chain_pem:
        import re
        pem_blocks = re.findall(
            r"(-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----)",
            cert.chain_pem,
            re.DOTALL,
        )
        for block in pem_blocks:
            chain_certs.append(x509.load_pem_x509_certificate(block.encode()))

    # Load private key if needed and available
    key_obj = None
    if cert.private_key_encrypted:
        try:
            key_pem = decrypt_data(cert.private_key_encrypted)
            key_obj = serialization.load_pem_private_key(key_pem, password=None)
        except Exception as e:
            logger.error("Failed to decrypt private key for cert %d: %s", cert_id, e)
            key_obj = None

    cn = cert.common_name or "certificate"
    safe_cn = cn.replace(" ", "_").replace("*", "wildcard")

    if fmt == "pem":
        data = export_pem(cert_obj)
        log_audit("cert", cert_id, "exported", {"format": "pem"})
        return send_file(
            io.BytesIO(data),
            mimetype="application/x-pem-file",
            as_attachment=True,
            download_name=f"{safe_cn}.pem",
        )

    elif fmt == "der":
        data = export_der(cert_obj)
        log_audit("cert", cert_id, "exported", {"format": "der"})
        return send_file(
            io.BytesIO(data),
            mimetype="application/x-x509-ca-cert",
            as_attachment=True,
            download_name=f"{safe_cn}.der",
        )

    elif fmt == "pkcs12":
        try:
            data = export_pkcs12(cert_obj, key_obj, chain_certs or None)
        except Exception as e:
            logger.error("PKCS12 export failed for cert %d: %s", cert_id, e)
            return jsonify({"error": "PKCS12 export failed."}), 500
        log_audit("cert", cert_id, "exported", {"format": "pkcs12"})
        return send_file(
            io.BytesIO(data),
            mimetype="application/x-pkcs12",
            as_attachment=True,
            download_name=f"{safe_cn}.p12",
        )

    elif fmt == "pem_bundle":
        data = export_pem_bundle(cert_obj, chain_certs or None)
        log_audit("cert", cert_id, "exported", {"format": "pem_bundle"})
        return send_file(
            io.BytesIO(data),
            mimetype="application/x-pem-file",
            as_attachment=True,
            download_name=f"{safe_cn}_bundle.pem",
        )

    elif fmt == "private_key":
        if key_obj is None:
            return jsonify({"error": "No private key available for this certificate"}), 404
        data = export_private_key_pem(key_obj)
        log_audit("cert", cert_id, "exported", {"format": "private_key"})
        return send_file(
            io.BytesIO(data),
            mimetype="application/x-pem-file",
            as_attachment=True,
            download_name=f"{safe_cn}_key.pem",
        )

    else:
        return jsonify({"error": "Unsupported format. Use: pem, der, pkcs12, pem_bundle, private_key"}), 400
