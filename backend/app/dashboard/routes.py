from datetime import date, datetime, timedelta, timezone

from flask import jsonify

from app.auth.decorators import login_required
from app.extensions import db
from app.dashboard import dashboard_bp
from app.projects.models import Project
from app.licenses.models import License
from app.certs.models import Cert
from app.audit import AuditLog


@dashboard_bp.route("/stats", methods=["GET"])
@login_required
def stats():
    today = date.today()
    threshold_30d = today + timedelta(days=30)

    projects_count = Project.query.count()
    licenses_count = License.query.count()
    certs_count = Cert.query.count()

    # Expiring licenses (within 30 days)
    expiring_licenses_30d = License.query.filter(
        License.expiration_date.isnot(None),
        License.expiration_date >= today,
        License.expiration_date <= threshold_30d,
    ).count()

    # Expiring certs (within 30 days)
    threshold_dt = datetime.combine(threshold_30d, datetime.min.time()).replace(tzinfo=timezone.utc)
    now_dt = datetime.now(timezone.utc)
    expiring_certs_30d = Cert.query.filter(
        Cert.not_valid_after.isnot(None),
        Cert.not_valid_after >= now_dt,
        Cert.not_valid_after <= threshold_dt,
    ).count()

    # Expired counts
    expired_licenses = License.query.filter(
        License.expiration_date.isnot(None),
        License.expiration_date < today,
    ).count()

    expired_certs = Cert.query.filter(
        Cert.not_valid_after.isnot(None),
        Cert.not_valid_after < now_dt,
    ).count()

    # Keycloak user counts (stubbed — will call Keycloak REST API later)
    total_users = _get_total_users()
    active_users = _get_active_users()

    return jsonify({
        "projects_count": projects_count,
        "total_users": total_users,
        "active_users": active_users,
        "licenses_count": licenses_count,
        "certs_count": certs_count,
        "expiring_licenses_30d": expiring_licenses_30d,
        "expiring_certs_30d": expiring_certs_30d,
        "expired_licenses": expired_licenses,
        "expired_certs": expired_certs,
    }), 200


def _get_total_users():
    """Stub: total users from Keycloak.
    TODO: Replace with GET {keycloak}/admin/realms/{realm}/users/count
    """
    return 142


def _get_active_users():
    """Stub: active users from Keycloak.
    TODO: Replace with Keycloak active sessions count via
    GET {keycloak}/admin/realms/{realm}/client-session-stats
    """
    return 37


@dashboard_bp.route("/expiring", methods=["GET"])
@login_required
def expiring():
    today = date.today()
    threshold_date = today + timedelta(days=90)
    threshold_dt = datetime.combine(threshold_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    now_dt = datetime.now(timezone.utc)

    licenses = License.query.filter(
        License.expiration_date.isnot(None),
        License.expiration_date >= today,
        License.expiration_date <= threshold_date,
    ).order_by(License.expiration_date.asc()).all()

    certs = Cert.query.filter(
        Cert.not_valid_after.isnot(None),
        Cert.not_valid_after >= now_dt,
        Cert.not_valid_after <= threshold_dt,
    ).order_by(Cert.not_valid_after.asc()).all()

    return jsonify({
        "licenses": [l.to_dict() for l in licenses],
        "certs": [c.to_dict() for c in certs],
    }), 200


@dashboard_bp.route("/activity", methods=["GET"])
@login_required
def activity():
    entries = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(20).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200
