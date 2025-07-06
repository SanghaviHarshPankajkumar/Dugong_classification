#!/bin/bash
set -e  # Exit on any error

echo "=== Starting Dugong Classification Monolith ==="

echo "-------IGNORING MONGO----------"

# 3. Prepare uploads dir
echo "Creating uploads directory..."
mkdir -p /app/uploads
echo "Uploads directory created at: $(ls -la /app/uploads)"

# 4. Create initial user
echo "Running initial user creation script..."
python3 /app/backend/create_user.py

# 5. Start FastAPI backend in background
echo "Starting FastAPI backend..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# 6. Start Nginx (serves frontend and proxies to backend)
echo "Starting Nginx server..."
exec nginx -g "daemon off;"
