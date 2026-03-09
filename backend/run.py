#!/usr/bin/env python3
"""Entry point for the OSA Management Suite backend."""

import os

from app import create_app
from app.extensions import db

app = create_app()

# Create tables on first run
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true", port=5001)
