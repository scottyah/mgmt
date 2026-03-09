import json
import logging
from datetime import datetime, timezone

from flask import has_request_context, request, session

from app.extensions import db

logger = logging.getLogger(__name__)


class AuditLog(db.Model):
    __tablename__ = "audit_log"

    id = db.Column(db.Integer, primary_key=True)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(50), nullable=False)
    user = db.Column(db.String(200), nullable=True)
    details = db.Column(db.Text, nullable=True)  # JSON
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def _resolve_entity_name(self):
        """Look up the entity name by type and id. Returns name or fallback."""
        if not self.entity_id:
            return None
        try:
            if self.entity_type == "project":
                from app.projects.models import Project
                entity = db.session.get(Project, self.entity_id)
                return entity.name if entity else f"Deleted (ID: {self.entity_id})"
            elif self.entity_type == "license":
                from app.licenses.models import License
                entity = db.session.get(License, self.entity_id)
                return entity.name if entity else f"Deleted (ID: {self.entity_id})"
            elif self.entity_type == "cert":
                from app.certs.models import Cert
                entity = db.session.get(Cert, self.entity_id)
                return entity.name if entity else f"Deleted (ID: {self.entity_id})"
        except Exception:
            pass
        return f"Deleted (ID: {self.entity_id})"

    def to_dict(self):
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "entity_name": self._resolve_entity_name(),
            "action": self.action,
            "user": self.user,
            "details": json.loads(self.details) if self.details else None,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }


def log_audit(entity_type, entity_id, action, details=None):
    """Write an entry to the audit log table."""
    user = session.get("user", "system")
    details_json = json.dumps(details) if details else None

    ip_address = None
    if has_request_context():
        ip_address = request.remote_addr

    entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user=user,
        details=details_json,
        ip_address=ip_address,
    )
    db.session.add(entry)
    db.session.commit()
