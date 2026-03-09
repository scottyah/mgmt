from datetime import datetime, timezone

from app.extensions import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Contact fields
    bfm = db.Column(db.String(200), nullable=True)
    bfm_email = db.Column(db.String(200), nullable=True)
    bfm_phone = db.Column(db.String(50), nullable=True)
    pm = db.Column(db.String(200), nullable=True)
    pm_email = db.Column(db.String(200), nullable=True)
    pm_phone = db.Column(db.String(50), nullable=True)
    admin = db.Column(db.String(200), nullable=True)
    admin_email = db.Column(db.String(200), nullable=True)
    admin_phone = db.Column(db.String(50), nullable=True)

    status = db.Column(db.String(20), nullable=False, default="active")

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    licenses = db.relationship("License", backref="project", lazy="dynamic")
    certs = db.relationship("Cert", backref="project", lazy="dynamic")

    @classmethod
    def for_user(cls, username):
        """Stub for row-level filtering. Returns all projects for now."""
        return cls.query

    def to_dict(self, include_counts=False):
        d = {
            "id": self.id,
            "key": self.key,
            "name": self.name,
            "description": self.description,
            "bfm": self.bfm,
            "bfm_email": self.bfm_email,
            "bfm_phone": self.bfm_phone,
            "pm": self.pm,
            "pm_email": self.pm_email,
            "pm_phone": self.pm_phone,
            "admin": self.admin,
            "admin_email": self.admin_email,
            "admin_phone": self.admin_phone,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_counts:
            d["license_count"] = self.licenses.count()
            d["cert_count"] = self.certs.count()
        return d
