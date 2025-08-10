#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, or failed pipes

echo "=== Starting Dugong Classification Monolith (Cloud Run) ==="

# Step 1: Ensure uploads dir exists in writable location
UPLOAD_DIR="/tmp/uploads"
echo "Creating uploads directory at ${UPLOAD_DIR}..."
mkdir -p "$UPLOAD_DIR"
chmod 777 "$UPLOAD_DIR"

# Step 2: Render Nginx config from template with dynamic PORT
PORT="${PORT:-8080}"  # Cloud Run sets this automatically
if [ -f /app/nginx.template.conf ]; then
  echo "Rendering Nginx config with PORT=${PORT}..."
  envsubst '\$PORT' < /app/nginx.template.conf > /etc/nginx/conf.d/default.conf
else
  echo "ERROR: Nginx template config not found!"
  exit 1
fi

# Step 3: Run initial user creation script (non-blocking)
echo "Running initial user creation script..."
if ! python3 /app/backend/create_user.py; then
  echo "WARNING: create_user.py failed; continuing startup."
fi

# Step 4: Start FastAPI backend in background
echo "Starting FastAPI backend..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Step 5: Wait for backend to be ready
echo "Waiting for FastAPI backend to be ready..."
RETRIES=30
until nc -z 127.0.0.1 8000; do
    sleep 1
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo "ERROR: Backend did not start in time."
        exit 1
    fi
done
echo "Backend is up!"

# Step 6: Start Nginx in foreground (keeps container alive)
echo "Starting Nginx server on port ${PORT}..."
exec nginx -g "daemon off;"
