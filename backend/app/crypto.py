from cryptography.fernet import Fernet
from flask import current_app


def _get_fernet() -> Fernet:
    """Return a Fernet instance using the configured key."""
    key = current_app.config.get("FERNET_KEY")
    if not key:
        raise RuntimeError(
            "FERNET_KEY is not configured. Set it in .env or config. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_data(plaintext: bytes) -> bytes:
    """Encrypt plaintext bytes and return ciphertext bytes."""
    f = _get_fernet()
    return f.encrypt(plaintext)


def decrypt_data(ciphertext: bytes) -> bytes:
    """Decrypt ciphertext bytes and return plaintext bytes."""
    f = _get_fernet()
    return f.decrypt(ciphertext)
