from datetime import date, datetime, timezone, timedelta

from sqlalchemy.ext.hybrid import hybrid_property

from app.extensions import db


class Cert(db.Model):
    __tablename__ = "certs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Certificate metadata (auto-extracted)
    common_name = db.Column(db.String(255), nullable=True)
    subject = db.Column(db.Text, nullable=True)
    issuer = db.Column(db.Text, nullable=True)
    serial_number = db.Column(db.String(100), nullable=True)
    not_valid_before = db.Column(db.DateTime, nullable=True)
    not_valid_after = db.Column(db.DateTime, nullable=True)
    san = db.Column(db.Text, nullable=True)  # JSON array of SANs

    # Certificate data
    cert_pem = db.Column(db.Text, nullable=True)  # Public cert, stored unencrypted
    private_key_encrypted = db.Column(db.LargeBinary, nullable=True)  # Fernet-encrypted PEM key
    chain_pem = db.Column(db.Text, nullable=True)  # Intermediate CA chain

    cert_type = db.Column(db.String(50), nullable=True)  # server, client, ca, self_signed
    key_algorithm = db.Column(db.String(50), nullable=True)
    fingerprint_sha256 = db.Column(db.String(95), nullable=True)

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True)
    aws_secret_arn = db.Column(db.String(500), nullable=True)  # Stub for future AWS integration

    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @hybrid_property
    def status(self):
        if self.not_valid_after is None:
            return "unknown"
        # Ensure we compare datetime to datetime
        now = datetime.now(timezone.utc)
        expiry = self.not_valid_after
        if expiry.tzinfo is None:
            # Treat naive datetimes as UTC
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < now:
            return "expired"
        if expiry <= now + timedelta(days=30):
            return "expiring_soon"
        return "valid"

    def to_dict(self, include_private_key=False):
        d = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "common_name": self.common_name,
            "subject": self.subject,
            "issuer": self.issuer,
            "serial_number": self.serial_number,
            "not_valid_before": self.not_valid_before.isoformat() if self.not_valid_before else None,
            "not_valid_after": self.not_valid_after.isoformat() if self.not_valid_after else None,
            "san": self.san,
            "cert_type": self.cert_type,
            "key_algorithm": self.key_algorithm,
            "fingerprint_sha256": self.fingerprint_sha256,
            "project_id": self.project_id,
            "aws_secret_arn": self.aws_secret_arn,
            "notes": self.notes,
            "status": self.status,
            "has_private_key": self.private_key_encrypted is not None,
            "has_chain": self.chain_pem is not None and len(self.chain_pem.strip()) > 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_private_key:
            d["cert_pem"] = self.cert_pem
            d["chain_pem"] = self.chain_pem
        return d
