from datetime import date, datetime, timezone, timedelta

from sqlalchemy.ext.hybrid import hybrid_property

from app.extensions import db


class License(db.Model):
    __tablename__ = "licenses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    product = db.Column(db.String(200), nullable=True)
    vendor = db.Column(db.String(200), nullable=True)

    license_type = db.Column(db.String(50), nullable=True)  # perpetual, subscription, trial, enterprise
    seat_count = db.Column(db.Integer, nullable=True)
    expiration_date = db.Column(db.Date, nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    cost = db.Column(db.String(50), nullable=True)
    license_key = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    # File attachment
    file_name = db.Column(db.String(255), nullable=True)
    file_data = db.Column(db.LargeBinary, nullable=True)
    file_mime_type = db.Column(db.String(100), nullable=True)

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @hybrid_property
    def status(self):
        if self.expiration_date is None:
            return "perpetual"
        today = date.today()
        if self.expiration_date < today:
            return "expired"
        if self.expiration_date <= today + timedelta(days=30):
            return "expiring_soon"
        return "active"

    def to_dict(self, include_file_info=True):
        d = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "product": self.product,
            "vendor": self.vendor,
            "license_type": self.license_type,
            "seat_count": self.seat_count,
            "expiration_date": self.expiration_date.isoformat() if self.expiration_date else None,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "cost": self.cost,
            "license_key": self.license_key,
            "notes": self.notes,
            "project_id": self.project_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_file_info:
            d["file_name"] = self.file_name
            d["file_mime_type"] = self.file_mime_type
            d["has_file"] = self.file_data is not None
        return d
