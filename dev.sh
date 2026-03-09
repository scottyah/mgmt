#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Done."
}
trap cleanup EXIT INT TERM

# Backend setup
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "Creating backend virtual environment..."
    python3 -m venv "$BACKEND_DIR/.venv"
    echo "Installing backend dependencies..."
    "$BACKEND_DIR/.venv/bin/pip" install -q -r "$BACKEND_DIR/requirements.txt"
fi

# Frontend setup
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
fi

# Start backend
echo "Starting backend on http://localhost:5001..."
(cd "$BACKEND_DIR" && FLASK_DEBUG=true .venv/bin/python run.py) &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on http://localhost:5173..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "OSA Management Suite running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5001"
echo "  Login:    admin / admin"
echo ""
echo "Press Ctrl+C to stop."

wait
