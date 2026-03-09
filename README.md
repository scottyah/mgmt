# OSA Management Suite

Internal tool for managing projects, software licenses, and X.509 certificates.

## Features

- **Projects** — Track projects with key contacts (BFM, PM, Admin), search/sort, per-project detail pages
- **Licenses** — Manage software license files with metadata (vendor, expiration, seat count), upload/download `.lic` files
- **Certificates** — Store certs with encrypted private keys, import/export in PEM, DER, PKCS12, and PEM bundle formats
- **Dashboard** — At-a-glance stats, expiring item alerts, audit activity feed

## Quick Start

```bash
./dev.sh
```

Opens at [http://localhost:5173](http://localhost:5173). Default login: `admin` / `admin`.

Starts both the Flask backend (`:5001`) and Vite dev server (`:5173`). First run installs dependencies automatically.

## Project Structure

```
├── backend/          Flask API (Python)
├── frontend/         React UI (TypeScript)
├── chart/osa-suite/  Helm chart for Kubernetes
├── dev.sh            Local development
└── build.sh          Build containers
```

## Configuration

Copy `.env.example` to `backend/.env` and fill in values:

```bash
cp .env.example backend/.env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Production | Flask session signing key |
| `FERNET_KEY` | Production | Encryption key for cert private keys |
| `AUTH_USERNAME` | No | Login username (default: `admin`) |
| `AUTH_PASSWORD_HASH` | Production | Werkzeug password hash |
| `DATABASE_URL` | No | Database URI (default: `sqlite:///osa.db`) |
| `SESSION_COOKIE_SECURE` | No | Set `true` behind TLS |
| `FLASK_DEBUG` | No | Enable debug mode (default: `false`) |

Generate secrets:

```bash
# Secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Fernet key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Password hash
python3 -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('yourpassword'))"
```

## Building Containers

```bash
./build.sh
```

Push to a registry:

```bash
REGISTRY=registry.example.com/team TAG=v1.0.0 ./build.sh
```

## Kubernetes Deployment

Requires Helm 3.

```bash
helm install osa ./chart/osa-suite \
  --set secrets.fernetKey="<your-fernet-key>" \
  --set secrets.secretKey="<your-secret-key>" \
  --set auth.passwordHash="<your-hash>"
```

The chart creates:
- Backend Deployment + Service (Flask/gunicorn on port 5000)
- Frontend Deployment + Service (nginx on port 80)
- PVC (1Gi, ReadWriteOnce) mounted at `/data` for the SQLite database
- Secret with app credentials and encryption keys
- Optional Ingress (set `ingress.enabled=true`)

### Helm Values

| Value | Default | Description |
|-------|---------|-------------|
| `imageRegistry` | `""` | Container registry prefix |
| `backend.replicas` | `1` | Backend replicas (keep at 1 for SQLite) |
| `frontend.replicas` | `1` | Frontend replicas (scale freely) |
| `persistence.size` | `1Gi` | PVC size |
| `persistence.storageClass` | `""` | Storage class (cluster default) |
| `ingress.enabled` | `false` | Create Ingress resource |
| `ingress.host` | `osa.example.com` | Ingress hostname |
| `ingress.tls` | `false` | Enable TLS |

See `chart/osa-suite/values.yaml` for all options.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, SQLAlchemy, gunicorn |
| Frontend | React, TypeScript, Tailwind CSS, shadcn/ui |
| Database | SQLite (Postgres-ready) |
| Encryption | Fernet (AES-128-CBC + HMAC-SHA256) |
| Containers | Docker, nginx |
| Orchestration | Kubernetes, Helm |

## Roadmap

- [ ] Keycloak SSO integration (OAuth/OIDC)
- [ ] PostgreSQL migration
- [ ] AWS Secrets Manager for private key storage
- [ ] Row-level project access control
- [ ] License expiration email alerts
