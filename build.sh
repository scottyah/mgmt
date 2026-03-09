#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Defaults
REGISTRY="${REGISTRY:-}"
TAG="${TAG:-latest}"

if [ -n "$REGISTRY" ]; then
    BACKEND_IMAGE="${REGISTRY}/osa-backend:${TAG}"
    FRONTEND_IMAGE="${REGISTRY}/osa-frontend:${TAG}"
else
    BACKEND_IMAGE="osa-backend:${TAG}"
    FRONTEND_IMAGE="osa-frontend:${TAG}"
fi

echo "Building OSA Management Suite containers..."
echo "  Backend:  ${BACKEND_IMAGE}"
echo "  Frontend: ${FRONTEND_IMAGE}"
echo ""

echo "==> Building backend..."
docker build -t "$BACKEND_IMAGE" "$SCRIPT_DIR/backend"

echo ""
echo "==> Building frontend..."
docker build -t "$FRONTEND_IMAGE" "$SCRIPT_DIR/frontend"

echo ""
echo "Build complete!"
echo "  ${BACKEND_IMAGE}"
echo "  ${FRONTEND_IMAGE}"

if [ -n "$REGISTRY" ]; then
    echo ""
    read -rp "Push to registry? [y/N] " push
    if [[ "$push" =~ ^[Yy]$ ]]; then
        docker push "$BACKEND_IMAGE"
        docker push "$FRONTEND_IMAGE"
        echo "Pushed."
    fi
fi

echo ""
echo "Deploy with Helm:"
echo "  helm install osa ./chart/osa-suite \\"
echo "    --set secrets.fernetKey=\"\$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')\" \\"
echo "    --set secrets.secretKey=\"\$(python3 -c 'import secrets; print(secrets.token_hex(32))')\" \\"
echo "    --set auth.passwordHash=\"\$(python3 -c 'from werkzeug.security import generate_password_hash; print(generate_password_hash(\"yourpassword\"))')\""
