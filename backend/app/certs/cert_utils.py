"""Utilities for parsing, extracting metadata from, and exporting X.509 certificates."""

import json
import re

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import (
    Encoding,
    NoEncryption,
    PrivateFormat,
    pkcs12,
)
from cryptography.x509.oid import NameOID


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_pem(cert_pem, key_pem=None):
    """Parse PEM-encoded certificate and optional private key.

    Returns (x509.Certificate, private_key_or_None, [chain_certs]).
    """
    if isinstance(cert_pem, str):
        cert_pem = cert_pem.encode()
    if isinstance(key_pem, str):
        key_pem = key_pem.encode()

    cert = x509.load_pem_x509_certificate(cert_pem)
    key = None
    if key_pem:
        key = serialization.load_pem_private_key(key_pem, password=None)

    return cert, key, []


def parse_der(data):
    """Parse DER-encoded certificate.

    Returns (x509.Certificate, None, []).
    """
    if isinstance(data, str):
        data = data.encode()
    cert = x509.load_der_x509_certificate(data)
    return cert, None, []


def parse_pkcs12(data, passphrase=None):
    """Parse a PKCS12 bundle.

    Returns (cert, private_key_or_None, [chain_certs]).
    """
    if isinstance(passphrase, str):
        passphrase = passphrase.encode()

    private_key, cert, chain = pkcs12.load_key_and_certificates(data, passphrase)
    chain_list = list(chain) if chain else []
    return cert, private_key, chain_list


def parse_pem_bundle(pem_text):
    """Parse a PEM bundle that may contain cert + key + intermediates.

    Returns (cert, key_or_None, [chain_certs]).
    """
    if isinstance(pem_text, bytes):
        pem_text = pem_text.decode("utf-8", errors="replace")

    # Split on BEGIN markers to get individual PEM blocks
    pem_blocks = re.findall(
        r"(-----BEGIN [A-Z0-9 ]+-----.*?-----END [A-Z0-9 ]+-----)",
        pem_text,
        re.DOTALL,
    )

    certs = []
    key = None

    for block in pem_blocks:
        block_bytes = block.encode()
        if "PRIVATE KEY" in block:
            try:
                key = serialization.load_pem_private_key(block_bytes, password=None)
            except Exception:
                pass
        elif "CERTIFICATE" in block:
            try:
                cert = x509.load_pem_x509_certificate(block_bytes)
                certs.append(cert)
            except Exception:
                pass

    if not certs:
        raise ValueError("No certificates found in PEM bundle")

    main_cert = certs[0]
    chain = certs[1:]

    return main_cert, key, chain


def auto_detect_and_parse(data, passphrase=None):
    """Try to auto-detect format and parse.

    Tries PEM bundle first, then DER, then PKCS12.
    Returns (cert, key_or_None, [chain_certs]).
    """
    # Try PEM first
    try:
        text = data.decode("utf-8", errors="strict") if isinstance(data, bytes) else data
        if "-----BEGIN" in text:
            return parse_pem_bundle(text)
    except (UnicodeDecodeError, ValueError):
        pass

    # Try DER
    try:
        return parse_der(data)
    except Exception:
        pass

    # Try PKCS12
    try:
        return parse_pkcs12(data, passphrase)
    except Exception:
        pass

    raise ValueError("Unable to detect certificate format. Supported: PEM, DER, PKCS12.")


# ---------------------------------------------------------------------------
# Metadata extraction
# ---------------------------------------------------------------------------

def _get_name_attribute(name, oid):
    """Safely get a single attribute from an x509.Name."""
    attrs = name.get_attributes_for_oid(oid)
    return attrs[0].value if attrs else None


def _name_to_string(name):
    """Convert an x509 Name to a human-readable string."""
    parts = []
    for attr in name:
        parts.append(f"{attr.oid._name}={attr.value}")
    return ", ".join(parts)


def extract_metadata(cert):
    """Extract metadata dict from an x509.Certificate.

    Returns dict with: common_name, subject, issuer, serial_number,
    not_valid_before, not_valid_after, san (JSON list), key_algorithm,
    fingerprint_sha256.
    """
    common_name = _get_name_attribute(cert.subject, NameOID.COMMON_NAME)
    subject = _name_to_string(cert.subject)
    issuer = _name_to_string(cert.issuer)
    serial_number = str(cert.serial_number)

    not_valid_before = cert.not_valid_before_utc
    not_valid_after = cert.not_valid_after_utc

    # Extract SANs
    sans = []
    try:
        san_ext = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
        sans.extend(san_ext.value.get_values_for_type(x509.DNSName))
        sans.extend([str(ip) for ip in san_ext.value.get_values_for_type(x509.IPAddress)])
    except x509.ExtensionNotFound:
        pass

    # Key algorithm
    pub_key = cert.public_key()
    key_algorithm = type(pub_key).__name__.replace("_", " ")

    # SHA-256 fingerprint
    fingerprint = cert.fingerprint(hashes.SHA256()).hex(":")

    return {
        "common_name": common_name,
        "subject": subject,
        "issuer": issuer,
        "serial_number": serial_number,
        "not_valid_before": not_valid_before,
        "not_valid_after": not_valid_after,
        "san": json.dumps(sans),
        "key_algorithm": key_algorithm,
        "fingerprint_sha256": fingerprint,
    }


# ---------------------------------------------------------------------------
# Export helpers
# ---------------------------------------------------------------------------

def export_pem(cert):
    """Export certificate as PEM bytes."""
    return cert.public_bytes(Encoding.PEM)


def export_der(cert):
    """Export certificate as DER bytes."""
    return cert.public_bytes(Encoding.DER)


def export_pkcs12(cert, key=None, chain=None, friendly_name=b"certificate"):
    """Export as PKCS12 bundle with no passphrase."""
    return pkcs12.serialize_key_and_certificates(
        friendly_name,
        key,
        cert,
        chain,
        NoEncryption(),
    )


def export_pem_bundle(cert, chain=None):
    """Export cert + chain as a PEM bundle."""
    parts = [cert.public_bytes(Encoding.PEM).decode()]
    if chain:
        for ca_cert in chain:
            parts.append(ca_cert.public_bytes(Encoding.PEM).decode())
    return "".join(parts).encode()


def export_private_key_pem(key):
    """Export private key as PEM bytes (unencrypted)."""
    return key.private_bytes(
        encoding=Encoding.PEM,
        format=PrivateFormat.PKCS8,
        encryption_algorithm=NoEncryption(),
    )
